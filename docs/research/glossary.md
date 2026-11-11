# Course Glossary & Technical Vocabulary Guide

> **Task R-38** · Course Grounding & Defense Evidence (Syl p.11, CLO 5, 6, 7).  
> **Lead Author:** Roma (`dyharonking`)  
> **Reviewers:** Lane owners (Nazar, Amina, Alizhan, Tair, Dameli)  
> **Purpose:** Standardize technical vocabulary across the team, ensure exact conceptual grounding in ICT1103 lectures, and avoid penalizing oral mistakes during the final defense.

---

## 1. Quick Reference: Defense "Do Not Say" Rules

| Do NOT Say | Say Instead | Why (Defense Grading Penalty) |
|---|---|---|
| *"The AI decides the road severity"* | **"The YOLO model detects potholes; our rule engine calculates severity"** | Graded on system architecture: models output bounding boxes and probabilities, deterministic business logic executes policy. |
| *"The road detector accuracy is 85%"* | **"The road detector (E1) reaches 0.816 mAP50 on the test split"** (`web/data/experiments.json`) | Object detection cannot be measured with standard accuracy; mAP incorporates both localization (IoU) and classification. |
| *"We trained the model on the test set"* | **"We evaluated on the held-out test split exactly once"** | Training on test data is fatal data leakage. |
| *"We tested it on the validation set at the end"* | **"Validation was used for checkpoint selection; the test set was used for final reporting"** | Mixing validation and test sets misrepresents generalization error. |
| *"Our restroom matching is 100% accurate"* | **"Our two-step pipeline finds the partner on 30 of 30 test queries; with only 30 queries the 95% interval is 0.884–1.000"** (`ml/results/restroom/intervals.json`) | Generalizing 30 queries to absolute perfection invites harsh examiner skepticism; the pipeline is not fine-tuned (R7: SIFT, a pixel check, colour and zero-shot CLIP). |
| *"Our app works in real time"* | **"On the laptop CPU, CLIP embeds one sign in 25.7 ms"** (R1, `ml/results/restroom/experiments.csv`) | "Real time" is vague marketing jargon; examiners require concrete benchmark millisecond numbers. |
| *"Vision Transformers are strictly better than CNNs"* | **"ViTs lack inductive bias and require large pre-training, whereas CNNs excel on small data without massive pre-training"** | Lec8 p54: architectural superiority depends on data scale and task structure. |
| *"We sent pothole photos to commercial VLMs"* | **"We screened data and sent only CC-BY-4.0 abstract restroom icons to commercial VLMs"** | Sending road photos with identifiable faces or license plates violates syllabus privacy rules (Syl p.9). |

---

## 2. Comprehensive Vocabulary Table (43 Terms)

### A. Computer Vision & Object Detection (Lecture 8)

