# Worklog: Tair

**Lane:** Web app, UX, coordination. Tasks suggested for Tair: see the personal tracker issue and `docs/TASKS.md`.

## Summary for the defense

Fill this in by the code freeze (Wed 23:00). Three to six bullets: what I built or decided, the evidence (links), and the two things I can explain best.

- 

## Entries

<!-- Newest first. Copy the entry template from docs/worklog/README.md. -->

### 11 November 2026 · X-16 (#97) · Defense-day runbook and a one-command demo start

- **Status:** first version; to be tried in Rehearsal 2 with Wi-Fi off
- **What I did:** wrote `docs/DEFENSE-RUNBOOK.md` and `scripts/demo-local.sh`, which checks the ports, the weights and the production build, starts the API with the E0 weights, warms the model and starts the web app.
- **Result:** run once on this laptop: a real photo through the web app took 21 ms model time after the warm-up; the cold first request without warm-up took about 2.4 s.
- **Decisions and why:** warm the model in the script, so the first photo in front of the examiners is fast; production build, not `next dev`, because dev compiles pages on first open.
- **What I learned / can explain:** why the deployed site cannot run our model (its server cannot reach the laptop), and what is real and what is demo on each screen.
- **AI use:** Claude Code wrote the runbook and the script and ran them (docs/AI-USAGE-LOG.md).
- **Open questions:** confirm the presenting laptop in the chat; Restrooms Compare on Local still has to be checked in the rehearsal.

### 11 November 2026 · D-14 (#70) · Rebuild potholes_yolo_v1 from the Kaggle source

- **Status:** done
- **What I did:** wrote `data/make_potholes_yolo_v1.py`, which rebuilds the frozen pothole dataset from the Kaggle download and checks it image by image against `split_manifest.json`.
- **Result:** all 665 images and 1,739 boxes matched (SHA-256, split, object count); the seed-42 shuffle reproduces the documented split exactly.
- **Decisions and why:** re-derive the split instead of copying it from the manifest, so the script proves the documented procedure; stop on the first difference, so a rebuilt folder is the frozen version or nothing.
- **What I learned / can explain:** why a frozen split with a manifest and hashes makes every run comparable; how Pascal VOC corners become YOLO centre and size.
- **AI use:** Claude Code wrote the script from the procedure in data/README.md; I ran it against the Kaggle download and checked the output counts (docs/AI-USAGE-LOG.md).

### 11 November 2026 · M-13 (#62) · Deck plots for the pothole experiment

- **Status:** first version (E0); final after E8
- **What I did:** wrote `ml/plots.py` (bars and loss curves from committed CSVs) and added the champion's PR curve and confusion matrix at confidence 0.40 from Ultralytics' test evaluation.
- **Result:** four figures in `ml/results/`. The confusion matrix at 0.40 gives 160 found, 76 missed, 23 false alarms on 236 test boxes, the same recall and precision as `E0.json`.
- **Decisions and why:** used the confusion matrix at 0.40, not Ultralytics' default one, because the default pass uses confidence 0.001 and shows 2,374 false alarms the app never displays.
- **What I learned / can explain:** why a detector's confusion matrix depends on the confidence threshold; how recall 0.678 and precision 0.874 follow from 160, 76 and 23.
- **AI use:** Claude Code wrote the script and caught the misleading default matrix while checking the figures (docs/AI-USAGE-LOG.md).
- **Open questions:** E2 and E5 curves appear when those runs exist.

### 11 November 2026 · M-3 (#52) and M-12 (#60) · Train E0 and export the first real results

