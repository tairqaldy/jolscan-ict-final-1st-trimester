"""Build the Qarau slide template (task G-10) as a PowerPoint file.

The deck is made in Canva, which imports .pptx files as editable presentations.
Colours come from the light theme in web/app/tokens.css, fonts from web/app/layout.tsx
(Overpass for text, JetBrains Mono for numbers), the mark from web/app/icon.svg.
The template holds placeholders only: no real numbers (honesty rule, docs/PRESENTATION.md).

    python3 -m venv .venv && .venv/bin/pip install python-pptx
    .venv/bin/python docs/design/slide-template/make_slide_template.py

Writes qarau-slide-template.pptx next to this file. Pass --preview DIR to also write one
.pptx per slide there, for checking each slide with Quick Look (qlmanage -t).
"""

from __future__ import annotations

import argparse
from pathlib import Path

from lxml import etree
from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.oxml.ns import qn
from pptx.util import Emu, Inches, Pt

# Light theme, web/app/tokens.css. Keep in sync with DESIGN-BRIEF.md "Slide template (G-10)".
C = {
    "bg": "F3F2EE", "surface": "FFFFFF", "surface2": "EBE9E3", "surface3": "DFDCD4",
    "border": "DAD7CF", "fg": "1B1C1E", "muted": "4F5156", "subtle": "66686D",
    "accent": "B87F00", "accent_fg": "1B1C1E", "accent_ink": "855700", "accent_soft": "FBEFD0",
    "chart1": "3D4F63", "chart2": "B87F00", "grid": "E1DED7",
    "clear": "2E8B57", "low": "3E7CB1", "medium": "B87F00", "high": "D9601A", "critical": "93202A",
    # Dark section dividers use the dark theme's text colours on --inverse.
    "inverse": "1C1D1F", "inverse_fg": "F3F2EE", "inverse_muted": "B1B2AE",
    # Static brand files (app/icon.svg, public/brand/) use the road-sign amber.
    "brand": "F2A900", "asphalt": "26282B",
}
TEXT = "Overpass"
MONO = "JetBrains Mono"
W, H = Inches(13.333), Inches(7.5)
MARGIN = Inches(0.7)
FOOTER = "Qarau · ICT1103 · QAIRU"

NOTES_FIRST = """Qarau slide template (G-10). Built from the app's design system so slides and screenshots read as one product.

Colours (light theme, web/app/tokens.css):
- Background --bg #F3F2EE; cards --surface #FFFFFF; table header --surface-2 #EBE9E3; borders #DAD7CF
- Text --fg #1B1C1E; secondary text --muted #4F5156; small print --subtle #66686D
- Accent --accent #B87F00 only as a fill, with --accent-fg #1B1C1E text on it
- Accent text --accent-ink #855700 (amber text on light backgrounds fails contrast; use this one)
- Demo label: fill --accent-soft #FBEFD0, text #855700
- Charts: --chart-1 #3D4F63, --chart-2 #B87F00, grid #E1DED7
- Severity, only on charts that show severity: clear #2E8B57, low #3E7CB1, medium #B87F00, high #D9601A, critical #93202A
- Section dividers: --inverse #1C1D1F with #F3F2EE text; logo and road stripe in brand amber #F2A900

Fonts: Overpass (titles and text), JetBrains Mono (numbers, code, the footer). Both are Google Fonts. If Canva shows another font after import, select the text and set Overpass or JetBrains Mono.

Rules: one point per slide, stated in the title. Numbers only from ml/results/experiments.csv and ml/results/restroom/experiments.csv. Put the "Demo data" label on any screenshot that shows demo or mock data. Sources go in the speaker notes, not on the slide."""


def rgb(key: str) -> RGBColor:
    return RGBColor.from_string(C[key])


def set_bg(slide, key: str) -> None:
    fill = slide.background.fill
    fill.solid()
    fill.fore_color.rgb = rgb(key)


