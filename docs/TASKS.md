# Task board

Every task has an ID, an owner lane, what it needs first, and a check that shows it is done. Tick the box in a commit when you finish. Owners are proposals until kickoff. Time estimates are rough.

Priority: **P0** the defense fails without it, **P1** expected, **P2** stretch.

Checkpoints are C1 (Tue 18:00), C2 (Tue 23:00), C3 (Wed 12:00) and feature freeze (Wed 16:00). See [PLAN.md](PLAN.md).

## Critical path

Everything else can slip. This chain cannot:

Roboflow access (X-12) → dataset card (D-1) → quality look (D-2) → duplicate groups (D-4) → frozen version zip in Drive (D-3) → smoke run (M-1) → **E0 by Tuesday 23:00** (M-3) → E1–E5 and E7 in parallel (M-4..M-10) → E8 (M-11) → results export and plots (M-12, M-13) → real numbers in the deck by Wednesday 16:00.

If E0 is not finished on Tuesday night, there is no honest pothole results table on Thursday.

The restroom module has its own, shorter chain and needs no GPU for its first runs: data download (C-1) → zero-shot runs R0, R1, R6 on a laptop (C-2) → export to the web app (C-5) → fine-tuning runs in Colab (C-3, C-4) → final export.

## If we fall behind, cut in this order

1. E6, seeds, external test set, map coordinates, ONNX, call logging (M-9, M-16, M-17, D-9, D-10, S-11, S-12).
2. Cloud mode and its latency, Lighthouse pass, the public Space (S-7, S-9, S-10, S-6). Keep Gradio running locally.
3. Map, motion pass, mobile pass, logo, landing visuals, reports, analytics (W-13, W-15, W-17, G-5, G-8, W-8, W-9).
4. Error analysis down to three images (M-14). Rules calibration (D-6): state the thresholds as uncalibrated.
5. E7, only if the run fails twice.

Restroom module, cut in this order: R5 augmentation (C-4), then R2/R3 (keep R4, the reference recipe), then the Gradio restroom tab.

Never cut: E0–E5 with their result files, restroom R0, R1, R6 and one fine-tuning run, the selection rule (M-0), the operating-point metrics (M-19), the two-model AI audit (R-6), duplicate grouping (D-4), the clustering task (D-11), the study cards, the LMS check (X-11), the prompt logs (X-13), the demo video.

## X: coordination (Tair)

| Done | ID | P | Task | Needs | Done when | Est |
|---|---|---|---|---|---|---|
| [ ] | X-1 | P0 | Create the repo, push the scaffold, invite teammates | — | Everyone can clone | 20 m |
| [ ] | X-2 | P0 | Kickoff message in the group chat: repo link, lanes, checkpoints | X-1 | Everyone replied with their lane | 15 m |
| [ ] | X-3 | P0 | Book the defense slot in the instructor's list. Confirm all six share one lab instructor | — | Slot time written in PLAN.md | 15 m |
| [ ] | X-4 | P0 | Add Roma to the repo when he sends his username | — | Roma accepted | 5 m |
| [ ] | X-5 | P0 | Shared Google Drive folder: dataset zip, weights, slides, video | — | Link in README | 10 m |
| [ ] | X-11 | P0 | Ask the lab instructor whether Assignment #2 needs an LMS upload (the syllabus says the project is "submitted through the LMS", the assignment sheet says nothing is submitted). Either way, upload the deck PDF and the repo link before Thursday's class | — | Answer written in PLAN.md, upload done | 20 m |
| [ ] | X-12 | P0 | Give Amina access to the Roboflow workspace, or do D-1 and D-3 together with her. The exported zip goes to Drive so nobody shares an API key | — | Amina can open the project | 20 m |
| [ ] | X-13 | P0 | Prompt logs: each member saves their AI transcripts (Claude Code export, ChatGPT share links) under `docs/ai-logs/<name>/` and links them from their entry in AI-USAGE-LOG.md. Remove anything personal before committing | — | Six folders, or "no AI used" | 15 m each |
| [ ] | X-7 | P0 | Everyone fills their row in CONTRIBUTION-LOG.md | — | Six rows complete by code freeze | ongoing |
| [ ] | X-8 | P0 | Run checkpoints C1, C2, C3 in the chat: each lane posts done, blocked, next | — | Three checkpoint messages | 3×10 m |
| [ ] | X-14 | P1 | Check that `web/data/experiments.json` (web side) and `ml/export_results.py` (model side) use the same field names. The schema is in ARCHITECTURE.md section 2 | W-1 | Model page renders a file made by the export script | 15 m |
| [ ] | X-9 | P1 | Tag `defense` on `main` at code freeze | all | Tag pushed | 5 m |
| [ ] | X-10 | P1 | Confirm the name Qarau or pick another (one constant in `web/lib/brand.ts`), then freeze it | — | Decision in the chat | 10 m |
| [ ] | X-15 | P0 | Confirm the new lanes at kickoff: Nazar on the restroom model, Amina on the pothole model with Alizhan's Colab help | — | Lanes confirmed in the chat | 10 m |

