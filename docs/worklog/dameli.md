# Worklog: Dameli

**Lane:** Design system and visuals. Tasks suggested for Dameli: see the personal tracker issue and `docs/TASKS.md`.

## Summary for the defense

Fill this in by the code freeze (Wed 23:00). Three to six bullets: what I built or decided, the evidence (links), and the two things I can explain best.

- 

## Entries

<!-- Newest first. Copy the entry template from docs/worklog/README.md. -->

### 2026-11-11 19:32 · G-21 (#165) · Tests that keep the tokens and the code in sync
- **Status:** done.
- **What I did:**
  - `web/lib/tokens.test.ts` reads `tokens.css`, every stylesheet and the code in `app/`, `components/` and `lib/` as text and checks: every theme block (light, dark, contrast and any new one) declares the light tokens and no others, except the photo box tokens that dark takes from light; aliases such as `--verdict-clear: var(--sev-clear)` point to tokens of the same theme; the `@theme` mapping names only tokens that exist, and each `--color-x` maps to `var(--x)`; every `var(--x)` and `bg-(--x)` in the code is defined (Tailwind's `--tw-*` and Radix's `--radix-*` excepted); the two `themeColor` values in `app/layout.tsx` equal `--bg` of light and dark; no hex colour in `app/` or `components/` code except `layout.tsx`.
  - `web/lib/css-tokens.ts`: the small readers the tests share. The print test (G-25) now imports its `declarations` parser from there instead of keeping its own copy.
  - `web/lib/motion.test.ts` already compared the JS motion values with the CSS ones. I extended it in the other direction (every `--duration-*` and `--ease-*` needs a JS twin) and added a check that the default timing function equals `--ease-standard`.
- **Result:** 14 new checks and 2 new motion checks pass on the branch rebased on `main`; no drift found. Each deliberate break made a test fail with the file and line, then I restored it: a dark-only token, an alias to a missing token, `--color-fg: var(--muted)`, `bg-(--chart-9)` in a component, a changed dark `--bg`, `"#abc"` in a component, `--duration-draw: 650ms` and an extra `--duration-extra`. `pnpm lint`, `pnpm typecheck`, `pnpm exec vitest run --maxWorkers=2` (19 files, 239 tests) and `pnpm build` pass.
- **Decisions and why:**
  - Parsed generically, so a token or theme added by another pull request is checked without editing the test. The only named exceptions are the `--box*` overlay tokens (tokens.css says they are the same in both themes) and the `--tw-` and `--radix-` prefixes.
  - The motion check stays in `motion.test.ts`, extended rather than copied into `tokens.test.ts`, so one drift fails one test.
  - `var(--shadow-${size})` in a template string counts as used when some token starts with `--shadow-`.
  - The hex check skips comments and `href="#..."`, and needs a non-letter after the digits, so `#main` and `#roads` do not count.
- **What I learned / can explain at the defense:** tokens.css is only "the one file to re-skin the app" if nothing else holds a colour or a timing. These tests turn the "keep in sync" comments into checks that fail in CI when a pull request changes one side only.
- **AI use:** Claude Code wrote the tests and the helper; I checked them with deliberate breaks (entry in docs/AI-USAGE-LOG.md).
- **Open questions / next:** the tests read CSS as text and assume plain `selector { --name: value; }` blocks. A nested rule inside a theme block would need a real CSS parser (postcss).

### 2026-11-11 19:24 · G-49 (#283), G-23 (#167), G-62 (#296) · Three radii, one eyebrow label, one card inset
- **Status:** done
- **What I did:**
  - G-49: cut the radius tokens in `web/app/tokens.css` from five plus `full` to three plus `full`: `--radius-sm` 4 px, `--radius-md` 6 px, `--radius-lg` 10 px. The nine `rounded-xs` uses (swatches, distribution bars, row thumbnails, the severity dot) became `rounded-sm`, the seven `rounded-xl` uses (landing cards, hero preview, team cards, `/design` theme panels, the bottom sheet) became `rounded-lg`, and the focus ring moved from `--radius-xs` to `--radius-sm`. `/design` shows sm, md, lg and full.
  - G-23: one `@utility eyebrow` in `web/app/globals.css` (12 px, weight 600, uppercase, `--tracking-eyebrow` 0.14em) replaces the 15 hand-written labels with `tracking-[…]` and 5 with `tracking-wide` (colour group titles on `/design`, four labels on `/design/lab`); the colour class stays on each label. Added the eyebrow to the type scale on `/design`.
  - G-62: one card inset token, `--card-pad` (16 px below 640 px, 20 px from 640 px), used by `Card`, the KPI tile and every ad-hoc card (landing, demos, overview links, glossary, lifecycle, Settings tiles, Match details, `/design` theme panels).
  - Wrote the three radii and where each is used, the eyebrow, and the spacing rhythm with a before/after table in `docs/DESIGN-BRIEF.md`.
