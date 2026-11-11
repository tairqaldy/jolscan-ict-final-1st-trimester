# Worklog: Tair

**Lane:** Web app, UX, coordination. Tasks suggested for Tair: see the personal tracker issue and `docs/TASKS.md`.

## Summary for the defense

Fill this in by the code freeze (Wed 23:00). Three to six bullets: what I built or decided, the evidence (links), and the two things I can explain best.

- 

## Entries

### 12 November 2026 · R-26 (#235) · CLO backup slides B6–B8 in the deck

- **Status:** done
- **What I did:** built Roma's backup notes for CLO 5, 6 and 7 into `docs/deck/make_deck.py`: B6 (methods and why each metric), B7 (prototype, documentation, checks), B8 (how we checked the AI tools). Each quotes what the syllabus assesses and reads its numbers from the result files.
- **Result:** the deck has 20 slides; the build checks every number against its file and reports no open gaps.
- **Decisions and why:** tables, not charts: these slides answer "show me where the evidence is", so each row names a file. The glossary heading said 38 terms while its table has 43; I corrected the count where it is quoted.
- **What I learned / can explain:** which metric fits which task (mAP50 and recall for detection, accuracy on balanced classes, top-1 for matching, and why the k-means bands have no accuracy).
- **AI use:** Claude Code wrote the slide code and the test; see docs/AI-USAGE-LOG.md.
- **Open questions / next:** Roma, Amina and Nazar should read B6–B8 before the defense.

### 11 November 2026 · R-20, R-21 and the deck (#229, #230) · First version of all slides

- **Status:** draft done; reading aloud, Canva import and the marked gaps are open.
- **What I did:** a script, `docs/deck/make_deck.py`, builds the deck from Dameli's template and the result files: slides 1–12, backups B1–B5, the script in each slide's notes, and a Sources line per number. `docs/research/deck-sources.md` is generated for R-15.
- **Result:** `docs/deck/qarau-defense-deck.pptx` (1.1 MB), about 8:17 with the 1:30 demo. Gaps shown on the slides: slide 2 statistic (R-2), restroom 95 % intervals (C-20), the R-6 audit, the design screenshots (G-11).
- **Decisions and why:** the build stops if a number on a slide is not exactly the file's number, so nobody types a number by hand. The restroom headline shows R3 and the pipeline side by side until Nazar confirms.
- **What I learned / can explain at the defense:** where every number on the slides comes from.
- **AI use:** Claude Code built the script and the deck; entry in docs/AI-USAGE-LOG.md.
- **Open questions / next:** each speaker times their slide; Roma imports into Canva and exports the PDF.

### 11 November 2026 · M-19 (#61) · Operating point of the champion at confidence 0.40

- **Status:** done
- **What I did:** wrote `ml/operating_point.py` from the issue's spec (predict at exactly 0.40, greedy matching at IoU 0.5, each labelled box matched once) with tests for the matching, and ran it once on the test split with the champion E1.
- **Result:** 176 found, 30 false alarms, 60 missed of 236 labelled potholes: precision 0.854, recall 0.746, F1 0.796 (`ml/results/operating_point.json`, table in `docs/ML-EXPERIMENT.md`).
- **Decisions and why:** run for E1, the model the app serves, not E8, because the selection rule chose E1. Ultralytics' own 0.40 pass gives 178 / 34 / 58; I report both and explain the difference (IoU 0.45, F1-best threshold) instead of picking the nicer one.
- **What I learned / can explain at the defense:** precision = TP / (TP + FP), recall = TP / (TP + FN), and why a box needs IoU ≥ 0.5 and can match only once.
- **AI use:** Claude Code (Claude Opus 5.5) wrote the script and tests and ran them; entry in docs/AI-USAGE-LOG.md.
- **Open questions / next:** send the table to Roma for the results slide (R-23).

### 11 November 2026 · M-4, M-9, M-11, M-12, M-13 (#53, #66, #59, #60, #62) · All pothole runs E0–E8 and the final champion

