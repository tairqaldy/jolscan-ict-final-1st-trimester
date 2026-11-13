# Qarau

## For the instructor (five minutes)

Qarau analyses infrastructure photos with computer vision and human-readable rules. Its two modules inspect road potholes and compare restroom door signs.

- **What is real:** the [road results](ml/results/experiments.csv) (nine runs, champion E1), the [restroom results](ml/results/restroom/experiments.csv), and every analysis made with the Local or Cloud provider, which run our trained models. On the [live site](https://qarau.vercel.app) analyses use Mock by default; Settings → Cloud runs the real models on our Hugging Face Space ([api/README.md](api/README.md), Hosting). Overview screens include seeded demo history, marked "Includes demo data".
- **Evidence and methods:** [requirements and open gaps](docs/PLAN.md#1-what-is-graded), [road experiment](docs/ML-EXPERIMENT.md), [restroom experiment](docs/ML-EXPERIMENT-RESTROOM.md), [rules](docs/RULES.md), [AI-use log](docs/AI-USAGE-LOG.md), [contributions](docs/CONTRIBUTION-LOG.md), the [audit of two vision-language models](docs/research/vlm-evaluation.md), and the [documentation map](docs/README.md).
- **Run locally:** with Node 22, Python 3.12 and the prerequisites below, start the site with `cd web && pnpm install && pnpm dev` and the API in a second terminal with `cd api && pip install -r requirements-dev.txt && uvicorn main:app --port 8000`. See [API setup](api/README.md) for weights and [restroom reproduction](ml/restroom/README.md) for model results.
- **Defense:** the [runbook](docs/DEFENSE-RUNBOOK.md) has the demo steps, the morning check (`scripts/demo_check.py`) and the fallbacks; the [deck](docs/deck/SLIDES.md) is generated from the result files by `docs/deck/make_deck.py`.

## Overview

Computer vision inspection of public infrastructure from photos, with rules you can read. Qarau (қарау) is Kazakh for "to inspect".

Two modules, one app:

| Module | Model | What the rules decide |
|---|---|---|
| **Roads: potholes** | Fine-tuned YOLO detector finds potholes in a road photo | Repair priority and target repair time |
| **Restrooms: door signs** | CLIP predicts the gender on each sign and how alike two signs are (IOAI 2025 "Restroom" task) | Whether the signage is clear, needs review, or is confusing |

Group project for ICT1103 (Information and Communication Technologies) at QAIRU, Assignment #2, Computer Vision track.

**Live site:** https://qarau.vercel.app (Mock by default; Cloud runs the real models). Deployed from `main` when Tair asks for a deploy; pushes do not deploy on their own ([decision 0010](docs/decisions/0010-deploy-on-go-ahead.md); Vercel, root directory `web`). **Model service on Hugging Face:** https://huggingface.co/spaces/tairqaldy/qarau-api.

**Status, 13 November 2026:** both models are trained and served. Roads: nine YOLO runs (E0–E8), champion E1 chosen on validation, 176 of 236 test potholes found at confidence 0.40 ([operating point](ml/results/operating_point.json)). Restrooms: CLIP runs R0–R7 against the IOAI 2025 baseline. The web app runs both modules on Mock, Local (this laptop) or Cloud (Hugging Face Space); open tasks are in [docs/TASKS.md](docs/TASKS.md).

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
