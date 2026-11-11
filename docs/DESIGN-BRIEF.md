# Design brief

For Tair and Dameli. The scaffold in `web/` gives working pages on a neutral starting look. This brief says what each page must do, what "done" means, and where the references plug in.

## Direction

**To be filled in by Tair (task W-3):** three to eight reference links, the palette, the fonts, and two sentences on the mood.

Starting point until then: asphalt and road markings. Graphite and stone neutrals, one signal accent in road-sign amber, five severity colours. Calm, technical, readable. The product is a work tool for a road-maintenance dispatcher, and the landing page is the only place that sells.

Decided on 11 November in [decision 0011](decisions/0011-visual-direction.md), after the side-by-side comparisons on `/design/lab` (G-41, G-43, G-46).

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

- **Size and slides:** 16:9, nine slides covering the eight layouts: title; a section divider per module (Roads, Restrooms); one point plus a screenshot; a large screenshot (G-56); one point plus a chart; a results table; a two-option comparison; a closing slide with the links.
- **Colours:** background `--bg`, text `--fg` and `--muted`. The accent is a fill only, with `--accent-fg` text; amber text uses `--accent-ink`. Section dividers use `--inverse`. The logo and the road stripe use the brand amber `#f2a900`. Every hex value is in the first slide's speaker notes.
- **Type:** Overpass for titles and text, JetBrains Mono for numbers and the footer "Qarau · ICT1103 · QAIRU".
- **Honesty:** a "Demo data" label in the app's badge colours for demo screens. Placeholders only: the table shows dashes, and the chart bars carry no values.
- **Screenshots (G-56):** both screenshot slides use one frame: 16:10, `--radius-lg`, a 1 px `--border` line and `--shadow-md`, scaled from 1440 px to the frame's width. Rules and file names: `docs/design/screenshots.md`.
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

- Bars for categories (severity breakdown, latency by provider, model comparison), with a zero baseline.
- Columns for detections per day, stacked into counted and needs review. Each day is a separate count, so columns compare the days directly and show the split. A line would draw slopes between days, and with demo data it drops to zero on every day without photos, which makes "are detections rising?" harder to read (tried both on 11 November, G-51; Lec4-VizBasics p4: line for change over time, bars for comparing counts).
- Histogram for distributions (confidence, sign similarity, gap between the doors). Ticks sit on the bin edges.
- No pie chart with more than four slices. No 3D, no dual axes.
- Severity colours carry meaning, so other series use neutral tones.
- Every chart: title that states the takeaway, axis labels with units, tooltip with exact values.
- One style for every chart, set once in `web/components/charts/chart-kit.tsx`: `--chart-1` for the main series, `--chart-2` for the one highlight, muted axes and ticks, a light grid on the value axis only, the y-axis title left of the tick labels, one tooltip.
- Rule thresholds are drawn where the data is: a dashed ink line with the rule and its current value above the plot ("R1 0.40", "S2 0.05"), plus "(your setting)" when it differs from the default. The values come from the rule stores, so the line moves when a rule changes. Outside reference values (the IOAI scores) are dashed and muted, with their name and value.

## Motion

| Where | What | Duration |
|---|---|---|
| Landing sections | Fade and rise on entry, staggered | 400–600 ms |
| Detection demo and result | Boxes draw in one by one, then labels | 300 ms each |
| KPI tiles | Numbers count up once | 800 ms |
| Page changes | Short cross-fade | 150–200 ms |
| Hover and press | Small scale or tint | 100–150 ms |

Motion explains what happened. It never blocks input, never loops without reason, and is switched off under `prefers-reduced-motion`.

- **Tokens (G-59):** every timing is named. CSS: `--duration-*` and `--ease-*` in `web/app/tokens.css`. JS: `duration`, `ease`, `stagger`, `timing` and `demo` in `web/lib/motion.ts`. `web/lib/motion.test.ts` fails if the two disagree.
- **Pause (G-54):** the two landing demos that replay (roads every 7 s, signs every 5 s) have a Pause/Play button. It is hidden under reduced motion, because nothing loops then.
- **Reduce motion switch (G-64):** Settings, "Appearance and language". On, the app behaves as under the device setting. The inline script in `web/lib/theme-script.ts` sets `<html data-motion="reduce">` before first paint for the CSS; `web/components/motion/motion-preference.tsx` stops motion/react, the count-up and Recharts animations.

