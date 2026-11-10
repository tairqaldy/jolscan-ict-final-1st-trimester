"""The two-step matching pipeline, with every approach scored on the same harness.

Task (IOAI 2025 "Restroom Icon Matching"): a query is a cropped icon; the gallery holds two
originals per query restroom, the male and the female one. The answer is the original of the
OPPOSITE gender from the SAME restroom. The task statement guarantees that every query comes from a
different restroom and that the gallery is exactly those restrooms' pairs.

That splits the task into two steps:

  step 1  find the query's own original (the image the crop was cut from)
  step 2  find that original's partner (the other door of the same restroom)

The answer is the partner, so no gender classifier is needed: the partner of a male original is
female by construction.

For each step there are several scorers and two ways to turn scores into answers:
  greedy     every query takes its best candidate on its own (step 2 skips partners already given
             out, in query order, as in the IOAI reference solution)
  hungarian  one global assignment (scipy linear_sum_assignment). Step 1: every query gets a
             different own original. Step 2: every own original gets a different partner from the
             gallery images that are nobody's own original. This uses the guarantee above.

Evaluation
  train episodes  IOAI-style episodes drawn from the 82 training restrooms: 30 restrooms, a random
                  query gender per restroom, the 60 originals as gallery (the size of the test set).
                  Nothing in this file is trained, so all 82 restrooms can be used, and 200 episodes
                  give a stable mean and spread. Step 1 and step 2 are also scored separately here,
                  because the training labels say which original a crop came from.
  val, test       the IOAI splits (10 and 30 queries). Test is read once, after the choice.

Usage, from the repository root:
    python ml/restroom/pipeline.py              # writes ml/results/restroom/pipeline.json
"""

from __future__ import annotations

import json
import sys
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
from scipy.optimize import linear_sum_assignment

sys.path.insert(0, str(Path(__file__).resolve().parent))
import classic as K  # noqa: E402
import common as C  # noqa: E402

OUT = C.RESULTS / "pipeline.json"
EPISODES, EPISODE_SIZE = 200, 30
WEIGHTS = [round(w, 2) for w in np.linspace(0, 1, 11)]   # share of the colour histogram in step 2


# --------------------------------------------------------------------------------------------
# Assignment
# --------------------------------------------------------------------------------------------

def best_per_row(score: np.ndarray, hungarian: bool) -> np.ndarray:
    """Column index per row, maximising score. Hungarian: all rows get different columns."""
    if not hungarian:
        return score.argmax(1)
    rows, cols = linear_sum_assignment(-score)
    out = np.empty(len(score), dtype=np.int64)
    out[rows] = cols
    return out


def partners(own: np.ndarray, pair: np.ndarray, hungarian: bool) -> np.ndarray:
    """Step 2: a partner for every query's own original. pair is the gallery x gallery similarity."""
    n_gal = len(pair)
    if hungarian:
        rest = np.array([g for g in range(n_gal) if g not in set(own.tolist())])
        cols = best_per_row(pair[np.ix_(own, rest)], hungarian=True)
        return rest[cols]
    used: set[int] = set()
    out = np.empty(len(own), dtype=np.int64)
    for qi, oi in enumerate(own):   # IOAI reference: query order, no partner given out twice
        order = np.argsort(-pair[oi])
        out[qi] = next(g for g in order if g != oi and g not in used)
        used.add(int(out[qi]))
    return out


def zscore(m: np.ndarray) -> np.ndarray:
    return (m - m.mean()) / (m.std() + 1e-12)


# --------------------------------------------------------------------------------------------
# Scores for one set of queries and gallery
# --------------------------------------------------------------------------------------------

@dataclass
class Scores:
    inliers: np.ndarray     # query x gallery, SIFT inliers
    ncc: np.ndarray         # query x gallery, SIFT-aligned pixel correlation, -1..1
    clip_qg: np.ndarray     # query x gallery, CLIP cosine
    hist_qg: np.ndarray     # query x gallery, colour histogram intersection
    clip_gg: np.ndarray     # gallery x gallery, CLIP cosine
    hist_gg: np.ndarray     # gallery x gallery, colour histogram intersection

    def sub(self, q: np.ndarray, g: np.ndarray) -> "Scores":
        return Scores(self.inliers[np.ix_(q, g)], self.ncc[np.ix_(q, g)], self.clip_qg[np.ix_(q, g)],
                      self.hist_qg[np.ix_(q, g)], self.clip_gg[np.ix_(g, g)], self.hist_gg[np.ix_(g, g)])


