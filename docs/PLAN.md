# Qarau: project plan

ICT1103 Assignment #2, group machine-learning project. Computer Vision track.
Team: Tair, Dameli, Nazar, Alizhan, Amina, Roma. Defense: Thursday 12 November 2026 (slot to be booked, task X-3).

**One sentence:** Qarau (қарау, "to inspect") checks public infrastructure from photos with computer vision and turns what the model sees into a decision using rules the team defines, shown in one web app with two modules:

1. **Roads:** a fine-tuned YOLO detector finds potholes, and the rules turn them into a repair priority. Experiment: [ML-EXPERIMENT.md](ML-EXPERIMENT.md).
2. **Restrooms:** CLIP predicts the gender on restroom door signs and finds matching pairs (the IOAI 2025 "Restroom" task), and the rules say whether the signage is clear. Experiment: [ML-EXPERIMENT-RESTROOM.md](ML-EXPERIMENT-RESTROOM.md).

The name is a working name, set in one place (`web/lib/brand.ts`).

**If time runs short, the restroom module is the safer one:** its data, labels and scoring script are ready, and the zero-shot runs need no GPU. The pothole module depends on the dataset licence check and Colab training finishing on time.

## 1. What is graded

From the assignment sheet and the syllabus (sources in [COURSE-GROUNDING.md](COURSE-GROUNDING.md)):

| Requirement | Source | How we meet it | Where |
|---|---|---|---|
| Research-driven project in Computer Vision | A2 p1 | Pothole detection and restroom sign matching | whole repo |
| Option A: open-source dataset, modify the model, compare | A2 p1 | Both modules: controlled runs against a fixed baseline, one change each, chosen on validation. The restroom runs change the number of trained transformer layers, the assignment's own example | [ML-EXPERIMENT.md](ML-EXPERIMENT.md), [ML-EXPERIMENT-RESTROOM.md](ML-EXPERIMENT-RESTROOM.md) |
| Classification and clustering applied correctly, with a justified quality metric (CLO 5) | Syl p.3 | Restroom gender classification with scikit-learn logistic regression and grouped cross-validation. Detection framed as per-box classification with mAP50. k-means on pothole box sizes for the rule thresholds | both experiment files, task D-11 |
| Working prototype, complete documentation, quality of defense (CLO 6) | Syl p.3 | Web app, API, this `docs/` folder, rehearsed talk | `web/`, `api/`, `docs/` |
| Evaluate generative AI tools, their limits and risks, with a verification procedure (CLO 7) | Syl p.3 | A written audit of two vision-language models on the same photos and prompt, scored against labels, plus the AI usage log with how each output was checked | task R-6, [AI-USAGE-LOG.md](AI-USAGE-LOG.md) |
| Prompt log is mandatory at AI level 3 | Syl p.9 | AI-USAGE-LOG.md with the saved transcripts of every member | AI-USAGE-LOG.md, task X-13 |
| Only open, licence-clean data sources: the syllabus lists data.egov.kz, stat.gov.kz, Kaggle, UCI, OpenML | Syl p.9 | Dataset licence recorded, a Kaggle source cited if one exists, otherwise ask the instructor | task D-1 |
| "Submitted through the LMS and defended in class" | Syl p.6 | The assignment sheet says nothing is submitted. Ask the instructor, and upload the deck and repo link either way | task X-11 |
| Contribution log: who did what | Syl p.5 | [CONTRIBUTION-LOG.md](CONTRIBUTION-LOG.md) plus git history | CONTRIBUTION-LOG.md |
| Every member answers an individual question on their own part. A member who cannot explain their part does not get the team mark | Syl pp.5–6 | Each person owns one lane and one study card | section 3, [PRESENTATION.md](PRESENTATION.md) |
| No personal or biometric data to external AI services or public repositories | Syl p.9 | Public repository (decision 0006), so nothing personal is committed: no photos with people, faces or licence plates, no personal data in docs; teammates use GitHub no-reply emails (task X-18). Cloud mode is opt-in. Only screened public dataset images go to cloud services | ARCHITECTURE.md, task D-12 |
| Slides or a landing page, source code ready, an MVP-like interface is an advantage | A2 p1 | Landing page, web app, deck | `web/`, PRESENTATION.md |
| 10 minutes on one laptop: at least 7 minutes of talk, 2–3 minutes of questions | A2 p1 | 8-minute script, timed rehearsals | PRESENTATION.md |
| Web interface for a model with Streamlit or Gradio (week 9 activity) | Syl p.15, Lec9 p50 | Gradio app on the same weights, next to the custom web app | `api/gradio_app.py` |

