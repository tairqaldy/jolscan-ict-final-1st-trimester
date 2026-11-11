"""Which training restrooms does the pipeline fail on most? (task C-25)

Runs the champion (`sift_combo_hungarian`) on the same 200 training episodes of 30 restrooms as
pipeline.py and records, per query, whether step 1 found the crop's own original and whether the final
answer was the partner. Aggregated per restroom: how often it appeared, how often it failed, and in how
many of those failures step 1 was already wrong.

Writes  ml/results/restroom/hard_restrooms.json   (all 82 restrooms, hardest first)
        ml/results/restroom/figs/hard_restrooms.png (the 6 hardest: crop and original, male and female)

Usage, from the repository root:
    python ml/restroom/hard_restrooms.py
"""

from __future__ import annotations

import json
import sys
from collections import defaultdict
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
import common as C  # noqa: E402
import layers_report as R  # noqa: E402  (chart style)
import pipeline as P  # noqa: E402

import matplotlib.pyplot as plt  # noqa: E402
from PIL import Image  # noqa: E402

OUT = C.RESULTS / "hard_restrooms.json"
FIG = C.RESULTS / "figs" / "hard_restrooms.png"
N_SHOWN = 6

# Causes written after looking at the six hardest restrooms (step 4 of the task), by restroom id.
CAUSES: dict[int, str] = {
    60: "label error in the data: the male crop reads XY but the male-folder original reads XX; the two originals sit in "
        "each other's folders, so step 1 finds the crop's true original and the label calls it wrong",
    20: "data mismatch: the crops (standing figures, legs crossed) were not cut from these originals (jumping 'exit' "
        "figures), so step 1 cannot find an own original",
    1: "the two doors share no colour (black against magenta), so the 30 % histogram pulls the partner towards other "
       "black or pink signs",
    7: "the two doors are in different styles (a black line figure against a pink box with 'WOMEN'), so neither colour "
       "nor CLIP sees them as one set",
    30: "different colours for the two doors (teal against pink) and different animal heads: step 2 has little to go on",
    6: "the two originals are near copies (the same figure; only the pigtails and the arrow differ), so the pixel check "
       "sometimes picks the other door as the crop's own original",
}


def main() -> None:
    stored = json.loads(P.OUT.read_text())
    model, preprocess, _ = C.load_clip("ViT-B-32")
    pool = P.train_pool((model, preprocess))
    spec = P.approaches(stored["histogram_weight"])[stored["champion"]]

    stats = defaultdict(lambda: {"appearances": 0, "failures": 0, "step1_wrong_in_failures": 0})
    for q, gal, own_true, partner_true in P.episodes(pool, P.EPISODES, P.EPISODE_SIZE):
        s = pool.scores.sub(q, gal)
        own, pred = P.predict(s, spec)
        for i, qi in enumerate(q):
            room = int(pool.crop_room[qi])
            st = stats[room]
            st["appearances"] += 1
            if pred[i] != partner_true[i]:
                st["failures"] += 1
                st["step1_wrong_in_failures"] += int(own[i] != own_true[i])
    rows = []
    for room, st in stats.items():
        f = st["failures"]
        rows.append({"restroom": room, **st, "failure_rate": round(f / st["appearances"], 4),
                     "failing_step": "none" if f == 0 else ("step 1" if st["step1_wrong_in_failures"] * 2 >= f else "step 2"),
                     "cause": CAUSES.get(room)})
    rows.sort(key=lambda r: (-r["failure_rate"], r["restroom"]))
    OUT.write_text(json.dumps({
        "method": stored["champion"], "episodes": P.EPISODES, "episode_size": P.EPISODE_SIZE,
        "restrooms": len(rows), "never_failed": sum(r["failures"] == 0 for r in rows), "rows": rows,
    }, indent=2) + "\n")

    train = {(t.restroom, t.kind, t.gender): t.path for t in C.load_train()}
    hard = rows[:N_SHOWN]
    fig, axes = plt.subplots(len(hard), 4, figsize=(8.2, 2.05 * len(hard) + 0.7))
    heads = ["crop, male", "crop, female", "original, male", "original, female"]
    for r, row in enumerate(hard):
        for c, (kind, g) in enumerate((("crop", 0), ("crop", 1), ("orig", 0), ("orig", 1))):
            ax = axes[r, c]
            im = Image.open(train[(row["restroom"], kind, g)]).convert("RGB")
            im.thumbnail((300, 300))
            ax.imshow(im)
            ax.set_xticks([]), ax.set_yticks([])
            ax.grid(False)
            for sp in ax.spines.values():
                sp.set_visible(False)
            if r == 0:
                ax.set_title(heads[c], fontsize=9.5, color=R.INK2)
        axes[r, 0].set_ylabel(f"restroom {row['restroom']}\nfails {row['failure_rate']:.0%}\n({row['failing_step']})",
                              fontsize=9, rotation=0, ha="right", va="center", labelpad=8, color=R.INK)
    fig.suptitle(f"The {N_SHOWN} training restrooms the pipeline fails on most (200 episodes)", x=0.01, ha="left",
                 fontsize=11.5, fontweight="bold")
    fig.text(0.01, 0.005, "Images: IOAI 2025 Restroom Icon Matching, CC-BY-4.0", fontsize=8, color=R.INK2)
    fig.tight_layout(rect=(0, 0.02, 1, 0.97))
    FIG.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(FIG, dpi=170)
    print(f"{sum(r['failures'] == 0 for r in rows)} of {len(rows)} restrooms never failed")
    for row in rows[:10]:
        print(row)


if __name__ == "__main__":
    main()
