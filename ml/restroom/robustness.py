"""How robust is step 1 to rotated, blurred, darker or smaller signs? (task C-24)

Step 1 finds the original a crop was cut from. Here the 164 training crops are changed in six ways and
matched again against the 164 clean originals, with every step-1 scorer of pipeline.py:

    rot10, rot30  rotated about the centre (border replicated, same size)
    blur          Gaussian blur, sigma 2
    dark          60 % brightness
    jpeg30        JPEG at quality 30
    half          resized to 50 %

Accuracy = share of crops whose best-scoring original is their own. The perturbed copies go to
data/cache/restroom/perturbed/ (gitignored); only the numbers and the figure are committed.

Writes  ml/results/restroom/robustness.json
        ml/results/restroom/figs/robustness.png

Usage, from the repository root (about 3 minutes per case on a laptop CPU):
    python ml/restroom/robustness.py
"""

from __future__ import annotations

import json
import sys
import time
from pathlib import Path

import cv2
import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
import classic as K  # noqa: E402
import common as C  # noqa: E402
import pipeline as P  # noqa: E402

OUT = C.RESULTS / "robustness.json"
FIG = C.RESULTS / "figs" / "robustness.png"
CACHE = C.CACHE / "perturbed"
SCORERS = {"sift_ncc": "SIFT + pixel check", "sift_inliers": "SIFT inliers", "clip": "CLIP", "hist": "colour histogram"}


def rotate(img: np.ndarray, deg: float) -> np.ndarray:
    h, w = img.shape[:2]
    M = cv2.getRotationMatrix2D((w / 2, h / 2), deg, 1.0)
    return cv2.warpAffine(img, M, (w, h), borderMode=cv2.BORDER_REPLICATE)


def jpeg(img: np.ndarray, q: int) -> np.ndarray:
    ok, buf = cv2.imencode(".jpg", img, [cv2.IMWRITE_JPEG_QUALITY, q])
    return cv2.imdecode(buf, cv2.IMREAD_COLOR)


PERTURB = {
    "rot10": lambda im: rotate(im, 10),
    "rot30": lambda im: rotate(im, 30),
    "blur": lambda im: cv2.GaussianBlur(im, (0, 0), 2),
    "dark": lambda im: (im * 0.6).astype("uint8"),
    "jpeg30": lambda im: jpeg(im, 30),
    "half": lambda im: cv2.resize(im, (max(1, im.shape[1] // 2), max(1, im.shape[0] // 2)), interpolation=cv2.INTER_AREA),
}


def perturbed_paths(name: str, crops: list[Path]) -> list[Path]:
    out = []
    for p in crops:
        dst = CACHE / name / p.parent.name / f"{p.stem}.png"
        if not dst.exists():
            dst.parent.mkdir(parents=True, exist_ok=True)
            cv2.imwrite(str(dst), PERTURB[name](cv2.imread(str(p), cv2.IMREAD_COLOR)))
        out.append(dst)
    return out


def main() -> None:
    train = C.load_train()
    crops = [t for t in train if t.kind == "crop"]
    origs = [t for t in train if t.kind == "orig"]
    po = [t.path for t in origs]
    own = np.array([{(t.restroom, t.gender): i for i, t in enumerate(origs)}[(c.restroom, c.gender)] for c in crops])
    model, preprocess, _ = C.load_clip("ViT-B-32")
    eo = C.embed_paths_cached(model, preprocess, po, "ViT-B-32-openai")
    stored = json.loads(P.OUT.read_text())["step1_full_train"]

    results, seconds = {}, {}
    for name in ["clean", *PERTURB]:
        t0 = time.perf_counter()
        pc = [c.path for c in crops] if name == "clean" else perturbed_paths(name, [c.path for c in crops])
        inliers, ncc = K.sift_matrix(pc, po)
        ec = C.embed_paths_cached(model, preprocess, pc, "ViT-B-32-openai")
        s = P.Scores(inliers=inliers, ncc=ncc, clip_qg=ec @ eo.T, hist_qg=K.hist_matrix(pc, po),
                     clip_gg=eo @ eo.T, hist_gg=K.hist_matrix(po, po))
        results[name] = {k: round(float(np.mean(P.STEP1[k](s).argmax(1) == own)), 4) for k in SCORERS}
        seconds[name] = round(time.perf_counter() - t0, 1)
        print(name, results[name], f"{seconds[name]} s", flush=True)
        if name == "clean":
            bad = {k: (results[name][k], stored[k]) for k in SCORERS if abs(results[name][k] - stored[k]) > 0.01}
            if bad:
                raise SystemExit(f"clean row does not reproduce pipeline.json step1_full_train: {bad}")

    OUT.write_text(json.dumps({
        "experiment": "step-1 accuracy (own original found among 164) for perturbed training crops",
        "perturbations": {"rot10": "rotated 10 degrees", "rot30": "rotated 30 degrees", "blur": "Gaussian blur sigma 2",
                          "dark": "60 % brightness", "jpeg30": "JPEG quality 30", "half": "resized to 50 %"},
        "scorers": SCORERS, "accuracy": results, "seconds": seconds, "device": C.device_name(),
    }, indent=2) + "\n")

    import layers_report as R  # noqa: E402  (chart style)
    import matplotlib.pyplot as plt  # noqa: E402

    names = list(results)
    x = np.arange(len(names))
    w = 0.2
    colours = [R.COLOR["clip"], R.COLOR["resnet"], "#7a7975", "#b8b6ae"]
    fig, ax = plt.subplots(figsize=(10, 4.2))
    for j, (k, label) in enumerate(SCORERS.items()):
        ax.bar(x + (j - 1.5) * w, [results[n][k] for n in names], w * 0.95, color=colours[j], label=label)
    ax.set_xticks(x, names)
    ax.set_ylim(0, 1.05)
    ax.set_ylabel("Own original found (164 crops)")
    ax.set_title("Step 1 under changed crops: which scorer survives", loc="left")
    ax.grid(axis="x", visible=False)
    ax.legend(ncols=4, loc="upper center", bbox_to_anchor=(0.5, -0.12), frameon=False, fontsize=9)
    fig.tight_layout()
    FIG.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(FIG, dpi=200)
    print("Wrote", OUT, FIG)


if __name__ == "__main__":
    main()
