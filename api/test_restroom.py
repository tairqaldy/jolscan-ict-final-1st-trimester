"""Tests for the restroom endpoints and the lazy model loading. No model is downloaded:
the CLIP backend is replaced by a tiny fake encoder that works on the mean colour of an image.

Run from the repository root:
    pip install -r api/requirements-dev.txt
    pytest api/
"""

from __future__ import annotations

import io

import numpy as np
import pytest
from fastapi.testclient import TestClient
from PIL import Image

import main
import restroom


class FakeBackend:
    """Embedding = normalised mean colour. Gender: female when the image is more red than blue."""

    name = "fake-clip"
    device = "cpu"
    gender_head = "fake"

    def encode(self, images):
        rows = [np.asarray(im, dtype=np.float64).reshape(-1, 3).mean(0) / 255 + 0.01 for im in images]
        e = np.stack(rows)
        return e / np.linalg.norm(e, axis=1, keepdims=True)

    def gender_proba(self, emb):
        p_female = np.where(emb[:, 0] > emb[:, 2], 0.9, 0.2)
        return np.stack([1 - p_female, p_female], axis=1)


@pytest.fixture()
def client(monkeypatch):
    monkeypatch.setattr(restroom, "_backend", FakeBackend())
    return TestClient(main.app)


def image_bytes(color, fmt="PNG", size=(32, 48)) -> bytes:
    buf = io.BytesIO()
    Image.new("RGB", size, color).save(buf, format=fmt)
    return buf.getvalue()


RED, BLUE, PINK, NAVY = (220, 40, 40), (40, 40, 220), (230, 120, 160), (20, 30, 120)


def test_compare_shape(client):
    r = client.post("/restroom/compare", files={"a": ("a.png", image_bytes(BLUE)), "b": ("b.png", image_bytes(PINK))})
    assert r.status_code == 200, r.text
    body = r.json()
    assert set(body) == {"provider", "model", "latencyMs", "a", "b", "similarity"}
    assert body["model"] == "fake-clip"
    assert isinstance(body["latencyMs"], int)
    assert body["a"]["gender"] == "male" and body["b"]["gender"] == "female"
    for side in ("a", "b"):
        assert set(body[side]) == {"gender", "confidence"}
        assert 0.0 <= body[side]["confidence"] <= 1.0
    assert 0.0 <= body["similarity"] <= 1.0


def test_compare_identical_images_are_fully_similar(client):
    img = image_bytes(RED)
    r = client.post("/restroom/compare", files={"a": ("a.png", img), "b": ("b.png", img)})
    assert r.json()["similarity"] == pytest.approx(1.0, abs=1e-4)


@pytest.mark.parametrize("fmt", ["JPEG", "WEBP"])
def test_compare_accepts_jpeg_and_webp(client, fmt):
    r = client.post("/restroom/compare", files={"a": ("a", image_bytes(RED, fmt)), "b": ("b", image_bytes(BLUE, fmt))})
    assert r.status_code == 200, r.text


def test_compare_rejects_text_file(client):
    r = client.post("/restroom/compare", files={"a": ("a.png", image_bytes(RED)), "b": ("b.png", b"not an image")})
    assert r.status_code == 400
    assert r.json()["detail"] == "Sign b is not a readable image."


def test_compare_rejects_gif(client):
    gif = image_bytes(RED, "GIF")
    r = client.post("/restroom/compare", files={"a": ("a.gif", gif), "b": ("b.png", image_bytes(BLUE))})
    assert r.status_code == 400
    assert "JPEG, PNG or WebP" in r.json()["detail"]


def test_compare_rejects_file_over_10_mb(client):
    big = b"\x89PNG\r\n\x1a\n" + b"\0" * (10 * 1024 * 1024)
    r = client.post("/restroom/compare", files={"a": ("a.png", big), "b": ("b.png", image_bytes(BLUE))})
    assert r.status_code == 400
    assert "10 MB" in r.json()["detail"]


def test_compare_rejects_empty_file(client):
    r = client.post("/restroom/compare", files={"a": ("a.png", b""), "b": ("b.png", image_bytes(BLUE))})
    assert r.status_code == 400


def test_compare_missing_field(client):
    r = client.post("/restroom/compare", files={"a": ("a.png", image_bytes(RED))})
    assert r.status_code == 422  # FastAPI's answer for a missing form field, as on /predict


def test_match_shape_and_order(client):
    # Query is navy. Gallery: 0 blue (very similar), 1 red, 2 pink.
    gallery = [("gallery", (f"{i}.png", image_bytes(c))) for i, c in enumerate([BLUE, RED, PINK])]
    r = client.post("/restroom/match", files=[("query", ("q.png", image_bytes(NAVY))), *gallery])
    assert r.status_code == 200, r.text
    body = r.json()
    assert set(body) == {"provider", "model", "latencyMs", "query", "candidates", "bestMatchId", "ownId"}
    assert body["query"]["gender"] == "male"
    cands = body["candidates"]
    assert sorted(c["id"] for c in cands) == ["0", "1", "2"]
    sims = [c["similarity"] for c in cands]
    assert sims == sorted(sims, reverse=True)
    assert cands[0]["id"] == "0"
    for c in cands:
        assert set(c) == {"id", "similarity", "prediction"}
        assert set(c["prediction"]) == {"gender", "confidence"}


