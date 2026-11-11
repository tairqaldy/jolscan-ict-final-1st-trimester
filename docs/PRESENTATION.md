# Presentation and defense

Format (A2 p1): 10 minutes from one laptop. At least 7 minutes of talk, then 2–3 minutes of questions. The instructor may ask to see source code. Every member gets an individual question on their own part (Syl p.5).

Target: 8 minutes of talk. Six speakers means six handovers, and each one costs about five seconds, so every slide has one clear point.

## Slides

Two modules in eight minutes means each module gets one demo, one experiment slide and one rules mention. The shared parts (problem, architecture, design, AI use) are told once.

| # | Slide | Speaker | Time | The one point |
|---|---|---|---|---|
| 1 | Title: Qarau, team, course | Tair | 0:15 | Inspection of public infrastructure from photos, with rules you can read |
| 2 | Problem | Roma | 0:35 | Inspection is done by eye: potholes are found late, confusing signage is never reported. One sourced number |
| 3 | Live demo, both modules | Tair | 1:30 | Road photo to boxes, severity and rule hits. Then a sign pair to genders, similarity and a verdict |
| 4 | How it works | Alizhan | 0:40 | Browser, API, two models, two rule sets. Local and cloud modes, and why cloud is opt-in |
| 5 | Roads: data and experiment | Amina | 1:00 | Dataset, licence, leakage check. Option A runs against the baseline, chosen by validation mAP50 |
| 6 | Roads: results and rules | Amina | 0:45 | The table and one chart. Size bands from k-means. One worked rules example |
| 7 | Restrooms: data and experiment | Nazar | 0:50 | IOAI task and data. CLIP zero-shot as the baseline, then training more transformer layers |
| 8 | Restrooms: results | Nazar | 0:50 | Our matching accuracy against IOAI's 0.77 and 0.90. Gender: prompts against a scikit-learn probe with grouped cross-validation |
| 9 | Design decisions | Dameli | 0:35 | Three heuristics with a screenshot each, chart choices, accessibility |
| 10 | AI use and its limits | Roma | 0:35 | What we used AI for and how we verified it. The audit of two vision-language models |
| 11 | Limitations and next steps | Roma | 0:25 | Box area is not physical size. 82 restrooms, two classes only. No local data yet |
| 12 | Closing: repo, links, questions | Tair | 0:10 | Where everything is |

Total about 8:10. If Rehearsal 1 runs long, merge slides 10 and 11. If the pothole training is late, slides 5 and 6 show the setup and say honestly which runs finished; the restroom module carries the results.

Backup slides after the closing: architecture diagram in detail, full metrics table, MLflow screenshot, training curves, error-analysis grid, database schema, contribution log.

## Demo script (slide 3, 90 seconds)

1. Landing page, one sentence, open the Roads module.
2. Drop the prepared road photo. While it loads, say which model is running and where (local).
3. Result: point at the boxes, the severity badge, and read one rule hit aloud. (40 s so far)
4. Switch to Restrooms, Compare: pick a mismatched pair. Point at the two genders, the similarity, and the verdict "review" or "confusing" with the rule that failed. (70 s)
5. Platform overview, ten seconds. Say aloud: "these tiles and charts run on demo data. The two analyses you just saw and the model page are real."
6. Model page: both experiment tables, "we come back to these".

If anything fails: switch the provider to mock in Settings and continue. If the laptop fails: play the video.

Before the talk: API running, `/health` green, demo photo on the desktop, Wi-Fi off test passed once.

## Showing source code

If asked, open in this order: `ml/train.py` (the run table at the top is the experiment), `web/lib/rules/` (the rules engine and its tests), `api/main.py` (the `/predict` endpoint).

## Study cards

Each person prepares short spoken answers for their lane. The course digest for modules 6–9 (team Drive, `course-digests/`, not in the public repository) has 15 model answers in section 4.

