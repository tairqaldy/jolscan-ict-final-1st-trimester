"""Build the results table from the per-run files written by train.py.

Reads   ml/results/runs/E*.json   (one per run, committed by whoever trained it)
Writes  ml/results/experiments.csv   for the slides
        web/data/experiments.json    for the web app's model page

Usage, from the repository root:
    python ml/export_results.py

Latency is not taken from training. It is measured separately with batch size 1 (task S-15)
and passed in through ml/results/latency.json: {"E0": 12.3, "E1": 18.9, ...} in milliseconds.
"""

from __future__ import annotations

import json
from datetime import date
from pathlib import Path

RUNS_DIR = Path("ml/results/runs")
LATENCY_FILE = Path("ml/results/latency.json")
CSV_OUT = Path("ml/results/experiments.csv")
JSON_OUT = Path("web/data/experiments.json")
MANIFEST = Path("data/exports/potholes_yolo_v1/split_manifest.json")

# Facts from the dataset card (data/README.md, task D-1). Image counts come from the manifest.
DATASET_CARD = {
    "name": "Annotated Potholes Image Dataset (version potholes_yolo_v1)",
    "source": "Kaggle, https://www.kaggle.com/datasets/chitholian/annotated-potholes-dataset (Atikur Rahman Chitholian)",
    "licence": "ODbL (database) and DbCL (contents), as shown on Kaggle, read 11 Nov 2026",
    "classes": ["pothole"],
    "split": "Random by image, seed 42, after a duplicate check",
    "notes": "Rebuilt from Kaggle and checked against the split manifest by data/make_potholes_yolo_v1.py; images are not in git.",
}
PROTOCOL = ("Same frozen split (potholes_yolo_v1), seed 42 and 40 epochs for every run; one change per run against E0. "
            "The test split is read once per run, after training.")
CHAMPION_RULE = "Highest validation mAP50; within 0.01, higher validation recall at confidence 0.40."

# Selection rule, fixed before E1 (docs/ML-EXPERIMENT.md). Validation metrics only.
TIE = 0.01


def pick_champion(rows: list[dict]) -> str:
    best_map = max(r["valMap50"] for r in rows)
    tied = [r for r in rows if best_map - r["valMap50"] <= TIE]
    return max(tied, key=lambda r: r["valRecallAtRulesConf"])["run"]


def main() -> None:
    files = sorted(p for p in RUNS_DIR.glob("E*.json") if "smoke" not in p.stem)
    if not files:
        raise SystemExit(f"No run files in {RUNS_DIR}. Train at least E0 first.")
    latency = json.loads(LATENCY_FILE.read_text()) if LATENCY_FILE.exists() else {}

    rows = []
    for path in files:
        r = json.loads(path.read_text())
        if r.get("smoke", False):
            continue
        m = r["metrics"]
        rows.append({
            "run": r["run"],
            "changed": r["changed"],
            "precision": m["test_precision"],
            "recall": m["test_recall"],
            "map50": m["test_map50"],
            "map50_95": m["test_map50_95"],
            "precisionAtRulesConf": m["test_precision_at_rules_conf"],
            "recallAtRulesConf": m["test_recall_at_rules_conf"],
            "latencyMs": latency.get(r["run"]),
            "sizeMb": r["weights_mb"],
            "valMap50": m["val_map50"],
            "valRecallAtRulesConf": m["val_recall_at_rules_conf"],
            "datasetVersion": r["dataset_version"],
            "device": r.get("device"),
        })

    if not rows:
        raise SystemExit(f"No completed non-smoke run files in {RUNS_DIR}. Train at least E0 first.")

    versions = {row["datasetVersion"] for row in rows}
    if len(versions) > 1:
        print(f"WARNING: runs used different dataset versions {sorted(versions)}. They are not comparable.")

    champion = pick_champion(rows)

    CSV_OUT.parent.mkdir(parents=True, exist_ok=True)
    header = list(rows[0].keys())
    lines = [",".join(header)] + [",".join("" if row[k] is None else str(row[k]) for k in header) for row in rows]
    CSV_OUT.write_text("\n".join(lines) + "\n")

    JSON_OUT.parent.mkdir(parents=True, exist_ok=True)
    manifest = json.loads(MANIFEST.read_text())
    dataset = {**DATASET_CARD, "images": manifest["image_counts"]}
    payload = {
        "isMock": False,
        "updatedAt": date.today().isoformat(),
        "protocol": PROTOCOL,
        "championRule": CHAMPION_RULE,
        "champion": champion,
        # Must equal what the API reports: MODEL_NAME defaults to the weights file stem (api/main.py).
        "championModelName": f"jolscan-{champion.lower()}",
        "dataset": dataset,
        "runs": rows,
    }
    JSON_OUT.write_text(json.dumps(payload, indent=2, allow_nan=False) + "\n")
    print(f"Wrote {CSV_OUT} and {JSON_OUT}. Champion by the selection rule: {champion}")


if __name__ == "__main__":
    main()
