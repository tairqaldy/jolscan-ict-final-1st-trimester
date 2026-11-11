"""Failure cases for the slides: where the IOAI zero-shot CLIP baseline goes wrong on test.

For each failure the figure shows four images in a row:
    the query (a crop), the original it was cut from (found by step 1, SIFT with a pixel check),
    the partner the baseline picked (wrong), and the correct partner (the IOAI answer, which the
    final two-step pipeline also picks).

The failures are the first three test queries the baseline gets wrong, by query number, so they
are not hand-picked; the only ones skipped are listed in NOT_SHOWN with the reason. Everything about both methods was fixed before the test answers were read
(see pipeline.py); this script only looks at stored predictions.

Reads   ml/results/restroom/pipeline.json, the IOAI test set and answer_b.npy
Writes  ml/results/restroom/figs/failures.png
        ml/results/restroom/failures.json   (all baseline failures on test, for the write-up)

Usage, from the repository root:
    python ml/restroom/failures.py
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402
import numpy as np  # noqa: E402
from PIL import Image  # noqa: E402

sys.path.insert(0, str(Path(__file__).resolve().parent))
import classic  # noqa: E402
import common as C  # noqa: E402

RESULTS = Path("ml/results/restroom")
BASELINE, CHAMPION = "ioai_baseline_clip", "sift_combo_hungarian"
N_SHOWN = 3
# Failures left off the figure (they stay in failures.json), with the reason.
NOT_SHOWN = {14: "the sign has offensive words on it, not suitable for the slides"}

SURFACE, INK, INK2 = "#fcfcfb", "#0b0b0b", "#52514e"
GOOD, CRITICAL = "#0ca30c", "#d03b3b"  # status colours, always paired with a mark and a label


def thumb(path: Path, side: int = 320) -> Image.Image:
    """The image on the figure surface, fitted into a square without distortion."""
    img = Image.open(path).convert("RGBA")
    img.thumbnail((side, side))
    canvas = Image.new("RGBA", (side, side), SURFACE)
    canvas.alpha_composite(img, ((side - img.width) // 2, (side - img.height) // 2))
    return canvas.convert("RGB")


def main() -> None:
    preds = json.loads((RESULTS / "pipeline.json").read_text())["predictions"]["test"]
    base, champ = np.array(preds[BASELINE]), np.array(preds[CHAMPION])
    truth = C.load_answers("test")
    query, gallery = C.load_split("test")

    wrong = [i for i in range(len(truth)) if base[i] != truth[i]]
    _, ncc = classic.sift_matrix(query, gallery)
    own = ncc.argmax(axis=1) + 1  # 1-based gallery numbers, like the predictions

    cases = [{"query": i + 1, "own_original": int(own[i]), "baseline_pick": int(base[i]),
              "answer": int(truth[i]), "pipeline_pick": int(champ[i]),
              "baseline_picked_own_original": bool(base[i] == own[i])} for i in wrong]
    shown = [c for c in cases if c["query"] not in NOT_SHOWN][:N_SHOWN]
    out = {"baseline": BASELINE, "pipeline": CHAMPION, "split": "test",
           "baseline_correct": f"{len(truth) - len(wrong)}/{len(truth)}",
           "pipeline_correct": f"{int((champ == truth).sum())}/{len(truth)}",
           "shown": [c["query"] for c in shown],
           "not_shown": {str(q): why for q, why in NOT_SHOWN.items()}, "failures": cases}
    (RESULTS / "failures.json").write_text(json.dumps(out, indent=2) + "\n")

    heads = ["Query (a crop)", "Its own original\n(step 1, SIFT)", "Zero-shot CLIP picked",
             "Correct partner\n(our pipeline's pick)"]
    # Square image cells: 4 across a 10-inch figure, with room for the column heads and labels.
    width, wspace, hspace = 10.0, 0.08, 0.3
    cell = 0.98 * width / (4 + 3 * wspace)
    top_in, bottom_in = 1.15, 0.35
    height = top_in + bottom_in + N_SHOWN * cell + (N_SHOWN - 1) * hspace * cell
    fig, axes = plt.subplots(N_SHOWN, 4, figsize=(width, height), squeeze=False)
    fig.subplots_adjust(left=0.01, right=0.99, top=1 - top_in / height, bottom=bottom_in / height,
                        wspace=wspace, hspace=hspace)
    fig.patch.set_facecolor(SURFACE)
    for r, c in enumerate(shown):
        files = [query[c["query"] - 1], gallery[c["own_original"] - 1],
                 gallery[c["baseline_pick"] - 1], gallery[c["answer"] - 1]]
        for k, (ax, path) in enumerate(zip(axes[r], files)):
            ax.imshow(thumb(path))
            ax.set_xticks([]), ax.set_yticks([])
            frame = {2: CRITICAL, 3: GOOD}.get(k)
            for s in ax.spines.values():
                s.set_visible(frame is not None)
                if frame:
                    s.set_color(frame), s.set_linewidth(3)
            if r == 0:
                ax.set_title(heads[k], fontsize=10.5, fontweight="bold", color=INK, pad=8)
            mark = {2: "✗ wrong", 3: "✓ right"}.get(k)
            label = f"query {c['query']}" if k == 0 else f"gallery {Path(path).stem}"
            ax.set_xlabel(f"{label}   {mark}" if mark else label, fontsize=9, color=INK2, labelpad=4)
    fig.suptitle(f"Where the IOAI zero-shot CLIP baseline fails on test: {len(wrong)} of {len(truth)} queries "
                 f"({N_SHOWN} shown).\nThe two-step pipeline gets all {len(truth)} right.",
                 fontsize=11.5, color=INK, x=0.01, ha="left", y=1 - 0.12 / height, va="top")
    (RESULTS / "figs").mkdir(parents=True, exist_ok=True)
    fig.savefig(RESULTS / "figs" / "failures.png", dpi=200)
    print(json.dumps({k: v for k, v in out.items() if k != "failures"}))
    for c in cases:
        print(c)


if __name__ == "__main__":
    main()
