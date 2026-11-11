import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { IOAI_BASELINE_CODE, IOAI_NOTEBOOK } from "./restroom-ioai-baseline";

// The IOAI data is gitignored (data/raw/), so in CI only the second test runs.
const notebook = fileURLToPath(new URL(`../../${IOAI_NOTEBOOK}`, import.meta.url));

describe("IOAI baseline code excerpts", () => {
  it.skipIf(!existsSync(notebook))("match the notebook's code cells exactly", () => {
    const nb = JSON.parse(readFileSync(notebook, "utf8")) as { cells: { cell_type: string; source: string[] | string }[] };
    for (const e of IOAI_BASELINE_CODE) {
      const cell = nb.cells[e.cell];
      expect(cell.cell_type, e.id).toBe("code");
      const source = Array.isArray(cell.source) ? cell.source.join("") : cell.source;
      expect(e.code, `cell ${e.cell}`).toBe(source.replace(/\n+$/, ""));
    }
  });

  it("show the zero-shot model and the second-most-similar rule", () => {
    const code = IOAI_BASELINE_CODE.map((e) => e.code).join("\n");
    expect(code).toContain('clip.load("ViT-B/16"');
    expect(code).toContain("topk_idxs[:, 1]");
    expect(code).toContain("submission_b.npy");
  });
});
