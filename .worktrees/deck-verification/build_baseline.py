from pathlib import Path
import sys, types
root = Path.cwd()
workspace = root / ".worktrees/deck-verification"
module = types.ModuleType("baseline_deck")
module.__file__ = str(root / "docs/deck/make_deck.py")
sys.modules[module.__name__] = module
exec(compile((workspace / "before-generator.py").read_text(encoding="utf-8"), module.__file__, "exec"), module.__dict__)
module.SLIDES_MD = workspace / "baseline-SLIDES.md"
module.SOURCES_MD = workspace / "baseline-sources.md"
module.SOURCES_MD.write_bytes((root / "docs/research/deck-sources.md").read_bytes())
sys.argv = [module.__file__, "--out", str(workspace / "baseline-generated.pptx")]
module.main()
