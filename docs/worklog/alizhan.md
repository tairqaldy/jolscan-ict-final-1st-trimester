# Worklog: Alizhan

**Lane:** Serving and performance. Tasks suggested for Alizhan: see the personal tracker issue and `docs/TASKS.md`.

## Summary for the defense

Fill this in by the code freeze (Wed 23:00). Three to six bullets: what I built or decided, the evidence (links), and the two things I can explain best.

- 

## Entries

<!-- Newest first. Copy the entry template from docs/worklog/README.md. -->

### 2026-11-11 · X-21 (#262) · Instructor's project tour
- **Status:** in progress; independent two-minute navigation check remains.
- **What I did:** Added a short README tour linking the evidence table, experiments, rules, logs, setup and defense runbook, with the mock/local distinction and open VLM audit.
- **Result:** A compact entry point with existing file links and commands sourced from the repository; no claim that all defense requirements are complete.
- **Decisions and why:** Linked the outstanding VLM issue rather than a nonexistent audit file and kept model weights and real local inference prerequisites explicit.
- **What I learned / can explain at the defense:** An instructor should be able to distinguish deployed mock analyses from locally served model results and find evidence for the reported numbers.
- **AI use:** Codex desktop, GPT-6; personal review pending.
- **Open questions / next:** Have a teammate locate the requested items in under two minutes, review the status at freeze and verify the proposed commands on the intended laptop.

### 2026-11-11 · R-4 (#87) · Defense script snapshot
- **Status:** in progress; speaker review and a timed group read-through remain.
- **What I did:** Copied all 12 existing slide scripts and their estimated timings into `docs/PRESENTATION.md` without changing slide design or claiming a completed rehearsal.
- **Result:** The 12 scripts are in one place. Flagged that slide 11's notes still call the two-step pipeline a next step even though C-8 has been merged, and that some same-speaker handovers are implicit.
- **Decisions and why:** Preserved the actual current notes for a reliable comparison instead of silently changing the presentation or inventing measured timings.
- **What I learned / can explain at the defense:** Timed estimates do not replace rehearsal; notes need to match both the deployed behavior and the spoken script.
- **AI use:** Codex desktop, GPT-6; personal review pending.
- **Open questions / next:** Team corrects the stale note in the deck source, checks every speaker's own text and handovers, and records a full timed read-through.

### 2026-11-11 · R-15 (#99) · Independent recheck of deck and intervals
- **Status:** in progress; the final freeze rebuild and outstanding R-6 audit remain.
- **What I did:** Rebuilt the deck at `2d37b34` in an isolated copy, compared all slide and notes text and the embedded media hashes, and independently recomputed the stored restroom confidence intervals and paired p-values.
- **Result:** The rebuild checked 191 registered values and reported R-6 as the remaining gap. Text, notes and seven embedded media hashes matched; all 37 stored intervals and six paired p-values matched to four decimals.
- **Decisions and why:** Kept the task open: recomputing from stored counts is not verification of each prediction, and the deck must be checked again at the freeze.
- **What I learned / can explain at the defense:** Exact confidence intervals reflect uncertainty in a small test set, and a paired test compares cases on which methods disagree.
- **AI use:** Codex desktop, GPT-6; personal review pending.
- **Open questions / next:** Complete R-6 and repeat the comparison on the final deck; review the slides, live values and spoken script.

### 2026-11-11 · R-2 (#84) · Primary road-condition source
- **Status:** in progress; source selected for review, slide and timed delivery remain.
- **What I did:** Located a West Kazakhstan Region road authority's primary report and documented its dated local-road condition figure and scope for the presentation.
- **Result:** `docs/research/deck-sources.md` links the source, quotes a short original excerpt and proposes an accurate English formulation. No design or slide was changed.
- **Decisions and why:** Used the reported 60% of local roads in normative condition as of 1 January 2026; did not call it a pothole count or national statistic.
- **What I learned / can explain at the defense:** A regional road-condition indicator should retain its geography, date, denominator and definition when quoted.
- **AI use:** Codex desktop, GPT-6; personal review pending.
- **Open questions / next:** Team reviews the source and includes it in the slide and notes if appropriate; the speaker times the delivery.

### 2026-11-11 · R-15 (#99) · Audit numbers in the defense deck
- **Status:** in progress; one stale slide number and three documented source gaps remain.
- **What I did:** Rebuilt the deck in an isolated copy, compared all slide text with the committed PowerPoint, and compared road and restroom export rows with the website's data files.
- **Result:** The generator checked 183 number records. The only text difference between the committed deck and the fresh build was the changing number of AI-log entries on slide 10. Three gaps remain on slides 2, 8 and 10. The compared export metrics matched website data; E1, R3 and R4 were spot-checked on the live model page.
- **Decisions and why:** Recorded the mismatch and gaps rather than silently changing the presentation or claiming all numbers match. The generator validates the values it registers; this is not proof that every image, chart or spoken number was independently audited.
- **What I learned / can explain at the defense:** Recalculate numbers from source files and compare against the actual version being presented, not just against a newly generated copy.
- **AI use:** Codex desktop, GPT-6; personal review pending.
- **Open questions / next:** Rebuild or correct the stale slide count after the final AI-log edit; resolve or explicitly accept the missing source gaps, audit charts and the remaining live-page values, and repeat after later results change.

