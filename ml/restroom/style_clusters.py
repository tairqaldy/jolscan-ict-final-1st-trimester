"""Cluster the sign styles with k-means and see where zero-shot gender fails (task C-28).

The 164 training originals are embedded with zero-shot CLIP ViT-B/32 and clustered with k-means. The
rule for k is fixed before running: k from 2 to 8, KMeans(n_clusters=k, n_init=10, random_state=42);
take the k with the best cosine silhouette, or the smallest k within 0.01 of it. Per cluster: size,
share of male signs, and zero-shot gender accuracy (the API's prompts) with an exact 95 % interval.

Writes  ml/results/restroom/style_clusters.json
        ml/results/restroom/figs/style_clusters_pca.png       (PCA 2-D, wrongly gendered signs hollow)
        ml/results/restroom/figs/style_clusters_examples.png  (6 icons per cluster)

Usage, from the repository root:
    python ml/restroom/style_clusters.py
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np
from scipy import stats
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.metrics import silhouette_score

sys.path.insert(0, str(Path(__file__).resolve().parent))
import common as C  # noqa: E402
import layers_report as R  # noqa: E402  (chart style)

import matplotlib.pyplot as plt  # noqa: E402
from PIL import Image  # noqa: E402

OUT = C.RESULTS / "style_clusters.json"
FIG_PCA = C.RESULTS / "figs" / "style_clusters_pca.png"
FIG_EX = C.RESULTS / "figs" / "style_clusters_examples.png"
KS = range(2, 9)
PALETTE = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300", "#6250d6", "#7a7975"]


def interval(k: int, n: int) -> list[float]:
    c = stats.binomtest(int(k), int(n)).proportion_ci(confidence_level=0.95, method="exact")
    return [round(c.low, 4), round(c.high, 4)]


def main() -> None:
    origs = [t for t in C.load_train() if t.kind == "orig"]
    paths = [t.path for t in origs]
    truth = np.array([t.gender for t in origs])          # 0 male, 1 female
    model, preprocess, tok = C.load_clip("ViT-B-32")
    E = C.embed_paths_cached(model, preprocess, paths, "ViT-B-32-openai")
    pred = C.zero_shot_proba(E, C.text_class_embeddings(model, tok)).argmax(1)
    right = pred == truth

    sweep = {}
    labels_by_k = {}
    for k in KS:
        km = KMeans(n_clusters=k, n_init=10, random_state=42).fit(E)
        labels_by_k[k] = km.labels_
        sweep[k] = {"inertia": round(float(km.inertia_), 4),
                    "silhouette_cosine": round(float(silhouette_score(E, km.labels_, metric="cosine")), 4)}
    best_s = max(v["silhouette_cosine"] for v in sweep.values())
    k = min(kk for kk, v in sweep.items() if v["silhouette_cosine"] >= best_s - 0.01)
    lab = labels_by_k[k]

    clusters = []
    for c in range(k):
        m = lab == c
        n, ok = int(m.sum()), int(right[m].sum())
        clusters.append({"cluster": c, "size": n, "share_male": round(float(np.mean(truth[m] == 0)), 4),
                         "gender_accuracy": round(ok / n, 4), "correct": ok, "ci95": interval(ok, n)})
    overall = {"correct": int(right.sum()), "n": len(right), "accuracy": round(float(right.mean()), 4),
               "ci95": interval(right.sum(), len(right))}
    OUT.write_text(json.dumps({
        "data": "164 IOAI training originals, zero-shot CLIP ViT-B/32 embeddings and the API's gender prompts",
        "k_rule": "k = 2..8, KMeans(n_init=10, random_state=42); best cosine silhouette, or the smallest k within 0.01",
        "sweep": {str(kk): v for kk, v in sweep.items()}, "k": k, "overall": overall, "clusters": clusters,
    }, indent=2) + "\n")
    print("silhouette by k:", {kk: v["silhouette_cosine"] for kk, v in sweep.items()}, "-> k =", k)
    print("overall", overall)
    for row in clusters:
        print(row)

    xy = PCA(2, random_state=42).fit_transform(E)
    fig, ax = plt.subplots(figsize=(7.5, 5.2))
    for c in range(k):
        m = lab == c
        col = PALETTE[c % len(PALETTE)]
        ax.scatter(xy[m & right, 0], xy[m & right, 1], s=34, color=col, label=f"cluster {c} ({clusters[c]['gender_accuracy']:.0%} right)")
        ax.scatter(xy[m & ~right, 0], xy[m & ~right, 1], s=40, facecolors="none", edgecolors=col, linewidths=1.6)
    ax.scatter([], [], s=40, facecolors="none", edgecolors=R.INK2, label="hollow: gender read wrong")
    ax.set_xlabel("PCA 1"), ax.set_ylabel("PCA 2")
    ax.set_title(f"Sign styles: k-means, k = {k}, on CLIP embeddings of 164 training signs", loc="left")
    ax.legend(frameon=False, fontsize=8.5, loc="upper left", bbox_to_anchor=(1.01, 1))
    fig.tight_layout()
    FIG_PCA.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(FIG_PCA, dpi=200)
    plt.close(fig)

    per = 6
    fig, axes = plt.subplots(k, per, figsize=(per * 1.35 + 1.6, k * 1.45 + 0.5), squeeze=False)
    rng = np.random.default_rng(42)
    for c in range(k):
        idx = np.flatnonzero(lab == c)
        pick = rng.choice(idx, size=min(per, len(idx)), replace=False)
        for j in range(per):
            ax = axes[c, j]
            ax.set_xticks([]), ax.set_yticks([]); ax.grid(False)
            for sp in ax.spines.values():
                sp.set_visible(False)
            if j < len(pick):
                im = Image.open(paths[pick[j]]).convert("RGB"); im.thumbnail((160, 160))
                ax.imshow(im)
        axes[c, 0].set_ylabel(f"cluster {c}\nn = {clusters[c]['size']}\n{clusters[c]['gender_accuracy']:.0%} right",
                              rotation=0, ha="right", va="center", fontsize=8.5, labelpad=6, color=PALETTE[c % len(PALETTE)])
    fig.suptitle("Six icons per style cluster, with zero-shot gender accuracy", x=0.01, ha="left", fontsize=11, fontweight="bold")
    fig.text(0.01, 0.005, "IOAI 2025, CC-BY-4.0", fontsize=7.5, color=R.INK2)
    fig.tight_layout(rect=(0, 0.02, 1, 0.96))
    fig.savefig(FIG_EX, dpi=170)


if __name__ == "__main__":
    main()
