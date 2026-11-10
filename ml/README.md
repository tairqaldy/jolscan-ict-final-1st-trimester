# ml/

Training and evaluation for the experiment in [docs/ML-EXPERIMENT.md](../docs/ML-EXPERIMENT.md).

The scripts were checked against the Ultralytics and MLflow documentation but have not been run yet. Whoever runs them first (task M-1) fixes what breaks and commits the fix.

## Run in Google Colab (or a Kaggle notebook with GPU)

1. Runtime → Change runtime type → T4 GPU.
2. Clone the repository and install the pinned versions:

   ```bash
   git clone https://github.com/tairqaldy/qarau-ict-final-1st-trimester.git jolscan && cd jolscan && pip install -q -r ml/requirements.txt
   ```

3. Get the dataset: download the exported version zip from the shared Drive folder and unzip it. Nobody needs the Roboflow API key.
4. Smoke test with one epoch:

   ```bash
   python ml/train.py --run E0 --data /content/jolscan/pothole/data.yaml --dataset-version v1 --smoke
   ```

5. The real run:

   ```bash
   python ml/train.py --run E0 --data /content/jolscan/pothole/data.yaml --dataset-version v1
   ```

6. Colab storage disappears when the session ends. After every run:
   - Commit `ml/results/runs/<run>.json` and push. This file is the result.
   - Copy `runs/<run>/weights/best.pt` to the shared Drive as `jolscan-<run>.pt`.
   - Optionally copy `mlflow.db` and `mlruns/` to Drive, to show the MLflow UI later.

## Why a JSON file per run

MLflow 3 keeps its tracking data in a local SQLite file, `mlflow.db`. Three people training in three Colab accounts get three separate files that cannot be merged by copying. So `train.py` also writes one small JSON file per run, and the results table is built from those. MLflow is still used for tracking inside each session, as in Lab 8.

## After the runs

```bash
python ml/export_results.py
```

This writes `ml/results/experiments.csv` (for the slides) and `web/data/experiments.json` (for the model page, with `"isMock": false`). Commit both. Run it again after E8.

## Files

- `train.py`: one experiment per call.
- `export_results.py`: per-run JSON files to the CSV and the web app's JSON, and picks the champion with the selection rule.
- `results/runs/`: one JSON per run. Committed.
- `results/latency.json`: batch-1 latency per run, measured in task S-15.
- `results/`: exported table and plots for the slides.
