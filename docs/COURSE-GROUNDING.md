# Course grounding

Every decision in this project should be explainable with something taught in ICT1103. This page is the short map, with page references.

The two full course digests (modules 1–5: syllabus, ML introduction, architecture, HCI, databases, data analysis, networks, cybersecurity, Kazakhstan law; modules 6–9: supervised and unsupervised ML, NLP and LLMs, computer vision, cloud and MLOps, the labs, and 15 likely questions with answers) paraphrase QAIRU lecture slides page by page. Since the repository is public, they are kept out of it (decision 0006, task X-18): ask Tair, or find them in the team's shared Drive folder `course-digests/`.

The digests were produced by an AI model reading the lecture files. Before you quote a page number on a slide, open the lecture and check it.

Reference style: `Lec8 p38` is page 38 of the Lecture 8 deck. `Syl` is the syllabus, `A2` the assignment sheet, `Sup` the supervised-learning deck. See the unified [Course Glossary](research/glossary.md) (`docs/research/glossary.md`) for 38 standardized course terms and the defense "Do Not Say" guidelines.

## What the syllabus says about this project

- The group project is the 30-point assignment of Midterm Control 2, defended in class in week 10, mapped to CLO 5, 6 and 7 (Syl p.6).
- CLO 5 is assessed on "the correctness of the method chosen and the justification of the quality metric". CLO 6 on "the working state of the prototype, completeness of documentation and quality of the defence". CLO 7 on "the rigour of the verification procedure and the strength of the conclusion" when evaluating generative AI tools (Syl p.3).
- Each team keeps a contribution log, every member is asked an individual question about their own part, and "a student who cannot explain their own part does not receive the team mark" (Syl p.5).
- AI level 3 applies: "A prompt log is mandatory." AI use is declared with tool and version, purpose, key prompts, what was produced or changed, and how it was verified (Syl pp.4, 9).
- "Personal, medical, biometric, financial or confidential data must never be uploaded to external AI services or public repositories." The named alternative is a local model (Syl p.9).
- Datasets: "Only open, licence-clean sources: data.egov.kz, stat.gov.kz, Kaggle Datasets, UCI Machine Learning Repository, OpenML" (Syl p.9).
- The project is "submitted through the LMS and defended in class in week 10" (Syl p.6). The assignment sheet says nothing has to be submitted. Ask the instructor (task X-11).
- The week 8 activity for CLO 7 is a comparative audit of two generative models with a verification protocol. Task R-6 follows that format.
- CLO 5 names classification and clustering. Detection is classification per box, and task D-11 applies k-means to box sizes. See ML-EXPERIMENT.md.

## By lane

### Restroom model (Nazar)

| Topic | What to cite | Source |
|---|---|---|
| Task type | Classification ("what") on each sign, plus similarity between signs | Lec8 p11 |
| CLIP | Contrastive image–text model trained on 400M pairs, which allows zero-shot classification with text prompts | Lec8 p56 |
| ViT | The image is split into 16×16 (or 32×32) patches that become tokens; little built-in image bias, so it relies on large pretraining | Lec8 p46–47 |
| Zero-shot against fine-tuning | Reuse a pretrained backbone, then fine-tune the last layers if needed | Lec8 p38 |
| Number of trained layers | The assignment's own example of a model change for Option A | A2 p1 |
| ViT on small data | ViT needs large data; here the large data is CLIP's pretraining, and we only adapt a few blocks on 82 restrooms | Lec8 p54 |
| Classifier on embeddings | Logistic regression in scikit-learn, as in the labs | Sup p23, Labs 4 and 6 |
| Grouped cross-validation | k-fold rotates the validation set. Grouping by restroom keeps both signs of one restroom on the same side, so nothing leaks | Sup p26, Sup p10 |
| Metric | Top-1 matching accuracy is plain accuracy on the queries. With 10 validation queries, one query is 0.10 | Sup p27, Lec8 p42 |
| Overfitting | More trained layers on little data can raise training fit while validation falls | Sup p24 |

### Pothole model (Amina)

| Topic | What to cite | Source |
|---|---|---|
| Task type | Detection is "what and where", the second rung of the vision task ladder | Lec8 p11 |
| Why YOLO | One-stage detectors run in real time. The lecture points to Ultralytics YOLO | Lec8 p40 |
| Transfer learning | Reuse a pretrained backbone, augment, fine-tune the last layers | Lec8 p38 |
| CNN, not ViT | CNNs fit efficiency and small data. ViT needs large data and compute | Lec8 p54 |
| How a CNN learns | Shared-weight convolutions, pooling, edges to textures to objects. Predict, measure loss, backpropagate, update | Lec8 p32–33 |
| Metrics | IoU for localisation, mAP for detection, precision and recall for error trade-offs. Report the protocol | Lec8 p42, Sup p27 |
| Which error is worse | Recall matters when a miss is costly | Sup p27 |
| Split | 70/15/15, test set kept untouched until the end | Sup p10 |
| Overfitting | Train error low while validation error rises. Controls: augmentation, early stopping, more data | Sup p24, p26 |
| Fair comparison | Same split and seed, one change per run, name the limit of a single test set | Lab 8 Mission 4 |
| Learning rate | Too high diverges, too low stalls | Sup p14 |
| Not in the course | Named optimizers (SGD, Adam), batch size, epochs. The assignment sheet lists optimizers as an example of what to change, so be ready with a one-line explanation of each | A2 p1 |

