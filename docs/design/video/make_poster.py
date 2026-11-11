"""Draw the backup video's poster frame (G-67): three 1920 x 1080 variants from the deck screenshots.

The poster is the still that stands for qarau-demo.mp4 before it plays (player, Drive preview, fallback
slide) and the first second of the file. It shows a real result screen of the app, the name and what the
video is. Reads the raw deck screenshots of G-11 (2880 x 1800, light theme, Mock provider):

    <shots>/raw/03-roads-result-light.png       /app/roads/analyze?sample=s01 after "Analyze photo"
    <shots>/raw/03-restroom-compare-light.png   /app/restrooms/compare?a=classic-m&b=line-f after "Compare signs"

and writes to <shots>/poster/:

    qarau-poster-a.png, .svg   road result across the width, name and "Backup demo" under it (the pick)
    qarau-poster-b.png, .svg   road result and sign verdict side by side
    qarau-poster-c.png, .svg   name on the left, road result on the right
    compare.png                the three at 320 px wide (file preview size) and at 1280 x 720

Why A, and the ffmpeg command that puts it in front of the video: docs/design/video.md, "Poster frame".

Honesty checks (the script stops if one fails):
- every crop keeps the app's "Mock result" badge whole, so the poster never shows a Mock result as a
  model result (U8);
- every crop leaves out the "Model latency" and "Analysed" / "Checked" row: the time changes with each
  run, so it would not match the recording. Every other word and number in the crops is fixed by the
  sample and the Mock provider, so it also appears in shot 02 or 03 of the recording;
- the poster's own words are "Qarau", "Backup demo · Roads and Restrooms" (the title card, video.md)
  and "Mock result" (the badge in the crop); --length adds the file's length once R-9's file exists.

    pip install playwright pillow && python -m playwright install chromium
    python docs/design/video/make_poster.py --shots ../deck-screenshots
    python docs/design/video/make_poster.py --shots ../deck-screenshots --only a --length 1:12

Screenshots and posters never go into git (G-11, G-67): keep --shots outside the repository.
"""

from __future__ import annotations

import argparse
from dataclasses import dataclass
from html import escape
from pathlib import Path

from PIL import Image
from playwright.sync_api import sync_playwright

W, H = 1920, 1080
RAW_W, RAW_H = 2880, 1800  # G-56: 1440 x 900 CSS px at device pixel ratio 2
M = 72  # outer margin, as the title card's 160 px is too wide for a picture that is mostly screen

# Light tokens from web/app/tokens.css (the video is light only, video.md).
BG, FG = "#f3f2ee", "#1b1c1e"
ACCENT_INK, BORDER, SHADOW = "#855700", "#dad7cf", "30,20,10"
ASPHALT, AMBER = "#26282b", "#f2a900"
STRIPE_Y = 1000.0  # top of the road stripe, as on the title card

# The mark from web/app/icon.svg (32 x 32).
MARK = ('<rect x="1" y="1" width="30" height="30" rx="7" fill="#f2a900"/>'
        '<path d="M8 13.5V8h5.5M18.5 8H24v5.5M24 18.5V24h-5.5M13.5 24H8v-5.5" fill="none" stroke="#1b1c1e" '
        'stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>'
        '<ellipse cx="16" cy="16.5" rx="3.6" ry="2.4" fill="#1b1c1e"/>')

TITLE = "Backup demo · Roads and Restrooms"  # the title card's line (video.md, "Title card")
MOCK = "Mock result"  # the badge in every crop

Box = tuple[int, int, int, int]  # x0, y0, x1, y1 in raw screenshot pixels


@dataclass
class Shot:
    file: str
    badge: Box  # the "Mock result" badge in the result card: must be inside the crop
    run_row: Box  # "Model latency" and "Analysed"/"Checked": must be outside the crop


