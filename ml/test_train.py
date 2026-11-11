import importlib.util
import json
import sys
import tempfile
import types
import unittest
from pathlib import Path
from unittest.mock import patch


def load_train_module():
    mlflow_stub = types.ModuleType("mlflow")
    torch_stub = types.ModuleType("torch")
    torch_stub.__version__ = "test"
    torch_stub.cuda = types.SimpleNamespace(is_available=lambda: False)
    ultralytics_stub = types.ModuleType("ultralytics")
    ultralytics_stub.__version__ = "test"
    ultralytics_stub.YOLO = object
    stubs = {
        "mlflow": mlflow_stub,
        "torch": torch_stub,
        "ultralytics": ultralytics_stub,
    }
    spec = importlib.util.spec_from_file_location("train_under_test", Path(__file__).with_name("train.py"))
    module = importlib.util.module_from_spec(spec)
    with patch.dict(sys.modules, stubs):
        spec.loader.exec_module(module)
    return module


class TrainEvaluationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.train = load_train_module()

    def test_smoke_evaluates_only_validation(self):
        calls = []
        box = types.SimpleNamespace(mp=0.1, mr=0.2, map50=0.3, map=0.4)

        class Model:
            def val(self, **kwargs):
                calls.append(kwargs)
                return types.SimpleNamespace(box=box)

        metrics = self.train.evaluate(Model(), "data.yaml", 640, include_test=False)

        self.assertEqual([call["split"] for call in calls], ["val", "val"])
        self.assertEqual(len(metrics), 6)
        self.assertFalse(any(key.startswith("test_") for key in metrics))

    def test_full_run_evaluates_validation_and_test(self):
        calls = []
        box = types.SimpleNamespace(mp=0.1, mr=0.2, map50=0.3, map=0.4)

        class Model:
            def val(self, **kwargs):
                calls.append(kwargs)
                return types.SimpleNamespace(box=box)

        metrics = self.train.evaluate(Model(), "data.yaml", 640, include_test=True)

        self.assertEqual([call["split"] for call in calls], ["val", "val", "test", "test"])
        self.assertEqual(len(metrics), 12)

    def test_smoke_dataset_yaml_removes_test_and_cleans_up(self):
        yaml_stub = types.ModuleType("yaml")
        yaml_stub.safe_load = lambda _source: {
            "train": "images/train",
            "val": "images/val",
            "test": "images/test",
            "names": {0: "pothole"},
        }
        yaml_stub.safe_dump = lambda data, target, sort_keys: json.dump(data, target)

        with tempfile.TemporaryDirectory() as directory:
            data_yaml = Path(directory) / "data.yaml"
            data_yaml.write_text("dataset config", encoding="utf-8")
            with patch.dict(sys.modules, {"yaml": yaml_stub}):
                with self.train.smoke_dataset_yaml(data_yaml) as smoke_yaml:
                    self.assertEqual(smoke_yaml.parent, data_yaml.parent)
                    config = json.loads(smoke_yaml.read_text(encoding="utf-8"))
                    self.assertEqual(config["train"], "images/train")
                    self.assertEqual(config["val"], "images/val")
                    self.assertNotIn("test", config)
                self.assertFalse(smoke_yaml.exists())


if __name__ == "__main__":
    unittest.main()
