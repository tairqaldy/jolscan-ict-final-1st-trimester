# Model card: Qarau pothole detector

Draft for M-41 (#199); the weight file and the presenter's deployed instance have not been independently checked in this review.

## Model details

The configured default is `weights/jolscan-e1.pt` (`api/main.py`); `MODEL_WEIGHTS` can override it. E1 is the champion selected on validation by the committed export, not on test (`web/data/experiments.json`, `docs/ML-EXPERIMENT.md`). The run uses YOLO26s initialized from pretrained `yolo26s.pt`; 40 epochs, 640 input, seed 42, SGD, Ultralytics 8.4.208 and PyTorch 2.15.0 are recorded in [`results/runs/E1.json`](results/runs/E1.json). The trained file itself is not in git. **Its SHA-256 and the weights loaded on the presentation laptop are unverified**; S-21 must measure them. A configured filename does not prove which bytes ran.

## Intended use

Flag possible potholes in a road photo for a person to review; the web rules turn detections into a suggested priority (`../docs/RULES.md`).

## Out of scope

Autonomous repair or safety decisions, physical pothole measurements, assessment of people, or claiming tested performance on local night and snow roads. A bounding box covers image pixels, not a physical area (`../docs/ML-EXPERIMENT.md`, `../docs/RULES.md`).

## Training data

The frozen `potholes_yolo_v1` has 465 training, 100 validation and 100 test photographs, split by image with seed 42; it has one pothole class (`../data/README.md`, `../data/exports/potholes_yolo_v1/split_manifest.json`). The source lists ODbL/DbCL, but provenance and rights for individual watermarked photos remain unresolved (`../data/README.md`). The dataset licence is not a licence statement for model weights.

## Evaluation protocol

The champion is selected using validation mAP50, with validation recall at confidence 0.40 breaking ties within 0.01 (`../docs/ML-EXPERIMENT.md`). Test is reported after selection. The independent operating-point calculation uses confidence 0.40 and IoU 0.50, matching predicted and labelled boxes one-to-one (`results/operating_point.json`).

## Results

On the test split E1 records mAP50 **0.8155** and mAP50–95 **0.5475** (`results/runs/E1.json`). At the separate operating point, 176 true positives, 30 false positives and 60 false negatives give precision **0.8544**, recall **0.7458** and F1 **0.7964** on 100 images with 236 labelled boxes (`results/operating_point.json`). These counts use a different matching calculation from Ultralytics' summary and must not be substituted for its metrics (`../docs/ML-EXPERIMENT.md`). A confidence interval for these detection metrics has not been verified here.

## Limits

One dataset and one test split cannot establish performance on new places, lighting, weather or cameras. The dataset is not from Kazakhstan; night and snow performance is unknown (`../docs/ML-EXPERIMENT.md`). Box size is relative to the image and severity bands are not physical measurements (`../docs/RULES.md`).

## Ethical considerations

Road photos may contain faces, licence plates or location metadata. Screen material before sharing; cloud inference sends photos off the device and must be explicitly selected (`../docs/ARCHITECTURE.md`, `../data/README.md`). Incorrect detections or missed potholes can mislead priority decisions; retain human review.

## How to reproduce

Rebuild the frozen dataset using `../data/make_potholes_yolo_v1.py` and follow the run instructions in `README.md` and `../docs/ML-EXPERIMENT.md`; the dataset and trained weights are not committed. Compare the configured model with the validated champion and verify the actual weight hash on the target machine. Do not treat a stock pretrained model as the trained pothole model.

## Contact

Qarau ICT1103 project team; pothole model and data lane: Amina; API and serving lane: Alizhan (`../docs/CONTRIBUTION-LOG.md`).
