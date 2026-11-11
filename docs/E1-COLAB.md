# M-4 / E1 Colab preparation ? do not train yet

Owner: Amina / `omodotori`, [issue #53](https://github.com/tairqaldy/qarau-ict-final-1st-trimester/issues/53), branch `model/m4-e1`. E0 belongs to Tair. M-4 remains incomplete. This document prepares a future full E1 run; none has been executed.

## Compatibility findings and stop conditions

- E0's JSON records trainer `6c1a525e551eb6766178a9dd378cf443ca76e780`, preserved by annotated tag `e0-trainer` (peel it with `git rev-parse e0-trainer^{}`). Current `ml/train.py` and `ml/requirements.txt` have no diff against that trainer. Main also contains M-0 policy commit `9d183a50c8b75e8b99db983d3c6063ad634b974f`.
- Offline AST inspection of the actual effective configuration confirms E1 and E0 differ only in `weights` (`yolo26n.pt` ? `yolo26s.pt`) and the descriptive `changed` label. Explicit BASE parameters equal E0.json: epochs 40, image size 640, batch 16, seed 42, SGD, lr0 0.01, pretrained true. No freeze, optimizer or augmentation override is added for E1. The experiment defines small as wider at the same depth; confirm the installed 8.4.208 model scales/model summaries before training rather than assuming parameter counts from the label.
- Use frozen `potholes_yolo_v1`: 465/100/100 train/val/test, 1198/305/236 objects, manifest seed 42. No resplitting, relabeling, resizing export, new augmentation policy or dataset rebuilding for this run.
- E0 ran on Apple M5/MPS with Torch 2.15.0 and Ultralytics 8.4.208. Colab CUDA/T4 is a backend/hardware difference, not a controlled constant. Matching the explicit BASE dictionary alone does not establish equivalent training. Torch is not pinned by `ml/requirements.txt`; pandas is also unpinned. Ultralytics 8.4.208 and MLflow 3.18.0 are pinned.
- Need Tair's actual command, `runs/E0/args.yaml`, `pip freeze` (including Python, torch/torchvision, Ultralytics, MLflow and albumentations), any local source edits/environment overrides, dataset archive SHA-256 or equivalent label/image provenance, checkpoint identity, and confirmation that all 40 epochs completed without resume or an OOM batch change. E0.json is evidence for the recorded explicit parameters and reported versions, not the full resolved defaults. Ask for full args including augmentation, workers, deterministic/AMP, optimizer schedule, nbs/accumulation, early stopping, cache and evaluation settings.
- Obtain Tair's explicit compatibility decision on Colab CUDA versus E0 MPS and dependency/default differences. Issue #53 requests the same commit; a later main commit is not literally E0's commit even when training source is identical. Show the source diff and agree on a common run revision or record the difference. Do not silently select the old smoke commit or rerun E0.
- M-0 and M-1 are merged. M-2 (#51) is still unchecked: confirm the Drive destination/access and output-saving routine below before starting. No configuration compatibility is yet confirmed.

## Why not run the current notebook as-is?

`ml/colab_runner.ipynb` is specifically M-1 smoke. It pins `model/m1-smoke` at `3004fdfe8f59e7a261743ec01c390e40d811d791`, invokes E0 with `--smoke`, and collects E0-smoke artifacts. Do not run its training/collection cells for E1 and do not edit or overwrite its historical evidence. Use a separate blank Colab notebook and a fresh `/content/jolscan-e1` clone. Keep all tokens with write access out of Colab.

## Proposed Colab cells (preparation only until compatibility is confirmed)

Select a GPU runtime. The following commit is a reviewed source candidate with identical trainer/requirements to E0 and merged M-0; Tair must approve it before the training cell is enabled. Use an explicit path to the exact shared archive, not an arbitrary first search result.

```python
from pathlib import Path
import subprocess, sys, json, hashlib, zipfile, shutil, os
from google.colab import drive

APPROVED_REV = '10d295da6c5ec7ebbad6c7c0ecaf32590580d8ae'  # candidate, not yet approved
CONFIGURATION_COMPATIBILITY_CONFIRMED = False  # leave false until Tair confirms
REPO = Path('/content/jolscan-e1')
assert not REPO.exists(), 'Use a fresh runtime; preserve earlier outputs.'
subprocess.run(['git', 'clone', 'https://github.com/tairqaldy/qarau-ict-final-1st-trimester.git', str(REPO)], check=True)
subprocess.run(['git', '-C', str(REPO), 'checkout', '--detach', APPROVED_REV], check=True)
assert subprocess.check_output(['git', '-C', str(REPO), 'rev-parse', 'HEAD'], text=True).strip() == APPROVED_REV
subprocess.run([sys.executable, '-m', 'pip', 'install', '-r', str(REPO/'ml/requirements.txt')], check=True)
# Do not guess a Torch pin: compare the installed environment with Tair's evidence first.
subprocess.run([sys.executable, '-m', 'pip', 'freeze'], check=True)
import torch, ultralytics, yaml
assert torch.cuda.is_available(), 'Enable GPU; stop if unavailable.'
assert ultralytics.__version__ == '8.4.208'
print('Python:', sys.version, 'Torch:', torch.__version__, 'GPU:', torch.cuda.get_device_name(0))
drive.mount('/content/drive')
ARCHIVE = Path('/content/drive/MyDrive/REPLACE_WITH_SHARED_FOLDER/potholes_yolo_v1.zip')
WEIGHTS_DIR = Path('/content/drive/MyDrive/REPLACE_WITH_SHARED_FOLDER/weights')
EXPECTED_ARCHIVE_SHA256 = 'REPLACE_WITH_HASH_CONFIRMED_BY_TAIR'
assert ARCHIVE.is_file()
assert hashlib.file_digest(ARCHIVE.open('rb'), 'sha256').hexdigest() == EXPECTED_ARCHIVE_SHA256
DATA_ROOT = Path('/content/potholes-e1')
assert not DATA_ROOT.exists()
with zipfile.ZipFile(ARCHIVE) as z:
    assert z.testzip() is None
    for member in z.infolist():
        p = Path(member.filename)
        assert not p.is_absolute() and '..' not in p.parts
    z.extractall(DATA_ROOT)
DATA = DATA_ROOT/'data.yaml'
manifest = json.loads((DATA_ROOT/'split_manifest.json').read_text())
recorded_manifest = json.loads((REPO/'data/exports/potholes_yolo_v1/split_manifest.json').read_text())
assert manifest == recorded_manifest
assert manifest['image_counts'] == {'train':465, 'val':100, 'test':100}
assert manifest['object_counts'] == {'train':1198, 'val':305, 'test':236}
config = yaml.safe_load(DATA.read_text())
assert config == yaml.safe_load((REPO/'data/exports/potholes_yolo_v1/data.yaml').read_text())
for split, count in manifest['image_counts'].items():
    assert len(list((DATA_ROOT/'images'/split).glob('*'))) == count
for item in manifest['images']:
    image = DATA_ROOT/'images'/item['split']/Path(item['source_image']).name
    assert hashlib.file_digest(image.open('rb'), 'sha256').hexdigest() == item['image_sha256']
# Archive hash confirmation covers the frozen labels too; manifest hashes cover images only.
# Save environment evidence outside the repository without changing data or reading model predictions.
PREP = Path('/content/e1-preflight'); PREP.mkdir(exist_ok=False)
(PREP/'pip-freeze.txt').write_text(subprocess.check_output([sys.executable, '-m', 'pip', 'freeze'], text=True))
(PREP/'source-revision.txt').write_text(APPROVED_REV+'\n')
(PREP/'environment.txt').write_text(f'{sys.version}\ntorch={torch.__version__}\nultralytics={ultralytics.__version__}\nGPU={torch.cuda.get_device_name(0)}\n')
```

Compare this preflight evidence and the two installed model scales against Tair's resolved E0 arguments/environment before changing the compatibility flag. Do not train either model for inspection.

## Exact proposed training command ? DO NOT EXECUTE YET

From `/content/jolscan-e1`:

```bash
python ml/train.py --run E1 --data /content/potholes-e1/data.yaml --dataset-version potholes_yolo_v1 --device 0
```

No `--smoke`, no `--batch` override, no E0 invocation. The effective budget is 40 epochs, batch 16, image size 640, seed 42, SGD, lr0 0.01, pretrained true. Preserve default augmentations after compatibility confirmation. If CUDA OOM occurs, stop and report it; the issue permits batch 8 after OOM, but do not change it without checking comparability against E0 and recording the deviation.

Use this guarded cell only after compatibility is confirmed and a start is separately authorized:

```python
assert CONFIGURATION_COMPATIBILITY_CONFIRMED, 'STOP: Tair must confirm compatibility first.'
assert not (REPO/'runs/E1').exists(), 'Trainer uses exist_ok=True; do not overwrite a prior attempt.'
assert not (REPO/'ml/results/runs/E1.json').exists()
assert not (REPO/'ml/results/runs/E1-results.csv').exists()
assert not (WEIGHTS_DIR/'jolscan-e1.pt').exists(), 'Do not overwrite existing E1 weights.'
os.chdir(REPO)
os.environ['MLFLOW_TRACKING_URI'] = f'sqlite:///{REPO / "mlflow.db"}'
subprocess.run([sys.executable, 'ml/train.py', '--run', 'E1', '--data', str(DATA),
                '--dataset-version', 'potholes_yolo_v1', '--device', '0'], check=True)
```

Record UTC start time, account, approved source commit and GPU when a future run is authorized. The existing full-run trainer evaluates validation and test after training; do not add extra test evaluations or use test metrics to choose settings. Current code performs both a default-confidence and confidence-0.40 evaluation per split; clarify that evaluation protocol with Tair rather than claiming a single inference pass over test.

## After the future run: save and verify, without rerunning evaluation

```python
from google.colab import files
result_path = REPO/'ml/results/runs/E1.json'
csv_path = REPO/'ml/results/runs/E1-results.csv'
result = json.loads(result_path.read_text())
assert result['run'] == 'E1' and result['smoke'] is False
assert result['weights'] == 'yolo26s.pt'
assert result['dataset_version'] == 'potholes_yolo_v1'
assert result['commit'] == APPROVED_REV
assert result['params'] == {'epochs':40,'imgsz':640,'batch':16,'seed':42,
                            'optimizer':'SGD','lr0':0.01,'pretrained':True}
assert result['evaluation_splits'] == ['val','test'] and result['test_evaluated'] is True
assert len(__import__('csv').DictReader(csv_path.open()).fieldnames) > 0
assert len(list(__import__('csv').DictReader(csv_path.open()))) == 40
WEIGHTS_DIR.mkdir(parents=True, exist_ok=True)
target = WEIGHTS_DIR/'jolscan-e1.pt'
assert not target.exists()
shutil.copy2(REPO/'runs/E1/weights/best.pt', target)
assert hashlib.file_digest(target.open('rb'),'sha256').hexdigest() == hashlib.file_digest((REPO/'runs/E1/weights/best.pt').open('rb'),'sha256').hexdigest()
# Preserve resolved defaults and the environment privately with the weights for audit.
AUDIT = WEIGHTS_DIR/('E1-audit-'+APPROVED_REV[:12])
assert not AUDIT.exists()
shutil.copytree(PREP, AUDIT)
shutil.copy2(REPO/'runs/E1/args.yaml', AUDIT/'args.yaml')
shutil.copy2(csv_path, AUDIT/'E1-results.csv')
shutil.copy2(result_path, AUDIT/'E1.json')
print('Saved:', target, 'size:', target.stat().st_size)
print('Validation mAP50:',result['metrics']['val_map50'],
      'recall at 0.40:',result['metrics']['val_recall_at_rules_conf'])
files.download(str(result_path))
files.download(str(csv_path))
```

The trainer already copies the actual epoch CSV from its save directory. Inspect the actual E1 JSON/CSV locally, copy only these results into the feature branch, and review `git status`. Never commit weights, datasets, MLflow database, credentials, or the private args/environment bundle. Verify the MLflow E1 run is FINISHED in the explicit tracking database; report its real run ID. Keep E0-smoke files unchanged. Complete M-4 only after real results merge, weights exist in Drive and the team gets validation metrics, account, GPU and commit. No test values are used to select the run or champion.
