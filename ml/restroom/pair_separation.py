"""How well can the model tell the two doors of one restroom apart? Evidence for signage rule S2.

The first version of rule S2 asked whether the two signs' predicted genders differ, with each
sign classified on its own. Per-sign gender is right only about 75% of the time, so that rule
fails on many real, correct pairs. This script measures the alternative: compare the two signs
with each other. The sign with the higher P(male) is taken as the men's door, and the rule fails
only when the two P(male) values are too close to tell apart (the "margin").

It uses the 82 training restrooms (no test data is touched) and two kinds of pairs:
- real pairs: the male and female sign of the same restroom (should pass S2);
- same-gender pairs: two male signs, or two female signs, from different restrooms. This is what
  a confusing door pair looks like to the model (should fail S2).

P(male) comes from zero-shot CLIP prompts (what the API serves by default) and, for comparison,
from the logistic-regression probe with out-of-fold predictions (grouped 5-fold CV by restroom).

Usage, from the repository root:
    .venv/bin/python ml/restroom/pair_separation.py
Writes ml/results/restroom/pair_separation.json.
"""

from __future__ import annotations

import json
import sys
from itertools import combinations
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
import common as C  # noqa: E402

ARCH = "ViT-B-32"   # the API's default restroom model
OUT = Path("ml/results/restroom/pair_separation.json")
MARGINS = [0.05, 0.10, 0.15, 0.20, 0.25, 0.30, 0.40, 0.50]
OLD_S1 = 0.80


def oof_probe_pmale(emb: np.ndarray, y: np.ndarray, groups: np.ndarray) -> np.ndarray:
    """Out-of-fold P(male) from the logistic-regression probe, grouped by restroom."""
    p = np.zeros(len(y))
    for tr, te in C.grouped_folds(groups):
        clf = C.make_probe().fit(emb[tr], y[tr])
        p[te] = clf.predict_proba(emb[te])[:, 0]   # column 0 = male (label 0)
    return p


def analyse(p_male: np.ndarray, items: list, kind: str) -> dict:
    """All statistics for one image kind ("orig" door photos or "crop" icons)."""
    idx = {(t.restroom, t.gender): i for i, t in enumerate(items) if t.kind == kind}
    rooms = sorted({r for r, _ in idx})
    pm = {key: float(p_male[i]) for key, i in idx.items()}

    real = [(pm[(r, 0)], pm[(r, 1)]) for r in rooms]            # (male sign, female sign)
    same = [(pm[(a, g)], pm[(b, g)]) for g in (0, 1) for a, b in combinations(rooms, 2)]

    real_margin = np.array([abs(m - f) for m, f in real])
    same_margin = np.array([abs(a - b) for a, b in same])

    # Old rules, per sign: predicted gender = male if P(male) >= 0.5; confidence = max(P, 1 - P).
    old_s2_pass = np.mean([(m >= 0.5) != (f >= 0.5) for m, f in real])
    both_correct = np.mean([(m >= 0.5) and (f < 0.5) for m, f in real])
    conf = np.array([max(v, 1 - v) for pair in real for v in pair])
    pairwise_correct = np.mean([m > f for m, f in real])

    sweep = []
    for t in MARGINS:
        passed = real_margin >= t
        sweep.append({
            "margin": t,
            "real_pairs_pass": round(float(passed.mean()), 4),
            "pairwise_accuracy_when_passed": round(float(np.mean([m > f for (m, f), ok in zip(real, passed) if ok])) if passed.any() else float("nan"), 4),
            "same_gender_pairs_flagged": round(float((same_margin < t).mean()), 4),
        })

    q = lambda a: {k: round(float(np.quantile(a, v)), 4) for k, v in (("p10", .1), ("p25", .25), ("median", .5), ("p75", .75), ("p90", .9))}
    return {
        "kind": kind,
        "restrooms": len(rooms),
        "same_gender_pairs": len(same),
        "old_rules": {
            "S2_pass_rate_on_real_pairs": round(float(old_s2_pass), 4),
            "both_signs_correct": round(float(both_correct), 4),
            "S1_share_of_signs_at_or_above_0.80": round(float((conf >= OLD_S1).mean()), 4),
        },
        "pairwise": {
            "accuracy_men_door_has_higher_p_male": round(float(pairwise_correct), 4),
            "real_pair_margin": q(real_margin),
            "same_gender_pair_margin": q(same_margin),
            "sweep": sweep,
        },
    }


