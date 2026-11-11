# Defense-day runbook (task X-16)

How to run the live demo with the real models on the presenting laptop, and what to do when something fails. Follow it once in Rehearsal 2 (R-10) and correct every step that did not work as written.

- **Defense:** Thursday 12 November 2026, 10 minutes (7+ talk, 2–3 Q&A). Slot: see `docs/PLAN.md` (task X-3).
- **Presenting laptop (decided by Tair, lead, 11 Nov):** Tair's MacBook (Apple M5). E0 was trained on it, and the real-model demo below was run on it on 11 November 2026.
- **Day roles (X-23, set by Tair as lead on 11 Nov; say in the chat if one does not work for you):**

  | Role | Who | What exactly |
  |---|---|---|
  | Presenter and clicker | Tair | Runs the demo on slide 3 and moves the slides |
  | Timekeeper | Roma | Shows a one-minute signal at 7:00 and a stop signal at 8:00 |
  | Question catcher | Dameli | Writes every question asked, word for word, for the retrospective (X-27) |
  | Backup device holder | Alizhan | Phone with the deck PDF and `qarau-demo.mp4` offline, plus the USB stick with both |
  | Source-code opener | Owner of the lane asked about: Amina (`ml/train.py`, `web/lib/rules`), Nazar (`ml/restroom/`), Alizhan (`api/main.py`), Tair (`web/`) | Opens the file in the order of PRESENTATION.md, "Showing source code" (R-30) |

- **Arrival:** everyone at the room 40 minutes before the slot (the slot itself is in `docs/PLAN.md`, X-3), so the T−30 steps below happen with all six present. Everyone brings a charged phone with the deck PDF and the video available offline; Tair brings the laptop charger and a USB-C to HDMI adapter. Phone numbers stay in the chat, never in this public repository.

## What "real" means in the demo

| Screen | Real or demo |
|---|---|
| Roads analyze result on the **Local** provider | Real: the champion by the selection rule, E1 (`jolscan-e1`, YOLO26s), on this laptop, rules from `web/lib/rules` |
| Restrooms Compare on **Local** | Real CLIP model on this laptop (check it in the rehearsal, see below) |
| `/app/model` tables and charts | Real: written by `ml/export_results.py` from the committed run files |
| Overview, analytics, reports, map | Seeded demo history, marked "Includes demo data"; seeded rows say "Demo" |
| https://qarau.vercel.app | Deployed site: the model page is real, analyses run on Mock (the site cannot reach the laptop's model) |

Say it aloud during the demo (PRESENTATION.md, demo script step 5).

## The day before (online)

1. Pull `main`. Copy the served weights from the shared Drive (`weights/`) to `api/weights/jolscan-e1.pt`, the champion `championModelName` in `web/data/experiments.json` names (if E8 becomes champion, `jolscan-e8.pt` once E8 exists). Weights never go into git.
2. API environment: `cd api && python3.12 -m venv .venv && .venv/bin/pip install -r requirements.txt` (api/README.md).
3. Web app: `cd web && corepack enable && pnpm install && pnpm build`. Build online: `next/font/google` downloads the fonts at build time.
4. Warm every model once **online**, so all weights are cached on disk:
   - Roads: `scripts/demo-local.sh` warms the pothole model by itself.
   - Restrooms: run one Compare on the Local provider. The CLIP weights are downloaded on first use; with Wi-Fi off they must already be there. On 11 Nov the first Compare without warm-up took 5 s (CLIP loading), then 38 ms model time; the script now warms CLIP at start-up.
5. Put on the desktop:
   - a road photo that is not in the training split and shows no people or licence plates (D-12): `img-18.jpg` from `data/raw/potholes_yolo_v1/images/test/` (720 px, sharp on a projector), with `img-300.jpg` as a backup;
   - the mismatched sign pair;
   - the backup video `qarau-demo.mp4` (R-9);
   - the deck PDF.

## T−30 minutes: start everything

```bash
PYTHON=api/.venv/bin/python WEB_PORT=3000 scripts/demo-local.sh
```

The script:

1. Refuses to start if port 8000 or the web port is busy.
2. Checks that the weights file and the production build exist.
3. Starts the API with `MODEL_WEIGHTS=weights/jolscan-e1.pt` (the champion; override with `WEIGHTS=`) and prints `/health`.
4. Loads and warms both models at start-up (`WARMUP=1`: YOLO and CLIP), then sends one blank image through `/predict` (`api/smoke.py`).
5. Starts `pnpm start` with `MODEL_API_URL=http://localhost:8000`.

