"""Table and plots of the layer experiment (layers.py) and the approach ladder (pipeline.py).

Reads   ml/results/restroom/layers/*.json   (one file per backbone, N and seed)
        ml/results/restroom/pipeline.json
Writes  ml/results/restroom/layers.csv      mean and spread over seeds, one row per backbone and N
        ml/results/restroom/figs/*.png      for the slides

Usage, from the repository root:
    python ml/restroom/layers_report.py
    python ml/restroom/layers_report.py --dir ml/results/restroom/layers-smoke   # smoke files
"""

from __future__ import annotations

import argparse
import csv
import json
from collections import defaultdict
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402
import numpy as np  # noqa: E402

RESULTS = Path("ml/results/restroom")
FIGS = RESULTS / "figs"

# Reference palette (validated: lightness band, chroma, CVD and normal-vision separation, contrast)
SURFACE, INK, INK2, GRID = "#fcfcfb", "#0b0b0b", "#52514e", "#e4e3de"
COLOR = {"clip": "#2a78d6", "resnet": "#eb6834"}
LABEL = {"clip": "CLIP ViT-B/32", "resnet": "ResNet50"}
UNIT = {"clip": "transformer blocks trained (of 12)", "resnet": "stages trained (of 5)"}

plt.rcParams.update({
    "figure.facecolor": SURFACE, "axes.facecolor": SURFACE, "savefig.facecolor": SURFACE,
    "axes.edgecolor": GRID, "axes.labelcolor": INK2, "xtick.color": INK2, "ytick.color": INK2,
    "text.color": INK, "font.size": 11, "axes.titlesize": 12, "axes.titleweight": "bold",
    "axes.spines.top": False, "axes.spines.right": False, "axes.grid": True, "grid.color": GRID,
    "grid.linewidth": 0.8, "axes.axisbelow": True, "lines.linewidth": 2, "lines.markersize": 7,
})


def load(dirpath: Path) -> dict:
    """{(backbone, n): [result, ...]} over seeds."""
    groups = defaultdict(list)
    for f in sorted(dirpath.glob("*.json")):
        r = json.loads(f.read_text())
        groups[(r["backbone"], r["n_trained"])].append(r)
    return dict(sorted(groups.items()))


def agg(rs: list, key: str) -> tuple[float, float]:
    v = np.array([r["metrics"][key] for r in rs], dtype=float)
    return float(v.mean()), float(v.std())


def table(groups: dict) -> list[dict]:
    total = {b: max(r[0]["trainable_params"] for (bb, _), r in groups.items() if bb == b) for b in {b for b, _ in groups}}
    rows = []
    for (b, n), rs in groups.items():
        row = {"backbone": b, "n_trained": n, "unit": rs[0]["unit"], "depth": rs[0]["depth"], "seeds": len(rs),
               "trainable_params": rs[0]["trainable_params"],
               "pct_params_trained": round(100 * rs[0]["trainable_params"] / total[b], 1) if total[b] else 0.0}
        for key in ("pair_top1_heldout_vs_all164", "pair_mrr_heldout_vs_all164", "pair_top1_heldout", "pair_top1_train",
                    "gender_acc_heldout", "pipeline_top1_heldout_emb_hist"):
            m, s = agg(rs, key)
            row[key], row[key + "_std"] = round(m, 4), round(s, 4)
        row["overfit_gap"] = round(row["pair_top1_train"] - row["pair_top1_heldout"], 4)
        row["train_seconds_per_fold"] = round(float(np.mean([f["train_seconds"] for r in rs for f in r["folds"]])), 1)
        rows.append(row)
    # best N per backbone on the held-out metric; a tie (within 0.005) goes to fewer trained parameters
    for b in {r["backbone"] for r in rows}:
        rb = [r for r in rows if r["backbone"] == b]
        top = max(r["pair_top1_heldout_vs_all164"] for r in rb)
        best = min((r for r in rb if r["pair_top1_heldout_vs_all164"] >= top - 0.005), key=lambda r: r["trainable_params"])
        for r in rb:
            r["best"] = r is best
    return rows


def fmt_params(p: int) -> str:
    return "0" if p == 0 else (f"{p / 1e6:.1f}M" if p >= 1e5 else f"{p / 1e3:.0f}k")


