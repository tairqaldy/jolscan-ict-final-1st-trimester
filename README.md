# Qarau

Computer vision inspection of public infrastructure from photos, with rules you can read. Qarau (қарау) is Kazakh for "to inspect".

Two modules, one app:

| Module | Model | What the rules decide |
|---|---|---|
| **Roads: potholes** | Fine-tuned YOLO detector finds potholes in a road photo | Repair priority and target repair time |
| **Restrooms: door signs** | CLIP predicts the gender on each sign and how alike two signs are (IOAI 2025 "Restroom" task) | Whether the signage is clear, needs review, or is confusing |

Group project for ICT1103 (Information and Communication Technologies) at QAIRU, Assignment #2, Computer Vision track.

**Live demo (demo data):** https://qarau.vercel.app. Deployed from `main` on every push (Vercel, root directory `web`).

**Status, 10 November 2026:** plan, architecture and course grounding are written. The web prototype runs both modules on demo data. Model training and the real results are in progress; see [docs/TASKS.md](docs/TASKS.md).

## Start here

1. Read [docs/PLAN.md](docs/PLAN.md): what is graded, who owns what, the timeline.
2. Find your lane in [docs/TASKS.md](docs/TASKS.md).
3. Read [CONTRIBUTING.md](CONTRIBUTING.md) before your first push.

| Document | What it answers |
|---|---|
| [docs/PLAN.md](docs/PLAN.md) | Scope, lanes, timeline, risks, definition of done |
| [docs/TASKS.md](docs/TASKS.md) | Every task, with owner and done-check |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | How the parts connect, the JSON contracts, why each choice was made |
| [docs/ML-EXPERIMENT.md](docs/ML-EXPERIMENT.md) | Pothole experiment: dataset, runs, metrics |
| [docs/ML-EXPERIMENT-RESTROOM.md](docs/ML-EXPERIMENT-RESTROOM.md) | Restroom experiment: IOAI data, runs, metrics |
| [docs/RULES.md](docs/RULES.md) | How model output becomes a decision, for both modules |
| [docs/DESIGN-BRIEF.md](docs/DESIGN-BRIEF.md) | Pages, usability requirements, design checks |
| [docs/PRESENTATION.md](docs/PRESENTATION.md) | Slides, demo script, study cards |
| [docs/COURSE-GROUNDING.md](docs/COURSE-GROUNDING.md) | Which lecture backs which decision |
| [docs/AI-USAGE-LOG.md](docs/AI-USAGE-LOG.md) | Prompt log required by the syllabus |
| [docs/CONTRIBUTION-LOG.md](docs/CONTRIBUTION-LOG.md) | Who did what |
| [docs/README.md](docs/README.md) | Map of all documents: who owns each, where to write what you did |
| [docs/worklog/](docs/worklog/README.md) | Each person's running record of their work |
| [docs/decisions/](docs/decisions/README.md) | Why each important choice was made |

## Run the web app

Needs Node 22. pnpm comes with it through Corepack:

```bash
corepack enable
```

```bash
cd web && pnpm install && pnpm dev
```

Open http://localhost:3000. It works without any model: the default provider is `mock`.

## Run the model service

Needs Python 3.12. See [api/README.md](api/README.md).

```bash
cd api && pip install -r requirements-dev.txt && uvicorn main:app --port 8000
```

Then choose the `local` provider in the web app's Settings.

## Train

- Potholes: [ml/README.md](ml/README.md), in Google Colab.
- Restrooms: [ml/restroom/README.md](ml/restroom/README.md). The zero-shot runs work on a laptop CPU; fine-tuning needs a GPU.

## Layout

```
web/           Next.js app: landing, both modules, analytics, model page, design system
api/           FastAPI service for both modules, and the Gradio demo
ml/            pothole training and export scripts, results
ml/restroom/   restroom data download, runs, export
data/          dataset cards and notes (no datasets in git)
docs/          plan, tasks, architecture, course grounding, presentation
```

## Team

| Person | Lane | GitHub |
|---|---|---|
| Tair | Web app, UX, coordination | @tairqaldy |
| Dameli | Design system and visuals | @dameo111 |
| Nazar | Restroom model | @Akanov-Kanta |
| Amina | Pothole data, model and rules | @omodotori |
| Alizhan | Serving and performance | @byahsaa |
| Roma | Research, deck, video, QA | @dyharonking |

## Data credits

- Restroom signs: IOAI 2025 Individual Contest, "Restroom Icon Matching", https://github.com/IOAI-official/IOAI-2025, CC-BY-4.0.
- Potholes: Annotated Potholes Image Dataset by Atikur Rahman Chitholian, Kaggle, ODbL (database) and DbCL (contents); dataset card in [data/README.md](data/README.md) (task D-1).

## Rules for this repository

- No datasets, no model weights, no API keys in git.
- No photos with faces or licence plates anywhere in the repo or in cloud services (syllabus data-security rule). Never photograph inside a restroom.
- Numbers on slides come from `ml/results/experiments.csv` and `ml/results/restroom/experiments.csv`, never from demo data.
