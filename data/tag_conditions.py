"""Generate data/exports/potholes_yolo_v1/condition_tags.csv  (task D-21).

Tags every val and test image in split_manifest.json with:
  - framing   : "close-up" | "dashcam" | "overhead" | "mixed"
  - lighting  : "normal" | "shadow" | "overexposed" | "low-light"
  - surface   : "asphalt" | "asphalt-wet" | "gravel" | "other"
  - occlusion : "none" | "partial"  (water, objects or people over potholes)
  - quality_note : free-text flag from the D-2 visual review (blank if none)

Framing definitions (image-relative, not camera type):
  close-up  — pothole fills > 40 % of image width; bounding boxes are large.
  dashcam   — road recedes to a horizon; bounding boxes are typically small or medium.
  overhead  — camera directly above the road surface; boxes can be any size.
  mixed     — multiple framings in one image (e.g. a wide-angle foreground and distant road).

Tag methodology
---------------
Images were not available in the repository at tagging time (datasets are gitignored).
Tags are assigned using three sources, in priority order:

  1. D-2 visual review  —  25 specific images named in data/README.md "Quality notes"
     carry condition flags derived from those reviewer observations.
  2. Object-count heuristic  —  images with many small annotations (objects ≥ 8) are
     likely dashcam views (distant road, many small potholes in one frame).
     Images with 1–2 objects and no D-2 flag are likely close-up shots.
  3. Default  —  all remaining images are "dashcam" (the most common framing in the
     Chitholian dataset, per the D-2 reviewer's observation of "close-ups versus
     dashcam views" as the dominant split).

Lighting, surface, and occlusion are assigned from D-2 observations where mentioned;
everything else defaults to "normal", "asphalt", and "none" respectively.

These tags are for analysis use only (task M-36 recall breakdown).
They were written before any model result was consulted — no detection confidence or
threshold was used in their derivation.  See data/README.md rule 2 for the blinding rule.

Usage
-----
    python data/tag_conditions.py

Output: data/exports/potholes_yolo_v1/condition_tags.csv
"""

from __future__ import annotations

import csv
import json
import re
import sys
from pathlib import Path

MANIFEST = Path("data/exports/potholes_yolo_v1/split_manifest.json")
OUT = Path("data/exports/potholes_yolo_v1/condition_tags.csv")

# ---------------------------------------------------------------------------
# D-2 visual review flags (data/README.md "Quality notes", 10 November 2026)
# Keys are bare image ids (e.g. "img-201"), values are dicts of tag overrides.
# Only val and test images end up in the CSV; train-only entries here are no-ops.
# ---------------------------------------------------------------------------
D2_FLAGS: dict[str, dict[str, str]] = {
    # Annotation ambiguity
    "img-201": {"quality_note": "ambiguous-annotation"},
    "img-18":  {"quality_note": "ambiguous-annotation"},
    "img-489": {"quality_note": "ambiguous-annotation"},
    "img-91":  {"quality_note": "ambiguous-annotation"},
    "img-642": {"quality_note": "ambiguous-annotation"},
    "img-345": {"quality_note": "ambiguous-annotation"},
    "img-525": {"quality_note": "ambiguous-annotation"},

    # Small annotated objects
    "img-9":   {"quality_note": "small-objects"},
    "img-121": {"quality_note": "small-objects"},
    "img-126": {"quality_note": "small-objects"},
    "img-30":  {"quality_note": "small-objects"},
    "img-313": {"quality_note": "small-objects"},
    "img-654": {"quality_note": "small-objects"},
    "img-412": {"quality_note": "small-objects; water", "occlusion": "partial", "surface": "asphalt-wet"},
    "img-184": {"quality_note": "small-objects"},

    # Overlapping boxes
    "img-616": {"quality_note": "overlapping-boxes"},
    "img-448": {"quality_note": "overlapping-boxes; water; watermark; vehicle-plates",
                "occlusion": "partial", "surface": "asphalt-wet"},

    # Unusual damage type
    "img-304": {"quality_note": "unusual-damage (exposed brickwork)"},
    "img-643": {"quality_note": "unusual-damage (road collapse with barriers)"},
    "img-163": {"quality_note": "unusual-damage (pavement layer loss)"},

    # Shadow
    "img-213": {"lighting": "shadow", "quality_note": "shadow obscures boundaries"},
    "img-25":  {"lighting": "shadow", "quality_note": "shadow obscures boundaries"},

    # Water
    "img-352": {"surface": "asphalt-wet", "occlusion": "partial",
                "quality_note": "water obscures boundaries"},
    "img-409": {"surface": "asphalt-wet", "occlusion": "partial",
                "quality_note": "water; watermark (Alamy)"},

    # Watermark only
    "img-565": {"quality_note": "watermark (picture-alliance/ZB)"},

    # People
    "img-193": {"quality_note": "people visible"},
}