## D: data and rules (Amina, with Roma)

| Done | ID | P | Task | Needs | Done when | Est |
|---|---|---|---|---|---|---|
| [ ] | D-1 | P0 | Identify the dataset: original name, author, URL, licence, image count, classes. Search Kaggle for the same dataset and cite the Kaggle URL if it exists (the syllabus lists Kaggle as an allowed source, not Roboflow Universe). Write it all in `data/README.md` | X-12 | Dataset card complete, licence is an open one | 40 m |
| [ ] | D-2 | P0 | Look through 100 random images and labels. Note bad labels, odd images, whether photos are close-ups or dashcam frames, and whether file names show baked-in augmentation (`.rf.<hash>`) | D-1 | Quality note in `data/README.md` | 45 m |
| [ ] | D-4 | P0 | **Before splitting:** group images by the file-name stem before `.rf.`, and find near-duplicates with a perceptual hash (`imagehash.phash`, distance 5 or less). Keep one image per group, or keep whole groups in one split | D-2 | Counts of groups and removed images in `data/README.md` | 45 m |
| [ ] | D-3 | P0 | Create one Roboflow dataset version: 70/15/15 split, auto-orient only, **no resize, no offline augmentation**. Export in YOLO format, put the zip in Drive, post the version name | D-4 | Zip in Drive | 20 m |
| [ ] | D-12 | P0 | Screen every image that leaves the team (the AI audit in R-6, Space examples, `web/public/samples`) for faces and licence plates, and strip EXIF | D-3 | Checklist in `data/README.md` | 30 m |
| [ ] | D-11 | P0 | Clustering: k-means with k=3 (scikit-learn) on the log of box area (w×h) of the training labels. The cluster boundaries become the small, medium and large bands of rule R2. Histogram with the cuts marked | D-3 | Thresholds in RULES.md and `web/lib/rules` updated, plot in `ml/results/` | 45 m |
| [ ] | D-5 | P1 | Pick 6–10 real sample photos for the app from the **test** split. Put them in `web/public/samples/`, update `samples.json` with attribution | D-3, D-12 | App shows real photos | 45 m |
| [ ] | D-6 | P1 | Check the rules against human judgment: run the final model on 30 validation photos, compare a person's priority with the rule's priority, adjust the severity bands | M-11, S-2 | Table of 30 photos and the agreement rate | 1.5 h |
| [ ] | D-7 | P1 | Privacy note: what a road photo can contain (faces, plates, GPS in EXIF) and what the app does about it. Cite Syl p.9 and Lec4-DataMgmt p.12–14 | — | Paragraph for the About page and one slide bullet | 30 m |
| [ ] | D-8 | P1 | Related work: three sources on pothole detection with YOLO (for example the RDD2022 road damage dataset paper). One line each for the deck | — | Three references with links in `docs/research/datasets.md` | 45 m |
| [ ] | D-13 | P0 | Study card: dataset source and licence, how duplicates and leakage were handled, what k-means did, one worked rules example, the privacy rule | — | Passed three practice questions | 45 m |
| [ ] | D-9 | P2 | External test set: 30–50 Astana pothole photos, screened per D-12 before any upload, annotated as a separate project | D-12 | Dataset version shared with the model lane | 3 h |
| [ ] | D-10 | P2 | Real coordinates for the map: sample 200 rows from the EDK CSV with attribution | W-1 | Map shows them, attribution on the About page | 45 m |

