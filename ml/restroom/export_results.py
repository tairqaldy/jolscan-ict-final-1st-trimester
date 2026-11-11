"""Build the restroom results table from the per-run files written by run.py.

Reads   ml/results/restroom/runs/R*.json        (one per run, committed by whoever ran it)
        ml/results/restroom/pipeline.json       (the two-step pipeline, written by pipeline.py): row R7
                                                and the `pipeline` block
        ml/results/restroom/layers.csv          (the layer sweep, written by layers_report.py): `layers`
        web/data/restroom-experiments.json, if it exists (its structure and placeholder rows are kept)
Writes  ml/results/restroom/experiments.csv       for the slides
        web/data/restroom-experiments.json        for the web app's model page
                                                  (RestroomExperimentsFile, docs/ARCHITECTURE.md 2b)

Usage, from the repository root:
    python ml/restroom/export_results.py

Only rows of runs that were actually run are replaced. Runs without a result file stay as
placeholder rows (isReal false, null metrics), and isMock stays true while any placeholder is left.
Runs listed in CUT were dropped from the plan and get no row at all.

Selection rule (fixed before the runs): the champion is the real run with the highest validation
matching accuracy; a tie goes to the higher gender accuracy (grouped 5-fold CV on the training
set), and a remaining tie to the earlier, simpler run. Test numbers are never used to choose.
R7, the pipeline, has no gender model, so its gender accuracy is null and it cannot win the tie-break:
the rule still names a fine-tuned run. The pipeline itself was chosen on 200 training episodes and
validation before its test score was read (pipeline.py); that choice is in the `pipeline` block.

`served` names the row whose method the app's /restroom/match runs. It is null today: the API ranks the
gallery by zero-shot CLIP similarity and filters by predicted gender, which is none of the rows exactly.
Set SERVED to "R7" in the pull request that makes the API run the pipeline (task C-8).
"""

from __future__ import annotations

import csv
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from run import RUNS  # noqa: E402

RUNS_DIR = Path("ml/results/restroom/runs")
PIPELINE = Path("ml/results/restroom/pipeline.json")
LAYERS = Path("ml/results/restroom/layers.csv")
CSV_OUT = Path("ml/results/restroom/experiments.csv")
JSON_OUT = Path("web/data/restroom-experiments.json")

REFERENCE = {
    "ioaiBaseline": 0.77,
    "ioaiBest": 0.90,
    "note": "Published by the IOAI 2025 committee for the Restroom Icon Matching task, top-1 matching "
            "accuracy on their test set (Leaderboard B). Not our runs.",
}
COMMENT = ("Schema: RestroomExperimentsFile in docs/ARCHITECTURE.md section 2b. Written by "
           "ml/restroom/export_results.py from ml/results/restroom/runs/*.json, pipeline.json (row R7 and "
           "`pipeline`) and layers.csv (`layers`). Rows with isReal false are placeholders with null metrics "
           "('not run yet'). `served` names the row the app's Match runs; null until the API runs the pipeline. "
           "`reference` holds the numbers published by the IOAI committee on their test set (Leaderboard B); "
           "they are not our runs.")
ROW_KEYS = ("run", "changed", "isReal", "matchTop1Val", "matchTop1Test", "genderAccCv", "latencyMs", "device")
# Runs dropped from the plan, with the reason (docs/TASKS.md). They get no row, real or placeholder.
CUT = {"R5": "cut (task C-4): first in the restroom cut order; the layer sweep (C-11) answers the "
              "number-of-layers question instead"}

PIPELINE_RUN = "R7"
PIPELINE_CHANGED = ("two-step pipeline, no training: SIFT and a pixel check find the crop's original, colour "
                    "histogram and zero-shot CLIP ViT-B/32 find its partner")
SERVED: str | None = None
SERVED_NOTE = ("The app's /restroom/match does not run the two-step pipeline yet: it ranks the gallery by "
               "zero-shot CLIP ViT-B/32 similarity and picks the most similar sign of the opposite predicted "
               "gender (0.47 on test, `gender_filter_zeroshot` in R1). `served` becomes \"R7\" when the API runs "
               "the pipeline (task C-8).")
LAYER_KEYS = {  # layers.csv column -> type
    "backbone": str, "n_trained": int, "trainable_params": int,
    "pair_top1_heldout_vs_all164": float, "pair_top1_heldout_vs_all164_std": float,
    "pair_top1_train": float, "gender_acc_heldout": float, "best": bool,
}


def placeholder(run: str, changed: str) -> dict:
    return {"run": run, "changed": changed, "isReal": False, "matchTop1Val": None, "matchTop1Test": None,
            "genderAccCv": None, "latencyMs": None, "device": None}


