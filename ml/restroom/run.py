"""Run one restroom-sign experiment and write ml/results/restroom/runs/<run>.json.

The task (IOAI 2025, "Restroom Icon Matching"): for each cropped query icon, find the original
icon of the OPPOSITE gender from the SAME restroom in a gallery. Score = top-1 accuracy, exactly
as the IOAI scoring script computes it. Every run also reports gender accuracy (5-fold
cross-validation on the training set, grouped by restroom) and latency per image at batch size 1.

Runs (one change at a time against the previous one, see README.md):
    R0  zero-shot CLIP ViT-B/16, second most similar gallery image (IOAI baseline reproduction)
    R1  zero-shot CLIP ViT-B/32 (backbone change only)
    R2  fine-tune the last 1 transformer block of ViT-B/32, reference two-model recipe
    R3  ... last 3 blocks
    R4  ... last 6 blocks (the reference solution's setting)
    R5  R4 + augmentation
    R6  gender focus: zero-shot prompts vs scikit-learn classifiers on frozen ViT-B/32
        embeddings; matching = most similar opposite-gender candidate (the API's former rule before C-8)

Usage, from the repository root:
    python ml/restroom/get_data.py
    python ml/restroom/run.py --run R0
    python ml/restroom/run.py --run R4 --smoke      # 2 epochs, to time the script. Not exported

Selection rule: runs are compared on validation only. The test answers are read once, at the
end of a run, after everything about the run is fixed, and stored with it.
"""

from __future__ import annotations

import argparse
import os
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
import common as C  # noqa: E402

EXPERIMENT = "jolscan-restroom"

RUNS: dict[str, dict] = {
    "R0": dict(arch="ViT-B-16", mode="zeroshot", matching="second_best",
               changed="baseline: zero-shot CLIP ViT-B/16, second most similar gallery image (IOAI baseline)"),
    "R1": dict(arch="ViT-B-32", mode="zeroshot", matching="second_best",
               changed="backbone: ViT-B/32 instead of ViT-B/16, still zero-shot"),
    "R2": dict(arch="ViT-B-32", mode="finetune", unfreeze=1, matching="two_step",
               changed="fine-tune last 1 block of ViT-B/32, two models, two-step matching (IOAI reference recipe)"),
    "R3": dict(arch="ViT-B-32", mode="finetune", unfreeze=3, matching="two_step",
               changed="as R2, last 3 blocks fine-tuned"),
    "R4": dict(arch="ViT-B-32", mode="finetune", unfreeze=6, matching="two_step",
               changed="as R2, last 6 blocks fine-tuned (the reference solution's setting)"),
    "R5": dict(arch="ViT-B-32", mode="finetune", unfreeze=6, matching="two_step", augment=True,
               changed="R4 + augmentation: resized crop, flip, small rotation/shift, colour jitter, greyscale"),
    "R6": dict(arch="ViT-B-32", mode="gender", matching="gender_filter_probe",
               changed="gender probe: logistic regression on frozen ViT-B/32 embeddings; match = most similar "
                       "candidate of the opposite predicted gender (the API's former rule before C-8)"),
}


def log(msg: str) -> None:
    print(msg, flush=True)


# --------------------------------------------------------------------------------------------
# Encoders. A run has a "crop" encoder (step 1 of two-step matching) and a "pair" encoder
# (everything else: step 2, similarity in the API, gender probe). Zero-shot runs use one model.
# --------------------------------------------------------------------------------------------

class Encoder:
    def __init__(self, model, preprocess, tag: str | None):
        self.model, self.preprocess, self.tag = model, preprocess, tag

    def __call__(self, paths: list[Path]) -> np.ndarray:
        if self.tag:  # pretrained weights: cache under data/cache/
            return C.embed_paths_cached(self.model, self.preprocess, paths, self.tag)
        return C.embed_images(self.model, self.preprocess, paths)


def train_pairs(train: list[C.TrainImage], kinds: str, restrooms: set[int] | None = None) -> list[tuple[Path, Path]]:
    """Positive pairs from the training set, optionally only for some restrooms.

    kinds="crop": (orig, crop) of the same gender and restroom, both genders -> 2 pairs per restroom.
    kinds="pair": (orig male, orig female) of the same restroom -> 1 pair per restroom.
    """
    by = {(t.kind, t.gender, t.restroom): t.path for t in train}
    ids = sorted({t.restroom for t in train} if restrooms is None else restrooms)
    if kinds == "crop":
        return [(by[("orig", g, i)], by[("crop", g, i)]) for g in (0, 1) for i in ids]
    return [(by[("orig", 0, i)], by[("orig", 1, i)]) for i in ids]


