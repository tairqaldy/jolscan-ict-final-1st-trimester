"""Export the IOAI validation, test and training sets for the web app's "IOAI task" page.

For every query crop it stores the IOAI answer, the pick of the IOAI baseline notebook (run R0:
zero-shot CLIP ViT-B/16, the second most similar original; validation and test only), and what the
final pipeline (`sift_combo_hungarian` in pipeline.py) did: the crop's original (step 1), the pair it
found (step 2), the same baseline rule on ViT-B/32, and the top step-2 candidates with their scores. The web app is a static site on
Vercel with no Python, so the page shows these stored results; they are computed here by the same
code as pipeline.py and must equal its stored predictions (checked below).

Hidden from the page (HIDDEN): one test restroom whose signs carry offensive words. It is still counted.

Reads   data/raw/ioai-restroom (get_data.py), ml/results/restroom/pipeline.json (histogram weight,
        and the predictions to check against), ml/results/restroom/runs/R0.json (the baseline's picks)
Writes  web/data/restroom-ioai-pairs.json
        web/public/samples/restrooms/ioai/<split>/q<N>.webp and g<N>.webp (long side 320 px)

Usage, from the repository root:
    python ml/restroom/export_pairs.py
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent))
import common as C  # noqa: E402
import pipeline as P  # noqa: E402

JSON_OUT = Path("web/data/restroom-ioai-pairs.json")
IMG_DIR = Path("web/public/samples/restrooms/ioai")
URL = "/samples/restrooms/ioai"
LONG_SIDE = 320
TOP_K = 5
R0 = Path("ml/results/restroom/runs/R0.json")
CHAMPION = "sift_combo_hungarian"
SPLITS = {"val": "Validation", "test": "Test", "train": "Training"}
# Gallery images not shown on the public page, with the reason. They stay in every metric (the counts
# below are over all queries); a query whose own original, pair, answer or baseline pick is hidden is not
# shown, and hidden images are left out of the other queries' rankings. Their files are not written.
HIDDEN = {
    "test": {10: "offensive wording on the sign", 47: "offensive wording on the sign"},
    # training restroom 18: photographs of real people with their faces; restroom 59: nude figures
    "train": {18: "photo of a real person with a face", 100: "photo of a real person with a face",
              59: "nude figure", 141: "nude figure"},
}
HIDDEN_NOTE = {
    "test": "1 restroom with offensive wording is not shown; it is still in every metric.",
    "train": "2 restrooms are not shown (photos of real people with faces, and nude figures); they are still in every metric.",
}
CREDIT = ("Images: IOAI 2025 Individual Contest, “Restroom Icon Matching”, by the IOAI 2025 committee, "
          "CC-BY-4.0 (https://github.com/IOAI-official/IOAI-2025/tree/main/Individual-Contest/Restroom). "
          "Resized, otherwise unchanged.")


def save_small(src: Path, dst: Path) -> None:
    img = Image.open(src)
    img = img.convert("RGBA" if img.mode in ("RGBA", "LA", "P") else "RGB")
    img.thumbnail((LONG_SIDE, LONG_SIDE), Image.LANCZOS)
    dst.parent.mkdir(parents=True, exist_ok=True)
    img.save(dst, "WEBP", quality=82, method=6)


def r0_picks(split: str, answer: np.ndarray) -> np.ndarray:
    """The IOAI baseline notebook's picks (0-based), as run R0 stored them; checked against R0's score."""
    r0 = json.loads(R0.read_text())
    picks = np.array(r0["predictions"][split]) - 1
    score = float((picks == answer).mean())
    if len(picks) != len(answer) or abs(score - r0["metrics"][f"{split}_match_top1"]) > 1e-3:
        raise SystemExit(f"{split}: R0's stored picks do not give R0's stored score; re-run run.py --run R0")
    return picks


def export_split(split: str, clip, w_hist: float, stored: list[int]) -> dict:
    """Validation or test: the champion with its global assignment, equal to pipeline.json."""
    query, gallery = C.load_split(split)
    s = P.compute_scores(query, gallery, clip)
    own, pair = P.run_approach(s, "sift_ncc", w_hist, hungarian=True)
    answer = C.load_answers(split) - 1
    if not np.array_equal(pair, np.array(stored) - 1):
        raise SystemExit(f"{split}: the recomputed pipeline differs from pipeline.json; re-run pipeline.py first")
    return write_split(split, query, gallery, s, own, pair, answer, w_hist, labels=None, query_labels=None,
                       ioai=r0_picks(split, answer), method="global assignment over the whole set (the 30/30 method)")


def export_train(clip, w_hist: float) -> dict:
    """Training: 164 crops against all 164 originals, one query at a time (no assignment across queries).

    The global assignment cannot run here: each restroom gives two queries (a male and a female crop), so
    every original is some query's own original and no partner would be left. The per-query variant is the
    one the API serves. These restrooms were used to choose the step-2 weight, so the score is optimistic."""
    train = C.load_train()
    crops = [t for t in train if t.kind == "crop"]
    origs = [t for t in train if t.kind == "orig"]
    pool = P.train_pool(clip)
    s = pool.scores
    own = P.STEP1["sift_ncc"](s).argmax(1)
    step2 = P.step2_score(s, w_hist)
    pair = np.array([next(int(g) for g in np.argsort(-step2[o]) if g != o) for o in own])
    answer = np.array([pool.orig_index[(c.restroom, 1 - c.gender)] for c in crops])
    label = lambda t: f"restroom {t.restroom}, {'male' if t.gender == 0 else 'female'}"  # noqa: E731
    return write_split("train", [c.path for c in crops], [t.path for t in origs], s, own, pair, answer, w_hist,
                       labels=[label(t) for t in origs], query_labels=[label(c) for c in crops], ioai=None,
                       method="one query at a time, as the API answers (training restrooms: optimistic)")


def write_split(split, query, gallery, s, own, pair, answer, w_hist, labels, query_labels, ioai, method) -> dict:
    base = P.ioai_baseline(s)
    step2 = P.step2_score(s, w_hist)
    hidden = HIDDEN.get(split, {})
    shown = lambda i: {int(own[i]), int(pair[i]), int(answer[i]), int(base[i])} | (set() if ioai is None else {int(ioai[i])})  # noqa: E731
    hidden_queries = [i + 1 for i in range(len(query)) if {g + 1 for g in shown(i)} & set(hidden)]
    for i, p in enumerate(query):
        dst = IMG_DIR / split / f"q{i + 1}.webp"
        if i + 1 in hidden_queries:
            dst.unlink(missing_ok=True)
        else:
            save_small(p, dst)
    for j, p in enumerate(gallery):
        dst = IMG_DIR / split / f"g{j + 1}.webp"
        if j + 1 in hidden:
            dst.unlink(missing_ok=True)
        else:
            save_small(p, dst)

    rows = []
    for i in range(len(query)):
        if i + 1 in hidden_queries:
            continue
        o = int(own[i])
        order = [int(k) for k in np.argsort(-step2[o]) if k != o and k + 1 not in hidden][:TOP_K]
        rows.append({
            "n": i + 1,
            "own": o + 1, "pair": int(pair[i]) + 1, "answer": int(answer[i]) + 1, "baseline": int(base[i]) + 1,
            "ioaiBaseline": None if ioai is None else int(ioai[i]) + 1,
            "ncc": round(float(s.ncc[i, o]), 3), "inliers": int(s.inliers[i, o]),
            "candidates": [{"g": k + 1, "score": round(float(step2[o, k]), 2)} for k in order],
        })
    return {
        "label": SPLITS[split], "queries": len(query), "gallery": len(gallery), "method": method,
        "galleryLabels": labels, "queryLabels": query_labels,
        "pipelineCorrect": int((pair == answer).sum()), "baselineCorrect": int((base == answer).sum()),
        "ioaiBaselineCorrect": None if ioai is None else int((ioai == answer).sum()),
        "hiddenGallery": sorted(hidden), "hiddenQueries": hidden_queries,
        "hiddenNote": HIDDEN_NOTE.get(split) if hidden else None,
        "rows": rows,
    }


def main() -> None:
    stored = json.loads(P.OUT.read_text())
    w_hist = stored["histogram_weight"]
    clip = C.load_clip("ViT-B-32")[:2]
    out = {
        "_comment": ("Written by ml/restroom/export_pairs.py from the IOAI data with the code of pipeline.py; "
                     "equal to the predictions stored in ml/results/restroom/pipeline.json. Gallery numbers are "
                     "1-based file numbers. Images under /samples/restrooms/ioai/<split>/ as q<n>.webp and g<n>.webp."),
        "method": CHAMPION,
        "histogramWeight": w_hist,
        "imageBase": URL,
        "credit": CREDIT,
        "ioaiBaseline": ("The IOAI baseline notebook as run R0 ran it: zero-shot CLIP ViT-B/16, the second most "
                         "similar original is the answer (ml/results/restroom/runs/R0.json). Validation and test only; "
                         "`baseline` is the same rule on ViT-B/32."),
        "splits": {**{sp: export_split(sp, clip, w_hist, stored["predictions"][sp][CHAMPION]) for sp in ("val", "test")},
                   "train": export_train(clip, w_hist)},
    }
    JSON_OUT.parent.mkdir(parents=True, exist_ok=True)
    JSON_OUT.write_text(json.dumps(out, indent=1, ensure_ascii=False) + "\n")
    size = sum(f.stat().st_size for f in IMG_DIR.rglob("*.webp"))
    print(f"Wrote {JSON_OUT} and {len(list(IMG_DIR.rglob('*.webp')))} images ({size / 1e6:.1f} MB) in {IMG_DIR}.",
          {sp: f"{v['pipelineCorrect']}/{v['queries']} (baseline {v['baselineCorrect']}, IOAI baseline {v['ioaiBaselineCorrect']})"
           for sp, v in out["splits"].items()})


if __name__ == "__main__":
    main()
