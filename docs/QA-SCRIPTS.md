# QA Test Scripts

Manual test scripts for the live Qarau site and its model service API.
Task: [R-46](https://github.com/tairqaldy/qarau-ict-final-1st-trimester/issues/255) · Owner: Roma · Done when: this file has ≥ 9 scripts, each with preconditions and an expected result per step.

Run every script after the demo local stack is started with `scripts/demo-local.sh` and the browser is open to `http://localhost:3000`.
For scripts that target the API directly, the service is at `http://localhost:8000`.

**Sample images** used in these scripts live in `data/samples/`.
Label the result of each step **PASS**, **FAIL**, or **SKIP** (when a prerequisite was not met).
File one GitHub issue for every FAIL, linking this script and step.

---

## Quick reference: pages under test

| URL | What it is |
|---|---|
| `/` | Landing page |
| `/app` | Platform overview (both modules) |
| `/app/roads` | Roads dashboard — upload & analyze |
| `/app/restrooms` | Restrooms dashboard — compare signs |
| `/app/analytics` | Usage analytics |
| `/app/model` | Model card and experiment table |
| `/app/settings` | Provider switch (mock / local / cloud) |
| `http://localhost:8000/health` | API liveness |
| `http://localhost:8000/ready` | API model-load check |
| `http://localhost:8000/docs` | FastAPI interactive docs (Swagger UI) |

---

## TS-01 · API health and liveness

**What it covers:** `/health` and `/ready` endpoints, provider status display in the UI.

**Preconditions:**
- `scripts/demo-local.sh` has been run (or `uvicorn main:app --port 8000` from `api/`).
- A terminal or browser is available.
- Both model weight files exist: `api/weights/jolscan-e1.pt` and either the CLIP model is downloaded or `RESTROOM_MODEL` is set.

| Step | Action | Expected result |
|---|---|---|
| 1 | Open `http://localhost:8000/health` in a browser or run `curl http://localhost:8000/health`. | Response is HTTP 200 JSON. `status` is `"ok"`. `models.pothole.weightsFileFound` is `true`. |
| 2 | Open `http://localhost:8000/ready`. | Response is HTTP 200 JSON. `ready` is `true`. Both `models.pothole.ready` and `models.restroom.ready` are `true`. |
| 3 | In the web app, open **Settings** (`/app/settings`). Set provider to **local**. | Provider is saved. The provider pill in the top bar shows "local". |
| 4 | Navigate to `/app/roads`. | A green or amber status indicator confirms the local service is reachable. No "Service unavailable" banner is shown. |
| 5 | Stop the API (`Ctrl+C` in its terminal). Reload `/app/roads`. | The app shows a clear error or banner ("local service unavailable"). It does not crash or show a blank page. |
| 6 | Restart the API. Reload the page. | The error banner disappears without a full page reload, or disappears on the next manual reload. |

---

## TS-02 · Roads — pothole upload and severity display (mock provider)

**What it covers:** File upload on `/app/roads`, mock inference, rule engine output, severity badge, recommended action, rule-hit list.

**Preconditions:**
- Settings provider is set to **mock**.
- A JPEG road image is available from `data/samples/` (e.g. `pothole_sample.jpg`).

| Step | Action | Expected result |
|---|---|---|
| 1 | Open `/app/roads`. | The upload area is visible. Provider pill shows "mock". |
| 2 | Drag and drop `pothole_sample.jpg` onto the upload zone. | A loading indicator appears immediately. |
| 3 | Wait for the result card to appear (< 2 s on mock). | The result card shows: **severity badge** (clear / low / medium / high / critical), **score** (a non-negative number), **recommended action** text, **detections** count, and **latency**. |
| 4 | Check the rule-hit section. | At least one rule (R1–R6 from `docs/RULES.md`) is listed by ID and title. |
| 5 | Hover or click on a bounding-box overlay on the image (if detections > 0). | Each box shows the detection's ID, label "pothole", and confidence percentage. |
| 6 | Click **Analyze another** (or the clear / reset button). | The result panel closes. The upload zone returns to its initial empty state. |
| 7 | Upload an image that has no road content (e.g. a portrait photo from your camera roll). | The app accepts it; score = 0, severity = clear, 0 detections. No crash. *(Mock always returns its canned result; test with local provider for true inference.)* |

---

## TS-03 · Roads — confidence threshold and rule precision (local provider)

**What it covers:** `conf` parameter, rule R1 (counting threshold τ = 0.40), `needsReview` flag, severity scoring.

**Preconditions:**
- Settings provider is **local** and the pothole model is loaded (TS-01 step 2 passed).
- Use `data/samples/` or any road photo known to have potholes.

| Step | Action | Expected result |
|---|---|---|
| 1 | Upload a road photo with the default confidence (0.25). | Detections with confidence 0.25–0.39 may appear; `needsReview` is `true` if any exist below τ. A "needs review" notice is visible. |
| 2 | In the Settings or via the form slider (if present), raise the displayed threshold to 0.40. Re-upload the same image. | Only detections with confidence ≥ 0.40 are counted in the score. `needsReview` is `false` if no detections fall below 0.40. |
| 3 | Note the score. Compare with the RULES.md worked examples: a highway photo with one large in-lane pothole should produce score ≥ 9 (critical). | Score matches the expected output from the rules formula: `(sizePoints × laneMultiplier + clusterBonus) × roadClassMultiplier + schoolZoneBonus`. |
| 4 | Upload a completely blank white JPEG (create one or use an all-white sample). | Score is 0, severity is "clear", detections = 0, recommended action is "No action". |
| 5 | Submit a file over 10 MB (create a large duplicate). | The app shows an upload error (file too large). The API returns HTTP 400. No crash. |

---

## TS-04 · Roads — file format and edge-case rejection

**What it covers:** Upload validation for format, size, and corrupt input.

**Preconditions:**
- Either mock or local provider is active.
- Prepare: a `.txt` file renamed as `.jpg`, a 0-byte file, and a valid `.webp` image.

| Step | Action | Expected result |
|---|---|---|
| 1 | Drag a `.txt` file (renamed `fake.jpg`) onto the upload zone. | App rejects it immediately with a human-readable error ("unsupported file type"). No API call is made, or the API returns HTTP 400. |
| 2 | Upload a 0-byte file (`empty.jpg`). | App rejects it ("empty file" or similar). No server crash. |
| 3 | Upload a valid `.png` image. | The image is accepted and analyzed. The result card appears correctly. |
| 4 | Upload a valid `.webp` image. | Accepted and analyzed. The API's `imageWidth` and `imageHeight` in the response match the actual image dimensions. |
| 5 | Upload a valid `.jpg` image with EXIF rotation metadata (a portrait photo taken on a phone). | The image is displayed correctly oriented in the preview. Bounding boxes overlay at the correct location. |

---

## TS-05 · Restrooms — compare two signs (mock provider)

**What it covers:** `/app/restrooms` page, the Compare tab, `POST /api/restroom` → `POST /restroom/compare`, `CompareResult` schema fields, signage rules from `docs/RULES.md` Part 2.

**Preconditions:**
- Settings provider is **mock**.
- Two restroom sign images are available from `data/samples/` or `docs/research/vlm-evaluation.md` audit images.

| Step | Action | Expected result |
|---|---|---|
| 1 | Open `/app/restrooms`. | The page loads with a Compare tab (or section) and a Match tab visible. Provider pill shows "mock". |
| 2 | Upload sign image A (a "male" pictogram) in the first slot and sign image B (a "female" pictogram) in the second slot. | Both upload slots show a preview thumbnail. |
| 3 | Click **Compare**. | A result card appears with: `a.gender`, `a.confidence`, `b.gender`, `b.confidence`, `similarity` (0..1). Latency in milliseconds. |
| 4 | Check the signage verdict. | The UI applies Rules Part 2 from `docs/RULES.md`: if genders differ and similarity is below the threshold, verdict is "Compliant" (signs are distinct and correctly gendered). The verdict label and colour match the gender token colours from `docs/DESIGN-BRIEF.md` (`--gender-male` / `--gender-female`). |
| 5 | Upload two copies of the **same** sign image in both slots. | Similarity is close to 1.0. Verdict is "Non-compliant" or "Same sign" because both sides show the same gender. |
| 6 | Clear the form and try without uploading image B. Click Compare. | App shows a validation error ("Please upload both images"). No API call with a missing file. |

---

## TS-06 · Restrooms — match a query sign against a gallery

**What it covers:** Match tab, `POST /restroom/match`, `MatchResult` schema (`bestMatchId`, `candidates`), two-step pipeline logic.

**Preconditions:**
- Settings provider is **local** (match requires the CLIP model).
- At least one query image and two gallery images from `data/samples/` or the VLM audit set.

| Step | Action | Expected result |
|---|---|---|
| 1 | Open `/app/restrooms` → Match tab. | A query upload slot and a gallery upload slot (multi-image) are visible. |
| 2 | Upload one query sign image and two gallery images. | Thumbnails appear. A "Match" button becomes active. |
| 3 | Click **Match**. | A result card appears with: `query.gender`, `query.confidence`, a ranked list of `candidates` each with `id`, `similarity`, and `prediction.gender`. `bestMatchId` matches one of the uploaded gallery images. Latency shown. |
| 4 | Verify the best match makes visual sense (same design style or complementary gender). | `bestMatchId` points to the gallery image that is most visually similar to the query, per the SIFT + colour + CLIP two-step pipeline described in `api/restroom_pipeline.py`. |
| 5 | Upload 61 gallery images (one over the limit of 60 set in `api/restroom.py:MAX_GALLERY`). | The app shows an error ("Gallery too large, max 60 images") or the API returns HTTP 400. No silent truncation. |

---

## TS-07 · Analytics page

**What it covers:** `/app/analytics` page renders, charts load, no crash on empty history.

**Preconditions:**
- The app is running. At least one analysis has been performed (from TS-02 or TS-03).

| Step | Action | Expected result |
|---|---|---|
| 1 | Open `/app/analytics`. | Page loads without error. At least one chart or table is visible. |
| 2 | Check the data shown. | The analysis count, severity distribution, and latency numbers are consistent with the analyses performed in this test session. |
| 3 | Clear browser local storage (`DevTools → Application → Storage → Clear site data`). Reload `/app/analytics`. | Page loads without crash. Empty-state messaging is shown ("No analyses yet" or similar). No JavaScript error in the console. |
| 4 | Perform a new analysis (TS-02). Navigate back to `/app/analytics`. | The new result appears in the chart or table. |

---

## TS-08 · Model page — experiment table and champion

**What it covers:** `/app/model`, `web/data/experiments.json` contract, champion run display, dataset card.

**Preconditions:**
- `web/data/experiments.json` exists (committed to `main`; `isMock` may be `true` until E0 is done).

| Step | Action | Expected result |
|---|---|---|
| 1 | Open `/app/model`. | Page loads. A table of experiment runs is visible (E0–E8 or mock placeholders). |
| 2 | Identify the champion row. | The champion row (matching `champion` in `experiments.json`, e.g. "E8") is highlighted or labelled "Champion". The model name shown matches `championModelName`. |
| 3 | Check the dataset card section. | Dataset name, source, licence, class list, and image counts (train / val / test) are displayed. These must match the values in `experiments.json`. |
| 4 | Check the metrics columns. | Precision, recall, mAP50, mAP50-95, latency, and size columns are present for each run. Numbers are not "NaN", not empty, and not identical across all rows (unless the file is explicitly marked `isMock: true`). |
| 5 | Click the "Rules" link or navigate to the rules section (if present). | The rules table from `docs/RULES.md` Part 1 (R1–R6) is visible with their current thresholds. |

---

## TS-09 · Mobile layout — portrait phone viewport

**What it covers:** Responsive layout on a narrow screen (≤ 390 px wide), touch targets, no horizontal scroll.

**Preconditions:**
- Chrome DevTools open. Device toolbar enabled. Preset: **iPhone 14 Pro** (393 × 852) or equivalent.
- Or test on a real phone via the local network IP (`http://<LAN-IP>:3000`).

| Step | Action | Expected result |
|---|---|---|
| 1 | Open `/` in the phone viewport. | The landing page fits the screen. No horizontal scroll bar. Hero text is fully readable. The CTA button is tappable (≥ 44 × 44 CSS px per WCAG 2.5.5). |
| 2 | Navigate to `/app/roads`. | The upload zone is full-width. The result card stacks vertically below the image preview. |
| 3 | Upload a photo using the mobile file picker or by tapping the upload zone. | The file picker opens. After selection, the image uploads and an analysis result appears. |
| 4 | Open the navigation menu (hamburger or sidebar). | All navigation items are accessible. The menu closes when a link is tapped. |
| 5 | Open `/app/model`. | The experiment table is scrollable horizontally inside its container (not the whole page). No content is clipped. |
| 6 | Open `/app/restrooms`. | Both upload slots and the Compare button are visible without scrolling past the fold (or the page scrolls naturally to reach them). |

---

## TS-10 · Dark-theme and light-theme toggle

**What it covers:** Theme switching, contrast tokens from `docs/DESIGN-BRIEF.md`, no missing styles.

**Preconditions:**
- The app is running in a desktop browser.
- The theme toggle button is present (top bar or settings).

| Step | Action | Expected result |
|---|---|---|
| 1 | Load the app in the default theme (light). | Background is near-white (`--bg`), text is graphite (`--fg #1b1c1e`), accent is amber. |
| 2 | Click the theme toggle to switch to dark. | Background changes to a dark surface, text to `--fg #ecebe7`. Accent changes to `--accent #ffb81c`. No flash of unstyled content. |
| 3 | Reload the page while in dark mode. | Dark mode is preserved (persisted in local storage or a cookie). |
| 4 | On the Roads result card, check the severity badge colours in dark mode. | Critical badge uses `--sev-critical` and `--sev-critical-ink` from the design tokens, not hardcoded red. Text is legible. |
| 5 | On the Restrooms result, check gender badge colours in dark mode. | Male uses `--gender-male` / `--gender-male-ink` (#0f766e / #8fdcd2), female uses `--gender-female` / `--gender-female-ink` (#5b4bb0 / #c7befa). Both are distinguishable without relying on colour alone (icon or label is present). |
| 6 | Switch back to light mode. | Light tokens restore correctly. No residual dark-mode styles. |

---

## TS-11 · Offline / network-error fallback

**What it covers:** Graceful degradation when the local API is unreachable, error messages, mock provider fallback.

**Preconditions:**
- The app is running (`http://localhost:3000`).
- The API is running (TS-01 passed).

| Step | Action | Expected result |
|---|---|---|
| 1 | In Settings, set provider to **local**. Upload a road photo on `/app/roads`. | Analysis succeeds (baseline). |
| 2 | In Chrome DevTools → Network tab, enable **Offline** mode. Upload the same photo. | The app shows a network error message ("Cannot reach local service" or similar). It does not hang indefinitely (timeout ≤ 10 s). |
| 3 | Disable offline mode in DevTools. Upload again. | Analysis succeeds again. No reload required. |
| 4 | In Settings, switch provider to **mock**. With offline mode still off, upload a photo. | Mock analysis succeeds (mock does not require the API). |
| 5 | Enable offline mode again. Upload with mock provider. | Mock analysis still succeeds (mock is served by the Next.js route handler, no external call). |

---

## TS-12 · Concurrent upload requests (API stress)

**What it covers:** `api/main.py` inference lock (`_yolo_inference_lock`), concurrency safety, no 500 errors under load.

**Preconditions:**
- The API is running locally with the pothole model loaded.
- `curl` or the existing `api/test_concurrency.py` script is available.
- **This test is run from a terminal, not the browser.**

| Step | Action | Expected result |
|---|---|---|
| 1 | From `api/`, run: `python test_concurrency.py` (or the equivalent script). | The script sends multiple simultaneous `/predict` requests. All requests return HTTP 200. No request returns HTTP 500. |
| 2 | While concurrent requests are running (or immediately after), call `GET /health`. | `/health` responds in < 500 ms with HTTP 200 (it never waits on inference). |
| 3 | Inspect the response bodies from step 1. | All responses have the same `model` field. Each `detections` list is internally consistent (no mixed results from different images). |
| 4 | Check the prediction log file (if `PREDICT_LOG_PATH` is set). | The CSV has one row per request. No duplicate rows. `detectionCount` matches the `detections` array length in each corresponding response. |

---

## TS-13 · Settings — provider persistence and switch

**What it covers:** Provider switch (mock / local / cloud), URL routing, provider pill update, Settings page save.

**Preconditions:**
- The app is running. Local API may or may not be running.

| Step | Action | Expected result |
|---|---|---|
| 1 | Open `/app/settings`. | Current provider is shown with the active option highlighted. |
| 2 | Switch to **mock**. Save or navigate away. | Provider pill in the top bar updates to "mock". The setting persists after a page refresh. |
| 3 | Switch to **local**. | Provider pill updates to "local". If the local API is not reachable, a warning is shown immediately (not only after upload). |
| 4 | Switch to **cloud**. | Provider pill updates to "cloud". If the cloud endpoint is not configured, a warning or placeholder is shown. |
| 5 | Reopen `/app/settings`. | The previously saved provider is pre-selected. It was not reset to mock. |

---

## TS-14 · Landing page — content and navigation

**What it covers:** `/` (landing), hero section, CTA links, module cards, no broken links.

**Preconditions:**
- App is running. No sign-in required.

| Step | Action | Expected result |
|---|---|---|
| 1 | Open `/`. | The page loads. The logo (viewfinder-around-a-pothole mark from `docs/DESIGN-BRIEF.md`) and the wordmark "Qarau" / "қарау" are visible. |
| 2 | Read the hero headline. | It describes the product purpose in English and/or Kazakh. The word "қарау" is rendered correctly (Overpass or fallback Cyrillic font, not boxes). |
| 3 | Click the primary CTA button ("Analyze" or "Open app"). | Navigation goes to `/app` or `/app/roads`. No 404. |
| 4 | Scroll to the module cards section. | Cards for "Roads" and "Restrooms" are present and visually equal in size (same prominence). |
| 5 | Click the Roads card. | Navigates to `/app/roads`. |
| 6 | Go back. Click the Restrooms card. | Navigates to `/app/restrooms`. |
| 7 | Check the browser console for JS errors on `/`. | Zero red errors in the console. Warnings about missing data are acceptable if `isMock: true`. |

---

## Run log template

Copy and fill in after each test session:

```
Date: YYYY-MM-DD
Tester: Roma
Device: MacBook Pro 16" / iPhone 14 / …
Browser: Chrome 130 / Safari 18 / …
Provider tested: mock | local | cloud
API version (git sha): …

| Script | PASS / FAIL / SKIP | Notes / Issue link |
|---|---|---|
| TS-01 | | |
| TS-02 | | |
| TS-03 | | |
| TS-04 | | |
| TS-05 | | |
| TS-06 | | |
| TS-07 | | |
| TS-08 | | |
| TS-09 | | |
| TS-10 | | |
| TS-11 | | |
| TS-12 | | |
| TS-13 | | |
| TS-14 | | |
```

Results from actual runs go in [R-47](https://github.com/tairqaldy/qarau-ict-final-1st-trimester/issues/256) (device matrix) and [R-48](https://github.com/tairqaldy/qarau-ict-final-1st-trimester/issues/257) (usability test).
