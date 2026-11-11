# Worklog: Amina

**Lane:** Pothole data, model and rules. Tasks suggested for Amina: see the personal tracker issue and `docs/TASKS.md`.

## Summary for the defense

Fill this in by the code freeze (Wed 23:00). Three to six bullets: what I built or decided, the evidence (links), and the two things I can explain best.

- 

## Entries

### 2026-11-11 13:13 +05:00 · M-0 (#49) · Confirm selection and E8 combination rule
- **Status:** in progress; rule documented, pre-run timing unverified.
- **What I did:** Compared the selection rule with `ml/export_results.py` and traced rules confidence to `RULES_CONF = 0.40` in `ml/train.py`. Recorded the accepted E8 policy without changing code, training, or the frozen dataset.
- **Result:** [Rule commit d050b38](https://github.com/tairqaldy/qarau-ict-final-1st-trimester/commit/d050b38f2510ba36be09794864126e831eb3a52a), authored 2026-11-11 13:13:01 +05:00; rebased/committed 2026-11-11 13:16:26 +05:00, changes only `docs/ML-EXPERIMENT.md`. Claim was pushed separately to main as `b243944`.
- **Decisions and why:** Amina accepted the issue's E8 policy and explicitly confirmed that retaining E0 when no eligible change qualifies overrides the general champion rule. The exporter does not implement that override; the mismatch is documented, not silently changed. See [decision 0009](../decisions/0009-m0-e8-policy.md).
- **What I learned / can explain at the defense:** E8 qualification uses a strict improvement above 0.01 against E0; champion ties use an inclusive 0.01 band from the best validation mAP50 and then validation recall at confidence 0.40. Test metrics never select changes or the champion.
- **AI use:** Codex assisted with repository/issue inspection and documentation; see `docs/AI-USAGE-LOG.md`.
- **Open questions / next:** Amina is asking the team for the earliest E1-E7 start time. The inspected main contains E0 and smoke results; no absence-of-start claim follows. Compare actual main commit/merge timing with that evidence before ticking M-0. Exporter fallback support remains unresolved; no training was started.


<!-- Newest first. Copy the entry template from docs/worklog/README.md. -->

### 2026-11-11 · M-1 (#50) · Prepare validation-only smoke run
- **Status:** in progress; validation-only smoke succeeded; issue-criteria alignment remains open.
- **What I did:** Updated `ml/train.py` so the one-epoch smoke path uses a temporary train/validation-only YAML, emits validation metrics, records the code commit, and saves the real training CSV. Added isolated tests and a Colab notebook for the user to run.
- **Result:** The attached Colab evidence contains the actual [smoke JSON](../../ml/results/runs/E0-smoke.json) and [epoch CSV](../../ml/results/runs/E0-smoke-results.csv), produced in a one-epoch Tesla T4 run from trainer commit `3004fdfe8f59e7a261743ec01c390e40d811d791`. The reported MLflow run `de59363e3bcd42389b608c2321690ca6` is FINISHED. The full E0 baseline has not been run.
- **Decisions and why:** Keep test unavailable to smoke, as requested, because the project reserves it for final evaluation. Issue #50 still requires test metrics for `E0-smoke`, so its acceptance criteria need alignment.
- **What I learned / can explain at the defense:** A smoke test checks that the training and validation pipeline completes; it is not the final model evaluation. The CSV's training-loop validation metrics and JSON's separate post-training validation metrics are different measurements.
- **AI use:** Copilot SDK in VS Code assisted with code, tests, notebook and documentation; details in `docs/AI-USAGE-LOG.md`.
- **Open questions / next:** Resolve #50's `test_map50` acceptance criterion. Do not mark M-1 complete or the full E0 baseline done until the criterion is reconciled and remaining required checks pass.
