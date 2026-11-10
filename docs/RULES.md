# Rules engine

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
