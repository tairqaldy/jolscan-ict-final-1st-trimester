# ICT1103 course digest: ML half (Modules 6–9) and Labs

Purpose: course-grounding reference for the Assignment #2 Computer Vision project defense. Everything below is taken from the course materials; page numbers are slide numbers of the PDF. Where a topic is absent, it says "not covered in the course materials".

Citation keys:

| Key | File | Pages |
|---|---|---|
| **Sup** | `materials/07-module-6/Supervised-Machine-Learning-Teaching-Computers-by-Example.pdf` | 30 |
| **Unsup** | `materials/07-module-6/Unsupervised-Machine-Learning (1).pdf` | 30 |
| **Lec7** | `materials/08-module-7/Lec #7.pdf` ("Text processing and NLP: from machine translation to LLMs") | 70 |
| **Lec8** | `materials/09-module-8/Lec #8.pdf` ("ICT tools for working with image data: from pixels to vision transformers") | 66 |
| **Lec9** | `materials/10-module-9/Lec #9-Cloud-ML-platforms-MLOps-and-smart-technologies.pdf` | 70 |
| **A2** | `assignments/assignment-2/task/ICT1103_Assignment_2_Group_Project_….pdf` | 1 |
| **Lab3/4/6/8** | notebooks under `assignments/lab-*/` (cell index given as `c[N]`) | – |

How read: slide text extracted per page with macOS PDFKit, and diagram-only slides rendered as images and checked visually (Lec7 p24, Lec8 p18, p38, Lec9 p25 and others). All pages were readable, and no deck had scanned or image-only text. Lec8 is the Computer Vision lecture. It is the main source for this project.

---

## 1. Lecture decks

### 1.1 Module 6a: Supervised Machine Learning: Teaching Computers by Example (Sup, 30 pp.)

The footer says "ICT 301 · Machine Learning Foundations", "Lecture 01" (Sup p1, p30).

**Foundations**
- **Classical programming vs ML**: Rules + Data → Answers vs **Data + Answers → Rules**. ML is used when rules can't be hand-written, e.g. handwritten digits or faces (Sup p3).
- **Supervised learning**: each training example pairs input vector x with ground-truth label y. The model learns ŷ = f(x), an estimate of the true f. The analogy is a student with an answer key: answers are visible during study and hidden on exam day. The goal is **generalization** to unseen inputs, not memorizing pairs (Sup p4).
- **Training loop**: 1 Collect & pair (xᵢ, yᵢ) → 2 Feedforward → 3 Compute loss → 4 Update weights (optimization algorithm) → 5 Predict (lock parameters, deploy). Steps 2–4 repeat "across thousands of training batches until error converges" (Sup p5).
- **Three paradigms**: Supervised (labels; f: X→Y), Unsupervised (no labels; latent structure), Reinforcement (rewards; policy π(s), e.g. AlphaGo) (Sup p6).
- **Classification vs regression**: classification predicts a category y ∈ {C₁…C_k} with a decision boundary, and can be **binary**, **multiclass** or **multilabel**. Regression predicts y ∈ ℝ (Sup p7).
- **Applications**: spam/phishing filters, medical diagnostics (lesions in mammograms/CT trained on expert annotations), fraud and cyber defense (Sup p8).

**Vocabulary and data**
- **Sample/instance, feature/attribute, label/target, feature vector**: design matrix X ∈ ℝⁿˣᵈ, target vector y ∈ ℝⁿ (Sup p9).
- **Train/validation/test split, 70/15/15**: training fits parameters. Validation tunes hyperparameters, compares algorithms and selects architectures. The test set is "locked in a vault", evaluated once as the honest final check. "Never let test data influence training—**data leakage** destroys real-world validity" (Sup p10).
- **ML workflow**: 1 Define problem and success metric (classification vs regression; select F1 or RMSE). 2 Collect and clean data. 3 Engineer features. 4 Train baseline models and tune with validation/cross-validation. 5 Evaluate on test data. 6 **Deploy and monitor**: "Containerize as a REST API microservice and monitor data drift" (Sup p11).
- **Data hygiene / "Garbage in, garbage out"**: impute numeric columns with the median and categorical columns with the mode, and remove duplicates. Use **One-Hot Encoding**. **Feature scaling**: standardization z=(x−μ)/σ, or min-max. **Outliers & class imbalance**: cap spikes, use **resampling (SMOTE) or class weights** (Sup p12).

**Loss and optimization**
- **Loss function L(y, ŷ)**: **MSE** squares residuals and penalizes outliers severely, while **MAE** is more robust. **Binary Cross-Entropy (Log Loss)** gives confident wrong predictions near-infinite penalty and generalizes to **categorical cross-entropy** for multiclass (Sup p13).
- **Gradient descent**: θ_new = θ_old − α·∇L(θ). **Learning rate α**: 0.0001 is too slow, 0.01 converges, 1.5 oscillates and diverges (Sup p14).

**Algorithms**
- **Linear regression**: ŷ = wᵀx + b, closed-form OLS w = (XᵀX)⁻¹Xᵀy. Fast and interpretable, but underfits non-linear data (Sup p15).
- **Logistic regression**: p = σ(z) = 1/(1+e⁻ᶻ). Classify positive if p ≥ 0.5 (z ≥ 0) (Sup p16).
- **k-Nearest Neighbors**: non-parametric "lazy learner" using Euclidean distance and majority vote or average. O(1) fit, O(n·d) inference. Small k overfits and large k oversmooths. Suffers the **curse of dimensionality** (Sup p17).
- **Decision trees**: splits chosen by **Gini impurity G = 1 − Σpᵢ²** or **Information Gain** (entropy reduction). Easy to read but "prone to severe overfitting when deep" (Sup p18).
- **Ensembles**: **Random Forests** use bagging (bootstrap plus random feature subsets, majority vote). **Gradient Boosting** builds sequential shallow trees on residuals (**XGBoost, LightGBM**) (Sup p19).
- **Naive Bayes**: P(Class|x) ∝ P(Class)∏P(xⱼ|Class), assuming conditional independence. Fast for text and spam (Sup p20).
- **SVM**: maximum margin 2/‖w‖, hyperplane wᵀx+b=0, support vectors. The **kernel trick** has linear, RBF/Gaussian and polynomial variants (Sup p21).
- **Neural networks / deep learning**: feedforward input→hidden→output layers. **Activation functions add non-linearity**, and training uses **backpropagation and gradient descent**. "Deep learning uses many hidden layers for **images**, speech, and text" (Sup p22).
- **Selection guide**: neural network strength is "learns complex patterns", weakness is "needs lots of data". Logistic regression is the "strong baseline" (Sup p23).

**Generalization and evaluation**
- **Underfitting / high bias**: high train and high validation error. Fix by adding features or deepening the architecture. **Overfitting / high variance**: near-zero train error, exploding validation error. Fix with "Regularization, cross-validation, more data" (Sup p24).
- **Bias–variance trade-off**: Error = Bias² + Variance + Irreducible Noise. The optimum is at the bottom of the U-shaped test-error curve (Sup p25).
- **Preventing overfit**: **L1 (Lasso)**, **L2 (Ridge)**, **k-fold cross-validation** (rotates the validation set across k parts), plus "More data, **early stopping**, pruning, and **dropout**" (Sup p26).
- **Confusion matrix (2×2)**: TP, FN (missed, Type II), FP (false alarm, Type I), TN. **Accuracy** = (TP+TN)/Total is "misleading when classes are heavily imbalanced". **Precision** = TP/(TP+FP) is critical for spam. **Recall** = TP/(TP+FN) is critical for cancer detection. **F1** = 2·Prec·Rec/(Prec+Rec) is the harmonic mean (Sup p27).
- **Regression metrics**: MAE, RMSE, R² = 1 − SS_res/SS_tot. **ROC curve & AUC**: TPR vs FPR across thresholds. AUC 0.5 is random, 0.8 is strong, 1.0 is perfect (Sup p28).
- **Worked example (scikit-learn)**: `train_test_split(test_size=0.2, random_state=42)`, `TfidfVectorizer`, `MultinomialNB`, `precision_score`, `recall_score`. "Fit the vectorizer only on X_train to prevent data leakage" (Sup p29).
- **Recap**: quality labeled pairs, match the model to data shape/size/interpretability, "Always evaluate on strictly held-out test data". It mentions a spam detector on the **Enron dataset** with a class leaderboard (Sup p30). No such lab is present in `assignments/`.

### 1.2 Module 6b: Unsupervised Machine Learning (Unsup, 30 pp.)

