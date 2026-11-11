"""Image size and EXIF handling at both API upload endpoints."""

import io
from types import SimpleNamespace

import pytest
from fastapi.testclient import TestClient
from PIL import Image

import imaging
import main


def image_bytes(size, *, fmt="PNG", orientation=None):
    image = Image.new("RGB", size, "gray")
    buffer = io.BytesIO()
    options = {}
    if orientation is not None:
        exif = Image.Exif()
        exif[0x0112] = orientation
        options["exif"] = exif
    image.save(buffer, format=fmt, **options)
    return buffer.getvalue()


@pytest.mark.parametrize("endpoint", ["/predict", "/restroom/compare"])
@pytest.mark.parametrize("limit_kind", ["pixel_limit", "pillow_bomb"])
def test_oversized_dimensions_are_rejected_before_model_loading(monkeypatch, endpoint, limit_kind):
    if limit_kind == "pixel_limit":
        monkeypatch.setattr(imaging, "MAX_PIXELS", 5_000)
    else:
        monkeypatch.setattr(Image, "MAX_IMAGE_PIXELS", 1_000)

    def must_not_load():
        pytest.fail("The service must reject oversized images before loading the model")

    monkeypatch.setattr(main, "get_yolo", must_not_load)
    monkeypatch.setattr(main.restroom, "get_backend", must_not_load)
    img = image_bytes((100, 100))
    files = {"file": ("large.png", img, "image/png")} if endpoint == "/predict" else {
        "a": ("large.png", img, "image/png"), "b": ("large.png", img, "image/png")
    }
    response = TestClient(main.app).post(endpoint, files=files)
    assert response.status_code == 400
    assert "40 megapixels" in response.json()["detail"]


def test_exif_rotation_is_applied_before_prediction(monkeypatch):
    seen = []

    def predict(image, **_kwargs):
        seen.append(image.size)
        return [SimpleNamespace(boxes=[], names={})]

    monkeypatch.setattr(main, "_yolo", SimpleNamespace(predict=predict))
    image = image_bytes((40, 20), fmt="JPEG", orientation=6)
    response = TestClient(main.app).post("/predict", files={"file": ("rotated.jpg", image, "image/jpeg")})
    assert response.status_code == 200
    assert (response.json()["imageWidth"], response.json()["imageHeight"]) == (20, 40)
    assert seen == [(20, 40)]