def texture(seed: int, tint, size=(240, 200)) -> Image.Image:
    """A smooth random texture in one colour family, so SIFT finds keypoints on it."""
    import cv2

    rng = np.random.default_rng(seed)
    g = cv2.GaussianBlur(rng.random((size[1], size[0])).astype(np.float32), (0, 0), 1.0)
    g = (g - g.min()) / (g.max() - g.min())
    rgb = np.stack([g * c + (1 - g) * 0.5 * c for c in tint], axis=-1)
    return Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8))


def png(img: Image.Image) -> bytes:
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def test_match_crop_finds_its_original_then_the_partner(client):
    own, partner = texture(1, (230, 80, 60)), texture(2, (225, 85, 65))   # one restroom: same colours
    others = [texture(3, (40, 90, 220)), texture(4, (60, 200, 90))]
    crop = own.crop((50, 40, 190, 170))
    gallery = [("gallery", (f"{i}.png", png(im))) for i, im in enumerate([others[0], own, others[1], partner])]
    r = client.post("/restroom/match", files=[("query", ("q.png", png(crop))), *gallery])
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["ownId"] == "1"
    assert body["bestMatchId"] == "3"


def test_match_whole_sign_not_in_gallery_takes_the_closest_colours(client):
    # A flat sign has no keypoints, so there is no own original; step 2 compares the query itself.
    gallery = [("gallery", (f"{i}.png", image_bytes(c))) for i, c in enumerate([BLUE, (225, 45, 45), (40, 200, 80)])]
    r = client.post("/restroom/match", files=[("query", ("q.png", image_bytes(RED))), *gallery])
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["ownId"] is None
    assert body["bestMatchId"] == "1"


def test_match_best_is_null_when_only_the_own_original_is_left(client):
    own = texture(5, (200, 120, 40))
    crop = own.crop((40, 30, 200, 170))
    r = client.post("/restroom/match", files=[("query", ("q.png", png(crop))), ("gallery", ("0.png", png(own)))])
    assert r.status_code == 200, r.text
    assert r.json()["ownId"] == "0"
    assert r.json()["bestMatchId"] is None


def test_match_rejects_more_than_60_gallery_files(client):
    img = image_bytes(RED, size=(4, 4))
    gallery = [("gallery", (f"{i}.png", img)) for i in range(61)]
    r = client.post("/restroom/match", files=[("query", ("q.png", img)), *gallery])
    assert r.status_code == 400
    assert "60" in r.json()["detail"]


def test_match_names_the_bad_gallery_file(client):
    gallery = [("gallery", ("0.png", image_bytes(RED))), ("gallery", ("1.txt", b"hello"))]
    r = client.post("/restroom/match", files=[("query", ("q.png", image_bytes(BLUE))), *gallery])
    assert r.status_code == 400
    assert r.json()["detail"] == "Gallery file 1 is not a readable image."


def test_match_requires_a_gallery(client):
    r = client.post("/restroom/match", files={"query": ("q.png", image_bytes(BLUE))})
    assert r.status_code == 422


def test_health_and_predict_without_yolo_weights(monkeypatch):
    """The service imports and answers /health with no weights file; /predict then says 503."""
    import sys
    from types import SimpleNamespace

    def missing_weights(_path):
        raise FileNotFoundError("test weights missing")

    # Never let a local Ultralytics installation attempt a weight download.
    monkeypatch.setitem(sys.modules, "ultralytics", SimpleNamespace(YOLO=missing_weights))
    monkeypatch.setattr(main, "WEIGHTS", "weights/does-not-exist.pt")
    monkeypatch.setattr(main, "_yolo", None)
    monkeypatch.setattr(restroom, "_backend", None)
    client = TestClient(main.app)
    h = client.get("/health").json()
    assert h["status"] == "ok"
    assert h["models"]["pothole"] == {"loaded": False, "weights": "weights/does-not-exist.pt", "weightsFileFound": False}
    assert h["models"]["restroom"]["loaded"] is False
    r = client.post("/predict", files={"file": ("p.png", image_bytes(RED))})
    assert r.status_code == 503
    assert "MODEL_WEIGHTS" in r.json()["detail"]


def test_predict_still_validates_before_loading(monkeypatch):
    monkeypatch.setattr(main, "_yolo", None)
    client = TestClient(main.app)
    r = client.post("/predict", files={"file": ("p.txt", b"nope")})
    assert r.status_code == 400
    r = client.post("/predict", files={"file": ("p.png", image_bytes(RED))}, data={"conf": "1.5"})
    assert r.status_code == 400
