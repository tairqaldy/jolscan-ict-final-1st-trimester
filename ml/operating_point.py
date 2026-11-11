"""Operating point of the served model on the test split at the app's counting threshold (task M-19).

The app counts a pothole only at confidence >= 0.40 (rule R1). This script predicts on every test
image at that threshold and matches predicted boxes to labelled boxes greedily, highest confidence
first, at IoU >= 0.5 (the IoU of mAP50). Each labelled box can be matched once.

Run it once, for the champion that `ml/export_results.py` names, after training is finished.
It reads test, so nothing may be chosen or tuned on its output.

    python ml/operating_point.py --weights api/weights/jolscan-e1.pt --dataset data/raw/potholes_yolo_v1
"""
import argparse
import json
from pathlib import Path

OUT = Path("ml/results/operating_point.json")
IMAGE_SUFFIXES = {".jpg", ".jpeg", ".png"}


def iou(a: list[float], b: list[float]) -> float:
    """Intersection over union of two boxes given as [x1, y1, x2, y2]."""
    ix = max(0.0, min(a[2], b[2]) - max(a[0], b[0]))
    iy = max(0.0, min(a[3], b[3]) - max(a[1], b[1]))
    inter = ix * iy
    return inter / ((a[2] - a[0]) * (a[3] - a[1]) + (b[2] - b[0]) * (b[3] - b[1]) - inter + 1e-12)


def match(preds: list[tuple[float, list[float]]], gt: list[list[float]], iou_min: float) -> dict[str, int]:
    """Greedy matching: the most confident prediction takes the best unmatched labelled box."""
    used: set[int] = set()
    tp = fp = 0
    for _, box in sorted(preds, key=lambda p: p[0], reverse=True):
        best_iou, best_j = max(((iou(box, g), j) for j, g in enumerate(gt) if j not in used), default=(0.0, -1))
        if best_iou >= iou_min:
            used.add(best_j)
            tp += 1
        else:
            fp += 1
    return {"tp": tp, "fp": fp, "fn": len(gt) - len(used)}


def read_labels(path: Path) -> list[list[float]]:
    """YOLO label lines (class cx cy w h, normalised) as normalised [x1, y1, x2, y2] boxes."""
    boxes = []
    for line in path.read_text().splitlines():
        if not line.strip():
            continue
        _, cx, cy, w, h = map(float, line.split())
        boxes.append([cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2])
    return boxes


def summarise(tp: int, fp: int, fn: int) -> dict[str, float]:
    precision = tp / max(tp + fp, 1)
    recall = tp / max(tp + fn, 1)
    f1 = 2 * precision * recall / max(precision + recall, 1e-12)
    return {"precision": round(precision, 4), "recall": round(recall, 4), "f1": round(f1, 4)}


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--weights", required=True)
    p.add_argument("--dataset", required=True, help="folder with images/test and labels/test")
    p.add_argument("--conf", type=float, default=0.40)
    p.add_argument("--iou", type=float, default=0.5)
    a = p.parse_args()

    from ultralytics import YOLO  # imported here so the matching code can be tested without it

    model, root = YOLO(a.weights), Path(a.dataset)
    tp = fp = fn = 0
    per_image = {}
    images = sorted(x for x in (root / "images/test").iterdir() if x.suffix.lower() in IMAGE_SUFFIXES)
    for img in images:
        gt = read_labels(root / "labels/test" / f"{img.stem}.txt")
        r = model.predict(str(img), conf=a.conf, verbose=False)[0]
        counts = match(list(zip(r.boxes.conf.tolist(), r.boxes.xyxyn.tolist())), gt, a.iou)
        tp, fp, fn = tp + counts["tp"], fp + counts["fp"], fn + counts["fn"]
        per_image[img.name] = counts

    stem = Path(a.weights).stem  # jolscan-e1 -> E1, the name the API reports
    out = {
        "run": stem.split("-")[-1].upper(),
        "model": stem,
        "split": "test",
        "images": len(images),
        "testBoxes": tp + fn,
        "conf": a.conf,
        "iou": a.iou,
        "tp": tp,
        "fp": fp,
        "fn": fn,
        **summarise(tp, fp, fn),
        "per_image": per_image,
    }
    OUT.write_text(json.dumps(out, indent=2) + "\n")
    print({k: v for k, v in out.items() if k != "per_image"})


if __name__ == "__main__":
    main()
