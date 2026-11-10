# ML experiment 2: restroom sign matching

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

## Evaluation rules

- Gender accuracy is measured with 5-fold cross-validation **grouped by restroom**, so the male and female signs of one restroom never sit on both sides of a split (Sup p10, Lab 6: no leakage).
- Runs are chosen on validation matching accuracy, with gender accuracy as the tie-break. Test is read once.
- With only 10 validation queries, one query is worth 0.10. Differences smaller than that on validation are noise, so treat close runs as tied.

## How it feeds the app

The signage rules (RULES.md, part 2) use the gender confidence and the similarity. Their thresholds (S1 0.80, S3 0.75) are checked against the distribution of these values on the validation set in task C-7.

**Known problem for C-7:** with per-sign gender right only about 75% of the time, S1 (confidence ≥ 0.80) and S2 (the two predicted genders differ) will fail on many real, correct pairs; in one live test both signs of a real restroom were read as male. A better S2 compares the two signs with each other instead of classifying each one alone: the sign with the higher "male" score is taken as male, and the rule fails only when the two scores are too close to tell apart. Decide this in C-7 before the real model is connected to the demo.

## Limits to state

- Very small data: 82 training restrooms, 10 validation and 30 test queries.
- Most icons come from stock photos; some carry watermarks. Unusual or local designs may be misread.
- Two classes only. Accessible and all-gender restrooms are not in the data.
- The model sees a cropped icon, not the door, its text or its location.