- **Result:** the R9 grep prints 3; `grep -rn "tracking-\[" web/components web/app` finds nothing. Playwright on my dev server: computed eyebrow is 12 px / 16 px / 600 / 1.68 px on `/` and `/design`; KPI tiles are 16 px at 375 and 20 px at 1440. Screenshots of `/`, `/app/roads/analyze?sample=s01`, `/app/restrooms`, `/app/analytics` and `/design` at 1440 and 375 px, light and dark, before and after each task: after G-23 the app pages were pixel-identical (only the four 0.18em headers moved). The 320 px scroll check printed `false` on all five routes after each task. Lint, typecheck, 223 tests (after rebasing on `main`) and `pnpm build` pass.
- **Decisions and why:**
  - Radii 4 / 6 / 10 instead of the issue's variants (4 / 8 or 2 / 6): it keeps the order small part, control, container, and 89 of 105 `rounded-*` classes kept their value. Did not reset Tailwind's `--radius-*`, so a `rounded-xl` from a parallel branch still renders round; the brief says not to use it.
  - Eyebrow at 0.14em, the value 11 of 15 labels already had. The utility has no colour, so `text-accent-ink` and `text-muted` never fight it in the cascade.
  - Card inset 20 px from 640 px up (every `Card` and KPI tile already had it). On phones 16 px, not the `Card` count winner 20 px: at 375 px the three-across overview tiles would clip "40" (needs 59 px, 56 px left). A token, not `p-4 sm:p-5`, because `cn()` does not merge classes and `sm:p-5` would beat `CardBody className="px-0"` on desktop.
  - Removed `className="p-3 sm:p-4"` from the six overview KPI tiles: it never applied (the tile's own padding came later in the CSS), so they render as before.
- **What I learned / can explain at the defense:** fewer radii and one inset make components read as one system (aesthetic and minimalist design, Lec3-HCI p.21). A type scale only works if every page uses it; the hand-written letter spacing was counted and removed. With class joining instead of class merging, a responsive override can silently win, so the card inset is a CSS variable.
- **AI use:** Claude Code made the class and token changes, wrote the Playwright checks and drafted the brief sections (entry in docs/AI-USAGE-LOG.md).
- **Open questions / next:** optional issue steps not done: references in Drive and `docs/design/references/`, variants on `/design/lab` (the lab merged during this work; I moved its column to `rounded-lg` and `--card-pad`, and `web/app/design/lab/lab.css` still has two unused rules for `.rounded-xs` and `.rounded-xl` that its owner can drop). KPI numbers still clip at 320 px on the overview and "63 ms" on `/app/roads` at 320 and 375 px (both before this change); needs a smaller KPI number size on phones, with Tair.

### 2026-11-11 19:23 · G-28 (#172), G-47 (#281), G-48 (#282) · Dashed review boxes and tags that do not cover each other
- **Status:** done. Follow-up to the three merged tasks; the issues and TASKS.md rows stay as they are.
- **What I did:**
  - Review and ignored boxes were drawn solid. motion's `pathLength` (the draw-in) writes its own `stroke-dasharray` (one dash as long as the outline), so the dash pattern was overwritten, with and without reduced motion. In `web/components/app/detection-overlay.tsx` a dashed box is now a plain dashed `<rect>`; the draw-in runs on a mask that uncovers it along its outline, with the same `duration.draw` and `ease.emphasized` tokens. Counted boxes keep the old draw-in and stay solid.
  - Tags: `placeTags` places them in box order. If a tag comes within one stroke width of an earlier tag, it tries below its box, then inside the box at the top, then inside at the bottom. Every spot stays inside the photo; the font size rule from G-28 is unchanged.
  - Tests in `web/lib/detection-overlay.test.ts`: the s05 layout at 375 px, the order of the fallback spots, and a server render that checks the review boxes carry `stroke-dasharray="16 10"` and no `pathLength`.
  - Added a "Fixed in the overlay follow-up" note under the G-48 "Found, not fixed here" list in DESIGN-BRIEF.md.
- **Result:** Playwright on `/app/roads/analyze?sample=s01` to `s06`, 1440 and 375 px, light and dark, plus reduced motion from the OS and from the Settings switch (48 page loads): before, tags 1 and 3 on s05 at 375 px shared 87.4 px² and the review boxes computed `1px, 1px` (solid); after, no two tags share any area on any load, both review boxes compute `16px, 10px`, counted boxes stay solid, every tag is inside the photo, tags measure 11.00 px at 375 px and 12.98 px at 1440 px. Box colours, halo and detection data unchanged.
- **Decisions and why:**
  - A mask instead of swapping the solid box for a dashed one when the draw-in ends: no jump from solid to dashed, and the dashed box looks the same during and after the animation.
  - Below the box before inside it: on s05 tag 3 placed inside its 17 × 8 px box hid the outline.
  - Only tags are kept apart, not tags and other boxes: the issue was a tag covering a tag's text.
- **What I learned / can explain at the defense:** the legend says dashed means "needs review", so the box has to be dashed in every state, not only before the animation; style plus label, not colour alone (WCAG 1.4.1). Labels on a chart must not cover each other; a simple ordered fallback is enough for a few boxes.
- **AI use:** Claude Code found the cause, made the change and wrote the Playwright check (entry in docs/AI-USAGE-LOG.md).
- **Open questions / next:** with many boxes in a small area every spot can be taken; the tag then takes the spot that covers the least. Real photos (D-5) may need another look.

### 2026-11-11 19:22 · G-41 (#275), G-46 (#280), G-43 (#277), G-70 (#335) · Design lab, palette and font trials, and the visual-direction record
- **Status:** G-41, G-46 and G-70 done. G-43 partial: the text fonts of all three pairs render the nine Kazakh letters, but JetBrains Mono, the mono of the chosen pair, does not (see Result).
- **What I did:**
  - G-41: `/design/lab?set=<id>` renders the same real components (buttons, severity badges, a KPI card with bars, a field, a switch, selectable tiles, a callout, a table) once per variant, in the light and the dark theme. Each column sets its overrides inline; column A sets nothing, so it is the live look. The sets live in `web/lib/design-lab.ts`, the page is `web/app/design/lab/page.tsx`, and `/design` links to it. It is not in the navigation and is marked `noindex`. First set: radii, B with `--radius-md` at 4 px.
  - Radii are declared in `@theme inline`, so Tailwind writes `6px` into `rounded-md` instead of `var(--radius-md)`; `lab.css` points the radius utilities back at the variables inside a lab column only.
  - G-46: palette set with A current warm stone and amber, B cool graphite with the same amber, C warm stone with a deep amber `#8a5a00` and a white label. Under each column a table of WCAG 2.x ratios computed from the token values (text, secondary text, hints, amber text, accent as a mark, button label). A test checks the copied live values against `web/app/tokens.css`.
  - G-43: IBM Plex Sans with IBM Plex Mono and Golos Text with JetBrains Mono, loaded with `next/font` in `web/app/design/lab/fonts.ts`, which only the lab page imports. Type set with the hero line, "Qarau (қарау)" at 14, 16, 28 and 64 px, the nine Kazakh letters in text and mono, a Kazakh and a Russian sentence, a KPI "1 234" and a rule table.
  - G-70: `docs/decisions/0011-visual-direction.md` from the template, the row in the decisions table, and the placeholder notes in `tokens.css` and DESIGN-BRIEF.md now point to it.
- **Result:**
  - Radii: a computed-style diff of A and B over 150 elements finds only `border-radius` different, on the 7 controls that use `rounded-md`, in both themes.
  - Palette: every check passes in all three palettes and both themes. A's lowest are hints at 4.98:1 (light) and 5.36:1 (dark); B gains 0.08 to 0.31; C has 5.93:1 for the accent as a mark against A's 3.46:1.
  - Type (Chrome DevTools Protocol, rendered fonts per letter): Overpass, IBM Plex Sans, Golos Text and IBM Plex Mono draw all nine Kazakh letters, upper and lower case. JetBrains Mono draws only ө ү і; ә ғ қ ң ұ һ fall back to Arial. At 64 px the hero line is 693 px wide in Overpass, 705 in Plex and 736 in Golos.
  - The trial fonts are only in the lab route's CSS chunk; the shared stylesheet has none of them. No horizontal scroll at 375 px on any set.
  - `pnpm lint`, `pnpm typecheck`, `pnpm exec vitest run --maxWorkers=2` (16 files, 201 tests) and `pnpm build` pass. Screenshots in `docs/design/lab/`.
- **Decisions and why:**
  - A stays in every set, the look on `main`. Palette: contrast does not separate the three; B loses the warm look and C reads brown, while the high-contrast theme already has a dark amber. Type: Overpass matches the logo and the slide template, and Plex would change every page the day before the defense. Radii: B makes the controls match the badges instead of standing apart.
  - Column A gets no inline values, so it cannot drift from the live tokens; the copied colours are only for the contrast numbers, and a test fails if they differ from `tokens.css`.
  - Did not set the five current radii inline (the stopped session's draft did): the radius count is about to change, and hard-coded values would make column A wrong.
- **What I learned / can explain at the defense:** components use tokens only, so a variant is a handful of CSS variable overrides on one wrapper, and the comparison is honest because nothing else changes (the diff shows it). WCAG contrast is computed from relative luminance; text needs 4.5:1 and marks 3:1 (Lec3-HCI). A font can claim a Cyrillic subset and still miss Kazakh letters, so we checked the rendered font per letter.
- **AI use:** Claude Code reviewed the stopped session's draft, wrote the page, the checks and the record; I chose A in each set (entry in docs/AI-USAGE-LOG.md).
- **Open questions / next:** G-43: decide whether Kazakh text in `font-mono` matters (switch the mono to IBM Plex Mono) or accept that mono is for numbers and code, then tick it. Not done: the reference collections in Drive and `docs/design/references/` for G-43 and G-46.

### 2026-11-11 19:19 · G-67 (#332) · Poster frame for the backup video
- **Status:** partial. The poster and the step that puts it in front of the video are ready; R-9's `qarau-demo.mp4` does not exist yet, so the poster is not in the file, in Drive `video/` or on the presenting laptop.
- **What I did:**
  - `docs/design/video/make_poster.py` draws three 1920 × 1080 posters from the G-11 Mock shots of the road result and the sign result: A the road result across the width with the name under it, B road result and sign verdict side by side, C name on the left and road result on the right. It also writes a sheet with each one at 320 px wide and at 1280 × 720.
  - Wrote the "Poster frame" section in `docs/design/video.md`: the three variants, the pick and why, the honesty rules, and an ffmpeg command that scales the poster to the video's size and frame rate, adds a second of silence if the video has sound, and joins it in front.
  - Ran the command on three 5 s test clips (1920 × 1080 at 30 fps without and with sound, 1440 × 720 at 60 fps).
- **Result:** `deck-screenshots/poster/qarau-poster-a.png` (the pick), `-b`, `-c` and `compare.png`, outside git. The test copies were 6.00 s long with 180, 180 and 360 frames; the first 30 (60) frames are the poster and the next frame is the clip's first frame. The poster's only words are "Qarau", "Backup demo · Roads and Restrooms" (the title card) and "Mock result" (the app's badge, which stays in the crop).
- **Decisions and why:**
  - A, because at 320 px (a file preview) the boxes, the red "Critical" badge and the score 15 are still the picture; in B each shot is under 200 px wide and in C the name takes a third of the frame.
  - The crops stop above the "Model latency" and "Analysed" row: the time changes with every run, so it would not appear in the recording. Everything else in the crop is fixed by sample `s01` and the Mock provider. The script stops if a crop shows that row or cuts the "Mock result" badge.
  - No length on the poster yet: the issue wants the length of the real file. `--length 1:12` adds it once R-9's file exists.
  - The poster is looped for 2 s and trimmed to 1 s after the frame-rate filter: with `-t 1` the `fps` filter dropped the last poster frame (179 frames instead of 180).
- **What I learned / can explain at the defense:** the backup video opens on a real result screen of the app, labelled "Backup demo" and "Mock result", so the still promises nothing the video does not show; the same words and numbers are in shot 02 of the recording.
- **AI use:** Claude Code wrote the script and the ffmpeg command and ran the tests; I checked the posters at full size and at 320 px (entry in docs/AI-USAGE-LOG.md).
- **Open questions / next:** Roma, after R-9: redraw A with `--length`, run the ffmpeg block from video.md on `qarau-demo.mp4`, watch it to the end with Wi-Fi off, put `qarau-demo.mp4`, `qarau-demo-raw.mp4` and `qarau-poster.png` in Drive `video/` and the video on the presenting laptop, and check the player, Drive's preview and the fallback slide. If R-9 records another sample or the Local provider, retake the shot and redraw. The issue's five references and the pick together with Roma were not done; the `ffprobe` lines were not run here (no ffprobe on this machine).

### 2026-11-11 19:20 · G-50 (#284) · One drop zone for roads and restrooms
- **Status:** done
- **What I did:**
  - New `web/components/ui/dropzone.tsx`: one `Dropzone` with six states (idle, drag-over, invalid, filled, disabled, busy) and two shapes: `banner` for roads Analyze (the preview sits above it) and `tile` for the restroom sign slot (the preview sits inside it). It checks every chosen or dropped file with `validateImageFile` from `web/lib/upload.ts` and hands a good file to the page; the page still shows the message and still does the re-encoding and EXIF stripping (`web/lib/image.ts`) when it sends the photo.
  - `analyze-client.tsx` and `sign-slot.tsx` now use it. Compare and Match use `SignSlot`, so `match-client.tsx` and `compare-client.tsx` did not change.
  - `/design` has a new "Upload drop zone" block with the six states in each theme and one live banner.
  - `web/lib/dropzone.test.ts`: 14 tests for the file check (wrong type, over 10 MB, good file, nothing picked), the state order and the markup of each state.
- **Result:** the same Playwright script ran on my dev server before and after, with a text file, an 11 MB file, a dropped WebP and a chosen WebP. The only difference in the two result files is the new `data-state` zones (0 before; 1 on Analyze, 2 on Compare, 1 on Match after). Same accepted types, same messages, the same re-encoded upload (7062 bytes on disk, 7716 bytes sent, as before), and the Analyze, Compare and Match results appear on Mock. Tab reaches the input on all three pages and Enter opens the file dialog. Lint, typecheck, 205 tests and `pnpm build` pass.
- **Decisions and why:**
  - Kept each page's message and where it shows (the Callout on Analyze, the line under the buttons in the slot): only the zone was meant to change, and this is the live demo path.
  - An invalid file now also gives the zone a red border and `aria-invalid`, so the error is next to the place you act.
  - A disabled slot (Compare and Match while a request runs) now ignores dropped files, as it already ignored clicks.
  - Async `onFile` shows busy while Analyze reads the image size; the input is not disabled then, so keyboard focus stays.
- **What I learned / can explain at the defense:** one upload component with the same states in both modules follows consistency and standards (Lec3-HCI p.17); every state has its own look plus a text or ARIA cue, not colour alone.
- **AI use:** Claude Code wrote the component, the tests and the Playwright checks (entry in docs/AI-USAGE-LOG.md).
- **Open questions / next:** optional issue steps not done: six references in Drive and `docs/design/references/design-components.md`, and the two layout variants side by side. The screenshots are in the pull request description as file names only (kept on my laptop).

### 2026-11-11 19:18 · G-60 (#294) · One landing effect kept: the step line on How it works
- **Status:** done
- **What I did:**
  - Tried three effects on the How it works steps on a temporary route, next to A (no effect): B the Magic UI Animated Beam, C a CSS-only step line, D the React Bits Spotlight Card. B and D were rewritten by hand with our tokens, not copied.
  - Screenshots of all four at 1440 and 375 px in light and dark, plus frame strips of C while scrolling and of B while it draws (`docs/design/landing-effect-g60/`).
  - Kept C: a 2 px accent line on top of each step that fills in step order as the list scrolls in (`web/app/globals.css`, class `how-steps` on the list in `web/app/page.tsx`). Deleted the temporary route.
  - Wrote `docs/design/borrowed.md` (licence, dependencies and result per variant) and a test that the line stops under both reduced-motion paths and never loops.
- **Result:** on `/` the line runs on a `view()` scroll timeline; at 1440 px the four steps fill one after another and are full when the list top reaches about half the screen. With the OS setting or the Settings switch "Reduce motion" every line has `animation-name: none` and is simply drawn. Layout shift while scrolling through the section: 0 in all cases. Copy, the Demo badge and the two demo players with their Pause buttons are unchanged. `pnpm lint`, `pnpm typecheck`, `pnpm exec vitest run --maxWorkers=2` (194 tests) and `pnpm build` pass.
- **Decisions and why:**
  - C over B: at 375 px the beam runs down through the step text, it needs client JS to measure the path, and the original loops forever with no reduced-motion check.
  - C over D: the spotlight follows the pointer only, so phones see nothing, and it explains nothing.
  - Tied to scrolling, not a timed play: it never runs on its own and never loops (ANTI-SLOP.md R7), and it needs no JavaScript.
- **What I learned / can explain at the defense:** one effect was kept because it explains the pipeline: photo, model, rules, action fill in that order. An effect has to earn its place; the other two were decoration or hurt reading on a phone.
- **AI use:** Claude Code reviewed the stopped session's work, took the screenshots with Playwright and made the commits (entry in docs/AI-USAGE-LOG.md).
- **Open questions / next:** not done from the issue: the five references in Drive and `docs/design/references/design-motion.md`, and a Lighthouse run (Lighthouse is not installed; the change adds no JavaScript and no layout shift). Firefox has no scroll timelines yet, so there the line is drawn without motion.

### 2026-11-11 18:26 · G-44 (#278), G-65 (#330) · One type scale, and every page reflows at 320 px
- **Status:** done
- **What I did:**
  - G-44: `--text-*: initial` in `web/app/tokens.css`, so the scale is our nine steps only (0.75rem to 4rem). Tailwind's default `text-6xl` was 3.75rem, smaller than our `text-5xl` (4rem). The hero heading dropped from 4rem to 3.75rem at lg (`lg:text-[3.75rem]`); it now stays on `text-5xl`. The step numbers on the landing page moved from `text-6xl` to `text-5xl`, and the token names on `/design` from `text-[0.68rem]` to `text-xs`.
  - G-65: measured all 18 routes from the issue at 320×640 with Playwright (`document.documentElement.scrollWidth > window.innerWidth`). Six printed `true`: `/`, `/about` and `/design` (public header, 348 px), Compare (336 px), Restrooms rules (326 px), Settings (332 px). Fixed each in the component that broke: the public header shows only the logo mark below 360 px, the Compare example pairs stack in one column below 640 px, the "Choose a sample" label may wrap, the Select trigger's minimum width is `min(10rem, 100%)`, and the long note badge on Settings wraps.
  - G-65: at 1280×720 and 200 % zoom (640×360 CSS px) Tab and Shift+Tab put controls under the sticky top bar or the bottom tab bar on analyze, compare and match. Added `scroll-padding-top: 7rem` and `scroll-padding-bottom: 4.5rem` on `html` below lg, only when the app shell is on the page, and lowered the result and section scroll margins by the same amount so they land where they did before.
- **Result:** 320×640: all 18 routes print `false`; only tables scroll inside their own box. 640×360: all 18 routes print `false`, and of about 130 Tab and Shift+Tab stops per page on analyze, compare and match none is fully hidden (before: 5, 6 and 12 hidden stops, among them "Open as report", "Compare signs" and "Change"). The Demo badge stays in the mobile header at 320 px. The analyze result still lines up 128 px from the top after Analyze. `grep -rn "text-\[" web/app web/components` prints nothing. Lint, typecheck, 139 tests and `pnpm build` pass.
- **Decisions and why:**
  - Mapped 3.75rem to the nearest step (`text-5xl`, 4rem) instead of adding a 6xl step: 4 px is not worth another size, and the hero no longer gets smaller at lg than at sm.
  - Hid the wordmark text, not the theme toggle or Menu, in the 320 px public header: the mark and the link name "Qarau home" stay, and no control is lost.
  - Scroll padding, not hiding the bars, keeps focus visible. It applies only to the app below lg, because the landing anchors and the public pages have no bottom bar.
  - No `overflow-x: hidden` on `body`: it would hide content instead of reflowing it.
- **What I learned / can explain at the defense:** typographic hierarchy (Lec4-DMViz p.31): one scale where each step is larger than the one below. Pages reflow at 320 px and stay usable at 200 % zoom; each route was checked with a console test, not by eye (WCAG 1.4.10, 1.4.4, 2.4.11; Lec3-HCI p.37). Tables are the allowed exception: they scroll inside their card.
- **AI use:** Claude Code made the class changes and wrote the Playwright checks from the two issues (entry in docs/AI-USAGE-LOG.md).
- **Open questions / next:** optional steps not done: references for both issues in Drive and `docs/design/references/`, variants A and B on `/design/lab`, Firefox "Zoom Text Only" (only Chromium was available), and light/dark screenshots of the variants. Chart reference labels on `/app/analytics` and `/app/model` are set to 11 px in SVG (chart code, not the class scale); G-7's chart kit owns them.

### 2026-11-11 18:21 · G-72 (#337) · Annotated road and sign result slides
- **Status:** partial. The annotated slides exist as PNGs; Roma still has to place them in the deck (Canva), so G-72 stays open.
- **What I did:** Marked four things on the road result and four on the sign result from the 18:09 Mock retake (G-11): road, the boxes with confidence, "Critical" with score 15, the R2 row (+7) and the action with its 24 h target; sign, the two signs read as Male and Female, the gap 0.84 against S1, the similarity 0.81 against S3, and the Review verdict with its action. Checked every value against the sample manifests, `web/lib/rules`, `web/lib/signage` and `docs/RULES.md`. `docs/design/screenshots/annotate.py` draws the SVG overlay over the raw shot and renders it to 1920 × 1080 PNGs in the template's "Large screenshot" layout, light and dark.
- **Result:** four PNGs and their SVGs in `deck-screenshots/annotated/` (outside git, ready for Drive `screenshots/`); `docs/design/annotations.md` with each marker's label, speaker line and the source of every value; marker rules added to `docs/design/screenshots.md`.
- **Decisions and why:**
  - The four markers follow the issue (evidence, decision, rule, action), not the Mock badge: a marker on the badge would cover it, and the eyebrow and a legend note already say "Mock result".
  - Labels at 36 px (18 pt on the slide), the size the deck critique asks for; the shot itself stays at the template's 8.0 in, so the speaker reads from the legend, not from the screen.
  - Nothing dimmed, so the demo badges stay readable; the script stops if a marker touches a badge, a label is too wide or a slide has more than four markers.
  - The sign rule table is below the fold, so markers 2 and 3 point at the bars, which name S1, S2 and S3.
- **What I learned / can explain at the defense:** if the live demo fails, the two slides show the same four steps: the evidence, the decision, the rule that fired and the action, and why the road scores 15 (4 + 2 + 1 = 7, +3 for the lane, +5 for the highway).
- **AI use:** Claude Code checked the values, wrote the script and drafted the notes; I checked the labels against the screens (entry in docs/AI-USAGE-LOG.md).
- **Open questions / next:** Roma places the two light PNGs on slide 3's fallback and in the backup section; the issue's three-variant comparison and three-metre check with Roma and Tair were not done; redraw after any UI change before the freeze.

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

