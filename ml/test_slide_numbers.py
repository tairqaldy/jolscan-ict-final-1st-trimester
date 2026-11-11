"""Exercise real-data, placeholder and missing-source inventory behaviour."""

import json
import sys

import slide_numbers


def write(root, name, text):
    path = root / name
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")


def test_inventory_uses_sources_and_does_not_publish_placeholder_metrics(tmp_path):
    write(tmp_path, "data/exports/potholes_yolo_v1/split_manifest.json", json.dumps({"image_counts": {"train": 2}, "object_counts": {"train": 4}}))
    write(tmp_path, "ml/results/experiments.csv", "run,map50,recall,latencyMs\nE0,0.8765,0.5,\n")
    write(tmp_path, "web/data/experiments.json", json.dumps({"isMock": False, "champion": "E0"}))
    write(tmp_path, "ml/results/restroom/experiments.csv", "run,changed,isReal,matchTop1Val,matchTop1Test,genderAccCv,latencyMs,device\nR0,real,True,0.8,0.7,,,CPU\nR9,placeholder,False,0.9,0.9,,,\n")
    result = slide_numbers.render(tmp_path, "abc123", "2026-11-11T00:00:00+00:00")
    assert "E0 map50 | 0.8765 | 0.877" in result
    assert "Validation champion | E0 | E0" in result
    assert "R9 matchTop1Val | not available yet" in result
    assert "R0 matchTop1Test | 0.7 | 0.700" in result
    assert "ml/results/experiments.csv → E0.map50" in result
    assert "Road confidence intervals | not available yet" in result


def test_mock_champion_is_not_presented_as_real(tmp_path):
    write(tmp_path, "web/data/experiments.json", json.dumps({"isMock": True, "champion": "E8"}))
    report = slide_numbers.render(tmp_path, "abc", "time")
    assert "Validation champion | not available yet" in report


def test_check_does_not_write_file(tmp_path, monkeypatch, capsys):
    monkeypatch.setattr(slide_numbers, "ROOT", tmp_path)
    monkeypatch.setattr(sys, "argv", ["slide_numbers.py", "--check"])
    assert slide_numbers.main() == 0
    assert "not available yet" in capsys.readouterr().out
    assert not (tmp_path / "ml/results/SLIDE-NUMBERS.md").exists()


def test_corrupt_source_is_an_error(tmp_path, monkeypatch, capsys):
    write(tmp_path, "web/data/experiments.json", "not-json")
    monkeypatch.setattr(slide_numbers, "ROOT", tmp_path)
    monkeypatch.setattr(sys, "argv", ["slide_numbers.py", "--check"])
    assert slide_numbers.main() == 1
    assert "Could not read source data" in capsys.readouterr().out
