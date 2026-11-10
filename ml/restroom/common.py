"""Shared code for the restroom-sign experiment: data, CLIP embeddings, matching, gender classifiers.

Course concepts used here (page references are to the digests in docs/research/):
- CLIP zero-shot: an image encoder and a text encoder trained to put matching pairs close
  together, so a class can be predicted from text prompts without training (Lec8 p56).
- ViT: the CLIP image encoder is a Vision Transformer, the image is cut into 16x16 or 32x32
  patches that go through transformer blocks (Lec8 p46-47).
- Transfer learning: reuse the pretrained backbone and fine-tune only the last layers (Lec8 p38).
- scikit-learn classifier and metrics on top of frozen embeddings, as in the labs.

Paths are relative to the repository root. Run every script from there.
"""

from __future__ import annotations

import hashlib
import json
import math
import platform
import random
import subprocess
import time
from dataclasses import dataclass
from pathlib import Path

import numpy as np
import torch
import torch.nn.functional as F
from PIL import Image

DATA = Path("data/raw/ioai-restroom")
CACHE = Path("data/cache/restroom")
RESULTS = Path("ml/results/restroom")
RUNS_DIR = RESULTS / "runs"
WEIGHTS_DIR = RESULTS / "weights"     # fine-tuned checkpoints, gitignored
SEED = 42
GENDERS = ("male", "female")          # label 0 = male, 1 = female

# Prompt ensembles for zero-shot gender prediction. The class score is the mean text embedding.
PROMPTS = {
    "male": [
        "a restroom sign for men",
        "a men's toilet icon",
        "a pictogram of a man on a restroom door",
        "a male restroom symbol",
        "a gents bathroom sign",
    ],
    "female": [
        "a restroom sign for women",
        "a women's toilet icon",
        "a pictogram of a woman on a restroom door",
        "a female restroom symbol",
        "a ladies bathroom sign",
    ],
}


def seed_everything(seed: int = SEED) -> None:
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)


# --------------------------------------------------------------------------------------------
# Data
# --------------------------------------------------------------------------------------------

def sorted_pngs(folder: Path) -> list[Path]:
    """PNG files sorted by the number in the file name (1.png, 2.png, ..., 10.png).

    The IOAI baseline sorts the same way. A plain string sort would put 10 before 2 and shift
    every predicted gallery index.
    """
    files = list(folder.glob("*.png"))
    if not files:
        raise SystemExit(f"No images in {folder}. Run: python ml/restroom/get_data.py")
    return sorted(files, key=lambda p: int(p.stem))


@dataclass
class TrainImage:
    path: Path
    restroom: int        # 1..82, the same id in all four folders
    gender: int          # 0 male, 1 female
    kind: str            # "crop" or "orig"


def load_train() -> list[TrainImage]:
    out = []
    for kind in ("crop", "orig"):
        for g, gender in enumerate(GENDERS):
            for p in sorted_pngs(DATA / "training_set" / kind / gender):
                out.append(TrainImage(p, int(p.stem), g, kind))
    return out


SPLIT_DIRS = {"val": "validation_set", "test": "test_set"}
ANSWER_FILES = {"val": "answer_a.npy", "test": "answer_b.npy"}


def load_split(split: str) -> tuple[list[Path], list[Path]]:
    """Query (cropped) and gallery (original) image paths, numerically sorted."""
    root = DATA / "Solution" / SPLIT_DIRS[split]
    query, gallery = sorted_pngs(root / "query"), sorted_pngs(root / "gallery")
    # Query i is file i.png and gallery j is file j.png, so the k-th sorted file is number k+1.
    assert [int(p.stem) for p in query] == list(range(1, len(query) + 1)), "query files are not 1..N"
    assert [int(p.stem) for p in gallery] == list(range(1, len(gallery) + 1)), "gallery files are not 1..N"
    return query, gallery


