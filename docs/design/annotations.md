# Annotated result slides (G-72)

Two slides that show a road result and a sign result with four numbered markers each. They are the fallback for the live demo on slide 3 (`docs/PRESENTATION.md`, "Demo script"): if the laptop or the model fails, the speaker walks through the same four things the demo would show, the evidence, the decision, the rule and the action.

| File (outside git) | Source shot | Slide |
|---|---|---|
| `annotated/03-roads-result-annotated-light.png` | `raw/03-roads-result-light.png` | 3 fallback, backup |
| `annotated/03-restroom-compare-annotated-light.png` | `raw/03-restroom-compare-light.png` | 3 fallback, backup |
| `annotated/…-dark.png` | the `-dark` shots | only for a dark slide |

Each PNG is a whole slide, 1920 × 1080, in the layout of the template's "Large screenshot" slide (slide 5 of `slide-template/qarau-slide-template.pptx`): eyebrow, title, the shot in the G-56 frame 8.0 in wide on the left, the legend in the right column, footer. Next to each PNG is the SVG it was drawn from; it references the screenshot as `../raw/<shot>.png`. Screenshots stay out of git (`screenshots.md`); this page and the script are the part that is kept.

The shots are from `main` at `88e8d86`, 11 November 2026 18:09 Almaty, Mock provider (the G-11 retake, see the folder's `README.txt`).

## Marker style

- **At most four markers per shot.** One marker is a numbered circle, a 3 px outline around what it names and, when the circle sits away from the outline, a 2.5 px leader line between them.
- **Colour:** circle and lines in `--accent` (`#b87f00` light, `#ffb81c` dark), number in `--accent-fg` (`#1b1c1e` light, `#121314` dark), as the template uses the accent: only as a fill, with `--accent-fg` on it. A 3 px ring (white on the light slide, the slide colour on the dark one) separates the circle from the screen under it.
- **Placement:** each circle sits in empty space next to its target (the sky above the road, empty card space, the gap between the two sign tiles), never on text, a value or a badge.
- **Nothing is dimmed.** Dimming the rest of the screen would also dim the "Mock result" and "Includes demo data" badges, which have to stay readable (U8).
- **Legend:** in the right column, same numbered circle, a bold label of two to four words and one muted line that says what the item is in the story. Overpass, 36 px on the 1920 px slide, which is 18 pt on the 13.33 in slide (`deck-critique.md`: content under 18 pt is too small).
- **Labels only repeat the screen.** Every number and word on a label is visible in the shot. The one line that is not, "Mock result: placeholder values", is the provenance note under the legend (honesty rule, R6 and R13 of `ANTI-SLOP.md`); its source is named below.
- **Badges stay uncovered.** No circle, outline or leader touches the sidebar "Mock" and "Includes demo data" badges or the "Mock result" badge in the result card. The script checks this and stops if one does.

## Road result

`03-roads-result-light.png`: `/app/roads/analyze?sample=s01`, after "Analyze photo", tab "Why this priority".

| # | Points at | Label / muted line | Speaker line | Where the values come from |
|---|---|---|---|---|
| 1 | The three boxes on the photo with their tags "1 · 91%", "2 · 84%", "3 · 67%" | Boxes with confidence / The evidence | "Three boxes, each with its confidence: 91, 84 and 67 percent. This backup runs on the Mock provider, so the boxes are placeholders, not model output." | `web/public/samples/samples.json`, sample `s01`, confidences 0.91, 0.84, 0.67; the Mock provider returns them as they are (model name `mock-fixtures`, `web/lib/mock/analyses.ts`) |
| 2 | "Repair priority", the "Critical" badge and "Score 15" | Critical, score 15 / The decision | "The rules turn the boxes into a score of 15. Nine or more is Critical." | `web/lib/rules/engine.ts` with the defaults in `web/lib/rules/config.ts`; `docs/RULES.md` part 1, worked example A: `(1 + 9) × 1.5 = 15`; critical from 9 (`SEVERITY_BANDS`) |
| 3 | The table row "R2 Size points · 1 large, 1 medium, 1 small (1/2/4 points) · +7" | R2 Size points, +7 / Adds the most points | "The rule that adds the most is R2: one large, one medium and one small pothole give 4 + 2 + 1 = 7 points. The driving lane adds 3 and the highway 5." | Box areas in `s01`: 0.32 × 0.25 = 8.0 % (large, from 7.27 %), 0.2 × 0.1 = 2.0 % (medium), 0.06 × 0.05 = 0.3 % (small), so 4 + 2 + 1 = 7. R3: boxes 1 and 2 are in the lane, (4 + 2) × 0.5 = +3. R5: highway, (7 + 3) × 0.5 = +5. The visible rows add up to the score, 0 + 7 + 3 + 5 = 15, so no row below the fold adds points; R4 and R6 get no row because they did not fire (`engine.ts` adds a row only for a rule that fires: two medium or large boxes, not three; school zone "No") |
| 4 | "Recommended action: Mark the hazard and repair urgently" and "Target time 24 h" | Repair urgently, 24 h / The action | "Critical means: mark the hazard and repair urgently, target time 24 hours." | `SEVERITY_BANDS.critical` in `web/lib/rules/config.ts`: action text and `slaHours: 24`; `docs/RULES.md`, "Severity and action" |

## Sign result

`03-restroom-compare-light.png`: `/app/restrooms/compare?a=classic-m&b=line-f` (pair "Signs from two sets"), after "Compare signs". The rule table ("Why this verdict") starts below the fold, so the rules are marked where the bars name them.

| # | Points at | Label / muted line | Speaker line | Where the values come from |
|---|---|---|---|---|
| 1 | Door A and door B: the two signs, "Classic, men" and "Line art, women", "Reads as Male", "Reads as Female" | Reads as Male, Female / The two door signs | "Door A reads as Male, door B as Female. These are our own drawn signs with Mock values." | `web/public/samples/restrooms/samples.json`: `classic-m` mock male 0.97, `line-f` mock female 0.87. The manifest's `_comment` says the values for the drawings are invented placeholders |
| 2 | "Gap in P(male) between the doors · 0.84", its bar, "At or above the S1 threshold 0.20. Below 0.05 (S2) the doors cannot be told apart" | Gap 0.84, above S1 / How clearly they differ | "The gap in P(male) is 0.84, above S1's 0.20, so it is clear which door is which." | P(male) 0.97 for door A and 1 − 0.87 = 0.13 for door B (`docs/RULES.md` part 2, "Inputs"), gap 0.84; S1 0.20 and S2 0.05 in `web/lib/signage/config.ts` |
| 3 | "Similarity (0 unrelated, 1 identical) · 0.81", its bar with the S3 tick, "Below the S3 threshold 0.88" | Similarity 0.81, below S3 / How alike the designs are | "But the similarity is 0.81, below S3's 0.88: the two signs do not look like one set." | `similarity.crossSet["classic\|line"] = 0.81` in the manifest, plus a fixed jitter of at most ±0.015, rounded to two decimals (`mockSimilarity`, `web/lib/mock/restroom-samples.ts`); S3 0.88 in `web/lib/signage/config.ts` |
| 4 | "Signage verdict", the "Review" badge, "Check the sign design on site." and the recommended action | Review: check on site / The verdict and action | "So the verdict is Review: check the signs on site and replace the sign that does not match the set." | `web/lib/signage/engine.ts`: S2 passes and S3 fails, so `review`; the action is `VERDICT_ACTIONS.review` in `web/lib/signage/config.ts`, as in `docs/RULES.md`, "Verdict" |

## Why these four

The issue (#337) names the same four for both shots: the evidence, the decision, the rule that fired and the action. Two alternatives were left out:

- **The "Mock result" badge as a marker.** It is the honesty cue, but a marker on it would sit right on the badge the issue says must stay uncovered, and the speaker does not explain it, only names it. It stays visible in the shot, the eyebrow says "Mock result" and the note under the legend says what that means.
- **A row of the sign rule table.** It is below the fold in the G-56 frame (full viewport, no full-page capture). The bars carry the same S1, S2 and S3 thresholds, so markers 2 and 3 point at the rules there.

## How it was checked

- Every label was compared with the shot at full size, and every value with the files in the last column above.
- `annotate.py` stops when a slide has more than four markers, a label line is wider than the legend column, a circle, outline or leader overlaps a Mock or demo badge, a raw shot is not 2880 × 1800, or Overpass and JetBrains Mono did not load. All four PNGs passed.
- The four PNGs were opened at full size: no circle covers text, every outline encloses its whole target, and the badges are readable.

## Redraw after a retake

```bash
python docs/design/screenshots/take_screenshots.py --out ../deck-screenshots --only 03-roads-result
python docs/design/screenshots/annotate.py --shots ../deck-screenshots
python docs/design/screenshots/annotate.py --shots ../deck-screenshots --only sign --theme light --scale 2   # 3840 × 2160
```

Targets and circles are in raw screenshot pixels (2880 × 1800) in `SLIDES` and `KEEP_CLEAR` at the top of the script. After a UI change, open the new shot, move the boxes that moved, run the script, and check the labels against the new screen: a changed number on the screen means a changed label.

## Not done here

- **The slides in the deck.** Roma (deck lane, R-28) places the two light PNGs in Canva, as the slide 3 fallback and in the backup section. Until then the G-72 done-check stays open.
- **The issue's variant comparison.** Steps 2, 5 and 7 of #337 (five references, three variants in Google Slides, a three-metre check with Roma and Tair) were not done. One variant was drawn: numbered circles with a legend (A) plus short leader lines (B), on one slide per shot. If the three-metre check finds the shot too small, the next step is variant C: one slide per marker with a detail crop from the raw file.
