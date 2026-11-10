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

**Team decision, 10 November 2026:** Tair confirmed proceeding with the current dataset despite the unresolved provenance and usage rights of watermarked images. This decision does not verify those rights. The provenance warning remains open.

These are observed examples, not error counts. Categories may overlap, and ambiguous cases have not been adjudicated.

**Separate automated archive check:** Every JPG has a corresponding XML file. One zero-width box was found in `img-415.xml`: `xmin=273`, `xmax=273`, `ymin=164`, `ymax=165`. This is a technical annotation issue. `img-415.jpg` was not in the visual sample and is not included in the visual observations above.

**Filenames:** Reviewed names use `img-<number>` without a `.rf.` suffix. The D-4 check below found no Roboflow stem groups; absence of the suffix alone does not establish that the dataset has no baked-in augmentation or duplicates.

**Recommended follow-up:**

- Agree on a consistent definition of a separate pothole and recheck ambiguous annotations at original resolution.
- The zero-width annotation in the original archive has been removed in the separate corrected archive described below; the original archive remains unchanged.
- Verify provenance and rights for watermarked photographs.
- Use the D-4 duplicate-check results below when preparing a new split.
- Treat YOLO conversion and the final 70/15/15 split as subsequent tasks; neither is completed by this review.

## Duplicate groups and leakage (task D-4, done before the split)

### Duplicate check

All 665 images were read successfully; there were no read errors.

- Exact duplicates were checked by computing SHA-256 over decoded RGB pixels together with image dimensions. No exact duplicate groups were detected.
- Near-duplicate candidates were checked with `imagehash.phash` (`hash_size=8`) for every unordered image pair. No pairs had a Hamming distance of 5 or less.
- Filenames use `img-<number>.jpg`, with no `.rf.` suffixes, so no Roboflow filename-stem groups were identified.

No duplicates were detected by these methods. No images were removed or modified; all 665 remain. This does not guarantee that the dataset is duplicate-free: cropped or substantially transformed copies may evade detection. The check does not resolve annotation, licensing, or privacy issues.

### XML completeness and validity check (original archive)

The archive check covered 665 JPG images, 665 XML files, and 1,740 objects.

- No JPG/XML pairs were missing.
- No class names, bounding-box coordinates, filenames, or image dimensions (`width`, `height`, `depth`) were missing or placeholders.
- Every XML file contained at least one object.
- No filename or image-dimension mismatches were found.
- No coordinates were non-finite or outside the image bounds.
- None of the checked optional fields (`folder`, `path`, `source/database`) were missing.
- One structural issue was found: object 3 in `img-415.xml` has a zero-width box (`xmin=273`, `xmax=273`, `ymin=164`, `ymax=165`). This is the same issue noted in the D-2 automated archive check, not a second defect.

No missing-value imputation is needed. Bounding-box coordinates must not be filled with averages. At the time of this original-archive check, manual inspection and correction or exclusion of the invalid annotation were recommended; the subsequent correction in a separate archive is documented below. Non-empty metadata does not establish provenance; `Unknown` is not verified source information.

This structural check does not validate visual annotation quality. It also does not establish provenance, licensing, or privacy compliance.

### Annotation correction

A separate archive, `potholes_corrected_v1.zip`, was created in Colab; the original `Archive.zip` was preserved unchanged. In the corrected archive, only object 3 was removed from `annotated-images/img-415.xml`. Its box had zero width (`xmin=273`, `xmax=273`, `ymin=164`, `ymax=165`). Visual inspection did not clearly establish a separate pothole at that location, so no replacement box was added. The image and its other two annotations were retained.

The exported corrected archive was reopened, and its total object count was verified.

| Version | Images | XML files | Annotations |
|---|---:|---:|---:|
| Original `Archive.zip` | 665 | 665 | 1,740 |
| Corrected `potholes_corrected_v1.zip` | 665 | 665 | 1,739 |

This correction addresses only the identified zero-width annotation in the separate corrected archive. It does not make the dataset fully cleaned or training-ready. Licensing and provenance questions and ambiguous visual annotations remain unresolved. At the time of this correction, YOLO conversion and the final 70/15/15 split had not been performed; their subsequent preparation is documented below.

## YOLO dataset preparation (task D-3, in progress)

**Version:** `potholes_yolo_v1.zip`, prepared in Colab from `potholes_corrected_v1.zip`. This is a Colab export, not the Roboflow version in the original plan. The ZIP is not stored in this repository.

**Archive provided:** `potholes_yolo_v1.zip` was supplied as a chat attachment and inspected. **Drive folder:** [Shared project folder](https://drive.google.com/drive/folders/1IKaEi1NAAteP2zYYGZZDZRHt1wrC16GS?usp=sharing). This is a folder link; it does not by itself verify that `potholes_yolo_v1.zip` is present in the folder.

The export contains 665 images and 1,739 pothole annotations, converted from Pascal VOC-style XML to YOLO detection TXT. XML bounds were converted directly without a +/-1 shift; box centers use `(min + max) / 2`, sizes use `max - min`, and values are normalized by image dimensions. It has one class: `0 = pothole`. The split was created by sorting image paths and applying `random.Random(42).shuffle`:

| Split | Images | Objects |
|---|---:|---:|
| Train | 465 | 1,198 |
| Val | 100 | 305 |
| Test | 100 | 236 |

Every image was assigned exactly once, with no path overlap between splits. JPG files were copied unchanged; no resizing or augmentation was applied. EXIF inspection found no images with EXIF and no orientation values other than 1, so no orientation transform was needed.

ZIP integrity and exported YOLO values were checked. Six exported images (two per split) were visually checked; no obvious conversion-related box displacement was observed. This does not establish that all original annotations are correct.

The archive contains `images/{train,val,test}/`, `labels/{train,val,test}/`, `data.yaml`, `split_manifest.json`, and `README.txt`. Copies of the actual exported `data.yaml` and `split_manifest.json` are in `data/exports/potholes_yolo_v1/`; the ZIP is not committed.

All model experiments must use this same frozen split. This export has not been privacy-screened as a public sample set. Provenance, usage rights, privacy screening, and ambiguous annotation concerns remain unresolved. This preparation does not complete D-1 or D-12. D-3 remains in progress pending confirmation that the ZIP is in the linked Drive folder and Tair's explicit acceptance of the Colab export in place of the planned Roboflow version.

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
