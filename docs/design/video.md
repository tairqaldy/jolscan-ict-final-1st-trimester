# Backup video look (G-57)

The backup video (R-9) plays if the laptop or the live demo fails (`docs/PRESENTATION.md`, demo script). It should look like the deck: the same light tokens, the same two fonts, the same mark and road stripe. This page fixes the title card, the captions, the cursor and the end card. The cards are drawn in `video/`:

| File | What |
|---|---|
| `video/title-card.svg`, `.png` | Title card, 1920 × 1080 |
| `video/end-card.svg`, `.png` | End card, 1920 × 1080 |
| `video/caption-layout.svg`, `.png` | Where the recording and the caption bar sit in the frame |
| `video/make_poster.py` | Draws the poster frame (G-67) from the deck screenshots; the PNG files stay outside git, see "Poster frame" |

The PNG files are rendered from the SVG files in Chromium with Overpass and JetBrains Mono loaded, so they look right in any video editor. Use the PNG files; the SVG files are the source.

## Frame

| Property | Value | Why |
|---|---|---|
| Size | 1920 × 1080, 16:9, MP4 (H.264), 30 fps | The deck's shape; R-9 asks for `qarau-demo.mp4` |
| App shots | The recording fills the top 1920 × 960; the bottom 120 px is the caption bar | A caption can never cover the result, the boxes, the verdict or a Demo badge |
| Recording | Cmd+Shift+5, Record Selected Portion, over the browser's page area in a 2:1 shape (for example 1440 × 720 points) | Same shape as the 1920 × 960 area, so nothing is stretched or cropped later |
| Screen | Light theme, browser page only: no address bar, bookmarks bar, other tabs, account names or notifications | The chrome rules of `screenshots.md` |
| Length | 60 to 90 s, cards included | R-9 done-check |

## Sequence

The shot list is R-9's, from the demo script. Times are a plan, not a rule; the total must stay between 60 and 90 s.

| # | Shot | Seconds | Example caption (Roma words the final ones) |
|---|---|---|---|
| | Title card | 3 | none |
| 01 | Landing page | 5 | Qarau checks road photos and restroom door signs |
| 02 | Roads, Analyze: the road photo, boxes, severity, one rule hit | 30 | Each box is one pothole; six rules turn them into a repair priority |
| 03 | Restrooms, Compare: a mismatched pair, genders, similarity, verdict | 25 | Two doors, two sign sets: the verdict says to check the signs on site |
| 04 | Platform overview | 10 | These tiles and charts run on demo data |
| 05 | Model page, both experiment tables | 10 | The model page shows our real experiment results |
| | End card | 4 | none |

Caption 04 is required: the video has to say which screens are demo data (R-9 done-check, U8).

## Captions

| Property | Value |
|---|---|
| Bar | Full width, 120 px tall, `--inverse` `#1c1d1f` |
| Step number | JetBrains Mono, 32 px, brand amber `#f2a900`, at x = 64 px. The same "01", "02" as on the section dividers |
| Text | Overpass SemiBold (600), 40 px, `--inverse-fg` `#f3f2ee`, at x = 150 px, centred in the bar |
| Contrast | Text 15.06:1, amber number 8.39:1 on the bar (WCAG relative luminance) |
| Length | One line, at most about 60 characters, sentence case, no full stop |
| Timing | One caption per shot, on screen for the whole shot; it changes only at a cut |

Captions are always on. A voice-over is optional (R-9 step 5); without one, the presenter can talk over the video and a noisy room still gets the steps.

## Cursor

- The system pointer at its normal size. Turn on **Show Mouse Clicks** in Cmd+Shift+5 → Options, so each click shows a circle.
- No added zoom, spotlight, cursor trail or click sound.
- Move the pointer only to click. While a result is on screen, park the pointer on the sidebar so it never covers a box, a number or a badge.
- Keyboard focus rings stay as the app draws them.

## Cuts, motion and sound

