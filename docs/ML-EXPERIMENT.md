# ML experiment

This is the graded core of Assignment #2. The web app is the advantage on top. If time runs short, protect this file's deliverables first.

## Research question

On a public pothole dataset, which model choices matter most for a small real-time detector: model width, transfer learning, frozen layers, optimizer, augmentation, or an extra detection scale for small objects?

We declare **Option A**: open-source dataset, modify the model and its training choices, compare each change against a fixed baseline (A2 p1). One variable changes per run. Split, seed, software versions and training budget stay the same (Lab 8 Mission 4: "Keep the same split and seed").

## How this fits CLO 5

CLO 5 speaks of classification and clustering and asks for a justified quality metric.

- **Classification:** detection is classification per box (pothole or background) plus localisation. After matching predicted and labelled boxes by IoU, every box is a true positive, a false positive or a false negative, so precision, recall and F1 are the classification metrics from the supervised-learning lecture (Sup p27). mAP averages precision over recall levels (Lec8 p42).
- **Clustering:** k-means on the sizes of the labelled boxes gives the small, medium and large bands that the rules engine uses (task D-11). It is unsupervised learning applied to our own data.

## Dataset

- Source: a pothole object-detection dataset of 665 images with Pascal VOC boxes, quality-checked in D-2 and D-4 ([data/README.md](../data/README.md)). **Open item D-1:** record its original name, author and licence.
- The syllabus lists allowed sources: "Only open, licence-clean sources: data.egov.kz, stat.gov.kz, Kaggle Datasets, UCI Machine Learning Repository, OpenML" (Syl p.9). Roboflow Universe is not on that list. D-1 therefore also looks for the same dataset on Kaggle and cites that as the source. If there is none, the licence goes on the Data slide and the team asks the instructor before the defense.
- One class: `pothole`.
- Duplicates first, split second. If copies of one photo land in train and in test, the test score is inflated. Task D-4 checked exact and perceptual-hash duplicates **before** the split and found none (Sup p10, Lab 6: no test data in training).
- Frozen version: **`potholes_yolo_v1`**, a Colab export (accepted on 10 November in place of a Roboflow version). 465 / 100 / 100 train / validation / test images (1,198 / 305 / 236 boxes), shuffled once with seed 42. The D-4 check found no exact or near-duplicate images, so a random split by image does not leak copies across splits. No resize and no offline augmentation. The zip is in the shared Drive; the split manifest with a SHA-256 per image is in `data/exports/potholes_yolo_v1/`. Every run passes `--dataset-version potholes_yolo_v1`.
- The EDK Global Potholes dataset on Hugging Face is **not** used for training: it has no bounding boxes and its labels were produced by a model. Details in [research/datasets.md](research/datasets.md).
- The YOLO26 Small model trained inside Roboflow on 3 November is **not** used anywhere: not in the results, not in the app. It was not produced by this experiment.

## Selection rule (fixed before E1, task M-0)

- **Primary metric: validation mAP50.** Where exactly a pothole ends is ambiguous even for the person labelling it, so the stricter 0.5–0.95 IoU sweep mostly measures annotation noise. mAP50-95 is reported as a secondary metric.
- Runs within 0.01 mAP50 of the best count as tied. Ties are broken by **validation recall at confidence 0.40**, the threshold the app counts at. A missed pothole never reaches a repair crew, while a false alarm costs a reviewer a few seconds, so recall matters more than precision (Sup p27).
- Differences below 0.02 on the test split are not claimed as real.
- The test split is not used for any choice. `ml/export_results.py` applies this rule from validation numbers only.

## Runs

Fixed for every run unless the row says otherwise: `epochs=40`, `imgsz=640`, `batch=16`, `seed=42`, `optimizer=SGD`, `lr0=0.01`, default Ultralytics augmentation, COCO-pretrained weights, `ultralytics==8.4.208`.

