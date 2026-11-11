# Rules engine

There are two rule sets, one per module. Part 1 scores potholes. Part 2 checks restroom signage.

# Part 1: Potholes

The model answers "where are the potholes". The rules answer "how urgent is this road segment". Rules are deterministic, editable on the Rules page, and every result lists which rules fired, so the decision can be explained.

The R2 size bands below are derived from training data in task D-11; they are image-relative bands, not measured physical dimensions or validated repair-severity thresholds. D-6 human calibration of the severity rules remains separate. Other thresholds and score weights are team-defined starting values, not an official road-maintenance standard.

## Inputs

For each detection: `confidence`, and a normalised box `x, y, w, h`. Optional photo metadata: `roadClass` (`residential`, `arterial`, `highway`) and `schoolZone` (boolean). If metadata is missing, `roadClass` is taken as `residential` and `schoolZone` as false, and the result says "assumed".

Derived per detection:

- `areaPct = w * h * 100`, the share of the image the pothole covers.
- `size`: `small` if `areaPct < 1.1479263698068863`, `medium` if `1.1479263698068863 ≤ areaPct < 7.269630165893015`, `large` if `areaPct ≥ 7.269630165893015`. `areaPct` is measured in percent of the image.
- `inLane`: box centre is in the middle half of the image width (`0.25 ≤ cx ≤ 0.75`) and in the lower half (`cy ≥ 0.5`). For a forward-facing photo this approximates "in the driving path, close to the camera".

## Rules

| ID | Rule | Default | Effect |
|---|---|---|---|
| R1 | Counting threshold | `τ = 0.40` | Detections with `confidence ≥ τ` are counted. Detections below τ (the model service reports down to 0.25) are not counted, but set `needsReview = true` |
| R2 | Size points | small 1, medium 2, large 4 | Each counted detection adds its size points. All small detections together add at most 2 points |
| R3 | Driving lane | ×1.5 | Points of a detection are multiplied if `inLane` |
| R4 | Cluster | 3 or more counted detections of size medium or large | +2 points for the photo |
| R5 | Road class | residential ×1.0, arterial ×1.25, highway ×1.5 | Multiplies the photo score. Higher speed means higher risk |
| R6 | School zone | +2 points | Added after R5, only if at least one detection is counted |

```
smallPoints = min( Σ over small detections (1 × laneMultiplier), 2 )
otherPoints = Σ over medium and large detections (sizePoints × laneMultiplier)
score       = (smallPoints + otherPoints + clusterBonus) × roadClassMultiplier + schoolZoneBonus
```

The cap on small detections exists because the detector's false alarms (shadows, patches, manhole covers) are mostly small. Without it, ten small boxes would outrank one large pothole in the driving lane.

## Severity and action

| Score | Severity | Recommended action | Target time |
|---|---|---|---|
| 0, no counted detections | clear | No action | none |
| above 0 and below 2 | low | Add to the next scheduled maintenance round | none |
| 2 to below 5 | medium | Schedule a patch repair | 14 days (336 h) |
| 5 to below 9 | high | Send a repair crew | 72 h |
| 9 or more | critical | Mark the hazard and repair urgently | 24 h |

## Worked examples

**A.** A highway photo with three counted detections: one large in lane, one medium in lane, one small off lane.

- Small: `min(1, 2) = 1`
- Medium and large with R3: `4 × 1.5 + 2 × 1.5 = 9`
- R4: only two detections are medium or large, so no cluster bonus
- R5: highway, `(1 + 9) × 1.5 = 15`
- Result: score 15, severity `critical`, target 24 h.

**B.** A residential photo with ten small counted detections off lane, no school zone.

- Small: `min(10, 2) = 2`. No other points, no cluster bonus.
- Result: score 2, severity `medium`.

**C.** A clean road in a school zone: no counted detections, so R6 does not apply. Score 0, `clear`.

## D-11: training-data size bands