def text(slide, left, top, width, height, runs, *, size=18, color="fg", font=TEXT, bold=False,
         align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP, spacing=None, line=None):
    """Add a text box. `runs` is a string or a list of paragraphs, each a string or (text, overrides)."""
    box = slide.shapes.add_textbox(left, top, width, height)
    tf = box.text_frame
    tf.word_wrap = True
    tf.vertical_anchor = anchor
    for side in ("margin_left", "margin_right", "margin_top", "margin_bottom"):
        setattr(tf, side, 0)
    paragraphs = runs if isinstance(runs, list) else [runs]
    for i, para in enumerate(paragraphs):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align
        if line:
            p.line_spacing = line
        content, over = (para, {}) if isinstance(para, str) else para
        r = p.add_run()
        r.text = content
        f = r.font
        f.name = over.get("font", font)
        f.size = Pt(over.get("size", size))
        f.bold = over.get("bold", bold)
        f.color.rgb = rgb(over.get("color", color))
        if over.get("space_before"):
            p.space_before = Pt(over["space_before"])
        sp = over.get("spacing", spacing)
        if sp:
            r._r.get_or_add_rPr().set("spc", str(sp))  # letter spacing in 1/100 pt
    return box


def rect(slide, left, top, width, height, fill=None, line=None, line_w=1.0, shape=MSO_SHAPE.RECTANGLE, radius=None):
    s = slide.shapes.add_shape(shape, left, top, width, height)
    if radius is not None and shape == MSO_SHAPE.ROUNDED_RECTANGLE:
        s.adjustments[0] = radius
    if fill:
        s.fill.solid()
        s.fill.fore_color.rgb = rgb(fill)
    else:
        s.fill.background()
    if line:
        s.line.color.rgb = rgb(line)
        s.line.width = Pt(line_w)
    else:
        s.line.fill.background()
    s.shadow.inherit = False
    s.text_frame.text = ""
    return s


def round_line(shape) -> None:
    ln = shape.line._get_or_add_ln()
    ln.set("cap", "rnd")
    for child in list(ln):
        if child.tag in (qn("a:round"), qn("a:bevel"), qn("a:miter")):
            ln.remove(child)
    etree.SubElement(ln, qn("a:round"))


def mark(slide, left, top, size, fill="brand", ink="fg"):
    """The viewfinder mark from app/icon.svg (32-unit grid), drawn as vector shapes."""
    u = size / 32
    rect(slide, left + int(u * 1), top + int(u * 1), int(u * 30), int(u * 30), fill=fill,
         shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=7 / 30)
    brackets = [
        [(8, 13.5), (8, 8), (13.5, 8)], [(18.5, 8), (24, 8), (24, 13.5)],
        [(24, 18.5), (24, 24), (18.5, 24)], [(13.5, 24), (8, 24), (8, 18.5)],
    ]
    for pts in brackets:
        fb = slide.shapes.build_freeform(left + int(u * pts[0][0]), top + int(u * pts[0][1]), scale=1.0)
        fb.add_line_segments([(left + int(u * x), top + int(u * y)) for x, y in pts[1:]], close=False)
        s = fb.convert_to_shape()
        s.fill.background()
        s.line.color.rgb = rgb(ink)
        s.line.width = Emu(int(u * 3))
        s.shadow.inherit = False
        round_line(s)
    e = slide.shapes.add_shape(MSO_SHAPE.OVAL, left + int(u * 12.4), top + int(u * 14.1), int(u * 7.2), int(u * 4.8))
    e.fill.solid()
    e.fill.fore_color.rgb = rgb(ink)
    e.line.fill.background()
    e.shadow.inherit = False