def compute_scores(queries: list[Path], gallery: list[Path], clip) -> Scores:
    model, preprocess = clip
    eq = C.embed_paths_cached(model, preprocess, queries, "ViT-B-32-openai")
    eg = C.embed_paths_cached(model, preprocess, gallery, "ViT-B-32-openai")
    inliers, ncc = K.sift_matrix(queries, gallery)
    return Scores(inliers=inliers, ncc=ncc, clip_qg=eq @ eg.T, hist_qg=K.hist_matrix(queries, gallery),
                  clip_gg=eg @ eg.T, hist_gg=K.hist_matrix(gallery, gallery))


STEP1 = {
    "sift_inliers": lambda s: s.inliers + s.clip_qg,   # CLIP (below 1) only breaks ties
    # aligned correlation decides; a thousandth of the CLIP similarity breaks ties, e.g. between
    # originals where SIFT found no transform at all (-1)
    "sift_ncc": lambda s: s.ncc + 1e-3 * s.clip_qg,
    "clip": lambda s: s.clip_qg,
    "hist": lambda s: s.hist_qg,
}


def step2_score(s: Scores, w_hist: float) -> np.ndarray:
    return w_hist * zscore(s.hist_gg) + (1 - w_hist) * zscore(s.clip_gg)


def run_approach(s: Scores, step1: str, w_hist: float, hungarian: bool) -> tuple[np.ndarray, np.ndarray]:
    own = best_per_row(STEP1[step1](s), hungarian)
    return own, partners(own, step2_score(s, w_hist), hungarian)


def ioai_baseline(s: Scores) -> np.ndarray:
    """IOAI baseline notebook: the second most similar original by CLIP (zero-shot ViT-B/16 there,
    ViT-B/32 here so that every approach in this file shares one model)."""
    return np.argsort(-s.clip_qg, axis=1)[:, 1]


def singapore(s: Scores) -> np.ndarray:
    """Full-score IOAI writeup (Singapore), with SIFT in place of their gender classifier: the two
    originals closest in colour are taken as the query's restroom, and of those two the one the crop
    was NOT cut from (fewer SIFT inliers) is the answer."""
    top2 = np.argsort(-s.hist_qg, axis=1)[:, :2]
    own = STEP1["sift_ncc"](s)
    out = np.empty(len(top2), dtype=np.int64)
    for qi, (a, b) in enumerate(top2):
        out[qi] = b if own[qi, a] >= own[qi, b] else a
    return out


# --------------------------------------------------------------------------------------------
# Approaches in the results table. Each name is one row.
# --------------------------------------------------------------------------------------------

def approaches(w_best: float) -> dict[str, dict]:
    return {
        "ioai_baseline_clip": dict(kind="baseline", note="IOAI baseline: second most similar original, CLIP ViT-B/32 zero-shot"),
        "singapore_hist_top2_sift": dict(kind="singapore", note="colour histogram picks the restroom (top 2), SIFT rejects the own original"),
        "clip_clip_greedy": dict(step1="clip", w=0.0, hungarian=False, note="two-step, CLIP for both steps, greedy (IOAI reference matching, zero-shot)"),
        "siftinl_clip_greedy": dict(step1="sift_inliers", w=0.0, hungarian=False, note="step 1 SIFT inlier count, step 2 CLIP, greedy"),
        "sift_clip_greedy": dict(step1="sift_ncc", w=0.0, hungarian=False, note="step 1 SIFT + pixel check, step 2 CLIP, greedy"),
        "sift_hist_greedy": dict(step1="sift_ncc", w=1.0, hungarian=False, note="step 1 SIFT + pixel check, step 2 colour histogram, greedy"),
        "sift_combo_greedy": dict(step1="sift_ncc", w=w_best, hungarian=False, note=f"step 1 SIFT + pixel check, step 2 {w_best:.0%} histogram + CLIP, greedy"),
        "sift_clip_hungarian": dict(step1="sift_ncc", w=0.0, hungarian=True, note="step 1 SIFT + pixel check, step 2 CLIP, global assignment"),
        "sift_hist_hungarian": dict(step1="sift_ncc", w=1.0, hungarian=True, note="step 1 SIFT + pixel check, step 2 colour histogram, global assignment"),
        "sift_combo_hungarian": dict(step1="sift_ncc", w=w_best, hungarian=True, note=f"step 1 SIFT + pixel check, step 2 {w_best:.0%} histogram + CLIP, global assignment"),
    }


