# Worklog: Alizhan

**Lane:** Serving and performance. Tasks suggested for Alizhan: see the personal tracker issue and `docs/TASKS.md`.

## Summary for the defense

Fill this in by the code freeze (Wed 23:00). Three to six bullets: what I built or decided, the evidence (links), and the two things I can explain best.

- 

## Entries

<!-- Newest first. Copy the entry template from docs/worklog/README.md. -->

### 2026-11-11 · S-31 (#225) · Image upload boundaries
- **Status:** implemented and tested; awaiting review.
- **What I did:** Added a 40-megapixel limit and mapped Pillow decompression-bomb errors to HTTP 400; documented the shared upload validation.
- **Result:** 35 API tests passed without models, including both endpoints, dimension limits and an EXIF-rotated JPEG.
- **Decisions and why:** Reject excessive pixel dimensions before decoding or loading a model, while preserving the existing 10 MB byte limit and image-type validation.
- **What I learned / can explain at the defense:** A compressed image can be small as a file but huge when decoded, so the API validates both bytes and dimensions.
- **AI use:** Codex assisted; see AI-USAGE-LOG.md. Alizhan has not personally reviewed this entry.
- **Open questions / next:** Tair reviews the contract documentation change; real-image verification remains separate.
