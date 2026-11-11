"""Every IOAI door sign as a pickable sample for the web app's Compare and Match pages.

The bundled samples (public/samples/restrooms/samples.json) are 24 signs. This adds every IOAI
original that the public pages may show: 20 validation, 58 test and 160 training signs (the restrooms
hidden in export_pairs.py are left out). For each sign the mock provider gets real zero-shot CLIP
ViT-B/32 outputs, computed here with the API's prompts: the gender and its confidence, and the image
embedding (int8, server-side only), so that mock similarities between IOAI signs are real cosines.

Gender: training signs from the IOAI folders; validation and test signs labelled by eye in
ml/results/restroom/val_gallery_labels.csv and test_gallery_labels.csv (pairs from the IOAI answers;
four test signs are marked unsure). The images are the ones export_pairs.py writes; run it first.

Writes  web/data/restroom-ioai-catalogue.json    the list the picker shows (no embeddings)
        web/data/restroom-ioai-embeddings.json   int8 embeddings for the mock provider (server only)

Usage, from the repository root:
    python ml/restroom/export_pairs.py && python ml/restroom/export_catalogue.py
"""

from __future__ import annotations

import base64
import csv
import json
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
import common as C  # noqa: E402
from export_pairs import CREDIT, HIDDEN, IMG_DIR, URL  # noqa: E402

CATALOGUE = Path("web/data/restroom-ioai-catalogue.json")
EMBEDDINGS = Path("web/data/restroom-ioai-embeddings.json")
GROUPS = {"val": "IOAI validation", "test": "IOAI test", "train": "IOAI training"}
GENDER_WORD = {"male": "men", "female": "women"}


def labelled(split: str) -> list[dict]:
    """Validation or test originals with their hand labels."""
    _, gallery = C.load_split(split)
    with (C.RESULTS / f"{split}_gallery_labels.csv").open(newline="") as f:
        labels = {int(r["gallery_file"].split(".")[0]): r for r in csv.DictReader(f)}
    out = []
    for j, path in enumerate(gallery, start=1):
        if j in HIDDEN.get(split, {}):
            continue
        r = labels[j]
        out.append({"split": split, "n": j, "path": path, "gender": r["gender"], "set": f"p{r['pair_id']}",
                    "unsure": r.get("sure", "yes") == "no", "title": f"{GROUPS[split]}, pair {r['pair_id']}: {GENDER_WORD[r['gender']]}"})
    return out


def training() -> list[dict]:
    origs = [t for t in C.load_train() if t.kind == "orig"]
    out = []
    for j, t in enumerate(origs, start=1):
        if j in HIDDEN.get("train", {}):
            continue
        g = "male" if t.gender == 0 else "female"
        out.append({"split": "train", "n": j, "path": t.path, "gender": g, "set": f"r{t.restroom}", "unsure": False,
                    "title": f"{GROUPS['train']}, restroom {t.restroom}: {GENDER_WORD[g]}"})
    return out


def main() -> None:
    items = labelled("val") + labelled("test") + training()
    model, preprocess, tok = C.load_clip("ViT-B-32")
    emb = C.embed_paths_cached(model, preprocess, [it["path"] for it in items], "ViT-B-32-openai")
    proba = C.zero_shot_proba(emb, C.text_class_embeddings(model, tok))

    samples = []
    for it, e, p in zip(items, emb, proba):
        file = f"{URL}/{it['split']}/g{it['n']}.webp"
        if not (IMG_DIR / it["split"] / f"g{it['n']}.webp").exists():
            raise SystemExit(f"missing {file}: run ml/restroom/export_pairs.py first")
        k = int(p.argmax())
        samples.append({"id": f"ioai-{it['split']}-g{it['n']}", "group": it["split"], "file": file,
                        "set": f"ioai-{it['split']}-{it['set']}", "title": it["title"], "trueGender": it["gender"],
                        "genderByEye": it["split"] != "train", "genderUnsure": it["unsure"],
                        "mock": {"gender": ("male", "female")[k], "confidence": round(float(p[k]), 4)}})

    q = np.clip(np.round(emb * 127), -127, 127).astype(np.int8)
    deq = q.astype(np.float32) / 127
    deq /= np.linalg.norm(deq, axis=1, keepdims=True)
    err = float(np.abs((emb @ emb.T) - (deq @ deq.T)).max())
    # The bundled samples ioai-v<n> are the validation originals <n>: give them the same embeddings.
    ids = [s["id"] for s in samples]
    aliases = {f"ioai-v{it['n']}": f"ioai-val-g{it['n']}" for it in items if it["split"] == "val"}

    CATALOGUE.write_text(json.dumps({
        "_comment": ("Written by ml/restroom/export_catalogue.py. Every IOAI original the public pages may show, as "
                     "pickable samples. `mock` is the real zero-shot CLIP ViT-B/32 output with the API's prompts. "
                     "Validation and test genders were labelled by eye (genderUnsure marks four test signs)."),
        "credit": CREDIT, "model": "clip-vitb32-zs",
        "groups": [{"id": g, "label": label, "count": sum(s["group"] == g for s in samples)} for g, label in GROUPS.items()],
        "samples": samples,
    }, indent=1, ensure_ascii=False) + "\n")
    EMBEDDINGS.write_text(json.dumps({
        "_comment": "int8 CLIP ViT-B/32 image embeddings (x 127) of the IOAI catalogue, for the mock provider only.",
        "dim": int(q.shape[1]), "scale": 127, "maxCosineError": round(err, 4),
        "ids": ids, "aliases": aliases, "b64": base64.b64encode(q.tobytes()).decode("ascii"),
    }) + "\n")
    print(f"{len(samples)} signs:", {g: sum(s['group'] == g for s in samples) for g in GROUPS},
          f"| int8 cosine error at most {err:.4f} | {CATALOGUE.stat().st_size / 1e3:.0f} kB + {EMBEDDINGS.stat().st_size / 1e3:.0f} kB")


if __name__ == "__main__":
    main()
