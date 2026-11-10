# api/

The model service. It turns a photo into detections and nothing else. Severity rules are applied by the web app, so every provider is scored the same way. The contract is in [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md), section 2.

The code was checked against the FastAPI, Ultralytics and Gradio documentation but has not been run yet (tasks S-1, S-5, S-8). Whoever runs it first fixes what breaks and commits the fix.

## Run locally

Use Python 3.11 in a virtual environment. The install is large because it includes PyTorch.

```bash
cd api && python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements-dev.txt
```

To try the service before the team has weights, use the stock model, which downloads itself. It knows COCO classes, not potholes, so `ANY_CLASS=1` lets its boxes through. This only proves the service works.

```bash
ANY_CLASS=1 MODEL_WEIGHTS=yolo26n.pt uvicorn main:app --port 8000
```

With the team's weights at `api/weights/jolscan-e8.pt` (from the shared Drive, or any `jolscan-<run>.pt` through `MODEL_WEIGHTS`):

```bash
uvicorn main:app --port 8000
```

Check it:

```bash
curl http://localhost:8000/health
```

```bash
curl -F "file=@photo.jpg" -F "conf=0.25" http://localhost:8000/predict
```

Then pick the `local` provider in the web app's Settings.

## Two thresholds

- `conf` on `/predict` (default 0.25) is how low the model service reports boxes.
- The rules' counting threshold τ (default 0.40) lives in the web app. Boxes between the two are shown as "needs review".

## Gradio demo

```bash
python gradio_app.py
```

## Hosting (tasks S-6, S-7)

- Web app's cloud provider: a Hugging Face **Docker** Space built from this folder. In the Space's README front matter set `sdk: docker` and `app_port: 8000`. It then answers `/health` and `/predict` exactly like the local service. Set `PROVIDER_NAME=cloud` in the Space settings.
- Gradio demo: a separate Hugging Face **Gradio** Space with `app_file: gradio_app.py`. If it fails on `libGL.so.1`, add a `packages.txt` containing `libgl1`.
- Public Spaces only ever receive images from the public dataset, screened in task D-12.

## Notes

- Weights are never committed. `api/weights/` is in `.gitignore`.
- Stop the server with Ctrl+C when you are done. It holds a few hundred MB of memory.
- If port 8000 is taken, pass another `--port` and set `MODEL_API_URL` in `web/.env.local` to match.
