"""Validate published experiment results and tracked-file hygiene without dependencies."""

from __future__ import annotations

import json
import math
import subprocess
from pathlib import Path

from export_results import pick_champion

ROOT = Path(__file__).resolve().parent.parent
ROAD_METRICS = ("precision", "recall", "map50", "map50_95", "precisionAtRulesConf", "recallAtRulesConf", "valMap50", "valRecallAtRulesConf")
SIGN_METRICS = ("matchTop1Val", "matchTop1Test", "genderAccCv")
FORBIDDEN = {".pt", ".onnx", ".zip", ".npz", ".npy", ".db", ".pkl", ".safetensors"}
MAX_BYTES = 3 * 1024 * 1024


def number(value):
    return isinstance(value, (int, float)) and not isinstance(value, bool) and math.isfinite(value)


def validate_road(data):
    errors = []
    if not isinstance(data, dict) or not all(k in data for k in ("isMock", "champion", "runs")):
        return ["roads: missing top-level keys"]
    if not isinstance(data["isMock"], bool):
        return ["roads: isMock must be a boolean"]
    if data["isMock"]:
        return []
    rows = data["runs"]
    if not isinstance(rows, list) or not rows:
        return ["roads: runs must be a non-empty list"]
    required = {"run", "changed", "latencyMs", "sizeMb", "datasetVersion", *ROAD_METRICS}
    for i, row in enumerate(rows):
        label = f"roads: runs[{i}]"
        if not isinstance(row, dict) or not required <= row.keys():
            errors.append(f"{label}: missing required fields")
            continue
        if not isinstance(row["run"], str) or not isinstance(row["changed"], str):
            errors.append(f"{label}: run and changed must be strings")
        for key in ROAD_METRICS:
            if not number(row[key]) or not 0 <= row[key] <= 1:
                errors.append(f"{label}.{key}: expected a number in [0, 1]")
        if row["latencyMs"] is not None and (not number(row["latencyMs"]) or row["latencyMs"] <= 0):
            errors.append(f"{label}.latencyMs: expected null or a positive number")
        if not number(row["sizeMb"]) or row["sizeMb"] <= 0:
            errors.append(f"{label}.sizeMb: expected a positive number")
        if row["datasetVersion"] != "potholes_yolo_v1":
            errors.append(f"{label}.datasetVersion: expected potholes_yolo_v1")
    if not errors and data["champion"] != pick_champion(rows):
        errors.append("roads: champion does not match the validation selection rule")
    return errors


def validate_restroom(data):
    errors = []
    if not isinstance(data, dict) or not all(k in data for k in ("isMock", "champion", "reference", "runs")):
        return ["restroom: missing top-level keys"]
    ref = data["reference"]
    if not isinstance(ref, dict) or ref.get("ioaiBaseline") != 0.77 or ref.get("ioaiBest") != 0.9:
        errors.append("restroom: IOAI reference values must be 0.77 and 0.9")
    rows = data["runs"]
    if not isinstance(rows, list):
        return errors + ["restroom: runs must be a list"]
    flags, real_ids = [], set()
    for i, row in enumerate(rows):
        label = f"restroom: runs[{i}]"
        required = {"run", "changed", "isReal", "latencyMs", "device", *SIGN_METRICS}
        if not isinstance(row, dict) or not required <= row.keys():
            errors.append(f"{label}: missing required fields")
            continue
        if not isinstance(row["isReal"], bool) or not isinstance(row["run"], str) or not isinstance(row["changed"], str):
            errors.append(f"{label}: invalid run, changed or isReal")
            continue
        flags.append(row["isReal"])
        if row["isReal"]:
            real_ids.add(row["run"])
        for key in (*SIGN_METRICS, "latencyMs"):
            value = row[key]
            if not row["isReal"] and value is not None:
                errors.append(f"{label}.{key}: placeholder metrics must be null")
            elif value is not None and (not number(value) or (not 0 <= value <= 1 if key != "latencyMs" else value <= 0)):
                errors.append(f"{label}.{key}: invalid metric")
    if not isinstance(data["isMock"], bool) or data["isMock"] != any(not flag for flag in flags):
        errors.append("restroom: isMock must match the presence of placeholder runs")
    if data["champion"] is not None and data["champion"] not in real_ids:
        errors.append("restroom: champion must identify a real run or be null")
    return errors


def validate_tracked(root):
    result = subprocess.run(["git", "ls-files", "-z"], cwd=root, capture_output=True, check=True)
    errors = []
    for raw in result.stdout.split(b"\0"):
        if not raw:
            continue
        path = Path(raw.decode("utf-8", errors="surrogateescape"))
        if path.suffix.lower() in FORBIDDEN:
            errors.append(f"tracked forbidden file: {path}")
        full = root / path
        if full.exists() and full.stat().st_size > MAX_BYTES:
            errors.append(f"tracked file exceeds 3 MiB: {path}")
    return errors


def main():
    errors = []
    for rel, validator in (("web/data/experiments.json", validate_road), ("web/data/restroom-experiments.json", validate_restroom)):
        try:
            data = json.loads((ROOT / rel).read_text(encoding="utf-8"))
            found = validator(data)
            errors.extend(found)
            if not found:
                print(f"OK: {rel}")
        except (OSError, ValueError, TypeError) as exc:
            errors.append(f"{rel}: {exc}")
    try:
        found = validate_tracked(ROOT)
        errors.extend(found)
        if not found:
            print("OK: tracked-file hygiene")
    except (OSError, subprocess.CalledProcessError) as exc:
        errors.append(f"cannot inspect tracked files: {exc}")
    for error in errors:
        print(f"ERROR: {error}")
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