## M: pothole model (Amina, with Alizhan running Colab jobs)

| Done | ID | P | Task | Needs | Done when | Est |
|---|---|---|---|---|---|---|
| [ ] | M-0 | P0 | Read the selection rule in ML-EXPERIMENT.md, agree or change it, and commit it **before E1 starts** | — | Commit time is earlier than the E1 start time | 15 m |
| [ ] | M-1 | P0 | Colab: clone, install the pinned versions, unzip the dataset, run `ml/train.py --run E0 --smoke`. Fix the script where it breaks and commit | D-3 | `ml/results/runs/E0-smoke.json` exists | 1.5 h |
| [ ] | M-2 | P0 | Routine after each run: commit the run JSON, copy `best.pt` to Drive as `jolscan-<run>.pt` | M-1, X-5 | Written in the notebook's last cell | 15 m |
| [ ] | M-3 | P0 | Run E0 baseline. **Deadline Tuesday 23:00** | M-1 | `E0.json` committed, weights in Drive, posted to the serving lane | 45 m |
| [ ] | M-4 | P0 | Run E1 model width | M-3 | Same | 60 m |
| [ ] | M-5 | P0 | Run E2 no transfer learning | M-3 | Same | 45 m |
| [ ] | M-6 | P0 | Run E3 frozen backbone | M-3 | Same | 35 m |
| [ ] | M-7 | P0 | Run E4 optimizer | M-3 | Same | 45 m |
| [ ] | M-8 | P0 | Run E5 standard augmentations off | M-3 | Same | 35 m |
| [ ] | M-10 | P0 | Run E7 extra P2 detection scale. Write three sentences on what the P2 head adds in `ml/README.md` | M-3 | Same, plus the explanation | 1 h |
| [ ] | M-11 | P0 | Apply the selection rule to E1–E7 (whichever ran), fill in E8 in `train.py`, train it | M-4..M-10 | `jolscan-e8.pt` in Drive | 60 m |
| [ ] | M-12 | P0 | Run `ml/export_results.py` after E0–E5, and again after E8. Commit the CSV and `web/data/experiments.json` | M-3..M-8, M-11 | Model page shows real numbers, the "Demo data" badge is gone | 20 m |
| [ ] | M-19 | P0 | Operating point of the final model: precision, recall, F1 at confidence 0.40 on test, with true-positive, false-positive and false-negative counts | M-11 | Row "operating point" in the results table | 30 m |
| [ ] | M-13 | P0 | Plots for the deck: bar chart of mAP50 and recall per run, training curves for E0, E2, E5, confusion matrix and PR curve of the final model | M-12 | PNG files in `ml/results/` | 45 m |
| [ ] | M-18 | P0 | Study card: IoU, mAP, precision and recall, transfer learning, what each run changed and why, SGD and AdamW in one sentence each, the selection rule | — | Passed three practice questions | 45 m |
| [ ] | M-14 | P1 | Error analysis: test photos where the final model fails (missed, false alarm), grouped by cause | M-11 | Slide-ready grid in `ml/results/` | 45 m |
| [ ] | M-21 | P1 | For the MLflow tab at the defense: on the presenting laptop, re-log the run JSON files into one local MLflow store with a short script | M-12 | `mlflow ui` shows all runs | 30 m |
| [ ] | M-9 | P2 | Run E6 resolution 960 | M-3 | Same as other runs | 80 m |
| [ ] | M-16 | P2 | Repeat E0 and E8 with seeds 0 and 1, report mean and spread | M-11 | Table in ML-EXPERIMENT.md | 2.5 h |
| [ ] | M-17 | P2 | Evaluate the final model on the external test set | D-9, M-11 | Separate table | 30 m |

## C: restroom model (Nazar)

