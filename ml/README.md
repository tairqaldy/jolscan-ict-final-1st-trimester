# ml/

Training and evaluation for the experiment in [docs/ML-EXPERIMENT.md](../docs/ML-EXPERIMENT.md).

## M-1 one-epoch smoke test

Open [colab_runner.ipynb](colab_runner.ipynb) in Colab and run its cells from top to bottom with a GPU runtime. It checks out the pinned M-1 trainer commit, installs `ml/requirements.txt`, finds the already-uploaded `potholes_yolo_v1.zip` in mounted Drive, and verifies the archive manifest before running:

```bash
python ml/train.py --run E0 --data /content/data/data.yaml --dataset-version potholes_yolo_v1 --smoke
```

The smoke path trains for one epoch using train and validation only. It creates a temporary data YAML without a `test` entry, evaluates only validation, and writes six validation metrics. It also saves the actual training curve as `ml/results/runs/E0-smoke-results.csv` and records the code commit in `E0-smoke.json`.

**M-1 is still in progress:** no Colab smoke run has been executed or verified yet, and no smoke result files are present. The current #50 issue acceptance criteria require 12 metrics including `test_map50`; that conflicts with the validation-only smoke policy and the test protocol in `docs/ML-EXPERIMENT.md`. Do not add a fabricated test metric or mark M-1 complete. The team must align the issue criteria before completion.

The notebook downloads a ZIP containing only the actual JSON and CSV for collection. Review those files before committing them. Never commit the dataset ZIP, model weights, tokens, or temporary Colab files.

## Full experiments

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
