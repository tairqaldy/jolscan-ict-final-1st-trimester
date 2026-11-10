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

### 10 November 2026 (evening), Nazar (draft written by the tool, Nazar to confirm and edit)

- **Tool and version:** Claude Code desktop app, Claude Sonnet 5.5 at the start of the session and Claude Opus 5.5 for the rest. (Nazar: check the model names in the app.)
- **Purpose:** take over the restroom lane: plan the experiment around the number of trained layers, build a stronger matching pipeline, run the layer experiment on a Kaggle GPU, and write up the results.
- **Key prompts (Nazar's words, translated from Russian where needed; transcript to be exported to `docs/ai-logs/nazar/`):** "We will work on the restroom side only from now on… The main criterion for us would be to show how changing the layers in the model would change how good it performs." Later: "You don't have to use CLIP, any solution is accepted. What do you think is the best?" Also: "There is a guy who solved this problem for a 100 accuracy, you can look up his solution too."
- **What it produced:** `ml/restroom/classic.py`, `pipeline.py`, `layers.py`, `layer_probe.py`, `layers_report.py`, `kaggle_run_layers.py`. The results in `ml/results/restroom/` (`pipeline.json`, `layers/`, `layers.csv`, `layer_probe.json`, `figs/`). The new sections of ML-EXPERIMENT-RESTROOM.md and ml/restroom/README.md, tasks C-11 to C-13, and the restroom ownership lines in CONTRIBUTING.md.
- **How it was verified:**
  - Every number was computed by the scripts from the IOAI data and the IOAI answer files, with the IOAI scoring rule (correct matches / queries).
  - The SIFT step was checked on all 164 training crops, where the right original is known from the labels. Its failures were inspected image by image: they are stretched crops (fixed with an affine fit) and two mislabelled restrooms.
  - The global assignment was checked against greedy matching on a synthetic case.
  - The layer experiment was smoke-tested on the laptop before the Kaggle run. All 42 Kaggle result files were checked for 50 epochs, 5 folds, 164 held-out originals and the GPU name.
  - Choices were made on training episodes, cross-validation and validation, never on test.
- **What was rejected or corrected:**
  - Counting SIFT inliers alone was dropped: it was only 0.74 on the training crops, because stock watermarks match across restrooms. The pixel check replaced it.
  - The first layer-experiment metric (full pipeline on held-out restrooms) was 1.000 for every setting, so it could not compare settings. The harder "partner among all 164 originals" metric replaced it as the main one.
  - The tool did not store or use a token pasted in the chat. Nazar saved the Kaggle token on the laptop directly, through a hidden prompt. Remove that token from the transcript before committing it.