def predict(s: Scores, spec: dict) -> tuple[np.ndarray | None, np.ndarray]:
    if spec.get("kind") == "baseline":
        return None, ioai_baseline(s)
    if spec.get("kind") == "singapore":
        return None, singapore(s)
    return run_approach(s, spec["step1"], spec["w"], spec["hungarian"])


# --------------------------------------------------------------------------------------------
# Training-set episodes
# --------------------------------------------------------------------------------------------

@dataclass
class TrainPool:
    """All 164 crops and 164 originals of the training set, scored once."""
    scores: Scores
    crop_room: np.ndarray     # restroom id per crop
    crop_gender: np.ndarray
    orig_index: dict          # (restroom, gender) -> index in the originals


def train_pool(clip) -> TrainPool:
    train = C.load_train()
    crops = [t for t in train if t.kind == "crop"]
    origs = [t for t in train if t.kind == "orig"]
    # cache key: the SIFT and pixel-check settings, so a change never reuses stale scores
    cache = C.CACHE / f"sift_train_affine_ls{K.LONG_SIDE}_r{K.RATIO}_px{K.RANSAC_PX}.npz"
    log(f"scoring the training set: {len(crops)} crops x {len(origs)} originals")
    if cache.exists():
        z = np.load(cache)
        inliers, ncc = z["inliers"], z["ncc"]
    else:
        t0 = time.perf_counter()
        inliers, ncc = K.sift_matrix([t.path for t in crops], [t.path for t in origs])
        cache.parent.mkdir(parents=True, exist_ok=True)
        np.savez(cache, inliers=inliers, ncc=ncc)
        log(f"  SIFT matrix in {time.perf_counter() - t0:.0f} s")
    model, preprocess = clip
    ec = C.embed_paths_cached(model, preprocess, [t.path for t in crops], "ViT-B-32-openai")
    eo = C.embed_paths_cached(model, preprocess, [t.path for t in origs], "ViT-B-32-openai")
    po = [t.path for t in origs]
    s = Scores(inliers=inliers, ncc=ncc, clip_qg=ec @ eo.T, hist_qg=K.hist_matrix([t.path for t in crops], po),
               clip_gg=eo @ eo.T, hist_gg=K.hist_matrix(po, po))
    return TrainPool(s, np.array([t.restroom for t in crops]), np.array([t.gender for t in crops]),
                     {(t.restroom, t.gender): i for i, t in enumerate(origs)})


def episodes(pool: TrainPool, n: int, size: int, seed: int = C.SEED):
    """Yield (query crop indices, gallery original indices, own index, partner index) per episode,
    indices into the gallery list of that episode. The gallery is shuffled."""
    rng = np.random.default_rng(seed)
    crop_index = {(r, g): i for i, (r, g) in enumerate(zip(pool.crop_room, pool.crop_gender))}
    rooms = np.unique(pool.crop_room)
    for _ in range(n):
        chosen = rng.choice(rooms, size=size, replace=False)
        genders = rng.integers(0, 2, size=size)
        q = np.array([crop_index[(r, g)] for r, g in zip(chosen, genders)])
        gal = rng.permutation([pool.orig_index[(r, g)] for r in chosen for g in (0, 1)])
        pos = {o: i for i, o in enumerate(gal)}
        own = np.array([pos[pool.orig_index[(r, g)]] for r, g in zip(chosen, genders)])
        partner = np.array([pos[pool.orig_index[(r, 1 - g)]] for r, g in zip(chosen, genders)])
        yield q, gal, own, partner


def eval_episodes(pool: TrainPool, specs: dict[str, dict], n: int = EPISODES, size: int = EPISODE_SIZE) -> dict:
    res = {k: {"top1": [], "step1": [], "step2_oracle": []} for k in specs}
    for q, gal, own_true, partner_true in episodes(pool, n, size):
        s = pool.scores.sub(q, gal)
        for name, spec in specs.items():
            own, pred = predict(s, spec)
            res[name]["top1"].append(float(np.mean(pred == partner_true)))
            if own is not None:
                res[name]["step1"].append(float(np.mean(own == own_true)))
                # step 2 alone: give it the true own originals
                p2 = partners(own_true, step2_score(s, spec["w"]), spec["hungarian"])
                res[name]["step2_oracle"].append(float(np.mean(p2 == partner_true)))
    out = {}
    for name, r in res.items():
        out[name] = {k: {"mean": round(float(np.mean(v)), 4), "std": round(float(np.std(v)), 4)} if v else None
                     for k, v in r.items()}
    return out


