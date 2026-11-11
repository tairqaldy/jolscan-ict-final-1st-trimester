"""Draw the annotated result slides (G-72): one road result and one sign result, four markers each.

Reads the raw deck screenshots of G-11 and writes, per slide and theme:

    <shots>/annotated/NN-name-annotated-<theme>.svg   the overlay; it references ../raw/<shot>.png
    <shots>/annotated/NN-name-annotated-<theme>.png   1920 x 1080, ready to place on a slide

The slide follows the "Large screenshot" layout of the slide template (slide 5 in
docs/design/slide-template/make_slide_template.py): eyebrow, title, the shot in the G-56 frame
8.0 in wide at the left, the legend in the right column, footer. What each marker says and why
is in docs/design/annotations.md; keep the two files in step.

Every target and marker position is in raw screenshot pixels (2880 x 1800), so after a retake
only the numbers in SLIDES change. The script stops with an error when a label line is wider
than the legend column, when a marker, outline or leader touches a Mock or demo badge
(KEEP_CLEAR), when a slide has more than four markers, or when the fonts did not load.

    pip install playwright pillow && python -m playwright install chromium
    python docs/design/screenshots/annotate.py --shots ../deck-screenshots
    python docs/design/screenshots/annotate.py --shots ../deck-screenshots --only road --theme light --scale 2

Screenshots never go into git (G-11): keep --shots outside the repository.
"""

from __future__ import annotations

import argparse
import math
from dataclasses import dataclass
from html import escape
from pathlib import Path

from PIL import Image
from playwright.sync_api import sync_playwright

# Slide geometry: 13.333 x 7.5 in at 144 px per inch. Positions from make_slide_template.py, slide 5.
W, H, PPI = 1920, 1080, 144
MARGIN = 0.7 * PPI
FRAME = (MARGIN, 1.75 * PPI, 8.0 * PPI)  # left, top, width; height follows 16:10
RAW_W, RAW_H = 2880, 1800  # G-56: 1440 x 900 CSS px at device pixel ratio 2
LEGEND_L = (0.7 + 8.0 + 0.45) * PPI
LEGEND_R = W - MARGIN
MAX_MARKERS = 4

# Type: Overpass for text, JetBrains Mono for the footer (template). 18 pt on this slide is 36 px.
LABEL_PX = 36
LINE_PX = 44
TITLE_PX = 64  # 32 pt, the template's title size on slide 5
EYEBROW_PX = 24  # 12 pt caps, template chrome
FOOTER_PX = 20  # 10 pt, template chrome
CIRCLE_R = 28
FOOTER = "Qarau · ICT1103 · QAIRU"

# Tokens from web/app/tokens.css. Markers: --accent fill with --accent-fg text (DESIGN-BRIEF, slide template).
THEMES = {
    "light": dict(bg="#f3f2ee", fg="#1b1c1e", muted="#4f5156", subtle="#66686d", accent="#b87f00",
                  accent_fg="#1b1c1e", accent_ink="#855700", border="#dad7cf", halo="#ffffff",
                  shadow="30,20,10"),
    "dark": dict(bg="#121314", fg="#ecebe7", muted="#b1b2ae", subtle="#8f908c", accent="#ffb81c",
                 accent_fg="#121314", accent_ink="#ffc547", border="#2f3135", halo="#121314",
                 shadow="0,0,0"),
}

# The mark from web/app/icon.svg (32 x 32), for the footer.
MARK = ('<rect x="1" y="1" width="30" height="30" rx="7" fill="#f2a900"/>'
        '<path d="M8 13.5V8h5.5M18.5 8H24v5.5M24 18.5V24h-5.5M13.5 24H8v-5.5" fill="none" stroke="#1b1c1e" '
        'stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>'
        '<ellipse cx="16" cy="16.5" rx="3.6" ry="2.4" fill="#1b1c1e"/>')

Box = tuple[float, float, float, float]  # x0, y0, x1, y1 in raw pixels


@dataclass
class Marker:
    target: Box  # outlined area on the shot
    circle: tuple[float, float]  # centre of the numbered circle on the shot
    label: list[str]  # bold lines, every value on them must be visible on the screen
    note: list[str]  # muted lines: what the item is in the story


@dataclass
class Slide:
    name: str
    shot: str
    eyebrow: str
    title: str
    markers: list[Marker]
    footnote: list[str]


# Badges in every Mock shot: sidebar "Mock" and "Includes demo data" (same place on both screens).
SIDEBAR_BADGES: list[Box] = [(36, 1568, 178, 1618), (36, 1627, 332, 1676)]