K-means (`k=3`, `random_state=42`, `n_init=20`, scikit-learn 1.6.1) was fit to the natural logarithm of normalized bounding-box area using only the training split: 465 images and 1,198 boxes. The sorted log-space centers were `-5.413906222570803`, `-3.5205198333222225`, and `-1.722409700683948`. Boundaries are the geometric midpoints between adjacent clusters, transformed back to normalized area:

| Boundary | Normalized image-area fraction | `areaPct` (% of image) |
|---|---:|---:|
| `t1` (small / medium) | `0.011479263698068863` | `1.1479263698068863` |
| `t2` (medium / large) | `0.07269630165893015` | `7.269630165893015` |

Use the full-precision boundaries with these inclusive rules: small if `areaPct < t1`; medium if `t1 ≤ areaPct < t2`; large if `areaPct ≥ t2`. Training-box group counts were small 429, medium 499, and large 270. The JSON result is [`ml/results/pothole_area_clusters.json`](../ml/results/pothole_area_clusters.json); the histogram is [`ml/results/figs/pothole_area_clusters.png`](../ml/results/figs/pothole_area_clusters.png).

These are image-relative size bands, not physical measurements and not validated repair-severity thresholds. D-6 human calibration of repair severity is separate.

## Known limits (say these at the defense)

- Box area in the image is not physical size. A pothole far from the camera looks small, and a close-up fills the frame. Fixing this needs camera calibration or a depth estimate.
- R3 is meaningful only for forward-facing, roughly level photos such as dashcam frames. In a handheld close-up almost every box counts as in lane.
- The rules never see road markings, so a pothole on the shoulder of a narrow road can be scored as in lane.
- The R2 size boundaries were derived from training boxes; they are not physical dimensions or human-validated repair-severity cutoffs.

# Part 2: Restroom signage

> **Owner: Nazar (lane C).** Part 1 is Amina's. Ask Nazar before changing part 2.

The model answers two questions about a pair of door signs: how "male" each sign looks, and how alike the two designs are. The rules turn that into one of two verdicts: the two signs are a **pair** (one design set, one men's and one women's door) or **not a pair**.

## Why the doors are compared with each other

The first version of these rules judged each sign on its own (S1: each sign at least 80% confident; S2: the two predicted genders differ). Measured on the 82 IOAI training restrooms with the model the app serves (zero-shot CLIP ViT-B/32, door photos), that failed badly:

| On real, correctly signed restrooms | Each sign judged alone | Doors compared with each other |
|---|---|---|
| Both doors read the right way round | 57% | **90%** |
| Old S2 "genders differ" passes | 61%, so 39% falsely "confusing" | not needed |
| Old S1 "each sign ≥ 80% confident" passes | 32% of signs, so nearly every pair "review" | not needed |

So the rules now compare the two signs. Script and full numbers: `ml/restroom/pair_separation.py`, `ml/results/restroom/pair_separation.json`.

## Inputs

From the model, for signs `a` and `b`: predicted gender and its confidence, and the similarity of the two designs (0..1). From these:

- `P(male)` of a sign = its confidence if predicted male, `1 − confidence` if predicted female.
- The sign with the higher `P(male)` is read as the men's door, the other as the women's door.
- `gap` = the difference between the two `P(male)` values, 0..1.

## Rules

| ID | Rule | Default | Fails when | Evidence (82 IOAI training restrooms) |
|---|---|---|---|---|
| S2 | The doors read as different genders | gap ≥ 0.05 | Both signs read as the same gender to the model | Below 0.05 the reading is close to a coin toss; 15% of real pairs fall there ([curves](../ml/results/restroom/figs/signage_thresholds.png)) |
| S3 | The signs belong to one set | similarity ≥ 0.88 | The two designs look like two different sets | 95% of same-restroom pairs pass; 89% of pairs from two different restrooms fail. The first default, 0.75, flagged only 1% of them ([curves](../ml/results/restroom/figs/signage_thresholds.png)) |

