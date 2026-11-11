"""Rebuild the frozen pothole dataset potholes_yolo_v1 from the Kaggle source (task D-14).

The Colab cells that made potholes_yolo_v1.zip were never committed. This script repeats the
procedure written in data/README.md ("Annotation correction" and "YOLO dataset preparation")
and checks the result against the committed manifest, data/exports/potholes_yolo_v1/split_manifest.json:
every image's SHA-256, its split, its object count, and the per-split totals. It stops on the first
difference, so a successful run means the rebuilt folder is the frozen version, not a look-alike.

Source: the Kaggle dataset chitholian/annotated-potholes-dataset (665 JPG + 665 Pascal VOC XML).
Download it, unzip it, and pass the folder that contains annotated-images/:

    python data/make_potholes_yolo_v1.py --source data/raw/potholes-kaggle/src --out data/raw/potholes_yolo_v1

The output is git-ignored (data/raw/). Never commit it: the repository is public and some photos
show people and licence plates (data/README.md, Privacy).
"""

from __future__ import annotations

import argparse
import hashlib
import json
import random
import shutil
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
MANIFEST = ROOT / "data/exports/potholes_yolo_v1/split_manifest.json"
DATA_YAML = ROOT / "data/exports/potholes_yolo_v1/data.yaml"
SPLITS = ("train", "val", "test")

# The one correction made in potholes_corrected_v1.zip (data/README.md, "Annotation correction"):
# object 3 of img-415.xml had zero width (xmin = xmax = 273) and was removed.
CORRECTION = ("annotated-images/img-415.jpg", 2)


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def read_boxes(xml_path: Path) -> tuple[int, int, list[tuple[float, float, float, float]]]:
    """Width, height and (xmin, ymin, xmax, ymax) boxes from one Pascal VOC file."""
    root = ET.parse(xml_path).getroot()
    size = root.find("size")
    width, height = int(size.findtext("width")), int(size.findtext("height"))
    boxes = []
    for obj in root.findall("object"):
        b = obj.find("bndbox")
        boxes.append(tuple(float(b.findtext(k)) for k in ("xmin", "ymin", "xmax", "ymax")))
    return width, height, boxes


def to_yolo(box: tuple[float, float, float, float], width: int, height: int) -> str:
    """XML bounds used directly, no +/-1 shift; centre = (min + max) / 2; size = max - min."""
    xmin, ymin, xmax, ymax = box
    cx, cy = (xmin + xmax) / 2 / width, (ymin + ymax) / 2 / height
    w, h = (xmax - xmin) / width, (ymax - ymin) / height
    return f"0 {cx:.6f} {cy:.6f} {w:.6f} {h:.6f}"


def fail(message: str) -> None:
    print(f"STOP: {message}", file=sys.stderr)
    sys.exit(1)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    parser.add_argument("--source", required=True, type=Path, help="folder that contains annotated-images/")
    parser.add_argument("--out", required=True, type=Path, help="output folder (created; must be empty or missing)")
    args = parser.parse_args()

    manifest = json.loads(MANIFEST.read_text())
    expected = {row["source_image"]: row for row in manifest["images"]}
    images = sorted(p.relative_to(args.source).as_posix() for p in (args.source / "annotated-images").glob("*.jpg"))
    if sorted(expected) != images:
        fail(f"the source has {len(images)} images; the manifest lists {len(expected)} different or other names")

    # 1. The split: sort the image paths, shuffle once with seed 42 (data/README.md, D-3).
    #    Re-derive it and compare with the manifest instead of copying the manifest's answer.
    order = list(images)
    random.Random(manifest["seed"]).shuffle(order)
    n_train, n_val = manifest["image_counts"]["train"], manifest["image_counts"]["val"]
    derived = {name: "train" for name in order[:n_train]}
    derived |= {name: "val" for name in order[n_train : n_train + n_val]}
    derived |= {name: "test" for name in order[n_train + n_val :]}
    wrong = [n for n in images if derived[n] != expected[n]["split"]]
    if wrong:
        fail(f"the seed-42 shuffle does not reproduce the manifest split for {len(wrong)} images, e.g. {wrong[:3]}")

    if args.out.exists() and any(args.out.iterdir()):
        fail(f"{args.out} is not empty")
    for split in SPLITS:
        (args.out / "images" / split).mkdir(parents=True, exist_ok=True)
        (args.out / "labels" / split).mkdir(parents=True, exist_ok=True)

    counts = {s: {"images": 0, "objects": 0} for s in SPLITS}
    removed = []
    for name in images:
        row = expected[name]
        jpg = args.source / name
        if sha256(jpg) != row["image_sha256"]:
            fail(f"{name}: SHA-256 differs from the manifest")
        width, height, boxes = read_boxes(jpg.with_suffix(".xml"))
        with Image.open(jpg) as im:
            if im.size != (width, height):
                fail(f"{name}: XML size {width}x{height} but the image is {im.size[0]}x{im.size[1]}")
        if name == CORRECTION[0]:
            xmin, _, xmax, _ = boxes[CORRECTION[1]]
            if xmax - xmin != 0:
                fail(f"{name}: object {CORRECTION[1] + 1} is not the zero-width box the correction removed")
            removed.append(boxes.pop(CORRECTION[1]))
        if len(boxes) != row["objects"]:
            fail(f"{name}: {len(boxes)} objects, manifest says {row['objects']}")
        split = row["split"]
        stem = Path(name).stem
        shutil.copy2(jpg, args.out / "images" / split / f"{stem}.jpg")  # JPGs copied unchanged
        (args.out / "labels" / split / f"{stem}.txt").write_text(
            "".join(to_yolo(b, width, height) + "\n" for b in boxes)
        )
        counts[split]["images"] += 1
        counts[split]["objects"] += len(boxes)

    for split in SPLITS:
        if counts[split]["images"] != manifest["image_counts"][split]:
            fail(f"{split}: {counts[split]['images']} images, manifest says {manifest['image_counts'][split]}")
        if counts[split]["objects"] != manifest["object_counts"][split]:
            fail(f"{split}: {counts[split]['objects']} objects, manifest says {manifest['object_counts'][split]}")
    if len(removed) != 1:
        fail("the documented correction was not applied exactly once")

    shutil.copy2(DATA_YAML, args.out / "data.yaml")
    shutil.copy2(MANIFEST, args.out / "split_manifest.json")
    total = sum(c["objects"] for c in counts.values())
    print(f"Rebuilt {manifest['version']} in {args.out}: " + ", ".join(
        f"{s} {counts[s]['images']} images / {counts[s]['objects']} boxes" for s in SPLITS
    ) + f"; {total} boxes in all. Every image matched the manifest (SHA-256, split, object count).")


if __name__ == "__main__":
    main()
