"""Take the deck screenshots (G-11) with the frame from docs/design/screenshots.md (G-56).

Opens each screen of the shot list in Chromium at 1440 x 900 CSS px with device pixel
ratio 2, in the light and the dark theme, and writes two files per shot:

    <out>/raw/NN-name-<theme>.png      2880 x 1800, the viewport as the app draws it
    <out>/framed/NN-name-<theme>.png   the same image inside the deck frame
                                       (radius, border and shadow from web/app/tokens.css)

The theme is set the way the app sets it: the JSON string "light" or "dark" in
localStorage "qarau:theme" (web/lib/theme-script.ts), plus the matching
prefers-color-scheme. The provider stays the app default, Mock, unless --provider is given
(the Local provider needs the API running, see api/README.md).

    pip install playwright pillow && python -m playwright install chromium
    python docs/design/screenshots/take_screenshots.py --base http://localhost:3000 --out ../deck-screenshots

Screenshots never go into git (G-11): write them outside the repository.
"""

from __future__ import annotations

import argparse
import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import Callable

from PIL import Image, ImageChops, ImageDraw, ImageFilter
from playwright.sync_api import Page, sync_playwright

VIEWPORT = {"width": 1440, "height": 900}
MOBILE = {"width": 375, "height": 812}
DPR = 2

# Frame tokens (web/app/tokens.css). Radius --radius-lg; border --border of the screen's
# theme; shadow --shadow-md with the light --shadow-color, because the slide is light.
RADIUS_PX = 10
BORDER = {"light": (0xDA, 0xD7, 0xCF), "dark": (0x2F, 0x31, 0x35)}
SHADOW_RGB = (30, 20, 10)
# --shadow-md: 0 4px 12px -2px rgb(c / 0.12), 0 2px 4px rgb(c / 0.06)
SHADOW_LAYERS = [(4, 12, -2, 0.12), (2, 4, 0, 0.06)]  # (y offset, blur, spread, alpha) in CSS px

# Chrome that is not part of the product: the Next.js dev indicator and scrollbars.
HIDE_CHROME_CSS = """
nextjs-portal, [data-nextjs-toast], #__next-build-watcher { display: none !important; }
html { scrollbar-width: none !important; }
::-webkit-scrollbar { display: none !important; }
"""


@dataclass
class Shot:
    name: str
    path: str
    prepare: Callable[[Page], None] = field(default=lambda page: None)
    viewport: dict = field(default_factory=lambda: VIEWPORT)


def analyze_sample(page: Page) -> None:
    """Press Analyze photo and wait for the result card with its rules tab."""
    page.get_by_role("button", name="Analyze photo").click()
    page.get_by_role("tab", name="Why this priority").wait_for(timeout=20_000)
    page.wait_for_timeout(1200)


def compare_pair(page: Page) -> None:
    """Press Compare signs and wait for the verdict card."""
    page.get_by_role("button", name="Compare signs").click()
    page.get_by_role("tab", name="Why this verdict").wait_for(timeout=20_000)
    page.wait_for_timeout(1200)


SHOTS = [
    Shot("01-landing", "/"),
    Shot("03-roads-result", "/app/roads/analyze?sample=s01", analyze_sample),
    Shot("03-restroom-compare", "/app/restrooms/compare?a=classic-m&b=line-f", compare_pair),
    Shot("06-roads-rules", "/app/roads/rules"),
    Shot("06-model-roads", "/app/model#roads"),
    Shot("08-model-restrooms", "/app/model#restrooms"),
    Shot("backup-overview", "/app"),
    Shot("backup-analytics", "/app/analytics"),
    Shot("backup-design", "/design"),
    Shot("03-roads-result-mobile", "/app/roads/analyze?sample=s01", analyze_sample, MOBILE),
]


def frame(raw: Path, out: Path, theme: str, scale: int = DPR) -> None:
    """Round the corners, draw a 1 px border inside the edge and drop the shadow."""
    shot = Image.open(raw).convert("RGBA")
    w, h = shot.size
    r = RADIUS_PX * scale
    mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, w - 1, h - 1), radius=r, fill=255)
    ImageDraw.Draw(shot).rounded_rectangle((0, 0, w - 1, h - 1), radius=r, outline=BORDER[theme], width=scale)
    shot.putalpha(ImageChops.multiply(shot.getchannel("A"), mask))

    pad = 24 * scale
    canvas = Image.new("RGBA", (w + 2 * pad, h + 2 * pad), (0, 0, 0, 0))
    for dy, blur, spread, alpha in SHADOW_LAYERS:
        layer = Image.new("L", canvas.size, 0)
        s = spread * scale
        box = (pad - s, pad + dy * scale - s, pad + w - 1 + s, pad + dy * scale + h - 1 + s)
        ImageDraw.Draw(layer).rounded_rectangle(box, radius=r, fill=int(255 * alpha))
        layer = layer.filter(ImageFilter.GaussianBlur(blur * scale / 2))
        tint = Image.new("RGBA", canvas.size, SHADOW_RGB + (0,))
        tint.putalpha(layer)
        canvas = Image.alpha_composite(canvas, tint)
    canvas.alpha_composite(shot, (pad, pad))
    canvas.save(out)


def take(base: str, out: Path, themes: list[str], only: set[str], provider: str | None) -> list[Path]:
    (out / "raw").mkdir(parents=True, exist_ok=True)
    (out / "framed").mkdir(parents=True, exist_ok=True)
    written: list[Path] = []
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        for theme in themes:
            for shot in SHOTS:
                if only and shot.name not in only:
                    continue
                context = browser.new_context(viewport=shot.viewport, device_scale_factor=DPR,
                                              color_scheme=theme, reduced_motion="reduce",
                                              is_mobile=shot.viewport is MOBILE, has_touch=shot.viewport is MOBILE)
                init = f"localStorage.setItem('qarau:theme', {json.dumps(json.dumps(theme))});"
                if provider:
                    settings = {"provider": provider, "keepPhotosLocal": False, "stripGps": True, "language": "en"}
                    init += f"localStorage.setItem('qarau:settings', {json.dumps(json.dumps(settings))});"
                context.add_init_script(init)
                page = context.new_page()
                page.goto(base.rstrip("/") + shot.path, wait_until="networkidle")
                page.add_style_tag(content=HIDE_CHROME_CSS)
                page.evaluate("document.fonts.ready")
                shot.prepare(page)
                page.mouse.move(0, 0)
                raw = out / "raw" / f"{shot.name}-{theme}.png"
                page.screenshot(path=str(raw))
                framed = out / "framed" / raw.name
                frame(raw, framed, theme)
                written += [raw, framed]
                print(f"{theme:5} {shot.name:24} {shot.path}")
                context.close()
        browser.close()
    return written


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.split("\n", 1)[0])
    parser.add_argument("--base", default="http://localhost:3000")
    parser.add_argument("--out", type=Path, required=True, help="folder outside the repository")
    parser.add_argument("--theme", choices=["light", "dark", "both"], default="both")
    parser.add_argument("--only", nargs="*", default=[], help="shot names, e.g. 01-landing")
    parser.add_argument("--provider", choices=["mock", "local", "cloud"], help="default: the app default (mock)")
    args = parser.parse_args()
    themes = ["light", "dark"] if args.theme == "both" else [args.theme]
    files = take(args.base, args.out, themes, set(args.only), args.provider)
    print(f"wrote {len(files)} files to {args.out}")


if __name__ == "__main__":
    main()
