# Worklog: Tair

**Lane:** Web app, UX, coordination. Tasks suggested for Tair: see the personal tracker issue and `docs/TASKS.md`.

## Summary for the defense

Fill this in by the code freeze (Wed 23:00). Three to six bullets: what I built or decided, the evidence (links), and the two things I can explain best.

- 

## Entries

<!-- Newest first. Copy the entry template from docs/worklog/README.md. -->

### 11 November 2026 · M-3 (#52) and M-12 (#60) · Train E0 and export the first real results

- **Status:** M-3 done; M-12 first export done (final export after E8)
- **What I did:** trained the E0 baseline (YOLO26n, 40 epochs, SGD, seed 42, frozen split `potholes_yolo_v1`) with Amina's M-1 trainer on this laptop's Apple M5 GPU, adding a `--device mps` option; ran `ml/export_results.py`.
- **Result:** test mAP50 0.799, mAP50-95 0.517, precision 0.867, recall 0.678; at the app's confidence 0.40: precision 0.874, recall 0.678. Validation mAP50 0.824. Weights 5.4 MB. `web/data/experiments.json` now has `isMock: false`.
- **Decisions and why:** trained locally instead of Colab because E0 was a day late and the M5 GPU finished 40 epochs in about 12 minutes; the run file records the device so the later Colab runs are compared honestly. Tagged the trainer commit `e0-trainer` because the squash merge would otherwise make the recorded commit unreachable.
- **What I learned / can explain:** mAP50 versus mAP50-95; why the test split is read once, after training; why validation picks the champion.
- **AI use:** Claude Code ran the training and the export and patched the device option; numbers come from the run file (docs/AI-USAGE-LOG.md).
- **Open questions:** the batch-1 latency (S-15) is not measured yet, so the page says "not measured".

### 11 November 2026 · W-11 (#109) Part A · Model page follows the selection rule

- **Status:** Part A done; Part B waits for the real export (M-12).
- **What I did:** the roads loader (`web/lib/mock/experiments.ts`) now reads every field the export writes, including validation mAP50, recall at 0.40 and the training device, and keeps missing numbers as null instead of 0. The runs table compares against the baseline on mAP50, has 'Val mAP50', 'Recall at 0.40' and 'Device' columns and no 60 ms budget. The scatter chart became grouped bars of test mAP50 and test recall at 0.40 from zero, with the champion in amber and a title computed from the data. The placeholder `web/data/experiments.json` has the real selection rule, runs E0–E8 from docs/ML-EXPERIMENT.md (numbers still invented and badged) and the dataset block the export writes.
- **Result:** pull request for W-11 Part A; a vitest file (`web/lib/mock/experiments.test.ts`) feeds the loader an object shaped like the real export and checks every mapped field.
- **Decisions and why:** the dataset card stays in the results file because M-20 made the export write it, so the page shows what the export wrote. Missing text fields show 'Not in the results file yet' rather than invented wording. Latency in the placeholder is null, the same state the real export will have until S-15. The chart works with one run, because the first real export has only E0.
- **What I learned / can explain at the defense:** runs are categories, so a bar chart from zero, not a scatter (Lec4-VizBasics p4). The champion is picked on validation mAP50 and the test split is only reported (Sup p10), so the champion's test bar is not always the tallest, and the chart title says so when that happens.
- **AI use:** Claude Code (Claude Opus 5.5) wrote the changes and the test; see docs/AI-USAGE-LOG.md.
- **Open questions / next:** Part B: after M-12, open `/app/model`, check the badge is gone and three cells against `ml/results/experiments.csv`. W-5 still has to switch the landing teaser to mAP50 and recall at 0.40.

### 11 November 2026 · D-1 (#40) and M-20 (#69) · Dataset card and the export's metadata

- **Status:** done
- **What I did:** wrote the dataset card in `data/README.md` from the Kaggle dataset page data, and made `ml/export_results.py` write the dataset block, protocol, selection rule, champion model name and each run's device; ARCHITECTURE section 2 lists the new fields.
- **Result:** licence ODbL (database) / DbCL (contents); a test export produced a `dataset` block with 465 / 100 / 100 images and no placeholder text.
- **Decisions and why:** the licence is open, but three watermarked stock photos mean per-photo rights are not established, so they stay out of anything public (D-12). Image counts come from the manifest, not typed by hand.
- **What I learned / can explain:** the difference between a dataset licence (ODbL) and the rights to each photo in it; why the export, not a person, writes every number on the model page.
- **AI use:** Claude Code drafted the card and the export change; I checked the licence against the Kaggle data and ran a test export (docs/AI-USAGE-LOG.md).
- **Open questions:** none.
