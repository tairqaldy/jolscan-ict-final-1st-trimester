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
| R7 | The two-step pipeline, no training (`pipeline.py`, below) | Does classical computer vision beat fine-tuning on this task? | Sup p10 (chosen on training and validation, test read once) |

R0, R1 and R6 need no training. R2 and R3 also ran on a laptop CPU in under 8 minutes each, and R4 in 15 minutes. R5 was cut (task C-4): the layer experiment below answers the number-of-layers question with far more evaluation data than one augmentation run could.

## Results (10 November 2026, Apple M5 CPU)

Real runs from `ml/results/restroom/runs/`. Matching accuracy on validation (10 queries) and test (30 queries); gender accuracy from 5-fold cross-validation grouped by restroom; latency is the median per image at batch size 1.

| Run | What changed | Validation | Test | Gender (CV) | Latency |
|---|---|---|---|---|---|
| R0 | Zero-shot ViT-B/16, IOAI baseline rule | 0.80 | 0.767 (23/30) | 0.774 | 55 ms |
| R1 | Zero-shot ViT-B/32 | 0.80 | 0.767 (23/30) | 0.741 | 26 ms |
| R2 | Fine-tune the last 1 block, two-step matching | 1.00 | 0.867 (26/30) | 0.680 | 26 ms |
| R3 | Fine-tune the last 3 blocks, two-step matching | 1.00 | **0.900 (27/30)** | 0.753 | 27 ms |
| R4 | Fine-tune the last 6 blocks, two-step matching | 1.00 | 1.000 (30/30) | 0.643 | 25 ms (M4) |
| R5 | R4 plus augmentation | cut (C-4) | | | |
| R6 | Gender probe, gender-filter matching | 0.50 | 0.300 (9/30) | 0.741 | 26 ms |
| R7 | Two-step pipeline: SIFT + pixel check, then colour + CLIP, global assignment | 1.00 | **1.000 (30/30)** | none (no gender model) | not measured |

IOAI reference on the same test set: baseline 0.77, best 0.90.

R4 ran later, on Nazar's laptop (Apple M4 CPU); its latency is not directly comparable with the other rows. The champion by the fixed rule stays **R3**: R2, R3 and R4 tie on validation at 1.00, and R3 has the highest gender accuracy. R4's 30/30 on test does not change the choice, because the rule never looks at test. As in the layer experiment, training more blocks helps matching and costs gender accuracy (R2 0.680, R3 0.753, R4 0.643).

### How sure are these numbers? (task C-20)

Exact 95 % intervals and paired tests from the stored predictions, written by `python ml/restroom/intervals.py` to `ml/results/restroom/intervals.json`. No method was re-run on test.

| Method | Test | 95 % interval | Validation | 95 % interval |
|---|---|---|---|---|
| R0, zero-shot CLIP ViT-B/16 (IOAI baseline reproduction) | 23/30 = 0.767 | 0.577–0.901 | 8/10 | 0.44–0.97 |
| R3, last 3 blocks fine-tuned (run-rule champion) | 27/30 = 0.900 | 0.735–0.979 | 10/10 | 0.69–1.00 |
| R4, last 6 blocks fine-tuned | 30/30 = 1.000 | 0.884–1.000 | 10/10 | 0.69–1.00 |
| R7, two-step pipeline, global assignment | 30/30 = 1.000 | 0.884–1.000 | 10/10 | 0.69–1.00 |

- **All methods answer the same 30 queries, so they are compared pairwise** on the queries where exactly one of them is right (exact McNemar test). The pipeline against R0: right on 7 queries R0 misses, wrong on 0 that R0 gets, p = 0.016. That gain over the IOAI baseline reproduction is unlikely to be luck.
- **The pipeline against R3:** 3 to 0, p = 0.25. On 30 queries the pipeline is **not provably better than R3**; three queries are too few to tell.
- **10/10 on validation still allows anything from about 0.69 to 1.0**, which is why validation alone could not separate R2, R3, R4 and the pipeline.

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

### Step by step (task C-23, `python ml/restroom/ablation_table.py`)

What each half of the method adds, read from `pipeline.json` (no new runs). Figure: `ml/results/restroom/figs/ablation_steps.png`.

**Step 1 alone**: own original found among all 164 training originals, 164 crops

| Scorer | Accuracy |
|---|---|
| SIFT + pixel check (chosen) | 0.976 |
| SIFT inlier count | 0.933 |
| colour histogram | 0.817 |
| CLIP similarity | 0.774 |

**Step 2 alone**: partner found when given the true own original, 200 training episodes of 30 restrooms

| Scorer | Greedy | Global assignment |
|---|---|---|
| 30 % histogram + CLIP (chosen) | 0.946 ± 0.044 | 0.993 ± 0.020 |
| CLIP similarity | 0.837 ± 0.071 | 0.980 ± 0.035 |
| colour histogram | 0.795 ± 0.078 | 0.940 ± 0.059 |

**End to end**

