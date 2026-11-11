# data/

No datasets are stored in git. This folder holds the dataset card, notes and the rebuild script. The pothole images come from Kaggle; the frozen export is also in the shared Drive folder.

## Dataset card (task D-1)

| Field | Value |
|---|---|
| Name | Annotated Potholes Image Dataset ("Fully bounding-box annotated image dataset of potholes and damaged roads") |
| Author | Atikur Rahman Chitholian (Kaggle user `chitholian`) |
| URL | https://www.kaggle.com/datasets/chitholian/annotated-potholes-dataset (version 1, published 27 February 2020) |
| Licence | As shown on Kaggle: "Database: Open Database, Contents: Database Contents", i.e. the Open Database License (ODbL) for the database and the Database Contents License (DbCL) for its contents. Read on 11 November 2026 from the Kaggle dataset page data (API). |
| Images | 665 JPG, each with a Pascal VOC XML file |
| Objects | 1,740 in the original; 1,739 after removing the zero-width box in `img-415.xml` |
| Classes | `pothole` |
| Annotation type | bounding boxes |
| Dataset version used for all runs | `potholes_yolo_v1` |
| Split | 465 / 100 / 100 train / validation / test, by image, `random.Random(42)` shuffle of the sorted paths |
| Preprocessing | none: no resize; every EXIF orientation was 1 |
| Offline augmentation | none (augmentation is applied during training only) |
| Rebuild | `python data/make_potholes_yolo_v1.py --source <unzipped Kaggle folder> --out data/raw/potholes_yolo_v1` (task D-14) |

**Same files as the ones we trained on.** On 11 November 2026 the Kaggle download (48,139,872 bytes) was checked against `split_manifest.json`: all 665 images have the same SHA-256 (task D-14).

**Licence judgement.** The dataset licence is open (ODbL / DbCL), and Kaggle Datasets is one of the sources the syllabus allows (Syl p.9). The Kaggle description does not say where the photos came from, and three photos carry stock-photo watermarks (`img-565.jpg`, `img-409.jpg`, `img-448.jpg`), so the rights to individual photos are not established by the dataset licence. Those three are never shown publicly (task D-12), and the app's public sample images are drawn illustrations, not dataset photos.

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

## YOLO dataset preparation (task D-3)

**Version:** `potholes_yolo_v1.zip`, prepared in Colab from `potholes_corrected_v1.zip`. This is a Colab export, not the Roboflow version in the original plan. The ZIP is not stored in this repository.

**Archive provided:** `potholes_yolo_v1.zip` was supplied as a chat attachment and inspected. Amina confirmed that `potholes_yolo_v1.zip` has been uploaded to the shared project Drive folder (link in the team chat; not published here because the folder holds raw photos). This upload status is user-confirmed; it was not independently verified.

The export contains 665 images and 1,739 pothole annotations, converted from Pascal VOC-style XML to YOLO detection TXT. XML bounds were converted directly without a +/-1 shift; box centers use `(min + max) / 2`, sizes use `max - min`, and values are normalized by image dimensions. It has one class: `0 = pothole`. The split was created by sorting image paths and applying `random.Random(42).shuffle`:

| Split | Images | Objects |
|---|---:|---:|
| Train | 465 | 1,198 |
| Val | 100 | 305 |
| Test | 100 | 236 |

Every image was assigned exactly once, with no path overlap between splits. JPG files were copied unchanged; no resizing or augmentation was applied. EXIF inspection found no images with EXIF and no orientation values other than 1, so no orientation transform was needed.

ZIP integrity and exported YOLO values were checked. Six exported images (two per split) were visually checked; no obvious conversion-related box displacement was observed. This does not establish that all original annotations are correct.

The archive contains `images/{train,val,test}/`, `labels/{train,val,test}/`, `data.yaml`, `split_manifest.json`, and `README.txt`. Copies of the actual exported `data.yaml` and `split_manifest.json` are in `data/exports/potholes_yolo_v1/`; the ZIP is not committed.

