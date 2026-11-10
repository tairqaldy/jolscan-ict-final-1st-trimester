# Not yet built (task S-8). Follows the Dockerfile pattern from Lecture 9.
# Build from the api/ folder, with the weights file present in api/weights/.
FROM python:3.11-slim

# OpenCV, which Ultralytics imports, needs these system libraries.
RUN apt-get update && apt-get install -y --no-install-recommends libgl1 libglib2.0-0 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# CPU-only PyTorch first, so the image does not pull several GB of GPU libraries.
RUN pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY main.py .
COPY weights/ weights/

ENV MODEL_WEIGHTS=weights/jolscan-e8.pt
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