**Nazar (restroom model)**
1. What are CLIP and a Vision Transformer, in two sentences each?
2. What is zero-shot, and how did the zero-shot baseline compare with IOAI's 0.77?
3. What changed between runs R2, R3 and R4, and what does training more layers risk on 82 restrooms?
4. Why is gender accuracy cross-validated grouped by restroom, and what would go wrong without the grouping?
5. With 10 validation queries, how sure are you that one run beats another?

**Amina (pothole data, model and rules)**
1. Where does the dataset come from, what is its licence, and how did you check for leakage?
2. What exactly did you change between runs, and what stayed the same?
3. What are IoU and mAP, and why not accuracy?
4. How does a set of boxes become "critical"? Walk through one example, including the k-means size bands.
5. What personal data can a road photo contain, and what do you do about it?
6. What did k-means do, and why on a log scale?
7. What are precision and recall here, and which matters more?
8. What is transfer learning, and what did E2 and E3 show?
9. SGD and AdamW in one sentence each.
10. How were the champion and E8 chosen?

**Amina — short practice answers (D-13, M-18, draft for personal practice)**

Every number below comes from `ml/results/experiments.csv`, `ml/results/operating_point.json`, `ml/results/pothole_area_clusters.json` or the run files in `ml/results/runs/`. Validation numbers choose; test numbers only report.

1. **Dataset, licence, leakage.** The data is the Kaggle "Annotated Potholes Image Dataset" by Atikur Rahman Chitholian: 665 photos, one class, 1,739 boxes after we removed one zero-width box (`data/README.md`). The licence is ODbL for the database and DbCL for the contents, and Kaggle is on the syllabus list of allowed sources (Syl p.9); three watermarked photos are never shown publicly. Before the split we checked for duplicates, exact by SHA-256 of the pixels and near by perceptual hash (distance ≤ 5), and found none (D-4). Then we split once by image, seed 42, into 465 / 100 / 100, and read test only for the final table (Sup p10, Lab 6).
2. **What changed between runs, what stayed the same.** Each run changes one thing against the baseline E0, YOLO26 nano (A2 p1): E1 wider (YOLO26s), E2 random weights instead of COCO pretraining, E3 a frozen backbone, E4 AdamW instead of SGD, E5 standard augmentations off, E6 960 px input, E7 an extra P2 scale for small objects. Fixed for all: the split `potholes_yolo_v1`, seed 42, 40 epochs, 640 px (except E6), batch 16, Ultralytics 8.4.208, and the same Apple M5 laptop GPU for all nine runs (`ml/results/runs/*.json`), which is the fair-comparison rule from Lab 8 Mission 4. E4 changes the learning rate with the optimizer on purpose, so each runs at its own default (SGD 0.01, AdamW 0.001).
3. **IoU, mAP, why not accuracy.** IoU is the overlap of the predicted and the labelled box divided by their union; for mAP50 a prediction is a hit when IoU is at least 0.5 (Lec8 p42). AP is the area under the precision–recall curve and mAP is its mean over classes; we have one class, so mAP50 is the AP for "pothole". Accuracy needs true negatives, and in detection the background has no countable negatives, so accuracy means nothing here. mAP50 is our main metric because even the labeller cannot say exactly where a pothole ends, so the stricter 0.5–0.95 sweep mostly measures label noise (`docs/ML-EXPERIMENT.md`).
4. **From boxes to "critical"** (RULES.md example A, the same boxes as in `web/lib/rules/engine.test.ts`).
   - R1: only boxes with confidence ≥ 0.40 are counted; lower ones only flag the photo for review.
   - R2 size from the share of the photo, `areaPct = w × h × 100`: small below 1.15 %, medium from 1.15 %, large from 7.27 %. The two cut-offs are the k-means bands (question 6).
   - Example A, a highway photo: a large box in the lane (0.32 × 0.25 = 8 %), a medium box in the lane (0.2 × 0.1 = 2 %), a small box off the lane (0.3 %). "In lane" means the box centre is in the middle half of the width and the lower half of the photo.
   - Small: min(1, 2) = 1, because all small boxes together give at most 2 points. Large and medium, ×1.5 in lane (R3): 4 × 1.5 + 2 × 1.5 = 9. Only two boxes are medium or large, so no cluster bonus (R4 needs 3).
   - Highway ×1.5 (R5): (1 + 9) × 1.5 = 15. A score of 9 or more is critical: mark the hazard, repair within 24 h.
   - Limit to say: box area in the photo is not physical size, so a far pothole looks small (RULES.md, "Known limits").
