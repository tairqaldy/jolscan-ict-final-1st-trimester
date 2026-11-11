# Worklog: Amina

**Lane:** Pothole data, model and rules. Tasks suggested for Amina: see the personal tracker issue and `docs/TASKS.md`.

## Summary for the defense

Fill this in by the code freeze (Wed 23:00). Three to six bullets: what I built or decided, the evidence (links), and the two things I can explain best.

- 

## Entries

<!-- Newest first. Copy the entry template from docs/worklog/README.md. -->

### 2026-11-11 · M-1 (#50) · Prepare validation-only smoke run
- **Status:** complete; Tair accepted the validation-only smoke criterion in [the issue comment](https://github.com/tairqaldy/qarau-ict-final-1st-trimester/issues/50#issuecomment-6789955660), and the work merged in [PR #349](https://github.com/tairqaldy/qarau-ict-final-1st-trimester/pull/349).
- **What I did:** Updated `ml/train.py` so the one-epoch smoke path uses a temporary train/validation-only YAML, emits validation metrics, records the code commit, and saves the real training CSV. Added isolated tests and a Colab notebook for the user to run.
- **Result:** The attached Colab evidence contains the actual [smoke JSON](../../ml/results/runs/E0-smoke.json) and [epoch CSV](../../ml/results/runs/E0-smoke-results.csv), produced in a one-epoch Tesla T4 run from trainer commit `3004fdfe8f59e7a261743ec01c390e40d811d791`. The reported MLflow run `de59363e3bcd42389b608c2321690ca6` is FINISHED. The full E0 baseline is a separate run (M-3).
- **Decisions and why:** Keep test unavailable to smoke, as requested, because the project reserves it for final evaluation. Tair accepted validation-only metrics for M-1; no test metric is required for the smoke check.
- **What I learned / can explain at the defense:** A smoke test checks that the training and validation pipeline completes; it is not the final model evaluation. The CSV's training-loop validation metrics and JSON's separate post-training validation metrics are different measurements.
- **AI use:** Copilot SDK in VS Code assisted with code, tests, notebook and documentation; details in `docs/AI-USAGE-LOG.md`.
- **Open questions / next:** The full E0 baseline is a separate task (M-3); this smoke run does not replace it.
