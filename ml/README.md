# ml/

Training and evaluation for the experiment in [docs/ML-EXPERIMENT.md](../docs/ML-EXPERIMENT.md).

## Source inventory for slides (S-26)

`python ml/slide_numbers.py` writes `ml/results/SLIDE-NUMBERS.md` from the currently available committed results. `python ml/slide_numbers.py --check` prints the inventory without writing. Missing files and values are marked `not available yet`, and mock or placeholder runs are not presented as real measurements. Each row names its source. Re-run after every export and compare with the actual final deck; the inventory is not proof that every number on every slide has been audited.

## Size bands (D-11 / D-29)

Run the following on the frozen training labels only, using scikit-learn 1.6.1. Write to a temporary folder first so the existing published artifacts are not overwritten before comparison:

```bash
python ml/size_bands.py --labels /path/to/potholes_yolo_v1/labels/train --out /tmp/size-bands
```

Compare the resulting `pothole_area_clusters.json` (including image and box counts, group counts and thresholds to six decimals) against `ml/results/pothole_area_clusters.json`. The plot is in `figs/pothole_area_clusters.png`. If numbers differ, stop and report the difference; do not silently change the rules. The original results were supplied and have not yet been recomputed against the frozen training labels by this script. Box areas are fractions of the image, not physical sizes.

## M-1 one-epoch smoke test

Open [colab_runner.ipynb](colab_runner.ipynb) in Colab and run its cells from top to bottom with a GPU runtime. It checks out the pinned M-1 trainer commit, installs `ml/requirements.txt`, finds the already-uploaded `potholes_yolo_v1.zip` in mounted Drive, and verifies the archive manifest before running:

```bash
python ml/train.py --run E0 --data /content/data/data.yaml --dataset-version potholes_yolo_v1 --smoke
```

The validation-only smoke run completed on a Tesla T4 for one epoch using trainer commit `3004fdfe8f59e7a261743ec01c390e40d811d791`. The supplied run was reported as MLflow `E0-smoke`, ID `de59363e3bcd42389b608c2321690ca6`, status `FINISHED`. Its actual files are [E0-smoke.json](results/runs/E0-smoke.json) and [E0-smoke-results.csv](results/runs/E0-smoke-results.csv).

The CSV records the training epoch and the validation pass performed during training. The JSON's `metrics` are from a separate post-training validation pass (including the app's confidence-0.40 operating point); these values are not expected to match the CSV's training-loop metrics.

