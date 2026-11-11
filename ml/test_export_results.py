"""Regression tests for validation-only selection and CSV export."""

import csv
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

import export_results as export


def row(name, score, recall):
    return {"run": name, "valMap50": score, "valRecallAtRulesConf": recall}


def test_tie_goes_to_recall():
    assert export.pick_champion([row("A", 0.80, 0.60), row("B", 0.795, 0.70)]) == "B"


def test_exact_tie_band_edge():
    assert export.pick_champion([row("A", 0.7512, 0.60), row("B", 0.7412, 0.70)]) == "B"


def test_outside_band_highest_map_wins():
    assert export.pick_champion([row("A", 0.80, 0.50), row("B", 0.78, 0.90)]) == "A"


def test_csv_quotes_commas(monkeypatch, tmp_path):
    runs = tmp_path / "runs"
    runs.mkdir()
    metrics = {key: 0.5 for key in (
        "test_precision", "test_recall", "test_map50", "test_map50_95",
        "test_precision_at_rules_conf", "test_recall_at_rules_conf", "val_map50", "val_recall_at_rules_conf",
    )}
    (runs / "E0.json").write_text(json.dumps({
        "run": "E0", "changed": 'best combination: yolo26s, "AdamW"', "metrics": metrics,
        "weights_mb": 5.0, "dataset_version": "potholes_yolo_v1",
    }), encoding="utf-8")
    manifest = tmp_path / "manifest.json"
    manifest.write_text(json.dumps({"image_counts": {"train": 1, "val": 1, "test": 1}}), encoding="utf-8")
    monkeypatch.setattr(export, "RUNS_DIR", runs)
    monkeypatch.setattr(export, "LATENCY_FILE", tmp_path / "latency.json")
    monkeypatch.setattr(export, "CSV_OUT", tmp_path / "results.csv")
    monkeypatch.setattr(export, "JSON_OUT", tmp_path / "results.json")
    monkeypatch.setattr(export, "MANIFEST", manifest)
    export.main()
    with export.CSV_OUT.open(newline="", encoding="utf-8") as stream:
        saved = list(csv.DictReader(stream))
    assert len(saved) == 1
    assert saved[0]["changed"] == 'best combination: yolo26s, "AdamW"'
    assert float(saved[0]["map50"]) == 0.5
    assert saved[0]["latencyMs"] == ""


class ChampionPolicyTests(unittest.TestCase):
    def test_ablation_can_win_without_e8_qualifier(self):
        rows = [
            {"run": "E0", "valMap50": 0.8, "valRecallAtRulesConf": 0.6},
            {"run": "E1", "valMap50": 0.805, "valRecallAtRulesConf": 0.5},
            {"run": "E2", "valMap50": 0.8, "valRecallAtRulesConf": 0.9},
            {"run": "E5", "valMap50": 0.8, "valRecallAtRulesConf": 0.7},
        ]
        self.assertEqual(export.pick_champion(rows), "E2")

    def test_smoke_flag_excludes_full_run_filename(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            # A smoke result has no test metrics and must be skipped before reading them.
            (root / "E1.json").write_text(json.dumps({"run": "E1", "smoke": True}))
            baseline = json.loads(Path("ml/results/runs/E0.json").read_text())
            (root / "E0.json").write_text(json.dumps(baseline))
            with patch.multiple(export, RUNS_DIR=root, CSV_OUT=root / "out.csv",
                                JSON_OUT=root / "out.json", LATENCY_FILE=root / "absent.json"):
                export.main()
            output = json.loads((root / "out.json").read_text())
            self.assertEqual(output["champion"], "E0")
            self.assertEqual([row["run"] for row in output["runs"]], ["E0"])

    def test_comma_in_changed_text_keeps_csv_columns(self):
        # E8's "changed" text contains a comma; the CSV must still read back with the right columns.
        import csv
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            baseline = json.loads(Path("ml/results/runs/E0.json").read_text())
            (root / "E0.json").write_text(json.dumps(baseline))
            (root / "E8.json").write_text(json.dumps({**baseline, "run": "E8", "changed": "no change qualified, E0 settings"}))
            with patch.multiple(export, RUNS_DIR=root, CSV_OUT=root / "out.csv",
                                JSON_OUT=root / "out.json", LATENCY_FILE=root / "absent.json"):
                export.main()
            rows = list(csv.DictReader((root / "out.csv").open()))
            self.assertEqual(rows[1]["changed"], "no change qualified, E0 settings")
            self.assertEqual(rows[1]["map50"], rows[0]["map50"])
            self.assertEqual(rows[1]["device"], rows[0]["device"])

    def test_only_smoke_has_clear_error(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "E1.json").write_text(json.dumps({"smoke": True}))
            with patch.object(export, "RUNS_DIR", root):
                with self.assertRaisesRegex(SystemExit, "No completed non-smoke"):
                    export.main()
