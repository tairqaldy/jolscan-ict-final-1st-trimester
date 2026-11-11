"""Click through the whole app on the Local provider and check every result (defense morning check).

Run it after `scripts/demo-local.sh` is up (API on :8000, production web app on --base):

    uv venv /tmp/qarau-check && uv pip install --python /tmp/qarau-check/bin/python playwright opencv-python-headless
    /tmp/qarau-check/bin/python scripts/demo_check.py --base http://localhost:3000 --photo ~/Desktop/road.jpg

It drives the Chrome that is installed on the laptop (no browser download), headless unless --headed.
Each step prints OK or FAIL; the exit code is 1 if anything failed, if the page logged an error or if a
request failed. --video FILE.mp4 also records the click-through with captions (needs opencv), which can
stand in for the backup video. Nothing is written to the repository.
"""
from __future__ import annotations

import argparse
import asyncio
import base64
import json
import sys
import time
from pathlib import Path

from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parent.parent
CHAMPION = json.loads((ROOT / "web/data/experiments.json").read_text())["championModelName"]
SAMPLES = {s["id"]: s for s in json.loads((ROOT / "web/public/samples/restrooms/samples.json").read_text())["samples"]}
PAIR = ("ioai-v9", "ioai-v15")  # two doors of one IOAI restroom: expected "Pair"; v15 is v9's partner in Match
W, H = 1280, 800

OVERLAY = r"""
(() => {
  if (window.__qarauOverlay) return; window.__qarauOverlay = true;
  const add = () => {
    const c = document.createElement('div');
    c.style.cssText = 'position:fixed;left:-40px;top:-40px;width:22px;height:22px;border-radius:50%;' +
      'background:rgba(255,184,28,.55);border:2px solid #1b1c1e;z-index:2147483647;pointer-events:none;' +
      'transform:translate(-50%,-50%)';
    const cap = document.createElement('div'); cap.id = '__cap';
    cap.style.cssText = 'position:fixed;left:50%;bottom:18px;transform:translateX(-50%);max-width:80%;' +
      'background:rgba(20,21,23,.88);color:#fff;font:600 17px/1.35 system-ui,sans-serif;padding:9px 16px;' +
      'border-radius:8px;z-index:2147483646;pointer-events:none;display:none;text-align:center';
    document.body.append(c, cap);
    addEventListener('mousemove', e => { c.style.left = e.clientX + 'px'; c.style.top = e.clientY + 'px'; }, true);
  };
  if (document.body) add(); else addEventListener('DOMContentLoaded', add);
})();
"""