| Run | What changes | Setting | Question it answers | Course link |
|---|---|---|---|---|
| E0 | Baseline | `yolo26n.pt` | Reference point | Sup p11, Lec9 p40 |
| E1 | Model width | `yolo26s.pt`: twice the channels, same depth | Does a bigger network pay for its latency? | A2 p1, Lec8 p37 |
| E2 | No transfer learning | `yolo26n.yaml`, random weights | How much does pretraining give on small data? | Lec8 p38 |
| E3 | Frozen backbone | `freeze=11` (backbone layers 0–10) | Is training only the last layers enough? | Lec8 p38 |
| E4 | Optimizer | `AdamW`, `lr0=0.001`, `warmup_bias_lr=0` | Does the optimizer change the result at equal budget? | A2 p1, Sup p14 |
| E5 | Standard augmentations off | `mosaic, mixup, fliplr, hsv_h, hsv_s, hsv_v, translate, scale = 0` | Does augmentation reduce overfitting here? | Lec8 p38, Sup p26 |
| E7 | Architecture: extra detection scale | `yolo26n-p2.yaml`, initialised from `yolo26n.pt` where layer shapes match | Does a layer change aimed at small objects help? | A2 p1, Lec8 p40 |
| E8 | Best combination | Chosen with the selection rule from E1–E7 | Final model, the one the app serves | Lec9 p38 |
| E6 | Input resolution (optional) | `imgsz=960` | Do small, distant potholes need more pixels? | Lec8 p5 |

Run order: E0, then E1, E2, E3, E4, E5 and E7 in parallel across accounts, then E8. E0–E5 and E7 are the minimum. E6 only if there is GPU time left, and only because the dataset version is exported without resizing. If YOLO26 fails to load, switch every run to YOLO11 (`yolo11n.pt`, `yolo11s.pt`, `yolo11n.yaml`, `yolo11n-p2.yaml`) and note it.

Spread the runs over several accounts (Nazar, Amina, Alizhan on Colab, and Kaggle notebooks as a fourth runner) with the same repository commit, dataset zip and seed.

### What an examiner may ask about the comparison

- **E1** changes width, not the number of layers. E7 is the run that changes layers.
- **E2** trains from random weights for only 40 epochs, which makes transfer learning look even better than it would with a long schedule. Say so.
- **E3**: `freeze=11` freezes the whole backbone. The neck and head still train.
- **E4** changes the optimizer and its learning rate together, on purpose: each optimizer runs at its documented default rate (SGD 0.01, AdamW 0.001). Comparing them at one shared rate would handicap one of them.
- **E5**: Colab also has the albumentations package, which applies blur, CLAHE and grayscale to about 1% of images. E5 is "standard augmentations off", not "zero augmentation".
- **E7** adds layers, and is initialised from the pretrained nano weights wherever shapes match, so it is compared with E0 on equal footing.
- If a run needs `--batch 8` because the GPU runs out of memory, the trainer accumulates gradients to the same nominal batch of 64, so the comparison stays fair. Record it.

## What to report

For each run, on the **test** split, read once at the end (Sup p10, Lec8 p42):

- mAP50 (primary), mAP50-95, precision and recall. Protocol: Ultralytics validation, IoU 0.5 for mAP50. Summary precision and recall are taken at the confidence that maximises F1.
- Precision and recall at confidence 0.40, the app's operating point, with the true-positive, false-positive and false-negative counts for the final model (task M-19).
- Weight file size in MB.
- Latency, measured separately so that runs are comparable (task S-15): batch size 1, 100 test images, median and 95th percentile, all models in one Colab session, and the final model also on the presenting laptop's CPU (Lec9 p34 lists inference latency as a tracked metric).
- Training curves for E0, E2 and E5 side by side: train loss against validation loss, to show overfitting or its absence (Sup p24).

## Tracking

Every run is an MLflow run (Lec9 p34–36, Lab 8): parameters, metrics, plots and weights as artifacts, the dataset version as a tag. Ultralytics has a built-in MLflow callback and `ml/train.py` adds the test metrics.

MLflow 3 stores tracking data in a local SQLite file, which cannot be merged across Colab accounts. So `ml/train.py` also writes `ml/results/runs/<run>.json`, and that committed file is the source of truth. `ml/export_results.py` builds `ml/results/experiments.csv` and `web/data/experiments.json` (with `"isMock": false`) from those files. The model page and the slides show that table and nothing else.

## Limits to state

- One test split from one dataset, so small differences may be noise (Lab 8: limitation of a single test set).
- Each run's best checkpoint and the E8 choice are both selected on validation, so validation numbers are optimistic. Test is the only unbiased number.
- 40 epochs is a small budget. A longer schedule could change the ranking, most of all for E2.
- The dataset is not from Kazakhstan. Performance on local roads, snow and night scenes is unknown.

## Stretch, only after E8 and the deck exist

- Seeds: repeat E0 and E8 with seeds 0 and 1 and report the spread.
- External test set: photograph 30–50 potholes around campus and Astana, screen them for faces and plates (D-12), annotate them, and evaluate E8 on them. These photos are never used for training or selection. This measures how the model transfers to local roads.
