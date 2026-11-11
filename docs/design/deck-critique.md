# Deck critique (G-58)

A slide-by-slide review of the defense deck against `docs/design/ANTI-SLOP.md` (rules R1 to R13), `docs/design/chart-style.md` (chart rules CS1 to CS7, numbered as in its "Rules" list) and the slide template (G-10, `docs/design/slide-template/make_slide_template.py`). Reviewed on 11 November 2026 by Dameli, on `main` at the commit that added the deck (`82f2da3`, #403).

This file only comments. The deck, `docs/deck/SLIDES.md` and `docs/deck/make_deck.py` are Tair's and stay unchanged here; every fix below is a suggestion to agree with Roma (deck lane) and Tair (deck script), then make in `make_deck.py` or in the plot scripts.

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
