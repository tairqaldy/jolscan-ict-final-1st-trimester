"""Publish the model service (api/) as a Hugging Face Docker Space: the web app's cloud provider (S-7).

Run it from a machine where `hf auth login` has been done with a write token:

    .venv/bin/python scripts/deploy_space.py --space <hf-user>/qarau-api

It uploads only what the Dockerfile needs: the API code, requirements.txt, the Dockerfile and the champion
weights (api/weights/jolscan-e1.pt; weights are never committed to this repository). The Space builds the
image itself and then answers /health, /predict and /restroom/* at https://<hf-user>-qarau-api.hf.space,
the address to put into CLOUD_MODEL_API_URL on Vercel. Re-running the script uploads only what changed.

Privacy: a public Space is a server abroad. The web app keeps the cloud provider opt-in, and Settings
"Keep photos on this device only" blocks it (docs/research/privacy-and-law.md, section 2, row 3).
"""
from __future__ import annotations

import argparse
import shutil
import tempfile
from pathlib import Path

from huggingface_hub import HfApi

ROOT = Path(__file__).resolve().parent.parent
API = ROOT / "api"
CODE = ["Dockerfile", "requirements.txt", "main.py", "restroom.py", "restroom_pipeline.py", "imaging.py", "schemas.py"]
WEIGHTS = "weights/jolscan-e1.pt"

SPACE_README = """---
title: Qarau model service
emoji: 🛣️
colorFrom: yellow
colorTo: gray
sdk: docker
app_port: 8000
pinned: false
short_description: Pothole detection and restroom sign checks for Qarau
---

The model service of Qarau, the ICT1103 team project at QAIRU: a FastAPI app with a YOLO pothole detector
and OpenAI CLIP for restroom signs. It is the web app's cloud provider. Code, results and documentation:
https://github.com/tairqaldy/qarau-ict-final-1st-trimester (folder `api/`).

Endpoints: `GET /health`, `POST /predict`, `POST /restroom/compare`, `POST /restroom/match`.
Uploaded images are processed in memory and not stored.
"""


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--space", required=True, help="Space id, <hf-user>/<name>")
    args = ap.parse_args()
    if not (API / WEIGHTS).exists():
        raise SystemExit(f"api/{WEIGHTS} is missing: copy the champion weights there first (DEFENSE-RUNBOOK.md)")

    api = HfApi()
    api.create_repo(args.space, repo_type="space", space_sdk="docker", exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        stage = Path(tmp)
        for name in CODE:
            shutil.copy2(API / name, stage / name)
        (stage / "weights").mkdir()
        shutil.copy2(API / WEIGHTS, stage / WEIGHTS)
        (stage / "README.md").write_text(SPACE_README, encoding="utf-8")
        api.upload_folder(repo_id=args.space, repo_type="space", folder_path=stage,
                          commit_message="Deploy the model service from the Qarau repository")
    api.add_space_variable(args.space, "PROVIDER_NAME", "cloud")
    api.add_space_variable(args.space, "WARMUP", "1")
    owner, name = args.space.split("/")
    print(f"Space: https://huggingface.co/spaces/{args.space}")
    print(f"CLOUD_MODEL_API_URL=https://{owner.lower()}-{name.lower().replace('_', '-')}.hf.space")


if __name__ == "__main__":
    main()