- **Definition**: learning from the feature matrix X only, with no ground truth. It models p(X) rather than p(y|X) (Unsup p3).
- **Supervised vs unsupervised table**: supervised uses direct metrics (**Accuracy, ROC-AUC, F1-score, MSE, Log Loss**). Unsupervised uses relative geometric scores (**Silhouette, Inertia**) plus domain validation (Unsup p4).
- **Why unlabeled data matters**: labeling is slow and costly. Over 90% of enterprise telemetry, logs, video and audio is uncurated. "Exploration precedes prediction" (Unsup p5).
- **Task families**: Clustering (K-Means, DBSCAN, GMM), Reduction (PCA, t-SNE, UMAP), Association (Apriori, FP-Growth, ECLAT), Anomalies (Isolation Forest, One-Class SVM) (Unsup p6).
- **Terms**: sample vector x ∈ ℝᵈ, feature matrix, dimensionality (Unsup p7). Cluster & centroid, **latent variable**, **manifold & embedding**, density & outlier (Unsup p8).
- **Distance metrics**: Euclidean (L2), Manhattan (L1), **Cosine** ("indispensable for text TF-IDF and embeddings") (Unsup p9).
- **Preparation**: standardization is mandatory for PCA and K-Means, plus min-max scaling, median/KNN imputation and one-hot encoding (Unsup p10).
- **Curse of dimensionality**: distance concentration, nearest-neighbour breakdown, exponential sample hunger (Unsup p11).
- **Clustering uses**: segmentation, document discovery, network traffic profiling (Unsup p13).
- **K-Means / Lloyd's algorithm**: initialize (k-means++) → assign → update → converge. Minimizes WCSS and converges to a local minimum (Unsup p14). **Elbow curve** on inertia. Assumes spherical clusters of equal size and is outlier-sensitive (Unsup p15).
- **Hierarchical clustering**: single, complete, average and **Ward's** linkage, with a dendrogram (Unsup p16).
- **DBSCAN**: ε and MinPts give core, border and noise points (−1). Finds arbitrary shapes (Unsup p17).
- **GMM**: soft membership, p(x)=Σπₖ𝒩(x|μₖ,Σₖ), fitted with Expectation-Maximization (Unsup p18). Decision matrix comparing the algorithms (Unsup p19).
- **Dimensionality reduction motivation**: visualization, noise removal, faster downstream models (Unsup p21).
- **PCA**: covariance → eigendecomposition → projection Z = XWₖ, judged by explained variance ratio. Linear only (Unsup p22).
- **t-SNE / UMAP**: preserve local neighbourhoods. Cluster sizes and distances must not be read literally (perplexity/n_neighbors) (Unsup p23).
- **Autoencoders**: encoder z=f(x) → bottleneck → decoder x̂=g(z), trained on reconstruction loss ‖x−x̂‖². Non-linear activations (**ReLU, GELU**) (Unsup p24).
- **Association rules**: Support, Confidence, Lift and the Apriori principle (Unsup p26).
- **Anomaly detection**: Isolation Forest, One-Class SVM, density-based methods. Used for fraud, intrusion and faulty sensors (Unsup p27).
- **Validation without labels**: Silhouette s=(b−a)/max(a,b), Davies-Bouldin, bootstrap stability (80% subsamples), downstream utility (Unsup p28).
- **scikit-learn pipeline**: `StandardScaler()` → `PCA(n_components=0.90)` → `KMeans(n_clusters=k)` → `silhouette_score()` → `df.groupby('cluster').mean()`, chainable in a scikit-learn `Pipeline` (Unsup p29).
- **Practice datasets**: **Iris, Mall Customers** (Unsup p30).

### 1.3 Module 7 / Lec 7: Text processing and NLP: from machine translation to LLMs (Lec7, 70 pp.)

Lec 7 is the NLP/LLM lecture. It is relevant to the CV project mainly through VLMs, Hugging Face, cloud APIs, LLM limits and its evaluation slide.

- **Text as unstructured data**: structured vs semi-structured (JSON, HTML) vs unstructured. ML needs a numerical representation (Lec7 p4).
- **NLP, NLU/NLG, CL, text mining**: definitions (Lec7 p5). Ambiguity ("I saw her duck") (Lec7 p6). Levels of analysis: phonetics → discourse (Lec7 p7).
- **Pipeline vocabulary**: corpus/document, token/type, vocabulary, lemma/stem, n-gram, stop word (Lec7 p8). **ASCII, Unicode, UTF-8**, mojibake (Lec7 p9). **Zipf's law** f(r) ∝ 1/r (Lec7 p10). Applications (Lec7 p11).
- **Tools**: grep/sed/awk/wc (Lec7 p13). **Regular expressions** (Lec7 p14–15). Python plus pandas, Jupyter and Colab (Lec7 p16). **NLTK, spaCy, Gensim, scikit-learn** (Lec7 p17).
- **Hugging Face Hub / transformers / datasets**: `pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english")`. "Check the **model card, licence**, language and intended use" (Lec7 p18).
- **Cloud and API tools**: the trade-offs are **Cost** (usage charges grow with traffic), **Privacy** (retention, location, permitted data) and **Latency**. "Prototype quickly, then evaluate quality on your own task" (Lec7 p19).
- **Document tools**: OCR (**Tesseract**), PDF parsing, ASR (**Whisper**). "Extraction errors propagate into every later NLP stage" (Lec7 p20).
- **Annotation tools**: **Label Studio, Prodigy, doccano**. Corpora: Wikipedia, Common Crawl, Universal Dependencies. "Agree on label definitions, adjudicate disagreements and document licences and sampling" (Lec7 p21).
- **Tool map**: regex, NLTK, spaCy, Hugging Face, LLM API ("Flexible, may invent"). "Accuracy depends on data and task" (Lec7 p22).
- **Classic NLP pipeline** (diagram): Collect → Clean → Tokenize → Normalize → Represent → Model → Evaluate. "Fit learned transformations on training data, then apply them consistently to unseen text… **Split data before fitting vocabulary or feature weights**" (Lec7 p24).
- **Cleaning and normalization** is task-dependent (Lec7 p25). **Tokenization** (Lec7 p26). Stop words, **stemming** (`PorterStemmer`), **lemmatization** (Lec7 p27). **POS tagging** with spaCy `en_core_web_sm` (Lec7 p28). Syntactic parsing (Lec7 p29). **NER** (Lec7 p30). **Sentiment analysis** (Lec7 p31). **Naive Bayes spam** worked example (Lec7 p32). IE and extractive vs generative QA (Lec7 p33).
- **Evaluating NLP: precision, recall, F1**: worked spam confusion matrix with TP=8, FN=2, FP=1, TN=9, giving P=8/9, R=8/10, F1≈0.842. "Precision measures prediction purity. Recall measures coverage" (Lec7 p34).
- **Representations**: Bag of words (Lec7 p36). **TF-IDF** tf·log(N/df) with `TfidfVectorizer` (Lec7 p37). N-gram LMs and **perplexity** (Lec7 p38). **Cosine similarity** search (Lec7 p39). Topic models **LSA/LDA** (Lec7 p40). **word2vec (Skip-gram, CBOW), GloVe** (Lec7 p41). Static vs contextual embeddings (Lec7 p42).
- **History**: Turing test, Georgetown–IBM 1954 (Lec7 p45). ELIZA, ALPAC (Lec7 p46). Symbolic AI, SHRDLU (Lec7 p47). Statistical era: HMMs, n-grams, IBM models (Lec7 p48). Noisy-channel SMT, Google Translate 2006 (Lec7 p49). SVMs, CRFs, CoNLL shared tasks/benchmarks (Lec7 p50). word2vec 2013, neural MT 2016, **RNN/LSTM**, vanishing gradients (Lec7 p51). Seq2seq encoder–decoder (Lec7 p52).
- **Attention**: Attention(Q,K,V)=softmax(QKᵀ/√dₖ)V (Lec7 p53). **Transformer**, "Attention is all you need", Vaswani 2017 (Lec7 p54–55). **BPE / WordPiece** subword tokenization (Lec7 p56).
- **BERT and the pretrain → fine-tune paradigm**: "Pretrain: learn broad representations from unlabelled text → **Adapt: Fine-tune on a labelled task** → Reuse". ELMo and GPT-1 are from 2018 too (Lec7 p57).
- **GPT**: causal LM. GPT-3 has 175B parameters and does **few-shot learning** ("Prompt examples are context, not an additional training step") (Lec7 p58). **Scaling laws, emergent abilities** (Lec7 p59).
- **LLM terms**: parameters, context window, tokens, **temperature** (Lec7 p61). Training is **Pretraining → SFT → RLHF**, and ChatGPT 2022 is the turning point (Lec7 p62).
- **Prompting vs RAG vs fine-tuning**: "Prompting changes context; RAG adds evidence; fine-tuning changes parameters". **LoRA** trains small low-rank adapters (Lec7 p63).
- **LLM limits**: **Hallucination**, **Bias** ("Training data and feedback can reproduce stereotypes. Test across groups and languages"), **Privacy**, **Cost and energy** ("Measure cost, latency and task quality together"). "High-stakes use needs external checks and accountable oversight" (Lec7 p64).
- **LLM ecosystem**: closed APIs (GPT, Claude, Gemini) vs **open weights** (Llama). "Smaller models can run locally when hardware and licence permit". Open weights do not mean open data (Lec7 p65).
- **VLM (vision-language models)**: image captioning and visual QA. **CLIP** aligns image and text, and **GPT-4V and Gemini** are multimodal assistants. "Visual fluency does not guarantee accurate counting, spatial reasoning or reading" (Lec7 p66).
- **LCM** (Meta 2024, sentence-level concept space) (Lec7 p67). Family table: LLM, LCM, VLM, **LMM**, **agents** (Lec7 p68). Evolution table (Lec7 p69).
- **Takeaways**: build a spaCy pipeline and a Hugging Face classifier and inspect errors on the same examples. "Choose evidence over fluency: compare rules, classic ML and an LLM on task quality, privacy, latency and cost" (Lec7 p70).

