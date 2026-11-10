# Working in this repository

Six people, two days. The goal is to never block each other and never break `main`.

## First time

1. Accept the GitHub invitation (check your email or https://github.com/notifications).
2. Clone:

   ```bash
   git clone https://github.com/tairqaldy/jolscan-ict-final-1st-trimester.git jolscan
   ```

3. Find your lane in [docs/TASKS.md](docs/TASKS.md).

## Every piece of work

This is the feature-branch workflow from Lecture 9.

```bash
git checkout main && git pull
```

```bash
git checkout -b model/e1-yolo26s
```

Do the work, then:

```bash
git add -A && git commit -m "Run E1 with yolo26s, log results"
```

```bash
git push -u origin model/e1-yolo26s
```

Open a pull request on GitHub. If it touches only your own lane's folder and the checks are green, merge it yourself. If it touches another lane's folder or anything in `docs/ARCHITECTURE.md`, ask that lane's owner to look first.

Branch names: `web/...`, `design/...`, `model/...`, `data/...`, `api/...`, `docs/...`.

## Who owns what

| Folder | Owner |
|---|---|
| `web/` | Tair, Dameli |
| Restroom module: `ml/restroom/`, `ml/results/restroom/`, `docs/ML-EXPERIMENT-RESTROOM.md`, `docs/RULES.md` part 2, the C lane in `docs/TASKS.md` | Nazar |
| Pothole model: `ml/train.py`, `ml/export_results.py`, `ml/results/` (except `restroom/`) | Amina (lane M in `docs/PLAN.md`) |
| `data/`, `docs/RULES.md` part 1 | Amina |
| `api/` | Alizhan |
| `docs/PRESENTATION.md`, `docs/research/` | Roma |
| everything else in `docs/` | Tair |

The restroom module is Nazar's lane. If you, or an AI agent working for you, need a change in one of its files, ask Nazar first instead of editing it.

## Rules

- Pull `main` before you start and before you open a pull request. Small pull requests, merged often.
- Never commit: datasets, `*.pt` weights, `mlruns/`, `runs/`, `.env` files, API keys. They go to the shared Drive folder. `.gitignore` blocks most of them, but check `git status` before you commit.
- Never commit or upload photos that show faces or licence plates.
- If you change a type in `docs/ARCHITECTURE.md` section 2, post it in the chat. Web and API both depend on it.
- Tick your task in `docs/TASKS.md` in the same pull request that finishes it.
- If you used an AI tool, add an entry to `docs/AI-USAGE-LOG.md` in the same pull request. The syllabus requires it.
- Stuck for more than 30 minutes? Say so in the chat.

## If something goes wrong

- Merge conflict: do not force-push. Ask in the chat, or run `git pull origin main` on your branch and fix the marked files.
- Committed a secret: tell Tair at once. The key must be revoked, deleting the commit is not enough.
- Broke `main`: revert the merge on GitHub (the "Revert" button on the pull request), then fix on a branch.
