"""Qarau model service: POST a road photo for pothole detections; restroom-sign endpoints in restroom.py.

The request and response shapes are fixed by docs/ARCHITECTURE.md sections 2 and 2b.
Both models are loaded on the first request that needs them, so the service starts even when
the YOLO weights file is missing (then /predict answers 503 and /restroom/* still works).
The /predict path was checked against the FastAPI and Ultralytics documentation but has not yet
been run with real weights (task S-1). The restroom endpoints were run on 10 November 2026.

Run:
    uvicorn main:app --port 8000
"""

from __future__ import annotations

import logging
import os
import threading
import time
import uuid
from pathlib import Path

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.concurrency import run_in_threadpool

import restroom
from imaging import read_image

WEIGHTS = os.getenv("MODEL_WEIGHTS", "weights/jolscan-e8.pt")
MODEL_NAME = os.getenv("MODEL_NAME", Path(WEIGHTS).stem)
PROVIDER = os.getenv("PROVIDER_NAME", "local")  # set to "cloud" on the hosted copy
# Set ANY_CLASS=1 only to try the service with stock COCO weights before the team has its own.
ANY_CLASS = os.getenv("ANY_CLASS") == "1"

log = logging.getLogger("qarau")
app = FastAPI(title="Qarau model service")
app.include_router(restroom.router)

_yolo = None
_yolo_lock = threading.Lock()


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


@app.get("/health")
def health() -> dict:
    return {
        "status": "ok",
        "model": MODEL_NAME,
        "device": str(_yolo.device) if _yolo is not None else "not loaded",
        "models": {
            "pothole": {"loaded": _yolo is not None, "weights": WEIGHTS, "weightsFileFound": Path(WEIGHTS).exists()},
            "restroom": restroom.status(),
        },
    }


@app.post("/predict")
async def predict(file: UploadFile = File(...), conf: float = Form(0.25)) -> dict:
    if not 0.0 < conf < 1.0:
        raise HTTPException(status_code=400, detail="conf must be between 0 and 1.")

    image = await read_image(file)
    model = await run_in_threadpool(get_yolo)

    start = time.perf_counter()
    # Inference is blocking, so it runs in a worker thread and /health stays responsive.
    results = await run_in_threadpool(model.predict, image, conf=conf, verbose=False)
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

    return {
        "provider": PROVIDER,
        "model": MODEL_NAME,
        "imageWidth": image.width,
        "imageHeight": image.height,
        "latencyMs": latency_ms,
        "detections": detections,
    }
