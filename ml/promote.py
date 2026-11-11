"""Compare candidate and champion on validation data only; never read test_* keys."""

from __future__ import annotations

import argparse
import json
import math
from pathlib import Path

from export_results import pick_champion


def validate_run(run: dict, label: str) -> list[str]:
    errors = []
    if not isinstance(run, dict):
        return [f"{label}: expected an object"]
    if run.get("smoke") is not False:
        errors.append(f"{label}: smoke must be explicitly false")
    if not isinstance(run.get("run"), str) or not run["run"]:
        errors.append(f"{label}: missing run name")
    if not isinstance(run.get("dataset_version"), str) or not run["dataset_version"]:
        errors.append(f"{label}: missing dataset version")
    params = run.get("params")
    if not isinstance(params, dict):
        errors.append(f"{label}: missing parameters")
    else:
        for key in ("seed", "epochs", "imgsz"):
            value = params.get(key)
            if type(value) is not int or value < (0 if key == "seed" else 1):
                errors.append(f"{label}: invalid {key}")
    metrics = run.get("metrics")
    if not isinstance(metrics, dict):
        errors.append(f"{label}: missing validation metrics")
    else:
        for key in ("val_map50", "val_recall_at_rules_conf"):
            value = metrics.get(key)
            if isinstance(value, bool) or not isinstance(value, (float, int)) or not math.isfinite(value) or not 0 <= value <= 1:
                errors.append(f"{label}: invalid {key}")
    return errors


def decide(candidate: dict, champion: dict) -> tuple[bool, list[str]]:
    errors = validate_run(candidate, "candidate") + validate_run(champion, "champion")
    if errors:
        return False, errors
    if candidate["run"] == champion["run"]:
        return False, ["candidate and champion must have different run names"]
    if candidate["dataset_version"] != champion["dataset_version"]:
        errors.append("dataset versions differ")
    for key in ("seed", "epochs"):
        if candidate["params"][key] != champion["params"][key]:
            errors.append(f"{key} differs")
    warnings = []
    if candidate["params"]["imgsz"] != champion["params"]["imgsz"]:
        declarations = " ".join(str(r.get("changed", "")) for r in (candidate, champion)).lower()
        if any(term in declarations for term in ("resolution", "imgsz", "image size", "input size")):
            warnings.append("image size differs as a declared experimental change; compare costs too")
        else:
            errors.append("image size differs without a declared resolution change")
    if errors:
        return False, errors
    rows = [{"run": r["run"], "valMap50": r["metrics"]["val_map50"],
             "valRecallAtRulesConf": r["metrics"]["val_recall_at_rules_conf"]}
            for r in (champion, candidate)]
    selected = pick_champion(rows)
    details = warnings + [f"{r['run']}: validation mAP50={r['valMap50']}, recall@0.40={r['valRecallAtRulesConf']}" for r in rows]
    return selected == candidate["run"], details


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--candidate", required=True, type=Path)
    parser.add_argument("--champion", required=True, type=Path)
    args = parser.parse_args()
    try:
        candidate = json.loads(args.candidate.read_text(encoding="utf-8"))
        champion = json.loads(args.champion.read_text(encoding="utf-8"))
        promote, details = decide(candidate, champion)
    except (OSError, ValueError) as exc:
        print(f"KEEP: cannot read run file: {exc}")
        return 1
    name = (candidate if promote else champion).get("run", "current champion") if isinstance(champion, dict) else "current champion"
    print(f"{'PROMOTE' if promote else 'KEEP'} {name}")
    for detail in details:
        print(f"- {detail}")
    return 0 if promote else 1


if __name__ == "__main__":
    raise SystemExit(main())
