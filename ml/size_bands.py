"""Reproduce image-relative pothole size bands using training-only YOLO labels."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import sklearn
from sklearn.cluster import KMeans


def read_areas(labels: Path) -> tuple[int, np.ndarray]:
    files = sorted(labels.glob("*.txt"))
    if not files:
        raise ValueError(f"No YOLO label files found in {labels}")
    areas = []
    for path in files:
        for line_no, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
            fields = line.split()
            if not fields:
                continue
            if len(fields) != 5:
                raise ValueError(f"{path}:{line_no}: expected class, x, y, width, height")
            try:
                category = int(fields[0])
                x, y, width, height = map(float, fields[1:])
            except ValueError as exc:
                raise ValueError(f"{path}:{line_no}: invalid YOLO numbers") from exc
            if category != 0 or not all(np.isfinite([x, y, width, height])) or not (0 <= x <= 1 and 0 <= y <= 1 and 0 < width <= 1 and 0 < height <= 1):
                raise ValueError(f"{path}:{line_no}: invalid normalized pothole box")
            areas.append(width * height)
    if len(areas) < 3 or len(set(areas)) < 3:
        raise ValueError("At least three distinct bounding-box areas are required")
    return len(files), np.array(areas, dtype=np.float64)


def compute(labels: Path) -> tuple[dict, np.ndarray]:
    images, areas = read_areas(labels)
    model = KMeans(n_clusters=3, random_state=42, n_init=20).fit(np.log(areas).reshape(-1, 1))
    centers = np.sort(model.cluster_centers_.ravel())
    t1, t2 = np.exp((centers[:-1] + centers[1:]) / 2)
    result = {
        "method": "KMeans on natural log of normalized bounding-box area",
        "split": "train", "images": images, "boxes": len(areas), "k": 3,
        "random_state": 42, "n_init": 20, "sklearn_version": sklearn.__version__,
        "log_cluster_centers_sorted": centers.tolist(), "area_thresholds": [float(t1), float(t2)],
        "group_counts": {"small": int(np.sum(areas < t1)), "medium": int(np.sum((areas >= t1) & (areas < t2))), "large": int(np.sum(areas >= t2))},
        "boundary_rule": "small: area < t1; medium: t1 <= area < t2; large: area >= t2",
        "limitation": "Image-relative box area, not physical pothole size",
    }
    return result, areas


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--labels", required=True, type=Path, help="YOLO labels/train folder only")
    parser.add_argument("--out", required=True, type=Path, help="output folder")
    args = parser.parse_args()
    if args.labels.name.lower() != "train":
        parser.error("--labels must point to the training labels directory named train")
    result, areas = compute(args.labels)
    args.out.mkdir(parents=True, exist_ok=True)
    (args.out / "pothole_area_clusters.json").write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    figdir = args.out / "figs"
    figdir.mkdir(exist_ok=True)
    fig, ax = plt.subplots(figsize=(8, 4.5))
    ax.hist(areas * 100, bins=60, color="#365b78", edgecolor="white")
    for i, boundary in enumerate(result["area_thresholds"], 1):
        ax.axvline(boundary * 100, color="#bd5536", linestyle="--", label=f"t{i}: {boundary * 100:.2f}%")
    ax.set(xlabel="Bounding-box area (% of image)", ylabel="Number of boxes", title="Training pothole box sizes")
    ax.legend()
    fig.tight_layout()
    fig.savefig(figdir / "pothole_area_clusters.png", dpi=160)
    plt.close(fig)
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
