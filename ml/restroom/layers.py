"""Layer experiment: how many layers to fine-tune, and does it differ for a ViT and a CNN?

The pipeline (pipeline.py) solves step 1, finding the crop's own original, without any learning
(SIFT + pixel check). What a model can still learn is step 2: how alike the two door signs of one
restroom look, so that an original's partner is its most similar sign. This script fine-tunes that
similarity with a contrastive loss (InfoNCE, the IOAI reference recipe) on male <-> female pairs of
the training restrooms, and varies ONE thing: how many of the last layers are trained.

  clip    CLIP ViT-B/32 image encoder, 12 transformer blocks. N = number of last blocks trained
          (plus the final layer norm). N = 0 is zero-shot.
  resnet  ResNet50 pretrained on ImageNet, 5 stages (stem, layer1..layer4). N = number of last
          stages trained. N = 0 is the frozen ImageNet features. Batch norm stays in eval mode
          (running statistics frozen): batches of 32 pairs are too small to re-estimate them.

Everything else is fixed: Adam (lr 1e-4, wd 1e-5, betas 0.5/0.999), cosine schedule to 1e-6,
temperature 0.07, batch 32, 50 epochs, keep the epoch with the lowest training loss.

Evaluation: 5-fold cross-validation grouped by restroom. In each fold the model is trained on about
66 restrooms and tested on the other 16 it has never seen. Per setting, over all folds:

  pair_top1_heldout     main metric. For each held-out original, is its partner the most similar
                        of the other held-out originals? 164 originals over the 5 folds.
  pair_mrr_heldout      mean reciprocal rank of the partner (1 = always first, 0.5 = second ...)
  pair_top1_heldout_vs_all164
                        harder: the same held-out originals, ranked against all 164 training
                        originals (the training restrooms act as distractors)
  pair_top1_train       the same on the restrooms the model trained on: the gap to held-out is
                        overfitting
  pipeline_top1_heldout the full pipeline on held-out restrooms (SIFT step 1, global assignment),
                        with this model's similarity in step 2, alone and mixed with the colour
                        histogram (weight 0.3, as in pipeline.py). 20 episodes per fold
  gender_acc_heldout    logistic-regression probe for male/female on the model's embeddings,
                        trained on the training folds' 4 images per restroom: what fine-tuning does
                        to the gender information the signage rules use

Usage, from the repository root:
    python ml/restroom/layers.py --backbone clip --n 0 1 2 3 4 6 8 12 --seeds 42 0 1
    python ml/restroom/layers.py --backbone resnet --n 0 1 2 3 4 5 --seeds 42 0 1
    python ml/restroom/layers.py --backbone clip --n 1 --seeds 42 --smoke     # 2 epochs, 2 folds
Writes ml/results/restroom/layers/<backbone>-n<N>-s<seed>.json (smoke runs: layers-smoke/).
"""

from __future__ import annotations

import argparse
import json
import math
import sys
import time
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
import torch
import torch.nn.functional as F

sys.path.insert(0, str(Path(__file__).resolve().parent))
import classic as K  # noqa: E402
import common as C  # noqa: E402
import pipeline as P  # noqa: E402

OUT_DIR = C.RESULTS / "layers"
EPISODES_PER_FOLD = 20
HIST_WEIGHT = 0.3   # pipeline.py's choice on training episodes


def log(msg: str) -> None:
    print(msg, flush=True)


@dataclass
class TrainConfig:
    epochs: int = 50
    batch_size: int = 32
    lr: float = 1e-4
    weight_decay: float = 1e-5
    betas: tuple = (0.5, 0.999)
    eta_min: float = 1e-6
    temperature: float = 0.07


# --------------------------------------------------------------------------------------------
# Backbones. Each splits into a frozen prefix (computed once, no gradients) and a trainable
# suffix. Neither model has dropout and batch norm is kept in eval mode, so the prefix output
# never changes during training and can be cached.
# --------------------------------------------------------------------------------------------

