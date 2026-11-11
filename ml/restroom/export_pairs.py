"""Export the pipeline's answers on the IOAI validation and test sets for the web app's "IOAI pairs" page.

For every query crop it stores what the final pipeline (`sift_combo_hungarian` in pipeline.py) did:
the crop's original (step 1), the pair it found (step 2), the IOAI answer, the zero-shot CLIP
baseline's pick, and the top step-2 candidates with their scores. The web app is a static site on
Vercel with no Python, so the page shows these stored results; they are computed here by the same
code as pipeline.py and must equal its stored predictions (checked below).

Hidden from the page (HIDDEN): one test restroom whose signs carry offensive words. It is still counted.

Reads   data/raw/ioai-restroom (get_data.py), ml/results/restroom/pipeline.json (histogram weight,
        and the predictions to check against)
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
CHAMPION = "sift_combo_hungarian"
SPLITS = {"val": "Validation", "test": "Test"}
# Gallery images not shown on the public page, with the reason. They stay in every metric (the counts
# below are over all queries); a query whose own original, pair, answer or baseline pick is hidden is not
# shown, and hidden images are left out of the other queries' rankings. Their files are not written.
HIDDEN = {"test": {10: "offensive wording on the sign", 47: "offensive wording on the sign"}}
HIDDEN_NOTE = "1 restroom with offensive wording is not shown; it is still in every metric."
CREDIT = ("Images: IOAI 2025 Individual Contest, “Restroom Icon Matching”, by the IOAI 2025 committee, "
          "CC-BY-4.0 (https://github.com/IOAI-official/IOAI-2025/tree/main/Individual-Contest/Restroom). "
          "Resized, otherwise unchanged.")


def save_small(src: Path, dst: Path) -> None:
    img = Image.open(src)
    img = img.convert("RGBA" if img.mode in ("RGBA", "LA", "P") else "RGB")
    img.thumbnail((LONG_SIDE, LONG_SIDE), Image.LANCZOS)
    dst.parent.mkdir(parents=True, exist_ok=True)
    img.save(dst, "WEBP", quality=82, method=6)


def export_split(split: str, clip, w_hist: float, stored: list[int]) -> dict:
    query, gallery = C.load_split(split)
    s = P.compute_scores(query, gallery, clip)
    own, pair = P.run_approach(s, "sift_ncc", w_hist, hungarian=True)
    base = P.ioai_baseline(s)
    step2 = P.step2_score(s, w_hist)
    answer = C.load_answers(split) - 1
    if not np.array_equal(pair, np.array(stored) - 1):
        raise SystemExit(f"{split}: the recomputed pipeline differs from pipeline.json; re-run pipeline.py first")

    hidden = HIDDEN.get(split, {})
    hidden_queries = [i + 1 for i in range(len(query))
                      if {int(own[i]) + 1, int(pair[i]) + 1, int(answer[i]) + 1, int(base[i]) + 1} & set(hidden)]
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
            "ncc": round(float(s.ncc[i, o]), 3), "inliers": int(s.inliers[i, o]),
            "candidates": [{"g": k + 1, "score": round(float(step2[o, k]), 2)} for k in order],
        })
    return {
        "label": SPLITS[split], "queries": len(query), "gallery": len(gallery),
        "pipelineCorrect": int((pair == answer).sum()), "baselineCorrect": int((base == answer).sum()),
        "hiddenGallery": sorted(hidden), "hiddenQueries": hidden_queries,
        "hiddenNote": HIDDEN_NOTE if hidden else None,
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
        "splits": {sp: export_split(sp, clip, w_hist, stored["predictions"][sp][CHAMPION]) for sp in SPLITS},
    }
    JSON_OUT.parent.mkdir(parents=True, exist_ok=True)
    JSON_OUT.write_text(json.dumps(out, indent=1, ensure_ascii=False) + "\n")
    size = sum(f.stat().st_size for f in IMG_DIR.rglob("*.webp"))
    print(f"Wrote {JSON_OUT} and {len(list(IMG_DIR.rglob('*.webp')))} images ({size / 1e6:.1f} MB) in {IMG_DIR}.",
          {sp: f"{v['pipelineCorrect']}/{v['queries']} (baseline {v['baselineCorrect']})"
           for sp, v in out["splits"].items()})


if __name__ == "__main__":
    main()
