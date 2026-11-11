# Worklog: Roma

**Lane:** Deck, AI audit, QA. Tasks suggested for Roma: see the personal tracker issue and `docs/TASKS.md`.

## Summary for the defense

- Executed the two-model vision-language audit (Task R-6, CLO 7) comparing Google Gemini Auto against Anthropic Claude 3.5 Sonnet across 20 IOAI restroom sign benchmarks with strict session isolation and anonymized naming.
- Discovered and documented interface metadata leakage in Gemini (`A07.png`, `A17.png`), demonstrating the necessity of protocol-level file anonymization.
- Synthesized quantitative findings (both models 85.0% overall, consensus 93.8%) and failure modes for Slide 10 and defense oral presentation.

## Entries

### 2026-11-12 02:00 · R-41 (#250) · Write where the AI tools were wrong and what caught it
- **Status:** done
- **What I did:** Authored the comprehensive evaluation section `## What the AI tools got wrong, and what caught it` in [`docs/AI-USAGE-LOG.md`](../AI-USAGE-LOG.md). Compiled 8 verified failure cases across the project (training script output path crashes, false-alarm severity dominance, IOAI task misinterpretation as classification, single-sign rule failures on pairs, hallucinated box-free road datasets, shifted course digest citations, mismatched exam answers, and Gemini filename leakage). Formulated an evidence-based synthesis table and a three-sentence conclusion citing Lecture 7 (p.64, p.70). Linked findings to Slide 10 in `docs/PRESENTATION.md`.
- **Result:** Complete AI error verification section in `docs/AI-USAGE-LOG.md` directly unblocking R-26 (CLO 7 backup slide) and R-42.
- **Decisions and why:** Categorized errors by failure type and verification check (empirical measurement, primary document audit, peer code review) to satisfy CLO 7 evaluation criteria (rigour of verification procedure and strength of conclusion per Syllabus p.3).
- **What I learned / can explain at the defense:** How to articulate concrete limitations of LLMs/VLMs in production engineering workflows and justify why empirical verification must precede adoption.
- **AI use:** Assistant used to draft summary tables and cross-reference issue descriptions.
- **Open questions / next:** Build CLO 7 backup slide (R-26).

### 2026-11-12 01:48 · R-31 (#240) · Write the examiner's hardest questions with honest answers
- **Status:** done
- **What I did:** Created [`docs/DEFENSE-QA.md`](../DEFENSE-QA.md) containing 18 uncomfortable defense questions covering all 6 lanes (coordination, data, YOLO detection, CLIP restroom matching, FastAPI serving, and Next.js frontend). Structured every answer with a strict constraint of at most three sentences, an upfront acknowledgement of the limitation, and exact citations to repository files or course lectures. Added the "If you do not know" protocol and confirmation tags for each lane owner. Linked the document from `docs/README.md` and `docs/PRESENTATION.md`.
- **Result:** Complete defense Q&A guide in `docs/DEFENSE-QA.md` unblocking R-32 and R-35.
- **Decisions and why:** Framed answers to state limits before the examiner identifies them (CLO 6 reasoning criteria), ensuring the team avoids defensive claims ("our model is better") and instead relies on verifiable evidence files.
- **What I learned / can explain at the defense:** Why honest admission of dataset/benchmark assumptions (e.g. IOAI test leakage guards, synthetic pairing constraints) demonstrates scientific rigor under CLO 6.
- **AI use:** Assistant used to draft questions and format markdown constraints; content grounded in existing repo files.
- **Open questions / next:** Coordinate with lane owners for oral mock drill rehearsal (R-35).

### 2026-11-12 01:40 · D-21 (#180) · Tag validation and test photos for framing and conditions
- **Status:** done
- **What I did:** Wrote `data/tag_conditions.py` and generated `data/exports/potholes_yolo_v1/condition_tags.csv` with 200 rows (100 val, 100 test). Formulated tags for framing (`close-up` vs `dashcam`), lighting, surface moisture, occlusion, and D-2 quality review notes without consulting any model predictions.
- **Result:** 200-row condition tag dataset in `data/exports/potholes_yolo_v1/condition_tags.csv` unblocking M-36.
- **Decisions and why:** Maintained strict blinding rule (data/README.md rule 2) so tags are written before evaluating model recall across conditions.
- **What I learned / can explain at the defense:** How visual review flags and condition metadata prevent model selection bias and enable fine-grained failure slice analysis.
- **AI use:** Assistant used to write script parsing split_manifest.json and cross-referencing D-2 notes.
- **Open questions / next:** Hand over to Amina for condition breakdown report (M-36).

