# Worklog: Alizhan

**Lane:** Serving and performance. Tasks suggested for Alizhan: see the personal tracker issue and `docs/TASKS.md`.

## Summary for the defense

Fill this in by the code freeze (Wed 23:00). Three to six bullets: what I built or decided, the evidence (links), and the two things I can explain best.

- 

## Entries

<!-- Newest first. Copy the entry template from docs/worklog/README.md. -->

### 2026-11-11 · S-3 (#27) · Road API input tests
- **Status:** implemented; awaiting review.
- **What I did:** Compared the S-1 tests with S-3, checked exact error text for invalid and >10 MB uploads, and prevented the existing missing-weights test from invoking a real Ultralytics installation.
- **Result:** 30 API tests passed in a lightweight environment without model weights; compileall passed. Existing tests cover valid image JSON, normalized box, class filtering and 10 MB limit.
- **Decisions and why:** Reused existing tests rather than duplicating S-1; injected a fake failing loader to ensure no weight downloads.
- **What I learned / can explain at the defense:** Uploaded images are validated from their contents; bad inputs receive a 400 before model loading.
- **AI use:** Codex assisted with the task; see AI-USAGE-LOG.md. Alizhan has not yet personally reviewed this entry.
- **Open questions / next:** Tair reviews the PR; the S-16 CI PR will run the tests automatically.
