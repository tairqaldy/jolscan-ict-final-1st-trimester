import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import roads from "@/public/samples/samples.json";
import restrooms from "@/public/samples/restrooms/samples.json";

const publicDir = path.resolve(process.cwd(), "public");
const imageExtensions = new Set([".svg", ".png", ".jpg", ".jpeg", ".webp", ".gif"]);

function checkedPath(file: string, directory: string): string {
  const prefix = `/samples/${directory ? `${directory}/` : ""}`;
  expect(file, `unexpected sample path: ${file}`).toMatch(new RegExp(`^${prefix}[^/]+$`));
  const absolute = path.join(publicDir, file);
  expect(existsSync(absolute), `missing sample file: ${file}`).toBe(true);
  return absolute;
}

function expectNoOrphans(directory: string, files: string[]) {
  const folder = path.join(publicDir, "samples", directory);
  const present = readdirSync(folder).filter((name) => imageExtensions.has(path.extname(name).toLowerCase())).sort();
  expect(present, `unreferenced or missing images in ${folder}`).toEqual(files.map((file) => path.basename(file)).sort());
}

describe("sample manifests", () => {
  it("checks road sample images, dimensions and detection bounds", () => {
    expect(new Set(roads.samples.map((s) => s.id)).size).toBe(roads.samples.length);
    for (const sample of roads.samples) {
      const file = checkedPath(sample.file, "");
      expect(sample.imageWidth).toBeGreaterThan(0);
      expect(sample.imageHeight).toBeGreaterThan(0);
      if (sample.file.endsWith(".svg") && existsSync(file)) {
        const tag = readFileSync(file, "utf8").match(/<svg\b[^>]*>/)?.[0] ?? "";
        expect(Number(tag.match(/\bwidth="(\d+)"/)?.[1]), sample.file).toBe(sample.imageWidth);
        expect(Number(tag.match(/\bheight="(\d+)"/)?.[1]), sample.file).toBe(sample.imageHeight);
      }
      expect(new Set(sample.detections.map((d) => d.id)).size, sample.id).toBe(sample.detections.length);
      for (const d of sample.detections) {
        expect(d.label, d.id).toBe("pothole");
        expect(d.confidence, d.id).toBeGreaterThanOrEqual(0);
        expect(d.confidence, d.id).toBeLessThanOrEqual(1);
        expect(d.box.x, d.id).toBeGreaterThanOrEqual(0);
        expect(d.box.y, d.id).toBeGreaterThanOrEqual(0);
        expect(d.box.w, d.id).toBeGreaterThan(0);
        expect(d.box.h, d.id).toBeGreaterThan(0);
        expect(d.box.x + d.box.w, d.id).toBeLessThanOrEqual(1);
        expect(d.box.y + d.box.h, d.id).toBeLessThanOrEqual(1);
      }
    }
    expectNoOrphans("", roads.samples.map((s) => s.file));
  });

  it("checks restroom sets, files, confidence and preset references", () => {
    const ids = new Set(restrooms.samples.map((s) => s.id));
    const sets = new Set(restrooms.sets.map((s) => s.id));
    expect(ids.size).toBe(restrooms.samples.length);
    expect(sets.size).toBe(restrooms.sets.length);
    for (const sample of restrooms.samples) {
      checkedPath(sample.file, "restrooms");
      expect(sets.has(sample.set), sample.id).toBe(true);
      expect(sample.mock.confidence, sample.id).toBeGreaterThanOrEqual(0);
      expect(sample.mock.confidence, sample.id).toBeLessThanOrEqual(1);
    }
    for (const set of sets) {
      expect(restrooms.samples.filter((s) => s.set === set).map((s) => s.trueGender).sort(), set).toEqual(["female", "male"]);
    }
    for (const preset of restrooms.presets) {
      expect(ids.has(preset.a), `${preset.id}: ${preset.a}`).toBe(true);
      expect(ids.has(preset.b), `${preset.id}: ${preset.b}`).toBe(true);
    }
    expectNoOrphans("restrooms", restrooms.samples.map((s) => s.file));
  });
});