## Final checks before feature freeze

- [ ] U1–U8 pass.
- [ ] Light and dark themes checked on every page.
- [ ] 375 px, 768 px and 1440 px widths checked.
- [ ] No placeholder text, no mock number shown without the "Demo data" badge.
- [ ] Favicon, page titles, social preview image.
- [ ] Screenshots exported for the deck.
- [x] 320 px reflow and 200 % zoom checked (WCAG 1.4.10, 1.4.4, 2.4.11).

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

## Selected, hover and focus states (G-30)

- Pick-one tiles (sample photos on Analyze, sample signs, example pairs on Compare) use `SelectableTile` (`web/components/ui/selectable-tile.tsx`). Selected: amber border, `accent-soft` fill and a check mark in a filled circle in the corner (`SelectedMark`), so the state reads in a greyscale screenshot. `aria-pressed` stays.
- The selected model provider in Settings shows the same check mark next to its checked radio.
- Severity filter chips on Reports add a check mark after the word when on.
- Hover is the same everywhere: unselected tiles get `border-border-strong` and `bg-surface-2`; row links and jump-link chips get `bg-surface-2`.
- Focus is the global ring in `web/app/globals.css` (2 px outline, 2 px offset). A scroll box around tiles needs at least 4 px padding or the ring is clipped; the sample sign picker had 2 px and now has 4 px.

## Provenance badges and icons (G-29, G-24)

### Provenance badges (G-29)

Every single result (road analysis, compare check, match) shows exactly one of these badges; pages that list seeded records show "Demo data" (U8). All three have the same shape and size (small radius, 20 px high, 1 px edge), a 14 px icon slot and always a word, so colour is never the only cue (U3).

| Badge | Icon | Colour | Shown when |
|---|---|---|---|
| **Demo data** (also "Invented demo record", "Includes demo data", "Placeholder numbers") | FlaskConical | amber fill (`accent-soft`, `accent-ink`) | Seeded records and placeholder numbers. No model made them. |
| **Mock result** (also "Mock predictions" in the page header) | Package, the Mock provider icon | amber outline (`accent`, `accent-ink`) | The mock provider answered: canned output, no model ran. |
| **Model result: \<name\>** | Laptop or Cloud, the provider's icon | slate (`--chart-1`, the measured-data colour of the charts) | Our model made it, through Local or Cloud. |

Rule to explain: amber means "not made by our model", slate means "our model made it". The rule is `resultProvenance` in `web/lib/mock/seeded.ts`, the badges are in `web/components/app/demo-badge.tsx`, and `web/lib/demo-badges.test.ts` checks one badge per result view and the provider icons.

### Icon map (G-24)

One icon per concept, one size per context. Checked on the road and restroom result cards on 11 November 2026.

| Context | Size | Class |
|---|---|---|
| Inline with `text-xs`: badges, detail labels, stamps | 14 px | `size-3.5` |
| Inline with `text-sm`, and inside buttons (forced by `button.tsx`) | 16 px | `size-4` |
| Card section headings (`text-lg`) and the sidebar | 18 px | `size-4.5` |
| Large badges (`text-base`) and callouts | 20 px | `size-5` |
| Empty states and feature tiles | 24 px | `size-6` |

