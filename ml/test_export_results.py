"""Offline regression checks for M-0 champion eligibility; no model execution."""
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from ml import export_results as export


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

    def test_only_smoke_has_clear_error(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "E1.json").write_text(json.dumps({"smoke": True}))
            with patch.object(export, "RUNS_DIR", root):
                with self.assertRaisesRegex(SystemExit, "No completed non-smoke"):
                    export.main()


if __name__ == "__main__":
    unittest.main()