def load_answers(split: str) -> np.ndarray:
    """Ground truth: for query i (row i-1), the 1-based number of the correct gallery file."""
    return np.load(DATA / "Solution" / "Scoring" / ANSWER_FILES[split])


def precision_at_1(pred: np.ndarray, truth: np.ndarray) -> float:
    """The IOAI score, as in Solution/Scoring/metrics.py: share of queries whose prediction equals
    the answer. A prediction that is missing (0) counts as wrong."""
    pred, truth = np.asarray(pred), np.asarray(truth)
    if pred.shape != truth.shape:
        raise ValueError(f"prediction shape {pred.shape} != answer shape {truth.shape}")
    return float(np.sum(pred == truth) / len(truth))


# --------------------------------------------------------------------------------------------
# Model and embeddings
# --------------------------------------------------------------------------------------------

def device() -> str:
    return "cuda" if torch.cuda.is_available() else "cpu"


def device_name() -> str:
    if torch.cuda.is_available():
        return torch.cuda.get_device_name(0)
    name = platform.processor() or platform.machine()
    if platform.system() == "Darwin":
        try:
            name = subprocess.run(["sysctl", "-n", "machdep.cpu.brand_string"], capture_output=True,
                                  text=True, check=True).stdout.strip()
        except (OSError, subprocess.CalledProcessError):
            pass
    return f"{name} CPU"


def load_clip(arch: str, weights: str | Path | None = None):
    """Pretrained OpenAI CLIP through open_clip, optionally with fine-tuned visual layers.

    OpenAI's CLIP uses QuickGELU activations. open_clip's default config for e.g. "ViT-B-32" uses
    standard GELU, so force_quick_gelu=True is needed to reproduce the original model exactly.
    Returns (model, preprocess, tokenizer), with the model in eval mode on device().
    """
    import open_clip

    model, _, preprocess = open_clip.create_model_and_transforms(
        arch, pretrained="openai", force_quick_gelu=True, device=device())
    if weights:
        ckpt = torch.load(weights, map_location=device(), weights_only=True)
        if ckpt.get("arch") != arch:
            raise SystemExit(f"{weights} was trained from {ckpt.get('arch')}, not {arch}")
        missing = set(ckpt["state_dict"]) - set(model.state_dict())
        if missing:
            raise SystemExit(f"{weights} has keys the model does not: {sorted(missing)[:3]}")
        model.load_state_dict(ckpt["state_dict"], strict=False)
    model.eval()
    return model, preprocess, open_clip.get_tokenizer(arch)


def load_rgb(path: Path) -> Image.Image:
    return Image.open(path).convert("RGB")


@torch.no_grad()
def embed_images(model, preprocess, images: list, batch_size: int = 32) -> np.ndarray:
    """L2-normalised CLIP image embeddings (the projected visual features, as encode_image)."""
    out = []
    for i in range(0, len(images), batch_size):
        batch = images[i:i + batch_size]
        x = torch.stack([preprocess(load_rgb(im) if isinstance(im, Path) else im) for im in batch]).to(device())
        out.append(F.normalize(model.encode_image(x).float(), dim=-1).cpu())
    return torch.cat(out).numpy()


def embed_paths_cached(model, preprocess, paths: list[Path], tag: str) -> np.ndarray:
    """Embeddings for a list of files, cached as .npy under data/cache/restroom/<tag>/.

    The cache key is the model tag plus every file's path and size, so a different model or a
    changed file never reuses a stale cache.
    """
    key = hashlib.sha1("\n".join(f"{p}:{p.stat().st_size}" for p in paths).encode()).hexdigest()[:16]
    file = CACHE / tag / f"{key}.npy"
    if file.exists():
        return np.load(file)
    emb = embed_images(model, preprocess, paths)
    file.parent.mkdir(parents=True, exist_ok=True)
    np.save(file, emb)
    return emb