## 2. Scope

**Must have (the defense fails without these)**

1. Dataset documented and split without duplicate leakage: source, licence, size, duplicate groups, split (D-1, D-2, D-4, D-3).
2. Runs E0–E5, E7 and the final E8 trained, each with a committed result file, and a results table on the test split (M-0 to M-13, M-19).
3. Restroom runs R0, R1 and R6 (no GPU needed) and at least one fine-tuning run, with result files and the table on the model page (C-1 to C-6).
4. Clustering of box sizes for the rule thresholds (D-11).
5. A model service that returns real results for an uploaded image in both modules: `/predict`, `/restroom/compare`, `/restroom/match`, and the Gradio app (S-1, S-2, S-4, S-5, C-8), installed on the presenting laptop (S-14).
6. Web app working end to end on demo data, and on the real models for both analyze flows (W-6, W-23, W-20, W-21).
7. The audit of two generative models (R-6).
8. Deck, 8-minute script, demo video, and every member able to explain their part (R lane, study cards).
9. Prompt logs and contribution log filled in by everyone (X-13, X-7), and the LMS question settled (X-11).

**Should have**

- Design references applied: landing, dashboard, motion, mobile.
- Batch-1 latency table, error analysis, MLflow UI on the presenting laptop.
- Cloud mode: the model service on a Hugging Face Docker Space, the Gradio demo on a Space, the web app on Vercel.
- Rules checked against human judgment, real sample photos in the app.

**Stretch, only when everything above is done**

- Run E6 (input resolution).
- External test set of Astana photos.
- Seeds repeated for E0 and E8.
- Map fed with real coordinates from the EDK dataset.

**Provider default, the same everywhere:** the demo default is `mock` (works offline). With the model service running, the app uses `local`. `cloud` is opt-in.

**Out of scope:** user accounts, a real database, payments, mobile app, video input, retraining from the app.

## 3. Lanes and owners

Proposed from what each person asked for in the group chat: Nazar suggested the IOAI restroom task and wants to work with model layers, Amina found the pothole dataset, Alizhan asked for optimisation and UX, Roma for design. Tair confirms or swaps at kickoff. Each lane has one owner who answers the individual question for it.

| Lane | Owner | Supports | Owns | Defense topic to master |
|---|---|---|---|---|
| W: web app and UX | Tair | Dameli | `web/` structure, flows, integration, deployment | Architecture, client–server, HCI decisions |
| G: design system and visuals | Dameli | Tair | Tokens, landing, dashboard visuals, motion, charts | Nielsen heuristics, WCAG, chart choices |
| C: restroom model | Nazar | Tair | `ml/restroom/`, runs R0–R6, restroom results table, signage rule thresholds | CLIP, ViT, zero-shot against fine-tuning, the number of trained layers, matching accuracy, grouped cross-validation |
| M: pothole model | Amina | Alizhan (Colab runs) | `ml/train.py`, runs E0–E8, pothole results table | YOLO, transfer learning, experiment design, mAP and recall |
| D: pothole data and rules | Amina | Roma | Dataset card, split, leakage check, k-means, pothole rules calibration, sample photos | Data quality, split, leakage, privacy rule, rules engine |
| S: serving and performance | Alizhan | Tair | `api/` for both modules, Gradio, Docker, latency, cloud deployment | REST, FastAPI, deployment patterns, MLOps loop, local vs cloud |
| R: research, deck, video, QA | Roma | everyone | Slides, script, demo video, test pass, AI evaluation | Generative-AI limits (CLO 7), limitations, ethics |
| X: coordination | Tair | — | Repo, slot booking, logs, checkpoints | — |

## 4. Timeline (Astana time)

