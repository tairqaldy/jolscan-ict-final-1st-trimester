"""Regression tests for results validation and tracked-file checks."""

import subprocess
import tempfile
import unittest
from pathlib import Path

from check_results import MAX_BYTES, validate_restroom, validate_road, validate_tracked


class ResultsChecks(unittest.TestCase):
    def setUp(self):
        self.road = {"isMock": False, "champion": "E0", "runs": [{
            "run": "E0", "changed": "baseline", "precision": 0.5, "recall": 0.5,
            "map50": 0.5, "map50_95": 0.5, "precisionAtRulesConf": 0.5,
            "recallAtRulesConf": 0.5, "valMap50": 0.5, "valRecallAtRulesConf": 0.5,
            "latencyMs": None, "sizeMb": 5, "datasetVersion": "potholes_yolo_v1",
        }]}
        self.signs = {"isMock": False, "champion": "R0", "reference": {"ioaiBaseline": 0.77, "ioaiBest": 0.9}, "runs": [{
            "run": "R0", "changed": "baseline", "isReal": True, "matchTop1Val": 0.5,
            "matchTop1Test": 0.5, "genderAccCv": 0.5, "latencyMs": 10, "device": "cpu",
        }]}

    def test_valid_and_additional_fields(self):
        self.road["runs"][0]["extra"] = "allowed"
        self.assertEqual(validate_road(self.road), [])
        self.assertEqual(validate_restroom(self.signs), [])

    def test_invalid_metric_and_champion(self):
        self.road["runs"][0]["map50"] = 1.5
        self.assertTrue(validate_road(self.road))
        self.signs["runs"][0]["matchTop1Test"] = 1.5
        self.assertTrue(validate_restroom(self.signs))
        self.road["runs"][0]["map50"] = 0.5
        self.road["champion"] = "E9"
        self.assertTrue(validate_road(self.road))

    def test_placeholder_must_not_contain_metrics(self):
        self.signs["champion"] = None
        self.signs["isMock"] = True
        self.signs["runs"][0]["isReal"] = False
        self.assertTrue(validate_restroom(self.signs))
        for key in ("matchTop1Val", "matchTop1Test", "genderAccCv", "latencyMs"):
            self.signs["runs"][0][key] = None
        self.assertEqual(validate_restroom(self.signs), [])

    def test_mock_roads_only_require_top_level_keys(self):
        self.assertEqual(validate_road({"isMock": True, "champion": None, "runs": [{}]}), [])
        self.assertTrue(validate_road({"isMock": True, "runs": []}))

    def test_tracked_weight_and_large_file(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            subprocess.run(["git", "init", "-q"], cwd=root, check=True)
            (root / "model.pt").write_bytes(b"")
            (root / "large.bin").write_bytes(b"x" * (MAX_BYTES + 1))
            subprocess.run(["git", "add", "-f", "model.pt", "large.bin"], cwd=root, check=True)
            errors = validate_tracked(root)
            self.assertTrue(any("model.pt" in e for e in errors))
            self.assertTrue(any("large.bin" in e for e in errors))


if __name__ == "__main__":
    unittest.main()