# Framing heuristic based on annotation count (applied when no D-2 override exists):
#   objects >= 8  → dashcam (many small detections across the frame)
#   objects <= 2  → close-up (one or two prominent potholes)
#   3 <= objects <= 7 → dashcam (default for mid-range; dataset skews dashcam)
def _heuristic_framing(objects: int) -> str:
    if objects <= 2:
        return "close-up"
    return "dashcam"


FIELDNAMES = ["image_id", "split", "objects", "framing", "lighting", "surface",
              "occlusion", "quality_note"]


def _image_id(source_image: str) -> str:
    """'annotated-images/img-123.jpg'  →  'img-123'"""
    return re.sub(r"annotated-images/(img-\d+)\.jpg", r"\1", source_image)


def run() -> None:
    if not MANIFEST.exists():
        sys.exit(f"Manifest not found: {MANIFEST}")

    with MANIFEST.open() as fh:
        manifest = json.load(fh)

    rows: list[dict] = []
    for entry in manifest["images"]:
        if entry["split"] not in ("val", "test"):
            continue

        img_id = _image_id(entry["source_image"])
        objects = entry["objects"]

        # Defaults
        framing  = _heuristic_framing(objects)
        lighting = "normal"
        surface  = "asphalt"
        occlusion = "none"
        quality_note = ""

        # D-2 overrides
        flags = D2_FLAGS.get(img_id, {})
        if "framing"  in flags: framing  = flags["framing"]
        if "lighting" in flags: lighting = flags["lighting"]
        if "surface"  in flags: surface  = flags["surface"]
        if "occlusion" in flags: occlusion = flags["occlusion"]
        if "quality_note" in flags: quality_note = flags["quality_note"]

        rows.append({
            "image_id":    img_id,
            "split":       entry["split"],
            "objects":     objects,
            "framing":     framing,
            "lighting":    lighting,
            "surface":     surface,
            "occlusion":   occlusion,
            "quality_note": quality_note,
        })

    # Sort: val first, then test; within each split by image number
    def _sort_key(r: dict) -> tuple:
        split_order = {"val": 0, "test": 1}
        num = int(re.search(r"\d+", r["image_id"]).group())
        return (split_order[r["split"]], num)

    rows.sort(key=_sort_key)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    with OUT.open("w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=FIELDNAMES)
        writer.writeheader()
        writer.writerows(rows)

    val_count  = sum(1 for r in rows if r["split"] == "val")
    test_count = sum(1 for r in rows if r["split"] == "test")
    print(f"Wrote {len(rows)} rows to {OUT}  (val={val_count}, test={test_count})")
    assert val_count  == 100, f"Expected 100 val rows, got {val_count}"
    assert test_count == 100, f"Expected 100 test rows, got {test_count}"
    assert all(r["framing"] != "" for r in rows), "Every row must have a framing value"
    print("All assertions passed.")


if __name__ == "__main__":
    run()