class ClipBackbone:
    depth = 12

    def __init__(self, n: int):
        self.n = n
        self.model, self.preprocess, _ = C.load_clip("ViT-B-32")
        for p in self.model.parameters():
            p.requires_grad = False
        if n > 0:
            C.set_trainable(self.model, n)   # last n blocks + ln_post

    def prefix(self, x):
        return C.frozen_prefix(self.model, x, self.n)

    def suffix(self, h):
        return C.trainable_suffix(self.model, h, self.n)


class ResnetBackbone:
    depth = 5

    def __init__(self, n: int):
        from torchvision.models import ResNet50_Weights, resnet50

        self.n = n
        weights = ResNet50_Weights.IMAGENET1K_V2
        self.model = resnet50(weights=weights).to(C.device()).eval()
        self.preprocess = weights.transforms()
        m = self.model
        self.stages = [torch.nn.Sequential(m.conv1, m.bn1, m.relu, m.maxpool), m.layer1, m.layer2, m.layer3, m.layer4]
        for p in m.parameters():
            p.requires_grad = False
        for st in self.stages[self.depth - n:]:
            for p in st.parameters():
                p.requires_grad = True

    @torch.no_grad()
    def prefix(self, x):
        for st in self.stages[: self.depth - self.n]:
            x = st(x)
        return x

    def suffix(self, h):
        for st in self.stages[self.depth - self.n:]:
            h = st(h)
        return F.normalize(h.mean((2, 3)).float(), dim=-1)   # global average pool, 2048-d


def make_backbone(name: str, n: int):
    return {"clip": ClipBackbone, "resnet": ResnetBackbone}[name](n)


def trainable(bb) -> dict[str, torch.nn.Parameter]:
    return {k: p for k, p in bb.model.named_parameters() if p.requires_grad}


def to_batch(bb, images: list) -> torch.Tensor:
    return torch.stack([bb.preprocess(im) for im in images]).to(C.device())


def prefix_all(bb, images: list, chunk: int = 32) -> torch.Tensor:
    return torch.cat([bb.prefix(to_batch(bb, images[i:i + chunk])) for i in range(0, len(images), chunk)])


@torch.no_grad()
def embed(bb, images: list, chunk: int = 32) -> np.ndarray:
    out = [bb.suffix(bb.prefix(to_batch(bb, images[i:i + chunk]))).cpu() for i in range(0, len(images), chunk)]
    return torch.cat(out).numpy()


def finetune(bb, left: list, right: list, cfg: TrainConfig, seed: int) -> dict:
    """Contrastive fine-tuning on positive pairs left[i] <-> right[i]. Keeps the epoch with the
    lowest training loss, as the IOAI reference does."""
    if bb.n == 0:
        return {"epochs": 0, "losses": [], "best_loss": None, "seconds": 0.0}
    torch.manual_seed(seed)
    params = trainable(bb)
    opt = torch.optim.Adam(params.values(), lr=cfg.lr, weight_decay=cfg.weight_decay, betas=cfg.betas)
    sched = torch.optim.lr_scheduler.CosineAnnealingLR(opt, T_max=cfg.epochs, eta_min=cfg.eta_min)
    hl, hr = prefix_all(bb, left), prefix_all(bb, right)
    gen = torch.Generator().manual_seed(seed)
    best_loss, best, losses = math.inf, None, []
    start = time.perf_counter()
    for _ in range(cfg.epochs):
        order = torch.randperm(len(left), generator=gen)
        total, steps = 0.0, 0
        for i in range(0, len(order), cfg.batch_size):
            idx = order[i:i + cfg.batch_size].to(hl.device)
            loss = C.info_nce(bb.suffix(hl[idx]), bb.suffix(hr[idx]), cfg.temperature)
            opt.zero_grad()
            loss.backward()
            opt.step()
            total, steps = total + loss.item(), steps + 1
        sched.step()
        losses.append(round(total / steps, 6))
        if losses[-1] < best_loss:
            best_loss = losses[-1]
            best = {k: p.detach().clone() for k, p in params.items()}
    with torch.no_grad():
        for k, p in params.items():
            p.copy_(best[k])
    return {"epochs": cfg.epochs, "losses": losses, "best_loss": round(best_loss, 6),
            "seconds": round(time.perf_counter() - start, 1)}


# --------------------------------------------------------------------------------------------
# Metrics
# --------------------------------------------------------------------------------------------

