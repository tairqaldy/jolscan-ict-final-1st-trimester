# ML experiment 2: restroom sign matching

> **Owner: Nazar (lane C).** This file, `ml/restroom/`, `ml/results/restroom/` and RULES.md part 2 belong to the restroom lane. Other lanes, and AI agents working for them: ask Nazar instead of editing.

## Summary (10 November 2026, evening)

- **Final pipeline, no training:** 30/30 on test, 10/10 on validation, 0.960 ± 0.041 on 200 episodes built from the training restrooms. For comparison, the IOAI baseline scores 0.767 on test and 0.574 on the episodes. See "The final pipeline" below.
- **Layer experiment (the assignment's "change the number of layers"):** fine-tuning the last 4 of CLIP's 12 transformer blocks finds the other door first for 0.965 of held-out originals. Zero-shot CLIP gets 0.780, and training all 12 blocks drops to 0.910. ResNet50 peaks at 2 of 5 stages, with 0.913. Past the peak, extra trainable layers only memorise: accuracy on the training restrooms is 1.000 for every N ≥ 1. See "The layer experiment".
- **What each frozen layer knows:** CLIP's middle blocks know which restroom a sign belongs to (0.951 at blocks 7–10). Only its last blocks know the gender (0.768 at block 12, about 0.6 before that). See "What each frozen layer knows".

The second module of Qarau. The pothole experiment is in [ML-EXPERIMENT.md](ML-EXPERIMENT.md). Code and run instructions are in `ml/restroom/README.md`.

## Task and data

The task is the IOAI 2025 Individual Contest problem "Restroom Icon Matching" (https://github.com/IOAI-official/IOAI-2025, licence CC-BY-4.0). Each restroom has a male and a female door sign. Given a cropped sign, find the original sign of the **opposite gender from the same restroom** in a gallery.

| Split | Content | Use |
|---|---|---|
| Training | 82 restrooms × 4 images (cropped and original, male and female) | Training and grouped cross-validation |
| Validation (test_a) | 10 query crops, 20 gallery originals, answers | Choosing between runs |
| Test (test_b) | 30 query crops, 60 gallery originals, answers | Read once, for the final table |

Metric (from the IOAI scoring script): **top-1 matching accuracy** = correct matches / queries. Reference points published by the IOAI committee on the test set: baseline 0.77, best 0.90. These are IOAI's numbers, not ours, and are always labelled that way.

The images are icons on doors and walls. There are no people in them.

## Method

CLIP (Lec8 p56) has an image encoder, a Vision Transformer (Lec8 p46–47), trained on 400M image–text pairs. Every sign becomes an embedding vector. From embeddings we compute:

- **Similarity** of two signs: cosine similarity scaled to 0..1.
- **Gender** of a sign: zero-shot with text prompts ("a restroom sign for men" / "for women"), or a scikit-learn logistic-regression probe on the frozen embeddings.

Matching strategies, all scored with the IOAI rule:

- **Baseline (R0, R1):** take the second most similar gallery image, assuming the most similar one is the query's own original. This is the IOAI baseline notebook.
- **Two-step (R2, R3, the IOAI reference recipe):** step 1 finds the query's own original in the gallery; step 2 finds the opposite-gender sign from the same restroom, using a second model trained on male–female pairs.
- **Gender filter (R6):** the most similar gallery sign whose predicted gender is the opposite. This is the rule the API's `bestMatchId` uses, and it is the weakest, because a single wrong gender prediction breaks the match.

We declare **Option A** for this module too: open-source dataset, modify the model, compare against a fixed baseline (A2 p1). The variable we change is mainly **how many transformer layers are trained**, which is the assignment's own example ("changing the number of layers").

## Runs

| Run | What changes | Question | Course link |
|---|---|---|---|
| R0 | Zero-shot CLIP ViT-B/16, no training | Can we reproduce the IOAI baseline (0.77)? | Lec8 p56 |
| R1 | Zero-shot CLIP ViT-B/32 | Does the smaller patch size of B/16 matter? | Lec8 p46 |
| R2 | ViT-B/32, fine-tune the last 1 transformer block | Does a little adaptation help on 82 restrooms? | Lec8 p38 |
| R3 | Fine-tune the last 3 blocks | More layers trained | A2 p1, Lec8 p38 |
| R4 | Fine-tune the last 6 blocks (the IOAI reference recipe) | Where does more training start to overfit? | Sup p24 |
| R5 | R4 plus augmentation (flip, crop, colour jitter) | Does augmentation help with so little data? | Lec8 p38 |
| R6 | Gender: zero-shot prompts against a logistic-regression probe | Is a trained classifier on embeddings better than prompts? | Labs 4 and 6 (scikit-learn) |

R0, R1 and R6 need no training. R2 and R3 also ran on a laptop CPU in under 8 minutes each. R4 and R5 take longer and go to Colab.

## Results (10 November 2026, Apple M5 CPU)

Real runs from `ml/results/restroom/runs/`. Matching accuracy on validation (10 queries) and test (30 queries); gender accuracy from 5-fold cross-validation grouped by restroom; latency is the median per image at batch size 1.

| Run | What changed | Validation | Test | Gender (CV) | Latency |
|---|---|---|---|---|---|
| R0 | Zero-shot ViT-B/16, IOAI baseline rule | 0.80 | 0.767 (23/30) | 0.774 | 55 ms |
| R1 | Zero-shot ViT-B/32 | 0.80 | 0.767 (23/30) | 0.741 | 26 ms |
| R2 | Fine-tune the last 1 block, two-step matching | 1.00 | 0.867 (26/30) | 0.680 | 26 ms |
| R3 | Fine-tune the last 3 blocks, two-step matching | 1.00 | **0.900 (27/30)** | 0.753 | 27 ms |
| R4 | Fine-tune the last 6 blocks | not run yet (Colab) | | | |
| R5 | R4 plus augmentation | not run yet (Colab) | | | |
| R6 | Gender probe, gender-filter matching | 0.50 | 0.300 (9/30) | 0.741 | 26 ms |

IOAI reference on the same test set: baseline 0.77, best 0.90.

What the numbers say:

- **R0 reproduces the IOAI baseline** (0.767 against the published 0.77). This is the check that our data loading and scoring are right.
- **Fine-tuning the last layers helps:** 0.767 → 0.867 → 0.900 as 1 and then 3 blocks are trained. R3 is the champion: it ties R2 on validation and wins on gender accuracy.
- **Part of the gain is the method, not the training:** two-step matching on zero-shot embeddings already gets 1.00 on validation and 0.867 on test. Fine-tuning adds one more correct test query.
- **Gender from a single sign is hard:** about 75% at best, and the trained probe does not beat the zero-shot prompts (0.741 against 0.756). Fine-tuning for matching makes gender slightly worse, because the model learns to pull the two doors of a restroom together.
- **Test differences are small in absolute terms:** one test query is 0.033, so R2 and R3 differ by a single sign.
- **No sign of leakage:** no validation or test image is a copy of a training image, and none is closer than 0.93 cosine to one.

## The final pipeline (`ml/restroom/pipeline.py`, no training)

The task splits into two steps, and the answer is the partner of the query's own original, so no gender classifier is needed:

1. **Find the original the crop was cut from.** SIFT keypoints, a RANSAC affine fit, then pixel correlation (NCC) of the aligned images. Counting inliers alone gives 0.74 on the 164 training crops: unrelated stock icons share watermarks and simple shapes. The pixel check and a full affine transform raise it to **0.976**; some crops are stretched along one axis, which a similarity transform cannot align. The 4 remaining errors are label noise. In restroom 20 the crops were not cut from these originals, and restroom 60 looks like it has male and female swapped.
2. **Find that original's partner** with z-scored colour-histogram similarity mixed with zero-shot CLIP similarity, 0.3 and 0.7. The colour idea comes from the full-score writeup credited to Singapore. The weight was chosen on training episodes.
3. **Use one global assignment for both steps** instead of greedy picks (`scipy.optimize.linear_sum_assignment`). This uses the task's guarantee that every query comes from a different restroom.

| Approach | Training episodes (200 × 30 restrooms) | Step 1 | Step 2 given step 1 | Val | Test |
|---|---|---|---|---|---|
| IOAI baseline (CLIP, second most similar) | 0.574 | – | – | 0.80 | 0.767 |
| Colour histogram top 2 + SIFT (Singapore idea) | 0.735 | – | – | 1.00 | 0.833 |
| CLIP + CLIP, greedy (IOAI reference matching, zero-shot) | 0.641 | 0.79 | 0.84 | 1.00 | 0.867 |
| SIFT + CLIP, greedy | 0.808 | 0.975 | 0.84 | 1.00 | 1.000 |
| SIFT + CLIP, global | 0.939 | 0.975 | 0.98 | 1.00 | 1.000 |
| **SIFT + 30 % histogram + CLIP, global** (champion) | **0.960 ± 0.041** | 0.975 | **0.993** | **1.00** | **1.000** |

The champion was chosen on the training episodes, then validation. The 30 test queries are easier than the training episodes, and several approaches reach 1.000 on them, so only the episodes tell those approaches apart. Test scores were printed during development, but every change was made from error analysis on the training set. Numbers: `ml/results/restroom/pipeline.json`.

## The layer experiment (`ml/restroom/layers.py`, Kaggle Tesla T4)

The pipeline leaves one learned part, the step-2 similarity: how alike the two doors of one restroom look. That similarity is fine-tuned with the IOAI reference recipe: InfoNCE on male ↔ female originals, Adam at lr 1e-4, a cosine schedule, 50 epochs, batch 32, keeping the epoch with the lowest loss. **Only one thing changes: how many of the last layers are trained.**

- **CLIP ViT-B/32:** N of its 12 transformer blocks (7.1M parameters each), plus the final layer norm.
- **ResNet50 (ImageNet):** N of its 5 stages. Batch norm statistics stay frozen.

Evaluation is 5-fold cross-validation grouped by restroom, so every restroom is scored by a model that never saw it, with 3 seeds. Main metric: for each of the 164 held-out originals, is its partner the most similar of all 164 training originals? Validation and test are not used here.

| Backbone | N trained | Trainable params | Partner first, held-out vs all 164 | Same, among held-out only | Training restrooms | Gender (probe) |
|---|---|---|---|---|---|---|
| CLIP | 0 (zero-shot) | 0 | 0.780 | 0.915 | 0.797 | 0.741 |
| CLIP | 1 | 7.1M | 0.917 | 0.976 | 1.000 | 0.692 |
| CLIP | 2 | 14.2M | 0.943 | 0.974 | 1.000 | 0.728 |
| CLIP | 3 | 21.3M | 0.929 | 0.963 | 1.000 | 0.720 |
| CLIP | **4** | 28.4M | **0.965** | 0.974 | 1.000 | 0.711 |
| CLIP | 6 | 42.5M | 0.945 | 0.976 | 1.000 | 0.626 |
| CLIP | 8 | 56.7M | 0.937 | 0.976 | 1.000 | 0.608 |
| CLIP | 12 (all) | 85.1M | 0.910 | 0.953 | 1.000 | 0.600 |
| ResNet50 | 0 (frozen) | 0 | 0.878 | 0.939 | 0.886 | 0.616 |
| ResNet50 | 1 | 15.0M | 0.886 | 0.947 | 1.000 | 0.586 |
| ResNet50 | **2** | 22.1M | **0.913** | 0.957 | 1.000 | 0.613 |
| ResNet50 | 3 | 23.3M | 0.906 | 0.963 | 1.000 | 0.578 |
| ResNet50 | 4 | 23.5M | 0.906 | 0.953 | 1.000 | 0.581 |
| ResNet50 | 5 (all) | 23.5M | 0.900 | 0.957 | 1.000 | 0.572 |

Means over 3 seeds. The spread over seeds is at most 0.015. Files: `ml/results/restroom/layers/*.json` (one per backbone, N and seed) and `ml/results/restroom/layers.csv`.

What the numbers say:

- **Training a few layers helps a lot.** CLIP goes from 0.780 zero-shot to 0.917 with one trained block.
- **Training more layers stops helping and then hurts.** The best setting is 4 blocks (0.965). All 12 blocks score 0.910, with 85M parameters fitted on about 66 restrooms per fold. From N = 1 on, the model is perfect on the restrooms it trained on, so the extra capacity goes into memorising. This is overfitting, and it is what the course says to expect when a large model meets small data (Sup p24).
- **The transformer adapts better than the CNN.** ResNet50 starts higher frozen (0.878, its features keep more colour and texture), but fine-tuned it peaks at 0.913. That is below every CLIP setting with at least one trained block.
- **Fine-tuning for pairs removes gender information.** CLIP's gender accuracy falls from 0.741 to 0.600 as more blocks are trained. The model learns to pull the two doors of a restroom together, which is the opposite of separating male from female. This matters for the signage rules, which use gender: the app keeps the zero-shot model for gender.
- **The final task score does not move.** The full pipeline on held-out restrooms scores 0.95–0.965 for every setting, because SIFT and the global assignment already solve most of it. Fine-tuning improves the harder retrieval metric, not the end result. So the champion pipeline stays training-free.
- **Noise.** With 164 held-out originals, one original is 0.006, and a 95 % interval around 0.94 is about ±0.036. Clear differences: zero-shot against any trained setting, and 4 against 12 blocks. Settings 2, 3, 4, 6 and 8 form a plateau within noise of each other. The seed spread is small because the folds are fixed, so it measures training randomness only.

## What each frozen layer knows (`ml/restroom/layer_probe.py`, no training)

Features read out after every block or stage on the 82 training restrooms: CLIP's class token after each block, and ResNet50's pooled features after each stage.

| Layer | Step 1: crop → own original | Step 2: original → partner | Gender (probe, grouped CV) |
|---|---|---|---|
| CLIP block 1 | 0.488 | 0.549 | 0.540 |
| CLIP block 4 | 0.750 | 0.884 | 0.604 |
| CLIP block 7 | 0.817 | **0.951** | 0.619 |
| CLIP block 10 | 0.762 | 0.951 | 0.601 |
| CLIP block 12 | 0.811 | 0.829 | **0.768** |
| CLIP final embedding (after projection) | 0.774 | 0.780 | 0.741 |
| ResNet50 stage 2 of 5 | 0.768 | 0.811 | 0.588 |
| ResNet50 stage 4 of 5 | 0.860 | 0.921 | 0.634 |
| ResNet50 stage 5 of 5 | 0.811 | 0.878 | 0.616 |

**The middle of the network knows the restroom; the end of the network knows the gender.** Gender is the information that pulls same-gender signs together and the two doors apart, so CLIP's final embedding is worse at pairing than its middle blocks. That is also why fine-tuning the last blocks helps pairing and hurts gender. All numbers: `ml/results/restroom/layer_probe.json`.

## Figures for the slides (`ml/results/restroom/figs/`)

- `approaches.png`: the approach ladder, from the IOAI baseline to the final pipeline.
- `layers_pair.png`: partner-found accuracy against trained blocks or stages, held-out against training restrooms.
- `layers_gender.png`: gender accuracy against trained blocks or stages.
- `layers_params.png`: the same accuracy against the share of parameters trained, CLIP and ResNet50 together.
- `layer_probe.png`: what each frozen layer knows.
- `failures.png`: three test queries the IOAI zero-shot baseline gets wrong (query, its own original, the baseline's pick, the correct partner). The baseline fails on 7 of 30; the final pipeline gets all 30 right. The cases are the first failures by query number; query 14 is skipped because its sign has offensive words on it. All 7 are in `ml/results/restroom/failures.json`.

They are drawn by `python ml/restroom/layers_report.py`, `python ml/restroom/layer_probe.py` and `python ml/restroom/failures.py`.

Study card for the defense: [ml/restroom/STUDY-CARD.md](../ml/restroom/STUDY-CARD.md).

## Evaluation rules

- Gender accuracy is measured with 5-fold cross-validation **grouped by restroom**, so the male and female signs of one restroom never sit on both sides of a split (Sup p10, Lab 6: no leakage).
- Runs are chosen on validation matching accuracy, with gender accuracy as the tie-break. Test is read once.
- With only 10 validation queries, one query is worth 0.10. Differences smaller than that on validation are noise, so treat close runs as tied.

## How it feeds the app

The signage rules (RULES.md, part 2) use the gender confidence and the similarity. Their thresholds were chosen from the distribution of these values on the training restrooms in task C-7.

**Resolved in C-7 (10 November):** per-sign gender is right only about 75% of the time, so the first signage rules (each sign ≥ 0.80 confident; the two predicted genders differ) failed on most real pairs. The rules now compare the two doors with each other, which reads 90% of real training restrooms the right way round, and the thresholds (gap 0.20 and 0.05, similarity 0.88) come from the training restrooms. Details and the measurements are in RULES.md part 2 and `ml/restroom/pair_separation.py`. Only training data was used; validation and test were not touched.

## Limits to state

- Very small data: 82 training restrooms, 10 validation and 30 test queries.
- Most icons come from stock photos; some carry watermarks. Unusual or local designs may be misread.
- Two classes only. Accessible and all-gender restrooms are not in the data.
- The model sees a cropped icon, not the door, its text or its location.
- The colour histogram works because both door photos of one restroom were taken in the same place. Our app compares sign designs, so this shortcut helps on the IOAI data but not on two signs a user uploads.
- The layer experiment uses the training restrooms only: about 66 for training and 16 held out per fold. ResNet50 uses CLIP's learning rate, which was not tuned for it.
- Two training restrooms (20 and 60) have labels that do not match their images. They are kept as they are.