| Approach | Training episodes | Validation | Test |
|---|---|---|---|
| `ioai_baseline_clip`: IOAI baseline: second most similar original, CLIP ViT-B/32 zero-shot | 0.574 ± 0.086 | 0.80 | 0.767 |
| `singapore_hist_top2_sift`: colour histogram picks the restroom (top 2), SIFT rejects the own original | 0.735 ± 0.068 | 1.00 | 0.833 |
| `clip_clip_greedy`: two-step, CLIP for both steps, greedy (IOAI reference matching, zero-shot) | 0.641 ± 0.089 | 1.00 | 0.867 |
| `siftinl_clip_greedy`: step 1 SIFT inlier count, step 2 CLIP, greedy | 0.775 ± 0.082 | 1.00 | 1.000 |
| `sift_clip_greedy`: step 1 SIFT + pixel check, step 2 CLIP, greedy | 0.808 ± 0.074 | 1.00 | 1.000 |
| `sift_hist_greedy`: step 1 SIFT + pixel check, step 2 colour histogram, greedy | 0.779 ± 0.078 | 0.90 | 0.833 |
| `sift_combo_greedy`: step 1 SIFT + pixel check, step 2 30% histogram + CLIP, greedy | 0.917 ± 0.051 | 1.00 | 1.000 |
| `sift_clip_hungarian`: step 1 SIFT + pixel check, step 2 CLIP, global assignment | 0.939 ± 0.061 | 1.00 | 1.000 |
| `sift_hist_hungarian`: step 1 SIFT + pixel check, step 2 colour histogram, global assignment | 0.900 ± 0.069 | 1.00 | 1.000 |
| `sift_combo_hungarian` **(champion)**: step 1 SIFT + pixel check, step 2 30% histogram + CLIP, global assignment | 0.960 ± 0.041 | 1.00 | 1.000 |

SIFT with a pixel check is why step 1 works: CLIP alone confuses unrelated icons with similar shapes (0.774 against 0.976), and counting SIFT inliers alone is fooled by shared stock watermarks (0.933). Colour helps CLIP in step 2 because the two doors of one restroom were photographed in the same place, with the same wall and light.

### One query at a time (task C-21, `ml/restroom/pipeline_per_query.py`)

The 30/30 uses a **global assignment**: every query gets a different own original and every own original a different partner. That relies on a fact of the IOAI benchmark, that the queries come from different restrooms and the gallery holds exactly their pairs, so each answer depends on the other queries. The greedy variant also uses them (it skips partners already given out). A real door sign comes alone, and the API answers one query at a time, so the truly per-query variant (step 1 argmax, step 2 argmax) was scored too:

| Variant | Training episodes (200 × 30 restrooms) | Validation |
|---|---|---|
| Global assignment (`sift_combo_hungarian`, the 30/30) | 0.960 ± 0.041 | 1.00 |
| Greedy, query order (`sift_combo_greedy`) | 0.917 ± 0.051 | 1.00 |
| **One query at a time** (`sift_combo_per_query`, what the API serves after C-8) | **0.928 ± 0.040** | 1.00 |
| One query at a time, CLIP for both steps | 0.675 ± 0.076 | 1.00 |

The per-query variant loses about 3 points on training episodes against the global assignment and is a little better than the greedy one. Its test score was read once, after the numbers above were written: **30/30** (interval and paired tests in `intervals.json`: the same as the global assignment, 0.884–1.000). The 30/30 in the tables is labelled 'global assignment over the 30 test queries'; the method the app serves is the per-query one.

### In the app's setting (task C-22, `ml/restroom/app_setting.py`)

In the app the query is a whole door sign that is not in the gallery, so step 1 finds no own original and only step 2 matters. Built from the 82 **training** restrooms (500 episodes per size, seed 42, one query each, so the table shows the share of the 500 queries answered right): the query is one door sign, the gallery is its partner plus both signs of K − 1 other restrooms.