def pair_retrieval(emb: np.ndarray, rooms: np.ndarray, genders: np.ndarray,
                   queries: np.ndarray | None = None) -> tuple[list[float], list[float]]:
    """For each query image: rank of its partner (same room, other gender) among all the other
    images. queries: indices of the images to score (default all). Returns per-query top-1 hits and
    reciprocal ranks."""
    sim = emb @ emb.T
    np.fill_diagonal(sim, -np.inf)
    pos = {(r, g): i for i, (r, g) in enumerate(zip(rooms, genders))}
    hits, rr = [], []
    for i in (range(len(rooms)) if queries is None else queries):
        r, g = rooms[i], genders[i]
        j = pos[(r, 1 - g)]
        rank = 1 + int((sim[i] > sim[i, j]).sum())
        hits.append(float(rank == 1))
        rr.append(1.0 / rank)
    return hits, rr


@dataclass
class Data:
    train: list            # all 328 TrainImage
    images: list           # PIL images, same order
    crop_idx: dict         # (room, gender) -> index into train
    orig_idx: dict
    ncc: np.ndarray        # 164 crops x 164 originals, rows/cols in pipeline.py's order
    hist_gg: np.ndarray    # 164 x 164 originals
    crop_rows: dict        # (room, gender) -> row of ncc
    orig_cols: dict        # (room, gender) -> column of ncc / hist_gg


def load_data() -> Data:
    train = C.load_train()
    crops = [t for t in train if t.kind == "crop"]
    origs = [t for t in train if t.kind == "orig"]
    cache = C.CACHE / f"sift_train_affine_ls{K.LONG_SIDE}_r{K.RATIO}_px{K.RANSAC_PX}.npz"   # same file as pipeline.py
    if cache.exists():
        ncc = np.load(cache)["ncc"]
    else:
        log("computing the SIFT step-1 scores for the training set (once, about 20 s)")
        inliers, ncc = K.sift_matrix([t.path for t in crops], [t.path for t in origs])
        cache.parent.mkdir(parents=True, exist_ok=True)
        np.savez(cache, inliers=inliers, ncc=ncc)
    return Data(
        train=train,
        images=[C.load_rgb(t.path) for t in train],
        crop_idx={(t.restroom, t.gender): i for i, t in enumerate(train) if t.kind == "crop"},
        orig_idx={(t.restroom, t.gender): i for i, t in enumerate(train) if t.kind == "orig"},
        ncc=ncc,
        hist_gg=K.hist_matrix([t.path for t in origs], [t.path for t in origs]),
        crop_rows={(t.restroom, t.gender): i for i, t in enumerate(crops)},
        orig_cols={(t.restroom, t.gender): i for i, t in enumerate(origs)},
    )


def pipeline_episodes(d: Data, emb: np.ndarray, rooms: np.ndarray, rng: np.random.Generator) -> dict[str, list[float]]:
    """Full pipeline on held-out restrooms: one random query gender per restroom, all their
    originals as gallery, SIFT step 1, global assignment in both steps."""
    out = {"emb": [], "emb+hist": []}
    for _ in range(EPISODES_PER_FOLD):
        g = rng.integers(0, 2, size=len(rooms))
        q_rows = np.array([d.crop_rows[(r, gi)] for r, gi in zip(rooms, g)])
        gal_keys = [(r, x) for r in rooms for x in (0, 1)]
        gal_keys = [gal_keys[i] for i in rng.permutation(len(gal_keys))]
        g_cols = np.array([d.orig_cols[k] for k in gal_keys])
        pos = {k: i for i, k in enumerate(gal_keys)}
        partner_true = np.array([pos[(r, 1 - gi)] for r, gi in zip(rooms, g)])
        eq = emb[[d.crop_idx[(r, gi)] for r, gi in zip(rooms, g)]]
        eg = emb[[d.orig_idx[k] for k in gal_keys]]
        own = P.best_per_row(d.ncc[np.ix_(q_rows, g_cols)] + 1e-3 * (eq @ eg.T), hungarian=True)
        pair = eg @ eg.T
        combo = HIST_WEIGHT * P.zscore(d.hist_gg[np.ix_(g_cols, g_cols)]) + (1 - HIST_WEIGHT) * P.zscore(pair)
        out["emb"].append(float(np.mean(P.partners(own, pair, True) == partner_true)))
        out["emb+hist"].append(float(np.mean(P.partners(own, combo, True) == partner_true)))
    return out