async def run(args) -> int:
    results: list[tuple[str, bool, str]] = []
    errors: list[str] = []
    frames: list[tuple[float, bytes]] = []

    async with async_playwright() as p:
        browser = await p.chromium.launch(channel="chrome", headless=not args.headed)
        ctx = await browser.new_context(viewport={"width": W, "height": H}, color_scheme=args.theme)
        await ctx.add_init_script(OVERLAY)
        page = await ctx.new_page()
        page.set_default_timeout(30000)
        page.on("console", lambda m: m.type == "error" and errors.append(f"console error: {m.text[:200]} ({page.url})"))
        page.on("pageerror", lambda e: errors.append(f"page error: {str(e)[:200]} ({page.url})"))
        page.on("response", lambda r: r.status >= 400 and "favicon" not in r.url
                and errors.append(f"HTTP {r.status} {r.url}"))
        # A request the browser cancels because the page moved on (ERR_ABORTED, e.g. a prefetch) is not a failure.
        page.on("requestfailed", lambda r: "ERR_ABORTED" not in (r.failure or "")
                and errors.append(f"request failed: {r.url} ({r.failure})"))

        cdp = None
        if args.video:
            cdp = await ctx.new_cdp_session(page)

            def on_frame(ev):
                frames.append((time.monotonic(), base64.b64decode(ev["data"])))
                asyncio.ensure_future(cdp.send("Page.screencastFrameAck", {"sessionId": ev["sessionId"]}))

            cdp.on("Page.screencastFrame", on_frame)
            await cdp.send("Page.startScreencast", {"format": "jpeg", "quality": 85, "maxWidth": W, "maxHeight": H})

        async def caption(text: str, secs: float = 0.0) -> None:
            await page.evaluate("t => { const c = document.getElementById('__cap'); if (c) { c.textContent = t; "
                                "c.style.display = t ? 'block' : 'none'; } }", text)
            if secs and args.video:
                await page.wait_for_timeout(int(secs * 1000))

        async def go(path: str) -> None:
            await page.goto(args.base + path, wait_until="networkidle")
            await page.wait_for_timeout(300)

        async def click(loc) -> None:
            await loc.scroll_into_view_if_needed()
            box = await loc.bounding_box()
            if box:
                await page.mouse.move(box["x"] + box["width"] / 2, box["y"] + box["height"] / 2, steps=12)
            await loc.click()

        async def text_after(label: str, n: int = 120) -> str:
            t = await page.evaluate("() => document.body.innerText")
            i = t.find(label)
            if i < 0:
                i = t.lower().find(label.lower())
            return "" if i < 0 else " ".join(t[i:i + n].split())

        async def check(name: str, fn) -> None:
            n0 = len(errors)
            try:
                detail = await fn() or ""
                bad = errors[n0:]
                results.append((name, not bad, detail if not bad else "; ".join(bad)[:300]))
            except Exception as e:  # report and go on, so one failure does not hide the rest
                results.append((name, False, str(e).splitlines()[0][:300]))

        async def settings():
            await go("/app/settings")
            await caption("Settings: Local provider, our models on this laptop", 1)
            await click(page.get_by_text("Local", exact=True).first)
            await click(page.get_by_role("button", name="Check connection").nth(1))
            await page.get_by_text("Connected").first.wait_for()
            got = await text_after("Connected", 60)
            assert CHAMPION in got, f"connection does not name the champion {CHAMPION}: {got!r}"
            await caption(f"Connected: {CHAMPION} answers", 2)
            return got

        async def analyze():
            await go("/app/roads/analyze")
            await caption("Roads: analyze a real road photo", 1)
            await page.locator("input[type=file]").first.set_input_files(args.photo)
            await page.wait_for_timeout(800)
            await click(page.get_by_role("button", name="Analyze photo"))
            await page.get_by_text("Model result").first.wait_for()
            await page.wait_for_timeout(800)
            card = await text_after("Repair priority", 160)
            source = await text_after("Model result", 80)
            assert "Local" in source and CHAMPION in source, f"result not from Local/{CHAMPION}: {source!r}"
            await caption("Real YOLO result: boxes, severity, score and the rules that fired", 3)
            for tab in ("Detections", "Raw JSON", "Why this priority"):
                await click(page.get_by_role("tab", name=tab).first)
                await page.wait_for_timeout(700 if args.video else 100)
            await click(page.get_by_role("link", name="Open as report"))
            await page.get_by_role("heading").first.wait_for()
            await caption("Saved as a report", 1.5)
            return card

        async def compare(expected: str, preset: str | None):
            if preset is None:
                await go(f"/app/restrooms/compare?a={PAIR[0]}&b={PAIR[1]}")
            else:
                await click(page.get_by_text(preset).first)
            await caption(f"Restrooms: compare two real IOAI signs (expect {expected})", 1)
            await click(page.get_by_role("button", name="Compare signs"))
            await page.get_by_text(expected, exact=True).first.wait_for()
            await page.wait_for_timeout(500)
            got = await text_after("Verdict", 90)
            source = await text_after("Model result", 60)
            assert "Local" in source, f"compare not from Local: {source!r}"
            await caption(f"Real CLIP result: {expected}", 2.5)
            return got

        async def match():
            await go(f"/app/restrooms/match?q={PAIR[0]}")
            await caption("Match: one sign in, the pipeline finds the other door", 1)
            await click(page.get_by_role("button", name="Find the counterpart"))
            await page.wait_for_function("() => /#1\\b/.test(document.body.innerText) && "
                                         "!document.body.innerText.includes('The best pair appears here')")
            await page.wait_for_timeout(500)
            first = await text_after("#1", 80)
            partner = SAMPLES[PAIR[1]]["title"]
            assert partner in first, f"rank 1 is not the partner {partner!r}: {first!r}"
            await caption(f"Rank 1 is the true partner: {partner}", 2.5)
            return first

        async def pages():
            visited = []
            for path in ("/", "/app", "/app/roads", "/app/roads/reports", "/app/roads/map", "/app/roads/rules",
                         "/app/restrooms", "/app/restrooms/ioai", "/app/restrooms/rules", "/app/analytics",
                         "/app/model", "/about"):
                await go(path)
                await page.locator("h1").first.wait_for()
                await caption(f"{path}", 1.2)
                if args.video:
                    await page.mouse.wheel(0, 600)
                    await page.wait_for_timeout(900)
                visited.append(path)
            return f"{len(visited)} pages"

        await check("Settings: Local, Check connection", settings)
        await check("Roads: analyze the photo on Local", analyze)
        await check("Restrooms: Compare, real pair", lambda: compare("Pair", None))
        await check("Restrooms: Compare, two restrooms", lambda: compare("Not a pair", "Real signs from two restrooms"))
        await check("Restrooms: Match finds the partner", match)
        await check("Every other page loads", pages)

        if cdp:
            await cdp.send("Page.stopScreencast")
        await browser.close()

    if args.video and frames:
        import cv2
        import numpy as np
        imgs = [(t, cv2.imdecode(np.frombuffer(b, np.uint8), cv2.IMREAD_COLOR)) for t, b in frames]
        imgs = [(t, im) for t, im in imgs if im is not None]
        h, w = imgs[0][1].shape[:2]
        vw = cv2.VideoWriter(args.video, cv2.VideoWriter_fourcc(*"avc1"), 12, (w, h))
        i, t, end = 0, imgs[0][0], imgs[-1][0] + 1.0
        while t < end:
            while i + 1 < len(imgs) and imgs[i + 1][0] <= t:
                i += 1
            vw.write(imgs[i][1] if imgs[i][1].shape[:2] == (h, w) else cv2.resize(imgs[i][1], (w, h)))
            t += 1 / 12
        vw.release()
        print(f"video: {args.video} ({end - imgs[0][0]:.0f} s)")

    for name, ok, detail in results:
        print(f"{'OK  ' if ok else 'FAIL'}  {name}" + (f"  ->  {detail}" if detail else ""))
    for e in errors:
        print(f"      {e}")
    failed = [r for r in results if not r[1]]
    print(f"{len(results) - len(failed)}/{len(results)} checks passed; {len(errors)} page errors or failed requests")
    return 1 if failed or errors else 0


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n", 1)[0])
    ap.add_argument("--base", default="http://localhost:3000", help="web app address (demo-local.sh WEB_PORT)")
    ap.add_argument("--photo", default=str(ROOT / "data/raw/potholes_yolo_v1/images/test/img-18.jpg"),
                    help="road photo to analyze (default: test-split img-18.jpg, git-ignored, local only)")
    ap.add_argument("--video", help="also record the click-through to this .mp4 file (needs opencv)")
    ap.add_argument("--headed", action="store_true", help="show the browser window")
    ap.add_argument("--theme", choices=("light", "dark"), default="light")
    args = ap.parse_args()
    if not Path(args.photo).exists():
        print(f"photo not found: {args.photo}")
        return 2
    return asyncio.run(run(args))


if __name__ == "__main__":
    sys.exit(main())
