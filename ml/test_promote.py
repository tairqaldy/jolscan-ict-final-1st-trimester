"""Promotion decisions use validation data and reject incomparable runs."""

import json
import subprocess
import sys
from pathlib import Path

import pytest

SCRIPT = Path(__file__).with_name("promote.py")


def run(name="E0", score=0.8, recall=0.6):
    return {"run": name, "smoke": False, "dataset_version": "potholes_yolo_v1",
            "changed": "baseline", "params": {"seed": 42, "epochs": 40, "imgsz": 640},
            "metrics": {"val_map50": score, "val_recall_at_rules_conf": recall}}


def call(tmp_path, candidate, champion):
    candidate_path, champion_path = tmp_path / "candidate.json", tmp_path / "champion.json"
    candidate_path.write_text(json.dumps(candidate), encoding="utf-8")
    champion_path.write_text(json.dumps(champion), encoding="utf-8")
    return subprocess.run([sys.executable, str(SCRIPT), "--candidate", str(candidate_path),
                           "--champion", str(champion_path)], text=True, capture_output=True)


def test_better_candidate_is_promoted_without_test_metrics(tmp_path):
    result = call(tmp_path, run("E1", 0.85, 0.6), run())
    assert result.returncode == 0
    assert "PROMOTE E1" in result.stdout
    assert "validation mAP50=0.85" in result.stdout


def test_tie_with_lower_recall_keeps_champion_even_if_test_better(tmp_path):
    candidate, champion = run("E1", 0.805, 0.5), run()
    candidate["metrics"]["test_map50"] = 1.0
    champion["metrics"]["test_map50"] = 0.0
    result = call(tmp_path, candidate, champion)
    assert result.returncode == 1
    assert "KEEP E0" in result.stdout


@pytest.mark.parametrize("change, message", [
    (lambda r: r.update(dataset_version="other"), "dataset versions differ"),
    (lambda r: r.update(smoke=True), "smoke"),
    (lambda r: r["params"].update(seed=1), "seed differs"),
    (lambda r: r["params"].update(epochs=10), "epochs differs"),
    (lambda r: r["params"].update(imgsz=960), "without a declared"),
    (lambda r: r["metrics"].update(val_map50=None), "invalid val_map50"),
])
def test_refuses_invalid_or_incomparable_candidate(tmp_path, change, message):
    candidate = run("E1", 0.9)
    change(candidate)
    result = call(tmp_path, candidate, run())
    assert result.returncode == 1
    assert "KEEP E0" in result.stdout
    assert message in result.stdout


def test_declared_resolution_change_is_warned(tmp_path):
    candidate = run("E6", 0.9)
    candidate["changed"] = "input resolution 960"
    candidate["params"]["imgsz"] = 960
    result = call(tmp_path, candidate, run())
    assert result.returncode == 0
    assert "PROMOTE E6" in result.stdout
    assert "image size differs" in result.stdout