- Hard cuts between shots. A 200 ms cross-fade only into and out of the cards (page changes are 150 to 200 ms in `docs/DESIGN-BRIEF.md`, Motion).
- No zooms, pans, transitions or speed ramps. The app's own motion (boxes drawn one by one, numbers counting up) already shows what happened.
- Never speed up or cut the wait for a result: "Analysing…" and the scan line are the real latency (U2).
- No music and no sound effects.

## Title card

`video/title-card.png`, 3 s. On `--bg` `#f3f2ee`: the mark from `web/app/icon.svg` (160 px) and the name "Qarau" in Overpass Bold; the eyebrow "ҚАРАУ · KAZAKH FOR “TO INSPECT”" in `--accent-ink` `#855700`; the tagline from `web/lib/brand.ts` in `--muted`; "Backup demo · Roads and Restrooms" and the course line in JetBrains Mono; the road stripe from slide 1 at the bottom. It says what the video is, and nothing it cannot prove.

## End card

`video/end-card.png`, 4 s. The links of the closing slide (repository and `qarau.vercel.app`), the team, one honesty line ("Screens marked “Demo data” or “Mock result” show invented data. The model page shows our real results.") and the data credits from `web/lib/credits.ts`. Mark, name and road stripe as on the title card.

## Poster frame

The poster (G-67) is the still that stands for the video before it plays: in the player, in Drive's preview and on the fallback slide (R-28). It is also the first second of the file, so all three show the same picture.

`video/make_poster.py` draws three 1920 × 1080 variants from the G-11 deck screenshots `raw/03-roads-result-light.png` and `raw/03-restroom-compare-light.png` (Mock provider, sample `s01` and the pair `classic-m` / `line-f`, 11 November 2026 18:09) and a sheet that shows each one at 320 px wide (a file preview) and at 1280 × 720. All files go to `poster/` next to `raw/`, outside git.

```bash
python docs/design/video/make_poster.py --shots ../deck-screenshots
python docs/design/video/make_poster.py --shots ../deck-screenshots --only a --length 1:12   # once R-9's file exists
```

| Variant | What it shows | At 320 px wide | At 1280 × 720 |
|---|---|---|---|
| **A (chosen)** | The road result across the width (photo with three boxes, "Critical", score 15, the "Mock result" badge, provider and model); under it the mark and "Qarau", and "Backup demo · Roads and Restrooms" and "Mock result" on the right; the road stripe | The boxes, the red badge and "15" are what you see; the name reads | Every value and the badge read |
| B | The name row on top; the road result and the sign verdict side by side | The two shots are 195 and 94 px wide; neither reads | Readable, but both shots are small |
| C | Mark, name and title in a left column; the road result on the right | The name is the biggest thing; the result is a small picture | The shot is 1216 px wide, against 1776 px in A |

**Why A.** A poster should show the product doing its one job, with the name and what the video is. In A the result fills the width, so even as a 320 px file preview the boxes, the red "Critical" badge and the score are the picture; B halves it and C gives a third of the frame to the name. Its words are the title card's line and the app's own badge, so the poster says nothing the video does not. It uses the mark, the light tokens and the road stripe of the title and end cards, so the three stills read as one set.

**Honesty.**

- The result is a Mock result. The "Mock result" badge stays inside the crop and the poster repeats "Mock result" under the title, so the poster never shows it as a model result (U8). The script stops if a crop cuts the badge.
- Every word and number on the poster also appears in the recording, if R-9 records shot 02 on sample `s01` with the Mock provider, as the deck shots are: the boxes (91, 84 and 67 %), "Critical", 15, the action, 24 h, "Mock", `mock-fixtures`. The crop stops above the "Model latency" and "Analysed" row, because the time changes with every run; the script stops if a crop shows it. If R-9 uses another sample or the Local provider, retake the shot the same way (`screenshots.md`) and redraw; a Local shot has no Mock badge, so the "Mock result" line and the badge check change with it.
- The length belongs on the poster only once the file exists: redraw with `--length` (for example `--length 1:12` prints "Mock result · 1:12").