@torch.no_grad()
def text_class_embeddings(model, tokenizer) -> np.ndarray:
    """One embedding per gender: the normalised mean of its prompt embeddings."""
    rows = []
    for gender in GENDERS:
        t = model.encode_text(tokenizer(PROMPTS[gender]).to(device())).float()
        rows.append(F.normalize(F.normalize(t, dim=-1).mean(0), dim=-1))
    return torch.stack(rows).cpu().numpy()


def zero_shot_proba(emb: np.ndarray, text_emb: np.ndarray, logit_scale: float = 100.0) -> np.ndarray:
    """P(male), P(female) from CLIP's image-text similarity, with CLIP's fixed logit scale of 100."""
    logits = logit_scale * emb @ text_emb.T
    logits -= logits.max(axis=1, keepdims=True)
    p = np.exp(logits)
    return p / p.sum(axis=1, keepdims=True)


def time_one_image(model, preprocess, image: Image.Image) -> float:
    """Milliseconds for one image at batch size 1: preprocessing plus the image encoder."""
    with torch.no_grad():
        if torch.cuda.is_available():
            torch.cuda.synchronize()
        start = time.perf_counter()
        model.encode_image(preprocess(image).unsqueeze(0).to(device()))
        if torch.cuda.is_available():
            torch.cuda.synchronize()
        return (time.perf_counter() - start) * 1000


def latency_ms(model, preprocess, paths: list[Path], n: int = 50, warmup: int = 5) -> float:
    """Median batch-1 time per image over n images after a warm-up.

    Single-image CPU timings vary with machine load, so runs measured at different times are only
    roughly comparable. run.py --latency R0 R1 ... re-times finished runs together.
    """
    images = [load_rgb(p) for p in paths]
    times = [time_one_image(model, preprocess, images[i % len(images)]) for i in range(n + warmup)]
    return float(np.median(times[warmup:]))


# --------------------------------------------------------------------------------------------
# Matching strategies. All return 1-based gallery file numbers, like the IOAI submissions.
# --------------------------------------------------------------------------------------------

def scaled_similarity(a: np.ndarray, b: np.ndarray) -> np.ndarray:
    """Cosine similarity of L2-normalised embeddings, scaled to 0..1 as (cos + 1) / 2 (IOAI baseline)."""
    return (a @ b.T + 1.0) / 2.0


def match_second_best(q: np.ndarray, g: np.ndarray) -> np.ndarray:
    """IOAI baseline: the most similar gallery image is assumed to be the query's own original
    (same gender), so the second most similar is taken as the opposite-gender match."""
    sim = scaled_similarity(q, g)
    # torch.topk, as in the baseline, so ties break the same way.
    idx = torch.topk(torch.from_numpy(sim), k=2, dim=1).indices[:, 1].numpy()
    return idx + 1


def match_two_step(q_crop: np.ndarray, g_crop: np.ndarray, g_pair: np.ndarray, prevent_reuse: bool = True) -> np.ndarray:
    """IOAI reference solution.

    Step 1, with the crop model: the query's own original is the most similar gallery image.
    Step 2, with the pair model: its partner is the gallery image most similar to that original,
    excluding the original itself and, with prevent_reuse, partners already given to earlier
    queries. Queries are processed in file-number order (the reference used directory order).
    """
    own = np.argmax(q_crop @ g_crop.T, axis=1)
    pair_sim = g_pair @ g_pair.T
    used: set[int] = set()
    out = np.zeros(len(q_crop), dtype=np.int64)
    for qi, oi in enumerate(own):
        best, best_sim = -1, -math.inf
        for gi in range(len(g_pair)):
            if gi == oi or (prevent_reuse and gi in used):
                continue
            if pair_sim[oi, gi] > best_sim:
                best, best_sim = gi, pair_sim[oi, gi]
        if best >= 0:
            out[qi] = best + 1
            if prevent_reuse:
                used.add(best)
    return out