def finetune_cfg(spec: dict, role: str, epochs: int | None) -> C.FinetuneConfig:
    cfg = C.FinetuneConfig(unfreeze=spec["unfreeze"], augment=spec.get("augment", False),
                           eta_min=1e-5 if role == "crop" else 1e-6)
    if epochs:
        cfg.epochs = epochs
    return cfg


# --------------------------------------------------------------------------------------------
# Gender accuracy
# --------------------------------------------------------------------------------------------

def gender_zero_shot(enc_model, tokenizer, emb: np.ndarray, y: np.ndarray) -> tuple[dict, np.ndarray]:
    text = C.text_class_embeddings(enc_model, tokenizer)
    proba = C.zero_shot_proba(emb, text)
    return C.classification_report_dict(y, proba.argmax(1)), text


def sklearn_comparison(emb: np.ndarray, y: np.ndarray, groups: np.ndarray) -> dict:
    """R6: the lab classifiers on the same frozen embeddings and the same grouped folds."""
    from sklearn.neighbors import KNeighborsClassifier
    from sklearn.pipeline import make_pipeline
    from sklearn.preprocessing import StandardScaler
    from sklearn.svm import LinearSVC

    return {
        "logistic_regression": C.probe_cv(emb, y, groups),
        "knn_5_cosine": C.probe_cv(emb, y, groups, lambda: KNeighborsClassifier(5, metric="cosine")),
        "linear_svm": C.probe_cv(emb, y, groups, lambda: make_pipeline(
            StandardScaler(), LinearSVC(C=0.1, max_iter=20000, random_state=C.SEED))),
    }


def gender_cv_finetuned(spec: dict, train: list[C.TrainImage], y: np.ndarray, groups: np.ndarray,
                        epochs: int | None) -> dict:
    """Grouped 5-fold CV for a fine-tuned run, without leakage: in every fold the pair model is
    fine-tuned on the training-fold restrooms only, then the probe is fitted and tested."""
    paths = [t.path for t in train]
    pred = np.zeros_like(y)
    fold_acc = []
    for k, (tr, te) in enumerate(C.grouped_folds(groups)):
        log(f"  gender CV fold {k + 1}/5: fine-tuning the pair model on {len(set(groups[tr]))} restrooms")
        (model, preprocess, _), _ = C.finetune_pairs(spec["arch"], train_pairs(train, "pair", set(groups[tr].tolist())),
                                                     finetune_cfg(spec, "pair", epochs), log)
        emb = C.embed_images(model, preprocess, paths)
        clf = C.make_probe().fit(emb[tr], y[tr])
        pred[te] = clf.predict(emb[te])
        fold_acc.append(float(np.mean(pred[te] == y[te])))
    rep = C.classification_report_dict(y, pred)
    rep["fold_accuracy"] = [round(a, 4) for a in fold_acc]
    rep["fold_accuracy_std"] = round(float(np.std(fold_acc)), 4)
    return rep


# --------------------------------------------------------------------------------------------
# Matching on one split
# --------------------------------------------------------------------------------------------

def match_all(split: str, crop_enc: Encoder, pair_enc: Encoder, probe, text_emb) -> dict[str, np.ndarray]:
    """Predictions of every matching strategy on one split, as 1-based gallery numbers."""
    query, gallery = C.load_split(split)
    qc, gc = crop_enc(query), crop_enc(gallery)
    qp, gp = (qc, gc) if pair_enc is crop_enc else (pair_enc(query), pair_enc(gallery))
    preds = {
        "second_best": C.match_second_best(qp, gp),
        "two_step": C.match_two_step(qc, gc, gp, prevent_reuse=True),
        "two_step_no_reuse": C.match_two_step(qc, gc, gp, prevent_reuse=False),
        "gender_filter_probe": C.match_gender_filter(qp, gp, probe.predict(qp), probe.predict(gp)),
    }
    if text_emb is not None:
        zs = lambda e: C.zero_shot_proba(e, text_emb).argmax(1)  # noqa: E731
        preds["gender_filter_zeroshot"] = C.match_gender_filter(qp, gp, zs(qp), zs(gp))
    return preds


def score(preds: dict[str, np.ndarray], answers: np.ndarray) -> dict[str, float]:
    return {k: round(C.precision_at_1(v, answers), 4) for k, v in preds.items()}


