"""Qarau model service: POST a road photo for pothole detections; restroom-sign endpoints in restroom.py.

The request and response shapes are fixed by docs/ARCHITECTURE.md sections 2 and 2b.
Both models are loaded on the first request that needs them, so the service starts even when
the YOLO weights file is missing (then /predict answers 503 and /restroom/* still works).
The /predict path was verified with stock yolo26n weights on Windows on 10 November 2026
(task S-1; see README.md). The restroom endpoints were run on 10 November 2026.

Run:
    uvicorn main:app --port 8000
"""

from __future__ import annotations

import csv
import logging
import os
import threading
import time
import uuid
from datetime import datetime, timezone
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.concurrency import run_in_threadpool
from fastapi.responses import JSONResponse
from PIL import Image

import restroom
from imaging import read_image
from schemas import InferenceResult

# Default: the champion by the selection rule (championModelName in web/data/experiments.json).
WEIGHTS = os.getenv("MODEL_WEIGHTS", "weights/jolscan-e1.pt")
MODEL_NAME = os.getenv("MODEL_NAME", Path(WEIGHTS).stem)
PROVIDER = os.getenv("PROVIDER_NAME", "local")  # set to "cloud" on the hosted copy
# Set ANY_CLASS=1 only to try the service with stock COCO weights before the team has its own.
ANY_CLASS = os.getenv("ANY_CLASS") == "1"

log = logging.getLogger("qarau")


def _warm_pothole():
    get_yolo().predict(Image.new("RGB", (640, 640)), conf=0.25, verbose=False)


def _warm_restroom():
    backend = restroom.get_backend()
    embeddings = backend.encode([Image.new("RGB", (224, 224))])
    backend.gender_proba(embeddings)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    if os.getenv("WARMUP") == "1":
        for name, warm in (("pothole", _warm_pothole), ("restroom", _warm_restroom)):
            try:
                await run_in_threadpool(warm)
            except Exception:
                # Keep liveness available even when a model cannot be warmed.
                log.exception("Could not warm %s model", name)
    yield


app = FastAPI(title="Qarau model service", lifespan=lifespan)
app.include_router(restroom.router)

_yolo = None
_yolo_lock = threading.Lock()
_yolo_inference_lock = threading.Lock()
_predict_log_lock = threading.Lock()


def _log_prediction(latency_ms: int, detections: list[dict]) -> None:
    """Append aggregate prediction metadata; never record uploaded images or names."""
    path = Path(os.environ["PREDICT_LOG_PATH"])
    confidences = [item["confidence"] for item in detections]
    with _predict_log_lock:
        path.parent.mkdir(parents=True, exist_ok=True)
        needs_header = not path.exists() or path.stat().st_size == 0
        with path.open("a", newline="", encoding="utf-8") as output:
            writer = csv.writer(output)
            if needs_header:
                writer.writerow(["timeUtc", "latencyMs", "detectionCount", "meanConfidence", "model", "provider"])
            writer.writerow([
                datetime.now(timezone.utc).isoformat(), latency_ms, len(detections),
                round(sum(confidences) / len(confidences), 4) if confidences else "",
                MODEL_NAME, PROVIDER,
            ])


def get_yolo():
    """Load the YOLO weights once, on the first /predict. HTTP 503 if they cannot be loaded."""
    global _yolo
    if _yolo is None:
        with _yolo_lock:
            if _yolo is None:
                try:
                    from ultralytics import YOLO

                    # A bare stock name such as "yolo26n.pt" is downloaded by Ultralytics itself.
                    _yolo = YOLO(WEIGHTS)
                except Exception as exc:  # missing file, missing package, corrupt weights
                    log.exception("Pothole model failed to load")
                    raise HTTPException(
                        status_code=503,
                        detail=f"The pothole model could not be loaded from {WEIGHTS}: {exc}. Set MODEL_WEIGHTS.",
                    ) from None
    return _yolo


def _predict_locked(model, image, conf):
    """Serialize calls on the shared model inside a worker, not the event loop."""
    with _yolo_inference_lock:
        return model.predict(image, conf=conf, verbose=False)


@app.get("/health")
def health() -> dict:
    restroom_info = restroom.status()
    return {
        "status": "ok",
        "ready": _yolo is not None and restroom_info["loaded"],
        "model": MODEL_NAME,
        "device": str(_yolo.device) if _yolo is not None else "not loaded",
        "models": {
            "pothole": {"loaded": _yolo is not None, "weights": WEIGHTS, "weightsFileFound": Path(WEIGHTS).exists()},
            "restroom": restroom_info,
        },
    }


@app.get("/ready")
async def ready() -> JSONResponse:
    """Load both model backends and report whether each could be loaded."""
    models = {}
    for name, loader in (("pothole", get_yolo), ("restroom", restroom.get_backend)):
        try:
            await run_in_threadpool(loader)
            models[name] = {"ready": True}
        except HTTPException as exc:
            models[name] = {"ready": False, "detail": exc.detail}
        except Exception:
            log.exception("Unexpected failure loading %s model", name)
            models[name] = {"ready": False, "detail": "Model loading failed; check server logs."}
    ok = all(model["ready"] for model in models.values())
    return JSONResponse(status_code=200 if ok else 503, content={"ready": ok, "models": models})


@app.post("/predict", response_model=InferenceResult)
async def predict(file: UploadFile = File(...), conf: float = Form(0.25)) -> dict:
    if not 0.0 < conf < 1.0:
        raise HTTPException(status_code=400, detail="conf must be between 0 and 1.")

    image = await read_image(file)
    model = await run_in_threadpool(get_yolo)

    start = time.perf_counter()
    # Inference is blocking, so it runs in a worker thread and /health stays responsive.
    results = await run_in_threadpool(_predict_locked, model, image, conf)
    latency_ms = round((time.perf_counter() - start) * 1000)
    result = results[0]

    detections = []
    for box in result.boxes:
        name = str(result.names[int(box.cls[0])]).lower()
        if name != "pothole" and not ANY_CLASS:
            continue
        x1, y1, x2, y2 = box.xyxyn[0].tolist()  # normalised corners
        detections.append({
            "id": uuid.uuid4().hex[:8],
            "label": "pothole",
            "confidence": round(float(box.conf[0]), 4),
            "box": {"x": round(x1, 5), "y": round(y1, 5), "w": round(x2 - x1, 5), "h": round(y2 - y1, 5)},
        })

    if os.getenv("PREDICT_LOG_PATH"):
        try:
            await run_in_threadpool(_log_prediction, latency_ms, detections)
        except OSError:
            log.warning("Could not write prediction log", exc_info=True)

    return {
        "provider": PROVIDER,
        "model": MODEL_NAME,
        "imageWidth": image.width,
        "imageHeight": image.height,
        "latencyMs": latency_ms,
        "detections": detections,
    }
