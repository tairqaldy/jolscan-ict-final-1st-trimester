import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { IOAI_PAIRS, IOAI_SPLITS, ioaiGalleryUrl, ioaiQueryUrl } from "./restroom-ioai-pairs";

const publicFile = (url: string) => path.join(__dirname, "..", "public", url);

describe("IOAI pairs export", () => {
  it.each(IOAI_SPLITS)("%s: the counts match the rows", (split) => {
    const s = IOAI_PAIRS.splits[split];
    expect(s.rows).toHaveLength(s.queries);
    expect(s.rows.filter((r) => r.pair === r.answer)).toHaveLength(s.pipelineCorrect);
    expect(s.rows.filter((r) => r.baseline === r.answer)).toHaveLength(s.baselineCorrect);
  });

  it.each(IOAI_SPLITS)("%s: every number points at a gallery file and the ranking is sorted", (split) => {
    const s = IOAI_PAIRS.splits[split];
    for (const r of s.rows) {
      for (const g of [r.own, r.pair, r.answer, r.baseline, ...r.candidates.map((c) => c.g)]) {
        expect(g).toBeGreaterThanOrEqual(1);
        expect(g).toBeLessThanOrEqual(s.gallery);
      }
      expect(r.candidates.map((c) => c.g)).not.toContain(r.own);
      const scores = r.candidates.map((c) => c.score);
      expect([...scores].sort((a, b) => b - a)).toEqual(scores);
    }
  });

  it.each(IOAI_SPLITS)("%s: every image exists", (split) => {
    const s = IOAI_PAIRS.splits[split];
    for (const r of s.rows) expect(existsSync(publicFile(ioaiQueryUrl(split, r.n)))).toBe(true);
    for (let g = 1; g <= s.gallery; g++) expect(existsSync(publicFile(ioaiGalleryUrl(split, g)))).toBe(true);
  });
});
