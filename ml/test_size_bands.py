"""Checks on synthetic labels; the real training data must be verified separately."""

import json
import subprocess
import sys
from pathlib import Path

import pytest

SCRIPT = Path(__file__).with_name("size_bands.py")


def test_reproducible_train_only_outputs(tmp_path):
    labels = tmp_path / "labels" / "train"
    labels.mkdir(parents=True)
    for i, width in enumerate((0.02, 0.025, 0.1, 0.11, 0.4, 0.5)):
        (labels / f"{i}.txt").write_text(f"0 0.5 0.5 {width} {width}\n")
    out = tmp_path / "output"
    args = [sys.executable, str(SCRIPT), "--labels", str(labels), "--out", str(out)]
    subprocess.run(args, check=True, capture_output=True, text=True)
    first = json.loads((out / "pothole_area_clusters.json").read_text())
    subprocess.run(args, check=True, capture_output=True, text=True)
    assert json.loads((out / "pothole_area_clusters.json").read_text()) == first
    assert first["images"] == 6 and first["boxes"] == 6 and first["split"] == "train"
    assert sum(first["group_counts"].values()) == 6
    assert (out / "figs" / "pothole_area_clusters.png").is_file()


def test_test_split_is_rejected(tmp_path):
    labels = tmp_path / "test"
    labels.mkdir()
    result = subprocess.run([sys.executable, str(SCRIPT), "--labels", str(labels), "--out", str(tmp_path / "out")], capture_output=True, text=True)
    assert result.returncode != 0
    assert "training labels" in result.stderr


def test_invalid_dimensions_are_rejected(tmp_path):
    from size_bands import read_areas

    labels = tmp_path / "train"
    labels.mkdir()
    (labels / "bad.txt").write_text("0 0.5 0.5 0 0.3\n")
    with pytest.raises(ValueError, match="invalid normalized"):
        read_areas(labels)
