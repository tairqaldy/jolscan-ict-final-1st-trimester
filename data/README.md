# data/

No datasets are stored in git. This folder holds the dataset card and notes. The dataset itself lives in Roboflow and in the shared Drive folder.

## Dataset card (task D-1, to be filled in by Amina)

| Field | Value |
|---|---|
| Name on Roboflow Universe | |
| Author | |
| URL | |
| Licence | |
| Images | |
| Classes | `pothole` |
| Annotation type | bounding boxes |
| Our Roboflow project | `pothole-idtb2-pr1td` (Tair's workspace) |
| Dataset version used for all runs | |
| Same dataset on Kaggle, if it exists | |
| Split | 70 / 15 / 15, train / validation / test |
| Preprocessing in the version | auto-orient only, no resize |
| Offline augmentation in the version | none (augmentation is applied during training only) |

## Quality notes (task D-2)

What 100 random images looked like: label quality, image sources, lighting, close-ups or dashcam frames, and whether file names show baked-in augmented copies (`<stem>_jpg.rf.<hash>.jpg`).

## Duplicate groups and leakage (task D-4, done before the split)

How images were grouped (file-name stem, perceptual hash), how many groups and near-duplicates were found, how many images were removed, and the check that no group is in more than one split.

## Screening checklist (task D-12)

Every image that leaves the team is checked for faces and licence plates and has its EXIF removed.

| Set of images | Where it goes | Screened by | Date |
|---|---|---|---|
| 20 photos for the AI audit (R-6) | two vision-language models | | |
| Sample photos in `web/public/samples` | the repository and the deployed site | | |
| Example images in the public Space | Hugging Face | | |

## Privacy

Road photos can show faces and licence plates, and EXIF data can hold GPS coordinates. The syllabus forbids sending personal or biometric data to external AI services or public repositories. So:

- Only images from the public dataset go to Roboflow, Colab or any hosted model.
- Photos we take ourselves are checked for faces and plates first (task D-12). Only photos that pass may be uploaded anywhere for annotation. Everything else is analysed with the local model only.
- The repository stays private.