All model experiments must use this same frozen split. This export has not been privacy-screened as a public sample set. Provenance, usage rights, privacy screening, and ambiguous annotation concerns remain unresolved. This preparation does not complete D-1 or D-12. **Decision (Tair, 10 November 2026):** the Colab export `potholes_yolo_v1` is accepted in place of the planned Roboflow version and is the frozen dataset version for every pothole run. D-3 is complete. Committing the conversion and split code (suggested in the review of #4) would make the version reproducible from `potholes_corrected_v1.zip`.

**Rebuild from the Kaggle source (task D-14, 11 November 2026).** `data/make_potholes_yolo_v1.py` repeats this procedure from the original Kaggle download and checks the result against the committed manifest:

```bash
python data/make_potholes_yolo_v1.py --source data/raw/potholes-kaggle/src --out data/raw/potholes_yolo_v1
```

It re-derives the split (sorted paths, `random.Random(42).shuffle`, first 465 train, next 100 val, last 100 test) instead of copying it from the manifest. It removes the one zero-width box in `img-415.xml`, converts the XML bounds as described above, and then compares every image's SHA-256, split and object count, plus the per-split totals, with `split_manifest.json`. It stops on the first difference. Run on 11 November 2026 against the Kaggle download (`chitholian/annotated-potholes-dataset`, 48,139,872 bytes): all 665 images and 1,739 boxes matched (train 465 / 1,198, val 100 / 305, test 100 / 236). The label text uses six decimals; the Colab export's number format was not recorded, so label files may differ in the last digits while describing the same boxes. The output goes to `data/raw/`, which is git-ignored.

### The D-2 sample is the test split (task D-20, found 10 November)

D-2 drew its visual-review sample with `random.Random(42).sample(pairs, 100)` from the sorted list of 665 photos; D-3 shuffled the same sorted list with `random.Random(42).shuffle` and took the last 100 as test. With the same seed and the same list, `sample` and `shuffle` draw the same random positions, so the 100 photos reviewed in D-2 are exactly the 100 test photos. Checked on 11 November 2026:

```bash
python3 -c "
import json, random
m = json.load(open('data/exports/potholes_yolo_v1/split_manifest.json'))
paths = sorted(i['source_image'] for i in m['images'])
split = {i['source_image']: i['split'] for i in m['images']}
x = list(paths); random.Random(42).shuffle(x)
print('last 100 after shuffle are test:', all(split[p] == 'test' for p in x[565:]))
s = random.Random(42).sample(paths, 100)
print('D-2 sample == test split:', set(s) == {p for p in paths if split[p] == 'test'})
"
```

Output: `last 100 after shuffle are test: True` and `D-2 sample == test split: True`. A second check over the 27 photos named in the D-2 notes printed `test` for 26 of them; the one exception, `img-415.jpg`, came from the separate archive check, not from the sample, and is in `train`.

Rules that follow, for the rest of the project:

1. No label in `potholes_yolo_v1` changes, in any split.
2. The D-2 notes on test photos are used only as condition tags written before any model existed (D-21, M-36), never to choose a model or a threshold.
3. The D-2 "Recommended follow-up" to recheck ambiguous annotations applies only to a future dataset version.

## Box-size clustering for R2 (task D-11)

K-means (`k=3`, `random_state=42`, `n_init=20`, scikit-learn 1.6.1) was fit to the natural logarithm of normalized bounding-box area using only the training split: 465 images and 1,198 boxes. The sorted log-space cluster centers were `-5.413906222570803`, `-3.5205198333222225`, and `-1.722409700683948`. Boundaries are the geometric midpoints between adjacent centers, transformed back to normalized area.

The clustering JSON gives thresholds as fractions of image area. R2 computes `areaPct = w * h * 100`, so its equivalent percent-of-image thresholds are:

| Boundary | Normalized image-area fraction | `areaPct` (% of image) |
|---|---:|---:|
| `t1` (small / medium) | `0.011479263698068863` | `1.1479263698068863` |
| `t2` (medium / large) | `0.07269630165893015` | `7.269630165893015` |

Classification uses the full-precision boundaries: small if `areaPct < t1`; medium if `t1 ≤ areaPct < t2`; large if `areaPct ≥ t2`. The 1,198 training boxes were grouped as small 429, medium 499, and large 270. The actual result files are [`pothole_area_clusters.json`](../ml/results/pothole_area_clusters.json) and [`pothole_area_clusters.png`](../ml/results/figs/pothole_area_clusters.png).

These are image-relative size bands, not physical measurements and not validated repair-severity thresholds. D-6 human calibration of repair severity remains a separate task.

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
- The repository is public (decision 0006). Nothing from the datasets is committed except small, screened sample images, and no photo with a person, face or licence plate.

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