| Term | What it Means in Qarau | Course Source | Do NOT Say |
|---|---|---|---|
| **Image Classification** | Assigning a discrete label to an entire image (e.g. classifying a restroom door sign as male or female). | `Lec8 p11` | Do not confuse with object detection, which also predicts spatial bounding box locations. |
| **Object Detection** | Predicting both the category and spatial coordinate bounding box $(x, y, w, h)$ for every pothole in a road image. | `Lec8 p11` | Do not say "detecting an image"; detection identifies instances within an image. |
| **Semantic Segmentation** | Classifying every individual pixel into a class (e.g. asphalt, pothole, road shoulder). | `Lec8 p11` | Do not claim Qarau performs segmentation; we perform bounding-box object detection. |
| **Convolutional Neural Network (CNN)** | Deep learning architecture using sliding kernel filters that exploit translation invariance and spatial locality to extract visual feature maps. | `Lec8 p32–33` | Do not say CNNs are obsolete; they remain efficient baselines for edge detection. |
| **One-Stage Detector (YOLO)** | An object detection architecture that predicts bounding boxes and class probabilities in a single forward evaluation pass directly from the feature grid. | `Lec8 p40` | Do not say YOLO uses region proposal networks; that describes two-stage detectors like Faster R-CNN. |
| **Transfer Learning** | Initializing neural network weights from a large general dataset (ImageNet / COCO) before adapting to potholes or restroom signs. | `Lec8 p38` | Do not say we trained from scratch; starting from scratch with <500 images causes severe overfitting. |
| **Fine-Tuning** | Selectively unfreezing and updating the final layers of a pre-trained backbone while keeping early visual feature weights fixed. | `Lec8 p38` | Do not say fine-tuning retrains the entire model from zero. |
| **Data Augmentation** | Applying label-preserving synthetic transformations (horizontal flips, photometric jitter, mosaic) to expand effective dataset diversity. | `Lec8 p38` | Do not say augmentation creates new real-world data; it prevents memorization of existing samples. |
| **Vision Transformer (ViT)** | Architecture that splits an image into non-overlapping spatial patches, projects them into linear embeddings (tokens), and applies self-attention. | `Lec8 p46–47` | Do not say ViTs have spatial convolutions; they rely on pure sequence self-attention mechanisms. |
| **Patch & Token** | A $16 \times 16$ pixel sub-region of an image flattened and projected into a vector embedding for transformer attention processing. | `Lec8 p46–47` | Do not call patches "pixels"; a patch contains 256 RGB pixels transformed into one token. |
| **CLIP (Contrastive Language-Image Pre-training)** | Dual-encoder foundation model trained on 400M image-text pairs via InfoNCE loss to maximize cosine similarity of matched pairs. | `Lec8 p56` | Do not say CLIP generates text; CLIP encodes images and texts into a shared metric embedding space. |
| **Zero-Shot Classification** | Classifying unseen images by comparing their visual embeddings directly against prompt text embeddings without fine-tuning weights. | `Lec8 p56` | Do not say zero-shot means "no model"; it means inference without task-specific training data. |
| **Vision-Language Model (VLM)** | Multimodal generative model combining a visual encoder, projection connector, and large autoregressive language model to generate text from imagery. | `Lec8 p57` | Do not say VLMs guarantee spatial counting; visual fluency does not prevent numerical hallucinations. |
| **SIFT (Scale-Invariant Feature Transform)** | Classical computer vision algorithm that detects extreme points across scale-space octaves and extracts gradient orientation histograms. | `Lec8 p24` | Do not call SIFT deep learning; it is a deterministic handcrafted feature extractor. |
| **Keypoint & Descriptor** | A salient interest point coordinate $(x, y, \text{scale})$ and its 128-dimensional local gradient representation vector. | `Lec8 p24` | Do not say descriptors are raw pixels; they are normalized gradient orientation vectors. |
| **Lowe's Ratio Test** | Filtering ambiguous SIFT matches by verifying that the nearest neighbor distance is significantly smaller than the second-nearest neighbor distance ($d_1 / d_2 < 0.75$). | `Lec8 p28` | Do not say it checks distance to a threshold; it compares the ratio of the two best candidate distances. |
| **RANSAC** | Random Sample Consensus algorithm that iteratively estimates robust homography transformations by discarding outlier matching pairs. | `Lec8 p28` | Do not say RANSAC averages all points; it finds the hypothesis with the maximum inlier support set. |

---

### B. Machine Learning Metrics & Evaluation (Supervised Learning & Lab Sheets)