| Concept | Icon | Defined in or used on |
|---|---|---|
| Severity: clear, low, medium, high, critical | CircleCheck, CircleDot, CircleExclamationPoint, TriangleExclamationPoint, OctagonExclamationPoint | `web/lib/severity.ts` |
| Verdict: pair, not a pair | CircleCheck, CircleX | `web/lib/signage-ui.ts` |
| Gender: male, female | Mars, Venus | `web/lib/signage-ui.ts` |
| Gap in P(male) between the doors (S1, S2) | VenusAndMars | Compare result |
| Similarity of the two designs (S3) | EqualApproximately | Compare result |
| Provider: Mock, Local, Cloud | Package, Laptop, Cloud | `PROVIDER_META`; the Provider detail and the provenance badges use the same icon |
| Model | Brain | Model detail on both result cards; "Model" step on the landing page |
| Demo data | FlaskConical | Provenance badge |
| Needs a human look (review) | UserRoundSearch | Road result callout |
| Model latency | Timer | Result details |
| When it was analysed or checked | Clock | Result details |
| Location, place | MapPin | Result details |
| Road class, school zone | Route, School | Road result details |
| Best match; correct or wrong match | Trophy; CircleCheck or CircleX | Match result |
| Callout: info, warning, danger, success | Info, TriangleAlert, TriangleAlert, CircleCheck | `web/components/ui/callout.tsx` |
| Module: roads, restrooms | TrafficCone, DoorOpen | `MODULE_ICONS` in `web/components/app/nav.ts` |
| Analyze, Compare, Match | ScanSearch, GitCompareArrows, Search | `web/components/app/nav.ts` |
| Swap the two doors | ArrowLeftRight | Compare input |

Fixed on the result cards: Provider and Model both used Cpu (now the provider's icon and Brain); both compare measures used ArrowLeftRight, which also means Swap (now VenusAndMars and EqualApproximately); the needs-review callout used the triangle of High severity (lucide's TriangleAlert is the same drawing as TriangleExclamationPoint; now UserRoundSearch).

Still open outside the result cards, for Tair and the owners of those files:

- FlaskConical is both the Model page in the sidebar and the Demo data badge, on the same screen. Proposal: Brain for the Model page, as on the landing page.
- The triangle is High severity and also the restroom Review verdict; the reports table marks review with CircleExclamationPoint, the Medium icon. Proposal: UserRoundSearch for review everywhere, decided together with the review colour (G-47).
- The landing page Deployment section draws Mock as ServerCog; everywhere else Mock is Package. Proposal: Package.
- The landing page privacy list uses Cpu for "restroom images are door-sign icons only". Proposal: DoorOpen, the restroom module icon.

## High-contrast theme (G-31)

A third theme for projectors and low vision. WCAG AA (4.5:1 for text) is what the light and dark themes meet; this one targets AAA: every text token at 7:1 or more (WCAG 1.4.6) and every mark at 3:1 or more (WCAG 1.4.11).

