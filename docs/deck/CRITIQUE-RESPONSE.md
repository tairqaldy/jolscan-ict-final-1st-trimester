# Response to the deck critique (G-58)

Answers to `docs/design/deck-critique.md`, item by item. All changes are in `docs/deck/make_deck.py`; the deck, `docs/deck/SLIDES.md` and the "Numbers on slides" block in `docs/research/deck-sources.md` are regenerated from it. Every number is still read from its file at build time, and the build still stops on a mismatch or an ambiguous rounding.

Two new build checks came out of the critique:

- No text the room needs on slides 1 to 12 below 14 pt. The footer, slide number and eyebrow are exempt. Body text is 18 pt and tables are 16 pt, as in the template.
- The charts on slides 6, 7 and 8 (and backups B3 and B5) are drawn by `make_deck.py` at exactly the size they are placed, with the chart-style block (G-52). Their colours are read from `web/app/tokens.css`. The build stops if the highlight is not `--accent` = `--chart-2` or is still the old `#f2a900`.

Status words: **fixed**; **gap** (needs a person or a file that is not on `main`; it is kept off the slide face, and the speaker notes give the sentence to say instead); **not done** (with the reason).

## Must-fix

| Item | Status | What changed, or why not |
|---|---|---|
| 2.1 | gap | The "[NUMBER NEEDED]" box and its script sentence are gone. The notes and `SLIDES.md` ("Open gaps") name R-2 (#84, Roma) and say to say no number. When R-2 lands: one line in the Roads card, one sentence in the script, and the source in `deck-sources.md`. |
| 4.1 | fixed | The drawn diagram is rebuilt with every label at 15 to 21 pt: arrows say "photo", "JSON" and "result"; the routes moved to the notes. I did not switch to `architecture-slide.svg`: its labels land at 11 to 13 pt until the G-66 follow-up, and it needs a PNG export with Playwright, which this build does not use. |
| 5.1 | fixed | The run table is 16 pt with short labels ("small model", "random weights", "= E0 settings"…). The full `changed` text is in the notes and on B1's notes. The rule line and the fixed-settings line are 18 pt. A new run without a short label stops the build. |
| 6.1 | fixed | The rules card moved to backup B4. Slide 6 keeps the table, the chart, the operating-point line, the honesty line and one line "Rules example (backup B4): … scores 15 → critical, repair within 24 h." |
| 6.2 | fixed | Table 16 pt, the three lines 18 pt. |
| 6.3 | fixed | The chart is drawn at its placed size, 6.4 × 3.3 in, with 14 pt labels. |
| 7.1 | fixed | The running text is now the task line, the data line and three labels for the run groups. The pipeline details and the probe numbers are in the notes. |
| 7.2 | fixed | Text 18 pt, group labels 17 pt. The figure is drawn at 11.9 × 3.1 in with 14 pt labels, CLIP only. |
| 7.3 | fixed | The figure now plots the output embedding next to block 12 ("out"), so 0.78 at the output is visible. No number is left on the slide face; the notes give 0.95, 0.78 and 0.77, all as plotted. |
| 8.1 | gap | The intervals box is gone. The script says "Thirty test queries cannot separate these runs well." (`ml/restroom/STUDY-CARD.md`, question 3). The notes name C-20 (#201, Nazar); the build prints a note once `ml/results/restroom/intervals.json` exists. |
| 8.2 | fixed | The "Highlighted: …" sentence moved to the notes. The two highlighted rows are shown by fill only, no bold. The gender line is shortened. |
| 8.3 | fixed | Table 16 pt, lines 18 pt. The chart caption is replaced by legend entries "IOAI published best / baseline". |
| 8.4 | fixed | The chart is drawn at 5.1 × 2.95 in and shows only the table's rows (R0, R3, R4, R7) plus IOAI's two published lines. |
| 9.1 | gap | The placeholders now read "Screenshot · 09-heuristic-…png · Drive: screenshots/" in a plain white card. `docs/deck/.gitignore` and the `docs/deck/screenshots/` default are removed: screenshots never go into git (`docs/design/screenshots.md`). Dameli places the three crops in Canva; `--screenshots DIR` (a folder outside the repository) still embeds them in a local build. |
| 9.2 | fixed | Captions 18 pt: the heuristic name plus a short clause ("provider and connection shown", "the cause, and one click to Mock", "six labelled sample images"). |
| 10.1 | fixed | The count is read when the deck is built: 65 entries on this branch (your 62 was at 17:30). The notes say to rebuild after the 23:00 freeze so the number is final. |
| 10.2 | gap | The audit block is gone. The script says "We planned an audit of two vision-language models; it is not finished, so we show no numbers." The notes name R-6 (#85, Roma); the build prints a note once `docs/research/vlm-evaluation.md` exists. |
| 10.3 | fixed | Bullets 18 pt. "Claude Code, Codex, GitHub Copilot" is the head of the first card. |

## Nice-to-have

| Item | Status | What changed, or why not |
|---|---|---|
| D1 | not done | Needs a person: present from Canva or from a PDF exported there, and check one slide on the presenting laptop. The renders here use substitute fonts too. |
| D2 | fixed | The estimate is now 7:59 for slides 1 to 12 with the 1:30 demo. Slides 4 (0:42) and 10 (0:37) are still a few seconds over; slide 4 stays inside R-21's 0:35 to 0:45. |
| D3 | not done | B6 needs `architecture-detail.svg` as a PNG (`render_svg.py` needs Playwright and Google Fonts). The PNG goes to Drive `slides/` (`architecture-diagram.md`), so it is easier to add in Canva. |
| 1.1 | fixed | Roles and the course line are 16 pt, names 19 pt. |
| 2.2 | fixed | "We found no place where confusing door signs are reported." On the slide and in the script. |
| 3.1 | fixed | Step lines and the real/demo line are 19 pt. |
| 3.2 | fixed | One space. |
| 4.2 | fixed | The providers line is gone from the slide and is in the notes. |
| 4.3 | fixed | "Restroom model (CLIP ViT-B/32) on the laptop CPU: 25.7 ms per image. Pothole latency is not measured yet." |
| 5.2 | fixed | Three bullets. The version, boxes per split, batch, optimizer and the duplicate method are in the notes. |
| 5.3 | fixed | "Roads: a baseline and 7 one-change runs". The 7 is counted from `experiments.csv`: rows that are not the baseline or the E8 combination. |
| 6.4 | fixed in the deck | The deck's chart uses `#b87f00`. `ml/plots.py` line 28 still says `#f2a900`; that is Amina's file and its PNG is no longer embedded. |
| 6.5 | fixed | "Source: ml/results/experiments.csv; recall: Ultralytics' pass". |
| 6.6 | fixed | Chart title "On test, E1 is close to the best run, E4"; both run names are read from the CSV. |
| 6.7 | fixed | The source line names Ultralytics' pass. The notes say the line under the table is `ml/operating_point.py` (IoU 0.5) and that both round to 0.75. |
| 6.8 | fixed | "Four other runs are within 0.01 of it." The count and the word come from the CSV. |
| 7.4 | fixed | Chart title and script: "gender rises only at the end". The notes say "gender rises to 0.77 only in the last block". Slide 8 now names its embedding (8.7). |
| 7.5 | fixed | The x axis is the block number (1 to 12, then "out"), so the text and the figure use the same unit. |
| 7.6 | fixed | Series colour from the tokens, value-axis grid only, ticks end at "out", takeaway title, source line. ResNet50 is dropped (the slide is about CLIP; the notes say so). |
| 8.5 | partly | Validation is `--chart-1` and test is `--chart-3`. There is no highlight bar: which run is the restroom headline is still an open team decision (R-3 step 4), so the deck does not pick one. |
| 8.6 | fixed | "Source: restroom/experiments.csv, pipeline.json". |
| 8.7 | fixed | "Gender of one sign, ViT-B/32 (served): prompts 0.756, probe 0.741." |
| 8.8 | fixed | "Restrooms, 30 test queries: zero-shot 23, fine-tuned 27 (R3) to 30 (R4), pipeline 30". This states the counts and does not choose the headline. |
| 9.3 | fixed on the slide | "six labelled sample images". `docs/PRESENTATION.md`, "Slide 9", still says "photos"; that text is Dameli's and outside the deck folder. |
| 9.4 | fixed | "Text on page and card backgrounds: at least 4.98:1 (light) and 5.36:1 (dark); WCAG asks 4.5:1." |
| 9.5 | fixed | Your suggested cut: 77 words, about 0:36. |
| 10.4 | fixed | "Every number traced to a committed file (docs/research/deck-sources.md)". |
| 11.1 | fixed | Body 18 pt. The two clauses you named moved to the notes. |
| 12.1 | fixed | Labels 20 pt, links 18 pt, the real/demo line 18 pt. |
| B1.1 | fixed | The "What changes" column is dropped (it is in the notes). Numbers are 14 pt. |
| B1.2 | fixed | "All 9 runs; the columns used in the talk", plus which columns are left out. |
| B2.1 | fixed | The confusion matrix is dropped, so the slide gives one answer; the notes say why it counts differently. |
| B2.2 | not done | Redrawing the precision-recall curve needs the saved predictions, which are not committed. Ultralytics' plot stays as a backup to zoom into; the slide notes that its legend rounds mAP50 to 0.815 while `experiments.csv` has 0.8155. |
| B3.1 | fixed | Redrawn from `ml/results/runs/E0-, E2-, E5-results.csv`: validation in `#b87f00`, a takeaway title and a source line. |
| B4.1 | not done | The per-box areas behind the histogram are not committed (D-29), so it cannot be redrawn from repository files; the PNG is kept. The slide text gives the cuts as 1.15 % and 7.27 % and the three group counts. B4 now also holds the worked example from slide 6. |
| B5.1 | fixed | Redrawn from `pipeline.json`: the champion in `#b87f00`, the others in `--chart-1`, a source line. Labels keep the file's digits where rounding again would be ambiguous (0.7755). |

## Kept on purpose

- **The brand amber `#F2A900` on the mark and the road band.** It is the template's brand token, taken from `web/app/icon.svg`, and the critique lists it as passing R10. Only the chart highlight moved to `#b87f00`, as chart-style.md says.
- **No conflict with the honesty rules.** No suggestion needed a number from outside the result files. The one suggestion that would choose something the files leave open is the highlight bar in 8.5. It waits for the team's restroom headline decision.
