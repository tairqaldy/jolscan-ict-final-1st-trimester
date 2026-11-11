"""Step-by-step ablation of the restroom pipeline (task C-23). No compute: everything is read from
ml/results/restroom/pipeline.json.

    Step 1 alone   which scorer finds the crop's own original, on all 164 training crops
    Step 2 alone   which scorer finds the partner when it is given the true own original
                   (`step2_oracle`, 200 training episodes)
    End to end     every approach on training episodes, validation and test

Prints a Markdown table (pasted into docs/ML-EXPERIMENT-RESTROOM.md) and draws
ml/results/restroom/figs/ablation_steps.png.

Usage, from the repository root:
    python ml/restroom/ablation_table.py
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import layers_report as R  # noqa: E402  (importing it applies the chart style)

import matplotlib.pyplot as plt  # noqa: E402

PIPE = Path("ml/results/restroom/pipeline.json")
FIG = Path("ml/results/restroom/figs/ablation_steps.png")

STEP1 = {"sift_ncc": "SIFT + pixel check (chosen)", "sift_inliers": "SIFT inlier count",
         "hist": "colour histogram", "clip": "CLIP similarity"}
STEP2 = {"sift_combo": "30 % histogram + CLIP (chosen)", "sift_clip": "CLIP similarity", "sift_hist": "colour histogram"}


def pm(x: dict | None) -> str:
    return "–" if not x else f"{x['mean']:.3f} ± {x['std']:.3f}"


def table(p: dict) -> str:
    out = ["**Step 1 alone**: own original found among all 164 training originals, 164 crops", "",
           "| Scorer | Accuracy |", "|---|---|"]
    for k, label in STEP1.items():
        out.append(f"| {label} | {p['step1_full_train'][k]:.3f} |")
    out += ["", "**Step 2 alone**: partner found when given the true own original, 200 training episodes of 30 restrooms", "",
            "| Scorer | Greedy | Global assignment |", "|---|---|---|"]
    for k, label in STEP2.items():
        g = p["train_episodes"][f"{k}_greedy"]["step2_oracle"]
        h = p["train_episodes"][f"{k}_hungarian"]["step2_oracle"]
        out.append(f"| {label} | {pm(g)} | {pm(h)} |")
    out += ["", "**End to end**", "", "| Approach | Training episodes | Validation | Test |", "|---|---|---|---|"]
    for name, label in p["approaches"].items():
        mark = " **(champion)**" if name == p["champion"] else ""
        out.append(f"| `{name}`{mark}: {label} | {pm(p['train_episodes'][name]['top1'])} | {p['val'][name]:.2f} | {p['test'][name]:.3f} |")
    return "\n".join(out)


def figure(p: dict) -> None:
    fig, (a1, a2) = plt.subplots(1, 2, figsize=(10, 3.6), sharex=True)
    s1 = list(STEP1)
    v1 = [p["step1_full_train"][k] for k in s1]
    a1.barh(range(len(s1)), v1, color=[R.COLOR["clip"] if k == "sift_ncc" else R.GRID for k in s1], height=0.6)
    a1.set_yticks(range(len(s1)), [STEP1[k].replace(" (chosen)", "") for k in s1])
    a1.set_title("Step 1: find the crop's own original", loc="left")
    s2 = list(STEP2)
    v2 = [p["train_episodes"][f"{k}_hungarian"]["step2_oracle"]["mean"] for k in s2]
    a2.barh(range(len(s2)), v2, color=[R.COLOR["clip"] if k == "sift_combo" else R.GRID for k in s2], height=0.6)
    a2.set_yticks(range(len(s2)), [STEP2[k].replace(" (chosen)", "") for k in s2])
    a2.set_title("Step 2: find the partner", loc="left")
    for ax, vals in ((a1, v1), (a2, v2)):
        ax.invert_yaxis()
        ax.set_xlim(0, 1)
        ax.grid(axis="y", visible=False)
        ax.set_xlabel("Accuracy on the training restrooms")
        for y, v in enumerate(vals):
            ax.text(v - 0.01, y, f"{v:.3f}", ha="right", va="center", fontsize=9,
                    color="white" if v == max(vals) else R.INK)
    fig.tight_layout()
    FIG.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(FIG, dpi=200)
    plt.close(fig)


def main() -> None:
    p = json.loads(PIPE.read_text())
    print(table(p))
    figure(p)


if __name__ == "__main__":
    main()
