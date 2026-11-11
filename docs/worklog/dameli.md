# Worklog: Dameli

**Lane:** Design system and visuals. Tasks suggested for Dameli: see the personal tracker issue and `docs/TASKS.md`.

## Summary for the defense

Fill this in by the code freeze (Wed 23:00). Three to six bullets: what I built or decided, the evidence (links), and the two things I can explain best.

- 

## Entries

<!-- Newest first. Copy the entry template from docs/worklog/README.md. -->

### 2026-11-11 18:19 · G-48 (#282) · Detection box colours checked on the samples
- **Status:** partial. The six bundled samples are still drawings; D-5 (#43, real test photos) is not merged, so the check on real photos is still to do.
- **What I did:**
  - Tried three variants on every sample on `/app/roads/analyze` by injecting CSS into the running page: A the current amber box with a 45% halo, B a white box with an amber tag, C amber with a thicker, darker halo. Screenshots of `s01` to `s06` at 1440 and 375 px in light and dark.
  - Measured the contrast of the box stroke against the halo-darkened pixels along every box edge, and against flat colours for surfaces the drawings do not have (yellow markings, concrete, wet asphalt).
  - Applied C with the halo at 65%: `--box-halo` 0.45 to 0.65 in `tokens.css` (and its print copy), halo width 2.4 to 4 times the stroke in the overlay, with a test.
- **Result:** with the old halo, 6 of 10 boxes dropped to 2.1 to 2.3:1 where they touch a white lane marking; with the pick every box stays at 4.1:1 or more on the samples, and at 3.3:1 or more on pure white and yellow paint. Every box and tag is visible on all six samples in both themes at both widths. `pnpm lint`, `pnpm typecheck`, `pnpm exec vitest run --maxWorkers=2` and `pnpm build` pass. Numbers and tables in DESIGN-BRIEF.md, "Box colours on real photos (G-48)".
- **Decisions and why:**
  - 65%, not the 60% I tested: pure white (an overexposed marking) needs 63% for 3:1, and a darker halo costs nothing on dark asphalt.
  - Not the white box (B): white already means the hovered or selected box, and the legend shows amber for "counted".
  - Wider halo: at 375 px the old dark rim was 0.75 px, now 1.6 px.
  - Box colours did not change, so the G-22 palette check is the same (box / box-review 108.5 normal, 34.2 tritan).
- **What I learned / can explain at the defense:** a mark on a photo cannot rely on its own colour, because the photo can be any colour; the dark halo gives it a known background. WCAG asks 3:1 for marks that must be seen (non-text contrast). The hardest places were white lane markings, not the darkest sample.
- **AI use:** Claude Code ran the screenshots and the contrast script and wrote the change (entry in docs/AI-USAGE-LOG.md).
- **Open questions / next:** run the same check on the D-5 photos when #43 merges, then tick G-48. Two findings for the overlay owner: on `s05` at 375 px tag 3 covers the end of tag 1; review boxes draw solid instead of dashed, because the draw-in animation's `pathLength` overrides the dash pattern.

### 2026-11-11 18:18 · G-31 (#175) · High-contrast theme
- **Status:** done
- **What I did:**
  - Added a third theme, `[data-theme="contrast"]`, in `web/app/tokens.css`, built from the light theme: black text on white cards, a light grey page, dark grey borders, the amber accent darkened so it carries white text, and darker severity, verdict, gender, review and chart colours in the same hues.
  - Accepted `"contrast"` in the theme store and in the inline script that sets the theme before first paint; added "High contrast" to the Theme control in Settings (the header toggle keeps System, Light, Dark and leads from high contrast back to System); added a third panel on `/design`.
  - A 3 px focus ring in this theme; printing gives it the light values, like dark.
  - `web/scripts/check-contrast.mjs` prints the ratio table; `web/lib/contrast-theme.test.ts` fails if a token is missing or a ratio drops; `check-palette.mjs` now checks this theme too.
  - The segmented control (`web/components/ui/segmented.tsx`) wraps onto a second row when it does not fit: with four theme options it made the Settings page 14 px wider than a 375 px phone.
- **Result:**
  - Every text token is 7.13:1 or more (lowest: white text on the accent button), every mark 3.29:1 or more (lowest: medium severity on bg). Table in `docs/DESIGN-BRIEF.md`, "High-contrast theme (G-31)".
  - No colour pair in this theme is below ΔE 10 in the colour-blind simulations; medium / high is 17.4 at its lowest (2.0 in the light theme).
  - Playwright: clicking High contrast in Settings sets `data-theme="contrast"`, and a reload keeps it, even with JavaScript files blocked. Screenshots of `/`, `/app/roads/analyze?sample=s01`, `/app/restrooms`, `/app/restrooms/compare`, `/app/analytics`, `/app/settings` and `/design` kept outside git. In print emulation the page gets the light values.
  - At 375 px the Theme control wraps to two rows and the page no longer scrolls sideways.
  - Lint, typecheck and 190 tests pass after merging `main`.
- **Decisions and why:**
  - Built from light, not dark: light themes hold up better on a projector, and the issue asks for dark text on white.
  - The system setting never picks it. "System" stays light or dark, and only a person chooses high contrast.
  - The header toggle keeps its three steps, so a click during the demo never switches to high contrast; from high contrast one click leads back to System.
  - The block declares every token, including the verdict aliases: otherwise the nested panel on `/design` would take the page's values.
  - Printing stays on the light values, so a report looks the same whoever prints it (G-25).
  - Photo boxes keep their colours, because they sit on the photo; only their halo is darker.
- **What I learned / can explain at the defense:**
  - WCAG 4.5:1 (AA) is what light and dark meet; this theme targets 7:1 (AAA, 1.4.6) for text and 3:1 (1.4.11) for marks.
  - How the ratio is computed: relative luminance of each sRGB colour, then (lighter + 0.05) / (darker + 0.05).
  - Why the accent changed from a fill with dark text to a fill with white text: one amber cannot be 3:1 on white as a mark and 7:1 under black text at once.
- **AI use:** Claude Code wrote the tokens, the code, the check script, the test and the Playwright checks from the issue (entry in docs/AI-USAGE-LOG.md).
- **Open questions / next:** Tair could look at the theme on the projector before using it in the demo. The `theme-color` meta tag still follows only light and dark.

### 2026-11-11 18:17 · G-61 (#295) · Three ways to show a rule hit in 'Rules you can read'
- **Status:** done
- **What I did:**
  - Built three rule-hit cards on a temporary page with the same two hits: A the current dark code block, B the engine's sentence with the rule setting highlighted, C the sample (road photo with the driving lane and boxes, or the two door signs) plus the same sentence.
  - Took Playwright screenshots of each at 1440 and 375 px, light and dark, and measured the card heights.
  - Kept B in the landing section, deleted A, C and the temporary page.
- **Result:**
  - `web/components/landing/rule-hit-card.tsx` (the card), `web/lib/landing-rule-hits.ts` (finds the setting and the measured value inside the engine's sentence) with `web/lib/landing-rule-hits.test.ts`; `web/app/page.tsx` uses the card.
  - Comparison sheets: `docs/design/rule-hit-g61/compare-{1440,375}-{light,dark}.png`.
  - The built `/` page marks ×1.5 (R3) and 0.20 (S1) and shows the measured gap 0.10 in bold, all from `scoreDetections` and `evaluateSignage` on samples s01 and the faint pair.
- **Decisions and why:**
  - Picked B. Shortest: both cards take 329 px at 1440 px (A 365, C 583) and 776 px stacked at 375 px (A 861, C 1181).
  - B reads as plain text, with mono only for numbers. The threshold you can change is the one highlighted thing, next to the measured value, so "0.10, below 0.20" reads at a glance. In A they look the same.
  - A's code block flips to a light block in the dark theme and becomes the brightest thing in the section.
  - C repeats the s01 photo and the R3 sentence the hero already shows. At 375 px the shoulder pothole box is about 17 px wide. The sign pair repeats "Preview a sign comparison".
  - The sentence is the engine's own `detail`, not a new one, so the meaning cannot drift. The helper only marks tokens it formats from the same config (`formatAgainst` for the gap). A test fails if a mark is not found.
- **What I learned / can explain at the defense:** the landing shows a real rule hit computed by the same code as Analyze and Compare, at build time, from the bundled samples; changing a default in `web/lib/rules/config.ts` or `web/lib/signage/config.ts` changes the landing sentence and its highlight.
- **AI use:** Claude Code built the variants, the screenshots and the measurements from my task list; I made the pick from the sheets (entry in docs/AI-USAGE-LOG.md).
- **Open questions / next:**
  - Step 2 of the issue, five Godly and Land-book references in Drive and `docs/design/references/design-landing.md`, is not done.
  - The card label still uses `tracking-[0.14em]` (moved from page.tsx, not new), left for G-23's label style.

### 2026-11-11 17:30 · G-58 (#292) · Deck critique against the anti-slop checklist
- **Status:** critique written; the comments still have to be resolved with Roma and Tair, so G-58 stays open.
- **What I did:** Checked all 12 slides and 5 backups of Tair's deck draft against `docs/design/ANTI-SLOP.md`, `docs/design/chart-style.md` and the slide template: fonts, sizes, word counts and pictures per slide with python-pptx, the slide XML for gradients, effects, animations and colours, every number against the file its `Sources:` line names, and each chart's text size once it is shrunk onto the slide. I did not change the deck, `SLIDES.md` or `make_deck.py`.
- **Result:** `docs/design/deck-critique.md`: 18 must-fix and 36 nice-to-have findings, each with the rule, the exact text or element and a one-line fix. No number is wrong; the AI-log count on slide 10 is stale (50 on the slide, 62 on `main` at 17:30), four slots are still placeholders, and slide 7 says 0.78 where its plot ends at 0.83. Body text is 12 to 15 pt against the template's 18, and the main charts land at 4 to 6 pt.
- **Decisions and why:**
  - Under 14 pt on slides 1 to 12 counts as unreadable (must-fix), 14 to 17.5 pt as nice-to-have: on a 13.33 in slide even 18 pt is small, and a line between the two keeps the must-fix list to what really blocks reading.
  - Overpass plus JetBrains Mono counts as two families, which R8 allows, so no font finding; chart text follows chart-style.md, which accepts a fallback font.
  - No slide render: Quick Look gave no image, LibreOffice is not installed and the deck fonts are not on this Mac, so I estimated overflow from box sizes instead and said so.
- **What I learned / can explain at the defense:** the deck was reviewed against a written checklist (Lec3-HCI p21, aesthetic and minimalist design; Lec4-DMViz p31, honest charts), and every number was traced to a committed file a second time, separately from the build script's own check.
- **AI use:** Claude Code ran the measurements and drafted the critique, including the two severity lines; I go through them with Roma and Tair (entry in docs/AI-USAGE-LOG.md).
- **Open questions / next:** go through the 18 must-fix items with Roma and Tair; Amina and Nazar redraw the slide 6 to 8 charts with the chart-style block; I place the slide 9 crops from Drive `screenshots/` in Canva (G-11) and enlarge the small labels in `architecture-slide.svg` (G-66 follow-up).
### 2026-11-11 17:23 · G-59 (#293), G-54 (#288), G-64 (#329) · Motion tokens, demo pause, Reduce motion switch
- **Status:** done
- **What I did:**
  - G-59: named every animation timing in `web/lib/motion.ts` (`timing`, `demo`) and `--duration-ui` in tokens.css, and replaced the literals: count-up 0.8 s, scan line 2.2 s, demo intervals 7 s and 5 s, demo delays, `duration-200`, the default transition 160 ms. Same values, so nothing looks or moves differently.
  - G-54: a Pause/Play button for both landing demos.
  - G-64: a "Reduce motion" switch in Settings that every animation follows.
- **Result:**
  - `web/components/landing/demo-pause-button.tsx`.
  - `web/components/motion/motion-preference.tsx`, `motionStore` in `web/lib/store/settings.ts`, the inline script in `web/lib/theme-script.ts`, a block at the end of `web/app/globals.css`.
  - Tests: `web/lib/motion.test.ts`, `web/lib/theme-script.test.ts`.
- **Decisions and why:**
  - The pause control is a real button whose word and name say what a press does next ("Pause roads demo" / "Play roads demo"). I did not use `aria-pressed`, because a changing label and a pressed state together read twice.
  - The button is hidden under reduced motion by CSS, not by markup: nothing loops then, and conditional markup would differ from the server render.
  - The switch has its own storage key, so the inline script reads it before first paint, and "Reset demo data" keeps it like the theme.
  - Switch over a System/Reduced segmented control: "System" can already mean reduced, so a switch with "On: animations stop. Off: follows your device setting." is clearer.
  - Charts follow the switch through Recharts' `AnimationControllerProvider` in one place, so the chart files (another task in progress) did not change.
  - The count-up got its hook swap only after G-45 (#406), which edits the same file, was merged, so there was no conflict. `MotionGlobalConfig.skipAnimations` also covers any other imperative `animate()` call.
- **What I learned / can explain at the defense:**
  - Moving content that starts by itself and lasts more than 5 s needs a pause (WCAG 2.2.2; Lec3-HCI p.37).
  - The choice is applied before the first paint by the same inline script as the theme, so no animation starts and then stops.
  - Motion's `reducedMotion="user"` stops only transform animations; `skipAnimations` stops all of them, fades included.
- **AI use:** Claude Code wrote the code and the Playwright checks from my task list (entry in docs/AI-USAGE-LOG.md).
- **Open questions / next:**
  - The example chips in the sign demo are still 32 px on phones (G-54 step 3, left for G-30, which restyles them).
  - The detection box delays in `detection-overlay.tsx` and the keyframe timings in `globals.css` are still numbers; the grep does not cover them.
  - G-64 references (Mobbin, macOS) and Drive screenshots still to collect.

### 2026-11-11 17:22 · G-25 (#169), G-68 (#333) · Printable reports and photo thumbnails in table rows
- **Status:** done
- **What I did:**
  - G-25: a print stylesheet and a Print button, so a road report or a sign check prints on one light A4 page. Paper gets the light tokens even from the dark theme, the app's navigation and buttons are hidden, the photo or signs sit next to the verdict card, and a print-only copy of the rule table is printed whichever tab was open. A footer line gives the page URL, the print date and the demo or mock label.
  - G-68: one `RowThumb` component. Road rows show the photo at 64×36 before the location; sign-check rows use it for both signs at 30×36. An entry with no stored image gets a neutral box.
- **Result:** `web/app/print.css` (imported once from `globals.css`), `web/components/app/print-bits.tsx`, `web/components/ui/row-thumb.tsx`, `web/lib/print-tokens.test.ts`; changes in `report-detail-client.tsx`, `check-detail-client.tsx`, `analyses-table.tsx`, `checks-table.tsx`. Playwright `page.pdf()`: demo-001 and demo-rc-001 print on one page from both themes, and so do all 70 demo reports and checks. Thumbnails measure 64×36 on all 41 report rows and 6 'Recent analyses' rows, a test upload shows its own photo, layout shift on `/app/roads/reports` is 0.
- **Decisions and why:**
  - Light paper in CSS, not in JavaScript: the print copy of the light tokens works for Ctrl+P and for `page.pdf()`, and a test fails if the copy drifts from `tokens.css`.
  - The paper layout is scaled to 80% and puts the photo next to the verdict card; at full size the rule table fell onto a second page.
  - The thumbnail sits inside the Location cell (variant C), so the photo and the street name read as one item and phones get no extra column. The alt text names the sample drawing or the uploaded file, not "thumbnail".
  - I did not touch `analysis-view.tsx`, `compare-result.tsx` or `app-shell.tsx` (other open work); the print rules reach them through CSS selectors instead.
- **What I learned / can explain at the defense:** recognition rather than recall (Lec3-HCI p.19): a row is recognised by its photo. Printing keeps the honesty label (U8): a demo or mock result says so on paper too. Browsers drop background colours in print unless `print-color-adjust: exact` is set.
- **AI use:** Claude Code wrote the stylesheet, components and Playwright checks from the two issues (entry in docs/AI-USAGE-LOG.md).
- **Open questions / next:** optional G-68 steps not done: five Mobbin/Refero references (needs a person and the shared Drive), side-by-side screenshots of variants A, B and C, and a `RowThumb` entry on `/design` (another branch edits `/design` today).

### 2026-11-11 17:20 · G-7 (#125), G-71 (#336), G-51 (#285) · One chart style, labelled thresholds, columns for detections per day
- **Status:** done
- **What I did:**
  - Put one chart style into `web/components/charts/chart-kit.tsx`: series colours, axis titles, y-axis width, stacked-bar gaps, value labels, threshold and reference lines. All nine charts on `/app/analytics` and both on `/app/model` use it; none sets its own colours.
  - Fixed the "Score (test)" y-axis title that overlapped the tick labels on `/app/model` (found in G-52): the axis is now wide enough for the ticks plus the title.
  - Drew every rule threshold with its rule and current value above the plot: R1 and its review floor on the confidence histogram, S3 on the similarity chart, S1 and S2 on the gap chart. The label adds "(your setting)" when the value is not the default. The values come from the rule stores.
  - Histogram ticks now sit on the bin edges, and a bin that a threshold cuts through is drawn in two parts, so the colours agree with the counts in the chart titles.
  - Tried a line for detections over time next to the stacked columns, kept the columns, and made DESIGN-BRIEF.md and my G-12 study card say the same.
- **Result:** `/app/analytics` and `/app/model` in light and dark at 1440 and 375 px. Moving S1 to 0.30 and R1 to 0.45 on the Rules pages moved the lines and the labels said "(your setting)". Helpers tested in `web/lib/charts/thresholds.test.ts`.
- **Decisions and why:**
  - Columns for detections per day: each day is a separate count, and the stack shows counted against review. The line dropped to zero on every day without photos and the review line was flat, so "are detections rising?" was harder to read.
  - Threshold labels above the plot, not on it, so they never sit on a tall bar at 375 px. Two lines on one chart get two label rows.
  - Our rules are ink lines; IOAI's published scores are muted lines, so the reader can tell our rule from someone else's number.
  - A bin cut by the line was coloured by its lower edge before, so the S3 chart showed four "below" pairs while its title said two. Splitting the bin fixes that without changing any rule.
- **What I learned / can explain at the defense:** never hide context that changes the comparison (Lec4-VizBasics p8): the threshold is drawn and named where the data is. Line for change over time, bars for comparing counts (Lec4-VizBasics p4). Bars from zero and severity colours only for severity (Lec4-DMViz p31).
- **AI use:** Claude Code wrote the chart changes and the variant screenshots from my task list (entry in docs/AI-USAGE-LOG.md).
- **Open questions / next:** the G-71 references in Drive and `docs/design/references/design-dataviz.md` are not collected. The severity bands 2, 5 and 9 on the Rules page are still text, because `score-ladder.tsx` (W-43) is not merged. The matplotlib threshold style is in the pull request description; G-52 is merged now, so it can be added to `docs/design/chart-style.md` as a "Threshold lines" section and sent to Amina (M-33) and Nazar (C-27).

### 2026-11-11 17:19 · G-20 (#164), G-26 (#170), G-27 (#171) · Token rules, empty-state drawings, dark map
- **Status:** done
- **What I did:**
  - G-20: wrote a "use for" and a "never" line for each of the 9 colour groups on `/design` (8, plus "Roads: needs review" from G-47 after the rebase) and added a "Which colour token do I use?" table.
  - G-26: drew four small empty-state drawings (empty road, two blank door signs, magnifier over an empty table, clipboard with a check) from tokens only. They are on `/design` and in 8 empty states.
  - G-27: darkened the map tiles in the dark theme, themed the popups and zoom buttons, and drew only the findings the list names.
- **Result:** `web/components/design/design-showcase.tsx`, `web/components/illustrations/`, `web/lib/illustrations.test.ts`, `web/components/ui/empty-state.tsx` (optional `illustration`), `web/app/globals.css` (Leaflet block), `web/components/app/map-view.tsx`, `web/components/app/map-client.tsx`.
- **Decisions and why:**
  - Before writing a "never" rule I searched the code for a counter-example. The success callout puts plain text on `sev-clear-soft`, so I dropped a rule that banned exactly that.
  - Map: I tried CARTO's dark basemap first, but its tiles now show "API KEY REQUIRED". I kept OpenStreetMap and put a CSS filter on the tile pane only, so markers, popups and the credit keep their token colours. No new host and no key.
  - Marker ring in dark: `--fg` instead of `--surface`. On the dark tiles it separates overlapping markers and keeps yellow (medium) apart from the orange main roads (compared in two screenshots).
  - `leaflet.css` loads after `globals.css`, so the existing popup rules lost and popups were white in the dark theme. A `.leaflet-container` prefix fixes it without touching the old rules.
  - Today the heading says 37 and the map draws 40 markers, because clear analyses are drawn too. The issue suggests hiding them; I left them, because that changes what Tair's map page shows and waits for his OK.
- **What I learned / can explain at the defense:** consistency and standards (Lec3-HCI p13–37): one severity scale for badges, bars and markers, written down as rules. Honest visualisation (Lec4-DMViz p31): the count shown equals what is drawn.
- **AI use:** Claude Code wrote the code and the rule text from the issues, my brief and searches of the code; I reviewed the screenshots (entry in docs/AI-USAGE-LOG.md).
- **Open questions / next:** ask Tair whether clear analyses should leave the map (count 37, markers 40). The "Roads: needs review" group from G-47 got its lines during the rebase; a new colour group needs both lines (the type requires them).

### 2026-11-11 17:20 · G-56 (#290), G-11 (#127), G-57 (#291), G-63 (#297), G-69 (#334) · Screenshot frame, deck screenshots, video look, imagery, principles
- **Status:** G-63 done. G-56, G-11, G-57 and G-69 in progress: the parts that need Roma, the Drive upload or a native speaker are open.
- **What I did:** Fixed one screenshot frame and added it to the slide template; took 20 deck screenshots (10 shots, light and dark) with a script that applies the frame; wrote the backup video look and drew its title card, end card and caption layout; wrote the imagery rules and the design principles with the voice.
- **Result:** `docs/design/screenshots.md`, `docs/design/screenshots/take_screenshots.py`, slide 5 "Large screenshot" in `docs/design/slide-template/qarau-slide-template.pptx`, `docs/design/video.md` with `docs/design/video/` (SVG and PNG), `docs/design/imagery.md`, `docs/design/PRINCIPLES.md`. Screenshots in `deck-screenshots/` next to the repository, not in git.
- **Decisions and why:**
  - Frame: no browser chrome, `--radius-lg`, 1 px `--border`, `--shadow-md`. Without the line a light shot vanishes on the slide, because the app background and the slide background are the same `#f3f2ee`. A browser bar adds chrome and the risk of personal tabs.
  - 1440 × 900 at 2x, full viewport only: a full-page capture shrinks the text on a 16:9 slide.
  - Video captions sit in their own 120 px bar under the recording, so they can never cover a result or a Demo badge.
  - Screenshots on Mock: the API was not running. Every shot shows its Mock or demo badge; the two result shots should be retaken on Local if the deck claims real model output.
  - Principles: five, each with a route and file lines. Copy changes (generic 500 errors, US/British mix) are listed, not made.
- **What I learned / can explain at the defense:** every screenshot uses one frame and scale; imagery follows the privacy rules (no faces, plates or restroom interiors, EXIF stripped, Syl p.9); the principles come from the brief and each points to a screen, for example "decision first, evidence one click away" is the result card above the "Why this priority" tab.
- **AI use:** Claude Code wrote the drafts, the screenshot script and the SVG cards from my rules and the tokens (entry in docs/AI-USAGE-LOG.md).
- **Open questions / next:** retake the screenshots with the script once port 3000 serves the latest main (G-29, G-45 and others changed the result screens after the shots), then upload `deck-screenshots/` to Drive `screenshots/` and copy it to the presenting laptop (G-11); Roma confirms the frame (G-56) and takes the cards (G-57); Russian and Kazakh terms with Tair and a native speaker, and the copy-change issue for W-21 / R-12 (G-69).

### 2026-11-11 17:15 · G-45 (#279), G-28 (#172) · Numbers line up, box tags readable on phones
- **Status:** done
- **What I did:**
  - G-45: KPI tiles and every `Table` now use tabular figures, and one CSS rule in `globals.css` gives the same to all Recharts text. `CountUp` keeps a hidden copy of the final value under the counting one, so the space for the number is fixed while it counts.
  - G-28: the detection overlay measures the rendered photo with a `ResizeObserver` and sizes the box tags so they never show below 11 px. Tags are pushed back inside the photo at the right and bottom edges.
- **Result:**
  - Count-up on `/app/roads`, "Potholes found" 65 to 104: on `main` the width jumped from 78.86 to 118.28 px at 99 to 100. Now it stays 118.28 px on every frame of the count (1440 px; at 375 px 88.72 px on every frame).
  - Box tags on `/app/roads/analyze?sample=s01` at 375 px: 6.79 px before, 11.00 px after. At 1440 px they stay 12.98 px, as before. All tags stay inside the photo, also the long "review" tags of s05.
  - Test: `web/lib/detection-overlay.test.ts` (7 cases).
- **Decisions and why:**
  - Overpass with `tabular-nums`, not the mono font. Overpass has tabular figures (four digits are 118.28 px wide whatever the digits; without the setting "1111" is 75.08 px and "0000" 125.23 px), so the tiles keep the road-sign voice.
  - The chart rule is CSS, not a change in the chart components, because another teammate is restyling the charts.
  - The tag size is read in an effect, after the first render, so the server and the first client render match (no hydration mismatch). Box lines and box positions are unchanged; only the tags changed.
- **What I learned / can explain at the defense:**
  - Tabular figures give every digit the same width, so a dispatcher can compare scores down a column and a counting number does not shake.
  - On a 375 px phone the photo is drawn at about a quarter of its pixel size, so a tag sized in photo pixels shrank to 7 px. Sizing it from the rendered width keeps it readable (Lec3-HCI, accessibility).
- **AI use:** Claude Code made the changes and the Playwright measurements from my brief (entry in docs/AI-USAGE-LOG.md).
- **Open questions / next:**
  - G-45 issue steps not done here: the five Mobbin/Refero references for the Drive folder, and a VoiceOver check that the KPI value is read once (the code already has one screen-reader text and hides the counting copy).
  - A count that goes down by a digit (for example 10 to 9) still changes width once, at the end; all counts on our pages go up.

### 2026-11-11 17:17 · G-29 (#173), G-24 (#168) · Provenance badges and the icon audit
- **Status:** done
- **What I did:** Made one badge set for where a result comes from: "Demo data", "Mock result" and "Model result:" followed by the model name. Every road, compare and match result now shows exactly one of them. Then I audited the icons on the result cards and wrote the icon map into the design brief.
- **Result:** `web/components/app/demo-badge.tsx` (`ProvenanceBadge`, `ResultProvenanceBadge`; `DemoBadge` stays as a thin wrapper), the rule `resultProvenance` in `web/lib/mock/seeded.ts`, tests in `web/lib/demo-badges.test.ts`, the new icons in `analysis-view.tsx` and `compare-result.tsx`, and DESIGN-BRIEF.md "Provenance badges and icons (G-29, G-24)".
- **Decisions and why:**
  - Amber means "not made by our model": filled for invented demo data, outlined for the mock provider. Slate (`--chart-1`, already the measured-data colour of the charts) means our model made it. No new token, so nothing clashes with the review colour work in G-47.
  - Mock, Local and Cloud badges use the provider's own icon, so the same picture means the same provider in the sidebar, the result details and the badge.
  - A seeded record keeps "Invented demo record" and never shows a model name, as W-28 decided.
  - Provider and Model both used a chip icon; Model is now Brain, the same icon as the "Model" step on the landing page. The two compare measures shared one arrow that also means Swap.
  - The "Needs a human look" callout used the same triangle as High severity, so it got its own icon.
- **What I learned / can explain at the defense:** the provenance badge answers "is this real?" on every result and screenshot (U8), with icon and word as well as colour (U3). One icon per concept is Nielsen's consistency and standards (Lec3-HCI).
- **AI use:** Claude Code wrote the components and the test from my brief and took the screenshots (entry in docs/AI-USAGE-LOG.md).
- **Open questions / next:** four icon clashes outside the result cards are listed in the design brief for Tair: the flask for both the Model page and Demo data, the triangle for both High and Review, ServerCog for Mock on the landing page, and Cpu in the landing privacy list. The `/design` page does not show the three badges yet.

### 2026-11-11 17:13 · G-30 (#174), G-47 (#281) · Selected states that read in greyscale, and a colour of its own for review
- **Status:** done
- **What I did:**
  - G-30: made one `SelectableTile` for the pick-one tiles (sample photos on Analyze, sample signs, example pairs on Compare). Selected now means amber border, a tinted fill and a check mark in a filled circle. The Settings provider card and the Reports severity chips got the same check mark. Unselected tiles, row links and jump-link chips share one grey hover. The sample sign picker had 2 px of padding around a scroll box, which cut off the focus ring; it now has 4 px.
  - G-47: added `--review`, `--review-ink` and `--review-soft` (violet-grey, light and dark) and moved the review box on photos from light blue to light violet. A new `ReviewBadge` (eye icon and the word) replaces the amber "review" text in the reports table and the accent badge in the detection table; the "To review" KPI stripe on `/app` uses the new colour.
- **Result:** `web/components/ui/selectable-tile.tsx`, `ReviewBadge` in `web/components/ui/badge.tsx`, new tokens in `web/app/tokens.css`, a `review` set in `web/scripts/check-palette.mjs`, two short sections at the end of `docs/DESIGN-BRIEF.md`. Greyscale screenshots of every selected tile and chip, light and dark, 1440 and 375 px.
- **Decisions and why:**
  - Violet-grey for review: blue is focus and low severity, amber is the accent and medium, green, orange and red are severities. I made it darker than low severity in the light theme so the two stay apart for colour-blind readers too (ΔE 14.5 or more simulated).
  - The review badge uses an eye, not the circle with an exclamation mark, because medium severity already uses that icon in the same table row.
  - A check mark, not only a thicker border: in greyscale the amber border looks like any dark grey border.
  - I left the restroom verdict "review" amber and the analytics "Needs review" bar on `chart-2`: neither was blue, and they belong to other lanes.
- **What I learned / can explain at the defense:** status is never shown by colour alone (U3): selection has a check mark, review has a dashed box, an eye and the word. The palette check measures colour distance (CIE76 ΔE) with simulated colour blindness; focus and low severity are still both blue, which is fine because focus is only an outline and never a status.
- **AI use:** Claude Code made the code changes, the screenshots and the contrast numbers from my brief (entry in docs/AI-USAGE-LOG.md).
- **Open questions / next:** look at the violet box on real photos (G-48). The legend swatches under the photo are pale on the light theme (as before); a darker legend could be a follow-up.

### 2026-11-11 17:07 · G-66 (#331) · Architecture diagrams for slide 4 and the backup slide
- **Status:** drawn and on this branch; still needs the two PNGs in Drive `slides/` and Alizhan's OK in the chat.
- **What I did:** Drew the slide 4 diagram (five boxes, one photo's path numbered 1 to 5) and a detailed version for the backup slide, both as SVG in the light tokens and the deck fonts, and exported 3840×2160 PNGs.
- **Result:** `docs/design/architecture-slide.svg`, `docs/design/architecture-detail.svg`, `docs/design/architecture-diagram.md` (walk-through, alt text, checks), `docs/design/render_svg.py`.
- **Decisions and why:**
  - Left to right with the providers as a fork: fits 16:9 and follows the order of the script. The demo provider (local) is outlined in amber, cloud is dashed and says "not used in this demo" because S-7 is open.
  - Left out the Gradio app (starter code, never run) and any database: drawing parts that do not exist costs trust.
- **What I learned / can explain at the defense:** the browser is the client, FastAPI the model server; the rules run in the web server so one rule set scores every provider (Lec2-Arch p43); requests and results travel as JSON over HTTP.
- **AI use:** Claude Code drew the SVGs from the code and `docs/ARCHITECTURE.md`, and checked every label (entry in docs/AI-USAGE-LOG.md).
- **Open questions / next:** upload the PNGs to Drive `slides/`, ask Alizhan which version he talks over, send the backup PNG to Roma (R-26).

### 2026-11-11 16:50 · G-52 (#286) · One chart style for the app and the deck

- **Status:** in progress. The style and the matplotlib block are written; Amina and Nazar still have to confirm in the chat and apply it to their plots.
- **What I did:** Wrote down the app's light-theme chart values and seven chart rules, gave the model lanes a matplotlib block, and drew one sample from the real pothole runs to show it works.
- **Result:** `docs/design/chart-style.md`, `docs/design/chart_style_sample.py`, `docs/design/chart-style-sample.png`, and `docs/design/chart-style-compare.png` with the Model page chart next to the sample.
- **Decisions and why:**
  - The highlight is `#b87f00`, not `#f2a900`, because the old amber fails 3:1 on white.
  - The sample highlights E1 because `web/data/experiments.json` records it as the champion. Its title says the choice was made on validation, so E4's slightly higher test score is not hidden.
  - I did not edit `ml/` files: those belong to Amina and Nazar.
- **What I learned / can explain at the defense:** honest charts (Lec4-DMViz p31): bars from zero, one highlight for the one point, and a title that states the takeaway.
- **AI use:** Claude Code drafted the document and the sample script from my token values (entry in docs/AI-USAGE-LOG.md).
- **Open questions / next:** send the block to Amina (M-13) and Nazar (C-6), then tick G-52 when both confirm.

### 2026-11-11 16:47 · G-42 (#276) · Anti-slop checklist

- **Status:** done
- **What I did:** Turned the team's design rules into 13 checks, each one a search anyone can run. I ran them once on `main` and gave every finding a task id or a reason.
- **Result:** `docs/design/ANTI-SLOP.md`; a new checkbox in the pull request template.
- **Decisions and why:**
  - The two looping landing demos go to G-54, the five radii to G-49 and the hand-written letter spacing to G-23.
  - The two typed percentages stay because they are sourced (RULES.md, ML-EXPERIMENT-RESTROOM.md).
  - The Analyze scan line stays because it only shows progress.
  - The theme-colour hex values stay because browser metadata cannot read CSS variables.
- **What I learned / can explain at the defense:** aesthetic and minimalist design (Lec3-HCI p21) and honest charts (Lec4-DMViz p31) become checkable when each rule is a search with a pass condition.
- **AI use:** Claude Code ran the searches and drafted the document from my rules (entry in docs/AI-USAGE-LOG.md).
- **Open questions / next:** G-54, G-49 and G-23 close the open findings.

### 2026-11-11 16:46 · G-22 (#166) · Colour-blind check of the palette
- **Status:** done
- **What I did:** Wrote a script that simulates the three colour-vision deficiencies on every colour set in our tokens and prints how far apart each pair of colours stays (CIE76 ΔE), for both themes.
- **Result:** `web/scripts/check-palette.mjs`; the tables and decisions in DESIGN-BRIEF.md, "Colour-blind check (G-22)".
- **Decisions and why:** five values fall below 10. I kept all five and wrote the reason for each. Severity always shows its word and its own icon, and every chart names its series in a legend. The two weak chart pairs use `chart-3` and `chart-4`, which no chart uses yet.
- **What I learned / can explain at the defense:**
  - About one man in twelve has a red-green deficiency.
  - Simulation means multiplying the linear RGB colour by a published 3×3 matrix (Machado et al. 2009) and then measuring the distance in CIELAB.
  - Amber and orange collapse for deuteranopes, which is why colour is never our only cue.
- **AI use:** Claude Code wrote the script from my brief, after fetching the published matrices from the authors' page (entry in docs/AI-USAGE-LOG.md).
- **Open questions / next:** check the flagged pair by eye with Chrome DevTools' "Emulate vision deficiencies" on `/design`.

### 2026-11-11 15:21 · G-10 (#123) · Slide template from the design system
- **Status:** in progress. The template file is done; I still have to import it into the team's Canva, give Roma edit access and hear back from Roma.
- **What I did:** Built the slide template as a PowerPoint file, generated by a small script from our light-theme tokens. It has eight slides for the seven layouts the deck needs, the viewfinder mark drawn as vector shapes, the road stripe, the footer, a "Demo data" label and the colour list in the first slide's notes.
- **Result:** `docs/design/slide-template/qarau-slide-template.pptx` and `make_slide_template.py`; DESIGN-BRIEF.md "Slide template (G-10)".
- **Decisions and why:**
  - A .pptx, because Roma works in Canva in a browser, and Canva imports PowerPoint files as editable designs.
  - A script, so the template follows the tokens instead of drifting from them.
  - Section dividers on the dark `--inverse` colour, so each module's start is visible from the back of the room.
  - No real numbers in the template, so nobody presents a placeholder as a result.
- **What I learned / can explain at the defense:** the deck and the app share one design system: the same colours, type and mark. Screenshots and slides read as one product, which is consistency and standards, one of Nielsen's heuristics.
- **AI use:** Claude Code wrote the generator script from my token values and checked every slide in a rendered preview (entry in docs/AI-USAGE-LOG.md).
- **Open questions / next:** import into Canva, check the fonts on Roma's device, share with edit access, then tick G-10.

### 2026-11-11 14:59 · G-12 (#119), G-13 (#133) · Study card and slide 9
- **Status:** in progress. The card and the slide content are written; I still have to answer without notes in Rehearsal 1 (G-12) and put slide 9 into the shared deck for Roma (G-13).
- **What I did:** Wrote short spoken answers to my six study-card questions and the content of slide 9 (title, three screenshots with one line each, a chart line, an accessibility line, sources and a 94-word script). Every app example was tried in the running app, and every lecture page was opened in the PDF.
- **Result:** `docs/PRESENTATION.md`, "Dameli — short practice answers" and "Slide 9, design decisions". The three screenshots (570×405 px, light theme) are in my local `qarau-deck/slide-09/` folder, ready for the deck.
- **Decisions and why:**
  - Three heuristics: visibility of system status, error recovery, recognition over recall. Each has a screen I can open in under 10 seconds.
  - Q3 says honestly that the app has no line chart: daily counts are bars, because they are separate totals.
  - The 48 px touch targets are not claimed as done, because some small controls still miss them (W-17).
- **What I learned / can explain at the defense:**
  - The page numbers in our course digests were partly wrong. The heuristics are on HCI p13–26, not p13–37, and the histogram is on DMViz p28, not VizBasics p4.
  - WCAG contrast is (L1 + 0.05) / (L2 + 0.05) and must be at least 4.5:1 for text.
- **AI use:** Claude Code checked each example in the app and each page in the lecture PDFs, drafted the answers and the script for me to rework in my own words, and ran a writing review (entry in docs/AI-USAGE-LOG.md).
- **Open questions / next:** rehearse three random questions without notes; paste slide 9 into the deck with the slide template (G-10) and tell Roma.

### 2026-11-11 14:50 · G-8 (#129), G-4 (#122), G-53 (#287), G-5 (#128) · Landing, type and logo
- **Status:** done, pending review
- **What I did:** Rebuilt the landing hero around a live road-inspection preview, gave the public pages one edge and a shorter header with a phone menu, and made the road car drive in once instead of looping. Replaced Barlow with Overpass after comparing three fonts with Kazakh and Russian text. Compared three logo marks at 16, 32 and 128 px and turned the chosen viewfinder into the favicon, Apple icon, social image and two SVGs for the deck.
- **Result:** the landing, header and footer in `web/`; `web/app/layout.tsx`; `web/app/icon.svg`, `apple-icon.png`, `opengraph-image.png`, `web/public/brand/`; DESIGN-BRIEF.md sections "Type (G-4)" and "Logo (G-53, G-5)".
- **Decisions and why:**
  - Kept Tair's W-62 hero action ("Analyze a road photo" with a sample) as the single primary button, because Tair measured it as the shortest path to a result (U1) and rejected two module buttons.
  - Overpass, because it comes from the same highway-sign lettering as Barlow and has every Kazakh letter.
  - The viewfinder, because it fits both modules and stays legible at 16 px.
  - Headings use the text family, so the app has two families in total.
  - Left out of this PR on purpose, because they belong to other tasks: radii (G-49), the wider page (W lane), the result-origin badge (G-29), and my earlier changes to Analyze, Compare, the `/app` overview, the sidebar and About (Tair's W tasks). They stay on my local branch `design/local-wip`.
- **What I learned / can explain at the defense:**
  - A font only covers the scripts it was drawn for. Missing letters fall back to another font, which breaks the consistency of the type (Gestalt similarity).
  - A mark has to be tested at its smallest real size, 16 px in a browser tab.
  - Motion should explain, not loop.
- **AI use:** Claude Code made the comparison sheets, merged my local work onto the new `main`, kept it to my tasks and rendered the PNGs (entry in docs/AI-USAGE-LOG.md).
- **Open questions / next:** after merge, check `og:image` on the live site; slide template (G-10) and slide 9 (G-13); my study card (G-12).
- **Correction (15:30):** #381 had dropped the landing "Problem" section and the Rules and Team header links, which my local draft had removed but which are not mine to remove. A follow-up PR puts them back unchanged.

### 2026-11-11 14:00 · G-1 (#118), G-2 (#120), G-3 (#121) · Setup, references, colour tokens
- **Status:** done
- **What I did:** Ran the app locally and checked `/design` in both themes. Chose a calm technical direction (graphite, warm neutrals, road-sign amber) from seven references and wrote it into DESIGN-BRIEF.md. Darkened the light-theme amber so it holds 3:1 as a mark on white, and measured contrast for 23 colour tokens in both themes.
- **Result:** DESIGN-BRIEF.md sections "References for the proposed direction" and "Contrast audit"; four colour tokens changed in `web/app/tokens.css` (light `--accent`, `--accent-hover`, `--sev-medium`, `--chart-2`).
- **Decisions and why:** the old amber `#f2a900` measured 2.01:1 on the white surface (1.79:1 on the page background), too faint for a chart mark or a focus ring, so the light theme uses `#b87f00` (3.46:1 on the surface). Dark text on it still reads at 4.93:1. The dark theme stays as it was, because every token there already passes.
- **What I learned / can explain at the defense:** WCAG contrast ratio = (L1 + 0.05) / (L2 + 0.05) from relative luminance; 4.5:1 for body text, 3:1 for large text and for graphical marks. Contrast alone does not prove colour-blind safety, so severity always has a word and an icon too.
- **AI use:** Claude Code recomputed every ratio in the table from the token file and prepared the pull request (entry in docs/AI-USAGE-LOG.md).
- **Open questions / next:** colour-blind check of the five severity colours (G-22); `ml/plots.py` still uses the old amber for the champion bar (G-52); fonts with Cyrillic (G-4).

