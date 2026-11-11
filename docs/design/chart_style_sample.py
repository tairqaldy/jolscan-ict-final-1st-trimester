"""Draw one plot in the shared chart style (G-52) from the real pothole runs.

    python3 docs/design/chart_style_sample.py   # needs matplotlib

Reads ml/results/experiments.csv for test mAP50 per run, and web/data/experiments.json for the
champion the team's selection rule picked; nothing is typed by hand. Writes chart-style-sample.png.
"""
import csv
import json
from pathlib import Path

import matplotlib as mpl

mpl.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
SERIES = ["#3d4f63", "#b87f00", "#6b8f71", "#9a6b9a"]
HIGHLIGHT = "#b87f00"
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

rows = list(csv.DictReader(open(ROOT / "ml/results/experiments.csv")))
champion = json.load(open(ROOT / "web/data/experiments.json"))["champion"]
runs = [r["run"] for r in rows]
values = [float(r["map50"]) for r in rows]

fig, ax = plt.subplots(figsize=(8, 4))
bars = ax.bar(runs, values, color=[HIGHLIGHT if r == champion else SERIES[0] for r in runs], width=0.62)
for bar, v in zip(bars, values):
    ax.annotate(f"{v:.2f}", (bar.get_x() + bar.get_width() / 2, v), xytext=(0, 3), textcoords="offset points",
                ha="center", fontsize=9, color="#4f5156")
ax.set_ylim(0, 1)
ax.set_ylabel("Test mAP50")
ax.set_title(f"{champion} is the selected run (chosen on validation, not on this test score)")
fig.text(0.01, -0.04, "Source: ml/results/experiments.csv; champion from web/data/experiments.json. Bars start at zero.",
         fontsize=8, color="#66686d")
fig.savefig(Path(__file__).with_name("chart-style-sample.png"))
print("wrote", Path(__file__).with_name("chart-style-sample.png"))
