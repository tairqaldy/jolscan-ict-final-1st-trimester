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

## matplotlib block

For Amina (M-13, `ml/plots.py`) and Nazar (C-6, `ml/restroom/layers_report.py`): paste this before plotting. Then use `HIGHLIGHT` for the one bar you talk about and `SERIES[0]` for the rest.

```python
import matplotlib as mpl

SERIES = ["#3d4f63", "#b87f00", "#6b8f71", "#9a6b9a"]  # --chart-1..4
HIGHLIGHT = "#b87f00"                                  # --chart-2 / --accent
SEVERITY = {"clear": "#2e8b57", "low": "#3e7cb1", "medium": "#b87f00", "high": "#d9601a", "critical": "#93202a"}

mpl.rcParams.update({
    "figure.facecolor": "#f3f2ee", "axes.facecolor": "#f3f2ee", "savefig.facecolor": "#f3f2ee",
    "text.color": "#1b1c1e", "axes.titlecolor": "#1b1c1e", "axes.labelcolor": "#4f5156",
    "xtick.color": "#4f5156", "ytick.color": "#4f5156",
    "axes.edgecolor": "#b3afa4", "axes.spines.top": False, "axes.spines.right": False,
    "axes.grid": True, "axes.grid.axis": "y", "grid.color": "#e1ded7", "grid.linewidth": 0.8,
    "axes.axisbelow": True, "axes.prop_cycle": mpl.cycler(color=SERIES),
    "axes.titlesize": 14, "axes.titleweight": "bold", "axes.titlelocation": "left",
    "font.family": "sans-serif", "font.sans-serif": ["Overpass", "DejaVu Sans"], "font.size": 11,
    "legend.frameon": False, "figure.dpi": 150, "savefig.dpi": 200, "savefig.bbox": "tight",
})
```

`docs/design/chart_style_sample.py` applies this block to the real pothole runs and writes `docs/design/chart-style-sample.png`.

## App and deck side by side

`docs/design/chart-style-compare.png` puts the Model page chart (light theme, 1440 px) next to the sample plot. Both use the same background, series slate, `#b87f00` highlight and zero baseline. One difference to fix in the app: the "Score (test)" axis label overlaps the tick labels.
