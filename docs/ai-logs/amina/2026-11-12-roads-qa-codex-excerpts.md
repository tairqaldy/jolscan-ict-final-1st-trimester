# Codex prompt excerpts: Amina's Roads QA, 12 November 2026

Sanitized excerpts from the current private conversation, not a complete transcript. Attachments, browser exports, uploaded photos, personal paths, process environment values and credentials are excluded. Full transcript archiving for X-13 remains separate.

## User instructions (verbatim excerpts)

> Record these as user-observed UI checks, not independent model accuracy measurements. Verify the score breakdown against the actual detections and current rules. Check that the 31% review detection is excluded from scoring.

> The earlier misplaced boxes were from explicitly labelled Mock results, not E1 inference. Do not report them as a model defect. Do not mark the entire QA task complete.

> Use the actual documented limits. Coordinate any API stop with me and restore the working service afterward. Do not silently switch to Mock.

> Record expected/actual behavior and actual execution evidence. Do not infer UI behavior from API tests alone. Fix only confirmed bugs on the QA branch with relevant checks.

> Do not stop the API until you have a verified restart procedure. If you cannot recover it, skip the API-unavailable test for now, record it as pending, and continue file-validation QA.

## Execution and corrections

Codex used fresh-context Chrome automation against the existing local web app, with synthetic invalid files. Four rejection checks passed without analysis POSTs. The user authorized a coordinated outage; process inspection recovered the virtual-environment launcher and non-secret model configuration. A base-Python preflight failed without disturbing the API; the correct launcher passed a second preflight before interruption. The actual UI showed 503/unreachable with Local retained. The service was restored, retry returned 200, and a separate fresh upload confirmed the visible E1 result after correcting an ambiguous test locator. Both model backends were restored to ready state.

The checked-in [QA report](../../QA-SCRIPTS.md#device-matrix-r-47) records exact messages, commands, timestamps, replayed rules and pending checks. No product defect or accuracy measurement is asserted. No application/API code was changed; full QA and rehearsal remain incomplete.
