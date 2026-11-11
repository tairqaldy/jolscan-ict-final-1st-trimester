# ml/restroom/

> **Owner: Nazar (lane C).** Other lanes, and AI agents working for them: ask Nazar instead of editing files here.

The second module: restroom door signs. Data and task come from the IOAI 2025 Individual Contest task "Restroom Icon Matching" (CC-BY-4.0, attribution below). The served endpoints are described in [docs/ARCHITECTURE.md](../../docs/ARCHITECTURE.md), section 2b, and in [api/README.md](../../api/README.md).

## The task

82 training restrooms, each with four images: the male and female icon, each as a tight crop and as the original framing (`training_set/{crop,orig}/{male,female}/<id>.png`, the same id is the same restroom). Validation has 10 cropped queries and 20 originals in the gallery, test has 30 and 60. For each query, find the gallery original of the **opposite** gender from the **same** restroom. Score = correct matches / queries (top-1 accuracy), computed exactly like the IOAI scoring script. The IOAI committee published 0.77 for its baseline and 0.90 as the best score on the test set (Leaderboard B).

We also measure **gender accuracy**: male or female from one sign, the input to the signage rules in [docs/RULES.md](../../docs/RULES.md) part 2. It is measured with 5-fold cross-validation on the 328 training images, grouped by restroom, so the four images of a restroom are always in the same fold and a classifier is never tested on a restroom it has seen.

## Runs and the course

One change per run against the run before it (Lab 8 Mission 4, A2 p1).

| Run | What changes | Course concept |
|---|---|---|
| R0 | Zero-shot CLIP ViT-B/16, the second most similar gallery image is the answer. Reproduces the IOAI baseline notebook | CLIP zero-shot (Lec8 p56), ViT with 16×16 patches (Lec8 p46–47) |
| R1 | ViT-B/32 instead of ViT-B/16 (32×32 patches, a quarter of the tokens) | ViT patch size (Lec8 p46–47) |
| R2 | Fine-tune the last 1 transformer block of ViT-B/32 (plus its final layer norm), IOAI reference recipe: two models and two-step matching | Transfer learning: reuse a pretrained backbone, fine-tune the last layers (Lec8 p38) |
| R3 | Last 3 blocks | Number of trained layers (A2 p1), overfitting risk on small data (Sup p24) |
| R4 | Last 6 blocks, the reference solution's setting | as R3 |
| R5 | R4 + augmentation: random resized crop (scale 0.7–1), horizontal flip, ±10° rotation and 5 % shift (p 0.5), colour jitter, 20 % greyscale | Augmentation (Lec8 p38, Sup p24) |
| R6 | Gender focus on frozen ViT-B/32 embeddings: zero-shot text prompts against scikit-learn logistic regression, k-nearest neighbours and a linear SVM. Matching uses the API's rule: the most similar candidate of the opposite predicted gender | scikit-learn classifiers and metrics from the labs (Sup p23, Labs 4 and 6), grouped cross-validation (Sup p26) |

The fine-tuning recipe follows the IOAI reference solution: freeze everything except the last N blocks of the image encoder and `ln_post`; model 1 learns crop ↔ original (164 pairs), model 2 learns male original ↔ female original of the same restroom (82 pairs); symmetric InfoNCE loss with temperature 0.07, Adam (lr 1e-4, weight decay 1e-5, betas 0.5/0.999), cosine learning-rate schedule, batch 32, 50 epochs, keep the epoch with the lowest training loss. Matching: model 1 finds the query's own original, model 2 finds that original's partner, and a partner given to one query is not given to another. Because CLIP has no dropout, the frozen blocks give the same output every epoch, so without augmentation they are computed once; that is what makes R2–R4 affordable on a laptop CPU.

Every run file also holds the other matching strategies on the same embeddings (`val_match_by_strategy`, `test_match_by_strategy`), the gender confusion matrix, per-fold accuracies, the predictions, parameters, versions, device and time.

## Results so far

