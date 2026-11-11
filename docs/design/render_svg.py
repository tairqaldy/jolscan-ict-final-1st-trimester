"""Render a 1920x1080 SVG from docs/design to PNG with Overpass and JetBrains Mono (Google Fonts).

Usage: python docs/design/render_svg.py docs/design/architecture-slide.svg out.png 2   (2 = 3840x2160)
Needs: pip install playwright && python -m playwright install --only-shell chromium (outside the repo).
"""
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright
src, out, scale = Path(sys.argv[1]), Path(sys.argv[2]), float(sys.argv[3])
svg = src.read_text()
html = ("<!doctype html><html><head><meta charset='utf-8'>"
        "<link href='https://fonts.googleapis.com/css2?family=Overpass:wght@400;700&family=JetBrains+Mono:wght@400&display=block' rel='stylesheet'>"
        "<style>html,body{margin:0;padding:0}svg{display:block}</style></head><body>" + svg + "</body></html>")
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 1920, "height": 1080}, device_scale_factor=scale)
    pg.set_content(html, wait_until="networkidle")
    pg.evaluate("document.fonts.ready")
    ok = pg.evaluate("[document.fonts.check('700 40px Overpass'), document.fonts.check('26px \"JetBrains Mono\"')]")
    pg.locator("svg").first.screenshot(path=str(out))
    b.close()
print(out.name, "fonts loaded:", ok)