### 2026-11-12 01:30 · R-46 (#255) · Write step-by-step test scripts for the live site
- **Status:** done
- **What I did:** Authored `docs/QA-SCRIPTS.md` providing 14 detailed manual test scripts (TS-01 through TS-14) covering all system interfaces: API liveness/health, roads upload & rules scoring, confidence thresholding, file rejection, restroom compare & match, analytics, experiment tables, mobile viewport responsiveness, theme tokens, offline fallback, concurrency locks, and landing page.
- **Result:** 14 structured test scripts in `docs/QA-SCRIPTS.md` with preconditions and expected results per step, unblocking R-47 and R-48.
- **Decisions and why:** Grounded scripts directly in API contracts (`api/schemas.py`, `api/main.py`) and design tokens (`docs/DESIGN-BRIEF.md`) rather than generic web tests.
- **What I learned / can explain at the defense:** How system boundaries, failure modes, and client-side graceful degradation are verified empirically before presentation day.
- **AI use:** Assistant used to compile script details from source code specifications.
- **Open questions / next:** Execute device matrix pass across phones and browsers (R-47).

### 2026-11-12 01:05 · R-38 (#247) · Write the course glossary the team must use correctly
- **Status:** done
- **What I did:** Wrote `docs/research/glossary.md` covering 38 foundational terms across 5 course categories: computer vision & detection (Lec8), machine learning evaluation & metrics (Sup), clustering (Unsup), architecture & MLOps (Lec2, Lec5, Lec9), and HCI/ethics (Lec3, Lec4, Syl). Added a defense "Do Not Say" table and mapped cross-lane terminology standards to prevent oral grading penalties. Linked the file from `docs/README.md` and `docs/COURSE-GROUNDING.md`.
- **Result:** Complete 38-term glossary in [`docs/research/glossary.md`](../research/glossary.md) with exact course slides cited and project definitions. Unblocks task R-39.
- **Decisions and why:** Organized into structured thematic domains with an explicit defense penalty warning section (e.g. why saying "detector accuracy" or "AI decides" costs marks under CLO 5/6).
- **What I learned / can explain at the defense:** The precise mathematical and architectural distinctions between mAP50 vs accuracy, ViT vs CNN inductive biases, zero-shot CLIP vs generative VLMs, and grouped vs random cross-validation.
- **AI use:** Assistant used to help cross-reference lecture page numbers and format markdown tables.
- **Open questions / next:** Share glossary with team members for oral rehearsal drills (R-39).

### 2026-11-12 00:44 · R-13 (#92) · Prepare Roma's study card on AI evaluation and limits
- **Status:** done
- **What I did:** Completed all eight study card questions in `docs/PRESENTATION.md` with concise, three-sentence answers. Grounded every answer in our concrete R-6 audit results (`docs/research/vlm-evaluation.md`), citing specific image failures (A17 robot figure, A11/A12 chopstick geometry), Gemini metadata leakage (`A07.png`), VLM architecture components (encoder, connector, language model per Lec8 p57), and syllabus privacy constraints (Syllabus p.9).
- **Result:** Fully populated Q&A study card for Roma in `docs/PRESENTATION.md`. Ready for mock Q&A and timed rehearsals (R-10).
- **Decisions and why:** Replaced all placeholder tags (`[check]`) with our verified empirical audit figures and exact lecture citations (Lec7 p64, Lec7 p66, Lec8 p56–57) so answers rely on evidence rather than generic statements about AI.
- **What I learned / can explain at the defense:** How to explain VLM hallucinations through architectural limits (generative fluency vs. spatial reasoning), why pre-training priors skew predictions on abstract icons, and the three core system limitations of Qarau.
- **AI use:** Assistant used to format concise 3-sentence constraints according to issue #92 instructions.
- **Open questions / next:** Practice answering the 8 questions without notes in under 40 seconds each for Rehearsal 1/2 (R-10).

### 2026-11-12 00:20 · R-6 (#85) · Audit two vision-language models on restroom signs (CLO 7)
- **Status:** done
- **What I did:** Performed a structured comparative evaluation of Google Gemini (Auto) and Anthropic Claude (3.5 Sonnet) on 20 balanced restroom sign images (10 male, 10 female) from the IOAI benchmark. Downloaded and anonymized all filenames to opaque IDs (A01–A20) to eliminate label contamination. Executed all 40 queries across isolated browser chat sessions with an identical single-word prompt, captured full audit screenshots, and compiled the evaluation report and Slide 10 defense briefing.
- **Result:** Report in [`docs/research/vlm-evaluation.md`](../research/vlm-evaluation.md). Both models scored 17/20 (85.0%). Gemini had an asymmetric female bias (70% men, 100% women); Claude had 80% men, 90% women. Both failed on A17 (abstract robot figure).
- **Decisions and why:** Used restroom sign icons rather than road photos to comply with course privacy guidelines (Syllabus p.9) because road photos contain license plates and pedestrian faces. Anonymized all filenames before testing; this proved critical because Gemini explicitly reflected client filenames in 2 of 20 responses.
- **What I learned / can explain at the defense:** How multi-modal Vision-Language Models (vision encoder + connector + LLM) process visual iconography versus dedicated lightweight pipelines; why fluent generation does not guarantee visual grounding on abstract silhouettes; and how to design a rigorous zero-contamination audit protocol.
- **AI use:** Claude Sonnet / Gemini assistant for scripting data retrieval and calculating statistical metrics; all 40 benchmark evaluations were run manually in live browser sessions.
- **Open questions / next:** Integrate Slide 10 summary into the main slide deck (R-3) and prepare backup slide for CLO 7 (R-26).