ROAD = Shot("03-roads-result-light.png", badge=(1972, 672, 2174, 712), run_row=(1960, 848, 2800, 920))
SIGN = Shot("03-restroom-compare-light.png", badge=(1896, 496, 2098, 536), run_row=(1880, 672, 2800, 742))

# Crops in raw pixels. The bottom edge stops above the run row; the photo loses only its empty lower edge.
ROAD_WIDE: Box = (548, 140, 2830, 838)  # photo with the three boxes, and the whole top of the result card
ROAD_TIGHT: Box = (990, 140, 2830, 838)  # from just left of box 1 to the card's right edge
SIGN_VERDICT: Box = (1846, 36, 2830, 660)  # the verdict card: Review, action, Mock result, provider, model


def check_crop(shot: Shot, crop: Box) -> list[str]:
    x0, y0, x1, y1 = crop
    bad = []
    bx0, by0, bx1, by1 = shot.badge
    if not (x0 <= bx0 and y0 <= by0 and bx1 <= x1 and by1 <= y1):
        bad.append(f"{shot.file} crop {crop} cuts the Mock result badge {shot.badge}")
    rx0, ry0, rx1, ry1 = shot.run_row
    if rx0 < x1 and x0 < rx1 and ry0 < y1 and y0 < ry1:
        bad.append(f"{shot.file} crop {crop} shows the run's latency and time {shot.run_row}")
    if not (0 <= x0 < x1 <= RAW_W and 0 <= y0 < y1 <= RAW_H):
        bad.append(f"{shot.file} crop {crop} is outside the screenshot")
    return bad


_ids = iter(range(1000))


