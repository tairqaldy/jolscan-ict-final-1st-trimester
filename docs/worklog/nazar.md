# Worklog: Nazar

**Lane:** Restroom model. Tasks suggested for Nazar: see the personal tracker issue and `docs/TASKS.md`.

## Summary for the defense

Fill this in by the code freeze (Wed 23:00). Three to six bullets: what I built or decided, the evidence (links), and the two things I can explain best.

- A two-step matching pipeline with no training (SIFT with a pixel check finds the crop's own original, colour plus CLIP finds its partner) gets 30/30 on test and 10/10 on validation, against IOAI's best 0.90 (`ml/results/restroom/pipeline.json`).
- The layer sweep (C-11): fine-tuning the last 4 CLIP blocks is best (0.965 partner-found accuracy on held-out restrooms); all 12 blocks are worse (0.910) and reach 1.000 on the training restrooms, which is overfitting (`ml/results/restroom/layers.csv`).
- R4 (C-3) and the export to the web app (C-5); the slide figures (C-6) in `ml/results/restroom/figs/`.
- Draft, written by the AI tool for me to check and edit in my own words before the code freeze.

## Entries

<!-- Newest first. Copy the entry template from docs/worklog/README.md. -->

### 2026-11-10 22:30 · C-3 (#14), C-5 (#16), C-6 (#17), C-9 (#19), C-11 (#36) · Restroom bare-minimum tasks
- **Status:** C-3, C-5, C-6 and C-11 done; C-4 and C-10 cut; C-9 in progress (card written, practice not done); C-12 part done; C-8 and C-13 blocked on S-1 (#21).
- **What I did:** Ran R4 on my laptop CPU, exported every run to the web app's model page with R5 cut, drew the slide figures the C-6 issue asks for, and wrote the study card. Earlier the same day: the two-step pipeline and the layer sweep on a Kaggle GPU.
- **Result:** R4: validation 10/10, test 30/30, gender 0.643; the champion stays R3 by the fixed rule. `web/data/restroom-experiments.json` has no placeholders (`isMock` false). Figures: `runs_matching.png`, `gender_heads.png`, `failures_r3.png`, `failures.png`. Card: `ml/restroom/STUDY-CARD.md`. All on branch `restroom/layer-experiment`, not merged yet.
- **Decisions and why:** R5 and the Gradio tab are cut, as the cut order in TASKS.md says; the layer sweep answers the layer question with much more evaluation data than one augmentation run. Query 14 is left off the failure figures because its sign has offensive words on it.
- **What I learned / can explain at the defense:** Training more layers helps matching only up to a point and then overfits; it also erases what CLIP knew about gender. With 10 validation and 30 test queries, one or two queries of difference is noise.
- **AI use:** Claude Code (Claude Opus 5.5) ran the scripts, wrote the code, figures and drafts; entry in `docs/AI-USAGE-LOG.md`.
- **Open questions / next:** practise the study card with a teammate (C-9); copy the R4 weights to Drive; C-12's R7 row in the export; C-8 and C-13 after S-1.
