"""Train one JolScan experiment, log it to MLflow, and write a small result file.

Starter script: checked against the Ultralytics 8.4 and MLflow 3 documentation, but not yet run.
The first person to run it in Colab (task M-1) fixes whatever breaks and commits the fix.

Usage, from the repository root:
    pip install -r ml/requirements.txt
    python ml/train.py --run E0 --data /content/pothole/data.yaml --dataset-version v1 --smoke   # 1 epoch
    python ml/train.py --run E0 --data /content/pothole/data.yaml --dataset-version v1

Every run keeps the same split, seed and budget and changes one thing (docs/ML-EXPERIMENT.md).

The result file ml/results/runs/<run>.json is the source of truth for the results table.
Commit it. MLflow stays per Colab account (its store is a local SQLite file that cannot be
merged across accounts), and is used for the tracking UI.
"""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path

import mlflow
import torch
import ultralytics
from ultralytics import YOLO

SEED = 42
EXPERIMENT = "jolscan-pothole"
RULES_CONF = 0.40  # the counting threshold the app uses (docs/RULES.md, rule R1)

# Shared settings. A run overrides only the keys it is meant to change.
BASE = dict(epochs=40, imgsz=640, batch=16, seed=SEED, optimizer="SGD", lr0=0.01, pretrained=True)

# The standard geometric and colour augmentations, switched off for run E5.
NO_AUG = dict(mosaic=0.0, mixup=0.0, fliplr=0.0, hsv_h=0.0, hsv_s=0.0, hsv_v=0.0, translate=0.0, scale=0.0)

RUNS: dict[str, dict] = {
    "E0": dict(weights="yolo26n.pt", changed="baseline"),
    # n and s have the same depth. s has twice the channels.
    "E1": dict(weights="yolo26s.pt", changed="model width: small instead of nano"),
    "E2": dict(weights="yolo26n.yaml", changed="no transfer learning: random weights", pretrained=False),
    # In YOLO26 the backbone is layers 0-10, so freeze=11 freezes all of it.
    "E3": dict(weights="yolo26n.pt", changed="frozen backbone: layers 0-10", freeze=11),
    # Each optimizer at its documented default learning rate. warmup_bias_lr=0 is what
    # Ultralytics itself uses with AdamW.
    "E4": dict(weights="yolo26n.pt", changed="optimizer: AdamW", optimizer="AdamW", lr0=0.001, warmup_bias_lr=0.0),
    "E5": dict(weights="yolo26n.pt", changed="standard augmentations off", **NO_AUG),
    # Extra P2 detection scale for small objects. The config ships with Ultralytics.
    # pretrained as a string loads every layer whose shape matches the nano weights.
    "E7": dict(weights="yolo26n-p2.yaml", changed="architecture: extra P2 small-object scale", pretrained="yolo26n.pt"),
    # Only meaningful if the dataset version was exported without resizing to 640.
    "E6": dict(weights="yolo26n.pt", changed="input resolution 960", imgsz=960),
    # E8: fill in after choosing the best settings with the selection rule. Then train it.
    "E8": dict(weights=None, changed="best combination: FILL IN"),
}


def evaluate(model: YOLO, data: str, imgsz: int) -> dict[str, float]:
    """Validation metrics choose between runs. Test metrics go in the final table."""
    out: dict[str, float] = {}
    for split in ("val", "test"):
        m = model.val(data=data, split=split, imgsz=imgsz)
        out[f"{split}_precision"] = float(m.box.mp)
        out[f"{split}_recall"] = float(m.box.mr)
        out[f"{split}_map50"] = float(m.box.map50)
        out[f"{split}_map50_95"] = float(m.box.map)
        # Precision and recall when only boxes above the app's counting threshold are kept.
        op = model.val(data=data, split=split, imgsz=imgsz, conf=RULES_CONF)
        out[f"{split}_precision_at_rules_conf"] = float(op.box.mp)
        out[f"{split}_recall_at_rules_conf"] = float(op.box.mr)
    return out


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--run", required=True, choices=sorted(RUNS))
    parser.add_argument("--data", required=True, help="path to the dataset data.yaml")
    parser.add_argument("--dataset-version", required=True, help="Roboflow dataset version, e.g. v1")
    parser.add_argument("--smoke", action="store_true", help="1 epoch, to test the script. Not exported")
    parser.add_argument("--batch", type=int, default=None, help="only if the GPU runs out of memory")
    args = parser.parse_args()

    cfg = dict(RUNS[args.run])
    weights = cfg.pop("weights")
    changed = cfg.pop("changed")
    if weights is None:
        raise SystemExit("Fill in the E8 entry in RUNS first (see docs/ML-EXPERIMENT.md, selection rule).")

    train_args = {**BASE, **cfg}
    if args.smoke:
        train_args["epochs"] = 1
    if args.batch:
        train_args["batch"] = args.batch

    run_name = f"{args.run}-smoke" if args.smoke else args.run
    # Ultralytics has its own MLflow callback. It reuses a run that is already open, and
    # this variable stops it from creating a second experiment named after the project folder.
    os.environ["MLFLOW_EXPERIMENT_NAME"] = EXPERIMENT
    mlflow.set_experiment(EXPERIMENT)

    with mlflow.start_run(run_name=run_name):
        mlflow.set_tags({"changed": changed, "dataset_version": args.dataset_version, "smoke": str(args.smoke)})
        mlflow.log_params({"weights": weights, **{f"cfg_{k}": v for k, v in train_args.items()}})

        model = YOLO(weights)
        # An absolute project path keeps the output in ./runs/<run>, wherever Ultralytics' default is.
        model.train(data=args.data, project=str(Path.cwd() / "runs"), name=run_name, exist_ok=True, **train_args)
        best = Path(model.trainer.best)

        metrics = evaluate(YOLO(str(best)), args.data, train_args["imgsz"])
        weights_mb = best.stat().st_size / 1e6
        mlflow.log_metrics({**metrics, "weights_mb": weights_mb})

        result = {
            "run": args.run,
            "smoke": args.smoke,
            "changed": changed,
            "weights": weights,
            "dataset_version": args.dataset_version,
            "params": train_args,
            "metrics": {k: round(v, 4) for k, v in metrics.items()},
            "weights_mb": round(weights_mb, 2),
            "ultralytics": ultralytics.__version__,
            "torch": torch.__version__,
            "device": torch.cuda.get_device_name(0) if torch.cuda.is_available() else "cpu",
        }
        out_dir = Path("ml/results/runs")
        out_dir.mkdir(parents=True, exist_ok=True)
        out_file = out_dir / f"{run_name}.json"
        out_file.write_text(json.dumps(result, indent=2, allow_nan=False) + "\n")
        print(f"Wrote {out_file}. Best weights: {best}")


if __name__ == "__main__":
    main()
