# 0009. Confirm the M-0 E8 policy and explicit E0 fallback

- **Date:** 2026-11-11
- **Decided by:** Amina
- **Task / issue:** M-0 (#49)
- **Status:** policy accepted; pre-run timing unverified

## Context
The issue proposes combining validation-qualified E1, E3, E4 and E7 changes, excluding E2/E5 ablations. Its no-qualifier E0-champion fallback can conflict with the exporter's general champion selection across all runs.

## Options
1. Keep the general champion rule even when no eligible change qualifies.
2. Make the accepted E0-champion fallback an explicit exception, and report the existing exporter mismatch.

## Decision and why
Amina explicitly selected option 2 in this task conversation. The full policy is one paragraph under the [selection rule](../ML-EXPERIMENT.md#selection-rule-task-m-0-pre-run-timing-unverified). This preserves the accepted issue proposal without silently changing code or claiming the exporter already supports it.

## Consequences
The exporter still needs reconciliation before it can claim compliance with the fallback; this PR changes no code. No E1-E7 chat start time is confirmed, so M-0 stays unchecked and pre-run timing is not claimed. The rule commit records the actual time; no training or dataset changes are part of this task.
