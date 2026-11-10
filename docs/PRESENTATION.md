# Presentation and defense

Format (A2 p1): 10 minutes from one laptop. At least 7 minutes of talk, then 2–3 minutes of questions. The instructor may ask to see source code. Every member gets an individual question on their own part (Syl p.5).

Target: 8 minutes of talk. Six speakers means six handovers, and each one costs about five seconds, so every slide has one clear point.

## Slides

| # | Slide | Speaker | Time | The one point |
|---|---|---|---|---|
| 1 | Title: JolScan, team, course | Tair | 0:20 | Who we are, what it does in one line |
| 2 | Problem and user | Roma | 0:40 | Road crews find potholes late and have no ranked list. One sourced number |
| 3 | Live demo | Tair | 1:30 | Upload a photo, boxes appear, severity and the rules that fired, then the dashboard |
| 4 | How it works | Alizhan | 0:50 | Browser, API, model, rules. Local and cloud modes, and why cloud is opt-in |
| 5 | Data | Amina | 0:45 | Dataset, licence, 70/15/15 split, leakage check |
| 6 | Experiment design | Nazar | 0:50 | Option A. Baseline, one change per run, same split and seed, selection rule written before the runs |
| 7 | Results | Nazar | 1:10 | The table and one chart. What helped most, what did not, the model we chose by validation mAP50 with recall as the tie-break |
| 8 | Rules engine | Amina | 0:40 | From boxes to priority. Size bands from k-means on the labels. One worked example. Rules stay readable |
| 9 | Design decisions | Dameli | 0:40 | Three heuristics with a screenshot each, chart choices, accessibility |
| 10 | AI use and its limits | Roma | 0:40 | What we used AI for and how we verified it. The audit: two vision-language models counting potholes on the same photos, scored against the labels, next to our detector |
| 11 | Limitations and next steps | Roma | 0:30 | Box area is not physical size, one dataset, no local data yet |
| 12 | Closing: repo, links, questions | Tair | 0:15 | Where everything is |

Total about 8:10. If Rehearsal 1 runs long, merge slides 10 and 11.

Backup slides after the closing: architecture diagram in detail, full metrics table, MLflow screenshot, training curves, error-analysis grid, database schema, contribution log.

## Demo script (slide 3, 90 seconds)

1. Landing page, one sentence, click "Analyze a photo".
2. Drop the prepared photo. While it loads, say which model is running and where (local).
3. Result: point at the boxes, the severity badge, and read one rule hit aloud.
4. Open the Rules page, move the confidence threshold, show the preview change.
5. Dashboard: KPI tiles and the review queue, ten seconds. Say aloud: "these tiles and charts run on demo data. The analysis you just saw and the model page are real."
6. Model page: the experiments table, "we come back to this".

If anything fails: switch the provider to mock in Settings and continue. If the laptop fails: play the video.

Before the talk: API running, `/health` green, demo photo on the desktop, Wi-Fi off test passed once.

## Showing source code

If asked, open in this order: `ml/train.py` (the run table at the top is the experiment), `web/lib/rules/` (the rules engine and its tests), `api/main.py` (the `/predict` endpoint).

## Study cards

Each person prepares short spoken answers for their lane. The course digest for modules 6–9 has 15 model answers in section 4.

**Nazar (model)**
1. What exactly did you change between runs, and what stayed the same?
2. What are IoU and mAP, and why not accuracy?
3. What is transfer learning and what did the from-scratch run show?
4. How do you know the model is not overfitting?
5. Why this model size for the final choice?

**Amina (data and rules)**
1. Where does the dataset come from and what is its licence?
2. How did you split it and how did you check for leakage?
3. Why did you not train on the Hugging Face pothole dataset?
4. How does a set of boxes become "critical"? Walk through one example.
5. What personal data can a road photo contain, and what do you do about it?

**Alizhan (serving)**
1. What happens between the upload click and the boxes on screen?
2. Why FastAPI and Gradio, and how do they differ from Streamlit?
3. Local or cloud: what are the trade-offs, and which is the default?
4. Which MLOps level are you at, and what would the next level need?
5. What would you monitor after deployment?

**Tair (web and architecture)**
1. Draw the architecture. Why are the rules applied in the web server and not in the model service?
2. Why build a custom web app when the course teaches Streamlit and Gradio?
3. How does the app behave when the model service is down?
4. Where would the data live in a real deployment?
5. How did the team divide the work?

**Dameli (design)**
1. Name three of Nielsen's heuristics and show where the app follows each.
2. How did you check contrast and accessibility?
3. Why a bar chart here and a line chart there?
4. How does the design tell a user that a result is uncertain?
5. What would you test with real users first?

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
