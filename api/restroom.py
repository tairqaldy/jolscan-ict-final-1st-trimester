"""Restroom-sign endpoints: gender of each sign and similarity of designs (docs/ARCHITECTURE.md 2b).

    POST /restroom/compare  multipart: a=<image>, b=<image>                     -> CompareResult
    POST /restroom/match    multipart: query=<image>, gallery=<image> (1..60x)  -> MatchResult
                            bestMatchId comes from the two-step pipeline in restroom_pipeline.py
                            (SIFT + pixel check, then colour + CLIP), not from the predicted genders.

The model is CLIP (ViT image encoder). It is loaded on the first restroom request, not at start-up,
so the pothole service starts as fast as before and runs without the CLIP download.

Environment variables:
    RESTROOM_MODEL       open_clip architecture with OpenAI weights, default "ViT-B-32"
    RESTROOM_WEIGHTS     optional fine-tuned checkpoint from ml/restroom/run.py (the "pair" model,
                         e.g. weights/R4-pair.pt). Only the fine-tuned layers are stored in it.
    RESTROOM_PROBE       optional gender probe (.npz from run.py --run R6, e.g.
                         weights/restroom-probe-vit-b-32.npz). Without it, zero-shot text prompts.
    RESTROOM_MODEL_NAME  optional name echoed in responses. Default e.g. "clip-vitb32-zs".

The service returns predictions and similarity only. The signage rules (docs/RULES.md part 2) are
applied by the web app.
"""

from __future__ import annotations

import logging
import os
import threading
import time
from pathlib import Path

import numpy as np
from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.concurrency import run_in_threadpool

from imaging import read_image
from schemas import CompareResult, MatchResult

log = logging.getLogger("restroom")

ARCH = os.getenv("RESTROOM_MODEL", "ViT-B-32")
WEIGHTS = os.getenv("RESTROOM_WEIGHTS") or None
PROBE = os.getenv("RESTROOM_PROBE") or None
PROVIDER = os.getenv("PROVIDER_NAME", "local")
MAX_GALLERY = 60
GENDERS = ("male", "female")

# Same prompts as ml/restroom/common.py, which measured their accuracy. Keep the two in sync.
PROMPTS = {
    "male": ["a restroom sign for men", "a men's toilet icon", "a pictogram of a man on a restroom door",
             "a male restroom symbol", "a gents bathroom sign"],
    "female": ["a restroom sign for women", "a women's toilet icon", "a pictogram of a woman on a restroom door",
               "a female restroom symbol", "a ladies bathroom sign"],
}

router = APIRouter(prefix="/restroom", tags=["restroom"])


class ClipBackend:
    """CLIP image encoder plus a gender head. Everything it returns is numpy."""

    def __init__(self, arch: str = ARCH, weights: str | None = WEIGHTS, probe: str | None = PROBE):
        import open_clip
        import torch

        self._torch = torch
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        # OpenAI CLIP uses QuickGELU; open_clip's plain config does not, so force it.
        model, _, self.preprocess = open_clip.create_model_and_transforms(
            arch, pretrained="openai", force_quick_gelu=True, device=self.device)
        suffix = "zs"
        if weights:
            ckpt = torch.load(weights, map_location=self.device, weights_only=True)
            if ckpt.get("arch") != arch:
                raise RuntimeError(f"{weights} was fine-tuned from {ckpt.get('arch')}, but RESTROOM_MODEL is {arch}")
            model.load_state_dict(ckpt["state_dict"], strict=False)
            suffix = f"ft{ckpt.get('unfreeze', '')}"
        self.model = model.eval()
        self.name = os.getenv("RESTROOM_MODEL_NAME") or f"clip-{arch.lower().replace('-', '')}-{suffix}"

        self.probe = None
        if probe:
            p = np.load(probe)
            probe_arch, probe_weights = str(p["arch"]), str(p["weights"])
            if probe_arch != arch or probe_weights != (Path(weights).name if weights else ""):
                raise RuntimeError(f"{probe} was fitted on {probe_arch} embeddings "
                                   f"({probe_weights or 'pretrained weights'}), which this service does not load")
            self.probe = {k: p[k] for k in ("mean", "scale", "coef", "intercept")}
            self.gender_head = f"logistic-regression probe ({Path(probe).name})"
        else:
            with torch.no_grad():
                rows = []
                for g in GENDERS:
                    t = model.encode_text(open_clip.get_tokenizer(arch)(PROMPTS[g]).to(self.device)).float()
                    t = t / t.norm(dim=-1, keepdim=True)
                    m = t.mean(0)
                    rows.append((m / m.norm()).cpu().numpy())
            self.text = np.stack(rows)
            self.gender_head = "zero-shot text prompts"

    def encode(self, images: list) -> np.ndarray:
        """L2-normalised image embeddings, one row per image."""
        torch = self._torch
        with torch.no_grad():
            x = torch.stack([self.preprocess(im) for im in images]).to(self.device)
            e = self.model.encode_image(x).float()
            return (e / e.norm(dim=-1, keepdim=True)).cpu().numpy()

    def gender_proba(self, emb: np.ndarray) -> np.ndarray:
        """Columns P(male), P(female)."""
        if self.probe is not None:
            z = ((emb - self.probe["mean"]) / self.probe["scale"]) @ self.probe["coef"] + self.probe["intercept"][0]
            p_female = 1.0 / (1.0 + np.exp(-z))
            return np.stack([1.0 - p_female, p_female], axis=1)
        logits = 100.0 * emb @ self.text.T          # CLIP's logit scale
        logits -= logits.max(axis=1, keepdims=True)
        p = np.exp(logits)
        return p / p.sum(axis=1, keepdims=True)


