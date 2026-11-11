"""Slide figures for the R runs (task C-6, issue #17).

Writes, into ml/results/restroom/figs/:
    runs_matching.png   validation and test matching accuracy per real run, plus the two-step pipeline,
                        with the IOAI committee's published 0.77 and 0.90 as reference lines
    gender_heads.png    gender accuracy (grouped 5-fold CV): zero-shot prompts against trained
                        classifiers on frozen embeddings
    failures_r3.png     R3's test misses: the query, R3's pick (wrong) and the correct answer

Every value is read from ml/results/restroom/runs/R*.json and pipeline.json; nothing is typed in.

Usage, from the repository root:
    python ml/restroom/plots.py
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
import common as C  # noqa: E402
import layers_report as R  # noqa: E402  (importing it applies the chart style)
from failures import CRITICAL, GOOD, NOT_SHOWN, thumb  # noqa: E402

import matplotlib.pyplot as plt  # noqa: E402

RUNS = Path("ml/results/restroom/runs")
FIGS = Path("ml/results/restroom/figs")
VAL_C, TEST_C = R.COLOR["clip"], R.COLOR["resnet"]  # the palette's first two categorical slots
CREDIT = "Images: IOAI 2025 Restroom Icon Matching, CC-BY-4.0"


def load_runs() -> dict[str, dict]:
    out = {}
    for p in sorted(RUNS.glob("R*.json")):
        if "-" in p.stem:  # smoke files
            continue
        r = json.loads(p.read_text())
        if r.get("isReal") and not r.get("smoke"):
            out[r["run"]] = r
    return out


def runs_matching(runs: dict[str, dict]) -> None:
    names = sorted(runs, key=lambda s: int(s[1:]))
    labels = {"R0": "R0\nzero-shot\nB/16", "R1": "R1\nzero-shot\nB/32", "R2": "R2\n1 block", "R3": "R3\n3 blocks",
              "R4": "R4\n6 blocks", "R6": "R6\ngender\nfilter"}
    val = [runs[n]["metrics"]["val_match_top1"] for n in names]
    test = [runs[n]["metrics"]["test_match_top1"] for n in names]
    pipe = json.loads(Path("ml/results/restroom/pipeline.json").read_text())
    names.append("pipeline")
    labels["pipeline"] = "Two-step\npipeline\n(no training)"
    val.append(pipe["val"][pipe["champion"]])
    test.append(pipe["test"][pipe["champion"]])

    x = np.arange(len(names))
    w = 0.38
    fig, ax = plt.subplots(figsize=(10, 4.8))
    ax.bar(x - w / 2 - 0.01, val, w, color=VAL_C, label="Validation (10 queries)")
    ax.bar(x + w / 2 + 0.01, test, w, color=TEST_C, label="Test (30 queries)")
    box = dict(facecolor=R.SURFACE, edgecolor="none", pad=0.6)
    for xi, v, t in zip(x, val, test):
        ax.text(xi - w / 2 - 0.01, v + 0.015, f"{v:.2f}", ha="center", fontsize=8.5, color=R.INK2, bbox=box)
        ax.text(xi + w / 2 + 0.01, t + 0.015, f"{t:.2f}", ha="center", fontsize=8.5, color=R.INK2, bbox=box)
    for y, text in ((0.77, "IOAI baseline\n(their number) 0.77"), (0.90, "IOAI best\n(their number) 0.90")):
        ax.axhline(y, color=R.INK2, linestyle="--", linewidth=1.2, zorder=0)
        ax.text(len(names) - 0.4, y, text, ha="left", va="center", fontsize=8.5, color=R.INK2, clip_on=False)
    ax.set_xlim(-0.6, len(names) - 0.4)
    ax.set_xticks(x, [labels[n] for n in names], fontsize=9)
    ax.set_ylim(0, 1.12)
    ax.set_yticks(np.arange(0, 1.01, 0.2))
    ax.set_ylabel("Matching accuracy (top-1)")
    ax.set_title("Restroom matching: our runs against IOAI's published numbers", loc="left")
    ax.grid(axis="x", visible=False)
    ax.legend(loc="upper left", frameon=False, fontsize=9, ncols=2)
    fig.tight_layout()
    fig.savefig(FIGS / "runs_matching.png", dpi=200, bbox_inches="tight", pad_inches=0.15)
    plt.close(fig)


def gender_heads(runs: dict[str, dict]) -> None:
    g0, g1, g6 = runs["R0"]["gender"], runs["R1"]["gender"], runs["R6"]["gender"]
    rows = [  # (label, accuracy, zero-shot?)
        ("ViT-B/16, zero-shot prompts", g0["zero_shot_prompts"]["accuracy"], True),
        ("ViT-B/16, logistic regression", g0["probe_lr"]["accuracy"], False),
        ("ViT-B/32, zero-shot prompts", g1["zero_shot_prompts"]["accuracy"], True),
        ("ViT-B/32, logistic regression", g1["probe_lr"]["accuracy"], False),
        ("ViT-B/32, linear SVM", g6["linear_svm"]["accuracy"], False),
        ("ViT-B/32, 5 nearest neighbours", g6["knn_5_cosine"]["accuracy"], False),
    ][::-1]
    fig, ax = plt.subplots(figsize=(8.5, 3.9))
    y = np.arange(len(rows))
    colours = [VAL_C if zs else TEST_C for _, _, zs in rows]
    ax.barh(y, [a for _, a, _ in rows], height=0.62, color=colours)
    for yi, (_, a, _) in zip(y, rows):
        ax.text(a + 0.01, yi, f"{a:.3f}", va="center", fontsize=9, color=R.INK2)
    ax.axvline(0.5, color=R.INK2, linestyle=":", linewidth=1.3)
    ax.set_yticks(y, [lab for lab, _, _ in rows], fontsize=9.5)
    ax.set_xlim(0, 1)
    ax.set_xticks([0, 0.2, 0.4, 0.5, 0.6, 0.8, 1.0], ["0", "0.2", "0.4", "0.5\nchance", "0.6", "0.8", "1.0"])
    ax.set_xlabel("Gender accuracy, 5-fold cross-validation grouped by restroom")
    ax.set_title("Gender from one sign: classifiers do not beat the prompts", loc="left")
    ax.grid(axis="y", visible=False)
    handles = [plt.Rectangle((0, 0), 1, 1, color=VAL_C), plt.Rectangle((0, 0), 1, 1, color=TEST_C)]
    ax.legend(handles, ["Zero-shot prompts (no training)", "Classifier trained on frozen embeddings"],
              loc="upper center", bbox_to_anchor=(0.4, -0.3), ncols=2, frameon=False, fontsize=8.5)
    fig.tight_layout()
    fig.savefig(FIGS / "gender_heads.png", dpi=200, bbox_inches="tight", pad_inches=0.15)
    plt.close(fig)


def failures_r3(runs: dict[str, dict]) -> None:
    pred = np.array(runs["R3"]["predictions"]["test"])
    truth = C.load_answers("test")
    query, gallery = C.load_split("test")
    misses = [i + 1 for i in range(len(truth)) if pred[i] != truth[i]]
    shown = [q for q in misses if q not in NOT_SHOWN]
    skipped = [q for q in misses if q in NOT_SHOWN]

    width, wspace, hspace = 7.8, 0.08, 0.32
    cell = 0.98 * width / (3 + 2 * wspace)
    top_in, bottom_in = 0.85, 0.75
    height = top_in + bottom_in + len(shown) * cell + (len(shown) - 1) * hspace * cell
    fig, axes = plt.subplots(len(shown), 3, figsize=(width, height), squeeze=False)
    fig.subplots_adjust(left=0.01, right=0.99, top=1 - top_in / height, bottom=bottom_in / height,
                        wspace=wspace, hspace=hspace)
    heads = ["Query (a crop)", "R3 picked", "Correct answer"]
    for r, q in enumerate(shown):
        files = [query[q - 1], gallery[pred[q - 1] - 1], gallery[truth[q - 1] - 1]]
        for k, (ax, path) in enumerate(zip(axes[r], files)):
            ax.imshow(thumb(path))
            ax.set_xticks([]), ax.set_yticks([])
            ax.grid(False)
            frame = {1: CRITICAL, 2: GOOD}.get(k)
            for s in ax.spines.values():
                s.set_visible(frame is not None)
                if frame:
                    s.set_color(frame), s.set_linewidth(3)
            if r == 0:
                ax.set_title(heads[k], fontsize=10.5, fontweight="bold", color=R.INK, pad=8)
            mark = {1: "✗ wrong", 2: "✓ right"}.get(k)
            label = f"query {q}" if k == 0 else f"gallery {Path(path).stem}"
            ax.set_xlabel(f"{label}   {mark}" if mark else label, fontsize=9, color=R.INK2, labelpad=4)
    fig.suptitle(f"R3 (3 blocks fine-tuned) misses {len(misses)} of {len(truth)} test queries",
                 fontsize=11.5, color=R.INK, x=0.01, ha="left", y=1 - 0.12 / height, va="top")
    note = CREDIT
    if skipped:
        note = (f"Not shown: query {', '.join(map(str, skipped))} ({NOT_SHOWN[skipped[0]]}).\n" + CREDIT)
    fig.text(0.01, 0.12 / height, note, fontsize=8.5, color=R.INK2, ha="left", va="bottom")
    fig.savefig(FIGS / "failures_r3.png", dpi=200)
    plt.close(fig)


def main() -> None:
    FIGS.mkdir(parents=True, exist_ok=True)
    runs = load_runs()
    runs_matching(runs)
    gender_heads(runs)
    failures_r3(runs)
    print("Wrote", ", ".join(str(FIGS / f) for f in ("runs_matching.png", "gender_heads.png", "failures_r3.png")))


if __name__ == "__main__":
    main()
