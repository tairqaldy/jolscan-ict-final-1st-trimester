"""Check a running API using real inference, without uploading a personal photo.

Start the service first, then run: python smoke.py --url http://127.0.0.1:8000
The generated blank PNG checks serving only, not pothole accuracy.
"""

import argparse
import io
import json
import urllib.error
import urllib.request

from PIL import Image


def request(url, data=None, headers=None):
    req = urllib.request.Request(url, data=data, headers=headers or {})
    try:
        with urllib.request.urlopen(req, timeout=180) as response:
            return json.load(response)
    except urllib.error.HTTPError as exc:
        raise RuntimeError(f"HTTP {exc.code}: {exc.read().decode('utf-8', errors='replace')}") from exc


def run(base_url):
    base_url = base_url.rstrip("/")
    before = request(base_url + "/health")
    assert before["status"] == "ok", before
    buffer = io.BytesIO()
    Image.new("RGB", (320, 240), "gray").save(buffer, format="PNG")
    boundary = "qarau-smoke-boundary"
    body = (
        f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="smoke.png"\r\n'
        'Content-Type: image/png\r\n\r\n'
    ).encode() + buffer.getvalue() + f"\r\n--{boundary}--\r\n".encode()
    prediction = request(base_url + "/predict", body, {"Content-Type": f"multipart/form-data; boundary={boundary}"})
    assert set(prediction) == {"provider", "model", "imageWidth", "imageHeight", "latencyMs", "detections"}, prediction
    assert prediction["imageWidth"] == 320 and prediction["imageHeight"] == 240, prediction
    assert isinstance(prediction["latencyMs"], int) and prediction["latencyMs"] >= 0, prediction
    assert isinstance(prediction["detections"], list), prediction
    for detection in prediction["detections"]:
        assert detection["id"] and detection["label"] == "pothole", detection
        assert 0 <= detection["confidence"] <= 1, detection
        assert all(0 <= detection["box"][key] <= 1 for key in ("x", "y", "w", "h")), detection
    after = request(base_url + "/health")
    assert after["models"]["pothole"]["loaded"] is True, after
    print(json.dumps({"healthBefore": before, "prediction": prediction, "healthAfter": after}, indent=2))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--url", default="http://127.0.0.1:8000")
    run(parser.parse_args().url)
