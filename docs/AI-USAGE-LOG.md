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

### 11 November 2026, Alizhan (S-20, AI-assisted; personal review pending)

- **Tool and version:** Codex desktop, GPT-6 family.
- **Purpose:** Implement service liveness, model readiness and optional startup warm-up.
- **Key prompt:** "мне нужно, чтобы ты выполнил таски, потому что ишшьюс будет ревьюить Таир". Full transcript is not exported here.
- **What it produced:** API readiness and warm-up code, fake-model tests, README and task/worklog updates.
- **Verification:** 36 API tests passed with fake backends in an isolated lightweight environment. Compile check passed. Alizhan has not yet personally reviewed this draft.
- **Limits:** No team weights were available; model initialization with real weights and end-to-end inference remain to be checked on the presentation laptop.


### 10 November 2026, Alizhan (S-1, AI-assisted; personal review pending)

- **Tool and version:** Codex desktop, GPT-6.
- **Purpose:** verify the local road API with stock YOLO weights and make the check repeatable on Windows.
- **Key prompt:** "короче, я Алижан ты можешь уже начать выполнять мои таски?" See the [task-specific prompt excerpt and work log](ai-logs/alizhan/2026-11-10-s1.md); it is not a full exported transcript.
- **What it produced:** `api/test_predict.py`, `api/smoke.py`, PowerShell instructions in `api/README.md`.
- **Verification:** Python syntax compilation and all 30 API tests passed. A real HTTP smoke check returned 200 for health and prediction with Ultralytics 8.4.208 / yolo26n on Windows, Python 3.12.10, CPU. Results are in api/README.md. Alizhan has not yet personally reviewed the results.
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

### 10 November 2026 (evening), Nazar (draft written by the tool, Nazar to confirm and edit)

- **Tool and version:** Claude Code desktop app, Claude Sonnet 5.5 at the start of the session and Claude Opus 5.5 for the rest. (Nazar: check the model names in the app.)
- **Purpose:** take over the restroom lane: plan the experiment around the number of trained layers, build a stronger matching pipeline, run the layer experiment on a Kaggle GPU, and write up the results.
- **Key prompts (Nazar's words, translated from Russian where needed; transcript to be exported to `docs/ai-logs/nazar/`):** "We will work on the restroom side only from now on… The main criterion for us would be to show how changing the layers in the model would change how good it performs." Later: "You don't have to use CLIP, any solution is accepted. What do you think is the best?" Also: "There is a guy who solved this problem for a 100 accuracy, you can look up his solution too."
- **What it produced:** `ml/restroom/classic.py`, `pipeline.py`, `layers.py`, `layer_probe.py`, `layers_report.py`, `kaggle_run_layers.py`. The results in `ml/results/restroom/` (`pipeline.json`, `layers/`, `layers.csv`, `layer_probe.json`, `figs/`). The new sections of ML-EXPERIMENT-RESTROOM.md and ml/restroom/README.md, task C-11 (the layer sweep), and the restroom ownership lines in CONTRIBUTING.md.
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
- **Later the same evening (Nazar's prompt: "find the bare minimum and let's close the tasks"):** the tool ran R4 on Nazar's laptop (C-3), exported the results to the web app (C-5), drew the failure-case figure (`failures.py`, C-6), wrote the study card (`ml/restroom/STUDY-CARD.md`, C-9), and cut R5 and the Gradio tab (C-4, C-10) as the cut order in TASKS.md allows. The failure cases are the baseline's first test failures by query number, not hand-picked; one with offensive words on the sign was left off the figure, and that is recorded in `failures.json`. The study card's answers were written by the tool from the result files: Nazar must check them and practise them.

### 10 November 2026, Amina (D-11 size clustering)

- **Tool and version:** Copilot SDK in VS Code; the version was not exposed in this session.
- **Purpose:** Integrate the supplied training-only KMeans thresholds into R2, document the method and limitations, and add boundary coverage.
- **Key prompt(s), with a link to the transcript:** "Integrate the D-11 clustering results using the attached actual JSON and PNG files." The request included the training-only procedure, group counts, and verification requirements. No transcript link is available.
- **What it produced or changed:** Copied the supplied JSON and histogram into `ml/results/`, updated `docs/RULES.md`, `data/README.md`, and the default R2 configuration/tests, and marked D-11 complete after validation.
- **How I verified it, and who verified it:** Compared the JSON's full-precision thresholds with the configured percentage units and ran the existing rules tests, including exact threshold-boundary tests. The supplied clustering results and PNG were not recomputed.
- **What I rejected or corrected:** Kept normalized fraction versus percentage units explicit, used only the training split, and did not treat the size bands as physical measurements or calibrated repair severity. D-6 remains separate; no split change or model training was done.
- **C-12 (Nazar's prompt: "do C-12"):** the tool extended `export_results.py` with row R7 (the two-step pipeline), the `pipeline` block and the `layers` table, and documented the two selection rules. **Corrected against the issue:** issue #37 asked for `served: "R7"`, but the tool read `api/restroom.py` and found that `/restroom/match` does not run the pipeline (it uses CLIP similarity and a gender filter), so it wrote `served: null` with a note instead of a claim that is not true yet. It also removed a lecture reference it had added without checking it against the course PDFs.
