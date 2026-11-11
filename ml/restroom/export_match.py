"""What each of our restroom models picks on Match, for every IOAI sign of the catalogue (web app).

In the web app's Match the query is a whole door sign that is not in the gallery (the app's setting,
task C-22). For each of the 238 catalogue signs this script fixes a gallery from the sign's own IOAI set
(its true partner plus up to 58 other signs of that set, seeded, at most 59 in all: the API's limit is
60) and records which sign each model picks:

    R1  zero-shot CLIP ViT-B/32: the most similar sign (no training)
    R6  the old API rule: the most similar sign of the opposite predicted gender (zero-shot prompts)
    R4  our fine-tuned CLIP (last 6 transformer blocks, ml/results/restroom/weights/R4-pair.pt): most similar
    HC  the colour histogram alone
    R7  the two-step pipeline served by the API since C-8: 0.3 z(colour) + 0.7 z(CLIP) on query + gallery

and, to show what the number of trained layers changes, the same CLIP with its last N transformer blocks
fine-tuned on the 82 training restrooms (L1 .. L12, embeddings from train_layer_models.py; L0 is R1):

    L<N>  CLIP ViT-B/32 with the last N of 12 blocks trained: the most similar sign

The fine-tuned models (R4, L1 .. L12) were trained on every training restroom, so on the training signs
they have seen the answer; only the validation and test signs show how they do on new restrooms.

Writes  web/data/restroom-ioai-match.json      per sign: each model's pick, for the Match page
        web/data/restroom-ioai-galleries.json  per sign: its gallery, for the server only

Usage, from the repository root (after export_pairs.py, export_catalogue.py and train_layer_models.py):
    python ml/restroom/export_match.py
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
import classic as K  # noqa: E402
import common as C  # noqa: E402
import pipeline as P  # noqa: E402

CAT = Path("web/data/restroom-ioai-catalogue.json")
OUT_MATCH = Path("web/data/restroom-ioai-match.json")
OUT_GAL = Path("web/data/restroom-ioai-galleries.json")
R4 = Path("ml/results/restroom/weights/R4-pair.pt")
GALLERY_MAX = 59
SEED = 42
METHODS = [
    {"id": "R1", "label": "Zero-shot CLIP", "trained": False, "detail": "CLIP ViT-B/32 as released: the most similar sign"},
    {"id": "R6", "label": "Gender filter (old API rule)", "trained": False,
     "detail": "the most similar sign whose predicted gender is opposite to the query's"},
    {"id": "R4", "label": "Fine-tuned CLIP (our R4)", "trained": True,
     "detail": "CLIP with its last 6 transformer blocks trained on the 82 training restrooms: the most similar sign"},
    {"id": "HC", "label": "Colour only", "trained": False, "detail": "the sign with the most similar colours (HSV histogram)"},
    {"id": "R7", "label": "Two-step pipeline (served)", "trained": False,
     "detail": "0.3 colour + 0.7 CLIP, z-scored, as /restroom/match does since C-8"},
]


LAYER_DIR = C.CACHE / "layer_models"
LAYER_NS = (1, 2, 4, 6, 8, 12)
LAYERS = [{"id": "L0", "blocks": 0, "label": "0 of 12 blocks trained", "trained": False,
           "detail": "zero-shot CLIP, the same as R1"}] + [
    {"id": f"L{n}", "blocks": n, "label": f"{n} of 12 blocks trained", "trained": True,
     "detail": f"CLIP with its last {n} transformer blocks fine-tuned on the 82 training restrooms"} for n in LAYER_NS]


def paths_of(samples: list[dict]) -> list[Path]:
    _, val = C.load_split("val")
    _, test = C.load_split("test")
    train = [t.path for t in C.load_train() if t.kind == "orig"]
    pools = {"val": val, "test": test, "train": train}
    return [pools[s["group"]][int(s["id"].rsplit("-g", 1)[1]) - 1] for s in samples]


def main() -> None:
    samples = json.loads(CAT.read_text())["samples"]
    ids = [s["id"] for s in samples]
    paths = paths_of(samples)
    w = json.loads(P.OUT.read_text())["histogram_weight"]

    model, pre, tok = C.load_clip("ViT-B-32")
    E = C.embed_paths_cached(model, pre, paths, "ViT-B-32-openai")
    male = C.zero_shot_proba(E, C.text_class_embeddings(model, tok))[:, 0] >= 0.5
    m4, pre4, _ = C.load_clip("ViT-B-32", weights=R4)
    E4 = C.embed_images(m4, pre4, [C.load_rgb(p) for p in paths])
    H = K.hist_matrix(paths, paths)
    clip, clip4 = E @ E.T, E4 @ E4.T
    layer_sims = {"L0": clip}
    for n in LAYER_NS:
        f = LAYER_DIR / f"clip_n{n:02d}.npy"
        if not f.exists():
            raise SystemExit(f"missing {f}: run ml/restroom/train_layer_models.py first")
        El = np.load(f)
        layer_sims[f"L{n}"] = El @ El.T

    rng = np.random.default_rng(SEED)
    galleries, picks = {}, {}
    hits = {m["id"]: {} for m in METHODS + LAYERS}
    for qi, s in enumerate(samples):
        pool = [j for j, t in enumerate(samples) if t["group"] == s["group"] and j != qi]
        partner = next(j for j in pool if samples[j]["set"] == s["set"])
        others = [j for j in pool if j != partner]
        others = list(rng.choice(others, size=min(len(others), GALLERY_MAX - 1), replace=False))
        gal = [int(j) for j in rng.permutation([partner, *others])]
        galleries[s["id"]] = gal

        g = np.array(gal)
        by_clip = g[np.argsort(-clip[qi, g], kind="stable")]
        sset = np.array([qi, *gal])
        score = w * P.zscore(H[np.ix_(sset, sset)]) + (1 - w) * P.zscore(clip[np.ix_(sset, sset)])
        row = score[0].copy()
        row[0] = -np.inf
        choice = {
            "R1": int(by_clip[0]),
            "R6": next((int(j) for j in by_clip if male[j] != male[qi]), None),
            "R4": int(g[np.argmax(clip4[qi, g])]),
            "HC": int(g[np.argmax(H[qi, g])]),
            "R7": int(sset[int(np.argmax(row))]),
            **{lid: int(g[np.argmax(S[qi, g])]) for lid, S in layer_sims.items()},
        }
        picks[s["id"]] = {m: (None if j is None else ids[j]) for m, j in choice.items()}
        for m, j in choice.items():
            hits[m].setdefault(s["group"], []).append(j == partner)

    accuracy = {m: {grp: round(float(np.mean(v)), 4) for grp, v in by_group.items()} for m, by_group in hits.items()}
    # Queries that at least one of the models with 0 .. 12 trained blocks gets wrong, most wrong first.
    layer_ids = [m["id"] for m in LAYERS]
    disagree = {}
    for s in samples:
        wrong = [lid for lid in layer_ids if picks[s["id"]][lid] != ids[next(
            j for j, t in enumerate(samples) if t["set"] == s["set"] and t["id"] != s["id"])]]
        if wrong:
            disagree.setdefault(s["group"], []).append((len(wrong), s["id"]))
    layer_disagree = {g: [i for _, i in sorted(v, key=lambda x: (-x[0], x[1]))] for g, v in disagree.items()}
    OUT_MATCH.write_text(json.dumps({
        "_comment": ("Written by ml/restroom/export_match.py. For every IOAI catalogue sign as a whole-sign Match query: "
                     "the sign each model picks from the sign's gallery (its true partner plus up to 58 signs of its IOAI "
                     "set). accuracy: share of queries per set whose pick is the true partner."),
        "galleryMax": GALLERY_MAX, "histogramWeight": w, "methods": METHODS, "layers": LAYERS,
        "trainedOn": "train", "accuracy": accuracy, "layerDisagree": layer_disagree, "picks": picks,
    }, indent=1) + "\n")
    OUT_GAL.write_text(json.dumps({
        "_comment": "Per IOAI sign: its Match gallery as indices into the catalogue's samples (export_match.py).",
        "ids": ids, "galleries": galleries,
    }) + "\n")
    print("accuracy (pick = true partner):")
    for m in METHODS + LAYERS:
        print(f"  {m['id']:3s} {m['label']:32s}", accuracy[m["id"]])
    print("signs where the layer models disagree:", {g: len(v) for g, v in layer_disagree.items()})
    print(f"{OUT_MATCH.stat().st_size / 1e3:.0f} kB + {OUT_GAL.stat().st_size / 1e3:.0f} kB")


if __name__ == "__main__":
    main()
