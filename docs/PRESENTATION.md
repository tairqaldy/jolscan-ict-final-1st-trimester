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

## Rehearsal rules

- Timer visible. Stop at 8:30 no matter what.
- After the run, each person gets two questions from their card and one unexpected question.
- Write down every sentence that was cut or stumbled on, and fix the slide, not the speaker.
