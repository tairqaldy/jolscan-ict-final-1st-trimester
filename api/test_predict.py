"""Road API contract checks; no weights or network access required."""

import io
from types import SimpleNamespace

import numpy as np
import pytest
from fastapi.testclient import TestClient
from PIL import Image

import main


def png():
    output = io.BytesIO()
    Image.new("RGB", (80, 40), "gray").save(output, format="PNG")
    return output.getvalue()


class Detector:
    device = "cpu"

    def predict(self, image, conf, verbose):
        assert image.size == (80, 40)
        assert conf == 0.25
        return [SimpleNamespace(
            names={0: "pothole", 1: "car"},
            boxes=[SimpleNamespace(
                cls=[label], conf=[0.875], xyxyn=np.array([[0.1, 0.2, 0.6, 0.8]])
            ) for label in (0, 1)],
        )]


@pytest.fixture
def client(monkeypatch):
    monkeypatch.setattr(main, "_yolo", Detector())
    monkeypatch.setattr(main, "ANY_CLASS", False)
    return TestClient(main.app)


def test_predict_contract_and_class_filter(client):
    response = client.post("/predict", files={"file": ("image.png", png())})
    assert response.status_code == 200
    body = response.json()
    assert set(body) == {"provider", "model", "imageWidth", "imageHeight", "latencyMs", "detections"}
    assert (body["imageWidth"], body["imageHeight"]) == (80, 40)
    assert body["provider"] == main.PROVIDER
    assert body["model"] == main.MODEL_NAME
    assert isinstance(body["latencyMs"], int) and body["latencyMs"] >= 0
    assert len(body["detections"]) == 1
    detection = body["detections"][0]
    assert detection["id"]
    assert detection["label"] == "pothole"
    assert detection["confidence"] == 0.875
    assert detection["box"] == {"x": 0.1, "y": 0.2, "w": 0.5, "h": 0.6}


def test_stock_model_mode_keeps_other_classes(client, monkeypatch):
    monkeypatch.setattr(main, "ANY_CLASS", True)
    response = client.post("/predict", files={"file": ("image.png", png())})
    assert len(response.json()["detections"]) == 2


@pytest.mark.parametrize("content, expected_detail", [
    (b"", "empty"),
    (b"not an image", "not a readable image"),
    (b"x" * (10 * 1024 * 1024 + 1), "10 MB"),
])
def test_invalid_upload_is_rejected_before_model_loading(client, monkeypatch, content, expected_detail):
    def must_not_load():
        pytest.fail("Invalid uploads must not load the model")
    monkeypatch.setattr(main, "get_yolo", must_not_load)
    response = client.post("/predict", files={"file": ("fake.png", content, "image/png")})
    assert response.status_code == 400
    assert expected_detail in response.json()["detail"]


@pytest.mark.parametrize("conf", ["0", "1", "-0.1", "1.1", "nan", "inf"])
def test_invalid_confidence(client, conf):
    response = client.post("/predict", data={"conf": conf}, files={"file": ("image.png", png())})
    assert response.status_code == 400


def test_missing_upload(client):
    assert client.post("/predict").status_code == 422


def test_health_does_not_load_model(client, monkeypatch):
    monkeypatch.setattr(main, "_yolo", None)
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["models"]["pothole"]["loaded"] is False
    assert main._yolo is None


def test_unavailable_weights_returns_503(client, monkeypatch):
    import sys

    def unavailable(_):
        raise FileNotFoundError("test weights missing")
    monkeypatch.setitem(sys.modules, "ultralytics", SimpleNamespace(YOLO=unavailable))
    monkeypatch.setattr(main, "_yolo", None)
    response = client.post("/predict", files={"file": ("image.png", png())})
    assert response.status_code == 503
    assert "MODEL_WEIGHTS" in response.json()["detail"]
    assert main._yolo is None