5. **Personal data in a road photo.** A road photo can show faces and licence plates, and EXIF can hold GPS (Lec4-DataMgmt p12–14); in our dataset `img-193.jpg` shows people and `img-448.jpg` plates (`data/README.md`). The syllabus forbids personal data in external AI services or public repositories and names a local model as the alternative (Syl p.9). So the app re-draws every upload in the browser by default, which removes EXIF and GPS (`web/lib/store/settings.ts`); the live demo runs our model on the laptop, and cloud must be chosen in Settings (`docs/ARCHITECTURE.md`). The repository is public, so no photo with a person, face or plate is committed. [check: the D-12 screening table in `data/README.md` is still empty; fill it in before saying "screened" aloud.]
6. **What k-means did, and why a log scale.** K-means is unsupervised: it grouped the 1,198 training boxes by size without labels, putting each box with the nearest of k centres. It ran on the natural log of box area with k = 3, because rule R2 has three size classes; each cut-off is the midpoint between neighbouring centres, turned back into an area: 1.15 % and 7.27 % of the photo (429 small, 499 medium, 270 large; `ml/results/pothole_area_clusters.json`). Log scale because areas span orders of magnitude, so on a linear scale the few huge close-ups would decide the clusters. Fitted on training boxes only, so validation and test do not leak into the rules (Sup p10, Lab 6). [check: the inertia and silhouette scores for k = 2–6 planned in D-11 are not committed, and the k-means script is not in the repository yet (D-29). If asked "why 3", say it is fixed by the rule design.]
7. **Precision and recall, and which matters more.** Precision is TP / (TP + FP), the share of counted potholes that are real; recall is TP / (TP + FN), the share of real potholes we found (Sup p27). For the champion E1 on the 100 test photos at confidence 0.40 and IoU 0.5: 176 found, 30 false alarms, 60 missed, so precision 0.854, recall 0.746, F1 0.796 (`ml/results/operating_point.json`). Recall matters more: a missed pothole never reaches a repair crew, while a false alarm costs a reviewer a few seconds, which is why the tie-break uses recall.
8. **Transfer learning, E2 and E3.** Transfer learning reuses features a network already learned on a large dataset, here COCO, and fine-tunes them on our 465 training photos (Lec8 p38). E2 trained the same nano model from random weights and reached validation mAP50 0.439 against E0's 0.8235, about half; but 40 epochs is short for random weights, so the gap looks bigger than it would with a long schedule. E3 froze the backbone, layers 0–10, and trained only the neck and head: 0.779, 0.045 below E0, so it pays to adapt the backbone too (`ml/results/experiments.csv`).
9. **SGD and AdamW.** SGD with momentum steps against the gradient with one learning rate for all weights. AdamW adapts the step for each weight from running averages of its gradients, and applies weight decay separately from that step. Named optimizers are beyond the lectures (`docs/COURSE-GROUNDING.md`), so I keep it short: in E4, AdamW reached validation mAP50 0.8276 against E0's 0.8235, +0.004, inside the 0.01 tie band.
10. **How the champion and E8 were chosen.** The rule was fixed before E1 (M-0, decision 0009): highest validation mAP50, runs within 0.01 of the best are tied, ties go to the higher validation recall at 0.40, test never chooses (Sup p10). E4 was best with 0.8276; E1 (0.8237), E0, E6 and E8 were within 0.01, and E1 had the highest validation recall at 0.40, 0.738 against E4's 0.728, so E1, YOLO26s, is the champion. E8 was to combine every change that beat E0 by more than 0.01; none did (best E4, +0.004), so E8 used the E0 settings and reproduced E0 exactly in every epoch: training on this laptop is deterministic (`docs/ML-EXPERIMENT.md`).
11. **Likely follow-ups.**
    - *"E4 has the higher test mAP50. Why not E4?"* 0.831 against E1's 0.8155 is 0.016 apart, below the 0.02 we do not claim as real, and choosing on test would make the test number optimistic.
    - *"Which change mattered most?"* Pretraining: without it validation mAP50 fell by 0.38 (E2). Then augmentation (E5, −0.11), the frozen backbone (E3, −0.045) and the P2 scale (E7, −0.035). Width, optimizer and 960 px stayed within 0.01 of E0.
    - *"Did anyone look at the test photos?"* Yes, once, before the split existed: the D-2 visual review drew 100 photos with seed 42 from the same list, and D-20 showed they are exactly the test split. No label changed and nothing was chosen on them, and we list it as a limit (`data/README.md`, D-20).
    - *"Ultralytics says 178 found, your table 176?"* Ultralytics matches at IoU 0.45 and reports at its F1-best threshold; our script predicts at exactly 0.40 and matches at IoU 0.5 (`docs/ML-EXPERIMENT.md`).
    - *"What if the licence were not open?"* Then we could not use the dataset: the syllabus allows only open, licence-clean sources (Syl p.9). Even with the open licence, the three watermarked photos stay hidden, because the dataset licence does not prove rights to each photo.

