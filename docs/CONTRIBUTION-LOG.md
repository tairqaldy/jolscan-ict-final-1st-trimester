# Contribution log

The syllabus requires it: "each team keeps a contribution log recording who did what, and at the defence every member is asked an individual question about their own part" (Syl p.5).

Fill in your own row as you go. Be specific: task IDs from [TASKS.md](TASKS.md), files, pull requests. Git history is the evidence, so commit under your own account.

| Person | Lane | What I did (task IDs, files, pull requests) | What I can explain at the defense |
|---|---|---|---|
| Tair | Web app, UX, coordination | | |
| Dameli | Design system and visuals | | |
| Nazar | Restroom model | Took over the restroom lane and recorded its ownership ([PR #2](https://github.com/tairqaldy/jolscan-ict-final-1st-trimester/pull/2)). C-11: two-step pipeline without training (SIFT with an aligned pixel check, colour histograms plus CLIP, global assignment), 30/30 on test and 10/10 on validation (`ml/restroom/classic.py`, `pipeline.py`). C-12: layer experiment, fine-tuning the last N CLIP blocks (0–12) and ResNet50 stages (0–5), grouped 5-fold CV, 3 seeds, 42 runs on a Kaggle GPU (`layers.py`, `kaggle_run_layers.py`, `layers_report.py`). C-13: per-layer probe of frozen features (`layer_probe.py`). C-3: ran R4 (last 6 blocks, 30/30 on test). C-5: exported all runs to the web app's model page. C-6: failure-case figure (`failures.py`). C-9: study card (`ml/restroom/STUDY-CARD.md`). Results and figures in `ml/results/restroom/`, write-up in [`ML-EXPERIMENT-RESTROOM.md`](ML-EXPERIMENT-RESTROOM.md) | Why a crop is matched to its original with SIFT and a pixel check, not with a neural network. Why training 4 CLIP blocks is best (0.965) and training all 12 is worse (0.910, train accuracy 1.000, overfitting). Why the differences between 2 and 8 blocks are within noise (±0.036 with 164 originals). Why gender information drops as more blocks are trained |
| Amina | Pothole data, model and rules | D-2: visually reviewed 100 image/annotation pairs and documented observations and follow-up recommendations in [`data/README.md`](../data/README.md#visual-review-10-november-2026). D-4: checked all 665 images for exact and perceptual-hash near duplicates and checked XML completeness and validity; documented the methods and findings in [`data/README.md`](../data/README.md#duplicate-check). Removed the zero-width object from a separate corrected archive and documented the correction in [`data/README.md`](../data/README.md#annotation-correction). D-3: prepared and checked the Colab YOLO export; upload to the shared Drive folder is user-confirmed but not independently verified, and Tair accepted the Colab export in place of Roboflow ([report](../data/README.md#yolo-dataset-preparation-task-d-3)) | Explain the seeded sample, annotation-versus-image observations, why flagged examples require follow-up rather than being counted as confirmed errors, the limits of the duplicate and XML checks, why no replacement box was added, and and the Colab-export deviation |
| Alizhan | Serving and performance | | |
| Roma | Research, deck, video, QA | | |

## Decisions made together

| Date | Decision | Who was there |
|---|---|---|
| 3–4 Nov | Shortlisted two ideas: pothole detection and bird counting | group chat |
| 10 Nov | Pothole detection chosen as the working direction (to confirm at kickoff) | |
| 10 Nov | Second module added: restroom sign matching on the IOAI 2025 data. Product renamed to Qarau. Nazar proposed to lead the restroom model, Amina the pothole model (to confirm at kickoff) | Tair |
| 10 Nov | D-3: Amina's Colab export `potholes_yolo_v1` (seed 42, manifest in `data/exports/potholes_yolo_v1/`) accepted as the frozen pothole dataset in place of a Roboflow version | Tair |
