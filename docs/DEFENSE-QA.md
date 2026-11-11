# Hard questions, from the examiner's side

At most three sentences. Say the limit before the examiner does. Every answer points at a file.

---

### Q1. Why should we believe your 30/30 score on the restroom benchmark?
The 30/30 result on the test set has a 95% confidence interval of 0.88–1.00 because 30 queries is a small evaluation sample ([`ml/results/restroom/pipeline.json`](../ml/results/restroom/pipeline.json)). The two-step pipeline was selected on 200 training episodes and validated before test answers were evaluated, avoiding test leakage. However, our benchmark pipeline relies on two assumptions specific to IOAI—that queries are cropped from gallery originals and pairs exist in the gallery—which real municipal deployments do not guarantee ([`ml/restroom/pipeline.py`](../ml/restroom/pipeline.py)).
*Confirmed by: Nazar (restroom model)*

### Q2. The IOAI test answers are publicly available. How do we know you did not tune your model on them?
All model hyperparameters and pipeline stages were chosen strictly using training-set episodes and cross-validation before any test evaluation occurred ([`ml/results/restroom/pipeline.json`](../ml/results/restroom/pipeline.json)). Across our ten tested approaches, six achieved 1.0 on the test split, proving the selected method did not overfit to test labels. Furthermore, every test evaluation was logged sequentially with its git commit in the experiment ledger ([`docs/ML-EXPERIMENT-RESTROOM.md`](ML-EXPERIMENT-RESTROOM.md)).
*Confirmed by: Nazar (restroom model)*

### Q3. Did you beat the IOAI contest winning score of 0.90?
We report our evaluation metrics alongside the IOAI contest numbers for baseline comparison, but we do not claim to beat official contest participants ([`docs/ML-EXPERIMENT-RESTROOM.md`](ML-EXPERIMENT-RESTROOM.md)). Contestants operated under strict submission limits and real-time execution constraints, whereas our pipeline runs as an offline verification benchmark. Any direct claim of superiority would be scientifically misleading without identical contest sandbox enforcement.
*Confirmed by: Nazar (restroom model)*

### Q4. Is the pothole dataset licence-clean and legally permitted for academic use?
The dataset was published on Kaggle under the Open Database License (ODbL) and Database Contents License (DbCL), satisfying the course source rules (Syllabus p.9; [`data/README.md`](../data/README.md)). However, three photographs (`img-409.jpg`, `img-448.jpg`, `img-565.jpg`) contain commercial stock watermarks with unverified original provenance. Under our team decision, these three images are quarantined from any public presentation or web display ([`data/README.md`](../data/README.md), D-2/D-12).
*Confirmed by: Amina (data and rules)*

### Q5. Is the restroom signage dataset licence-clean?
The dataset is published under Creative Commons Attribution 4.0 International (CC-BY-4.0) by the International Olympiad in AI ([`ml/restroom/README.md`](../ml/restroom/README.md)). Because some included icons originate from crowd-sourced signage photos, the CC-BY license applies to the dataset curation rather than individual photo trademarks. We provide explicit contest attribution in all documentation and run inference strictly on local weights ([`data/raw/ioai-restroom/ATTRIBUTION.txt`](../data/README.md)).
*Confirmed by: Nazar (restroom model)*

### Q6. Are the performance numbers shown on your slides real, and how can they be verified?
Every metric on slides 2 through 12 is generated directly from checked-in artifact files and cross-verified by an automated verification script ([`docs/research/deck-sources.md`](research/deck-sources.md)). For potholes, numbers match [`ml/results/experiments.csv`](../ml/results/experiments.csv) and [`web/data/experiments.json`](../web/data/experiments.json); for restrooms, numbers match [`ml/results/restroom/pipeline.json`](../ml/results/restroom/pipeline.json). Placeholders or mock values are clearly labeled with "Demo data" banners in both the deck and UI.
*Confirmed by: Roma (deck and research) & Tair (coordination)*

