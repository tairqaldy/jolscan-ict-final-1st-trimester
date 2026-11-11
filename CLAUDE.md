# Qarau: notes for a Claude Code session

This is the public repository of the Qarau team project (ICT1103, QAIRU): a Next.js web app (`web/`), a FastAPI model service (`api/`) and the ML code (`ml/`, `data/`). Defense: Thursday 12 November 2026.

Read first: `docs/HANDOFF-DAMELI.md` (current state, priorities, workflow, merging, start prompt), then `CONTRIBUTING.md`, `docs/ARCHITECTURE.md` and the issue of the task you work on. Tasks live as GitHub issues (start at #328; bare minimum in #178) and on the board `docs/TASKS.md`.

Always:
- Claim a task before work (assign yourself, claim commit on `main`), branch from the latest `main`, open a PR with the template filled in, squash-merge only when the checks web, python and up-to-date are green.
- Never force-push to someone else's branch; bring a branch up to date by merging `main` into it.
- Never present demo numbers as real, never hand-edit `web/data/experiments.json` (it is written by `ml/export_results.py`), never commit photos with people or licence plates, datasets, weights, `.env` files or tokens.
- Do not change the JSON contracts in `docs/ARCHITECTURE.md` without updating that file and telling the team.
- Log AI help in `docs/AI-USAGE-LOG.md` (tool named as a tool), add a worklog entry in `docs/worklog/<name>.md`, tick the task in `docs/TASKS.md`.
- In `web/`: `pnpm lint`, `pnpm typecheck`, `pnpm exec vitest run --maxWorkers=2`. Check a port is free before starting a dev server, and stop what you start.
