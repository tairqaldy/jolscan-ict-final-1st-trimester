# Worklog: Tair

**Lane:** Web app, UX, coordination. Tasks suggested for Tair: see the personal tracker issue and `docs/TASKS.md`.

## Summary for the defense

Fill this in by the code freeze (Wed 23:00). Three to six bullets: what I built or decided, the evidence (links), and the two things I can explain best.

- 

## Entries

<!-- Newest first. Copy the entry template from docs/worklog/README.md. -->

### 11 November 2026 · D-14 (#70) · Rebuild potholes_yolo_v1 from the Kaggle source

- **Status:** done
- **What I did:** wrote `data/make_potholes_yolo_v1.py`, which rebuilds the frozen pothole dataset from the Kaggle download and checks it image by image against `split_manifest.json`.
- **Result:** all 665 images and 1,739 boxes matched (SHA-256, split, object count); the seed-42 shuffle reproduces the documented split exactly.
- **Decisions and why:** re-derive the split instead of copying it from the manifest, so the script proves the documented procedure; stop on the first difference, so a rebuilt folder is the frozen version or nothing.
- **What I learned / can explain:** why a frozen split with a manifest and hashes makes every run comparable; how Pascal VOC corners become YOLO centre and size.
- **AI use:** Claude Code wrote the script from the procedure in data/README.md; I ran it against the Kaggle download and checked the output counts (docs/AI-USAGE-LOG.md).
- **Open questions:** none.