### 2026-11-11 · X-13 (#77) · AI prompt-log excerpts
- **Status:** in progress; full transcripts and other members' records still need collection and review.
- **What I did:** Collected selected exact prompts and evidence-backed summaries for the serving work in `docs/ai-logs/alizhan/2026-11-11-serving-codex-excerpts.md`, avoiding personal paths and recording the lack of a full export.
- **Result:** A partial, sanitized record with links to task-specific PRs and the worklog, not a substitute for the full conversation.
- **Decisions and why:** Did not invent missing transcripts or claim that other members used no AI.
- **What I learned / can explain at the defense:** State how AI was used, what was verified and what remains uncertain; the defense answers are personal.
- **AI use:** Codex desktop, GPT-6, to assemble and check the excerpts.
- **Open questions / next:** Alizhan reviews the excerpts; each member contributes their own export or explains why it is unavailable, then the team audits the complete log.

### 2026-11-11 · S-26 (#220) · Slide-number source inventory
- **Status:** in progress; Roma's use in R-15 and final deck comparison remain to be confirmed.
- **What I did:** Added a standard-library command that reads road and restroom result files, writes a source-labelled inventory, and marks missing or mock values unavailable; added a no-write CI mode and tests.
- **Result:** `ml/results/SLIDE-NUMBERS.md` lists currently available model results and sources. Missing latency and interval files are explicit, not estimated.
- **Decisions and why:** Kept the inventory separate from the actual deck audit and included the generation time and Git HEAD; the list alone does not prove every slide number is current.
- **What I learned / can explain at the defense:** Trace experiment figures to committed files and regenerate the inventory when results change.
- **AI use:** Codex desktop, GPT-6; personal review pending.
- **Open questions / next:** Roma checks the final deck against the page; regenerate after results change and review the feature-freeze policy before merging.

### 2026-11-11 · X-20 (#261) · Evidence and gaps for graded requirements
- **Status:** in progress; update at code freeze and team review remain.
- **What I did:** Added evidence and status columns to all 14 requirements in `docs/PLAN.md`, linking existing results, app files and outstanding issues.
- **Result:** The table distinguishes observed artifacts from missing rehearsals, the comparative AI audit, complete prompt logs and submission confirmation.
- **Decisions and why:** Used partial status when an artifact exists but real-world verification or personal participation is still missing; did not independently verify private course-page citations.
- **What I learned / can explain at the defense:** Each claim should point to evidence, and a draft or a test is not proof that an end-to-end defense requirement is complete.
- **AI use:** Codex desktop, GPT-6; personal review pending.
- **Open questions / next:** Refresh the snapshot at the 23:00 freeze; team reviews course references and remaining gaps.

### 2026-11-11 · R-21 (#230) · Architecture slide practice
- **Status:** done; three recorded attempts are within the duration target and Alizhan confirmed the required handover.
- **What I did:** Checked slide 4 and its speaker notes in the current PowerPoint against the deck source, API routes and the restroom latency CSV; prepared `docs/R21-ALIZHAN-PRACTICE.md`.
- **Result:** Slide 4 contains the diagram, provider labels, handover and source notes. Its 25.7 ms is the served R1 CLIP measurement, not the original issue's R3 figure or a road-model latency.
- **Decisions and why:** Preserved the current team slide and documented the model/latency distinction. Alizhan supplied three recordings; their file durations are 40.98, 35.93 and 35.93 seconds. Audio content was not independently checked.
- **What I learned / can explain at the defense:** Trace the image through browser, Next.js, provider, FastAPI, returned JSON and web rules.
- **AI use:** Codex desktop, GPT-6; personal review pending.
- **Open questions / next:** Recheck deployment before the talk; the recording content was not independently transcribed.

### 2026-11-11 · X-7 (#78) · Contribution log
- **Status:** in progress; personal confirmation by team members remains.
- **What I did:** Updated my contribution row using merged PRs and added proposed practice topics to Dameli's and Roma's rows from their study cards.
- **Result:** The log links work to commits and PRs without claiming that anyone has personally reviewed or mastered the listed material.
- **Decisions and why:** Only attributed verifiable work and explicitly marked proposed speaking topics for each person to confirm.
- **What I learned / can explain at the defense:** A contribution log needs evidence for the work and honest individual preparation.
- **AI use:** Codex desktop, GPT-6; personal review pending.
- **Open questions / next:** Each participant checks their own row and topics; Tair confirms any remaining shared decisions.