def match_gender_filter(q: np.ndarray, g: np.ndarray, q_gender: np.ndarray, g_gender: np.ndarray) -> np.ndarray:
    """The rule the API's /restroom/match uses: the most similar gallery image whose predicted
    gender is the opposite of the query's. 0 (always wrong) when no candidate qualifies."""
    sim = scaled_similarity(q, g)
    out = np.zeros(len(q), dtype=np.int64)
    for qi in range(len(q)):
        ok = np.where(g_gender != q_gender[qi])[0]
        if len(ok):
            out[qi] = ok[np.argmax(sim[qi, ok])] + 1
    return out


# --------------------------------------------------------------------------------------------
# Gender classification on embeddings (scikit-learn, as in the labs)
# --------------------------------------------------------------------------------------------

def make_probe():
    """Logistic regression on standardised frozen CLIP embeddings: a linear probe."""
    from sklearn.linear_model import LogisticRegression
    from sklearn.pipeline import make_pipeline
    from sklearn.preprocessing import StandardScaler

    return make_pipeline(StandardScaler(), LogisticRegression(C=1.0, max_iter=5000, random_state=SEED))


def grouped_folds(groups: np.ndarray, n_splits: int = 5):
    """5-fold split by restroom id: the four images of one restroom are always in the same fold,
    so a classifier is never tested on a restroom whose other door it saw in training."""
    from sklearn.model_selection import GroupKFold

    X = np.zeros((len(groups), 1))
    return list(GroupKFold(n_splits=n_splits).split(X, groups=groups))


def classification_report_dict(y: np.ndarray, pred: np.ndarray) -> dict:
    from sklearn.metrics import accuracy_score, confusion_matrix, f1_score, precision_score, recall_score

    return {
        "accuracy": round(float(accuracy_score(y, pred)), 4),
        "precision_female": round(float(precision_score(y, pred, pos_label=1, zero_division=0)), 4),
        "recall_female": round(float(recall_score(y, pred, pos_label=1, zero_division=0)), 4),
        "f1_macro": round(float(f1_score(y, pred, average="macro")), 4),
        "confusion_matrix_rows_true_male_female": confusion_matrix(y, pred, labels=[0, 1]).tolist(),
    }


def probe_cv(emb: np.ndarray, y: np.ndarray, groups: np.ndarray, factory=make_probe) -> dict:
    """Out-of-fold predictions of a scikit-learn classifier, grouped 5-fold CV."""
    pred = np.zeros_like(y)
    fold_acc = []
    for tr, te in grouped_folds(groups):
        clf = factory().fit(emb[tr], y[tr])
        pred[te] = clf.predict(emb[te])
        fold_acc.append(float(np.mean(pred[te] == y[te])))
    rep = classification_report_dict(y, pred)
    rep["fold_accuracy"] = [round(a, 4) for a in fold_acc]
    rep["fold_accuracy_std"] = round(float(np.std(fold_acc)), 4)
    return rep


def save_probe(clf, path: Path, arch: str, weights: str | None) -> None:
    """Store a fitted StandardScaler + LogisticRegression as plain arrays (npz), so the API can
    apply it with numpy and never unpickles anything."""
    scaler, lr = clf[0], clf[-1]
    path.parent.mkdir(parents=True, exist_ok=True)
    np.savez(path, mean=scaler.mean_, scale=scaler.scale_, coef=lr.coef_[0], intercept=lr.intercept_,
             classes=np.array(GENDERS), arch=np.array(arch), weights=np.array(weights or ""))


# --------------------------------------------------------------------------------------------
# Fine-tuning the last transformer blocks (IOAI reference recipe)
# --------------------------------------------------------------------------------------------

@dataclass
class FinetuneConfig:
    unfreeze: int = 6            # last N resblocks of the image encoder, plus ln_post
    epochs: int = 50
    batch_size: int = 32
    lr: float = 1e-4
    weight_decay: float = 1e-5
    betas: tuple = (0.5, 0.999)
    eta_min: float = 1e-5        # the reference uses 1e-5 for the crop model and 1e-6 for the pair model
    temperature: float = 0.07
    augment: bool = False


