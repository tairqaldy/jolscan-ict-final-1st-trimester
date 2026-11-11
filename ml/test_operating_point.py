"""Tests for the greedy box matching in ml/operating_point.py (no model or data needed)."""
import importlib.util
import tempfile
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location("operating_point", Path(__file__).with_name("operating_point.py"))
op = importlib.util.module_from_spec(spec)
spec.loader.exec_module(op)

A = [0.1, 0.1, 0.3, 0.3]
B = [0.6, 0.6, 0.8, 0.8]


class MatchTest(unittest.TestCase):
    def test_iou(self):
        self.assertAlmostEqual(op.iou(A, A), 1.0, places=6)
        self.assertEqual(op.iou(A, B), 0.0)
        # Half overlap along x: intersection 0.02, union 0.06.
        self.assertAlmostEqual(op.iou(A, [0.2, 0.1, 0.4, 0.3]), 1 / 3, places=6)

    def test_each_label_matched_once(self):
        # Two predictions on the same pothole: one true positive, one false alarm.
        self.assertEqual(op.match([(0.9, A), (0.5, A)], [A], 0.5), {"tp": 1, "fp": 1, "fn": 0})

    def test_low_overlap_is_false_alarm_and_miss(self):
        self.assertEqual(op.match([(0.9, [0.2, 0.1, 0.4, 0.3])], [A], 0.5), {"tp": 0, "fp": 1, "fn": 1})

    def test_no_predictions(self):
        self.assertEqual(op.match([], [A, B], 0.5), {"tp": 0, "fp": 0, "fn": 2})

    def test_summary(self):
        s = op.summarise(178, 34, 58)
        self.assertEqual((s["precision"], s["recall"]), (round(178 / 212, 4), round(178 / 236, 4)))

    def test_read_labels(self):
        with tempfile.TemporaryDirectory() as d:
            f = Path(d) / "x.txt"
            f.write_text("0 0.5 0.5 0.2 0.4\n\n")
            self.assertEqual(op.read_labels(f), [[0.4, 0.3, 0.6, 0.7]])


if __name__ == "__main__":
    unittest.main()