Experiment design: [ML-EXPERIMENT-RESTROOM.md](ML-EXPERIMENT-RESTROOM.md). Code: `ml/restroom/`. This lane and its files are Nazar's: ask Nazar before editing them.

| Done | ID | P | Task | Needs | Done when | Est |
|---|---|---|---|---|---|---|
| [x] | C-1 | P0 | Download the IOAI Restroom data with `ml/restroom/get_data.py` and check the counts (82×4 train, 10/20 validation, 30/60 test, answers) | — | Script prints the expected counts | 15 m |
| [x] | C-2 | P0 | Run R0, R1 and R6 on a laptop CPU. Check that R0 lands near the IOAI baseline of 0.77 on test; if not, find out why before trusting other runs | C-1 | Three run files in `ml/results/restroom/runs/` | 1 h |
| [ ] | C-3 | P0 | R2 and R3 already ran on a laptop CPU. In Colab with a GPU: run R4 (fine-tune the last 6 blocks, the IOAI reference recipe) | C-2 | Run files committed, weights in Drive | 2 h |
| [ ] | C-4 | P1 | Run R5 (R4 plus augmentation) | C-3 | Run file committed | 45 m |
| [ ] | C-5 | P0 | Run `ml/restroom/export_results.py` after each batch of runs and commit `web/data/restroom-experiments.json` | C-2 | Model page shows the real rows without a demo badge | 15 m |
| [ ] | C-6 | P0 | Plots for the deck: matching accuracy per run with the IOAI 0.77 and 0.90 lines, gender accuracy for prompts against the logistic-regression probe, three failure cases (query, wrong match, right match). Partly done: approach ladder, layer curves and layer probe are in `ml/results/restroom/figs/`; failure cases still to do | C-5 | PNG files in `ml/results/restroom/` | 45 m |
| [x] | C-7 | P0 | Check the signage thresholds and redesign S2 as a comparison between the two signs (see ML-EXPERIMENT-RESTROOM.md, "Known problem"): plot gender confidence and pair similarity on the validation set, see where S1 0.80 and S3 0.75 fall, adjust RULES.md part 2 and `web/lib/signage` if needed | C-2 | Thresholds cite the plot | 45 m |
| [ ] | C-8 | P0 | With Alizhan: run the API's `/restroom/compare` and `/restroom/match` locally on the chosen model, connect the web app's local provider | C-3, S-1 | Compare and Match in the web app show real predictions | 45 m |
| [ ] | C-9 | P0 | Study card: what CLIP and a ViT are, zero-shot against fine-tuning, why training more layers can overfit on 82 restrooms, top-1 accuracy, grouped cross-validation and why it prevents leakage | — | Passed three practice questions | 45 m |
| [ ] | C-10 | P2 | Add a restroom tab to the Gradio demo | C-3, S-5 | Tab works locally | 30 m |
| [x] | C-11 | P0 | Two-step pipeline without training: SIFT with a pixel check, colour histograms, global assignment (`pipeline.py`) | C-1 | `pipeline.json` committed: 30/30 test, 10/10 validation | done |
| [x] | C-12 | P0 | Layer experiment: fine-tune the last N CLIP blocks (0–12) and ResNet50 stages (0–5), grouped 5-fold CV, 3 seeds, on Kaggle (`layers.py`). Replaces C-3/C-4's single R4 run as the "number of layers" comparison | C-11 | 42 run files and `layers.csv` committed, figures in `ml/results/restroom/figs/` | done |
| [x] | C-13 | P1 | Per-layer probe of frozen CLIP and ResNet50 features (`layer_probe.py`) | C-1 | `layer_probe.json` and figure committed | done |

## S: serving and performance (Alizhan, with Tair)

