# 0007. Keep the M-1 smoke run validation-only

- **Date:** 2026-11-11
- **Decided by:** Amina
- **Task / issue:** M-1 (#50)
- **Status:** decided

## Context
Issue #50 asks the one-epoch `E0-smoke` run to report 12 metrics, including `test_map50`. The experiment protocol reserves test for the final evaluation, and D-20 verified that the 100-image D-2 review sample is identical to the test split.

## Options
1. Evaluate test during `E0-smoke` to satisfy the issue's current metric checklist, before the full E0 run.
2. Keep the smoke check to train and validation, and ask the team to align the issue acceptance criteria.

## Decision
Use train and validation only during the one-epoch smoke check; make the temporary smoke data config omit the test split.

## Why
This preserves the test split for final evaluation and follows the project rule that test data must not influence model choices. The selection rule uses validation metrics only.

## Consequences
The smoke result has six validation metrics and no `test_map50`. Tair explicitly accepted the validation-only smoke criterion in [the issue comment](https://github.com/tairqaldy/qarau-ict-final-1st-trimester/issues/50#issuecomment-6789955660), and the completed implementation was merged in [PR #349](https://github.com/tairqaldy/qarau-ict-final-1st-trimester/pull/349). M-1 is complete; a test metric is not required for smoke. This one-epoch smoke check is not the full E0 baseline, which remains M-3.
