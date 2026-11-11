# Model card: Qarau restroom sign service

Task C-30. The restroom twin of the pothole model card (M-41). Every number below names the committed file it comes from; `ml/results/restroom/` is shortened to `results/`.

## Model details

The service behind `POST /restroom/compare` and `POST /restroom/match` (`api/restroom.py`, `api/restroom_pipeline.py`). It has no trained weights of its own: everything is pretrained or classical.

| Component | What it is | Where it is set |
|---|---|---|
| Image encoder | CLIP ViT-B/32 with OpenAI's weights, through `open_clip_torch` 4.2.1 (QuickGELU forced, as OpenAI trained it) | `api/restroom.py` `ARCH = "ViT-B-32"` |
| Gender of one sign | Zero-shot: cosine to the mean of 5 text prompts per gender ("a restroom sign for men", …), CLIP's logit scale 100 | `api/restroom.py` `PROMPTS` |
| Match, step 1 | Is the query a crop of one gallery image? SIFT (1500 features, ratio 0.75), affine RANSAC (5 px), pixel correlation after alignment; own original if the correlation is at least 0.95 | `api/restroom_pipeline.py` (`OWN_T`, chosen on the training crops) |
| Match, step 2 | The partner: 0.3 × z(HSV colour-histogram intersection, bins 16/8/8) + 0.7 × z(CLIP cosine), over the gallery or the query plus the gallery | `api/restroom_pipeline.py` `W_HIST`; `results/pipeline.json` `histogram_weight` |
| Image size | Every image resized to a long side of 512 px before SIFT and histograms | `api/restroom_pipeline.py` `LONG_SIDE` |
| Limits of a request | Up to 60 gallery images; JPEG, PNG or WebP, 10 MB and 40 megapixels per file | `api/restroom.py` `MAX_GALLERY`, `api/imaging.py` |

No fine-tuned checkpoint is served: `RESTROOM_WEIGHTS` and `RESTROOM_PROBE` are empty by default. The fine-tuning runs (R2–R4, the layer sweep) are experiments, not the served model. `/restroom/compare` returns each sign's gender and confidence and the similarity `(cos + 1) / 2`. The signage verdict is computed by the web app (`docs/RULES.md` part 2). `/restroom/match` returns the ranked gallery, `bestMatchId` from the two steps above, and `ownId` from step 1.

Licences: CLIP's weights come from the [openai/CLIP](https://github.com/openai/CLIP/blob/main/LICENSE) repository, MIT License. [open_clip](https://github.com/mlfoundations/open_clip/blob/main/LICENSE) carries the MIT permission text (GitHub lists it as "Other" because of its copyright header). OpenCV and scikit-learn are used as libraries.

## Intended use

To help a facility manager check that a pair of restroom door signs is easy to read: Compare says whether a visitor can tell the two doors apart, and Match finds the other door of a sign among a set of signs. For a class demonstration (ICT1103) on public icon data.

## Out of scope

- Anything about people. The images are icons on doors, and the service never looks at, counts or classifies people.
- Accessible, family and all-gender restrooms. There is no class for them; the model forces such a sign into male or female.
- Legal or compliance decisions about signage. The verdict is a hint for a person to review.
- Photos of real buildings taken on site. There is no such test set yet (C-32).

## Training data

Nothing in the served model was trained by us. The choices made on data used the IOAI 2025 Individual Contest task "Restroom Icon Matching", by the IOAI 2025 committee, CC-BY-4.0. 82 training restrooms × 4 images (328), validation 10 queries / 20 originals, test 30 queries / 60 originals (`data/README.md`, restroom card; `ml/restroom/get_data.py` checks the counts). Choices made on the **training** set only: the step-2 histogram weight 0.3 (100 training episodes, `results/pipeline.json` `histogram_weight_scan`), the own-original threshold 0.95, and the signage thresholds (`results/pair_separation.json`).

## Evaluation protocol