def curve_panels(rows: list, key: str, title: str, ylabel: str, out: Path, train_key: str | None = None,
                 ylim=(0.5, 1.0), chance: float | None = None) -> None:
    backbones = [b for b in ("clip", "resnet") if any(r["backbone"] == b for r in rows)]
    fig, axes = plt.subplots(1, len(backbones), figsize=(5.6 * len(backbones), 4.2), squeeze=False)
    for ax, b in zip(axes[0], backbones):
        rb = sorted((r for r in rows if r["backbone"] == b), key=lambda r: r["n_trained"])
        x = np.array([r["n_trained"] for r in rb])
        y = np.array([r[key] for r in rb])
        s = np.array([r[key + "_std"] for r in rb])
        c = COLOR[b]
        ax.fill_between(x, y - s, y + s, color=c, alpha=0.15, linewidth=0)
        ax.plot(x, y, "-o", color=c, markeredgecolor=SURFACE, markeredgewidth=2)
        ax.annotate("held-out restrooms", (x[-1], y[-1]), xytext=(6, -2), textcoords="offset points", color=INK2, fontsize=10, va="center")
        if train_key:
            yt = np.array([r[train_key] for r in rb])
            ax.plot(x, yt, "--", color=c, alpha=0.6)
            ax.annotate("training restrooms", (x[-1], yt[-1]), xytext=(6, 2), textcoords="offset points", color=INK2, fontsize=10, va="center")
        if chance is not None:
            ax.axhline(chance, color=INK2, linewidth=1, linestyle=":")
            ax.annotate("chance", (x[0], chance), xytext=(2, 4), textcoords="offset points", color=INK2, fontsize=9)
        best = next((r for r in rb if r.get("best")), None)
        if best and key == "pair_top1_heldout_vs_all164":
            # label in the empty lower part of the panel, with an arrow, so it never sits on a line
            ax.annotate(f"best: N={best['n_trained']}, {best[key]:.3f}", xy=(best["n_trained"], best[key]),
                        xytext=(best["n_trained"] + 0.35 * (x.max() - x.min()), ylim[0] + 0.3 * (ylim[1] - ylim[0])),
                        ha="center", fontsize=10, color=INK,
                        arrowprops=dict(arrowstyle="-", color=INK2, linewidth=1, shrinkA=2, shrinkB=5))
        if b == "clip":   # every block has the same size; tick labels with parameter counts would collide
            ax.set_xticks(x, [str(n) for n in x])
            ax.set_xlabel(f"{UNIT[b]}, {fmt_params(rb[1]['trainable_params'] if len(rb) > 1 else 0)} parameters each")
        else:
            ax.set_xticks(x, [f"{n}\n{fmt_params(r['trainable_params'])}" for n, r in zip(x, rb)])
            ax.set_xlabel(f"{UNIT[b]}\ntrainable parameters")
        ax.set_ylim(*ylim)
        ax.set_xlim(x.min() - 0.4, x.max() + (2.6 if b == "clip" else 1.3))
        ax.set_title(LABEL[b], loc="left")
        ax.set_ylabel(ylabel)
    fig.suptitle(title, x=0.01, ha="left", fontsize=13, fontweight="bold")
    fig.text(0.01, 0.005, "Mean over seeds, band = ±1 std. 5-fold CV grouped by restroom (82 IOAI training restrooms).",
             fontsize=9, color=INK2)
    fig.tight_layout(rect=(0, 0.03, 1, 0.95))
    fig.savefig(out, dpi=200)
    plt.close(fig)


def params_chart(rows: list, out: Path) -> None:
    fig, ax = plt.subplots(figsize=(7.2, 4.4))
    ends = {}
    for b in ("clip", "resnet"):
        rb = sorted((r for r in rows if r["backbone"] == b), key=lambda r: r["n_trained"])
        if not rb:
            continue
        x = [r["pct_params_trained"] for r in rb]
        y = [r["pair_top1_heldout_vs_all164"] for r in rb]
        ax.plot(x, y, "-o", color=COLOR[b], markeredgecolor=SURFACE, markeredgewidth=2, label=LABEL[b])
        ends[b] = y[-1]
    if len(ends) == 2 and abs(ends["clip"] - ends["resnet"]) < 0.03:   # push close end labels apart
        mid = (ends["clip"] + ends["resnet"]) / 2
        hi, lo = ("clip", "resnet") if ends["clip"] >= ends["resnet"] else ("resnet", "clip")
        ends[hi], ends[lo] = mid + 0.015, mid - 0.015
    for b, ye in ends.items():
        ax.annotate(LABEL[b], (100, ye), xytext=(8, 0), textcoords="offset points", color=INK2, fontsize=10, va="center")
    ax.set_xlabel("share of the image encoder's parameters that are trained, %")
    ax.set_ylabel("partner found first, held-out restrooms")
    ax.set_xlim(-3, 118)
    ax.set_ylim(0.5, 1.0)
    ax.legend(frameon=False, loc="lower right")
    ax.set_title("Training more of the network: transformer against CNN", loc="left")
    fig.text(0.01, 0.005, "Held-out originals ranked against all 164 training originals. Mean over seeds.", fontsize=9, color=INK2)
    fig.tight_layout(rect=(0, 0.03, 1, 1))
    fig.savefig(out, dpi=200)
    plt.close(fig)