SLIDES = [
    Slide(
        name="03-roads-result-annotated",
        shot="03-roads-result",
        eyebrow="Live demo backup · Mock result",
        title="Road result: from boxes to a repair action",
        markers=[
            Marker((1020, 492, 1783, 816), (873, 357), ["Boxes with confidence"], ["The evidence"]),
            Marker((1958, 209, 2771, 360), (2073, 80), ["Critical, score 15"], ["The decision"]),
            Marker((628, 1552, 2748, 1628), (2273, 1590), ["R2 Size points, +7"], ["Adds the most points"]),
            Marker((1958, 408, 2448, 598), (2623, 503), ["Repair urgently, 24 h"], ["The action"]),
        ],
        footnote=["Mock result:", "placeholder values"],
    ),
    Slide(
        name="03-restroom-compare-annotated",
        shot="03-restroom-compare",
        eyebrow="Live demo backup · Mock result",
        title="Sign result: from two door signs to a verdict",
        markers=[
            Marker((596, 66, 1790, 677), (1191, 338), ["Reads as Male, Female"], ["The two door signs"]),
            Marker((596, 960, 1790, 1110), (1962, 1035), ["Gap 0.84, above S1"], ["How clearly they differ"]),
            Marker((596, 1330, 1790, 1482), (1962, 1406), ["Similarity 0.81,", "below S3"], ["How alike the designs are"]),
            Marker((1881, 69, 2745, 429), (2647, 160), ["Review: check on site"], ["The verdict and action"]),
        ],
        footnote=["Mock result:", "placeholder values"],
    ),
]

# Areas no marker, outline or leader may touch: the provenance badges (U8, G-72 "Watch out").
KEEP_CLEAR: dict[str, list[Box]] = {
    "03-roads-result": SIDEBAR_BADGES + [(1966, 666, 2178, 716)],  # "Mock result" in the result card
    "03-restroom-compare": SIDEBAR_BADGES + [(1892, 490, 2102, 540)],  # "Mock result" in the verdict card
}


def to_slide(x: float, y: float) -> tuple[float, float]:
    left, top, width = FRAME
    s = width / RAW_W
    return left + x * s, top + y * s


def scale() -> float:
    return FRAME[2] / RAW_W


def leader(m: Marker) -> tuple[float, float, float, float] | None:
    """Line from the circle's edge to the nearest point of the outline, in raw pixels; None if the circle is on it."""
    cx, cy = m.circle
    x0, y0, x1, y1 = m.target
    nx, ny = min(max(cx, x0), x1), min(max(cy, y0), y1)
    d = math.hypot(nx - cx, ny - cy)
    r = CIRCLE_R / scale()
    if d <= r:
        return None
    return cx + (nx - cx) * r / d, cy + (ny - cy) * r / d, nx, ny


def overlaps(a: Box, b: Box) -> bool:
    return a[0] < b[2] and b[0] < a[2] and a[1] < b[3] and b[1] < a[3]


def check_clear(slide: Slide) -> list[str]:
    problems = []
    r = CIRCLE_R / scale() + 4 / scale()  # circle plus its halo
    for i, m in enumerate(slide.markers, 1):
        cx, cy = m.circle
        shapes = {"outline": m.target, "circle": (cx - r, cy - r, cx + r, cy + r)}
        ln = leader(m)
        if ln:
            shapes["leader"] = (min(ln[0], ln[2]), min(ln[1], ln[3]), max(ln[0], ln[2]) + 1, max(ln[1], ln[3]) + 1)
        for kind, box in shapes.items():
            for keep in KEEP_CLEAR[slide.shot]:
                if overlaps(box, keep):
                    problems.append(f"{slide.name}: marker {i} {kind} touches the badge at {keep}")
    return problems


def text(x, y, lines, *, size, color, weight=400, family="Overpass", spacing=0.0, maxw=None, line=None):
    """One <text> per line, so the widths can be checked in the browser."""
    out = []
    for k, s in enumerate(lines):
        attrs = f'x="{x:.1f}" y="{y + k * (line or size * 1.2):.1f}" font-family="{family}" font-size="{size}" ' \
                f'font-weight="{weight}" fill="{color}"'
        if spacing:
            attrs += f' letter-spacing="{spacing}"'
        if maxw:
            attrs += f' data-maxw="{maxw:.1f}"'
        out.append(f"<text {attrs}>{escape(s)}</text>")
    return "\n".join(out)


