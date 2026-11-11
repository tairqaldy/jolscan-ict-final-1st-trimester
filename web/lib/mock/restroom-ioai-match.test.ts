import { describe, expect, it } from "vitest";
import { ioaiGallery } from "./restroom-ioai-galleries";
import { IOAI_GALLERY_MAX, IOAI_LAYER_DISAGREE, IOAI_LAYER_METHODS, IOAI_MATCH_METHODS, SERVED_METHOD, ioaiPicks } from "./restroom-ioai-match";
import { RESTROOM_IOAI_CATALOGUE, truePartner } from "./restroom-samples";

describe("IOAI Match galleries and model picks", () => {
  it("gives every catalogue sign a gallery from its own set with its true partner, at most the API's limit", () => {
    for (const q of RESTROOM_IOAI_CATALOGUE) {
      const g = ioaiGallery(q.id)!;
      expect(g.length).toBeLessThanOrEqual(IOAI_GALLERY_MAX);
      expect(g.map((s) => s.id)).not.toContain(q.id);
      expect(g.every((s) => RESTROOM_IOAI_CATALOGUE.find((c) => c.id === s.id)?.group === q.group)).toBe(true);
      expect(g.map((s) => s.id)).toContain(truePartner(q)!.id);
    }
  });

  it("stores a pick inside the gallery for every model, and the served one exists", () => {
    expect(IOAI_MATCH_METHODS.map((m) => m.id)).toContain(SERVED_METHOD);
    for (const q of RESTROOM_IOAI_CATALOGUE) {
      const ids = new Set(ioaiGallery(q.id)!.map((s) => s.id));
      const picks = ioaiPicks(q.id)!;
      for (const m of IOAI_MATCH_METHODS) if (picks[m.id] !== null) expect(ids.has(picks[m.id]!)).toBe(true);
      expect(picks[SERVED_METHOD]).not.toBeNull();
    }
  });

  it("has a pick in the gallery for 0, 1, 2, 4, 6, 8 and 12 trained blocks, and 0 blocks is zero-shot R1", () => {
    expect(IOAI_LAYER_METHODS.map((m) => m.blocks)).toEqual([0, 1, 2, 4, 6, 8, 12]);
    for (const q of RESTROOM_IOAI_CATALOGUE) {
      const ids = new Set(ioaiGallery(q.id)!.map((s) => s.id));
      const picks = ioaiPicks(q.id)!;
      for (const m of IOAI_LAYER_METHODS) expect(ids.has(picks[m.id]!)).toBe(true);
      expect(picks.L0).toBe(picks.R1);
    }
  });

  it("lists as disagreements only signs of that set that some layer model gets wrong", () => {
    for (const [group, list] of Object.entries(IOAI_LAYER_DISAGREE)) {
      for (const id of list) {
        const q = RESTROOM_IOAI_CATALOGUE.find((s) => s.id === id)!;
        expect(q.group).toBe(group);
        const picks = ioaiPicks(id)!;
        expect(IOAI_LAYER_METHODS.some((m) => picks[m.id] !== truePartner(q)!.id)).toBe(true);
      }
    }
  });

  it("returns null for queries outside the catalogue", () => {
    expect(ioaiGallery("classic-m")).toBeNull();
    expect(ioaiPicks("classic-m")).toBeNull();
  });
});
