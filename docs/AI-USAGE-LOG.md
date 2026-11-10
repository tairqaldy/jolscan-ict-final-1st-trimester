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

### 10 November 2026, Alizhan (S-1, AI-assisted; personal review pending)

- **Tool and version:** Codex desktop, GPT-6.
- **Purpose:** verify the local road API with stock YOLO weights and make the check repeatable on Windows.
- **Key prompt:** "короче, я Алижан ты можешь уже начать выполнять мои таски?" See the [task-specific prompt excerpt and work log](ai-logs/alizhan/2026-11-10-s1.md); it is not a full exported transcript.
- **What it produced:** `api/test_predict.py`, `api/smoke.py`, PowerShell instructions in `api/README.md`.
- **Verification:** Python syntax compilation passes. Runtime verification is in progress and will be recorded before S-1 is marked complete. Alizhan has not yet personally reviewed the results.
- **Limits:** stock COCO weights and a generated blank image verify serving, not pothole accuracy. No model training results or personal photographs are used.

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

### 10 November 2026, Amina (D-4 report)

- **Tool and version:** Copilot SDK in VS Code; the version was not exposed in this session.
- **Purpose:** Document Amina's completed D-4 duplicate check using the methods and results she supplied.
- **Key prompt(s), with a link to the transcript:** "Document the completed D-4 duplicate check in data/README.md." The request included the check methods, findings, and reporting constraints. No transcript link is available.
- **What it produced or changed:** Added D-4 findings to `data/README.md`, marked D-4 complete with a report link in `docs/TASKS.md`, and added D-4 to Amina's contribution entry.
- **How I verified it, and who verified it:** Checked the documentation diff and ran `git diff --check`. Amina ran the duplicate checks; the tool did not read or compare images.
- **What I rejected or corrected:** Did not claim that the dataset is guaranteed duplicate-free or that annotation, licensing, or privacy concerns are resolved. No images, annotations, or model code were modified.

### 10 November 2026, Amina (XML completeness and validity report)

- **Tool and version:** Copilot SDK in VS Code; the version was not exposed in this session.
- **Purpose:** Document Amina's supplied XML completeness and structural-check results.
- **Key prompt(s), with a link to the transcript:** "Append the XML completeness and validity check to data/README.md." The request included the check results and reporting constraints. No transcript link is available.
- **What it produced or changed:** Added the XML check report to `data/README.md` and updated Amina's contribution entry.
- **How I verified it, and who verified it:** Checked the documentation diff and ran `git diff --check`. Amina supplied the check results; the tool did not inspect the dataset or XML files.
- **What I rejected or corrected:** Identified the `img-415.xml` box as the same zero-width issue already reported, not a second defect. Did not infer provenance, impute annotation values, modify the dataset, or claim visual annotation quality was validated.

### 10 November 2026, Amina (annotation correction report)

- **Tool and version:** Copilot SDK in VS Code; the version was not exposed in this session.
- **Purpose:** Document Amina's completed correction of the zero-width annotation in a separate archive.
- **Key prompt(s), with a link to the transcript:** "Update data/README.md to document a completed annotation correction." The request included the change, counts, and reporting constraints. No transcript link is available.
- **What it produced or changed:** Documented the original and corrected archive counts, the single removed object, and the remaining limitations in `data/README.md`; updated Amina's contribution entry.
- **How I verified it, and who verified it:** Checked the documentation diff and ran `git diff --check`. Amina reports reopening the corrected archive and verifying the total object count; the tool did not inspect either archive.
- **What I rejected or corrected:** Preserved the original archive's historical check results and stated that it remains unchanged. Did not claim a download link, repository copy, full cleanup, verified licensing/provenance, or training readiness. No archive or dataset files were added or modified by the tool.

### 10 November 2026, team documentation update (requester identity not specified)

- **Tool and version:** Copilot SDK in VS Code; the version was not exposed in this session.
- **Purpose:** Record the team's decision to proceed with the dataset while preserving the unresolved provenance and usage-rights warning for watermarked images.
- **Key prompt(s), with a link to the transcript:** "Add a short note to data/README.md" with the supplied team decision and instructions not to treat rights as verified or close D-1. No transcript link is available.
- **What it produced or changed:** Added the decision note to `data/README.md`.
- **How I verified it, and who verified it:** Checked the documentation diff and ran `git diff --check`.
- **What I rejected or corrected:** Did not change the existing warnings, verify licensing or provenance, or close D-1.

### 10 November 2026, Amina (D-3 claim)

- **Tool and version:** Copilot SDK in VS Code; the version was not exposed in this session.
- **Purpose:** Record Amina's claim of D-3 after creating a fresh branch from updated `main`.
- **Key prompt(s), with a link to the transcript:** "Prepare a fresh Git branch for D-3 dataset preparation." The request included branch, task-status, and validation instructions. No transcript link is available.
- **What it produced or changed:** Marked D-3 `IN PROGRESS` for Amina in `docs/TASKS.md` and updated Amina's contribution entry. No dataset conversion or split was performed.
- **How I verified it, and who verified it:** Confirmed the D-3 task was unclaimed, checked that its completion box remains unchecked and existing requirements are preserved, and ran `git diff --check`.
- **What I rejected or corrected:** Confirmed D-4 is included in `origin/main`; did not copy D-4 changes, merge any pull request, or start dataset preparation.

### 10 November 2026, Amina (D-3 preparation report)

- **Tool and version:** Copilot SDK in VS Code; the version was not exposed in this session.
- **Purpose:** Document Amina's supplied Colab preparation results for the YOLO dataset version.
- **Key prompt(s), with a link to the transcript:** "Document the D-3 dataset preparation in the repository." The request included the procedure, counts, checks, and limitations. No transcript link is available.
- **What it produced or changed:** Added the D-3 preparation report and copied the actual `data.yaml` and `split_manifest.json` from the supplied ZIP into `data/exports/potholes_yolo_v1/`. Updated the D-3 task and Amina's contribution entry.
- **How I verified it, and who verified it:** The tool checked ZIP integrity, image/label counts and pairing, label class/coordinate format, split counts, object totals, and consistency with the manifest. Amina supplied the EXIF and six-image visual-check results; the tool did not perform those checks.
- **What I rejected or corrected:** Recorded that this was a Colab export rather than Roboflow. Did not mark D-3 complete, claim Tair's acceptance, or claim privacy screening, rights clearance, or fully correct annotations. The archive and images were not added to the repository.
- **Clarification:** The ZIP was supplied as a chat attachment and inspected. Amina later confirmed that it was uploaded to the shared Drive folder; the folder contents were not independently verified.

### 10 November 2026, Amina (D-3 Drive upload confirmation)

- **Tool and version:** Copilot SDK in VS Code; the version was not exposed in this session.
- **Purpose:** Update the D-3 report with Amina's confirmation that the prepared ZIP has been uploaded to Drive.
- **Key prompt(s), with a link to the transcript:** "The YOLO dataset ZIP is already uploaded to the linked Drive folder. Its filename is potholes_yolo_v1.zip." No transcript link is available.
- **What it produced or changed:** Replaced the outdated pending-upload wording in `data/README.md`, D-3 in `docs/TASKS.md`, and Amina's contribution entry with the user-confirmed upload status.
- **How I verified it, and who verified it:** Checked the documentation diff and ran `git diff --check`. The upload status is confirmed by Amina; the Drive folder contents were not independently inspected.
- **What I rejected or corrected:** Kept D-3 in progress pending Tair's explicit acceptance of the Colab export in place of the planned Roboflow version.
