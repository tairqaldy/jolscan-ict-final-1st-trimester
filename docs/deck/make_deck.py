"""Build the Qarau defense deck (tasks R-3, R-15) from the committed result files.

Every number on a slide is read here, at build time, from a committed file (CSV, JSON, or a
measured table in a doc) and registered with its file and field. Nothing is typed by hand.
The look (colours, fonts, footer, mark, road band) comes from Dameli's template generator,
docs/design/slide-template/make_slide_template.py (G-10), which is imported, not copied.
The charts on slides 6, 7, 8 and backups B3, B5 are drawn here, at the size they are placed,
from the same result files, with the chart style of docs/design/chart-style.md (G-52) and the
colours read from web/app/tokens.css.

    .venv/bin/python docs/deck/make_deck.py
    .venv/bin/python docs/deck/make_deck.py --preview /tmp/deck-preview   # one .pptx per slide

Writes
    docs/deck/qarau-defense-deck.pptx   12 slides plus backups; script and Sources in the notes
    docs/deck/SLIDES.md                 the same content as text (generated: edit this script)
    docs/research/deck-sources.md       the generated "Numbers on slides" block (R-15); text
                                        outside the generated markers is kept

Slide 9 screenshots (G-11) never go into git (docs/design/screenshots.md); they are placed in
Canva from the Drive folder screenshots/. To embed them in a local build, pass --screenshots DIR
with a folder outside the repository.

The build stops if a shown number does not match its file, if a rounding is ambiguous, or if
text the audience needs on slides 1-12 is smaller than 14 pt (docs/design/deck-critique.md).
A number that no committed file holds yet is an open gap: it is not on the slide face; the
speaker notes say what is missing and give the sentence to say instead.
"""

from __future__ import annotations

import argparse
import csv
import importlib.util
import io
import json
import logging
import re
from dataclasses import dataclass, field
from decimal import ROUND_HALF_UP, Decimal
from fractions import Fraction
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402
from lxml import etree  # noqa: E402
from PIL import Image  # noqa: E402
from pptx.enum.shapes import MSO_CONNECTOR, MSO_SHAPE  # noqa: E402
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN  # noqa: E402
from pptx.oxml.ns import qn  # noqa: E402
from pptx.util import Inches, Pt  # noqa: E402

logging.getLogger("matplotlib.font_manager").setLevel(logging.ERROR)

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "docs/deck/qarau-defense-deck.pptx"
SLIDES_MD = ROOT / "docs/deck/SLIDES.md"
SOURCES_MD = ROOT / "docs/research/deck-sources.md"
WPM = 130  # speaking rate used for every time estimate (docs/PRESENTATION.md, R-20 step 3)

# Type scale (template G-10: body 18, tables 16; deck-critique.md: nothing the room needs below 14)
BODY, TABLE, MIN_PT = 18, 16, 14


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


