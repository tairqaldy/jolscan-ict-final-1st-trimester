# Slide 4 practice: Alizhan (R-21)

The slide and its speaker notes are already in `docs/deck/qarau-defense-deck.pptx`, generated from `docs/deck/make_deck.py` and described in `docs/deck/SLIDES.md`. Alizhan supplied three recordings of practice attempts; their durations were measured from the files.

## Script in the slide notes

> This is the path of one photo. The browser sends it to our Next.js server, which uses the provider chosen in Settings: mock for offline demo data, local for the model on this laptop, or cloud. Local calls our FastAPI service, where YOLO finds potholes and CLIP reads restroom signs. The detections come back, and the rules run in the web server, so every provider is scored by the same rules. Cloud is opt-in, because road photos can show faces and plates. Amina will show what the roads model learned from.

The deck estimates 42 seconds at 130 words per minute. The three supplied audio files are within the 35–45 second target. File durations include any silence. Alizhan confirmed that each attempt ended with the required handover; the audio content was not independently transcribed in this session.

| Reading | Actual time | Notes |
| --- | --- | --- |
| 1 | 40.98 seconds | File `Запись (2).m4a`, measured duration |
| 2 | 35.93 seconds | File `Запись (3).m4a`, measured duration |
| 3 | 35.93 seconds | File `Запись (4).m4a`, measured duration |

## What the diagram means

1. The browser sends an image to the Next.js route (`/api/analyze` or `/api/restroom`).
2. The chosen provider returns mock data or invokes the local/hosted model service. The cloud option is opt-in. Since 13 November (S-7) it is our API on a Hugging Face Space, `tairqaldy/qarau-api`; it is several seconds per photo on a shared CPU, so the live demo runs on Local (`api/README.md`, Hosting).
3. FastAPI exposes `/predict` for YOLO and `/restroom/compare` or `/restroom/match` for CLIP. Results return as JSON.
4. Web-server rules turn detections or sign predictions into the displayed road severity or signage verdict.

On the current slide, **25.7 ms** is the R1 zero-shot CLIP ViT-B/32 per-image latency on an Apple M5 CPU (`ml/results/restroom/experiments.csv`), not pothole latency. R-21's original text mentions 26.9 ms for R3; the slide uses R1 because `api/restroom.py` currently defaults to ViT-B/32 zero-shot. The two are different runs. No pothole latency is shown without the S-15 measurement. Recheck the model configuration and cloud status before presenting.

Sources: `docs/ARCHITECTURE.md` sections 1 and 3; `web/lib/providers/env.ts`; `api/restroom.py`; `ml/results/restroom/experiments.csv`, row R1, `latencyMs` and `device`; `docs/deck/SLIDES.md`, slide 4.