_backend = None
_lock = threading.Lock()
_inference_lock = threading.Lock()


def get_backend():
    """Load CLIP once, on first use. Raises HTTP 503 if it cannot be loaded."""
    global _backend
    if _backend is None:
        with _lock:
            if _backend is None:
                try:
                    _backend = ClipBackend()
                except Exception as exc:  # missing package, failed download, bad checkpoint
                    log.exception("Restroom model failed to load")
                    raise HTTPException(status_code=503, detail=f"The restroom model could not be loaded: {exc}") from None
    return _backend


def status() -> dict:
    """For /health: which restroom model is configured and whether it is loaded."""
    info = {"loaded": _backend is not None, "arch": ARCH, "weights": WEIGHTS, "probe": PROBE}
    if _backend is not None:
        info.update(name=_backend.name, device=_backend.device, genderHead=_backend.gender_head)
    return info


def _predictions(proba: np.ndarray) -> list[dict]:
    idx = proba.argmax(axis=1)
    return [{"gender": GENDERS[i], "confidence": round(float(p[i]), 4)} for i, p in zip(idx, proba)]


def _similarity(a: np.ndarray, b: np.ndarray) -> np.ndarray:
    """Cosine similarity scaled to 0..1 as (cos + 1) / 2, the IOAI baseline's scaling."""
    return np.clip((a @ b.T + 1.0) / 2.0, 0.0, 1.0)


def _infer(backend, images: list) -> tuple[np.ndarray, list[dict], int]:
    start = time.perf_counter()
    with _inference_lock:
        emb = backend.encode(images)
        preds = _predictions(backend.gender_proba(emb))
    return emb, preds, round((time.perf_counter() - start) * 1000)


@router.post("/compare", response_model=CompareResult)
async def compare(a: UploadFile = File(...), b: UploadFile = File(...)) -> dict:
    img_a = await read_image(a, "Sign a")
    img_b = await read_image(b, "Sign b")
    backend = await run_in_threadpool(get_backend)
    # Inference is blocking, so it runs in a worker thread and /health stays responsive.
    emb, preds, latency = await run_in_threadpool(_infer, backend, [img_a, img_b])
    return {
        "provider": PROVIDER,
        "model": backend.name,
        "latencyMs": latency,
        "a": preds[0],
        "b": preds[1],
        "similarity": round(float(_similarity(emb[:1], emb[1:])[0, 0]), 4),
    }


@router.post("/match", response_model=MatchResult)
async def match(query: UploadFile = File(...), gallery: list[UploadFile] = File(...)) -> dict:
    if len(gallery) > MAX_GALLERY:
        raise HTTPException(status_code=400, detail=f"Send at most {MAX_GALLERY} gallery images, got {len(gallery)}.")
    q_img = await read_image(query, "The query image")
    g_imgs = [await read_image(f, f"Gallery file {i}") for i, f in enumerate(gallery)]
    backend = await run_in_threadpool(get_backend)
    emb, preds, latency = await run_in_threadpool(_infer, backend, [q_img, *g_imgs])

    # bestMatchId: the two-step pipeline (restroom_pipeline.py, task C-8), not the predicted genders.
    start = time.perf_counter()
    pair = await run_in_threadpool(_pair, q_img, g_imgs, emb)
    latency += round((time.perf_counter() - start) * 1000)

    sims = _similarity(emb[:1], emb[1:])[0]
    q_pred = preds[0]
    candidates = [{"id": str(i), "similarity": round(float(s), 4), "prediction": preds[i + 1]} for i, s in enumerate(sims)]
    # Most similar first; equal similarity keeps upload order.
    order = sorted(range(len(candidates)), key=lambda i: (-sims[i], i))
    candidates = [candidates[i] for i in order]
    return {
        "provider": PROVIDER,
        "model": backend.name,
        "latencyMs": latency,
        "query": q_pred,
        "candidates": candidates,
        "bestMatchId": None if pair.best is None else str(pair.best),
        "ownId": None if pair.own is None else str(pair.own),
    }


def _pair(query, gallery: list, emb: np.ndarray):
    # OpenCV's SIFT object is shared, so one request at a time, like the CLIP inference.
    with _inference_lock:
        # Imported on first use, like CLIP: the service and /health start without OpenCV.
        from restroom_pipeline import find_pair

        return find_pair(query, gallery, emb)
