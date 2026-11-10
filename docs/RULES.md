# Rules engine

There are two rule sets, one per module. Part 1 scores potholes. Part 2 checks restroom signage.

# Part 1: Potholes

The model answers "where are the potholes". The rules answer "how urgent is this road segment". Rules are deterministic, editable on the Rules page, and every result lists which rules fired, so the decision can be explained.

All thresholds below are team-defined starting values and are assumptions, not an official road-maintenance standard. The size bands are replaced by data-derived values in task D-11, and the severity bands are checked against human judgment in task D-6.

## Inputs

For each detection: `confidence`, and a normalised box `x, y, w, h`. Optional photo metadata: `roadClass` (`residential`, `arterial`, `highway`) and `schoolZone` (boolean). If metadata is missing, `roadClass` is taken as `residential` and `schoolZone` as false, and the result says "assumed".

Derived per detection:

- `areaPct = w * h * 100`, the share of the image the pothole covers.
- `size`: `small` if `areaPct < 0.5`, `medium` if `0.5 ≤ areaPct < 3`, `large` if `areaPct ≥ 3`. Provisional until D-11.
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

## Known limits (say these at the defense)

- Box area in the image is not physical size. A pothole far from the camera looks small, and a close-up fills the frame. Fixing this needs camera calibration or a depth estimate.
- R3 is meaningful only for forward-facing, roughly level photos such as dashcam frames. In a handheld close-up almost every box counts as in lane.
- The rules never see road markings, so a pothole on the shoulder of a narrow road can be scored as in lane.
- Thresholds were set by the team on a small validation set.

# Part 2: Restroom signage

> **Owner: Nazar (lane C).** Part 1 is Amina's. Ask Nazar before changing part 2.

The model answers two questions about a pair of door signs: how "male" each sign looks, and how alike the two designs are. The rules turn that into a verdict a facility manager can act on: is it obvious to a visitor which door is which?

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
| S1 | Which door is which is clear | gap ≥ 0.20 | The reading is too close to trust without a person checking | 62% of real pairs pass, and every one of them is read the right way round |
| S2 | The two doors can be told apart | gap ≥ 0.05 | The two signs look almost the same to the model | Below 0.05 the reading is close to a coin toss; 15% of real pairs fall there |
| S3 | The signs belong to one set | similarity ≥ 0.88 | The two designs look unrelated, so visitors may not read them as a pair | 95% of same-restroom pairs pass; 89% of pairs from two different restrooms fail. The first default, 0.75, flagged only 1% of them |

S2 is never stricter than S1.

## Verdict

| Verdict | When | Recommended action |
|---|---|---|
| clear | S1, S2 and S3 pass | No action |
| review | S2 passes, and S1 or S3 fails | Check the signs on site. Make the difference between the doors clearer, or replace the sign that does not match the set |
| confusing | S2 fails | Replace the signage. Visitors are likely to enter the wrong room |

## Worked examples

**A.** Door A male 0.97, door B female 0.94, similarity 0.94. P(male) 0.97 and 0.06, gap 0.91: door A is the men's room. All rules pass, verdict `clear`.

**B.** Door A male 0.62, door B male 0.52, similarity 0.93. On its own door B even reads slightly male, but compared with door A it is the women's room: P(male) 0.62 against 0.52. The gap of 0.10 passes S2 and fails S1, verdict `review`.

**C.** Door A male 0.71, door B male 0.69, similarity 0.95. Gap 0.02, below 0.05: S2 fails, verdict `confusing`.

## Known limits

- The model judges a cropped icon. It never sees the door, the text under the icon, the colour coding or the location.
- "Distinguishable to the model" is a stand-in for "distinguishable to a person". The thresholds were chosen on the IOAI training restrooms, not tested with people.
- S2 is a weak detector of truly confusing pairs: two male signs from different restrooms fall below a gap of 0.05 only 16% of the time, because their styles differ. The IOAI data has no restrooms with genuinely confusing signs to test this properly.
- The training set is 82 restrooms, mostly from stock photos. Unusual or culture-specific icons may be misread.
- Accessible and all-gender restrooms are outside the IOAI data, so the model has no class for them.
