# Defense-day runbook (task X-16)

How to run the live demo with the real models on the presenting laptop, and what to do when something fails. Follow it once in Rehearsal 2 (R-10) and correct every step that did not work as written.

- **Defense:** Thursday 12 November 2026, 10 minutes (7+ talk, 2–3 Q&A). Slot: see `docs/PLAN.md` (task X-3).
- **Presenting laptop (decided by Tair, lead, 11 Nov):** Tair's MacBook (Apple M5). E0 was trained on it, and the real-model demo below was run on it on 11 November 2026.
- **Who clicks:** Tair (slide 3, demo). **Who watches the time:** Roma (one-minute warning). **Who opens code if asked:** the owner of the lane (source-code tour, R-30).

## What "real" means in the demo

| Screen | Real or demo |
|---|---|
| Roads analyze result on the **Local** provider | Real: the champion by the selection rule, E4 (`jolscan-e4`), on this laptop, rules from `web/lib/rules` |
| Restrooms Compare on **Local** | Real CLIP model on this laptop (check it in the rehearsal, see below) |
| `/app/model` tables and charts | Real: written by `ml/export_results.py` from the committed run files |
| Overview, analytics, reports, map | Seeded demo history, marked "Includes demo data"; seeded rows say "Demo" |
| https://qarau.vercel.app | Deployed site: the model page is real, analyses run on Mock (the site cannot reach the laptop's model) |

Say it aloud during the demo (PRESENTATION.md, demo script step 5).

## The day before (online)

1. Pull `main`. Copy the served weights from the shared Drive (`weights/`) to `api/weights/jolscan-e4.pt`, the champion `championModelName` in `web/data/experiments.json` names (if E8 becomes champion, `jolscan-e8.pt` once E8 exists). Weights never go into git.
2. API environment: `cd api && python3.12 -m venv .venv && .venv/bin/pip install -r requirements.txt` (api/README.md).
3. Web app: `cd web && corepack enable && pnpm install && pnpm build`. Build online: `next/font/google` downloads the fonts at build time.
4. Warm every model once **online**, so all weights are cached on disk:
   - Roads: `scripts/demo-local.sh` warms the pothole model by itself.
   - Restrooms: run one Compare on the Local provider. The CLIP weights are downloaded on first use; with Wi-Fi off they must already be there.
5. Put on the desktop:
   - a road photo that is not in the training split and shows no people or licence plates (D-12);
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
3. Starts the API with `MODEL_WEIGHTS=weights/jolscan-e4.pt` (the champion; override with `WEIGHTS=`) and prints `/health`.
4. Warms the pothole model with a blank image (`api/smoke.py`).
5. Starts `pnpm start` with `MODEL_API_URL=http://localhost:8000`.

If port 3000 is taken, pick another one with `WEB_PORT=3100`.

Then in the browser:

1. Open `http://localhost:3000/app/settings`.
2. Choose **Local** and press **Check connection**. On 11 Nov it said "Connected · jolscan-e0 on cpu (7 ms)".
3. Open the tabs in order: deck, `/`, `/app/roads/analyze`, `/app/restrooms/compare`, `/app`, `/app/model`, the GitHub repository.

## Measured on 11 November 2026 (Tair's MacBook, Apple M5)

- First real photo after start: about 2.4 s, while the model loads. That is why the script warms the model.
- Warm: 39–47 ms model time for a 720 px photo through the web app.
- `/health`: 7 ms.
- `scripts/demo-local.sh` itself, run on 11 Nov with the production build: health printed, model warmed, `next start` ready in 68 ms; a real photo through the web app then took 21 ms model time.
- Test photo `img-300.jpg`: 4 potholes found (4 labelled), severity Critical, score 17.

Measure the cold start again with Wi-Fi off in Rehearsal 2 and write it here.

## Wi-Fi off check (once in the rehearsal, once on the morning)

Turn Wi-Fi off and run the demo script from PRESENTATION.md (slide 3) with a timer. Then stop the API (Ctrl+C), press Check connection (it must say the service is down), switch to **Mock** and repeat. Write down every step that failed or took longer than 10 seconds.

## Fallbacks, in this order

1. **The API errors or hangs:** Settings → **Mock**, and say aloud that the result is now demo data.
2. **The local web app fails:** open https://qarau.vercel.app. Analyses run on Mock there; the model page shows the real results.
3. **The laptop fails:** play `qarau-demo.mp4` and show the deck PDF from a second laptop or a USB stick. Name who carries the USB stick: ______.

## Before the talk and after it

- Before: Settings → **Reset demo data** clears rehearsal clutter, but it also resets the provider to Mock (`resetAll` in `web/components/app/settings-client.tsx`). Choose **Local** again and check the connection.
- After: Ctrl+C in the terminal stops both servers.
