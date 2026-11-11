# One chart style for the app and the deck (G-52)

Slides 6 and 8 put app screenshots next to plots made in `ml/`. They should read as one product, so plots use the app's light-theme chart tokens (`web/app/tokens.css`). The slides are light, so plots are light too.

## Values

| Role | Token | Hex |
|---|---|---|
| Background (on a slide) | `--bg` | `#f3f2ee` |
| Background (inside a card) | `--surface` | `#ffffff` |
| Title and values | `--fg` | `#1b1c1e` |
| Axis labels and ticks | `--muted` | `#4f5156` |
| Notes and sources | `--subtle` | `#66686d` |
| Grid lines | `--chart-grid` | `#e1ded7` |
| Axis line | `--border-strong` | `#b3afa4` |
| Series 1 (the default bar) | `--chart-1` | `#3d4f63` |
| Series 2 / highlight (the one bar you talk about) | `--chart-2` = `--accent` | `#b87f00` |
| Series 3 | `--chart-3` | `#6b8f71` |
| Series 4 | `--chart-4` | `#9a6b9a` |
| Severity, only when the chart shows severity | `--sev-clear`, `--sev-low`, `--sev-medium`, `--sev-high`, `--sev-critical` | `#2e8b57`, `#3e7cb1`, `#b87f00`, `#d9601a`, `#93202a` |

The highlight is `#b87f00`, not the older `#f2a900`. The old amber measures 2.01:1 on white and fails the 3:1 that marks need. `#b87f00` measures 3.46:1 (DESIGN-BRIEF.md, contrast audit).

**Fonts:** Overpass for text and titles, the app's text font. If it is not installed, matplotlib falls back to DejaVu Sans, which is fine.

## Rules

1. The title states the takeaway ("E1 is selected on validation mAP50"), not the axis ("mAP50 by run"). It is left-aligned.
2. Bars start at zero; no truncated axes (Lec4-DMViz p31).
3. One highlight colour for the one thing the speaker points at; everything else in series 1.
4. No 3D, no shadows, no dual axes. Grid lines on the value axis only, light.
5. Every series is named in a legend or a direct label, in words. Colour is never the only cue.
6. Severity colours appear only when the chart shows severity.
7. A source line under the plot names the results file it was drawn from.
