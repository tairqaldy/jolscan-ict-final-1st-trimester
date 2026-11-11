"""Concurrent requests share a backend without overlapping its inference."""

import io
import threading
import time
from concurrent.futures import ThreadPoolExecutor
from types import SimpleNamespace

from fastapi.testclient import TestClient
from PIL import Image

import main
import restroom
from test_restroom import FakeBackend


def image_bytes():
    buf = io.BytesIO()
    Image.new("RGB", (32, 32), (200, 50, 50)).save(buf, format="PNG")
    return buf.getvalue()


class ConcurrentCounter:
    def __init__(self):
        self.lock = threading.Lock()
        self.active = 0
        self.maximum = 0
        self.started = threading.Event()
        self.release = threading.Event()

    def enter(self):
        with self.lock:
            self.active += 1
            self.maximum = max(self.maximum, self.active)
        self.started.set()
        self.release.wait(timeout=5)
        time.sleep(0.03)

    def leave(self):
        with self.lock:
            self.active -= 1


def test_shared_yolo_is_serialized_and_health_stays_available(monkeypatch):
    counter = ConcurrentCounter()

    def predict(_image, **_kwargs):
        counter.enter()
        try:
            return [SimpleNamespace(boxes=[], names={})]
        finally:
            counter.leave()

    monkeypatch.setattr(main, "_yolo", SimpleNamespace(predict=predict, device="cpu"))
    client = TestClient(main.app)
    img = image_bytes()
    barrier = threading.Barrier(6)
    def request():
        barrier.wait(timeout=5)
        return client.post("/predict", files={"file": ("road.png", img, "image/png")})
    with ThreadPoolExecutor(max_workers=7) as pool:
        requests = [pool.submit(request) for _ in range(6)]
        try:
            assert counter.started.wait(timeout=5)
            # /health must respond while the first model call is still blocked.
            assert pool.submit(client.get, "/health").result(timeout=2).status_code == 200
        finally:
            counter.release.set()
        assert all(f.result(timeout=10).status_code == 200 for f in requests)
    assert counter.maximum == 1


def test_shared_restroom_backend_is_serialized(monkeypatch):
    counter = ConcurrentCounter()

    class SlowBackend(FakeBackend):
        def encode(self, images):
            counter.enter()
            return super().encode(images)

        def gender_proba(self, emb):
            try:
                return super().gender_proba(emb)
            finally:
                counter.leave()

    monkeypatch.setattr(restroom, "_backend", SlowBackend())
    client = TestClient(main.app)
    img = image_bytes()
    barrier = threading.Barrier(6)
    def compare():
        barrier.wait(timeout=5)
        return client.post("/restroom/compare", files={"a": ("a.png", img), "b": ("b.png", img)})
    with ThreadPoolExecutor(max_workers=6) as pool:
        requests = [pool.submit(compare) for _ in range(6)]
        try:
            assert counter.started.wait(timeout=5)
        finally:
            counter.release.set()
        assert all(f.result(timeout=10).status_code == 200 for f in requests)
    assert counter.maximum == 1