# --------------------------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--run", choices=sorted(RUNS))
    parser.add_argument("--latency", nargs="+", choices=sorted(RUNS), metavar="RUN",
                        help="only re-measure batch-1 latency of finished runs, back to back in one session, "
                             "and update their result files")
    parser.add_argument("--smoke", action="store_true", help="fine-tuning runs: 2 epochs, written as <run>-smoke.json")
    parser.add_argument("--epochs", type=int, default=None, help="override the 50 epochs of the fine-tuning recipe")
    parser.add_argument("--no-gender-cv-refit", action="store_true",
                        help="fine-tuning runs: skip the 5 per-fold refits; gender accuracy is then left null")
    args = parser.parse_args()
    if args.latency:
        return remeasure_latency(args.latency)
    if not args.run:
        parser.error("--run is required")

    spec = dict(RUNS[args.run])
    run_name = f"{args.run}-smoke" if args.smoke else args.run
    epochs = 2 if args.smoke else args.epochs
    C.seed_everything()
    t_start = time.perf_counter()
    log(f"{run_name}: {spec['changed']}  [device {C.device_name()}]")

    train = C.load_train()
    train_paths = [t.path for t in train]
    y = np.array([t.gender for t in train])
    groups = np.array([t.restroom for t in train])
    params = {k: v for k, v in spec.items() if k != "changed"}
    history: dict = {}
    checkpoints: dict = {}
    text_emb = None
    gender: dict = {}

    if spec["mode"] in ("zeroshot", "gender"):
        model, preprocess, tokenizer = C.load_clip(spec["arch"])
        enc = Encoder(model, preprocess, f"{spec['arch']}-openai")
        crop_enc = pair_enc = enc
        latency_model = (model, preprocess)
        train_emb = enc(train_paths)
        gender["zero_shot_prompts"], text_emb = gender_zero_shot(model, tokenizer, train_emb, y)
        gender["prompts"] = C.PROMPTS
        if spec["mode"] == "gender":
            gender.update(sklearn_comparison(train_emb, y, groups))
            gender["probe_lr"] = gender.pop("logistic_regression")
        else:
            gender["probe_lr"] = C.probe_cv(train_emb, y, groups)
        model_name = f"clip-{spec['arch'].lower().replace('-', '')}-zs"
    else:
        cfg_crop, cfg_pair = finetune_cfg(spec, "crop", epochs), finetune_cfg(spec, "pair", epochs)
        params.update(epochs=cfg_crop.epochs, batch_size=cfg_crop.batch_size, lr=cfg_crop.lr,
                      weight_decay=cfg_crop.weight_decay, betas=list(cfg_crop.betas), temperature=cfg_crop.temperature,
                      eta_min_crop=cfg_crop.eta_min, eta_min_pair=cfg_pair.eta_min, checkpoint="lowest training loss")
        log("  fine-tuning the crop model (orig <-> crop, 164 pairs)")
        (cm, cp, cstate), history["crop"] = C.finetune_pairs(spec["arch"], train_pairs(train, "crop"), cfg_crop, log)
        log("  fine-tuning the pair model (orig male <-> orig female, 82 pairs)")
        (pm, pp, pstate), history["pair"] = C.finetune_pairs(spec["arch"], train_pairs(train, "pair"), cfg_pair, log)
        if not args.smoke:
            checkpoints["crop"] = str(C.save_checkpoint(cstate, spec["arch"], spec["unfreeze"], args.run, "crop"))
            checkpoints["pair"] = str(C.save_checkpoint(pstate, spec["arch"], spec["unfreeze"], args.run, "pair"))
        crop_enc, pair_enc = Encoder(cm, cp, None), Encoder(pm, pp, None)
        latency_model = (pm, pp)
        train_emb = pair_enc(train_paths)
        if args.no_gender_cv_refit:
            gender["probe_lr"] = None
        else:
            gender["probe_lr"] = gender_cv_finetuned(spec, train, y, groups, epochs)
        model_name = f"clip-{spec['arch'].lower().replace('-', '')}-ft{spec['unfreeze']}" + ("-aug" if spec.get("augment") else "")

    # Probe used for gender-filter matching and served by the API: fitted on all 328 training images.
    probe = C.make_probe().fit(train_emb, y)
    if spec["mode"] == "gender" and not args.smoke:
        probe_path = Path("api/weights") / f"restroom-probe-{spec['arch'].lower()}.npz"
        C.save_probe(probe, probe_path, spec["arch"], None)
        checkpoints["probe"] = str(probe_path)

    # ---- validation: the only numbers used to compare runs
    val_preds = match_all("val", crop_enc, pair_enc, probe, text_emb)
    val_scores = score(val_preds, C.load_answers("val"))
    log(f"  validation top-1: {val_scores}")

    lat = C.latency_ms(*latency_model, C.load_split("val")[0])
    log(f"  latency {lat:.1f} ms per image (batch 1)")

    # ---- test: read once, after the run is fixed
    test_preds = match_all("test", crop_enc, pair_enc, probe, text_emb)
    test_scores = score(test_preds, C.load_answers("test"))
    log(f"  test top-1: {test_scores}")

    head = spec["matching"]
    gacc = gender["probe_lr"]["accuracy"] if gender.get("probe_lr") else None
    metrics = {
        "val_match_top1": val_scores[head],
        "test_match_top1": test_scores[head],
        "gender_acc_cv": gacc,
        "latency_ms": round(lat, 1),
        "val_match_by_strategy": val_scores,
        "test_match_by_strategy": test_scores,
        "val_correct": f"{int(round(val_scores[head] * 10))}/10",
        "test_correct": f"{int(round(test_scores[head] * 30))}/30",
    }
    result = {
        "run": args.run,
        "smoke": args.smoke,
        "isReal": not args.smoke,
        "changed": spec["changed"],
        "model": model_name,
        "params": params,
        "metrics": metrics,
        "gender": gender,
        "predictions": {"val": val_preds[head].tolist(), "test": test_preds[head].tolist()},
        "training": history or None,
        "checkpoints": checkpoints or None,
        "dataset": "IOAI 2025 Restroom Icon Matching (CC-BY-4.0): 82 training restrooms, val 10/20, test 30/60",
        "versions": C.versions(),
        "device": C.device_name(),
        "seconds": round(time.perf_counter() - t_start, 1),
        "timestamp": datetime.now(timezone.utc).isoformat(timespec="seconds"),
    }
    out = C.write_run({**result, "run": run_name})
    log(f"Wrote {out} in {result['seconds']} s. Headline ({head}): val {metrics['val_correct']}, "
        f"test {metrics['test_correct']}, gender acc (CV) {gacc}")
    log_mlflow(run_name, spec, params, metrics)