| Done | ID | P | Task | Needs | Done when | Est |
|---|---|---|---|---|---|---|
| [ ] | S-1 | P0 | Run `api/` locally with the stock weights (`ANY_CLASS=1 MODEL_WEIGHTS=yolo26n.pt`). Fix the starter code where it breaks and commit | — | `GET /health` answers, `POST /predict` returns the contract JSON | 45 m |
| [ ] | S-2 | P0 | Swap in the team's weights (`jolscan-e0.pt` first, `jolscan-e8.pt` when it exists) | M-3 | Detections on a pothole photo look right | 10 m |
| [ ] | S-4 | P0 | Connect the web app's local provider to the API with Tair | S-1, W-6 | Upload in the web app shows real boxes | 45 m |
| [ ] | S-5 | P0 | Gradio app: upload a photo, see boxes and the detection table. This is the course's own interface format | S-1 | Runs locally with `python api/gradio_app.py` | 30 m |
| [ ] | S-14 | P0 | Wednesday afternoon: install the API environment on the presenting laptop, weights on disk, measure cold start, run once with Wi-Fi off | M-11 | Works offline on that laptop | 45 m |
| [ ] | S-13 | P0 | Study card: REST and status codes, why FastAPI, Batch, Online and Edge deployment, local against cloud trade-offs, MLOps loop and maturity level | — | Passed three practice questions | 45 m |
| [ ] | S-3 | P1 | Tests for input validation: wrong file type, file over 10 MB, valid image | S-1 | `pytest api/` passes | 30 m |
| [ ] | S-15 | P1 | Latency: in one Colab session, time every `jolscan-<run>.pt` with batch size 1 over 100 test images, median and 95th percentile. Repeat for the final model on the presenting laptop's CPU. Write `ml/results/latency.json` | M-12 | Latency column filled from this file only | 30 m |
| [ ] | S-8 | P1 | Dockerfile builds and runs the API (needs the weights file in `api/weights/`) | S-1, M-3 | `docker run` then `/health` answers | 30 m |
| [ ] | S-6 | P1 | Gradio demo on a Hugging Face Gradio Space, with screened public dataset images only | S-5, M-11, D-12 | Space URL in README | 45 m |
| [ ] | S-7 | P1 | Cloud provider for the web app: a Hugging Face Docker Space built from `api/` (`sdk: docker`, `app_port: 8000`), serving the same E8 weights | S-8, M-11 | Cloud mode returns detections in the web app | 1 h |
| [ ] | S-9 | P1 | Latency of local against cloud for the final model, 50 images, median | S-7 | One row on the architecture slide | 30 m |
| [ ] | S-10 | P1 | Web performance pass: Lighthouse on landing and dashboard, fix the top three issues | C2 | Scores before and after in the pull request | 1 h |
| [ ] | S-11 | P2 | Export the final model to ONNX and compare CPU latency | M-11 | Row in the latency table | 45 m |
| [ ] | S-12 | P2 | Log each `/predict` call (time, latency, count, mean confidence) to a CSV, as a real feed for the analytics page | S-1 | CSV grows on each call | 45 m |

## W: web app and UX (Tair, with Dameli)

The scaffold already gives working pages on demo data. P0 here means "works at the defense". Visual polish is P1.

