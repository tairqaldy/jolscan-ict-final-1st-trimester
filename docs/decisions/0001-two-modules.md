# 0001. One platform with two modules: potholes and restroom signs

- **Date:** 2026-11-10
- **Decided by:** Tair, after the team chat (pothole idea from Amina, the IOAI restroom task from Nazar)
- **Task / issue:** W-23
- **Status:** decided

## Context
Six people, two days. The team had two candidate ideas: pothole detection (a dataset in hand, training still to do) and the IOAI 2025 "Restroom Icon Matching" task (public data, answers and a scoring script ready, zero-shot runs possible on a laptop).

## Options
1. Potholes only: one clear story, but the results depend entirely on Colab training finishing on time.
2. Restrooms only: safe results, but a fixed olympiad task with less product story.
3. One platform, two modules, each a model followed by rules the team defines.

## Decision
Option 3: Qarau, with Roads (YOLO detection → repair priority) and Restrooms (CLIP and SIFT sign matching → signage verdict).

## Why
Every member gets a real part; the restroom module carries the results if pothole training is late (PLAN.md risks); both modules share the same architecture (model service + rules in the web app), so the second costs less than the first.

## Consequences
An 8-minute talk must cover two modules: one demo flow and one results slide each (PRESENTATION.md). Two experiment documents (ML-EXPERIMENT.md, ML-EXPERIMENT-RESTROOM.md).
