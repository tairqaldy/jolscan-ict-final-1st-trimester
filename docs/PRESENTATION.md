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

Each person prepares short spoken answers for their lane. The course digest for modules 6–9 has 15 model answers in section 4.

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

**Tair (web and architecture)**
1. Draw the architecture. Why are the rules applied in the web server and not in the model service? Why one platform with two modules instead of two apps?
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