def read_rows(rel: str) -> list[dict]:
    with open(ROOT / rel, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


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
class Gap:
    slide: str
    what: str
    owner: str
    fallback: str
    watch: str


@dataclass
class Registry:
    rows: list[Num] = field(default_factory=list)
    gaps: list[Gap] = field(default_factory=list)
    slide: str = ""

    def __call__(self, shown: str, file: str, fld: str, value) -> str:
        self.rows.append(Num(self.slide, shown, file, fld, str(value), self._match(shown, value)))
        return shown

    def gap(self, what: str, owner: str, fallback: str, watch: str = "") -> str:
        """A number no committed file holds yet. It stays off the slide face; the notes carry it."""
        self.gaps.append(Gap(self.slide, what, owner, fallback, watch))
        return fallback

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


def css_tokens() -> dict[str, str]:
    """Light-theme colour tokens from web/app/tokens.css (the first definition of each name)."""
    out: dict[str, str] = {}
    for name, value in re.findall(r"--([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})\s*;", read("web/app/tokens.css")):
        out.setdefault(name, value.lower())
    return out


TOK = css_tokens()
SERIES = [TOK["chart-1"], TOK["chart-2"], TOK["chart-3"], TOK["chart-4"]]
HIGHLIGHT = TOK["accent"]
if HIGHLIGHT != TOK["chart-2"] or HIGHLIGHT == "#f2a900":
    raise SystemExit("tokens.css: the chart highlight should be --accent = --chart-2, not the old #f2a900 (chart-style.md)")


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


def rich(slide, left, top, width, height, paras, *, size=BODY, color="fg", line=1.1, anchor=MSO_ANCHOR.TOP,
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


def table(slide, left, top, col_w, rows, *, row_h=Inches(0.36), size=TABLE, head_size=14, highlight=(),
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
            run.font.bold = r == 0
            run.font.color.rgb = T.rgb("muted" if r == 0 else "fg")
    tbl_pr = tbl._tbl.find(qn("a:tblPr"))
    for attr in ("firstRow", "bandRow"):
        tbl_pr.set(attr, "0")
    return tbl


def arrow(slide, x1, y1, x2, y2, color="muted", width=2.0):
    c = slide.shapes.add_connector(MSO_CONNECTOR.STRAIGHT, x1, y1, x2, y2)
    c.line.color.rgb = T.rgb(color)
    c.line.width = Pt(width)
    ln = c.line._get_or_add_ln()
    tail = etree.SubElement(ln, qn("a:tailEnd"))
    tail.set("type", "triangle")
    tail.set("w", "med")
    tail.set("len", "med")
    return c


def header(slide, eyebrow: str, words: str, size=32):
    T.eyebrow(slide, eyebrow)
    T.title(slide, words, size=size)


# --------------------------------------------------------------------------------------------
# Charts, drawn at the size they are placed (chart-style.md, G-52)
# --------------------------------------------------------------------------------------------

def chart_style() -> None:
    plt.rcdefaults()
    matplotlib.rcParams.update({
        "figure.facecolor": TOK["bg"], "axes.facecolor": TOK["bg"], "savefig.facecolor": TOK["bg"],
        "text.color": TOK["fg"], "axes.titlecolor": TOK["fg"], "axes.labelcolor": TOK["muted"],
        "xtick.color": TOK["muted"], "ytick.color": TOK["muted"],
        "axes.edgecolor": TOK["border-strong"], "axes.spines.top": False, "axes.spines.right": False,
        "axes.grid": True, "axes.grid.axis": "y", "grid.color": TOK["chart-grid"], "grid.linewidth": 0.8,
        "axes.axisbelow": True, "axes.prop_cycle": matplotlib.cycler(color=SERIES),
        "axes.titlesize": 16, "axes.titleweight": "bold", "axes.titlelocation": "left",
        "font.family": "sans-serif", "font.sans-serif": ["Overpass", "DejaVu Sans"], "font.size": 14,
        "axes.labelsize": 14, "xtick.labelsize": 14, "ytick.labelsize": 14, "legend.fontsize": 14,
        "legend.frameon": False,
    })


def new_chart(w_in: float, h_in: float, ncols: int = 1):
    chart_style()
    fig, axes = plt.subplots(1, ncols, figsize=(w_in, h_in), layout="constrained")
    return fig, axes


def source_line(fig, words: str) -> None:
    fig.supxlabel(words, x=0.005, ha="left", fontsize=12, color=TOK["subtle"])


def chart_title(fig, words: str) -> None:
    fig.suptitle(words, x=0.005, ha="left", fontsize=16, fontweight="bold", color=TOK["fg"])


def label(value, places: int = 3) -> str:
    """A number drawn inside a chart: the file's own digits where rounding them again would be ambiguous."""
    digits = str(value).split(".")[1] if "." in str(value) else ""
    return str(value) if len(digits) == places + 1 and digits.endswith("5") else d(value, places)


def place_chart(slide, fig, left, top, width, height):
    """Insert a figure drawn at exactly the placed size, so a 14 pt label stays 14 pt on the slide."""
    w_in, h_in = fig.get_size_inches()
    if abs(w_in - width / 914400) > 0.01 or abs(h_in - height / 914400) > 0.01:
        raise SystemExit("chart size and placed size differ: labels would be scaled")
    buf = io.BytesIO()
    fig.savefig(buf, format="png", dpi=200)
    plt.close(fig)
    buf.seek(0)
    slide.shapes.add_picture(buf, left, top, width, height)


# --------------------------------------------------------------------------------------------
# Slide records for SLIDES.md and the notes
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
    return "Sources: " + (" · ".join(parts) if parts else "no numbers on this slide")


def gap_notes(doc: SlideDoc) -> list[str]:
    out = []
    for g in R.gaps:
        if g.slide == doc.number:
            out += [f"OPEN GAP ({g.owner}): {g.what}. Not on the slide. Until it is filled, the script uses: "
                    f"“{g.fallback}” When it lands, add the number with its source here and in "
                    f"docs/research/deck-sources.md, then rebuild."]
    return out


def write_notes(slide, doc: SlideDoc):
    sec = seconds(doc.script)
    head = (f"Speaker: {doc.speaker} · budget {doc.budget} · script {words(doc.script)} words, "
            f"about {mmss(sec)} at {WPM} words per minute")
    body = [head, "", "SCRIPT", doc.script]
    gaps = gap_notes(doc)
    if gaps:
        body += [""] + gaps
    if doc.cues:
        body += ["", "CUES", doc.cues]
    body += ["", sources_line(doc)]
    T.notes(slide, "\n".join(body))


# 1 · Title ----------------------------------------------------------------------------------

def slide_title(prs) -> SlideDoc:
    R.slide = "1"
    s = new_slide(prs)
    T.mark(s, MARGIN, Inches(0.85), Inches(1.15))
    T.text(s, MARGIN + Inches(1.45), Inches(0.87), Inches(8), Inches(1.2), BRAND["name"], size=72, bold=True)
    native = BRAND["nativeName"][0].upper() + BRAND["nativeName"][1:]
    T.eyebrow(s, f"{native} · {BRAND['meaning']}", top=Inches(2.35))
    T.text(s, MARGIN, Inches(2.8), Inches(10.6), Inches(1.2), BRAND["tagline"], size=26, color="muted", line=1.15)
    course = f"{COURSE[0]} · {COURSE[1]} · Assignment #2 · Computer Vision · 12 November 2026"
    T.text(s, MARGIN, Inches(4.15), Inches(11.9), Inches(0.4), course, size=16, color="subtle", font=MONO)
    col_w = Inches(3.95)
    for i, (name, role) in enumerate(TEAM):
        x = MARGIN + (i % 3) * col_w
        y = Inches(4.75) + (i // 3) * Inches(0.82)
        rich(s, x, y, col_w - Inches(0.2), Inches(0.78),
             [[(name, {"bold": True, "size": 19})], [(role, {"size": 16, "color": "muted"})]], line=1.0)
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
    R.gap("one sourced statistic on road damage, with unit, year, country and source", "R-2, #84, Roma",
          "No sentence: say no number; the slide works without it.")
    cw, ch, top = Inches(5.8), Inches(2.5), Inches(2.0)
    cards = [("Roads", "Inspection is done by eye, so potholes are found late."),
             ("Restrooms", "We found no place where confusing door signs are reported.")]
    for i, (module, line1) in enumerate(cards):
        x = MARGIN + i * (cw + Inches(0.3))
        card(s, x, top, cw, ch)
        T.text(s, x + Inches(0.35), top + Inches(0.3), cw - Inches(0.7), Inches(0.5), module, size=26, bold=True)
        T.text(s, x + Inches(0.35), top + Inches(1.0), cw - Inches(0.7), Inches(1.3), line1, size=22, color="muted", line=1.15)
    bottom = "Qarau: a photo goes in, a model finds what matters, and rules a person can read decide what happens next."
    T.text(s, MARGIN, Inches(5.0), CONTENT_W, Inches(1.0), bottom, size=22, line=1.15)
    numbered_footer(s, "02")
    script = ("Today, roads and public buildings are inspected by eye, so potholes are found late. "
              "Confusing restroom signs are worse off: we found no place where they are reported at all. "
              "We wanted one tool for both. A photo goes in, a model finds what matters, and rules that a person can "
              "read decide what happens next. Tair will show it live.")
    return SlideDoc("2", "Problem", "Roma", "0:35", words_title,
                    [f"{m}: {l}" for m, l in cards] + [bottom],
                    "Two cards, no image", script,
                    cues="When R-2 lands: one more line in the Roads card with the number, its unit, year and country, "
                         "a small source line under it, and one sentence in the script. Its quote, publisher, year, URL "
                         "and access date go to docs/research/deck-sources.md, section 'Slide 2'.")


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
        y = Inches(3.15) + i * Inches(1.15)
        T.text(s, MARGIN, y, Inches(1.0), Inches(0.6), num, size=30, color="brand", font=MONO)
        T.text(s, MARGIN + Inches(1.1), y - Inches(0.02), Inches(4), Inches(0.5), module, size=26, color="inverse_fg", bold=True)
        T.text(s, MARGIN + Inches(1.1), y + Inches(0.47), Inches(10.6), Inches(0.5), line, size=19, color="inverse_muted")
    real = ("Real, on this laptop: both analyses and the model page. "
            "Demo data: the overview tiles and charts, marked with a badge.")
    T.text(s, MARGIN, Inches(5.65), Inches(11.9), Inches(0.9), real, size=19, color="inverse_fg", line=1.15)
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
    top, bh = Inches(1.95), Inches(3.05)
    ws = [Inches(1.75), Inches(3.05), Inches(1.95), Inches(2.85)]
    gap_w = (CONTENT_W - sum(ws)) // 3
    xs = [MARGIN]
    for w in ws[:-1]:
        xs.append(xs[-1] + w + gap_w)
    pad = Inches(0.2)
    card(s, xs[0], top, ws[0], bh)
    rich(s, xs[0] + pad, top + pad, ws[0] - 2 * pad, bh - 2 * pad,
         [[("Browser", {"bold": True, "size": 21})], {"runs": [("shows the result", {"color": "muted"})], "space_before": 6}],
         size=16)
    card(s, xs[1], top, ws[1], bh, line="accent", line_w=2.25)
    rich(s, xs[1] + pad, top + pad, ws[1] - 2 * pad, bh - 2 * pad,
         [[("Next.js server", {"bold": True, "size": 21})],
          {"runs": [("The rules run here", {"bold": True, "color": "accent_ink"})], "space_before": 10},
          {"runs": [("R1–R6 roads", {})], "space_before": 6},
          {"runs": [("S2 and S3 restrooms", {})], "space_before": 2},
          {"runs": [("same rules for every provider", {"color": "muted"})], "space_before": 8}], size=16)
    ph = (bh - Inches(0.2)) // 3
    providers = [("mock", "demo data"), ("local", "this laptop"), ("cloud", "opt-in, not used")]
    for i, (name, line) in enumerate(providers):
        y = top + i * (ph + Inches(0.1))
        card(s, xs[2], y, ws[2], ph, fill="surface2" if name != "local" else "surface",
             line="accent" if name == "local" else "border", line_w=2.25 if name == "local" else 1.0)
        rich(s, xs[2] + Inches(0.15), y, ws[2] - Inches(0.25), ph,
             [[(name, {"bold": True, "font": MONO, "size": 16})], [(line, {"size": 15, "color": "muted"})]],
             anchor=MSO_ANCHOR.MIDDLE, line=1.0)
    card(s, xs[3], top, ws[3], bh)
    rich(s, xs[3] + pad, top + pad, ws[3] - 2 * pad, bh - 2 * pad,
         [[("FastAPI service", {"bold": True, "size": 21})],
          {"runs": [("/predict", {"font": MONO, "size": 15, "bold": True})], "space_before": 10},
          {"runs": [("YOLO finds potholes", {"color": "muted"})], "space_before": 0},
          {"runs": [("/restroom", {"font": MONO, "size": 15, "bold": True})], "space_before": 10},
          {"runs": [("CLIP reads the signs", {"color": "muted"})], "space_before": 0}], size=16)
    ya, yb = top + Inches(1.05), top + Inches(1.95)
    lab = dict(size=15, color="subtle", align=PP_ALIGN.CENTER, line=1.0)
    for i, (fwd, back) in enumerate([("photo", "result"), ("photo", "JSON"), ("photo", "JSON")]):
        x1, x2 = xs[i] + ws[i] + Inches(0.06), xs[i + 1] - Inches(0.06)
        arrow(s, x1, ya, x2, ya)
        arrow(s, x2, yb, x1, yb, color="accent_ink")
        T.text(s, x1 - Inches(0.1), ya - Inches(0.45), x2 - x1 + Inches(0.2), Inches(0.4), fwd, anchor=MSO_ANCHOR.BOTTOM, **lab)
        T.text(s, x1 - Inches(0.1), yb + Inches(0.08), x2 - x1 + Inches(0.2), Inches(0.4), back, **lab)
    r1 = REST["R1"]
    lat = R(d(r1["latencyMs"], 1), "ml/results/restroom/experiments.csv",
            "R1 row, latencyMs (zero-shot CLIP ViT-B/32, the model the API serves)", r1["latencyMs"])
    latency_line = (f"Restroom model (CLIP {SERVED_ARCH}) on the laptop CPU: {lat} ms per image. "
                    "Pothole latency is not measured yet.")
    T.text(s, MARGIN, Inches(5.45), CONTENT_W, Inches(0.9), latency_line, size=BODY, color="muted", line=1.15)
    numbered_footer(s, "04")
    script = ("This is the path of one photo. The browser sends it to our Next.js server, which uses the provider chosen "
              "in Settings: mock for offline demo data, local for the model on this laptop, or cloud. Local calls our "
              "FastAPI service, where YOLO finds potholes and CLIP reads restroom signs. The detections come back, and the "
              "rules run in the web server, so every provider is scored by the same rules. Cloud is opt-in, because road "
              "photos can show faces and plates. Amina will show what the roads model learned from.")
    cues = ("Providers, said aloud and not on the slide: mock is offline demo data; local is the model on this laptop, "
            "photos stay here; cloud is designed and opt-in, photos would leave the device, and it is not used in this "
            "demo because S-7 (#31) is not deployed. Routes: /api/analyze and /api/restroom on the Next.js server; "
            "/predict, /restroom/compare and /restroom/match on FastAPI. The live site qarau.vercel.app runs the mock "
            "provider for analyses: the real models run only on this laptop (web/lib/providers/env.ts reads "
            f"MODEL_API_URL on the server). The latency is the restroom model the API serves (R1's zero-shot "
            f"{SERVED_ARCH}). ml/results/latency.json (S-15, #28) does not exist yet, so no pothole latency. "
            "A drawn version of this diagram with numbered steps is docs/design/architecture-slide.svg (G-66).")
    return SlideDoc("4", "How it works", "Alizhan", "0:40", title_words,
                    ["Browser (shows the result) → Next.js server (the rules run here: R1–R6 roads, S2 and S3 restrooms; "
                     "same rules for every provider) → provider: mock (demo data), local (this laptop), cloud (opt-in, "
                     "not used) → FastAPI service (/predict: YOLO finds potholes; /restroom: CLIP reads the signs)",
                     "Arrows: photo forward; JSON and the result back", latency_line],
                    "Diagram drawn with shapes: four boxes, three provider chips, labelled arrows", script, cues=cues,
                    extra_sources=["docs/ARCHITECTURE.md sections 1 and 3 ('Local and cloud modes', 'Cloud is opt-in')",
                                   "web/lib/providers/env.ts", f"api/restroom.py (ARCH default {SERVED_ARCH})"])


# 5 · Roads: data and experiment -------------------------------------------------------------

# Short labels for the run table (deck-critique 5.1). The full `changed` text from experiments.csv is on B1.
RUN_SHORT = {"baseline": "baseline (nano, pretrained)", "model width": "small model", "no transfer learning": "random weights",
             "frozen backbone": "frozen backbone", "optimizer": "AdamW", "standard augmentations off": "no augmentation",
             "input resolution": "960 px input", "architecture": "extra P2 scale", "best combination": "= E0 settings"}


def short_label(changed: str) -> str:
    for key, label in RUN_SHORT.items():
        if changed.startswith(key):
            return label
    raise SystemExit(f"No short label for run change {changed!r}: add it to RUN_SHORT")


def slide_roads_data(prs) -> SlideDoc:
    R.slide = "5"
    s = new_slide(prs)
    runs = list(POT)
    csvf = "ml/results/experiments.csv"
    one_change = [r for r in runs if not POT[r]["changed"].startswith(("baseline", "best combination"))]
    n_change = R(str(len(one_change)), csvf, f"rows whose `changed` is one change: {', '.join(one_change)}", len(one_change))
    title_words = f"Roads: a baseline and {n_change} one-change runs"
    header(s, "Roads · data and experiment", title_words)
    ic, oc, seed = MANIFEST["image_counts"], MANIFEST["object_counts"], MANIFEST["seed"]
    mf = "data/exports/potholes_yolo_v1/split_manifest.json"
    n_img = R(thousands(sum(ic.values())), mf, "image_counts, sum of train + val + test", sum(ic.values()))
    n_box = R(thousands(sum(oc.values())), mf, "object_counts, sum of train + val + test", sum(oc.values()))
    names = re.findall(r"^\s+\d+: (\w+)", read("data/exports/potholes_yolo_v1/data.yaml"), re.M)
    n_cls = R(str(len(names)), "data/exports/potholes_yolo_v1/data.yaml", "names (one entry: pothole)", len(names))
    split = " / ".join(R(str(ic[k]), mf, f"image_counts.{k}", ic[k]) for k in ("train", "val", "test"))
    seed_s = R(str(seed), mf, "seed", seed)
    lx, lw, top = MARGIN, Inches(5.35), Inches(1.95)
    card(s, lx, top, lw, Inches(3.5))
    data_paras = [
        [("Data", {"bold": True, "size": 22})],
        {"runs": [("Kaggle “Annotated Potholes Image Dataset”; ODbL and DbCL licence", {})], "bullet": True, "space_before": 8},
        {"runs": [(f"{n_img} photos, {n_box} boxes, {n_cls} class", {})], "bullet": True, "space_before": 8},
        {"runs": [(f"No duplicates found before the split; split by photo, seed {seed_s}: {split}", {})],
         "bullet": True, "space_before": 8},
    ]
    rich(s, lx + Inches(0.3), top + Inches(0.25), lw - Inches(0.55), Inches(3.4), data_paras, size=BODY, line=1.1)
    rx = MARGIN + lw + Inches(0.35)
    rw = CONTENT_W - lw - Inches(0.35)
    rows = [["Run", "What changes against E0"]] + [[r, short_label(POT[r]["changed"])] for r in runs]
    table(s, rx, top, [Inches(0.85), rw - Inches(0.85)], rows, row_h=Inches(0.35), mono_cols=(0,))
    p = E0["params"]
    fixed = [R(str(p["epochs"]), "ml/results/runs/E0.json", "params.epochs", p["epochs"]),
             R(str(p["imgsz"]), "ml/results/runs/E0.json", "params.imgsz", p["imgsz"]),
             R(str(p["seed"]), "ml/results/runs/E0.json", "params.seed", p["seed"])]
    fixed_line = f"Every run: {fixed[0]} epochs and seed {fixed[2]}; {fixed[1]} px input unless the row says 960."
    tie = R(d(EXPORT.TIE, 2), "ml/export_results.py", "TIE (selection rule)", EXPORT.TIE)
    conf = R(d(OP["conf"], 2), "ml/results/operating_point.json", "conf", OP["conf"])
    rule_line = f"Chosen on validation mAP50; ties within {tie} go to validation recall at {conf}; test read once."
    rich(s, MARGIN, Inches(5.6), CONTENT_W, Inches(1.25),
         [[(rule_line, {"bold": True})], {"runs": [(fixed_line, {"color": "muted"})], "space_before": 4}], size=BODY, line=1.08)
    numbered_footer(s, "05")
    script = (f"Our road data is the Annotated Potholes Image Dataset from Kaggle, under ODbL and DbCL, and Kaggle is "
              f"a source the syllabus allows. It has {n_img} photos with {n_box} boxes and one class. Before splitting, we "
              f"checked for exact and near-duplicate photos, because a copy in both train and test would inflate the test "
              f"score. We found none. Then we split by photo with seed {seed_s}: {ic['train']} for training, {ic['val']} "
              f"for validation and {ic['test']} for test. This is Option A. Data, seed and budget stay fixed, and each run "
              f"changes one thing against the baseline E0, such as model width, pretraining or the optimizer. We choose on "
              f"validation mAP50, and recall at our threshold of {conf} breaks ties. Test is read once. "
              f"Here is what came out.")
    cues = (f"Not on the slide, for questions: author Atikur Rahman Chitholian; version {MANIFEST['version']}; boxes per "
            f"split {thousands(oc['train'])} / {oc['val']} / {oc['test']}; batch {p['batch']}, {p['optimizer']} with lr "
            f"{p['lr0']}, COCO-pretrained (runs/E0.json). The duplicate check is exact and perceptual hash (data/README.md, "
            "D-4). Do not say '70/15/15 stratified': the split is random by photo with seed 42; with one class nothing is "
            "stratified. Do not name Roboflow as the source: the frozen version is the Colab export "
            "(docs/decisions/0002-colab-export-dataset.md). Three photos carry stock watermarks and are never shown "
            "(D-12). E8 is E0's settings: no change beat E0 by more than 0.01 on validation, and E8 reproduced E0 exactly "
            "(docs/ML-EXPERIMENT.md, 'E8 as applied'). The full `changed` text of each run is on backup B1.")
    R(thousands(oc["train"]), mf, "object_counts.train", oc["train"])
    R(str(oc["val"]), mf, "object_counts.val", oc["val"])
    R(str(oc["test"]), mf, "object_counts.test", oc["test"])
    R(str(p["batch"]), "ml/results/runs/E0.json", "params.batch", p["batch"])
    R(str(p["lr0"]), "ml/results/runs/E0.json", "params.lr0", p["lr0"])
    return SlideDoc("5", "Roads: data and experiment", "Amina", "1:00", title_words,
                    ["Data: Kaggle “Annotated Potholes Image Dataset”; ODbL and DbCL licence",
                     f"{n_img} photos, {n_box} boxes, {n_cls} class",
                     f"No duplicates found before the split; split by photo, seed {seed_s}: {split}",
                     "Table: " + "; ".join(f"{r} {short_label(POT[r]['changed'])}" for r in runs), rule_line, fixed_line],
                    "Run table with short labels (full `changed` text on B1), no image", script, cues=cues,
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
    if score != 15 or severity[0] != "critical":
        raise SystemExit("Worked example A no longer gives 15, critical: update docs/RULES.md and the deck together")
    return dict(small=small, medium=medium, large=large, lane=lane, highway=highway, min_count=min_count,
                points=small_pts + other, score=score, severity=severity[0], sla=severity[2])


def g(x: float) -> str:
    return f"{x:g}"


def champion_run() -> str:
    champion = EXPORT.pick_champion([{**r, "valMap50": float(r["valMap50"]),
                                      "valRecallAtRulesConf": float(r["valRecallAtRulesConf"])} for r in POT.values()])
    if champion != WEB_POT["champion"] or champion != OP["run"]:
        raise SystemExit(f"Champion mismatch: rule {champion}, web {WEB_POT['champion']}, operating point {OP['run']}")
    return champion


def runs_chart(w_in: float, h_in: float, champion: str):
    """Test mAP50 and test recall at 0.40 per run, the champion highlighted (replaces fig_runs_map50_recall.png)."""
    fig, ax = new_chart(w_in, h_in)
    runs = list(POT)
    x = list(range(len(runs)))
    bw = 0.4
    m = [float(POT[r]["map50"]) for r in runs]
    rc = [float(POT[r]["recallAtRulesConf"]) for r in runs]
    ax.bar([i - bw / 2 for i in x], m, bw, color=[HIGHLIGHT if r == champion else SERIES[0] for r in runs])
    ax.bar([i + bw / 2 for i in x], rc, bw, color=SERIES[2])
    ax.set_xticks(x, runs)
    for lbl in ax.get_xticklabels():
        if lbl.get_text() == champion:
            lbl.set_fontweight("bold")
            lbl.set_color(TOK["fg"])
    ax.set_ylim(0, 1.3)
    ax.set_yticks([0, 0.5, 1.0], ["0", "0.5", "1"])
    from matplotlib.patches import Patch
    ax.legend(handles=[Patch(color=SERIES[0], label="mAP50"), Patch(color=HIGHLIGHT, label=f"{champion}, chosen"),
                       Patch(color=SERIES[2], label="recall at 0.40")],
              loc="upper left", ncol=3, handlelength=1.0, columnspacing=1.0, borderaxespad=0.1)
    best = max(POT, key=lambda r: float(POT[r]["map50"]))
    chart_title(fig, f"On test, {champion} is close to the best run, {best}")
    source_line(fig, "Source: ml/results/experiments.csv; recall: Ultralytics' pass")
    return fig


def slide_roads_results(prs) -> SlideDoc:
    R.slide = "6"
    s = new_slide(prs)
    csvf = "ml/results/experiments.csv"
    champion = champion_run()
    tp = R(str(OP["tp"]), "ml/results/operating_point.json", "tp", OP["tp"])
    boxes = R(str(OP["testBoxes"]), "ml/results/operating_point.json", "testBoxes", OP["testBoxes"])
    title_words = f"Roads: {champion} is chosen on validation and finds {tp} of {boxes} test potholes"
    header(s, "Roads · results", title_words, size=28)
    top = Inches(1.95)
    rows = [["Run", "Val mAP50", "Test mAP50"]]
    for r in POT:
        rows.append([r + (" chosen" if r == champion else ""),
                     R(d(POT[r]["valMap50"], 4), csvf, f"{r} row, valMap50", POT[r]["valMap50"]),
                     R(d(POT[r]["map50"], 4), csvf, f"{r} row, map50 (test)", POT[r]["map50"])])
    lw = Inches(5.2)
    table(s, MARGIN, top, [Inches(1.6), Inches(1.8), Inches(1.8)], rows, row_h=Inches(0.33), head_size=14,
          highlight=(list(POT).index(champion) + 1,), right_cols=(1, 2), mono_cols=(0, 1, 2))
    rx = MARGIN + lw + Inches(0.3)
    cw_in, ch_in = round((CONTENT_W - lw - Inches(0.3)) / 914400, 2), 3.3
    place_chart(s, runs_chart(cw_in, ch_in, champion), rx, top, Inches(cw_in), Inches(ch_in))
    prec = R(d(OP["precision"]), "ml/results/operating_point.json", "precision", OP["precision"])
    rec = R(d(OP["recall"]), "ml/results/operating_point.json", "recall", OP["recall"])
    fp = R(str(OP["fp"]), "ml/results/operating_point.json", "fp", OP["fp"])
    flagged = R(str(OP["tp"] + OP["fp"]), "ml/results/operating_point.json", "tp + fp", OP["tp"] + OP["fp"])
    conf = R(d(OP["conf"], 2), "ml/results/operating_point.json", "conf", OP["conf"])
    op_line = f"{champion} at {conf}: recall {rec} ({tp} of {boxes}), precision {prec} ({tp} of {flagged}), {fp} false alarms."
    e4_gap = Decimal(POT["E4"]["map50"]) - Decimal(POT[champion]["map50"])
    gap_s = R(d(e4_gap), csvf, f"E4 map50 − {champion} map50 = {POT['E4']['map50']} − {POT[champion]['map50']}", e4_gap)
    no_claim = R("0.02", "docs/ML-EXPERIMENT.md", "'Selection rule': differences below 0.02 on test are not claimed",
                 grab(r"Differences below ([\d.]+) on the test split are not claimed", "docs/ML-EXPERIMENT.md").group(1))
    honesty = f"E4 is {gap_s} higher on test: below {no_claim}, so not claimed. Test never chooses."
    ex = worked_example()
    cfg = "web/lib/rules/config.ts"
    score = R(g(ex["score"]), cfg, "worked example A, computed: (4 × 1.5 + 2 × 1.5 + 1) × r5.highway", ex["score"])
    sla = R(ex["sla"], cfg, f"SEVERITY_BANDS.{ex['severity']}.slaHours", ex["sla"])
    rules_line = f"Rules example (backup B4): a highway photo with three potholes scores {score} → {ex['severity']}, repair within {sla} h."
    rich(s, MARGIN, Inches(5.38), CONTENT_W, Inches(1.5),
         [[(op_line, {"bold": True})], {"runs": [(honesty, {})], "space_before": 4},
          {"runs": [(rules_line, {"color": "muted"})], "space_before": 4}], size=BODY, line=1.05)
    numbered_footer(s, "06")
    best = max(POT, key=lambda r: float(POT[r]["valMap50"]))
    best_val = R(d(POT[best]["valMap50"]), csvf, f"{best} row, valMap50 (highest)", POT[best]["valMap50"])
    tied = [r for r in POT if r != best and float(POT[best]["valMap50"]) - float(POT[r]["valMap50"]) <= EXPORT.TIE]
    n_tied = R(str(len(tied)), csvf, f"other runs within {EXPORT.TIE} of the best valMap50: {', '.join(tied)}", len(tied))
    ch_rec = R(d(POT[champion]["valRecallAtRulesConf"]), csvf, f"{champion} row, valRecallAtRulesConf",
               POT[champion]["valRecallAtRulesConf"])
    number_words = {3: "Three", 4: "Four", 5: "Five", 6: "Six"}
    script = (f"{best} has the highest validation mAP50, {best_val}. {number_words.get(len(tied), n_tied)} other runs are "
              f"within {tie_s()} of it, so the tie-break decides: {champion}, the small model, has the highest validation "
              f"recall at {conf}, {ch_rec}. On test, at the app's threshold, {champion} finds {tp} of {boxes} potholes, "
              f"recall {rec}, with {fp} false alarms. E4 is {gap_s} higher on test mAP50, but we do not claim differences "
              f"below {no_claim}, and test never chooses. The rules then turn boxes into a priority: in our example, a "
              f"highway photo scores {score}, critical. Nazar takes the second module.")
    cues = ("The chart shows test values; the table's validation column is what chose the model. The chart's recall is "
            "Ultralytics' pass (IoU 0.45); the line under the table is ml/operating_point.py (IoU 0.5), the number for "
            "the slides. Both round to 0.75. The size bands and the full worked example are on backup B4 "
            "(RULES.md part 1, example A, recomputed from web/lib/rules/config.ts; web/lib/rules/engine.test.ts checks the "
            "same result). Check it once on /app/roads/rules with the same inputs before the talk.")
    return SlideDoc("6", "Roads: results", "Amina", "0:45", title_words,
                    ["Table: " + "; ".join(f"{r[0]} validation {r[1]}, test {r[2]}" for r in rows[1:]),
                     op_line, honesty, rules_line],
                    "Chart drawn by make_deck.py from ml/results/experiments.csv at its placed size: test mAP50 and "
                    "recall at 0.40 per run, champion in the accent colour", script, cues=cues,
                    extra_sources=["ml/export_results.py (pick_champion: the selection rule, applied at build time)",
                                   "docs/RULES.md (part 1, worked example A)"])


def tie_s() -> str:
    return R(d(EXPORT.TIE, 2), "ml/export_results.py", "TIE (selection rule)", EXPORT.TIE)


# 7 · Restrooms: data and experiment ---------------------------------------------------------

def probe_chart(w_in: float, h_in: float):
    """Frozen CLIP ViT-B/32, read out after each block and after the projection (replaces layer_probe.png)."""
    fig, (a1, a2) = new_chart(w_in, h_in, ncols=2)
    clip = PROBE["results"]["clip"]
    blocks = sorted((int(k) for k in clip if k.isdigit()))
    out_x = blocks[-1] + 1.4
    for ax, key, sub in ((a1, "pair_top1", "Finding the other door"), (a2, "gender_acc_cv", "Gender of one sign")):
        ys = [clip[str(b)][key] for b in blocks]
        ax.plot(blocks, ys, color=SERIES[0], linewidth=2.5, marker="o", markersize=5)
        ax.plot([blocks[-1], out_x], [ys[-1], clip["final"][key]], color=SERIES[0], linewidth=1.5, linestyle=":")
        ax.plot([out_x], [clip["final"][key]], marker="s", markersize=7, color=SERIES[0])
        ax.set_xticks([1, 4, 7, 10, 12, out_x], ["1", "4", "7", "10", "12", "out"])
        ax.set_xlim(0.4, out_x + 0.6)
        ax.set_ylim(0, 1.05)
        ax.set_yticks([0, 0.5, 1.0], ["0", "0.5", "1"])
        ax.set_title(sub, fontsize=15)
        ax.set_xlabel("block of 12, then the output embedding")
    pair = [clip[str(b)]["pair_top1"] for b in blocks]
    peak = max(pair)
    for b in blocks:
        if clip[str(b)]["pair_top1"] == peak:
            a1.plot([b], [peak], marker="o", markersize=9, color=HIGHLIGHT)
    a1.annotate(label(peak, 2), (blocks[pair.index(peak)], peak), xytext=(0, -26), textcoords="offset points", ha="center",
                color=TOK["fg"], fontsize=14, fontweight="bold")
    a1.annotate(label(clip["final"]["pair_top1"], 2), (out_x, clip["final"]["pair_top1"]), xytext=(0, -26),
                textcoords="offset points", ha="center", color=TOK["fg"], fontsize=14)
    last = clip[str(blocks[-1])]["gender_acc_cv"]
    a2.plot([blocks[-1]], [last], marker="o", markersize=9, color=HIGHLIGHT)
    a2.annotate(label(last, 2), (blocks[-1], last), xytext=(-8, 8), textcoords="offset points", ha="right",
                color=TOK["fg"], fontsize=14, fontweight="bold")
    a2.axhline(0.5, color=TOK["subtle"], linewidth=1, linestyle="--")
    a2.text(1, 0.44, "chance", color=TOK["subtle"], fontsize=14, va="top")
    chart_title(fig, "Frozen CLIP ViT-B/32: the middle blocks find the partner; gender rises only at the end")
    source_line(fig, "Source: ml/results/restroom/layer_probe.json (82 training restrooms, no training)")
    return fig


def slide_restroom_data(prs) -> SlideDoc:
    R.slide = "7"
    s = new_slide(prs)
    title_words = "Restrooms: find the other door"
    header(s, "Restrooms · data and experiment", title_words)
    card_f = "data/README.md"
    n_rest = R(RESTROOM_CARD["train"][0], card_f, "restroom card, 'Training set' (restrooms)", RESTROOM_CARD["train"][0])
    vq = R(RESTROOM_CARD["val"][0], card_f, "restroom card, 'Validation set' (queries)", RESTROOM_CARD["val"][0])
    tq = R(RESTROOM_CARD["test"][0], card_f, "restroom card, 'Test set' (queries)", RESTROOM_CARD["test"][0])
    rcsv = "ml/results/restroom/experiments.csv"
    nb = {}
    for run in ("R2", "R3", "R4"):
        k = re.search(r"last (\d+) blocks?", REST[run]["changed"]).group(1)
        nb[run] = R(k, rcsv, f"{run} row, `changed` (blocks fine-tuned)", k)
    task = "IOAI 2025: given a cropped door sign, find the sign of the opposite gender from the same restroom."
    data = f"{n_rest} training restrooms; {vq} validation and {tq} test queries; licence CC-BY-4.0."
    rich(s, MARGIN, Inches(1.65), CONTENT_W, Inches(1.2),
         [[(task, {"bold": True})], {"runs": [(data, {"color": "muted"})], "space_before": 4}], size=BODY, line=1.08)
    groups = [("1", "Zero-shot CLIP (R0, R1)"), ("2", f"Fine-tune the last {nb['R2']}, {nb['R3']} or {nb['R4']} blocks (R2–R4)"),
              ("3", "Two-step pipeline, no training (R7)")]
    gw = (CONTENT_W - Inches(0.5)) // 3
    for i, (n, label) in enumerate(groups):
        x = MARGIN + i * (gw + Inches(0.25))
        card(s, x, Inches(2.75), gw, Inches(0.85), fill="surface")
        rich(s, x + Inches(0.15), Inches(2.75), gw - Inches(0.25), Inches(0.85),
             [[(n + "  ", {"bold": True, "color": "accent_ink", "font": MONO}), (label, {"bold": True})]],
             size=17, anchor=MSO_ANCHOR.MIDDLE, line=1.0)
    place_chart(s, probe_chart(11.93, 3.1), MARGIN, Inches(3.8), Inches(11.93), Inches(3.1))
    clip = PROBE["results"]["clip"]
    blocks = {k: v for k, v in clip.items() if k.isdigit()}
    peak = max(v["pair_top1"] for v in blocks.values())
    at = [k for k, v in blocks.items() if v["pair_top1"] == peak]
    pf = "ml/results/restroom/layer_probe.json"
    peak_s = R(d(peak, 2), pf, f"results.clip[{', '.join(at)}].pair_top1 (highest)", peak)
    final_s = R(d(clip["final"]["pair_top1"], 2), pf, "results.clip.final.pair_top1", clip["final"]["pair_top1"])
    gender_s = R(d(clip["12"]["gender_acc_cv"], 2), pf, "results.clip.12.gender_acc_cv", clip["12"]["gender_acc_cv"])
    ep = re.match(r"(\d+) episodes of (\d+)", PIPE["protocol"]["train_episodes"])
    n_ep = R(ep.group(1), "ml/results/restroom/pipeline.json", "protocol.train_episodes", ep.group(1))
    at_words = ", ".join(at[:-1]) + " and " + at[-1] if len(at) > 1 else at[0]
    numbered_footer(s, "07")
    script = (f"The restroom task comes from the IOAI 2025 olympiad. Given a cropped door sign, the model must find the "
              f"other door of the same restroom, the opposite gender, in a gallery. The data is small: {n_rest} training "
              f"restrooms, {vq} validation and {tq} test queries. We ran three groups. Zero-shot CLIP, which is IOAI's "
              f"baseline. Our Option A change: fine-tuning the last one, three or six transformer blocks. And a two-step "
              f"pipeline with no training. The figure shows why depth matters: the middle blocks find the partner best, "
              f"and gender rises only at the end. Here is what came out.")
    cues = (f"Figure values (layer_probe.json): partner found {peak_s} at blocks {at_words}, {final_s} at the output "
            f"embedding; gender rises to {gender_s} only in the last block. The pipeline: SIFT and a pixel check find the "
            f"crop's original, colour histogram and CLIP find its partner; chosen on {n_ep} training episodes "
            "(pipeline.json). R2–R4 use fine-tuned CLIP in both steps; the pipeline (R7) uses SIFT in step 1 and trains "
            "nothing. Do not call both 'two-step' without saying which. ResNet50, also in the probe file, is left off the "
            "figure: the slide is about CLIP.")
    return SlideDoc("7", "Restrooms: data and experiment", "Nazar", "0:50", title_words,
                    [task, data] + [f"{n}. {l}" for n, l in groups],
                    "Chart drawn by make_deck.py from ml/results/restroom/layer_probe.json at its placed size (CLIP only, "
                    "blocks 1–12 and the output embedding)", script, cues=cues,
                    extra_sources=["docs/ML-EXPERIMENT-RESTROOM.md ('Task and data', 'Runs')"])


# 8 · Restrooms: results ---------------------------------------------------------------------

def frac(run: str, split: str) -> str:
    k = f"{split}_correct"
    return R(REST_RUN[run]["metrics"][k], f"ml/results/restroom/runs/{run}.json", f"metrics.{k}", REST_RUN[run]["metrics"][k])


def restroom_chart(w_in: float, h_in: float, rows: list[tuple[str, float, float, str]], base: float, best_ioai: float,
                   headline: str):
    fig, ax = new_chart(w_in, h_in)
    x = list(range(len(rows)))
    bw = 0.38
    ax.bar([i - bw / 2 for i in x], [r[1] for r in rows], bw, color=SERIES[0], label="validation")
    ax.bar([i + bw / 2 for i in x], [r[2] for r in rows], bw, color=SERIES[2], label="test")
    ax.axhline(best_ioai, color=TOK["fg"], linewidth=1.4, linestyle="--", label="IOAI published best")
    ax.axhline(base, color=TOK["fg"], linewidth=1.4, linestyle=":", label="IOAI published baseline")
    ax.set_xticks(x, [r[0] for r in rows])
    ax.set_ylim(0, 1.5)
    ax.set_yticks([0, 0.5, 1.0], ["0", "0.5", "1"])
    handles, labels = ax.get_legend_handles_labels()
    order = [2, 3, 0, 1]  # validation, test, then the two IOAI lines
    ax.legend([handles[i] for i in order], [labels[i] for i in order], loc="upper left", ncol=2,
              handlelength=1.6, columnspacing=1.0, borderaxespad=0.1)
    chart_title(fig, headline)
    source_line(fig, "Source: restroom/experiments.csv, pipeline.json")
    return fig


def slide_restroom_results(prs) -> SlideDoc:
    R.slide = "8"
    s = new_slide(prs)
    rcsv, pj, wr = "ml/results/restroom/experiments.csv", "ml/results/restroom/pipeline.json", "web/data/restroom-experiments.json"
    champ = WEB_REST["champion"]
    if champ != "R3":
        raise SystemExit(f"Restroom run champion is now {champ}: update the row labels and script of slide 8")
    best = PIPE["champion"]
    nv, nt = len(PIPE["predictions"]["val"][best]), len(PIPE["predictions"]["test"][best])
    pv = R(f"{round(PIPE['val'][best] * nv)}/{nv}", pj, f"val.{best} × {nv} queries", f"{round(PIPE['val'][best] * nv)}/{nv}")
    pt = R(f"{round(PIPE['test'][best] * nt)}/{nt}", pj, f"test.{best} × {nt} queries", f"{round(PIPE['test'][best] * nt)}/{nt}")
    r0t, r3t, r4t = frac("R0", "test"), frac(champ, "test"), frac("R4", "test")
    nt_s = R(str(nt), pj, f"length of predictions.test.{best}", nt)
    title_words = (f"Restrooms, {nt_s} test queries: zero-shot {r0t.split('/')[0]}, fine-tuned {r3t.split('/')[0]} ({champ}) "
                   f"to {r4t.split('/')[0]} (R4), pipeline {pt.split('/')[0]}")
    header(s, "Restrooms · results", title_words, size=28)
    ref = WEB_REST["reference"]
    base = R(d(ref["ioaiBaseline"], 2), wr, "reference.ioaiBaseline (IOAI published)", ref["ioaiBaseline"])
    best_ioai = R(d(ref["ioaiBest"], 2), wr, "reference.ioaiBest (IOAI published)", ref["ioaiBest"])
    rows = [["Method", "Val", "Test"]]
    chart_rows = []
    for run, label, short in (("R0", "R0 zero-shot CLIP", "R0"), (champ, f"{champ} fine-tune 3 blocks", champ),
                              ("R4", "R4 fine-tune 6 blocks", "R4")):
        dec = R(d(REST[run]["matchTop1Test"]), rcsv, f"{run} row, matchTop1Test", REST[run]["matchTop1Test"])
        val = frac(run, "val")
        test = frac(run, "test")
        rows.append([label, val, f"{test} ({dec})"])
        chart_rows.append((short, float(REST[run]["matchTop1Val"]), float(REST[run]["matchTop1Test"]), test))
    pdec = R(d(PIPE["test"][best]), pj, f"test.{best}", PIPE["test"][best])
    rows.append(["R7 two-step pipeline", pv, f"{pt} ({pdec})"])
    chart_rows.append(("R7", PIPE["val"][best], PIPE["test"][best], pt))
    rows.append(["IOAI published baseline", "", base])
    rows.append(["IOAI published best", "", best_ioai])
    top = Inches(1.95)
    lw = Inches(6.55)
    table(s, MARGIN, top, [Inches(3.35), Inches(1.0), Inches(2.2)], rows, row_h=Inches(0.42), head_size=14,
          highlight=(2, 4), right_cols=(1, 2), mono_cols=(1, 2))
    rx = MARGIN + lw + Inches(0.3)
    cw_in = round((CONTENT_W - lw - Inches(0.3)) / 914400, 2)
    full = [r[0] for r in chart_rows if r[3] == f"{nt}/{nt}"]
    headline = (" and ".join(full) + f" get all {nt} test queries") if full else "Top-1 matching accuracy"
    place_chart(s, restroom_chart(cw_in, 2.95, chart_rows, float(ref["ioaiBaseline"]), float(ref["ioaiBest"]), headline),
                rx, top, Inches(cw_in), Inches(2.95))
    one_q = R(d(1 / nt), pj, f"computed: 1 / {nt} test queries (length of predictions.test.{best})", 1 / nt)
    g1 = REST_RUN["R1"]["gender"]
    gz = R(d(g1["zero_shot_prompts"]["accuracy"]), "ml/results/restroom/runs/R1.json", "gender.zero_shot_prompts.accuracy",
           g1["zero_shot_prompts"]["accuracy"])
    gp = R(d(g1["probe_lr"]["accuracy"]), "ml/results/restroom/runs/R1.json", "gender.probe_lr.accuracy", g1["probe_lr"]["accuracy"])
    gender_line = f"Gender of one sign, {SERVED_ARCH} (served): prompts {gz}, probe {gp}."
    caveat = ("The pipeline uses two facts of this benchmark: each query is cut from a gallery original, and the gallery "
              "holds exactly the queries' partners. A real building gives neither.")
    # C-20: exact intervals and paired tests; C-21: the pipeline one query at a time (what the API serves)
    ij, qj = "ml/results/restroom/intervals.json", "ml/results/restroom/pipeline_per_query.json"
    iv, pq_file = read_json(ij), read_json(qj)
    ci_p, ci_r = iv["scores"][f"pipeline:{best}"]["test"]["ci95"], iv["scores"][champ]["test"]["ci95"]
    lo_p = R(d(ci_p[0]), ij, f"scores.pipeline:{best}.test.ci95 (low)", ci_p[0])
    hi_p = R(d(ci_p[1]), ij, f"scores.pipeline:{best}.test.ci95 (high)", ci_p[1])
    lo_r = R(d(ci_r[0]), ij, f"scores.{champ}.test.ci95 (low)", ci_r[0])
    hi_r = R(d(ci_r[1]), ij, f"scores.{champ}.test.ci95 (high)", ci_r[1])
    paired = {(p["first"], p["second"]): p["p_exact_mcnemar"] for p in iv["paired_test"]}
    p_r0 = R(d(paired[(f"pipeline:{best}", "R0")]), ij, f"paired_test pipeline:{best} vs R0, p_exact_mcnemar",
             paired[(f"pipeline:{best}", "R0")])
    p_r3 = R(d(paired[(f"pipeline:{best}", champ)], 2), ij, f"paired_test pipeline:{best} vs {champ}, p_exact_mcnemar",
             paired[(f"pipeline:{best}", champ)])
    served = pq_file["served"]
    pq = R(pq_file["test_correct"][served], qj, f"test_correct.{served}", pq_file["test_correct"][served])
    interval_line = (f"95 % interval: {pt} → {lo_p}–{hi_p}, {r3t} → {lo_r}–{hi_r}. Pipeline against zero-shot CLIP "
                     f"p = {p_r0}; against {champ} p = {p_r3}, not separable. One query at a time, as the app answers: {pq}.")
    rich(s, MARGIN, Inches(4.95), CONTENT_W, Inches(1.95),
         [[(f"One test query is worth {one_q}. ", {"bold": True}), (gender_line, {})],
          {"runs": [(interval_line, {})], "space_before": 4},
          {"runs": [(caveat, {"color": "muted"})], "space_before": 4}], size=BODY, line=1.05)
    numbered_footer(s, "08")
    r0n, r3n = r0t.split("/")[0], r3t.split("/")[0]
    script = (f"Zero-shot CLIP matches {r0n} of {nt} test queries, the same as IOAI's published baseline of {base}. "
              f"Fine-tuning the last three blocks, run {champ}, gives {r3n}; {champ} is the run our rule picks on "
              f"validation. The two-step pipeline gets all {pt.split('/')[0]}, also one query at a time, as the app will "
              f"answer. IOAI's best, {best_ioai}, is their number, not a contest we entered. Thirty queries are few: for "
              f"{pt} the 95 % interval starts at {lo_p}. The pipeline beats zero-shot CLIP, p {p_r0}, but not provably "
              f"{champ}, p {p_r3}. It also uses two facts of this benchmark that a real building does not give. Dameli will "
              f"show how the interface makes this usable.")
    g_r1 = ("R1's zero-shot ViT-B/32, the model the API serves; R0's ViT-B/16 gives other gender numbers, see "
            "runs/R0.json")
    cues = (f"Highlighted rows: {champ}, chosen among the runs on validation (R2–R4 tie at 10/10; gender breaks the tie), "
            f"and R7, the matching method chosen on training episodes (pipeline.json `champion` = {best}). "
            "Open team decision (R-3 step 4): which one is the headline; Nazar confirms in the chat. "
            f"R4's 30/30 does not change the run choice: the rule never looks at test. Never say 'we beat the IOAI best'. "
            f"Gender numbers: {g_r1}; 5-fold cross-validation grouped by restroom. "
            f"What the app serves: `served` = {WEB_REST.get('served')} in {wr}: since C-8 Match runs the two-step "
            f"pipeline one query at a time ({served}), not the opposite-gender rule. "
            f"The interval and p values are exact (Clopper-Pearson, McNemar) from stored predictions ({ij}); p {p_r3} "
            f"means 3 queries to 0 is too few to tell R7 from {champ}. 'One query at a time' is {served} ({qj}): no "
            "assignment across queries, the variant the API serves after C-8; its test score was read once.")
    return SlideDoc("8", "Restrooms: results", "Nazar", "0:50", title_words,
                    ["Table: " + "; ".join(f"{r[0]}: validation {r[1] or '–'}, test {r[2]}" for r in rows[1:]),
                     f"One test query is worth {one_q}. {gender_line}", interval_line, caveat],
                    "Chart drawn by make_deck.py from ml/results/restroom/experiments.csv and pipeline.json at its placed "
                    "size: the four table rows, validation and test, IOAI's published lines dashed", script, cues=cues,
                    extra_sources=["ml/restroom/pipeline.py (docstring: the benchmark guarantee behind the caveat)",
                                   "docs/ML-EXPERIMENT-RESTROOM.md ('Two choices, two rules')"])


# 9 · Design ---------------------------------------------------------------------------------

SHOTS = [("09-heuristic-1-status.png", "Visibility of system status:", "provider and connection shown"),
         ("09-heuristic-2-recover.png", "Error recovery:", "the cause, and one click to Mock"),
         ("09-heuristic-3-recognition.png", "Recognition over recall:", "six labelled sample images")]


def slide_design(prs, shots_dir: Path | None) -> SlideDoc:
    R.slide = "9"
    s = new_slide(prs)
    title_words = "Designed for a road dispatcher"
    header(s, "Design · three of Nielsen's heuristics", title_words)
    fw, gap_w, top = Inches(3.8), Inches(0.265), Inches(1.75)
    fh = int(fw * 405 / 570)  # Dameli's frame, 570 × 405 px (docs/PRESENTATION.md, slide 9)
    used = []
    for i, (name, head, line) in enumerate(SHOTS):
        x = MARGIN + i * (fw + gap_w)
        path = shots_dir / name if shots_dir else None
        card(s, x, top, fw, fh)
        if path and path.exists():
            s.shapes.add_picture(png_stream(path), x + Inches(0.05), top + Inches(0.05), fw - Inches(0.1), fh - Inches(0.1))
            used.append(name)
        else:
            rich(s, x, top, fw, fh, [[("Screenshot", {"bold": True, "color": "muted"})],
                                     {"runs": [(name, {"font": MONO, "size": 14, "color": "subtle"})], "space_before": 4},
                                     {"runs": [("Drive: screenshots/", {"font": MONO, "size": 14, "color": "subtle"})]}],
                 size=BODY, anchor=MSO_ANCHOR.MIDDLE, align=PP_ALIGN.CENTER, line=1.1)
        rich(s, x, top + fh + Inches(0.12), fw, Inches(0.9), [[(head, {"bold": True})], [(line, {})]], size=BODY, line=1.05)
    light, dark = CONTRAST["light"], CONTRAST["dark"]
    lc = R(d(light[0], 2), "docs/DESIGN-BRIEF.md", f"'Contrast audit (G-3)', lowest light-theme text ratio (`{light[1]}`)", light[0])
    dc = R(d(dark[0], 2), "docs/DESIGN-BRIEF.md", f"'Contrast audit (G-3)', lowest dark-theme text ratio (`{dark[1]}`)", dark[0])
    wc = R(WCAG_MIN, "docs/DESIGN-BRIEF.md", "U4 (WCAG text contrast target)", WCAG_MIN)
    chart_line = "Charts: bars from zero; severity colours only for severity."
    a11y_line = f"Text on page and card backgrounds: at least {lc}:1 (light) and {dc}:1 (dark); WCAG asks {wc}:1."
    rich(s, MARGIN, Inches(5.65), CONTENT_W, Inches(1.2),
         [[(chart_line, {})], {"runs": [(a11y_line, {})], "space_before": 4}], size=BODY, line=1.08)
    numbered_footer(s, "09")
    script = ("I designed Qarau for a road dispatcher. Visibility of system status: the app always shows which model "
              "answers and whether it is connected. Error recovery: if the model service is down, the message says why "
              "and offers one click to the mock provider. Recognition over recall: you pick a sample instead of guessing "
              "what to upload. Charts start at zero, and every text colour passes WCAG AA in both themes. Roma now "
              "explains how we used AI.")
    cues = ("The three crops are placed in Canva from the Drive folder screenshots/ (docs/design/screenshots.md: "
            "screenshots never go into git). Course sources, not on the slide: HCI p14, p19 and p22 for the three "
            "heuristics; HCI p37 for WCAG; VizBasics p4, DMViz p28 and p31 for the charts. Also true, for questions: "
            "keyboard-only analysis with a visible focus ring; every status has a word and an icon. The contrast audit "
            "is preliminary and covers text tokens on --bg and --surface. No screenshot of a seeded dashboard without its "
            "'Demo data' badge." + ("" if len(used) == 3 else " Screenshots not embedded in this build."))
    return SlideDoc("9", "Design decisions", "Dameli", "0:35", title_words,
                    [f"Screenshot {i + 1} ({n}): {h} {l}" for i, (n, h, l) in enumerate(SHOTS)] + [chart_line, a11y_line],
                    "Three app screenshots from G-11, placed in Canva from Drive screenshots/ "
                    + ("(embedded: " + ", ".join(used) + ")" if used else "(frames only in the generated file)"),
                    script, cues=cues, extra_sources=["docs/PRESENTATION.md ('Slide 9, design decisions')"])


# 10 · AI use --------------------------------------------------------------------------------

def slide_ai(prs) -> SlideDoc:
    R.slide = "10"
    s = new_slide(prs)
    title_words = "How we used AI, and how we checked it"
    header(s, "AI use and its limits", title_words)
    n_entries = ai_log_entries()
    n_s = R(str(n_entries), "docs/AI-USAGE-LOG.md", "number of '### ' entries under 'Entries' at build time", n_entries)
    top, cw, ch = Inches(1.95), Inches(5.8), Inches(3.3)
    cols = [("Claude Code, Codex, GitHub Copilot", ["Writing and reviewing code and tests",
                                                    "Drafting documents, study cards and slide text",
                                                    "Checking text against the result files"]),
            ("How we checked", ["Unit tests and CI on every pull request",
                                "Every number traced to a committed file (docs/research/deck-sources.md)",
                                f"Each use logged with its prompt and check: {n_s} entries in docs/AI-USAGE-LOG.md"])]
    for i, (head, lines) in enumerate(cols):
        x = MARGIN + i * (cw + Inches(0.3))
        card(s, x, top, cw, ch)
        rich(s, x + Inches(0.3), top + Inches(0.25), cw - Inches(0.55), ch - Inches(0.35),
             [[(head, {"bold": True, "size": 21})]] +
             [{"runs": [(ln, {})], "bullet": True, "space_before": 9} for ln in lines], size=BODY, line=1.1)
    audit = R.gap("R-6 (#85) audit of two vision-language models: count error on screened test photos, "
                  "docs/research/vlm-evaluation.md is not on main", "R-6, #85, Roma",
                  "We planned an audit of two vision-language models; it is not finished, so we show no numbers.",
                  watch="docs/research/vlm-evaluation.md")
    numbered_footer(s, "10")
    script = (f"We used AI tools, mainly Claude Code, Codex and Copilot, to write and review code and tests, to draft "
              f"documents, and to check text against our result files. Every use is logged with its prompt: {n_s} "
              f"entries. Whoever used a tool checked its output, with tests and CI, and every number on these slides is "
              f"traced to a committed file. {audit} Next, the limits.")
    cues = ("The entry count is read when the deck is built; rebuild after the 23:00 freeze so it is final. Never quote "
            "audit numbers that are not in docs/research/vlm-evaluation.md.")
    return SlideDoc("10", "AI use and its limits", "Roma", "0:35", title_words,
                    [f"{cols[0][0]}: {'; '.join(cols[0][1])}", f"{cols[1][0]}: {'; '.join(cols[1][1])}"],
                    "Two cards, no image", script, cues=cues,
                    extra_sources=["docs/AI-USAGE-LOG.md (entries: tool, purpose, verification)"])


# 11 · Limitations ---------------------------------------------------------------------------

def slide_limits(prs) -> SlideDoc:
    R.slide = "11"
    s = new_slide(prs)
    title_words = "What our results do not show yet"
    header(s, "Limitations and next steps", title_words)
    n_rest = R(RESTROOM_CARD["train"][0], "data/README.md", "restroom card, 'Training set' (restrooms)", RESTROOM_CARD["train"][0])
    limits = [("Box area is not physical size", "A far pothole looks small. Real size needs camera calibration or depth."),
              (f"{n_rest} training restrooms, two classes", "Accessible and all-gender signs are not in the data."),
              ("No local data yet", "The road photos are not from Kazakhstan.")]
    top = Inches(1.9)
    for i, (head, line) in enumerate(limits):
        y = top + i * Inches(1.0)
        T.text(s, MARGIN, y, Inches(0.6), Inches(0.5), f"{i + 1}", size=28, color="accent_ink", font=MONO, bold=True)
        rich(s, MARGIN + Inches(0.65), y, Inches(11.2), Inches(0.95),
             [[(head, {"bold": True, "size": 22})], [(line, {"color": "muted"})]], size=BODY, line=1.1)
    nxt = ("Next: an external test set of screened local photos, accessible and all-gender signs for the restroom "
           "model, and repeat runs with other seeds.")
    card(s, MARGIN, Inches(5.0), CONTENT_W, Inches(1.15), fill="surface2", line=None)
    T.text(s, MARGIN + Inches(0.3), Inches(5.0), CONTENT_W - Inches(0.6), Inches(1.15), nxt, size=BODY,
           anchor=MSO_ANCHOR.MIDDLE, line=1.12)
    numbered_footer(s, "11")
    script = (f"Three limits. Box area is not physical size: a far pothole looks small. The restroom data has {n_rest} "
              f"training restrooms and two classes, so accessible and all-gender signs are missing. And none of our road "
              f"photos are from Kazakhstan. Next: screened local photos and the two-step pipeline in the app. Tair closes.")
    return SlideDoc("11", "Limitations and next steps", "Roma", "0:25", title_words,
                    [f"{i + 1}. {h}: {l}" for i, (h, l) in enumerate(limits)] + [nxt],
                    "Numbered list, no image", script,
                    cues="Also true, for questions: a close-up fills the frame; snow and night scenes are untested "
                         "(docs/ML-EXPERIMENT.md, 'Limits to state').",
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
    links = [("Repository", [("github.com/tairqaldy/qarau-ict-final-1st-trimester", True)]),
             ("Live site", [("qarau.vercel.app", True), ("real model page; analyses there run on demo data", False)]),
             ("Results", [(p, True) for p in results]), ("How we worked", [(p, True) for p in worked])]
    y = Inches(1.85)
    for label, values in links:
        T.text(s, MARGIN, y, Inches(2.6), Inches(0.4), label, size=20, color="muted")
        rich(s, MARGIN + Inches(2.7), y + Inches(0.02), Inches(9.2), Inches(0.36) * len(values),
             [[(v, {"font": MONO if mono else TEXT, "color": "fg" if mono else "muted"})] for v, mono in values],
             size=BODY, line=1.15)
        y += Inches(0.38) * len(values) + Inches(0.17)
    real = ("Real: both analyze flows on this laptop and the model page. "
            "Demo data: the overview tiles and charts, marked with a badge.")
    card(s, MARGIN, y + Inches(0.05), CONTENT_W, Inches(0.85), fill="accent_soft", line=None)
    T.text(s, MARGIN + Inches(0.25), y + Inches(0.05), CONTENT_W - Inches(0.5), Inches(0.85), real, size=BODY, bold=True,
           color="accent_ink", anchor=MSO_ANCHOR.MIDDLE, line=1.1)
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
    title_words = f"All {n_runs} pothole runs: the columns used in the talk"
    backup_header(s, "Roads", title_words)
    cols = [("valMap50", "Val mAP50"), ("valRecallAtRulesConf", "Val R@0.40"), ("map50", "Test mAP50"),
            ("map50_95", "Test mAP50-95"), ("precisionAtRulesConf", "Test P@0.40"), ("recallAtRulesConf", "Test R@0.40"),
            ("sizeMb", "MB")]
    rows = [["Run"] + [c[1] for c in cols]]
    champion = WEB_POT["champion"]
    for r, row in POT.items():
        cells = [r]
        for key, _ in cols:
            places = 1 if key == "sizeMb" else 4
            cells.append(R(d(row[key], places), csvf, f"{r} row, {key}", row[key]))
        rows.append(cells)
    widths = [Inches(0.9)] + [(CONTENT_W - Inches(0.9)) // len(cols)] * len(cols)
    table(s, MARGIN, Inches(1.8), widths, rows, row_h=Inches(0.4), size=14, head_size=12,
          highlight=(list(POT).index(champion) + 1,), right_cols=tuple(range(1, 1 + len(cols))),
          mono_cols=tuple(range(0, 1 + len(cols))))
    changed = "; ".join(f"{r} {POT[r]['changed']}" for r in POT)
    note = ("Precision and recall at 0.40 here are Ultralytics' own pass (IoU 0.45); the operating point on slide 6 is "
            "ml/operating_point.py (IoU 0.5). Latency: not measured yet (S-15).")
    T.text(s, MARGIN, Inches(5.95), CONTENT_W, Inches(0.7), note, size=14, color="subtle", line=1.1)
    numbered_footer(s, "B1")
    return SlideDoc("B1", "Backup: full pothole metrics table", "Amina", "on request", title_words,
                    [f"All {n_runs} runs; the columns used in the talk (not shown: precision and recall at Ultralytics' "
                     "own threshold, latency, dataset version, device)", f"What each run changes: {changed}", note],
                    "Table", "Only on request.", cues=f"What each run changes (experiments.csv `changed`): {changed}.",
                    extra_sources=["docs/ML-EXPERIMENT.md ('What to report')"])


def slide_backup_operating(prs) -> SlideDoc:
    R.slide = "B2"
    s = new_slide(prs)
    op = "ml/results/operating_point.json"
    run = OP["run"]
    title_words = f"{run} at the app's threshold, on the test split"
    backup_header(s, "Roads", title_words)
    head = ["Photos", "Potholes", "Found (TP)", "False alarms", "Missed (FN)", "Precision", "Recall", "F1"]
    vals = [R(str(OP["images"]), op, "images", OP["images"]), R(str(OP["testBoxes"]), op, "testBoxes", OP["testBoxes"]),
            R(str(OP["tp"]), op, "tp", OP["tp"]), R(str(OP["fp"]), op, "fp", OP["fp"]), R(str(OP["fn"]), op, "fn", OP["fn"]),
            R(d(OP["precision"]), op, "precision", OP["precision"]), R(d(OP["recall"]), op, "recall", OP["recall"]),
            R(d(OP["f1"]), op, "f1", OP["f1"])]
    table(s, MARGIN, Inches(1.8), [CONTENT_W // 8] * 8, [head, vals], row_h=Inches(0.45), size=16, head_size=13,
          right_cols=tuple(range(8)), mono_cols=tuple(range(8)))
    conf = R(d(OP["conf"], 2), op, "conf", OP["conf"])
    iou = R(d(OP["iou"], 1), op, "iou", OP["iou"])
    sub = (f"Confidence {conf}, IoU {iou}, each labelled box matched at most once (ml/operating_point.py). "
           f"Right: Ultralytics' precision-recall curve for the same model on test; its legend rounds mAP50 to 3 "
           f"decimals, experiments.csv has {R(POT[run]['map50'], 'ml/results/experiments.csv', f'{run} row, map50 (test)', POT[run]['map50'])}.")
    T.text(s, MARGIN, Inches(2.85), Inches(5.6), Inches(2.2), sub, size=15, color="muted", line=1.15)
    picture(s, "ml/results/fig_champion_pr_curve.png", MARGIN + Inches(5.8), Inches(2.75), CONTENT_W - Inches(5.8), Inches(4.05))
    numbered_footer(s, "B2")
    return SlideDoc("B2", "Backup: operating point", "Amina", "on request", title_words,
                    ["Table: " + ", ".join(f"{h} {v}" for h, v in zip(head, vals)), sub],
                    "ml/results/fig_champion_pr_curve.png (Ultralytics' plot, kept as is)", "Only on request.",
                    cues="The confusion-matrix figure (ml/results/fig_champion_confusion_at_040.png) counts at IoU 0.45 "
                         "and so differs slightly from this table; it is left out so the slide gives one answer.",
                    extra_sources=["docs/ML-EXPERIMENT.md ('Operating point')", "ml/README.md ('Deck plots')"])


def curves_chart(w_in: float, h_in: float):
    fig, axes = new_chart(w_in, h_in, ncols=3)
    for ax, run in zip(axes, ("E0", "E2", "E5")):
        rows = read_rows(f"ml/results/runs/{run}-results.csv")
        ep = [int(r["epoch"]) for r in rows]
        ax.plot(ep, [float(r["train/box_loss"]) for r in rows], color=SERIES[0], linewidth=2.2, label="train")
        ax.plot(ep, [float(r["val/box_loss"]) for r in rows], color=HIGHLIGHT, linewidth=2.2, label="validation")
        ax.set_title(f"{run}: {short_label(POT[run]['changed'])}", fontsize=15)
        ax.set_ylim(0, 4)
        ax.set_xlabel("epoch")
    axes[0].set_ylabel("box loss")
    axes[0].legend(loc="upper right")
    chart_title(fig, "Without augmentation (E5), training loss keeps falling and validation does not")
    source_line(fig, "Source: ml/results/runs/E0-, E2-, E5-results.csv")
    return fig


def slide_backup_curves(prs) -> SlideDoc:
    R.slide = "B3"
    s = new_slide(prs)
    title_words = "Training curves: train against validation box loss"
    backup_header(s, "Roads", title_words)
    place_chart(s, curves_chart(11.93, 4.1), MARGIN, Inches(1.8), Inches(11.93), Inches(4.1))
    line = "E2 trains from random weights, so it starts high. In E5 the validation loss stays flat: overfitting."
    T.text(s, MARGIN, Inches(6.05), CONTENT_W, Inches(0.7), line, size=16, line=1.12)
    numbered_footer(s, "B3")
    return SlideDoc("B3", "Backup: training curves", "Amina", "on request", title_words, [line],
                    "Chart drawn by make_deck.py from ml/results/runs/E0-, E2-, E5-results.csv", "Only on request.")


def slide_backup_kmeans(prs) -> SlideDoc:
    R.slide = "B4"
    s = new_slide(prs)
    title_words = "Rules: k-means size bands and one worked example"
    backup_header(s, "Roads · rules", title_words)
    kmf = "ml/results/pothole_area_clusters.json"
    picture(s, "ml/results/figs/pothole_area_clusters.png", MARGIN, Inches(1.75), Inches(6.9), Inches(3.75))
    t1, t2 = KM["area_thresholds"]
    for key, val in (("smallBelowPct", t1), ("largeFromPct", t2)):
        if abs(rule("r2", key) - val * 100) > 1e-9:
            raise SystemExit(f"web/lib/rules/config.ts r2.{key} differs from {kmf}")
    gc = KM["group_counts"]
    bands = (f"k-means (k = {R(str(KM['k']), kmf, 'k', KM['k'])}) on {R(thousands(KM['boxes']), kmf, 'boxes', KM['boxes'])} "
             f"training boxes: small below {R(d(t1 * 100, 2), kmf, 'area_thresholds[0] × 100 (% of image)', t1 * 100)} %, "
             f"large from {R(d(t2 * 100, 2), kmf, 'area_thresholds[1] × 100 (% of image)', t2 * 100)} % of the image "
             f"({R(str(gc['small']), kmf, 'group_counts.small', gc['small'])} / "
             f"{R(str(gc['medium']), kmf, 'group_counts.medium', gc['medium'])} / "
             f"{R(str(gc['large']), kmf, 'group_counts.large', gc['large'])} boxes).")
    T.text(s, MARGIN, Inches(5.65), Inches(6.9), Inches(1.2), bands + " Shares of the image, not physical size.",
           size=14, color="muted", line=1.12)
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
    example = ["Highway photo: one large and one medium box in the lane, one small box off it.",
               f"Points: {large} × {lane} + {medium} × {lane} + {small} = {pts}",
               f"No cluster bonus (needs {mc} medium or large boxes)",
               f"Highway × {hw} → {score}",
               f"Score {score} → {ex['severity']}: repair within {sla} h"]
    rx = MARGIN + Inches(7.2)
    card(s, rx, Inches(1.75), CONTENT_W - Inches(7.2), Inches(5.0))
    rich(s, rx + Inches(0.3), Inches(1.95), CONTENT_W - Inches(7.8), Inches(4.7),
         [[("Worked example (RULES.md, A)", {"bold": True, "size": 18})]] +
         [{"runs": [(ln, {"bold": i == len(example) - 1})], "space_before": 8} for i, ln in enumerate(example)],
         size=16, line=1.08)
    numbered_footer(s, "B4")
    return SlideDoc("B4", "Backup: rules, size bands and worked example", "Amina", "on request", title_words,
                    [bands] + example, "ml/results/figs/pothole_area_clusters.png (kept as is: the per-box areas it "
                    "plots are not committed, D-29)", "Only on request.",
                    extra_sources=["data/README.md ('Box-size clustering for R2')", "docs/RULES.md (part 1, example A)"])


APPROACH_NAMES = {  # short names from ml/restroom/layers_report.py (approach_ladder)
    "ioai_baseline_clip": "IOAI baseline (CLIP, 2nd most similar)",
    "clip_clip_greedy": "IOAI reference matching, zero-shot",
    "singapore_hist_top2_sift": "Colour histogram top 2 + SIFT",
    "sift_hist_greedy": "SIFT + colour histogram, greedy",
    "siftinl_clip_greedy": "SIFT inliers + CLIP, greedy",
    "sift_clip_greedy": "SIFT pixel check + CLIP, greedy",
    "sift_hist_hungarian": "SIFT + colour histogram, global",
    "sift_combo_greedy": "SIFT + histogram & CLIP, greedy",
    "sift_clip_hungarian": "SIFT + CLIP, global",
    "sift_combo_hungarian": "SIFT + histogram & CLIP, global",
}


def approaches_chart(w_in: float, h_in: float):
    fig, ax = new_chart(w_in, h_in)
    best = PIPE["champion"]
    rows = sorted(((k, PIPE["train_episodes"][k]["top1"]["mean"], PIPE["train_episodes"][k]["top1"]["std"], PIPE["test"][k])
                   for k in APPROACH_NAMES if k in PIPE["train_episodes"]), key=lambda t: t[1])
    for i, (k, m, sd, t) in enumerate(rows):
        ax.barh(i, m, height=0.62, color=HIGHLIGHT if k == best else SERIES[0])
        ax.errorbar(m, i, xerr=sd, color=TOK["muted"], capsize=3, linewidth=1)
        ax.text(m + sd + 0.015, i, f"{label(m)} · test {label(t)}", va="center", fontsize=12, color=TOK["fg"])
    ax.set_yticks(range(len(rows)), [APPROACH_NAMES[k] for k, *_ in rows], fontsize=12)
    ax.set_xlim(0, 1.3)
    ax.set_xticks([0, 0.5, 1.0], ["0", "0.5", "1"])
    ax.grid(axis="y", visible=False)
    ax.grid(axis="x", visible=True)
    ax.set_xlabel("top-1, 200 training episodes of 30 restrooms (±1 std)", fontsize=13)
    chart_title(fig, "The final pipeline is the best of ten approaches on training episodes")
    source_line(fig, "Source: ml/results/restroom/pipeline.json; test (30 queries) read once")
    return fig


def slide_backup_approaches(prs) -> SlideDoc:
    R.slide = "B5"
    s = new_slide(prs)
    title_words = "Restrooms: from the IOAI baseline to the pipeline"
    backup_header(s, "Restrooms", title_words)
    place_chart(s, approaches_chart(8.6, 5.0), MARGIN, Inches(1.75), Inches(8.6), Inches(5.0))
    best = PIPE["champion"]
    pj = "ml/results/restroom/pipeline.json"
    m = PIPE["train_episodes"][best]["top1"]
    w = R(d(PIPE["histogram_weight"], 1), pj, "histogram_weight", PIPE["histogram_weight"])
    w_clip = R(d(Decimal(1) - Decimal(str(PIPE["histogram_weight"])), 1), pj, "computed: 1 − histogram_weight",
               Decimal(1) - Decimal(str(PIPE["histogram_weight"])))
    mean = R(d(m["mean"]), pj, f"train_episodes.{best}.top1.mean", m["mean"])
    std = R(d(m["std"]), pj, f"train_episodes.{best}.top1.std", m["std"])
    lines = ["Chosen on training episodes, then validation; test read once.",
             f"Champion: SIFT + pixel check, then {w} × colour histogram + {w_clip} × CLIP (z-scored), one global assignment.",
             f"Training episodes: {mean} ± {std}."]
    rich(s, MARGIN + Inches(8.85), Inches(2.0), CONTENT_W - Inches(8.85), Inches(4.5),
         [{"runs": [(ln, {})], "space_before": 0 if i == 0 else 10} for i, ln in enumerate(lines)], size=15, line=1.12)
    numbered_footer(s, "B5")
    return SlideDoc("B5", "Backup: restroom approaches", "Nazar", "on request", title_words, lines,
                    "Chart drawn by make_deck.py from ml/results/restroom/pipeline.json", "Only on request.",
                    extra_sources=["docs/ML-EXPERIMENT-RESTROOM.md ('The final pipeline')"])


# --------------------------------------------------------------------------------------------
# Checks, build and write
# --------------------------------------------------------------------------------------------

def check_sizes(prs, main_slides: int = 12) -> None:
    """Nothing the room needs on slides 1-12 below MIN_PT; footer, slide number and eyebrow excepted."""
    bad = []
    for n, slide in enumerate(list(prs.slides)[:main_slides], start=1):
        for shape in slide.shapes:
            frames = []
            if shape.has_text_frame:
                frames.append(shape.text_frame)
            if getattr(shape, "has_table", False) and shape.has_table:
                frames += [c.text_frame for row in shape.table.rows for c in row.cells]
            for tf in frames:
                for p in tf.paragraphs:
                    for r in p.runs:
                        size = r.font.size.pt if r.font.size else None
                        chrome = (r.text == T.FOOTER or re.fullmatch(r"\d\d|B\d", r.text.strip())
                                  or (r.text.isupper() and size and size >= 12))
                        if size and size < MIN_PT and r.text.strip() and not chrome:
                            bad.append(f"slide {n}: {size:g} pt {r.text[:50]!r}")
    if bad:
        raise SystemExit("Text under 14 pt on a main slide:\n  " + "\n  ".join(bad))


def build(shots_dir: Path | None):
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
    check_sizes(prs)
    return prs, docs


def write_slides_md(docs: list[SlideDoc]) -> None:
    main = [doc for doc in docs if not doc.number.startswith("B")]
    total = sum(seconds(doc.script) for doc in main if doc.number != "3") + 90
    out = ["# Defense deck: slides, scripts and sources",
           "",
           "Generated by `docs/deck/make_deck.py` from the committed result files. Do not edit by hand: change the "
           "script and run it again. The deck itself is `docs/deck/qarau-defense-deck.pptx` (import into Canva); the "
           "same scripts and `Sources:` lines are in its speaker notes. Speaker names are only here and in the notes. "
           "The response to the design critique (G-58) is `docs/deck/CRITIQUE-RESPONSE.md`.",
           "",
           f"Times are estimates at {WPM} words per minute; read each script aloud with a timer (rehearsal rules in "
           f"docs/PRESENTATION.md). Slide 3 is the live demo and is timed by the demo, 1:30. Estimated total for "
           f"slides 1–12: {mmss(total)}.",
           ""]
    if R.gaps:
        out += ["## Open gaps", "",
                "Each gap is off the slide face. The script already says the fallback sentence; when the number "
                "lands, add it to the slide and the script, and its source to `docs/research/deck-sources.md`.", "",
                "| Slide | Missing | Owner | Said instead |", "|---|---|---|---|"]
        out += [f"| {g.slide} | {g.what} | {g.owner} | {g.fallback} |" for g in R.gaps]
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
        for note in gap_notes(doc):
            out += [f"**{note.split(':', 1)[0]}:**{note.split(':', 1)[1]}", ""]
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
    for g in R.gaps:
        lines.append(f"| {g.slide} | (not shown) | | {g.what} ({g.owner}) | | gap |")
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
    parser.add_argument("--screenshots", type=Path, default=None,
                        help="folder outside the repository with the three slide 9 crops (09-heuristic-*.png)")
    parser.add_argument("--preview", type=Path, help="also write one .pptx per slide into this folder")
    args = parser.parse_args()
    prs, docs = build(args.screenshots)
    prs.save(args.out)
    write_slides_md(docs)
    write_sources_md()
    print(f"wrote {args.out.relative_to(ROOT) if args.out.is_relative_to(ROOT) else args.out} ({len(prs.slides)} slides), "
          f"{SLIDES_MD.relative_to(ROOT)}, {SOURCES_MD.relative_to(ROOT)}")
    print(f"{len(R.rows)} numbers checked against their files, {len(R.gaps)} open gaps, no main-slide text under {MIN_PT} pt")
    for gp in R.gaps:
        print(f"  gap on slide {gp.slide} ({gp.owner}): {gp.what}")
        if gp.watch and (ROOT / gp.watch).exists():
            print(f"    NOTE: {gp.watch} now exists: fill this gap and rebuild")
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
