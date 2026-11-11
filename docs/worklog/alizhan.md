# Worklog: Alizhan

**Lane:** Serving and performance. Tasks suggested for Alizhan: see the personal tracker issue and `docs/TASKS.md`.

## Summary for the defense

Fill this in by the code freeze (Wed 23:00). Three to six bullets: what I built or decided, the evidence (links), and the two things I can explain best.

- 

## Entries

<!-- Newest first. Copy the entry template from docs/worklog/README.md. -->

### 2026-11-11 · S-4 (#23) · Local web/API integration
- **Status:** in progress; blocked on the team-trained E0 weights for the final real-detection check.
- **What I did:** Ran the local Next.js app and FastAPI on Windows; selected Local and checked health in Settings. Uploaded the screened `img-7.jpg` test-set photo locally, with EXIF removed, and received a real `yolo26n` response. Stopped FastAPI and verified the page showed the actionable `unreachable` message and retry option.
- **Result:** Next.js `/api/analyze` and FastAPI `/predict` returned HTTP 200; the stock model reported zero detections on this pothole image. With an explicitly synthetic local response containing one box, the page drew the box and displayed one detection and R1/R2 rule hits. This fixture verifies rendering only, not model accuracy. No test image or weights were committed.
- **Decisions and why:** COCO weights are not trained on potholes; did not mark S-4 done or interpret its empty result as a valid pothole prediction.
- **What I learned / can explain at the defense:** The browser sends to a Next.js route, which forwards the image to local FastAPI. Rules run on the returned normalized boxes. The site gives a readable message if the service is down.
- **AI use:** Codex assisted with setup and checks; see AI-USAGE-LOG.md. Alizhan has not yet personally reviewed this draft.
- **Open questions / next:** After S-2 supplies E0, rerun the same flow on a screened test image and verify actual boxes and model name. C-8 is separate and needs Nazar's selected restroom pipeline.

### 2026-11-11 · S-13 (#26) · Serving study card
- **Status:** draft prepared; practice with a teammate remains outstanding.
- **What I did:** Drafted seven short answers in `docs/PRESENTATION.md` covering the request path, HTTP errors, deployment, monitoring and MLOps.
- **Result:** A practice card for Alizhan; no claim that the oral assessment has happened.
- **Decisions and why:** Clearly separate current mock/local behavior from unmerged or future model work and identify lecture-page references as unverified.
- **What I learned / can explain at the defense:** Review and practice these answers in my own words.
- **AI use:** Codex drafted the card; see AI-USAGE-LOG.md. Alizhan has not personally verified it.
- **Open questions / next:** Answer three random questions without notes to a teammate and show `/predict`; check lecture references against original PDFs.

### 2026-11-11 · S-10 (#33) · Lighthouse pass
- **Status:** in progress; two issues addressed, a third still needs investigation.
- **What I did:** Measured the production build of the landing page and dashboard in Lighthouse, reduced unnecessary font preloads, and corrected inaccessible labels on animated statistics.
- **Result:** On the local production build, `/app` accessibility improved from 96 to 100 on mobile and desktop. Both pages loaded 7 font files (126,044 bytes) instead of 13 (185,522 bytes). Performance was 100 in both local runs; these single runs do not establish a latency improvement. See the S-10 pull request for all scores and measurement conditions.
- **Decisions and why:** Preload only Latin glyphs; other font ranges remain available when needed. Expose the final number to assistive technology while hiding the animated visual copy.
- **What I learned / can explain at the defense:** Preloading font subsets consumes network bandwidth even if a page does not use those glyphs; accessible text should be exposed once without unsupported ARIA attributes.
- **AI use:** Codex desktop, GPT-6, for measurement and changes; personal review pending.
- **Open questions / next:** Identify and validate a third meaningful improvement and repeat measurements on the deployed site after review and deployment.

### 2026-11-11 · S-29 (#223) · API response schemas
- **Status:** implemented; review pending.
- **What I did:** Declared Pydantic response models for road detection and restroom compare/match, attached them to the routes, and included them in the Docker build. Exported the OpenAPI specification from the running local service.
- **Result:** `/docs` exposes the three response models; `api/openapi.json` records the contract. All 32 API tests pass with lightweight test dependencies, including checks for schema publication and invalid response rejection.
- **Decisions and why:** Kept `/health` unchanged because its shape is evolving; preserved all current response fields and the documented provider values.
- **What I learned / can explain at the defense:** Response models document an API and make FastAPI validate its output against the shared contract.
- **AI use:** Codex desktop, GPT-6; personal review pending.
- **Open questions / next:** Tair should review the shared contract and integration with any concurrent restroom changes.

### 2026-11-11 · S-31 (#225) · Image upload boundaries
- **Status:** implemented and tested; awaiting review.
- **What I did:** Added a 40-megapixel limit and mapped Pillow decompression-bomb errors to HTTP 400; documented the shared upload validation.
- **Result:** 35 API tests passed without models, including both endpoints, dimension limits and an EXIF-rotated JPEG.
- **Decisions and why:** Reject excessive pixel dimensions before decoding or loading a model, while preserving the existing 10 MB byte limit and image-type validation.
- **What I learned / can explain at the defense:** A compressed image can be small as a file but huge when decoded, so the API validates both bytes and dimensions.
- **AI use:** Codex assisted; see AI-USAGE-LOG.md. Alizhan has not personally reviewed this entry.
- **Open questions / next:** Tair reviews the contract documentation change; real-image verification remains separate.

