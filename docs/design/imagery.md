# Imagery rules (G-63)

Which images Qarau shows, how they are shaped and cropped, what they must never show, and how they are credited. The rules come from what is in the repository on 11 November 2026, the dataset cards and privacy section in `data/README.md`, and `web/lib/credits.ts`. They apply to the app, the deck (screenshots: `screenshots.md`) and the backup video (`video.md`).

## What the app shows today

| Image | Files | Kind | Source and labelling |
|---|---|---|---|
| Six road samples | `web/public/samples/s01…s06.svg` | Original SVG drawings, 1280 × 720 (16:9) | Boxes are hand-placed in `samples.json`; Analyze says "Samples are drawings, not real photos. Their boxes are fixed in samples.json." |
| Twelve drawn door signs | `web/public/samples/restrooms/{classic,faint,geometric,line,rounded,twins}-{m,f}.svg` | Original drawings, six sets | The sample dialog says "Six sets of original drawings and six sets of real IOAI signs." |
| Twelve real door signs | `web/public/samples/restrooms/ioai-v*.webp` | IOAI 2025 validation images, icons only | CC-BY-4.0, resized to at most 256 px and saved as WebP (`DATA_CREDITS.restroomSamples`) |
| Landing demos | `web/components/landing/hero-demo.tsx`, `pair-demo.tsx` | The s01 drawing and four drawn sign pairs | "Sample result" badge (`web/app/page.tsx`) |
| Brand | `web/app/icon.svg`, `apple-icon.png`, `opengraph-image.png`, `web/public/brand/` | Drawn mark and wordmark | G-5, G-53 |
| A user's photo | uploaded on Analyze or Compare | Real photo | Shown only in that browser; history keeps a JPEG thumbnail of at most 640 px in localStorage (`web/lib/image.ts`) |

There are no stock photos, no photos of people and no pothole dataset photos in the app. The public samples are drawings on purpose: the rights to single dataset photos are not established by the dataset licence, and three dataset photos carry stock-photo watermarks (`data/README.md`, Licence judgement).

## Rules

### 1. Drawings say they are drawings

- A drawing stands in for a photo only where a label says so, at the place where it is picked (the Analyze sample line, the Compare sample dialog, the demo path note, the Model page dataset card). A new drawing gets the same kind of label.
- Drawings are read by Mock only; a real model cannot read them (`web/components/restrooms/match-client.tsx`, `web/components/app/demo-path.tsx`). Never show a drawing next to a Local or Cloud result.
- Icons in the interface come from lucide-react, never emoji (ANTI-SLOP R3).

### 2. Real photos: privacy first

- Allowed sources: the public datasets (data cards in `data/README.md`) and photos the team took that passed the face and plate check of D-12. Not stock sites, not search results.
- Never shown publicly: a face or a person, a licence plate, the inside of a restroom, anyone near a door. Restroom images show the sign only; the Settings privacy card says "Restroom images must show signs only, never people."
- A photo that fails the check is not used anywhere public; it may only be analysed with the local model (`data/README.md`, Privacy). Known cases in the pothole dataset: people in `img-193.jpg`, plates in `img-448.jpg`, watermarks in `img-565.jpg`, `img-409.jpg`, `img-448.jpg`. None of them goes on a slide, in the video or in the repository.
- EXIF is removed before a photo leaves the team. In the app, "Strip GPS from photo metadata" is on by default and re-draws each upload in the browser, which drops all EXIF (`web/lib/image.ts`).
- Every image that leaves the team gets a row in the D-12 screening table in `data/README.md` (who checked, when). The table is still empty: the first real sample photo fills it.

### 3. Shape and crop

- **Road photos and drawings are 16:9**, like the six samples (1280 × 720). The sample picker shows thumbnails at 16:9 with `object-cover` (`analyze-client.tsx`), so another shape loses its edges there.
- **A photo with boxes is never cropped or stretched.** The overlay takes its aspect ratio from the image's own width and height (`detection-overlay.tsx`), and the boxes are fractions of the whole image, so cropping the photo moves every box. To show a detail on a slide, crop the screenshot around the photo, not the photo.
- **Door signs** sit in a 5:6 slot with `object-contain` (`sign-slot.tsx`), so a sign is never cut. A new sign image: the sign centred on a plain background, at most 256 px on the long side, like the IOAI samples.
- **Uploads:** JPEG, PNG or WebP, at most 10 MB (`web/lib/upload.ts`).
- **Screenshots:** the frame, scale and crop in `screenshots.md`.

### 4. Credits

- `web/lib/credits.ts` is the one place for credits. The footer, About and the Model page read from it; nobody types a credit by hand.
- Format, also used on the video end card: "Data: <name>, by <author> (<where>, <licence>)." For example: "Annotated Potholes Image Dataset, by Atikur Rahman Chitholian (Kaggle, ODbL / DbCL)" and "IOAI 2025 Individual Contest, “Restroom Icon Matching” (CC-BY-4.0)".
- On a slide, an image under CC-BY-4.0 (an IOAI sign) gets a one-line credit under it in `--subtle`. Other sources go in the speaker notes, as the template says.
- A dataset licence does not cover rights to each photo (`data/README.md`); a dataset photo on a slide needs the D-12 check and a credit.

## Footer check (step 4 of G-63)

Checked on 11 November 2026 against `web/lib/credits.ts`:

| Credit | Footer (`site-footer.tsx`) | About | Model page |
|---|---|---|---|
| Pothole dataset: name, link, author, licence | All four, read from `DATA_CREDITS.pothole` | All four | Name, source and licence in the roads dataset card, read from the results file (`web/data/experiments.json`, from the dataset card), not from `credits.ts` |
| Restroom dataset: name, link, licence | All three, read from `DATA_CREDITS.restroom` | All three | All three |
| Real sample signs: author, licence, changes | One sentence: "The drawn sample icons are original; the real sample signs are IOAI images." | Author, licence and "Resized to at most 256 px and saved as WebP" | The change line |
| Map | `DATA_CREDITS.map.name` in the bottom line | Name and licence | — |

The footer matches `credits.ts`: every value comes from `DATA_CREDITS`, none is typed by hand. It names the IOAI committee and the resize only through About, which is enough for a footer. The Model page's roads card is the one credit with a second source (the results file); both say the same dataset, author and licence today, so a change to the dataset card has to reach both.

## Before an image goes public

- [ ] A drawing carries its label, or a photo passed D-12: no face, person, plate or restroom interior, EXIF removed.
- [ ] Not a stock photo and not watermarked.
- [ ] Road images 16:9; boxes not cropped; signs not cut.
- [ ] Credited from `web/lib/credits.ts`.