### Q7. Why did you train a dedicated YOLO detector instead of querying a general Vision-Language Model like Gemini or Claude?
Our empirical audit of Gemini and Claude across 20 signage benchmarks revealed an 85.0% accuracy with spatial hallucinations and prompt sensitivity ([`docs/research/vlm-evaluation.md`](research/vlm-evaluation.md)). In contrast, local YOLO inference runs in ~30 ms on CPU without per-query API costs, network dependencies, or prompt drift ([`api/main.py`](../api/main.py)). In addition, course privacy guidelines forbid transmitting unredacted public road imagery containing faces and vehicle plates to cloud API providers (Syllabus p.9).
*Confirmed by: Roma (research) & Amina (pothole model)*

### Q8. Why are repair priority scores calculated using deterministic rules rather than an end-to-end machine learning model?
Deterministic rules guarantee explainable, auditable maintenance rankings where municipal dispatchers can trace exact factors such as lane position, pothole area, and school zones ([`docs/RULES.md`](RULES.md)). An end-to-end model would obscure decisions behind uncalibrated weights and lacks grounded training labels for municipal repair urgency. Deterministic scoring also allows road engineers to adjust hazard thresholds dynamically without retraining deep vision models.
*Confirmed by: Amina (data and rules)*

### Q9. Why do you report precision, recall, and mAP instead of classification accuracy for pothole detection?
Every photo in the 100-image test split contains at least one pothole, so a trivial dummy predictor outputting "pothole present" would achieve 100% classification accuracy without detecting anything ([`data/exports/potholes_yolo_v1/split_manifest.json`](../data/exports/potholes_yolo_v1/split_manifest.json)). Object detection requires evaluating spatial intersection-over-union (IoU) between bounding boxes, where negative background patches cannot be uniquely counted ([`docs/ML-EXPERIMENT.md`](ML-EXPERIMENT.md)#why-not-accuracy). We therefore evaluate mAP50 and recall at our operating confidence threshold of τ = 0.40.
*Confirmed by: Amina (data and rules)*

### Q10. Exactly what code and documentation did AI tools write, and what did team members write?
All AI tool interactions are recorded with dates, prompts, and verified error cases in [`docs/AI-USAGE-LOG.md`](AI-USAGE-LOG.md) as required by syllabus AI level 3. AI assistants generated scaffold boilerplate, documentation outlines, and unit test skeletons, but all model weights, evaluation metrics, and architectural decisions were executed and verified by team members. Furthermore, six documented instances of AI hallucinations were identified and manually corrected during development ([`docs/AI-USAGE-LOG.md`](AI-USAGE-LOG.md)).
*Confirmed by: Roma (research) & Tair (coordination)*

### Q11. Why did you use K-means clustering on box area to define pothole size bands instead of standard civil engineering measurements?
Photographs taken without calibrated depth sensors or camera intrinsics cannot yield metric dimensions in centimeters, so size categories must reflect image-relative area fractions ([`docs/RULES.md`](RULES.md), D-11). K-means clustering (k=3) was fit to log-transformed areas of 1,198 training boxes, yielding geometric split boundaries of 1.15% (small/medium) and 7.27% (medium/large) ([`ml/results/pothole_area_clusters.json`](../ml/results/pothole_area_clusters.json)). We explicitly document that these clusters represent visual salience bands rather than structural road engineering measurements.
*Confirmed by: Amina (data and rules)*

### Q12. How do you know your vision models will generalize to real roads and weather conditions in Kazakhstan?
Our validation and test images were blinded and tagged across framing, lighting, surface moisture, and occlusion categories ([`data/exports/potholes_yolo_v1/condition_tags.csv`](../data/exports/potholes_yolo_v1/condition_tags.csv)). The dataset represents predominantly daylight asphalt conditions, meaning model recall may degrade on snow-covered, gravel, or unlit rural roads ([`data/README.md`](../data/README.md), D-2). We state this geographic limitation explicitly at the defense rather than claiming unverified winter generalization.
*Confirmed by: Roma (QA) & Amina (data)*

### Q13. What happens if the backend model service fails or the user has no internet connection?
The frontend architecture implements a three-tier provider switch (`mock`, `local`, `cloud`) designed to prevent demo failures during defense presentations ([`docs/ARCHITECTURE.md`](ARCHITECTURE.md)). If FastAPI is unreachable, the web client displays an immediate service warning and allows instant fallback to client-side mock evaluation with canned sample data. The application fails gracefully with status badges and error toast notifications rather than unhandled white-screen crashes ([`docs/QA-SCRIPTS.md`](QA-SCRIPTS.md), TS-11).
*Confirmed by: Alizhan (serving) & Dameli (web)*

### Q14. How does the FastAPI service maintain responsiveness under concurrent inference requests?
Model inference is isolated behind threadpool executors and internal locks (`_yolo_inference_lock`), preventing blocking of the asynchronous event loop ([`api/main.py`](../api/main.py)). The `/health` endpoint responds immediately (< 5 ms) even while background threads process heavy image tensor convolutions ([`api/test_concurrency.py`](../api/test_concurrency.py)). When weights are missing or uninitialized, `/ready` returns HTTP 503 with specific subsystem diagnosis rather than hanging.
*Confirmed by: Alizhan (serving)*

### Q15. How does Qarau comply with Kazakhstan personal data laws regarding faces and vehicle license plates?
Road photos captured in public spaces frequently contain recognizable pedestrians and license plates, which are regulated personal data under Kazakhstan Law No. 94-V (Syllabus p.9). All project images uploaded to external environments or public repositories undergo automated and manual screening checks ([`data/README.md`](../data/README.md), D-12). Any photo containing identifiable individuals or license numbers is restricted to on-device local execution and barred from cloud logging ([`docs/research/privacy-and-law.md`](research/privacy-and-law.md)).
*Confirmed by: Roma (research) & Amina (data)*

### Q16. Why was restroom gender classification evaluated using grouped cross-validation rather than random split?
Multiple cropped icons in the training set originate from the same physical restroom installation, introducing visual style, color palette, and stroke-width correlations ([`data/README.md`](../data/README.md)). Standard random train/test splitting would leak paired stylistic features into the validation split, inflating accuracy estimates. Grouping cross-validation folds strictly by restroom ID guarantees that the model is evaluated on unseen design motifs ([`ml/restroom/run.py`](../ml/restroom/run.py)).
*Confirmed by: Nazar (restroom model)*

### Q17. What is the practical difference between mAP50 and mAP50-95 in your model comparison?
mAP50 measures detection success requiring an IoU overlap of at least 50%, reflecting whether a pothole was approximately identified ([`docs/research/glossary.md`](research/glossary.md)). mAP50-95 averages performance across 10 overlap thresholds from 0.50 to 0.95 in 0.05 increments, penalizing loose or inaccurate boundary alignment. Because road repair dispatch prioritizes hazard identification over millimeter edge precision, our model selection rule prioritizes mAP50 alongside recall at τ = 0.40 ([`docs/ML-EXPERIMENT.md`](ML-EXPERIMENT.md)).
*Confirmed by: Amina (pothole model)*

### Q18. How did your team ensure contrast accessibility across both light and dark themes?
All color pairs were audited using WCAG relative luminance equations, ensuring text tokens (`--fg`, `--muted`, `--accent-ink`) exceed 4.5:1 on light and dark surfaces ([`docs/DESIGN-BRIEF.md`](DESIGN-BRIEF.md)). To support color-blind users (protanopia, deuteranopia, tritanopia), all severity states and restroom verdicts pair color with distinct icons and text labels rather than color alone ([`web/tokens.css`](../web/tokens.css)). Severity tokens maintain a minimum perceptual difference (CIE76 ΔE > 10) across simulated vision impairments.
*Confirmed by: Dameli (design system)*

---

## If you do not know

When an examiner asks a detailed question outside your lane or memory:

1. **Say what you do know:** State the high-level fact or design principle directly in one sentence.
2. **Name the exact file:** Point the examiner to the repository file where the measured truth is recorded (e.g. `ml/results/experiments.csv`, `docs/RULES.md`, `data/README.md`).
3. **Name the lane owner:** Direct the question to the teammate who conducted the measurement (Amina for potholes/rules, Nazar for restrooms/CLIP, Alizhan for serving, Dameli for frontend, Tair for architecture, Roma for research/QA).
4. **Never invent a number:** Say "I do not have the exact number committed to memory, but our verified log is in `[file]`" rather than guessing an ungrounded decimal.