| When | Checkpoint | What must be true |
|---|---|---|
| Tue 10 Nov, 13:00 | Kickoff | Everyone accepted the GitHub invite, read this plan and their lane in [TASKS.md](TASKS.md). Roles confirmed. Defense slot booked |
| Tue 18:00 | C1 | Dataset card done, duplicates grouped, version zip in Drive. Smoke run of `train.py` passed. API answers locally with stock weights. Web app runs on demo data. Deck skeleton exists. LMS question asked |
| Tue 23:00 | C2 | **E0 finished and committed.** E1–E5 and E7 started on several accounts. Selection rule committed. AI audit photos screened |
| Wed 11 Nov, 12:00 | C3 | E1–E5 and E7 finished, E8 training. First results export in the web app. Web app analyzes a photo through the local model. AI audit written |
| Wed 16:00 | Feature freeze | No new features. Only fixes, real data, copy and polish. Deck complete with real numbers |
| Wed 19:00 | Rehearsal 1 | Full timed run on the presenting laptop, with questions from teammates |
| Wed 21:00 | Deploy and record | Web on Vercel, Gradio on Spaces, demo video recorded |
| Wed 23:00 | Code freeze, rehearsal 2 | `main` is tagged `defense`. Offline fallback checked with Wi-Fi off |
| Thu 12 Nov | Defense | Laptop charged, local model service started before the talk, video and screenshots on disk |

## 5. Risks

| Risk | Likelihood | What we do |
|---|---|---|
| E0 is not finished on Tuesday night (the training script has never been run, the dataset may need regrouping) | High | This is the critical path. Smoke run before anything else. Amina and Alizhan work on nothing else until E0 is committed. If it slips, the restroom module carries the results slide |
| Two modules dilute an 8-minute talk | Medium | One demo flow per module, one results slide each. The restroom module goes second and shorter |
| Tair is the single point of failure: web lead, coordinator, Roboflow owner | High | Web polish is P1. Amina gets Roboflow access today. Dameli owns visuals. Alizhan owns integration with the API |
| Free Colab GPU runs out mid-experiment | High | Spread runs over three Colab accounts and Kaggle notebooks, same commit, zip and seed. Commit the run file and save `best.pt` to Drive after every run |
| YOLO26 weights or config fail in Colab | Medium | Switch all runs to YOLO11 n/s and say so. The comparison stays internally consistent |
| Live demo fails (Wi-Fi, service down) | Medium | Mock provider works offline. Local provider needs no internet. Video and screenshots as last resort |
| Dataset licence unclear | Medium | Resolve today (D-1). If it cannot be shown to be open, switch to another Roboflow Universe pothole dataset with a stated licence before E0 |
| Someone cannot explain their part | Medium | Study cards, and Rehearsal 1 includes individual questions for every member |
| Mock numbers end up on a slide | Low, but serious | The app shows a "Demo data" badge until `experiments.json` has `isMock: false`. Slides take numbers only from `ml/results/experiments.csv` |
| Web polish eats the time meant for the experiment | High | The model lane does not wait for the web lane. Feature freeze Wednesday 16:00 |
| Roma has no laptop | Known | Roma's tasks need only a browser: slides, script, QA on the deployed site, the AI evaluation |

## 6. Definition of done for the defense

- `ml/results/experiments.csv` has at least E0–E5 and E8 with test metrics, and the same table is in the deck and on the model page.
- `ml/results/restroom/experiments.csv` has R0, R1, R6 and at least one fine-tuning run, and the same table is on the model page.
- `docs/research/vlm-evaluation.md` exists with the protocol and the table.
- On the presenting laptop: start the API, open the web app, upload a photo that is not in the training set, see boxes, severity and rule hits in under 10 seconds.
- The same flow works with Wi-Fi off using the mock provider.
- Every member has answered three practice questions on their lane without notes.
- AI-USAGE-LOG.md and CONTRIBUTION-LOG.md are complete, and `docs/` reads cleanly from top to bottom.

## 7. Open questions for the team

1. Defense slot: Thursday is assumed from the chat. Who books it, and which list (Olzhas or Dilnura)? All six must have the same lab instructor (A2 p1).
2. Roboflow dataset: which Universe dataset was forked, what is its licence, and does the instructor accept a source outside the syllabus list (Kaggle, UCI, OpenML, egov, stat.gov)?
   Also: does Assignment #2 need an LMS upload? The syllabus and the assignment sheet disagree.
3. Who presents which slide? A proposal is in PRESENTATION.md.
4. Roma's GitHub username, to add to the repo.
5. Product name: Qarau is a working name, set in `web/lib/brand.ts`.
6. Lanes changed with the second module: Nazar moves to the restroom model, Amina takes the pothole model with Alizhan running Colab jobs. Confirm at kickoff.
