# Worklog: Nazar

**Lane:** Restroom model. Tasks suggested for Nazar: see the personal tracker issue and `docs/TASKS.md`.

## Summary for the defense

Fill this in by the code freeze (Wed 23:00). Three to six bullets: what I built or decided, the evidence (links), and the two things I can explain best.

- A two-step matching pipeline with no training (SIFT with a pixel check finds the crop's own original, colour plus CLIP finds its partner) gets 30/30 on test and 10/10 on validation, against IOAI's best 0.90 (`ml/results/restroom/pipeline.json`).
- The layer sweep (C-11): fine-tuning the last 4 CLIP blocks is best (0.965 partner-found accuracy on held-out restrooms); all 12 blocks are worse (0.910) and reach 1.000 on the training restrooms, which is overfitting (`ml/results/restroom/layers.csv`).
- R4 (C-3) and the export to the web app (C-5); the slide figures (C-6) in `ml/results/restroom/figs/`.
- Draft, written by the AI tool for me to check and edit in my own words before the code freeze.

## Entries

<!-- Newest first. Copy the entry template from docs/worklog/README.md. -->

### 2026-11-11 21:00 · Restroom verdict and layer models · Pair or not a pair; per-layer models on Match
- **Status:** done locally on branch `restroom/ioai-train-set`, not pushed.
- **What I did:** The signage verdict is now only `pair` or `not_pair`: a pair when the two signs are one design set (S3, similarity ≥ 0.88) and the doors read as different genders (S2, gap ≥ 0.05). Rule S1 and the verdicts clear / review / confusing, and the recommended action, are gone; a one-line reason replaces the action. Trained CLIP with its last 1, 2, 4, 6, 8 and 12 blocks fine-tuned (`ml/restroom/train_layer_models.py`) and added their picks to Match next to the other models, with the signs where they disagree. The Restroom overview has the layer chart from the C-11 sweep.
- **Result:** On whole signs with a gallery from one IOAI set, every fine-tuned model finds almost every partner (validation 1.00, test 0.98 to 1.00; zero-shot 0.95 and 0.97). The layer count shows in the harder crop setting (0.78 with 0 blocks, 0.97 with 4, 0.91 with 12) and in gender accuracy (0.74 down to 0.60).
- **Decisions and why:** The app answers the IOAI question, is this a pair, so only the two rules that decide it are left. Old checks saved in a browser are judged again on load. The layer models were trained on every training restroom, so the page says that their training-sign picks are memorised.
- **What I learned / can explain at the defense:** Why all models look right on Match (whole signs in a small gallery are easy) and where the number of layers matters (crops against all 164 originals, and gender).
- **AI use:** Claude Code (Claude Opus 5.5); entry in `docs/AI-USAGE-LOG.md`.
- **Open questions / next:** tell the team that `SignageAnalysis` changed (`verdict` values and `reason` instead of `recommendedAction`, ARCHITECTURE.md).

### 2026-11-11 19:30 · Restroom follow-ups · IOAI training set, every IOAI sign as a sample, Match comparison
- **Status:** done, in the PR from `restroom/ioai-train-set`.
- **What I did:** The IOAI pairs page shows the training set too (164 crops, one query at a time, 147/164). Compare and Match can pick any of the 238 IOAI signs (validation, test, training) with real zero-shot CLIP outputs (`export_catalogue.py`). Match gives each IOAI sign a gallery from its own set with its true partner (`export_match.py`), shows the best pair on the right, and compares what each of our models picks.
- **Result:** The "best" sign on Match was wrong before because the gallery did not contain the true partner; with per-sign galleries the served pipeline finds it. Training restroom 30 (the deer) stays wrong for R7 and zero-shot CLIP; only the fine-tuned models, which trained on it, find it.
- **Decisions and why:** Restrooms 18 (photos of people with faces) and 59 (nude figures) are hidden, as the repository rules require. Validation and test genders were labelled by eye; four test signs are marked unsure.
- **What I learned / can explain at the defense:** Why a gallery without the true partner makes any model look wrong, and why a model's score on the restrooms it trained on is not evidence.
- **AI use:** Claude Code (Claude Opus 5.5); entries in `docs/AI-USAGE-LOG.md`.
- **Open questions / next:** none.

### 2026-11-11 · C-27 (#208), C-26 (#207), C-25 (#206), C-28 (#209), C-24 (#205) · Signage checks and error analysis
- **Status:** done locally, not merged.
- **What I did:** signage threshold curves; the signage rules on the 10 validation restrooms; the hardest training restrooms; sign-style clusters; step 1 under rotated, blurred, darker and smaller crops.
- **Result:** validation agrees with training (9/10 restrooms read the right way round, training 0.90); 62 of 82 restrooms never fail and the two worst are data errors; gender errors do not concentrate in a style cluster. Robustness numbers in `results/robustness.json`.
- **Decisions and why:** thresholds unchanged after the validation check (no tuning on validation); the k-means rule fixed before running.
- **What I learned / can explain at the defense:** what an out-of-sample check is and why 10 restrooms give wide intervals; why some failures are the data's, not the method's.
- **AI use:** Claude Code (Claude Opus 5.5); the validation gender labels and the failure causes were written by the tool from the images and need my check.
- **Open questions / next:** check the 20 labels and the six causes by eye.

### 2026-11-11 · C-22 (#203), C-30 (#211) · App setting and model card
- **Status:** done locally, not merged.
- **What I did:** measured Match the way the app uses it (a whole sign, not in the gallery) on the training restrooms, and wrote the model card of the restroom service.
- **Result:** the C-8 rule finds the partner 0.976 of the time among 6 restrooms and 0.950 among 30; the old gender filter 0.594 and 0.560 (`results/app_setting.json`). `ml/restroom/MODEL_CARD.md` with a source for every number.
- **Decisions and why:** training restrooms only, so nothing is tuned on validation or test; the card states the 30/30 caveat first.
- **What I learned / can explain at the defense:** why the app's Match is a different problem from the IOAI benchmark, and what a model card has to say (intended use, out of scope, limits).
- **AI use:** Claude Code (Claude Opus 5.5); entry in `docs/AI-USAGE-LOG.md`.
- **Open questions / next:** Tair may quote 0.976 on the Match page (W-25).

### 2026-11-11 · C-20 (#201), C-21 (#202), R-25 (#234), C-8 (#18), C-23 (#204) · Restroom issues
- **Status:** done locally, not merged. C-8 waits for Alizhan's review; R-24 and R-25 wait for me to confirm the slides in the chat.
- **What I did:** exact intervals and paired tests; the pipeline one query at a time; slide 8's interval and per-query lines; the pipeline in the API's Match; the step-by-step ablation table.
- **Result:** 30/30 → 95 % interval 0.884–1.000; the pipeline beats the zero-shot baseline (p 0.016) but not provably R3 (p 0.25). One query at a time: 0.929 on training episodes, 10/10 validation, 30/30 test. The API now finds the pair: 10/10 on validation, 12/12 on the app's real signs, about 0.4 s per request.
- **Decisions and why:** the own-original threshold 0.95 was chosen on the training crops only, never on validation or test. The API serves the per-query variant, because it answers one query at a time.
- **What I learned / can explain at the defense:** why 30/30 is not proof (interval, paired test, the benchmark's structure); why the global assignment is transductive; why the old gender filter failed (one wrong gender breaks the match).
- **AI use:** Claude Code (Claude Opus 5.5); entry in `docs/AI-USAGE-LOG.md`.
- **Open questions / next:** Alizhan reviews `api/`; Tair reviews the web copy; I confirm slides 7 and 8 in the chat and practise the study card.

### 2026-11-11 00:15 · IOAI pairs page on the website
- **Status:** done locally (lint, type check, tests and a production build pass); not merged.
- **What I did:** Added the page `/app/restrooms/ioai` to the web app: pick a sign from the IOAI validation or test set and see the crop's original, the pair our pipeline found, the IOAI answer, what zero-shot CLIP alone picks, and the step-2 ranking. `ml/restroom/export_pairs.py` stores the pipeline's answers and resized images for it.
- **Result:** the page shows 10/10 on validation and 30/30 on test, the same answers as `pipeline.json`; a web test checks the counts, numbers and image files.
- **Decisions and why:** stored results instead of a live call, because the site runs on Vercel with no Python; the page says so. The live version is `demo.py` on a laptop.
- **What I learned / can explain at the defense:** the same two steps as the demo, now on the public site.
- **AI use:** Claude Code (Claude Opus 5.5); entry in `docs/AI-USAGE-LOG.md`.
- **Open questions / next:** Tair reviews the page (web/ is his lane).

### 2026-11-10 23:30 · C-10 (#20) · Local pair-finder demo on the IOAI data
- **Status:** done (local only, not in the web app).
- **What I did:** Added `ml/restroom/demo.py`, a Gradio page: pick a query crop from the IOAI validation or test set and the final pipeline finds its pair live, showing each step, the IOAI answer and what zero-shot CLIP alone picks.
- **Result:** the demo reproduces the stored pipeline answers (10/10 validation, 30/30 test; the CLIP baseline 8/10 and 23/30).
- **Decisions and why:** a standalone page in my own folder instead of a tab in `api/gradio_app.py` or changes to the web app, which are other lanes' files; real IOAI signs in the web app stay C-13.
- **What I learned / can explain at the defense:** how step 1 (exact copy detection with SIFT and a pixel check) and step 2 (style similarity) split the task, on any query the examiner picks.
- **AI use:** Claude Code (Claude Opus 5.5) wrote the page; entry in `docs/AI-USAGE-LOG.md`.
- **Open questions / next:** show it at the defense next to the web app if there is time.

### 2026-11-10 23:00 · C-12 (#37) · Pipeline and layer results in the export
- **Status:** in progress: the export and docs are done; the page side is W-25 (Tair) and `served` waits for C-8.
- **What I did:** Added row R7 (the two-step pipeline), a `pipeline` block with every approach and a `layers` table to `web/data/restroom-experiments.json`, documented both selection rules, and the new fields in ARCHITECTURE.md 2b.
- **Result:** R7 shows 1.0 on validation and test in the model page table; the champion stays R3 under the run rule. `served` is null with a note.
- **Decisions and why:** `served` is not "R7", because the API's Match does not run the pipeline yet; writing "R7" would describe the app wrongly. R7 has no gender accuracy, because it has no gender model; borrowing one from another run would mix two models.
- **What I learned / can explain at the defense:** The run table answers how many layers to train; the pipeline is a separate choice, made on training episodes and validation before the test score was read.
- **AI use:** Claude Code (Claude Opus 5.5); entry in `docs/AI-USAGE-LOG.md`.
- **Open questions / next:** Tair: pipeline card and layer table (W-25), and R7's empty gender and latency cells read "not run yet" where "not applicable" is meant. C-8: make the API run the pipeline, then set `served` to "R7".

### 2026-11-10 22:30 · C-3 (#14), C-5 (#16), C-6 (#17), C-9 (#19), C-11 (#36) · Restroom bare-minimum tasks
- **Status:** C-3, C-5, C-6 and C-11 done; C-4 and C-10 cut; C-9 in progress (card written, practice not done); C-12 part done; C-8 and C-13 blocked on S-1 (#21).
- **What I did:** Ran R4 on my laptop CPU, exported every run to the web app's model page with R5 cut, drew the slide figures the C-6 issue asks for, and wrote the study card. Earlier the same day: the two-step pipeline and the layer sweep on a Kaggle GPU.
- **Result:** R4: validation 10/10, test 30/30, gender 0.643; the champion stays R3 by the fixed rule. `web/data/restroom-experiments.json` has no placeholders (`isMock` false). Figures: `runs_matching.png`, `gender_heads.png`, `failures_r3.png`, `failures.png`. Card: `ml/restroom/STUDY-CARD.md`. All on branch `restroom/layer-experiment`, not merged yet.
- **Decisions and why:** R5 and the Gradio tab are cut, as the cut order in TASKS.md says; the layer sweep answers the layer question with much more evaluation data than one augmentation run. Query 14 is left off the failure figures because its sign has offensive words on it.
- **What I learned / can explain at the defense:** Training more layers helps matching only up to a point and then overfits; it also erases what CLIP knew about gender. With 10 validation and 30 test queries, one or two queries of difference is noise.
- **AI use:** Claude Code (Claude Opus 5.5) ran the scripts, wrote the code, figures and drafts; entry in `docs/AI-USAGE-LOG.md`.
- **Open questions / next:** practise the study card with a teammate (C-9); copy the R4 weights to Drive; C-12's R7 row in the export; C-8 and C-13 after S-1.
