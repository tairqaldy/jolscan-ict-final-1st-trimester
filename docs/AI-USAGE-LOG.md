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

### 11 November 2026, Amina (R-22 and R-23, presentation drafts)

- **Tool and version:** Codex, GPT-6 family.
- **Purpose:** Prepare Amina's existing Roads slides as GitHub documents, preserving correct attribution and numerical evidence.
- **Key prompt:** "Update only Slides 5 and 6 in docs/deck/SLIDES.md." "Clearly distinguish my dataset, clustering, selection-policy and smoke work from Tair's full E0-E8 training." "Do not claim a timed rehearsal occurred." Full transcript archival remains outstanding under X-13.
- **What it produced or changed:** Separate Slide 5 and Slide 6 commits plus supporting worklog/AI notes. Assigned the available issues to omodotori and pushed the claim-only main commit before preparing the slides.
- **How verified:** Successfully fetched and fast-forwarded main; compared all numerical claims with the manifest, run JSONs/CSV, operating-point JSON, clustering JSON, rule configuration and unchanged deck-source index. Verified other slide sections are unchanged, script word counts 127/90, repository-result/hygiene checks and five checker tests passed; git diff --check passed.
- **What rejected or corrected:** Removed misleading single-test-read wording; retained prior review overlap and multiple evaluation-pass limitations. No attribution of Tair's full training to Amina, invented uncertainty/latency, course-page verification or rehearsal evidence. No QA, application code, generated results, generator/PPTX, unrelated slides or Alizhan's source-audit file were changed. Manual edits to the generated Markdown are explicitly requested scope and need separate coordination before future regeneration.



### 11 November 2026, Amina (M-37)

