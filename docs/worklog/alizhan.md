# Worklog: Alizhan

**Lane:** Serving and performance. Tasks suggested for Alizhan: see the personal tracker issue and `docs/TASKS.md`.

## Summary for the defense

Fill this in by the code freeze (Wed 23:00). Three to six bullets: what I built or decided, the evidence (links), and the two things I can explain best.

- 

## Entries

<!-- Newest first. Copy the entry template from docs/worklog/README.md. -->

### 2026-11-11 · S-30 (#224) · Shared-model concurrency
- **Status:** implemented and tested; awaiting review.
- **What I did:** Added a per-model lock around shared YOLO and CLIP calls in worker threads. Added concurrent endpoint tests, including a health request while YOLO is blocked.
- **Result:** 32 API tests pass; six requests per backend returned 200 and maximum fake-backend concurrency was one. `/health` responded during blocked inference.
- **Decisions and why:** Use separate process-local locks for the two models to avoid same-model races without blocking the event loop. Requests to one model queue; this is not a speed benchmark.
- **What I learned / can explain at the defense:** A shared model needs safe concurrent access; locking trades same-model throughput for predictable serialized access. Each server process has its own lock.
- **AI use:** Codex assisted; see AI-USAGE-LOG.md. Alizhan has not personally reviewed this entry.
- **Open questions / next:** Review with Tair and Nazar and reconcile with S-20 warm-up and Nazar's C-8 before merging.
