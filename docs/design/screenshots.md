# Screenshot frame (G-56)

Every app screenshot in the deck uses one size, one scale and one frame, so the slides read as one product. The deck screenshots of G-11 follow this page, and the slide template has the frame (slide 5, "Large screenshot", in `slide-template/qarau-slide-template.pptx`).

## The frame

| Property | Value | Why |
|---|---|---|
| Viewport | 1440 × 900 CSS px (16:10) | The laptop width in the brief's checks (375, 768, 1440 px). The whole sidebar and a full result card fit |
| Scale | Device pixel ratio 2, so the file is 2880 × 1800 px | Text stays sharp on a projector and when a detail is cropped |
| Mobile | 375 × 812 CSS px at ratio 2 (750 × 1624 px) | The width of U6; one mobile shot only |
| Theme | Light on every slide. Each shot also exists in dark, for a dark slide or a question about the dark theme | The template is built from the light tokens (G-10); never mix themes on one slide |
| Provider | The app default, Mock, unless the slide says the result comes from the trained model | A Mock result shows "Mock result" and "Includes demo data" in the frame, so nothing invented reads as real (U8) |
| Crop | The full viewport, never a full-page capture | A tall page squeezed onto a 16:9 slide makes the text too small to read |
| Scroll | Where the app leaves the page after the action | Analyze and Compare scroll the result into view themselves; that is what the audience sees in the live demo |
| Detail crop | A rectangle cut from the 2x file, not scaled | Text in a detail stays the same size as in the full shots (slide 9 heuristics, G-72 annotations) |
| Corner radius | `--radius-lg`, 10 px at 1440 px (20 px in the file) | The same radius as the app's cards (`Card` in `web/components/ui/card.tsx` uses `rounded-lg`) |
| Border | 1 px (2 px in the file) in `--border` of the shot's theme: `#dad7cf` light, `#2f3135` dark | The app background `--bg` `#f3f2ee` is also the slide background, so without a line the edge of a light shot disappears |
| Shadow | `--shadow-md`: `0 4px 12px -2px` at 0.12 and `0 2px 4px` at 0.06, colour `rgb(30 20 10)` | One step above the cards inside the shot (they use `--shadow-sm`), so the shot reads as one object on the slide. Light shadow colour, because the slide is light |
| Shadow margin | 24 px (48 px in the file) of transparent space on every side of the framed file | Room for the shadow; the framed file is 2976 × 1896 px |

### Chrome to hide and to keep

- **Hidden:** all browser chrome. Shots come from headless Chromium, so there is no address bar, tab strip, bookmarks bar, extension icon or personal tab to leak. The Next.js dev indicator and the scrollbars are hidden with CSS. The mouse pointer is parked in the top-left corner and is not drawn.
- **Kept:** everything the app draws: the sidebar, the module switcher, the provider badge, the theme button, and every provenance badge ("Demo data", "Includes demo data", "Invented demo record", "Mock result", "Mock predictions", "Sample result"). They are part of the product and of the honesty rule.
- **Motion:** shots are taken with reduced motion, so count-ups and box drawing have finished. The end state is the same as with motion on.

## Why this frame

Three variants were drawn on the slide background from the same road result (`frame-compare-g56.png` in the screenshot folder, outside git):

| Variant | Result |
|---|---|
| A · border, square corners | Square corners look unlike the app, where every card is rounded |
| B · minimal browser bar | Chrome that is not the product, about 5% of the height, and the place where personal tabs and bookmarks show up |
| C · no chrome, soft shadow | Closest to the app, but the light shot's right and bottom edges vanish into the slide background |
| **Chosen: C plus a 1 px border** | Reads like one of the app's own cards; the edge stays visible in light and dark |

## File names

`NN-name-theme.png`, where NN is the slide number in `docs/PRESENTATION.md`, `backup-` marks a backup slide and `-mobile` the 375 px shot. Examples: `03-roads-result-light.png`, `backup-overview-dark.png`, `03-roads-result-mobile-light.png`.

Each shot is written twice: `raw/` holds the viewport as the app draws it, `framed/` the same image with radius, border, shadow and margin, on a transparent background. Put the framed file on a slide; use the raw file for detail crops and annotations.

Screenshots never go into git. They live in the shared Drive folder `screenshots/` (X-5) and on the presenting laptop.

## Shot list

| File | Route | Action before the shot | Slide |
|---|---|---|---|
| `01-landing` | `/` | none | 1, backup |
| `03-roads-result` | `/app/roads/analyze?sample=s01` | Press "Analyze photo", wait for the "Why this priority" tab | 3, demo backup |
| `03-restroom-compare` | `/app/restrooms/compare?a=classic-m&b=line-f` (pair "Signs from two sets") | Press "Compare signs", wait for the "Why this verdict" tab | 3, demo backup |
| `06-roads-rules` | `/app/roads/rules` | none (live preview on the default sample) | 6 |
| `06-model-roads` | `/app/model#roads` | none | 6 |
| `08-model-restrooms` | `/app/model#restrooms` | none | 8 |
| `backup-overview` | `/app` | none | backup |
| `backup-analytics` | `/app/analytics` | none | backup |
| `backup-design` | `/design` | none | backup |
| `03-roads-result-mobile` | `/app/roads/analyze?sample=s01` at 375 × 812 | As `03-roads-result` | backup |

The slide 9 heuristic shots (G-13) are detail crops from these files.

## How to take them

`screenshots/take_screenshots.py` does all of the above with Playwright and Chromium:

```bash
python docs/design/screenshots/take_screenshots.py --base http://localhost:3000 --out ../deck-screenshots
python docs/design/screenshots/take_screenshots.py --out ../deck-screenshots --only 03-roads-result --theme light
```

It sets the theme the way the app does: the JSON string `"light"` or `"dark"` in localStorage `qarau:theme` (`web/lib/theme-script.ts`), plus the matching `prefers-color-scheme`. `--provider local` stores the Local provider in `qarau:settings` for shots of the trained model; the API must be running for that.

Retake a shot only when its page changes. Before using a shot, open it at full size and check: no face, no licence plate (the samples are drawings today, see `imagery.md`), the Demo or Mock badge is in the frame where the data is demo data, and no dev overlay.

## Markers on a shot (G-72)

The annotated road and sign results (`annotations.md`, drawn by `screenshots/annotate.py`) follow these rules; use them for any other annotated shot.

- At most four markers per shot. A marker is a numbered circle in `--accent` with the number in `--accent-fg`, a 3 px outline around its target and, if the circle sits away from the target, a thin leader line.
- Circles go in empty space next to the target, never on text, a value or a badge. Nothing is dimmed.
- The legend sits beside the shot: the same circle, a label of two to four words and at most one short line, all at 18 pt or more on the slide.
- A label repeats what the screen shows and adds no number or claim that is not visible in the shot.
- The Mock, demo and provider badges stay visible and uncovered (U8). The script stops if a marker touches one.
- After a retake, move the markers to the new positions and check every label against the new screen.
