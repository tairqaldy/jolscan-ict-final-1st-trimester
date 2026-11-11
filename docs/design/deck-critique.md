# Deck critique (G-58)

A slide-by-slide review of the defense deck against `docs/design/ANTI-SLOP.md` (rules R1 to R13), `docs/design/chart-style.md` (chart rules CS1 to CS7, numbered as in its "Rules" list) and the slide template (G-10, `docs/design/slide-template/make_slide_template.py`). Reviewed on 11 November 2026 by Dameli, on `main` at the commit that added the deck (`82f2da3`, #403).

This file only comments. The deck, `docs/deck/SLIDES.md` and `docs/deck/make_deck.py` are Tair's and stay unchanged here; every fix below is a suggestion to agree with Roma (deck lane) and Tair (deck script), then make in `make_deck.py` or in the plot scripts.

## Summary

**18 must-fix, 36 nice-to-have**, over 12 slides and 5 backups.

- Must-fix by kind: 9 unreadable sizes (slides 4 to 10, text and charts), 5 placeholders or stale numbers (slides 2, 8, 9, 10), 3 walls of text (slides 6, 7, 8), 1 number that the figure next to it contradicts (slide 7). No demo number is shown as real, and no slide uses a third type family.
- Numbers: about 200 number tokens on the slide faces and in the scripts were compared with their files. None is wrong. One is stale (the AI-log count on slide 10), and four slots are still empty placeholders.
- Clean: no gradients, glass, shadows, animations, emoji, AI filler words or em dashes; every colour is a template token.

**The three most important fixes**

1. **No placeholder or stale number on screen (R5, R6).** Fill or delete "[NUMBER NEEDED: …]" on slides 2 (R-2, Roma), 8 (C-20, Nazar) and 10 (R-6, Roma) and "[SCREENSHOT NEEDED: …]" on slide 9 (G-11, Dameli), and rebuild after the 23:00 freeze so "50 entries" on slide 10 becomes the final count (53 at the deck's commit, 60 on `main` at 17:27). Findings 2.1, 8.1, 9.1, 10.1, 10.2.
2. **Text the room can read.** Every main slide has body text under 18 pt; slides 4 to 10 have content at 10.5 to 13.5 pt, against the template's 18 pt body and 16 pt tables. Raise the sizes in `make_deck.py` and cut slides 6, 7 and 8 (111, 140 and 101 words of running text) so the larger text fits. Findings 4.1, 5.1, 6.1, 6.2, 7.1, 7.2, 8.2, 8.3, 9.2, 10.3.
3. **Redraw the charts on slides 6, 7 and 8 at slide size with the chart-style block.** Today a 10 pt chart label lands at 4 to 6 pt, slide 6 still uses the old amber `#f2a900`, and slide 7 says "0.78 at the output" where the plot ends at 0.83. Amina (M-13, `ml/plots.py`) and Nazar (C-6). Findings 6.3, 6.4, 7.3, 8.4.

**Not done yet:** the done-check of G-58 also needs these comments resolved with Roma and Tair. That is a conversation, so G-58 stays open until they have answered each must-fix here or in the pull request.

**Who changes what.** All slide text comes from `docs/deck/make_deck.py` (Tair). The speaker of a slide owns what it says (`docs/PRESENTATION.md`, "Slides"). The charts come from `ml/plots.py` (Amina, M-13) and `ml/restroom/plots.py` and `ml/restroom/layers_report.py` (Nazar, C-6).

**Severity.**

- **Must-fix:** a number that is wrong, stale, missing its source or still a placeholder; a demo number shown as real; unreadable size; more type families than R8 allows; a wall of text.
- **Nice-to-have:** everything else: sizes between 14 and 17.5 pt, chart style, wording, consistency.

**Lines used for the size and text checks.**

- Size: the template sets body text at 18 pt, tables at 16 pt and titles at 36 pt (`make_slide_template.py`, `text(... size=18)` and the table cells at 16). On slides 1 to 12, text the audience needs that is **below 14 pt** counts as unreadable (must-fix); **14 to 17.5 pt** is nice-to-have. The slide is 13.33 in wide, so 18 pt here is already smaller on screen than 18 pt on an old 10 in slide. Backups (B1 to B5) are shown only on request, so small text there is nice-to-have. The footer (10 pt) and the eyebrow label (12 pt caps) are template chrome and are not counted.
- Wall of text: more than 100 words of running text on one of slides 1 to 12, not counting tables, diagram labels and the footer.
- Fonts: R8 allows two families, one for text and one for numbers and code. The deck uses Overpass and JetBrains Mono, as the template does, so two families pass. Text inside raster charts is judged by chart-style.md, which accepts DejaVu Sans as a fallback.

## How the deck was checked

1. **python-pptx (1.0.2, scratch environment).** For every slide: each text run's font family and size, the word count, the number of pictures with their placed size, and every run under 18 pt. Results are in "Measurements" below.
2. **Slide XML.** Searched every `ppt/slides/slide*.xml` for gradients (`gradFill`), transparency and blur (`a:alpha`, `blur`, `softEdge`, `outerShdw`), transitions and animations (`p:transition`, `p:timing`), colours outside the G-10 palette, letter spacing values (`spc`) and corner shapes (`roundRect` adjustments). Slide text was searched for emoji (the R3 pattern), the R11 word list and em dashes.
3. **Numbers.** Every number token on the 17 slide faces and every number in the scripts was compared by hand with the file the `Sources:` line names: `ml/results/experiments.csv`, `ml/results/operating_point.json`, `ml/results/pothole_area_clusters.json`, `data/exports/potholes_yolo_v1/split_manifest.json` and `data.yaml`, `ml/results/runs/E0.json`, `ml/results/restroom/experiments.csv`, `ml/results/restroom/runs/R0.json`, `R1.json`, `R3.json`, `R4.json`, `ml/results/restroom/pipeline.json`, `ml/results/restroom/layer_probe.json`, `web/data/restroom-experiments.json`, `web/data/experiments.json`, `web/lib/rules/config.ts`, `data/README.md`, `docs/DESIGN-BRIEF.md` and `docs/AI-USAGE-LOG.md`. This is a second check, separate from the one `make_deck.py` runs at build time (`docs/research/deck-sources.md`).
4. **Charts.** Each embedded figure was opened from `ml/results/` and compared with chart-style.md. Its drawn width (pixels divided by the DPI stored in the PNG) against its placed width on the slide gives the size a 10 pt label ends up at.
5. **Rendering: not done.** Quick Look (`qlmanage -t` on one-slide copies of the deck) produced no image in two minutes and was stopped. LibreOffice is not installed and Keynote cannot be scripted here. Overpass and JetBrains Mono are also not installed on this Mac, so a local render would have shown substitute fonts anyway. Instead, text overflow was estimated from box sizes (character count × font size against box width and height); two boxes came out as possible overflows and are named under slides 4 and 9.

**Clean results (no finding):** no gradients, no transparency, blur or shadows, no transitions or animations (R1, R2, R7); no emoji, no R11 words, no em dashes (R3, R11); every colour is a G-10 token, including the brand amber `#F2A900` on the mark and the road band (R10); one letter-spacing value, `spc="200"`, used only by the eyebrow label, so there is one label style (R12); rounded cards use two corner values plus the full pill and the mark (R9); two type families on every slide, every run with an explicit font (R8); no testimonials, logos or "trusted by" lines (R4).

## Measurements

"Words" counts all text on the slide face, footer included. "Running text" leaves out tables and diagram labels. Every slide except 1 and 12 also has the footer and slide number at 10 pt and the eyebrow at 12 pt; they are not repeated in the last column.

| Slide | Speaker | Words | Running text | Pictures | Fonts | Sizes used (pt) | Text under 18 pt (content only) |
|---|---|---:|---:|---:|---|---|---|
| 1 Title | Tair | 60 | 53 | 0 | Overpass, JetBrains Mono | 12, 12.5, 13, 17, 26, 72 | eyebrow 12, course line 13, names 17, roles 12.5 |
| 2 Problem | Roma | 76 | 59 | 0 | Overpass, JetBrains Mono | 10, 12, 13, 19, 24, 30 | gap box 13 |
| 3 Live demo | Tair | 67 | 48 | 0 | Overpass, JetBrains Mono | 10, 14, 16, 17, 24, 30, 36 | "LIVE DEMO" 14, step lines 17, real/demo line 16 |
| 4 How it works | Alizhan | 130 | 113, mostly diagram labels | 0 | Overpass, JetBrains Mono | 10, 10.5, 11, 11.5, 12, 13, 14.5, 18, 30 | arrow labels 10.5, endpoints 11 and 11.5, box text 13, providers line 14.5, latency line 13 |
| 5 Roads data | Amina | 165 | 98 (+48 in the table) | 0 | Overpass, JetBrains Mono | 10, 11, 12, 12.5, 13, 15, 20, 30 | data list 15, run table 12.5 (header 11), rule lines 13 |
| 6 Roads results | Amina | 170 | 111 (+33) | 1 chart, 5.70 in | Overpass, JetBrains Mono | 10, 11, 12, 12.5, 13, 13.5, 14, 28 | table 13 (header 11), result line 13.5, honesty line 12.5, rules card 12 and 14 |
| 7 Restrooms data | Nazar | 160 | 140 | 1 chart, 8.63 in | Overpass, JetBrains Mono | 10, 12, 12.5, 14, 15, 30 | task and data 15, methods 12.5 and 14, probe line 12.5 |
| 8 Restrooms results | Nazar | 160 | 101 (+37) | 1 chart, 5.07 in | Overpass, JetBrains Mono | 10, 11, 11.5, 12, 12.5, 28 | table 12.5 (header 11), notes 11.5 and 12.5, caption 11.5, gap box 11.5 |
| 9 Design | Dameli | 120 | 107 (36 are placeholders) | 0 | Overpass, JetBrains Mono | 10, 12, 13.5, 15, 30 | captions 13.5, placeholders 12, chart and accessibility lines 15 |
| 10 AI use | Roma | 124 | 103 (20 are a placeholder) | 0 | Overpass, JetBrains Mono | 10, 12, 13, 15, 16, 19, 30 | bullets 15, tools line 13, audit head 16, gap box 13 |
| 11 Limits | Roma | 101 | 81 | 0 | Overpass, JetBrains Mono | 10, 12, 15, 19, 26, 30 | body 15 |
| 12 Closing | Tair | 48 | 44 | 0 | Overpass, JetBrains Mono | 12, 15, 15.5, 17, 40 | labels 17, links 15.5, real/demo line 15 |
| B1 Metrics | Amina | 168 | 27 (+124) | 0 | Overpass, JetBrains Mono | 10, 10.5, 11.5, 12, 28 | table 11.5 (header 10.5), note 12 |
| B2 Operating point | Amina | 69 | 29 (+22) | 2 charts, 4.56 and 4.05 in | Overpass, JetBrains Mono | 10, 11, 12, 12.5, 14, 28 | table 14 (header 11), caption 12.5 |
| B3 Curves | Amina | 43 | 27 | 1 chart, 11.77 in | Overpass, JetBrains Mono | 10, 12, 15, 28 | caption 15 |
| B4 Size bands | Amina | 50 | 32 | 1 chart, 8.04 in | Overpass, JetBrains Mono | 10, 12, 14, 28 | text 14 |
| B5 Restroom approaches | Nazar | 49 | 32 | 1 chart, 8.44 in | Overpass, JetBrains Mono | 10, 12, 13.5, 28 | text 13.5 |

Text size inside the charts, for a label drawn at matplotlib's default 10 pt:

| Slide | Figure | Drawn width | Placed width | A 10 pt label lands at |
|---|---|---:|---:|---:|
| 6 | `ml/results/fig_runs_map50_recall.png` (2740 px, 200 dpi) | 13.7 in | 5.70 in | 4.2 pt |
| 7 | `ml/results/restroom/figs/layer_probe.png` (2800 px, 200 dpi) | 14.0 in | 8.63 in | 6.2 pt |
| 8 | `ml/results/restroom/figs/runs_matching.png` (1986 px, 200 dpi) | 9.93 in | 5.07 in | 5.1 pt |
| B2 | `ml/results/fig_champion_pr_curve.png` (2250 px, 250 dpi) | 9.0 in | 4.56 in | 5.1 pt |
| B2 | `ml/results/fig_champion_confusion_at_040.png` (3000 px, 250 dpi) | 12.0 in | 4.05 in | 3.4 pt |
| B3 | `ml/results/fig_curves.png` (3000 px, 200 dpi) | 15.0 in | 11.77 in | 7.8 pt |
| B4 | `ml/results/figs/pothole_area_clusters.png` (1536 px, no DPI stored) | unknown | 8.04 in | about 5 to 8 pt |
| B5 | `ml/results/restroom/figs/approaches.png` (2000 px, 200 dpi) | 10.0 in | 8.44 in | 8.4 pt |

## Deck-wide findings

These have no single slide. The size and chart findings that repeat on many slides are listed per slide below; the shared cause and the single fix are here.

- **Shared cause of the size findings (counted per slide).** `make_deck.py` sets body text at 12 to 15 pt (`rich(... size=16)` is overridden to 12 to 15 on most slides), tables at 11.5 to 13 pt (`table(... size=13)`) and titles at 28 to 30 pt, against the template's 18, 16 and 36. One fix covers most of it: raise those defaults in `make_deck.py` and cut the text the larger size no longer fits (slides 6, 7 and 8 below say what to cut).
- **Shared cause of the chart findings (counted per slide).** The plots were drawn before chart-style.md (G-52) existed, at 10 to 15 in wide, and are shrunk onto the slide. One fix: paste the chart-style block into `ml/plots.py` (M-13) and `ml/restroom/plots.py` / `layers_report.py` (C-6), set `figsize` to the placed size (5.7 × 2.3 in on slide 6, 8.6 × 2.6 in on slide 7, 5.1 × 2.4 in on slide 8), and add the source line.
- **D1 · Nice-to-have · fonts on the presenting laptop.** Overpass and JetBrains Mono are not installed on this Mac (`~/Library/Fonts`, `/Library/Fonts` and matplotlib's font list have neither), and the deck's theme font is Calibri. Opened in Keynote or PowerPoint here, every line would reflow in a substitute font. **Fix:** present from Canva (both are Google Fonts there) or from a PDF exported from Canva, and check one slide on the presenting laptop (DESIGN-BRIEF.md, "After import").
- **D2 · Nice-to-have · total time.** `SLIDES.md` estimates 8:14 against the 8:00 target, inside a 10-minute slot that also holds 2 to 3 minutes of questions (`docs/PRESENTATION.md`). Over budget: slide 4 (0:42 for 0:40), 7 (0:53 for 0:50), 9 (0:43 for 0:35), 10 (0:37 for 0:35), 11 (0:27 for 0:25). **Fix:** cut 15 s, starting with slide 9 (finding 9.5).
- **D3 · Nice-to-have · backup list.** `docs/PRESENTATION.md` lists "architecture diagram in detail" first among the backups; it is ready as `docs/design/architecture-detail.svg` (G-66) but is not in the deck. **Fix:** add it as B6 from the PNG export (`docs/design/render_svg.py`), with the alt text in `docs/design/architecture-diagram.md`.

## Slide 1 · Title (Tair, 0:15)

**Passes:** the name, "Kazakh for “to inspect”" and the tagline match `web/lib/brand.ts`; the six names and roles match `web/lib/team.ts`; no number to check; the mark is drawn from shapes, no decorative image (R4, R5).

- **1.1 · Nice-to-have · Size.** The six roles ("Web app and coordination", "Design system and visuals", ...) are 12.5 pt and the course line "ICT1103 · QAIRU · Assignment #2 · Computer Vision · 12 November 2026" is 13 pt. Nobody needs to read them for the point, so this is not must-fix. **Fix:** roles and course line at 16 pt.

## Slide 2 · Problem (Roma, 0:35)

**Passes:** the title states the point; two cards, no image (R1 to R4); the cue says "Until then, say no number aloud", so the script does not invent one (R6).

- **2.1 · Must-fix · R5, R6 · placeholder for the one number.** The Roads card shows the box "[NUMBER NEEDED: one sourced statistic on road damage, with unit, year, country and source (R-2, #84)]" (13 pt), and the script reads the same text. `docs/research/deck-sources.md`, section "Slide 2", still says "not chosen yet". **Fix:** Roma fills it from R-2 with the quote and source in deck-sources.md, or the box and the script sentence are deleted before export.
- **2.2 · Nice-to-have · R6 · unsourced claim.** "Restrooms: Confusing door signs are not tracked anywhere, so nobody reports them." is a claim about the world with no source. **Fix:** "We found no place where confusing door signs are reported."

## Slide 3 · Live demo (Tair, 1:30)

**Passes:** the line "Real, on this laptop: both analyses and the model page. Demo data: the overview tiles and charts, marked with a badge." is the honesty rule on the slide itself (R13), and it matches `docs/PRESENTATION.md` (demo script, step 5); the champion name in the cues, `jolscan-e1`, matches `championModelName` in `web/data/experiments.json`.

- **3.1 · Nice-to-have · Size.** "A road photo → boxes, a severity and the rules that fired" and "Two door signs → their genders, how alike they are, and a verdict" are 17 pt, the real/demo line 16 pt. **Fix:** both at 18 pt or more; the dark slide has room.
- **3.2 · Nice-to-have · typo.** Two spaces in "the model page.  Demo data". **Fix:** one space.

## Slide 4 · How it works (Alizhan, 0:40)

**Passes:** "25.7 ms per image" matches the R1 row of `ml/results/restroom/experiments.csv` (latencyMs 25.7, Apple M5 CPU), which is the model `api/restroom.py` serves; the cloud chip says "opt-in, not used today", which is true while S-7 is open; no pothole latency is shown because `ml/results/latency.json` does not exist (R6).

- **4.1 · Must-fix · Size.** The diagram labels are 10.5 to 13 pt: the arrow labels "photo or sign pair", "picks a provider", "detections as JSON", "result: severity or verdict, rules fired" (10.5), the provider notes "demo data, offline", "this laptop", "opt-in, not used today" (10.5), the endpoints "/api/analyze", "/restroom/compare", "/restroom/match" (11.5) and "R1–R6  web/lib/rules" (11); the latency line is 13 pt. The box with "result: severity or verdict, rules fired" may also overflow (about 0.88 in of text in a 0.70 in box, estimated). **Fix:** replace the drawn diagram with `docs/design/architecture-slide.svg` (G-66), placed at the full slide width with the title written into its empty top-left corner (x below 1240, y below 290). Even then its 22 to 26 px labels land at 11 to 13 pt, so Dameli enlarges them to 30 px first (G-66 follow-up).
- **4.2 · Nice-to-have · one point per slide.** The line "mock: offline demo data · local: the model on this laptop, photos stay here · cloud: designed and opt-in, photos would leave the device; not used in this demo" (14.5 pt) repeats the three provider chips, and the script says it too. **Fix:** delete the line; keep it in the notes.
- **4.3 · Nice-to-have · R6 · context of the one number.** "Restroom model as served (zero-shot CLIP ViT-B/32): 25.7 ms per image, batch 1, laptop CPU (Apple M5 CPU)." sits on a slide whose script follows a road photo, so it can be heard as the road latency. **Fix:** "Restroom model (CLIP ViT-B/32) on the laptop CPU: 25.7 ms per image. Pothole latency is not measured yet."

## Slide 5 · Roads: data and experiment (Amina, 1:00)

**Passes:** every number matches its file: 665 photos and 1,739 boxes (sum of `image_counts` and `object_counts` in `split_manifest.json`; `data/README.md` explains the 1,740 to 1,739 change), 465 / 100 / 100 photos and 1,198 / 305 / 236 boxes, seed 42, one class in `data.yaml`, 40 epochs, 640 px, batch 16 and lr 0.01 in `runs/E0.json`, confidence 0.40 in `operating_point.json`, the 0.01 tie band in the selection rule. The licence line and "Duplicates checked before the split (exact and perceptual hash): none found" match the data card (D-1, D-4). No dataset photo is shown, so the watermark rule (D-12) holds. The run labels are the `changed` column of `experiments.csv` word for word.

- **5.1 · Must-fix · Size.** The run table is 12.5 pt with an 11 pt header, and "Fixed unless the row says otherwise: 40 epochs, 640 px, batch 16, seed 42, SGD with lr 0.01, COCO-pretrained." and "Chosen on validation mAP50; ties within 0.01 broken by validation recall at confidence 0.40; test read once." are 13 pt. These carry the experiment design Amina talks over. **Fix:** table at 16 pt with short labels ("small model", "random weights", "frozen backbone", "AdamW", "no augmentation", "960 px", "extra P2 scale", "= E0"; the full `changed` text stays on B1), and the two rule lines at 18 pt.
- **5.2 · Nice-to-have · one point per slide.** The data card has five bullets at 15 pt. **Fix:** three bullets: source and licence in one, "665 photos, 1,739 boxes, 1 class" in one, the split with the duplicate check in one; `potholes_yolo_v1` moves to the notes.
- **5.3 · Nice-to-have · title.** "Roads: one dataset, 9 runs, one change each": E0 is the baseline and E8 changes nothing ("no change qualified, E0 settings"), so seven runs change one thing. **Fix:** "Roads: one dataset, a baseline and 7 one-change runs".

## Slide 6 · Roads: results and rules (Amina, 0:45)

**Passes:** all 18 table values match `ml/results/experiments.csv` (`valMap50`, `map50`); "recall 0.746 (176 of 236), precision 0.854 (176 of 206), 30 false alarms" match `operating_point.json` (0.7458, 0.8544, tp 176, fp 30); "E4 is 0.016 higher" is 0.8313 − 0.8155; the bands 1.15 % and 7.27 % match `pothole_area_clusters.json` and `web/lib/rules/config.ts`; the worked example (4 × 1.5 + 2 × 1.5 + 1 = 10, × 1.5 = 15, critical from 9, repair within 24 h) matches `config.ts`. In the script, 0.828, 0.738 and the five runs E0, E1, E4, E6, E8 match the CSV. The title states the takeaway, and the slide says test never chooses.

- **6.1 · Must-fix · wall of text.** 111 words of running text plus a 10-row table, a chart and a five-line worked example: four blocks for 45 seconds. **Fix:** keep the table, the chart and the line "E1 on test at confidence 0.40: recall 0.746 (176 of 236), precision 0.854 (176 of 206), 30 false alarms."; move the rules card to B4 (which already has the bands) and leave only "Score 15 → critical: repair within 24 h" here.
- **6.2 · Must-fix · Size.** Table 13 pt (header 11), result line 13.5 pt, "E4 is 0.016 higher on test mAP50. Differences below 0.02 on test are not claimed, and test never chooses." 12.5 pt, rules card 12 pt. **Fix:** after 6.1, table at 16 pt and the result and honesty lines at 18 pt.
- **6.3 · Must-fix · Size · chart.** `fig_runs_map50_recall.png` is drawn 13.7 in wide and placed 5.70 in wide, so its labels land at about 4 pt: the bar values and run names cannot be read from the room. **Fix:** redraw at 5.7 × 2.3 in with the chart-style block (M-13), or give the chart the full right half.
- **6.4 · Nice-to-have · chart-style "Values" and CS3.** The E1 bars are `#f2a900` and `#f8d37f`, the old amber chart-style.md replaces with `#b87f00` because it measures 2.01:1 on white. **Fix:** `CHAMPION_COLOUR = "#b87f00"` in `ml/plots.py` (line 28 still says `"#f2a900"  # --accent`); the same line fixes B3.
- **6.5 · Nice-to-have · CS7.** No source line under the plot. **Fix:** "Source: ml/results/experiments.csv, test split."
- **6.6 · Nice-to-have · CS1.** The figure title "Pothole runs; E1 chosen on validation" sits over test bars in which E4 is tallest, so title and bars seem to disagree. **Fix:** "On test, E1 and E4 are within 0.02; E1 was chosen on validation".
- **6.7 · Nice-to-have · consistency.** The chart's recall bars are `recallAtRulesConf` (Ultralytics' pass, IoU 0.45, E1 0.7542), the text's recall is `operating_point.json` (IoU 0.5, E1 0.7458). Both show as 0.75 at two decimals, so nothing clashes on screen, but the cue says the operating point is the slide number. **Fix:** say it in the source line: "recall: Ultralytics' pass, IoU 0.45".
- **6.8 · Nice-to-have · wording.** The script says "But 5 runs are within 0.01 of it", and "it" is E4, one of the five. **Fix:** "Four other runs are within 0.01 of it".

## Slide 7 · Restrooms: data and experiment (Nazar, 0:50)

**Passes:** 82 restrooms × 4 icons (328 images), 10 queries and 20 gallery icons, 30 queries and 60 gallery icons, and CC-BY-4.0 match the restroom card in `data/README.md`; 200 training episodes matches `pipeline.json` (`protocol.train_episodes`); 0.95 at blocks 7, 8 and 10, 0.78 at the output and 0.77 at block 12 match `layer_probe.json`; the slide and the cue keep R2 to R4 (fine-tuned CLIP) apart from the R7 pipeline (SIFT, no training).

- **7.1 · Must-fix · wall of text.** 140 words of running text (task line, data line, three method entries with a second line each, the layer-probe sentence) plus a three-panel figure, for 50 seconds. **Fix:** task in one line; data as "82 training restrooms; 10 validation and 30 test queries; CC-BY-4.0"; the three groups as three labels without the second lines; the layer-probe sentence becomes the figure caption or goes to the notes.
- **7.2 · Must-fix · Size.** The method lines ("ViT-B/16 (R0), ViT-B/32 (R1): IOAI's baseline method", ...) and the layer-probe sentence are 12.5 pt; `layer_probe.png` is drawn 14 in wide and placed 8.63 in wide, so its labels land at about 6 pt. **Fix:** text at 18 pt after 7.1; redraw the figure at 8.6 × 2.6 in, or show only the "original → its partner" and "Gender" panels.
- **7.3 · Must-fix · number does not match the figure.** The slide says partner matching "drops to 0.78 at the output", but `layer_probe.png` does not plot the output ("final" is left out in `ml/restroom/layer_probe.py`, line 96) and its partner line ends at 0.83 (block 12, 0.8293). The room sees 0.83 where the slide says 0.78. **Fix:** "drops to 0.83 at block 12", or add the final point to the plot.
- **7.4 · Nice-to-have · wording.** "Gender is readable only at the last block (0.77)": block 11 already reaches 0.67 against a chance of 0.5, and slide 8 gives 0.741 for a probe on the same model's final embedding. **Fix:** "Gender rises to 0.77 only in the last block", and slide 8 names which embedding its probe uses (8.7).
- **7.5 · Nice-to-have · text and figure use different units.** "(0.95 at blocks 7, 8 and 10)" but the x axis is "depth: share of the network's blocks / stages, %". **Fix:** "at 60 to 80 % depth (blocks 7, 8 and 10 of 12)".
- **7.6 · Nice-to-have · chart style.** The figure uses its own blue and orange instead of the series tokens, draws grid lines on both axes (CS4), runs the x axis to 135 % with a "120" tick (`set_xlim(0, 135)`), has a descriptive title "What each layer of a frozen network knows (no training)" (CS1), a footnote without a file name (CS7), and a ResNet50 series the slide never mentions. **Fix:** chart-style block, ticks to 100, title "Partner matching peaks mid-network; gender only at the end", "Source: ml/results/restroom/layer_probe.json", and drop ResNet50 or name it.

## Slide 8 · Restrooms: results (Nazar, 0:50)

**Passes:** 8/10 and 23/30 (R0), 10/10 and 27/30 (R3), 10/10 and 30/30 (R4), 10/10 and 30/30 (R7) match the run files and `pipeline.json`; 0.767, 0.900 and 1.000 match `matchTop1Test`; 0.77 and 0.90 match `reference` in `web/data/restroom-experiments.json` and are labelled as IOAI's numbers, not ours; 0.033 is 1/30; 0.756, 0.741 and 328 signs match `runs/R1.json`. The benchmark caveat ("A real building gives neither.") is on the slide, and nothing says we beat the IOAI best.

- **8.1 · Must-fix · R5, R6 · placeholder.** The box "[NUMBER NEEDED: 95 % intervals for 30/30 and 27/30 and the paired test, ml/results/restroom/intervals.json (C-20, #201)]" (11.5 pt) is on the slide and in the script; `intervals.json` is not on `main`. **Fix:** fill it from C-20, or delete the box and say the cue's fallback: "thirty queries cannot separate the pipeline from R3 or R4".
- **8.2 · Must-fix · wall of text.** 101 words of running text plus a 7-row table, a chart, a caption and the gap box. **Fix:** delete "Highlighted: R3, chosen among the runs on validation (gender breaks the tie); R7, the matching method chosen on training episodes." and show the highlight in the table with a filled row instead of bold; shorten the gender line (8.7).
- **8.3 · Must-fix · Size.** Table 12.5 pt (header 11), notes 11.5 and 12.5 pt, caption "Dashed lines: IOAI's published numbers on the same test set, not our runs." 11.5 pt. **Fix:** after 8.2, table at 16 pt, "One test query is worth 0.033." and the caveat at 18 pt.
- **8.4 · Must-fix · Size · chart.** `runs_matching.png` is drawn 9.93 in wide and placed 5.07 in wide, so its labels land at about 5 pt. **Fix:** redraw at 5.1 × 2.4 in with the chart-style block (C-6), showing only the rows in the table.
- **8.5 · Nice-to-have · chart-style "Values" and CS3.** Validation is blue `#2a78d6` and test orange `#eb6834`, not the series tokens, and no bar is highlighted although the slide highlights R3 and R7. **Fix:** validation in `--chart-1`, test in `--chart-3`, and `#b87f00` on the one run the team chooses as the headline (R-3 step 4, still open).
- **8.6 · Nice-to-have · CS7.** No source line under the plot. **Fix:** "Source: ml/results/restroom/experiments.csv and pipeline.json."
- **8.7 · Nice-to-have · which model.** The gender numbers 0.756 and 0.741 are R1 (ViT-B/32, the served model), but the table's zero-shot row is R0 (ViT-B/16, whose prompts give 0.771 and probe 0.774), and slide 7 says 0.77. **Fix:** "Gender of one sign, ViT-B/32 (the served model): prompts 0.756, probe 0.741".
- **8.8 · Nice-to-have · title.** "Restrooms on 30 test queries: zero-shot 23, fine-tuned R3 27, two-step pipeline 30" leaves out R4, a fine-tuned run that also gets 30/30, so it reads as if fine-tuning tops out at 27. **Fix:** once the headline is decided, "Restrooms, 30 test queries: zero-shot 23, fine-tuned 27 (R3) to 30 (R4), pipeline 30".

## Slide 9 · Design decisions (Dameli, 0:35)

**Passes:** 4.98:1, 5.36:1 and 4.5:1 match the contrast audit in `docs/DESIGN-BRIEF.md` (the lowest text token, `subtle`, in each theme) and U4; the keyboard claim matches the check recorded in `docs/PRESENTATION.md` ("checked on 11 November"); the chart line matches the deck's own chart rules; the cue reminds that a seeded screenshot needs its Demo badge (R13). The running text is 107 words only because 36 of them are placeholders.

- **9.1 · Must-fix · R5 · placeholders.** Three boxes "[SCREENSHOT NEEDED: 09-heuristic-1-status.png from G-11, put it in docs/deck/screenshots/]" (and `-2-recover`, `-3-recognition`); `docs/deck/screenshots/` does not exist on `main`. `docs/PRESENTATION.md` says the screenshots are "kept outside the repository and sent to the deck folder", while `make_deck.py` looks in `docs/deck/screenshots/`. **Fix:** Dameli takes the three 570×405 px light-theme screenshots (G-11; they show drawn samples, no people), and either commits them to `docs/deck/screenshots/` so Tair can rebuild, or places them in Canva; agree which with Tair.
- **9.2 · Must-fix · Size.** The three captions ("Visibility of system status: the provider and its connection are always shown.", ...) are 13.5 pt. **Fix:** 18 pt, cut to the heuristic name and one short clause ("Visibility of system status: provider and connection always shown").
- **9.3 · Nice-to-have · wrong word.** "Recognition over recall: six labelled sample photos next to the upload box." The six samples (`web/public/samples/s01-…svg` to `s06-…svg`) are drawn illustrations, not photos (`data/README.md`: "the app's public sample images are drawn illustrations"). **Fix:** "six labelled sample images", here and in `docs/PRESENTATION.md`, "Slide 9".
- **9.4 · Nice-to-have · scope of a number.** "text contrast at least 4.98:1 (light) and 5.36:1 (dark)": the audit is titled "preliminary" and covers text tokens on `--bg` and `--surface` only. **Fix:** "text on page and card backgrounds: at least 4.98:1 (light) and 5.36:1 (dark)".
- **9.5 · Nice-to-have · time.** The script is 94 words, 0:43 at 130 words per minute, for a 0:35 slot; `docs/PRESENTATION.md` calls the same text "about 35 seconds". **Fix:** cut about 18 words: drop "using three of Nielsen's heuristics" (the slide shows them) and "in plain words", and end with "Charts start at zero, and every text colour passes WCAG AA in both themes." instead of the 23-word sentence about bars and four and a half to one.

## Slide 10 · AI use and its limits (Roma, 0:35)

**Passes:** the tools named, "Claude Code, Codex, GitHub Copilot", are exactly the tools in the entries of `docs/AI-USAGE-LOG.md`; `docs/research/deck-sources.md` exists; the cue gives a fallback if R-6 does not land and forbids audit numbers that are not in a file (R6).

- **10.1 · Must-fix · R6 · stale number.** "Whoever used a tool checks the output and logs how: 50 entries in docs/AI-USAGE-LOG.md", and "50 entries" in the script. Counted the same way as `make_deck.py` (`### ` headings under "Entries"), the log had 53 entries at the deck's own commit `82f2da3` and 60 on `origin/main` at 17:27 Almaty, and it grows with every pull request today. **Fix:** rebuild the deck after the 23:00 freeze so the count is final, or drop the count: "every use is logged with its prompt and how it was checked".
- **10.2 · Must-fix · R5, R6 · placeholder.** "Audit of two vision-language models: [NUMBER NEEDED: R-6 (#85) audit: count error of two vision-language models on screened test photos, docs/research/vlm-evaluation.md is not on main]" (13 pt), also in the script; the file is still not on `main`. **Fix:** fill it from R-6, or follow the cue: remove the block and say "We planned an audit of two vision-language models; it is not finished, so we show no numbers."
- **10.3 · Must-fix · Size.** "Tools named in the log: Claude Code, Codex, GitHub Copilot." is 13 pt; the six bullets are 15 pt. **Fix:** bullets at 18 pt; the tools line becomes the head of the "What for" card.
- **10.4 · Nice-to-have · claim wider than its source.** "Every number on these slides traced to a committed result file": slide 9's numbers come from `DESIGN-BRIEF.md`, this slide's count from the AI log, and slide 2's will come from an outside source. All are traced in `deck-sources.md`, but not all to result files. **Fix:** "traced to a committed file (docs/research/deck-sources.md)".

## Slide 11 · Limitations and next steps (Roma, 0:25)

**Passes:** "82 training restrooms" matches the restroom card; the three limits match `docs/RULES.md` ("Known limits"), `docs/ML-EXPERIMENT.md` ("Limits to state": "The dataset is not from Kazakhstan. Performance on local roads, snow and night scenes is unknown.") and `docs/ML-EXPERIMENT-RESTROOM.md`; numbered list, no image; next steps name their task (C-8).

- **11.1 · Nice-to-have · Size.** Body text is 15 pt ("A far pothole looks small and a close-up fills the frame. Real size needs camera calibration or depth.", ...). **Fix:** 18 pt; to make room, drop "a close-up fills the frame" and "snow and night scenes are untested" (both are said aloud).

## Slide 12 · Closing (Tair, 0:10)

**Passes:** every path on the slide exists on `main` (`ml/results/experiments.csv`, `ml/results/restroom/experiments.csv`, `docs/AI-USAGE-LOG.md`, `docs/CONTRIBUTION-LOG.md`); "qarau.vercel.app (real model page; analyses there run on demo data)" and the real/demo line repeat slide 3 (R13); no number.

- **12.1 · Nice-to-have · Size.** The labels are 17 pt, the links 15.5 pt and "Real: both analyze flows on this laptop and the model page. Demo data: the overview tiles and charts, marked with a badge." 15 pt. The slide stays up through the questions. **Fix:** links and labels at 18 to 20 pt.

## B1 · Full pothole metrics table (Amina, on request)

**Passes:** all 72 numbers match `ml/results/experiments.csv` (sizes rounded to one decimal, 5.44 → 5.4, 5.49 → 5.5); the note "Precision and recall at 0.40 here are Ultralytics' own pass (IoU 0.45). The operating point on slide 6 is ml/operating_point.py (IoU 0.5). Latency: not measured yet (S-15)." explains the one place two files disagree and does not invent a latency.

- **B1.1 · Nice-to-have · Size.** Nine columns at 11.5 pt with a 10.5 pt header. **Fix:** drop the "What changes" column (slide 5 has it) and set the numbers at 14 pt.
- **B1.2 · Nice-to-have · `SLIDES.md` wording.** `SLIDES.md` says "Every column of ml/results/experiments.csv except latency (empty) and device", but the table also leaves out `precision`, `recall` (Ultralytics' own threshold) and `datasetVersion`. **Fix:** in `make_deck.py`, "All 9 runs; the columns used in the talk".

## B2 · Operating point (Amina, on request)

**Passes:** 100, 236, 176, 30, 60, 0.854, 0.746 and 0.796 match `operating_point.json`; the caption says why the figures count differently.

- **B2.1 · Nice-to-have · two answers on one slide.** The confusion matrix shows 178 / 34 / 58 next to the table's 176 / 30 / 60. The caption explains it, but a reader sees two sets of counts first. **Fix:** drop the confusion matrix (the table is the operating point) or give it its own backup.
- **B2.2 · Nice-to-have · chart style and size.** Both figures are Ultralytics' default plots: pure blue `#0000ff` and the Blues colormap, titles "Precision-Recall Curve" and "Confusion Matrix" (CS1), no source line (CS7), Arial. Placed 4.56 in and 4.05 in wide, their labels land at about 5 pt and 3 pt. **Fix:** redraw the PR curve from the saved predictions with the chart-style block (M-13), or accept it as a backup that is zoomed when asked.

## B3 · Training curves (Amina, on request)

**Passes:** the claim on the slide ("In E5 the training loss keeps falling while the validation loss stays flat") can be seen in the plot; y axis from 0; train and validation are named in a legend.

- **B3.1 · Nice-to-have · chart style.** The figure has panel labels but no takeaway title (CS1), draws validation in the old amber `#f2a900`, and has no source line (CS7). **Fix:** chart-style block, title "Without augmentation (E5), training loss keeps falling and validation does not", "Source: ml/results/runs/E0-, E2-, E5-results.csv".

## B4 · k-means size bands (Amina, on request)

**Passes:** k = 3, 465 photos, 1,198 boxes and 429 / 499 / 270 match `pothole_area_clusters.json`; "Bands are shares of the image, not physical size." states the limit.

- **B4.1 · Nice-to-have · default chart.** `pothole_area_clusters.png` is matplotlib's default style (`#1f77b4`, a box on all four sides, centred title): the one chart in the deck that looks unchosen. Its cut lines are labelled "0.01148" and "0.07270" while slides 6 and B4 say 1.15 % and 7.27 %, and the bars are not split by group although the text gives the group counts. The script that drew it is not in the repository (D-29). **Fix:** redraw with the chart-style block, label the cuts "1.15 %" and "7.27 %", colour the three groups, add "Source: ml/results/pothole_area_clusters.json".

## B5 · Restroom approaches (Nazar, on request)

**Passes:** 0.3, 0.7, 0.960 and 0.041 match `pipeline.json` (`histogram_weight`, `train_episodes.sift_combo_hungarian.top1`); error bars are ±1 standard deviation and say so; the footnote states how the champion was chosen.

- **B5.1 · Nice-to-have · chart style.** The champion bar is dark blue `#2a78d6` and the others light blue, instead of `#b87f00` on the champion and `--chart-1` for the rest (CS3); the footnote names no file (CS7). **Fix:** chart-style block and "Source: ml/results/restroom/pipeline.json".
