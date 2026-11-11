# Worklog: Dameli

**Lane:** Design system and visuals. Tasks suggested for Dameli: see the personal tracker issue and `docs/TASKS.md`.

## Summary for the defense

Fill this in by the code freeze (Wed 23:00). Three to six bullets: what I built or decided, the evidence (links), and the two things I can explain best.

- 

## Entries

<!-- Newest first. Copy the entry template from docs/worklog/README.md. -->

### 2026-11-11 15:05 · G-8 (#129), G-4 (#122), G-53 (#287), G-5 (#128) · Landing, type and logo
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

