# JolScan

Pothole detection with a repair priority. Upload a road photo, a fine-tuned YOLO detector finds the potholes, and a set of readable rules turns the detections into a severity and a target repair time.

Group project for ICT1103 (Information and Communication Technologies) at QAIRU, Assignment #2, Computer Vision track. "Jol" (жол) is Kazakh for road.

**Status, 10 November 2026:** plan, architecture and course grounding are written. The web prototype runs on demo data. The model experiment, the model service and the real results are not done yet. See [docs/TASKS.md](docs/TASKS.md).

## Start here

1. Read [docs/PLAN.md](docs/PLAN.md): what is graded, who owns what, the timeline.
2. Find your lane in [docs/TASKS.md](docs/TASKS.md).
3. Read [CONTRIBUTING.md](CONTRIBUTING.md) before your first push.

| Document | What it answers |
|---|---|
| [docs/PLAN.md](docs/PLAN.md) | Scope, lanes, timeline, risks, definition of done |
| [docs/TASKS.md](docs/TASKS.md) | Every task, with owner and done-check |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | How the parts connect, the JSON contract, why each choice was made |
| [docs/ML-EXPERIMENT.md](docs/ML-EXPERIMENT.md) | The experiment: dataset, runs, metrics |
| [docs/RULES.md](docs/RULES.md) | How detections become a priority |
| [docs/DESIGN-BRIEF.md](docs/DESIGN-BRIEF.md) | Pages, usability requirements, design checks |
| [docs/PRESENTATION.md](docs/PRESENTATION.md) | Slides, demo script, study cards |
| [docs/COURSE-GROUNDING.md](docs/COURSE-GROUNDING.md) | Which lecture backs which decision |
| [docs/AI-USAGE-LOG.md](docs/AI-USAGE-LOG.md) | Prompt log required by the syllabus |
| [docs/CONTRIBUTION-LOG.md](docs/CONTRIBUTION-LOG.md) | Who did what |

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

Needs Python 3.11 and a weights file. See [api/README.md](api/README.md).

```bash
cd api && pip install -r requirements-dev.txt && uvicorn main:app --port 8000
```

Then choose the `local` provider in the web app's Settings.

## Train

See [ml/README.md](ml/README.md). Training runs in Google Colab.

## Layout

```
web/    Next.js app: landing, dashboard, analyze, rules, analytics, design system
api/    FastAPI /predict service and the Gradio demo
ml/     training script, experiment runs, results
data/   dataset card and notes (no datasets in git)
docs/   plan, tasks, architecture, course grounding, presentation
```

## Team

| Person | Lane | GitHub |
|---|---|---|
| Tair | Web app, UX, coordination | @tairqaldy |
| Dameli | Design system and visuals | @dameo111 |
| Nazar | Model and experiments | @Akanov-Kanta |
| Amina | Data and rules | @omodotori |
| Alizhan | Serving and performance | to be added (the username `Byashaa` does not exist on GitHub) |
| Roma | Research, deck, video, QA | to be added |

## Rules for this repository

- No datasets, no model weights, no API keys in git.
- No photos with faces or licence plates anywhere in the repo or in cloud services (syllabus data-security rule).
- Numbers on slides come from `ml/results/experiments.csv`, never from demo data.
