"""JolScan model service: POST a photo, get pothole detections.

Starter code: checked against the FastAPI and Ultralytics documentation, but not yet run (task S-1).
The request and response shapes are fixed by docs/ARCHITECTURE.md section 2.

Run:
    uvicorn main:app --port 8000
"""

from __future__ import annotations

import io
import os
import time
import uuid
from pathlib import Path

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.concurrency import run_in_threadpool
from PIL import Image, ImageOps, UnidentifiedImageError
from ultralytics import YOLO

WEIGHTS = os.getenv("MODEL_WEIGHTS", "weights/jolscan-e8.pt")
MODEL_NAME = os.getenv("MODEL_NAME", Path(WEIGHTS).stem)
PROVIDER = os.getenv("PROVIDER_NAME", "local")  # set to "cloud" on the hosted copy
# Set ANY_CLASS=1 only to try the service with stock COCO weights before the team has its own.
ANY_CLASS = os.getenv("ANY_CLASS") == "1"
MAX_BYTES = 10 * 1024 * 1024
ALLOWED_FORMATS = {"JPEG", "PNG", "WEBP"}

app = FastAPI(title="JolScan model service")
model = YOLO(WEIGHTS)


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "model": MODEL_NAME, "device": str(model.device)}


@app.post("/predict")
async def predict(file: UploadFile = File(...), conf: float = Form(0.25)) -> dict:
    if not 0.0 < conf < 1.0:
        raise HTTPException(status_code=400, detail="conf must be between 0 and 1.")

    data = await file.read()
    if len(data) > MAX_BYTES:
        raise HTTPException(status_code=400, detail="The image is larger than 10 MB.")

    # The file type is checked from the bytes, not from the header the client sent.
    try:
        opened = Image.open(io.BytesIO(data))
        if opened.format not in ALLOWED_FORMATS:
            raise HTTPException(status_code=400, detail="Upload a JPEG, PNG or WebP image.")
        # Phone photos store rotation in EXIF. Apply it so width, height and boxes match what the user sees.
        image = ImageOps.exif_transpose(opened).convert("RGB")
    except (UnidentifiedImageError, OSError):
        raise HTTPException(status_code=400, detail="The file is not a readable image.") from None

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
