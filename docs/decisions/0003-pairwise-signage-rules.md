# 0003. Signage rules compare the two doors instead of judging each sign

- **Date:** 2026-11-10
- **Decided by:** Tair, from measurements on the IOAI training set (C-7)
- **Task / issue:** C-7
- **Status:** decided

## Context
The first rules judged each sign alone (S1: confidence ≥ 0.80; S2: the predicted genders differ). On the 82 IOAI training restrooms with zero-shot CLIP ViT-B/32, both signs were classified correctly in only 57% of real restrooms, so the old S2 called 39% of correctly signed restrooms "confusing".

## Options
1. Keep per-sign rules and lower the thresholds.
2. Compare the two doors: the sign with the higher P(male) is the men's door; rules use the gap between the two P(male) values.

## Decision
Option 2, with S1 gap ≥ 0.20, S2 gap ≥ 0.05, S3 similarity ≥ 0.88.

## Why
The pairwise reading is right for 90% of training restrooms; every pair with a gap ≥ 0.20 was read the right way round; S3 at 0.88 keeps 95% of real pairs and flags 89% of mismatched ones (0.75 flagged 1%). Evidence: `ml/restroom/pair_separation.py`, `ml/results/restroom/pair_separation.json`. Only training data was used.

## Consequences
RULES.md part 2, `web/lib/signage`, the rules page and the demo samples changed. S2 is a weak detector of truly confusing pairs; the IOAI data has none to test it on (stated in RULES.md).