### 1.4 Module 8 / Lec 8: ICT tools for working with image data: from pixels to vision transformers (Lec8, 66 pp.)

This is the Computer Vision lecture and the core source for the project.

**Part 1: Images, multimedia, toolkit**
- **Computer vision**: "automatically extracts meaning from images and video". "The output is meaning, not merely a displayed picture" (Lec8 p4).
- **Digital image**: a grid of numbers. A pixel in 8-bit grayscale is 0–255, and RGB has 3 channels, so H × W × 3. Covers resolution, bit depth and aspect ratio. 1920×1080 RGB ≈ 6.2M values (Lec8 p5).
- **Colour spaces**: RGB (screens and input), HSV (colour segmentation), Lab (perceptual distance), Grayscale (edges and features) (Lec8 p6).
- **Multimedia pipeline**: Capture → Encode → Store → Transmit → Decode → Display (Lec8 p7).
- **Image formats**: JPEG (lossy, DCT, photos), PNG (lossless, masks), WebP/AVIF, TIFF/RAW. "Preserve pixel values" for masks (Lec8 p8).
- **Video codecs**: I/P/B frames, H.264/AVC, H.265/HEVC, AV1, MP4/MKV. "CV models decode video before analysing it" (Lec8 p9).
- **Python toolkit**: **OpenCV** (classic algorithms, video I/O), **scikit-image**, **Pillow** (file handling), **torchvision** ("Datasets and pretrained vision models"), **Hugging Face** (hub). Example workflow: "load with Pillow, process with OpenCV, **infer with a pretrained model**" (Lec8 p10).
- **Core vision tasks ladder**: 1 **Classification** (what), 2 **Detection** (what and where, boxes), 3 **Segmentation** (which pixel), 4 **Captioning and VQA** (Lec8 p11).

**Part 2: Classical pre-processing**
- **Point operations**: brightness, contrast, negative, **gamma correction** out = 255·(in/255)^γ (Lec8 p13).
- **Histogram equalization**, **CLAHE** (local, limited amplification), used for X-ray and low-light images (Lec8 p14).
- **Convolution**: a kernel computes a weighted sum over a neighbourhood. "Later, CNNs learn the kernel weights" (Lec8 p15).
- **Smoothing**: Mean/Gaussian, Median (salt-and-pepper), Bilateral (edge-preserving) (Lec8 p16).
- **Thresholding**: global, adaptive, **Otsu** (Lec8 p17). **Morphology**: erosion, dilation, opening, closing with a structuring element (Lec8 p18).
- **Edge detection**: Sobel, Prewitt, Laplacian. **Canny (1986)** is smoothing → gradient → non-max suppression → hysteresis (Lec8 p19). **Hough transform** for lines and circles (Lec8 p20).

**Part 3: Hand-crafted features**
- **Feature, keypoint, descriptor**: good features are repeatable, distinctive and robust (Lec8 p22). **Harris (1988)**, Shi-Tomasi corners (Lec8 p23). **SIFT** (Lowe 2004, 128-number descriptor) (Lec8 p24). **FAST, SURF, ORB** (ORB-SLAM) (Lec8 p25). **HOG** (Dalal & Triggs 2005, pedestrian detection with linear SVM) (Lec8 p26).
- **Viola-Jones (2001)**: Haar-like features, integral images, AdaBoost, cascade (Lec8 p27).
- **Feature matching**: descriptors → ratio test → **RANSAC**, used for panoramas and Structure from Motion (Lec8 p28).
- **Bag of Visual Words**: extract → cluster → histogram → **SVM**, "standard recipe until about 2012" (Lec8 p29).
- **Hand-crafted ceiling**: every task needs new tuning, and clutter, pose and lighting break descriptors. "The next era learns representations from data" (Lec8 p30).

**Part 4: Convolutional neural networks**
- **Neural network training**: layers combine weights and nonlinearities such as **ReLU**, and a **loss** measures error. Predict → Measure loss → Backpropagate → Update (gradient descent). Needs data and compute, "often **GPUs**". Example datasets: **ImageNet and COCO** (Lec8 p32).
- **CNN mechanism**: "Convolution **shares weights** across locations; **pooling downsamples** feature maps". Early layers learn edges, middle layers textures and parts, late layers objects. "**Locality and translation equivariance** give CNNs a useful built-in bias" (Lec8 p33).
- **LeNet-5 (1998)** for digits. **AlexNet (2012)**: "**ReLU, dropout and GPUs**", ImageNet top-5 error ≈ 15.3% vs 26.2% for the runner-up (Lec8 p34).
- **VGG** (stacks of 3×3 convs, heavy) and **GoogLeNet** (Inception modules) (Lec8 p35).
- **ResNet**: skip connection y = F(x) + x improves gradient flow. 152 layers, won ILSVRC 2015 (He et al. 2015) (Lec8 p36).
- **Efficient CNNs for phones and edge devices**: **MobileNet** (depthwise separable convolutions), **EfficientNet** (balanced scaling of depth/width/resolution), **ConvNeXt** (CNN modernised with transformer ideas). Example: on-device camera inference (Lec8 p37).
- **Transfer learning and augmentation ("Training with limited data")**: "Transfer learning adapts an existing representation instead of learning everything from scratch". 01 **Reuse**: start with a pretrained backbone. 02 **Augment**: "Flip, crop, colour jitter and mixup". 03 **Fine-tune**: "Train the last layers, then adapt more if needed". Example: "adapt an ImageNet model to a small image collection". Links the **PyTorch transfer learning tutorial** (Lec8 p38).
- **Two-stage detection**: R-CNN (2013) → Fast R-CNN → Faster R-CNN (Region Proposal Network) (Lec8 p39).
- **One-stage detection**: **YOLO** (grid cells, real-time) and **SSD** (multi-scale maps). "Try live camera detection with **Ultralytics YOLO**" (Lec8 p40).
- **Segmentation**: semantic (FCN, DeepLab), **U-Net** (medical), **Mask R-CNN** (instances) (Lec8 p41).
- **Evaluation metrics**: "Choose a metric that matches the task and the cost of errors". Classification uses **Accuracy** plus **precision, recall and F1** ("expose different error trade-offs"). Localisation uses **IoU = |A∩B| / |A∪B|**. Detection uses **mAP** across classes and IoU thresholds. "**Report the evaluation protocol**" (Lec8 p42).
- **Generative models**: Autoencoders, **GANs (2014)** (generator vs discriminator), **Diffusion** (**Stable Diffusion**). "Uses include super-resolution, inpainting and **data augmentation**" (Lec8 p43).

