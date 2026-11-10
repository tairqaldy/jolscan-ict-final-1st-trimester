"""What does each layer of a frozen network know? No training: features are read out after every
block (CLIP ViT-B/32) or stage (ResNet50) and scored on the 82 training restrooms.

The layer experiment (layers.py) asks how many layers to TRAIN. This asks the question behind it:
where in a pretrained network is the information each step of the task needs?

Per depth, on all 82 training restrooms:
  crop_to_orig_top1   step 1: is a crop's own original its most similar of the 164 originals?
  pair_top1           step 2: is an original's partner its most similar of the other 163 originals?
  gender_acc_cv       logistic-regression probe for male/female, 5-fold CV grouped by restroom

Features: CLIP, the class token after block k, layer-normalised (the final projection only exists
after block 12, reported separately as "final"); ResNet50, global average pooling after each stage.

Usage, from the repository root:
    python ml/restroom/layer_probe.py      # writes ml/results/restroom/layer_probe.json and figs/layer_probe.png
"""

from __future__ import annotations

import json
import sys
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
import torch
import torch.nn.functional as F

sys.path.insert(0, str(Path(__file__).resolve().parent))
import common as C  # noqa: E402
import layers as L  # noqa: E402

OUT = C.RESULTS / "layer_probe.json"


@torch.no_grad()
def clip_layers(images: list) -> dict[str, np.ndarray]:
    model, preprocess, _ = C.load_clip("ViT-B-32")
    v = model.visual
    feats: dict[str, list] = {}
    for i in range(0, len(images), 32):
        x = torch.stack([preprocess(im) for im in images[i:i + 32]]).to(C.device())
        h = v._embeds(x)
        for k, blk in enumerate(v.transformer.resblocks, start=1):
            h = blk(h)
            cls = F.layer_norm(h[:, 0].float(), (h.shape[-1],))
            feats.setdefault(str(k), []).append(F.normalize(cls, dim=-1).cpu())
        feats.setdefault("final", []).append(F.normalize(model.encode_image(x).float(), dim=-1).cpu())
    return {k: torch.cat(v_).numpy() for k, v_ in feats.items()}


@torch.no_grad()
def resnet_layers(images: list) -> dict[str, np.ndarray]:
    bb = L.ResnetBackbone(0)
    feats: dict[str, list] = {}
    for i in range(0, len(images), 32):
        x = L.to_batch(bb, images[i:i + 32])
        for k, st in enumerate(bb.stages, start=1):
            x = st(x)
            feats.setdefault(str(k), []).append(F.normalize(x.mean((2, 3)).float(), dim=-1).cpu())
    return {k: torch.cat(v_).numpy() for k, v_ in feats.items()}


def score(emb: np.ndarray, train: list) -> dict:
    y = np.array([t.gender for t in train])
    groups = np.array([t.restroom for t in train])
    crops = [i for i, t in enumerate(train) if t.kind == "crop"]
    origs = [i for i, t in enumerate(train) if t.kind == "orig"]
    key = {i: (train[i].restroom, train[i].gender) for i in range(len(train))}
    # step 1: crop -> its own original among all originals
    sim = emb[crops] @ emb[origs].T
    picked = sim.argmax(1)
    s1 = float(np.mean([key[origs[p]] == key[c] for p, c in zip(picked, crops)]))
    # step 2: original -> partner among the other originals
    hits, rr = L.pair_retrieval(emb[origs], groups[origs], y[origs])
    g = C.probe_cv(emb, y, groups)
    return {"crop_to_orig_top1": round(s1, 4), "pair_top1": round(float(np.mean(hits)), 4),
            "pair_mrr": round(float(np.mean(rr)), 4), "gender_acc_cv": g["accuracy"]}


def plot(res: dict, out: Path) -> None:
    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    import layers_report as R  # noqa: F401  (applies the chart style)

    panels = [("crop_to_orig_top1", "Step 1: crop → its own original"), ("pair_top1", "Step 2: original → its partner"),
              ("gender_acc_cv", "Gender of one sign (probe)")]
    fig, axes = plt.subplots(1, 3, figsize=(14, 4.2))
    for ax, (key, title) in zip(axes, panels):
        ends = {}
        for b in ("clip", "resnet"):
            layers = [k for k in res[b] if k != "final"]
            x = [int(k) / len(layers) * 100 for k in layers]
            y = [res[b][k][key] for k in layers]
            ax.plot(x, y, "-o", color=R.COLOR[b], markeredgecolor=R.SURFACE, markeredgewidth=1.2, label=R.LABEL[b])
            ends[b] = (x[-1], y[-1])
        # direct labels at the line ends, pushed apart when the two ends are close
        (xc, yc), (xr, yr) = ends["clip"], ends["resnet"]
        if abs(yc - yr) < 0.06:
            mid = (yc + yr) / 2
            yc, yr = (mid + 0.03, mid - 0.03) if yc >= yr else (mid - 0.03, mid + 0.03)
        for b, (xe, ye) in (("clip", (xc, yc)), ("resnet", (xr, yr))):
            ax.annotate(R.LABEL[b], (xe, ye), xytext=(8, 0), textcoords="offset points", fontsize=9, color=R.INK2, va="center")
        if key == "gender_acc_cv":
            ax.axhline(0.5, color=R.INK2, linewidth=1, linestyle=":")
            ax.annotate("chance", (104, 0.5), xytext=(0, 4), textcoords="offset points", fontsize=9, color=R.INK2)
        ax.set_title(title, loc="left")
        ax.set_xlabel("depth: share of the network's blocks / stages, %")
        ax.set_xlim(0, 135)
        ax.set_ylim(0.0 if key != "gender_acc_cv" else 0.4, 1.0)
    axes[0].set_ylabel("top-1 / accuracy")
    axes[0].legend(frameon=False, loc="lower right")
    fig.suptitle("What each layer of a frozen network knows (no training)", x=0.01, ha="left", fontsize=13, fontweight="bold")
    fig.text(0.01, 0.005, "82 IOAI training restrooms. CLIP: class token after each of 12 blocks. ResNet50: pooled features after each of 5 stages.",
             fontsize=9, color=R.INK2)
    fig.tight_layout(rect=(0, 0.03, 1, 0.94))
    fig.savefig(out, dpi=200)
    plt.close(fig)


def main() -> None:
    C.seed_everything()
    train = C.load_train()
    images = [C.load_rgb(t.path) for t in train]
    res = {}
    for name, fn in (("clip", clip_layers), ("resnet", resnet_layers)):
        feats = fn(images)
        res[name] = {k: score(e, train) for k, e in feats.items()}
        for k, m in res[name].items():
            print(f"{name:6s} layer {k:>5s}: step1 {m['crop_to_orig_top1']:.3f}  pair {m['pair_top1']:.3f}  gender {m['gender_acc_cv']:.3f}", flush=True)
    OUT.write_text(json.dumps({
        "experiment": "frozen features read out after every block/stage, no training",
        "data": "82 IOAI training restrooms: 164 crops, 164 originals",
        "results": res, "device": C.device_name(), "versions": C.versions(),
        "timestamp": datetime.now(timezone.utc).isoformat(timespec="seconds")}, indent=2) + "\n")
    figs = C.RESULTS / "figs"
    figs.mkdir(parents=True, exist_ok=True)
    plot(res, figs / "layer_probe.png")
    print(f"wrote {OUT} and {figs / 'layer_probe.png'}")


if __name__ == "__main__":
    main()
