# Architecture diagrams (G-66)

Two drawings of `docs/ARCHITECTURE.md` section 1, in the light-theme tokens and the deck fonts (Overpass, JetBrains Mono).

| File | Where it goes | What it shows |
|---|---|---|
| `architecture-slide.svg` | Slide 4, "How it works" (Alizhan, 0:40) | Five boxes: browser, Next.js server with the rules, and the three providers. The amber path, numbered 1 to 5, follows one photo in the live demo. |
| `architecture-detail.svg` | Backup slide after the closing (R-26) | Every route and folder, the `/health` and `/ready` checks, and the training side: where the pothole weights, the restroom checkpoint and the results table come from. |

## Talking over slide 4 in 40 seconds

1. The browser sends the photo to our Next.js server.
2. The server sends it to the provider chosen in Settings; in the demo that is the FastAPI service on this laptop.
3. YOLO (potholes) or CLIP (restroom signs) returns detections as JSON.
4. The server applies our rules, R1 to R6 for roads and S1 to S3 for restrooms, so every provider is scored by the same rules.
5. The browser shows the result with a severity or a verdict and keeps it in its own history; there is no database.

Mock works offline with canned results. Cloud is opt-in because road photos can show faces and plates, and it is not used in this demo.

## Alt text for Google Slides

- Slide 4: "A photo goes from the browser to our Next.js server, then to the local FastAPI service with YOLO and CLIP; the JSON comes back, the server applies rules R1 to R6 or S1 to S3, and the browser shows the severity or verdict."
- Backup: "Serving on top: browser, Next.js server with routes, provider switch and rules, and the mock, cloud and local providers. Training below: ml/ on Colab produces the pothole weights, ml/restroom/ an optional checkpoint, and the results table feeds the Model page."

## How the labels were checked

On 11 November 2026 against `main`:

- `ls web/app/api` → `analyze`, `health`, `restroom`.
- `grep -nE "@app|@router" api/main.py api/restroom.py` → `/health`, `/ready`, `/predict`, and `/compare`, `/match` under the `/restroom` prefix.
- Rule IDs R1 to R6 in `web/lib/rules/config.ts`, S1 to S3 in `web/lib/signage/config.ts`.
- S-7 (cloud Space) is still open, so the cloud box says "not used in this demo".
- Left out on purpose: the Gradio app (`api/gradio_app.py` is starter code that has not been run, S-5) and any database, queue or deployed cloud.

## Layout choice

Left to right in one row fits a 16:9 slide and reads in the order Alizhan speaks. The three providers sit as a fork on the right, with the one used in the demo outlined in amber and the cloud box dashed. Numbered arrows let the script say "step 3" instead of pointing.

## PNG export

`python docs/design/render_svg.py docs/design/architecture-slide.svg qarau-architecture-slide.png 2` gives 3840×2160 with the right fonts (Google Slides cannot insert SVG). Both PNGs go to the Drive folder `slides/`.