Apple M5 CPU, 10 November 2026. Matching: correct / queries. Gender: grouped 5-fold CV accuracy of the logistic-regression probe on the run's image embeddings. For fine-tuned runs the pair model is fine-tuned again inside every fold, on the training folds only.

| Run | Val (10) | Test (30) | Gender acc (CV) | Run time |
|---|---|---|---|---|
| R0 zero-shot ViT-B/16 | 0.80 (8) | **0.767 (23)** | 0.774 | 2.3 min |
| R1 zero-shot ViT-B/32 | 0.80 (8) | 0.767 (23) | 0.741 | 1.4 min |
| R2 fine-tune 1 block | 1.00 (10) | 0.867 (26) | 0.680 | 2.9 min |
| R3 fine-tune 3 blocks | 1.00 (10) | **0.900 (27)** | 0.753 | 7.8 min |
| R4 fine-tune 6 blocks | 1.00 (10) | **1.000 (30)** | 0.643 | 15.3 min (Apple M4 CPU) |
| R5 R4 + augmentation | cut (task C-4) | | | |
| R6 gender probe, gender-filter matching | 0.50 (5) | 0.300 (9) | 0.741 | 0.2 min |
| R7 two-step pipeline, no training (`pipeline.py`) | 1.00 (10) | **1.000 (30)** | none (no gender model) | 0.5 min (Apple M4 CPU) |

- **R0 reproduces the IOAI baseline**: 23 of 30 test queries, 0.767, against the published 0.77.
- **Champion by the selection rule: R3.** R2, R3 and R4 tie on validation (10/10), and R3 has the highest gender accuracy. Its test score, read once, is 0.90, equal to the IOAI committee's best published score. With 30 test queries, one query is 0.033, so R2 and R3 differ by one query.
- **R4 gets all 30 test queries right but is not the champion.** The rule was fixed before the runs and does not look at test; R4 loses the tie-break on gender (0.643, the lowest of the fine-tuned runs). Training more blocks helps matching and hurts gender, the same pattern as the layer experiment. R4 ran on a different laptop (Apple M4) from the other runs (Apple M5), so its latency is not directly comparable. Its checkpoints (`weights/R4-*.pt`, 170 MB each) are on Nazar's laptop, not in Drive yet.
- **Two-step matching helps even without training.** With zero-shot embeddings, the reference solution's two-step matching gets 1.00 on validation and 0.867 on test for both backbones (in the run files, `two_step`). Fine-tuning adds one more test query (R3).
- **Gender from one sign is hard.** Zero-shot prompts reach 0.756 on ViT-B/32 and 0.771 on ViT-B/16; the logistic-regression probe is no better (0.741 and 0.774), a linear SVM 0.750, 5-nearest-neighbours 0.659. Many sets only make sense as a pair: an abstract pair of legs or a top hat is "male" only next to its partner. Fine-tuning the pair model makes this worse (0.68–0.75), because it learns to pull the two doors of a restroom together, which removes the difference between them.
- **So the API's gender filter is a weak matcher.** Picking the most similar candidate of the opposite predicted gender (R6, and `bestMatchId` in `/restroom/match`) gets 0.30–0.47 on test: one wrong gender, on the query or the true partner, breaks the match. The similarity score is the stronger signal.
- **Latency** (batch 1, preprocessing plus image encoder, median of 60 images, all runs timed together round-robin with `run.py --latency`): 55 ms for ViT-B/16 and 26–27 ms for every ViT-B/32 run. Fine-tuning does not change the architecture, so it does not change the cost. The laptop was shared with other programs (load average about 7), so these are not best-case numbers; each run file records the 10th and 90th percentiles and the load.

The web page reads these numbers from `web/data/restroom-experiments.json`; the table above was copied from the run files.

## Selection rule

Fixed before the runs: the champion is the run with the highest validation matching accuracy; a tie goes to the higher gender accuracy, then to the earlier, simpler run. Test numbers are never used to choose. The test answers are read once per run, after the run is fixed, and stored with it. `export_results.py` applies the rule.