def real_rows() -> dict[str, dict]:
    rows = {}
    for path in sorted(RUNS_DIR.glob("R*.json")):
        r = json.loads(path.read_text())
        if r.get("smoke") or not r.get("isReal") or "-" in path.stem:
            continue
        m = r["metrics"]
        rows[r["run"]] = {
            "run": r["run"],
            "changed": r["changed"],
            "isReal": True,
            "matchTop1Val": m["val_match_top1"],
            "matchTop1Test": m["test_match_top1"],
            "genderAccCv": m["gender_acc_cv"],
            "latencyMs": m["latency_ms"],
            "device": r["device"],
        }
    return rows


def pipeline_row(p: dict) -> dict:
    """R7: the champion approach of pipeline.json. No gender model and no latency protocol, so both are null."""
    c = p["champion"]
    return {"run": PIPELINE_RUN, "changed": PIPELINE_CHANGED, "isReal": True,
            "matchTop1Val": p["val"][c], "matchTop1Test": p["test"][c], "genderAccCv": None,
            "latencyMs": None, "device": p["device"]}


def pipeline_block(p: dict) -> dict:
    """Every approach of pipeline.py, as the model page's pipeline card reads it (W-25)."""
    approaches = []
    for name, label in p["approaches"].items():
        tr = p["train_episodes"][name]["top1"]
        approaches.append({"name": name, "label": label, "val": p["val"][name], "test": p["test"][name],
                           "trainEpisodes": tr["mean"], "trainEpisodesStd": tr["std"]})
    return {"champion": p["champion"], "served": None, "selection": p["protocol"]["selection"],
            "trainEpisodesProtocol": p["protocol"]["train_episodes"], "approaches": approaches}


def layer_rows() -> list[dict]:
    """One row per backbone and number of trained blocks or stages, from layers.csv (mean over 3 seeds)."""
    with LAYERS.open(newline="") as f:
        rows = list(csv.DictReader(f))
    conv = {int: int, float: float, str: str, bool: lambda s: s.strip().lower() == "true"}
    return [{k: conv[t](r[k]) for k, t in LAYER_KEYS.items()} for r in rows]


def run_number(run: str) -> int:
    return int(run[1:]) if run[1:].isdigit() else 999


def pick_champion(rows: list[dict]) -> str | None:
    real = [r for r in rows if r["isReal"] and r["matchTop1Val"] is not None]
    if not real:
        return None
    key = lambda r: (r["matchTop1Val"], -1.0 if r["genderAccCv"] is None else r["genderAccCv"], -run_number(r["run"]))  # noqa: E731
    return max(real, key=key)["run"]


def main() -> None:
    real = real_rows()
    if not real:
        raise SystemExit(f"No run files in {RUNS_DIR}. Run at least R0 first: python ml/restroom/run.py --run R0")
    pipe = json.loads(PIPELINE.read_text()) if PIPELINE.exists() else None
    if pipe:
        real[PIPELINE_RUN] = pipeline_row(pipe)

    existing = json.loads(JSON_OUT.read_text()) if JSON_OUT.exists() else {}
    rows: list[dict] = []
    seen = set()
    # Keep the existing file's row order and placeholder rows; replace only rows that were run.
    for old in existing.get("runs", []):
        run = old["run"]
        seen.add(run)
        if run in CUT:
            continue
        rows.append(real[run] if run in real else {k: old.get(k) for k in ROW_KEYS} | {"isReal": False})
    for run in sorted(set(RUNS) | set(real), key=run_number):
        if run not in seen and run not in CUT:
            rows.append(real.get(run) or placeholder(run, RUNS[run]["changed"]))
    # A placeholder row must never carry numbers.
    for r in rows:
        if not r["isReal"]:
            r.update({k: None for k in ("matchTop1Val", "matchTop1Test", "genderAccCv", "latencyMs", "device")})

    payload = {}
    if "_comment" in existing:
        payload["_comment"] = COMMENT
    payload.update({
        "isMock": any(not r["isReal"] for r in rows),
        "champion": pick_champion(rows),
        "reference": existing.get("reference", REFERENCE),
        "runs": rows,
        "served": SERVED,
        "servedNote": SERVED_NOTE,
    })
    if pipe:
        payload["pipeline"] = pipeline_block(pipe)
    if LAYERS.exists():
        payload["layers"] = layer_rows()
    # Any other top-level keys the web lane added are kept as they are.
    for k, v in existing.items():
        payload.setdefault(k, v)

    JSON_OUT.parent.mkdir(parents=True, exist_ok=True)
    JSON_OUT.write_text(json.dumps(payload, indent=2, allow_nan=False) + "\n")

    CSV_OUT.parent.mkdir(parents=True, exist_ok=True)
    with CSV_OUT.open("w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(ROW_KEYS))
        w.writeheader()
        w.writerows(rows)

    done = [r["run"] for r in rows if r["isReal"]]
    todo = [r["run"] for r in rows if not r["isReal"]]
    print(f"Wrote {CSV_OUT} and {JSON_OUT}. Real runs: {done}. Placeholders: {todo or 'none'}. "
          f"isMock={payload['isMock']}. Champion by the validation rule: {payload['champion']}")


if __name__ == "__main__":
    main()
