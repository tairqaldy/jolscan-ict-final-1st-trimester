"""Fine-tune CLIP ViT-B/32 with the last N transformer blocks trained, for the web app's Match comparison.

The layer sweep (layers.py, task C-11) measured the effect of N with cross-validation on a Kaggle GPU and
kept no weights. To show on the Match page what a model with N trained blocks actually picks, this
script trains one model per N on all 82 training restrooms with R4's recipe (the pair model of run.py:
male door against female door, InfoNCE, 50 epochs) and stores only the embeddings of the 238 catalogue
signs, not the weights. N = 0 is zero-shot CLIP (R1) and needs no training.

Writes  data/cache/restroom/layer_models/clip_n<N>.npy   (gitignored; read by export_match.py)

Usage, from the repository root (about 15 minutes on a laptop CPU for all N):
    python ml/restroom/train_layer_models.py
"""

from __future__ import annotations

import json
import sys
import time
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
import common as C  # noqa: E402
import run  # noqa: E402
from export_match import CAT, paths_of  # noqa: E402

NS = (1, 2, 4, 6, 8, 12)
OUT = C.CACHE / "layer_models"


def main() -> None:
    C.seed_everything()
    samples = json.loads(CAT.read_text())["samples"]
    paths = paths_of(samples)
    train = C.load_train()
    pairs = run.train_pairs(train, "pair")
    OUT.mkdir(parents=True, exist_ok=True)
    for n in NS:
        dst = OUT / f"clip_n{n:02d}.npy"
        if dst.exists():
            print(f"N = {n}: {dst} exists, skipped", flush=True)
            continue
        t0 = time.perf_counter()
        cfg = C.FinetuneConfig(unfreeze=n, eta_min=1e-6)
        (model, preprocess, _), _ = C.finetune_pairs("ViT-B-32", pairs, cfg, lambda m: None)
        emb = C.embed_images(model, preprocess, [C.load_rgb(p) for p in paths])
        np.save(dst, emb.astype(np.float32))
        print(f"N = {n}: trained and embedded {len(paths)} signs in {time.perf_counter() - t0:.0f} s", flush=True)


if __name__ == "__main__":
    main()