| Rule | K = 6 (gallery 11, like the app's 12 real samples; chance 0.091) | K = 30 (gallery 59; chance 0.017) |
|---|---|---|
| Gender filter: most similar of the opposite predicted gender (the API before C-8, R6's rule) | 0.594 | 0.560 |
| CLIP similarity alone | 0.934 | 0.840 |
| Colour histogram alone | 0.930 | 0.828 |
| **0.3 z(histogram) + 0.7 z(CLIP), the API since C-8** | 0.976 | 0.950 |

The Match page uses the last rule (since C-8) and may quote **0.976 on 6 training restrooms**. The old gender filter loses about 40 points: one wrong gender, on the query or the partner, breaks the match. These are training restrooms, whose designs the step-2 weight was chosen on, so the number is optimistic for new designs; the 12/12 on the app's real validation signs (C-8) is the out-of-sample check, on only 12 signs.

### Where it fails (task C-25, `ml/restroom/hard_restrooms.py`)

On the 200 training episodes, 62 of 82 restrooms never fail. The six that fail most, with the cause seen by eye (figure: `ml/results/restroom/figs/hard_restrooms.png`; all 82 in `ml/results/restroom/hard_restrooms.json`):

| Restroom | Fails | Failing step | Cause |
|---|---|---|---|
| 60 | 80/80 = 100% | step 1 | Label error in the data: the male crop reads XY but the male-folder original reads XX; the two originals sit in each other's folders, so step 1 finds the crop's true original and the label calls it wrong |
| 20 | 45/69 = 65% | step 1 | Data mismatch: the crops (standing figures, legs crossed) were not cut from these originals (jumping 'exit' figures), so step 1 cannot find an own original |
| 1 | 24/80 = 30% | step 2 | The two doors share no colour (black against magenta), so the 30 % histogram pulls the partner towards other black or pink signs |
| 7 | 19/65 = 29% | step 2 | The two doors are in different styles (a black line figure against a pink box with 'WOMEN'), so neither colour nor CLIP sees them as one set |
| 30 | 16/75 = 21% | step 2 | Different colours for the two doors (teal against pink) and different animal heads: step 2 has little to go on |
| 6 | 8/67 = 12% | step 1 | The two originals are near copies (the same figure; only the pigtails and the arrow differ), so the pixel check sometimes picks the other door as the crop's own original |

The two worst are errors in the data, not in the method: restroom 60's originals are in each other's gender folders, and restroom 20's crops were not cut from its originals. They pull the training-episode mean down by about two points. The real weaknesses are step 2 on doors that share no colour or style, and step 1 when the two doors of a restroom are near copies.

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

- `runs_matching.png`: validation and test matching accuracy for every R run and the two-step pipeline, with IOAI's published 0.77 and 0.90 as dashed reference lines (their numbers, not our runs).
- `gender_heads.png`: gender accuracy, grouped 5-fold CV: zero-shot prompts against logistic regression, a linear SVM and 5 nearest neighbours on frozen embeddings.
- `failures_r3.png`: R3's test misses (queries 25 and 30 shown; query 14 left off for the same reason as above).

They are drawn by `python ml/restroom/layers_report.py`, `python ml/restroom/layer_probe.py`, `python ml/restroom/failures.py` and `python ml/restroom/plots.py`.

Study card for the defense: [ml/restroom/STUDY-CARD.md](../ml/restroom/STUDY-CARD.md).

## Evaluation rules

- Gender accuracy is measured with 5-fold cross-validation **grouped by restroom**, so the male and female signs of one restroom never sit on both sides of a split (Sup p10, Lab 6: no leakage).
- Runs are chosen on validation matching accuracy, with gender accuracy as the tie-break. Test is read once.
- With only 10 validation queries, one query is worth 0.10. Differences smaller than that on validation are noise, so treat close runs as tied.

### Two choices, two rules (task C-12)

- **The fine-tuning runs (R0–R6) keep their rule.** The champion is the run with the highest validation accuracy, then the highest gender accuracy: **R3**. That rule was fixed before the runs and is not changed because of any test number.
- **The matching method is chosen separately: the two-step pipeline, row R7.** It was chosen on 200 training episodes of 30 restrooms (0.960 ± 0.041 with the global assignment; 0.917 ± 0.051 for the greedy variant that scores one query at a time) and then on validation (10/10, tied with R2–R4). Its test score, 30/30, was read once, after the choice. Under the run rule R7 cannot be champion: it has no gender model, so its gender accuracy is empty, and the tie-break goes to R3. Giving it a gender number from another model would mix two models in one row.
- **What the app serves: R7, one query at a time (task C-8).** Until C-8, `/restroom/match` took the most similar sign of the opposite predicted gender (0.47 on test, `gender_filter_zeroshot` in R1). Now `api/restroom_pipeline.py` runs the two-step pipeline per query (`sift_combo_per_query`, 0.929 ± 0.040 on training episodes), so the export writes `served: "R7"`. Checked through the live endpoint: 10/10 on validation, and 12/12 on the web app's twelve real sample signs, where the query is a whole sign that is not in the gallery. The own-original threshold (aligned correlation ≥ 0.95) was chosen on the training crops only.
- 30/30 is strong but small: one test query is 0.033, and the 95% interval for 30/30 runs from about 0.88 to 1.0.

## How it feeds the app

**Live demo on the IOAI data:** `python ml/restroom/demo.py` opens a local Gradio page where you pick a query crop from the validation or test set and the pipeline finds its pair step by step. It runs the same code as `pipeline.py` and reproduces its stored answers (10/10 validation, 30/30 test). On the website, the **IOAI pairs** page (`/app/restrooms/ioai`) shows the same step-by-step result for every validation and test query, from answers stored by `ml/restroom/export_pairs.py` with the IOAI images (CC-BY-4.0, resized). The web app's Compare and Match pages still use drawn sample icons until C-13 and C-8.

`ml/restroom/export_results.py` writes `web/data/restroom-experiments.json` for the model page: the run rows R0–R4, R6 and R7 (R5 cut), the champion by the run rule (R3), `served` (null for now, see above), a `pipeline` block with every approach from `pipeline.py` (validation, test, training-episode mean and spread), and a `layers` table with one row per backbone and number of trained blocks or stages from `layers.csv`. The table shows the rows today; the pipeline card and the layer table on the page are task W-25 (Tair).

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
