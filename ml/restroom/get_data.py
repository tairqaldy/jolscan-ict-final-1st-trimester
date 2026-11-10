"""Download the IOAI 2025 "Restroom Icon Matching" data into data/raw/ioai-restroom/.

Source:  https://github.com/IOAI-official/IOAI-2025/tree/main/Individual-Contest/Restroom
Licence: CC-BY-4.0 (the licence of the whole IOAI-2025 repository). Attribution text is in
         ml/restroom/README.md and is written next to the data as ATTRIBUTION.txt.

Only the Restroom folder is fetched, file by file: one GitHub API call finds the folder's tree,
a second lists every file in it, and each file comes from raw.githubusercontent.com. Files that
already exist with the right size are skipped, so running the script twice downloads nothing.
The figures folder of the task page is skipped; the two notebooks are kept for reading only.

Usage, from the repository root:
    python ml/restroom/get_data.py
Optional: GITHUB_TOKEN=... raises the GitHub API limit if 60 calls an hour are not enough.
"""

from __future__ import annotations

import json
import os
import sys
import urllib.request
from pathlib import Path

import numpy as np

REPO = "IOAI-official/IOAI-2025"
BRANCH = "main"
FOLDER = "Individual-Contest/Restroom"
OUT = Path("data/raw/ioai-restroom")

ATTRIBUTION = """\
Restroom Icon Matching data, IOAI 2025 (Beijing, China), Individual Contest.
Source: https://github.com/IOAI-official/IOAI-2025/tree/main/Individual-Contest/Restroom
Published by the International Olympiad in Artificial Intelligence (IOAI) in the IOAI-official/IOAI-2025 repository.
Licensed under the Creative Commons Attribution 4.0 International licence (CC-BY-4.0):
https://creativecommons.org/licenses/by/4.0/
Used unchanged for a university course project (ICT1103). Files were downloaded, not modified.
"""


def api(url: str) -> dict:
    req = urllib.request.Request(url, headers={"Accept": "application/vnd.github+json"})
    token = os.getenv("GITHUB_TOKEN")
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.load(resp)


def list_files() -> list[dict]:
    parent, name = FOLDER.rsplit("/", 1)
    entries = api(f"https://api.github.com/repos/{REPO}/contents/{parent}?ref={BRANCH}")
    sha = next(e["sha"] for e in entries if e["name"] == name and e["type"] == "dir")
    # The tree of the whole repository is too large for the API, the tree of one folder is not.
    tree = api(f"https://api.github.com/repos/{REPO}/git/trees/{sha}?recursive=1")
    if tree.get("truncated"):
        raise SystemExit("GitHub returned a truncated file list. Try again later.")
    return [e for e in tree["tree"] if e["type"] == "blob" and not e["path"].startswith(("figs/", "Solution/figs/"))]


def download(files: list[dict]) -> int:
    fetched = 0
    for i, entry in enumerate(files, 1):
        rel = entry["path"]
        dest = OUT / rel
        if dest.exists() and dest.stat().st_size == entry["size"]:
            continue
        dest.parent.mkdir(parents=True, exist_ok=True)
        url = f"https://raw.githubusercontent.com/{REPO}/{BRANCH}/{FOLDER}/{urllib.request.quote(rel)}"
        with urllib.request.urlopen(url, timeout=60) as resp:
            data = resp.read()
        if len(data) != entry["size"]:
            raise SystemExit(f"Size mismatch for {rel}: got {len(data)}, expected {entry['size']}")
        tmp = dest.with_suffix(dest.suffix + ".part")
        tmp.write_bytes(data)
        tmp.replace(dest)
        fetched += 1
        if fetched % 50 == 0:
            print(f"  {i}/{len(files)} files checked, {fetched} downloaded")
    return fetched


def count(path: Path) -> int:
    return len(list(path.glob("*.png")))


def verify() -> None:
    """Fail loudly if the folder does not have the shape the task description promises."""
    expected = {
        "training_set/crop/male": 82, "training_set/crop/female": 82,
        "training_set/orig/male": 82, "training_set/orig/female": 82,
        "Solution/validation_set/query": 10, "Solution/validation_set/gallery": 20,
        "Solution/test_set/query": 30, "Solution/test_set/gallery": 60,
    }
    ok = True
    for rel, n in expected.items():
        got = count(OUT / rel)
        flag = "ok" if got == n else "WRONG"
        ok &= got == n
        print(f"  {rel:<34} {got:>3} images (expected {n}) {flag}")
    train_ids = [sorted(int(p.stem) for p in (OUT / "training_set" / k).glob("*.png"))
                 for k in ("crop/male", "crop/female", "orig/male", "orig/female")]
    same_ids = all(ids == list(range(1, 83)) for ids in train_ids)
    print(f"  training ids 1..82 in all four folders: {same_ids}")
    ok &= same_ids
    for name, n in (("answer_a.npy", 10), ("answer_b.npy", 30)):
        path = OUT / "Solution/Scoring" / name
        if not path.exists():
            print(f"  {name}: MISSING")
            ok = False
            continue
        ans = np.load(path)
        print(f"  {name}: shape {ans.shape}, dtype {ans.dtype}, values {int(ans.min())}..{int(ans.max())}")
        ok &= ans.shape == (n,)
    if not ok:
        raise SystemExit("The downloaded data does not match the expected layout.")
    print("Data verified.")


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    have_all = (OUT / "Solution/Scoring/answer_b.npy").exists() and count(OUT / "Solution/test_set/gallery") == 60 \
        and count(OUT / "training_set/orig/female") == 82
    if have_all and "--force" not in sys.argv:
        print(f"{OUT} already complete, nothing downloaded (pass --force to re-check every file).")
    else:
        files = list_files()
        print(f"{len(files)} files in {REPO}/{FOLDER} (figures skipped), {sum(f['size'] for f in files) / 1e6:.1f} MB")
        print(f"Downloaded {download(files)} new files into {OUT}")
    (OUT / "ATTRIBUTION.txt").write_text(ATTRIBUTION)
    verify()


if __name__ == "__main__":
    main()
