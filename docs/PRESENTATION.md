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

## Backup slides index (Task R-26)

Backup slides after the closing are numbered B1–B11. Each slide has at most five lines, a visible slide number for rapid navigation ("Backup B6, please"), and an explicit `Sources:` line naming primary evidence files. B1–B8 are in the deck (`docs/deck/SLIDES.md`, written by `docs/deck/make_deck.py`). B9–B11 are notes in this file until they are added to `make_deck.py`; `SLIDES.md` is regenerated on every build, so they cannot be typed into it.

| # | Backup Slide Title | Speaker | Primary Trigger Question | Evidence Files |
|---|---|---|---|---|
| **B1** | Full pothole metrics table (E0–E8) | Amina | "Show all 9 experimental runs and metrics" | `ml/results/experiments.csv`, `docs/ML-EXPERIMENT.md` |
| **B2** | Operating point at τ = 0.40 | Amina | "Why τ = 0.40 and what are TP/FP/FN counts?" | `ml/results/operating_point.json`, `docs/ML-EXPERIMENT.md` |
| **B3** | Training curves (box, cls, dfl loss) | Amina | "Show training convergence and overfitting" | `ml/results/runs/`, `ml/README.md` |
| **B4** | Rules, size bands & worked calculation | Amina | "Explain R1–R6 rules and small-detection cap" | `docs/RULES.md`, `ml/results/pothole_area_clusters.json` |
| **B5** | Restroom approaches & final pipeline | Nazar | "How does the two-step matching pipeline work?" | `ml/results/restroom/pipeline.json`, `docs/ML-EXPERIMENT-RESTROOM.md` |
| **B6** | **CLO 5: Methods & quality metrics** | Amina / Nazar | "How do your methods satisfy CLO 5 criteria?" | Syllabus p.2, `docs/ML-EXPERIMENT.md`, `ml/results/restroom/runs/R1.json` |
| **B7** | **CLO 6: Working prototype & verification** | Tair / Alizhan / Roma | "Prove the prototype works and tests pass" | Syllabus p.2, `api/main.py`, `.github/workflows/ci.yml`, `docs/QA-SCRIPTS.md` |
| **B8** | **CLO 7: Generative AI evaluation & error log** | Roma | "What did AI get wrong and how did you verify it?" | Syllabus p.3, `docs/research/vlm-evaluation.md`, `docs/AI-USAGE-LOG.md` |
| **B9** | System architecture & API contracts | Alizhan / Tair | "Show component connections and JSON shapes" | `docs/ARCHITECTURE.md`, `api/schemas.py` |
| **B10** | Errors on the test split | Amina / Nazar | "Where do models fail on real road/sign data?" | `ml/results/operating_point.json`, `data/README.md` |
| **B11** | Target database schema (Target, not built) | Tair | "Where is persistent inspection data stored?" | `docs/PLAN.md` section 2, `docs/ARCHITECTURE.md` section 4 |

---

## Script

Working snapshot copied from `docs/deck/SLIDES.md` at commit `1c28a49`. The final deck and speaker notes are generated from `docs/deck/make_deck.py`; reconcile changes there before the defense. Word counts and durations below are estimates, not a timed group rehearsal. Speakers must check their own wording and complete R-10.