def remeasure_latency(runs: list[str], rounds: int = 60, warmup: int = 5) -> None:
    """Batch-1 latency of several runs, measured together so the numbers are comparable.

    Single-image CPU timings move with whatever else the machine is doing. The models are
    therefore timed round-robin (image 1 on every model, then image 2, ...), so all of them see
    the same background load, and the median is reported. The pothole lane measures latency
    separately too (task S-15).
    """
    import json

    images = [C.load_rgb(p) for p in C.load_split("val")[0]]
    loaded = {}
    for run in runs:
        result = json.loads((C.RUNS_DIR / f"{run}.json").read_text())
        ckpt = (result.get("checkpoints") or {}).get("pair") if RUNS[run]["mode"] == "finetune" else None
        if RUNS[run]["mode"] == "finetune" and not (ckpt and Path(ckpt).exists()):
            log(f"{run}: checkpoint {ckpt} not found, skipped")
            continue
        model, preprocess, _ = C.load_clip(RUNS[run]["arch"], ckpt)
        loaded[run] = (model, preprocess, result)
    times = {run: [] for run in loaded}
    for i in range(rounds + warmup):
        for run, (model, preprocess, _) in loaded.items():
            t = C.time_one_image(model, preprocess, images[i % len(images)])
            if i >= warmup:
                times[run].append(t)
    stamp = datetime.now(timezone.utc).isoformat(timespec="seconds")
    for run, (_, _, result) in loaded.items():
        lat = round(float(np.median(times[run])), 1)
        result["metrics"]["latency_ms"] = lat
        result["latency"] = {
            "protocol": f"median of {rounds} single images after {warmup} warm-up, preprocessing + image encoder, "
                        f"runs timed round-robin in one session",
            "p10_ms": round(float(np.percentile(times[run], 10)), 1),
            "p90_ms": round(float(np.percentile(times[run], 90)), 1),
            "measured_together": sorted(loaded),
            "load_average_1min": round(os.getloadavg()[0], 1),   # other programs running at the time
            "device": C.device_name(),
            "timestamp": stamp,
        }
        C.write_run(result)
        log(f"{run}: median {lat} ms, p10 {result['latency']['p10_ms']}, p90 {result['latency']['p90_ms']}")


def log_mlflow(run_name: str, spec: dict, params: dict, metrics: dict) -> None:
    """Also log to MLflow when it is installed (Colab, as in Lab 8). The JSON file stays the record."""
    try:
        import mlflow
    except ImportError:
        return
    mlflow.set_experiment(EXPERIMENT)
    with mlflow.start_run(run_name=run_name):
        mlflow.set_tags({"changed": spec["changed"]})
        mlflow.log_params({k: str(v) for k, v in params.items()})
        mlflow.log_metrics({k: v for k, v in metrics.items() if isinstance(v, (int, float)) and v is not None})


if __name__ == "__main__":
    main()
