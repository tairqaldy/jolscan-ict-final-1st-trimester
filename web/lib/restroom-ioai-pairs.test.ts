import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { IOAI_PAIRS, IOAI_SPLITS, ioaiGalleryUrl, ioaiQueryUrl } from "./restroom-ioai-pairs";

const publicFile = (url: string) => path.join(__dirname, "..", "public", url);

describe("IOAI data export (IOAI task page)", () => {
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

  it("holds the IOAI baseline notebook's picks (R0) on validation and test, with its published-level score", () => {
    for (const split of ["val", "test"] as const) {
      const s = IOAI_PAIRS.splits[split];
      const shown = s.rows.filter((r) => r.ioaiBaseline === r.answer).length;
      expect(s.ioaiBaselineCorrect).not.toBeNull();
      expect(s.ioaiBaselineCorrect!).toBeGreaterThanOrEqual(shown);
      expect(s.ioaiBaselineCorrect!).toBeLessThanOrEqual(shown + s.hiddenQueries.length);
    }
    expect(IOAI_PAIRS.splits.val.ioaiBaselineCorrect).toBe(8);
    expect(IOAI_PAIRS.splits.test.ioaiBaselineCorrect).toBe(23);
    expect(IOAI_PAIRS.splits.train.ioaiBaselineCorrect).toBeNull();
    expect(IOAI_PAIRS.splits.train.rows.every((r) => r.ioaiBaseline === null)).toBe(true);
    const train = IOAI_PAIRS.splits.train;
    expect(train.queryLabels).toHaveLength(train.queries);
    expect(train.queryLabels![39]).toBe("restroom 40, male");
    expect(train.galleryLabels![train.rows.find((r) => r.n === 40)!.answer - 1]).toBe("restroom 40, female");
  });

  it.each(IOAI_SPLITS)("%s: no hidden image is shown anywhere", (split) => {
    const s = IOAI_PAIRS.splits[split];
    const hidden = new Set(s.hiddenGallery);
    for (const r of s.rows) {
      for (const g of [r.own, r.pair, r.answer, r.baseline, r.ioaiBaseline ?? r.answer, ...r.candidates.map((c) => c.g)]) {
        expect(hidden.has(g)).toBe(false);
      }
    }
    for (const g of s.hiddenGallery) expect(existsSync(publicFile(ioaiGalleryUrl(split, g)))).toBe(false);
  });

  it.each(IOAI_SPLITS)("%s: every number points at a gallery file and the ranking is sorted", (split) => {
    const s = IOAI_PAIRS.splits[split];
    for (const r of s.rows) {
      for (const g of [r.own, r.pair, r.answer, r.baseline, r.ioaiBaseline ?? r.answer, ...r.candidates.map((c) => c.g)]) {
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
