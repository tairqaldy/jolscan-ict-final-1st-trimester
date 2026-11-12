# Worklog: Amina

**Lane:** Pothole data, model and rules. Tasks suggested for Amina: see the personal tracker issue and `docs/TASKS.md`.

## Summary for the defense

Fill this in by the code freeze (Wed 23:00). Three to six bullets: what I built or decided, the evidence (links), and the two things I can explain best.

- 

## Entries

### 2026-11-12 · R-47 (#256) · Windows Roads validation and API recovery

- **Status:** in progress; my scoped run is recorded, but the shared five-device matrix and full checklist remain incomplete.
- **What I did:** with Codex automation, exercised the actual local Roads UI in installed Chrome: empty JPEG, text renamed JPEG, unsupported GIF, and 10 MiB + 1 byte upload. Coordinated a temporary API interruption, verified restart preflight, observed the Local error and successful retry, and confirmed the visible result after restoration. Earlier photo uploads were my manual observations; Codex independently replayed their exported detections through the rules engine.
- **Result:** [Device matrix and sanitized execution report](../QA-SCRIPTS.md#device-matrix-r-47), report commit `a696524`. Four invalid-file checks passed without analysis requests; API-down UI showed 503/unreachable without switching to Mock; restored E1 service returned a visible Local result. Actual commands, timestamps, expected/actual messages and pending checks are in the report.
- **Decisions and why:** used a fresh browser context and synthetic invalid inputs/white PNG; preserved existing user browser data, notebook edits and all prior branches. Kept raw exports/photos/process settings out of Git. No API or frontend change was justified by these checks. My harness had an ambiguous saved-status locator after a successful retry; a separate precise-selector run confirmed the visible restored result.
- **What I learned / can explain at the defense:** client-side rejection can prevent any API call; an HTTP-only test does not prove the UI. A 31.21% review detection is excluded from scoring; the two observed photo scores replay exactly as 8 and 3, without measuring model accuracy.
- **AI use:** Codex inspected code, drove the browser, verified rules and drafted sanitized documentation; see AI-USAGE-LOG.md. My consent covered interruption only after a verified restart procedure.
- **Open questions / next:** remaining scripts, direct API invalid uploads, mobile/other browsers, image pixel boundary and independent checkpoint provenance remain pending. No complete Roads QA or rehearsal is claimed. Tair performed full E0–E8 training; this work did not repeat training.

### 2026-11-11 - R-22 (#231), R-23 (#232) - Prepare personal Roads presentation material
- **Status:** prepared for review; personal timed reading and live rules-page check remain pending; neither task is marked complete.
- **Generator/PPTX follow-up:** The original PPTX lacked the manually edited scripts and a normal rebuild would discard them. Moved both scripts, attribution and caveats into the two generator functions; added five regression checks and the documented `--roads-only` mode. Regenerated `docs/deck/qarau-defense-deck.pptx`, SLIDES.md and only the corresponding source-index rows. Verified exact latest scripts in actual PPTX notes, repeatability, all 17 slides retained, and only slide5/slide6 plus their notes differ from the saved pre-build PPTX. PowerPoint rendered both updated slides without visible clipping. Full regeneration also refreshed the unrelated slide-10 AI-log count; scoped generation deliberately preserved that colleague-owned artifact instead.
- **Review clarification:** Traced the 0.02 cutoff to the original experiment-protocol commit `6bc6c07` and current source index; it is a project reporting policy, not evidence of statistical equivalence or a universal significance threshold. Both spoken scripts now explicitly preserve that distinction and unresolved rights for individual watermarked photos despite dataset-level ODbL/DbCL metadata. Word counts remain 127/90; no personal timed rehearsal or Rules-page result has been supplied.
- **What I did:** Updated only Slides 5 and 6 in `docs/deck/SLIDES.md`, preserving the existing structure and time budgets. Distinguished my dataset review/preparation, duplicate/XML checks, invalid-annotation correction, YOLO export, clustering, M-0 and successful M-1 smoke from Tair's full E0-E8 training.
- **Result:** [Slide 5](../deck/SLIDES.md#slide-5--roads-data-and-experiment) and [Slide 6](../deck/SLIDES.md#slide-6--roads-results), each committed separately. Speaker scripts are 127 and 90 words; estimates at the document's rate are 58.6 and 41.5 seconds, not measured rehearsal times.
- **Decisions and why:** Keep slide faces concise and detailed attribution/evidence in Cues and Sources. Replace the ambiguous "test read once" statement with reporting-only selection language and explain the prior D-2/test overlap and multiple evaluation passes. E8 construction remains separate from champion selection, and apparent box size is not physical severity.
- **Verification:** Checked every run-table value against JSON/CSV, champion and E8 qualification arithmetic, manifest totals, smoke split exclusion, operating-point counts/settings/ratios, cluster thresholds and rules example arithmetic. Confirmed all text outside Slides 5-6 and existing source-index mappings remain unchanged. `ml/check_results.py`, five `test_check_results.py` tests and `git diff --check` passed. No training, model-result regeneration, browser QA or rehearsal was performed; the later explicit generator/PPTX follow-up is recorded above.
- **What I can explain at the defense:** My personal contribution and its limits, why E1 wins the validation tie-break, and why fixed-threshold operating-point counts cannot be mixed with Ultralytics' different pass.
- **AI use:** Codex assisted with source checks and wording; see AI-USAGE-LOG.md.
- **Open questions / next:** Amina reads the scripts aloud with a timer; the worked example still needs the requested live rules-page check in later QA. Tair/Roma review the notes and numerical sources. Latest scripts now live in make_deck.py and survive regeneration. Use `python docs/deck/make_deck.py --roads-only` to update just existing Roads artifacts; it refuses shared-resource changes and preserves other slide/notes parts and source rows. Build dependencies were installed only in `.worktrees/deck-venv` (python-pptx 1.0.2, matplotlib 3.11.2, Pillow 13.0.0, lxml 6.1.3). M-18 rehearsal remains incomplete.



### 2026-11-11 ? M-37 (#195) ? Why not accuracy
- **Status:** complete in this PR; M-18 timed practice remains incomplete.
- **What I did:** Verified photo/object counts from the frozen manifest and the R1 gender confusion matrix, added a five-sentence explanation to ML-EXPERIMENT.md and a two-sentence answer for R-5/M-18 in PRESENTATION.md.
- **Result:** [Why not accuracy](../ML-EXPERIMENT.md#why-not-accuracy): an always-positive image answer is 100/100 correct on presence while locating no boxes. Train/val/test contain 465/100/100 photos, zero without potholes, with per-photo object ranges 1-18 / 1-19 / 1-14. R1 gender rows sum to 164/164.
- **Decisions and why:** Separate image-presence accuracy from box detection and fixed-label classification; do not describe the issue as ordinary class imbalance or alter selection policy.
- **What I learned / can explain at the defense:** A perfect answer to the easier presence question does not measure whether a detector finds and localizes objects. Background regions have no unique count for detection true negatives.
- **AI use:** Codex assisted with inspection and wording, logged in AI-USAGE-LOG.md.
- **Verification / next:** Manifest and R1 assertions passed; ml/check_results.py passed and five test_check_results.py tests passed; git diff --check passed. No training or evaluation rerun. Roma can use the sourced answer in R-5; real timed teammate practice remains required for M-18.



### 2026-11-11 ? M-4 (#53) ? Prepare E1 without training
- **Status:** in progress; compatibility confirmation required before training.
- **What I did:** Claimed available E1 for omodotori, compared the actual E0 tagged trainer and explicit JSON configuration with E1, and prepared [separate Colab instructions](../E1-COLAB.md).
- **Result:** Only model weights and descriptive change label differ in effective E0/E1 settings. Trainer and requirements match e0-trainer. Existing M-1 notebook is smoke-only and was preserved.
- **Decisions and why:** Do not run Colab until Tair confirms resolved E0 args, environment, archive identity and MPS/CUDA comparability. Do not duplicate E0 or overwrite smoke/results evidence.
- **What I learned / can explain at the defense:** Matching explicit hyperparameters does not prove identical framework defaults, augmentations or hardware behavior. E1 tests model size with the same frozen split and budget.
- **AI use:** Codex assisted with inspection and the runbook; see AI-USAGE-LOG.md.
- **Open questions / next:** Tair's actual command, args.yaml, package versions, dataset hash and approved source/backend compatibility are still needed. No training or result is claimed.



### 2026-11-11 ? M-0 (#49) ? Final selection and E8 policy
- **Status:** complete on merge of [PR #369](https://github.com/tairqaldy/qarau-ict-final-1st-trimester/pull/369), subject to green checks and current main.
- **What I did:** Confirmed the validation-only champion rule and documented E8 qualification. Revised the earlier E0-champion override before comparison runs, then added smoke-flag filtering to the exporter with three offline regression tests.
- **Result:** The final rule is in `docs/ML-EXPERIMENT.md`; PR #369 records actual commit/merge timestamps. Claim-only main commit remains `b243944`. The exporter includes E2/E5 in champion selection and excludes smoke by filename and JSON flag.
- **Decisions and why:** Amina's final authorization removes the earlier E0-champion exception: no qualifying change means E8 uses E0 settings, while champion selection still considers every eligible completed run. See [decision 0009](../decisions/0009-m0-e8-policy.md).
- **What I learned / can explain at the defense:** E8 qualification requires a strict validation mAP50 gain above 0.01 against E0; champion ties use an inclusive 0.01 band from the best and validation recall at confidence 0.40. Ablations may win champion selection without being combined into E8; test metrics never select either.
- **AI use:** Codex assisted with inspection, documentation, the smoke exclusion and tests; see `docs/AI-USAGE-LOG.md`.
- **Timing evidence / next:** Amina confirms from current team information that E1-E7 have not started and authorizes this final revision and merge before starting them. This is team confirmation, not independent training-log evidence. E0 belongs to Tair. No training was started; keep E1-E7 stopped until the rule is on main.
- **Checks:** Three `python -m unittest ml.test_export_results` tests passed; `python -m compileall -q ml api` and `git diff --check` passed. Tests export fixtures only into a temporary directory, without training or dataset changes.

<!-- Newest first. Copy the entry template from docs/worklog/README.md. -->

### 2026-11-11 · M-1 (#50) · Prepare validation-only smoke run
- **Status:** complete; Tair accepted the validation-only smoke criterion in [the issue comment](https://github.com/tairqaldy/qarau-ict-final-1st-trimester/issues/50#issuecomment-6789955660), and the work merged in [PR #349](https://github.com/tairqaldy/qarau-ict-final-1st-trimester/pull/349).
- **What I did:** Updated `ml/train.py` so the one-epoch smoke path uses a temporary train/validation-only YAML, emits validation metrics, records the code commit, and saves the real training CSV. Added isolated tests and a Colab notebook for the user to run.
- **Result:** The attached Colab evidence contains the actual [smoke JSON](../../ml/results/runs/E0-smoke.json) and [epoch CSV](../../ml/results/runs/E0-smoke-results.csv), produced in a one-epoch Tesla T4 run from trainer commit `3004fdfe8f59e7a261743ec01c390e40d811d791`. The reported MLflow run `de59363e3bcd42389b608c2321690ca6` is FINISHED. The full E0 baseline is a separate run (M-3).
- **Decisions and why:** Keep test unavailable to smoke, as requested, because the project reserves it for final evaluation. Tair accepted validation-only metrics for M-1; no test metric is required for the smoke check.
- **What I learned / can explain at the defense:** A smoke test checks that the training and validation pipeline completes; it is not the final model evaluation. The CSV's training-loop validation metrics and JSON's separate post-training validation metrics are different measurements.
- **AI use:** Copilot SDK in VS Code assisted with code, tests, notebook and documentation; details in `docs/AI-USAGE-LOG.md`.
- **Open questions / next:** The full E0 baseline is a separate task (M-3); this smoke run does not replace it.