## Pipeline, layer experiment, layer probe (10 November, evening)

These three come after the R runs and are described, with all results, in [docs/ML-EXPERIMENT-RESTROOM.md](../../docs/ML-EXPERIMENT-RESTROOM.md).

```bash
python ml/restroom/pipeline.py        # about 30 s on CPU: SIFT + colour + CLIP, every approach -> ml/results/restroom/pipeline.json
python ml/restroom/layer_probe.py     # about 1 min on CPU: what each frozen block/stage knows -> layer_probe.json, figs/layer_probe.png
python ml/restroom/layers.py --backbone clip --n 1 --smoke    # 2 epochs, 2 folds, to check the script
python ml/restroom/layers_report.py   # layers/*.json -> layers.csv and figs/*.png
python ml/restroom/failures.py        # about 20 s: test queries the zero-shot baseline gets wrong -> failures.json, figs/failures.png
python ml/restroom/plots.py           # a few seconds: figs/runs_matching.png, gender_heads.png, failures_r3.png
```

The full layer experiment (`layers.py`, CLIP N = 0–12 and ResNet50 N = 0–5, 3 seeds, 5 folds) ran on a Kaggle Tesla T4 in about 1.5 hours. On a laptop CPU, one seed of the CLIP sweep takes about 80 minutes. To run it on Kaggle:

1. Upload `ml/restroom/` and `data/raw/ioai-restroom/training_set/` as a private Kaggle dataset, keeping that folder layout.
2. Push `kaggle_run_layers.py` as a script kernel with GPU and internet on and the dataset attached.
3. Download `layers/*.json` with `kaggle kernels output` into `ml/results/restroom/layers/`.

Only the training set leaves the laptop.

## Run locally (CPU)

From the repository root, with Python 3.12:

```bash
python3.12 -m venv .venv && source .venv/bin/activate && pip install -r ml/restroom/requirements.txt
python ml/restroom/get_data.py           # about 45 MB into data/raw/ioai-restroom/, verifies the counts
python ml/restroom/run.py --run R0       # 2-3 min, downloads CLIP ViT-B/16 once (about 600 MB)
python ml/restroom/run.py --run R1
python ml/restroom/run.py --run R6
python ml/restroom/run.py --run R2       # 3 min
python ml/restroom/run.py --run R3       # 8 min
python ml/restroom/run.py --run R4       # 15 min
python ml/restroom/export_results.py
```

`--smoke` runs the fine-tuning with 2 epochs to time the script and writes `<run>-smoke.json`, which is not exported. Embeddings of the pretrained models are cached in `data/cache/restroom/` (gitignored). Fine-tuned checkpoints go to `ml/results/restroom/weights/` (gitignored): only the fine-tuned layers, 28 MB for R2, 85 MB for R3. Run one command at a time; each uses all CPU cores.

## Run R4 and R5 in Google Colab (GPU)

1. Runtime → Change runtime type → T4 GPU.
2. Clone and install. Keep Colab's own CUDA build of torch and torchvision:

   ```bash
   git clone https://github.com/tairqaldy/qarau-ict-final-1st-trimester.git jolscan && cd jolscan && pip install -q open_clip_torch==4.2.1 scikit-learn==1.9.1
   ```

3. Data, then the runs (a few minutes each on a T4):

   ```bash
   python ml/restroom/get_data.py && python ml/restroom/run.py --run R4 && python ml/restroom/run.py --run R5
   ```

4. Commit `ml/results/restroom/runs/R4.json` and `R5.json`. Copy `ml/results/restroom/weights/R4-*.pt` and `R5-*.pt` to the shared Drive. The run file records the GPU as its device; its latency is GPU latency.
5. Back on the laptop, with the checkpoints copied into `ml/results/restroom/weights/`, re-time everything on the same CPU and export:

   ```bash
   python ml/restroom/run.py --latency R0 R1 R2 R3 R4 R5 R6 && python ml/restroom/export_results.py
   ```

