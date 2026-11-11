"""The public OpenAPI contract must describe each prediction endpoint."""

from fastapi.testclient import TestClient

import main


def test_prediction_response_schemas_are_published():
    client = TestClient(main.app)
    assert client.get("/docs").status_code == 200
    spec = client.get("/openapi.json").json()
    for path, model in {
        "/predict": "InferenceResult",
        "/restroom/compare": "CompareResult",
        "/restroom/match": "MatchResult",
    }.items():
        schema = spec["paths"][path]["post"]["responses"]["200"]["content"]["application/json"]["schema"]
        assert schema["$ref"] == f"#/components/schemas/{model}"
        assert spec["components"]["schemas"][model]["properties"]


def test_invalid_provider_fails_response_validation(monkeypatch):
    from fastapi.exceptions import ResponseValidationError
    import pytest
    from test_predict import Detector, png

    monkeypatch.setattr(main, "_yolo", Detector())
    monkeypatch.setattr(main, "PROVIDER", "unexpected")
    with pytest.raises(ResponseValidationError):
        TestClient(main.app).post("/predict", files={"file": ("image.png", png())})