**Part 5: Vision transformers**
- **Self-attention**: softmax(QKᵀ/√d)V. Global context at quadratic cost (Lec8 p45).
- **ViT**: 16×16 patches flattened into linear tokens, "An Image is Worth 16x16 Words", Dosovitskiy 2020 (Lec8 p46). Position embeddings, [CLS] token, multi-head attention, MLP, class head. "Little built-in image bias means a strong need for data and training strategy" (Lec8 p47).
- **DeiT**: trains ViT on ImageNet alone using **augmentation, regularisation, distillation token** (Touvron 2020) (Lec8 p48).
- **Self-supervised learning**: **MAE** (75% of patches masked), **DINOv2**. "Pretrain on unlabelled images before adapting to classification or segmentation" (Lec8 p49).
- **DETR**: object queries for set prediction, no anchors or NMS (Lec8 p50).
- **Swin Transformer**: local + hierarchical attention (Lec8 p51), shifted 7×7 windows with linear cost (Lec8 p52), patch merging into a 4-stage multi-scale backbone, ICCV 2021 best paper (Lec8 p53).
- **CNN vs ViT vs Swin**: CNN has strong inductive bias, typical fit "**Efficiency, small data**". ViT fits "Large data and compute". Swin fits dense prediction. "Match the backbone to data, resolution and task" (Lec8 p54).

**Part 6: VLMs and Mamba**
- **CLIP**: contrastive image–text alignment on 400M pairs, enabling **zero-shot classification** with text prompts (Radford 2021) (Lec8 p56).
- **VLM = vision encoder + connector + language model**: ViT/CLIP gives visual tokens, a projector maps them into the LLM embedding space, and the LLM answers. Tasks: captioning, VQA, OCR, document understanding (Lec8 p57).
- **Flamingo** (cross-attention, few-shot), **BLIP-2** (Q-Former), **LLaVA** (visual instruction tuning) (Lec8 p58).
- **Modern multimodal models**: **GPT-4V, Gemini, Qwen2-VL, PaliGemma**. **Segment Anything** does promptable segmentation. "Try models in Hugging Face Spaces" (Lec8 p59).
- **State space models**: h' = Ah + Bx at linear cost, S4 (2021) → **Mamba** (2023, selective scan) (Lec8 p60–61). **Vision Mamba (Vim)** is bidirectional (Lec8 p62). **VMamba** uses a 2D cross-scan (Lec8 p63).
- **Timeline**: 1960s–80s filters → 1999–2012 SIFT/HOG/Viola-Jones → 2012–2019 AlexNet/ResNet/YOLO/U-Net → 2020–21 ViT/Swin/CLIP → 2022–24 VLMs/SAM/Mamba (Lec8 p64).
- **Hands-on path**: 1 OpenCV threshold/corners/matching. 2 "**Fine-tune a learned representation**: Adapt a CNN or ViT using **Transformers image classification**". 3 Ask questions with **LLaVA in Transformers**. "**Compare outputs and failure cases on the same image collection**" (Lec8 p65).
- **Takeaways**: "Rules still matter" for simple controlled tasks. CNNs learn features. "**Choose the tool by its task, data and compute budget**" (Lec8 p66).

### 1.5 Module 9 / Lec 9: Cloud ML platforms, MLOps and smart technologies (Lec9, 70 pp.)

Blocks: Cloud platforms, Git, MLOps with MLflow, model apps (Streamlit/Gradio), smart technologies (Lec9 p2). Stated outcome: "build and ship a tracked ML model": Explain / Version (Git, DVC) / Track (MLflow) / Ship (Streamlit or Gradio) (Lec9 p3).

**Part 1: Cloud**
- **Cloud computing (NIST)**: on-demand self-service, broad network access, resource pooling, rapid elasticity, measured service (Lec9 p5).
- **IaaS / PaaS / SaaS**: EC2/Compute Engine, then **SageMaker, Vertex AI** (managed ML tooling), then Gmail and Google Colab (Lec9 p6).
- **Deployment models**: public, private, hybrid ("Sensitive data stays on premises"), multi-cloud (Lec9 p7).
- **ML needs elastic compute and cheap storage**: GPU bursts, pay-per-use, managed services (Lec9 p8).
- **End-to-end cloud ML workflow**: 01 **Ingest** (bucket) → 02 **Prepare** (clean, label, split) → 03 **Train** (fit and tune) → 04 **Deploy** (expose an endpoint) → 05 **Monitor** (quality and service health) (Lec9 p9).
- **Platforms**: **SageMaker** (AWS notebooks, training jobs, endpoints), **Azure ML** (Designer, AutoML, pipelines), **Vertex AI** (AutoML, custom training, model registry). "Example task across all three: **train an image classifier and deploy predictions**" (Lec9 p10).
- **Comparison table**: S3 / Blob / Cloud Storage. Lambda / Functions / Cloud Functions. ECS/EKS / AKS / GKE. Trainium/Inferentia / GPU VMs / TPU (Lec9 p11).
- **CPU vs GPU vs TPU**: GPUs are for "Deep learning training and inference". Spot/preemptible instances are cheaper, so save checkpoints (Lec9 p12).
- **Object storage**: buckets, data lake vs warehouse, lifecycle rules (Lec9 p13). Managed vs DIY: "start managed" (Lec9 p14).
- **Cost control**: budgets and alerts before, small samples during, "Stop idle notebooks and delete unused endpoints" after (Lec9 p15).
- **Shared responsibility model**: least-privilege IAM, encryption, "**no keys in code**" (Lec9 p16).
- **Demos**: `boto3` S3 upload with credentials from env vars or an IAM role (Lec9 p17). SageMaker `SKLearn` estimator training job, Vertex `CustomJob.run()` (Lec9 p18).
- **Containers**: a **Docker** image bundles code, libraries and model files. **Kubernetes** scales replicas (Lec9 p19). Dockerfile `FROM python:3.11-slim … uvicorn app:app --port 8000`, with requirements FastAPI and uvicorn (Lec9 p20).
- **Free tiers**: Colab, Kaggle, **Hugging Face Spaces**, student credits (Lec9 p21).

**Part 2: Git**
- Repository, commit, branch, remote (Lec9 p23). Everyday workflow (Lec9 p24). Feature branch → commit and push → pull request → review and merge (Lec9 p25). ML needs **.gitignore** for secrets, data and models, plus **Git LFS** and **DVC**. "Commit code, configuration and the matching data version together" (Lec9 p26).

**Part 3: MLOps**
- **MLOps**: "applies DevOps practice to the ML lifecycle: practices that automate building, deploying, monitoring and retraining ML models reliably". It spans data engineering, machine learning and operations (Lec9 p28).
- **"A notebook model is not a product"**: data changes after deployment, untracked code/data/parameters prevent reproducibility, manual hand-offs. "A good notebook score says nothing about API uptime" (Lec9 p29).
- **DevOps vs MLOps**: the artifact is code + data + model. Testing adds data and model validation. Deployment means retrain and redeploy. Monitoring adds **drift and accuracy** (Lec9 p30).
- **ML lifecycle is a loop**: 1 Collect and validate data → 2 Engineer features → 3 Train and evaluate → 4 Deploy → 5 Monitor and return to data. "Monitoring supplies evidence for the next training cycle, not an automatic guarantee to retrain" (Lec9 p31).
- **MLOps maturity**: **Level 0 Manual** (notebook-driven, manual deployment), **Level 1 Pipeline** (automated training with validation gates), **Level 2 CI/CD + CT** (Lec9 p32).
- **Data validation and versioning**: validate schema, ranges and missing values. Version with **DVC or lakeFS**, validate with **Great Expectations**. "Record the exact data version each model saw" (Lec9 p33).
- **Experiment tracking**: Parameters, Metrics ("Validation accuracy and **inference latency**"), Artifacts (model files, evaluation reports), Provenance (code commit, data version) (Lec9 p34).
- **MLflow components**: **Tracking, Projects, Models, Model Registry**. Legacy stages are deprecated, so use **aliases such as `champion`** (Lec9 p35).
- **Demos**: track an sklearn RandomForest on Iris with `mlflow.set_experiment`, `start_run`, `log_param`, `log_metric("accuracy")`, `mlflow.sklearn.log_model` and `stratify=y` (Lec9 p36). `mlflow ui` → Compare runs. "A tracking UI displays real runs, not invented scores" (Lec9 p37). `register_model` plus `set_registered_model_alias("iris","champion")`, and "Assign champion only after validation" (Lec9 p38). `mlflow models serve` with POST to `/invocations`, and `build-docker` (Lec9 p39).
- **CI / CD / CT**: CI is lint, unit tests and data checks on each push. CD is build image → staging → approve production. CT is training triggered by new data. "Example gate: a candidate must pass schema checks and **outperform the agreed baseline**" (Lec9 p40). GitHub Actions `.github/workflows/ml.yml` with pytest and `python train.py` (Lec9 p41).
- **Deployment patterns**: **Batch** (scheduled predictions to a table), **Online** ("A REST endpoint responds with low latency"), **Edge** ("The model runs on the device"). "Release safely using **canary rollouts** and controlled **A/B tests**" (Lec9 p42).
- **Monitoring**: **Data drift** (input distributions change) and **Concept drift** (the input–target relationship changes). "Track **latency, errors and accuracy when labels arrive**. Investigate alerts before retraining or promotion" (Lec9 p43). Demo: `scipy.stats.ks_2samp`, KS test with p<0.05 flagging change, "not proof of harmful drift" (Lec9 p44).
- **MLOps tool landscape**: Git/GitHub. DVC/S3 versioning. MLflow/SageMaker or Vertex Experiments. Airflow, Kubeflow / SageMaker or Vertex Pipelines. **Serving: FastAPI, BentoML / SageMaker Endpoints**. **Monitoring: Evidently / Model Monitor** (Lec9 p45).