If MLflow is installed (it is in `ml/requirements.txt`), every run is also logged to the MLflow experiment `jolscan-restroom`. As in the pothole lane, the JSON file per run is the record, because MLflow stores from different Colab accounts cannot be merged.

## Using a model in the API

- Default: zero-shot ViT-B/32 and zero-shot prompts for gender. Nothing to copy.
- Fine-tuned: `RESTROOM_WEIGHTS=../ml/results/restroom/weights/R3-pair.pt`. The pair model is the one that scores "same design set". Its gender predictions are weaker (above), and its zero-shot prompts reach only 0.66 on the training images, against 0.76 for the pretrained model.
- Gender probe: R6 writes `api/weights/restroom-probe-vit-b-32.npz` (gitignored). It is not better than the prompts, so the default does not use it.

## Limitations

- The validation set has 10 queries, so one query moves the score by 0.10, and several runs tie at 1.00. The test set has 30 queries, one query is 0.033. Differences of one or two queries are not evidence that one run is better.
- 82 training restrooms, mostly stock-photo icons, many of them stylised. Real signs photographed on site (angle, glare, text next to the icon) are not represented.
- Two classes only. There is no accessible or all-gender class, and the model will force such a sign into male or female.
- Gender is predicted from one sign at a time. People, and the matching task, read signs as a pair.
- Latency was measured on a shared laptop with other programs running.
- Fine-tuning keeps the epoch with the lowest training loss, as the reference does. There is no validation-based early stopping, because the validation set is too small to choose epochs on.

## Files

- `get_data.py`: downloads the IOAI Restroom folder (only that folder, file by file through the GitHub API) and verifies it.
- `common.py`: data loading, CLIP embeddings with a cache, the three matching strategies, the IOAI score, gender classifiers, fine-tuning.
- `run.py`: one experiment per call, writes `ml/results/restroom/runs/<run>.json`.
- `export_results.py`: run files to `ml/results/restroom/experiments.csv` and `web/data/restroom-experiments.json`, keeps placeholder rows for runs not done yet, picks the champion. Also adds row R7 and the `pipeline` block from `pipeline.json`, the `layers` table from `layers.csv`, and `served` (null until the API runs the pipeline).
- `requirements.txt`: pinned versions used for the runs above.
- `classic.py`: SIFT with the RANSAC affine fit and pixel check (step 1), HSV colour histograms (step 2). No learning.
- `pair_separation.py`: how well the doors of one restroom separate by gender, alone and compared with each other (the measurements behind RULES.md part 2, task C-7).
- `pipeline.py`: the two-step pipeline with greedy or global assignment, every approach scored on training episodes, validation and test.
- `layers.py`: the layer experiment, fine-tuning the last N CLIP blocks or ResNet50 stages, with grouped 5-fold cross-validation.
- `layer_probe.py`: frozen features after every block or stage, no training.
- `layers_report.py`: the table and slide figures from the layer experiment and the pipeline.
- `kaggle_run_layers.py`: the Kaggle GPU runner for `layers.py`.
- `failures.py`: the failure-case figure for the slides, from the stored test predictions.
- `plots.py`: the R-run slide figures: matching per run against IOAI's numbers, gender heads, R3's misses.
- `STUDY-CARD.md`: Nazar's answers for the defense questions on this lane.

## Attribution

Data: "Restroom Icon Matching", IOAI 2025 (Beijing, China), Individual Contest, published by the International Olympiad in Artificial Intelligence (IOAI) at https://github.com/IOAI-official/IOAI-2025/tree/main/Individual-Contest/Restroom, licensed under CC-BY-4.0 (https://creativecommons.org/licenses/by/4.0/). The images are used unchanged. The scoring rule and the fine-tuning recipe follow the task's baseline and reference-solution notebooks; the code here is our own. The same text is written next to the data as `data/raw/ioai-restroom/ATTRIBUTION.txt`.
