#!/usr/bin/env python3
"""Build docs/CONTRIBUTION-REPORT.md: who did what, from evidence.

Sources, all read-only:
  - git history of the current checkout (commits, files and lines per person)
  - merged pull requests and closed task issues (GitHub CLI `gh`, if it is installed and logged in)
  - each person's worklog in docs/worklog/<name>.md (the "Summary for the defense" and the entries)

Usage, from the repository root:
    python3 scripts/contribution_report.py            # writes docs/CONTRIBUTION-REPORT.md
    python3 scripts/contribution_report.py --stdout   # prints it instead

The output is a draft for docs/CONTRIBUTION-LOG.md: each person checks their own section and
copies what is right into their row there. Who is who is set in scripts/people.json.
"""

from __future__ import annotations

import json
import re
import shutil
import subprocess
import sys
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PEOPLE = json.loads((ROOT / "scripts" / "people.json").read_text())
REPO = "tairqaldy/jolscan-ict-final-1st-trimester"


def who(name: str, email: str, login: str | None = None) -> str | None:
    key = (login or "").lower()
    for slug, p in PEOPLE.items():
        if key and key in [x.lower() for x in p.get("github", [])]:
            return slug
        if name in p.get("git_names", []) or email.lower() in [x.lower() for x in p.get("git_emails", [])]:
            return slug
    return None


def git_stats() -> dict[str, dict]:
    out = subprocess.run(
        ["git", "log", "--no-merges", "--numstat", "--format=@@%H|%an|%ae|%ad|%s", "--date=short"],
        cwd=ROOT, capture_output=True, text=True, check=True).stdout
    stats: dict[str, dict] = defaultdict(lambda: {"commits": [], "added": 0, "removed": 0, "areas": defaultdict(int)})
    current = None
    for line in out.splitlines():
        if line.startswith("@@"):
            sha, name, email, date, subject = line[2:].split("|", 4)
            current = who(name, email) or f"unknown: {name}"
            stats[current]["commits"].append((date, sha[:7], subject))
        elif line.strip() and current:
            parts = line.split("\t")
            if len(parts) == 3:
                a, r, path = parts
                if a.isdigit() and not path.endswith((".json", ".lock", "pnpm-lock.yaml")):
                    stats[current]["added"] += int(a)
                    stats[current]["removed"] += int(r) if r.isdigit() else 0
                top = path.split("/")[0] if "/" in path else path
                if top in ("web", "ml", "api", "docs", "data"):
                    top = "/".join(path.split("/")[:2])
                stats[current]["areas"][top] += 1
    return stats


def gh_json(*args: str):
    if not shutil.which("gh"):
        return None
    p = subprocess.run(["gh", *args], capture_output=True, text=True)
    if p.returncode != 0:
        return None
    return json.loads(p.stdout)


def github_stats() -> tuple[dict[str, list], dict[str, list]]:
    prs: dict[str, list] = defaultdict(list)
    data = gh_json("pr", "list", "--repo", REPO, "--state", "merged", "--limit", "300", "--json", "number,title,author,mergedAt")
    for pr in data or []:
        slug = who("", "", pr["author"]["login"]) or f"unknown: {pr['author']['login']}"
        prs[slug].append((pr["mergedAt"][:10], pr["number"], pr["title"]))
    issues: dict[str, list] = defaultdict(list)
    data = gh_json("issue", "list", "--repo", REPO, "--state", "closed", "--label", "task", "--limit", "500", "--json", "number,title,assignees,closedAt")
    for it in data or []:
        for a in it.get("assignees", []):
            slug = who("", "", a["login"]) or f"unknown: {a['login']}"
            issues[slug].append((it["closedAt"][:10], it["number"], it["title"]))
    return prs, issues


def worklog(slug: str) -> tuple[str, int]:
    f = ROOT / "docs" / "worklog" / f"{slug}.md"
    if not f.exists():
        return "", 0
    text = f.read_text()
    m = re.search(r"## Summary for the defense\s*(.*?)\n## ", text, re.S)
    summary = (m.group(1).strip() if m else "")
    summary = "\n".join(l for l in summary.splitlines() if not l.startswith("Fill this in") and l.strip() not in ("-", ""))
    entries = len(re.findall(r"^### \d{4}-\d{2}-\d{2}", text, re.M))
    return summary, entries


def main() -> None:
    commits = git_stats()
    prs, issues = github_stats()
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    lines = ["# Contribution report (generated)", "",
             f"Generated {now} by `scripts/contribution_report.py` from git, merged pull requests, closed task issues and the worklogs. "
             "It is a draft for `docs/CONTRIBUTION-LOG.md`: check your own section and copy what is right into your row there.", ""]
    lines += ["| Person | Commits | Lines + / − (code and docs) | Merged PRs | Closed tasks | Worklog entries |", "|---|---:|---:|---:|---:|---:|"]
    for slug, p in PEOPLE.items():
        c = commits.get(slug, {"commits": [], "added": 0, "removed": 0})
        _, n = worklog(slug)
        lines.append(f"| {p['name']} | {len(c['commits'])} | {c['added']} / {c['removed']} | {len(prs.get(slug, []))} | {len(issues.get(slug, []))} | {n} |")
    lines += ["", "Line counts say little about value (a one-line threshold can matter more than a page); use them only to find what to describe."]
    for slug, p in PEOPLE.items():
        c = commits.get(slug, {"commits": [], "areas": {}})
        summary, n = worklog(slug)
        lines += ["", f"## {p['name']} ({p['lane']})", ""]
        lines += ["**Own summary (worklog):**", "", summary or "_Not written yet: fill in `docs/worklog/" + slug + ".md`._", ""]
        if c["areas"]:
            top = sorted(c["areas"].items(), key=lambda kv: -kv[1])[:6]
            lines.append("**Areas touched (files changed):** " + ", ".join(f"`{a}` ({k})" for a, k in top))
        if issues.get(slug):
            lines += ["", "**Closed tasks:**"] + [f"- #{n} {t} ({d})" for d, n, t in sorted(issues[slug])]
        if prs.get(slug):
            lines += ["", "**Merged pull requests:**"] + [f"- #{n} {t} ({d})" for d, n, t in sorted(prs[slug])]
        if c["commits"]:
            lines += ["", f"**Commits ({len(c['commits'])}):**"] + [f"- {d} `{s}` {m}" for d, s, m in sorted(c["commits"])[-25:]]
    others = [k for k in list(commits) + list(prs) + list(issues) if k.startswith("unknown:")]
    if others:
        lines += ["", "## Not mapped to a person", "", "Add these names, emails or logins to `scripts/people.json`:", ""] + [f"- {o[9:]}" for o in sorted(set(others))]
    text = "\n".join(lines) + "\n"
    if "--stdout" in sys.argv:
        print(text)
    else:
        out = ROOT / "docs" / "CONTRIBUTION-REPORT.md"
        out.write_text(text)
        print(f"Wrote {out.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