**M-1 is complete:** Tair accepted the validation-only smoke criterion in [issue #50](https://github.com/tairqaldy/qarau-ict-final-1st-trimester/issues/50#issuecomment-6789955660), and the implementation was merged in [PR #349](https://github.com/tairqaldy/qarau-ict-final-1st-trimester/pull/349). Do not add a fabricated test metric. The one-epoch smoke check does not complete the full E0 baseline; that is M-3.

The notebook downloads a ZIP containing only the actual JSON and CSV for collection. Review those files before committing them. Never commit the dataset ZIP, model weights, tokens, or temporary Colab files.

## Full experiments

### After every full run (M-2)

In Colab, the final cell of `colab_runner.ipynb` is opt-in: set `RUN_TO_SAVE` (for example `E1`) and `SHARED_WEIGHTS_DIR` to the existing team Drive `weights/` folder after completing that full run in the checked-out `REPO`. It requires that run's JSON, training CSV and `runs/<run>/weights/best.pt`; it rejects smoke results and refuses to overwrite an existing Drive file. It copies the best weights as `jolscan-<run>.pt` and downloads the JSON and CSV. The notebook's default M-1 run is only a smoke test, so the handoff is skipped until explicitly configured for a full run. Check the shared folder is mounted and writable by every runner; this has not been verified from the local test.

On your laptop, review the downloaded files, place `<run>.json` and `<run>-results.csv` under `ml/results/runs/`, create a branch such as `model/<task>-<run>` and open one PR per run. Rebase on current main, run the required checks, and merge only after review and green checks. Never commit weights or the dataset.

Do not run full E0 as part of M-1. After the smoke path passes and the team authorizes the experiment, full runs use the same frozen split, seed and budget documented in [docs/ML-EXPERIMENT.md](../docs/ML-EXPERIMENT.md). For example:

```bash
python ml/train.py --run E0 --data /content/data/data.yaml --dataset-version potholes_yolo_v1
```

Only full experiment runs evaluate the test split, at the end of the run. Colab storage disappears when the session ends; commit each actual run JSON and its CSV. Copy `runs/<run>/weights/best.pt` to the shared Drive as `jolscan-<run>.pt`. MLflow remains per Colab account and is supplementary to the committed result files.

## Why a JSON file per run

MLflow 3 keeps its tracking data in a local SQLite file, `mlflow.db`. Three people training in three Colab accounts get three separate files that cannot be merged by copying. So `train.py` also writes one small JSON file and a training-curve CSV per run, and the results table is built from the JSON files. MLflow is still used for tracking inside each session, as in Lab 8.

## After the runs

```bash
python ml/export_results.py
```

This writes `ml/results/experiments.csv` (for the slides) and `web/data/experiments.json` (for the model page, with `"isMock": false`). Commit both. Run it again after E8.

## Files

- `train.py`: one experiment per call; `--smoke` is validation-only.
- `colab_runner.ipynb`: M-1 Colab setup and smoke-run evidence collection.
- `export_results.py`: per-run JSON files to the CSV and the web app's JSON, and picks the champion with the selection rule.
- `results/runs/`: one JSON per run. Committed.
- `results/latency.json`: batch-1 latency per run, measured in task S-15.
- `results/`: exported table and plots for the slides.

## Deck plots (task M-13)

```bash
python ml/plots.py
```

It regenerates `ml/results/fig_runs_map50_recall.png` (test mAP50 and recall at 0.40 per run, champion in the accent colour, bars from zero) and `ml/results/fig_curves.png` (train and validation box loss for E0, E2 and E5, whichever exist) from the committed CSV files only.

Two figures come from Ultralytics' own evaluation of the champion on the test split, the one `train.py` already runs, so test is not read again:

- `fig_champion_pr_curve.png`: the precision-recall curve (Ultralytics' `BoxPR_curve.png`).
- `fig_champion_confusion_at_040.png`: the confusion matrix at confidence 0.40, the app's counting threshold (Ultralytics' `confusion_matrix.png` from the `conf=0.40` pass). The figures in the repository are for the current champion, **E1** (YOLO26s, chosen on validation: its mAP50 0.824 is within 0.01 of the best, E4's 0.828, and its validation recall at 0.40, 0.738, is the highest of the tied runs): 178 potholes found, 58 missed, 34 false alarms on 236 test boxes, which gives recall 178/236 = 0.754 and precision 178/212 = 0.840, the numbers in `E1.json`. For comparison, E4 found 174, missed 62 and raised 25 false alarms (recall 0.737, precision 0.874); E0 found 160, missed 76 and raised 23 (recall 0.678, precision 0.874). E4 has the higher test mAP50 (0.831 against 0.8155), but test is never used to choose.

The app's exact operating point (task M-19) comes from a separate script, run once for the champion:

```bash
python ml/operating_point.py --weights api/weights/jolscan-e1.pt --dataset data/raw/potholes_yolo_v1
```

It writes `ml/results/operating_point.json`: true positives, false alarms and misses at confidence 0.40 and IoU 0.5, with precision, recall, F1 and the counts per photo. `ml/test_operating_point.py` tests the matching without a model.

Do not use the confusion matrix from the default pass: Ultralytics evaluates at confidence 0.001 there, so it counts thousands of low-confidence boxes as false alarms that the app never shows. After a new champion (for example E8), copy its two figures from the run's `runs/detect/val-*` folders of the test passes and rerun `ml/plots.py`.

