# Not yet built (task S-8). Follows the Dockerfile pattern from Lecture 9.
# Build from the api/ folder, with the weights file present in api/weights/.
FROM python:3.12-slim

# OpenCV, which Ultralytics imports, needs these system libraries.
RUN apt-get update && apt-get install -y --no-install-recommends libgl1 libglib2.0-0 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# CPU-only PyTorch first, so the image does not pull several GB of GPU libraries.
# Same versions as ml/restroom/requirements.txt.
RUN pip install --no-cache-dir torch==2.15.0 torchvision==0.29.2 --index-url https://download.pytorch.org/whl/cpu

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY main.py restroom.py imaging.py ./

# The CLIP weights for the restroom endpoints are fetched at build time, so the first restroom
# request does not wait for a 600 MB download. The model itself is still loaded on first use.
# HF_HOME inside /app, so the cache is found whichever user the container runs as.
ENV HF_HOME=/app/hf-cache
RUN python -c "import open_clip; open_clip.create_model_and_transforms('ViT-B-32', pretrained='openai', force_quick_gelu=True)"
COPY weights/ weights/

ENV MODEL_WEIGHTS=weights/jolscan-e8.pt
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
