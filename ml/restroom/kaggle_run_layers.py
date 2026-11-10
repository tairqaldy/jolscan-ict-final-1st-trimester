"""Kaggle GPU runner for the layer experiment (layers.py).

The team repository is private, so a Kaggle notebook cannot clone it. Instead ml/restroom/ and the
IOAI training set are uploaded as a private Kaggle dataset, attached to this script as input. The
script copies them into a repository-shaped folder, installs open_clip, runs both sweeps and puts
the per-setting JSON files in /kaggle/working/layers/, which `kaggle kernels output` downloads.

Only the training set is uploaded: the layer experiment never reads the IOAI validation or test
splits.

Push it from the laptop with a kernel-metadata.json next to a copy of this file (code_file this
file, kernel_type script, enable_gpu and enable_internet true, dataset_sources the code dataset).
"""

from __future__ import annotations

import shutil
import subprocess
import sys
from pathlib import Path

WORK = Path("/kaggle/working")
REPO = WORK / "repo"

SWEEPS = [
    ["--backbone", "clip", "--n", "0", "1", "2", "3", "4", "6", "8", "12", "--seeds", "42", "0", "1"],
    ["--backbone", "resnet", "--n", "0", "1", "2", "3", "4", "5", "--seeds", "42", "0", "1"],
]


def sh(cmd: list[str], cwd: Path | None = None) -> int:
    print("$", " ".join(cmd), flush=True)
    return subprocess.run(cmd, cwd=cwd).returncode


def main() -> None:
    # Kaggle unpacks uploaded folders in its own way, so find the code and the data separately.
    code = sorted(Path("/kaggle/input").rglob("layers.py"))
    data = sorted(p.parent for p in Path("/kaggle/input").rglob("training_set") if (p / "crop" / "male").is_dir())
    if not code or not data:
        raise SystemExit(f"code dataset not attached or incomplete: layers.py {code}, training_set {data}")
    print("code from", code[0].parent, "| data from", data[0], flush=True)
    if REPO.exists():
        shutil.rmtree(REPO)
    shutil.copytree(code[0].parent, REPO / "ml" / "restroom")
    shutil.copytree(data[0], REPO / "data" / "raw" / "ioai-restroom")
    sh([sys.executable, "-m", "pip", "install", "-q", "open_clip_torch==4.2.1"])
    sh([sys.executable, "-c", "import torch, cv2, sklearn; print('torch', torch.__version__, 'cuda', torch.cuda.is_available(), "
        "torch.cuda.get_device_name(0) if torch.cuda.is_available() else '-', 'cv2', cv2.__version__, 'sklearn', sklearn.__version__)"])
    failed = []
    for args in SWEEPS:
        if sh([sys.executable, "ml/restroom/layers.py", *args, "--skip-existing"], cwd=REPO) != 0:
            failed.append(args[1])
    out = WORK / "layers"
    out.mkdir(exist_ok=True)
    for f in (REPO / "ml/results/restroom/layers").glob("*.json"):
        shutil.copy(f, out / f.name)
    print(f"copied {len(list(out.glob('*.json')))} result files to {out}", flush=True)
    shutil.rmtree(REPO)               # keep the notebook output small: only the result files
    if failed:
        raise SystemExit(f"sweeps failed: {failed}")


if __name__ == "__main__":
    main()
