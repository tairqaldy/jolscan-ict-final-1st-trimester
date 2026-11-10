"""Classical computer vision for the restroom task: no learning, no GPU.

Two tools, one for each half of the task:

- Step 1, find the query's own original. A query is a cropped icon cut out of one of the gallery
  originals. SIFT keypoints (scale-invariant local features) are matched between the crop and every
  original, and RANSAC keeps only the matches that agree on one affine transform. The original is
  then mapped into the crop's frame with that transform and the two are correlated pixel by pixel
  (aligned NCC). The original with the highest correlation is the one the crop came from. Counting
  inliers alone is not enough: unrelated stock icons share watermarks and simple shapes.
- Step 2, find that original's partner. The two door photos of one restroom were taken in the same
  place, so their colours are alike. An HSV colour histogram per image, compared with histogram
  intersection, measures that. (Idea from the full-score IOAI 2025 writeup credited to Singapore:
  https://ioai-writeup.github.io/posts/d2p1-restroom/)

Paths are relative to the repository root. Run every script from there.
"""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path

import cv2
import numpy as np

LONG_SIDE = 512         # every image is resized to this longer side: the icons are small (median crop
                        # 163x273 px) and flat, and SIFT finds too few keypoints on tiny images
RATIO = 0.75            # Lowe's ratio test for SIFT matches
RANSAC_PX = 5.0         # reprojection threshold, pixels at LONG_SIDE scale
HIST_BINS = (16, 8, 8)  # H, S, V


def _read(path: Path) -> np.ndarray:
    img = cv2.imread(str(path), cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError(f"cannot read {path}")
    h, w = img.shape[:2]
    s = LONG_SIDE / max(h, w)
    if s != 1:
        img = cv2.resize(img, (max(1, round(w * s)), max(1, round(h * s))),
                         interpolation=cv2.INTER_AREA if s < 1 else cv2.INTER_CUBIC)
    return img


# --------------------------------------------------------------------------------------------
# Step 1: SIFT + RANSAC
# --------------------------------------------------------------------------------------------

_SIFT = None


def _sift():
    global _SIFT
    if _SIFT is None:
        _SIFT = cv2.SIFT_create(nfeatures=1500)
    return _SIFT


@lru_cache(maxsize=None)
def sift_features(path: Path) -> tuple[np.ndarray, np.ndarray | None]:
    """Keypoint coordinates (n, 2) and descriptors (n, 128) of one image, cached per path."""
    gray = cv2.cvtColor(_read(path), cv2.COLOR_BGR2GRAY)
    kps, desc = _sift().detectAndCompute(gray, None)
    pts = np.array([k.pt for k in kps], dtype=np.float32).reshape(-1, 2)
    return pts, desc


_MATCHER = cv2.BFMatcher(cv2.NORM_L2)


def sift_transform(crop: Path, orig: Path) -> tuple[int, np.ndarray | None]:
    """SIFT matches between a crop and an original that fit one affine transform: the inlier count
    and the 2x3 transform from crop pixels to original pixels.

    A full affine transform (6 degrees of freedom), not a similarity (4): some crops in the IOAI data
    were resized with a different factor along x and y, and a similarity cannot align them. On the
    training set this raises step-1 accuracy from 0.945 to 0.976."""
    pc, dc = sift_features(crop)
    po, do = sift_features(orig)
    if dc is None or do is None or len(dc) < 2 or len(do) < 2:
        return 0, None
    good = [m for m, n in (p for p in _MATCHER.knnMatch(dc, do, k=2) if len(p) == 2) if m.distance < RATIO * n.distance]
    if len(good) < 3:
        return 0, None   # not enough matches to estimate a transform
    src = pc[[m.queryIdx for m in good]]
    dst = po[[m.trainIdx for m in good]]
    M, mask = cv2.estimateAffine2D(src, dst, method=cv2.RANSAC, ransacReprojThreshold=RANSAC_PX,
                                   maxIters=2000, confidence=0.995)
    if M is None or mask is None:
        return 0, None
    return int(mask.sum()), M


@lru_cache(maxsize=None)
def _gray(path: Path) -> np.ndarray:
    return cv2.cvtColor(_read(path), cv2.COLOR_BGR2GRAY).astype(np.float32)


def aligned_ncc(crop: Path, orig: Path, M: np.ndarray, min_overlap: float = 0.8) -> float:
    """Pixel check of a SIFT transform: map the original into the crop's frame and correlate.

    If the crop was really cut from this original, the two agree pixel by pixel (correlation near 1).
    Keypoints shared by unrelated images (a stock-photo watermark, a round head) can give many SIFT
    inliers, but they cover a small part of the crop, so the correlation stays low. Returns -1 when
    less than min_overlap of the crop lands inside the original.
    """
    c, o = _gray(crop), _gray(orig)
    h, w = c.shape
    flags = cv2.INTER_LINEAR | cv2.WARP_INVERSE_MAP   # M maps crop -> original, as WARP_INVERSE_MAP expects
    warped = cv2.warpAffine(o, M, (w, h), flags=flags, borderMode=cv2.BORDER_CONSTANT, borderValue=0)
    valid = cv2.warpAffine(np.ones_like(o), M, (w, h), flags=flags, borderMode=cv2.BORDER_CONSTANT, borderValue=0) > 0.5
    if valid.mean() < min_overlap:
        return -1.0
    a, b = c[valid], warped[valid]
    a, b = a - a.mean(), b - b.mean()
    denom = float(np.sqrt((a * a).sum() * (b * b).sum()))
    return float((a * b).sum() / denom) if denom > 0 else -1.0


def sift_scores(crop: Path, orig: Path) -> tuple[int, float]:
    """(inliers, aligned correlation) for one crop and one original."""
    inl, M = sift_transform(crop, orig)
    return inl, (aligned_ncc(crop, orig, M) if M is not None else -1.0)


def sift_matrix(queries: list[Path], gallery: list[Path]) -> tuple[np.ndarray, np.ndarray]:
    """Two (len(queries), len(gallery)) matrices: SIFT inliers and aligned correlation (-1..1).
    Both are higher when the crop was cut from that original."""
    pairs = [[sift_scores(q, g) for g in gallery] for q in queries]
    return (np.array([[p[0] for p in row] for row in pairs], dtype=np.float64),
            np.array([[p[1] for p in row] for row in pairs], dtype=np.float64))


# --------------------------------------------------------------------------------------------
# Step 2: colour histograms
# --------------------------------------------------------------------------------------------

@lru_cache(maxsize=None)
def colour_hist(path: Path) -> np.ndarray:
    """L1-normalised HSV histogram, flattened. Hue has more bins than saturation and value because
    the colour of walls and doors is mostly in the hue."""
    hsv = cv2.cvtColor(_read(path), cv2.COLOR_BGR2HSV)
    h = cv2.calcHist([hsv], [0, 1, 2], None, list(HIST_BINS), [0, 180, 0, 256, 0, 256]).ravel()
    return (h / max(h.sum(), 1e-12)).astype(np.float64)


def hist_matrix(a: list[Path], b: list[Path]) -> np.ndarray:
    """Histogram intersection, 0..1: the share of colour mass two images have in common."""
    ha = np.stack([colour_hist(p) for p in a])
    hb = np.stack([colour_hist(p) for p in b])
    return np.minimum(ha[:, None, :], hb[None, :, :]).sum(-1)
