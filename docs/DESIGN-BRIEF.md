# Design brief

For Tair and Dameli. The scaffold in `web/` gives working pages on a neutral starting look. This brief says what each page must do, what "done" means, and where the references plug in.

## Direction

**To be filled in by Tair (task W-3):** three to eight reference links, the palette, the fonts, and two sentences on the mood.

Starting point until then: asphalt and road markings. Graphite and stone neutrals, one signal accent in road-sign amber, five severity colours. Calm, technical, readable. The product is a work tool for a road-maintenance dispatcher, and the landing page is the only place that sells.

### References for the proposed direction (G-2)

Dameli selected a **calm technical** direction with graphite, warm neutrals and amber on 10 November. This is a proposal for Tair to review in W-3; it is not a completed team sign-off. Use one text family for both headings and body text (Overpass since G-4, see below) with JetBrains Mono for technical detail; retain the two themes and the road-sign amber. Reduce the number of competing visual emphases: let the most urgent decision and the next action lead; reserve the strong accent for actions and meaningful marks. Give both modules equal prominence, and pair every status with a word or icon.

- [Linear](https://linear.app/) — landing: concise product statement and one clear first action; keep Qarau’s own content and voice.
- [Grafana dashboards](https://grafana.com/grafana/dashboards/) — monitoring: modular panels and a clear hierarchy from overview to detailed evidence.
- [Google Cloud Monitoring dashboards](https://docs.cloud.google.com/monitoring/dashboards) — operations: group related charts with inspectable tables and useful time context.
- [Carbon data table](https://www.carbondesignsystem.com/building-blocks/core/components/data-table/guidelines) — dense reports: consistent columns and readable scanning, not decorative borders.
- [Carbon charts](https://www.carbondesignsystem.com/building-blocks/data-visualization/overview) — analytics: use chart types appropriate to the data and pair them with accessible detail.
- [Overpass](https://fonts.google.com/specimen/Overpass) and [JetBrains Mono](https://www.jetbrains.com/lp/mono/) — keep a readable road-sign text voice and a tabular technical voice; do not introduce another font family without a need.
- [FHWA warning signs](https://mutcd.fhwa.dot.gov/HTM/2003/part2/part2c.htm) — historical wayfinding reference for dark-on-yellow contrast and shape; this is visual inspiration, not a claim about Kazakhstan road standards.

### Type (G-4)

Barlow, the first text font, has no Cyrillic, so "қарау" and any Kazakh or Russian text fell back to a system font. Dameli compared three replacements with Cyrillic and every Kazakh letter (ә ғ қ ң ө ұ ү һ і) on the real tokens and copy, on 11 November:

| Variant | For | Against |
|---|---|---|
| **Overpass (chosen)** | Drawn after Highway Gothic, the same road-sign lineage as Barlow, so the look changes least | Slightly wider than Barlow |
| Fira Sans | Very legible in small sizes and dense tables | Softer, reads as documentation more than signage |
| Golos Text | Made for public-service interfaces in Cyrillic | Widest of the three; the hero headline wraps one line earlier |

Two families in total: Overpass for text and headings, JetBrains Mono (also with Cyrillic) for numbers and code. Only the Latin subset is preloaded (S-10); the Cyrillic files load when a page shows Cyrillic text.

### Logo (G-53, G-5)

Three mark directions were drawn on the tokens and compared at 16, 32 and 128 px, in a browser tab and next to the name, in both themes, on 11 November:

| Direction | For | Against |
|---|---|---|
| **A · Viewfinder around a pothole (chosen)** | Says "inspect" for both modules; the thick corners stay legible at 16 px; closest to the mark people have already seen | Generic shape on its own, so the name carries the identity |
| B · Lane line (asphalt with an amber dashed centre line) | Strongest road story | Says nothing about signs; dark square almost disappears on the dark theme |
| C · Letter қ | Distinctive and local, the first letter of қарау | Readers without Cyrillic see a K |

Files: `web/app/icon.svg` (favicon), `web/app/apple-icon.png` (180 px), `web/app/opengraph-image.png` (1200 × 630, name, meaning and tagline from `web/lib/brand.ts`), `web/public/brand/logo-mark.svg` and `wordmark.svg` for the deck. Static brand files use the road-sign amber `#f2a900` with graphite `#1b1c1e`; inside the app the mark follows the theme's `--accent`.

### Slide template (G-10)

The deck is made in Canva, which imports PowerPoint files as editable presentations. `docs/design/slide-template/qarau-slide-template.pptx` is built by `make_slide_template.py` in the same folder from the light-theme tokens, so a token change means running the script again.

- **Size and slides:** 16:9, eight slides covering the seven layouts: title; a section divider per module (Roads, Restrooms); one point plus a screenshot; one point plus a chart; a results table; a two-option comparison; a closing slide with the links.
- **Colours:** background `--bg`, text `--fg` and `--muted`. The accent is a fill only, with `--accent-fg` text; amber text uses `--accent-ink`. Section dividers use `--inverse`. The logo and the road stripe use the brand amber `#f2a900`. Every hex value is in the first slide's speaker notes.
- **Type:** Overpass for titles and text, JetBrains Mono for numbers and the footer "Qarau · ICT1103 · QAIRU".
- **Honesty:** a "Demo data" label in the app's badge colours for demo screens. Placeholders only: the table shows dashes, and the chart bars carry no values.
- **After import:** check one slide on Roma's device. If Canva shows another font, set Overpass or JetBrains Mono on that text.

### Contrast audit (G-3, preliminary)

Ratios below were calculated from the hex tokens using WCAG relative luminance. Text and `-ink` rows are checked against both backgrounds; solid marks are checked for a 3:1 target on `--surface`. Badges also need their actual ink/soft pair checked. Contrast numbers alone do not establish overall accessibility or colour-blind distinguishability; browser and grayscale review remains outstanding. The dark theme is unchanged.

| Token | Light | Light on bg / surface | Dark | Dark on bg / surface |
|---|---|---|---|---|
| `fg` | `#1b1c1e` | 15.22 / 17.05 | `#ecebe7` | 15.59 / 14.45 |
| `muted` | `#4f5156` | 7.09 / 7.94 | `#b1b2ae` | 8.72 / 8.08 |
| `subtle` | `#66686d` | 4.98 / 5.58 | `#8f908c` | 5.79 / 5.36 |
| `accent-ink` | `#855700` | 5.58 / 6.25 | `#ffc547` | 11.81 / 10.94 |
| `sev-clear-ink` | `#1d6440` | 6.36 / 7.12 | `#86dfb3` | 11.71 / 10.85 |
| `sev-low-ink` | `#1f5582` | 6.99 / 7.84 | `#a8cdf1` | 11.22 / 10.40 |
| `sev-medium-ink` | `#7a4f0e` | 6.35 / 7.11 | `#f2c77d` | 11.73 / 10.87 |
| `sev-high-ink` | `#9a3412` | 6.52 / 7.31 | `#f8ab8a` | 9.91 / 9.18 |
| `sev-critical-ink` | `#8e1b14` | 8.09 / 9.06 | `#ff9a93` | 9.12 / 8.45 |
| `gender-male-ink` | `#0b5a54` | 7.20 / 8.06 | `#8fdcd2` | 11.81 / 10.95 |
| `gender-female-ink` | `#45378f` | 8.54 / 9.56 | `#c7befa` | 10.78 / 9.99 |
| `accent` | `#b87f00` | 3.09 / 3.46 | `#ffb81c` | 10.74 / 9.95 |
| `sev-clear` | `#2e8b57` | 3.79 / 4.25 | `#3fb27f` | 6.99 / 6.47 |
| `sev-low` | `#3e7cb1` | 3.97 / 4.45 | `#5d9de0` | 6.52 / 6.04 |
| `sev-medium` | `#b87f00` | 3.09 / 3.46 | `#e8c547` | 11.08 / 10.27 |
| `sev-high` | `#d9601a` | 3.32 / 3.72 | `#f0843c` | 7.15 / 6.62 |
| `sev-critical` | `#93202a` | 7.56 / 8.47 | `#e8455a` | 4.81 / 4.46 |
| `gender-male` | `#0f766e` | 4.89 / 5.47 | `#3fb8a9` | 7.65 / 7.09 |
| `gender-female` | `#5b4bb0` | 6.09 / 6.82 | `#9d8ff0` | 6.75 / 6.25 |
| `chart-1` | `#3d4f63` | 7.51 / 8.41 | `#9fb3c8` | 8.64 / 8.01 |
| `chart-2` | `#b87f00` | 3.09 / 3.46 | `#ffb81c` | 10.74 / 9.95 |
| `chart-3` | `#6b8f71` | 3.24 / 3.63 | `#8fbf96` | 8.91 / 8.26 |
| `chart-4` | `#9a6b9a` | 3.79 / 4.25 | `#c79ac7` | 7.86 / 7.28 |

Light accent and medium/chart amber changed to `#b87f00`: 3.46:1 on the white surface, while dark text on the accent is 4.93:1. The existing photo overlay `--box` remains brighter because its context is a photograph, not a white chart surface. Validate its appearance on real images separately. Severity remains labelled and uses icons; the palette is not claimed to be distinguishable by colour alone.

### Colour-blind check (G-22)

`node web/scripts/check-palette.mjs` simulates protanopia, deuteranopia and tritanopia (Machado, Oliveira and Fernandes 2009, severity 1.0, on linear RGB). It prints the CIE76 ΔE between every pair of colours in each set. **Bold** marks pairs below 10, a rule of thumb chosen for this project, not a standard. Run on 11 November 2026, on `main`.

**Light theme**

| Set | Pair | Normal | Protan | Deutan | Tritan |
|---|---|---|---|---|---|
| severity | sev-clear / sev-low | 65.3 | 57.3 | 53.8 | 11.1 |
| severity | sev-clear / sev-medium | 68.9 | 33.7 | 45.9 | 72.3 |
| severity | sev-clear / sev-high | 92.1 | 27.5 | 43.9 | 105.1 |
| severity | sev-clear / sev-critical | 89.3 | 30.4 | 18.0 | 98.8 |
| severity | sev-low / sev-medium | 98.9 | 90.9 | 99.2 | 70.2 |
| severity | sev-low / sev-high | 103.5 | 84.4 | 97.2 | 103.2 |
| severity | sev-low / sev-critical | 78.9 | 52.2 | 66.5 | 97.1 |
| severity | sev-medium / sev-high | 31.1 | **8.8** | **2.0** | 33.2 |
| severity | sev-medium / sev-critical | 57.4 | 54.2 | 40.5 | 34.6 |
| severity | sev-high / sev-critical | 40.9 | 45.6 | 38.7 | 22.9 |
| verdict | verdict-clear / verdict-review | 68.9 | 33.7 | 45.9 | 72.3 |
| verdict | verdict-clear / verdict-confusing | 89.3 | 30.4 | 18.0 | 98.8 |
| verdict | verdict-review / verdict-confusing | 57.4 | 54.2 | 40.5 | 34.6 |
| gender | gender-male / gender-female | 78.9 | 54.1 | 47.7 | 25.7 |
| chart | chart-1 / chart-2 | 82.4 | 75.2 | 81.4 | 57.5 |
| chart | chart-1 / chart-3 | 38.9 | 36.2 | 34.3 | 23.5 |
| chart | chart-1 / chart-4 | 34.1 | 18.5 | 20.3 | 37.6 |
| chart | chart-2 / chart-3 | 60.8 | 44.8 | 51.6 | 53.4 |
| chart | chart-2 / chart-4 | 82.6 | 81.3 | 78.5 | 23.7 |
| chart | chart-3 / chart-4 | 54.9 | 37.3 | 26.9 | 35.4 |
| boxes | box / box-review | 112.9 | 105.1 | 112.1 | 69.5 |

**Dark theme**

| Set | Pair | Normal | Protan | Deutan | Tritan |
|---|---|---|---|---|---|
| severity | sev-clear / sev-low | 71.7 | 60.6 | 56.5 | 12.9 |
| severity | sev-clear / sev-medium | 66.7 | 47.3 | 53.6 | 68.6 |
| severity | sev-clear / sev-high | 89.2 | 28.8 | 44.5 | 100.7 |
| severity | sev-clear / sev-critical | 108.6 | 25.2 | 19.0 | 126.5 |
| severity | sev-low / sev-medium | 106.5 | 107.3 | 108.7 | 66.2 |
| severity | sev-low / sev-high | 102.3 | 88.6 | 100.8 | 97.5 |
| severity | sev-low / sev-critical | 92.0 | 52.8 | 74.9 | 123.3 |
| severity | sev-medium / sev-high | 40.8 | 25.6 | 14.0 | 37.1 |
| severity | sev-medium / sev-critical | 79.9 | 66.6 | 39.3 | 64.5 |
| severity | sev-high / sev-critical | 42.2 | 42.4 | 27.7 | 27.4 |
| verdict | verdict-clear / verdict-review | 66.7 | 47.3 | 53.6 | 68.6 |
| verdict | verdict-clear / verdict-confusing | 108.6 | 25.2 | 19.0 | 126.5 |
| verdict | verdict-review / verdict-confusing | 79.9 | 66.6 | 39.3 | 64.5 |
| gender | gender-male / gender-female | 78.1 | 51.8 | 42.2 | 36.8 |
| chart | chart-1 / chart-2 | 92.9 | 89.6 | 91.1 | 49.9 |
| chart | chart-1 / chart-3 | 35.9 | 31.3 | 27.7 | **8.6** |
| chart | chart-1 / chart-4 | 27.2 | **9.6** | **2.0** | 30.3 |
| chart | chart-2 / chart-3 | 73.6 | 58.3 | 63.7 | 55.2 |
| chart | chart-2 / chart-4 | 95.9 | 97.9 | 92.6 | 23.7 |
| chart | chart-3 / chart-4 | 58.4 | 39.8 | 29.0 | 37.4 |
| boxes | box / box-review | 112.9 | 105.1 | 112.1 | 69.5 |

**Decisions for the five flagged values**

| Pair | Below 10 for | Decision |
|---|---|---|
| `sev-medium` / `sev-high`, light | protan 8.8, deutan 2.0 | **Keep.** Every severity carries its word and its own icon: a circle with an exclamation mark for medium, a triangle for high (`web/lib/severity.ts`). The severity chart has a worded legend, and map markers sit next to a list that names each severity. Colour is never the only cue (U3). If the team wants more margin, push `sev-high` towards red, together with Tair. |
| `chart-1` / `chart-4`, dark | protan 9.6, deutan 2.0 | **Keep.** Every chart names its series in a legend with words (checked on `/app/analytics`), and no chart in the app uses `chart-3` or `chart-4` today: they appear only as swatches on `/design`. Revisit if a chart starts using them. |
| `chart-1` / `chart-3`, dark | tritan 8.6 | **Keep.** Same reason: `chart-3` is not used by any chart yet, and tritanopia is rare. |

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

### U1 count (W-62, 11 November 2026)

Counted by clicking through on the dev server with the Mock provider and the bundled samples, at 1440 px and 375 px. A screen is a page the user sees, the landing page included. A click is a press; scrolling is not counted.

| Path from the landing page | Screens | Clicks | U1 |
|---|---|---|---|
| Hero "Analyze a road photo" (opens Analyze with sample s01 selected), then "Analyze photo" | 2 | 2 | Pass |
| Module card "Compare two signs" (matching pair selected), then "Compare signs" | 2 | 2, after scrolling (the button sits about 2,200 px down at 1440 px, 3,200 px at 375 px) | Pass |
| Header "Open the app", a step in the demo path on `/app` (W-30), then Analyze or Compare | 3 | 3 | Clicks pass, one screen too many |
| Before W-62 and W-30: hero "Open the app", "Analyze" in the sidebar, pick a sample, "Analyze photo" | 3 | 4 | Fail |

The hero keeps one primary action; only its target changed (variant B in the W-62 pull request). Not yet measured: the time two first-time users need, and the count on the deployed site.

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

## Review colour (G-47)

Before: blue meant three things, the focus ring (`--focus`), low severity (`--sev-low`) and the review box on photos (`--box-review` `#9ec1ff`). Now "needs review" in the Roads module has its own violet-grey: `--review` (marks), `--review-ink` (text), `--review-soft` (badge fill), in `web/app/tokens.css`, mapped to `bg-review`, `text-review-ink`, `bg-review-soft`. It is used only where review status is shown: `ReviewBadge` (eye icon and the word "review") in the reports table and the detection table, the "To review" KPI stripe on `/app`, and the dashed review box on photos. The dashed line and the word stay the main signal. Restroom verdict "review" keeps its own token (`--verdict-review`, amber); it was never blue.

| Token | Light | On bg / surface | Dark | On bg / surface | Target |
|---|---|---|---|---|---|
| `review` | `#6b4a85` | 6.37 / 7.13 | `#9878b8` | 5.06 / 4.69 | 3:1 (UI mark) |
| `review-ink` | `#553a6b` | 8.51 / 9.53, 7.95 on soft | `#cdb4e3` | 9.95 / 9.22, 8.14 on soft | 4.5:1 (text) |
| `review-soft` | `#efe8f4` | fill only | `#2a2236` | fill only | none |
| `box-review` (photo, both themes) | `#cfa2ea` | tag text `#141414` on it: 8.78 | same | same | 4.5:1 (tag text) |

`node web/scripts/check-palette.mjs` has a new set `review` (focus, low severity, review). Run on 11 November 2026, on branch `design/g30-g47-states`:

| Theme | Pair | Normal | Protan | Deutan | Tritan |
|---|---|---|---|---|---|
| Light | focus / review | 37.0 | 32.7 | 42.0 | 36.7 |
| Light | sev-low / review | 32.4 | 16.0 | 14.5 | 42.3 |
| Dark | focus / review | 29.6 | 20.6 | 23.0 | 44.6 |
| Dark | sev-low / review | 29.2 | 12.3 | 15.7 | 44.6 |
| Both | box / box-review | 108.5 | 106.5 | 104.8 | 34.2 |

Review is at least ΔE 12 from focus and low severity in every simulation. The same run flags focus / low severity in the dark theme (10.9 normal; 8.4, 9.1, 8.4 simulated). **Keep:** focus is only ever a 2 px outline around the element that has keyboard focus, never a fill, a word or a status, and low severity always carries its icon and word. Changing the focus ring would touch every page, so it is not part of this task.