- **Status:** done. The Drive upload of `jolscan-e1.pt` and `jolscan-e8.pt` is still my step.
- **What I did:** trained E1 (YOLO26s) and E6 (960 px) after E2–E7, all on the Apple M5 GPU with the same split, seed and trainer commit. Applied decision 0009: no single change beat E0 by more than 0.01 (best: E4, +0.004), so E8 got the E0 settings (PR #388), and I trained it from that `main` commit. Re-exported after each batch. With E1 the champion changed from E4 to E1, so I switched the champion figures, the demo script's default weights and the runbook, and repeated the S-2 check with E1 (PR #389).
- **Result:** champion **E1** by the rule: validation mAP50 0.824 (tied with E4's 0.828 within 0.01), highest validation recall at 0.40 (0.738). Test, read once: mAP50 0.8155; at 0.40 it finds 178 of 236 potholes, misses 58, raises 34 false alarms. E8 equals E0 in every loss and metric of every epoch.
- **Decisions and why:** the rule was fixed before E1 ran, so I follow it even though E4 has the higher test mAP50 (0.831). Choosing on test would make the test number optimistic. The model page states both facts. I found that `ml/export_results.py` joined CSV fields with commas, so E8's description ("no change qualified, E0 settings") shifted its columns and the bar chart showed wrong numbers for E8. The exporter now uses `csv.writer`, and a regression test fails without the fix.
- **What I learned / can explain at the defense:** a validation-only selection rule with a tie band; why recall breaks the tie (a missed pothole never reaches a crew); why a deterministic re-run (E8 = E0) proves the pipeline is reproducible but says nothing about seed-to-seed spread (M-16).
- **AI use:** Claude Code (Claude Opus 5.5) ran the training queue, the exports and the checks and wrote the changes; entry in docs/AI-USAGE-LOG.md.
- **Open questions / next:** M-19 operating point for E1; upload the weights to the Drive.

<!-- Newest first. Copy the entry template from docs/worklog/README.md. -->

### 11 November 2026 · X-18 (#227) · Public repository safety

- **Status:** checks done; two follow-ups for people
- **What I did:** searched tracked files for emails and phone numbers (none), searched the full history for secret formats (none), listed the commit emails the history exposes, and moved the two course digests out of the public repository into the team Drive.
- **Result:** decision 0006 records the email, digest and secret decisions; COURSE-GROUNDING and PRESENTATION point to the Drive copy.
- **Decisions and why:** no history rewrite (it would break every branch the day before the defense); digests out, because they paraphrase lecture slides page by page.
- **What I learned / can explain:** what a public repository exposes beyond its files (author emails in history) and why a leaked key must be revoked, not just deleted.
- **AI use:** Claude Code ran the searches and drafted the decision text (docs/AI-USAGE-LOG.md).
- **Open questions:** teammates switch to no-reply emails; secret scanning has to be enabled in the repository settings.

### 2026-11-11 14:05 · C-13 (#38) · Real IOAI door signs in the restroom samples
- **Status:** done (pull request closing #38)
- **What I did:** found the two originals of each of the 10 validation restrooms with the issue's SIFT script and the answer file, checked every pair by eye, and picked six restrooms with clearly different designs: glasses and words (v17, v2), triangle figures (v7, v14), yellow plate (v9, v15), painted doors (v5, v1), king and queen (v6, v13), brush strokes (v10, v20). I left out the poster set with legs (v4, v3), the engraved portrait (v8, v11) and the abstract lines whose gender I could not tell by eye (v12, v18). Resized to at most 256 px and saved as WebP (72 KB for all twelve), then sent these exact files to the API (`POST /restroom/compare`, all 66 pairs, model `clip-vitb32-zs`, CPU) and wrote the outputs into `samples.json` with a script, not by hand. Four new presets, the drawings and their preset ids unchanged. Local and cloud Match now send only the non-SVG signs as the gallery (422 only when none is left), with a unit test. `draw-samples.mjs` skips manifest entries that are not SVG. Credits in `lib/credits.ts`, About, the model page, the footer and `web/README.md`; the Match card and the sample picker no longer say every sign is a drawing.
- **Result:** the zero-shot model gets the gender of 10 of the 12 signs right; it reads the women's painted figure (v1) and the queen (v13) as male. Rules on the six real pairs: four clear, painted doors review (margin 0.18), king and queen review with the doors swapped (margin 0.05). Match on Local with each real sign as the query finds the true partner for 8 of 12, the misses are the same two restrooms. The mismatched preset (v7 + v20, similarity 0.85) fails S3; 5 of the 30 men's/women's pairs across restrooms score 0.88 or more, so S3 does not catch every mixed pair.
- **Decisions and why:** validation set only, so the demo never shows a sign the model or the thresholds were tuned on. WebP at 256 px keeps the samples small. I chose the mismatched pair by its similarity being the median of the 30 cross pairs, after my first choice (v7 + v15, 0.89) turned out to pass S3; both are in the pull request. The landing page keeps the four drawn pairs.
- **What I learned / can explain at the defense:** where the demo signs come from (IOAI validation, CC-BY-4.0, icons only), why the mock values of real signs are real outputs and the drawings' are not, and the two real failure cases.
- **AI use:** Claude Code (Claude Opus 5.5) picked and checked the signs with me, ran the API and wrote the code, tests and docs; entry in docs/AI-USAGE-LOG.md.
- **Open questions / next:** the API served zero-shot CLIP. If it switches to the fine-tuned model or the probe (R7), rerun the 66 compares and replace the values.

### 2026-11-11 13:50 · W-62 (#300) · Shorten the path from the landing page to a first result
- **Status:** done (timing with two people still open)
- **What I did:** counted the clicks from the landing page to a result for the current hero and tried three variants at 1440 px and 375 px with the Mock provider: A current ("Open the app"), B hero action straight to Analyze with sample s01, C two hero actions, one per module (roads primary, restrooms secondary).
- **Result:** B. "Analyze a road photo" opens Analyze with s01 selected, so a result is 2 screens and 2 clicks away; before it was 3 screens and 4 clicks through the app. The count is in `docs/DESIGN-BRIEF.md` (U1 count). Pull request closing #300.
- **Decisions and why:** B over C. Both meet U1, but C makes a first-time visitor choose a module before knowing either (Hick's law), and drops "See how it works", the only way to the explanation from the hero on a phone, where the header has no section links. B keeps one primary action and one low-commitment secondary. "Open the app" stays in the header.
- **What I learned / can explain at the defense:** U1 as a measured requirement (Lab 3): user, task, number. Why a preselected sample is recognition over recall, and why one primary action (Fitts's law, Hick's law).
- **AI use:** Claude Code (Claude Opus 5.5) built and measured the variants in the browser; entry in docs/AI-USAGE-LOG.md.
- **Open questions / next:** the issue asks to time two people reaching a result; not done yet. Count again on the deployed site after the merge.

### 2026-11-11 13:45 · W-30 (#135) · Demo path card on /app
- **Status:** done (Roma's timing of the click path still open)
- **What I did:** added `web/lib/demo-path.ts` (the seven steps of the slide 3 demo as `{ title, note, href }`, Compare links built from the restroom presets by id), a test that every link's sample ids exist, and a "Demo path" card on `/app` with a Hide button stored in localStorage and a "Show the demo path" link.
- **Result:** clicked all seven links on Mock: each opened with the right input selected (s01, s05, the matching, two-sets and trousers pairs, faint-f in Match, the roads section of the model page). Hiding survives a reload. Pull request closing #135.
- **Decisions and why:** links only preselect, so the provider line stays in view and nothing runs on page load. The card says the samples are drawings that only Mock can read: on Local each sample link gives the "SVG drawing" error, so in the defense drop the prepared photos instead. On phones the notes are hidden so the card stays one screen tall. At 1280×720 the card pushes the overview tiles to the bottom edge; Hide brings them back up.
- **What I learned / can explain at the defense:** recognition rather than recall (Lec3-HCI): the demo inputs are links, not ids to remember. How `useSyncExternalStore` keeps the hidden state without a hydration mismatch.
- **AI use:** Claude Code (Claude Opus 5.5) wrote the code and the test and clicked every link in the browser; entry in docs/AI-USAGE-LOG.md.
- **Open questions / next:** ask Roma to time the click path against the demo script (issue step 7). Real sample photos (D-5, C-13) would make the links work on Local too; the test will catch the renamed ids.

### 11 November 2026 · W-22 (#104) · Study card draft: architecture and web decisions

- **Status:** draft; practise before Rehearsal 1
- **What I did:** wrote the architecture sketch and seven short answers under "Tair" in `docs/PRESENTATION.md`, checked against the code (timeouts in `web/lib/providers/env.ts`, error codes in `web/lib/providers/http.ts`).
- **Result:** a card I can learn; the done-check (draw it from memory, three random questions without notes) happens in the rehearsal.
- **Decisions and why:** no lecture page numbers in the answers until I have opened the PDFs.
- **What I learned / can explain:** why the rules sit after the model and outside it; what each provider is for.
- **AI use:** Claude Code drafted the answers from the code and the issue; I have to practise them (docs/AI-USAGE-LOG.md).
- **Open questions:** none.

### 2026-11-11 13:20 · W-60 (#298) · Fit each demo result on one projector screen
- **Status:** done
- **What I did:** ran s01 on Analyze, the s01 report and all four Compare presets at 1280×720 and 1440×900 (Mock provider, bundled samples) and measured where the photo, badge, score and action land. Tried three variants: A current, B smaller photo column, C meta block collapsed into "Run details".
- **Result:** pull request closing #298. Roads keeps layout A. Compare uses B: on desktop each sign is 20% of the window height wide and the gaps are tighter, so the result row is 692 px instead of 834 px and fits at 1280×720 (16–708 px). Both pages now jump to the top of the result instead of centring it.
- **Decisions and why:** the real problem was the jump. `focus()` centres the whole result, rules table included, so on Compare the verdict and action ended above the screen. On roads, A already fits (photo 84–397 px, card ends at 551 px). B there only shrinks the photo, because the decision card sets the row height. C hides the "Mock result" badge and does not shorten Compare at all, because there the sign card sets the height. The sign size follows the window height, so the signs grow again on taller screens (180 px at 900 px high).
- **What I learned / can explain at the defense:** Fitts's law (Lec3-HCI p.34): after pressing Analyze or Compare, the decision is where the eye lands, at the top of the screen. Why `focus()` scrolls and how `preventScroll` with `scrollIntoView({ block: "start" })` changes that. Why `scroll-mt` is larger on phones (the sticky top bar is 105 px).
- **AI use:** Claude Code (Claude Opus 5.5) measured the variants in the browser and wrote the changes; entry in docs/AI-USAGE-LOG.md.
- **Open questions / next:** with the browser's tab and address bars the window is about 1280×630; then everything still fits except the threshold note under the similarity bar. Present in full screen anyway. I did not open `/app/restrooms/checks/[id]` in the browser; it uses the same component. W-31 (presentation mode with larger type) will change these sizes, so check again after it lands.

### 11 November 2026 · X-16 (#97) · Defense-day runbook and a one-command demo start

- **Status:** first version; to be tried in Rehearsal 2 with Wi-Fi off
- **What I did:** wrote `docs/DEFENSE-RUNBOOK.md` and `scripts/demo-local.sh`, which checks the ports, the weights and the production build, starts the API with the E0 weights, warms the model and starts the web app.
- **Result:** run once on this laptop: a real photo through the web app took 21 ms model time after the warm-up; the cold first request without warm-up took about 2.4 s.
- **Decisions and why:** warm the model in the script, so the first photo in front of the examiners is fast; production build, not `next dev`, because dev compiles pages on first open.
- **What I learned / can explain:** why the deployed site cannot run our model (its server cannot reach the laptop), and what is real and what is demo on each screen.
- **AI use:** Claude Code wrote the runbook and the script and ran them (docs/AI-USAGE-LOG.md).
- **Open questions:** confirm the presenting laptop in the chat; Restrooms Compare on Local still has to be checked in the rehearsal.

### 11 November 2026 · follow-up to W-28 (#132) · Invented rows no longer claim a provider or model

- **Status:** done
- **What I did:** seeded demo records (ids `demo-…`) now show "Demo" in the provider column of the analyses and sign-check tables, and "Invented demo record" with model "none" on their detail pages.
- **Result:** after E0 made the roads results real, a sample row like "9 Nov, Bogenbay Batyr Ave, Critical, Local" read as a real model run; it now reads "Demo", while my real test analysis still reads "Local".
- **Decisions and why:** label by id (`lib/mock/seeded.ts`) instead of changing the seeded data, so the analytics charts keep their provider split under the page's "Includes demo data" badge.
- **What I learned / can explain:** why a page-level badge is not enough once real and invented rows sit in one table.
- **AI use:** Claude Code made the change and found the problem while checking the dashboard in a browser (docs/AI-USAGE-LOG.md).
- **Open questions:** none.

### 11 November 2026 · D-14 (#70) · Rebuild potholes_yolo_v1 from the Kaggle source

- **Status:** done
- **What I did:** wrote `data/make_potholes_yolo_v1.py`, which rebuilds the frozen pothole dataset from the Kaggle download and checks it image by image against `split_manifest.json`.
- **Result:** all 665 images and 1,739 boxes matched (SHA-256, split, object count); the seed-42 shuffle reproduces the documented split exactly.
- **Decisions and why:** re-derive the split instead of copying it from the manifest, so the script proves the documented procedure; stop on the first difference, so a rebuilt folder is the frozen version or nothing.
- **What I learned / can explain:** why a frozen split with a manifest and hashes makes every run comparable; how Pascal VOC corners become YOLO centre and size.
- **AI use:** Claude Code wrote the script from the procedure in data/README.md; I ran it against the Kaggle download and checked the output counts (docs/AI-USAGE-LOG.md).

### 11 November 2026 · M-13 (#62) · Deck plots for the pothole experiment

- **Status:** first version (E0); final after E8
- **What I did:** wrote `ml/plots.py` (bars and loss curves from committed CSVs) and added the champion's PR curve and confusion matrix at confidence 0.40 from Ultralytics' test evaluation.
- **Result:** four figures in `ml/results/`. The confusion matrix at 0.40 gives 160 found, 76 missed, 23 false alarms on 236 test boxes, the same recall and precision as `E0.json`.
- **Decisions and why:** used the confusion matrix at 0.40, not Ultralytics' default one, because the default pass uses confidence 0.001 and shows 2,374 false alarms the app never displays.
- **What I learned / can explain:** why a detector's confusion matrix depends on the confidence threshold; how recall 0.678 and precision 0.874 follow from 160, 76 and 23.
- **AI use:** Claude Code wrote the script and caught the misleading default matrix while checking the figures (docs/AI-USAGE-LOG.md).
- **Open questions:** E2 and E5 curves appear when those runs exist.

### 11 November 2026 · M-3 (#52) and M-12 (#60) · Train E0 and export the first real results

- **Status:** M-3 done; M-12 first export done (final export after E8)
- **What I did:** trained the E0 baseline (YOLO26n, 40 epochs, SGD, seed 42, frozen split `potholes_yolo_v1`) with Amina's M-1 trainer on this laptop's Apple M5 GPU, adding a `--device mps` option; ran `ml/export_results.py`.
- **Result:** test mAP50 0.799, mAP50-95 0.517, precision 0.867, recall 0.678; at the app's confidence 0.40: precision 0.874, recall 0.678. Validation mAP50 0.824. Weights 5.4 MB. `web/data/experiments.json` now has `isMock: false`.
- **Decisions and why:** trained locally instead of Colab because E0 was a day late and the M5 GPU finished 40 epochs in about 12 minutes; the run file records the device so the later Colab runs are compared honestly. Tagged the trainer commit `e0-trainer` because the squash merge would otherwise make the recorded commit unreachable.
- **What I learned / can explain:** mAP50 versus mAP50-95; why the test split is read once, after training; why validation picks the champion.
- **AI use:** Claude Code ran the training and the export and patched the device option; numbers come from the run file (docs/AI-USAGE-LOG.md).
- **Open questions:** the batch-1 latency (S-15) is not measured yet, so the page says "not measured".

### 2026-11-11 12:55 · W-21 (#103) · Remove stale placeholders from the site copy
- **Status:** done
- **What I did:** ran the issue's grep over `web/` and sorted every hit. Fixed the stale copy: the pothole credit in `web/lib/credits.ts` (name, author, Kaggle link, ODbL/DbCL licence from the D-1 card), the footer and About lines that called demo badges "placeholders", the About dataset warning and the "to be completed" AI-use callout, the landing results sentence, and the disabled RU/KZ options in Settings. The model-page dataset card and the placeholder `experiments.json` dataset block were already fixed by W-11 Part A, which merged while I worked.
- **Result:** pull request closing #103. No page shows 'TBD', 'to be confirmed', 'to be filled in' or 'to be completed'; the remaining grep hits are listed in the pull request with their group.
- **Decisions and why:** removed the RU and KZ options instead of leaving 'coming soon': no translation is ready before the defense, and W-58 adds them back wired. The About AI-use section now points to `docs/AI-USAGE-LOG.md` and lists no tools, because the full team statement needs every member's confirmation (W-14). `web/app/design/page.tsx` and `tokens.css` still say the direction is a placeholder; that stays true until Dameli's G-3 lands.
- **What I learned / can explain at the defense:** a demo label is honest, a forgotten placeholder is not. Seeded histories stay invented and keep their badge (U8); placeholder text that promises something later reads as unfinished work.
- **AI use:** Claude Code (Claude Opus 5.5) did the sweep and the edits; entry in docs/AI-USAGE-LOG.md.
- **Open questions / next:** W-14 writes the confirmed AI-use statement and the remaining About fixes; look at https://qarau.vercel.app `/`, `/about`, `/app/model` after the merge.

### 2026-11-11 12:50 · W-28 (#132) · Tie the Demo data badges to the data on screen
- **Status:** done
- **What I did:** every page that shows the seeded demo analyses or sign checks (roads overview, reports, map, analytics, report detail, restroom overview and analytics, platform overview, the app shell) now passes `show` to its badge. Results made by the mock provider show 'Mock result' next to the provider. Compare and Match show 'Mock predictions' through a small client component that reads the provider setting. Only the results places (model page, landing results cards, the two run charts) still follow `isMock`.
- **Result:** pull request closing #132; `web/lib/demo-badges.test.ts` fails if a seeded-history page loses `show` (checked against the old reports page) or a result view stops marking mock results.
- **Decisions and why:** a unit test instead of the manual `pnpm dev` check, so the rule is checked on every CI run. Compare and Match showed no badge at all, even on the Mock provider, because their badge followed the restroom results file, which is already real; the provider-based badge fixes that.
- **What I learned / can explain at the defense:** U8: the badge follows the data on screen. Seeded histories are always invented, mock results are invented per result, and real model results come only from the results files.
- **AI use:** Claude Code (Claude Opus 5.5) wrote the changes and the test; entry in docs/AI-USAGE-LOG.md.
- **Open questions / next:** tell Amina and Nazar that the export can set `isMock: false` safely. Dameli's G-29 can now design the badge set on top of this rule.

### 11 November 2026 · W-11 (#109) Part A · Model page follows the selection rule

- **Status:** Part A done; Part B waits for the real export (M-12).
- **What I did:** the roads loader (`web/lib/mock/experiments.ts`) now reads every field the export writes, including validation mAP50, recall at 0.40 and the training device, and keeps missing numbers as null instead of 0. The runs table compares against the baseline on mAP50, has 'Val mAP50', 'Recall at 0.40' and 'Device' columns and no 60 ms budget. The scatter chart became grouped bars of test mAP50 and test recall at 0.40 from zero, with the champion in amber and a title computed from the data. The placeholder `web/data/experiments.json` has the real selection rule, runs E0–E8 from docs/ML-EXPERIMENT.md (numbers still invented and badged) and the dataset block the export writes.
- **Result:** pull request for W-11 Part A; a vitest file (`web/lib/mock/experiments.test.ts`) feeds the loader an object shaped like the real export and checks every mapped field.
- **Decisions and why:** the dataset card stays in the results file because M-20 made the export write it, so the page shows what the export wrote. Missing text fields show 'Not in the results file yet' rather than invented wording. Latency in the placeholder is null, the same state the real export will have until S-15. The chart works with one run, because the first real export has only E0.
- **What I learned / can explain at the defense:** runs are categories, so a bar chart from zero, not a scatter (Lec4-VizBasics p4). The champion is picked on validation mAP50 and the test split is only reported (Sup p10), so the champion's test bar is not always the tallest, and the chart title says so when that happens.
- **AI use:** Claude Code (Claude Opus 5.5) wrote the changes and the test; see docs/AI-USAGE-LOG.md.
- **Open questions / next:** Part B: after M-12, open `/app/model`, check the badge is gone and three cells against `ml/results/experiments.csv`. W-5 still has to switch the landing teaser to mAP50 and recall at 0.40.

### 11 November 2026 · D-1 (#40) and M-20 (#69) · Dataset card and the export's metadata

- **Status:** done
- **What I did:** wrote the dataset card in `data/README.md` from the Kaggle dataset page data, and made `ml/export_results.py` write the dataset block, protocol, selection rule, champion model name and each run's device; ARCHITECTURE section 2 lists the new fields.
- **Result:** licence ODbL (database) / DbCL (contents); a test export produced a `dataset` block with 465 / 100 / 100 images and no placeholder text.
- **Decisions and why:** the licence is open, but three watermarked stock photos mean per-photo rights are not established, so they stay out of anything public (D-12). Image counts come from the manifest, not typed by hand.
- **What I learned / can explain:** the difference between a dataset licence (ODbL) and the rights to each photo in it; why the export, not a person, writes every number on the model page.
- **AI use:** Claude Code drafted the card and the export change; I checked the licence against the Kaggle data and ran a test export (docs/AI-USAGE-LOG.md).
- **Open questions:** none.