**Slide 11, fixed 11 November evening:** the script no longer calls the two-step pipeline a next step. Since C-8 (#426) the app's Match page runs it (`api/restroom.py`, `bestMatchId`); Compare still runs zero-shot CLIP. The next step it names now is accessible and all-gender signs, as on the slide. Deck source: `docs/deck/make_deck.py`.

**Full timed read-through:** not yet recorded. The deck estimates 8:02 with the 1:30 live demo; a real timed rehearsal is still required.

### 1. Title
**Speaker and budget:** Tair · **budget** 0:15 · **script** 32 words, about 0:15

> Good morning. We are Qarau, Kazakh for “to inspect”. From photos, our app finds potholes and checks restroom door signs, then applies rules you can read. Roma will start with the problem.

### 2. Problem
**Speaker and budget:** Roma · **budget** 0:35 · **script** 66 words, about 0:30

> Today, roads and public buildings are inspected by eye, so potholes are found late. In West Kazakhstan Region, 60 percent of local roads were in normative condition at the start of 2026. For restroom signs we found no figure, and no place to report them. A photo goes in, a model finds what matters, and readable rules decide what happens next. Tair will show it live.

### 3. Live demo
**Speaker and budget:** Tair · **budget** 1:30 · **script** 106 words, about 0:49

> This is Qarau. I open the Roads module and drop a road photo. It runs on our own model, here on this laptop. Here are the potholes it found, the severity, and one rule that fired: [read one rule hit aloud]. Now Restrooms, Compare. I pick a mismatched pair. Here are the two genders, how alike the signs are, and the verdict with the rule that failed. This is the platform overview. These tiles and charts run on demo data. The two analyses you just saw and the model page are real. On the model page are both experiment tables; we come back to these. Alizhan will explain how it works.

### 4. How it works
**Speaker and budget:** Alizhan · **budget** 0:40 · **script** 91 words, about 0:42

> This is the path of one photo. The browser sends it to our Next.js server, which uses the provider chosen in Settings: mock for offline demo data, local for the model on this laptop, or cloud. Local calls our FastAPI service, where YOLO finds potholes and CLIP reads restroom signs. The detections come back, and the rules run in the web server, so every provider is scored by the same rules. Cloud is opt-in, because road photos can show faces and plates. Amina will show what the roads model learned from.

### 5. Roads: data and experiment
**Speaker and budget:** Amina · **budget** 1:00 · **script** 127 words, about 0:59

> I prepared and reviewed our pothole data, checked duplicates and XML annotations, corrected one invalid box, and exported the frozen YOLO split. The Kaggle dataset has 665 photos and 1,739 boxes; its metadata lists ODbL and DbCL, but rights to individual watermarked photos remain unresolved and require separate verification. We found no exact or near duplicates before splitting by photo: 465 for training, 100 for validation and 100 for test, with seed 42. My smoke run checked the training pipeline using validation only; Tair performed all full experiment runs. Our comparison changes model settings against baseline E0, keeping frozen data and training budget fixed across runs. Validation chooses settings; test reports performance. The notes explain prior test-photo review and separate evaluation passes. Here is what came out.

### 6. Roads: results
**Speaker and budget:** Amina · **budget** 0:45 · **script** 90 words, about 0:42

> Tair trained the full experiments. E4 leads validation mAP50, but our 0.01 tie band includes E1. E1 wins because its validation recall at 0.40 is highest, 0.738. At the test operating point, E1 finds 176 of 236 potholes, with 30 false alarms and 60 misses. Test never chooses the model. My training-only clustering supplies image-relative size bands; the worked highway example scores 15, critical. Our project policy withholds test-gain claims below 0.02, without claiming statistical equivalence. These are project rules, not an official repair standard. Nazar takes the second module.

### 7. Restrooms: data and experiment
**Speaker and budget:** Nazar · **budget** 0:50 · **script** 104 words, about 0:48

> The restroom task comes from the IOAI 2025 olympiad. Given a cropped door sign, the model must find the other door of the same restroom, the opposite gender, in a gallery. The data is small: 82 training restrooms, 10 validation and 30 test queries. We ran three groups. Zero-shot CLIP, which is IOAI's baseline. Fine-tuning CLIP's last transformer blocks, our Option A change. And a two-step pipeline with no training. The chart is our layer experiment, on restrooms the model never saw: 4 trained blocks find the partner best, 0.965. All 12 memorise the training restrooms and lose gender. Here is what came out.

### 8. Restrooms: results
**Speaker and budget:** Nazar · **budget** 0:50 · **script** 110 words, about 0:51

> Zero-shot CLIP matches 23 of 30 test queries, the same as IOAI's published baseline of 0.77. Fine-tuning the last three blocks, run R3, gives 27; R3 is the run our rule picks on validation. The two-step pipeline gets all 30, also one query at a time, as the app answers. IOAI's best, 0.90, is their number, not a contest we entered. Thirty queries are few: for 30/30 the 95 % interval starts at 0.884. The pipeline beats zero-shot CLIP, p 0.016, but not provably R3, p 0.25. It also uses two facts of this benchmark that a real building does not give. Dameli will show how the interface makes this usable.

### 9. Design decisions
**Speaker and budget:** Dameli · **budget** 0:35 · **script** 77 words, about 0:36

> I designed Qarau for a road dispatcher. Visibility of system status: the app always shows which model answers and whether it is connected. Error recovery: if the model service is down, the message says why and offers one click to the mock provider. Recognition over recall: you pick a sample instead of guessing what to upload. Charts start at zero, and every text colour passes WCAG AA in both themes. Roma now explains how we used AI.

### 10. AI use and its limits
**Speaker and budget:** Roma · **budget** 0:35 · **script** 78 words, about 0:36

> We used Claude Code, Codex and Copilot to write and review code, draft documents and check text against our results. Every use is logged with its prompt and check: 118 entries, and every number here is traced to a committed file. We also audited Gemini and Claude on 20 IOAI signs: each named the gender correctly on 17. Our CLIP gets 0.756 on all 328 training signs; 20 signs are too few to rank them. Next, the limits.

**AI errors and verification (R-41, CLO 7):** six cases where an AI tool was wrong, each with the check that caught it (a primary source, a measurement or a second reviewer), are in [`docs/AI-USAGE-LOG.md`](AI-USAGE-LOG.md), section 'What the AI tools got wrong'. The lesson is Lec7 p64 ("Verify important claims") and p70 ("Choose evidence over fluency").

### 11. Limitations and next steps
**Speaker and budget:** Roma · **budget** 0:25 · **script** 50 words, about 0:23

> Three limits. Box area is not physical size: a far pothole looks small. The restroom data has 82 training restrooms and two classes, so accessible and all-gender signs are missing. And none of our road photos are from Kazakhstan. Next: screened local photos, and accessible and all-gender signs. Tair closes.

**Privacy and law (R-45, CLO 7):** road photos never go to an external AI service (Syl p.9). The app's default provider is the mock; real analysis runs on our API on the presenting laptop, and the browser re-encodes uploads, which drops EXIF and GPS (on by default, a Settings switch). Face and plate blurring is not built. Personal data falls under Law No. 94-V; the five-row policy is in [`docs/research/privacy-and-law.md`](research/privacy-and-law.md).

### 12. Closing
**Speaker and budget:** Tair · **budget** 0:10 · **script** 21 words, about 0:10

> Thank you. The code, both results tables and our AI log are in this repository. We are ready for your questions.

**Handover check:** Slides 5→6, 7→8 and 10→11 continue with the same speaker and do not explicitly name that speaker in the existing notes. Slide 12 closes for questions. Team review is needed before claiming every requested handover is present.

## Demo script (slide 3, 90 seconds)

1. Landing page, one sentence, open the Roads module.
2. Drop the prepared road photo. While it loads, say which model is running and where (local).
3. Result: point at the boxes, the severity badge, and read one rule hit aloud. (40 s so far)
4. Switch to Restrooms, Compare: pick a mismatched pair. Point at the two genders, the similarity, and the verdict "Not a pair" with the rule that failed. (70 s)
5. Platform overview, ten seconds. Say aloud: "these tiles and charts run on demo data. The two analyses you just saw and the model page are real."
6. Model page: both experiment tables, "we come back to these".

If anything fails: switch the provider to mock in Settings and continue. If the laptop fails: play the video.

Before the talk: API running, `/health` green, demo photo on the desktop, Wi-Fi off test passed once.

## Showing source code

If asked, open in this order: `ml/train.py` (the run table at the top is the experiment), `web/lib/rules/` (the rules engine and its tests), `api/main.py` (the `/predict` endpoint).

## Study cards

The comprehensive cross-lane defense question bank with 3-sentence grounded answers is in [`docs/DEFENSE-QA.md`](DEFENSE-QA.md) (task R-31). Each person prepares short spoken answers for their lane. The course digest for modules 6–9 (team Drive, `course-digests/`, not in the public repository) has 15 model answers in section 4.

**Nazar (restroom model)**
1. What are CLIP and a Vision Transformer, in two sentences each?
2. What is zero-shot, and how did the zero-shot baseline compare with IOAI's 0.77?
3. What changed between runs R2, R3 and R4, and what does training more layers risk on 82 restrooms?
4. Why is gender accuracy cross-validated grouped by restroom, and what would go wrong without the grouping?
5. With 10 validation queries, how sure are you that one run beats another?

**M-37: two-sentence answer for R-5 and M-18**

Every one of our 100 test photos contains a labelled pothole, so always answering "pothole present" gives 100% image-level accuracy without locating any pothole.
Detection instead needs box matching and precision, recall and mAP; unlike fixed-label classification, its empty background regions do not provide a uniquely countable set of true negatives.

Sources: [frozen split manifest](../data/exports/potholes_yolo_v1/split_manifest.json), [Why not accuracy](ML-EXPERIMENT.md#why-not-accuracy).
This is a sourced draft answer, not evidence that Amina has passed timed practice with a teammate.

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

1. **Upload to result.** The browser sends the road image to the Next.js `/api/analyze` route. That server forwards the image and confidence to FastAPI `/predict`. YOLO returns normalized bounding boxes; the web server applies the rules and sends the analysis back for display. For Compare, `/api/restroom` forwards two signs to `/restroom/compare` and the web app applies the signage rules. For Match, FastAPI `/restroom/match` uses the two-step pipeline to identify the best partner (`bestMatchId`); the benchmark assumes the query is a crop of a gallery original and the partner is in the gallery, which need not hold in real use (C-8, `api/restroom_pipeline.py`).
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
   ├─ local : FastAPI on localhost:8000 (/predict = YOLO, the champion E1; /restroom/* = CLIP), photos stay on the laptop
   └─ cloud : the same API hosted (CLOUD_MODEL_API_URL), opt-in because photos leave the device
   ▼
Rules in the web server: web/lib/rules (roads, R1–R6) and web/lib/signage (restrooms, S2–S3; S1 retired on 11 Nov)
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
   - *Recognition rather than recall* (HCI p19). Analyze shows six labelled sample images ("Highway, three potholes", "Faint damage, needs review"…), and the accepted formats sit next to the upload box, so nobody has to remember what to upload. Open: `/app/roads/analyze`.
   - Spare: *Error prevention* (HCI p18). The file is checked before upload: JPEG, PNG or WebP, at most 10 MB (`web/lib/upload.ts`).
2. **Contrast and accessibility.**
   - **Contrast:** I measured the contrast of every text colour from the tokens with the WCAG formula, in both themes. WCAG asks for 4.5:1 for text (HCI p37). Our weakest text colour, `subtle`, is 4.98:1 in light and 5.36:1 in dark, and main text is at least 14.4:1. The table is in DESIGN-BRIEF.md.
   - **Keyboard:** Analyze works with the keyboard alone (checked on 11 November). Tab reaches a sample, Enter selects it, and Enter on **Analyze photo** shows the result. Every stop has a visible 2 px focus ring.
   - **Colour plus word:** each severity level has a word and its own icon.
   - **Still open:** the main button is 48 px tall, the touch size on HCI p31, but some small controls are smaller (the school-zone switch is 24 px tall). W-17 covers that fix.
3. **Why bars, and no line chart.** The chart type follows the data (VizBasics p4, DMViz p28). Every chart on `/app/analytics` is a bar chart, picked per data type:
   - "Detections over time" counts pothole boxes per day. The counts are separate daily totals, and the stacked columns show counted against needs review. A line would suggest values between the days. I tried a line on 11 November (G-51): it drops to zero on every day without photos, so whether detections are rising is harder to see, and the review line is flat most days (VizBasics p4: line for change over time, bars for comparing counts).
   - The confidence histogram shows the shape of a distribution (DMViz p28).
   - All bars start at zero, because a cut axis exaggerates differences (DMViz p31, VizICT p17).
   - Severity colours appear only where they mean severity; other series use `--chart-1` and `--chart-2`. Each chart on that page has a legend with words, because colour alone fails colour-blind readers (VizICT p11).
   - Every rule threshold is a labelled line on the chart, for example "R1 0.40" and "R1 floor 0.25" on the confidence histogram, and S2 on the gap chart. The line reads the same value as the rules engine, so it moves when I change a rule. Open: `/app/analytics`, then `/app/restrooms/rules`.
4. **Showing uncertainty.**
   - **Roads:** a box under the confidence threshold is drawn dashed with "review" in its tag; counted boxes are solid. The photo is flagged "needs review", counted in the "To review" tile on Home, and Reports can filter to review only.
   - **Restrooms:** the verdict is only **Pair** or **Not a pair**, so the uncertainty is in the numbers next to it: the gap between the doors against S2 (0.05) and the similarity against S3 (0.88), each with its threshold drawn on the bar. A pair just over a line is visibly close.
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
  3. `09-heuristic-3-recognition.png`: "Recognition over recall: six labelled sample images next to the upload box."
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
2. **What the VLM got wrong, and why.** In our audit (`docs/research/vlm-evaluation.md`), both Google Gemini and Anthropic Claude scored 17/20 (85.0%), and both failed on A17 (`male/14.png`), answering "women" for an angular robot figure. Both vision encoders misidentified the hollow space beside the robot's square torso as a dress or apron, defaulting to female iconography (Lec7 p66, Lec7 p64). Additionally, Gemini exhibited metadata leakage by echoing `A07.png` and `A17.png` in its replies, proving why pre-audit file anonymization was mandatory.
3. **Main limitations.** Each module has one test split from one dataset, 100 pothole photos and 30 restroom queries where one query is 0.033, so small differences may be noise (`docs/ML-EXPERIMENT.md`, `ml/restroom/README.md`). Box area in the photo is not physical size, and the severity thresholds are team-chosen starting values that nobody has checked with people yet (`docs/RULES.md`, D-6). The pothole photos are not from Kazakhstan, so snow and night roads are untested, and the restroom data is 82 training restrooms with two classes only, so accessible and all-gender signs are forced into male or female.
4. **Ethical and legal risks.** Road photos can show faces, licence plates and GPS in EXIF, and the syllabus forbids personal data in external AI services or public repositories (Syl p.9); so the app removes EXIF by default, cloud is opt-in, and the audit plan sends only restroom icons with no people. Three dataset photos carry stock watermarks, and the dataset licence does not prove rights to them, so we never show them (`data/README.md`). A two-class restroom model leaves out accessible and all-gender restrooms, and a wrong severity could send a crew to the wrong road first, so every result lists the rules that fired and unsure boxes go to review (`docs/RULES.md`).
5. **Next step.** Test on local roads: 30–50 Astana pothole photos, screened for faces and plates, annotated and used only as an external test set (D-9, M-17). Check the rules against people: a person rates 30 validation photos and we compare with the rule severity (D-6). Then repeat E0 and E8 with seeds 0 and 1 to see the spread (M-16), and look for licensed accessible and all-gender signs for the restroom model (C-31).
6. **What a VLM is.** A vision-language model has a vision encoder, such as a ViT, that turns the image into tokens, a connector that maps those tokens into the language model's input, and a language model that writes the answer as text (Lec8 p57). It can describe an image, answer a question about it or read text in it. Our restroom model uses only CLIP's encoders and text prompts, so it gives similarity and gender scores, never free text (Lec8 p56).
7. **Why they miscount or misread.** The language model produces likely words, not a measured count, so fluent answers do not guarantee correct counting or reading (Lec7 p66). It can also hallucinate details that are not in the image, as seen in A17 where square metal joints were read as a flared skirt contour (Lec7 p64, R-6). In our audit, Gemini had an asymmetric female bias (70% men vs 100% women), misclassifying parallel sticks (A11) as female because non-standard geometry defaulted to training priors.
8. **How the audit was run and verified.** We evaluated Google Gemini Auto and Anthropic Claude 3.5 Sonnet on 20 balanced IOAI restroom icons anonymized to A01–A20, using an identical one-sentence prompt in a new chat session per query (`docs/research/vlm-evaluation.md`). Ground truth came from IOAI training set folder labels, and answers were verified directly against full desktop screenshots in Drive `audit/screens/`. Both models scored 17/20 (85.0%) with 80% agreement (16/20). On the same question our zero-shot CLIP (R1) reaches 0.741 in cross-validation, lower than both; our app does not need gender, because the served pipeline (R7) finds the partner directly, 30/30 on test, and no image leaves the laptop.

**Practice:** a teammate picks three of the eight questions at random; answer each without notes in under 40 seconds, and repeat until all three are fluent (R-13). Before you quote a lecture page aloud, open the PDF: the page references in `docs/COURSE-GROUNDING.md` come from AI-made course digests and are unchecked (R-14).

## Rehearsal rules

- Timer visible. Stop at 8:30 no matter what.
- After the run, each person gets two questions from their card and one unexpected question.
- Write down every sentence that was cut or stumbled on, and fix the slide, not the speaker.

---

## Backup slide details (Task R-26)

Checked against the result files on 12 November 2026 (Tair). B1–B5 match the generated deck. B6–B8 (the CLO slides) were then built into the deck from these notes; the deck's wording is in `docs/deck/SLIDES.md`. B9–B11 are notes only.

### Backup B1 · Full pothole metrics table
**Speaker:** Amina · **budget** on request
**Title:** All 9 pothole runs: validation and test metrics
**On the slide:**
- All 9 runs: E0 baseline, E1 model width (small), E2 random weights, E3 frozen backbone, E4 AdamW, E5 augmentations off, E6 960 px, E7 P2 head, E8 combination.
- Columns: validation mAP50 and recall at 0.40; test mAP50, mAP50-95, precision and recall at 0.40; model size (MB).
- Selection rule: highest validation mAP50; runs within 0.01 of the best count as tied, and the tie goes to the higher validation recall at 0.40.
- Result: E0, E1, E4, E6 and E8 tie; E1 has the highest validation recall (0.738), so the app serves E1. E8 uses the E0 settings because no single change beat E0 by more than 0.01.
**Sources:** `ml/results/experiments.csv` (all rows) · `docs/ML-EXPERIMENT.md` ('Selection rule')

### Backup B2 · Operating point
**Speaker:** Amina · **budget** on request
**Title:** E1 at the app's threshold (0.40), on the test split
**On the slide:**
- 100 test photos, 236 potholes: found 176, false alarms 30, missed 60.
- Precision 0.854, recall 0.746, F1 0.796 (IoU 0.5, each labelled box matched once).
- Right: Ultralytics' precision-recall curve for E1 on test; its legend rounds mAP50 to 0.816 (experiments.csv: 0.8155).
- 0.40 is the threshold the app counts at. A missed pothole costs more than a false alarm, so recall breaks ties.
**Sources:** `ml/results/operating_point.json` (tp, fp, fn, precision, recall, f1) · `docs/ML-EXPERIMENT.md` ('Operating point', 'Selection rule') · `ml/results/experiments.csv`

### Backup B3 · Training loss curves
**Speaker:** Amina · **budget** on request
**Title:** Training against validation box loss
**On the slide:**
- E0, E2 and E5 over their 40 epochs.
- E2 trains from random weights, so its loss starts high (train 3.70, validation 3.81 in epoch 1).
- E5 (augmentations off): training loss falls from 1.66 to 0.29, validation loss never improves on epoch 1 (1.38, ends at 1.52). That is overfitting.
**Sources:** `ml/results/runs/E0-results.csv`, `E2-results.csv`, `E5-results.csv` (`train/box_loss`, `val/box_loss`)

### Backup B4 · Rules, size bands and worked example
**Speaker:** Amina · **budget** on request
**Title:** Pothole severity: k-means size bands and fixed rules
**On the slide:**
- k-means (k = 3) on 1,198 training boxes: small below 1.15 %, medium 1.15–7.27 %, large from 7.27 % of image area.
- Worked example: 1 large in the lane (4 × 1.5 = 6), 1 medium in the lane (2 × 1.5 = 3), 1 small off the lane (min(1, 2) = 1).
- Subtotal 6 + 3 + 1 = 10. No cluster bonus (needs 3 medium or large boxes).
- Highway × 1.5 → 15 → critical: repair within 24 h.
**Sources:** `ml/results/pothole_area_clusters.json` · `docs/RULES.md` (part 1, worked example A) · `web/lib/rules/config.ts`

### Backup B5 · Restroom approaches and final pipeline
**Speaker:** Nazar · **budget** on request
**Title:** Restrooms: from the IOAI baseline to the two-step pipeline
**On the slide:**
- Baseline (R0, the IOAI one): zero-shot CLIP ViT-B/16, 23 of 30 test queries (0.767).
- Step 1: SIFT and a pixel check find the crop's original. Step 2: 0.3 × colour histogram + 0.7 × CLIP (z-scored) finds its partner. One global assignment (Hungarian) for all queries.
- Chosen on 200 training episodes (0.960 ± 0.041), then validation; the test split was read once: 30/30.
**Sources:** `ml/results/restroom/pipeline.json` · `ml/results/restroom/experiments.csv` (R0, R7) · `docs/ML-EXPERIMENT-RESTROOM.md` ('The final pipeline') · `api/restroom_pipeline.py`

### Backup B6 · CLO 5: Machine learning methods and quality metrics
**Speaker:** Amina / Nazar · **budget** on request
**Title:** CLO 5: classification and clustering on a prepared dataset, assessed on "the correctness of the method chosen and the justification of the quality metric" (Syl p.2)
**On the slide:**
- Potholes: a YOLO detector; mAP50 on validation picks the model, recall at 0.40 breaks ties (a miss costs more than a false alarm).
- Restroom matching: top-1 accuracy on the IOAI queries (the contest's own metric).
- Restroom gender: the app serves zero-shot CLIP prompts, 0.756 on all 328 training signs; a logistic probe gets 0.741 in 5-fold cross-validation grouped by restroom.
- Clustering: k-means (k = 3) on log box area gives the size bands 1.15 % and 7.27 %.
**Sources:** `docs/ML-EXPERIMENT.md` ('Selection rule') · `docs/ML-EXPERIMENT-RESTROOM.md` · `ml/results/restroom/runs/R1.json` (`zero_shot_prompts.accuracy`, `probe_lr.accuracy`) · `ml/restroom/common.py` (GroupKFold) · `ml/results/pothole_area_clusters.json` · Syllabus p.2 (CLO 5)

### Backup B7 · CLO 6: Working prototype, documentation and verification
**Speaker:** Tair / Alizhan / Roma · **budget** on request
**Title:** CLO 6: a working prototype, documented and defended, assessed on "the working state of the prototype, completeness of documentation and quality of the defence" (Syl p.2)
**On the slide:**
- Prototype: Next.js web app and a FastAPI model service with YOLO (`jolscan-e1.pt`) and CLIP ViT-B/32.
- Documentation: the document map and a 43-term glossary (`docs/README.md`, `docs/research/glossary.md`).
- Checks: one CI workflow with three jobs (`web`: lint, types, Vitest, build; `python`: result checks and API tests; `up-to-date`).
- Verification: 14 manual test scripts (TS-01 to TS-14), 18 prepared answers (Q1 to Q18) and a defense runbook.
**Sources:** `docs/README.md` · `api/main.py` · `.github/workflows/ci.yml` · `docs/QA-SCRIPTS.md` · `docs/DEFENSE-QA.md` · `docs/DEFENSE-RUNBOOK.md` · Syllabus p.2 (CLO 6)

### Backup B8 · CLO 7: Evaluating generative AI tools
**Speaker:** Roma · **budget** on request
**Title:** CLO 7: "identifying their limitations, errors, and ethical and legal risks", assessed on "the rigour of the verification procedure and the strength of the conclusion" (Syl p.3)
**On the slide:**
- Audit: Gemini and Claude (free web chats) each named the gender of 17 of 20 IOAI signs; 20 signs are too few to rank them.
- Six cases where an AI tool was wrong, each with the check that caught it (`docs/AI-USAGE-LOG.md`).
- Rule we follow: verify important claims, choose evidence over fluency (Lec7 p64, p70).
- Privacy: no personal or biometric data to external AI services (Syl p.9); the audit used only IOAI icons.
**Sources:** `docs/research/vlm-evaluation.md` · `docs/AI-USAGE-LOG.md` ('What the AI tools got wrong') · `docs/research/privacy-and-law.md` · Syllabus p.3 (CLO 7), p.9

### Backup B9 · System architecture and API contracts
**Speaker:** Alizhan / Tair · **budget** on request
**Title:** Architecture: two models, three providers, one JSON contract
**On the slide:**
- Providers: `mock` (canned results, the default), `local` (FastAPI on the laptop, port 8000), `cloud` (opt-in: a hosted model service at `CLOUD_MODEL_API_URL`, our API on a Hugging Face Space or Roboflow's hosted API).
- Contracts: `InferenceResult`, `CompareResult`, `MatchResult` (`api/schemas.py`), mirrored in the web app's types.
- Model calls run in a thread pool (`run_in_threadpool`), so `/health` still answers during a prediction.
- If the API cannot be reached, the app says so and how to fix it, or to switch to the mock provider in Settings (TS-11).
**Sources:** `docs/ARCHITECTURE.md` (sections 1, 2) · `api/schemas.py` · `api/main.py` · `web/lib/providers/` · `docs/QA-SCRIPTS.md` (TS-11)

### Backup B10 · Errors on the test split
**Speaker:** Amina / Nazar · **budget** on request
**Title:** Where the models are wrong, and what we have not measured
**On the slide:**
- Potholes at 0.40: 30 false alarms and 60 missed potholes out of 236 (per photo in `operating_point.json`).
- We have not sorted these errors by cause. `docs/RULES.md` assumes false alarms are mostly small (shadows, patches, manhole covers), which is why small boxes are capped; that is an assumption, not a measurement.
- Labels: the D-2 review found shadows or water blurring box boundaries in some photos (`img-213`, `img-25`; `img-352`, `img-412`, `img-409`, `img-448`).
- Restrooms: 30/30 on test leaves no test error to show; in the R-6 audit both VLMs got A17, a blocky robot figure, wrong.
**Visual:** none committed yet.
**Sources:** `ml/results/operating_point.json` · `docs/RULES.md` (small-detection cap) · `data/README.md` (D-2 review) · `docs/research/vlm-evaluation.md`

### Backup B11 · Data model (target, not built)
**Speaker:** Tair · **budget** on request
**Title:** Where data lives today, and the database we did not build
**On the slide:**
- Not built: a real database is out of scope (PLAN.md section 2).
- Today: reports and checks stay in the browser's localStorage. The API appends one CSV line per prediction (time, latency, number of boxes, mean confidence, model, provider) only when `PREDICT_LOG_PATH` is set, and never stores the image.
- Target schema (ARCHITECTURE.md section 4): `photos`, `analyses`, `detections`, `rules`, `rule_hits`. Each analysis keeps provider, model, latency, severity and score.
- `rule_hits` stores the points each rule gave, so a score can be explained later.
**Sources:** `docs/PLAN.md` (section 2, out of scope) · `docs/ARCHITECTURE.md` (section 4) · `api/main.py` (`_log_prediction`)