### Put the poster in front of the video

ffmpeg makes a copy of R-9's file that starts with the poster for exactly one second. It scales the poster to the video's size (padding with `--bg` if the video is not 16:9), gives it the video's frame rate, adds one second of silence if the video has sound, joins the two and encodes H.264 again. Install it once with `brew install ffmpeg` (Mac; `ffprobe` comes with it). Then, in a folder with R-9's `qarau-demo.mp4` and `qarau-poster-a.png`:

```bash
mv qarau-demo.mp4 qarau-demo-raw.mp4      # keep the original
cp qarau-poster-a.png qarau-poster.png
IFS=, read W H FPS < <(ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate -of csv=p=0 qarau-demo-raw.mp4)
SOUND=$(ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 qarau-demo-raw.mp4)
echo "$W x $H, $FPS fps, sound: ${SOUND:-none}"   # expect 1920 x 1080, 30/1 fps
POSTER="[0:v]scale=${W}:${H}:force_original_aspect_ratio=decrease,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2:color=0xF3F2EE,setsar=1,fps=${FPS},trim=duration=1,format=yuv420p[p]"
VIDEO="[1:v]setsar=1,fps=${FPS},format=yuv420p[v]"
if [ -z "$SOUND" ]; then
  ffmpeg -loop 1 -framerate "$FPS" -t 2 -i qarau-poster.png -i qarau-demo-raw.mp4 \
    -filter_complex "${POSTER};${VIDEO};[p][v]concat=n=2:v=1:a=0[outv]" -map "[outv]" \
    -c:v libx264 -crf 18 -preset medium -movflags +faststart qarau-demo.mp4
else
  ffmpeg -loop 1 -framerate "$FPS" -t 2 -i qarau-poster.png -i qarau-demo-raw.mp4 -f lavfi -t 1 -i anullsrc=r=48000:cl=stereo \
    -filter_complex "${POSTER};${VIDEO};[p][2:a][v][1:a]concat=n=2:v=1:a=1[outv][outa]" -map "[outv]" -map "[outa]" \
    -c:v libx264 -crf 18 -preset medium -c:a aac -b:a 192k -movflags +faststart qarau-demo.mp4
fi
for f in qarau-demo-raw.mp4 qarau-demo.mp4; do ffprobe -v error -show_entries format=duration -of csv=p=0 "$f"; done   # the second is 1.0 s longer
```

- The poster is looped for 2 s and trimmed to 1 s after the frame-rate step; with `-t 1` the `fps` filter dropped the last poster frame (29 frames instead of 30).
- If `FPS` prints something odd for an unedited screen recording (for example `600/1`), set `FPS=30/1` before the `POSTER` line; the video is 30 fps (Frame).
- Tested with three 5 s test clips (1920 × 1080 at 30 fps without sound, the same with mono 44.1 kHz sound, 1440 × 720 at 60 fps): each copy was 6.00 s long with 180, 180 and 360 frames, the first 30 (60) frames were the poster and the next frame was the clip's first frame. Not yet run on the real `qarau-demo.mp4`.
- Without ffmpeg, iMovie does the same (drag the PNG before the first clip, set its duration to 1.0 s, File → Share → File), but it may change the length; check it the same way.

Then watch the new file to the end once with Wi-Fi off, and put `qarau-demo.mp4`, `qarau-demo-raw.mp4` and `qarau-poster.png` in Drive `video/` and `qarau-demo.mp4` on the presenting laptop's desktop. Check the three places: the default player, Drive's preview and the fallback slide each show the poster first.

## Before export

- [ ] No caption over the recording area.
- [ ] Every Demo or Mock badge that the app shows is visible in its shot.
- [ ] The road photo passed the face and plate check (D-12); the bundled samples are drawings (`imagery.md`).
- [ ] 60 to 90 s in total, cards included.
- [ ] The first frame is the poster from G-67, if that task is done.
