"""Gradio demo for the Qarau pothole detector: the course-standard model interface (Lecture 9).

Starter code, not yet run (task S-5). Needs requirements-dev.txt.

Run locally:
    python gradio_app.py
Deploy: see the Hosting section of api/README.md.
Use only screened public dataset images in a public demo.
"""

from __future__ import annotations

import os

import gradio as gr
import pandas as pd
from ultralytics import YOLO

WEIGHTS = os.getenv("MODEL_WEIGHTS", "weights/jolscan-e1.pt")
model = YOLO(WEIGHTS)


def detect(image, conf):
    if image is None:
        return None, pd.DataFrame()
    result = model.predict(image, conf=conf, verbose=False)[0]
    annotated = result.plot()[..., ::-1]  # BGR to RGB
    rows = []
    for i, box in enumerate(result.boxes, start=1):
        x1, y1, x2, y2 = box.xyxyn[0].tolist()
        rows.append({
            "#": i,
            "confidence": round(float(box.conf[0]), 3),
            "area % of image": round((x2 - x1) * (y2 - y1) * 100, 2),
        })
    return annotated, pd.DataFrame(rows)


demo = gr.Interface(
    fn=detect,
    inputs=[gr.Image(type="pil", label="Road photo"), gr.Slider(0.05, 0.95, value=0.25, step=0.05, label="Confidence threshold")],
    outputs=[gr.Image(label="Detections"), gr.Dataframe(label="Potholes found")],
    title="Qarau pothole detector",
    description="Fine-tuned YOLO detector. ICT1103 group project. Do not upload photos with faces or licence plates.",
    flagging_mode="never",
)

if __name__ == "__main__":
    demo.launch()