def circle(cx, cy, n, t):
    return (f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{CIRCLE_R}" fill="{t["accent"]}" stroke="{t["halo"]}" stroke-width="3"/>'
            f'<text x="{cx:.1f}" y="{cy + 12.5:.1f}" text-anchor="middle" font-family="Overpass" font-size="{LABEL_PX}" '
            f'font-weight="700" fill="{t["accent_fg"]}">{n}</text>')


def build_svg(slide: Slide, theme: str) -> str:
    t = THEMES[theme]
    left, top, width = FRAME
    height = width * RAW_H / RAW_W
    s = scale()
    radius = 10 * width / 1440  # --radius-lg at the shot's size on the slide
    k = width / 1440  # CSS px of the shot to slide px, for the shadow
    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" '
        f'width="{W}" height="{H}" viewBox="0 0 {W} {H}">',
        "<defs>",
        f'<clipPath id="shot"><rect x="{left}" y="{top}" width="{width}" height="{height}" rx="{radius:.1f}"/></clipPath>',
        # --shadow-md: 0 4px 12px -2px at 0.12 and 0 2px 4px at 0.06 (SVG has no spread, so -2px is dropped).
        '<filter id="shadow-md" x="-5%" y="-5%" width="110%" height="115%">'
        f'<feDropShadow dx="0" dy="{4 * k:.2f}" stdDeviation="{6 * k:.2f}" flood-color="rgb({t["shadow"]})" flood-opacity="0.12"/>'
        f'<feDropShadow dx="0" dy="{2 * k:.2f}" stdDeviation="{2 * k:.2f}" flood-color="rgb({t["shadow"]})" flood-opacity="0.06"/>'
        "</filter>",
        "</defs>",
        f'<rect width="{W}" height="{H}" fill="{t["bg"]}"/>',
        # Eyebrow and title as on the template's slide 5.
        # A thin space after the dot: Overpass draws "·" left of its advance, so the gap after it looks short.
        text(MARGIN, 0.55 * PPI + EYEBROW_PX, [slide.eyebrow.upper().replace(" · ", " ·\u2009 ")], size=EYEBROW_PX, color=t["accent_ink"],
             weight=700, spacing=4),
        text(MARGIN, 0.85 * PPI + TITLE_PX, [slide.title], size=TITLE_PX, color=t["fg"], weight=700,
             maxw=W - 2 * MARGIN),
        # The shot in the G-56 frame: radius, 1 px border, shadow.
        f'<rect x="{left}" y="{top}" width="{width}" height="{height}" rx="{radius:.1f}" fill="{t["bg"]}" filter="url(#shadow-md)"/>',
        f'<image href="../raw/{slide.shot}-{theme}.png" x="{left}" y="{top}" width="{width}" height="{height}" '
        f'preserveAspectRatio="none" clip-path="url(#shot)"/>',
        f'<rect x="{left}" y="{top}" width="{width}" height="{height}" rx="{radius:.1f}" fill="none" '
        f'stroke="{t["border"]}" stroke-width="1"/>',
    ]
    # Outlines and leaders first, circles on top.
    for m in slide.markers:
        x0, y0 = to_slide(m.target[0], m.target[1])
        x1, y1 = to_slide(m.target[2], m.target[3])
        parts.append(f'<rect x="{x0:.1f}" y="{y0:.1f}" width="{x1 - x0:.1f}" height="{y1 - y0:.1f}" rx="6" '
                     f'fill="none" stroke="{t["accent"]}" stroke-width="3"/>')
        ln = leader(m)
        if ln:
            ax, ay = to_slide(ln[0], ln[1])
            bx, by = to_slide(ln[2], ln[3])
            parts.append(f'<line x1="{ax:.1f}" y1="{ay:.1f}" x2="{bx:.1f}" y2="{by:.1f}" stroke="{t["accent"]}" '
                         f'stroke-width="2.5" stroke-linecap="round"/>')
    for n, m in enumerate(slide.markers, 1):
        parts.append(circle(*to_slide(*m.circle), n, t))
    # Legend: number, bold label, muted note, all at 18 pt or more.
    y = top
    text_l = LEGEND_L + 2 * CIRCLE_R + 18
    for n, m in enumerate(slide.markers, 1):
        cy = y + CIRCLE_R
        parts.append(circle(LEGEND_L + CIRCLE_R, cy, n, t))
        base = cy + 12.5
        parts.append(text(text_l, base, m.label, size=LABEL_PX, color=t["fg"], weight=700, line=LINE_PX,
                          maxw=LEGEND_R - text_l))
        base += len(m.label) * LINE_PX
        parts.append(text(text_l, base, m.note, size=LABEL_PX, color=t["muted"], line=LINE_PX,
                          maxw=LEGEND_R - text_l))
        y = base + (len(m.note) - 1) * LINE_PX + 52
    foot_y = top + height - (len(slide.footnote) - 1) * LINE_PX - 10
    parts.append(text(LEGEND_L, foot_y, slide.footnote, size=LABEL_PX, color=t["muted"], line=LINE_PX,
                      maxw=LEGEND_R - LEGEND_L))
    if y - LINE_PX > foot_y - LABEL_PX:
        raise SystemExit(f"{slide.name}: the legend runs into the footnote; shorten a label")
    # Footer as on the template: text left, mark right.
    parts.append(text(MARGIN, H - 0.5 * PPI + FOOTER_PX, [FOOTER], size=FOOTER_PX, color=t["subtle"],
                      family="JetBrains Mono"))
    mark = 0.28 * PPI
    parts.append(f'<g transform="translate({W - MARGIN - mark:.1f},{H - 0.56 * PPI:.1f}) scale({mark / 32:.4f})">{MARK}</g>')
    parts.append("</svg>")
    return "\n".join(parts)


