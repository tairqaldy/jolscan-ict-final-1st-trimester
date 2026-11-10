# Design brief

For Tair and Dameli. The scaffold in `web/` gives working pages on a neutral starting look. This brief says what each page must do, what "done" means, and where the references plug in.

## Direction

**To be filled in by Tair (task W-3):** three to eight reference links, the palette, the fonts, and two sentences on the mood.

Starting point until then: asphalt and road markings. Graphite and stone neutrals, one signal accent in road-sign amber, five severity colours. Calm, technical, readable. The product is a work tool for a road-maintenance dispatcher, and the landing page is the only place that sells.

## Where the look lives

All colours, radii, shadows, fonts and motion timings are tokens in one file in `web/` (see `web/README.md` for the path). Components never use raw colour values. Changing the look means changing tokens, then checking the `/design` page in light and dark.

## Usability requirements

Written the way Lab 3 asks: user, task, measurable criterion.

| # | Requirement | Check |
|---|---|---|
| U1 | A first-time user gets from the landing page to an analysis result in at most 2 screens and 3 clicks | Count on the deployed site |
| U2 | On the mock provider, the result appears within 2 seconds. On the local model, within 10 seconds, with visible progress the whole time | Stopwatch |
| U3 | Every status is shown in text or icon as well as colour: severity, provider state, errors | Greyscale screenshot still readable |
| U4 | Text contrast is at least 4.5:1 in both themes | Browser contrast checker |
| U5 | The whole analyze flow works with the keyboard only, with a visible focus ring | Tab through it |
| U6 | Tap targets are at least 48×48 px on mobile | Inspect at 375 px width |
| U7 | When the model service is down, the user sees what happened and one action to fix it | Stop the API and try |
| U8 | A user can tell demo data from real data on every page | "Demo data" badge visible |

## Heuristics to apply (Lec3-HCI)

| Heuristic | Where it shows in Qarau |
|---|---|
| Visibility of system status | Upload progress, provider badge in the shell, health check in Settings |
| Match with the real world | Severity words a dispatcher uses, target times in hours and days, not scores alone |
| User control and freedom | Remove a photo before analysis, reset rules to defaults, clear demo data |
| Consistency and standards | One severity colour scale everywhere: badges, charts, map markers |
| Error prevention | File type and size checked before upload, confirm before reset |
| Recognition over recall | Sample photos to click, rule cards that state the rule in plain words |
| Flexibility and efficiency | Drag and drop, paste, and click to upload |
| Aesthetic and minimalist design | Landing page with one primary action. Dashboard shows four numbers first |
| Help users recover from errors | Plain-language errors with a next step |
| Help and documentation | About page, and a short explanation next to each metric on the Model page |

Fitts's Law: the primary action is large and near where the eye lands. Hick's Law: Settings and Rules reveal advanced options only on demand.

## Pages

Each page needs four states: loading, empty, error, and filled.

| Route | Purpose | Must show | Done when |
|---|---|---|---|
| `/` | Explain and sell in ten seconds | Headline, one primary action, animated detection demo, three steps, features, results teaser, team | Reads top to bottom without scrolling back. Works at 375 px |
| `/app` | The dispatcher's morning view | Four KPI tiles, severity distribution, recent analyses, review queue, hotspots | The most urgent item is visible without scrolling on a laptop |
| `/app/analyze` | The core flow | Upload, samples, metadata, result with boxes, severity, rule hits, action, raw JSON | U1, U2, U5, U7 pass |
| `/app/reports` and `/app/reports/[id]` | History | Filters, table, detail with photo and rule hits | A filtered list survives a page reload |
| `/app/analytics` | Trends and model health | Detections over time, severity breakdown, confidence histogram, latency by provider, model comparison | Every chart has a title, labelled axes, and a zero baseline where bars are used |
| `/app/map` | Where the damage is | Markers by severity, popup with link | Still usable if map tiles fail to load |
| `/app/rules` | Make the logic visible and editable | Six rule cards, thresholds, live preview, reset | Changing a value changes the preview at once |
| `/app/model` | The research result | Experiments table, champion, dataset card, metric explanations, lifecycle | Numbers come from `web/data/experiments.json` only |
| `/app/settings` | Control | Provider and health, threshold, privacy, theme, export, reset | Health check has clear up and down states |
| `/about` | Method and honesty | Method, limitations, privacy, dataset and licence, AI use, team | No placeholder text |
| `/design` | The design system | Tokens, type scale, every component and state, both themes | Dameli signs off |

## Charts (Lec4 visualisation decks)

- Bars for categories (severity breakdown, model comparison), with a zero baseline.
- Line for time (detections per day).
- Histogram for distributions (confidence, latency).
- No pie chart with more than four slices. No 3D, no dual axes.
- Severity colours carry meaning, so other series use neutral tones.
- Every chart: title that states the takeaway, axis labels with units, tooltip with exact values.

## Motion

| Where | What | Duration |
|---|---|---|
| Landing sections | Fade and rise on entry, staggered | 400–600 ms |
| Detection demo and result | Boxes draw in one by one, then labels | 300 ms each |
| KPI tiles | Numbers count up once | 800 ms |
| Page changes | Short cross-fade | 150–200 ms |
| Hover and press | Small scale or tint | 100–150 ms |

Motion explains what happened. It never blocks input, never loops without reason, and is switched off under `prefers-reduced-motion`.

## Final checks before feature freeze

- [ ] U1–U8 pass.
- [ ] Light and dark themes checked on every page.
- [ ] 375 px, 768 px and 1440 px widths checked.
- [ ] No placeholder text, no mock number shown without the "Demo data" badge.
- [ ] Favicon, page titles, social preview image.
- [ ] Screenshots exported for the deck.