def augmentation():
    """Augmentations for run R5, applied to PIL images before CLIP's own preprocessing.

    Chosen for door icons: small rotations and shifts (signs are photographed at an angle),
    random resized crops (the crop and original framings differ), colour and contrast changes
    (sign colours and lighting vary), horizontal flips (a mirrored pictogram keeps its gender).
    No vertical flip: an upside-down sign is not realistic. The same random transform is drawn
    independently for the two images of a pair.
    """
    from torchvision import transforms as T

    return T.Compose([
        T.RandomResizedCrop(224, scale=(0.7, 1.0), ratio=(0.85, 1.15)),
        T.RandomHorizontalFlip(),
        T.RandomApply([T.RandomAffine(degrees=10, translate=(0.05, 0.05))], p=0.5),
        T.ColorJitter(0.3, 0.3, 0.3, 0.05),
        T.RandomGrayscale(p=0.2),
    ])


def set_trainable(model, unfreeze: int) -> list[str]:
    """Freeze everything, then unfreeze the last N image-encoder blocks and ln_post, as in the
    reference solution's CLIPReID. The projection matrix stays frozen."""
    for p in model.parameters():
        p.requires_grad = False
    blocks = model.visual.transformer.resblocks
    names = []
    for i in range(len(blocks) - unfreeze, len(blocks)):
        for n, p in blocks[i].named_parameters():
            p.requires_grad = True
            names.append(f"visual.transformer.resblocks.{i}.{n}")
    for n, p in model.visual.ln_post.named_parameters():
        p.requires_grad = True
        names.append(f"visual.ln_post.{n}")
    return names


@torch.no_grad()
def frozen_prefix(model, x: torch.Tensor, unfreeze: int) -> torch.Tensor:
    """Tokens after the frozen blocks. CLIP has no dropout, so these never change during training
    and can be computed once. That makes CPU fine-tuning without augmentation affordable."""
    v = model.visual
    h = v._embeds(x)
    for blk in v.transformer.resblocks[: len(v.transformer.resblocks) - unfreeze]:
        h = blk(h)
    return h


def trainable_suffix(model, h: torch.Tensor, unfreeze: int) -> torch.Tensor:
    """Remaining blocks, pooling, ln_post and projection: open_clip's VisionTransformer.forward."""
    v = model.visual
    for blk in v.transformer.resblocks[len(v.transformer.resblocks) - unfreeze:]:
        h = blk(h)
    pooled, _ = v._pool(h)
    if v.proj is not None:
        pooled = pooled @ v.proj
    return F.normalize(pooled.float(), dim=-1)


def info_nce(a: torch.Tensor, b: torch.Tensor, temperature: float) -> torch.Tensor:
    """Symmetric contrastive loss: a[i] should be closest to b[i] among all b in the batch."""
    logits = a @ b.t() / temperature
    labels = torch.arange(a.size(0), device=a.device)
    return 0.5 * (F.cross_entropy(logits, labels) + F.cross_entropy(logits.t(), labels))


