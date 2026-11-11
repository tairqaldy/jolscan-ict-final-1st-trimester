# Worklog: Amina

**Lane:** Pothole data, model and rules. Tasks suggested for Amina: see the personal tracker issue and `docs/TASKS.md`.

## Summary for the defense

Fill this in by the code freeze (Wed 23:00). Three to six bullets: what I built or decided, the evidence (links), and the two things I can explain best.

- 

## Entries

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
- **Status:** in progress; validation-only smoke succeeded; issue-criteria alignment remains open.
- **What I did:** Updated `ml/train.py` so the one-epoch smoke path uses a temporary train/validation-only YAML, emits validation metrics, records the code commit, and saves the real training CSV. Added isolated tests and a Colab notebook for the user to run.
- **Result:** The attached Colab evidence contains the actual [smoke JSON](../../ml/results/runs/E0-smoke.json) and [epoch CSV](../../ml/results/runs/E0-smoke-results.csv), produced in a one-epoch Tesla T4 run from trainer commit `3004fdfe8f59e7a261743ec01c390e40d811d791`. The reported MLflow run `de59363e3bcd42389b608c2321690ca6` is FINISHED. The full E0 baseline has not been run.
- **Decisions and why:** Keep test unavailable to smoke, as requested, because the project reserves it for final evaluation. Issue #50 still requires test metrics for `E0-smoke`, so its acceptance criteria need alignment.
- **What I learned / can explain at the defense:** A smoke test checks that the training and validation pipeline completes; it is not the final model evaluation. The CSV's training-loop validation metrics and JSON's separate post-training validation metrics are different measurements.
- **AI use:** Copilot SDK in VS Code assisted with code, tests, notebook and documentation; details in `docs/AI-USAGE-LOG.md`.
- **Open questions / next:** Resolve #50's `test_map50` acceptance criterion. Do not mark M-1 complete or the full E0 baseline done until the criterion is reconciled and remaining required checks pass.
