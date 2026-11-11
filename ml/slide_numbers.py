"""Collect source-backed experiment values for slides; absent results stay unavailable."""

from __future__ import annotations

import argparse
import csv
import json
import subprocess
import sys
from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
UNAVAILABLE = "not available yet"


def load_json(root: Path, name: str):
    path = root / name
    if not path.exists():
        return None
    return json.loads(path.read_text(encoding="utf-8"))


def load_csv(root: Path, name: str):
    path = root / name
    if not path.exists():
        return None
    with path.open(encoding="utf-8", newline="") as source:
        return list(csv.DictReader(source))


def get(data, *keys):
    for key in keys:
        if not isinstance(data, dict) or key not in data:
            return None
        data = data[key]
    return data


def safe(value):
    if value is None or value == "":
        return UNAVAILABLE
    if isinstance(value, (list, dict)):
        return json.dumps(value, ensure_ascii=False, sort_keys=True)
    return str(value).replace("\n", " ").replace("|", "\\|")


def rounded(value):
    if value is None or value == "" or isinstance(value, bool):
        return UNAVAILABLE if value is None or value == "" else safe(value)
    try:
        number = Decimal(str(value))
        if not number.is_finite():
            return UNAVAILABLE
        return str(number.quantize(Decimal("0.001"), rounding=ROUND_HALF_UP))
    except (InvalidOperation, ValueError):
        return safe(value)


def collect(root: Path):
    tables = {"5–6 · Roads": [], "7–8 · Restrooms": []}

    def add(section, name, value, source):
        tables[section].append((name, safe(value), rounded(value), source))

    def add_tree(section, name, value, source):
        if isinstance(value, dict) and value:
            for key, child in value.items():
                add_tree(section, f"{name} {key}", child, f"{source}.{key}")
        elif isinstance(value, list) and value:
            for i, child in enumerate(value):
                add_tree(section, f"{name} [{i}]", child, f"{source}[{i}]")
        else:
            add(section, name, value, source)

    roads, signs = "5–6 · Roads", "7–8 · Restrooms"
    manifest_path = "data/exports/potholes_yolo_v1/split_manifest.json"
    manifest = load_json(root, manifest_path)
    for key in ("image_counts", "object_counts"):
        for split in ("train", "val", "test"):
            add(roads, f"{key} {split}", get(manifest, key, split), f"{manifest_path} → {key}.{split}")

    road_csv = "ml/results/experiments.csv"
    rows = load_csv(root, road_csv)
    if rows is None or not rows:
        add(roads, "Road runs", None, road_csv)
    else:
        for row in rows:
            for key in ("valMap50", "valRecallAtRulesConf", "map50", "map50_95", "precision", "recall", "precisionAtRulesConf", "recallAtRulesConf", "latencyMs", "sizeMb"):
                add(roads, f"{row.get('run', '?')} {key}", row.get(key), f"{road_csv} → {row.get('run', '?')}.{key}")
    road_web = "web/data/experiments.json"
    road_data = load_json(root, road_web)
    add(roads, "Validation champion", get(road_data, "champion") if get(road_data, "isMock") is False else None, f"{road_web} → champion (non-mock)")
    op_path = "ml/results/operating_point.json"
    op = load_json(root, op_path)
    for key in ("run", "conf", "tp", "fp", "fn", "precision", "recall", "f1"):
        add(roads, f"Operating point {key}", get(op, key), f"{op_path} → {key}")
    for path, title in (("ml/results/bootstrap_ci_E8_test.json", "Road confidence intervals"),
                        ("ml/results/box_size_kmeans.json", "Requested size-band artifact")):
        obj = load_json(root, path)
        add_tree(roads, title, obj, path)
    area_path = "ml/results/pothole_area_clusters.json"
    areas = load_json(root, area_path)
    thresholds = get(areas, "area_thresholds")
    for i in range(2):
        value = thresholds[i] if isinstance(thresholds, list) and len(thresholds) > i else None
        add(roads, f"Size boundary {i + 1} (fraction of image)", value, f"{area_path} → area_thresholds[{i}]")

    sign_csv = "ml/results/restroom/experiments.csv"
    sign_rows = load_csv(root, sign_csv)
    if sign_rows is None or not sign_rows:
        add(signs, "Restroom runs", None, sign_csv)
    else:
        for row in sign_rows:
            is_real = str(row.get("isReal", "")).lower() == "true"
            for key in ("changed", "isReal", "matchTop1Val", "matchTop1Test", "genderAccCv", "latencyMs", "device"):
                value = row.get(key) if is_real or key in ("changed", "isReal", "device") else None
                add(signs, f"{row.get('run', '?')} {key}", value, f"{sign_csv} → {row.get('run', '?')}.{key}")
    sign_web = "web/data/restroom-experiments.json"
    sign_data = load_json(root, sign_web)
    for key in ("ioaiBaseline", "ioaiBest"):
        add(signs, f"IOAI published {key} (not our run)", get(sign_data, "reference", key), f"{sign_web} → reference.{key}")
    pipeline_path = "ml/results/restroom/pipeline.json"
    pipeline = load_json(root, pipeline_path)
    champion = get(pipeline, "champion")
    add(signs, "Pipeline champion", champion, f"{pipeline_path} → champion")
    for split in ("val", "test"):
        add(signs, f"Pipeline champion {split}", get(pipeline, split, champion), f"{pipeline_path} → {split}.<champion>")
    add(signs, "Pipeline champion train episodes top-1 mean", get(pipeline, "train_episodes", champion, "top1", "mean"), f"{pipeline_path} → train_episodes.<champion>.top1.mean")
    pair_path = "ml/results/restroom/pair_separation.json"
    pair = load_json(root, pair_path)
    add(signs, "Pairwise male-door ranking accuracy (original images)", get(pair, "zero_shot", "orig", "pairwise", "accuracy_men_door_has_higher_p_male"), f"{pair_path} → zero_shot.orig.pairwise.accuracy_men_door_has_higher_p_male")
    sweep = get(pair, "zero_shot", "orig", "pairwise", "sweep")
    threshold_row = next((item for item in (sweep or []) if item.get("margin") == 0.2), {}) if isinstance(sweep, list) else {}
    add(signs, "Original pairs passing margin 0.20", threshold_row.get("real_pairs_pass"), f"{pair_path} → zero_shot.orig.pairwise.sweep[margin=0.20].real_pairs_pass")
    intervals_path = "ml/results/restroom/intervals.json"
    add_tree(signs, "Restroom confidence intervals", load_json(root, intervals_path), intervals_path)
    return tables


