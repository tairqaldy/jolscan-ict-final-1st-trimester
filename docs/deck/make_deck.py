"""Build the Qarau defense deck (tasks R-3, R-15) from the committed result files.

Every number on a slide is read here, at build time, from a committed file (CSV, JSON, or a
measured table in a doc) and registered with its file and field. Nothing is typed by hand.
The look (colours, fonts, footer, mark, road band) comes from Dameli's template generator,
docs/design/slide-template/make_slide_template.py (G-10), which is imported, not copied.

    .venv/bin/python docs/deck/make_deck.py
    .venv/bin/python docs/deck/make_deck.py --preview /tmp/deck-preview   # one .pptx per slide

Writes
    docs/deck/qarau-defense-deck.pptx   12 slides plus backups; script and Sources in the notes
    docs/deck/SLIDES.md                 the same content as text (generated: edit this script)
    docs/research/deck-sources.md       the generated "Numbers on slides" block (R-15); text
                                        outside the generated markers is kept

Slide 9 screenshots (G-11) are not in the repository. Put them in docs/deck/screenshots/
(git-ignored) or pass --screenshots DIR; without them the slide shows marked placeholders.

If a number has no committed file yet, the slide shows a marked gap ("NUMBER NEEDED") and the
build lists it. If a shown number does not match its file, the build stops.
"""

from __future__ import annotations

import argparse
import csv
import importlib.util
import io
import json
import re
from dataclasses import dataclass, field
from decimal import ROUND_HALF_UP, Decimal
from fractions import Fraction
from pathlib import Path

from lxml import etree
from PIL import Image
from pptx.enum.shapes import MSO_CONNECTOR, MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.oxml.ns import qn
from pptx.util import Inches, Pt

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "docs/deck/qarau-defense-deck.pptx"
SLIDES_MD = ROOT / "docs/deck/SLIDES.md"
SOURCES_MD = ROOT / "docs/research/deck-sources.md"
WPM = 130  # speaking rate used for every time estimate (docs/PRESENTATION.md, R-20 step 3)


def _load(name: str, rel: str):
    spec = importlib.util.spec_from_file_location(name, ROOT / rel)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


T = _load("slide_template", "docs/design/slide-template/make_slide_template.py")  # look and helpers
EXPORT = _load("pothole_export", "ml/export_results.py")  # the selection rule itself (pick_champion)
W, H, MARGIN, TEXT, MONO = T.W, T.H, T.MARGIN, T.TEXT, T.MONO
CONTENT_W = W - 2 * MARGIN


# --------------------------------------------------------------------------------------------
# Reading files
# --------------------------------------------------------------------------------------------

def read(rel: str) -> str:
    return (ROOT / rel).read_text(encoding="utf-8")


def read_json(rel: str):
    return json.loads(read(rel))


def read_csv(rel: str) -> dict[str, dict]:
    with open(ROOT / rel, newline="", encoding="utf-8") as f:
        return {row["run"]: row for row in csv.DictReader(f)}


def grab(pattern: str, rel: str, flags=re.S) -> re.Match:
    m = re.search(pattern, read(rel), flags)
    if not m:
        raise SystemExit(f"{rel}: pattern not found: {pattern}")
    return m


def d(value, places: int = 3) -> str:
    """Round half-up from the file's own digits. Never adds precision: 0.9 -> 0.900 is the same value."""
    return str(Decimal(str(value)).quantize(Decimal(1).scaleb(-places), rounding=ROUND_HALF_UP))


def thousands(n: int) -> str:
    return f"{n:,}"


# --------------------------------------------------------------------------------------------
# Number registry: every number on a slide goes through here (R-15)
# --------------------------------------------------------------------------------------------

@dataclass
class Num:
    slide: str
    shown: str
    file: str
    field: str
    value: str
    match: str


@dataclass
class Registry:
    rows: list[Num] = field(default_factory=list)
    gaps: list[tuple[str, str]] = field(default_factory=list)
    slide: str = ""

    def __call__(self, shown: str, file: str, fld: str, value) -> str:
        self.rows.append(Num(self.slide, shown, file, fld, str(value), self._match(shown, value)))
        return shown

    def gap(self, what: str) -> str:
        self.gaps.append((self.slide, what))
        return f"[NUMBER NEEDED: {what}]"

    @staticmethod
    def _match(shown: str, value) -> str:
        """yes if the shown number equals the file value at the shown precision."""
        s, v = shown.replace(",", "").replace("%", "").strip(), str(value).replace(",", "").strip()
        if "/" in s or "/" in v:
            ok = Fraction(s.replace(" ", "")) == Fraction(v.replace(" ", "")) and s.replace(" ", "") == v.replace(" ", "")
        else:
            places = len(s.split(".")[1]) if "." in s else 0
            digits = v.split(".")[1] if "." in v else ""
            if len(digits) == places + 1 and digits.endswith("5"):
                # 0.8155 -> 0.816 or 0.815? The file already rounded once, so the true value could be either.
                raise SystemExit(f"Ambiguous rounding of {v} to {places} decimals (shown {shown!r}): show the file's digits")
            ok = Decimal(d(v, places)) == Decimal(s)
        if not ok:
            raise SystemExit(f"Number on slide does not match its file: shown {shown!r}, file value {value!r}")
        return "yes"


R = Registry()


# --------------------------------------------------------------------------------------------
# All inputs, read once
# --------------------------------------------------------------------------------------------

POT = read_csv("ml/results/experiments.csv")
OP = read_json("ml/results/operating_point.json")
KM = read_json("ml/results/pothole_area_clusters.json")
MANIFEST = read_json("data/exports/potholes_yolo_v1/split_manifest.json")
E0 = read_json("ml/results/runs/E0.json")
WEB_POT = read_json("web/data/experiments.json")
REST = read_csv("ml/results/restroom/experiments.csv")
REST_RUN = {r: read_json(f"ml/results/restroom/runs/{r}.json") for r in ("R0", "R1", "R2", "R3", "R4")}
PIPE = read_json("ml/results/restroom/pipeline.json")
PROBE = read_json("ml/results/restroom/layer_probe.json")
WEB_REST = read_json("web/data/restroom-experiments.json")

BRAND_TS = grab(r"export const BRAND = \{(.*?)\} as const;", "web/lib/brand.ts").group(1)
BRAND = {k: re.search(rf'\b{k}:\s*"([^"]+)"', BRAND_TS).group(1) for k in ("name", "nativeName", "meaning", "tagline")}
TEAM = re.findall(r'\{ name: "([^"]+)", role: "([^"]+)"', read("web/lib/team.ts"))
COURSE = grab(r'COURSE = \{ code: "([^"]+)", school: "([^"]+)"', "web/lib/team.ts").groups()

RULES_TS = grab(r"export const DEFAULT_RULES: RulesConfig = \{(.*?)\n\};", "web/lib/rules/config.ts").group(1)


def rule(block: str, key: str) -> float:
    body = re.search(rf"\b{block}: \{{(.*?)\}}", RULES_TS, re.S).group(1)
    return float(re.search(rf"\b{key}: ([\d.]+)", body).group(1))


SEV_TS = grab(r"export const SEVERITY_BANDS.*?= \{(.*?)\n\};", "web/lib/rules/config.ts").group(1)
SEVERITY = [(name, float(score), sla) for name, score, sla in
            re.findall(r"(\w+): \{ fromScore: ([\d.]+), action: \"[^\"]+\", slaHours: (\w+) \}", SEV_TS)]

RESTROOM_CARD = {
    "train": grab(r"\| Training set \| (\d+) restrooms × (\d+) PNG icons.*?, (\d+) images", "data/README.md").groups(),
    "val": grab(r"\| Validation set \| (\d+) cropped queries, (\d+) original gallery icons", "data/README.md").groups(),
    "test": grab(r"\| Test set \| (\d+) queries, (\d+) gallery icons", "data/README.md").groups(),
}

SERVED_ARCH_RAW = grab(r'ARCH = os.getenv\("RESTROOM_MODEL", "([^"]+)"\)', "api/restroom.py").group(1)
SERVED_ARCH = "/".join(SERVED_ARCH_RAW.rsplit("-", 1))  # open_clip "ViT-B-32" -> the docs' "ViT-B/32"


def contrast_minimum() -> dict[str, tuple[float, str]]:
    """Lowest text contrast per theme from the measured table in DESIGN-BRIEF.md (G-3).
    Only text colours count (fg, muted, subtle and the -ink tokens); solid marks have a 3:1 target."""
    block = grab(r"### Contrast audit.*?\n(\|.*?)\n\n", "docs/DESIGN-BRIEF.md").group(1)
    best = {"light": (99.0, ""), "dark": (99.0, "")}
    for line in block.splitlines()[2:]:
        cells = [c.strip(" `") for c in line.strip("|").split("|")]
        token, light, dark = cells[0], cells[2], cells[4]
        if token not in ("fg", "muted", "subtle") and not token.endswith("-ink"):
            continue
        for theme, pair in (("light", light), ("dark", dark)):
            for v in pair.split("/"):
                if float(v) < best[theme][0]:
                    best[theme] = (float(v), token)
    return best


CONTRAST = contrast_minimum()
WCAG_MIN = grab(r"U4 \| Text contrast is at least ([\d.]+):1", "docs/DESIGN-BRIEF.md").group(1)


def ai_log_entries() -> int:
    text = read("docs/AI-USAGE-LOG.md").split("\n## Entries", 1)[1]
    return sum(1 for line in text.splitlines() if line.startswith("### "))


# --------------------------------------------------------------------------------------------
# Drawing helpers (on top of the template's text, rect, title, eyebrow, footer, mark, road)
# --------------------------------------------------------------------------------------------

def new_slide(prs, bg="bg"):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    T.set_bg(s, bg)
    return s


def numbered_footer(slide, number: str, dark=False):
    T.footer(slide, dark=dark)
    T.text(slide, W - MARGIN - Inches(1.3), H - Inches(0.5), Inches(0.9), Inches(0.3), number, size=10,
           color="inverse_muted" if dark else "subtle", font=MONO, align=PP_ALIGN.RIGHT)


def rich(slide, left, top, width, height, paras, *, size=16, color="fg", line=1.12, anchor=MSO_ANCHOR.TOP,
         align=PP_ALIGN.LEFT):
    """Text box whose paragraphs are lists of runs: (text, {"bold", "color", "font", "size"}).
    A paragraph may also be a dict {"runs": [...], "space_before": pt, "bullet": True}."""
    box = slide.shapes.add_textbox(left, top, width, height)
    tf = box.text_frame
    tf.word_wrap = True
    tf.vertical_anchor = anchor
    for side in ("margin_left", "margin_right", "margin_top", "margin_bottom"):
        setattr(tf, side, 0)
    for i, para in enumerate(paras):
        spec = para if isinstance(para, dict) else {"runs": para}
        runs = spec["runs"] if isinstance(spec["runs"], list) else [spec["runs"]]
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align
        p.line_spacing = line
        if spec.get("space_before"):
            p.space_before = Pt(spec["space_before"])
        if spec.get("bullet"):
            runs = [("•  ", {"color": "accent_ink", "bold": True})] + runs
        for run in runs:
            content, over = (run, {}) if isinstance(run, str) else run
            r = p.add_run()
            r.text = content
            f = r.font
            f.name = over.get("font", TEXT)
            f.size = Pt(over.get("size", size))
            f.bold = over.get("bold", False)
            f.color.rgb = T.rgb(over.get("color", color))
    return box