# --------------------------------------------------------------------------------------------

def log(msg: str) -> None:
    print(msg, flush=True)


def main() -> None:
    t_start = time.perf_counter()
    C.seed_everything()
    model, preprocess, _ = C.load_clip("ViT-B-32")
    clip = (model, preprocess)
    pool = train_pool(clip)

    # Step 1 on its own, on the whole training set: 164 crops against all 164 originals.
    own_room = {i: r for (r, g), i in pool.orig_index.items()}
    own_gender = {i: g for (r, g), i in pool.orig_index.items()}
    step1_full = {}
    for name, fn in STEP1.items():
        pick = fn(pool.scores).argmax(1)
        ok = [(own_room[int(p)], own_gender[int(p)]) == (r, g) for p, r, g in zip(pick, pool.crop_room, pool.crop_gender)]
        step1_full[name] = round(float(np.mean(ok)), 4)
    log(f"step 1 alone, 164 crops vs 164 originals: {step1_full}")

    # Weight of the colour histogram in step 2, chosen on training episodes only.
    w_scan = {}
    for w in WEIGHTS:
        r = eval_episodes(pool, {"x": dict(step1="sift_ncc", w=w, hungarian=True)}, n=100)
        w_scan[w] = r["x"]["top1"]["mean"]
    w_best = max(WEIGHTS, key=lambda w: (w_scan[w], -abs(w - 0.5)))
    log(f"step 2 histogram weight scan (train episodes, top-1): {w_scan} -> {w_best}")

    specs = approaches(w_best)
    train_res = eval_episodes(pool, specs)
    for name, r in train_res.items():
        log(f"  train {name:28s} top-1 {r['top1']['mean']:.3f} ± {r['top1']['std']:.3f}")

    # Choice: highest mean top-1 on training episodes, then validation, then the simpler (earlier) row.
    split_scores = {}
    split_preds = {}
    for split in ("val", "test"):
        query, gallery = C.load_split(split)
        s = compute_scores(query, gallery, clip)
        answers = C.load_answers(split)
        split_scores[split], split_preds[split] = {}, {}
        for name, spec in specs.items():
            _, pred = predict(s, spec)
            split_preds[split][name] = (pred + 1).tolist()
            split_scores[split][name] = round(C.precision_at_1(pred + 1, answers), 4)
        if split == "val":
            names = list(specs)
            champion = max(names, key=lambda k: (train_res[k]["top1"]["mean"], split_scores["val"][k], -names.index(k)))
            log(f"champion (train episodes, then val): {champion}")
        log(f"  {split}: {split_scores[split]}")

    result = {
        "experiment": "two-step matching pipeline: classical CV (SIFT, colour histograms) and zero-shot CLIP ViT-B/32",
        "protocol": {
            "train_episodes": f"{EPISODES} episodes of {EPISODE_SIZE} training restrooms, random query gender, gallery = their 60 originals",
            "selection": "highest mean train-episode top-1, then validation top-1, then the simpler row; test read once",
            "histogram_weight_scan": "step 2 = w * z(histogram) + (1 - w) * z(CLIP), w chosen on 100 train episodes",
        },
        "step1_full_train": step1_full,
        "histogram_weight_scan": {str(k): v for k, v in w_scan.items()},
        "histogram_weight": w_best,
        "approaches": {k: v["note"] for k, v in specs.items()},
        "train_episodes": train_res,
        "val": split_scores["val"],
        "test": split_scores["test"],
        "champion": champion,
        "predictions": split_preds,
        "params": {"sift_nfeatures": 1500, "ratio": K.RATIO, "ransac_px": K.RANSAC_PX, "long_side": K.LONG_SIDE,
                   "hist_bins_hsv": list(K.HIST_BINS), "clip": "ViT-B-32 openai"},
        "versions": {**C.versions(), "opencv": K.cv2.__version__},
        "device": C.device_name(),
        "seconds": round(time.perf_counter() - t_start, 1),
        "timestamp": datetime.now(timezone.utc).isoformat(timespec="seconds"),
    }
    OUT.write_text(json.dumps(result, indent=2) + "\n")
    log(f"Wrote {OUT} in {result['seconds']} s")


if __name__ == "__main__":
    main()
