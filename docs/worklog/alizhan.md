# Worklog: Alizhan

**Lane:** Serving and performance. Tasks suggested for Alizhan: see the personal tracker issue and `docs/TASKS.md`.

## Summary for the defense

Fill this in by the code freeze (Wed 23:00). Three to six bullets: what I built or decided, the evidence (links), and the two things I can explain best.

- 

## Entries

<!-- Newest first. Copy the entry template from docs/worklog/README.md. -->

### 2026-11-11 · S-23 (#217) · Pin API dependencies and align Python
- **Status:** implementation tested; proposed Python version awaits Tair and Nazar's review.
- **What I did:** Pinned direct API and dev dependencies from S-1, proposed Python 3.12 in the API Docker base and Python CI, and documented the choice in decision 0008.
- **Result:** Clean Python 3.12 environments on Windows and Linux installed the pinned packages and passed 30 API tests. Windows Uvicorn `/health` returned 200; Linux TestClient `/health` returned 200. The temporary Linux verification was run in [Actions 42904855203](https://github.com/tairqaldy/qarau-ict-final-1st-trimester/actions/runs/42904855203). The Docker image itself was not built.
- **Decisions and why:** NumPy 2.5.4 requires Python >=3.12; Pillow 12.3.0 matches S-1 and the pinned Gradio requirement (<13). The restroom research environment uses Pillow 13, so model-level verification is still needed.
- **What I learned / can explain at the defense:** Direct pins constrain package versions; Python compatibility and transitive dependencies still matter.
- **AI use:** Codex assisted; see AI-USAGE-LOG.md. Alizhan has not personally reviewed this entry.
- **Open questions / next:** Tair and Nazar review the proposed Python/Pillow choice. Build the image under S-8 and verify real models on the presenting laptop under S-14.