- **Tool and version:** Codex, GPT-6 family.
- **Purpose:** Complete the available why-not-accuracy documentation task using real repository counts.
- **Key prompt:** "?? ??? ???? ??? 200 ?????? ???? ??? ???? ????? ? ?????? ????" after the task-status discussion; selected M-37 (#195), checked availability, and followed the claim workflow. Full transcript archival remains pending under X-13.
- **What it produced or changed:** Focused five-sentence explanation, separate two-sentence defense answer, task/worklog/contribution updates; no model code or result changes.
- **How verified:** Read current issue and CONTRIBUTING.md after successful fetch/ff-only pull. Checked all 665 manifest entries: train/val/test 465/100/100, zero empty photos; R1 gender row sums 164/164. Repository result/hygiene checks and five existing checker tests passed; git diff --check passed.
- **What rejected or corrected:** Distinguished presence answers from localized detections and undefined background counting; no invented negative examples, course-page verification, teammate rehearsal, training or attribution of Tair's results to Amina. E1 preparation remains on its existing separate branch.



### 11 November 2026, Alizhan (R-21, AI-assisted; personal review pending)

- **Tool and version:** Codex desktop, GPT-6.
- **Purpose:** Verify slide 4 and prepare Alizhan's rehearsal notes.
- **Key prompt:** "x-7, d-29 r-21 выполни эти три таска". This is an excerpt; no full transcript is available in the repository.
- **What it produced or changed:** A rehearsal sheet explaining the diagram, script, time estimate and source of the slide's latency.
- **How it was verified:** Read slide 4 and its speaker notes from the PowerPoint and checked the deck source, API configuration and CSV. Alizhan supplied three audio recordings; their file durations were measured, but the spoken content was not independently checked.
- **What was rejected or corrected:** Distinguished recorded file durations from verified spoken content, and R1's 25.7 ms from R3's 26.9 ms.

### 11 November 2026, Alizhan (S-28, AI-assisted; personal review pending)

- **Tool and version:** Codex desktop, GPT-6.
- **Purpose:** Add a validation-only promotion gate and document the future Level 1 pipeline.
- **Key prompt:** "сделай таски, которые находятся в issues, by wed 11 nov 23:00(code freeze) и отмечай. делай перепроверку, rebase". This is an excerpt; no full transcript is available in the repository.
- **What it produced or changed:** Gate CLI, regression tests, CI integration and architecture plan.
- **How it was verified:** Tests for comparable and incomparable synthetic runs, refusal of smoke and missing metadata, test-metric independence and a real E6/E1 comparison. Alizhan has not yet personally reviewed the result.
- **What was rejected or corrected:** No test metrics used for selection; no claim that the registry, deployment or Level 1 pipeline already operates automatically.

### 11 November 2026, Alizhan (S-25, AI-assisted; personal review pending)

- **Tool and version:** Codex desktop, GPT-6.
- **Purpose:** Test and correct the model-selection boundary and verify CSV export.
- **Key prompt:** "начни выполнять остальные, которые находятся в issues и отмечены зелеными". This is an excerpt; no full transcript is available in the repository.
- **What it produced or changed:** Selection boundary fix, DictWriter export, four regression tests, CI and documentation.
- **How it was verified:** The boundary test failed on the old code, then all API and export tests passed; current exported champion stayed E1. Alizhan has not yet personally reviewed the result.
- **What was rejected or corrected:** Existing CSV quoting was already fixed by earlier work; kept the rule itself unchanged and used synthetic test fixtures only.

### 11 November 2026, Alizhan (S-24, AI-assisted; personal review pending)

- **Tool and version:** Codex desktop, GPT-6.
- **Purpose:** Validate results and repository hygiene in CI.
- **Key prompt:** "следующий раз делай ребейз, и выполняй таски, которые написаны в issues". This is an excerpt; no full transcript is available in the repository.
- **What it produced or changed:** Results validator, CI steps, regression tests and documentation.
- **How it was verified:** Validator on current results; five standard-library tests including out-of-range metrics, placeholder values and tracked forbidden/oversized files; compileall. Alizhan has not yet personally reviewed the result.
- **What was rejected or corrected:** Kept additional result fields permissible and used the existing champion selection function.

### 11 November 2026, Tair (C-13 real IOAI sample signs)

- **Tool and version:** Claude Code (Claude Opus 5.5) in the Claude desktop app.
- **Purpose:** add twelve real door signs from the IOAI validation set to the restroom samples, with real model outputs, so Compare and Match work on the Local provider.
- **Key prompt(s), with a link to the transcript:** "implement C-13 (issue #38)", with the issue's steps as the spec. Transcript kept locally.
- **What it produced or changed:** `web/public/samples/restrooms/ioai-v*.webp` (resized copies of 12 validation gallery images), the new sets, samples, presets and `similarity.pairs` in `samples.json`, the Match gallery change in `web/lib/providers/restroom-http.ts` and its test, the SVG-only guard in `web/scripts/draw-samples.mjs`, the credits, and the test updates in `web/lib/signage/engine.test.ts`.
- **How I verified it, and who verified it:** every image was opened and checked by eye (signs only, no people, true gender). The values in `samples.json` were written by a script from the saved API responses (`clip-vitb32-zs`, 66 compares, 12 matches) and checked against them again; each sign's prediction was identical in every call. Web lint, typecheck and tests, and the API tests, were run; Compare and Match were tried in the browser on Mock and Local.
- **What I rejected or corrected:** the first mismatched example (v7 + v15) passed S3, so the preset uses the median cross pair (v7 + v20) and the pull request reports both. Signs with a drawn portrait, a poster with legs, or a gender that could not be told by eye were not used. The landing page keeps the drawn pairs.

### 11 November 2026, Amina (M-4, preparation only)

- **Tool and version:** Codex, GPT-6 family.
- **Purpose:** Claim available E1 and prepare exact Colab instructions without training.
- **Key prompt:** "Check current issue #53 (M-4 / E1), task claims, experiment specification and training code. Do not start training yet." "Do not run E1 or duplicate E0 until configuration compatibility is confirmed." Full transcript archival remains outstanding under X-13.
- **What it produced:** Claim-only main commit, separate model/m4-e1 branch, docs/E1-COLAB.md and worklog. Trainer, smoke notebook and evidence unchanged.
- **How verified:** Live assignment/claims checked; fetched e0-trainer; trainer/requirements diff against it is empty. Offline AST inspection confirms effective E1/E0 differs only in weights and descriptive label; E0 JSON explicit params match BASE. Reviewed runbook code syntax and git diff --check. Colab cells and training were not executed.
- **What rejected or corrected:** No guessed E0 defaults, automatic Torch upgrade policy, smoke commit reuse, training, E0 duplication or fabricated result. Explicitly identified missing resolved E0 args/environment and CUDA/MPS difference.


### 11 November 2026, Alizhan (S-4, AI-assisted; personal review pending)

- **Tool and version:** Codex desktop, GPT-6 family.
- **Purpose:** Verify the local website-to-FastAPI road analysis flow.
- **Key prompt:** "хорошо, выпонли s4"; the user later asked "продолжай работу". The full session transcript is not exported here.
- **What it produced or changed:** Ran the local app and service and recorded partial S-4 verification in `docs/worklog/alizhan.md` and `api/README.md`.
- **Verification:** Browser observed Local health up; a test-set road photo returned HTTP 200 via the real stock YOLO, with zero detections; an intentionally fake one-box API response checked rendering and rules; the page showed an error when the API was stopped. Alizhan has not yet reviewed these observations.
- **Limits:** COCO YOLO is not a pothole detector and the fixture is not a model result. Final verification using the team-trained E0 remains outstanding. No model weights or images were committed.

### 11 November 2026, Alizhan (S-13, AI-assisted; personal review pending)

- **Tool and version:** Codex desktop, GPT-6 family.
- **Purpose:** Draft a serving and deployment study card for oral practice.
- **Key prompt:** "давай, продолжай работу" after recommending S-13 and S-3. Full transcript is not exported here.
- **What it produced:** Seven draft practice answers in `docs/PRESENTATION.md` and a worklog entry.
- **Verification:** Compared the answers to repository API routes, task instructions and architecture documentation; lecture references have not been checked against the original PDFs and Alizhan has not yet practiced or personally reviewed the answers.
- **Limits:** S-13 stays open until the teammate practice and code explanation are complete.

### 11 November 2026, Alizhan (S-10, AI-assisted; personal review pending)

- **Tool and version:** Codex desktop, GPT-6.
- **Purpose:** Measure and improve web performance and accessibility.
- **Key prompt:** "начни это все выполнять" (following a discussion of S-10 and other optimization tasks). This is an excerpt; no full transcript is available in the repository.
- **What it produced or changed:** Reduced preloaded font subsets and fixed the accessible representation of animated numbers.
- **How it was verified:** Lighthouse on the local production build before and after, lint, typecheck, 63 Vitest tests, and production build. Alizhan has not yet personally reviewed the result.
- **What was rejected or corrected:** Did not claim that a single Lighthouse run proves a speed improvement; S-10 remains in progress until a third improvement is investigated.

### 11 November 2026, Alizhan (S-29, AI-assisted; personal review pending)

- **Tool and version:** Codex desktop, GPT-6.
- **Purpose:** Declare and publish the API's response contracts.
- **Key prompt:** "выполняй issues, можешь сам выбрать, что подходит именно под мою задачу". This is an excerpt; no full transcript is available in the repository.
- **What it produced or changed:** Pydantic response schemas, route declarations, Docker copy instruction, OpenAPI snapshot and tests.
- **How it was verified:** 32 API tests, compileall and a local server check of `/docs` and `/openapi.json`; models were mocked, and Alizhan has not yet personally reviewed the result.
- **What was rejected or corrected:** Left the evolving `/health` response untyped and kept the issue open for Tair's review.

### 11 November 2026, Alizhan (S-31, AI-assisted; personal review pending)

- **Tool and version:** Codex desktop, GPT-6 family.
- **Purpose:** Improve API handling of oversized and rotated uploads.
- **Key prompt:** "начни это все выполнять" in response to recommended optimization and reliability tasks. Full transcript is not exported here.
- **What it produced:** Shared pixel limit and decompression-bomb handling, endpoint and EXIF tests, documentation and worklog.
- **Verification:** 35 API tests passed in a lightweight environment; Python compilation passed. Alizhan has not personally reviewed this entry.
- **Limits:** This improves upload robustness, not inference speed or detection accuracy.

### 11 November 2026, Alizhan (S-30, AI-assisted; personal review pending)

- **Tool and version:** Codex desktop, GPT-6 family.
- **Purpose:** Make concurrent access to the shared API model backends predictable.
- **Key prompt:** "начни это все выполнять" following recommended optimization tasks. Full transcript is not exported here.
- **What it produced:** Separate YOLO/CLIP inference locks, concurrent API tests, and documentation.
- **Verification:** 32 API tests passed with fake backends; six concurrent requests per backend were serialized, with `/health` responding during blocked road inference. Python compilation passed. Alizhan has not personally reviewed this entry.
- **Limits:** Locks are per process and can reduce same-model throughput; this does not measure performance or model accuracy. S-20 and C-8 are separate changes requiring integration review.

### 11 November 2026, Alizhan (S-20, AI-assisted; personal review pending)

- **Tool and version:** Codex desktop, GPT-6 family.
- **Purpose:** Implement service liveness, model readiness and optional startup warm-up.
- **Key prompt:** "мне нужно, чтобы ты выполнил таски, потому что ишшьюс будет ревьюить Таир". Full transcript is not exported here.
- **What it produced:** API readiness and warm-up code, fake-model tests, README and task/worklog updates.
- **Verification:** 36 API tests passed with fake backends in an isolated lightweight environment. Compile check passed. Alizhan has not yet personally reviewed this draft.
- **Limits:** No team weights were available; model initialization with real weights and end-to-end inference remain to be checked on the presentation laptop.

### 11 November 2026, Amina (M-0, final pre-run revision)

- **Tool and version:** Codex, GPT-6 family; exact model version not exposed.
- **Purpose:** Finalize selection and E8 construction before E1-E7 start; complete PR #369 on green CI.
- **Key prompts:** "Remove the special override that automatically makes E0 champion." "Champion selection always follows the general validation-only rule across eligible completed runs, including E2/E5." "Smoke runs must not participate in champion selection." Amina confirms E1-E7 have not started based on current team information and authorizes the final revision and merge. Full chat export remains outstanding under X-13.
- **What it produced or changed:** Separate rule revision, exporter smoke-flag exclusion and three offline regression tests, consistent task/worklog/contribution/decision records, and updated PR #369.
- **How I verified it, and who verified it:** The assistant compared the documentation to `TIE = 0.01`, validation-only champion inputs and `RULES_CONF = 0.40`; three `python -m unittest ml.test_export_results` tests, compilation of ml/api and `git diff --check` passed. Amina supplied the pre-run team confirmation and final policy decision. Fresh required CI is checked before merge.
- **What I rejected or corrected:** Superseded the earlier E0-champion override rather than implementing it. Preserved the notebook change and previous branches in an isolated worktree. No training, test-metric selection, backdating, dataset changes or claim of independent chat/run verification.

### 11 November 2026, Alizhan (S-3, AI-assisted; personal review pending)

- **Tool and version:** Codex desktop, GPT-6 family.
- **Purpose:** Check the existing road API tests against S-3, verify validation errors and keep tests offline.
- **Key prompt:** "давай, продолжай работу" following the recommendation to do S-13 and check S-3. Full transcript is not exported here.
- **What it produced:** More specific validation assertions, a fake missing-weights loader, and documentation.
- **Verification:** 30 API tests passed without model packages or weights, and compileall passed. Alizhan has not yet personally reviewed this entry.
- **Limits:** Fake-model tests check API behavior and do not measure detection accuracy.

### 11 November 2026, Alizhan (S-16, AI-assisted; personal review pending)

- **Tool and version:** Codex desktop, GPT-6 family.
- **Purpose:** Add API tests to GitHub Actions and verify that an intentionally failing test causes a red check.
- **Key prompts:** "тогда начни выполнять таски, которые можно сделать сейчас" and "мне нужно, чтобы ты выполнил таски, потому что ишшьюс будет ревьюить Таир". The full transcript is not exported here.
- **What it produced:** Python CI steps and S-16 task and worklog updates.
- **Verification:** GitHub Actions run 42901513219 showed 30 passing tests and one intentional failure, and the temporary test was removed. The normal run's result is available in the PR checks. Alizhan has not personally reviewed this draft.
- **Limits:** Only lightweight fake-model tests run; this does not validate actual YOLO or CLIP inference.

### 11 November 2026, Alizhan (S-23, AI-assisted; personal review pending)

- **Tool and version:** Codex desktop, GPT-6 family.
- **Purpose:** Pin the API's direct dependencies and test a compatible Python version.
- **Key prompt:** "покажи мне саму шпаргалку и продолжай выполнять остальные таски, которые назначены мне". Full transcript is not exported here.
- **What it produced:** Direct dependency pins, Python 3.12 alignment, a proposed decision record, README and worklog.
- **Verification:** A fresh Windows Python 3.12 environment and a clean Linux Python 3.12 Actions job installed the pins and passed 30 API tests. Windows Uvicorn `/health` returned 200; Linux used TestClient. Alizhan has not yet personally reviewed this entry.
- **Limits:** The Docker image was not built, real models were not tested in the new environment, and Tair and Nazar have not yet approved the version choice.

### 11 November 2026, Amina (M-1, completed)

- **Tool and version:** Copilot SDK in VS Code; the version was not exposed in this session.
- **Purpose:** Prepare the M-1 trainer and a reproducible Colab one-epoch smoke workflow.
- **Key prompt(s), with a link to the transcript:** "Work on M-1 (#50): make train.py run end to end with a one-epoch smoke test" and "Назначила #50 на omodotori, перепроверь и продолжай M-1 по правилам проекта." A later clarification chose `validation_only` when asked how to resolve the test-split conflict. No transcript link is available.
- **What it produced or changed:** Updated `ml/train.py`, added isolated tests and `ml/colab_runner.ipynb`, documented the validation-only policy, and corrected the notebook to use the repository's explicit `mlflow.db` tracking URI with safe handling for a missing experiment or empty results. After Tair accepted validation-only smoke for M-1, updated the task and experiment status records to reflect completion without conflating smoke with the full E0 baseline.
- **How I verified it, and who verified it:** Three `python -m unittest ml.test_train` tests and `python -m compileall -q ml api` passed; notebook JSON and code cells were validated locally. Amina supplied the completed Colab smoke evidence. The tool verified the ZIP integrity and inspected the actual JSON/CSV; the JSON records one epoch, Tesla T4, the expected trainer commit and validation-only metrics. The reported MLflow run ID/status came from Amina's execution report; the tool did not independently access the Colab tracking database.
- **What I rejected or corrected:** Did not evaluate test in smoke, add a fabricated `test_map50`, rerun training, claim the full E0 baseline complete, or commit a dataset archive or weights. Tair's acceptance is recorded in [issue #50](https://github.com/tairqaldy/qarau-ict-final-1st-trimester/issues/50#issuecomment-6789955660); the full E0 baseline remains M-3.

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

### 11 November 2026, Tair (D-14 dataset rebuild script)

- **Tool and version:** Claude Code (Claude Opus 5.5) in the Claude desktop app.
- **Purpose:** commit code that rebuilds the frozen `potholes_yolo_v1` export, whose Colab cells were never committed.
- **Key prompt(s), with a link to the transcript:** "work on completing tasks for ML for potholes"; the tool chose D-14 from the board. Transcript kept locally.
- **What it produced or changed:** `data/make_potholes_yolo_v1.py` and the D-14 paragraph in `data/README.md`.
- **How I verified it, and who verified it:** ran the script on the Kaggle download; it re-derived the split and matched every image's SHA-256, split and object count in the committed manifest (465/100/100 images, 1,198/305/236 boxes).
- **What I rejected or corrected:** the label number format of the original Colab export is unknown, so the README says label files may differ in the last digits.

### 11 November 2026, Tair (D-1 dataset card, M-20 export fields)

- **Tool and version:** Claude Code (Claude Opus 5.5) in the Claude desktop app.
- **Purpose:** fill the dataset card from the real source and stop the model page from showing "To be added" placeholders.
- **Key prompt(s), with a link to the transcript:** "work on completing tasks for ML for potholes". Transcript kept locally.
- **What it produced or changed:** the dataset card in `data/README.md`, two lines in `docs/ML-EXPERIMENT.md`, the metadata in `ml/export_results.py`, the `ExperimentsFile` type in `docs/ARCHITECTURE.md`.
- **How I verified it, and who verified it:** the licence and author were read from Kaggle's dataset data on 11 November 2026; the 665 image hashes were compared with the manifest by `data/make_potholes_yolo_v1.py`; a test export with a temporary run file produced the expected JSON, and the temporary files were deleted.
- **What I rejected or corrected:** did not call the photos licence-clean: three carry stock watermarks.

### 11 November 2026, Tair (W-11 Part A, model page)

- **Tool and version:** Claude Code (Claude Opus 5.5) in the Claude desktop app.
- **Purpose:** make the model page follow the selection rule in docs/ML-EXPERIMENT.md and read every field `ml/export_results.py` writes.
- **Key prompt(s), with a link to the transcript:** "Implement W-11 (#109) Part A" with the changes since the issue was written (M-20's dataset block and `device` field, a loader test, a chart that works with one run). Transcript kept locally.
- **What it produced or changed:** `web/lib/mock/experiments.ts` (nullable fields, export fields, chart title), `web/lib/mock/experiments.test.ts`, `web/data/experiments.json` (placeholder, still `isMock: true`), `web/app/app/model/page.tsx`, `web/components/charts/model-comparison.tsx`, a null-safe fix in `web/app/page.tsx`.
- **How I verified it, and who verified it:** `pnpm lint`, typecheck and `vitest run` in `web/`; the loader test uses an object shaped like the ExperimentsFile type in ARCHITECTURE section 2. Tair to check the page in the browser after the real export (Part B).
- **What I rejected or corrected:** the issue asked to move the dataset card into `web/lib/credits.ts`; since M-20 the export writes the dataset block, so the card keeps reading it from the results file. Placeholder latency and device are null instead of invented values.

### 11 November 2026, Tair (M-3 E0 baseline, M-12 first export)

- **Tool and version:** Claude Code (Claude Opus 5.5) in the Claude desktop app.
- **Purpose:** train the late E0 baseline and put its real numbers on the model page.
- **Key prompt(s), with a link to the transcript:** "work on completing tasks for ML for potholes ... and making non-demo working example". Transcript kept locally.
- **What it produced or changed:** the `--device` option in `ml/train.py`, the run files `ml/results/runs/E0.json` and `E0-results.csv` (written by the script), and the export output `ml/results/experiments.csv` and `web/data/experiments.json` (written by the script).
- **How I verified it, and who verified it:** the numbers are copied by the scripts from Ultralytics' own evaluation; the test split was evaluated once, after training; the export picked E0 by the selection rule.
- **What I rejected or corrected:** the result file's device used to say "cpu" for any non-CUDA run, which would have been wrong for the M5 GPU; it now records the real device.

### 11 November 2026, Tair (W-28 demo badges, W-21 stale copy)

- **Tool and version:** Claude Code (Claude Opus 5.5) in the Claude desktop app.
- **Purpose:** make every demo badge follow the data on screen, and remove stale placeholder copy from the site.
- **Key prompt(s), with a link to the transcript:** "implement W-28 (#132) and W-21 (#103) in one pull request; never present demo numbers as real". Transcript kept locally.
- **What it produced or changed:** `web/components/app/demo-badge.tsx` (the rule in its comment), `web/components/app/mock-provider-badge.tsx`, `show` on the badges of every seeded-history page, 'Mock result' badges in `analysis-view.tsx` and `compare-result.tsx`, `web/lib/demo-badges.test.ts`; copy fixes in `web/lib/credits.ts`, About, footer, landing and Settings; comments in the mock data files; `web/README.md`.
- **How I verified it, and who verified it:** `pnpm lint`, `pnpm typecheck` and `pnpm exec vitest run --maxWorkers=2` in `web/`; the new test was run once against the old reports page and failed, as it should. The dataset facts were copied from the D-1 card in `data/README.md` and the split manifest, not typed from memory. Tair still has to look at the pages in the browser after the merge.
- **What I rejected or corrected:** did not delete any demo label to make the grep clean; did not write a team AI statement that members have not confirmed (W-14); did not touch the design tokens or the design page text (G-3, Dameli).

### 11 November 2026, Tair (honest labels on invented demo rows)

- **Tool and version:** Claude Code (Claude Opus 5.5) in the Claude desktop app.
- **Purpose:** stop invented sample rows from looking like real model runs now that the roads results are real.
- **Key prompt(s), with a link to the transcript:** "grill yourself and improve". Transcript kept locally.
- **What it produced or changed:** `web/lib/mock/seeded.ts`, its test, and the provider and model cells in the two tables and two detail views.
- **How I verified it, and who verified it:** lint, typecheck and 92 unit tests pass; on a local dev server the dashboard shows "Local" for a real analysis and "Demo" for seeded rows.
- **What I rejected or corrected:** did not change the seeded data's provider, because the analytics page compares providers under its own demo badge.

### 11 November 2026, Tair (M-13 deck plots)

- **Tool and version:** Claude Code (Claude Opus 5.5) in the Claude desktop app.
- **Purpose:** figures for the results slides, generated from committed files.
- **Key prompt(s), with a link to the transcript:** "work on completing tasks for ML for potholes ... grill yourself and improve". Transcript kept locally.
- **What it produced or changed:** `ml/plots.py`, four PNGs in `ml/results/`, the plots section of `ml/README.md`.
- **How I verified it, and who verified it:** opened every figure; checked that the confusion matrix at 0.40 reproduces recall 0.678 and precision 0.874 from `E0.json`.
- **What I rejected or corrected:** the first version used Ultralytics' default confusion matrix (confidence 0.001, 2,374 false alarms) and had a legend over a bar label; both were replaced.

### 11 November 2026, Tair (W-60 projector fit)

- **Tool and version:** Claude Code (Claude Opus 5.5) in the Claude desktop app, with its built-in browser.
- **Purpose:** make each demo result (Analyze, report, Compare) fit on one 1280×720 projector screen.
- **Key prompt(s), with a link to the transcript:** "implement W-60 (#298): try A current, B smaller photo column, C collapsed meta block, compare them at 1280×720 and 1440×900 and pick one with a reason". Transcript kept locally.
- **What it produced or changed:** the jump to the top of the result in `web/components/app/analyze-client.tsx` and `web/components/restrooms/compare-client.tsx`; smaller signs and tighter gaps on desktop in `web/components/restrooms/compare-result.tsx`; the variant comparison in the pull request.
- **How I verified it, and who verified it:** the tool ran the dev server and measured element positions in the browser at 1280×720, 1440×900 and 375×812 with the Mock provider and bundled samples only (s01, s04, the s01 report, all four Compare presets), then ran `pnpm lint`, `pnpm typecheck` and `pnpm exec vitest run --maxWorkers=2` in `web/`. Tair still has to look at it on the projector laptop.
- **What I rejected or corrected:** a 4:3 box for the signs (it cropped the 5:6 drawings); variant C (it hides the "Mock result" badge and does not shorten Compare); variant B on roads (smaller photo, same height); the first scroll margin on phones, which left the result under the 105 px sticky top bar.

### 11 November 2026, Tair (X-16 runbook and demo starter)

- **Tool and version:** Claude Code (Claude Opus 5.5) in the Claude desktop app.
- **Purpose:** make the real-model demo repeatable on the presenting laptop.
- **Key prompt(s), with a link to the transcript:** "making non-demo working example". Transcript kept locally.
- **What it produced or changed:** `docs/DEFENSE-RUNBOOK.md`, `scripts/demo-local.sh`, the checklist link in `docs/TASKS.md`.
- **How I verified it, and who verified it:** ran the script on this laptop; `/health`, the warm-up and a real photo through the web app worked; the servers were stopped afterwards.
- **What I rejected or corrected:** the first version checked only that `web/.next` exists, which a dev server also creates; it now checks for the production build's `BUILD_ID`.

### 11 November 2026, Tair (W-22 study card draft)

- **Tool and version:** Claude Code (Claude Opus 5.5) in the Claude desktop app.
- **Purpose:** a first draft of my study card for the individual question.
- **Key prompt(s), with a link to the transcript:** "complete some bare minimum tasks". Transcript kept locally.
- **What it produced or changed:** the "Tair" practice answers and diagram in `docs/PRESENTATION.md`.
- **How I verified it, and who verified it:** the facts were checked against the code (timeouts, error codes, file paths); I still have to answer from memory in Rehearsal 1.
- **What I rejected or corrected:** left out lecture page numbers that were not checked against the PDFs.

### 11 November 2026, Tair (W-62 first-result path, W-30 demo path card)

- **Tool and version:** Claude Code (Claude Opus 5.5) in the Claude desktop app, with its built-in browser.
- **Purpose:** shorten the path from the landing page to a first result (W-62) and put the slide 3 demo on `/app` as one-click links (W-30).
- **Key prompt(s), with a link to the transcript:** "implement W-62 (#300) and W-30 (#135): try landing variants A current, B hero action to analyze with sample, C two hero actions, compare at 1440 px and 375 px and keep one with a reason; add the demo path card with seven links that only preselect inputs". Transcript kept locally.
- **What it produced or changed:** the hero action in `web/app/page.tsx`; `web/lib/demo-path.ts`, `web/lib/demo-path.test.ts`, `web/lib/store/demo-path.ts`, `web/components/app/demo-path.tsx` and the card in `web/components/app/platform-overview-client.tsx`; the U1 count in `docs/DESIGN-BRIEF.md`; the variant comparison in the pull request.
- **How I verified it, and who verified it:** the tool ran the dev server and clicked through in the browser with the Mock provider and bundled samples only: the click count for each landing variant at 1440×900 and 375×812, all seven demo links (each opened with its input selected), Hide surviving a reload, the card height at 1280×720, light and dark. Then `pnpm lint`, `pnpm typecheck` and `pnpm exec vitest run --maxWorkers=2` in `web/`. Tair still has to look at it and get the timings from two people and from Roma.
- **What I rejected or corrected:** variant C (two module buttons in the hero); a first card layout that was 362 px tall at 1280×720 (now 295 px), because its notes ran to three lines; step notes with numbers in them (they would go stale when the rules change).

### 11 November 2026, Tair (X-18 public repository safety)

- **Tool and version:** Claude Code (Claude Opus 5.5) in the Claude desktop app.
- **Purpose:** check the now-public repository for personal data, course material and secrets.
- **Key prompt(s), with a link to the transcript:** "complete some bare minimum tasks". Transcript kept locally.
- **What it produced or changed:** the X-18 entries in decision 0006, the digest move, the link updates.
- **How I verified it, and who verified it:** the searches in the X-18 issue were run on the full history and on all tracked files; secret scanning was checked through the GitHub API (disabled).
- **What I rejected or corrected:** decision 0006 said secret scanning "now runs"; it does not, so the text now says so.

### 11 November 2026, Dameli (G-1, G-2, G-3: references and colour tokens)

- **Tool and version:** Claude Code (Claude Opus 5.5) in the Claude desktop app.
- **Purpose:** set up Node and pnpm, bring my local design work onto the latest `main`, check the contrast table and prepare the pull request.
- **Key prompt(s), with a link to the transcript:** "iterate on my project", then Tair's handoff (docs/HANDOFF-DAMELI.md). Transcript kept locally.
- **What it produced or changed:** a script (kept outside the repository) that reads `web/app/tokens.css` and recomputes the WCAG ratios; the task ticks and this pull request. The references, the direction and the token values are mine.
- **How I verified it, and who verified it:** all 23 rows of the contrast table match the recomputed ratios to two decimals in both themes; `pnpm lint`, `pnpm typecheck` and `pnpm exec vitest run --maxWorkers=2` pass; I looked at `/`, `/app` and `/design` at 1440 px and 375 px in light and dark.
- **What I rejected or corrected:** did not claim colour-blind safety from contrast numbers alone (that check stays in G-22); did not change `ml/plots.py`, which belongs to the deck plots task G-52.

### 11 November 2026, Dameli (G-8, G-4, G-53, G-5: landing, type and logo)

- **Tool and version:** Claude Code (Claude Opus 5.5) in the Claude desktop app.
- **Purpose:** bring my local landing work onto the latest `main`, compare fonts and logo marks, and make the icon files.
- **Key prompt(s), with a link to the transcript:** Tair's handoff (docs/HANDOFF-DAMELI.md) and "I need to do only the tasks that are for me". Transcript kept locally.
- **What it produced or changed:**
  - Two comparison sheets, one for fonts and one for marks, kept outside the repository. I chose Overpass and the viewfinder from them.
  - The Overpass swap; the icon files, with the PNGs rendered once by Next.js `ImageResponse` from `web/lib/brand.ts` and committed as static files.
  - Conflict resolution against Tair's W-62 hero.
  - The road car changed to drive in once instead of looping.
- **How I verified it, and who verified it:**
  - `pnpm lint`, `pnpm typecheck`, `pnpm exec vitest run --maxWorkers=2` and `pnpm build` pass.
  - On the dev server, the headings use Overpass, and the Cyrillic font files load for "ҚАРАУ" while only the Latin files are preloaded.
  - The page head has `icon`, `apple-touch-icon` and `og:image` tags.
  - `/` checked at 1440 px and 375 px in light and dark.
- **What I rejected or corrected:**
  - The first social image mixed weights in its uppercase line (the font subset had only lowercase letters).
  - The first қ sketch had a hooked tail.
  - My earlier two-button hero lost to Tair's measured W-62 path.
  - Changes outside my tasks were removed from the pull request.

### 11 November 2026, Dameli (G-8 correction: restore teammates' landing content)

- **Tool and version:** Claude Code (Claude Opus 5.5) in the Claude desktop app.
- **Purpose:** put back content that my G-8 pull request (#381) had removed although it was not mine.
- **Key prompt(s), with a link to the transcript:** "please don't take away code and tasks that are not mine". Transcript kept locally.
- **What it produced or changed:** the landing "Problem" section, copied unchanged from before #381 (only the shared page-edge class added), and the Rules and Team links in the public header.
- **How I verified it, and who verified it:** the diff only adds lines; lint, typecheck and tests pass; the header fits at 768, 1024 and 1440 px with no overflow.
- **What I rejected or corrected:** did not touch W-70 (Tair's landing story order).

### 11 November 2026, Dameli (G-12 study card, G-13 slide 9)

- **Tool and version:** Claude Code (Claude Opus 5.5) in the Claude desktop app, with its built-in browser and the unslop writing skill.
- **Purpose:** draft my practice answers and slide 9 from facts that are true in our app and in the lectures.
- **Key prompt(s), with a link to the transcript:** "Yes, G-12 and G-13", and the two issues' steps. Transcript kept locally.
- **What it produced or changed:**
  - The "Dameli — short practice answers" and "Slide 9" blocks in `docs/PRESENTATION.md`.
  - Three 570×405 screenshots for the deck, kept outside the repository.
  - A table of verified lecture pages.
- **How I verified it, and who verified it:**
  - Each app example was tried in the running app: the keyboard-only Analyze run; the service-down error on Compare and the one click to Mock; the Settings connection check; element sizes at 375 px.
  - Each code fact was read in the source (upload limits, chart types, review rules).
  - Each lecture page was opened in the PDF; four digest references were wrong and were corrected.
  - The contrast numbers were recomputed from `web/app/tokens.css`.
  - I still have to answer the questions myself without notes (Rehearsal 1).
- **What I rejected or corrected:**
  - The issue's skeleton said "line for time", but the app has no line chart.
  - "48 px tap targets" is not claimed as done.
  - A first draft overstated dark-theme contrast (5.79 and above 15:1 instead of 5.36 and 14.4:1).
  - The script was cut from 106 to 94 words to fit 35 seconds.

### 11 November 2026, Dameli (G-10 slide template)

- **Tool and version:** Claude Code (Claude Opus 5.5) in the Claude desktop app, with python-pptx 1.0.2.
- **Purpose:** turn the design tokens into a slide template that Roma can use in Canva.
- **Key prompt(s), with a link to the transcript:** "make pptx, I will then connect to the other Canva account and import it there". Transcript kept locally.
- **What it produced or changed:** `docs/design/slide-template/make_slide_template.py` and the `.pptx` it writes; the G-10 section in DESIGN-BRIEF.md.
- **How I verified it, and who verified it:**
  - The file opens with python-pptx: 16:9, eight slides, speaker notes on every slide, and only Overpass and JetBrains Mono used.
  - Every slide was drawn in a browser with the real Google fonts. Two layout problems were fixed: a repository link that wrapped, and a legend placed too low.
  - The colour values were copied from `web/app/tokens.css`.
  - The import into Canva and the font check on Roma's device are still for me to do.
- **What I rejected or corrected:** did not use the Canva connector (its tools are switched off in my settings), and did not put any real number into the template.

### 11 November 2026, Tair (pothole runs E1, E6, E8, final champion)

- **Tool and version:** Claude Code (Claude Opus 5.5) in the Claude desktop app.
- **Purpose:** train the remaining pothole runs on my laptop, apply the E8 policy and the selection rule, and make the repository serve the champion.
- **Key prompt(s), with a link to the transcript:** "work on completing tasks for ML for potholes", "in case someone blocks u, work further". Transcript kept locally.
- **What it produced or changed:** the E8 entry in `ml/train.py`, the run files E1, E6, E8 (written by `ml/train.py`), the re-export, the champion figures, the demo default weights, the S-2 re-check, the CSV quoting fix in `ml/export_results.py` with its test.
- **How I verified it, and who verified it:** every number comes from the run JSON files through the exporter; the confusion matrix counts were compared with `E1.json`; `/predict` was compared with `yolo predict` on three test photos; the E8 and E0 training CSVs were compared column by column.
- **What I rejected or corrected:** the first E8 export drew wrong bars for E8 because of the unquoted comma; caught by looking at the chart, fixed in the exporter, not by editing the CSV.

### 11 November 2026, Tair (M-19 operating point)

- **Tool and version:** Claude Code (Claude Opus 5.5) in the Claude desktop app.
- **Purpose:** measure the served model's precision and recall at the app's threshold, with counts.
- **Key prompt(s), with a link to the transcript:** "complete some bare minimum tasks". Transcript kept locally.
- **What it produced or changed:** `ml/operating_point.py`, `ml/test_operating_point.py`, `ml/results/operating_point.json`, the table in `docs/ML-EXPERIMENT.md`.
- **How I verified it, and who verified it:** the tests check IoU, one match per labelled box and the summary formulas; `tp + fn` equals the 236 test boxes; the counts were compared with Ultralytics' 0.40 confusion matrix.
- **What I rejected or corrected:** nothing rejected; the difference to Ultralytics' counts is explained in the doc instead of hidden.

### 11 November 2026, Dameli (G-22 colour-blind check)

- **Tool and version:** Claude Code (Claude Opus 5.5) in the Claude desktop app.
- **Purpose:** a repeatable check that our colour sets stay distinguishable for colour-blind readers.
- **Key prompt(s), with a link to the transcript:** "do all of these, deadline is too close" (G-22 among them). Transcript kept locally.
- **What it produced or changed:** `web/scripts/check-palette.mjs`, the result tables and the decision rows in DESIGN-BRIEF.md.
- **How I verified it, and who verified it:**
  - The simulation matrices were read from the authors' page, which is cited in the script, and compared with the values used.
  - The script runs and resolves the verdict aliases.
  - The claim that `chart-3` and `chart-4` are unused was checked by searching the web code.
  - The visual check in Chrome DevTools is still for me to do.
- **What I rejected or corrected:** a first draft said the analytics page "uses only chart-1 and chart-2"; it now says no chart uses `chart-3` or `chart-4`, which is what the search showed. No token was changed without Tair.

### 11 November 2026, Dameli (G-42 anti-slop checklist)

- **Tool and version:** Claude Code (Claude Opus 5.5) in the Claude desktop app.
- **Purpose:** turn the team's design rules into searchable checks and audit `main` once.
- **Key prompt(s), with a link to the transcript:** "do all of these, deadline is too close". Transcript kept locally.
- **What it produced or changed:** `docs/design/ANTI-SLOP.md` and one line in `.github/pull_request_template.md`.
- **How I verified it, and who verified it:** every check was run on `main` on 11 November; both percentages were traced to their source lines; the looping components were opened to confirm the intervals.
- **What I rejected or corrected:** did not count the Demo badge as slop (it is the honesty rule); did not change any component here; the fixes belong to G-23, G-49 and G-54.

### 11 November 2026, Tair (D-13, M-18, R-13 study-card drafts for Amina and Roma)

- **Tool and version:** Claude Code (Claude Opus 5.5) in the Claude desktop app, as a sub-agent of the planning session.
- **Purpose:** draft short practice answers for Amina's and Roma's study cards, so both can practise tonight.
- **Key prompt(s), with a link to the transcript:** "и в целом все эти таски надо начать выполнять" (start doing all these tasks); the sub-agent got the card questions, the issues D-13, M-18, R-13 and the result files as sources. Transcript kept locally.
- **What it produced or changed:** the two "short practice answers" blocks in `docs/PRESENTATION.md` and a draft note in TASKS.md for D-13, M-18, R-13.
- **How I verified it, and who verified it:** every number was checked against `ml/results/experiments.csv`, `operating_point.json`, `pothole_area_clusters.json` and the run files; worked example A against `web/lib/rules/engine.test.ts` (score 15, critical). Amina and Roma still have to check and practise their answers.
- **What I rejected or corrected:** facts not in the repository are left as `[check: …]` (the R-6 audit report does not exist yet), and "the app serves E8" lines in PRESENTATION.md and ML-EXPERIMENT.md now say E1.

### 11 November 2026, Dameli (G-52 chart style)

- **Tool and version:** Claude Code (Claude Opus 5.5) in the Claude desktop app, with matplotlib 3.9.4 in a throwaway environment.
- **Purpose:** one chart style for app screenshots and deck plots.
- **Key prompt(s), with a link to the transcript:** "do all of these, deadline is too close". Transcript kept locally.
- **What it produced or changed:** `docs/design/chart-style.md`, `docs/design/chart_style_sample.py` and its PNG.
- **How I verified it, and who verified it:** hex values copied from `web/app/tokens.css`; the sample reads its numbers and the champion from the committed results files, and I opened the image; bars start at zero.
- **What I rejected or corrected:** did not restyle `ml/plots.py` or `ml/restroom/layers_report.py` myself (the model lanes own them); did not pick a champion by eye.

### 11 November 2026, Tair (defense deck draft: R-20, R-21 and the other slides)

- **Tool and version:** Claude Code (Claude Opus 5.5) in the Claude desktop app, as a sub-agent of the planning session.
- **Purpose:** build a first version of all 12 slides and the backups from the committed result files, so every speaker has text and a script tonight.
- **Key prompt(s), with a link to the transcript:** "и в целом все эти таски надо начать выполнять" (start doing all these tasks); the sub-agent got the slide issues R-20 to R-25, G-13, R-3, R-15 as the spec. Transcript kept locally.
- **What it produced or changed:** `docs/deck/make_deck.py`, `docs/deck/qarau-defense-deck.pptx`, `docs/deck/SLIDES.md`, `docs/research/deck-sources.md`.
- **How I verified it, and who verified it:** the build reads every number from the result files and stops if a shown number differs from its file value; I looked at every slide rendered to PNG and ran `ml/check_results.py`. Each speaker still reads their slide aloud with a timer.
- **What I rejected or corrected:** slide 12 called the live site "demo data"; it now says the model page there is real and only its analyses run on demo data. Numbers that are not in any file (slide 2 statistic, restroom intervals, the R-6 audit) are shown as marked gaps, not filled in.

### 11 November 2026, Dameli (G-66 architecture diagrams)

- **Tool and version:** Claude Code (Claude Opus 5.5) in the Claude desktop app; Playwright with Chromium for the PNG export.
- **Purpose:** the slide 4 architecture diagram and its detailed backup version.
- **Key prompt(s), with a link to the transcript:** "do all of these, deadline is too close". Transcript kept locally.
- **What it produced or changed:** `docs/design/architecture-slide.svg`, `docs/design/architecture-detail.svg`, `docs/design/architecture-diagram.md`, `docs/design/render_svg.py`.
- **How I verified it, and who verified it:** every route, folder and rule ID checked with `ls web/app/api`, `grep -nE "@app|@router" api/main.py api/restroom.py` and the rule configs; S-7 status read in TASKS.md; both PNGs opened and read at full size.
- **What I rejected or corrected:** a first draft said the Gradio app uses the same models; `api/gradio_app.py` is unrun starter code for potholes only, so it was removed. The "no database" note moved from the training band to the serving band.

### 11 November 2026, Dameli (G-30 tile states, G-47 review colour)

- **Tool and version:** Claude Code (Claude Opus 5.5) in the Claude desktop app, with Playwright and Chromium for screenshots.
- **Purpose:** clear selected, hover and focus states on hand-made tiles and chips; a colour for "needs review" that is not blue.
- **Key prompt(s), with a link to the transcript:** "мне просто нужно сейчас сделать просто максимальное колво тасков". Transcript kept locally.
- **What it produced or changed:** `web/components/ui/selectable-tile.tsx`, `ReviewBadge` in `web/components/ui/badge.tsx`, the `--review` tokens and the new `--box-review` value in `web/app/tokens.css`, a `review` set in `web/scripts/check-palette.mjs`, the tiles and chips on Analyze, Compare, the sign picker, Settings and Reports, and two sections in `docs/DESIGN-BRIEF.md`.
- **How I verified it, and who verified it:**
  - Contrast ratios were computed from the hex values with the WCAG formula; every mark is 3:1 or more and every text colour 4.5:1 or more.
  - `node web/scripts/check-palette.mjs` was run after the change; its rows are copied into the design brief.
  - Greyscale screenshots of each selected tile and chip in both themes at 1440 and 375 px, and one with keyboard focus inside the sign picker.
  - `pnpm lint`, `pnpm typecheck` and `pnpm exec vitest run --maxWorkers=2` pass.
- **What I rejected or corrected:** a first violet for review was too close to low severity under simulated protanopia (ΔE 9.1), so it was made darker. Did not recolour the restroom "review" verdict or the analytics chart (other lanes, never blue), and did not change the focus ring.

### 11 November 2026, Dameli (G-29 provenance badges, G-24 icon audit)

- **Tool and version:** Claude Code (Claude Opus 5.5) in the Claude desktop app.
- **Purpose:** one badge set for demo, mock and model results, and one icon per concept on the result cards.
- **Key prompt(s), with a link to the transcript:** "мне просто нужно сейчас сделать просто максимальное колво тасков". Transcript kept locally.
- **What it produced or changed:** `ProvenanceBadge` and `ResultProvenanceBadge` in `web/components/app/demo-badge.tsx`, `resultProvenance` in `web/lib/mock/seeded.ts`, the badge on the road, compare and match results, the "Mock predictions" badge, an optional `icon` on `Callout`, the new icons on both result cards, the tests in `web/lib/demo-badges.test.ts` and the design brief section.
- **How I verified it, and who verified it:**
  - `pnpm lint`, `pnpm typecheck` and `pnpm exec vitest run --maxWorkers=2` pass.
  - Screenshots in both themes, at 1440 px and 375 px, of a mock road result, a Local road result, a seeded road report, a mock compare result, a Cloud compare check, a seeded check and a mock match. Each result showed exactly one provenance badge; the Local and Cloud records were copies made in the test browser only, to see the look.
  - Checked in the lucide-react package that TriangleAlert is the same drawing as TriangleExclamationPoint, and that every new icon name exists in version 1.70.
- **What I rejected or corrected:** a first layout put the badge inside the Provider row, which left a hole in the details grid; it now has its own row. A thin amber line on "Demo data" made it look like the outlined Mock badge in the dark theme, so Demo data is a fill without a line. The four icon clashes outside the result cards were written down, not changed, because those files belong to other tasks.

### 11 November 2026, Dameli (G-45 tabular figures, G-28 readable box tags)

- **Tool and version:** Claude Code (Claude Opus 5.5) in the Claude desktop app.
- **Purpose:** make numbers keep their width in KPI tiles, tables, charts and count-ups, and keep the detection box tags at 11 px or more on a 375 px phone.
- **Key prompt(s), with a link to the transcript:** "мне просто нужно сейчас сделать просто максимальное колво тасков" (G-45 and G-28 among them). Transcript kept locally.
- **What it produced or changed:** `web/components/motion/count-up.tsx` (markup and classes only), `web/components/app/kpi.tsx`, `web/components/ui/table.tsx`, one rule at the end of `web/app/globals.css`, `web/components/app/detection-overlay.tsx` (tag size and placement), `web/lib/detection-overlay.test.ts`.
- **How I verified it, and who verified it:**
  - Playwright in Chromium on a local dev server: KPI widths read on every animation frame of a count-up (65 to 104: one width, 118.28 px, where `main` jumped at 99 to 100); tag font size computed as the SVG font size times the screen scale (375 px: 6.79 px before, 11.00 px after; 1440 px: 12.98 px before and after); every tag's right edge inside the photo.
  - Digit widths of Overpass with and without `tabular-nums`, to confirm the font has tabular figures.
  - `pnpm lint`, `pnpm typecheck` and `pnpm exec vitest run --maxWorkers=2` pass (110 tests).
- **What I rejected or corrected:** the first tag size used only the photo's width and measured 10.95 px, because the bordered figure scales the photo by its height; it now uses the smaller of the two ratios and measures 11.00 px. The first chart check found the new CSS rule missing; that was a stale local dev cache, not the code, and the rule applied after clearing it. The thicker box lines the issue suggested were left out, so box drawing stays as it was.

### 11 November 2026, Dameli (G-56 screenshot frame, G-11 deck screenshots, G-57 video look, G-63 imagery, G-69 principles)

- **Tool and version:** Claude Code (Claude Opus 5.5) in the Claude desktop app, with Playwright (Chromium), Pillow and python-pptx in a throwaway environment.
- **Purpose:** one screenshot frame for the deck, the screenshots themselves, the backup video look and two design rule docs.
- **Key prompt(s), with a link to the transcript:** "мне просто нужно сейчас сделать просто максимальное колво тасков". Transcript kept locally.
- **What it produced or changed:** `docs/design/screenshots.md`, `docs/design/screenshots/take_screenshots.py`, slide 5 in the slide template, `docs/design/video.md` and the cards in `docs/design/video/`, `docs/design/imagery.md`, `docs/design/PRINCIPLES.md`, one row in `docs/README.md`; 20 screenshots outside git.
- **How I verified it, and who verified it:**
  - Every screenshot was opened and checked by eye: no faces, people or licence plates (the samples are drawings), and the Mock or demo badge is in the frame.
  - The three frame variants were drawn side by side on the slide background before choosing.
  - The cards were rendered in Chromium with Overpass and JetBrains Mono loaded and checked as images.
  - Every quoted string, file and line in PRINCIPLES.md and imagery.md was looked up in the code; the footer credits were compared with `web/lib/credits.ts`.
  - The new template slide was checked by reading the shape positions back from the .pptx; it was not opened in Canva yet.
- **What I rejected or corrected:** a draft said the IOAI callout on the Model page is labelled "Not our runs" in the page code; that sentence comes from the results file, so the doc now says so. A draft gave the Model page no pothole credit; it has one, read from the results file. No copy in `web/` was changed; the copy fixes are listed for W-21 and R-12.

### 11 November 2026, Dameli (G-20, G-26, G-27 token rules, empty-state drawings, dark map)

- **Tool and version:** Claude Code (Claude Opus 5.5) in the Claude desktop app, with Playwright and Chromium for screenshots.
- **Purpose:** usage rules for every colour group on `/design`, four token-only empty-state drawings, and a dark map with markers that match the list.
- **Key prompt(s), with a link to the transcript:** "мне просто нужно сейчас сделать просто максимальное колво тасков". Transcript kept locally.
- **What it produced or changed:** the rules and the token table in `web/components/design/design-showcase.tsx`; `web/components/illustrations/` and `web/lib/illustrations.test.ts`; an optional `illustration` prop in `web/components/ui/empty-state.tsx` and its use in 8 empty states; the Leaflet block in `web/app/globals.css`; `web/components/app/map-view.tsx` and `map-client.tsx`.
- **How I verified it, and who verified it:**
  - Each "never" rule was searched for a counter-example in `web/`.
  - On the dev server, every one of the 9 colour groups showed both lines in both theme panels, at 1440 and 375 px, with no sideways scroll.
  - Screenshots of the map in both themes and widths: dark tiles and five distinct marker fills. A change that hid clear analyses from the map was reverted before merging, because it changes Tair's page.
  - With the tile host blocked, the offline notice still shows on a dark background.
  - `pnpm lint`, `pnpm typecheck` and `pnpm exec vitest run --maxWorkers=2` (127 tests after the last rebase) pass.
- **What I rejected or corrected:**
  - Switched from CARTO tiles back to OpenStreetMap, because CARTO's tiles now say "API KEY REQUIRED".
  - Dropped a draft rule ("never a soft fill with plain text") because the success callout does exactly that.
  - Did not edit `tokens.css`.

### 11 November 2026, Dameli (G-7, G-71, G-51 chart style and threshold lines)

- **Tool and version:** Claude Code (Claude Opus 5.5) in the Claude desktop app.
- **Purpose:** one chart style for the analytics and model pages, labelled threshold lines, and the line-or-columns decision for detections per day.
- **Key prompt(s), with a link to the transcript:** "мне просто нужно сейчас сделать просто максимальное колво тасков". Transcript kept locally.
- **What it produced or changed:** the shared style and `ThresholdMarker` in `web/components/charts/chart-kit.tsx`; `web/lib/charts/thresholds.ts` with its test; the chart files `analytics-client.tsx`, `restroom-analytics.tsx`, `model-comparison.tsx`, `restroom-runs.tsx`; the Charts section of DESIGN-BRIEF.md; my G-12 answer in PRESENTATION.md.
- **How I verified it, and who verified it:**
  - `pnpm lint`, `pnpm typecheck`, `pnpm exec vitest run --maxWorkers=2` and `pnpm build` pass in `web/`.
  - Screenshots of every chart in light and dark at 1440 and 375 px.
  - Moving S1 and R1 with the sliders on the Rules pages moved the lines and their labels.
  - Every "Show as table" toggle still opens its table, and the console shows no errors.
- **What I rejected or corrected:**
  - Kept the stacked columns after looking at the line variant.
  - The IOAI labels on `/app/model` were partly hidden behind bars; they now sit above their line with an outline in the card colour.
  - A histogram bin cut by a threshold was coloured by its lower edge, which disagreed with the chart title; the bin is now split.
  - No rule logic and no default value was changed.

### 11 November 2026, Dameli (G-25 printable reports, G-68 row thumbnails)

- **Tool and version:** Claude Code (Claude Opus 5.5) in the Claude desktop app, with Playwright (Chromium) in a throwaway environment for the checks.
- **Purpose:** print a road report or a sign check on one light page, and show each row's photo in the report and sign-check tables.
- **Key prompt(s), with a link to the transcript:** "мне просто нужно сейчас сделать просто максимальное колво тасков" (G-25 and G-68 among them). Transcript kept locally.
- **What it produced or changed:** `web/app/print.css`, `web/components/app/print-bits.tsx`, `web/components/ui/row-thumb.tsx`, `web/lib/print-tokens.test.ts`, and small changes in the two detail pages and the two tables.
- **How I verified it, and who verified it:**
  - Playwright `page.pdf()` on my own dev server: demo-001 and demo-rc-001 print on one page from the light and the dark theme, and I looked at each PDF; all 70 demo reports and checks print on one page; the rule table still prints with the Raw JSON tab open.
  - Playwright measured every thumbnail at 64×36 on `/app/roads/reports` (41 rows) and in 'Recent analyses' (6 rows); a synthetic test upload (no people, no plates) showed its own photo; layout shift on `/app/roads/reports` was 0 on the production build.
  - `pnpm lint`, `pnpm typecheck`, `pnpm exec vitest run --maxWorkers=2` (106 tests) and `pnpm build` pass.
- **What I rejected or corrected:**
  - A first layout printed on two pages; it now uses two columns and an 80% scale.
  - The first alt text called the demo pictures photos; they are drawings, so it now says "Sample drawing".
  - Hiding the navigation applied to every page in print; it now applies only to report and check pages.
  - Did not edit `analysis-view.tsx`, `compare-result.tsx` or `app-shell.tsx`, which other open work changes.

### 11 November 2026, Dameli (G-58 deck critique)

- **Tool and version:** Claude Code (Claude Opus 5.5) in the Claude desktop app, with python-pptx and Pillow in a throwaway environment.
- **Purpose:** check every slide of the defense deck draft against the anti-slop checklist, the chart rules and the result files before the freeze.
- **Key prompt(s), with a link to the transcript:** "мне просто нужно сейчас сделать просто максимальное колво тасков" (I just need to do as many tasks as possible now). Transcript kept locally.
- **What it produced or changed:** `docs/design/deck-critique.md` (18 must-fix and 36 nice-to-have findings, measurements per slide); the G-58 claim line in `docs/TASKS.md`. The deck, `SLIDES.md` and `make_deck.py` were not changed.
- **How I verified it, and who verified it:** fonts, sizes, word counts and pictures read from the .pptx with python-pptx; every number on the slide faces and in the scripts compared by hand with its source file; each chart opened and its placed size computed from its pixels and DPI; the AI-log count recounted on `origin/main`. Roma and Tair still have to go through the findings.
- **What I rejected or corrected:** the first count for slide 9's script cut did not add up to the 18 words it promised and was corrected; a slide render was not faked: Quick Look gave no image, so the critique says no render was made and estimates overflow from box sizes instead.
### 11 November 2026, Dameli (G-59 motion tokens, G-54 demo pause, G-64 reduce-motion switch)

- **Tool and version:** Claude Code (Claude Opus 5.5) in the Claude desktop app.
- **Purpose:** name every animation timing, add a pause button to the landing demos and a Reduce motion switch in Settings.
- **Key prompt(s), with a link to the transcript:** "мне просто нужно сейчас сделать просто максимальное колво тасков". Transcript kept locally.
- **What it produced or changed:**
  - `web/lib/motion.ts` tokens and `--duration-ui`; `web/components/landing/demo-pause-button.tsx` and the two demos.
  - `web/components/motion/motion-preference.tsx`, `motionStore`, the inline script, the Settings switch and a CSS block.
  - Two tests; the R7 line in ANTI-SLOP.md; a note in DESIGN-BRIEF.md.
- **How I verified it, and who verified it:**
  - lint, typecheck, all 148 tests and the build pass after the rebase on `main`.
  - A Playwright run on port 3102 read every animation frame for 3 s on the four routes. Switch on: no element took more than one value. Baseline: chart bars took 20 values, KPI numbers 10.
  - The same run with the device setting emulated gave the same result as the switch.
  - Pause and Play worked with Enter, Space and a click.
- **What I rejected or corrected:**
  - Did not hide the pause button with conditional markup (hydration mismatch); CSS hides it instead.
  - Did not touch the chart files or the count-up rendering, which other tasks edit today.
  - A first test of the sign demo failed because it sits in a closed `<details>`; the test now opens it first.

### 11 November 2026, Tair (deck: answer to Dameli's G-58 critique)

- **Tool and version:** Claude Code (Claude Opus 5.5) in the Claude desktop app, the same sub-agent that built the deck draft.
- **Purpose:** fix the must-fix items of `docs/design/deck-critique.md`: text sizes, charts at slide size, colours from the tokens, gaps off the slide faces.
- **Key prompt(s), with a link to the transcript:** "fix every must-fix item that can be fixed from the repository; keep every honesty check". Transcript kept locally.
- **What it produced or changed:** `docs/deck/make_deck.py`, the rebuilt deck, `docs/deck/CRITIQUE-RESPONSE.md`; I changed the champion colour and the figure title in `ml/plots.py` and "sample photos" to "sample images" in PRESENTATION.md.
- **How I verified it, and who verified it:** rendered every slide and looked at it; the build still stops on any number that differs from its file and on text under 14 pt; `ml/check_results.py` passes. Dameli checks the response table.
- **What I rejected or corrected:** the highlight on slide 8 stays partial, because highlighting one restroom run would decide the headline that Nazar has not confirmed.

### 11 November 2026, Dameli (G-61 rule hit variants)

- **Tool and version:** Claude Code (Claude Opus 5.5) in the Claude desktop app, with Playwright and Pillow in a throwaway environment.
- **Purpose:** try three ways to show a rule hit in the landing section "Rules you can read", compare them, keep one.
- **Key prompt(s), with a link to the transcript:** "мне просто нужно сейчас сделать просто максимальное колво тасков". Transcript kept locally.
- **What it produced or changed:**
  - `web/components/landing/rule-hit-card.tsx` and `web/lib/landing-rule-hits.ts` with a test; the section in `web/app/page.tsx` uses the new card.
  - Four comparison sheets in `docs/design/rule-hit-g61/`.
  - A temporary comparison page that was deleted again.
- **How I verified it, and who verified it:**
  - lint, typecheck, all 152 tests and `pnpm build` pass.
  - Playwright on port 3110 read the marked values from the landing section in both themes and at both widths: ×1.5, 0.20 and 0.10.
  - The built `index.html` contains the same marks.
  - I looked at the sheets and picked B.
- **What I rejected or corrected:**
  - The first sign images in C were cropped by a height limit, and the lane label covered a box at 375 px; both were fixed before comparing, so C was judged at its best.
  - A rewritten sentence for the cards was not used. The cards show the engine's own sentence and only mark tokens in it, so no copy or meaning changed.

### 11 November 2026, Dameli (G-31 high-contrast theme)

- **Tool and version:** Claude Code (Claude Opus 5.5) in the Claude desktop app.
- **Purpose:** add a high-contrast theme with every text token at 7:1 or more, and measure it.
- **Key prompt(s), with a link to the transcript:** "мне просто нужно сейчас сделать просто максимальное колво тасков". Transcript kept locally.
- **What it produced or changed:**
  - The `[data-theme="contrast"]` block in `web/app/tokens.css`; `"contrast"` in the theme store, the inline script, Settings and `/design` (the header toggle only leads out of it); `flex-wrap` on the segmented control.
  - A 3 px focus ring in this theme (`globals.css`); the light values for printing (`print.css`).
  - `web/scripts/check-contrast.mjs`, `web/lib/contrast-theme.test.ts`, two cases in `theme-script.test.ts`, the new theme in `check-palette.mjs`; the section "High-contrast theme (G-31)" in DESIGN-BRIEF.md.
- **How I verified it, and who verified it:**
  - `node web/scripts/check-contrast.mjs`: 0 values below target; lowest text 7.13:1, lowest mark 3.29:1. `check-palette.mjs`: no pair in the new theme below ΔE 10.
  - lint, typecheck and all 190 tests pass after merging `main`.
  - Playwright on port 3111: choosing High contrast in Settings and reloading keeps `data-theme="contrast"`; screenshots of seven routes; print emulation gives the light values; the focus ring is 3 px.
- **What I rejected or corrected:**
  - A first medium and high severity pair was only ΔE 6.4 apart for deuteranopia; medium got lighter and high darker (17.4 now).
  - An amber accent with black text, as in light, cannot be 3:1 on white and 7:1 under black text at once, so the accent became dark amber with white text.
  - A batch value change in the shell first hit the light and dark blocks too; it was reverted from git before any commit, and the values were set inside the contrast block only.
  - At 375 px the fourth theme option pushed the Settings page 14 px wider than the screen; the segmented control now wraps.

### 11 November 2026, Dameli (G-48 box colours on the samples)

- **Tool and version:** Claude Code (Claude Opus 5.5) in the Claude desktop app, with Playwright (Chromium) and Pillow in a throwaway environment for the screenshots and measurements.
- **Purpose:** check that the detection boxes and tags stay visible on the road samples in both themes, compare three box styles and apply the best one.
- **Key prompt(s), with a link to the transcript:** "мне просто нужно сейчас сделать просто максимальное колво тасков" (G-48 among them). Transcript kept locally.
- **What it produced or changed:** `--box-halo` 0.45 to 0.65 in `web/app/tokens.css` and `web/app/print.css`; `HALO_SCALE` (4, was 2.4) in `web/components/app/detection-overlay.tsx` with a test in `web/lib/detection-overlay.test.ts`; the section "Box colours on real photos (G-48)" in `docs/DESIGN-BRIEF.md`. Screenshots and the measuring scripts stay outside git.
- **How I verified it, and who verified it:**
  - 96 screenshots on my own dev server: six samples, variants A, B, C and the pick, at 1440 and 375 px, light and dark; I looked at the side-by-side grids and zoomed crops of the hardest boxes.
  - A Pillow script measured the contrast of the stroke against the halo-darkened pixels along every box edge; the worst points sit on white lane markings. The page DOM showed the new halo (width 16, colour `#000000a6`).
  - `node web/scripts/check-palette.mjs`: box / box-review unchanged.
  - `pnpm lint`, `pnpm typecheck`, `pnpm exec vitest run --maxWorkers=2` (153 tests after the rebase) and `pnpm build` pass.
- **What I rejected or corrected:**
  - Rejected the white box (B): white already marks the hovered box, and the legend shows amber for "counted".
  - Raised the tested 60% halo to 65% so pure white also reaches 3:1.
  - The first run of the tests failed because the print copy of the tokens still had 0.45; updated it.
  - The samples are drawings, so G-48 stays open until it is checked on the D-5 photos; the two overlay problems found (overlapping tags on `s05` at 375 px, review boxes drawn solid) are reported, not fixed.

### 11 November 2026, Dameli (G-72 annotated result slides)

- **Tool and version:** Claude Code (Claude Opus 5.5) in the Claude desktop app.
- **Purpose:** put four numbered markers on the road result and the sign result screenshots for the slide 3 fallback, and write down what each marker says.
- **Key prompt(s), with a link to the transcript:** "мне просто нужно сейчас сделать просто максимальное колво тасков". Transcript kept locally.
- **What it produced or changed:**
  - `docs/design/screenshots/annotate.py`: SVG overlay on the raw shot, rendered to 1920 × 1080 PNGs (outside git).
  - `docs/design/annotations.md`: label, speaker line and source per marker.
  - The marker rules in `docs/design/screenshots.md`.
- **How I verified it, and who verified it:**
  - Every value on a label traced to `web/public/samples/samples.json`, `web/public/samples/restrooms/samples.json`, `web/lib/rules`, `web/lib/signage` and `docs/RULES.md` (for example 4 + 2 + 1 = 7, +3, +5, score 15).
  - The script checks the label widths, the fonts, the 2880 × 1800 input and that no marker touches a Mock or demo badge; all four PNGs passed and were opened at full size.
  - Roma still has to place the slides in the deck.
- **What I rejected or corrected:**
  - The Mock result badge was suggested as a marker; it stays unmarked so nothing covers it.
  - The first outlines on the sign bars cut through the threshold lines under them and were enlarged; the dot in the eyebrow got a thin space after it.

### 11 November 2026, Dameli (G-44 type scale, G-65 320 px reflow and 200 % zoom)

- **Tool and version:** Claude Code (Claude Opus 5.5) in the Claude desktop app, with Playwright (Chromium) in a throwaway environment for the checks.
- **Purpose:** remove the stray and inverted font sizes, then check every listed route at 320 px and at 200 % zoom and fix what broke.
- **Key prompt(s), with a link to the transcript:** "мне просто нужно сейчас сделать просто максимальное колво тасков" (G-44 and G-65 among them). Transcript kept locally.
- **What it produced or changed:** `--text-*: initial` in `web/app/tokens.css`; class changes in `web/app/page.tsx`, `design-showcase.tsx`, `site-header.tsx`, `sign-slot.tsx`, `select.tsx`, `settings-client.tsx`, `compare-client.tsx`, `analyze-client.tsx`, `app-shell.tsx` and the Analytics and Model pages; a scroll-padding block in `web/app/globals.css`; one line in DESIGN-BRIEF.md.
- **How I verified it, and who verified it:**
  - `grep -rn "text-\[" web/app web/components` prints nothing.
  - Playwright on my own dev server: at 320×640 the scroll check printed `true` on 6 of 18 routes before and `false` on all 18 after; at 640×360 CSS px (1280×720 at 200 %) all 18 print `false`, and Tab plus Shift+Tab on analyze, compare and match leave no control fully under the bars (5, 6 and 12 hidden stops before).
  - Screenshots at 320, 375 and 1024 px of the changed parts; the analyze result still scrolls to 128 px from the top.
  - `pnpm lint`, `pnpm typecheck`, `pnpm exec vitest run --maxWorkers=2` (139 tests) and `pnpm build` pass.
- **What I rejected or corrected:**
  - The first focus run counted the fixed "Skip to content" link as hidden; it sits above the header, so the check now skips fixed elements.
  - The scroll padding first did nothing because the dev server served old CSS; after clearing `.next/dev` it applied.
  - Scroll padding alone would have pushed the analyze and compare results and the section anchors lower; their scroll margins were reduced so they land where they did.
  - Did not use `overflow-x: hidden` on `body`, and did not hide the Demo badge or any control.

### 11 November 2026, Tair (automatic Vercel deploys turned off, decision 0010)

- **Tool and version:** Claude Code (Claude Opus 5.5) in the Claude desktop app, with the Vercel connector for the deployment list.
- **Purpose:** stop Vercel from building on every push, so the live site changes only when I ask for a deploy.
- **Key prompt(s), with a link to the transcript:** "dont redeploy everytime, please deploy only when needed really. i will only tell you when we can do that.", then "Yes, turn off". Transcript kept locally.
- **What it produced or changed:** `web/vercel.json` with `git.deploymentEnabled: false`, decision 0010, and the deploy lines in README.md, CONTRIBUTING.md and docs/HANDOFF-DAMELI.md.
- **How I verified it, and who verified it:**
  - Before: the Vercel deployment list showed 40 Git deployments in about 80 minutes, all from pushes (claim commits on `main` and pull-request branches), none started by hand.
  - After: the result for this branch and for the merge commit is in a comment on the pull request.
- **What I rejected or corrected:** an Ignored Build Step that skips commits outside `web/` (every web merge and every preview would still build), and only batching claim commits (previews would still build).

### 11 November 2026, Dameli (G-60 one landing effect)

- **Tool and version:** Claude Code (Claude Opus 5.5) in the Claude desktop app, with Playwright (Chromium) and Pillow in a throwaway environment for the screenshots.
- **Purpose:** finish G-60 after a stopped session: review its comparison of three effects on the How it works steps, keep at most one, and redo the work as small commits.
- **Key prompt(s), with a link to the transcript:** "мне просто нужно сейчас сделать просто максимальное колво тасков" (G-60 among them). Transcript kept locally.
- **What it produced or changed:** the step-line block in `web/app/globals.css`, the class `how-steps` in `web/app/page.tsx`, the test `web/lib/how-steps-motion.test.ts`, `docs/design/borrowed.md` and the comparison screenshots in `docs/design/landing-effect-g60/`.
- **How I verified it, and who verified it:**
  - Screenshots of no effect, beam, step line and spotlight at 1440 and 375 px in light and dark, and frame strips of the step line while scrolling.
  - Playwright on `/`: with no preference the four lines have `animation-name: how-step-line` on a `view()` timeline and fill in order; with the OS reduced-motion setting and with the Settings switch every line has `animation-name: none` and `transform: none`. Layout shift while scrolling through the section: 0.
  - `pnpm lint`, `pnpm typecheck`, `pnpm exec vitest run --maxWorkers=2` (194 tests) and `pnpm build` pass.
- **What I rejected or corrected:**
  - The beam and the spotlight (reasons in `docs/design/borrowed.md`).
  - The stopped session's single unreviewed commit was undone and redone as small commits; its temporary comparison route is not in the pull request.
  - The first typecheck failed on route types the dev server had generated for the deleted temporary route; clearing them fixed it.
  - No Lighthouse run: it is not installed, and adding it would be a new dependency.

### 11 November 2026, Dameli (G-50 one drop zone)

- **Tool and version:** Claude Code (Claude Opus 5.5) in the Claude desktop app, with Playwright (Chromium) in a throwaway environment for the checks.
- **Purpose:** merge the two upload drop zones (roads Analyze and the restroom sign slot) into one `Dropzone` without changing what happens to the photo.
- **Key prompt(s), with a link to the transcript:** "мне просто нужно сейчас сделать просто максимальное колво тасков" (G-50 among them). Transcript kept locally.
- **What it produced or changed:** `web/components/ui/dropzone.tsx`, its use in `web/components/app/analyze-client.tsx` and `web/components/restrooms/sign-slot.tsx`, a states block in `web/components/design/design-showcase.tsx`, and `web/lib/dropzone.test.ts`.
- **How I verified it, and who verified it:**
  - One Playwright script ran before and after on my own dev server with real files (`ioai-v1.webp`, `ioai-v2.webp`, a text file, an 11 MB file): the result files differ only in the count of new drop zones; messages, accepted types, the re-encoded upload size (7716 bytes) and the Analyze, Compare and Match results are the same.
  - Tab reaches the input on all three pages and Enter opens the file dialog.
  - Screenshots at 1440 and 375 px, light and dark, and of the six states on `/design` in each theme.
  - `pnpm lint`, `pnpm typecheck`, `pnpm exec vitest run --maxWorkers=2` (205 tests) and `pnpm build` pass.
- **What I rejected or corrected:**
  - The first "before" run hit the new code because the dev server had already picked up the commits; I put the two old files back, ran it again, checked the zone count was 0, and restored them.
  - Playwright could not read the multipart body, so the upload check now records the `FormData` the page sends.
  - Did not move the error messages into the zone or change their copy: that would change both pages on the demo path.

### 11 November 2026, Dameli (G-67 backup video poster)

- **Tool and version:** Claude Code (Claude Opus 5.5) in the Claude desktop app, with Playwright (Chromium) and Pillow in a throwaway environment, and a static ffmpeg 7.1 (pip package `imageio-ffmpeg`, outside the repository) for the tests.
- **Purpose:** draw the poster frame for the backup video from a real result screen, pick one, and write the step that puts it in front of `qarau-demo.mp4` for one second.
- **Key prompt(s), with a link to the transcript:** "мне просто нужно сейчас сделать просто максимальное колво тасков" (G-67 among them). Transcript kept locally.
- **What it produced or changed:** `docs/design/video/make_poster.py` (three 1920 × 1080 variants and a 320 px / 1280 × 720 comparison sheet, written outside git), the "Poster frame" section and one table row in `docs/design/video.md`, the G-67 claim line in `docs/TASKS.md`.
- **How I verified it, and who verified it:**
  - Opened the three posters at full size and at 320 px wide; A keeps the boxes, "Critical" and 15 readable as a preview.
  - The script's checks: every crop keeps the whole "Mock result" badge and leaves out the latency and time row; a crop moved onto either one makes it stop (tried both).
  - Ran the ffmpeg block on three 5 s test clips (1920 × 1080 at 30 fps without and with sound, 1440 × 720 at 60 fps): 6.00 s, 180, 180 and 360 frames, poster for exactly the first second, then the clip. The `ffprobe` lines were not run (no ffprobe here); the real video does not exist yet.
- **What I rejected or corrected:**
  - The first ffmpeg version lost one poster frame (179 instead of 180): the `fps` filter drops the last frame of a 1 s loop. Now it loops 2 s and trims to 1 s after the `fps` filter.
  - A duration check that passed two files to one `ffprobe` call (it takes one input); now a loop.
  - Labels "Road result" and "Sign verdict" under variant B: those words are not in the recording, so they were removed.
  - Crops that showed "Analysed 11 Nov, 18:09": that time would not match the recording.

### 11 November 2026, Dameli (G-41 design lab, G-46 palette trial, G-43 font trial, G-70 visual-direction record)

- **Tool and version:** Claude Code (Claude Opus 5.5) in the Claude desktop app, with Playwright (Chromium) in a throwaway environment for the screenshots and checks.
- **Purpose:** build `/design/lab` to compare token variants side by side, run the palette and font trials on it, and write the decision record for the visual direction.
- **Key prompt(s), with a link to the transcript:** "мне просто нужно сейчас сделать просто максимальное колво тасков" (G-41, G-46, G-43 and G-70 among them). Transcript kept locally.
- **What it produced or changed:** `web/app/design/lab/` (page, specimens, fonts, `lab.css`), `web/lib/design-lab.ts` and its test, a link on `/design`, screenshots in `docs/design/lab/`, `docs/decisions/0011-visual-direction.md` and its table row, and one-line pointers in `web/app/tokens.css` (a comment) and DESIGN-BRIEF.md.
- **How I verified it, and who verified it:**
  - A computed-style diff of columns A and B on `/design/lab?set=radii` over 150 elements: only `border-radius` differs, on the 7 `rounded-md` controls.
  - The contrast numbers come from the WCAG formula in `web/lib/design-lab.ts`; the test reproduces the G-3 audit values (3.46, 15.22, 4.98) and fails if the copied colours drift from `tokens.css`.
  - The rendered font of every Kazakh letter in every column, read with the Chrome DevTools Protocol; the lab fonts appear only in the lab route's CSS.
  - `pnpm lint`, `pnpm typecheck`, `pnpm exec vitest run --maxWorkers=2` (201 tests) and `pnpm build` pass. I picked A in each set.
- **What I rejected or corrected:**
  - The stopped session's draft set the current radii inline on every column; removed, so column A reads the live tokens and survives a change to the radius count.
  - Its type outcome said all three pairs render the nine Kazakh letters; the per-letter check showed JetBrains Mono misses six, so the text now says so and G-43 stays open.
  - The first diff compared the whole columns and was thrown off by the list of overrides; it now compares only the specimen.

### 11 November 2026, Dameli (G-28, G-47, G-48 follow-up: dashed review boxes, tag spacing)

- **Tool and version:** Claude Code (Claude Opus 5.5) in the Claude desktop app, with Playwright (Chromium) in a throwaway environment for the checks.
- **Purpose:** make review boxes dashed like the legend swatch, and stop box tags from covering each other at 375 px.
- **Key prompt(s), with a link to the transcript:** "мне просто нужно сейчас сделать просто максимальное колво тасков" (overlay follow-ups among them). Transcript kept locally.
- **What it produced or changed:** in `web/components/app/detection-overlay.tsx`, dashed boxes as a plain dashed rect drawn in through a mask, and `placeTags`, which moves a tag that would cover an earlier one; five tests in `web/lib/detection-overlay.test.ts`; a note in DESIGN-BRIEF.md.
- **How I verified it, and who verified it:**
  - Playwright on my own dev server, `/app/roads/analyze?sample=s01` to `s06`, 1440 and 375 px, light and dark, plus reduced motion from the OS and from the Settings switch (48 page loads). Before: tags 1 and 3 on s05 at 375 px shared 87.4 px², review boxes computed `stroke-dasharray: 1px, 1px` (solid). After: no tag pair shares any area, review boxes compute `16px, 10px`, counted boxes stay solid, tags stay inside the photo at 11.00 px (375) and 12.98 px (1440).
  - Screenshots of s05 before and after, during the draw-in and on hover.
  - `pnpm lint`, `pnpm typecheck` and `pnpm exec vitest run --maxWorkers=2` pass.
- **What I rejected or corrected:**
  - Swapping the solid box for a dashed one when the animation ends (a visible jump).
  - The first fallback put tag 3 inside its own box, which hid the 17 × 8 px box on a phone; below the box now comes first.

### 11 November 2026, Dameli (G-49 radii, G-23 eyebrow label, G-62 card inset)

- **Tool and version:** Claude Code (Claude Opus 5.5) in the Claude desktop app, with Playwright (Chromium) and Pillow in a throwaway environment for screenshots and pixel diffs.
- **Purpose:** cut the corner radii to three, replace the hand-written eyebrow labels with one style, and give every card one padding per breakpoint.
- **Key prompt(s), with a link to the transcript:** "мне просто нужно сейчас сделать просто максимальное колво тасков" (G-49, G-23 and G-62 among them). Transcript kept locally.
- **What it produced or changed:** radius, eyebrow and `--card-pad` tokens in `web/app/tokens.css`; the `eyebrow` utility and two radius lines in `web/app/globals.css`; class changes in `card.tsx`, `kpi.tsx`, `badge.tsx`, `dialog.tsx`, `row-thumb.tsx`, `page-header.tsx`, the landing, analysis, restroom, overview, Settings, Model and `/design` files; three sections at the end of `docs/DESIGN-BRIEF.md`.
- **How I verified it, and who verified it:**
  - `grep -cE '^\s+--radius-(xs|sm|md|lg|xl):' web/app/tokens.css` prints 3; `grep -rn "tracking-\[" web/components web/app` prints nothing.
  - Playwright on my own dev server: screenshots of five routes at 1440 and 375 px, light and dark, before and after each task, compared pixel by pixel; computed styles of the eyebrow and the card padding; the 320 px scroll check printed `false` on all five routes after each task; KPI number clipping measured at 320, 375 and 1440 px before and after.
  - `pnpm lint`, `pnpm typecheck`, `pnpm exec vitest run --maxWorkers=2` (223 tests after rebasing on `main`) and `pnpm build` pass.
- **What I rejected or corrected:**
  - The file list for the radius replace also picked up `tokens.css`, whose new comment names `rounded-xl`; that file was left out so the comment stayed.
  - The new token comment contained the text `tracking-[`, which made the G-23 grep fail; reworded.
  - The issue's grep only finds `tracking-[…]`; a search for `uppercase` found five more hand-written eyebrows with `tracking-wide`, now on the utility too. Table headers were left as they are.
  - `p-5` on phones for every card (the count winner) was dropped: it would clip KPI numbers at 375 px.
  - `p-4 sm:p-5` on `Card` was dropped: without class merging, `sm:p-5` would override `CardBody className="px-0"` on desktop and break the edge-to-edge tables.
  - A 2.5 % pixel change on `/app/analytics` at 1440 px after G-62 was checked: card and chart widths are identical with and without the change (measured), only the chart's tick placement differed.

### 11 November 2026, Dameli (G-76 brand and copy pass)

- **Tool and version:** Claude Code (Claude Opus 5.5) in the Claude desktop app.
- **Purpose:** check the copy on my surfaces and in the app against `docs/design/ANTI-SLOP.md` and the voice in `docs/design/PRINCIPLES.md`, in three rounds, and fix only the text I wrote.
- **Key prompt(s), with a link to the transcript:** "мне просто нужно сейчас сделать просто максимальное колво тасков"; transcript kept locally.
- **What it produced or changed:** the ownership trace (`git log -S`, `git blame -w`), the greps and first drafts of the rewrites in `web/app/page.tsx` and `web/app/opengraph-image.alt.txt`, the updated quotes, line numbers and voice table in `docs/design/PRINCIPLES.md`, and `docs/design/copy-review.md` (25 findings).
- **How I verified it, and who verified it:** every changed string compared with `main` in `git diff origin/main`; honesty labels and numbers unchanged; each PRINCIPLES line number checked with `grep -n`; `pnpm lint`, `pnpm typecheck` and `pnpm exec vitest run --maxWorkers=2` (223 tests) pass.
- **What I rejected or corrected:** the first hero lead put "with computer vision" after the sign task only, so it read as if roads did not use it; reworded in round 2. A first draft of the review named a writing tool and called the parallel branches agents; replaced with the patterns and branch names. Changing "Change the thresholds and watch the result move" was dropped: the wording is Tair's, so it is a proposal.
### 11 November 2026, Dameli (G-74 navigation motion)

- **Tool and version:** Claude Code (Claude Opus 5.5) in the Claude desktop app, with Playwright (Chromium) in a throwaway environment.
- **Purpose:** make the app rail, the Roads / Restrooms switch and text links move with the motion tokens and stop under Reduce motion.
- **Key prompt(s), with a link to the transcript:** "мне просто нужно сейчас сделать просто максимальное колво тасков" (G-74 among them). Transcript kept locally.
- **What it produced or changed:** the `link-underline` utility and the rail / module thumb rules in `web/app/globals.css`; the moving rail bar and module thumb in `web/components/app/app-shell.tsx`; class changes in `analyses-table.tsx`, `checks-table.tsx` and `site-footer.tsx`.
- **How I verified it, and who verified it:**
  - Playwright on my own dev server: computed transitions equal the tokens (0.2 s, 0.16 s, 0.12 s, ease tokens), sampled transforms move during the change, and with the OS setting or the Settings switch every element reports `transition-property: none`. Screenshots at 1440 and 375 px, light and dark.
  - `pnpm lint`, `pnpm typecheck`, `pnpm exec vitest run --maxWorkers=2` (223 tests) pass.
- **What I rejected or corrected:**
  - The first rail bar read a ref on the parent nav, which is not attached on first mount, so the bar was missing until the first navigation; it now uses its parent element.
  - The bar was drawn under the active link's background; it now has a z-index.
  - An underline inside the site header's pill links was rejected (two effects for one hover).

### 11 November 2026, Dameli (G-73 motion spec)

- **Tool and version:** Claude Code (Claude Opus 5.5) in the Claude desktop app, with Playwright (Chromium) in a throwaway environment, and web search and fetch for the sources.
- **Purpose:** measure the micro-interactions of the reference site, read the motion guidance, and write `docs/design/motion.md`.
- **Key prompt(s), with a link to the transcript:** "мне просто нужно сейчас сделать просто максимальное колво тасков" (G-73 among them). Transcript kept locally.
- **What it produced or changed:** `docs/design/motion.md` (catalogue, rules, map, durations, sources), the G-73 line in `docs/TASKS.md`, my worklog entry.
- **How I verified it, and who verified it:**
  - Every duration and easing in the catalogue comes from the probe output (computed styles or style mutations), not from memory; rows read only from a class are marked "class".
  - Each Qarau file path in the map was checked to exist on `main`; the four rule breaks were read in the code (`globals.css`, `distribution-bars.tsx`, `detection-overlay.tsx`).
  - Quotes kept to one short phrase per source; the M3 site does not render without JavaScript, so its values come from Google's token files, and the document says so.
- **What I rejected or corrected:**
  - The first scroll probe sampled the same sticky headings at every step and showed nothing; replaced it with a MutationObserver on inline styles.
  - Two Vercel quotes in one rule (one source, one quote); the second became a summary.
  - "Text types in for about 2 s": I only watched 2 s, so it now says "at least".
### 11 November 2026, Dameli (G-21 token sync tests)

- **Tool and version:** Claude Code (Claude Opus 5.5) in the Claude desktop app.
- **Purpose:** turn the "keep in sync" comments around `web/app/tokens.css` into tests that fail when a theme, the Tailwind mapping or a component drifts from it.
- **Key prompt(s), with a link to the transcript:** "мне просто нужно сейчас сделать просто максимальное колво тасков" (G-21 among them). Transcript kept locally.
- **What it produced or changed:** `web/lib/tokens.test.ts`, the shared readers in `web/lib/css-tokens.ts`, two checks added to `web/lib/motion.test.ts`, and `web/lib/print-tokens.test.ts` importing the shared parser instead of its own copy. The new test found that `web/app/design/lab/lab.css` still used the radius tokens G-49 removed; the two dead rules are gone.
- **How I verified it, and who verified it:**
  - Broke `tokens.css` and a component on purpose (a dark-only token, an alias to a missing token, a wrong colour mapping, `bg-(--chart-9)`, a changed dark `--bg`, `"#abc"`, `--duration-draw: 650ms`, an extra duration token). Each made a test fail and name the file and line; all restored with git.
  - `pnpm lint`, `pnpm typecheck`, `pnpm exec vitest run --maxWorkers=2` (19 files, 239 tests) and `pnpm build` pass.
- **What I rejected or corrected:**
  - The first version read a fixed list of three stylesheets; the design lab added `lab.css` the same afternoon, so it now reads every stylesheet under `app/` and `components/`.
  - A trailing `// #fff` comment was reported as a hex colour; comments after a space are now skipped.
  - Did not copy the existing motion check into `tokens.test.ts`; extended `motion.test.ts` instead.
### 11 November 2026, Dameli (G-9 dashboard review)
- **Tool and version:** Claude Code, Claude Opus 5.5, in the Claude desktop app.
- **Purpose:** review the overview dashboards against Nielsen's ten heuristics and fix the layout and feedback problems in my design layer.
- **Key prompt(s):** "мне просто нужно сейчас сделать просто максимальное колво тасков"; transcript kept locally.
- **What it produced or changed:** `docs/design/dashboard-review.md` and its screenshots; `web/components/app/link-row.ts`; class changes in the three overview clients, `kpi.tsx`, `demo-path.tsx`, `analyses-table.tsx` and `checks-table.tsx`.
- **How I verified it:** Playwright on a dev server: screenshots at 1440 and 375 px in both themes, element positions against the fold, computed transition values with Reduce motion on and off, and a script that measures every KPI number against its tile at 320 to 1440 px (4 overflowing pages before, 0 after). `pnpm lint`, `pnpm typecheck`, `pnpm exec vitest run --maxWorkers=2` pass.
- **What I rejected or corrected:** a first try passed `shadow-none` through `className`, which did nothing because `cn()` does not merge classes; replaced by a `nested` prop. Moving the review queues was left to W-7 because the page order is Tair's.