def render(root: Path, revision: str, generated: str) -> str:
    lines = ["# Slide numbers: source inventory", "", f"Generated (UTC): {generated}",
             f"Git HEAD at generation: `{revision}` (working-tree changes, if any, are not captured by the hash).",
             "", "Values are read from files, not necessarily used in the final slides. Missing values are marked explicitly. Re-run after updates and verify the final deck.", ""]
    for title, rows in collect(root).items():
        lines += [f"## {title}", "", "| Quantity | Source value | Rounded (3 decimals) | Source |", "| --- | --- | --- | --- |"]
        for name, value, approx, source in rows:
            lines.append(f"| {name} | {value} | {approx} | `{source}` |")
        lines.append("")
    return "\n".join(lines).rstrip() + "\n"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="print the inventory without writing a file")
    args = parser.parse_args()
    try:
        revision = subprocess.run(["git", "rev-parse", "--short", "HEAD"], cwd=ROOT, check=True, capture_output=True, text=True).stdout.strip()
    except (OSError, subprocess.CalledProcessError):
        revision = "unavailable"
    try:
        output = render(ROOT, revision, datetime.now(timezone.utc).isoformat(timespec="seconds"))
    except (OSError, ValueError, csv.Error) as exc:
        print(f"Could not read source data: {exc}")
        return 1
    if args.check:
        if hasattr(sys.stdout, "reconfigure"):
            sys.stdout.reconfigure(encoding="utf-8")
        print(output, end="")
    else:
        path = ROOT / "ml/results/SLIDE-NUMBERS.md"
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(output, encoding="utf-8")
        print(f"Wrote {path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
