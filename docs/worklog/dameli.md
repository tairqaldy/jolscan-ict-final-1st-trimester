# Worklog: Dameli

**Lane:** Design system and visuals. Tasks suggested for Dameli: see the personal tracker issue and `docs/TASKS.md`.

## Summary for the defense

Fill this in by the code freeze (Wed 23:00). Three to six bullets: what I built or decided, the evidence (links), and the two things I can explain best.

- 

## Entries

<!-- Newest first. Copy the entry template from docs/worklog/README.md. -->

### 2026-11-11 14:00 · G-1 (#118), G-2 (#120), G-3 (#121) · Setup, references, colour tokens
- **Status:** done
- **What I did:** Ran the app locally and checked `/design` in both themes. Chose a calm technical direction (graphite, warm neutrals, road-sign amber) from seven references and wrote it into DESIGN-BRIEF.md. Darkened the light-theme amber so it holds 3:1 as a mark on white, and measured contrast for 23 colour tokens in both themes.
- **Result:** DESIGN-BRIEF.md sections "References for the proposed direction" and "Contrast audit"; four colour tokens changed in `web/app/tokens.css` (light `--accent`, `--accent-hover`, `--sev-medium`, `--chart-2`).
- **Decisions and why:** the old amber `#f2a900` measured 2.01:1 on the white surface (1.79:1 on the page background), too faint for a chart mark or a focus ring, so the light theme uses `#b87f00` (3.46:1 on the surface). Dark text on it still reads at 4.93:1. The dark theme stays as it was, because every token there already passes.
- **What I learned / can explain at the defense:** WCAG contrast ratio = (L1 + 0.05) / (L2 + 0.05) from relative luminance; 4.5:1 for body text, 3:1 for large text and for graphical marks. Contrast alone does not prove colour-blind safety, so severity always has a word and an icon too.
- **AI use:** Claude Code recomputed every ratio in the table from the token file and prepared the pull request (entry in docs/AI-USAGE-LOG.md).
- **Open questions / next:** colour-blind check of the five severity colours (G-22); `ml/plots.py` still uses the old amber for the champion bar (G-52); fonts with Cyrillic (G-4).