**Part 4: Model apps**
- **Streamlit**: Python script → web app with sliders, **file uploads** and charts. The script reruns on each interaction (Lec9 p47). 12-line Iris app with pickle and a "load pickle only from trusted sources" warning (Lec9 p48). Streamlit plus MLflow model via `@st.cache_resource` (Lec9 p49).
- **Gradio**: `gr.Interface` gives an automatic API and `share=True` link. "Do not expose sensitive data through a public demo" (Lec9 p50).
- **Streamlit vs Gradio**: Streamlit for dashboards and multi-page apps (high layout control, no built-in API, Community Cloud). Gradio for quick demos (built-in API, HF Spaces) (Lec9 p51). Free deploy is push → connect → share, with secrets configured through the host (Lec9 p52).
- **FastAPI serving**: `FastAPI()`, pydantic `BaseModel`, `@app.post("/predict")`, model from `mlflow.pyfunc.load_model("models:/iris@champion")`. "Streamlit or IoT clients can POST features to /predict. **Add length validation for production**" (Lec9 p53).

**Part 5: Smart technologies**
- **IoT → Big data → AI → Blockchain** reinforce each other, with the cloud connecting the flow. Blockchain is tamper-evident but "does not guarantee truthful sensor inputs" (Lec9 p55).
- **IoT**: networked devices with sensors and actuators (Lec9 p56). Protocols **MQTT** (pub/sub broker), **HTTP/CoAP**, Wi-Fi/BLE/LoRaWAN/5G (Lec9 p57). paho-mqtt demo (Lec9 p58). **AWS IoT Core, Azure IoT Hub** (Lec9 p59).
- **Big data five Vs**: Volume, Velocity, Variety, **Veracity** (data quality), Value (Lec9 p60). **Kafka → Spark → lake/warehouse**, EMR/Databricks/BigQuery (Lec9 p61). PySpark demo (Lec9 p62).
- **Blockchain**: hash-linked blocks (Lec9 p63). PoW vs PoS, smart contracts (Lec9 p64). Hash-chain demo (Lec9 p65).
- **AI ⊃ ML ⊃ Deep learning**, plus Generative AI (Lec9 p66). Smart-building example (Lec9 p67).
- **Capstone end-to-end pipeline**: 01 Version (**Git + DVC**) → 02 Train (**Cloud VM + MLflow**) → 03 Deploy (**Registry + Docker**) → 04 Operate (**Streamlit + monitoring**, watch for drift) (Lec9 p68).
- **Takeaways**: elastic resources, a closed lifecycle, reproducible work, connected technologies (Lec9 p69). **Practice**: Lab 1 "Track three MLflow runs. Compare parameters, accuracy and artifacts". Lab 2 "Wrap your model in Streamlit and deploy it. Keep credentials out of Git" (Lec9 p70).

### 1.6 Topics you asked about that the decks do not cover

- **Named optimizers** (Adam, SGD with momentum, RMSprop), **batch size**, **epochs**, **weight decay**, **learning-rate schedules**: not covered in the course materials. Only gradient descent with learning rate α (Sup p14), "training batches" (Sup p5) and XGBoost `learning_rate` in Lab 4 appear.
- **Batch normalization**, softmax output layer for CNN classifiers, explicit CNN layer recipes (Conv-Pool-Dense): not covered. CNN content is conceptual (Lec8 p32–37).
- **Keras / TensorFlow**: not covered in the course materials. **PyTorch** appears only as a linked tutorial (Lec8 p38), and **torchvision** only as a toolkit item (Lec8 p10). No lab used PyTorch or torchvision.
- **Fairness metrics or CV-specific bias auditing**: not covered. Bias is discussed for LLMs (Lec7 p64) and as a data-collection check (Lab 4 c[10], c[11]).
- **Explainability methods for images (Grad-CAM, etc.)**: not covered.
- **Model quantization / ONNX / TFLite**: not covered. Edge efficiency is only via MobileNet, EfficientNet and ConvNeXt (Lec8 p37).
- **Top-k accuracy**: appears only as the AlexNet ImageNet top-5 error figure (Lec8 p34). It is not defined as a metric.

---

## 2. Labs

Inventory of `assignments/`: lab-1 has an `.xlsx` flashcard file (not ML). **lab-2, lab-5, lab-7 and midterm are empty folders**, with no task files present. lab-3, lab-4, lab-6 and lab-8 have notebooks (read below). assignment-1 has a task PDF (RPS / SQLite / data visualisation / API, not read) and a zip. assignment-2 has the group-project task PDF (read, 1 page). All labs are authored by **Olzhas Shortanbaiuly**, run in **Google Colab**, are worth 60 points, use pop-culture themes, and end with an AI-use declaration and a submission checklist.

### Lab 3: "Mission: Get Peter to the Cinema" (HCI + relational databases)
- **What students did**: wrote three **measurable usability requirements** (User + task + measurable criterion) covering effectiveness, efficiency, satisfaction and accessibility (c[8], c[11]). Explained normalisation, primary and foreign keys (c[16]–c[18]). Built tables and ran WHERE / GROUP BY / JOIN / HAVING queries.
- **Libraries**: `sqlite3` (in-memory, `PRAGMA foreign_keys = ON`), `pandas.read_sql_query`, `matplotlib`. phpMyAdmin/MySQL was optional.
- **Reusable for the project**: the `run_sql()` / `execute_sql()` helper pattern (c[14]). Normalised `CREATE TABLE` with `CHECK` and `FOREIGN KEY` constraints (c[20]) maps directly onto an `analyses` / `photos` / `rules` store behind the dashboard. Usability requirements in the form "≤ N screens, < 60 s, contrast ≥ 4.5:1" (c[8], c[12]) can be used to justify the web app's photo-upload flow.

### Lab 4: "Naruto and the Hidden Data of Konoha" (data management, decision trees, forecasting)
- **What students did**: wrote a data-collection plan (primary vs secondary, metadata, with a quality/privacy/bias check) (c[10]–c[11]). Learned data-mining tasks and the **CRISP-DM** lifecycle "business understanding → data understanding → data preparation → modelling → evaluation → deployment/monitoring", described as iterative (c[12]). Removed a duplicate and filled a missing value with the median (c[16]). Made an honest chart with a title and labelled axes, without causal claims (c[17], c[19]). Computed Gini by hand (c[21]). Trained `DecisionTreeClassifier(max_depth=3, criterion="gini")` with one-hot features (c[23]). Did a linear forecast with MAE (c[26]–c[29]) and chunk processing (c[30]–c[31]).
- **Libraries**: `numpy`, `pandas`, `matplotlib` (`seaborn-v0_8-whitegrid` style), **scikit-learn** (`train_test_split(..., test_size=0.25, random_state=7, stratify=y)`, `DecisionTreeClassifier`, `plot_tree`, `accuracy_score`, `mean_absolute_error`, `LinearRegression`). Optional **XGBoost** `XGBClassifier(n_estimators=40, max_depth=3, learning_rate=0.08, subsample=0.9, eval_metric="logloss")` (c[32]). Synthetic data was generated with `np.random.default_rng(11)`.
- **Course framing to reuse**: optional extension "Change max_depth from 3 to 5. Does the test accuracy improve? Why can a deeper tree overfit?" and "Do not treat one small fictional split as a final production evaluation" (c[40]). This is exactly the Option-A style "change a model choice and compare" exercise. Closing line: "not to trust a dashboard blindly… ask where the data came from, clean it, visualise it clearly, test the model, and explain the decision" (c[41]).
- The zip also contains `fill_lab4.py`, a helper script that filled the answers and executed the notebook with `nbformat`/`nbclient`. It is not course material.

