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


if __name__ == "__main__":
    unittest.main()
