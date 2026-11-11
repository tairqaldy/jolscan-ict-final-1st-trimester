"""Deck plots for the pothole experiment (task M-13). Reads committed files only.

    python ml/plots.py

Writes, into ml/results/:
  fig_runs_map50_recall.png   test mAP50 and test recall at confidence 0.40 per run, champion marked
  fig_curves.png              train and validation box loss per epoch for E0, E2 and E5 (the ones that exist)

The PR curve and the confusion matrix at confidence 0.40 of the champion come from Ultralytics' own
test evaluation (saved when train.py evaluates the test split, so test is not read again) and are
copied in by hand; see ml/README.md.
Colours match the web app's chart tokens (web/app/tokens.css): --chart-1 for runs, --accent for the champion.
"""

from __future__ import annotations

import csv
import json
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt

RESULTS = Path("ml/results")
RUN_COLOUR = "#3d4f63"  # --chart-1
CHAMPION_COLOUR = "#b87f00"  # chart highlight (chart-style.md): the brand amber #f2a900 is 2.01:1 on white
CURVE_RUNS = ("E0", "E2", "E5")

plt.rcParams.update({"font.size": 13, "axes.spines.top": False, "axes.spines.right": False})


def runs_figure() -> None:
    rows = list(csv.DictReader((RESULTS / "experiments.csv").open()))
    champion = json.loads(Path("web/data/experiments.json").read_text())["champion"]
    ids = [r["run"] for r in rows]
    map50 = [float(r["map50"]) for r in rows]
    recall = [float(r["recallAtRulesConf"]) for r in rows]

    width = 0.38
    fig, ax = plt.subplots(figsize=(max(5, 1.3 * len(ids) + 2), 5.5))
    for i, run in enumerate(ids):
        colour = CHAMPION_COLOUR if run == champion else RUN_COLOUR
        ax.bar(i - width / 2, map50[i], width, color=colour)
        ax.bar(i + width / 2, recall[i], width, color=colour, alpha=0.5)
        ax.text(i - width / 2, map50[i] + 0.02, f"{map50[i]:.2f}", ha="center")
        ax.text(i + width / 2, recall[i] + 0.02, f"{recall[i]:.2f}", ha="center")
    ax.set_xticks(range(len(ids)), [f"{r}\n(champion)" if r == champion else r for r in ids])
    ax.set_ylim(0, 1)  # bars start at zero
    ax.set_ylabel("Score on the test split")
    from matplotlib.patches import Patch

    legend = [Patch(color=RUN_COLOUR, label="mAP50 (solid)"), Patch(color=RUN_COLOUR, alpha=0.5, label="Recall at confidence 0.40 (light)")]
    if champion in ids:
        legend.append(Patch(color=CHAMPION_COLOUR, label=f"Champion ({champion})"))
    ax.legend(handles=legend, frameon=False, loc="upper center", bbox_to_anchor=(0.5, -0.22), ncol=1)
    # Title states the takeaway and never contradicts the bars: name the best test run when it is not the champion.
    best = ids[max(range(len(ids)), key=lambda i: map50[i])]
    if len(ids) == 1:
        title = f"{ids[0]} is the only run so far"
    elif best == champion:
        title = f"{champion}, chosen on validation, also has the highest test mAP50"
    else:
        gap = map50[ids.index(best)] - map50[ids.index(champion)]
        title = f"On test, {champion} and {best} are {gap:.3f} apart; {champion} was chosen on validation"
    ax.set_title(title, loc="left")
    fig.text(0.01, 0.01, "Source: ml/results/experiments.csv, test split. Recall: Ultralytics' pass with boxes at confidence 0.40 or more.",
             fontsize=9, color="#555555")
    fig.tight_layout()
    fig.savefig(RESULTS / "fig_runs_map50_recall.png", dpi=200)
    plt.close(fig)


def curves_figure() -> None:
    present = [r for r in CURVE_RUNS if (RESULTS / "runs" / f"{r}-results.csv").exists()]
    if not present:
        return
    data = {}
    for run in present:
        rows = list(csv.DictReader((RESULTS / "runs" / f"{run}-results.csv").open()))
        rows = [{k.strip(): v for k, v in row.items()} for row in rows]
        data[run] = rows
    top = max(float(row[col]) for rows in data.values() for row in rows for col in ("train/box_loss", "val/box_loss"))

    fig, axes = plt.subplots(1, len(present), figsize=(5 * len(present), 4), sharey=True, squeeze=False)
    for ax, run in zip(axes[0], present):
        epochs = [int(row["epoch"]) for row in data[run]]
        ax.plot(epochs, [float(row["train/box_loss"]) for row in data[run]], color=RUN_COLOUR, label="train")
        ax.plot(epochs, [float(row["val/box_loss"]) for row in data[run]], color=CHAMPION_COLOUR, label="validation")
        ax.set_title(run, loc="left")
        ax.set_xlabel("Epoch")
        ax.set_ylim(0, top * 1.05)
    axes[0][0].set_ylabel("Box loss")
    axes[0][0].legend(frameon=False)
    fig.tight_layout()
    fig.savefig(RESULTS / "fig_curves.png", dpi=200)
    plt.close(fig)


if __name__ == "__main__":
    runs_figure()
    curves_figure()
    print("Wrote", ", ".join(str(p) for p in sorted(RESULTS.glob("fig_*.png"))))