**Retired on 11 Nov 2026:** rule S1 (gap ≥ 0.20, "which door is which is clear") and the three verdicts clear / review / confusing. The app now answers one question, are these two signs a pair, so only the two rules that decide it are left. S1's numbers stay in the tables below as measurements: 62% of real training pairs had a gap of at least 0.20, and every one of them was read the right way round.

The trade-off behind each default is drawn in [`figs/signage_thresholds.png`](../ml/results/restroom/figs/signage_thresholds.png) (`python ml/restroom/signage_plots.py`, task C-27). The thresholds were chosen on the same 82 restrooms they are measured on, which is why task C-26 checks the rules on the 10 validation restrooms.

### Out-of-sample check (task C-26)

The thresholds were chosen on the 82 training restrooms. On the 10 validation restrooms they never saw (genders labelled by eye in `ml/results/restroom/val_gallery_labels.csv`, pairs from the IOAI answer file; zero-shot CLIP ViT-B/32 as served; `python ml/restroom/signage_val.py` → `ml/results/restroom/signage_val.json`):

| | Training (82 restrooms) | Validation (10 restrooms, exact 95 % interval) |
|---|---|---|
| Both doors read the right way round | 0.90 | 9/10 = 0.90 (0.56–1.00) |
| S1 passes (gap ≥ 0.20) | 0.62 | 7/10 = 0.70 (0.35–0.93) |
| Of those, read the right way round | 1.00 | 7/7 = 1.00 (0.59–1.00) |
| S2 passes (gap ≥ 0.05) | 0.85 | 9/10 = 0.90 (0.56–1.00) |
| S3 passes (similarity ≥ 0.88) | 0.95 | 9/10 = 0.90 (0.56–1.00) |
| S2 flags same-gender pairs of two restrooms | 0.16 | 18/90 = 0.20 (0.12–0.30) |
| S3 flags same-gender pairs of two restrooms | 0.89 (all different-restroom pairs) | 79/90 = 0.88 (0.79–0.94) |

Validation agrees with training on every rule: 9 of 10 restrooms read the right way round, and the 7 that pass S1 are all read correctly. Ten restrooms give wide intervals, so this shows the training numbers are in the right range, not that they are exact. The thresholds are unchanged; nothing was tuned on these 10 restrooms.

## Verdict

| Verdict | When | Reason shown |
|---|---|---|
| `pair` | S2 and S3 pass | One design set, and the two doors read as different genders |
| `not_pair` | S2 or S3 fails | Which rule failed: different sets, both signs read as the same gender, or both |

## Worked examples

**A.** Door A male 0.97, door B female 0.94, similarity 0.94. P(male) 0.97 and 0.06, gap 0.91: door A is the men's room. Both rules pass, verdict `pair`.

**B.** Door A male 0.62, door B male 0.52, similarity 0.93. On its own door B even reads slightly male, but compared with door A it is the women's room: P(male) 0.62 against 0.52. The gap of 0.10 passes S2 and S3 passes, verdict `pair`.

**C.** Door A male 0.71, door B male 0.69, similarity 0.95. Gap 0.02, below 0.05: S2 fails, verdict `not_pair` ("Both signs read as the same gender").

## Known limits

- The model judges a cropped icon. It never sees the door, the text under the icon, the colour coding or the location.
- "Distinguishable to the model" is a stand-in for "distinguishable to a person". The thresholds were chosen on the IOAI training restrooms, not tested with people.
- S2 is a weak detector of truly confusing pairs: two male signs from different restrooms fall below a gap of 0.05 only 16% of the time, because their styles differ. The IOAI data has no restrooms with genuinely confusing signs to test this properly.
- The training set is 82 restrooms, mostly from stock photos. Unusual or culture-specific icons may be misread.
- Accessible and all-gender restrooms are outside the IOAI data, so the model has no class for them.