def card(slide, left, top, width, height, *, fill="surface", line="border", line_w=1.0):
    return T.rect(slide, left, top, width, height, fill=fill, line=line, line_w=line_w,
                  shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.04)


def gap_box(slide, left, top, width, height, words, size=14):
    """A visible, amber-marked gap: nobody can mistake it for a result."""
    b = T.rect(slide, left, top, width, height, fill="accent_soft", line="accent", line_w=1.25,
               shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.08)
    rich(slide, left + Inches(0.15), top, width - Inches(0.3), height, [[(words, {"bold": True, "color": "accent_ink"})]],
         size=size, anchor=MSO_ANCHOR.MIDDLE)
    return b


MAX_PX = 1600  # embedded images are downscaled: the CI hygiene check (ml/check_results.py) caps files at 3 MiB


def png_stream(path: Path) -> io.BytesIO:
    """The figure as an optimised PNG at most MAX_PX wide. The original file is not changed."""
    im = Image.open(path)
    if im.width > MAX_PX:
        im = im.resize((MAX_PX, round(im.height * MAX_PX / im.width)), Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, format="PNG", optimize=True)
    buf.seek(0)
    return buf


def picture(slide, rel, left, top, max_w, max_h, *, frame=True, pad=Inches(0.08)):
    path = ROOT / rel
    pw, ph = Image.open(path).size
    scale = min((max_w - 2 * pad) / pw, (max_h - 2 * pad) / ph)
    w, h = int(pw * scale), int(ph * scale)
    x, y = left + (max_w - w) // 2, top + (max_h - h) // 2
    if frame:
        card(slide, x - pad, y - pad, w + 2 * pad, h + 2 * pad)
    slide.shapes.add_picture(png_stream(path), x, y, w, h)
    return x, y, w, h


def table(slide, left, top, col_w, rows, *, row_h=Inches(0.34), size=13, head_size=11.5, highlight=(),
          right_cols=(), mono_cols=()):
    shape = slide.shapes.add_table(len(rows), len(col_w), left, top, sum(col_w), row_h * len(rows))
    tbl = shape.table
    for i, w in enumerate(col_w):
        tbl.columns[i].width = w
    for r, row in enumerate(rows):
        tbl.rows[r].height = row_h
        for c, value in enumerate(row):
            cell = tbl.cell(r, c)
            cell.fill.solid()
            cell.fill.fore_color.rgb = T.rgb("surface2" if r == 0 else ("accent_soft" if r in highlight else "surface"))
            cell.margin_left = cell.margin_right = Inches(0.1)
            cell.margin_top = cell.margin_bottom = Inches(0.02)
            cell.vertical_anchor = MSO_ANCHOR.MIDDLE
            tf = cell.text_frame
            tf.word_wrap = True
            tf.text = ""
            p = tf.paragraphs[0]
            p.alignment = PP_ALIGN.RIGHT if c in right_cols else PP_ALIGN.LEFT
            run = p.add_run()
            run.text = str(value)
            run.font.name = MONO if (r > 0 and c in mono_cols) else TEXT
            run.font.size = Pt(head_size if r == 0 else size)
            run.font.bold = r == 0 or r in highlight
            run.font.color.rgb = T.rgb("muted" if r == 0 else "fg")
    tbl_pr = tbl._tbl.find(qn("a:tblPr"))
    for attr in ("firstRow", "bandRow"):
        tbl_pr.set(attr, "0")
    return tbl


def arrow(slide, x1, y1, x2, y2, color="muted", width=1.75):
    c = slide.shapes.add_connector(MSO_CONNECTOR.STRAIGHT, x1, y1, x2, y2)
    c.line.color.rgb = T.rgb(color)
    c.line.width = Pt(width)
    ln = c.line._get_or_add_ln()
    tail = etree.SubElement(ln, qn("a:tailEnd"))
    tail.set("type", "triangle")
    tail.set("w", "med")
    tail.set("len", "med")
    return c


def header(slide, eyebrow: str, words: str, size=30):
    T.eyebrow(slide, eyebrow)
    T.title(slide, words, size=size)


# --------------------------------------------------------------------------------------------
# Slide content. Each function draws one slide and returns its text record for SLIDES.md.
# --------------------------------------------------------------------------------------------

@dataclass
class SlideDoc:
    number: str
    name: str
    speaker: str
    budget: str
    title: str
    on_slide: list[str]
    visual: str
    script: str
    cues: str = ""
    extra_sources: list[str] = field(default_factory=list)


def words(script: str) -> int:
    return len(re.findall(r"[A-Za-z0-9][A-Za-z0-9'’.,%/-]*", re.sub(r"\[[^\]]*\]", "", script)))


def seconds(script: str) -> int:
    return round(words(script) / WPM * 60)


def mmss(sec: int) -> str:
    return f"{sec // 60}:{sec % 60:02d}"


def sources_line(doc: SlideDoc) -> str:
    by_file: dict[str, list[str]] = {}
    for n in R.rows:
        if n.slide == doc.number:
            fields = by_file.setdefault(n.file, [])
            if n.field not in fields:
                fields.append(n.field)
    parts = [f"{f} ({'; '.join(v)})" for f, v in by_file.items()] + doc.extra_sources
    gaps = [g for s, g in R.gaps if s == doc.number]
    if gaps:
        parts.append("GAPS: " + "; ".join(gaps))
    return "Sources: " + (" · ".join(parts) if parts else "no numbers on this slide")


def write_notes(slide, doc: SlideDoc):
    sec = seconds(doc.script)
    head = (f"Speaker: {doc.speaker} · budget {doc.budget} · script {words(doc.script)} words, "
            f"about {mmss(sec)} at {WPM} words per minute")
    body = [head, "", "SCRIPT", doc.script]
    if doc.cues:
        body += ["", "CUES", doc.cues]
    body += ["", sources_line(doc)]
    T.notes(slide, "\n".join(body))


# 1 · Title ----------------------------------------------------------------------------------