def road(slide, top, height=Inches(0.42)):
    """Asphalt band with the amber centre line, as on the landing page and the social image."""
    rect(slide, 0, top, W, height, fill="asphalt")
    dash, gap = Inches(0.62), Inches(0.42)
    x = Inches(0.3)
    while x < W:
        rect(slide, x, top + height // 2 - Inches(0.035), dash, Inches(0.07), fill="brand", shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.5)
        x += dash + gap


def footer(slide, dark=False):
    color = "inverse_muted" if dark else "subtle"
    text(slide, MARGIN, H - Inches(0.5), Inches(6), Inches(0.3), FOOTER, size=10, color=color, font=MONO)
    mark(slide, W - MARGIN - Inches(0.28), H - Inches(0.56), Inches(0.28))


def eyebrow(slide, label, top=Inches(0.55), color="accent_ink"):
    text(slide, MARGIN, top, Inches(10), Inches(0.3), label.upper(), size=12, color=color, bold=True, spacing=200)


def title(slide, words, top=Inches(0.85), color="fg", size=36, width=Inches(11.9)):
    text(slide, MARGIN, top, width, Inches(1.2), words, size=size, color=color, bold=True, line=1.05)


def demo_badge(slide, left, top):
    b = rect(slide, left, top, Inches(1.45), Inches(0.36), fill="accent_soft", shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.25)
    tf = b.text_frame
    tf.margin_left = tf.margin_right = Inches(0.1)
    tf.margin_top = tf.margin_bottom = 0
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    r = p.add_run()
    r.text = "Demo data"
    r.font.name, r.font.size, r.font.bold = TEXT, Pt(12), True
    r.font.color.rgb = rgb("accent_ink")


def notes(slide, words):
    slide.notes_slide.notes_text_frame.text = words


def build() -> Presentation:
    prs = Presentation()
    prs.slide_width, prs.slide_height = W, H
    blank = prs.slide_layouts[6]

    # 1 · Title
    s = prs.slides.add_slide(blank)
    set_bg(s, "bg")
    mark(s, MARGIN, Inches(1.25), Inches(1.15))
    text(s, MARGIN + Inches(1.45), Inches(1.27), Inches(8), Inches(1.2), "Qarau", size=72, bold=True)
    eyebrow(s, "Қарау · Kazakh for “to inspect”", top=Inches(2.85))
    text(s, MARGIN, Inches(3.3), Inches(9.6), Inches(1.4),
         "Computer vision inspection of public infrastructure from photos, with rules you can read.",
         size=26, color="muted", line=1.15)
    text(s, MARGIN, Inches(5.05), Inches(11), Inches(0.9),
         [("ICT1103 · QAIRU · Group project, Assignment 2", {"font": MONO, "size": 13, "color": "subtle"}),
          ("Tair · Dameli · Nazar · Amina · Alizhan · Roma", {"size": 16, "color": "fg", "space_before": 6})])
    road(s, H - Inches(0.62))
    notes(s, NOTES_FIRST)

    # 2, 3 · Section dividers, one per module
    for number, module, task in [("01", "Roads", "Pothole detection → repair priority"),
                                 ("02", "Restrooms", "Door-sign matching → signage verdict")]:
        s = prs.slides.add_slide(blank)
        set_bg(s, "inverse")
        text(s, MARGIN, Inches(2.0), Inches(3), Inches(1.0), number, size=44, color="brand", font=MONO)
        text(s, MARGIN, Inches(2.95), Inches(11), Inches(1.3), module, size=66, color="inverse_fg", bold=True)
        text(s, MARGIN, Inches(4.25), Inches(11), Inches(0.6), task, size=24, color="inverse_muted")
        x = MARGIN
        for _ in range(6):
            rect(s, x, Inches(5.25), Inches(0.5), Inches(0.07), fill="brand", shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.5)
            x += Inches(0.82)
        footer(s, dark=True)
        notes(s, f"Section divider for the {module} module. Keep the number, the module name and its one-line task.")

    # 4 · One point plus one screenshot
    s = prs.slides.add_slide(blank)
    set_bg(s, "bg")
    eyebrow(s, "Section · speaker name")
    title(s, "State the slide's one point as a full sentence", width=Inches(11.9))
    text(s, MARGIN, Inches(2.25), Inches(4.3), Inches(3.4),
         [("One or two lines that back the point up.", {}),
          ("Keep everything else for the speaker notes.", {"space_before": 10, "color": "muted"})],
         size=20, line=1.2)
    frame_l, frame_t, frame_w = Inches(5.5), Inches(2.05), Inches(7.13)
    frame_h = int(frame_w * 10 / 16)
    rect(s, frame_l, frame_t, frame_w, frame_h, fill="surface", line="border", line_w=1.0,
         shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.03)
    text(s, frame_l, frame_t, frame_w, frame_h,
         [("Screenshot", {"bold": True, "color": "muted"}),
          ("16:10 · light theme · the same frame on every slide (G-56)", {"size": 13, "color": "subtle", "font": MONO, "space_before": 6})],
         size=18, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
    demo_badge(s, frame_l + frame_w - Inches(1.6), frame_t + Inches(0.15))
    text(s, MARGIN, Inches(5.95), Inches(4.3), Inches(0.6),
         "Put the “Demo data” label on any screen that shows demo or mock data.", size=12, color="subtle")
    footer(s)
    notes(s, "One point plus one screenshot. Crop screenshots with one frame (G-56). Keep the Demo data label on demo or mock screens; delete it on screens with real results.")

    # 5 · One point plus one chart
    s = prs.slides.add_slide(blank)
    set_bg(s, "bg")
    eyebrow(s, "Section · speaker name")
    title(s, "Chart title says what the chart shows")
    cl, ct, cw, ch = MARGIN, Inches(2.05), Inches(7.9), Inches(4.35)
    rect(s, cl, ct, cw, ch, fill="surface", line="border", shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.03)
    plot_l, plot_b, plot_w, plot_h = cl + Inches(0.75), ct + ch - Inches(0.75), cw - Inches(1.2), ch - Inches(1.35)
    for i in range(1, 4):
        y = plot_b - int(plot_h * i / 4)
        rect(s, plot_l, y, plot_w, Emu(Pt(0.75)), fill="grid")
    heights = [0.45, 0.7, 0.55, 0.92, 0.6]
    bar_w = int(plot_w / len(heights) * 0.56)
    for i, h in enumerate(heights):
        x = plot_l + int(plot_w / len(heights) * (i + 0.22))
        rect(s, x, plot_b - int(plot_h * h), bar_w, int(plot_h * h), fill="chart2" if i == 3 else "chart1")
        text(s, x - Inches(0.1), plot_b + Inches(0.1), bar_w + Inches(0.2), Inches(0.3), f"Category {i + 1}", size=11, color="subtle", align=PP_ALIGN.CENTER)
    rect(s, plot_l, plot_b, plot_w, Emu(Pt(1.25)), fill="muted")
    text(s, plot_l - Inches(0.4), plot_b - Inches(0.12), Inches(0.3), Inches(0.25), "0", size=11, color="subtle", font=MONO, align=PP_ALIGN.RIGHT)
    text(s, cl + Inches(0.3), ct + Inches(0.25), Inches(5), Inches(0.3), "Axis label (unit)", size=11, color="subtle", font=MONO)
    rl = cl + cw + Inches(0.45)
    text(s, rl, Inches(2.05), Inches(3.6), Inches(2.4),
         [("Bars start at zero.", {"bold": True}),
          ("Amber marks the one bar you talk about; the rest stay graphite.", {"color": "muted", "space_before": 8}),
          ("Severity colours only when the chart shows severity:", {"color": "muted", "space_before": 8})],
         size=16, line=1.15)
    for i, (key, label) in enumerate([("clear", "Clear"), ("low", "Low"), ("medium", "Medium"), ("high", "High"), ("critical", "Critical")]):
        y = Inches(3.75) + i * Inches(0.36)
        rect(s, rl, y + Inches(0.05), Inches(0.22), Inches(0.22), fill=key, shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.2)
        text(s, rl + Inches(0.35), y, Inches(2), Inches(0.3), label, size=13, color="fg")
    footer(s)
    notes(s, "One point plus one chart, drawn with the app's chart colours. Replace the placeholder bars with the real figure from ml/plots.py (G-52) or the analytics page; numbers only from the results CSV files.")

    # 6 · Table
    s = prs.slides.add_slide(blank)
    set_bg(s, "bg")
    eyebrow(s, "Section · speaker name")
    title(s, "Results table: one row per run")
    rows, cols = 5, 4
    tl, tt, tw = MARGIN, Inches(2.1), Inches(11.9)
    table = s.shapes.add_table(rows, cols, tl, tt, tw, Inches(0.55) * rows).table
    widths = [Inches(1.6), Inches(5.9), Inches(2.2), Inches(2.2)]
    for i, w in enumerate(widths):
        table.columns[i].width = w
    data = [["Run", "What changed", "Metric A", "Metric B"],
            ["R0", "Baseline", "—", "—"], ["R1", "One change against the baseline", "—", "—"],
            ["R2", "Selected run, chosen on validation", "—", "—"], ["R3", "Another change", "—", "—"]]
    for r in range(rows):
        table.rows[r].height = Inches(0.55)
        for c in range(cols):
            cell = table.cell(r, c)
            cell.fill.solid()
            cell.fill.fore_color.rgb = rgb("surface2" if r == 0 else ("accent_soft" if r == 3 else "surface"))
            cell.margin_left = cell.margin_right = Inches(0.15)
            cell.vertical_anchor = MSO_ANCHOR.MIDDLE
            tf = cell.text_frame
            tf.text = ""
            p = tf.paragraphs[0]
            p.alignment = PP_ALIGN.RIGHT if c >= 2 else PP_ALIGN.LEFT
            run = p.add_run()
            run.text = data[r][c]
            numeric = c == 0 or c >= 2
            run.font.name = MONO if (numeric and r > 0) else TEXT
            run.font.size = Pt(14 if r == 0 else 16)
            run.font.bold = r == 0 or r == 3
            run.font.color.rgb = rgb("muted" if r == 0 else "fg")
    tbl_pr = table._tbl.find(qn("a:tblPr"))
    for attr in ("firstRow", "bandRow"):
        tbl_pr.set(attr, "0")
    text(s, MARGIN, Inches(5.1), Inches(11.9), Inches(0.6),
         "Numbers come from ml/results/experiments.csv only. The highlighted row is the selected run.",
         size=13, color="subtle")
    footer(s)
    notes(s, "Table layout. Number columns use JetBrains Mono and are right-aligned so the digits line up. Fill the dashes from the results CSV; never type numbers by hand.")

    # 7 · Two-column comparison
    s = prs.slides.add_slide(blank)
    set_bg(s, "bg")
    eyebrow(s, "Section · speaker name")
    title(s, "Two options side by side, and the one we chose")
    card_w, card_t, card_h, gap = Inches(5.8), Inches(2.1), Inches(3.9), Inches(0.3)
    for i, (head, chip, chosen) in enumerate([("Option A", "Baseline", False), ("Option B", "Chosen", True)]):
        left = MARGIN + i * (card_w + gap)
        rect(s, left, card_t, card_w, card_h, fill="surface", line="accent" if chosen else "border",
             line_w=2.0 if chosen else 1.0, shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.04)
        c = rect(s, left + Inches(0.35), card_t + Inches(0.35), Inches(1.25), Inches(0.34),
                 fill="accent" if chosen else "surface2", shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.25)
        tf = c.text_frame
        tf.margin_top = tf.margin_bottom = 0
        tf.vertical_anchor = MSO_ANCHOR.MIDDLE
        p = tf.paragraphs[0]
        p.alignment = PP_ALIGN.CENTER
        r = p.add_run()
        r.text = chip
        r.font.name, r.font.size, r.font.bold = TEXT, Pt(12), True
        r.font.color.rgb = rgb("accent_fg" if chosen else "muted")
        text(s, left + Inches(0.35), card_t + Inches(0.9), card_w - Inches(0.7), Inches(0.5), head, size=24, bold=True)
        text(s, left + Inches(0.35), card_t + Inches(1.55), card_w - Inches(0.7), Inches(2.2),
             ["What it does, in one line", ("What it costs or risks", {"space_before": 10}),
              ("The measured result, from the results file", {"space_before": 10})],
             size=17, color="muted", line=1.15)
    footer(s)
    notes(s, "Comparison layout. The chosen option gets the amber outline and the amber chip; say why in one sentence.")

    # 8 · Closing with links
    s = prs.slides.add_slide(blank)
    set_bg(s, "bg")
    eyebrow(s, "Questions")
    title(s, "Repository and live demo", size=40)
    links = [("Repository", "github.com/tairqaldy/qarau-ict-final-1st-trimester"), ("Live demo", "qarau.vercel.app"),
             ("Course", "ICT1103 · QAIRU")]
    for i, (label, value) in enumerate(links):
        y = Inches(2.35) + i * Inches(0.75)
        text(s, MARGIN, y, Inches(2.4), Inches(0.5), label, size=18, color="muted")
        text(s, MARGIN + Inches(2.5), y + Inches(0.02), Inches(9.4), Inches(0.5), value, size=18, color="fg", font=MONO)
    mark(s, MARGIN, Inches(4.95), Inches(0.62))
    text(s, MARGIN + Inches(0.8), Inches(4.97), Inches(6), Inches(0.6), "Qarau", size=34, bold=True)
    road(s, H - Inches(0.62))
    notes(s, "Closing slide. Leave it up during questions so the links stay visible.")
    return prs


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.split("\n", 1)[0])
    parser.add_argument("--out", type=Path, default=Path(__file__).with_name("qarau-slide-template.pptx"))
    parser.add_argument("--preview", type=Path, help="also write one .pptx per slide into this folder")
    args = parser.parse_args()
    prs = build()
    prs.save(args.out)
    print(f"wrote {args.out} ({len(prs.slides)} slides)")
    if args.preview:
        args.preview.mkdir(parents=True, exist_ok=True)
        for keep in range(len(prs.slides)):
            one = build()
            ids = one.slides._sldIdLst
            for i, sld in reversed(list(enumerate(list(ids)))):
                if i != keep:
                    one.part.drop_rel(sld.get(qn("r:id")))
                    ids.remove(sld)
            one.save(args.preview / f"slide-{keep + 1:02d}.pptx")
        print(f"wrote {len(prs.slides)} single-slide previews to {args.preview}")


if __name__ == "__main__":
    main()
