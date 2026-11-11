"""Readiness and opt-in startup warm-up, with no model weights or network."""

from types import SimpleNamespace

from fastapi import HTTPException
from fastapi.testclient import TestClient

import main
import restroom
from test_restroom import FakeBackend


def test_ready_reports_each_model_even_when_pothole_fails(monkeypatch):
    def missing():
        raise HTTPException(status_code=503, detail="missing pothole weights")

    monkeypatch.setattr(main, "get_yolo", missing)
    monkeypatch.setattr(main, "_yolo", None)
    monkeypatch.setattr(restroom, "_backend", FakeBackend())
    with TestClient(main.app) as client:
        response = client.get("/ready")
        assert response.status_code == 503
        assert response.json() == {"ready": False, "models": {
            "pothole": {"ready": False, "detail": "missing pothole weights"},
            "restroom": {"ready": True},
        }}
        health = client.get("/health").json()
        assert health["status"] == "ok" and health["ready"] is False


def test_ready_and_health_when_models_loaded(monkeypatch):
    monkeypatch.setattr(main, "_yolo", SimpleNamespace(device="cpu"))
    monkeypatch.setattr(restroom, "_backend", FakeBackend())
    with TestClient(main.app) as client:
        response = client.get("/ready")
        assert response.status_code == 200
        assert response.json() == {"ready": True, "models": {
            "pothole": {"ready": True}, "restroom": {"ready": True},
        }}
        assert client.get("/health").json()["ready"] is True


def test_ready_reports_restroom_failure_without_hiding_pothole(monkeypatch):
    def missing():
        raise HTTPException(status_code=503, detail="missing restroom weights")

    monkeypatch.setattr(main, "_yolo", SimpleNamespace(device="cpu"))
    monkeypatch.setattr(restroom, "_backend", None)
    monkeypatch.setattr(restroom, "get_backend", missing)
    response = TestClient(main.app).get("/ready")
    assert response.status_code == 503
    assert response.json()["models"] == {
        "pothole": {"ready": True},
        "restroom": {"ready": False, "detail": "missing restroom weights"},
    }


def test_default_start_is_lazy(monkeypatch):
    monkeypatch.delenv("WARMUP", raising=False)
    monkeypatch.setattr(main, "_yolo", None)
    monkeypatch.setattr(restroom, "_backend", None)
    with TestClient(main.app) as client:
        assert client.get("/health").json()["ready"] is False
        assert main._yolo is None and restroom._backend is None


def test_opt_in_warmup_attempts_both_even_if_one_fails(monkeypatch):
    calls = []

    def fail():
        calls.append("pothole")
        raise RuntimeError("model missing")

    monkeypatch.setenv("WARMUP", "1")
    monkeypatch.setattr(main, "_warm_pothole", fail)
    monkeypatch.setattr(main, "_warm_restroom", lambda: calls.append("restroom"))
    with TestClient(main.app) as client:
        assert client.get("/health").status_code == 200
    assert calls == ["pothole", "restroom"]


def test_opt_in_warmup_runs_prediction_for_each_backend(monkeypatch):
    calls = []

    class RoadModel:
        def predict(self, image, conf, verbose):
            calls.append(("road", image.size, conf))

    class SignsModel:
        def encode(self, images):
            calls.append(("sign", images[0].size))
            return "embedding"

        def gender_proba(self, embeddings):
            calls.append(("gender", embeddings))

    monkeypatch.setenv("WARMUP", "1")
    monkeypatch.setattr(main, "get_yolo", lambda: RoadModel())
    monkeypatch.setattr(restroom, "get_backend", lambda: SignsModel())
    with TestClient(main.app):
        pass
    assert calls == [("road", (640, 640), 0.25), ("sign", (224, 224)), ("gender", "embedding")]