- **Where:** Settings, Appearance, Theme: System, Light, Dark, **High contrast**. Stored in `localStorage` (`qarau:theme` = `"contrast"`) and set on `<html data-theme="contrast">` by the inline script in `web/lib/theme-script.ts` before first paint, like light and dark. The system setting never picks it: "System" still means light or dark.
- **Header toggle:** keeps its three steps, System, Light, Dark, so a click during the demo never lands in high contrast. High contrast is chosen in Settings; from it, one click on the header button leads back to System.
- **Values:** `[data-theme="contrast"]` in `web/app/tokens.css`, built from the light theme: black text on white cards, a light grey page (`#f2f2f2`), dark grey borders (`#6e6e6e`), the amber accent darkened to `#7a4f00` so it carries white text, the same hues for severity, verdicts, gender, review and charts but darker. The block declares every token itself (a missing one would fall back to light without warning, and the nested panel on `/design` would inherit the page's aliases); `web/lib/contrast-theme.test.ts` fails if a token is missing or a ratio drops below its target.
- **Focus:** the ring is 3 px wide in this theme (2 px elsewhere), `web/app/globals.css`.
- **Photo boxes:** the same colours as light and dark (they sit on the photo); the halo behind them goes from 45% to 60% black.
- **Print:** paper stays light in every theme. `web/app/print.css` gives this theme the light values while printing, as it does for dark (G-25).
- **`/design`** shows the components in a third panel, `data-theme="contrast"`.

Ratios from `node web/scripts/check-contrast.mjs` (WCAG 2.x relative luminance, sRGB), run on 11 November 2026 on branch `design/g31-high-contrast`. "soft" is the badge fill the ink sits on. Box colours are measured against black, the colour of their halo; on a real photo the halo is translucent, so the real contrast depends on the photo.

| Token | Value | Target | Ratio on |
|---|---|---|---|
| `fg` | `#000000` | 7:1 | bg 18.76, surface 21.00, surface-2 17.14, surface-3 15.02 |
| `muted` | `#2e2e2e` | 7:1 | bg 12.13, surface 13.58, surface-2 11.08, surface-3 9.71 |
| `subtle` | `#474747` | 7:1 | bg 8.30, surface 9.29, surface-2 7.58 |
| `accent-ink` | `#6b4500` | 7:1 | bg 7.57, surface 8.48, accent-soft 7.41 |
| `accent-fg` | `#ffffff` | 7:1 | accent 7.13, accent-hover 9.32 |
| `inverse-fg` | `#ffffff` | 7:1 | inverse 21.00 |
| `danger` | `#8f1710` | 7:1 | bg 8.16, surface 9.14, danger-soft 7.47 |
| `surface` | `#ffffff` | 7:1 | danger 9.14 |
| `sev-clear-ink` | `#134d30` | 7:1 | bg 8.80, surface 9.85, sev-clear-soft 8.41 |
| `sev-low-ink` | `#144372` | 7:1 | bg 9.04, surface 10.12, sev-low-soft 8.46 |
| `sev-medium-ink` | `#5e3d00` | 7:1 | bg 8.75, surface 9.80, sev-medium-soft 8.31 |
| `sev-high-ink` | `#7f280a` | 7:1 | bg 8.49, surface 9.50, sev-high-soft 7.84 |
| `sev-critical-ink` | `#6e0e0e` | 7:1 | bg 10.83, surface 12.12, sev-critical-soft 9.53 |
| `verdict-clear-ink` | `#134d30` | 7:1 | bg 8.80, surface 9.85, verdict-clear-soft 8.41 |
| `verdict-review-ink` | `#5e3d00` | 7:1 | bg 8.75, surface 9.80, verdict-review-soft 8.31 |
| `verdict-confusing-ink` | `#6e0e0e` | 7:1 | bg 10.83, surface 12.12, verdict-confusing-soft 9.53 |
| `gender-male-ink` | `#08433e` | 7:1 | bg 9.96, surface 11.15, gender-male-soft 9.35 |
| `gender-female-ink` | `#34277a` | 7:1 | bg 10.92, surface 12.23, gender-female-soft 9.73 |
| `review-ink` | `#442b59` | 7:1 | bg 10.81, surface 12.10, review-soft 10.09 |
| `box-ink` | `#141414` | 7:1 | box 9.17, box-review 8.78, box-active 18.42 |
| `border` | `#6e6e6e` | 3:1 | bg 4.55, surface 5.10 |
| `border-strong` | `#3a3a3a` | 3:1 | bg 10.16, surface 11.37, surface-2 9.28 |
| `focus` | `#0047c2` | 3:1 | bg 7.00, surface 7.83, surface-2 6.39 |
| `accent` | `#7a4f00` | 3:1 | bg 6.37, surface 7.13 |
| `success` | `#1a6a42` | 3:1 | bg 5.89, surface 6.60 |
| `sev-clear` | `#1f7a4a` | 3:1 | bg 4.76, surface 5.33 |
| `sev-low` | `#2a68a0` | 3:1 | bg 5.23, surface 5.86 |
| `sev-medium` | `#b37a00` | 3:1 | bg 3.29, surface 3.68 |
| `sev-high` | `#a8380a` | 3:1 | bg 5.80, surface 6.49 |
| `sev-critical` | `#7d1220` | 3:1 | bg 9.48, surface 10.61 |
| `verdict-clear` | `#1f7a4a` | 3:1 | bg 4.76, surface 5.33 |
| `verdict-review` | `#b37a00` | 3:1 | bg 3.29, surface 3.68 |
| `verdict-confusing` | `#7d1220` | 3:1 | bg 9.48, surface 10.61 |
| `gender-male` | `#0d6a63` | 3:1 | bg 5.76, surface 6.44 |
| `gender-female` | `#4a3aa0` | 3:1 | bg 7.80, surface 8.74 |
| `review` | `#5e3d7a` | 3:1 | bg 7.74, surface 8.66 |
| `chart-1` | `#2c3b4c` | 3:1 | bg 10.21, surface 11.43 |
| `chart-2` | `#8a5a00` | 3:1 | bg 5.29, surface 5.93 |
| `chart-3` | `#3f6b47` | 3:1 | bg 5.51, surface 6.17 |
| `chart-4` | `#7a4a7a` | 3:1 | bg 6.07, surface 6.80 |
| `box` | `#f2a900` | 3:1 | #000000 10.45 |
| `box-review` | `#cfa2ea` | 3:1 | #000000 10.01 |
| `box-active` | `#ffffff` | 3:1 | #000000 21.00 |

0 values below target. For comparison, light `subtle` is 4.98:1 on bg and `muted` 7.09:1; here they are 8.30:1 and 12.13:1.

**Severity still distinct.** `node web/scripts/check-palette.mjs` now also checks this theme. No pair in it is below ΔE 10 in normal vision or in any of the three simulations. The smallest values are 11.6 (tritan) for `sev-clear` / `sev-low` and for `focus` / `sev-low`, and 17.4 (deutan) for `sev-medium` / `sev-high`, the pair the light theme flags at 2.0. Medium, high and critical step down in lightness (3.29, 5.80, 9.48:1 on bg), so they separate in greyscale too. Severity keeps its icon and word in every theme (U3).

## Box colours on real photos (G-48)

**What the samples are.** The six bundled road samples (`web/public/samples/samples.json`, `s01` to `s06`) are still drawings, not photos; D-5 (#43), which brings real test photos, has not merged. So this check was run on the drawings the demo shows today, and on flat colours for the surfaces the drawings do not have (yellow markings, concrete, wet asphalt). Run it again on the real photos when D-5 lands.

**How.** Three variants on `/app/roads/analyze?sample=s01` to `s06`, set by injecting CSS into the running page, so no source file changed for the test:

- A, current: amber box, black halo at 45%, halo 2.4 times the stroke.
- B: white box, amber tag.
- C: amber box, thicker and darker halo (60%, 4 times the stroke).

Every sample was screenshot at 1440 and 375 px wide, light and dark theme (Playwright, Chromium, device scale 1). For the numbers, each sample was rendered at 1280 x 720 (the overlay's own coordinates). Along every box edge, the photo just inside and just outside the stroke was darkened by the halo and compared with the stroke colour (WCAG contrast; 3:1 is the target for a mark that must be seen).

**Results on the samples** (10 boxes on 5 samples; `s06` has none):

| Variant | Worst stroke against the halo-darkened photo | Boxes below 3:1 at their worst point | Dark rim beside the stroke, 375 / 1440 px |
|---|---|---|---|
| A, current | 2.10 (`s03`) | 6 of 10 | 0.75 / 1.43 |
| B, white box | 4.22 | 0 | 0.75 / 1.43 |
| C, thicker halo at 60% | 3.46 | 0 | 1.61 / 3.06 |
| **Pick: C with the halo at 65%** | 4.12 | 0 | 1.61 / 3.06 |

**Flat surfaces.** The colours are assumptions, not measured from photos. Values are the stroke against the halo-darkened surface; the first number column is amber with no halo.

| Surface | Colour | Amber, no halo | A | B | C | Pick, amber | Pick, review violet |
|---|---|---|---|---|---|---|---|
| White marking, pure white (overexposed) | `#ffffff` | 2.0 | 1.7 | 3.4 | 2.9 | 3.5 | 3.3 |
| White marking, as drawn | `#efede4` | 1.7 | 1.9 | 3.8 | 3.2 | 3.8 | 3.7 |
| Yellow marking, fresh (about RAL 1023) | `#f7b500` | 1.1 | 2.7 | 5.5 | 4.2 | 4.9 | 4.7 |
| Yellow marking, worn | `#d8b04a` | 1.0 | 3.0 | 6.0 | 4.5 | 5.2 | 5.0 |
| Grey concrete | `#a3a29c` | 1.3 | 3.5 | 7.0 | 5.1 | 5.8 | 5.5 |
| Dry asphalt, as drawn | `#4a4b4d` | 4.3 | 7.2 | 14.5 | 8.3 | 8.6 | 8.3 |
| Wet dark asphalt | `#1f2022` | 8.1 | 9.4 | 18.8 | 9.7 | 9.8 | 9.4 |

**Hardest samples.** `s03` and `s02`: the box crosses a white centre-line dash, where amber on white is 1.7:1 and only the halo separates them. `s01` is the darkest sample with boxes (lower half mean grey 76 of 255) and was easy: amber on dark asphalt is 4.3:1 even without the halo. `s04` has the only yellow in the samples (the school sign); no box touches it. No sample has yellow road markings, so the flat-colour table stands in for them.

**Pick: C, with the halo at 65%.** It is the only option that keeps the amber "counted" colour and stays above 3:1 on every surface, pure white included (that needs 63%). The wider halo matters on phones: at 375 px the old rim was under 1 px. Not B: white is already the colour of the hovered or selected box (`--box-active`), and a white box drops the amber "counted" swatch of the legend under the photo (`web/components/app/analysis-view.tsx`).

**Changes.** `--box-halo` 0.45 to 0.65 in `web/app/tokens.css`, and the same line in the print copy (`web/app/print.css`, kept equal to the light theme by `web/lib/print-tokens.test.ts`). Halo width 2.4 to 4 times the stroke (`HALO_SCALE` in `web/components/app/detection-overlay.tsx`), with a test in `web/lib/detection-overlay.test.ts`. The box colours did not change; `node web/scripts/check-palette.mjs` still gives box / box-review 108.5 normal, 106.5 protan, 104.8 deutan, 34.2 tritan (no value below 10).

**Tags.** Text on the amber tag is 9.17:1, on the violet tag 8.78:1, whatever the photo. The tag has no halo, so its edge can fade into yellow or white areas (down to about 1:1); the dark text keeps it readable.

**Found, not fixed here** (outside the colour tokens):

1. At 375 px on `s05`, the tag of box 3 covers the end of the tag of box 1 ("review" loses its last letter). `placeTag` keeps tags inside the photo but does not move them away from each other.
2. Review and ignored boxes are meant to be dashed but draw solid: the draw-in animation sets `pathLength`, and motion then writes `stroke-dasharray="1 1"` over the dash pattern (seen in the page DOM). The legend under the photo still shows a dashed swatch for "needs review". The violet colour and the word "review" on the tag still mark these boxes.

**Fixed in the overlay follow-up** (`web/components/app/detection-overlay.tsx`): 1. `placeTags` places tags in box order; a tag that would cover an earlier one moves below its box, then inside it, and stays in the photo. 2. A dashed box is a plain dashed rect, drawn in through a mask with the same motion tokens, so it stays dashed after the draw-in and with reduced motion. Playwright on s01 to s06 at 1440 and 375 px, light and dark, with and without reduced motion: no two tags share any area (s05 at 375 px was 87.4 px²), review boxes compute `stroke-dasharray: 16px, 10px`, tags stay at 11 px or more.

## Corner radii (G-49)

Three radii plus pills, all in `web/app/tokens.css`. Every `rounded-*` class and every `border-radius` in `web/app` and `web/components` uses one of them.

| Token | Value | Class | Used for |
|---|---|---|---|
| `--radius-sm` | 4 px | `rounded-sm` | Small parts and parts inside a control: badges (provenance, demo, severity), tooltips, options inside the segmented control and the select list, the dialog close button, the slider's number field, legend and severity swatches, distribution bars, row thumbnails, the focus ring. Chart bar tops (`barRadius` in `web/components/charts/chart-kit.tsx`) are 4 px too. |
| `--radius-md` | 6 px | `rounded-md` | Controls: buttons, inputs, the select trigger and list, the segmented control frame, selectable tiles, sidebar links, callouts, skeletons, chart tooltips, the public menu toggle and links. |
| `--radius-lg` | 10 px | `rounded-lg` | Containers: `Card`, KPI tiles, landing cards and the hero preview, the team grid, dialogs and the bottom sheet (`rounded-t-lg`), the public menu panel, empty states, the photo frame on Analyze. |
| `--radius-full` | 9999 px | `rounded-full` | Pills and dots: switches, the slider track and thumb, the tab-bar pills on phones, the active-link marker, the empty-state icon circle, the nav links on the landing page. |

**What changed.** `--radius-xs` (2 px) and `--radius-xl` (16 px) are gone. The nine `rounded-xs` uses became `rounded-sm` (the focus ring too), so a swatch has the same corner as a chart bar. The seven `rounded-xl` uses became `rounded-lg`, so the landing cards, the hero preview and the theme panels on `/design` have the same corner as every `Card`; the column on `/design/lab`, merged later, got the same change. The step from 4 to 6 to 10 px keeps the order small mark, control, container that the five values had, with the smallest visual change: 89 of the 105 `rounded-*` classes (not counting `full`) kept their value.

**Not tokens.** The `rx` values inside SVG drawings (logo, app icon, empty-state illustrations, detection boxes) are drawing geometry and scale with the drawing, so they stay in the SVG.

**Do not use** Tailwind's built-in `rounded-xs`, `rounded-xl`, `rounded-2xl` or larger: Tailwind still generates them from its own defaults (2, 12, 16 px), which would bring a fourth value back. Check: `grep -rnE 'rounded-(t-|b-|l-|r-)?(xs|xl|[2-4]xl)\b' web/app web/components` finds nothing, and `grep -cE '^\s+--radius-(xs|sm|md|lg|xl):' web/app/tokens.css` prints 3.

## Eyebrow label (G-23)

The small uppercase label above a heading or a value ("Repair priority", "Signage verdict", section labels on the landing page) is one utility, `eyebrow`, in `web/app/globals.css`: 12 px (`--text-xs`), weight 600, uppercase, letter spacing `--tracking-eyebrow` (0.14em, in `web/app/tokens.css`). Colour stays on the element: `text-muted` in the app, `text-accent-ink` for page and section headers, `text-subtle` in the sidebar.

Before, 15 labels wrote the spacing by hand: 11 with 0.14em, 4 with 0.18em (landing hero, landing section headers, `/about`, `/design`). All now use 0.14em, the common value; the four headers are about half a pixel tighter per letter, the other eleven did not change by a pixel. Five more labels wrote the same style with `tracking-wide` (0.025em): the colour group titles on `/design` and four labels on `/design/lab`; they now use `eyebrow` too and are about 1.4 px wider per letter. Table column headers (`THead` in `web/components/ui/table.tsx`) are not eyebrows and keep `tracking-wide`. `/design` shows the style in the type scale. Check: `grep -rn 'tracking-\[' web/app web/components` finds nothing.

## Spacing rhythm (G-62)

**Steps.** Spacing uses the 4 px base (`--spacing`): 4, 8, 12, 16, 24, 32, 48 px (`1, 2, 3, 4, 6, 8, 12`). Counted on 11 November in `web/app` and `web/components` (`p`, `px`, `py`, `gap`, `mt`, `mb`): 8 px 141 times, 12 px 128, 16 px 108, 24 px 38, 32 px 26. Half steps (2 and 6 px) stay for tight parts inside controls.

**Card inset: one value per breakpoint.** Every card uses `p-(--card-pad)` (token in `web/app/tokens.css`, next to `--gutter`): **16 px below 640 px, 20 px from 640 px up.** `Card` (`CardHeader` and `CardBody`), the KPI tile, the landing cards (problem, tools, steps, rule hits, team), the hero preview and the sign-comparison panel on the landing page, the hero and pair demos, the overview link tiles, the model glossary cards, the lifecycle diagram, the provider tiles in Settings, the details panel on Match and the theme panels on `/design`.

| Card | Before (phone / 640 px up) | Now |
|---|---|---|
| `Card` (43 uses) | 20 / 20 | 16 / 20 |
| KPI tile (14), hero and pair demo | 16 / 20 | 16 / 20 |
| Landing cards (8) | 24 / 24, one 20 / 24 | 16 / 20 |
| Hero preview and sign-comparison panel on the landing page | 20 / 24 | 16 / 20 |
| Team cards | 18 / 18 | 16 / 20 |
| Overview links, glossary, Settings tiles, Match details | 16 / 16 | 16 / 20 |
| Lifecycle diagram | 20 / 20 | 16 / 20 |
| Theme panels on `/design` | 16 / 24 | 16 / 20 |

**Why these two values.** From 640 px up, 20 px was already the most common inset (every `Card` and every KPI tile). On phones `Card` used 20 px too, but 20 px clips the KPI numbers: the overview shows three tiles across, and at 375 px the number "40" needs 59 px while a tile with 20 px padding leaves 56 px at most. 16 px is what the KPI tiles and the demos already used on phones, and it is the page gutter on phones. A token instead of `p-4 sm:p-5` keeps overrides working: `cn()` does not merge classes, so a responsive `sm:p-5` would beat an override such as `CardBody className="px-0"` from 640 px up.

**Not cards** (they keep their own padding): dialogs and the bottom sheet (`p-5` plus the safe-area inset), empty states (`px-6 py-12`), small items inside a card with the control radius (lifecycle steps and the illustration list on `/design`: 12 px; the metric boxes in the landing model cards: 16 px), image tiles in the Match results grid (10 px, the image is the content), the theme switch in the sidebar (4 px), and tables that run edge to edge inside a card (`CardBody className="px-0"`).

**Removed.** The overview KPI tiles passed `className="p-3 sm:p-4"`, which never applied (the tile's own `p-4 sm:p-5` came later in the CSS); they render as before.

**Found, not fixed here.** At 320 px the three-across overview tiles clip two-digit numbers (needs 59 px, has 45 px), and "63 ms" on `/app/roads` is clipped at 320 and 375 px. Both were clipped before this change; the fix is a smaller KPI number size on phones, which is a type decision.

## Component states (G-6)

Every primitive in `web/components/ui/` has the states below; `/design` shows them in a "States" grid per component, in light, dark and high contrast. Hover, focus and pressed are drawn there with each component's `forceState` prop, which uses the same classes as the real `hover:` / `active:` variants (`web/lib/ui-states.test.ts` fails if they drift apart).

| Component | Hover | Pressed or selected | Focus | Disabled | Loading or error |
|---|---|---|---|---|---|
| Button | darker fill | scales to 98 % | ring eases in | 50 % | `aria-busy` + spinner |
| Switch | thumb lifts, checked track darkens | thumb stretches 4 px, then slides | ring | 50 %, not-allowed cursor | |
| Slider | thumb lifts | thumb grows to 110 % while held | ring | 60 % | |
| Tabs | grey underline grows | amber underline grows from the centre | ring inside the tab | 50 % | |
| Text field, select | border to `--muted` | select: accent border, chevron turns | ring | `surface-2` fill | field: red border and message (`error`) |
| Segmented | text to `fg` | raised white segment | ring | 50 %, no hover | |
| Table row | `surface-2` on clickable rows only | `data-state="selected"`: `accent-soft` | | | |
| Dialog | | overlay fades, panel grows from 96 % (200 ms), leaves in 120 ms; the phone sheet slides up | trapped | | |

- Card, badge and empty state are not interactive, so they have no hover or focus: a card that opens nothing must not look clickable.
- Timings: 120 ms for feedback, 200 ms for a dialog entering, the tokens `--duration-fast` and `--duration-base`. The reference site (dope.security) uses 100 to 150 ms on its links and buttons. All of it is cut to the end state by Reduce motion (OS or Settings).
- Tap targets (U6): below 640 px every button is 48 px tall, segmented options too; the switch and the slider thumb get a 48 px hit area from an invisible `::before` box, so the layout does not move.
- **Toasts are not used.** Feedback stays next to the control that caused it (`Callout`, a line with `role="status"` or `role="alert"`). A toast appears far from the action and disappears on a timer, often before it is read, and it needs its own focus and pause rules (WCAG 2.2.1). No page needs one.