### Lab 6: "Get to Know Tair" (NLP: NLTK, TF-IDF, Naive Bayes, Whisper)
Only the student's answer sheet is present. There is no separate task file, and the submission's execution note says the scores were not run in that environment (c[22]).
- **What students did**: NLTK preprocessing (tokenize, stop words keeping "no/not/nor", WordNet lemmatization) (c[10]). Split first, then fit TF-IDF only on train "to avoid test-data leakage" (c[11]–c[12]). Trained a MultinomialNB sentiment classifier, reported accuracy/precision/recall/F1 and a confusion matrix, and argued which error is costlier (c[13]–c[14]). Predicted new samples with `predict_proba` and identified the least-confident prediction (c[15]–c[16]). Debugged and ran **Whisper** transcription (c[17]–c[19]). Wrote a short report that states limitations ("only 40 fictional messages… may not generalise") (c[21]).
- **Libraries**: `nltk` (punkt, punkt_tab, stopwords, wordnet, omw-1.4), **scikit-learn** (`TfidfVectorizer`, `MultinomialNB`, `accuracy_score`, `precision_score`, `recall_score`, `f1_score`, `ConfusionMatrixDisplay`), `openai-whisper` (`whisper.load_model("base")`), `google.colab.files.upload()`, `matplotlib`, `pandas`. `RANDOM_STATE = 1103`, `train_test_split(test_size=0.25, stratify=...)`.
- **Reusable pattern**: the `evaluate_model(model, X_eval, y_eval, title)` helper (c[6]) returns a one-row DataFrame of accuracy/precision/recall/F1 and plots `ConfusionMatrixDisplay.from_predictions`. Reuse it verbatim for the CV baseline vs improved model, with `average="macro"` for multiclass. The error-analysis table of misclassified test items (c[14]) and the least-confident-prediction analysis (c[16]) also carry over.

### Lab 8: "Shrek's MLflow Swamp" (MLOps with MLflow; Week 9, the last lab)
- **What students did**: Mission 1 prepare split and explain why the test set is held out. Mission 2 onboard a pickled "legacy" model into an MLflow run (params, metrics, model artifact). Define **run** and **experiment**. Mission 3 **register** the model, tag a version (`validation_status=reviewed`), reload from `models:/Name/version` and check predictions match. Mission 4 run **two more RandomForestRegressor configurations "Keep the same split and seed"**, log RMSE/MAE/R², show a comparison table, pick the best by RMSE and "name one limitation of comparing on a single test set". Mission 5 `mlflow.search_runs` table. Mission 6 distinguish parameters vs metrics vs artifacts and say why recording split and seed helps.
- **Libraries/dataset**: `mlflow>=3,<4`, `MlflowClient`, **scikit-learn** `load_diabetes` (regression), `RandomForestRegressor(n_estimators=30, max_depth=4)`, `mean_squared_error`/`mean_absolute_error`/`r2_score`, `pickle`. `SEED = 42`, `test_size=0.25`. Tracking URI `sqlite:///shrek_mlflow.db`, experiment `Shrek_Swamp_Experiments`.
- **Reusable pattern (strongest link to the project)**: copy the Mission 4 loop for baseline vs improved model or original vs augmented dataset. For each config, use `with mlflow.start_run(run_name=...)` then `log_params`, `log_metrics` and `log_model`, collect rows, and display a DataFrame. Then `register_model` and alias `champion`, and serve the champion to the web app (Lec9 p38, p53). Note from the lab: "Colab runs remotely, so localhost on your own computer is not its server… save the database and artifact folder to Drive" (Lab8 c[27]).

### Assignment 2 task (A2 p1), for cross-check
Research area is NLP/LLM or Computer Vision. **Option A**: "Use an open-source dataset and modify the machine-learning algorithm you select. Examples include changing the number of layers, hyperparameters, optimizers, or other relevant model choices." **Option B**: "Collect a new dataset or enrich an existing dataset with synthetically generated data. Compare the accuracy or other meaningful outputs of approaches using the original dataset and your proposed updated dataset." Teams of up to 6, all students with the same lab instructor (Olzhas or Dilnura). The defense is 10 minutes: at least 7 minutes of presentation plus 2–3 minutes of Q&A, and "You may be asked to briefly show your source code". "An interface that makes the project feel like an MVP is an advantage". Nothing is submitted to the Assignment #2 box.

### Tooling the course actually taught (use these names in code and slides)
scikit-learn (train_test_split with `stratify` and `random_state`, metrics, `ConfusionMatrixDisplay`, `Pipeline`), pandas, numpy, matplotlib, Google Colab, MLflow 3 (tracking, registry, aliases, `mlflow models serve`), FastAPI + uvicorn, Docker, Streamlit, Gradio, Hugging Face (Hub, `transformers` pipelines, Spaces), OpenCV / Pillow / scikit-image / torchvision (named in Lec8 p10, not used in a lab), Ultralytics YOLO (Lec8 p40), Git/GitHub/GitHub Actions, DVC, Evidently (named only), scipy `ks_2samp` for drift.

---

## 3. Application to our project

