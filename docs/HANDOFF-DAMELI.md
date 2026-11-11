# Handoff for Dameli (and your Claude)

Written by Tair's session on Wednesday 11 November 2026, about 13:30 Almaty, so you can take over the design side and keep the whole project moving: pick tasks, build, review and merge PRs, and improve the app. Give this file to your Claude first (the start prompt is at the end).

**Deadlines today and tomorrow:** feature freeze **Wed 16:00**, code freeze **Wed 23:00**, defense **Thu 12 Nov** (10 minutes: 7+ talk, 2–3 questions, each person gets an individual question).

## 1. The project in one minute

Qarau is one web app with two computer-vision modules, each followed by rules the team wrote:

- **Roads:** a YOLO model finds potholes in a road photo; rules (`web/lib/rules`, `docs/RULES.md`) turn the boxes into a repair priority.
- **Restrooms:** CLIP compares two door signs (IOAI 2025 data); rules decide whether the signage is clear.

| Where | Link |
|---|---|
| Repository (public) | https://github.com/tairqaldy/qarau-ict-final-1st-trimester |
| Live site (Vercel, deployed from `main` on Tair's go-ahead, not on every push; decision 0010) | https://qarau.vercel.app |
| Start here: all tasks by collection | [#328](https://github.com/tairqaldy/qarau-ict-final-1st-trimester/issues/328) |
| Bare minimum (what the defense cannot do without) | [#178](https://github.com/tairqaldy/qarau-ict-final-1st-trimester/issues/178) |
| Team workflow | [#11](https://github.com/tairqaldy/qarau-ict-final-1st-trimester/issues/11) and [CONTRIBUTING.md](../CONTRIBUTING.md) |
| Your tracker | [#8](https://github.com/tairqaldy/qarau-ict-final-1st-trimester/issues/8) |
| The board | [docs/TASKS.md](TASKS.md) |

Key documents: [DESIGN-BRIEF.md](DESIGN-BRIEF.md) (the design direction), [ARCHITECTURE.md](ARCHITECTURE.md) (the JSON contracts between web, API and ML), [PRESENTATION.md](PRESENTATION.md) (slides and demo script), [DEFENSE-RUNBOOK.md](DEFENSE-RUNBOOK.md) (once PR #368 merges), [docs/README.md](README.md) (map of every doc).

## 2. What is true right now

**Done and on `main`:**

- **All nine pothole runs E0–E8 are trained and real** (Tair's MacBook, Apple M5 GPU, same split and seed). The champion by the selection rule is **E1** (YOLO26s): validation mAP50 0.824, within 0.01 of the best (E4, 0.828), and the highest validation recall at 0.40 (0.738). On test, read once per run: mAP50 0.8155; at confidence 0.40 it finds 178 of 236 potholes with 34 false alarms. E8 used the E0 settings because no change beat E0 by more than 0.01, and reproduced E0 exactly. Numbers: `ml/results/experiments.csv`; the model page shows the same export.
- The dataset is rebuilt exactly from Kaggle and checked against the manifest (`data/make_potholes_yolo_v1.py`), and the dataset card and licence are filled in (`data/README.md`).
- The model page follows the real selection rule (validation mAP50, recall at 0.40 as tie-break).
- "Demo data" badges follow the data on screen. Pages with the seeded sample history say "Includes demo data", and invented rows say "Demo" in the provider column once PR #366 merges.
- The real-model demo works on Tair's laptop: `scripts/demo-local.sh` serves the champion `jolscan-e1.pt`, then the web app on the **Local** provider. A test photo gave 4 potholes (4 labelled); the model takes 51–71 ms per photo on CPU once warm (`api/README.md`, S-2).
- Restroom results are real exports from Nazar's runs (R0–R7).
- Alizhan's API work is merged: pinned versions (S-23), API tests in CI (S-16), readiness and warm-up (S-20), one inference at a time (S-30), upload limits (S-31), response schemas (S-29).

**In flight (do not duplicate):**

- Tair: M-19 (operating point of the champion at 0.40), then the Drive upload of the weights and the Wi-Fi-off rehearsal (W-20). W-60, X-16, M-11, M-12 and M-13 are merged.
- Amina: D-29 (commit the k-means script), M-18 study card. Her E8 policy (PR #369) is merged and was applied as written; all runs E1–E8 are done.
- Alizhan: S-10 Lighthouse (PR #358), S-4 (PR #350) and the S-13 study card (PR #354), all being merged by Tair's session.
- Roma: the deck (R-1, R-3, R-4) and QA.

**The live site** shows the real model page, but analyses there run on **Mock**: the deployed server cannot reach a laptop's model. The real analysis runs on the presenting laptop (runbook).

## 3. Your lane: design system and visuals

You have claimed G-1, G-2 and G-3. There are about 80 open design tasks in 12 collections (#316–#327). Each task issue has exact steps, reference sources and a done-check. **Do not try to do them all.** Below is the order that helps the defense most.

### Before the feature freeze (today 16:00)

1. **[G-1](https://github.com/tairqaldy/qarau-ict-final-1st-trimester/issues/118) (bare minimum, yours):** run the app locally (section 6), then tick it with one line of evidence.
2. **[G-3](https://github.com/tairqaldy/qarau-ict-final-1st-trimester/issues/121) colour tokens + contrast (yours):** lock light and dark tokens in `web/app/tokens.css` and record the contrast. Optional warm-up: [G-46](https://github.com/tairqaldy/qarau-ict-final-1st-trimester/issues/280), three variants first.
3. **[G-4](https://github.com/tairqaldy/qarau-ict-final-1st-trimester/issues/122) / [G-43](https://github.com/tairqaldy/qarau-ict-final-1st-trimester/issues/277) fonts with Cyrillic:** Barlow and Barlow Condensed (`web/app/layout.tsx`) have **no Cyrillic subset**, so "қарау" falls back to a system font. Only a font change fixes this. Pick a pairing with Cyrillic and Kazakh letters (Google Fonts), at most two families.
4. **[G-5](https://github.com/tairqaldy/qarau-ict-final-1st-trimester/issues/128) logo, favicon, social image:** visible in every screenshot and on the first slide. You can explore first in [G-53](https://github.com/tairqaldy/qarau-ict-final-1st-trimester/issues/287), three mark directions.
5. **[G-2](https://github.com/tairqaldy/qarau-ict-final-1st-trimester/issues/120) references (yours) and [G-42](https://github.com/tairqaldy/qarau-ict-final-1st-trimester/issues/276) anti-slop checklist:** run the checklist once on the live site and fix the worst three findings.

### Before the code freeze (today 23:00)

6. **[G-13](https://github.com/tairqaldy/qarau-ict-final-1st-trimester/issues/133) slide 9, design decisions, with its 35-second script:** your slide in the talk.
7. **[G-10](https://github.com/tairqaldy/qarau-ict-final-1st-trimester/issues/123) slide template for Roma** and **[G-11](https://github.com/tairqaldy/qarau-ict-final-1st-trimester/issues/127) deck screenshots in light and dark.** Use [G-56](https://github.com/tairqaldy/qarau-ict-final-1st-trimester/issues/290), one screenshot frame, so every shot looks alike.
8. **[G-66](https://github.com/tairqaldy/qarau-ict-final-1st-trimester/issues/331) architecture diagram for slide 4.**
9. **[G-29](https://github.com/tairqaldy/qarau-ict-final-1st-trimester/issues/173) one badge set** for demo, mock and real results. The rule now lives in `web/components/app/demo-badge.tsx` and `web/lib/mock/seeded.ts`; keep its meaning, improve the look.
10. Quick consistency wins if time is left:
    - [G-49](https://github.com/tairqaldy/qarau-ict-final-1st-trimester/issues/283), three corner radii;
    - [G-59](https://github.com/tairqaldy/qarau-ict-final-1st-trimester/issues/293), motion timings into tokens;
    - [G-7](https://github.com/tairqaldy/qarau-ict-final-1st-trimester/issues/125), one chart style;
    - [G-52](https://github.com/tairqaldy/qarau-ict-final-1st-trimester/issues/286), the same style for the deck plots. `ml/plots.py` already uses `--chart-1` and `--accent`.

### Not optional for you personally

- **[G-12](https://github.com/tairqaldy/qarau-ict-final-1st-trimester/issues/119) your study card** (heuristics, contrast, charts). It is bare minimum, because every member gets an individual question at the defense. Your Claude can draft it from the issue, but **you** must be able to answer without notes.

Everything else: open [#328](https://github.com/tairqaldy/qarau-ict-final-1st-trimester/issues/328) and pick from the design collections.

### Design rules the team agreed (from the issues)

- **Iterate with references.** For each aspect:
  1. Look at 5–10 references: Refero, Mobbin, Godly, Land-book for screens; React Bits, Magic UI, shadcn/ui and Motion for components.
  2. Try 2–3 variants in code.
  3. Compare screenshots at 1440 px and 375 px, light and dark.
  4. Keep one, with a written reason in the PR.
- **Anti-slop:**
  - no purple-blue gradient heroes, no glassmorphism by default;
  - no emoji icons, no fake testimonials or logos, no lorem ipsum;
  - no invented numbers without the Demo badge;
  - no motion that delays reading;
  - at most two type families and three radii.
- **Borrowed components and licences:**
  - **React Bits** is "MIT + Commons Clause". Copy code by hand; its CLI may try to install motion 12, and the app has motion 14.
  - **Magic UI** is MIT.
  - **Aceternity UI's** licence forbids redistributing source, so **do not copy it into this public repo**. Study it only.
  - **Origin UI / coss ui** has an unclear licence; check before use.
  - Any borrowed piece: rewrite it to our tokens (`web/app/tokens.css`, `web/lib/motion.ts`), respect `prefers-reduced-motion`, no WebGL on app pages.
- **Tokens first:** colours, radii, shadows and motion live in `web/app/tokens.css` and `web/lib/motion.ts`. Components read tokens; no hard-coded colours.
- **Accessibility:** keyboard focus visible, contrast at least 4.5:1 for text, target size at least 24 px, `lang="kk"` on Kazakh words ([G-55](https://github.com/tairqaldy/qarau-ict-final-1st-trimester/issues/289)).

## 4. How to work on a task (the team workflow)

1. **Assign yourself** on the issue (right column).
2. **Claim it on `main`** with a separate small commit that adds `**Claimed: Dameli, <date time> Almaty, branch <branch>.**` to the task's row in `docs/TASKS.md`. Message: `claim: G-3 (Dameli)`. Comment "Working on this" on the issue.
3. **Branch** from the latest `main` (`design/g3-tokens`, `web/...`, `docs/...`).
4. **Build it.** Keep the code simple enough to explain at the defense.
5. **Check locally** in `web/`, one command at a time:
   - `pnpm lint`
   - `pnpm typecheck`
   - `pnpm exec vitest run --maxWorkers=2`
   - optionally `pnpm build`
6. **Docs in the same PR:**
   - tick the task in `docs/TASKS.md` (replace the claim with `**Done: Dameli, <date>. <result>.**`);
   - add an entry to `docs/worklog/dameli.md` (format in `docs/worklog/README.md`);
   - if an AI tool helped, add an entry to `docs/AI-USAGE-LOG.md` that names the tool as a tool, says what it produced and how you checked it.
7. **Open the PR** with the template filled in, `Closes #<issue>`, and screenshots for anything visual.
8. **Merge** only when the checks **web**, **python** and **up-to-date** are green. Use **squash merge**; merge commits are off on `main`.

CI checks:

- **web:** lint, typecheck, unit tests and build of `web/`.
- **python:** syntax check of `ml/` and `api/`, plus the API tests.
- **up-to-date:** fails when your branch does not contain the latest `main`. Then run `git fetch origin && git merge origin/main`, resolve conflicts, and push again.

## 5. Merging other people's PRs (Tair wants this kept moving)

Tair asked that teammates' PRs get reviewed, fixed if needed, and merged. The safe recipe:

1. **Read the diff.** Check it against:
   - `docs/ARCHITECTURE.md`: a change to a JSON contract must update that file;
   - the honesty rules (section 7);
   - the task's done-check in its issue.
2. **Bring the branch up to date without rewriting it:**
   - `git fetch origin`, check out their branch, `git merge origin/main`, then a normal `git push`.
   - **Never force-push to someone else's branch**; it is blocked anyway.
3. **Conflicts are almost always in shared logs.** Keep **both** sides in:
   - `docs/AI-USAGE-LOG.md`;
   - `docs/worklog/*.md`;
   - the rows of `docs/CONTRIBUTION-LOG.md`.

   In `docs/TASKS.md`, keep the row that is ticked or says more, and keep the linked task id.
4. **A small problem:** fix it on their branch in a separate commit, and say what you changed in a PR comment.
   **A big problem or a design decision:** request changes, with numbered steps.
5. **Wait for the three checks, then squash-merge.** Their authorship is kept.
6. **After merging:**
   - close the task issue with a one-line evidence comment, if the PR did not close it;
   - merging does not deploy (decision 0010), so check the change with `pnpm dev`; the live site changes only when Tair asks for a deploy.
7. **Only one person merges at a time.** Tair's sessions also merge. Before starting a merge round, say "I am merging #X–#Y" in the team chat or in a PR comment.

## 6. Setting up and running

```bash
git clone https://github.com/tairqaldy/qarau-ict-final-1st-trimester.git qarau
cd qarau/web
corepack enable
pnpm install
pnpm dev -p 3100       # check the port is free first: lsof -nP -iTCP:3100 -sTCP:LISTEN
```

- **Design system page:** http://localhost:3100/design shows tokens and components.
- **Mock provider:** the default. It needs no model; use it for all design work.
- **Real model on your own laptop (optional):**
  1. Get `jolscan-e1.pt` (the champion; `championModelName` in `web/data/experiments.json`) from the shared Drive (`weights/`) and put it in `api/weights/`.
  2. Install `api/requirements.txt` in a Python 3.12 virtual environment.
  3. Run `scripts/demo-local.sh` (after PR #368).
  4. Choose **Local** in Settings.

  Weights and photos never go into git.
- **Stale dev server:** after switching branches the dev server can show stale data. Stop it and start it again.
- **Settings → Reset demo data** also resets the provider to Mock.

## 7. Rules that hold for everyone

- **Honesty:**
  - Every number on screen comes from a results file or carries the Demo badge.
  - Never present demo numbers as real.
  - The test split is read once.
  - Do not hand-edit `web/data/experiments.json`: it is written by `ml/export_results.py`.
- **The repository is public:**
  - no photos with people or licence plates;
  - no datasets, weights, `.env` files, tokens or personal emails.
- **Contracts:** do not change `web/lib/types.ts` or the shapes in `docs/ARCHITECTURE.md` without updating that file and telling the team.
- **AI use:** log it honestly in `docs/AI-USAGE-LOG.md` (the course requires a prompt log). You must understand and be able to explain what you merge.
- **Language:** plain English in docs and commit messages; names or "they" for people.
- **Laptop:**
  - one dev server per project;
  - stop what you start;
  - run tests with `--maxWorkers=2`;
  - no watch modes.

## 8. Start prompt for your Claude

Paste this into Claude Code, opened in your clone of the repository:

> You are helping Dameli (GitHub `dameo111`), the designer of the Qarau team, finish the ICT1103 group project before the defense on Thursday 12 November 2026. The feature freeze is Wednesday 16:00 and the code freeze Wednesday 23:00, Almaty time. Read `docs/HANDOFF-DAMELI.md` fully first, then `docs/DESIGN-BRIEF.md`, `CONTRIBUTING.md`, `docs/ARCHITECTURE.md` and the issue of each task before you touch it.
>
> 1. Work through Dameli's design tasks in the order of section 3 of the handoff. For each task:
>    1. Assign `dameo111`, make the claim commit on `main`, comment "Working on this", and branch from the latest `main`.
>    2. Look at real references and try 2–3 variants in code. Compare screenshots at 1440 px and 375 px, light and dark, using the browser. Keep the best variant and write down why.
>    3. Run lint, typecheck and `vitest run --maxWorkers=2`.
>    4. Update `docs/TASKS.md`, `docs/worklog/dameli.md` and `docs/AI-USAGE-LOG.md`.
>    5. Open a PR with screenshots and `Closes #N`, and squash-merge it when web, python and up-to-date are green.
> 2. Between tasks, check the open PRs from teammates. Review each one against ARCHITECTURE.md and the honesty rules. Bring it up to date by merging `main` in, never by force-pushing. Fix small problems on the branch with a comment explaining the change; merge when green. Say in a PR comment before you start a merge round, because Tair's sessions also merge.
> 3. Never present demo numbers as real, and never commit photos with people, datasets, weights or secrets (the repository is public). Do not copy Aceternity UI code (its licence forbids it), and check the licence and dependencies of any borrowed component. Respect reduced motion.
> 4. Every hour, post a three-line summary for Dameli: what merged, what is in progress, what needs a decision. Stop any dev server you started before you finish.
>
> Before every design decision that changes the look of the whole app (fonts, palette, logo), show Dameli the variants and let Dameli choose.

## 9. Who does what

| Person | GitHub | Lane |
|---|---|---|
| Tair | `tairqaldy` | Web app, UX, coordination, presenting the demo |
| Dameli | `dameo111` | Design system and visuals |
| Nazar | `Akanov-Kanta` | Restroom model |
| Amina | `omodotori` | Pothole data, model and rules |
| Alizhan | `byahsaa` | API, serving, performance |
| Roma | `dyharonking` (to be confirmed, X-4) | Deck, AI audit, QA |
