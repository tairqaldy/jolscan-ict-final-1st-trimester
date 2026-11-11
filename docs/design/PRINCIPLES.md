# Design principles and voice (G-69)

Five principles. Each starts from something the repository already promises and points to a screen that follows it today, so it can be checked by opening a page, not by taste. Routes are on the dev server or https://qarau.vercel.app; file and line refer to `main` on 11 November 2026.

## 1. Decision first, evidence one click away

A result opens with what to do; the reasons and the raw data sit one tab further.

- **So we** put priority, score, action and target time in one card at the top of a result, and the rule table, the detections and the raw JSON behind tabs.
- **So we never** open a result with model internals (confidences, JSON) before the decision.
- **Screen:** `/app/roads/analyze?sample=s01`, press "Analyze photo". The card says "Repair priority", "Critical", score 15, "Mark the hazard and repair urgently", target time "24 h"; below it the tabs "Why this priority", "Detections (3)", "Raw JSON" (`web/components/app/analysis-view.tsx` lines 76–91 and 148–150). Compare works the same way: the "Signage verdict" card, then "Why this verdict" (`web/components/restrooms/compare-result.tsx` lines 96 and 144).

This is Hick's law in practice (HCI p35): fewer choices first, more on demand.

## 2. Every number has a source or a Demo badge

- **So we** read measured numbers from the results files (the Model page reads `web/data/experiments.json`, written by `ml/export_results.py`) and mark every invented number with "Demo data", "Includes demo data", "Mock result" or "Sample result".
- **So we never** show a typed number without a source, or demo data without its badge (U8; ANTI-SLOP R6 and R13).
- **Screens:** `/app`, where the header says "Both modules at a glance: the 30 days to 10 Nov 2026 (demo sets) plus work done in this browser." next to "Includes demo data" (`web/components/app/platform-overview-client.tsx` lines 49–53). `/app/model`, where runs without results say "not run yet" instead of a number (`web/app/app/model/page.tsx` line 308) and the IOAI scores sit in their own callout, "IOAI reference points", which says the best score is "a ceiling to compare against, not a target we claim" (lines 292–294; the "Not our runs" sentence comes from the results file).

## 3. Rules a person can read

The tagline promises it: "Computer vision inspection of public infrastructure from photos, with rules you can read." (`web/lib/brand.ts` line 13).

- **So we** state each rule in plain words with its threshold, and show which rule moved the score and by how much.
- **So we never** show a score without the rules behind it, or hide a threshold.
- **Screen:** `/app/roads/rules`, titled "Repair rules you can read", with "The model only finds potholes. These six rules decide how urgent a road segment is. Thresholds are team-defined starting values, not an official standard." (`web/app/app/roads/rules/page.tsx` lines 12–13). Next to the rule cards, the live preview "Re-scores a sample photo as you change values." (`web/components/app/rules-client.tsx` line 122). On a result, the "Why this priority" table reads like "R1 Confidence threshold · 3 of 3 detections at or above 0.40 · 0 points".

## 4. A calm work tool; only the landing page sells

`docs/DESIGN-BRIEF.md` (Direction): "The product is a work tool for a road-maintenance dispatcher, and the landing page is the only place that sells."

- **So we** keep the app to graphite and stone surfaces, one amber accent for actions, severity colours only for severity, and page titles that say what the page is for.
- **So we never** use gradients, glass, emoji icons, fake proof or marketing words (ANTI-SLOP R1–R4 and R11: all 0 on 11 November).
- **Screens:** `/`, the one page that sells: "Inspect roads and signs with clarity." and one primary action, "Analyze a road photo" (`web/app/page.tsx` lines 120 and 130). Against it, `/app/analytics`: the title "Monitoring" and "What to watch after deployment: volume, decisions, confidence drift, latency, and how the trained models compare." (`web/app/app/analytics/page.tsx` line 33).

## 5. Photos stay private by default

