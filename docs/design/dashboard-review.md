# Dashboard review against Nielsen's ten heuristics (G-9, #126)

Reviewer: Dameli, 11 November 2026. Pages: `/app`, `/app/roads`, `/app/restrooms` and the top of `/app/analytics`. Viewports 1440 × 900 and 375 × 812 (plus 1366 × 768 for the fold, 320 and 1024 for the KPI fit), light and dark theme, Mock provider, Reduce motion on for the shots so count-ups have finished. Heuristics table: `docs/DESIGN-BRIEF.md`, "Heuristics to apply (Lec3-HCI)".

Screenshots are in `docs/design/dashboard-review-g9/` (`SS/` below). `before-<page>-<width>-<theme>.png` is the viewport as reviewed; `after-*.png` shows a fix. Each decision is one of: **pass**, **fixed** (in this PR), **suggested to <owner>** (not my layer), **n/a**.

Order changes on the pages are W-7 (#108, Tair's lane), so they are suggestions here, not edits.

## Measured hierarchy (light, top of element from the page top, CSS px)

| Page | 1440 × 900 fold | 1366 × 768 fold | First review-queue item | KPI numbers |
|---|---|---|---|---|
| `/app` | 900 | 768 | no queue; KPI row 726 to 880 | half visible at 1440, below the fold at 375 (y about 1000) |
| `/app/roads` | 900 | 768 | 1034 (below both folds) | 203 to 358, first on the page |
| `/app/restrooms` | 900 | 768 | 834 at 1440 (visible), 911 at 1366 (below) | 342 to 497; at 375 below the fold, under the explainer card |
| `/app/analytics` | 900 | 768 | n/a | n/a; first chart at 374 |

## /app (Home)

| # | Heuristic | Decision | Note | Screenshot |
|---|---|---|---|---|
| 1 | Visibility of system status | pass | Provider badge in the sidebar and again in "Shared by both modules" and in the demo path; "Includes demo data" under the title. | `SS/before-app-1440-light.png` |
| 2 | Match with the real world | pass | KPI notes in the user's words: "high or critical", "replace signs", "check on site". | `SS/before-app-1440-light.png` |
| 3 | User control and freedom | pass | The demo path has Hide and "Show the demo path". | `SS/before-app-1440-light.png` |
| 4 | Consistency and standards | **fixed** | The KPI tiles had a shadow and looked more raised than the link cards under "Shared by both modules", which had none and no arrow: the static tiles read as buttons, the links did not. Now the nested tiles are flat (`Kpi nested`), every link row and card has the same hover, press and focus feedback, and the shared cards end in an arrow. | `SS/after-app-roads-panel-light.png`, `SS/after-app-shared-hover-focus-light.png` |
| 4b | Consistency and standards | suggested to G-76 (brand) | In "Roads · Pothole detection", the eyebrows and "About · ICT1103" the middle dot sits against the next word (font spacing of `·`). A thin space or a different separator would read better. | `SS/before-app-1440-light.png` |
| 5 | Error prevention | n/a | No input on this page. | |
| 6 | Recognition over recall | pass | Each module card lists its pages as labelled buttons; the demo path is numbered. | `SS/before-app-1440-light.png` |
| 7 | Flexibility and efficiency | suggested to Tair | "See all" under "Latest sign checks" opens `/app/restrooms`, which lists the newest 12 of 30, not all. Either label it "Open Restrooms" or add a full list. The "To review" tile could link to `/app/roads/reports?review=1` (that filter exists). | `SS/before-app-1440-light.png` |
| 8 | Aesthetic and minimalist design | suggested to Tair (W-7) | The demo path card comes before both modules, so at 1440 × 900 the KPI numbers are only half visible and at 375 they start after seven demo steps. Put the module cards first and the demo path under them (or collapse it to one line on phones). | `SS/before-app-1440-light.png`, `SS/before-app-375-light.png` |
| 8b | Aesthetic and minimalist design | **fixed** | KPI numbers overflowed their tiles at 320 px (by 14 px). The number now steps down on phones; see "KPI numbers" below. | `SS/kpi-after.txt` |
| 9 | Help users recover from errors | n/a | No error path here; the provider error lives on Analyze and Settings. | |
| 10 | Help and documentation | pass | One sentence under each module name; each shared card says what the page holds. | `SS/before-app-1440-light.png` |

## /app/roads

| # | Heuristic | Decision | Note | Screenshot |
|---|---|---|---|---|
| 1 | Visibility of system status | pass | "Includes demo data" under the title, a Provider column in Recent analyses. | `SS/before-roads-1440-light.png` |
| 2 | Match with the real world | pass, **good example** | "Critical segments: repair within 24 h", "Median latency: model time per photo". The dispatcher reads a deadline, not a score. | `SS/before-roads-1440-light.png` |
| 3 | User control and freedom | pass | One primary action (Analyze a photo) top right; every row opens its report and the browser back returns. | `SS/before-roads-1440-light.png` |
| 4 | Consistency and standards | **fixed** | Hotspot rows had the same boxed style as the review-queue rows next to them, but they are not links. Hotspots are now a plain ranked list with dividers. Row hovers had no transition while buttons ease in 120 ms; rows now use the same timing. | `SS/after-roads-queue-hotspots-hover-light.png` |
| 5 | Error prevention | n/a | No input. | |
| 6 | Recognition over recall | pass | Severity badges carry an icon and a word, not colour alone. | `SS/before-roads-1440-dark.png` |
| 7 | Flexibility and efficiency | pass | Whole table row is clickable and the place name is a real link (keyboard); "All reports" and "Map" shortcuts. | `SS/before-roads-1440-light.png` |
| 8 | Aesthetic and minimalist design | four numbers first: pass. Urgent item: suggested to Tair (W-7) | The first review-queue item is at y = 1034, below the fold at 1440 × 900 and 1366 × 768. Move "Review queue" into the first row next to the KPIs (swap with Severity distribution), as W-7 step 3 says. | `SS/before-roads-1440-light.png` |
| 8b | Aesthetic and minimalist design | **fixed** | "63 ms" overflowed its tile at 320 (32 px), 375 (4 px) and 1024 px (16 px). Fixed with the KPI step-down. | `SS/kpi-before.txt`, `SS/kpi-after.txt` |
| 9 | Help users recover from errors | pass | The review queue has an illustrated empty state ("Nothing to review"). Recent lists cannot be empty: the seeded demo set is always merged in. | |
| 10 | Help and documentation | pass | Each card has a one-line description; "confidence ≥ 0.40" ties the count to rule R1. | `SS/before-roads-1440-light.png` |

## /app/restrooms

| # | Heuristic | Decision | Note | Screenshot |
|---|---|---|---|---|
| 1 | Visibility of system status | pass | Demo badge, Provider column. | `SS/before-restrooms-1440-light.png` |
| 2 | Match with the real world | suggested to Tair | "Need review: S1 or S3 failed" uses rule ids; a facility manager would read "a rule failed, check on site" faster. The explainer card does name S1 to S3. | `SS/before-restrooms-1440-light.png` |
| 3 | User control and freedom | pass | Two clear actions: Compare two signs (primary), Find a counterpart. | `SS/before-restrooms-1440-light.png` |
| 4 | Consistency and standards | **fixed** | Review-queue rows now have the same hover, press and focus feedback as the roads queue. Verdict colours match across KPI stripes, bars and badges. | `SS/before-restrooms-1440-dark.png` |
| 5 | Error prevention | pass, **good example** | "What it never sees. People. ... Never upload a photo taken inside a restroom." The privacy rule is stated before the first upload. | `SS/before-restrooms-1440-light.png` |
| 6 | Recognition over recall | pass | Both sign thumbnails in every table row: the pair is recognised without opening it. | `SS/before-restrooms-1440-light.png` |
| 7 | Flexibility and efficiency | suggested to Tair | "and N more in the table." has no link, and the table is sorted by date, not verdict. Link it or show the whole queue. (Not visible with the demo set: 5 items.) | |
| 8 | Aesthetic and minimalist design | suggested to Tair (W-7) | The explainer card sits between the title and the four KPIs. At 375 the KPIs start below the fold; at 1366 × 768 the first queue item is at 911. Put the KPIs first and the explainer under the review queue or in a "How it works" disclosure; move the review queue above Verdicts. | `SS/before-restrooms-375-dark.png` |
| 9 | Help users recover from errors | pass | Empty queue has the illustrated empty state. | |
| 10 | Help and documentation | pass | The three-part explainer (does, decides, never sees). | `SS/before-restrooms-1440-light.png` |

## /app/analytics (top section)

| # | Heuristic | Decision | Note | Screenshot |
|---|---|---|---|---|
| 1 | Visibility of system status | pass, **good example** | "Includes demo data" on every chart card, and the chart says which rule decides "Counted". | `SS/before-analytics-1440-dark.png` |
| 2 | Match with the real world | pass | Legend words "Counted", "Needs review"; axis "Boxes". | `SS/before-analytics-1440-light.png` |
| 3 | User control and freedom | pass | "Show as table" under every chart. | `SS/before-analytics-1440-light.png` |
| 4 | Consistency and standards | suggested to Tair | The sidebar says "Analytics", the eyebrow says "Analytics", the H1 says "Monitoring". One name would avoid "did I land on the right page?". | `SS/before-analytics-1440-light.png` |
| 5 | Error prevention | n/a | | |
| 6 | Recognition over recall | pass | Legends pair colour and label. | |
| 7 | Flexibility and efficiency | pass | "Roads" and "Restrooms" jump links with hover feedback. | `SS/before-analytics-1440-light.png` |
| 8 | Aesthetic and minimalist design | pass | First chart starts at y = 374 at 1440 and is partly visible at 375. | `SS/before-analytics-375-light.png` |
| 9 | Help users recover from errors | n/a | | |
| 10 | Help and documentation | pass | Each chart has a sentence on what it counts and where the threshold lines are. | |

## Across pages (navigation, not my layer)

- Suggested to G-74 (nav) / Tair: at 375 on `/app/roads` the bottom bar highlights "More", because Overview is not one of its tabs. `SS/before-roads-375-light.png`.
- W-7 step 5 checks: the "Median latency" note says "model time per photo" (pass) and "Includes demo data" shows on all three overview pages (pass).

## KPI numbers (coordinator follow-up)

`web/components/app/kpi.tsx` now sets the number to `text-3xl sm:text-4xl lg:text-3xl xl:text-5xl` (36, 48, 36, 64 px). The step at `lg` is where the sidebar appears and the roads row turns into four tiles. `SS/kpi_fit.py` measures, for every tile, the gap between the number's right edge and the tile's padding edge:

| Width | Before (worst gap) | After |
|---|---|---|
| 320 | `/app` "40" −13.8 px, `/app/roads` "63 ms" −31.8 px | +1.0 px, +2.2 px |
| 375 | `/app/roads` "63 ms" −4.3 px | +29.7 px |
| 1024 | `/app/roads` "63 ms" −15.8 px | +18.2 px |
| 1440 | all fit | unchanged (64 px, +38.5 px or more) |

Full output: `SS/kpi-before.txt`, `SS/kpi-after.txt`. The 320 px margins are small; a three-digit count on Home at 320 px would touch the edge again.

## Three good examples for slide 9 (G-13)

1. Error prevention, `/app/restrooms`: "Never upload a photo taken inside a restroom", stated before the first upload.
2. Match with the real world, `/app/roads`: "Critical segments, repair within 24 h".
3. Visibility of system status, every page: the provider badge and "Includes demo data".