| Done | ID | P | Task | Needs | Done when | Est |
|---|---|---|---|---|---|---|
| [ ] | W-1 | P0 | Scaffold: Next.js app, routes, tokens, mock data, rules engine, provider switch | — | `pnpm build` passes | see commit |
| [ ] | W-2 | P0 | Review the scaffold page by page, list what to fix | W-1 | Checklist in the chat | 30 m |
| [ ] | W-6 | P0 | Analyze flow: upload, sample picker, loading, result with boxes, rule hits, errors | W-1 | Works on mock and local providers | 2 h |
| [ ] | W-20 | P0 | Offline check: Wi-Fi off, mock provider, whole demo path | W-6 | Works on the presenting laptop | 15 m |
| [ ] | W-21 | P0 | Remove every placeholder: team roles, dataset card, results, copy | M-12, D-1 | Search for "placeholder", "lorem", "TODO" finds nothing in `web/` | 30 m |
| [ ] | W-22 | P0 | Study card (Tair): architecture diagram from memory, why three providers, why rules sit after the model, how the team divided the work | — | Passed three practice questions | 30 m |
| [x] | W-23 | P0 | Second module in the web app: restroom compare, match, rules, overview; platform overview; landing and copy rewritten for two modules | — | Build and tests pass, both modules work on demo data | see commit |
| [x] | W-24 | P0 | Deploy to Vercel from GitHub (root directory `web`), mock provider by default, link in README | W-23 | Public URL opens both modules | 20 m |
| [ ] | W-3 | P1 | Collect design references, write the direction in DESIGN-BRIEF.md | — | Brief section filled in | 1 h |
| [ ] | W-4 | P1 | Apply the references to tokens: colours, type, radii, shadows, motion | W-3 | `/design` page reflects the new look in both themes | 1.5 h |
| [ ] | W-5 | P1 | Landing page polish: hero with animated detection demo, how it works, features, results teaser, team | W-4 | Passes the page checklist in DESIGN-BRIEF.md | 3 h |
| [ ] | W-7 | P1 | Dashboard polish: KPI tiles, severity distribution, recent analyses, review queue | W-4 | Checklist passes | 2 h |
| [ ] | W-10 | P1 | Rules page: toggles, thresholds, live preview | W-1 | Changing a threshold changes the preview severity | 1.5 h |
| [ ] | W-11 | P1 | Model page: real experiments table, champion, metric explanations, lifecycle diagram | M-12, X-14 | No mock badge | 1 h |
| [ ] | W-12 | P1 | Settings: provider with health check, counting threshold τ labelled as a rules setting, privacy options, theme | W-1 | Health check shows a clear state for up and down | 1 h |
| [ ] | W-14 | P1 | About page: method, limitations, privacy, dataset and licence, team, AI-use statement | D-1, D-7 | Reads well, no placeholder text | 1 h |
| [ ] | W-16 | P1 | Empty, loading and error states for every page | W-6 | Each state seen once on purpose | 1 h |
| [ ] | W-18 | P1 | Accessibility pass: keyboard path through upload to result, focus rings, contrast 4.5:1, alt text | W-6 | Checklist in DESIGN-BRIEF.md ticked | 45 m |
| [ ] | W-19 | P1 | Deploy to Vercel with the mock provider as default | W-6 | URL in README | 30 m |
| [ ] | W-8 | P1 | Reports list and detail | W-1 | Filters work, detail shows boxes and rule hits | 1.5 h |
| [ ] | W-9 | P1 | Analytics page with charts | W-4 | Chart types follow the rules in DESIGN-BRIEF.md | 2 h |
| [ ] | W-13 | P1 | Map page | W-1 | Markers by severity, popup links to the report | 1 h |
| [ ] | W-15 | P1 | Motion pass: entry stagger, count-up, box draw-in, page transitions, reduced-motion check | W-5, W-7 | Smooth on the presenting laptop | 1.5 h |
| [ ] | W-17 | P1 | Mobile pass at 375 px and tablet pass | W-5, W-7 | No horizontal scroll, tap targets at least 48 px | 1 h |

## G: design system and visuals (Dameli, with Tair)

| Done | ID | P | Task | Needs | Done when | Est |
|---|---|---|---|---|---|---|
| [ ] | G-1 | P0 | Read DESIGN-BRIEF.md, run the app, look at `/design` | W-1 | Can run `pnpm dev` | 30 m |
| [ ] | G-12 | P0 | Study card: Nielsen heuristics with one example each from our app, WCAG contrast, Fitts and Hick, why each chart type was chosen | — | Passed three practice questions | 45 m |
| [ ] | G-2 | P1 | Moodboard with Tair: 5–8 references for landing and dashboard | — | Links in DESIGN-BRIEF.md | 1 h |
| [ ] | G-3 | P1 | Colour tokens for light and dark, including the five severity colours, checked for contrast and for colour-blind safety | G-2 | Contrast values listed in DESIGN-BRIEF.md | 1 h |
| [ ] | G-4 | P1 | Type scale and font choice (one display, one text, one mono for numbers) | G-2 | Applied in tokens | 45 m |
| [ ] | G-10 | P1 | Slide template that matches the design system (colours, type, logo) | G-3, G-4 | Template shared with Roma | 45 m |
| [ ] | G-6 | P1 | Component polish: button, card, badge, table, tabs, switch, slider, dialog, toast, empty state | G-3, G-4 | `/design` page shows all states | 2 h |
| [ ] | G-7 | P1 | Chart styling: one palette, axis and grid style, tooltips, labels | G-3 | Analytics page consistent | 1 h |
| [ ] | G-9 | P1 | Dashboard layout and hierarchy review using the heuristics list | W-7 | Notes addressed | 1 h |
| [ ] | G-11 | P1 | Screenshots for the deck, light and dark | Feature freeze | Files in the Drive folder | 30 m |
| [ ] | G-5 | P1 | Logo and wordmark as SVG, favicon, social preview image | G-3 | Files in `web/public/` | 1 h |
| [ ] | G-8 | P1 | Landing visuals: hero composition, step illustrations, section rhythm | W-5 | Landing checklist passes | 2 h |