### 2026-11-11 · S-30 (#224) · Shared-model concurrency
- **Status:** implemented and tested; awaiting review.
- **What I did:** Added a per-model lock around shared YOLO and CLIP calls in worker threads. Added concurrent endpoint tests, including a health request while YOLO is blocked.
- **Result:** 32 API tests pass; six requests per backend returned 200 and maximum fake-backend concurrency was one. `/health` responded during blocked inference.
- **Decisions and why:** Use separate process-local locks for the two models to avoid same-model races without blocking the event loop. Requests to one model queue; this is not a speed benchmark.
- **What I learned / can explain at the defense:** A shared model needs safe concurrent access; locking trades same-model throughput for predictable serialized access. Each server process has its own lock.
- **AI use:** Codex assisted; see AI-USAGE-LOG.md. Alizhan has not personally reviewed this entry.
- **Open questions / next:** Review with Tair and Nazar and reconcile with S-20 warm-up and Nazar's C-8 before merging.

### 2026-11-11 · S-20 (#214) · Model readiness and optional warm-up
- **Status:** implemented and tested with fake backends; awaiting review.
- **What I did:** Added `/ready` to load and report both models independently, a loaded-state flag on `/health`, and optional startup warm-up on blank images. A model failure does not stop the service.
- **Result:** 36 API tests pass in an isolated lightweight environment, including success, either model failing, lazy startup and warm-up. No real model or inference accuracy was tested for S-20.
- **Decisions and why:** Keep `/health` live when a model is missing; `/ready` reports per-model load failures. Warm-up is opt-in and logs errors.
- **What I learned / can explain at the defense:** Liveness means the process responds, readiness here means the configured backends initialized; run a real image to verify inference.
- **AI use:** Codex assisted with implementation and tests; see AI-USAGE-LOG.md. Alizhan has not yet personally reviewed this draft.
- **Open questions / next:** Recheck with actual team weights and cached CLIP on the presenting laptop.

### 2026-11-11 · S-3 (#27) · Road API input tests
- **Status:** implemented; awaiting review.
- **What I did:** Compared the S-1 tests with S-3, checked exact error text for invalid and >10 MB uploads, and prevented the existing missing-weights test from invoking a real Ultralytics installation.
- **Result:** 30 API tests passed in a lightweight environment without model weights; compileall passed. Existing tests cover valid image JSON, normalized box, class filtering and 10 MB limit.
- **Decisions and why:** Reused existing tests rather than duplicating S-1; injected a fake failing loader to ensure no weight downloads.
- **What I learned / can explain at the defense:** Uploaded images are validated from their contents; bad inputs receive a 400 before model loading.
- **AI use:** Codex assisted with the task; see AI-USAGE-LOG.md. Alizhan has not yet personally reviewed this entry.
- **Open questions / next:** Tair reviews the PR; the S-16 CI PR will run the tests automatically.

### 2026-11-11 · S-16 (#39) · Run API tests in CI
- **Status:** implemented, awaiting CI and Tair's review.
- **What I did:** Added a lightweight dependency install and `python -m pytest api/ -q` to the Python GitHub Actions job; no model weights or PyTorch are required.
- **Result:** A temporary deliberate failure produced a red Python check with 1 failed and 30 passed in [run 42901513219](https://github.com/tairqaldy/qarau-ict-final-1st-trimester/actions/runs/42901513219); the temporary test was removed. The normal green run is verified in the PR checks.
- **Decisions and why:** Kept the lightweight install separate from full model dependencies to avoid downloading PyTorch for every PR.
- **What I learned / can explain at the defense:** CI runs automated API tests on pull requests and blocks an unnoticed test failure before a merge.
- **AI use:** Codex helped implement and verify; see AI-USAGE-LOG.md. Alizhan has not yet personally reviewed this draft.
- **Open questions / next:** Tair reviews the workflow. If C-8 adds module-level OpenCV imports, revisit test dependencies.

### 2026-11-11 · S-23 (#217) · Pin API dependencies and align Python
- **Status:** implementation tested; proposed Python version awaits Tair and Nazar's review.
- **What I did:** Pinned direct API and dev dependencies from S-1, proposed Python 3.12 in the API Docker base and Python CI, and documented the choice in decision 0008.
- **Result:** Clean Python 3.12 environments on Windows and Linux installed the pinned packages and passed 30 API tests. Windows Uvicorn `/health` returned 200; Linux TestClient `/health` returned 200. The temporary Linux verification was run in [Actions 42904855203](https://github.com/tairqaldy/qarau-ict-final-1st-trimester/actions/runs/42904855203). The Docker image itself was not built.
- **Decisions and why:** NumPy 2.5.4 requires Python >=3.12; Pillow 12.3.0 matches S-1 and the pinned Gradio requirement (<13). The restroom research environment uses Pillow 13, so model-level verification is still needed.
- **What I learned / can explain at the defense:** Direct pins constrain package versions; Python compatibility and transitive dependencies still matter.
- **AI use:** Codex assisted; see AI-USAGE-LOG.md. Alizhan has not personally reviewed this entry.
- **Open questions / next:** Tair and Nazar review the proposed Python/Pillow choice. Build the image under S-8 and verify real models on the presenting laptop under S-14.