- **So we** start on the Mock provider, make the cloud provider a choice, strip GPS by default, and keep history in the user's browser.
- **So we never** send a photo to a hosted model unless the user picks Cloud, or show a photo with a face or a licence plate (`imagery.md`).
- **Screen:** `/app/settings`, the Privacy card: "Road photos can show people, number plates and where they were taken. Restroom images must show signs only, never people." (`web/components/app/settings-client.tsx` line 183), with "Keep photos on this device only" (blocks Cloud) and "Strip GPS from photo metadata" (on by default: `web/lib/store/settings.ts` lines 18–20, provider `mock`, `stripGps: true`). After an analysis the page says "Analysis saved to this browser." (`web/components/app/analyze-client.tsx` line 162).

## Voice

Three words, and what they mean in practice:

| Word | In practice |
|---|---|
| **Plain** | Short sentences in the words a dispatcher or a facilities manager uses: priority, target time, review, verdict, sign. No idioms, so the text translates (Russian and Kazakh later, W-58) |
| **Exact** | Numbers with their unit and their threshold: "24 h", "41 ms", "at or above 0.40", "The limit is 10 MB." |
| **Honest** | Say what is demo, what is a drawing, what failed, and what to do next |

### Do: real strings that follow the voice

| String | File | Why it works |
|---|---|---|
| "Needs a human look" | `web/components/app/analysis-view.tsx` line 95 | Names the next step for a person, not the model state |
| "The local model service is not running or cannot be reached." then "Start it from the api/ folder (uvicorn on port 8000) … You can switch to the mock provider in Settings meanwhile." | `web/lib/providers/http.ts` lines 71–75 | Cause, fix and a way to carry on |
| "The image is 12.3 MB. The limit is 10 MB." | `web/lib/upload.ts` line 10 | The number and the limit, no blame |
| "Samples are drawings, not real photos. Their boxes are fixed in samples.json." | `web/components/app/analyze-client.tsx` line 273 | Says what is not real, where it is chosen |
| "Optional. The rules use them to weigh risk." | `web/components/app/analyze-client.tsx` line 283 | Says why we ask |
| "Thresholds are team-defined starting values, not an official standard." | `web/app/app/roads/rules/page.tsx` line 13 | Claims no more than we know |
| "A prototype, not a city or campus service: anything with a demo or mock badge is invented for the demo." | `web/components/landing/site-footer.tsx` lines 17–18 | The honesty rule in one sentence |

### Don't: real strings to fix

| String | File | Problem | Direction |
|---|---|---|---|
| "Something went wrong while analysing the photo." | `web/app/api/analyze/route.ts` line 104 | No cause, no next step (heuristic 9, HCI p22) | "The photo could not be analysed. Try again, or switch to the mock provider in Settings." |
| "Something went wrong while comparing the signs." | `web/app/api/restroom/route.ts` line 119 | Same | Same pattern |
| "Analysing…" on the "Analyze photo" button | `web/components/app/analyze-client.tsx` lines 320 and 324 | British and US spelling on one button; also "Analyze" in the nav (`web/components/app/nav.ts` line 39) and "Analysed" in the result (`analysis-view.tsx` line 122) | One spelling for the interface; routes such as `/app/roads/analyze` stay as they are |

These are not changed here; they go to the copy owners (W-21, R-12) as one list.

### Names and terms

- The name is "Qarau" in Latin letters. "қарау" appears only where its meaning is explained, as `web/lib/brand.ts` does (`nativeName`, `meaning`).
- Numbers: decimals with a point, two places for thresholds and scores ("0.40", "0.84"), units after a space ("24 h", "41 ms", "10 MB"), dates as "11 Nov, 17:05".

## Open

- The interface spelling (US or British) is not decided yet (R-12).
- The Russian and Kazakh terms for priority, target time, review, verdict and similarity need Tair and a native speaker outside the team (G-69 step 7). Until then no slide shows a translated term.