def framed(shot: Shot, crop: Box, x: float, y: float, w: float) -> tuple[str, float]:
    """A crop in the G-56 frame (radius, 1 px border, shadow-md), w px wide. Returns the SVG and the height."""
    cx0, cy0, cx1, cy1 = crop
    h = w * (cy1 - cy0) / (cx1 - cx0)
    k = w / (cx1 - cx0) * 2  # CSS px of the app to poster px
    r = 10 * k  # --radius-lg
    n = next(_ids)
    svg = (
        f'<defs><clipPath id="c{n}"><rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" rx="{r:.1f}"/></clipPath>'
        f'<filter id="s{n}" x="-5%" y="-5%" width="110%" height="120%">'
        f'<feDropShadow dx="0" dy="{4 * k:.2f}" stdDeviation="{6 * k:.2f}" flood-color="rgb({SHADOW})" flood-opacity="0.12"/>'
        f'<feDropShadow dx="0" dy="{2 * k:.2f}" stdDeviation="{2 * k:.2f}" flood-color="rgb({SHADOW})" flood-opacity="0.06"/>'
        "</filter></defs>"
        f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" rx="{r:.1f}" fill="{BG}" filter="url(#s{n})"/>'
        f'<g clip-path="url(#c{n})"><svg x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" '
        f'viewBox="{cx0} {cy0} {cx1 - cx0} {cy1 - cy0}" preserveAspectRatio="none">'
        f'<image href="../raw/{shot.file}" x="0" y="0" width="{RAW_W}" height="{RAW_H}"/></svg></g>'
        f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" rx="{r:.1f}" fill="none" '
        f'stroke="{BORDER}" stroke-width="1.5"/>'
    )
    return svg, h


def text(x, y, s, *, size, color=FG, weight=400, family="Overpass", anchor="start", spacing=0.0):
    attrs = (f'x="{x:.1f}" y="{y:.1f}" font-family="{family}" font-size="{size}" font-weight="{weight}" '
             f'fill="{color}" text-anchor="{anchor}"')
    if spacing:
        attrs += f' letter-spacing="{spacing}"'
    # A thin space after the middle dot: Overpass draws "·" left of its advance (as annotate.py does).
    s = escape(s.replace(" · ", " ·  "))
    return f"<text {attrs}>{s}</text>"


def mark(x, y, size):
    return f'<g transform="translate({x:.1f} {y:.1f}) scale({size / 32:.4f})">{MARK}</g>'


def stripe(y=STRIPE_Y, h=50.0):
    """The road stripe of the title card and slide 1: asphalt band with the amber centre line."""
    dashes = "".join(f'<rect x="{43.2 + i * 149.76:.1f}" y="{y + h / 2 - 5:.1f}" width="89.3" height="10" rx="5"/>'
                     for i in range(13))
    return f'<rect x="0" y="{y:.1f}" width="{W}" height="{h:.1f}" fill="{ASPHALT}"/><g fill="{AMBER}">{dashes}</g>'


def note(length: str | None) -> str:
    return MOCK + (f" · {length}" if length else "")


def variant_a(length: str | None) -> str:
    """Road result across the width; name left and what the video is right, under it; road stripe."""
    shot, h = framed(ROAD, ROAD_WIDE, M, M, W - 2 * M)
    row = (M + h + STRIPE_Y) / 2 - 56  # the 112 px name row, centred between the shot and the stripe
    return "".join([
        shot,
        mark(M, row, 112),
        text(M + 140, row + 96, "Qarau", size=118, weight=700, spacing=-1),
        text(W - M, row + 44, TITLE, size=52, weight=700, anchor="end"),
        text(W - M, row + 108, note(length), size=40, weight=700, color=ACCENT_INK, anchor="end"),
        stripe(),
    ])


def variant_b(length: str | None) -> str:
    """Name row on top; road result and sign verdict side by side at the same height; road stripe.

    No label under the two shots: a word such as "Road result" would not appear in the recording."""
    gap = 40
    rw, rh = ROAD_WIDE[2] - ROAD_WIDE[0], ROAD_WIDE[3] - ROAD_WIDE[1]
    sw, sh = SIGN_VERDICT[2] - SIGN_VERDICT[0], SIGN_VERDICT[3] - SIGN_VERDICT[1]
    hh = (W - 2 * M - gap) / (rw / rh + sw / sh)  # common height
    top = (180 + STRIPE_Y - hh) / 2  # centred between the name row and the stripe
    road, _ = framed(ROAD, ROAD_WIDE, M, top, hh * rw / rh)
    sign, _ = framed(SIGN, SIGN_VERDICT, W - M - hh * sw / sh, top, hh * sw / sh)
    return "".join([
        mark(M, M, 104),
        text(M + 130, M + 88, "Qarau", size=110, weight=700, spacing=-1),
        text(W - M, M + 40, TITLE, size=48, weight=700, anchor="end"),
        text(W - M, M + 98, note(length), size=38, weight=700, color=ACCENT_INK, anchor="end"),
        road, sign,
        stripe(),
    ])


def variant_c(length: str | None) -> str:
    """Name and title in a left column, the tighter road crop on the right; road stripe."""
    x = M + 560
    w = W - M - x
    h = w * (ROAD_TIGHT[3] - ROAD_TIGHT[1]) / (ROAD_TIGHT[2] - ROAD_TIGHT[0])
    shot, _ = framed(ROAD, ROAD_TIGHT, x, (STRIPE_Y - h) / 2, w)
    return "".join([
        mark(M, 270, 120),
        text(M, 540, "Qarau", size=150, weight=700, spacing=-1),
        text(M, 640, "Backup demo", size=52, weight=700),
        text(M, 704, "Roads and Restrooms", size=52, weight=700),
        text(M, 790, note(length), size=40, weight=700, color=ACCENT_INK),
        shot,
        stripe(),
    ])


VARIANTS = {"a": variant_a, "b": variant_b, "c": variant_c}
CROPS = [(ROAD, ROAD_WIDE), (ROAD, ROAD_TIGHT), (SIGN, SIGN_VERDICT)]

HTML = ("<!doctype html><html><head><meta charset='utf-8'>"
        "<link href='https://fonts.googleapis.com/css2?family=Overpass:wght@400;700&family=JetBrains+Mono:wght@400&display=block' rel='stylesheet'>"
        "<style>html,body{margin:0;padding:0}svg{display:block}</style></head><body>{svg}</body></html>")

CHECK_JS = """() => {
  const over = [];
  for (const el of document.querySelectorAll('svg > text')) {
    const b = el.getBBox();
    if (b.x < 0 || b.x + b.width > 1920) over.push(el.textContent);
  }
  const imgs = [...document.querySelectorAll('image')].map(i => i.getBBox().width > 0);
  const weights = new Set([...document.querySelectorAll('svg > text')].map(t => t.getAttribute('font-weight')));
  return {over, fonts: [...weights].map(w => document.fonts.check(`${w} 40px Overpass`)),
          images: imgs.length > 0 && imgs.every(Boolean)};
}"""


def build(name: str, length: str | None) -> str:
    body = VARIANTS[name](length)
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" role="img" '
            f'aria-label="Qarau, backup demo, poster {name.upper()}">'
            f'<rect width="{W}" height="{H}" fill="{BG}"/>{body}</svg>')


