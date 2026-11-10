# AI usage log

The syllabus sets AI level 3 for the group project: "A prompt log is mandatory." Each substantive use is declared with the tool and version, the purpose, the key prompts, what was produced or changed, and how it was verified (Syl p.9). This file is also the evidence for CLO 7.

Everyone adds their own entries. If you used no AI tool for a task, you do not need an entry. Copy the template.

"Key prompts" means the actual prompts. Save the full transcript (Claude Code export, ChatGPT share link, screenshot) under `docs/ai-logs/<your-name>/` and link it from your entry (task X-13). Remove personal data from a transcript before you commit it.

Never paste into an AI tool: photos with faces or licence plates, other people's personal data, passwords or API keys (Syl p.9).

## Template

```
### <date>, <name>
- Tool and version:
- Purpose:
- Key prompt(s), with a link to the transcript:
- What it produced or changed:
- How I verified it, and who verified it:
- What I rejected or corrected:
```

## Entries

### 10 November 2026, Tair (draft written by the tool, Tair to confirm and edit)

- **Tool and version:** Claude Code desktop app. Lead model Claude Fable 5.2. Sub-agents on Claude Opus 5.5. (Tair: copy the exact model names from the app.)
- **Purpose:** Project planning, course-material digest, an adversarial review of the plan, repository setup and the first web prototype scaffold.
- **Key prompt (summarised, full transcript to be exported to `docs/ai-logs/tair/`):** "We have an ICT final project due in two days, team of six. Create a design system, landing page, dashboard and an interface to our computer-vision model that analyses uploaded photos by our rules. Build a prototype on mock data. Create a GitHub repo for the team. Base the architecture and explanations on the ICT course materials. Prepare a full plan with all tasks so we can work in parallel."
- **Context given to the tool:** the course files (lectures, syllabus, labs) and an export of the team's Telegram group chat, which contains first names, Telegram usernames and project messages. Tair: tell the team this was shared, and do not share the chat with AI tools again.
- **What it produced:**
  - `docs/PLAN.md`, `TASKS.md`, `ARCHITECTURE.md`, `RULES.md`, `ML-EXPERIMENT.md`, `DESIGN-BRIEF.md`, `PRESENTATION.md`, `COURSE-GROUNDING.md`.
  - `docs/research/course-digest-modules-1-5.md` and `course-digest-modules-6-9.md`: summaries of the lecture decks, syllabus and labs with page references.
  - `docs/research/datasets.md`: facts fetched from the Hugging Face dataset card and CSV, and the Scientific Data article page.
  - Starter code in `ml/` and `api/`, and the web prototype in `web/`.
- **How it was verified:**
  - Dataset facts were read from the live dataset card and the CSV itself (row count, columns, regions).
  - A second AI model reviewed the plan and the starter code against the current Ultralytics, MLflow, Gradio and FastAPI documentation and the syllabus text. It found 30 problems, among them a wrong output path that would have crashed every training run, a results merge that could not work across Colab accounts, and rules that scored ten small false alarms above one large pothole. The serious ones were fixed before the first commit, and the rest became tasks in TASKS.md.
  - The web prototype was checked with lint, type check, unit tests of the rules engine and a production build (results in the first commit message).
  - **Not verified by a person yet:** the page numbers in the course digests (task R-14). `ml/train.py`, `ml/export_results.py` and the `api/` code have not been run (tasks M-1, S-1).
- **What was rejected or corrected:** The suggested Hugging Face pothole dataset was not used for training after inspection, because it has no bounding boxes and its labels were machine-generated. The model already trained inside Roboflow is excluded from the results. All numbers in the web prototype are marked as demo data until real results replace them.
- **Decisions the team still makes itself:** roles, dataset choice and licence check, which runs to do, the final model choice, rule thresholds, and everything said at the defense.

### 10 November 2026 (afternoon), Tair (draft written by the tool, Tair to confirm and edit)

- **Tool and version:** Claude Code desktop app, Claude Opus 5.5 for the session and its sub-agents.
- **Purpose:** add a second module (restroom sign matching), rework the web app and its copy for two modules, write the restroom training and serving code, deploy the web app.
- **Key prompt (Tair's words, translated from Russian):** "Dameli will help find references later. We also want an overall option: pothole detection, yes, but also analysis and prediction comparing images of restrooms, male and female differences. Add that too, rework the content and improve it, push to git and deploy to Vercel."
- **What it produced:** the restroom module design (docs/ML-EXPERIMENT-RESTROOM.md, RULES.md part 2, ARCHITECTURE.md section 2b), the reworked web app, `ml/restroom/`, the restroom endpoints in `api/`, and updates to the plan, tasks, presentation and course grounding.
- **How it was verified:** the IOAI task, data layout, scoring rule, licence and published baseline (0.77) were read from the IOAI repository itself before anything was designed. The web app was checked with lint, type check, unit tests and a production build. Real numbers for the zero-shot restroom runs, if present in `ml/results/restroom/runs/`, were computed on Tair's laptop from the IOAI data with the IOAI answers.
- **What was corrected:** the request was understood at first as "classify restroom photos as male or female". The IOAI task is matching door-sign icons of the opposite gender from the same restroom, and its images contain no people. The module was designed around the real task, with gender prediction as one part of it.

### 10 November 2026, Amina

- **Tool and version:** Copilot SDK in VS Code; the version was not exposed in this session.
- **Purpose:** Record that Amina has started D-2 without doing the dataset review.
- **Key prompt(s), with a link to the transcript:** "Отметь в docs/TASKS.md, что я (ИМЯ) беру задачу D-2 — проверку 100 случайных изображений датасета с разметкой и описание результатов в data/README.md. Укажи рядом с задачей статус IN PROGRESS, исполнителя Амина и дату начала 2026-11-10. Галочку выполнения оставь пустой, остальные назначения не меняй. Саму D-2 пока не выполняй."
- **What it produced or changed:** Added D-2 status, executor and start date in `docs/TASKS.md`; left its completion checkbox empty.
- **How I verified it, and who verified it:** Reviewed the diff and ran `git diff --check`; no person has verified it yet.
- **What I rejected or corrected:** Did not inspect any dataset images or labels, update `data/README.md`, or change other assignments. A full session transcript was not exportable from this environment.

### 10 November 2026, Amina (D-2 report)

- **Tool and version:** Copilot SDK in VS Code; the version was not exposed in this session.
- **Purpose:** Document Amina's completed D-2 review using the observations and archive-check results she supplied.
- **Key prompt(s), with a link to the transcript:** "Document my completed D-2 dataset quality review." The request included the review method, findings, and reporting constraints. No transcript link is available.
- **What it produced or changed:** Added the D-2 review report to `data/README.md`, linked it from the completed D-2 row in `docs/TASKS.md`, and updated Amina's entry in `docs/CONTRIBUTION-LOG.md`.
- **How I verified it, and who verified it:** Checked the documentation diff and ran `git diff --check`. Amina performed the visual review; the tool did not inspect images or independently verify the findings.
- **What I rejected or corrected:** Did not infer error counts or percentages, resolve ambiguous annotations, verify image rights, or claim that the dataset is cleaned, deduplicated, licence-verified, or training-ready. No images, annotations, or model code were changed.
