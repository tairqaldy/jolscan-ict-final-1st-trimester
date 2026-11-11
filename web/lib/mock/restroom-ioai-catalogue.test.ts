import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { hasIoaiEmbedding, ioaiSimilarity } from "./restroom-ioai-embeddings";
import { RESTROOM_IOAI_CATALOGUE, RESTROOM_IOAI_GROUPS, RESTROOM_SAMPLES, getRestroomSample, truePartner } from "./restroom-samples";

describe("IOAI sign catalogue", () => {
  it("has unique ids that do not clash with the bundled samples", () => {
    const ids = RESTROOM_IOAI_CATALOGUE.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const s of RESTROOM_SAMPLES) expect(ids).not.toContain(s.id);
  });

  it("counts each group and ships every image", () => {
    for (const g of RESTROOM_IOAI_GROUPS) expect(RESTROOM_IOAI_CATALOGUE.filter((s) => s.group === g.id)).toHaveLength(g.count);
    for (const s of RESTROOM_IOAI_CATALOGUE) expect(existsSync(path.join(__dirname, "../../public", s.file))).toBe(true);
  });

  it("pairs every sign with one sign of the other gender from its restroom", () => {
    for (const s of RESTROOM_IOAI_CATALOGUE) {
      const p = truePartner(s);
      expect(p, s.id).toBeDefined();
      expect(p!.set).toBe(s.set);
      expect(p!.trueGender).not.toBe(s.trueGender);
    }
  });

  it("resolves catalogue ids like samples", () => {
    const s = RESTROOM_IOAI_CATALOGUE[0];
    expect(getRestroomSample(s.id)).toBe(s);
  });

  it("gives every catalogue sign and the bundled IOAI signs a real similarity in 0..1", () => {
    for (const s of RESTROOM_IOAI_CATALOGUE) expect(hasIoaiEmbedding(s.id)).toBe(true);
    for (const s of RESTROOM_SAMPLES.filter((x) => x.id.startsWith("ioai-v"))) expect(hasIoaiEmbedding(s.id)).toBe(true);
    const [a, b] = RESTROOM_IOAI_CATALOGUE;
    expect(ioaiSimilarity(a.id, a.id)).toBe(1);
    const v = ioaiSimilarity(a.id, b.id)!;
    expect(v).toBeGreaterThanOrEqual(0);
    expect(v).toBeLessThanOrEqual(1);
    expect(ioaiSimilarity(a.id, "classic-m")).toBeNull();
  });
});
