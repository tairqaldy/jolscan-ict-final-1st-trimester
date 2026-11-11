"""The two-step pipeline one query at a time, without any assignment across queries (task C-21).

pipeline.py's champion uses a global (Hungarian) assignment: every query gets a different own
original and every own original a different partner. That uses a fact of the IOAI benchmark: the
queries come from different restrooms and the gallery holds exactly their pairs. Each answer then
depends on the other queries (it is transductive). The greedy row also uses other queries: step 2
skips partners already given out, in query order. A real door sign comes alone, and the API answers
one query at a time, so this script scores the truly per-query variant:

    step 1  the gallery image with the highest aligned pixel correlation (argmax, no assignment)
    step 2  the gallery image with the highest step-2 score to it, other than itself (argmax)

on the same 200 training episodes as pipeline.py, then on validation. Only after both are written
is the test score read, once, for the served variant `sift_combo_per_query`.

Writes  ml/results/restroom/pipeline_per_query.json

Usage, from the repository root:
    python ml/restroom/pipeline_per_query.py
"""

from __future__ import annotations

import json
import platform
import sys
import time
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
import classic as K  # noqa: E402,F401  (pipeline imports it too; kept for the issue's recipe)
import common as C  # noqa: E402
import pipeline as P  # noqa: E402

OUT = C.RESULTS / "pipeline_per_query.json"
SERVED = "sift_combo_per_query"


def partners_per_query(own: np.ndarray, pair: np.ndarray) -> np.ndarray:
    """Step 2 for each query on its own: the best other gallery image for its own original."""
    out = np.empty(len(own), dtype=np.int64)
    for qi, oi in enumerate(own):
        order = np.argsort(-pair[oi])
        out[qi] = next(g for g in order if g != oi)
    return out


def per_query(s: P.Scores, step1: str, w_hist: float) -> tuple[np.ndarray, np.ndarray]:
    own = P.STEP1[step1](s).argmax(1)
    return own, partners_per_query(own, P.step2_score(s, w_hist))


def main() -> None:
    t0 = time.perf_counter()
    stored = json.loads(P.OUT.read_text())
    w = stored["histogram_weight"]
    C.seed_everything()
    model, preprocess, _ = C.load_clip("ViT-B-32")
    clip = (model, preprocess)
    pool = P.train_pool(clip)

    specs = P.approaches(w)
    rows = {
        "sift_combo_hungarian": lambda s: P.predict(s, specs["sift_combo_hungarian"]),
        "sift_combo_greedy": lambda s: P.predict(s, specs["sift_combo_greedy"]),
        SERVED: lambda s: per_query(s, "sift_ncc", w),
        "clip_clip_per_query": lambda s: per_query(s, "clip", 0.0),
    }
    notes = {
        "sift_combo_hungarian": "pipeline.py champion: global assignment over all queries (transductive)",
        "sift_combo_greedy": "greedy: query order, no partner given out twice (still uses other queries)",
        SERVED: f"per query: step 1 argmax SIFT + pixel check, step 2 argmax {w:.0%} histogram + CLIP (served by the API)",
        "clip_clip_per_query": "per query, CLIP for both steps (zero-shot, no SIFT, no colour)",
    }

    train = {k: [] for k in rows}
    for q, gal, _own_true, partner_true in P.episodes(pool, P.EPISODES, P.EPISODE_SIZE):
        s = pool.scores.sub(q, gal)
        for name, fn in rows.items():
            _, pred = fn(s)
            train[name].append(float(np.mean(pred == partner_true)))
    train_out = {k: {"mean": round(float(np.mean(v)), 4), "std": round(float(np.std(v)), 4)} for k, v in train.items()}
    for k in ("sift_combo_hungarian", "sift_combo_greedy"):
        want = stored["train_episodes"][k]["top1"]["mean"]
        if abs(train_out[k]["mean"] - want) > 0.001:
            raise SystemExit(f"{k}: {train_out[k]['mean']} on training episodes, pipeline.json has {want}")

    val_s = P.compute_scores(*C.load_split("val"), clip)
    val_ans = C.load_answers("val") - 1
    val_pred = {k: fn(val_s)[1] for k, fn in rows.items()}
    out = {
        "experiment": "two-step pipeline, one query at a time (no assignment across queries)",
        "protocol": {"train_episodes": stored["protocol"]["train_episodes"], "histogram_weight": w,
                     "test": f"read once, for {SERVED} only, after the training-episode and validation numbers were written"},
        "approaches": notes,
        "train_episodes": train_out,
        "val": {k: round(float(np.mean(p == val_ans)), 4) for k, p in val_pred.items()},
        "predictions": {k: {"val": (p + 1).tolist()} for k, p in val_pred.items()},
        "served": SERVED,
        "versions": {"python": platform.python_version(), "numpy": np.__version__},
        "device": C.device_name(),
    }
    OUT.write_text(json.dumps(out, indent=2) + "\n")
    print("training episodes:", train_out)
    print("validation:", out["val"])

    # Test, once, for the served variant only.
    test_s = P.compute_scores(*C.load_split("test"), clip)
    test_pred = rows[SERVED](test_s)[1]
    test_ans = C.load_answers("test") - 1
    out["test"] = {SERVED: round(float(np.mean(test_pred == test_ans)), 4)}
    out["test_correct"] = {SERVED: f"{int((test_pred == test_ans).sum())}/{len(test_ans)}"}
    out["predictions"][SERVED]["test"] = (test_pred + 1).tolist()
    out["seconds"] = round(time.perf_counter() - t0, 1)
    OUT.write_text(json.dumps(out, indent=2) + "\n")
    print("test (served variant, read once):", out["test_correct"])


if __name__ == "__main__":
    main()