**Practice:** Roma (D-13) and Alizhan (M-18) each pick three questions plus one unexpected one ("Is a 0.015 difference real?", "Why a log scale?", "What if the licence is not open?"). Answer each in under 40 seconds without notes, and compute example A on paper with the final bands. Quote only numbers from the result files, never the app's demo rows. Before you quote a lecture page aloud, open the PDF: the page numbers come from AI-made course digests and are unchecked (`docs/COURSE-GROUNDING.md`, R-14).

**Alizhan (serving)**
1. What happens between the upload click and the boxes on screen? And for a pair of restroom signs?
2. Why FastAPI and Gradio, and how do they differ from Streamlit?
3. Local or cloud: what are the trade-offs, and which is the default?
4. Which MLOps level are you at, and what would the next level need?
5. What would you monitor after deployment?

**Alizhan — short practice answers (S-13, draft for personal review)**

1. **Upload to result.** The browser sends the road image to the Next.js `/api/analyze` route. That server forwards the image and confidence to FastAPI `/predict`. YOLO returns normalized bounding boxes; the web server applies the rules and sends the analysis back for display. For Compare, `/api/restroom` forwards two signs to `/restroom/compare` and the web app applies the signage rules. The two-step Match pipeline is separate work (C-8), not assumed to be serving yet.
2. **HTTP and errors.** REST-style services use HTTP methods and status codes to operate on resources; responses here use JSON. FastAPI returns 200 for success, 400 for bad image bytes or confidence, 422 for missing required fields, and 503 if weights cannot load. The Next.js proxy can translate a service failure or malformed response into 502, or report an unreachable service as 503. HTTP 200 from `/health` means the process answers, not that trained weights work.
3. **FastAPI, Gradio, Streamlit.** FastAPI is our programmatic HTTP API, validating requests and returning JSON. Gradio makes a simple interactive model demo; Streamlit is suited to interactive data applications and dashboards. The Gradio demo still needs verification with the team's weights.
4. **Batch, online, edge.** Batch processes a stored group of inputs later; online serving answers individual requests as they arrive; edge runs inference on or close to the device. Our laptop-local setup is an edge-style deployment; an actual hosted service would be online serving.
5. **Local versus cloud.** Local keeps inference on the laptop and can work without a network once software and weights are cached; it is limited by the laptop. Cloud can provide more compute but needs a network and sends photos off device, so privacy and latency matter. The app defaults to mock; local or configured cloud must be selected. Never describe mock or COCO detections as trained pothole results.
6. **MLOps and maturity.** Gather and validate data, train and evaluate, select and deploy a model, monitor it, and use feedback to improve the next iteration. Our training and deployment are mostly manual, so call it Level 0; an automated validated training pipeline would be a step toward Level 1. CI checks alone do not automate training.
7. **Monitor and Docker.** Monitor request errors, latency, input/data drift and confidence distributions; measure detection quality when reliable labels arrive. A Docker image packages the service and dependencies for consistent deployment; the weights may be supplied separately and secrets belong in environment variables, not the image or repository.