- **Status:** M-3 done; M-12 first export done (final export after E8)
- **What I did:** trained the E0 baseline (YOLO26n, 40 epochs, SGD, seed 42, frozen split `potholes_yolo_v1`) with Amina's M-1 trainer on this laptop's Apple M5 GPU, adding a `--device mps` option; ran `ml/export_results.py`.
- **Result:** test mAP50 0.799, mAP50-95 0.517, precision 0.867, recall 0.678; at the app's confidence 0.40: precision 0.874, recall 0.678. Validation mAP50 0.824. Weights 5.4 MB. `web/data/experiments.json` now has `isMock: false`.
- **Decisions and why:** trained locally instead of Colab because E0 was a day late and the M5 GPU finished 40 epochs in about 12 minutes; the run file records the device so the later Colab runs are compared honestly. Tagged the trainer commit `e0-trainer` because the squash merge would otherwise make the recorded commit unreachable.
- **What I learned / can explain:** mAP50 versus mAP50-95; why the test split is read once, after training; why validation picks the champion.
- **AI use:** Claude Code ran the training and the export and patched the device option; numbers come from the run file (docs/AI-USAGE-LOG.md).
- **Open questions:** the batch-1 latency (S-15) is not measured yet, so the page says "not measured".

### 2026-11-11 12:55 · W-21 (#103) · Remove stale placeholders from the site copy
- **Status:** done
- **What I did:** ran the issue's grep over `web/` and sorted every hit. Fixed the stale copy: the pothole credit in `web/lib/credits.ts` (name, author, Kaggle link, ODbL/DbCL licence from the D-1 card), the footer and About lines that called demo badges "placeholders", the About dataset warning and the "to be completed" AI-use callout, the landing results sentence, and the disabled RU/KZ options in Settings. The model-page dataset card and the placeholder `experiments.json` dataset block were already fixed by W-11 Part A, which merged while I worked.
- **Result:** pull request closing #103. No page shows 'TBD', 'to be confirmed', 'to be filled in' or 'to be completed'; the remaining grep hits are listed in the pull request with their group.
- **Decisions and why:** removed the RU and KZ options instead of leaving 'coming soon': no translation is ready before the defense, and W-58 adds them back wired. The About AI-use section now points to `docs/AI-USAGE-LOG.md` and lists no tools, because the full team statement needs every member's confirmation (W-14). `web/app/design/page.tsx` and `tokens.css` still say the direction is a placeholder; that stays true until Dameli's G-3 lands.
- **What I learned / can explain at the defense:** a demo label is honest, a forgotten placeholder is not. Seeded histories stay invented and keep their badge (U8); placeholder text that promises something later reads as unfinished work.
- **AI use:** Claude Code (Claude Opus 5.5) did the sweep and the edits; entry in docs/AI-USAGE-LOG.md.
- **Open questions / next:** W-14 writes the confirmed AI-use statement and the remaining About fixes; look at https://qarau.vercel.app `/`, `/about`, `/app/model` after the merge.

### 2026-11-11 12:50 · W-28 (#132) · Tie the Demo data badges to the data on screen
- **Status:** done
- **What I did:** every page that shows the seeded demo analyses or sign checks (roads overview, reports, map, analytics, report detail, restroom overview and analytics, platform overview, the app shell) now passes `show` to its badge. Results made by the mock provider show 'Mock result' next to the provider. Compare and Match show 'Mock predictions' through a small client component that reads the provider setting. Only the results places (model page, landing results cards, the two run charts) still follow `isMock`.
- **Result:** pull request closing #132; `web/lib/demo-badges.test.ts` fails if a seeded-history page loses `show` (checked against the old reports page) or a result view stops marking mock results.
- **Decisions and why:** a unit test instead of the manual `pnpm dev` check, so the rule is checked on every CI run. Compare and Match showed no badge at all, even on the Mock provider, because their badge followed the restroom results file, which is already real; the provider-based badge fixes that.
- **What I learned / can explain at the defense:** U8: the badge follows the data on screen. Seeded histories are always invented, mock results are invented per result, and real model results come only from the results files.
- **AI use:** Claude Code (Claude Opus 5.5) wrote the changes and the test; entry in docs/AI-USAGE-LOG.md.
- **Open questions / next:** tell Amina and Nazar that the export can set `isMock: false` safely. Dameli's G-29 can now design the badge set on top of this rule.

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