- Matching: top-1 accuracy, correct matches / queries, exactly as the IOAI scoring script computes it.
- Selection on 200 training episodes of 30 restrooms, then validation. The test answers were read once per method, after it was fixed.
- Intervals: exact (Clopper-Pearson) 95 %. Paired comparisons: exact McNemar test on the queries where exactly one method is right (`ml/restroom/intervals.py`).
- Gender: 5-fold cross-validation grouped by restroom, so the four images of a restroom never sit on both sides of a split.
- The app's setting: one whole door sign, its partner and K − 1 other restrooms, built from the training restrooms (`ml/restroom/app_setting.py`).

## Results

| What | Number | Source |
|---|---|---|
| IOAI baseline reproduced, zero-shot CLIP ViT-B/16 (R0) | test 23/30 = 0.767 (95 % 0.577–0.901) | `results/experiments.csv`, `results/intervals.json` |
| Pipeline, global assignment (R7, the headline) | val 10/10, test 30/30 (95 % 0.884–1.000) | `results/pipeline.json` (`test.sift_combo_hungarian`), `results/intervals.json` |
| Pipeline one query at a time (what the API serves) | 0.929 ± 0.040 on training episodes, val 10/10, test 30/30 | `results/pipeline_per_query.json` |
| Pipeline against R0 / against R3 (27/30), paired | 7 to 0, p = 0.016 / 3 to 0, p = 0.25 (not separable) | `results/intervals.json` `paired_test` |
| Step 1 alone, 164 training crops | SIFT + pixel check 0.976, CLIP alone 0.774 | `results/pipeline.json` `step1_full_train` |
| Through the live API | val 10/10; 12/12 on the web app's real sample signs | `docs/ML-EXPERIMENT-RESTROOM.md` ('Two choices, two rules'), `api/README.md` |
| The app's setting, 6 / 30 restrooms (training) | 0.976 / 0.950; the old gender filter 0.594 / 0.560 | `results/app_setting.json` |
| Gender of one sign, zero-shot prompts / logistic-regression probe | 0.756 / 0.741 | `results/runs/R1.json` (`gender`) |
| Signage: both doors read right, alone / compared with each other | 0.573 / 0.902 of 82 real restrooms | `results/pair_separation.json` (`zero_shot.orig`) |
| Latency, 1 query + 20 gallery images | about 0.4 s on a laptop CPU (Apple M4) | `api/README.md` |

## Limits

- **The 30/30 headline is transductive.** The global assignment uses the fact that the gallery holds exactly the queries' pairs, which a real building does not give. One query at a time the pipeline scores 0.929 on training episodes, against 0.960. It still gets 30/30 on test (`results/pipeline_per_query.json`).
- **Few queries.** 30 test queries: one query is 0.033, and 30/30 still allows 0.884.
- **Step 1 relies on the benchmark too.** An IOAI query is a crop of a gallery image. In the app a query is usually a separate sign, so only step 2 runs. Its 0.976 is measured on training restrooms and is optimistic for new designs.
- **The data is narrow.** Mostly stock-photo icons, some with watermarks. No glare, angle or text next to the sign, as in a photo taken on site.
- **Gender from one sign is right about three times in four,** so the signage verdict compares the two doors instead of judging each alone.
- **Two classes only.**

## Ethical considerations

The data contains no people, faces or licence plates. A wrong verdict could call two unrelated signs a pair, so next to the verdict (pair or not a pair) the app shows which rule passed or failed and the numbers behind it. The model knows only male and female signs; it is not meant to judge whether a building is inclusive. Uploaded photos stay on the laptop with the local provider; the cloud provider is opt-in (`docs/ARCHITECTURE.md`).

## How to reproduce

From the repository root, with `ml/restroom/requirements.txt`:

```bash
python ml/restroom/get_data.py
python ml/restroom/pipeline.py            # results/pipeline.json
python ml/restroom/pipeline_per_query.py  # results/pipeline_per_query.json
python ml/restroom/intervals.py           # results/intervals.json
python ml/restroom/app_setting.py         # results/app_setting.json
cd api && uvicorn main:app --port 8000    # the service; first restroom request downloads CLIP
```

## Contact

Nazar (restroom lane), GitHub `Akanov-Kanta`. API code reviewed by Alizhan. Repository: https://github.com/tairqaldy/qarau-ict-final-1st-trimester.
