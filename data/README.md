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

### Visual review (10 November 2026)

**Dataset:** Annotated Potholes Image Dataset, by Atikur Rahman Chitholian. [Kaggle source](https://www.kaggle.com/datasets/chitholian/annotated-potholes-dataset).

The archive contains 665 JPG images, 665 XML annotation files, and 1,740 annotated objects in one class, `pothole`. Annotations use Pascal VOC-style XML, not YOLO format. `splits.json` lists 532 training and 133 test images; this is the source split, not our final project split.

**Method:** JPG paths with matching XML files were sorted, then 100 pairs were selected with `random.Random(42).sample(pairs, 100)`. The images were visually inspected in Google Colab with their XML annotation boxes overlaid. The displayed boxes came from the annotations, not model predictions.

**Observations from the visual sample:**

- The supplied observations do not characterize the overall framing (close-ups versus dashcam views), so no conclusion is recorded here.
- Possible missing annotations or ambiguous object boundaries: `img-201.jpg`, `img-18.jpg`, `img-489.jpg`, `img-91.jpg`, `img-642.jpg`, `img-345.jpg`, `img-525.jpg`.
- Small annotated objects that need closer inspection: `img-9.jpg`, `img-121.jpg`, `img-126.jpg`, `img-30.jpg`, `img-313.jpg`, `img-654.jpg`, `img-412.jpg`, `img-184.jpg`.
- Ambiguous separation of objects with overlapping boxes: `img-616.jpg`, `img-448.jpg`. Overlap alone does not establish an annotation error.
- Unusual examples needing agreement on class scope: `img-304.jpg` (exposed brickwork inside damaged road areas), `img-643.jpg` (large road collapse with barriers), and `img-163.jpg` (loss of the upper pavement layer). The team needs to agree which damage types count as potholes.
- Shadows obscure boundaries in `img-213.jpg` and `img-25.jpg`. Water obscures boundaries in `img-352.jpg`, `img-412.jpg`, `img-409.jpg`, and `img-448.jpg`.
- Stock-photo watermarks appear in `img-565.jpg` (picture-alliance/ZB), `img-409.jpg`, and `img-448.jpg` (Alamy). Verify provenance and rights before publication; a dataset-level licence alone does not establish rights to every included photograph.
- People are visible in `img-193.jpg`, and vehicle licence plates are visible in `img-448.jpg`. Review and redact as needed before external use, following the privacy requirements below.

These are observed examples, not error counts. Categories may overlap, and ambiguous cases have not been adjudicated.

**Separate automated archive check:** Every JPG has a corresponding XML file. One zero-width box was found in `img-415.xml`: `xmin=273`, `xmax=273`, `ymin=164`, `ymax=165`. This is a technical annotation issue. `img-415.jpg` was not in the visual sample and is not included in the visual observations above.

**Filenames:** Reviewed names use `img-<number>` without a `.rf.` suffix. This does not establish that the dataset has no baked-in augmentation or duplicates. D-4 duplicate detection has not been performed.

**Recommended follow-up:**

- Agree on a consistent definition of a separate pothole and recheck ambiguous annotations at original resolution.
- Fix or exclude the degenerate box before training.
- Verify provenance and rights for watermarked photographs.
- Perform D-4 duplicate grouping before creating a new split.
- Treat YOLO conversion and the final 70/15/15 split as subsequent tasks; neither is completed by this review.

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

## Restroom signs dataset card (second module)

| Field | Value |
|---|---|
| Name | Restroom Icon Matching, IOAI 2025 Individual Contest |
| Publisher | International Olympiad in Artificial Intelligence (IOAI) |
| URL | https://github.com/IOAI-official/IOAI-2025/tree/main/Individual-Contest/Restroom |
| Licence | CC-BY-4.0, attribution in `ml/restroom/README.md` and `data/raw/ioai-restroom/ATTRIBUTION.txt` |
| Training set | 82 restrooms × 4 PNG icons (crop and original, male and female), 328 images |
| Validation set | 10 cropped queries, 20 original gallery icons, answers in `answer_a.npy` |
| Test set | 30 queries, 60 gallery icons, answers in `answer_b.npy` |
| Download | `python ml/restroom/get_data.py` into `data/raw/ioai-restroom/` (45 MB, gitignored), idempotent, verifies the counts |
| Split | Fixed by IOAI. Grouped 5-fold cross-validation by restroom id inside the training set for gender accuracy |
| Leakage check (10 Nov 2026) | No validation or test image is a byte-identical copy of a training image, and none has a CLIP ViT-B/32 cosine similarity above 0.93 to any training image (a training crop and its own original: median 0.93; nearest image of another training restroom: median 0.85). This suggests the validation and test restrooms are not in the training set |
| Privacy | Icons only, no people, no EXIF location. Safe to send to a hosted model |

Embedding caches go to `data/cache/restroom/` (gitignored).
