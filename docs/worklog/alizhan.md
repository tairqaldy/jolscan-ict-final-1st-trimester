# Worklog: Alizhan

**Lane:** Serving and performance. Tasks suggested for Alizhan: see the personal tracker issue and `docs/TASKS.md`.

## Summary for the defense

Fill this in by the code freeze (Wed 23:00). Three to six bullets: what I built or decided, the evidence (links), and the two things I can explain best.

- 

## Entries

<!-- Newest first. Copy the entry template from docs/worklog/README.md. -->

### 2026-11-11 · S-16 (#39) · Run API tests in CI
- **Status:** implemented, awaiting CI and Tair's review.
- **What I did:** Added a lightweight dependency install and `python -m pytest api/ -q` to the Python GitHub Actions job; no model weights or PyTorch are required.
- **Result:** A temporary deliberate failure produced a red Python check with 1 failed and 30 passed in [run 42901513219](https://github.com/tairqaldy/qarau-ict-final-1st-trimester/actions/runs/42901513219); the temporary test was removed. The normal green run is verified in the PR checks.
- **Decisions and why:** Kept the lightweight install separate from full model dependencies to avoid downloading PyTorch for every PR.
- **What I learned / can explain at the defense:** CI runs automated API tests on pull requests and blocks an unnoticed test failure before a merge.
- **AI use:** Codex helped implement and verify; see AI-USAGE-LOG.md. Alizhan has not yet personally reviewed this draft.
- **Open questions / next:** Tair reviews the workflow. If C-8 adds module-level OpenCV imports, revisit test dependencies.
