"""Two-step restroom matching for /restroom/match (task C-8), one query at a time.

A port of ml/restroom/classic.py and the per-query variant of ml/restroom/pipeline.py
(`sift_combo_per_query` in ml/restroom/pipeline_per_query.py: 0.929 +/- 0.040 on 200 training
episodes, 10/10 on validation). The API cannot import ml/restroom/ (the Docker image is built from
api/ only), so the few functions it needs are copied here and take images instead of file paths.
Keep the constants in sync with ml/restroom/classic.py.

    step 1  Is the query a crop of one gallery image? SIFT keypoints, an affine RANSAC fit and a pixel
            correlation after alignment (aligned NCC), plus 0.001 x the CLIP cosine as a tie-break.
            The best gallery image is the query's own original if its correlation is at least OWN_T.
    step 2  The partner: among the gallery (or the query plus the gallery when there is no own
            original), the image most like the own original (or the query) by
            W_HIST x z(colour-histogram intersection) + (1 - W_HIST) x z(CLIP cosine),
            other than itself and the own original.

No gender classifier is involved: the partner of a men's door is the women's door of the same
restroom by construction. In the web app the query is usually a whole door sign that is not in the
gallery, so step 1 usually finds no own original and step 2 compares the query itself.
"""

from __future__ import annotations

from dataclasses import dataclass

import cv2
import numpy as np
from PIL import Image

LONG_SIDE = 512         # ml/restroom/classic.py: icons are small, SIFT needs them larger
RATIO = 0.75            # Lowe's ratio test
RANSAC_PX = 5.0         # affine RANSAC reprojection threshold at LONG_SIDE
HIST_BINS = (16, 8, 8)  # HSV
W_HIST = 0.3            # histogram_weight in ml/results/restroom/pipeline.json, chosen on training episodes
# Own-original threshold on the aligned correlation, chosen on the 164 training crops only: the 99th
# percentile of the best wrong original is 0.945 and the 5th percentile of the own original is 0.957
# (ml/restroom/pipeline.py train_pool, 11 November 2026).
OWN_T = 0.95

_SIFT = None
_MATCHER = None


def _sift():
    global _SIFT, _MATCHER
    if _SIFT is None:
        _SIFT = cv2.SIFT_create(nfeatures=1500)
        _MATCHER = cv2.BFMatcher(cv2.NORM_L2)
    return _SIFT, _MATCHER


@dataclass
class Prepared:
    bgr: np.ndarray
    gray: np.ndarray        # float32
    pts: np.ndarray         # (n, 2) keypoint coordinates
    desc: np.ndarray | None
    hist: np.ndarray        # L1-normalised HSV histogram


def prepare(img: Image.Image) -> Prepared:
    """Resize to LONG_SIDE (as classic._read) and compute everything both steps need, once."""
    bgr = np.ascontiguousarray(np.asarray(img.convert("RGB"))[:, :, ::-1])
    h, w = bgr.shape[:2]
    s = LONG_SIDE / max(h, w)
    if s != 1:
        bgr = cv2.resize(bgr, (max(1, round(w * s)), max(1, round(h * s))),
                         interpolation=cv2.INTER_AREA if s < 1 else cv2.INTER_CUBIC)
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    sift, _ = _sift()
    kps, desc = sift.detectAndCompute(gray, None)
    pts = np.array([k.pt for k in kps], dtype=np.float32).reshape(-1, 2)
    hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
    hist = cv2.calcHist([hsv], [0, 1, 2], None, list(HIST_BINS), [0, 180, 0, 256, 0, 256]).ravel()
    return Prepared(bgr, gray.astype(np.float32), pts, desc, (hist / max(hist.sum(), 1e-12)).astype(np.float64))


def _transform(crop: Prepared, orig: Prepared) -> np.ndarray | None:
    """Affine transform from crop pixels to original pixels that most SIFT matches agree on."""
    if crop.desc is None or orig.desc is None or len(crop.desc) < 2 or len(orig.desc) < 2:
        return None
    _, matcher = _sift()
    good = [m for m, n in (p for p in matcher.knnMatch(crop.desc, orig.desc, k=2) if len(p) == 2)
            if m.distance < RATIO * n.distance]
    if len(good) < 3:
        return None
    src = crop.pts[[m.queryIdx for m in good]]
    dst = orig.pts[[m.trainIdx for m in good]]
    M, mask = cv2.estimateAffine2D(src, dst, method=cv2.RANSAC, ransacReprojThreshold=RANSAC_PX,
                                   maxIters=2000, confidence=0.995)
    return None if M is None or mask is None else M


def aligned_ncc(crop: Prepared, orig: Prepared, min_overlap: float = 0.8) -> float:
    """Pixel correlation of the crop with the original mapped into the crop's frame; -1 if no fit."""
    M = _transform(crop, orig)
    if M is None:
        return -1.0
    c, o = crop.gray, orig.gray
    h, w = c.shape
    flags = cv2.INTER_LINEAR | cv2.WARP_INVERSE_MAP
    warped = cv2.warpAffine(o, M, (w, h), flags=flags, borderMode=cv2.BORDER_CONSTANT, borderValue=0)
    valid = cv2.warpAffine(np.ones_like(o), M, (w, h), flags=flags, borderMode=cv2.BORDER_CONSTANT, borderValue=0) > 0.5
    if valid.mean() < min_overlap:
        return -1.0
    a, b = c[valid], warped[valid]
    a, b = a - a.mean(), b - b.mean()
    denom = float(np.sqrt((a * a).sum() * (b * b).sum()))
    return float((a * b).sum() / denom) if denom > 0 else -1.0


def zscore(m: np.ndarray) -> np.ndarray:
    return (m - m.mean()) / (m.std() + 1e-12)


@dataclass
class PairResult:
    own: int | None         # gallery index of the query's own original, if the query is a crop of it
    own_score: float        # its aligned correlation (-1 when nothing aligned)
    best: int | None        # gallery index of the partner, None when no candidate is left


def find_pair(query: Image.Image, gallery: list[Image.Image], emb: np.ndarray) -> PairResult:
    """emb: L2-normalised CLIP embeddings, row 0 the query, then the gallery in order."""
    q = prepare(query)
    g = [prepare(im) for im in gallery]
    clip = emb @ emb.T                      # cosine similarity, query first

    # Step 1: own original, or none.
    ncc = np.array([aligned_ncc(q, gi) for gi in g])
    step1 = ncc + 1e-3 * clip[0, 1:]
    j = int(step1.argmax())
    own = j if ncc[j] >= OWN_T else None

    # Step 2: the partner of the own original, or of the query itself.
    if own is not None:
        items, ref, offset = g, own, 0
        sim_clip = clip[1:, 1:]
    else:
        items, ref, offset = [q, *g], 0, 1
        sim_clip = clip
    hists = np.stack([it.hist for it in items])
    sim_hist = np.minimum(hists[:, None, :], hists[None, :, :]).sum(-1)
    score = W_HIST * zscore(sim_hist) + (1 - W_HIST) * zscore(sim_clip)
    order = [int(k) for k in np.argsort(-score[ref], kind="stable") if k != ref]
    best = (order[0] - offset) if order else None
    return PairResult(own=own, own_score=round(float(ncc[j]), 4), best=best)