| Project decision | Course concept to cite | Source | One-sentence justification to say at the defense |
|---|---|---|---|
| Option A vs Option B | Option A changes "layers, hyperparameters, optimizers"; Option B uses "synthetically generated data" and compares "original vs updated dataset". Lec8 lists data augmentation and generative models for augmentation | A2 p1; Lec8 p38, p43 | "We chose Option [B] because the CV lecture names augmentation and generative models (GANs, diffusion) as the tools for small image collections, so the dataset is the variable we change and measure." |
| Fair comparison design | One variable changes. Same split and seed, as in Lab 8 Mission 4 ("Keep the same split and seed"). Report the evaluation protocol | Lab8 c[13]; Lec8 p42 | "Both runs share the same test split, seed, architecture and training budget, so any difference in F1 comes from the data (or the single model change), not from luck." |
| Test set for Option B | Test set is "locked in a vault… evaluated once". Never let test data influence training | Sup p10 | "Synthetic images go only into training; validation and test contain only real images, so we measure performance on reality, not on our own generator." |
| Single-split weakness | Lab 8 asks for "one limitation of comparing on a single test set". **k-fold cross-validation** rotates the validation set | Lab8 c[13]; Sup p26 | "Because one split can be lucky, we repeat with [3 seeds / k-fold] and report mean ± spread." |
| Baseline vs improved | "Train baseline models" (workflow step 4). Logistic regression is the "strong baseline". CI gate: candidate must "outperform the agreed baseline" | Sup p11, p23; Lec9 p40 | "We fixed a baseline first and promote the new model to champion only if it beats the baseline on the agreed metric." |
| Architecture: pretrained CNN backbone | Transfer learning: Reuse a pretrained backbone, Fine-tune the last layers then more. Example "adapt an ImageNet model to a small image collection" | Lec8 p38; Lec8 p65 | "We have a small dataset, so the course's recipe is to reuse an ImageNet-pretrained backbone and fine-tune the head, not to train from scratch." |
| Why CNN, not ViT | CNN inductive bias "Strong", typical fit "Efficiency, small data". ViT needs "Large data and compute" | Lec8 p54, p47 | "With limited data the course's comparison table points to a CNN, because ViT has little built-in image bias and needs more data." |
| Which CNN | **ResNet** (skip connections). **MobileNet / EfficientNet** for phones and edge devices | Lec8 p36, p37 | "We use [ResNet-18 / MobileNet / EfficientNet] because it is pretrained on ImageNet and light enough for local inference on a laptop." |
| Task framing | Ladder: classification → detection (YOLO) → segmentation | Lec8 p11, p40 | "Our rule-checking is framed as [image classification / detection with Ultralytics YOLO], the [first/second] rung of the vision-task ladder." |
| Zero-shot or VLM alternative | CLIP zero-shot classification with text prompts. VLM = vision encoder + connector + LLM. "Visual fluency does not guarantee accurate counting…" | Lec8 p56–57; Lec7 p66 | "A cloud VLM is our comparison or fallback, but the course warns VLMs can fail on counting and reading, so we measure them on our own test set too." |
| Augmentation | "Flip, crop, colour jitter and mixup". DeiT relies on augmentation and regularisation | Lec8 p38, p48 | "We used exactly the augmentations the lecture lists (flip, crop, colour jitter[, mixup]) and applied them only to training images." |
| Synthetic data | Generative models (GANs, Diffusion / Stable Diffusion) used for "data augmentation". SMOTE/resampling for imbalance | Lec8 p43; Sup p12 | "Synthetic images from [diffusion model] enrich minority classes, which the course lists both as a generative-model use and as a fix for class imbalance." |
| Hyperparameters and optimizer | Gradient descent θ ← θ − α∇L, with learning rate behaviour (too small, optimal, too large). Named optimizers (Adam etc.) are not covered in the course materials | Sup p14 | "We tuned the learning rate on the validation set because the course shows too high a rate diverges and too low a rate stalls." |
| Loss | Categorical cross-entropy for multiclass | Sup p13 | "Multiclass classification uses categorical cross-entropy, the generalisation of log loss in the supervised lecture." |
| Overfitting controls | Dropout, early stopping, more data, L2, augmentation. Overfitting symptom is low train error with exploding validation error | Sup p24, p26; Lec8 p34 | "We watch train vs validation curves and use dropout/early stopping/augmentation, the controls listed on the 'Preventing overfit' slide." |
| Metrics to report | Confusion matrix, accuracy (misleading with imbalance), precision, recall, F1. "Choose a metric that matches the task and the cost of errors". IoU/mAP if detection | Sup p27; Lec8 p42; Lec7 p34 | "We report macro-F1 and the confusion matrix, not only accuracy, because accuracy hides failures on rare rule-violation classes." |
| Which error matters | Precision is critical for spam (false alarms), recall for cancer (misses). Lab 6 asks "which mistake is worse" | Sup p27; Lab6 c[13] | "For a rule checker a missed violation (FN) is worse than a false alarm, so we prioritise recall and show the precision trade-off." |
| Threshold / confidence | ROC/AUC across thresholds. Lab 6 uses `predict_proba` for least-confident predictions | Sup p28; Lab6 c[16] | "The app shows model confidence and flags low-confidence photos for human review." |
| Dataset split and leakage | 70/15/15. "Fit only on train". Stratified split (`stratify=y`). Remove duplicates | Sup p10, p29; Lab4 c[23]; Lab6 c[12]; Lab4 c[16] | "We split 70/15/15 stratified by class, de-duplicated before splitting so near-identical photos can't leak, and fit normalisation statistics on train only." |
| Data quality and versioning | Validate schema, ranges, missing values. Version data with DVC. "Record the exact data version each model saw" | Lec9 p33, p26 | "Original and augmented datasets are separate DVC/versioned folders, and each MLflow run records which one it used." |
| Experiment tracking | MLflow Tracking: parameters, metrics (validation accuracy and inference latency), artifacts, provenance | Lec9 p34–36; Lab8 | "Every experiment is an MLflow run, so the comparison table in our slides is the real run table, not hand-copied numbers." |
| Model registry | Register, alias `champion` "only after validation" | Lec9 p35, p38; Lab8 c[10] | "The web app always loads `models:/<name>@champion`, so promoting a better model needs no code change." |
| Model serving / API | FastAPI `@app.post("/predict")` with pydantic validation, `mlflow models serve` `/invocations`, Docker with uvicorn | Lec9 p53, p39, p20 | "The web app sends the photo to a FastAPI `/predict` endpoint, the serving pattern from Lecture 9, containerised with the lecture's Dockerfile." |
| Local vs cloud inference | Deployment patterns **Batch / Online / Edge**. Cloud API trade-offs **Cost, Privacy, Latency**. Open weights "can run locally when hardware and licence permit" | Lec9 p42; Lec7 p19, p65 | "Local inference is the Edge/Online pattern and keeps photos private. The cloud option trades cost and latency for capacity, exactly the three trade-offs in Lecture 7." |
| Cloud platform vocabulary | IaaS/PaaS/SaaS. SageMaker / Azure ML / Vertex AI. "train an image classifier and deploy predictions". Shared responsibility, no keys in code | Lec9 p6, p10, p16 | "If hosted, this is PaaS (Vertex AI / SageMaker endpoint). We keep API keys in environment variables per the shared-responsibility slide." |
| MLOps pipeline | Lifecycle loop: Collect and validate data → Engineer features → Train and evaluate → Deploy → Monitor and return to data. Maturity Level 0/1/2. Capstone Git+DVC → Cloud VM+MLflow → Registry+Docker → Streamlit+monitoring | Lec9 p31, p32, p68 | "We are at MLOps Level 0–1: versioned data, tracked training, registered champion, containerised API and a monitoring dashboard, which mirrors the Lecture 9 capstone." |
| CI | GitHub Actions running `pytest` and `python train.py` on push. Branches and PRs | Lec9 p41, p25 | "Each push runs tests in GitHub Actions, and team members work on feature branches merged via pull requests." |
| Monitoring and analytics dashboard | Track **latency, errors, accuracy when labels arrive**. **Data drift** vs **concept drift**. KS test. Evidently | Lec9 p43–45 | "The analytics page plots prediction counts, confidence, latency and error rate over time. A drop in confidence or a KS-test flag on image statistics signals data drift." |
| Dashboard UI choice | Streamlit for dashboards and multi-page apps, Gradio for quick demos | Lec9 p51 | "We built a custom web app; the course's equivalent is Streamlit for dashboards, and we can show a Gradio demo as a quick fallback." |
| Web app usability | Measurable usability requirements: effectiveness, efficiency, satisfaction, accessibility | Lab3 c[8] | "Upload-to-result takes ≤ 2 screens and < 10 s, buttons have text labels and contrast meets 4.5:1, the requirement style from Lab 3." |
| Honest charts | Title, labelled axes, no misleading scales, no causal claims from small samples | Lab4 c[17], c[19] | "Our charts follow the Lab 4 rules: labelled axes, zero-based bars, and no causal claims from a small test set." |
| Limitations | Single test set (Lab8). Small fictional data may not generalise (Lab6 c[21]). Neural nets "need lots of data" | Lab8 c[13]; Lab6 c[21]; Sup p23 | "Our dataset is small and from one context, so results may not generalise; we state this as the course asks." |
| Bias and ethics | Training data can reproduce stereotypes, so "Test across groups". Privacy: minimise exposure. Model card and licence. Annotation agreement and document licences | Lec7 p64, p18, p21; Lab4 c[10] | "We checked dataset licences, measured per-class performance to expose bias, and don't send photos to a cloud API without consent." |
| Public demo safety | "Do not expose sensitive data through a public demo". Load pickle files only from trusted sources | Lec9 p50, p48 | "Uploaded photos are not published, and the demo uses only our own or licensed images." |
| Classical pre-processing (optional) | OpenCV resize, colour spaces, histogram equalization/CLAHE, denoising. "Rules still matter" | Lec8 p6, p14, p16, p66 | "We normalise lighting with CLAHE/colour conversion before inference, and use simple OpenCV rules where they are enough." |

---

## 4. Likely Q&A (15)

1. **Why Option A/B, and what exactly did you change?** I state the single variable (dataset enrichment, or one model choice) and cite A2 p1. Everything else stays fixed, as in Lab 8 Mission 4 ("Keep the same split and seed").
2. **How did you split the data, and how did you avoid leakage?** We used a stratified 70/15/15 split, with the test set "locked in a vault" (Sup p10). We de-duplicated before splitting and kept synthetic images out of val/test (Sup p10, p29; Lab4 c[16]).
3. **Why not just report accuracy?** Accuracy is "misleading when classes are heavily imbalanced" (Sup p27). We report precision, recall, F1 and the confusion matrix, choosing "a metric that matches the task and the cost of errors" (Lec8 p42).
4. **Which error is worse in your app, FP or FN?** For rule violations a miss (FN, Type II) costs more, so we watch recall, as with cancer detection on Sup p27. The trade-off shows in precision (Lab6 c[13] asks the same question).
5. **What is transfer learning and why did you use it?** It "adapts an existing representation instead of learning everything from scratch": reuse a pretrained backbone, then fine-tune the last layers (Lec8 p38). It is the course's recipe for small image collections.
6. **Why a CNN and not a Vision Transformer?** The Lec8 p54 table gives CNNs a strong inductive bias that fits "efficiency, small data", while ViT needs large data and compute (Lec8 p47).
7. **How does a CNN work?** Convolution kernels are learned with shared weights and pooling downsamples (Lec8 p33). Early layers learn edges and late layers objects, trained by forward pass → loss → backprop → gradient descent (Lec8 p32).
8. **How do you know you're not overfitting?** We compare train vs validation error: overfitting shows near-zero train error and rising validation error (Sup p24). The controls are augmentation, dropout, early stopping and more data (Sup p26; Lec8 p38).
9. **Is the improvement real or luck?** We kept the same split and seed and repeated over seeds or k-fold (Sup p26), which addresses Lab 8's "limitation of comparing on a single test set".
10. **Where do the synthetic images come from, and could they hurt?** They come from [method]. The course lists GANs and diffusion for data augmentation (Lec8 p43). They could hurt if unrealistic, which is why the test set is real images only.
11. **Which hyperparameters did you tune?** Mainly the learning rate, because too high a rate diverges and too low a rate stalls (Sup p14). Tuning happened on the validation set, never the test set (Sup p10).
12. **Local or cloud model: why?** Lec9 p42's deployment patterns (online/edge) and Lec7 p19's cost/privacy/latency trade-offs. Local keeps photos private, while cloud scales and costs per call.
13. **How is the model served to your web app?** A FastAPI `/predict` endpoint loads the MLflow `@champion` model, packaged in Docker (Lec9 p53, p38, p20).
14. **What do you monitor after deployment?** Latency, errors, and accuracy when labels arrive. We also watch data drift vs concept drift (Lec9 p43), and the dashboard visualises these.
15. **What are the limitations and ethical risks?** The data is small and from one context, so it may not generalise (Lab6 c[21]; Sup p23). The model may be biased across groups or conditions, so we test per group (Lec7 p64). We handle privacy of uploaded photos and check dataset licences (Lec7 p18, p21; Lec9 p50).