| Term | What it Means in Qarau | Course Source | Do NOT Say |
|---|---|---|---|
| **Intersection over Union (IoU)** | The spatial overlap ratio between predicted bounding box $B_p$ and ground truth box $B_{gt}$: $\text{Area}(B_p \cap B_{gt}) / \text{Area}(B_p \cup B_{gt})$. | `Lec8 p42` | Do not confuse with raw pixel area; IoU is a normalized overlap coefficient between 0 and 1. |
| **mAP50** | Mean Average Precision calculated across all classes at a fixed IoU threshold of 0.50 (the primary validation metric for our YOLO detector). | `Lec8 p42` | Do not say "accuracy of detection"; detection quality requires precision-recall area calculation. |
| **mAP50-95** | The mean Average Precision averaged across 10 IoU thresholds from 0.50 to 0.95 with step 0.05, rewarding tight box localization. | `Lec8 p42` | Do not assume mAP50 and mAP50-95 are identical; mAP50-95 is always strictly lower. |
| **Precision** | The fraction of all pothole detections predicted by the model that actually correspond to true physical potholes ($TP / (TP + FP)$). | `Sup p27` | Do not confuse with recall; high precision means very few false alarms. |
| **Recall** | The fraction of all true physical potholes in the road images that were successfully identified by the model ($TP / (TP + FN)$). | `Sup p27` | Do not confuse with precision; high recall means very few missed potholes. |
| **F1 Score** | The harmonic mean of precision and recall ($2 \cdot P \cdot R / (P + R)$), balancing false alarms against missed detections. | `Sup p27` | Do not use simple arithmetic mean; arithmetic means mask catastrophic drops in either metric. |
| **Confusion Matrix** | A $2 \times 2$ table contrasting ground-truth positive/negative classes against predicted classifications. | `Sup p27` | Do not present percentages without raw counts; confusion matrices must reflect exact sample counts. |
| **Top-1 Matching Accuracy** | The fraction of restroom queries where the true matching partner sign ranks first among all candidate gallery signs. | `docs/ML-EXPERIMENT-RESTROOM.md` | Do not call it classification accuracy; it measures metric retrieval ranking. |
| **Data Leakage** | Contamination of the training process with information from the validation or test splits (e.g. identical photos across splits). | `Sup p10` | Do not claim splits are clean without checking image hashes and near-duplicates. |
| **Overfitting** | When a model learns idiosyncrasies and noise of training samples, scoring high on training loss but failing on validation data. | `Sup p24` | Do not say a model with low training loss is "working perfectly"; generalization gap proves overfit. |
| **Grouped Cross-Validation** | Cross-validation where all images belonging to the same physical restroom pair are strictly kept within the same fold to prevent leakage. | `Sup p26` | Do not use naive random K-fold on paired data; leaking pairs across folds artificially inflates scores. |
| **Logistic Regression** | Linear classification model using a sigmoid link function to predict gender probabilities from frozen embedding vectors. | `Sup p23` | Do not call it regression; despite the name, it is a supervised linear classification model. |

---

### C. Unsupervised Learning & Clustering

| Term | What it Means in Qarau | Course Source | Do NOT Say |
|---|---|---|---|
| **k-means Clustering** | Partitioning pothole bounding-box pixel areas into $k=3$ distinct clusters representing small, medium, and large size bands. | `Unsup p14–15` | Do not say k-means chooses $k$ automatically; $k$ must be specified a priori or chosen via heuristics. |
| **Inertia (Within-Cluster Sum of Squares)** | The sum of squared Euclidean distances of samples to their assigned cluster centroid. | `Unsup p15` | Do not confuse with variance; inertia decreases monotonically as $k$ increases. |
| **Silhouette Score** | Metric measuring how similar a data point is to its own cluster compared to other clusters (ranging from -1 to +1). | `Unsup p28` | Do not pick $k$ solely on the elbow method; evaluate silhouette coefficient across candidate $k$. |

---

### D. System Architecture, APIs & MLOps (Lectures 2, 5, 9)

