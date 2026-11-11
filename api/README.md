# api/

The model service. It turns a road photo into pothole detections, and restroom door signs into gender predictions and a similarity score. Nothing else: the severity rules and the signage rules are applied by the web app, so every provider is scored the same way. The contract is in [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md), sections 2 and 2b.

Both models are loaded on the first request that needs them, not at start-up. The service starts even without the YOLO weights file: `/predict` then answers 503 with a message, and the restroom endpoints still work. `/health` shows which models are loaded.

The FastAPI service was run with real stock YOLO weights on Windows for S-1; see the verification record below. Gradio and Docker still need their own runtime checks (S-5, S-8).

## Run locally

Use Python 3.12 in a virtual environment (S-1 was verified with Python 3.12.10). The install is large because it includes PyTorch. Direct dependencies are pinned; NumPy 2.5.4 requires Python 3.12 or newer. See [decision 0008](../docs/decisions/0008-api-python-312.md) for the version choice and its verification limits.

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

### Windows (PowerShell)

From the repository root, create an isolated environment. Activation is optional; using the
environment's Python directly also works when PowerShell blocks activation scripts:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r api/requirements-dev.txt
cd api
$env:ANY_CLASS = "1"
$env:MODEL_WEIGHTS = "yolo26n.pt"
..\.venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000
```

In a second PowerShell window, from the repository root:

```powershell
.\.venv\Scripts\python.exe api/smoke.py
.\.venv\Scripts\python.exe -m pytest api/ -q
```

`smoke.py` checks `/health`, sends a generated 320×240 PNG through `/predict`, checks the
response contract, and confirms that YOLO is loaded afterwards. The first prediction downloads
the stock weights and can take longer. A blank image normally produces no detections: this is
a serving check, not an accuracy evaluation. The offline unit tests also exercise non-empty
boxes, class filtering, invalid uploads and missing weights.

Stock COCO weights do **not** detect potholes. `ANY_CLASS=1` is only for this serving check;
the contract still labels these boxes as `pothole`. Before using team weights, stop the service,
set `MODEL_WEIGHTS` to their file, remove `ANY_CLASS` (`Remove-Item Env:ANY_CLASS` in PowerShell),
and restart. Do not present stock-model detections as project results.

## Model readiness and optional warm-up (S-20)

- `GET /health` is a fast liveness check. `status: ok` means the process answers;
  `ready` is true only if both model backends are already loaded. It does not load models.
- `GET /ready` attempts to load both backends in worker threads and returns 200 only when
  both load, or 503 with a per-model failure detail. The first request can download weights
  and take a long time; offline use requires cached weights. Loading checks initialization,
  not the accuracy of predictions or a complete end-to-end inference check.
- Set `WARMUP=1` before starting Uvicorn to load both models and run a blank-image prediction
  for each at startup. A warm-up failure is logged and does not stop the service. Check the
  logs and `/ready`, then run an actual demo image before presenting. Defaults stay lazy.

```powershell
$env:WARMUP = "1"
..\.venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000
# In a second terminal: Invoke-RestMethod http://127.0.0.1:8000/ready
```

## Restroom endpoints

Code in `restroom.py`, shared upload checks in `imaging.py`. The model is OpenAI CLIP through `open_clip_torch` (ViT-B/32 by default, about 600 MB, downloaded on first use into the Hugging Face cache). The first restroom request takes a few seconds longer while it loads.

```bash
curl -F "a=@men.png" -F "b=@women.png" http://localhost:8000/restroom/compare
```

```bash
curl -F "query=@query.png" -F "gallery=@g1.png" -F "gallery=@g2.png" -F "gallery=@g3.png" http://localhost:8000/restroom/match
```

- `compare` returns the predicted gender and its confidence for both signs, and their similarity, `(cos + 1) / 2` of the CLIP embeddings.
- `match` returns the query's prediction and every gallery image as a candidate with id `"0"`, `"1"`, ... in upload order, sorted by similarity. `bestMatchId` is the most similar candidate whose predicted gender is the opposite of the query's, or `null`.
- Validation is the same as `/predict`: JPEG, PNG or WebP, at most 10 MB and 40 megapixels per file, at most 60 gallery files. A missing field gives FastAPI's 422.

Configuration:

| Variable | Default | Meaning |
|---|---|---|
| `RESTROOM_MODEL` | `ViT-B-32` | open_clip architecture with OpenAI weights, e.g. `ViT-B-16` |
| `RESTROOM_WEIGHTS` | none | Fine-tuned checkpoint from `ml/restroom/run.py`, the pair model, e.g. `weights/R4-pair.pt` |
| `RESTROOM_PROBE` | none | Gender probe from `run.py --run R6`, e.g. `weights/restroom-probe-vit-b-32.npz`. Without it, zero-shot text prompts decide the gender. The probe must have been fitted on the same model and weights, or the model refuses to load |
| `RESTROOM_MODEL_NAME` | derived | Name echoed in responses, e.g. `clip-vitb32-zs` or `clip-vitb32-ft6` |

Measured on the IOAI data (ml/restroom/README.md): gender predictions from one sign are right about three times in four, so `bestMatchId` from the gender filter is often wrong. Treat it as a hint. The similarity score is the stronger signal.

## Tests

```bash
pip install -r requirements-dev.txt && cd .. && pytest api/
```

The tests replace CLIP with a tiny fake encoder, so they download nothing and do not need the YOLO weights.

## Concurrent inference (S-30)

The API shares one YOLO model and one CLIP backend per process. Each model's inference
uses its own lock inside a worker thread; road and restroom inference can run in parallel
with each other, but requests for the same backend wait their turn. The response latency
includes any time waiting for that model lock. `/health` does not take these locks.

Locks are process-local: separate Uvicorn workers have separate model instances and locks.
Serializing reduces concurrency; it is a stability choice, not an inference speed-up.
See [Ultralytics thread-safe inference guidance](https://docs.ultralytics.com/guides/yolo-thread-safe-inference/).

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
- Stop the server with Ctrl+C when you are done. It holds a few hundred MB of memory, about 1 GB once CLIP is loaded.
- If port 8000 is taken, pass another `--port` and set `MODEL_API_URL` in `web/.env.local` to match.


### S-1 verification, 10 November 2026

- Windows, Python 3.12.10, Ultralytics 8.4.208, PyTorch 2.15.0, CPU.
- Installed `requirements-dev.txt` in an isolated `.venv`.
- Started Uvicorn on `127.0.0.1:8000` with `ANY_CLASS=1 MODEL_WEIGHTS=yolo26n.pt`.
- `GET /health`: HTTP 200 before inference, model not loaded.
- `POST /predict`: HTTP 200 using `smoke.py`'s generated 320x240 PNG, model `yolo26n`,
  provider `local`, empty detection list as expected for the blank image, `latencyMs: 9850`.
  This was a cold first inference, not the controlled S-15 latency benchmark.
- `GET /health` afterwards: HTTP 200, pothole model loaded on CPU; restroom model remains lazy.
- `python -m pytest api/ -vv`: **30 passed** (14 road tests added here).
- `python -m compileall -q ml api`: passed.
- No endpoint implementation fix was needed for this smoke check. The changes add verification
  and Windows instructions. Team weights, real-road accuracy, web integration, Gradio and Docker
  remain separate tasks; S-1 does not establish that they work.


### S-3 input validation checks

`api/test_predict.py` checks a valid image and normalized box, class filtering, invalid
images, oversized files and confidence values. Fake models are injected and restored by
pytest's monkeypatch. The missing-weights test also injects a failing fake YOLO so tests do
not attempt downloads even when Ultralytics is installed.

### S-4 integration check, 11 November 2026 (in progress)

- With the local Next.js app and FastAPI running, Settings reported the Local provider connected.
- An EXIF-stripped test-split road photo (`img-7.jpg`, not committed) was uploaded through
  `/app/roads/analyze`. The Next.js route and real FastAPI `/predict` both returned HTTP 200;
  stock `yolo26n` reported zero detections. This checks transport only, not pothole detection.
- A deliberately synthetic response with one normalized box was then served locally: the
  app drew one box, listed one detection, and showed R1/R2 rule hits. The result was labeled
  `S4-FIXTURE`; it is not a prediction. With FastAPI stopped the page showed the readable
  `unreachable` error and retry option.
- **Outstanding:** run with the team-trained E0 weights, check real boxes and model name on
  a screened test image, and complete the S-2 comparison before marking S-4 done.

### S-2: serving the team's weights, 11 November 2026

Served model: the champion by the selection rule, **E4** (`weights/jolscan-e4.pt`, YOLO26n trained with AdamW, `ml/results/runs/E4.json`). `YOLO('weights/jolscan-e4.pt').names` is `{0: 'pothole'}`, so no `ANY_CLASS` is needed. Started with `MODEL_WEIGHTS=weights/jolscan-e4.pt uvicorn main:app --port 8000`; `/health` reported model `jolscan-e4` and `weightsFileFound: true`.

Three test-split photos, `conf=0.25`, compared with Ultralytics' own `yolo predict` on the same file:

| Photo | `/predict` boxes (confidences) | `yolo predict` | Labelled potholes |
|---|---|---|---:|
| `img-104.jpg` | 2 (0.37, 0.87) | 2 (0.37, 0.87) | 2 |
| `img-300.jpg` | 4 (0.55, 0.68, 0.79, 0.79) | 4 (0.55, 0.68, 0.79, 0.79) | 4 |
| `img-654.jpg` | 3 (0.32, 0.60, 0.89) | 3 (0.32, 0.60, 0.89) | 3 |

The weights are in the shared Drive (`weights/`) and on the presenting laptop, never in git. `scripts/demo-local.sh` serves this file by default. If E8 becomes the champion, repeat this check with `jolscan-e8.pt`.