**Practice:** answer three random questions aloud without notes for a teammate, then explain the actual `/predict` code and errors. Mark S-13 complete only after that practice. Course page references in `COURSE-GROUNDING.md` come from AI-made digests and must be checked against the original PDFs (R-14).

**Tair (web and architecture)**
1. Draw the architecture. Why are the rules applied in the web server and not in the model service? Why one platform with two modules instead of two apps?
2. Why build a custom web app when the course teaches Streamlit and Gradio?
3. How does the app behave when the model service is down?
4. Where would the data live in a real deployment?
5. How did the team divide the work?

**Tair — short practice answers (W-22, draft for personal practice)**

Architecture to draw in under a minute (docs/ARCHITECTURE.md section 1):

```
Browser (Next.js pages; history in localStorage)
   │  upload photo or sign pair
   ▼
Next.js route handlers on the server: /api/analyze, /api/restroom, /api/health
   │  chooses the provider from Settings
   ├─ mock  : canned results inside the web server (default, works offline, used on Vercel)
   ├─ local : FastAPI on localhost:8000 (/predict = YOLO E0, /restroom/* = CLIP), photos stay on the laptop
   └─ cloud : the same API hosted (CLOUD_MODEL_API_URL), opt-in because photos leave the device
   ▼
Rules in the web server: web/lib/rules (roads, R1–R6) and web/lib/signage (restrooms, S1–S3)
   ▼
JSON result back to the page: boxes or genders, score or verdict, which rules fired
```

1. **Why are the rules in the web server, not in the model service?** The model service only returns detections (boxes, confidences) or sign predictions. The rules run in one place, so mock, local and cloud results are scored the same way. A person can read and change the rules on the Rules page without retraining or redeploying the model, and they are covered by unit tests (`web/lib/rules/engine.test.ts`).
2. **Why one platform with two modules?** One shell, one provider switch, one settings page, one model page and one analytics page serve both modules (`MODULES` in `web/lib/brand.ts`). Each module has its own flow, rules and history. The cost is a fuller talk, so each module gets one demo and one results slide.
3. **Why three providers?**
   - Mock works offline and is what the deployed site uses, because Vercel cannot reach a model on a laptop.
   - Local runs our real model and keeps photos on the device; it is what the demo uses.
   - Cloud is opt-in, because photos leave the device.

   The trade-off is reliability against privacy against scale.
4. **Why a custom web app when the course teaches Streamlit and Gradio?** We also have the course's format, a Gradio app in `api/gradio_app.py` (S-5). The custom app adds what a prototype for a city operator needs: an editable rules page, history and reports, two modules in one place, honest demo labels and accessibility work.
5. **What happens when the model service is down?**
   - The health check waits 3 s and an analysis 20 s (`web/lib/providers/env.ts`).
   - Errors come back as clean JSON: `503 unreachable` when the service is not running, `504 timeout` when it is too slow, `422 unsupported_input` when a drawn sample is sent to a real model.
   - The page explains the error and offers one click to switch to Mock.
   - In the demo, the fallback order is in `docs/DEFENSE-RUNBOOK.md`.
6. **Where would the data live in a real deployment?** Photos in object storage; analyses, rule versions and review decisions in SQL tables with keys (docs/ARCHITECTURE.md section 4). Today history lives in each browser's localStorage by design: no accounts, no database in the prototype.
7. **How did the team divide the work?**
   - One lane and one owner each (PLAN.md section 3).
   - Every task is a GitHub issue with steps and a done-check. People claim it with a commit, work on a branch, and merge their own PR only when CI is green (CONTRIBUTING.md).
   - Evidence: git history, the closed issues, the worklogs in `docs/worklog/` and `docs/CONTRIBUTION-LOG.md`.
   - I also trained the pothole runs on one laptop GPU, so all runs are comparable.