| Term | What it Means in Qarau | Course Source | Do NOT Say |
|---|---|---|---|
| **Client–Server Architecture** | Separation of concerns between the Next.js browser client UI and the FastAPI Python inference backend service. | `Lec2-Arch p43` | Do not say the browser runs YOLO directly; heavy inference runs on the dedicated Python API service. |
| **REST (Representational State Transfer)** | Stateless HTTP API design paradigm using standard methods (POST `/predict`, GET `/health`) and JSON payloads. | `Lec5-Inet p22` | Do not say REST is a binary protocol; it operates over text-based HTTP exchanges. |
| **FastAPI** | Modern, asynchronous Python web framework used in Qarau to serve model inference endpoints with automatic OpenAPI documentation. | `Lec9 p50` | Do not confuse with full-stack frameworks like Django; FastAPI is a lightweight API engine. |
| **Docker** | Containerization platform packaging our application code, CUDA libraries, and dependencies into portable, isolated containers. | `Lec9 p19` | Do not confuse containers with virtual machines; containers share the host operating system kernel. |
| **MLOps Level 0 vs. Level 1** | Level 0 represents manual script-driven pipeline execution; Level 1 features automated retraining triggers and pipeline orchestration. | `Lec9 p31–32` | Do not claim Qarau is MLOps Level 2; we execute reproducible Level 0/1 experimental workflows. |
| **Data Drift & Concept Drift** | Data drift is change in input distribution (e.g. snowy roads); concept drift is change in the statistical relationship between input and labels. | `Lec9 p43` | Do not treat them as identical; data drift affects inputs $P(X)$, concept drift affects relationships $P(Y \mid X)$. |
| **Batch vs. Online Inference** | Online inference evaluates photos individually on demand via REST API; batch inference evaluates large datasets offline in scheduled jobs. | `Lec9 p42` | Do not claim interactive live user uploads are batch processing; they are online requests. |

---

### E. Human-Computer Interaction & Ethics (Lectures 3, 4 & Syllabus)

| Term | What it Means in Qarau | Course Source | Do NOT Say |
|---|---|---|---|
| **Nielsen Heuristics** | Usability principles applied in our UI (e.g. visibility of system status via progress loaders, recognition rather than recall). | `Lec3-HCI p13` | Do not claim UI was built arbitrarily; tie UI design choices to specific Nielsen principles. |
| **WCAG Contrast Ratio** | Web Content Accessibility Guidelines standard requiring at least 4.5:1 text-to-background contrast ratio for standard text. | `Lec3-HCI p37` | Do not guess readability; verify numerical contrast scores across dark and light themes. |
| **EXIF Metadata** | Exchangeable Image File format header containing camera hardware, timestamps, and GPS coordinates embedded inside JPEG photos. | `Lec4-DataMgmt p12` | Do not leave EXIF unstripped; uploading raw GPS coordinates to external servers breaches user privacy. |
| **Personal Data (Kazakhstan Law)** | Any recorded information relating to an identified or identifiable physical person (faces, vehicle license plates). | `Syl p.9` | Do not send unredacted public road imagery to hosted third-party commercial APIs. |

---

## 3. Lane Responsibilities & Verification Map

To ensure consistent terminology across the team during the defense presentation and examiner Q&A:

- **Roads Lane (Amina):** Must use **mAP50**, **IoU**, **one-stage detector (YOLO)**, and **k-means size bands**. Never say "detector accuracy".
- **Restrooms Lane (Nazar):** Must use **top-1 matching accuracy**, **contrastive pre-training (CLIP)**, **fine-tuning**, and **grouped cross-validation**. Never say "classification accuracy" for the matching task.
- **System & Web Lane (Alizhan):** Must use **client-server**, **REST**, **inference latency (ms)**, and **local vs. cloud execution modes**. Never say "real-time" without quoting milliseconds.
- **Design Lane (Dameli):** Must cite **Nielsen usability heuristics**, **WCAG 4.5:1 contrast**, and **cognitive load**.
- **Research & AI Lane (Roma):** Must explain **VLM architecture (encoder + connector + LLM)**, **generative hallucination**, **metadata leakage**, and **syllabus privacy constraints (Syl p.9)**.
- **Coordination Lane (Tair):** Coordinates defense timing, handover links, and verified empirical metrics.