### 2026-11-11 · M-2 (#51) · Full-run handoff
- **Status:** in progress; actual shared Drive access and Colab handoff remain unverified.
- **What I did:** Added an opt-in final Colab cell for copying a full run's best weights to a shared folder and downloading its result JSON and CSV; documented the laptop-to-PR handoff.
- **Result:** Local temporary-file simulation passed, including normal copy/download, skipping the smoke default, rejecting smoke metadata and refusing to overwrite existing weights. No actual weights or dataset were used.
- **Decisions and why:** The notebook runs an M-1 smoke test by default; full-run copying must be explicitly configured and checked so smoke weights cannot be mistaken for a trained model.
- **What I learned / can explain at the defense:** Keep model weights outside Git and preserve the actual per-run results and curves alongside the source code.
- **AI use:** Codex desktop, GPT-6; personal review pending.
- **Open questions / next:** Verify the shared folder exists and all runners can edit it, then run the handoff for an actual full run in Colab.

### 2026-11-11 · D-29 (#345) · Reproduce pothole size bands
- **Status:** implementation and numerical verification complete; Amina's review pending.
- **What I did:** Wrote a training-only YOLO label reader, log-area KMeans script, histogram export and synthetic checks; documented the command, pinned scikit-learn, and ran it on a manifest-verified rebuild of the Kaggle dataset.
- **Result:** Rebuilt train has 465 images and 1,198 boxes; counts 429/499/270 match. Both thresholds and all cluster centers agree with the committed JSON to six decimals. Non-float fields are identical. The supplied figure was not compared pixel by pixel.
- **Decisions and why:** Restrict the input to a training directory and write to a temporary output before comparing; do not alter the rule thresholds.
- **What I learned / can explain at the defense:** Clustering log area gives image-relative groups, not physical measurements; test data must not determine thresholds.
- **AI use:** Codex desktop, GPT-6; personal review pending.
- **Open questions / next:** Amina should review the reproduced output and the remaining small floating-point differences; the original Drive archive was not directly inspected.

### 2026-11-11 · S-28 (#222) · Validation-only promotion gate
- **Status:** implemented; Amina's review pending.
- **What I did:** Added a standard-library CLI that validates comparability and applies the existing champion selection rule using validation metrics only; described a future Level 1 pipeline without claiming it is automated.
- **Result:** Tests cover promotion, ties, incompatible datasets and parameters, smoke runs, missing metrics and declared resolution changes. E6 versus E1 returns KEEP E1 with a resolution warning.
- **Decisions and why:** Reject missing or invalid metadata and undeclared image-size changes; warn for declared resolution changes because cost still needs review.
- **What I learned / can explain at the defense:** A promotion gate should compare like-for-like runs and never use the held-out test set to choose a model.
- **AI use:** Codex desktop, GPT-6; personal review pending.
- **Open questions / next:** Amina reviews the gate and declared-change warning policy; registry and deployment remain separate.

### 2026-11-11 · S-12 (#35) · Prediction call log
- **Status:** implemented; review pending.
- **What I did:** Added a configurable CSV log of successful road predictions with a process-local lock and no uploaded image or filename, plus error handling and tests.
- **Result:** Each successful request writes aggregate metadata; tests cover repeated requests, empty detections, concurrent writes, privacy and an unwritable log path. The default log directory is Git-ignored.
- **Decisions and why:** Mean confidence is blank when no objects are detected. Following Tair's review, logging is opt-in and a write failure logs a warning without failing inference. Multiple processes need separate destinations or a coordinated collector.
- **What I learned / can explain at the defense:** Monitoring can record latency and confidence over time without storing source images, but confidence alone does not prove data drift.
- **AI use:** Codex desktop, GPT-6; personal review pending.
- **Open questions / next:** Tair reviews the logging and deployment implications; analytics integration is separate.

### 2026-11-11 · S-25 (#219) · Test model selection and export
- **Status:** implemented; Amina's review pending.
- **What I did:** Corrected floating-point comparison at the inclusive tie boundary, switched the existing CSV writer to `DictWriter`, and added four CI regression tests.
- **Result:** The boundary test failed before the fix and passes after it; the already exported champion remains E1. Existing CSV quoting already worked and is now tested explicitly.
- **Decisions and why:** Kept the documented validation-only selection rule and used synthetic test inputs in a temporary directory.
- **What I learned / can explain at the defense:** Binary floating-point arithmetic can put an exact decimal boundary just outside the intended comparison; CI should test that boundary.
- **AI use:** Codex desktop, GPT-6; personal review pending.
- **Open questions / next:** Amina reviews the ML change; repeat checks after rebasing on current main.

### 2026-11-11 · S-24 (#218) · Results validation in CI
- **Status:** implemented; review pending.
- **What I did:** Added a standard-library validator for both published experiment files, champion selection, tracked forbidden extensions and file size; wired it into CI with regression tests.
- **Result:** Current results pass; tests cover out-of-range metrics, a placeholder with numbers, a tracked `.pt` and an oversized file.
- **Decisions and why:** Used the existing champion selection function to avoid a second inconsistent implementation; additional result fields are allowed.
- **What I learned / can explain at the defense:** MLOps CI checks data and artifacts as well as source code, catching invalid metrics and accidental weight uploads.
- **AI use:** Codex desktop, GPT-6; personal review pending.
- **Open questions / next:** Tair reviews the shared CI and results contract.

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