def similarity_check(emb: np.ndarray, items: list, kind: str) -> dict:
    """Rule S3: scaled similarity of the two doors of one restroom, against a male sign and a
    female sign from two different restrooms (signs that do not belong to one set)."""
    idx = {(t.restroom, t.gender): i for i, t in enumerate(items) if t.kind == kind}
    rooms = sorted({r for r, _ in idx})
    sim = C.scaled_similarity(emb, emb)
    same_set = np.array([sim[idx[(r, 0)], idx[(r, 1)]] for r in rooms])
    other_set = np.array([sim[idx[(a, 0)], idx[(b, 1)]] for a in rooms for b in rooms if a != b])
    q = lambda a: {k: round(float(np.quantile(a, v)), 4) for k, v in (("p10", .1), ("p25", .25), ("median", .5), ("p75", .75), ("p90", .9))}
    sweep = [{"threshold": t,
              "same_set_pass": round(float((same_set >= t).mean()), 4),
              "different_sets_flagged": round(float((other_set < t).mean()), 4)}
             for t in (0.75, 0.80, 0.82, 0.84, 0.86, 0.88, 0.90)]
    return {"kind": kind, "same_set": q(same_set), "different_sets": q(other_set), "sweep": sweep}


def main() -> None:
    items = C.load_train()
    model, preprocess, tokenizer = C.load_clip(ARCH)
    emb = C.embed_paths_cached(model, preprocess, [t.path for t in items], f"{ARCH}-openai")
    y = np.array([t.gender for t in items])
    groups = np.array([t.restroom for t in items])

    p_zero_shot = C.zero_shot_proba(emb, C.text_class_embeddings(model, tokenizer))[:, 0]
    p_probe = oof_probe_pmale(emb, y, groups)

    result = {"model": f"{ARCH} (OpenAI CLIP, zero-shot weights)", "data": "IOAI 2025 Restroom training set, 82 restrooms",
              "zero_shot": {k: analyse(p_zero_shot, items, k) for k in ("orig", "crop")},
              "probe_out_of_fold": {k: analyse(p_probe, items, k) for k in ("orig", "crop")},
              "similarity_S3": {k: similarity_check(emb, items, k) for k in ("orig", "crop")}}
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(result, indent=2) + "\n")

    for source in ("zero_shot", "probe_out_of_fold"):
        for kind in ("orig", "crop"):
            r = result[source][kind]
            o, p = r["old_rules"], r["pairwise"]
            print(f"\n== {source} / {kind} ({r['restrooms']} restrooms, {r['same_gender_pairs']} same-gender pairs)")
            print(f"old S2 passes on real pairs {o['S2_pass_rate_on_real_pairs']:.2f} | both signs right {o['both_signs_correct']:.2f}"
                  f" | signs >= 0.80 confident {o['S1_share_of_signs_at_or_above_0.80']:.2f}")
            print(f"pairwise: men's door has higher P(male) in {p['accuracy_men_door_has_higher_p_male']:.2f} of real pairs")
            print(f"margin real pairs {p['real_pair_margin']} | same-gender pairs {p['same_gender_pair_margin']}")
            for s in p["sweep"]:
                print(f"  margin >= {s['margin']:.2f}: real pairs pass {s['real_pairs_pass']:.2f}, right when passed"
                      f" {s['pairwise_accuracy_when_passed']:.2f}, same-gender pairs flagged {s['same_gender_pairs_flagged']:.2f}")
    for kind in ("orig", "crop"):
        s = result["similarity_S3"][kind]
        print(f"\n== S3 similarity / {kind}: same restroom {s['same_set']} | different restrooms {s['different_sets']}")
        for row in s["sweep"]:
            print(f"  >= {row['threshold']:.2f}: same-set pairs pass {row['same_set_pass']:.2f}, different-set pairs flagged {row['different_sets_flagged']:.2f}")
    print(f"\nWrote {OUT}")


if __name__ == "__main__":
    main()
