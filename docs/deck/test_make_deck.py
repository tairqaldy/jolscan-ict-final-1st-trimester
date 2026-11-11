"""Regression checks for the Roads scripts in generated Markdown and actual PPTX notes.

Run with the deck-build environment:
    python -m unittest discover -s docs/deck -p test_make_deck.py
"""
import importlib.util
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch

from pptx import Presentation


class RoadsDeckGenerationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        path = Path(__file__).with_name("make_deck.py")
        spec = importlib.util.spec_from_file_location("roads_deck_regression", path)
        cls.deck = importlib.util.module_from_spec(spec)
        sys.modules[spec.name] = cls.deck
        spec.loader.exec_module(cls.deck)
        cls.prs, cls.docs = cls.deck.build(None)

    def test_latest_caveats_and_attribution_are_generated(self):
        data, results = self.docs[4:6]
        self.assertIn("I prepared and reviewed our pothole data", data.script)
        self.assertIn("rights to individual watermarked photos remain unresolved", data.script)
        self.assertIn("Tair performed all full experiment runs", data.script)
        self.assertIn("Tair trained the full experiments", results.script)
        self.assertIn("Our project policy withholds test-gain claims below", results.script)
        self.assertIn("without claiming statistical equivalence", results.script)
        self.assertIn("not a universal significance threshold", results.cues)
        self.assertNotIn("test read once", data.script.lower())
        self.assertIn("Personal timed reading remains pending", results.cues)
        self.assertIn("Browser verification", results.cues)
        self.assertEqual([self.deck.words(d.script) for d in (data, results)], [127, 90])

    def test_presentation_copy_is_synced_from_the_build(self):
        stale = ("# Talk\n\n**Full timed read-through:** The deck estimates 9:99 with the demo.\n\n"
                 "### 10. AI\n**Speaker and budget:** Roma · **budget** 0:35 · **script** 1 words, about 0:01\n\n"
                 "> old text\n\n### 11. Limits\n**script** 2 words, about 0:02\n\n> old limits\n\n## Demo script\n\nkept\n")
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "PRESENTATION.md"
            path.write_text(stale, encoding="utf-8")
            self.assertEqual(self.deck.sync_presentation_scripts(self.docs, path), 2)
            out = path.read_text(encoding="utf-8")
        ten, eleven = self.docs[9], self.docs[10]
        self.assertIn("> " + ten.script, out)
        self.assertIn("> " + eleven.script, out)
        self.assertIn(f"**script** {self.deck.words(ten.script)} words", out)
        self.assertNotIn("9:99", out)
        self.assertTrue(out.endswith("## Demo script\n\nkept\n"))

    def test_clo_backups_quote_the_syllabus_and_name_evidence(self):
        by_number = {doc.number: doc for doc in self.docs}
        for number, clo in (("B6", 5), ("B7", 6), ("B8", 7)):
            doc = by_number[number]
            self.assertIn(f"CLO {clo}", doc.title)
            self.assertIn(self.deck.clo_quote(clo), doc.on_slide[0])
            files = {n.file for n in self.deck.R.rows if n.slide == number} | set(doc.extra_sources)
            self.assertGreaterEqual(len(files), 2, number)

    def test_markdown_and_saved_pptx_have_the_same_scripts(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            output = root / "deck.pptx"
            self.prs.save(output)
            with patch.object(self.deck, "SLIDES_MD", root / "SLIDES.md"):
                self.deck.write_slides_md(self.docs)
            markdown = (root / "SLIDES.md").read_text(encoding="utf-8")
            saved = Presentation(output)
            for index in (4, 5):
                doc = self.docs[index]
                notes = saved.slides[index].notes_slide.notes_text_frame.text
                self.assertIn(doc.script, notes)
                self.assertIn(doc.script, markdown)
                self.assertIn(doc.cues, notes)
                self.assertIn(doc.cues, markdown)
                self.assertIn("Sources:", notes)

    def test_rebuild_keeps_scripts_and_notes(self):
        second, docs = self.deck.build(None)
        for index in (4, 5):
            self.assertEqual(docs[index].script, self.docs[index].script)
            self.assertEqual(second.slides[index].notes_slide.notes_text_frame.text,
                             self.prs.slides[index].notes_slide.notes_text_frame.text)


    def test_roads_only_preserves_teammates_and_is_repeatable(self):
        from zipfile import ZipFile
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            out, markdown, sources = root / "deck.pptx", root / "SLIDES.md", root / "sources.md"
            self.prs.save(out)
            teammate = Presentation(out)
            teammate.slides[9].notes_slide.notes_text_frame.text = "Teammate's unmerged presentation notes"
            teammate.save(out)
            with patch.multiple(self.deck, SLIDES_MD=markdown, SOURCES_MD=sources):
                self.deck.write_slides_md(self.docs)
                self.deck.write_sources_md()
                markdown.write_text(markdown.read_text(encoding="utf-8").replace(
                    "## Slide 10", "Teammate's unchanged prose\n\n## Slide 10"), encoding="utf-8")
                sources.write_text("Manual audit notes\n" + sources.read_text(encoding="utf-8"), encoding="utf-8")
                with ZipFile(out) as archive:
                    original_parts = {name: archive.read(name) for name in archive.namelist()}
                original_sources = sources.read_bytes()
                original_markdown = markdown.read_bytes()
                self.deck.save_roads_only(self.prs, self.docs, out)
                self.deck.save_roads_only(self.prs, self.docs, out)
                with ZipFile(out) as archive:
                    for name, content in original_parts.items():
                        if name not in {f"ppt/{folder}/{stem}{n}.xml" for n in (5, 6)
                                        for folder, stem in (("slides", "slide"), ("notesSlides", "notesSlide"))}:
                            self.assertEqual(archive.read(name), content, name)
                self.assertEqual(markdown.read_bytes(), original_markdown)
                self.assertEqual(sources.read_bytes(), original_sources)

    def test_roads_only_refuses_shared_resource_changes(self):
        import io
        from zipfile import ZipFile
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            out = root / "deck.pptx"
            self.prs.save(out)
            modified = io.BytesIO()
            with ZipFile(out) as old, ZipFile(modified, "w") as new:
                for info in old.infolist():
                    content = old.read(info.filename)
                    new.writestr(info, content + b" " if info.filename == "docProps/app.xml" else content)
            out.write_bytes(modified.getvalue())
            before = out.read_bytes()
            markdown, sources = root / "SLIDES.md", root / "sources.md"
            markdown.write_text("preserve", encoding="utf-8")
            sources.write_text("preserve", encoding="utf-8")
            with patch.multiple(self.deck, SLIDES_MD=markdown, SOURCES_MD=sources):
                with self.assertRaisesRegex(SystemExit, "shared resources"):
                    self.deck.save_roads_only(self.prs, self.docs, out)
            self.assertEqual(out.read_bytes(), before)
            self.assertEqual(markdown.read_text(), "preserve")


if __name__ == "__main__":
    unittest.main()