def finetune_pairs(arch: str, pairs: list[tuple[Path, Path]], cfg: FinetuneConfig, log=print) -> tuple[object, dict]:
    """Contrastive fine-tuning on positive pairs (left[i] belongs with right[i]).

    Follows the IOAI reference: Adam(lr 1e-4, wd 1e-5, betas 0.5/0.999), CosineAnnealingLR,
    temperature 0.07, batch 32, keep the epoch with the lowest training loss (there is no separate
    validation data for this inside the training set). Returns the model (eval mode, best state)
    and a small history dict.
    """
    seed_everything()
    model, preprocess, _ = load_clip(arch)
    trainable = set_trainable(model, cfg.unfreeze)
    params = [p for p in model.parameters() if p.requires_grad]
    opt = torch.optim.Adam(params, lr=cfg.lr, weight_decay=cfg.weight_decay, betas=cfg.betas)
    sched = torch.optim.lr_scheduler.CosineAnnealingLR(opt, T_max=cfg.epochs, eta_min=cfg.eta_min)
    left = [load_rgb(a) for a, _ in pairs]
    right = [load_rgb(b) for _, b in pairs]
    aug = augmentation() if cfg.augment else None

    if aug is None:
        # Frozen part computed once for every image.
        model.eval()
        with torch.no_grad():
            hl = torch.cat([frozen_prefix(model, torch.stack([preprocess(im) for im in left[i:i + 64]]).to(device()), cfg.unfreeze)
                            for i in range(0, len(left), 64)])
            hr = torch.cat([frozen_prefix(model, torch.stack([preprocess(im) for im in right[i:i + 64]]).to(device()), cfg.unfreeze)
                            for i in range(0, len(right), 64)])

    best_loss, best_state, losses = math.inf, None, []
    gen = torch.Generator().manual_seed(SEED)
    start = time.perf_counter()
    for epoch in range(cfg.epochs):
        model.train()
        order = torch.randperm(len(pairs), generator=gen)
        total, steps = 0.0, 0
        for i in range(0, len(order), cfg.batch_size):
            idx = order[i:i + cfg.batch_size]
            if aug is None:
                a = trainable_suffix(model, hl[idx], cfg.unfreeze)
                b = trainable_suffix(model, hr[idx], cfg.unfreeze)
            else:
                xa = torch.stack([preprocess(aug(left[j])) for j in idx.tolist()]).to(device())
                xb = torch.stack([preprocess(aug(right[j])) for j in idx.tolist()]).to(device())
                with torch.no_grad():
                    ha = frozen_prefix(model, xa, cfg.unfreeze)
                    hb = frozen_prefix(model, xb, cfg.unfreeze)
                a = trainable_suffix(model, ha, cfg.unfreeze)
                b = trainable_suffix(model, hb, cfg.unfreeze)
            loss = info_nce(a, b, cfg.temperature)
            opt.zero_grad()
            loss.backward()
            opt.step()
            total += loss.item()
            steps += 1
        sched.step()
        avg = total / steps
        losses.append(round(avg, 6))
        if avg < best_loss:
            best_loss = avg
            sd = model.state_dict()
            best_state = {k: sd[k].detach().clone() for k in trainable}
        if epoch == 0 or (epoch + 1) % 10 == 0:
            log(f"    epoch {epoch + 1}/{cfg.epochs} loss {avg:.4f} ({time.perf_counter() - start:.0f}s)")
    model.load_state_dict(best_state, strict=False)
    model.eval()
    state = {k: v.cpu() for k, v in best_state.items()}   # only the fine-tuned layers are saved
    hist = {"losses": losses, "best_loss": round(best_loss, 6), "seconds": round(time.perf_counter() - start, 1)}
    return (model, preprocess, state), hist


def save_checkpoint(state: dict, arch: str, unfreeze: int, run: str, role: str) -> Path:
    WEIGHTS_DIR.mkdir(parents=True, exist_ok=True)
    path = WEIGHTS_DIR / f"{run}-{role}.pt"
    torch.save({"arch": arch, "pretrained": "openai", "unfreeze": unfreeze, "run": run, "role": role,
                "state_dict": state}, path)
    return path


def versions() -> dict:
    import open_clip
    import sklearn

    return {"python": platform.python_version(), "torch": torch.__version__, "open_clip": open_clip.__version__,
            "sklearn": sklearn.__version__, "numpy": np.__version__}


def write_run(result: dict) -> Path:
    RUNS_DIR.mkdir(parents=True, exist_ok=True)
    path = RUNS_DIR / f"{result['run']}.json"
    path.write_text(json.dumps(result, indent=2, allow_nan=False) + "\n")
    return path
