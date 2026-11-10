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