def approach_ladder(out: Path) -> None:
    p = RESULTS / "pipeline.json"
    if not p.exists():
        return
    d = json.loads(p.read_text())
    names = {
        "ioai_baseline_clip": "IOAI baseline (CLIP, 2nd most similar)",
        "clip_clip_greedy": "IOAI reference matching, zero-shot CLIP",
        "singapore_hist_top2_sift": "Colour histogram top 2 + SIFT",
        "sift_hist_greedy": "SIFT + colour histogram, greedy",
        "siftinl_clip_greedy": "SIFT inliers + CLIP, greedy",
        "sift_clip_greedy": "SIFT pixel check + CLIP, greedy",
        "sift_hist_hungarian": "SIFT + colour histogram, global",
        "sift_combo_greedy": "SIFT + histogram & CLIP, greedy",
        "sift_clip_hungarian": "SIFT + CLIP, global",
        "sift_combo_hungarian": "SIFT + histogram & CLIP, global",
    }
    rows = sorted(((k, d["train_episodes"][k]["top1"]["mean"], d["train_episodes"][k]["top1"]["std"], d["test"][k])
                   for k in names if k in d["train_episodes"]), key=lambda t: t[1])
    fig, ax = plt.subplots(figsize=(10, 4.8))
    y = np.arange(len(rows))
    champion = d.get("champion")
    for i, (k, m, s, t) in enumerate(rows):
        ax.barh(i, m, height=0.62, color=COLOR["clip"] if k == champion else "#9ec5f4", edgecolor=SURFACE, linewidth=2)
        ax.errorbar(m, i, xerr=s, color=INK2, capsize=3, linewidth=1)
        ax.text(m + s + 0.01, i, f"{m:.3f}   test {t:.3f}", va="center", fontsize=9, color=INK)
    ax.set_yticks(y, [names[k] for k, *_ in rows])
    ax.set_xlim(0, 1.32)
    ax.set_xticks([0, 0.25, 0.5, 0.75, 1.0])
    ax.grid(axis="y", visible=False)
    ax.set_xlabel("top-1 accuracy, 200 episodes of 30 training restrooms (±1 std)")
    ax.set_title("From the IOAI baseline to the final pipeline (no training)", loc="left")
    fig.text(0.01, 0.005, "Dark bar: the champion, chosen on training episodes then validation. Test (30 queries) read once.",
             fontsize=9, color=INK2)
    fig.tight_layout(rect=(0, 0.03, 1, 1))
    fig.savefig(out, dpi=200)
    plt.close(fig)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dir", type=Path, default=RESULTS / "layers")
    args = ap.parse_args()
    smoke = "smoke" in args.dir.name
    figs = FIGS / "smoke" if smoke else FIGS
    figs.mkdir(parents=True, exist_ok=True)
    groups = load(args.dir)
    if not groups:
        raise SystemExit(f"no result files in {args.dir}")
    rows = table(groups)
    out_csv = (RESULTS / "layers-smoke.csv") if smoke else (RESULTS / "layers.csv")
    with out_csv.open("w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0]))
        w.writeheader()
        w.writerows(rows)
    curve_panels(rows, "pair_top1_heldout_vs_all164", "How many layers to train: finding the other door",
                 "partner found first", figs / "layers_pair.png", train_key="pair_top1_train")
    curve_panels(rows, "gender_acc_heldout", "What fine-tuning does to gender information",
                 "gender accuracy (probe)", figs / "layers_gender.png", ylim=(0.4, 1.0), chance=0.5)
    params_chart(rows, figs / "layers_params.png")
    approach_ladder(figs / "approaches.png")
    print(f"wrote {out_csv} and {len(list(figs.glob('*.png')))} figures in {figs}")
    for r in rows:
        print(f"  {r['backbone']:6s} N={r['n_trained']:2d} ({fmt_params(r['trainable_params']):>6s}): "
              f"held-out vs 164 {r['pair_top1_heldout_vs_all164']:.3f}±{r['pair_top1_heldout_vs_all164_std']:.3f}, "
              f"train {r['pair_top1_train']:.3f}, gender {r['gender_acc_heldout']:.3f}{'  <- best' if r.get('best') else ''}")


if __name__ == "__main__":
    main()