# --------------------------------------------------------------------------------------------

def run_setting(d: Data, backbone: str, n: int, seed: int, cfg: TrainConfig, n_folds: int) -> dict:
    t0 = time.perf_counter()
    rooms_all = np.array(sorted({t.restroom for t in d.train}))
    folds = C.grouped_folds(rooms_all, n_splits=5)[:n_folds]
    y = np.array([t.gender for t in d.train])
    room_of = np.array([t.restroom for t in d.train])
    rng = np.random.default_rng(seed)
    acc = {k: [] for k in ("pair_hit_heldout", "pair_rr_heldout", "pair_hit_all", "pair_rr_all", "pair_hit_train",
                           "pipe_emb", "pipe_combo", "gender_hit")}
    fold_rows, n_params, train_hist = [], None, []
    for k, (tr, te) in enumerate(folds):
        tr_rooms, te_rooms = rooms_all[tr], rooms_all[te]
        bb = make_backbone(backbone, n)
        n_params = sum(p.numel() for p in trainable(bb).values()) if n > 0 else 0
        left = [d.images[d.orig_idx[(r, 0)]] for r in tr_rooms]
        right = [d.images[d.orig_idx[(r, 1)]] for r in tr_rooms]
        hist = finetune(bb, left, right, cfg, seed + k)
        train_hist.append(hist)
        emb = embed(bb, d.images)

        def origs_of(rooms):
            idx = [d.orig_idx[(r, g)] for r in rooms for g in (0, 1)]
            return emb[idx], np.array([r for r in rooms for _ in (0, 1)]), np.array([g for _ in rooms for g in (0, 1)])

        h_te, rr_te = pair_retrieval(*origs_of(te_rooms))
        h_tr, _ = pair_retrieval(*origs_of(tr_rooms))
        # harder: held-out originals against all 164 originals (training restrooms as distractors)
        e_all, r_all, g_all = origs_of(rooms_all)
        h_all, rr_all = pair_retrieval(e_all, r_all, g_all, queries=np.where(np.isin(r_all, te_rooms))[0])
        pipe = pipeline_episodes(d, emb, te_rooms, rng)
        in_tr = np.isin(room_of, tr_rooms)
        probe = C.make_probe().fit(emb[in_tr], y[in_tr])
        g_hit = (probe.predict(emb[~in_tr]) == y[~in_tr]).astype(float).tolist()
        acc["pair_hit_heldout"] += h_te
        acc["pair_rr_heldout"] += rr_te
        acc["pair_hit_all"] += h_all
        acc["pair_rr_all"] += rr_all
        acc["pair_hit_train"] += h_tr
        acc["pipe_emb"] += pipe["emb"]
        acc["pipe_combo"] += pipe["emb+hist"]
        acc["gender_hit"] += g_hit
        fold_rows.append({"fold": k, "heldout_restrooms": len(te_rooms), "pair_top1_heldout": round(float(np.mean(h_te)), 4),
                          "pair_top1_heldout_vs_all164": round(float(np.mean(h_all)), 4),
                          "pair_top1_train": round(float(np.mean(h_tr)), 4), "gender_acc_heldout": round(float(np.mean(g_hit)), 4),
                          "pipeline_top1_heldout": round(float(np.mean(pipe["emb+hist"])), 4), "train_seconds": hist["seconds"],
                          "best_loss": hist["best_loss"]})
        log(f"  {backbone} N={n} seed={seed} fold {k + 1}/{len(folds)}: pair held-out {np.mean(h_te):.3f} "
            f"(vs all 164: {np.mean(h_all):.3f}), "
            f"train {np.mean(h_tr):.3f}, gender {np.mean(g_hit):.3f}, pipeline {np.mean(pipe['emb+hist']):.3f} "
            f"({hist['seconds']:.0f} s training)")
        del bb
        if torch.cuda.is_available():
            torch.cuda.empty_cache()

    def mean(v):
        return round(float(np.mean(v)), 4)

    return {
        "backbone": backbone,
        "model": {"clip": "CLIP ViT-B/32 (OpenAI weights)", "resnet": "ResNet50 (torchvision IMAGENET1K_V2)"}[backbone],
        "depth": {"clip": 12, "resnet": 5}[backbone],
        "unit": {"clip": "transformer blocks", "resnet": "stages"}[backbone],
        "n_trained": n,
        "trainable_params": n_params,
        "seed": seed,
        "metrics": {
            "pair_top1_heldout": mean(acc["pair_hit_heldout"]),
            "pair_mrr_heldout": mean(acc["pair_rr_heldout"]),
            "pair_top1_heldout_vs_all164": mean(acc["pair_hit_all"]),
            "pair_mrr_heldout_vs_all164": mean(acc["pair_rr_all"]),
            "pair_top1_train": mean(acc["pair_hit_train"]),
            "pipeline_top1_heldout_emb": mean(acc["pipe_emb"]),
            "pipeline_top1_heldout_emb_hist": mean(acc["pipe_combo"]),
            "gender_acc_heldout": mean(acc["gender_hit"]),
            "n_heldout_originals": len(acc["pair_hit_heldout"]),
        },
        "folds": fold_rows,
        "training": [{"best_loss": h["best_loss"], "seconds": h["seconds"], "losses": h["losses"]} for h in train_hist],
        "config": {**asdict(cfg), "betas": list(cfg.betas), "folds": len(folds), "grouped_by": "restroom",
                   "episodes_per_fold": EPISODES_PER_FOLD, "hist_weight": HIST_WEIGHT,
                   "checkpoint": "lowest training loss", "batchnorm": "eval mode (frozen statistics)"},
        "versions": C.versions(),
        "device": C.device_name(),
        "seconds": round(time.perf_counter() - t0, 1),
        "timestamp": datetime.now(timezone.utc).isoformat(timespec="seconds"),
    }


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--backbone", choices=["clip", "resnet"], required=True)
    ap.add_argument("--n", type=int, nargs="+", required=True, help="numbers of last blocks/stages to train")
    ap.add_argument("--seeds", type=int, nargs="+", default=[C.SEED])
    ap.add_argument("--epochs", type=int, default=None)
    ap.add_argument("--smoke", action="store_true", help="2 epochs, 2 folds, written to layers-smoke/")
    ap.add_argument("--skip-existing", action="store_true")
    args = ap.parse_args()
    depth = {"clip": 12, "resnet": 5}[args.backbone]
    if any(not 0 <= n <= depth for n in args.n):
        ap.error(f"--n must be between 0 and {depth} for {args.backbone}")
    cfg = TrainConfig(epochs=2 if args.smoke else (args.epochs or TrainConfig.epochs))
    out_dir = C.RESULTS / "layers-smoke" if args.smoke else OUT_DIR
    out_dir.mkdir(parents=True, exist_ok=True)
    log(f"layer experiment: {args.backbone}, N = {args.n}, seeds = {args.seeds}, {cfg.epochs} epochs, device {C.device_name()}")
    d = load_data()
    for seed in args.seeds:
        for n in args.n:
            path = out_dir / f"{args.backbone}-n{n:02d}-s{seed}.json"
            if args.skip_existing and path.exists():
                log(f"skip {path} (exists)")
                continue
            C.seed_everything(seed)
            res = run_setting(d, args.backbone, n, seed, cfg, n_folds=2 if args.smoke else 5)
            res["smoke"] = args.smoke
            path.write_text(json.dumps(res, indent=2) + "\n")
            m = res["metrics"]
            log(f"{args.backbone} N={n} seed={seed}: pair held-out {m['pair_top1_heldout']:.3f} (MRR {m['pair_mrr_heldout']:.3f}, "
                f"vs all 164: {m['pair_top1_heldout_vs_all164']:.3f}), "
                f"train {m['pair_top1_train']:.3f}, gender {m['gender_acc_heldout']:.3f}, "
                f"pipeline {m['pipeline_top1_heldout_emb_hist']:.3f}  -> {path} ({res['seconds']:.0f} s)")


if __name__ == "__main__":
    main()
