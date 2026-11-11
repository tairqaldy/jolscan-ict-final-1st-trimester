# Study card: restroom model (Nazar)

Short spoken answers for the defense (task C-9, issue #19). Questions 1–5 are the ones in [docs/PRESENTATION.md](../../docs/PRESENTATION.md#study-cards); 6–11 are the questions the instructor is likely to add about our own method, including the two the issue adds (6, the pipeline, and 11, the signage rules). When quoting 30/30, say that it is 30 queries and that one query is 0.033. Every number comes from a file in `ml/results/restroom/`. Practise saying each answer in under 40 seconds, without notes.

## 1. What are CLIP and a Vision Transformer?

**CLIP** is a model from OpenAI with two encoders, one for images and one for text. It was trained on about 400 million image–caption pairs so that an image and its caption get similar vectors. Because of that, it can compare any two images, or an image and a sentence, without training on our task.

**A Vision Transformer (ViT)** cuts the image into square patches and treats each patch like a word in a sentence. ViT-B/32 uses 32×32-pixel patches, so a 224×224 image becomes 49 patches plus one summary token, and 12 transformer blocks let every patch look at every other patch (self-attention). CLIP's image encoder in our runs is a ViT-B/32.

## 2. What is zero-shot, and how did the zero-shot baseline compare with IOAI's 0.77?

Zero-shot means using the pretrained model as it is, with no training on our data. The IOAI baseline embeds every image with zero-shot CLIP and, for each crop, takes the second most similar gallery image (the most similar is assumed to be the crop's own original).

Our reproduction, run R0 (zero-shot CLIP ViT-B/16), scored **0.767 on test (23 of 30)**, the same as IOAI's published 0.77. That told us our data loading and scoring were right before we trusted any other run.

## 3. What changed between R2, R3 and R4, and what does training more layers risk on 82 restrooms?

R2, R3 and R4 fine-tune the last 1, 3 and 6 transformer blocks of ViT-B/32 with the IOAI reference recipe; everything else stays the same. On test: R2 0.867 (26/30), R3 0.900 (27/30), R4 1.000 (30/30). All three get 10/10 on validation, so the fixed selection rule picks R3 on the gender tie-break (0.753 against 0.680 and 0.643); test is never used to choose.

Thirty test queries cannot separate these runs well, so the main experiment (the layer sweep, C-11) trained the last N blocks for N = 0 to 12 and measured on held-out restrooms with 5-fold cross-validation and 3 seeds:

| Blocks trained | 0 | 1 | 2 | 4 | 6 | 12 |
|---|---|---|---|---|---|---|
| Partner found first among 164 originals | 0.780 | 0.917 | 0.943 | **0.965** | 0.945 | 0.910 |

The risk is **overfitting**. Each block has about 7 million parameters and we have only 164 training pairs. With 1 or more blocks trained, accuracy on the training restrooms is already 1.000, so extra blocks do not learn anything new; they start memorising those 82 restrooms and get worse on new ones. Training all 12 blocks also erases what CLIP knew about gender: gender accuracy drops from 0.741 to 0.600.

## 4. Why is gender accuracy cross-validated grouped by restroom, and what would go wrong without the grouping?

Each restroom gives four images: a male and a female original and a crop of each. The crop is part of its original, and the two signs of one restroom share colours, fonts and style. If the images of one restroom were split between the training and the test folds, the model could recognise the restroom instead of the gender, and the score would be too optimistic. That is data leakage.

Grouped 5-fold cross-validation (scikit-learn `GroupKFold` with the restroom as the group) keeps all four images of a restroom in the same fold, so every test fold contains only restrooms the model has never seen.

## 5. With 10 validation queries, how sure are you that one run beats another?

Not sure at all. One validation query is worth 0.1. R0 and R1 score 8/10 and R2 to R4 all score 10/10, and a 10/10 result still has a 95% confidence interval from about 0.69 to 1.0. The 30 test queries are better but still coarse: one query is 0.033, so R2 against R3 is a difference of one query, and even R4's 30/30 has an interval from about 0.88 to 1.0.

That is why the layer experiment measures on all 164 training originals with cross-validation: one original is worth 0.006, and the 95% interval is about ±0.036. Even then, only two differences are clearly real: any training against none (0.780 to 0.917 or more), and 4 blocks against 12 (0.965 against 0.910). The settings from 2 to 8 blocks are a plateau within noise.

## 6. How does your final pipeline work, and why not just a neural network?

It has two steps and needs no training:

1. **Find the crop's own original.** SIFT finds keypoints in the crop and in every gallery image, RANSAC fits the geometric transform between them, and a pixel check (normalised cross-correlation after alignment) confirms that the crop really is a piece of that image. This is exact copy detection, which classical computer vision does better than CLIP: 0.976 on the 164 training crops against 0.774 for CLIP.
2. **Find the partner of the opposite gender.** Among the remaining originals, the most similar one in style: 0.3 × colour-histogram similarity plus 0.7 × CLIP similarity.

Both steps use a global assignment (the Hungarian algorithm), so two queries cannot take the same image. Result: 0.960 on 200 training episodes, 10/10 on validation and **30/30 on test**, against IOAI's best 0.90.

## 7. What is top-1 accuracy here?

The share of queries whose first answer is the correct gallery image, exactly as the IOAI scoring script computes it: correct matches divided by the number of queries. There is no partial credit for a correct image in second place.

## 8. How did you fine-tune, and what is the loss?

Contrastive training (InfoNCE): in each batch of 32 pairs, the model pulls the two signs of one restroom together and pushes the other 31 apart. The recipe follows the IOAI reference solution: Adam, learning rate 1e-4, cosine schedule, temperature 0.07, 50 epochs, and the epoch with the lowest loss is kept. The first 12 − N blocks are frozen, so their outputs are computed once and cached, and only the last N blocks learn.

## 9. What does the layer probe show?

We took the frozen CLIP features after every block, without any training, and measured two things: how well they match the two signs of a restroom (cosine similarity) and how well they predict gender (logistic regression, grouped cross-validation). Pair matching is best after blocks 7–10 (0.951), and gender becomes readable only at the very last block (0.768). This explains question 3: fine-tuning the last blocks helps matching but overwrites the place where gender lives.

## 10. Why did CLIP do better than ResNet50?

Without training, ResNet50 starts higher (0.878 against 0.780), but after fine-tuning it stops at 0.913 (2 of 5 stages trained), while CLIP reaches 0.965. A plausible reason: CLIP learned from images with text, so its features already describe style and meaning, and a few blocks are enough to adapt them. ResNet50 learned ImageNet object classes, which say little about the style of a sign.

## 11. Why do the signage rules compare the two doors instead of judging each sign alone?

Because one sign alone is often ambiguous: an abstract pair of legs or a top hat reads as "male" only next to its partner. On the 82 real training restrooms, all correctly signed, judging each sign alone read both doors the right way round in only 57% of restrooms, and the old "genders differ" rule wrongly called 39% of them confusing. Comparing the two doors (the one with the higher probability of "male" is the men's door) gets 90% right. That is why RULES.md part 2 compares the pair (`ml/results/restroom/pair_separation.json`).

## The failure cases (slide figures)

[`figs/failures_r3.png`](../results/restroom/figs/failures_r3.png): R3 misses 3 of 30 test queries (14, 25 and 30); query 14 is left off the figure because its sign has offensive words on it.

[`figs/failures.png`](../results/restroom/figs/failures.png): the zero-shot baseline fails on 7 of 30 test queries ([`failures.json`](../results/restroom/failures.json)). In 6 of them it picks a sign from another restroom; in the other one it picks the crop's own original. CLIP compares what the images show in general, so a sign of a similar kind from another restroom can score higher than the real partner. Our pipeline first finds the crop's own original with SIFT, then the partner that shares its colours and style, and gets all 30 right. Query 14 is left off the slide because its sign has offensive words on it.