def compare(out: Path, names: list[str]) -> Path:
    """The variants at 320 px wide (a file preview) on top, at 1280 x 720 below, labelled A, B, C."""
    small = [Image.open(out / f"qarau-poster-{n}.png").convert("RGB").resize((320, 180), Image.LANCZOS) for n in names]
    big = [Image.open(out / f"qarau-poster-{n}.png").convert("RGB").resize((1280, 720), Image.LANCZOS) for n in names]
    pad = 40
    sheet = Image.new("RGB", (pad + len(names) * (1280 + pad), pad * 3 + 180 + 720), "#dad7cf")
    for i, (s, b) in enumerate(zip(small, big)):
        x = pad + i * (1280 + pad)
        sheet.paste(s, (x, pad))
        sheet.paste(b, (x, pad * 2 + 180))
    path = out / "compare.png"
    sheet.save(path)
    return path


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--shots", type=Path, required=True, help="folder with raw/ from take_screenshots.py")
    ap.add_argument("--only", choices=list(VARIANTS), help="one variant only")
    ap.add_argument("--length", help="length of qarau-demo.mp4, for example 1:12; leave out until the file exists")
    args = ap.parse_args()

    raw, out = args.shots / "raw", args.shots / "poster"
    problems = [p for shot, crop in CROPS for p in check_crop(shot, crop)]
    for shot in (ROAD, SIGN):
        size = Image.open(raw / shot.file).size
        if size != (RAW_W, RAW_H):
            problems.append(f"{shot.file} is {size}, expected {RAW_W} x {RAW_H} (G-56)")
    if problems:
        raise SystemExit("\n".join(problems))

    out.mkdir(parents=True, exist_ok=True)
    names = [args.only] if args.only else list(VARIANTS)
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": W, "height": H})
        for n in names:
            svg = build(n, args.length)
            (out / f"qarau-poster-{n}.svg").write_text(svg + "\n", encoding="utf-8")
            # The page sits next to the SVG, so ../raw/ resolves the same way for both.
            html = out / f".render-{n}.html"
            html.write_text(HTML.replace("{svg}", svg), encoding="utf-8")
            try:
                page.goto(html.resolve().as_uri(), wait_until="networkidle")
                page.evaluate("document.fonts.ready")
                res = page.evaluate(CHECK_JS)
                if res["over"] or not all(res["fonts"]) or not res["images"]:
                    raise SystemExit(f"poster {n}: text off the frame {res['over']}, fonts {res['fonts']}, "
                                     f"images drawn {res['images']}")
                png = out / f"qarau-poster-{n}.png"
                page.locator("svg").first.screenshot(path=str(png))
            finally:
                html.unlink(missing_ok=True)
            print(png.name, Image.open(png).size)
        browser.close()
    if len(names) > 1:
        print(compare(out, names).name)


if __name__ == "__main__":
    main()
