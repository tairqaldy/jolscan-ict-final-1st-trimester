"""Check relative Markdown links and list external links in tracked docs (R-49)."""
from __future__ import annotations

import argparse
import pathlib
import re
import subprocess
from urllib.parse import unquote

parser = argparse.ArgumentParser()
parser.add_argument("--external", action="store_true", help="list unique public HTTP links for manual review")
args = parser.parse_args()
files = [pathlib.Path(p) for p in subprocess.check_output(["git", "ls-files", "*.md"], text=True, encoding="utf-8").splitlines()]

def slug(heading: str) -> str:
    return re.sub(r"[^\w\- ]", "", heading.strip().lower()).replace(" ", "-")

heads = {p.resolve(): {slug(h) for h in re.findall(r"^#+ (.+)$", p.read_text(encoding="utf-8", errors="replace"), re.M)} for p in files}
errors = []
external = set()
for source in files:
    text = source.read_text(encoding="utf-8", errors="replace")
    for link in re.findall(r"\]\(([^)\s]+)\)", text):
        if link.startswith(("http://", "https://")):
            if "/issues" not in link and "localhost" not in link and "127.0.0.1" not in link:
                external.add(link)
            continue
        if link.startswith(("mailto:", "<")):
            continue
        path, _, anchor = link.partition("#")
        target = (source.parent / unquote(path)).resolve() if path else source.resolve()
        if not target.exists():
            errors.append(f"MISSING {source} {link}")
        elif anchor and target in heads and unquote(anchor) not in heads[target]:
            errors.append(f"ANCHOR? {source} {link}")
if args.external:
    print("\n".join(sorted(external)))
else:
    if errors:
        print("\n".join(errors))
        raise SystemExit(1)