---

## 5. Glossary index

| Term | Source |
|---|---|
| A/B test, canary rollout | Lec9 p42 |
| Accuracy | Sup p27; Lec8 p42; Lab6 c[6] |
| Activation function (ReLU, GELU) | Sup p22; Unsup p24; Lec8 p32 |
| AlexNet | Lec8 p34 |
| Anomaly detection (Isolation Forest, One-Class SVM) | Unsup p27 |
| Apriori, support/confidence/lift | Unsup p26 |
| Attention / self-attention | Lec7 p53; Lec8 p45 |
| Autoencoder | Unsup p24; Lec8 p43 |
| Bag of Visual Words | Lec8 p29 |
| Bag of words | Lec7 p36 |
| Backpropagation | Sup p22; Lec8 p32 |
| Batch / Online / Edge deployment | Lec9 p42 |
| BERT, pretrain → fine-tune | Lec7 p57 |
| Bias (LLM) | Lec7 p64 |
| Bias–variance trade-off | Sup p25 |
| Big data five Vs | Lec9 p60 |
| Binary cross-entropy / categorical cross-entropy | Sup p13 |
| Blockchain, PoW/PoS | Lec9 p63–65 |
| Canny edge detector | Lec8 p19 |
| CI / CD / CT | Lec9 p40–41 |
| Class imbalance, SMOTE, class weights | Sup p12 |
| Classification vs regression | Sup p7 |
| CLIP | Lec7 p66; Lec8 p56 |
| Cloud computing (NIST) | Lec9 p5 |
| CNN | Lec8 p31–37 |
| Colour spaces (RGB, HSV, Lab) | Lec8 p6 |
| Concept drift / data drift | Lec9 p43 |
| Confusion matrix | Sup p27; Lec7 p34; Lab6 c[6] |
| Containers / Docker / Kubernetes | Lec9 p19–20 |
| Convolution | Lec8 p15, p33 |
| Cosine similarity | Unsup p9; Lec7 p39 |
| CRISP-DM | Lab4 c[12] |
| Cross-validation (k-fold) | Sup p26 |
| Curse of dimensionality | Sup p17; Unsup p11 |
| Data hygiene (imputation, one-hot, scaling) | Sup p12; Unsup p10 |
| Data leakage | Sup p10, p29; Lec7 p24; Lab6 c[11] |
| Data validation / versioning (DVC, lakeFS, Great Expectations) | Lec9 p26, p33 |
| DBSCAN | Unsup p17 |
| Decision tree, Gini, information gain | Sup p18; Lab4 c[21] |
| DeiT | Lec8 p48 |
| DETR | Lec8 p50 |
| Diffusion / Stable Diffusion | Lec8 p43 |
| Dropout | Sup p26; Lec8 p34 |
| Early stopping | Sup p26 |
| Edge devices, efficient CNNs (MobileNet, EfficientNet, ConvNeXt) | Lec8 p37 |
| Ensembles (Random Forest, Gradient Boosting, XGBoost, LightGBM) | Sup p19; Lab4 c[32] |
| Experiment tracking | Lec9 p34 |
| F1 score | Sup p27; Lec7 p34; Lec8 p42 |
| FastAPI serving | Lec9 p53 |
| Feature, keypoint, descriptor | Lec8 p22 |
| Fine-tuning | Lec7 p57, p63; Lec8 p38, p65 |
| GANs | Lec8 p43 |
| Generalization | Sup p4 |
| Git, branch, pull request | Lec9 p23–26 |
| GMM / Expectation-Maximization | Unsup p18 |
| Gradient descent, learning rate | Sup p14; Lec8 p32 |
| Gradio | Lec9 p50–51 |
| Hallucination | Lec7 p64 |
| Hierarchical clustering | Unsup p16 |
| Histogram equalization, CLAHE | Lec8 p14 |
| HOG | Lec8 p26 |
| Hough transform | Lec8 p20 |
| Hugging Face (Hub, transformers, Spaces) | Lec7 p18; Lec8 p10, p59; Lec9 p21 |
| IaaS / PaaS / SaaS | Lec9 p6 |
| ImageNet, COCO | Lec8 p32 |
| IoT, MQTT, CoAP | Lec9 p56–59 |
| IoU | Lec8 p42 |
| K-Means, elbow, k-means++ | Unsup p14–15 |
| kNN | Sup p17 |
| Linear / logistic regression | Sup p15–16 |
| LLM, context window, temperature | Lec7 p61 |
| LoRA | Lec7 p63 |
| Loss function | Sup p13 |
| mAP | Lec8 p42 |
| Mamba, Vision Mamba, VMamba | Lec8 p60–63 |
| MAE / MSE / RMSE / R² | Sup p13, p28; Lab8 c[7] |
| MLflow (Tracking, Projects, Models, Registry, alias champion) | Lec9 p35–39; Lab8 |
| MLOps, lifecycle loop, maturity levels | Lec9 p28–32 |
| Morphology (erosion, dilation, opening, closing) | Lec8 p18 |
| Naive Bayes | Sup p20; Lec7 p32; Lab6 c[14] |
| NLP pipeline | Lec7 p24 |
| Object detection (R-CNN family, YOLO, SSD) | Lec8 p39–40 |
| Object storage, buckets | Lec9 p13 |
| Overfitting / underfitting | Sup p24 |
| PCA | Unsup p22 |
| Precision / recall | Sup p27; Lec7 p34; Lab6 c[6] |
| Prompting vs RAG vs fine-tuning | Lec7 p63 |
| Regularization (L1 Lasso, L2 Ridge) | Sup p26 |
| ResNet, skip connection | Lec8 p36 |
| ROC / AUC | Sup p28 |
| Segmentation (FCN, DeepLab, U-Net, Mask R-CNN, SAM) | Lec8 p41, p59 |
| Self-supervised learning (MAE, DINOv2) | Lec8 p49 |
| Shared responsibility model | Lec9 p16 |
| SIFT / ORB / FAST / SURF / Harris | Lec8 p23–25 |
| Silhouette, Davies-Bouldin | Unsup p28 |
| Streamlit | Lec9 p47–49, p51 |
| Supervised vs unsupervised vs reinforcement | Sup p6; Unsup p4 |
| SVM, kernel trick | Sup p21 |
| Swin Transformer | Lec8 p51–53 |
| t-SNE / UMAP | Unsup p23 |
| TF-IDF | Lec7 p37; Sup p29; Lab6 c[12] |
| Thresholding (Otsu, adaptive) | Lec8 p17 |
| Train / validation / test split | Sup p10; Lab8 c[8] |
| Transfer learning | Lec8 p38 |
| Transformer | Lec7 p54–55 |
| Usability requirements | Lab3 c[8] |
| Vision tasks ladder | Lec8 p11 |
| ViT | Lec8 p46–47 |
| VLM (Flamingo, BLIP-2, LLaVA, GPT-4V, Gemini, Qwen2-VL, PaliGemma) | Lec7 p66; Lec8 p57–59 |
| Viola-Jones | Lec8 p27 |
| Whisper | Lec7 p20; Lab6 c[19] |
| word2vec / GloVe | Lec7 p41 |
| CPU / GPU / TPU | Lec9 p12 |