### Pothole data and both rule sets (Amina, Nazar for the signage rules)

| Topic | What to cite | Source |
|---|---|---|
| Process | CRISP-DM: business understanding, data understanding, preparation, modelling, evaluation, deployment | Lab 4, Lec4-DMViz p14–19 |
| Data quality | Check for duplicates, missing values, bias in how data was collected | Lab 4 |
| Leakage | Fit and tune on train only. Split before any processing that learns from data | Sup p10, Lab 6 |
| Dataset version | Record the exact data version each model saw | Lec9 p33 |
| Photo metadata | EXIF holds geolocation and camera settings | Lec4-DataMgmt p12–14 |
| Privacy rule | No personal or biometric data to external AI services | Syl p.9 |
| Rules after the model | "Rules still matter" for simple, controlled decisions | Lec8 p66 |
| Explainability | A black box fails to build user trust. Interpretability is one of the six pillars | Lec4-DataMatrix p13–14 |

### Serving (Alizhan)

| Topic | What to cite | Source |
|---|---|---|
| Client–server | Browser is the client, model service is the server | Lec2-Arch p43 |
| REST and JSON | HTTP methods and status codes carry meaning: 200, 400, 500 | Lec5-Inet p22, p31 |
| FastAPI `/predict` | The serving example in the lecture | Lec9 p53 |
| Gradio and Streamlit | Gradio for quick demos with a built-in API, Streamlit for dashboards | Lec9 p50–51 |
| Docker | An image bundles code, libraries and model files | Lec9 p19–20 |
| Deployment patterns | Batch, Online, Edge | Lec9 p42 |
| Local against cloud | Cost, privacy, latency | Lec7 p19, Lec9 p7 |
| CPU and GPU | GPUs for deep-learning training and inference | Lec2-Arch p26–32, Lec9 p12 |
| MLOps | Lifecycle loop, maturity levels 0, 1, 2. We are at Level 0 (manual), and can say what Level 1 would need | Lec9 p31–32 |
| Monitoring | Latency, errors, accuracy when labels arrive. Data drift and concept drift | Lec9 p43 |
| Secrets | No keys in code | Lec9 p16 |

### Web app and design (Tair, Dameli)

| Topic | What to cite | Source |
|---|---|---|
| Heuristics | Nielsen's ten. Visibility of system status: the upload shows progress. Aesthetic and minimalist design: the landing page | Lec3-HCI p13–37, examples on p14 and p21 |
| Laws | Fitts's Law for the size and position of the main action. Hick's Law and progressive disclosure for settings | Lec3-HCI |
| Accessibility | WCAG: contrast 4.5:1, alt text, keyboard paths. Tap targets at least 48×48 px | Lec3-HCI |
| Measurable usability | Requirements written as user, task, measurable criterion | Lab 3 |
| Chart choice | Bar for categories, line for time, histogram for distributions, pie only for a few parts of one whole | Lec4-VizBasics p4, Lec4-DMViz p28 |
| Honest charts | Axes start at zero, no truncated axes, high data-ink ratio, colour-blind-safe palette | Lec4-DMViz p31, Lec4-VizICT p11, p17 |
| Storage design | Images in object storage, metadata in SQL. Normalised tables with keys | Lec3-ModernDB p2–8, Lec3-DBSys, Lab 3 |
| Security | HTTPS, input validation, least privilege. Threats named with STRIDE | Lec5-Sec |

### Research and AI evaluation (Roma)

| Topic | What to cite | Source |
|---|---|---|
| What a VLM is | Vision encoder, connector, language model | Lec8 p57 |
| VLM limits | Fluent answers do not guarantee correct counting or reading | Lec7 p66 |
| Zero-shot | CLIP classifies with text prompts, no training | Lec8 p56 |
| LLM risks | Hallucination, bias from training data, privacy | Lec7 p64 |
| Verification | Declare the tool, the prompt, the output and how it was checked | Syl p.9 |

## To check before quoting

- The syllabus cites the Digital Code as No. 255-VIII of 09.01.2026 and the Law on AI as No. 230-VIII of 17.11.2025. The Kazakhstan cybersecurity deck cites a related amendment as No. 256-VIII. If a law number goes on a slide, check it on adilet.zan.kz first.
- The course materials do not cover: named optimizers, batch normalisation, ONNX or quantisation, Grad-CAM, upload security specifics. If asked, say it goes beyond the lectures and give a short plain answer.
