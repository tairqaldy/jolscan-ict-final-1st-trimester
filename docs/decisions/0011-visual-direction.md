# 0011. Visual direction: stone and asphalt, road-sign amber, Overpass and JetBrains Mono

- **Date:** 2026-11-11
- **Decided by:** Dameli (design lane), on the side-by-side comparisons below
- **Task / issue:** G-70 (#335), with G-41 (#275), G-43 (#277) and G-46 (#280)
- **Status:** decided

## Context
The scaffold shipped a look marked as a placeholder ("placeholder until the lead's references arrive" in `web/app/tokens.css`). Its first text font, Barlow, has no Cyrillic, so "қарау" fell back to a system font, and its light amber `#f2a900` measured 2.01:1 on white, below the 3:1 a mark needs (WCAG 1.4.11). Qarau is a work tool for a road-maintenance dispatcher: severity, rule hits and numbers have to read on a laptop and on a projector, Kazakh and Russian names have to render in the real font, and colour can never be the only cue.

## Options
Each question was answered by comparing named variants on the same components and copy.
1. **Light accent** (G-3, [#380](https://github.com/tairqaldy/qarau-ict-final-1st-trimester/pull/380)): keep `#f2a900` (2.01:1 on white) or darken it to `#b87f00` (3.46:1, dark label 4.93:1).
2. **Text font** (G-4, [#381](https://github.com/tairqaldy/qarau-ict-final-1st-trimester/pull/381)): Overpass, Fira Sans or Golos Text in place of Barlow.
3. **Palette** (G-46, [#437](https://github.com/tairqaldy/qarau-ict-final-1st-trimester/pull/437), `/design/lab?set=palette`): A the current warm stone neutrals with amber `#b87f00`; B cool graphite neutrals with the same amber; C warm stone with a deep amber `#8a5a00` that carries a white label.
4. **Font pairing** (G-43, [#437](https://github.com/tairqaldy/qarau-ict-final-1st-trimester/pull/437), `/design/lab?set=type`): A Overpass with JetBrains Mono; B IBM Plex Sans with IBM Plex Mono; C Golos Text with JetBrains Mono.
5. **Corner radii** (G-41, [#437](https://github.com/tairqaldy/qarau-ict-final-1st-trimester/pull/437), `/design/lab?set=radii`): A the current radii; B `--radius-md` at 4 px.
6. **Themes** (G-31, [#419](https://github.com/tairqaldy/qarau-ict-final-1st-trimester/pull/419)): light and dark only, or a third high-contrast theme chosen in Settings.

The colour-blind check (G-22, [#394](https://github.com/tairqaldy/qarau-ict-final-1st-trimester/pull/394)), the review colour and selected states (G-47, G-30, [#405](https://github.com/tairqaldy/qarau-ict-final-1st-trimester/pull/405)) and the type scale (G-44, [#423](https://github.com/tairqaldy/qarau-ict-final-1st-trimester/pull/423)) were measured on the same tokens.

## Decision
Keep the look that is on `main`: warm stone light and asphalt dark tokens with one road-sign amber accent (`#b87f00` in light, `#ffb81c` in dark), Overpass for text and headings with JetBrains Mono for numbers and code, and a high-contrast theme in Settings.

## Why
- **Contrast decides the accent, not the palette.** `#b87f00` lifts amber marks from 2.01:1 to 3.46:1 on white (#380). In the lab every text and mark check passes for palettes A, B and C in both themes; A's lowest are hints at 4.98:1 (light) and 5.36:1 (dark). B gains only 0.08 to 0.31 and loses the warm concrete-and-asphalt look. C has the most margin (5.93:1 as a mark), but its amber reads brown, close to the medium severity ink `#7a4f0e`, and the high-contrast theme already gives a dark amber with white text at 7.13:1 to whoever needs it (#419).
- **The nine Kazakh letters render in the webfont.** Overpass, IBM Plex Sans and Golos Text each draw all of ә ғ қ ң ө ұ ү һ і themselves (Chrome DevTools rendered fonts, #437). Overpass keeps the road-sign lettering of the logo and the slide template (#381, [#387](https://github.com/tairqaldy/qarau-ict-final-1st-trimester/pull/387)); Plex would change every page and slide the day before the defense; Golos sets the hero line 6% wider (736 against 693 px at 64 px), so long headings wrap earlier.
- **Colour is never the only cue.** #394 found five pairs below ΔE 10 under simulated colour blindness and kept them because severity always carries its word and icon; #405 gave "needs review" a violet-grey at ΔE 12 or more from focus and low severity in every simulation, and a check mark on selected tiles. The lab palettes were also viewed under deuteranopia and achromatopsia emulation (`docs/design/lab/`).
- **Course rules.** WCAG contrast of 4.5:1 for text (Lec3-HCI, accessibility row of `docs/COURSE-GROUNDING.md`); a colour-blind-safe palette and one type scale (Lec4-DMViz p31, #423); aesthetic and minimalist design (Lec3-HCI p21): one accent hue and two font families.

## Consequences
- `web/app/tokens.css` and the fonts in `web/app/layout.tsx` stay as they are. `/design/lab` keeps the alternatives one URL away; a new comparison is one more set in `web/lib/design-lab.ts`.
- JetBrains Mono draws only ө ү і of the nine Kazakh letters; ә ғ қ ң ұ һ fall back to a system font. Keep Kazakh and Russian text out of `font-mono`. If mono ever has to carry Kazakh, IBM Plex Mono covers all nine. Settled on 12 November (G-43, #277): mono stays JetBrains Mono, because no page sets Kazakh or Russian text in mono (all 32 files with `font-mono` show code, IDs, paths or numbers) and changing the mono the day of the defense would touch every number on every page. Revisit when W-58 (#163) wires Kazakh into the app.
- Amber on white is 3.46:1: right for fills with a dark label and for marks, wrong for text. Amber text uses `--accent-ink` (5.58:1).
- The photo boxes and the static brand files keep the brighter `#f2a900`, which is tuned for photos and the logo, not for white surfaces.
- Watch Russian and Kazakh text lengths in buttons and table headers (W-65, #303): Overpass is slightly wider than Barlow.
- `docs/design/ANTI-SLOP.md` (R9) still counts five radius tokens against a limit of three. The radii set in the lab keeps A, and this record does not settle how many radii to keep.
