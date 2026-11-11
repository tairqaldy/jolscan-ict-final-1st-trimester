"""Out-of-sample check of the signage rules on the 10 validation restrooms (task C-26).

The thresholds in docs/RULES.md part 2 were chosen on the 82 training restrooms. The validation gallery
holds the two door signs of 10 restrooms the thresholds never saw. Their gender was labelled by eye in
ml/results/restroom/val_gallery_labels.csv, with pairs from the IOAI answer file (each query's partner)
and the original each crop was cut from. This script applies S1-S3 with zero-shot CLIP ViT-B/32, the
API's model, and puts the counts with exact 95 % intervals next to the training values.

Nothing is tuned here: the thresholds stay as they are (web/lib/signage/config.ts). Test is not used.

Writes  ml/results/restroom/signage_val.json

Usage, from the repository root:
    python ml/restroom/signage_val.py
"""

from __future__ import annotations

import csv
import itertools
import json
import sys
from pathlib import Path

import numpy as np
from scipy import stats

sys.path.insert(0, str(Path(__file__).resolve().parent))
import common as C  # noqa: E402

LABELS = C.RESULTS / "val_gallery_labels.csv"
OUT = C.RESULTS / "signage_val.json"
TRAIN = C.RESULTS / "pair_separation.json"
S1, S2, S3 = 0.20, 0.05, 0.88   # web/lib/signage/config.ts defaults


def ci(k: int, n: int) -> dict:
    k, n = int(k), int(n)
    c = stats.binomtest(k, n).proportion_ci(confidence_level=0.95, method="exact")
    return {"k": k, "n": n, "rate": round(k / n, 4), "ci95": [round(c.low, 4), round(c.high, 4)]}


def check_labels(rows: list[dict]) -> None:
    """Every pair has one male and one female sign, and exactly one of them is a query's IOAI answer."""
    answers = set(int(a) for a in C.load_answers("val"))
    by_pair: dict[int, list[dict]] = {}
    for r in rows:
        by_pair.setdefault(int(r["pair_id"]), []).append(r)
    for pid, members in by_pair.items():
        genders = sorted(m["gender"] for m in members)
        in_answers = sum(int(m["gallery_file"].split(".")[0]) in answers for m in members)
        if len(members) != 2 or genders != ["female", "male"] or in_answers != 1:
            raise SystemExit(f"pair {pid} is not one male and one female sign with one IOAI answer: {members}")


def main() -> None:
    with LABELS.open(newline="") as f:
        rows = list(csv.DictReader(f))
    check_labels(rows)
    _, gallery = C.load_split("val")
    num = {int(p.stem): p for p in gallery}

    model, preprocess, tok = C.load_clip("ViT-B-32")
    files = [num[int(r["gallery_file"].split(".")[0])] for r in rows]
    emb = C.embed_paths_cached(model, preprocess, files, "ViT-B-32-openai")
    p_male = C.zero_shot_proba(emb, C.text_class_embeddings(model, tok))[:, 0]
    sim = np.clip((emb @ emb.T + 1) / 2, 0, 1)   # the API's similarity
    gender = [r["gender"] for r in rows]
    pair = [int(r["pair_id"]) for r in rows]

    real = [(i, j) for i, j in itertools.combinations(range(len(rows)), 2) if pair[i] == pair[j]]
    same = [(i, j) for i, j in itertools.combinations(range(len(rows)), 2) if pair[i] != pair[j] and gender[i] == gender[j]]
    per_pair = []
    for i, j in real:
        men, women = (i, j) if gender[i] == "male" else (j, i)
        gap = abs(p_male[i] - p_male[j])
        per_pair.append({"pair_id": pair[i], "mens_door": rows[men]["gallery_file"], "womens_door": rows[women]["gallery_file"],
                         "p_male_mens": round(float(p_male[men]), 4), "p_male_womens": round(float(p_male[women]), 4),
                         "gap": round(float(gap), 4), "right_way_round": bool(p_male[men] > p_male[women]),
                         "similarity": round(float(sim[i, j]), 4)})
    nr = len(real)
    val = {
        "both_doors_right_way_round": ci(sum(p["right_way_round"] for p in per_pair), nr),
        "S1_pass_real_pairs": ci(sum(p["gap"] >= S1 for p in per_pair), nr),
        "S1_pass_and_right_way_round": ci(sum(p["gap"] >= S1 and p["right_way_round"] for p in per_pair),
                                          max(1, sum(p["gap"] >= S1 for p in per_pair))),
        "S2_pass_real_pairs": ci(sum(p["gap"] >= S2 for p in per_pair), nr),
        "S3_pass_real_pairs": ci(sum(p["similarity"] >= S3 for p in per_pair), nr),
        "S2_flags_same_gender_pairs": ci(sum(abs(p_male[i] - p_male[j]) < S2 for i, j in same), len(same)),
        "S3_flags_same_gender_pairs": ci(sum(sim[i, j] < S3 for i, j in same), len(same)),
    }

    t = json.loads(TRAIN.read_text())
    zo = t["zero_shot"]["orig"]
    sweep = {r["margin"]: r for r in zo["pairwise"]["sweep"]}
    s3 = {r["threshold"]: r for r in t["similarity_S3"]["orig"]["sweep"]}
    train = {
        "both_doors_right_way_round": zo["pairwise"]["accuracy_men_door_has_higher_p_male"],
        "S1_pass_real_pairs": sweep[S1]["real_pairs_pass"],
        "S1_pass_and_right_way_round": sweep[S1]["pairwise_accuracy_when_passed"],
        "S2_pass_real_pairs": sweep[S2]["real_pairs_pass"],
        "S3_pass_real_pairs": s3[S3]["same_set_pass"],
        "S2_flags_same_gender_pairs": sweep[S2]["same_gender_pairs_flagged"],
        "S3_flags_same_gender_pairs": None,   # training measured S3 on all different-restroom pairs instead
        "S3_flags_different_restroom_pairs": s3[S3]["different_sets_flagged"],
    }
    OUT.write_text(json.dumps({
        "check": "signage rules S1-S3 on the 10 validation restrooms, thresholds unchanged",
        "model": "zero-shot CLIP ViT-B/32 with the API's prompts",
        "thresholds": {"S1_gap": S1, "S2_gap": S2, "S3_similarity": S3},
        "labels": str(LABELS),
        "validation": val, "training": train, "pairs": per_pair,
    }, indent=2) + "\n")
    for k, v in val.items():
        print(f"{k:32s} {v['k']}/{v['n']} = {v['rate']:.2f} ({v['ci95'][0]:.2f}-{v['ci95'][1]:.2f})   training {train.get(k)}")


if __name__ == "__main__":
    main()