**Practice:** draw the diagram from memory, then have a teammate pick three questions; answer each in under 40 seconds without notes. Before you quote a lecture page aloud, open the lecture PDF: the course digests were made by an AI model and are unchecked (`docs/COURSE-GROUNDING.md`).

**Dameli (design)**
1. Name three of Nielsen's heuristics and show where the app follows each.
2. How did you check contrast and accessibility?
3. Why a bar chart here and a line chart there?
4. How does the design tell a user that a result is uncertain?
5. What would you test with real users first?

**Dameli — short practice answers (G-12, draft for personal practice)**

Every example below was checked in the running app on 11 November, and every lecture page was checked in the PDF (`Lec3-Part1-Human_Computer_Interaction_Presentation.pdf` = HCI, `data_mining_and_visualisation_presentation (2).pdf` = DMViz, `Data-visualisation-as-an-ICT-tool (1).pdf` = VizBasics, `Data_Visualization_as_an_ICT_Tool.pdf` = VizICT).

1. **Three heuristics, each with a page to open** (Nielsen's ten are HCI p13; one slide each on p14–23).
   - *Visibility of system status* (HCI p14). The sidebar always shows the provider (Mock, Local or Cloud). While a photo runs, the button says "Analysing…" and a line scans the photo. Settings → Model provider → **Check connection** says "Connected" or why not. Open: `/app/settings`.
   - *Help users recognise, diagnose and recover from errors* (HCI p22). With Local chosen and the model service off, Compare says "The local model service is not running or cannot be reached", how to start it, and offers **Try again** or **Use the mock provider**. One click on the second gives a result. Open: `/app/restrooms/compare`.
   - *Recognition rather than recall* (HCI p19). Analyze shows six labelled sample photos ("Highway, three potholes", "Faint damage, needs review"…), and the accepted formats sit next to the upload box, so nobody has to remember what to upload. Open: `/app/roads/analyze`.
   - Spare: *Error prevention* (HCI p18). The file is checked before upload: JPEG, PNG or WebP, at most 10 MB (`web/lib/upload.ts`).
2. **Contrast and accessibility.**
   - **Contrast:** I measured the contrast of every text colour from the tokens with the WCAG formula, in both themes. WCAG asks for 4.5:1 for text (HCI p37). Our weakest text colour, `subtle`, is 4.98:1 in light and 5.36:1 in dark, and main text is at least 14.4:1. The table is in DESIGN-BRIEF.md.
   - **Keyboard:** Analyze works with the keyboard alone (checked on 11 November). Tab reaches a sample, Enter selects it, and Enter on **Analyze photo** shows the result. Every stop has a visible 2 px focus ring.
   - **Colour plus word:** each severity level has a word and its own icon.
   - **Still open:** the main button is 48 px tall, the touch size on HCI p31, but some small controls are smaller (the school-zone switch is 24 px tall). W-17 covers that fix.
3. **Why bars, and no line chart.** The chart type follows the data (VizBasics p4, DMViz p28). Every chart on `/app/analytics` is a bar chart, picked per data type:
   - "Detections over time" counts photos per day. The counts are separate daily totals, and the stacked bars show counted against needs review. A line would suggest values between the days.
   - The confidence histogram shows the shape of a distribution (DMViz p28).
   - All bars start at zero, because a cut axis exaggerates differences (DMViz p31, VizICT p17).
   - Severity colours appear only where they mean severity; other series use `--chart-1` and `--chart-2`. Each chart on that page has a legend with words, because colour alone fails colour-blind readers (VizICT p11).
4. **Showing uncertainty.**
   - **Roads:** a box under the confidence threshold is drawn dashed with "review" in its tag; counted boxes are solid. The photo is flagged "needs review", counted in the "To review" tile on Home, and Reports can filter to review only.
   - **Restrooms:** the verdict is **Review** when the model can tell the doors apart but is not sure which is which (gap under 0.20, rule S1). A person then checks on site.
5. **First test with real users.** I would give a real road dispatcher the deployed site and measure whether they reach a result in two screens and three clicks, which is our U1. I would also check that "Critical, repair within 24 h" matches how they talk about work. That is *match between system and the real world* (HCI p15). I would measure what they do rather than ask what they like.
6. **Likely follow-up: Fitts and Hick.**
   - *Fitts's law* (HCI p34): the time to hit a target grows with distance and shrinks with size. **Analyze photo** is 48 px tall and spans its panel, right under the photo details.
   - *Hick's law* (HCI p35): more choices make the decision slower, and the fix is progressive disclosure. A result first shows the priority and why; the detections and the raw JSON are in tabs.

**Practice:** have Tair or Roma pick three questions. Answer each in under 40 seconds with the page open, then without notes. Before quoting a page aloud, open the PDF once yourself.

**Slide 9, design decisions (G-13, content for the shared deck)**

- **Title:** Design decisions for a road dispatcher
- **Three screenshots**, one frame each (570×405 px, light theme, kept outside the repository and sent to the deck folder), each with one line:
  1. `09-heuristic-1-status.png`: "Visibility of system status: the provider and its connection are always shown."
  2. `09-heuristic-2-recover.png`: "Error recovery: the cause in plain words and a one-click switch to Mock."
  3. `09-heuristic-3-recognition.png`: "Recognition over recall: six labelled sample photos next to the upload box."
- **Chart line:** "Bars from zero for counts, a histogram for confidence, severity colours only for severity."
- **Accessibility line:** "Text contrast at least 4.98:1 in both themes (WCAG: 4.5:1); keyboard-only analysis with a visible focus ring; every status with a word and an icon."
- **Speaker notes, sources:** HCI p14, p19 and p22 for the three heuristics; HCI p37 for WCAG; VizBasics p4, DMViz p28 and p31 for the charts.
- **Script, about 35 seconds (94 words):**

  > I designed Qarau for a road dispatcher, using three of Nielsen's heuristics. Visibility of system status: the app always shows which model answers and whether it is connected. Error recovery: if the model service is down, the message says why in plain words and offers one click to the mock provider. Recognition over recall: you pick a sample instead of guessing what to upload. The charts are bars that start at zero, and every text colour passes WCAG's four and a half to one in both themes. Roma now explains how we used AI.

**Roma (research and AI evaluation)**
1. Which AI tools did the team use, for what, and how did you verify the output?
2. What did the vision-language model get wrong, and why?
3. What are the main limitations of the project?
4. What ethical or legal risks does a system like this have?
5. What is the next step after the defense?
6. What is a vision-language model?
7. Why do such models miscount or misread?
8. How was the audit run and verified?

**Roma — short practice answers (R-13, draft for personal practice)**

At most three sentences each, as R-13 asks. The audit report (R-6, `docs/research/vlm-evaluation.md`) is not in the repository yet, so answers 2, 7 and 8 have `[check]` gaps: fill them from the report before Rehearsal 2, because CLO 7 is graded on the strength of the conclusion from our own verification, not on general statements about AI (Syl p.3).

1. **AI tools, what for, how checked.** The team used Claude Code, Codex and Copilot in VS Code for planning, course summaries, code, documentation and study-card drafts; each use is logged with its prompt and its check in `docs/AI-USAGE-LOG.md` (Syl p.9). We checked output by running it: tests, type checks and builds, R0 reproducing IOAI's published restroom baseline (0.767 against 0.77), and E8 reproducing E0 exactly. The log also shows AI mistakes we caught: it first misread the restroom task as classifying photos by gender, and a second model's review of the plan found 30 problems, one an output path that would have crashed every training run.
2. **What the VLM got wrong, and why.** [check: the R-6 audit is not committed; there is no `docs/research/vlm-evaluation.md` on 11 November. Name one real failure: the image ID, the model's answer word for word, the truth, and the score as a fraction such as x/20.] The likely cause: a VLM writes fluent text, it does not count or measure, so a confident answer can be wrong, and it can describe things that are not in the image (Lec7 p66, Lec7 p64). The IOAI icons have been public since 2025, so the models may have seen them in training, and with 20 images one or two answers are not enough to separate two models (R-6, issue #85).
3. **Main limitations.** Each module has one test split from one dataset, 100 pothole photos and 30 restroom queries where one query is 0.033, so small differences may be noise (`docs/ML-EXPERIMENT.md`, `ml/restroom/README.md`). Box area in the photo is not physical size, and the severity thresholds are team-chosen starting values that nobody has checked with people yet (`docs/RULES.md`, D-6). The pothole photos are not from Kazakhstan, so snow and night roads are untested, and the restroom data is 82 training restrooms with two classes only, so accessible and all-gender signs are forced into male or female.
4. **Ethical and legal risks.** Road photos can show faces, licence plates and GPS in EXIF, and the syllabus forbids personal data in external AI services or public repositories (Syl p.9); so the app removes EXIF by default, cloud is opt-in, and the audit plan sends only restroom icons with no people. Three dataset photos carry stock watermarks, and the dataset licence does not prove rights to them, so we never show them (`data/README.md`). A two-class restroom model leaves out accessible and all-gender restrooms, and a wrong severity could send a crew to the wrong road first, so every result lists the rules that fired and unsure boxes go to review (`docs/RULES.md`).
5. **Next step.** Test on local roads: 30–50 Astana pothole photos, screened for faces and plates, annotated and used only as an external test set (D-9, M-17). Check the rules against people: a person rates 30 validation photos and we compare with the rule severity (D-6). Then repeat E0 and E8 with seeds 0 and 1 to see the spread (M-16), and look for licensed accessible and all-gender signs for the restroom model (C-31).
6. **What a VLM is.** A vision-language model has a vision encoder, such as a ViT, that turns the image into tokens, a connector that maps those tokens into the language model's input, and a language model that writes the answer as text (Lec8 p57). It can describe an image, answer a question about it or read text in it. Our restroom model uses only CLIP's encoders and text prompts, so it gives similarity and gender scores, never free text (Lec8 p56).
7. **Why they miscount or misread.** The language model produces likely words, not a measured count, so fluent answers do not guarantee correct counting or reading (Lec7 p66). It can also hallucinate details that are not in the image, and the same image can get a different answer in a new chat, which is why the audit repeats three items (Lec7 p64, R-6). [check: give one failure from the audit report as the example.]
8. **How the audit was run and verified.** The R-6 protocol: two hosted VLMs from two companies, 20 IOAI restroom icons renamed A01–A20 so the file name cannot give the gender away, one fixed prompt and a new chat per image, plus 8 sign pairs. Truth comes from the dataset's folder labels; answers are copied word for word with screenshots, three items (A01, A05, B5) are repeated for consistency, and a teammate re-checks five rows against the screenshots. Our zero-shot CLIP answers the same images as a third column, because its 0.756 gender accuracy on 328 images (`ml/results/restroom/runs/R1.json`) is not comparable with 20. [check: confirm from `docs/research/vlm-evaluation.md` what was actually run: model names and dates, Part C run or not, and who re-checked which rows.]

**Practice:** a teammate picks three of the eight questions at random; answer each without notes in under 40 seconds, and repeat until all three are fluent (R-13). Before you quote a lecture page aloud, open the PDF: the page references in `docs/COURSE-GROUNDING.md` come from AI-made course digests and are unchecked (R-14).

## Rehearsal rules

- Timer visible. Stop at 8:30 no matter what.
- After the run, each person gets two questions from their card and one unexpected question.
- Write down every sentence that was cut or stumbled on, and fix the slide, not the speaker.
