"""Signage threshold trade-off curves (task C-27). No compute: reads ml/results/restroom/pair_separation.json.

Panel A, S1 and S2: as the margin (gap in P(male) between the two doors) grows, fewer real pairs pass,
the ones that pass are read the right way round more often, and more same-gender pairs are flagged.
Panel B, S3: as the similarity threshold grows, more pairs from different restrooms are flagged and,
past a point, real pairs start to fail too.

Exact 95 % intervals are drawn for the real-pair rates at the chosen thresholds (n = 82 restrooms). The
same-gender and different-restroom rates get none: their thousands of pairs share restrooms, so they are
not independent samples.

Writes  ml/results/restroom/figs/signage_thresholds.png

Usage, from the repository root:
    python ml/restroom/signage_plots.py
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

from scipy import stats

sys.path.insert(0, str(Path(__file__).resolve().parent))
import layers_report as R  # noqa: E402  (importing it applies the chart style)

import matplotlib.pyplot as plt  # noqa: E402

SRC = Path("ml/results/restroom/pair_separation.json")
OUT = Path("ml/results/restroom/figs/signage_thresholds.png")
S1, S2, S3 = 0.20, 0.05, 0.88      # defaults in web/lib/signage/config.ts and docs/RULES.md part 2
BLUE, ORANGE, INK2 = R.COLOR["clip"], R.COLOR["resnet"], R.INK2
GREY = "#7a7975"


def ci(rate: float, n: int) -> tuple[float, float]:
    k = round(rate * n)
    c = stats.binomtest(k, n).proportion_ci(confidence_level=0.95, method="exact")
    return c.low, c.high


def at(sweep: list[dict], key: str, x: float, field: str) -> dict:
    return next(row for row in sweep if abs(row[key] - x) < 1e-9)


def main() -> None:
    d = json.loads(SRC.read_text())
    n = d["zero_shot"]["orig"]["restrooms"]
    sw = d["zero_shot"]["orig"]["pairwise"]["sweep"]
    s3 = d["similarity_S3"]["orig"]["sweep"]

    fig, (a, b) = plt.subplots(1, 2, figsize=(11, 5.4))
    m = [r["margin"] for r in sw]
    a.plot(m, [r["real_pairs_pass"] for r in sw], color=BLUE, marker="o", label="real pairs that pass")
    a.plot(m, [r["pairwise_accuracy_when_passed"] for r in sw], color=ORANGE, marker="o",
           label="read the right way round, of those that pass")
    a.plot(m, [r["same_gender_pairs_flagged"] for r in sw], color=GREY, marker="o", linestyle="--",
           label="same-gender pairs flagged")
    for x, name in ((S2, "S2"), (S1, "S1")):
        a.axvline(x, color=INK2, linestyle=":", linewidth=1.2)
        a.text(x + 0.005, 0.03, name, color=INK2, fontsize=9)
        row = at(sw, "margin", x, "")
        for key, col in (("real_pairs_pass", BLUE), ("pairwise_accuracy_when_passed", ORANGE)):
            if key == "pairwise_accuracy_when_passed":
                nn = round(row["real_pairs_pass"] * n)   # accuracy is measured on the pairs that pass
            else:
                nn = n
            lo, hi = ci(row[key], nn)
            a.errorbar([x], [row[key]], yerr=[[row[key] - lo], [hi - row[key]]], color=col, capsize=4, linewidth=1.6)
    a.set_xlabel("Margin: gap in P(male) between the two doors")
    a.set_ylabel("Share")
    a.set_ylim(0, 1.05)
    a.set_title("S1 and S2: margin between the doors", loc="left")
    a.legend(loc="upper center", bbox_to_anchor=(0.5, -0.2), frameon=False, fontsize=8.5)

    t = [r["threshold"] for r in s3]
    b.plot(t, [r["same_set_pass"] for r in s3], color=BLUE, marker="o", label="same-restroom pairs that pass")
    b.plot(t, [r["different_sets_flagged"] for r in s3], color=GREY, marker="o", linestyle="--",
           label="different-restroom pairs flagged")
    b.axvline(S3, color=INK2, linestyle=":", linewidth=1.2)
    b.text(S3 + 0.002, 0.03, "S3", color=INK2, fontsize=9)
    row = at(s3, "threshold", S3, "")
    lo, hi = ci(row["same_set_pass"], n)
    b.errorbar([S3], [row["same_set_pass"]], yerr=[[row["same_set_pass"] - lo], [hi - row["same_set_pass"]]],
               color=BLUE, capsize=4, linewidth=1.6)
    b.set_xlabel("Similarity threshold, (cos + 1) / 2")
    b.set_ylim(0, 1.05)
    b.set_title("S3: the two signs belong to one set", loc="left")
    b.legend(loc="upper center", bbox_to_anchor=(0.5, -0.2), frameon=False, fontsize=8.5)

    s1 = at(sw, "margin", S1, "")
    fig.suptitle(f"S1 at {S1:.2f}: every pair that passes is read the right way round, but "
                 f"{1 - s1['real_pairs_pass']:.0%} of real pairs go to review", x=0.01, ha="left", fontsize=12,
                 fontweight="bold", y=0.985)
    fig.text(0.01, 0.005, f"82 IOAI training restrooms, zero-shot CLIP ViT-B/32 (results/pair_separation.json).\n"
             "Error bars: exact 95 % intervals for real-pair rates; none for same-gender or different-restroom pairs, "
             "which share restrooms.", fontsize=8, color=INK2, ha="left", va="bottom")
    fig.tight_layout(rect=(0, 0.06, 1, 0.95))
    OUT.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(OUT, dpi=200)
    print(f"Wrote {OUT}. At S1: pass {s1['real_pairs_pass']}, accuracy {s1['pairwise_accuracy_when_passed']}; "
          f"at S3: same-set pass {row['same_set_pass']}, different flagged {row['different_sets_flagged']}")


if __name__ == "__main__":
    main()
