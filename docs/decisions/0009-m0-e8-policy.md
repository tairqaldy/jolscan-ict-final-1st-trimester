# 0009. Finalize M-0 E8 settings independently of champion selection

- **Date:** 2026-11-11
- **Decided by:** Amina
- **Task / issue:** M-0 (#49)
- **Status:** final revision accepted before E1-E7 start, per Amina's team confirmation

## Context and revision history
The initial issue proposal and first PR draft retained E0 as champion when no E1/E3/E4/E7 change qualified. Amina initially accepted that override, and the draft documented its conflict with the exporter. Before comparison runs, Amina explicitly revised the decision: remove the champion override and retain E0 settings for E8 only.

## Options
1. Override general champion selection and automatically retain E0 when no combination change qualifies.
2. Keep E8 construction separate from general champion selection, including ablations among eligible completed runs.

## Final decision and why
Amina selects option 2, superseding the earlier draft decision. [The selection rule](../ML-EXPERIMENT.md#selection-rule-task-m-0) states the complete E8 policy in one paragraph. Champion selection always uses validation mAP50, ties within 0.01 resolved by validation recall at confidence 0.40, across eligible completed runs including E2/E5. Smoke runs are excluded. This removes the earlier exporter mismatch without changing the established champion policy.

## Timing and consequences
Amina confirms from current team information that E1-E7 have not started and authorizes this revision and merge before they start. This is a team report, not an independently observed run log; no start time is invented. Actual commit and merge timestamps are recorded in [PR #369](https://github.com/tairqaldy/qarau-ict-final-1st-trimester/pull/369). Keep E1-E7 stopped until the final policy is on main. E0 remains Tair's task. The exporter additionally excludes JSON smoke-flagged results even under full-run filenames; three offline regression tests cover exclusion, smoke-only input, and ablation eligibility. No training or frozen-data change is made.