If port 3000 is taken, pick another one with `WEB_PORT=3100`.

Then in the browser:

1. Open `http://localhost:3000/app/settings`.
2. Choose **Local** and press **Check connection**. On 11 Nov with the champion it said "Connected · jolscan-e1 on cpu (9 ms)".
3. Run the automatic check (about 25 s). It clicks through every page on Local with the real models and must end with `6/6 checks passed; 0 page errors or failed requests`:

   ```bash
   uv venv /tmp/qarau-check && uv pip install --python /tmp/qarau-check/bin/python playwright opencv-python-headless
   /tmp/qarau-check/bin/python scripts/demo_check.py --base http://localhost:3000
   ```

   It checks that Check connection names the champion, that the road photo is analysed on Local by the champion, that Compare gives **Pair** for two doors of one IOAI restroom and **Not a pair** for signs from two restrooms, that Match ranks the true partner first, and that the other 12 pages load. It uses the Chrome installed on the laptop and writes nothing to the repository. Install the two packages the day before, while online.
4. Open the tabs in order: deck, `/`, `/app/roads/analyze`, `/app/restrooms/compare`, `/app`, `/app/model`, the GitHub repository.

## Measured on 11 November 2026 (Tair's MacBook, Apple M5)

- First real photo after start: about 2.4 s, while the model loads. That is why the script warms the model.
- Warm: 39–47 ms model time for a 720 px photo through the web app.
- `/health`: 7 ms.
- `scripts/demo-local.sh` itself, run on 11 Nov with the production build: health printed, model warmed, `next start` ready in 68 ms; a real photo through the web app then took 21 ms model time.
- Test photo `img-300.jpg`: 4 potholes found (4 labelled), severity Critical, score 17. It is 300 px, so it looks blurred when enlarged.
- Demo photo `img-18.jpg` (720 px, 5 labelled), through the web app with Strip GPS on: 6 boxes, 5 counted and 1 in the review band ("Needs a human look"), severity **Critical, score 12**; rules R1 (5 of 6 at or above 0.40), R2 (+8), R3 (+2) and R4 (+2) fire; 69 ms model time. Calling `/predict` directly gives the same 5 counted boxes; the sixth comes from the browser's re-encoding.
- `scripts/demo_check.py` on the evening of 11 Nov, production build: 6/6 checks passed, 0 errors, 24 s. With the API stopped it fails (1/6, HTTP 503 from `/api/analyze` and `/api/restroom`).
- The champion E1 (YOLO26s, 20 MB, about four times the weights of the nano runs), measured through the API on CPU on 11 Nov: first photo 973 ms model time while the model loads, then 51–71 ms per photo (`api/README.md`, S-2). Still well under a second, so the demo does not change.

- Cold start with E1 (11 Nov, 16:45, Wi-Fi on, production build already made): `scripts/demo-local.sh` printed `/health`, warmed the model and had `next start` ready **4 s** after launch. The first real photo through the web app then took 88 ms model time (4 boxes, Critical 17).
- If `api/.venv` does not exist, point the script at any Python 3.12 environment that has `api/requirements.txt` installed: `PYTHON=/path/to/venv/bin/python scripts/demo-local.sh`.

Measure the cold start again with Wi-Fi off in Rehearsal 2 and write it here.

## Wi-Fi off check (once in the rehearsal, once on the morning)

Turn Wi-Fi off and run the demo script from PRESENTATION.md (slide 3) with a timer. Then stop the API (Ctrl+C), press Check connection (it must say the service is down), switch to **Mock** and repeat. Write down every step that failed or took longer than 10 seconds.

## Fallbacks, in this order

1. **The API errors or hangs:** Settings → **Mock**, and say aloud that the result is now demo data.
2. **The local web app fails:** open https://qarau.vercel.app. Analyses run on Mock there; the model page shows the real results.
3. **The laptop fails:** play `qarau-demo.mp4` (if R-9's video is not ready, `scripts/demo_check.py --video qarau-demo.mp4` records a 2-minute click-through on the real models, with captions) and show the deck PDF from a second laptop or a USB stick. Name who carries the USB stick: ______.

## Before the talk and after it

- Before: Settings → **Reset demo data** clears rehearsal clutter, but it also resets the provider to Mock (`resetAll` in `web/components/app/settings-client.tsx`). Choose **Local** again and check the connection.
- After: Ctrl+C in the terminal stops both servers.
