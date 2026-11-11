"""Match in the app's setting: one whole door sign against a small gallery (task C-22).

In the IOAI task the query is a crop of one gallery image, so step 1 of the pipeline finds its own
original. In the web app the query is a separate door sign that is not in the gallery: step 1 finds
nothing and only step 2 matters. This script builds that setting from the 82 training restrooms
(training data only, nothing is tuned on validation or test):

    query    one original door sign, restroom r and gender g
    gallery  its partner (r, 1 - g) plus both originals of K - 1 other restrooms (2K - 1 images)
    K        6, like the 12 real sample signs of the web app, and 30, like an IOAI test set

Rules compared (correct if the pick is the partner):
    gender_filter   the most CLIP-similar candidate whose zero-shot predicted gender differs from the
                    query's (the API's rule before C-8, R6's rule); none left counts as wrong
    clip            the most CLIP-similar candidate
    histogram       the most colour-histogram-similar candidate
    pipeline_step2  C-8's no-own-original score on {query} + gallery: 0.3 z(histogram) + 0.7 z(CLIP),
                    best candidate in the query's row (what /restroom/match does since C-8)

Writes  ml/results/restroom/app_setting.json

Usage, from the repository root:
    python ml/restroom/app_setting.py
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
import classic as K  # noqa: E402
import common as C  # noqa: E402
import pipeline as P  # noqa: E402

OUT = C.RESULTS / "app_setting.json"
EPISODES = 500
KS = (6, 30)
W_HIST = json.loads(P.OUT.read_text())["histogram_weight"]
RULES = ("gender_filter", "clip", "histogram", "pipeline_step2")


def main() -> None:
    origs = [t for t in C.load_train() if t.kind == "orig"]
    paths = [t.path for t in origs]
    index = {(t.restroom, t.gender): i for i, t in enumerate(origs)}
    rooms = sorted({t.restroom for t in origs})

    model, preprocess, tok = C.load_clip("ViT-B-32")
    E = C.embed_paths_cached(model, preprocess, paths, "ViT-B-32-openai")
    clip = E @ E.T
    H = K.hist_matrix(paths, paths)
    p_male = C.zero_shot_proba(E, C.text_class_embeddings(model, tok))[:, 0]
    pred_gender = np.where(p_male >= 0.5, 0, 1)   # 0 male, 1 female, as in common.TrainImage

    rng = np.random.default_rng(C.SEED)
    out = {}
    for k in KS:
        hits = {r: [] for r in RULES}
        for _ in range(EPISODES):
            chosen = rng.choice(rooms, size=k, replace=False)
            r, g = int(chosen[0]), int(rng.integers(0, 2))
            q = index[(r, g)]
            partner = index[(r, 1 - g)]
            gallery = [partner] + [index[(o, s)] for o in chosen[1:] for s in (0, 1)]
            gallery = list(rng.permutation(gallery))
            sims = clip[q, gallery]

            by_sim = [gallery[i] for i in np.argsort(-sims, kind="stable")]
            pick = next((c for c in by_sim if pred_gender[c] != pred_gender[q]), None)
            hits["gender_filter"].append(pick == partner)
            hits["clip"].append(gallery[int(np.argmax(sims))] == partner)
            hits["histogram"].append(gallery[int(np.argmax(H[q, gallery]))] == partner)
            s = [q, *gallery]
            score = W_HIST * P.zscore(H[np.ix_(s, s)]) + (1 - W_HIST) * P.zscore(clip[np.ix_(s, s)])
            row = score[0].copy()
            row[0] = -np.inf
            hits["pipeline_step2"].append(s[int(np.argmax(row))] == partner)
        out[f"K{k}"] = {
            "restrooms": k, "gallery_size": 2 * k - 1, "chance": round(1 / (2 * k - 1), 4),
            "top1": {rule: {"mean": round(float(np.mean(v)), 4), "std": round(float(np.std(v)), 4)} for rule, v in hits.items()},
        }
        print(f"K = {k:2d} (gallery {2 * k - 1}, chance {1 / (2 * k - 1):.3f}):",
              {rule: out[f'K{k}']['top1'][rule]['mean'] for rule in RULES})

    OUT.write_text(json.dumps({
        "experiment": "Match in the app's setting: one whole door sign, its partner and K - 1 other restrooms in the gallery",
        "data": "IOAI 2025 training originals only (82 restrooms); nothing tuned on validation or test",
        "episodes_per_K": EPISODES, "seed": C.SEED, "histogram_weight": W_HIST,
        "gender_head": "zero-shot text prompts on CLIP ViT-B/32 (the API's default)",
        "rules": {
            "gender_filter": "most CLIP-similar candidate of the opposite predicted gender (the API before C-8)",
            "clip": "most CLIP-similar candidate",
            "histogram": "most colour-histogram-similar candidate",
            "pipeline_step2": f"{W_HIST} z(histogram) + {1 - W_HIST:.1f} z(CLIP) on query + gallery (the API since C-8)",
        },
        "results": out,
    }, indent=2) + "\n")


if __name__ == "__main__":
    main()
