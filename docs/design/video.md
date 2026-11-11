# Backup video look (G-57)

The backup video (R-9) plays if the laptop or the live demo fails (`docs/PRESENTATION.md`, demo script). It should look like the deck: the same light tokens, the same two fonts, the same mark and road stripe. This page fixes the title card, the captions, the cursor and the end card. The cards are drawn in `video/`:

| File | What |
|---|---|
| `video/title-card.svg`, `.png` | Title card, 1920 × 1080 |
| `video/end-card.svg`, `.png` | End card, 1920 × 1080 |
| `video/caption-layout.svg`, `.png` | Where the recording and the caption bar sit in the frame |

The PNG files are rendered from the SVG files in Chromium with Overpass and JetBrains Mono loaded, so they look right in any video editor. Use the PNG files; the SVG files are the source.

## Frame

| Property | Value | Why |
|---|---|---|
| Size | 1920 × 1080, 16:9, MP4 (H.264), 30 fps | The deck's shape; R-9 asks for `qarau-demo.mp4` |
| App shots | The recording fills the top 1920 × 960; the bottom 120 px is the caption bar | A caption can never cover the result, the boxes, the verdict or a Demo badge |
| Recording | Cmd+Shift+5, Record Selected Portion, over the browser's page area in a 2:1 shape (for example 1440 × 720 points) | Same shape as the 1920 × 960 area, so nothing is stretched or cropped later |
| Screen | Light theme, browser page only: no address bar, bookmarks bar, other tabs, account names or notifications | The chrome rules of `screenshots.md` |
| Length | 60 to 90 s, cards included | R-9 done-check |

## Sequence

The shot list is R-9's, from the demo script. Times are a plan, not a rule; the total must stay between 60 and 90 s.

| # | Shot | Seconds | Example caption (Roma words the final ones) |
|---|---|---|---|
| | Title card | 3 | none |
| 01 | Landing page | 5 | Qarau checks road photos and restroom door signs |
| 02 | Roads, Analyze: the road photo, boxes, severity, one rule hit | 30 | Each box is one pothole; six rules turn them into a repair priority |
| 03 | Restrooms, Compare: a mismatched pair, genders, similarity, verdict | 25 | Two doors, two sign sets: the verdict says to check the signs on site |
| 04 | Platform overview | 10 | These tiles and charts run on demo data |
| 05 | Model page, both experiment tables | 10 | The model page shows our real experiment results |
| | End card | 4 | none |

Caption 04 is required: the video has to say which screens are demo data (R-9 done-check, U8).

## Captions

| Property | Value |
|---|---|
| Bar | Full width, 120 px tall, `--inverse` `#1c1d1f` |
| Step number | JetBrains Mono, 32 px, brand amber `#f2a900`, at x = 64 px. The same "01", "02" as on the section dividers |
| Text | Overpass SemiBold (600), 40 px, `--inverse-fg` `#f3f2ee`, at x = 150 px, centred in the bar |
| Contrast | Text 15.06:1, amber number 8.39:1 on the bar (WCAG relative luminance) |
| Length | One line, at most about 60 characters, sentence case, no full stop |
| Timing | One caption per shot, on screen for the whole shot; it changes only at a cut |

Captions are always on. A voice-over is optional (R-9 step 5); without one, the presenter can talk over the video and a noisy room still gets the steps.

## Cursor

- The system pointer at its normal size. Turn on **Show Mouse Clicks** in Cmd+Shift+5 → Options, so each click shows a circle.
- No added zoom, spotlight, cursor trail or click sound.
- Move the pointer only to click. While a result is on screen, park the pointer on the sidebar so it never covers a box, a number or a badge.
- Keyboard focus rings stay as the app draws them.

## Cuts, motion and sound

- Hard cuts between shots. A 200 ms cross-fade only into and out of the cards (page changes are 150 to 200 ms in `docs/DESIGN-BRIEF.md`, Motion).
- No zooms, pans, transitions or speed ramps. The app's own motion (boxes drawn one by one, numbers counting up) already shows what happened.
- Never speed up or cut the wait for a result: "Analysing…" and the scan line are the real latency (U2).
- No music and no sound effects.

## Title card

`video/title-card.png`, 3 s. On `--bg` `#f3f2ee`: the mark from `web/app/icon.svg` (160 px) and the name "Qarau" in Overpass Bold; the eyebrow "ҚАРАУ · KAZAKH FOR “TO INSPECT”" in `--accent-ink` `#855700`; the tagline from `web/lib/brand.ts` in `--muted`; "Backup demo · Roads and Restrooms" and the course line in JetBrains Mono; the road stripe from slide 1 at the bottom. It says what the video is, and nothing it cannot prove.

## End card

`video/end-card.png`, 4 s. The links of the closing slide (repository and `qarau.vercel.app`), the team, one honesty line ("Screens marked “Demo data” or “Mock result” show invented data. The model page shows our real results.") and the data credits from `web/lib/credits.ts`. Mark, name and road stripe as on the title card.

## Before export

- [ ] No caption over the recording area.
- [ ] Every Demo or Mock badge that the app shows is visible in its shot.
- [ ] The road photo passed the face and plate check (D-12); the bundled samples are drawings (`imagery.md`).
- [ ] 60 to 90 s in total, cards included.
- [ ] The first frame is the poster from G-67, if that task is done.
