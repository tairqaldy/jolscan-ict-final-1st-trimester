# Working in this repository

Six people, two days. The goal is to never block each other and never break `main`.

## First time

1. Accept the GitHub invitation (check your email or https://github.com/notifications).
2. Clone:

   ```bash
   git clone https://github.com/tairqaldy/jolscan-ict-final-1st-trimester.git jolscan
   ```

3. Find your lane in [docs/TASKS.md](docs/TASKS.md).

## The workflow: claim, branch, rebase, merge yourself

Start from the pinned issue "Start here" or `docs/TASKS.md`: pick an issue without an assignee, **assign yourself to it**, then claim it as below. Tasks labelled `bare-minimum` are the ones the defense cannot do without; `optional` ones make it better.

Everyone has write access and merges their own pull requests. Two rules keep six people from overwriting each other: **claim before you start**, and **rebase on the latest `main` right before you merge**.

### 1. Claim the task first, as its own commit on `main`

Before you write anything else, mark the task as yours in [docs/TASKS.md](docs/TASKS.md), so nobody starts the same thing:

```bash
git checkout main && git pull --rebase
```

In `docs/TASKS.md`, add to the end of your task's text: `**Claimed: <your name>, <date and time>, branch <branch-name>.**` Then commit only that file and push straight to `main`:

```bash
git add docs/TASKS.md && git commit -m "claim: M-3 (Amina)" && git push
```

If the push is rejected, someone pushed in the meantime: run `git pull --rebase` and push again. If that brings a conflict on your task's line, someone else claimed it first: undo with `git rebase --abort` and `git reset --hard origin/main` (safe here: you have not started any work yet), and pick another task.

Claim commits are the only commits that go straight to `main`. Everything else goes through a pull request.

### 2. Work on a branch

```bash
git checkout -b model/m3-e0
```

Branch names: `web/...`, `design/...`, `model/...`, `restroom/...`, `data/...`, `api/...`, `docs/...`. Commit as often as you like and push the branch. Opening a **draft pull request** early is welcome: others can see where you are.

### 3. Rebase on the latest `main` right before merging

```bash
git fetch origin && git rebase origin/main
```

If there are conflicts, Git stops at each one. Open the marked files, keep **both** your change and the other person's, unless you are sure theirs is obsolete; if unsure, ask them. Then `git add <file>` and `git rebase --continue`. Run the checks for the part you touched (below), then update your branch on GitHub:

```bash
git push --force-with-lease
```

`--force-with-lease` is allowed **only on your own branch**. Never force-push `main` or someone else's branch.

Checks before you push:

- `web/`: `cd web && pnpm lint && pnpm typecheck && pnpm exec vitest run --maxWorkers=2`
- `ml/`, `api/`: `python3 -m compileall -q ml api`, plus `pytest api/` if you changed the API

### 4. Merge it yourself when CI is green

On the pull request, all checks must be green: **web**, **python** and **up-to-date**. The **up-to-date** check turns red when your branch is behind `main`; then repeat step 3. GitHub cannot block the merge on our free plan, so the rule is simple: **never merge a red pull request.**

Merge with **Rebase and merge**, or **Squash and merge** if the branch has many small commits. Merge commits are switched off. The branch is deleted automatically.

If `main` moved while you waited, GitHub shows **Update branch**: choose **Update with rebase**, wait for CI again, then merge.

After merging a change to `web/`, open https://qarau.vercel.app after about two minutes and check that your page works.

### 5. Finish the task and write it down

In the same pull request (the pull request template lists these):

- tick the task in `docs/TASKS.md` and replace the claim with a link to the result;
- add an entry to your worklog, `docs/worklog/<you>.md`: what you did, the result with a link, decisions and why, what you can explain at the defense (format in `docs/worklog/README.md`);
- update the lane document your change affects (see `docs/README.md`), and add a decision record in `docs/decisions/` if you chose between real options;
- add an entry to `docs/AI-USAGE-LOG.md` if an AI tool helped;
- write `Closes #<issue>` in the pull request description so the task issue closes on merge.

These notes are what you will use to answer your individual question at the defense, and `scripts/contribution_report.py` turns them into the contribution report at the end.

### Picking up someone else's work

Anyone may continue or improve any task, but not behind someone's back:

- If the task is claimed, ask the person in the chat. If they agree, or do not answer within two hours, re-claim it with a claim commit that says so (`claim: C-5 (Roma, taking over from Nazar)`).
- To build on someone's open pull request, branch from their branch and open your own pull request into it, or into `main` after theirs is merged. Do not push to their branch.

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

The owner reviews changes to their files. Anyone may change any file after claiming the task, but tag the owner in the pull request (for the restroom module: @Akanov-Kanta) and give them a chance to look before you merge.

## Rules

- Claim before you start, rebase before you merge, never merge red.
- Small pull requests, merged often. A pull request open for more than half a day collects conflicts.
- Never commit: datasets, `*.pt` weights, `mlruns/`, `runs/`, `.env` files, API keys. They go to the shared Drive folder. `.gitignore` blocks most of them, but check `git status` before you commit.
- Never commit or upload photos that show faces or licence plates.
- If you change a type in `docs/ARCHITECTURE.md` sections 2 or 2b, say so in the chat before merging. Web, API and ML all depend on them.
- If you used an AI tool, add an entry to `docs/AI-USAGE-LOG.md` in the same pull request. The syllabus requires it.
- Stuck for more than 30 minutes? Say so in the chat.

## If something goes wrong

- Merge conflict during a rebase: see step 3. If it gets confusing, `git rebase --abort` puts everything back as it was; then ask in the chat.
- Committed a secret: tell Tair at once. The key must be revoked, deleting the commit is not enough.
- Broke `main` (CI red on `main`, or the site down): press **Revert** on the merged pull request, merge the revert, then fix on a branch. Tell the chat.
- Pushed something other than a claim straight to `main` by mistake: tell Tair; do not try to undo it with a force-push.