## R: research, deck, video, QA (Roma, with everyone)

| Done | ID | P | Task | Needs | Done when | Est |
|---|---|---|---|---|---|---|
| [ ] | R-1 | P0 | Deck skeleton from PRESENTATION.md, one owner per slide. Start in a plain template, restyle when G-10 arrives | — | Shared deck link in README | 45 m |
| [ ] | R-2 | P0 | Problem slide: why potholes, who the user is, one real statistic with a source | — | Slide done, source link in notes | 45 m |
| [ ] | R-6 | P0 | CLO 7 audit of two generative models: give the same 20 screened public test images and the same fixed prompt ("How many potholes are in this photo? Answer with a number") to two vision-language models. Score the count error against the labels, and add our E0 detector as a third column when it exists. Record the protocol, the prompt and the answers word for word | D-3, D-12 | `docs/research/vlm-evaluation.md` with the protocol, a table and three failures. One slide | 2 h |
| [ ] | R-3 | P0 | Collect each owner's slides and unify wording and visuals | R-1 | Deck complete by feature freeze | 1.5 h |
| [ ] | R-4 | P0 | 8-minute script with times per slide and the handovers | R-3 | Script in PRESENTATION.md | 1 h |
| [ ] | R-5 | P0 | Question bank: 5 questions per lane with short answers, taken from the two course digests | — | In PRESENTATION.md, used in Rehearsal 1 | 1 h |
| [ ] | R-14 | P0 | Check every lecture page reference that appears on a slide against the lecture PDF. The digests were made by an AI model and nobody has checked them | R-3 | Each slide reference ticked | 45 m |
| [ ] | R-10 | P0 | Run Rehearsal 1 and 2 with a timer, note what to cut | R-4 | Talk fits 7.5–8.5 minutes | 2×30 m |
| [ ] | R-9 | P0 | Demo video, 60–90 seconds: landing, upload, result, rules, dashboard, model page | Feature freeze | MP4 in Drive and on the presenting laptop | 1.5 h |
| [ ] | R-13 | P0 | Study card: what a VLM is, why it miscounts, how the audit was run and verified, limitations of our approach | R-6 | Passed three practice questions | 45 m |
| [ ] | R-7 | P1 | QA pass on the app after checkpoint C2 with the checklist in DESIGN-BRIEF.md. File issues on GitHub | W-6 | Issues filed and triaged | 1 h |
| [ ] | R-8 | P1 | Second QA pass after feature freeze | Feature freeze | No P0 issues open | 45 m |
| [ ] | R-11 | P1 | Limitations and ethics slide, from RULES.md, ML-EXPERIMENT.md and D-7 | D-7 | Slide done | 30 m |
| [ ] | R-12 | P1 | Proofread all docs and site copy | Feature freeze | No typos found in a full read | 45 m |

## Defense-day checklist (everyone)

- [ ] Presenting laptop charged, charger packed, notifications off, display mirroring tested.
- [ ] API started and `/health` green before the talk begins.
- [ ] Browser tabs open in order: deck, landing, analyze, dashboard, model page, MLflow UI, GitHub repo.
- [ ] Demo photo ready on the desktop, one that is not in the training set.
- [ ] Wi-Fi off test done once that morning.
- [ ] Video and screenshots on disk.
- [ ] Everyone knows their slide, their handover line, and their three practice answers.
- [ ] Whoever demos says aloud which screens show demo data and which show real results.