HTML = ("<!doctype html><html><head><meta charset='utf-8'>"
        "<link href='https://fonts.googleapis.com/css2?family=Overpass:wght@400;700&family=JetBrains+Mono:wght@400&display=block' rel='stylesheet'>"
        "<style>html,body{margin:0;padding:0}svg{display:block}</style></head><body>{svg}</body></html>")

CHECK_JS = """() => {
  const bad = [];
  for (const el of document.querySelectorAll('text[data-maxw]')) {
    const w = el.getComputedTextLength(), max = parseFloat(el.dataset.maxw);
    if (w > max) bad.push(`${el.textContent}: ${w.toFixed(0)} px > ${max.toFixed(0)} px`);
  }
  const img = document.querySelector('image');
  return {bad, fonts: [document.fonts.check('700 36px Overpass'), document.fonts.check('20px "JetBrains Mono"')],
          image: img.getBBox().width > 0};
}"""


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--shots", type=Path, required=True, help="folder with raw/ from take_screenshots.py")
    ap.add_argument("--only", choices=["road", "sign"], help="one slide only")
    ap.add_argument("--theme", choices=["light", "dark"], help="one theme only")
    ap.add_argument("--scale", type=float, default=1, help="2 writes 3840 x 2160")
    args = ap.parse_args()

    raw, out = args.shots / "raw", args.shots / "annotated"
    out.mkdir(parents=True, exist_ok=True)
    slides = [s for s in SLIDES if not args.only or s.shot.startswith({"road": "03-roads", "sign": "03-restroom"}[args.only])]
    themes = [args.theme] if args.theme else ["light", "dark"]

    problems = []
    for s in slides:
        if len(s.markers) > MAX_MARKERS:
            problems.append(f"{s.name}: {len(s.markers)} markers, at most {MAX_MARKERS}")
        problems += check_clear(s)
        for th in themes:
            size = Image.open(raw / f"{s.shot}-{th}.png").size
            if size != (RAW_W, RAW_H):
                problems.append(f"{s.shot}-{th}.png is {size}, expected {RAW_W} x {RAW_H} (G-56)")
    if problems:
        raise SystemExit("\n".join(problems))

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": W, "height": H}, device_scale_factor=args.scale)
        for s in slides:
            for th in themes:
                svg = build_svg(s, th)
                svg_path = out / f"{s.name}-{th}.svg"
                svg_path.write_text(svg + "\n", encoding="utf-8")
                # The page sits next to the SVG, so ../raw/ resolves the same way for both.
                html_path = out / f".render-{s.name}-{th}.html"
                html_path.write_text(HTML.replace("{svg}", svg), encoding="utf-8")
                try:
                    page.goto(html_path.resolve().as_uri(), wait_until="networkidle")
                    page.evaluate("document.fonts.ready")
                    res = page.evaluate(CHECK_JS)
                    if res["bad"] or not all(res["fonts"]) or not res["image"]:
                        raise SystemExit(f"{svg_path.name}: lines too wide {res['bad']}, fonts {res['fonts']}, "
                                         f"image drawn {res['image']}")
                    png = out / f"{s.name}-{th}.png"
                    page.locator("svg").first.screenshot(path=str(png))
                finally:
                    html_path.unlink(missing_ok=True)
                print(png.name, Image.open(png).size)
        browser.close()


if __name__ == "__main__":
    main()
