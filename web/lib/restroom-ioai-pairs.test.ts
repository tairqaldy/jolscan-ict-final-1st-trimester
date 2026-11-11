import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { IOAI_PAIRS, IOAI_SPLITS, ioaiGalleryUrl, ioaiQueryUrl } from "./restroom-ioai-pairs";

const publicFile = (url: string) => path.join(__dirname, "..", "public", url);

describe("IOAI pairs export", () => {
  it.each(IOAI_SPLITS)("%s: the counts match the rows, hidden queries included in the counts", (split) => {
    const s = IOAI_PAIRS.splits[split];
    const hidden = s.hiddenQueries.length;
    expect(s.rows).toHaveLength(s.queries - hidden);
    for (const q of s.hiddenQueries) expect(s.rows.some((r) => r.n === q)).toBe(false);
    const shownRight = s.rows.filter((r) => r.pair === r.answer).length;
    const shownBase = s.rows.filter((r) => r.baseline === r.answer).length;
    expect(s.pipelineCorrect).toBeGreaterThanOrEqual(shownRight);
    expect(s.pipelineCorrect).toBeLessThanOrEqual(shownRight + hidden);
    expect(s.baselineCorrect).toBeGreaterThanOrEqual(shownBase);
    expect(s.baselineCorrect).toBeLessThanOrEqual(shownBase + hidden);
    expect(Boolean(s.hiddenNote)).toBe(hidden > 0);
  });

  it.each(IOAI_SPLITS)("%s: no hidden image is shown anywhere", (split) => {
    const s = IOAI_PAIRS.splits[split];
    const hidden = new Set(s.hiddenGallery);
    for (const r of s.rows) {
      for (const g of [r.own, r.pair, r.answer, r.baseline, ...r.candidates.map((c) => c.g)]) expect(hidden.has(g)).toBe(false);
    }
    for (const g of s.hiddenGallery) expect(existsSync(publicFile(ioaiGalleryUrl(split, g)))).toBe(false);
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
    for (let g = 1; g <= s.gallery; g++) {
      if (!s.hiddenGallery.includes(g)) expect(existsSync(publicFile(ioaiGalleryUrl(split, g)))).toBe(true);
    }
  });
});
