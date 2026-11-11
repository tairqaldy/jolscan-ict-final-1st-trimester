# Worklog: Alizhan

**Lane:** Serving and performance. Tasks suggested for Alizhan: see the personal tracker issue and `docs/TASKS.md`.

## Summary for the defense

Fill this in by the code freeze (Wed 23:00). Three to six bullets: what I built or decided, the evidence (links), and the two things I can explain best.

- 

## Entries

<!-- Newest first. Copy the entry template from docs/worklog/README.md. -->

### 2026-11-11 · S-10 (#33) · Lighthouse pass
- **Status:** in progress; two issues addressed, a third still needs investigation.
- **What I did:** Measured the production build of the landing page and dashboard in Lighthouse, reduced unnecessary font preloads, and corrected inaccessible labels on animated statistics.
- **Result:** On the local production build, `/app` accessibility improved from 96 to 100 on mobile and desktop. Both pages loaded 7 font files (126,044 bytes) instead of 13 (185,522 bytes). Performance was 100 in both local runs; these single runs do not establish a latency improvement. See the S-10 pull request for all scores and measurement conditions.
- **Decisions and why:** Preload only Latin glyphs; other font ranges remain available when needed. Expose the final number to assistive technology while hiding the animated visual copy.
- **What I learned / can explain at the defense:** Preloading font subsets consumes network bandwidth even if a page does not use those glyphs; accessible text should be exposed once without unsupported ARIA attributes.
- **AI use:** Codex desktop, GPT-6, for measurement and changes; personal review pending.
- **Open questions / next:** Identify and validate a third meaningful improvement and repeat measurements on the deployed site after review and deployment.

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
