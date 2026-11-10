# 0002. The Colab export potholes_yolo_v1 is the frozen pothole dataset

- **Date:** 2026-11-10
- **Decided by:** Tair, on Amina's D-3 report (PR #4, #10, #12)
- **Task / issue:** D-3
- **Status:** decided

## Context
The plan said "one Roboflow dataset version". Amina found the data is the Kaggle "Annotated Potholes Image Dataset" (665 images, Pascal VOC boxes), checked duplicates (none) and one zero-width box, and converted it to YOLO in Colab with a seeded split.

## Options
1. Re-import into Roboflow and export a version there.
2. Accept the Colab export with its committed manifest.

## Decision
Option 2: `potholes_yolo_v1`, 465 / 100 / 100 images, `random.Random(42)`, manifest with a SHA-256 per image in `data/exports/potholes_yolo_v1/`.

## Why
The manifest makes the split checkable; no duplicates were found (D-4), so a random split by image does not leak copies; it saves an hour and removes a third-party account from the pipeline.

## Consequences
Every pothole run passes `--dataset-version potholes_yolo_v1`. The conversion script still has to be committed (D-14) so the split can be regenerated. The licence of the Kaggle source is still to be recorded (D-1).
