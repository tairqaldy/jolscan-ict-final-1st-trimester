"""For every KPI tile on the overview pages: does the number fit inside the tile's padding box?"""
import json, sys
from playwright.sync_api import sync_playwright
B = "http://localhost:3118"
WIDTHS = [int(w) for w in (sys.argv[1] if len(sys.argv) > 1 else "320,375,768,1024,1280,1440").split(",")]
JS = r"""() => [...document.querySelectorAll('main p.tabular.font-display')].map(n => {
  const tile = n.parentElement; const cs = getComputedStyle(tile);
  const inner = tile.getBoundingClientRect().right - parseFloat(cs.paddingRight) - parseFloat(cs.borderRightWidth);
  // the text's own width, not the block's
  const vis = n.querySelector('[aria-hidden]'); const tr = vis.getBoundingClientRect();
  return {text: vis.lastElementChild.textContent.trim(), font: getComputedStyle(n).fontSize, over: Math.round((tr.right - inner) * 10) / 10};
})"""
bad = 0
with sync_playwright() as p:
    b = p.chromium.launch()
    for w in WIDTHS:
        ctx = b.new_context(viewport={"width": w, "height": 900}, reduced_motion="reduce"); pg = ctx.new_page()
        for path in ["/app", "/app/roads", "/app/restrooms"]:
            pg.goto(B + path, wait_until="networkidle"); pg.wait_for_timeout(400)
            res = pg.evaluate(JS)
            worst = max(res, key=lambda x: x["over"])
            flag = "OVERFLOW" if worst["over"] > 0 else "ok"
            if worst["over"] > 0: bad += 1
            print(f"{w:>5} {path:<15} tiles={len(res)} font={res[0]['font']:<5} worst='{worst['text']}' margin={-worst['over']:.1f}px {flag}")
        ctx.close()
    b.close()
print("pages with an overflowing KPI number:", bad)