def slide_title(prs) -> SlideDoc:
    R.slide = "1"
    s = new_slide(prs)
    T.mark(s, MARGIN, Inches(1.0), Inches(1.15))
    T.text(s, MARGIN + Inches(1.45), Inches(1.02), Inches(8), Inches(1.2), BRAND["name"], size=72, bold=True)
    native = BRAND["nativeName"][0].upper() + BRAND["nativeName"][1:]
    T.eyebrow(s, f"{native} · {BRAND['meaning']}", top=Inches(2.55))
    T.text(s, MARGIN, Inches(3.0), Inches(10.4), Inches(1.2), BRAND["tagline"], size=26, color="muted", line=1.15)
    course = f"{COURSE[0]} · {COURSE[1]} · Assignment #2 · Computer Vision · 12 November 2026"
    T.text(s, MARGIN, Inches(4.35), Inches(11.9), Inches(0.35), course, size=13, color="subtle", font=MONO)
    col_w = Inches(3.95)
    for i, (name, role) in enumerate(TEAM):
        x = MARGIN + (i % 3) * col_w
        y = Inches(4.95) + (i // 3) * Inches(0.72)
        rich(s, x, y, col_w - Inches(0.2), Inches(0.65),
             [[(name, {"bold": True, "size": 17})], [(role, {"size": 12.5, "color": "muted"})]], line=1.0)
    T.road(s, H - Inches(0.62))
    script = ("Good morning. We are Qarau, Kazakh for “to inspect”. From photos, our app finds potholes and checks "
              "restroom door signs, then applies rules you can read. Roma will start with the problem.")
    return SlideDoc("1", "Title", "Tair", "0:15", BRAND["name"],
                    [f"{BRAND['name']} · {native} · {BRAND['meaning']}", BRAND["tagline"], course,
                     "Team: " + " · ".join(f"{n} ({r})" for n, r in TEAM)],
                    "Logo mark and the road band from the template", script,
                    extra_sources=["web/lib/brand.ts (BRAND.name, nativeName, meaning, tagline)",
                                   "web/lib/team.ts (TEAM, COURSE)"])


# 2 · Problem --------------------------------------------------------------------------------

def slide_problem(prs) -> SlideDoc:
    R.slide = "2"
    s = new_slide(prs)
    words_title = "Today, roads and door signs are checked by eye"
    header(s, "The problem", words_title)
    stat = R.gap("one sourced statistic on road damage, with unit, year, country and source (R-2, #84)")
    cw, ch, top = Inches(5.8), Inches(3.0), Inches(2.2)
    for i, (module, line1, extra) in enumerate([
        ("Roads", "Inspection is done by eye, so potholes are found late.", stat),
        ("Restrooms", "Confusing door signs are not tracked anywhere, so nobody reports them.", None),
    ]):
        x = MARGIN + i * (cw + Inches(0.3))
        card(s, x, top, cw, ch)
        T.text(s, x + Inches(0.35), top + Inches(0.3), cw - Inches(0.7), Inches(0.5), module, size=24, bold=True)
        T.text(s, x + Inches(0.35), top + Inches(0.95), cw - Inches(0.7), Inches(0.9), line1, size=19, color="muted", line=1.15)
        if extra:
            gap_box(s, x + Inches(0.35), top + Inches(1.85), cw - Inches(0.7), Inches(0.9), extra, size=13)
    bottom = "Qarau: a photo goes in, a model finds what matters, and rules a person can read decide what happens next."
    T.text(s, MARGIN, Inches(5.6), CONTENT_W, Inches(0.8), bottom, size=19, line=1.15)
    numbered_footer(s, "02")
    script = ("Today, roads and public buildings are inspected by eye, so potholes are found late. "
              f"{stat} "
              "Confusing restroom signs are not tracked anywhere, so nobody reports them. "
              "We wanted one tool for both. A photo goes in, a model finds what matters, and rules that a person can "
              "read decide what happens next. Tair will show it live.")
    return SlideDoc("2", "Problem", "Roma", "0:35", words_title,
                    ["Roads: Inspection is done by eye, so potholes are found late.", f"Roads: {stat}",
                     "Restrooms: Confusing door signs are not tracked anywhere, so nobody reports them.", bottom],
                    "Two cards, no image", script,
                    cues="Slide text and the statistic follow R-2 (#84): the number needs its unit, year, country and "
                         "a primary source; its quote goes to docs/research/deck-sources.md, section 'Slide 2'. "
                         "Until then, say no number aloud.")


# 3 · Live demo ------------------------------------------------------------------------------

def slide_demo(prs) -> SlideDoc:
    R.slide = "3"
    s = new_slide(prs, bg="inverse")
    T.text(s, MARGIN, Inches(1.0), Inches(6), Inches(0.5), "LIVE DEMO", size=14, color="brand", bold=True, spacing=200)
    title_words = "One road photo, then one pair of door signs"
    T.text(s, MARGIN, Inches(1.45), Inches(11.9), Inches(1.4), title_words, size=36, color="inverse_fg", bold=True, line=1.05)
    steps = [("01", "Roads", "A road photo → boxes, a severity and the rules that fired"),
             ("02", "Restrooms", "Two door signs → their genders, how alike they are, and a verdict")]
    for i, (num, module, line) in enumerate(steps):
        y = Inches(3.25) + i * Inches(1.05)
        T.text(s, MARGIN, y, Inches(1.0), Inches(0.6), num, size=30, color="brand", font=MONO)
        T.text(s, MARGIN + Inches(1.1), y - Inches(0.02), Inches(3), Inches(0.5), module, size=24, color="inverse_fg", bold=True)
        T.text(s, MARGIN + Inches(1.1), y + Inches(0.45), Inches(10.5), Inches(0.45), line, size=17, color="inverse_muted")
    real = ("Real, on this laptop: both analyses and the model page.  "
            "Demo data: the overview tiles and charts, marked with a badge.")
    T.text(s, MARGIN, Inches(5.7), Inches(11.9), Inches(0.7), real, size=16, color="inverse_fg", line=1.15)
    numbered_footer(s, "03", dark=True)
    champion_model = WEB_POT["championModelName"]
    script = ("This is Qarau. I open the Roads module and drop a road photo. It runs on our own model, here on this "
              "laptop. Here are the potholes it found, the severity, and one rule that fired: [read one rule hit aloud]. "
              "Now Restrooms, Compare. I pick a mismatched pair. Here are the two genders, how alike the signs are, and "
              "the verdict with the rule that failed. This is the platform overview. These tiles and charts run on demo "
              "data. The two analyses you just saw and the model page are real. On the model page are both experiment "
              "tables; we come back to these. Alizhan will explain how it works.")
    cues = (f"Demo script: docs/PRESENTATION.md 'Demo script' and docs/DEFENSE-RUNBOOK.md. Before the talk: API running "
            f"with the champion weights ({champion_model}, `championModelName` in web/data/experiments.json), Settings → "
            "Check connection must name it; /health green; demo photo ready; Wi-Fi-off test passed once. "
            "Timing: road result by 0:40, restroom verdict by 1:10, overview and model page by 1:30. "
            f"Compare runs zero-shot CLIP {SERVED_ARCH} (api/restroom.py), not the two-step pipeline. "
            "If anything fails: Settings → provider Mock, and continue. If the laptop fails: play the video.")
    return SlideDoc("3", "Live demo", "Tair", "1:30", title_words,
                    ["01 Roads: " + steps[0][2], "02 Restrooms: " + steps[1][2], real],
                    "Dark divider; the demo itself is the visual", script, cues=cues,
                    extra_sources=["docs/PRESENTATION.md (demo script, step 5: real against demo)",
                                   "web/data/experiments.json (championModelName)"])


# 4 · How it works ---------------------------------------------------------------------------

def slide_architecture(prs) -> SlideDoc:
    R.slide = "4"
    s = new_slide(prs)
    title_words = "How one photo travels through Qarau and back"
    header(s, "How it works", title_words)
    top, bh = Inches(1.95), Inches(2.65)
    ws = [Inches(1.6), Inches(3.0), Inches(1.75), Inches(2.65)]
    gap_w = (CONTENT_W - sum(ws)) // 3
    xs = [MARGIN]
    for w in ws[:-1]:
        xs.append(xs[-1] + w + gap_w)
    # 1 browser
    card(s, xs[0], top, ws[0], bh)
    rich(s, xs[0] + Inches(0.15), top + Inches(0.2), ws[0] - Inches(0.3), bh - Inches(0.3),
         [[("Browser", {"bold": True, "size": 18})], {"runs": [("Next.js pages", {"color": "muted"})], "space_before": 6},
          {"runs": [("history stays in the browser", {"color": "muted"})], "space_before": 4}], size=13)
    # 2 web server, the rules live here
    card(s, xs[1], top, ws[1], bh, line="accent", line_w=2.0)
    rich(s, xs[1] + Inches(0.2), top + Inches(0.2), ws[1] - Inches(0.4), bh - Inches(0.3),
         [[("Next.js server", {"bold": True, "size": 18})],
          {"runs": [("/api/analyze", {"font": MONO, "size": 11.5, "color": "muted"})], "space_before": 4},
          {"runs": [("/api/restroom", {"font": MONO, "size": 11.5, "color": "muted"})], "space_before": 0},
          {"runs": [("The rules run here", {"bold": True, "color": "accent_ink"})], "space_before": 12},
          {"runs": [("R1–R6  web/lib/rules", {"font": MONO, "size": 11, "color": "muted"})], "space_before": 2},
          {"runs": [("S1–S3  web/lib/signage", {"font": MONO, "size": 11, "color": "muted"})], "space_before": 0}],
         size=13)
    # 3 providers, stacked
    ph = (bh - Inches(0.2)) // 3
    providers = [("mock", "demo data, offline"), ("local", "this laptop"), ("cloud", "opt-in, not used today")]
    for i, (name, line) in enumerate(providers):
        y = top + i * (ph + Inches(0.1))
        card(s, xs[2], y, ws[2], ph, fill="surface2" if name != "local" else "surface",
             line="accent" if name == "local" else "border", line_w=2.0 if name == "local" else 1.0)
        rich(s, xs[2] + Inches(0.12), y, ws[2] - Inches(0.2), ph,
             [[(name, {"bold": True, "font": MONO, "size": 13})], [(line, {"size": 10.5, "color": "muted"})]],
             anchor=MSO_ANCHOR.MIDDLE, line=1.0)
    # 4 model service
    card(s, xs[3], top, ws[3], bh)
    rich(s, xs[3] + Inches(0.2), top + Inches(0.2), ws[3] - Inches(0.4), bh - Inches(0.3),
         [[("FastAPI service", {"bold": True, "size": 18})],
          {"runs": [("/predict", {"font": MONO, "size": 11.5, "bold": True})], "space_before": 8},
          {"runs": [("YOLO finds potholes", {"color": "muted"})], "space_before": 0},
          {"runs": [("/restroom/compare", {"font": MONO, "size": 11.5, "bold": True})], "space_before": 8},
          {"runs": [("/restroom/match", {"font": MONO, "size": 11.5, "bold": True})], "space_before": 0},
          {"runs": [("CLIP reads the signs", {"color": "muted"})], "space_before": 0}],
         size=13)
    # arrows with what travels; forward on top, back underneath
    ya, yb = top + Inches(0.95), top + Inches(1.7)
    lab = dict(size=10.5, color="subtle", align=PP_ALIGN.CENTER, line=1.0)
    for i, (fwd, back) in enumerate([("photo or sign pair", "result: severity or verdict, rules fired"),
                                     ("picks a provider", "boxes, or genders and similarity"),
                                     ("photo", "detections as JSON")]):
        x1, x2 = xs[i] + ws[i] + Inches(0.06), xs[i + 1] - Inches(0.06)
        arrow(s, x1, ya, x2, ya)
        arrow(s, x2, yb, x1, yb, color="accent_ink")
        T.text(s, x1, ya - Inches(0.66), x2 - x1, Inches(0.6), fwd, anchor=MSO_ANCHOR.BOTTOM, **lab)
        T.text(s, x1, yb + Inches(0.08), x2 - x1, Inches(0.8), back, **lab)
    providers_line = ("mock: offline demo data  ·  local: the model on this laptop, photos stay here  ·  "
                      "cloud: designed and opt-in, photos would leave the device; not used in this demo")
    T.text(s, MARGIN, Inches(4.9), CONTENT_W, Inches(0.7), providers_line, size=14.5, color="fg", line=1.15)
    r1 = REST["R1"]
    lat = R(d(r1["latencyMs"], 1), "ml/results/restroom/experiments.csv", "R1 row, latencyMs (zero-shot CLIP ViT-B/32, the model the API serves)", r1["latencyMs"])
    latency_line = (f"Restroom model as served (zero-shot CLIP {SERVED_ARCH}): {lat} ms per image, batch 1, "
                    f"laptop CPU ({r1['device']}).")
    T.text(s, MARGIN, Inches(5.75), CONTENT_W, Inches(0.4), latency_line, size=13, color="subtle", font=TEXT)
    numbered_footer(s, "04")
    script = ("This is the path of one photo. The browser sends it to our Next.js server, which uses the provider chosen "
              "in Settings: mock for offline demo data, local for the model on this laptop, or cloud. Local calls our "
              "FastAPI service, where YOLO finds potholes and CLIP reads restroom signs. The detections come back, and the "
              "rules run in the web server, so every provider is scored by the same rules. Cloud is opt-in, because road "
              "photos can show faces and plates. Amina will show what the roads model learned from.")
    cues = ("Cloud mode (S-7, #31) was not deployed on 11 November, so the slide says 'not used in this demo'; change the "
            "line if S-7 ships. The live site qarau.vercel.app runs the mock provider: the real models run only on this "
            "laptop (web/lib/providers/env.ts reads MODEL_API_URL on the server). "
            f"The latency is the restroom model the API serves (R1's zero-shot {SERVED_ARCH}), not R3 as R-21 step 4 "
            "suggested, because R3 is not served. No pothole latency on the slide: ml/results/latency.json (S-15, #28) "
            "does not exist yet.")
    return SlideDoc("4", "How it works", "Alizhan", "0:40", title_words,
                    ["Browser (Next.js pages) → Next.js server (/api/analyze, /api/restroom; the rules run here) → "
                     "provider: mock, local or cloud → FastAPI (/predict YOLO; /restroom/compare and /restroom/match CLIP) → back as JSON",
                     "Arrows: photo or sign pair · picks a provider · photo → detections as JSON · boxes, or genders and similarity · "
                     "result: severity or verdict, rules fired", providers_line, latency_line],
                    "Diagram drawn with shapes: four boxes, three provider chips, labelled arrows", script, cues=cues,
                    extra_sources=["docs/ARCHITECTURE.md sections 1 and 3 ('Local and cloud modes', 'Cloud is opt-in')",
                                   "web/lib/providers/env.ts", f"api/restroom.py (ARCH default {SERVED_ARCH})"])


# 5 · Roads: data and experiment -------------------------------------------------------------

def slide_roads_data(prs) -> SlideDoc:
    R.slide = "5"
    s = new_slide(prs)
    runs = list(POT)
    n_runs = R(str(len(runs)), "ml/results/experiments.csv", "number of rows (runs E0–E8)", len(runs))
    title_words = f"Roads: one dataset, {n_runs} runs, one change each"
    header(s, "Roads · data and experiment", title_words)
    ic, oc, seed = MANIFEST["image_counts"], MANIFEST["object_counts"], MANIFEST["seed"]
    mf = "data/exports/potholes_yolo_v1/split_manifest.json"
    n_img = R(thousands(sum(ic.values())), mf, "image_counts, sum of train + val + test", sum(ic.values()))
    n_box = R(thousands(sum(oc.values())), mf, "object_counts, sum of train + val + test", sum(oc.values()))
    names = re.findall(r"^\s+\d+: (\w+)", read("data/exports/potholes_yolo_v1/data.yaml"), re.M)
    n_cls = R(str(len(names)), "data/exports/potholes_yolo_v1/data.yaml", "names (one entry: pothole)", len(names))
    split = " / ".join(R(str(ic[k]), mf, f"image_counts.{k}", ic[k]) for k in ("train", "val", "test"))
    boxes = " / ".join(R(thousands(oc[k]), mf, f"object_counts.{k}", oc[k]) for k in ("train", "val", "test"))
    seed_s = R(str(seed), mf, "seed", seed)
    version = MANIFEST["version"]
    # left: the data card
    lx, lw, top = MARGIN, Inches(5.25), Inches(2.1)
    card(s, lx, top, lw, Inches(4.15))
    data_paras = [
        [("Data", {"bold": True, "size": 20})],
        {"runs": [("Kaggle “Annotated Potholes Image Dataset”, by Atikur Rahman Chitholian", {})], "bullet": True, "space_before": 6},
        {"runs": [("Licence: ODbL (database) and DbCL (contents), as shown on Kaggle", {})], "bullet": True, "space_before": 6},
        {"runs": [(f"{n_img} photos, {n_box} boxes, {n_cls} class: pothole", {})], "bullet": True, "space_before": 6},
        {"runs": [("Duplicates checked before the split (exact and perceptual hash): none found", {})], "bullet": True, "space_before": 6},
        {"runs": [(f"Split by photo, seed {seed_s}: {split} photos ({boxes} boxes), version ", {}),
                  (version, {"font": MONO, "size": 13})], "bullet": True, "space_before": 6},
    ]
    rich(s, lx + Inches(0.3), top + Inches(0.25), lw - Inches(0.55), Inches(3.8), data_paras, size=15, line=1.1)
    # right: the run table, "what changes" copied from experiments.csv
    rx = MARGIN + lw + Inches(0.35)
    rw = CONTENT_W - lw - Inches(0.35)
    rows = [["Run", "What changes"]] + [[r, POT[r]["changed"]] for r in runs]
    table(s, rx, top, [Inches(0.75), rw - Inches(0.75)], rows, row_h=Inches(0.3), size=12.5, head_size=11, mono_cols=(0,))
    p = E0["params"]
    fixed = [R(str(p["epochs"]), "ml/results/runs/E0.json", "params.epochs", p["epochs"]),
             R(str(p["imgsz"]), "ml/results/runs/E0.json", "params.imgsz", p["imgsz"]),
             R(str(p["batch"]), "ml/results/runs/E0.json", "params.batch", p["batch"]),
             R(str(p["seed"]), "ml/results/runs/E0.json", "params.seed", p["seed"]),
             R(str(p["lr0"]), "ml/results/runs/E0.json", "params.lr0", p["lr0"])]
    fixed_line = (f"Fixed unless the row says otherwise: {fixed[0]} epochs, {fixed[1]} px, batch {fixed[2]}, seed {fixed[3]}, "
                  f"{p['optimizer']} with lr {fixed[4]}, COCO-pretrained.")
    tie = R(d(EXPORT.TIE, 2), "ml/export_results.py", "TIE (selection rule)", EXPORT.TIE)
    conf = R(d(OP["conf"], 2), "ml/results/operating_point.json", "conf", OP["conf"])
    rule_line = (f"Chosen on validation mAP50; ties within {tie} broken by validation recall at confidence {conf}; "
                 "test read once.")
    ty = top + Inches(0.3) * len(rows) + Inches(0.12)
    rich(s, rx, ty, rw, Inches(1.0),
         [[(fixed_line, {"color": "muted"})], {"runs": [(rule_line, {"bold": True})], "space_before": 6}], size=13, line=1.1)
    numbered_footer(s, "05")
    script = (f"Our road data is the Annotated Potholes Image Dataset from Kaggle, under ODbL and DbCL, and Kaggle is "
              f"a source the syllabus allows. It has {n_img} photos with {n_box} boxes and one class. Before splitting, we "
              f"checked for exact and near-duplicate photos, because a copy in both train and test would inflate the test "
              f"score. We found none. Then we split by photo with seed {seed_s}: {ic['train']} for training, {ic['val']} "
              f"for validation and {ic['test']} for test. This is Option A. Data, seed and budget stay fixed, and each run "
              f"changes one thing against the baseline E0, such as model width, pretraining or the optimizer. We choose on "
              f"validation mAP50, and recall at our threshold of {conf} breaks ties. Test is read once. "
              f"Here is what came out.")
    cues = ("Do not say '70/15/15 stratified': the split is random by photo with seed 42; with one class nothing is "
            "stratified. Do not name Roboflow as the source: the frozen version is the Colab export potholes_yolo_v1 "
            "(docs/decisions/0002-colab-export-dataset.md). Three photos carry stock watermarks and are never shown "
            "(data/README.md, D-12). E8 is E0's settings: no change beat E0 by more than 0.01 on validation, and E8 "
            "reproduced E0 exactly (docs/ML-EXPERIMENT.md, 'E8 as applied').")
    return SlideDoc("5", "Roads: data and experiment", "Amina", "1:00", title_words,
                    ["Data: Kaggle “Annotated Potholes Image Dataset”, by Atikur Rahman Chitholian",
                     "Licence: ODbL (database) and DbCL (contents), as shown on Kaggle",
                     f"{n_img} photos, {n_box} boxes, {n_cls} class: pothole",
                     "Duplicates checked before the split (exact and perceptual hash): none found",
                     f"Split by photo, seed {seed_s}: {split} photos ({boxes} boxes), version {version}",
                     "Table: " + "; ".join(f"{r} {POT[r]['changed']}" for r in runs), fixed_line, rule_line],
                    "Run table (from experiments.csv, column `changed`), no image", script, cues=cues,
                    extra_sources=["data/README.md (dataset card D-1, 'Duplicate check' D-4)",
                                   "docs/ML-EXPERIMENT.md ('Selection rule')"])


# 6 · Roads: results and rules ---------------------------------------------------------------

def worked_example() -> dict:
    """RULES.md part 1, example A, recomputed from web/lib/rules/config.ts."""
    small, medium, large = rule("r2", "small"), rule("r2", "medium"), rule("r2", "large")
    cap, lane, highway = rule("r2", "smallCap"), rule("r3", "multiplier"), rule("r5", "highway")
    min_count, bonus = rule("r4", "minCount"), rule("r4", "bonus")
    small_pts = min(small * 1, cap)                     # one small box, off lane
    other = large * lane + medium * lane                # large and medium, both in lane
    cluster = bonus if 2 >= min_count else 0            # two medium/large boxes
    score = (small_pts + other + cluster) * highway
    severity = max((b for b in SEVERITY if b[0] != "clear" and score >= b[1]), key=lambda b: b[1])
    return dict(small=small, medium=medium, large=large, lane=lane, highway=highway, min_count=min_count,
                points=small_pts + other, score=score, severity=severity[0], sla=severity[2])


def g(x: float) -> str:
    return f"{x:g}"


def slide_roads_results(prs) -> SlideDoc:
    R.slide = "6"
    s = new_slide(prs)
    csvf = "ml/results/experiments.csv"
    champion = EXPORT.pick_champion([{**r, "valMap50": float(r["valMap50"]),
                                      "valRecallAtRulesConf": float(r["valRecallAtRulesConf"])} for r in POT.values()])
    if champion != WEB_POT["champion"] or champion != OP["run"]:
        raise SystemExit(f"Champion mismatch: rule {champion}, web {WEB_POT['champion']}, operating point {OP['run']}")
    tp = R(str(OP["tp"]), "ml/results/operating_point.json", "tp", OP["tp"])
    boxes = R(str(OP["testBoxes"]), "ml/results/operating_point.json", "testBoxes", OP["testBoxes"])
    title_words = f"Roads: {champion} is chosen on validation, and on test it finds {tp} of {boxes} potholes"
    header(s, "Roads · results and rules", title_words, size=28)
    top = Inches(2.1)
    rows = [["Run", "Validation mAP50", "Test mAP50"]]
    for r in POT:
        rows.append([r + ("  (chosen)" if r == champion else ""),
                     R(d(POT[r]["valMap50"], 4), csvf, f"{r} row, valMap50", POT[r]["valMap50"]),
                     R(d(POT[r]["map50"], 4), csvf, f"{r} row, map50 (test)", POT[r]["map50"])])
    lw = Inches(5.0)
    table(s, MARGIN, top, [Inches(1.5), Inches(1.75), Inches(1.75)], rows, row_h=Inches(0.31), size=13, head_size=11,
          highlight=(list(POT).index(champion) + 1,), right_cols=(1, 2), mono_cols=(0, 1, 2))
    prec = R(d(OP["precision"]), "ml/results/operating_point.json", "precision", OP["precision"])
    rec = R(d(OP["recall"]), "ml/results/operating_point.json", "recall", OP["recall"])
    fp = R(str(OP["fp"]), "ml/results/operating_point.json", "fp", OP["fp"])
    flagged = R(str(OP["tp"] + OP["fp"]), "ml/results/operating_point.json", "tp + fp", OP["tp"] + OP["fp"])
    conf = R(d(OP["conf"], 2), "ml/results/operating_point.json", "conf", OP["conf"])
    op_line = (f"{champion} on test at confidence {conf}: recall {rec} ({tp} of {boxes}), "
               f"precision {prec} ({tp} of {flagged}), {fp} false alarms.")
    e4_gap = Decimal(POT["E4"]["map50"]) - Decimal(POT[champion]["map50"])
    gap_s = R(d(e4_gap), csvf, f"E4 map50 − {champion} map50 = {POT['E4']['map50']} − {POT[champion]['map50']}", e4_gap)
    no_claim = R("0.02", "docs/ML-EXPERIMENT.md", "'Selection rule': differences below 0.02 on test are not claimed",
                 grab(r"Differences below ([\d.]+) on the test split are not claimed", "docs/ML-EXPERIMENT.md").group(1))
    honesty = f"E4 is {gap_s} higher on test mAP50. Differences below {no_claim} on test are not claimed, and test never chooses."
    ty = top + Inches(0.31) * len(rows) + Inches(0.15)
    rich(s, MARGIN, ty, lw, Inches(1.3),
         [[(op_line, {"bold": True})], {"runs": [(honesty, {"color": "muted", "size": 12.5})], "space_before": 6}],
         size=13.5, line=1.1)
    # right: chart, then the rules card
    rx = MARGIN + lw + Inches(0.35)
    rw = CONTENT_W - lw - Inches(0.35)
    _, py, _, phh = picture(s, "ml/results/fig_runs_map50_recall.png", rx, top - Inches(0.05), rw, Inches(2.45))
    t1, t2 = KM["area_thresholds"]
    kmf = "ml/results/pothole_area_clusters.json"
    n_train = R(thousands(KM["boxes"]), kmf, "boxes", KM["boxes"])
    t1s = R(d(t1 * 100, 2), kmf, "area_thresholds[0] × 100 (% of image)", t1 * 100)
    t2s = R(d(t2 * 100, 2), kmf, "area_thresholds[1] × 100 (% of image)", t2 * 100)
    for key, val in (("smallBelowPct", t1), ("largeFromPct", t2)):
        if abs(rule("r2", key) - val * 100) > 1e-9:
            raise SystemExit(f"web/lib/rules/config.ts r2.{key} differs from {kmf}")
    ex = worked_example()
    cfg = "web/lib/rules/config.ts"
    lane = R(g(ex["lane"]), cfg, "DEFAULT_RULES.r3.multiplier", ex["lane"])
    hw = R(g(ex["highway"]), cfg, "DEFAULT_RULES.r5.highway", ex["highway"])
    large = R(g(ex["large"]), cfg, "DEFAULT_RULES.r2.large", ex["large"])
    medium = R(g(ex["medium"]), cfg, "DEFAULT_RULES.r2.medium", ex["medium"])
    small = R(g(ex["small"]), cfg, "DEFAULT_RULES.r2.small", ex["small"])
    mc = R(g(ex["min_count"]), cfg, "DEFAULT_RULES.r4.minCount", ex["min_count"])
    pts = R(g(ex["points"]), cfg, "computed: 4 × 1.5 + 2 × 1.5 + 1", ex["points"])
    score = R(g(ex["score"]), cfg, "computed: (points + 0) × r5.highway", ex["score"])
    sla = R(ex["sla"], cfg, f"SEVERITY_BANDS.{ex['severity']}.slaHours", ex["sla"])
    if ex["score"] != 15 or ex["severity"] != "critical":
        raise SystemExit("Worked example A no longer gives 15, critical: update docs/RULES.md and this slide together")
    bands = f"k-means on {n_train} training boxes: small below {t1s} %, large from {t2s} % of the image."
    example = [f"Highway photo: one large and one medium box in the lane, one small box off it.",
               f"Points: {large} × {lane} + {medium} × {lane} + {small} = {pts}",
               f"No cluster bonus (needs {mc} medium or large boxes); highway × {hw} → {score}",
               f"Score {score} → {ex['severity']}: repair within {sla} h"]
    cy = py + phh + Inches(0.2)
    ch = Inches(6.85) - cy
    card(s, rx, cy, rw, ch)
    rich(s, rx + Inches(0.25), cy + Inches(0.15), rw - Inches(0.45), ch - Inches(0.2),
         [[("Rules: size bands and one worked example", {"bold": True, "size": 14})],
          {"runs": [(bands, {"color": "muted"})], "space_before": 3}] +
         [{"runs": [(line, {"bold": i == 3})], "space_before": 4 if i else 6} for i, line in enumerate(example)],
         size=12, line=1.02)
    numbered_footer(s, "06")
    best = max(POT, key=lambda r: float(POT[r]["valMap50"]))
    best_val = R(d(POT[best]["valMap50"]), csvf, f"{best} row, valMap50 (highest)", POT[best]["valMap50"])
    tied = [r for r in POT if float(POT[best]["valMap50"]) - float(POT[r]["valMap50"]) <= EXPORT.TIE]
    n_tied = R(str(len(tied)), csvf, f"runs within {EXPORT.TIE} of the best valMap50: {', '.join(tied)}", len(tied))
    ch_rec = R(d(POT[champion]["valRecallAtRulesConf"]), csvf, f"{champion} row, valRecallAtRulesConf",
               POT[champion]["valRecallAtRulesConf"])
    script = (f"{best} has the highest validation mAP50, {best_val}. But {n_tied} runs are within {tie_s()} of it, so the "
              f"tie-break decides: {champion}, the small model, has the highest validation recall at {conf}, {ch_rec}. "
              f"On test, at the app's threshold, {champion} finds {tp} of {boxes} potholes, recall {rec}, with {fp} false "
              f"alarms. E4 is {gap_s} higher on test mAP50, but we do not claim differences below {no_claim}, and test "
              f"never chooses. The rules then size each box with k-means bands from the training boxes. In our example, "
              f"a highway photo scores {score}: critical. Nazar takes the second module.")
    cues = ("The chart shows test values; the table's validation column is what chose the model. The confusion-matrix "
            "figure in the backup is Ultralytics' own count (IoU 0.45); the operating-point numbers here come from "
            "ml/operating_point.py (IoU 0.5) and are the ones for the slides. The worked example is RULES.md part 1, "
            "example A, recomputed from web/lib/rules/config.ts; web/lib/rules/engine.test.ts checks the same result. "
            "Check it once on /app/roads/rules with the same inputs before the talk.")
    return SlideDoc("6", "Roads: results and rules", "Amina", "0:45", title_words,
                    ["Table: " + "; ".join(f"{r[0].strip()} validation {r[1]}, test {r[2]}" for r in rows[1:]),
                     op_line, honesty, "Rules card: " + bands, *example],
                    "ml/results/fig_runs_map50_recall.png (unchanged)", script, cues=cues,
                    extra_sources=["ml/export_results.py (pick_champion: the selection rule, applied at build time)",
                                   "docs/RULES.md (part 1, worked example A)"])


def tie_s() -> str:
    return R(d(EXPORT.TIE, 2), "ml/export_results.py", "TIE (selection rule)", EXPORT.TIE)


# 7 · Restrooms: data and experiment ---------------------------------------------------------

def slide_restroom_data(prs) -> SlideDoc:
    R.slide = "7"
    s = new_slide(prs)
    title_words = "Restrooms: find the other door of the same restroom"
    header(s, "Restrooms · data and experiment", title_words)
    card_f = "data/README.md"
    n_rest, per, n_img = RESTROOM_CARD["train"]
    vq, vg = RESTROOM_CARD["val"]
    tq, tg = RESTROOM_CARD["test"]
    n_rest = R(n_rest, card_f, "restroom card, 'Training set' (restrooms)", n_rest)
    per = R(per, card_f, "restroom card, 'Training set' (icons per restroom)", per)
    n_img = R(n_img, card_f, "restroom card, 'Training set' (images)", n_img)
    vq, vg = R(vq, card_f, "restroom card, 'Validation set' (queries)", vq), R(vg, card_f, "restroom card, 'Validation set' (gallery)", vg)
    tq, tg = R(tq, card_f, "restroom card, 'Test set' (queries)", tq), R(tg, card_f, "restroom card, 'Test set' (gallery)", tg)
    ep = re.match(r"(\d+) episodes of (\d+)", PIPE["protocol"]["train_episodes"])
    n_ep = R(ep.group(1), "ml/results/restroom/pipeline.json", "protocol.train_episodes", ep.group(1))
    top = Inches(2.05)
    lw = Inches(5.2)
    task = ("IOAI 2025 task: given a cropped door sign, find the sign of the opposite gender from the same restroom "
            "in a gallery.")
    data = (f"{n_rest} training restrooms × {per} icons ({n_img} images). Validation {vq} queries, {vg} gallery icons. "
            f"Test {tq} queries, {tg} gallery icons. Licence CC-BY-4.0.")
    rich(s, MARGIN, top, lw, Inches(1.9),
         [[(task, {"bold": True})], {"runs": [(data, {"color": "muted"})], "space_before": 8}], size=15, line=1.12)
    rx = MARGIN + lw + Inches(0.35)
    rw = CONTENT_W - lw - Inches(0.35)
    groups = [("1", "Zero-shot CLIP, no training", "ViT-B/16 (R0), ViT-B/32 (R1): IOAI's baseline method"),
              ("2", "Fine-tune the last 1, 3 or 6 transformer blocks", "R2, R3, R4: our Option A change, the number of trained layers"),
              ("3", "Two-step pipeline, no training (R7)",
               f"SIFT and a pixel check find the crop's original; colour histogram and CLIP find its partner. "
               f"Chosen on {n_ep} training episodes.")]
    paras = []
    for i, (n, head, line) in enumerate(groups):
        paras.append({"runs": [(n + "  ", {"bold": True, "color": "accent_ink", "font": MONO}), (head, {"bold": True})],
                      "space_before": 0 if i == 0 else 7})
        paras.append({"runs": [("    " + line, {"color": "muted", "size": 12.5})], "space_before": 1})
    rich(s, rx, top, rw, Inches(1.95), paras, size=14, line=1.08)
    # the layer probe figure with its one-line caption
    clip = PROBE["results"]["clip"]
    blocks = {k: v for k, v in clip.items() if k.isdigit()}
    peak = max(v["pair_top1"] for v in blocks.values())
    at = [k for k, v in blocks.items() if v["pair_top1"] == peak]
    pf = "ml/results/restroom/layer_probe.json"
    peak_s = R(d(peak, 2), pf, f"results.clip[{', '.join(at)}].pair_top1 (highest)", peak)
    final_s = R(d(clip["final"]["pair_top1"], 2), pf, "results.clip.final.pair_top1", clip["final"]["pair_top1"])
    gender_s = R(d(clip["12"]["gender_acc_cv"], 2), pf, "results.clip.12.gender_acc_cv", clip["12"]["gender_acc_cv"])
    at_words = ", ".join(at[:-1]) + " and " + at[-1] if len(at) > 1 else at[0]
    caption = (f"Frozen CLIP, no training: finding the partner peaks in the middle blocks ({peak_s} at blocks {at_words}) "
               f"and drops to {final_s} at the output. Gender is readable only at the last block ({gender_s}).")
    fy = Inches(4.1)
    fw = Inches(9.0)
    picture(s, "ml/results/restroom/figs/layer_probe.png", MARGIN, fy, fw, Inches(2.75))
    T.text(s, MARGIN + fw + Inches(0.25), fy + Inches(0.2), CONTENT_W - fw - Inches(0.25), Inches(2.4), caption,
           size=12.5, color="muted", line=1.12)
    numbered_footer(s, "07")
    script = (f"The restroom task comes from the IOAI 2025 olympiad. Given a cropped door sign, the model must find the "
              f"other door of the same restroom, the opposite gender, in a gallery. The data is small: {n_rest} training "
              f"restrooms, {vq} validation and {tq} test queries, under CC-BY-4.0. We ran three groups. Zero-shot CLIP "
              f"with no training, which is IOAI's baseline. Our Option A change: fine-tuning the last one, three or six "
              f"transformer blocks. And a two-step pipeline with no training: SIFT finds the crop's original, then colour "
              f"and CLIP find its partner. The figure shows that the middle blocks know the restroom, and only the last "
              f"block knows the gender. Here is what came out.")
    cues = ("R2–R4 use fine-tuned CLIP in both steps; the pipeline (R7) uses SIFT in step 1 and trains nothing. Do not "
            "call both 'two-step' without saying which. Possible addition (R-24 step 2): one real IOAI icon pair from "
            "web/public/samples/restrooms/ioai-v*.webp with the credit line 'Images: IOAI 2025 Restroom Icon Matching, "
            "CC-BY-4.0'.")
    return SlideDoc("7", "Restrooms: data and experiment", "Nazar", "0:50", title_words,
                    [task, data] + [f"{n}. {h}: {l}" for n, h, l in groups] + [caption],
                    "ml/results/restroom/figs/layer_probe.png (unchanged)", script, cues=cues,
                    extra_sources=["docs/ML-EXPERIMENT-RESTROOM.md ('Task and data', 'Runs')"])


# 8 · Restrooms: results ---------------------------------------------------------------------

def frac(run: str, split: str) -> str:
    k = f"{split}_correct"
    return R(REST_RUN[run]["metrics"][k], f"ml/results/restroom/runs/{run}.json", f"metrics.{k}", REST_RUN[run]["metrics"][k])


def slide_restroom_results(prs) -> SlideDoc:
    R.slide = "8"
    s = new_slide(prs)
    rcsv, pj, wr = "ml/results/restroom/experiments.csv", "ml/results/restroom/pipeline.json", "web/data/restroom-experiments.json"
    champ = WEB_REST["champion"]
    if champ != "R3":
        raise SystemExit(f"Restroom run champion is now {champ}: update the row labels and script of slide 8")
    best = PIPE["champion"]
    nv, nt = len(PIPE["predictions"]["val"][best]), len(PIPE["predictions"]["test"][best])
    pv = f"{round(PIPE['val'][best] * nv)}/{nv}"
    pt = f"{round(PIPE['test'][best] * nt)}/{nt}"
    pv = R(pv, pj, f"val.{best} × {nv} queries", f"{round(PIPE['val'][best] * nv)}/{nv}")
    pt = R(pt, pj, f"test.{best} × {nt} queries", f"{round(PIPE['test'][best] * nt)}/{nt}")
    r0t, r3t = frac("R0", "test"), frac(champ, "test")
    title_words = f"Restrooms on {nt} test queries: zero-shot {r0t.split('/')[0]}, fine-tuned {champ} {r3t.split('/')[0]}, two-step pipeline {pt.split('/')[0]}"
    header(s, "Restrooms · results", title_words, size=28)
    ref = WEB_REST["reference"]
    base = R(d(ref["ioaiBaseline"], 2), wr, "reference.ioaiBaseline (IOAI published)", ref["ioaiBaseline"])
    best_ioai = R(d(ref["ioaiBest"], 2), wr, "reference.ioaiBest (IOAI published)", ref["ioaiBest"])
    rows = [["Method", "Validation", "Test"]]
    for run, label in (("R0", "R0 zero-shot CLIP"), (champ, f"{champ} fine-tune 3 blocks"),
                       ("R4", "R4 fine-tune 6 blocks")):
        dec = R(d(REST[run]["matchTop1Test"]), rcsv, f"{run} row, matchTop1Test", REST[run]["matchTop1Test"])
        rows.append([label, frac(run, "val"), f"{frac(run, 'test')}  ({dec})"])
    pdec = R(d(PIPE["test"][best]), pj, f"test.{best}", PIPE["test"][best])
    rows.append(["R7 two-step pipeline", pv, f"{pt}  ({pdec})"])
    rows.append(["IOAI published baseline", "", base])
    rows.append(["IOAI published best", "", best_ioai])
    top = Inches(2.1)
    lw = Inches(6.4)
    table(s, MARGIN, top, [Inches(3.05), Inches(1.3), Inches(2.05)], rows, row_h=Inches(0.36), size=12.5, head_size=11,
          highlight=(2, 4), right_cols=(1, 2), mono_cols=(1, 2))
    one_q = R(d(1 / nt), pj, f"computed: 1 / {nt} test queries (length of predictions.test.{best})", 1 / nt)
    interval = R.gap("95 % intervals for 30/30 and 27/30 and the paired test, ml/results/restroom/intervals.json (C-20, #201)")
    g = REST_RUN["R1"]["gender"]
    gz = R(d(g["zero_shot_prompts"]["accuracy"]), "ml/results/restroom/runs/R1.json", "gender.zero_shot_prompts.accuracy", g["zero_shot_prompts"]["accuracy"])
    gp = R(d(g["probe_lr"]["accuracy"]), "ml/results/restroom/runs/R1.json", "gender.probe_lr.accuracy", g["probe_lr"]["accuracy"])
    n_signs = sum(sum(row) for row in g["zero_shot_prompts"]["confusion_matrix_rows_true_male_female"])
    n_signs = R(str(n_signs), "ml/results/restroom/runs/R1.json", "sum of gender.zero_shot_prompts.confusion_matrix", n_signs)
    gender_line = (f"Gender of one sign: zero-shot prompts {gz}, logistic-regression probe {gp} "
                   f"(5-fold cross-validation grouped by restroom, {n_signs} signs).")
    caveat = ("The pipeline uses two facts of this benchmark: each query is cut from a gallery original, and the gallery "
              "holds exactly the queries' partners. A real building gives neither.")
    ty = top + Inches(0.36) * len(rows) + Inches(0.15)
    rich(s, MARGIN, ty, lw, Inches(1.8),
         [[(f"Highlighted: {champ}, chosen among the runs on validation (gender breaks the tie); R7, the matching "
            f"method chosen on training episodes.", {"size": 11.5, "color": "muted"})],
          {"runs": [(f"One test query is worth {one_q}.", {"bold": True})], "space_before": 5},
          {"runs": [(gender_line, {})], "space_before": 5},
          {"runs": [(caveat, {"color": "muted"})], "space_before": 5}], size=12.5, line=1.08)
    rx = MARGIN + lw + Inches(0.3)
    rw = CONTENT_W - lw - Inches(0.3)
    _, py, _, phh = picture(s, "ml/results/restroom/figs/runs_matching.png", rx, top - Inches(0.05), rw, Inches(3.2))
    T.text(s, rx, py + phh + Inches(0.15), rw, Inches(0.5),
           "Dashed lines: IOAI's published numbers on the same test set, not our runs.", size=11.5, color="subtle")
    gap_box(s, rx, Inches(5.75), rw, Inches(0.8), interval, size=11.5)
    numbered_footer(s, "08")
    r0n, r3n = r0t.split("/")[0], r3t.split("/")[0]
    script = (f"Zero-shot CLIP matches {r0n} of {nt} test queries, the same as IOAI's published baseline of {base}. "
              f"Fine-tuning the last three blocks, run {champ}, gives {r3n} of {nt}. {champ} is the run our rule picks on "
              f"validation. The two-step pipeline gets all {pt.split('/')[0]}. IOAI's published best is {best_ioai}; those "
              f"are their numbers, not a contest we took part in. Thirty queries is small: one query is {one_q}. "
              f"{interval} The pipeline also uses two facts of this benchmark that a real building does not give. Gender "
              f"from one sign is hard: prompts reach {gz}, a trained probe {gp}. Dameli will show how the interface makes "
              f"this usable.")
    cues = (f"Open team decision (R-3 step 4): which restroom result is the headline. The files say: the run rule picks "
            f"{champ} (web/data/restroom-experiments.json `champion`; R2–R4 tie at 10/10 on validation, {champ} wins on "
            f"gender), and the matching method chosen separately on training episodes is the pipeline "
            f"(pipeline.json `champion` = {best}, row R7). R4's 30/30 does not change the run choice: the rule never looks "
            f"at test. Nazar confirms in the chat. Never write 'we beat the IOAI best'. "
            f"What the app serves today is neither: `served` is null; Match ranks by zero-shot CLIP "
            f"{SERVED_ARCH} and the opposite predicted gender (servedNote in {wr}; task C-8). "
            "If C-20 lands, replace the gap with its intervals and say them aloud; until then say only "
            "'one query is 0.033' and 'thirty queries cannot separate the pipeline from R3 or R4'. "
            "If C-21 (#202) lands, add its one-query-at-a-time number next to 30/30.")
    return SlideDoc("8", "Restrooms: results", "Nazar", "0:50", title_words,
                    ["Table: " + "; ".join(f"{r[0]}: validation {r[1] or '–'}, test {r[2]}" for r in rows[1:]),
                     f"Highlighted: {champ}, chosen among the runs on validation (gender breaks the tie); R7, the matching "
                     f"method chosen on training episodes.",
                     f"One test query is worth {one_q}.", interval, gender_line, caveat,
                     "Figure caption: Dashed lines: IOAI's published numbers on the same test set, not our runs."],
                    "ml/results/restroom/figs/runs_matching.png (unchanged)", script, cues=cues,
                    extra_sources=["ml/restroom/pipeline.py (docstring: the benchmark guarantee behind the caveat)",
                                   "docs/ML-EXPERIMENT-RESTROOM.md ('Two choices, two rules')"])


# 9 · Design ---------------------------------------------------------------------------------

SHOTS = [("09-heuristic-1-status.png", "Visibility of system status: the provider and its connection are always shown."),
         ("09-heuristic-2-recover.png", "Error recovery: the cause in plain words and a one-click switch to Mock."),
         ("09-heuristic-3-recognition.png", "Recognition over recall: six labelled sample photos next to the upload box.")]


def slide_design(prs, shots_dir: Path) -> SlideDoc:
    R.slide = "9"
    s = new_slide(prs)
    title_words = "Design decisions for a road dispatcher"
    header(s, "Design", title_words)
    fw, gap_w, top = Inches(3.8), Inches(0.25), Inches(1.75)
    fh = int(fw * 405 / 570)  # Dameli's frame, 570 × 405 px (docs/PRESENTATION.md, slide 9)
    used = []
    for i, (name, line) in enumerate(SHOTS):
        x = MARGIN + i * (fw + gap_w)
        path = shots_dir / name
        if path.exists():
            card(s, x, top, fw, fh)
            s.shapes.add_picture(png_stream(path), x + Inches(0.05), top + Inches(0.05), fw - Inches(0.1), fh - Inches(0.1))
            used.append(name)
        else:
            gap_box(s, x, top, fw, fh, f"[SCREENSHOT NEEDED: {name} from G-11, put it in docs/deck/screenshots/]", size=12)
        T.text(s, x, top + fh + Inches(0.12), fw, Inches(0.7), line, size=13.5, line=1.1)
    light, dark = CONTRAST["light"], CONTRAST["dark"]
    lc = R(d(light[0], 2), "docs/DESIGN-BRIEF.md", f"'Contrast audit (G-3)', lowest light-theme text ratio (`{light[1]}`)", light[0])
    dc = R(d(dark[0], 2), "docs/DESIGN-BRIEF.md", f"'Contrast audit (G-3)', lowest dark-theme text ratio (`{dark[1]}`)", dark[0])
    wc = R(WCAG_MIN, "docs/DESIGN-BRIEF.md", "U4 (WCAG text contrast target)", WCAG_MIN)
    chart_line = "Charts: bars from zero for counts, a histogram for confidence, severity colours only for severity."
    a11y_line = (f"Accessibility: text contrast at least {lc}:1 (light) and {dc}:1 (dark), WCAG asks {wc}:1; keyboard-only "
                 f"analysis with a visible focus ring; every status with a word and an icon.")
    rich(s, MARGIN, Inches(5.35), CONTENT_W, Inches(1.2),
         [[(chart_line, {})], {"runs": [(a11y_line, {})], "space_before": 6}], size=15, line=1.12)
    numbered_footer(s, "09")
    script = ("I designed Qarau for a road dispatcher, using three of Nielsen's heuristics. Visibility of system status: "
              "the app always shows which model answers and whether it is connected. Error recovery: if the model service "
              "is down, the message says why in plain words and offers one click to the mock provider. Recognition over "
              "recall: you pick a sample instead of guessing what to upload. The charts are bars that start at zero, and "
              "every text colour passes WCAG's four and a half to one in both themes. Roma now explains how we used AI.")
    cues = ("Script and slide lines are Dameli's G-13 content (docs/PRESENTATION.md, 'Slide 9'). Course sources, not on "
            "the slide: HCI p14, p19 and p22 for the three heuristics; HCI p37 for WCAG; VizBasics p4, DMViz p28 and "
            "p31 for the charts. No screenshot of a seeded dashboard without its 'Demo data' badge."
            + ("" if len(used) == 3 else " Screenshots missing at build time: rebuild after adding them."))
    return SlideDoc("9", "Design decisions", "Dameli", "0:35", title_words,
                    [f"Screenshot {i + 1} ({n}): {l}" for i, (n, l) in enumerate(SHOTS)] + [chart_line, a11y_line],
                    "Three app screenshots from G-11 (" + (", ".join(used) if used else "not in the repository yet") + ")",
                    script, cues=cues, extra_sources=["docs/PRESENTATION.md ('Slide 9, design decisions')"])


# 10 · AI use --------------------------------------------------------------------------------

def slide_ai(prs) -> SlideDoc:
    R.slide = "10"
    s = new_slide(prs)
    title_words = "How we used AI tools, and how we checked them"
    header(s, "AI use and its limits", title_words)
    n_entries = ai_log_entries()
    n_s = R(str(n_entries), "docs/AI-USAGE-LOG.md", "number of '### ' entries under 'Entries'", n_entries)
    top, cw, ch = Inches(2.05), Inches(5.8), Inches(2.55)
    cols = [("What for", ["Writing and reviewing code and tests (web, API, training scripts)",
                          "Drafting documents, study cards and slide text",
                          "Checking text against the result files"]),
            ("How we checked", ["Unit tests and CI on every pull request",
                                "Every number on these slides traced to a committed result file (docs/research/deck-sources.md)",
                                f"Whoever used a tool checks the output and logs how: {n_s} entries in docs/AI-USAGE-LOG.md"])]
    for i, (head, lines) in enumerate(cols):
        x = MARGIN + i * (cw + Inches(0.3))
        card(s, x, top, cw, ch)
        rich(s, x + Inches(0.3), top + Inches(0.22), cw - Inches(0.55), ch - Inches(0.3),
             [[(head, {"bold": True, "size": 19})]] +
             [{"runs": [(ln, {})], "bullet": True, "space_before": 7} for ln in lines], size=15, line=1.1)
    tools = "Tools named in the log: Claude Code, Codex, GitHub Copilot."
    T.text(s, MARGIN, top + ch + Inches(0.15), CONTENT_W, Inches(0.4), tools, size=13, color="subtle")
    audit = R.gap("R-6 (#85) audit: count error of two vision-language models on screened test photos, "
                  "docs/research/vlm-evaluation.md is not on main")
    T.text(s, MARGIN, Inches(5.25), CONTENT_W, Inches(0.4), "Audit of two vision-language models", size=16, bold=True)
    gap_box(s, MARGIN, Inches(5.7), CONTENT_W, Inches(0.7), audit, size=13)
    numbered_footer(s, "10")
    script = (f"We used AI tools, mainly Claude Code, Codex and Copilot, to write and review code and tests, to draft "
              f"documents and study cards, and to check text against our result files. Every use is in our AI usage log, "
              f"{n_s} entries with the tool and the prompt. Whoever used a tool checked its output and wrote down how: "
              f"unit tests and CI on every pull request, and every number on these slides traced to a result file. "
              f"{audit} Next, the limits.")
    cues = ("If R-6 is not finished by the defense, remove the audit block and say: 'We planned an audit of two "
            "vision-language models; it is not finished, so we show no numbers.' Never quote audit numbers that are "
            "not in docs/research/vlm-evaluation.md.")
    return SlideDoc("10", "AI use and its limits", "Roma", "0:35", title_words,
                    [f"What for: {'; '.join(cols[0][1])}", f"How we checked: {'; '.join(cols[1][1])}", tools,
                     f"Audit of two vision-language models: {audit}"],
                    "Two cards, no image", script, cues=cues,
                    extra_sources=["docs/AI-USAGE-LOG.md (entries: tool, purpose, verification)"])


# 11 · Limitations ---------------------------------------------------------------------------

def slide_limits(prs) -> SlideDoc:
    R.slide = "11"
    s = new_slide(prs)
    title_words = "What our results do not show yet"
    header(s, "Limitations and next steps", title_words)
    n_rest = R(RESTROOM_CARD["train"][0], "data/README.md", "restroom card, 'Training set' (restrooms)", RESTROOM_CARD["train"][0])
    limits = [("Box area is not physical size", "A far pothole looks small and a close-up fills the frame. Real size needs camera calibration or depth."),
              (f"{n_rest} training restrooms, two classes", "Accessible and all-gender signs are not in the data."),
              ("No local data yet", "The road photos are not from Kazakhstan; snow and night scenes are untested.")]
    top = Inches(2.05)
    for i, (head, line) in enumerate(limits):
        y = top + i * Inches(0.95)
        T.text(s, MARGIN, y, Inches(0.6), Inches(0.5), f"{i + 1}", size=26, color="accent_ink", font=MONO, bold=True)
        rich(s, MARGIN + Inches(0.65), y, Inches(11.2), Inches(0.9),
             [[(head, {"bold": True, "size": 19})], [(line, {"color": "muted"})]], size=15, line=1.1)
    nxt = ("Next: test on screened local photos as an external test set, serve the two-step pipeline in the app (C-8), "
           "and repeat the runs with other seeds.")
    card(s, MARGIN, Inches(5.05), CONTENT_W, Inches(1.0), fill="surface2", line=None)
    T.text(s, MARGIN + Inches(0.3), Inches(5.05), CONTENT_W - Inches(0.6), Inches(1.0), nxt, size=15, anchor=MSO_ANCHOR.MIDDLE, line=1.12)
    numbered_footer(s, "11")
    script = (f"Three limits. Box area in a photo is not physical size: a far pothole looks small. The restroom data has "
              f"{n_rest} training restrooms and only two classes, so accessible and all-gender signs are missing. And none "
              f"of our road photos are from Kazakhstan. Next, we would test on screened local photos and serve the two-step "
              f"pipeline. Tair closes.")
    return SlideDoc("11", "Limitations and next steps", "Roma", "0:25", title_words,
                    [f"{i + 1}. {h}: {l}" for i, (h, l) in enumerate(limits)] + [nxt],
                    "Numbered list, no image", script,
                    extra_sources=["docs/RULES.md ('Known limits')", "docs/ML-EXPERIMENT.md ('Limits to state', 'Stretch')",
                                   "docs/ML-EXPERIMENT-RESTROOM.md ('Limits to state')"])


# 12 · Closing -------------------------------------------------------------------------------

def slide_closing(prs) -> SlideDoc:
    R.slide = "12"
    s = new_slide(prs)
    T.eyebrow(s, "Questions")
    T.title(s, "Where everything is", size=40)
    results = [p for p in ("ml/results/experiments.csv", "ml/results/restroom/experiments.csv",
                           "docs/research/vlm-evaluation.md") if (ROOT / p).exists()]
    worked = [p for p in ("docs/AI-USAGE-LOG.md", "docs/CONTRIBUTION-LOG.md") if (ROOT / p).exists()]
    links = [("Repository", ["github.com/tairqaldy/qarau-ict-final-1st-trimester"]),
             ("Live site", ["qarau.vercel.app  (real model page; analyses there run on demo data)"]),
             ("Results", results), ("How we worked", worked)]
    y = Inches(1.95)
    for label, values in links:
        T.text(s, MARGIN, y, Inches(2.4), Inches(0.4), label, size=17, color="muted")
        T.text(s, MARGIN + Inches(2.5), y + Inches(0.02), Inches(9.4), Inches(0.4) * len(values), values, size=15.5, font=MONO, line=1.2)
        y += Inches(0.42) * len(values) + Inches(0.18)
    real = ("Real: both analyze flows on this laptop and the model page. "
            "Demo data: the overview tiles and charts, marked with a badge.")
    card(s, MARGIN, y + Inches(0.05), CONTENT_W, Inches(0.62), fill="accent_soft", line=None)
    T.text(s, MARGIN + Inches(0.25), y + Inches(0.05), CONTENT_W - Inches(0.5), Inches(0.62), real, size=15, bold=True,
           color="accent_ink", anchor=MSO_ANCHOR.MIDDLE)
    T.road(s, H - Inches(0.62))
    script = ("Thank you. The code, both results tables and our AI log are in this repository. "
              "We are ready for your questions.")
    cues = ("Leave this slide up during questions. docs/research/vlm-evaluation.md is listed automatically once it exists "
            "on main (R-20 'Watch out': no path that does not exist). If asked for code, open ml/train.py, then "
            "web/lib/rules/, then api/main.py (docs/PRESENTATION.md 'Showing source code').")
    return SlideDoc("12", "Closing", "Tair", "0:10", "Where everything is",
                    ["Repository: github.com/tairqaldy/qarau-ict-final-1st-trimester",
                     "Live site: qarau.vercel.app (real model page; analyses there run on demo data)",
                     "Results: " + ", ".join(results), "How we worked: " + ", ".join(worked), real],
                    "Links and the road band from the template", script, cues=cues,
                    extra_sources=["README.md ('Live demo')", "docs/decisions/0006-public-repository.md",
                                   "docs/PRESENTATION.md (demo script, step 5)"])


# Backups ------------------------------------------------------------------------------------

def backup_header(s, label, heading):
    T.eyebrow(s, f"Backup · {label}")
    T.title(s, heading, size=28)


def slide_backup_table(prs) -> SlideDoc:
    R.slide = "B1"
    s = new_slide(prs)
    csvf = "ml/results/experiments.csv"
    n_runs = R(str(len(POT)), csvf, "number of rows (runs)", len(POT))
    title_words = f"All {n_runs} pothole runs from the results table"
    backup_header(s, "Roads", title_words)
    cols = [("valMap50", "Val mAP50"), ("valRecallAtRulesConf", "Val R@0.40"), ("map50", "Test mAP50"),
            ("map50_95", "Test mAP50-95"), ("precisionAtRulesConf", "Test P@0.40"), ("recallAtRulesConf", "Test R@0.40"),
            ("sizeMb", "MB")]
    rows = [["Run", "What changes"] + [c[1] for c in cols]]
    champion = WEB_POT["champion"]
    for r, row in POT.items():
        cells = [r, row["changed"]]
        for key, _ in cols:
            places = 1 if key == "sizeMb" else 4
            cells.append(R(d(row[key], places), csvf, f"{r} row, {key}", row[key]))
        rows.append(cells)
    widths = [Inches(0.6), Inches(3.9)] + [Inches(1.06)] * len(cols)
    table(s, MARGIN, Inches(1.85), widths, rows, row_h=Inches(0.37), size=11.5, head_size=10.5,
          highlight=(list(POT).index(champion) + 1,), right_cols=tuple(range(2, 2 + len(cols))),
          mono_cols=(0,) + tuple(range(2, 2 + len(cols))))
    note = ("Precision and recall at 0.40 here are Ultralytics' own pass (IoU 0.45). The operating point on slide 6 is "
            "ml/operating_point.py (IoU 0.5). Latency: not measured yet (S-15).")
    T.text(s, MARGIN, Inches(5.65), CONTENT_W, Inches(0.6), note, size=12, color="subtle", line=1.1)
    numbered_footer(s, "B1")
    return SlideDoc("B1", "Backup: full pothole metrics table", "Amina", "on request", title_words,
                    ["Every column of ml/results/experiments.csv except latency (empty) and device", note],
                    "Table", "Only on request.", extra_sources=["docs/ML-EXPERIMENT.md ('What to report')"])


def slide_backup_operating(prs) -> SlideDoc:
    R.slide = "B2"
    s = new_slide(prs)
    op = "ml/results/operating_point.json"
    run = OP["run"]
    title_words = f"{run} at the app's threshold, on the test split"
    backup_header(s, "Roads", title_words)
    head = ["Test photos", "Labelled potholes", "Found (TP)", "False alarms (FP)", "Missed (FN)", "Precision", "Recall", "F1"]
    vals = [R(str(OP["images"]), op, "images", OP["images"]), R(str(OP["testBoxes"]), op, "testBoxes", OP["testBoxes"]),
            R(str(OP["tp"]), op, "tp", OP["tp"]), R(str(OP["fp"]), op, "fp", OP["fp"]), R(str(OP["fn"]), op, "fn", OP["fn"]),
            R(d(OP["precision"]), op, "precision", OP["precision"]), R(d(OP["recall"]), op, "recall", OP["recall"]),
            R(d(OP["f1"]), op, "f1", OP["f1"])]
    table(s, MARGIN, Inches(1.8), [CONTENT_W // 8] * 8, [head, vals], row_h=Inches(0.42), size=14, head_size=11,
          right_cols=tuple(range(8)), mono_cols=tuple(range(8)))
    conf = R(d(OP["conf"], 2), op, "conf", OP["conf"])
    iou = R(d(OP["iou"], 1), op, "iou", OP["iou"])
    sub = (f"Confidence {conf}, IoU {iou}, each labelled box matched at most once (ml/operating_point.py). "
           "Figures: Ultralytics' own test pass at 0.40 (IoU 0.45), so its counts differ slightly from the table.")
    T.text(s, MARGIN, Inches(2.75), CONTENT_W, Inches(0.6), sub, size=12.5, color="muted", line=1.1)
    half = (CONTENT_W - Inches(0.3)) // 2
    picture(s, "ml/results/fig_champion_pr_curve.png", MARGIN, Inches(3.4), half, Inches(3.2))
    picture(s, "ml/results/fig_champion_confusion_at_040.png", MARGIN + half + Inches(0.3), Inches(3.4), half, Inches(3.2))
    numbered_footer(s, "B2")
    return SlideDoc("B2", "Backup: operating point", "Amina", "on request", title_words,
                    ["Table: " + ", ".join(f"{h} {v}" for h, v in zip(head, vals)), sub],
                    "ml/results/fig_champion_pr_curve.png, ml/results/fig_champion_confusion_at_040.png", "Only on request.",
                    extra_sources=["docs/ML-EXPERIMENT.md ('Operating point')", "ml/README.md ('Deck plots')"])


def slide_backup_curves(prs) -> SlideDoc:
    R.slide = "B3"
    s = new_slide(prs)
    title_words = "Training curves: train against validation box loss"
    backup_header(s, "Roads", title_words)
    picture(s, "ml/results/fig_curves.png", MARGIN, Inches(1.85), CONTENT_W, Inches(3.4))
    line = ("E0 baseline, E2 from random weights, E5 with standard augmentations off. In E5 the training loss keeps "
            "falling while the validation loss stays flat: overfitting without augmentation.")
    T.text(s, MARGIN, Inches(5.45), CONTENT_W, Inches(0.8), line, size=15, line=1.12)
    numbered_footer(s, "B3")
    return SlideDoc("B3", "Backup: training curves", "Amina", "on request", title_words, [line],
                    "ml/results/fig_curves.png (from ml/results/runs/E0-, E2-, E5-results.csv)", "Only on request.")


def slide_backup_kmeans(prs) -> SlideDoc:
    R.slide = "B4"
    s = new_slide(prs)
    title_words = "Size bands: k-means on the training boxes"
    backup_header(s, "Roads · rules", title_words)
    kmf = "ml/results/pothole_area_clusters.json"
    picture(s, "ml/results/figs/pothole_area_clusters.png", MARGIN, Inches(1.85), Inches(8.2), Inches(4.3))
    gc = KM["group_counts"]
    lines = [f"k = {R(str(KM['k']), kmf, 'k', KM['k'])} on the log of box area, train split only "
             f"({R(str(KM['images']), kmf, 'images', KM['images'])} photos, {R(thousands(KM['boxes']), kmf, 'boxes', KM['boxes'])} boxes).",
             f"Small {R(str(gc['small']), kmf, 'group_counts.small', gc['small'])}, medium "
             f"{R(str(gc['medium']), kmf, 'group_counts.medium', gc['medium'])}, large "
             f"{R(str(gc['large']), kmf, 'group_counts.large', gc['large'])} boxes.",
             "Bands are shares of the image, not physical size."]
    rich(s, MARGIN + Inches(8.5), Inches(2.0), CONTENT_W - Inches(8.5), Inches(4.0),
         [{"runs": [(ln, {})], "space_before": 0 if i == 0 else 10} for i, ln in enumerate(lines)], size=14, line=1.12)
    numbered_footer(s, "B4")
    return SlideDoc("B4", "Backup: k-means size bands", "Amina", "on request", title_words, lines,
                    "ml/results/figs/pothole_area_clusters.png", "Only on request.",
                    extra_sources=["data/README.md ('Box-size clustering for R2')"])


def slide_backup_approaches(prs) -> SlideDoc:
    R.slide = "B5"
    s = new_slide(prs)
    title_words = "Restrooms: from the IOAI baseline to the pipeline"
    backup_header(s, "Restrooms", title_words)
    picture(s, "ml/results/restroom/figs/approaches.png", MARGIN, Inches(1.85), Inches(8.6), Inches(4.4))
    best = PIPE["champion"]
    pj = "ml/results/restroom/pipeline.json"
    m = PIPE["train_episodes"][best]["top1"]
    w = R(d(PIPE["histogram_weight"], 1), pj, "histogram_weight", PIPE["histogram_weight"])
    w_clip = R(d(Decimal(1) - Decimal(str(PIPE["histogram_weight"])), 1), pj, "computed: 1 − histogram_weight",
               Decimal(1) - Decimal(str(PIPE["histogram_weight"])))
    mean = R(d(m["mean"]), pj, f"train_episodes.{best}.top1.mean", m["mean"])
    std = R(d(m["std"]), pj, f"train_episodes.{best}.top1.std", m["std"])
    lines = [f"Chosen on training episodes, then validation; test read once.",
             f"Champion: SIFT + pixel check, then {w} × colour histogram + {w_clip} × CLIP (z-scored), one global assignment.",
             f"Training episodes: {mean} ± {std}."]
    rich(s, MARGIN + Inches(8.85), Inches(2.0), CONTENT_W - Inches(8.85), Inches(4.0),
         [{"runs": [(ln, {})], "space_before": 0 if i == 0 else 10} for i, ln in enumerate(lines)], size=13.5, line=1.12)
    numbered_footer(s, "B5")
    return SlideDoc("B5", "Backup: restroom approaches", "Nazar", "on request", title_words, lines,
                    "ml/results/restroom/figs/approaches.png", "Only on request.",
                    extra_sources=["docs/ML-EXPERIMENT-RESTROOM.md ('The final pipeline')"])


# --------------------------------------------------------------------------------------------
# Build and write
# --------------------------------------------------------------------------------------------

def build(shots_dir: Path):
    R.rows.clear()
    R.gaps.clear()
    prs = T.Presentation()
    prs.slide_width, prs.slide_height = W, H
    docs = [slide_title(prs), slide_problem(prs), slide_demo(prs), slide_architecture(prs), slide_roads_data(prs),
            slide_roads_results(prs), slide_restroom_data(prs), slide_restroom_results(prs), slide_design(prs, shots_dir),
            slide_ai(prs), slide_limits(prs), slide_closing(prs), slide_backup_table(prs), slide_backup_operating(prs),
            slide_backup_curves(prs), slide_backup_kmeans(prs), slide_backup_approaches(prs)]
    for slide, doc in zip(prs.slides, docs):
        write_notes(slide, doc)
    return prs, docs


def write_slides_md(docs: list[SlideDoc]) -> None:
    main = [doc for doc in docs if not doc.number.startswith("B")]
    total = sum(seconds(doc.script) for doc in main if doc.number != "3") + 90
    out = ["# Defense deck: slides, scripts and sources",
           "",
           "Generated by `docs/deck/make_deck.py` from the committed result files. Do not edit by hand: change the "
           "script and run it again. The deck itself is `docs/deck/qarau-defense-deck.pptx` (import into Canva); the "
           "same scripts and `Sources:` lines are in its speaker notes. Speaker names are only here and in the notes.",
           "",
           f"Times are estimates at {WPM} words per minute; read each script aloud with a timer (rehearsal rules in "
           f"docs/PRESENTATION.md). Slide 3 is the live demo and is timed by the demo, 1:30. Estimated total for "
           f"slides 1–12: {mmss(total)}.",
           ""]
    if R.gaps:
        out += ["## Gaps to fill before the talk", ""]
        out += [f"- Slide {s}: {g}" for s, g in R.gaps]
        out += [""]
    out += ["| # | Slide | Speaker | Budget | Script | Estimate |", "|---|---|---|---|---:|---:|"]
    for doc in main:
        est = "demo" if doc.number == "3" else mmss(seconds(doc.script))
        out.append(f"| {doc.number} | {doc.name} | {doc.speaker} | {doc.budget} | {words(doc.script)} words | {est} |")
    out.append("")
    for doc in docs:
        label = f"Backup {doc.number}" if doc.number.startswith("B") else f"Slide {doc.number}"
        out += [f"## {label} · {doc.name}", "",
                f"**Speaker (notes only):** {doc.speaker} · **budget** {doc.budget}"
                + ("" if doc.number.startswith("B") else
                   f" · **script** {words(doc.script)} words, about {mmss(seconds(doc.script))}"),
                "", f"**Title:** {doc.title}", "", "**On the slide:**", ""]
        out += [f"- {line}" for line in doc.on_slide]
        out += ["", f"**Visual:** {doc.visual}", ""]
        if not doc.number.startswith("B"):
            out += ["**Script:**", "", "> " + doc.script, ""]
        if doc.cues:
            out += [f"**Cues:** {doc.cues}", ""]
        out += [f"**{sources_line(doc).replace('Sources:', 'Sources:**', 1)}", ""]
    SLIDES_MD.write_text("\n".join(out), encoding="utf-8")


START, END = "<!-- generated by docs/deck/make_deck.py: start -->", "<!-- generated by docs/deck/make_deck.py: end -->"


def write_sources_md() -> None:
    lines = [START, "", "## Numbers on slides", "",
             "One row per number on the deck, written by `docs/deck/make_deck.py`, which reads each number from the "
             "file and field below and stops if the slide and the file disagree. `Value in file` is the raw value; "
             "the slide rounds half-up to the precision shown and never adds precision. Rows marked `gap` are numbers "
             "the deck does not show yet because no committed file holds them.", "",
             "| Slide | Number as shown | File | Field / row | Value in file | Match |", "|---|---|---|---|---|---|"]
    seen = set()
    for n in R.rows:
        key = (n.slide, n.shown, n.file, n.field)
        if key in seen:
            continue
        seen.add(key)
        lines.append(f"| {n.slide} | {n.shown} | `{n.file}` | {n.field} | {n.value} | {n.match} |")
    for s, g in R.gaps:
        lines.append(f"| {s} | (not shown) | | {g} | | gap |")
    lines += ["", END]
    block = "\n".join(lines)
    if SOURCES_MD.exists():
        old = SOURCES_MD.read_text(encoding="utf-8")
        if START in old and END in old:
            new = old.split(START)[0] + block + old.split(END, 1)[1]
        else:
            new = old.rstrip() + "\n\n" + block + "\n"
    else:
        new = ("# Deck sources\n\nWhere every number on the defense slides comes from (tasks R-2, R-14, R-15).\n\n"
               "## Slide 2\n\nThe problem statistic (R-2, #84): not chosen yet. Record here the exact quote, publisher, "
               "the year the number describes, the URL and the access date.\n\n" + block + "\n")
    SOURCES_MD.write_text(new, encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.split("\n", 1)[0])
    parser.add_argument("--out", type=Path, default=OUT)
    parser.add_argument("--screenshots", type=Path, default=ROOT / "docs/deck/screenshots",
                        help="folder with the three slide 9 screenshots (09-heuristic-*.png)")
    parser.add_argument("--preview", type=Path, help="also write one .pptx per slide into this folder")
    args = parser.parse_args()
    prs, docs = build(args.screenshots)
    prs.save(args.out)
    write_slides_md(docs)
    write_sources_md()
    print(f"wrote {args.out.relative_to(ROOT) if args.out.is_relative_to(ROOT) else args.out} ({len(prs.slides)} slides), "
          f"{SLIDES_MD.relative_to(ROOT)}, {SOURCES_MD.relative_to(ROOT)}")
    print(f"{len(R.rows)} numbers checked against their files, {len(R.gaps)} gaps")
    for slide, what in R.gaps:
        print(f"  gap on slide {slide}: {what}")
    for doc in docs:
        if not doc.number.startswith("B") and doc.number != "3":
            print(f"  slide {doc.number:>2} {doc.speaker:<8} budget {doc.budget}  script {words(doc.script):>3} words ≈ {mmss(seconds(doc.script))}")
    if args.preview:
        args.preview.mkdir(parents=True, exist_ok=True)
        for keep in range(len(prs.slides)):
            one, _ = build(args.screenshots)
            ids = one.slides._sldIdLst
            for i, sld in reversed(list(enumerate(list(ids)))):
                if i != keep:
                    one.part.drop_rel(sld.get(qn("r:id")))
                    ids.remove(sld)
            one.save(args.preview / f"slide-{keep + 1:02d}.pptx")
        print(f"wrote {len(prs.slides)} single-slide previews to {args.preview}")


if __name__ == "__main__":
    main()
