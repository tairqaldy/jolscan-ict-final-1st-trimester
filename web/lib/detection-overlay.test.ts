/**
 * G-28: box tags on the detection overlay stay readable on phones and inside
 * the photo. The component lives in components/app; its sizing helpers are
 * pure, so they are tested here with the other unit tests.
 */
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DetectionOverlay, HALO_SCALE, MIN_TAG_PX, placeTag, placeTags, tagFontSize } from "@/components/app/detection-overlay";
import { getSample } from "@/lib/mock/samples";
import { deriveDetections } from "@/lib/rules";

describe("tagFontSize (G-28)", () => {
  it("keeps the old size before the figure is measured, so server and client match", () => {
    expect(tagFontSize(1280, null)).toBe(1280 / 50);
    expect(tagFontSize(400, null)).toBe(12);
  });

  it("never renders below 11 px on screen on a phone", () => {
    const scale = 341 / 1280; // 375 px wide screen
    expect(tagFontSize(1280, scale) * scale).toBeCloseTo(MIN_TAG_PX, 6);
  });

  it("keeps the laptop size when the old size is already large enough", () => {
    const scale = 650 / 1280; // 1440 px wide screen, result column
    expect(tagFontSize(1280, scale)).toBe(1280 / 50);
  });
});

describe("placeTag (G-28)", () => {
  const frame = { w: 1280, h: 720 };
  const tag = { w: 200, h: 40 };

  it("puts the tag above the box when there is room", () => {
    expect(placeTag({ x: 100, y: 300, h: 50 }, tag, frame)).toEqual({ x: 100, y: 260 });
  });

  it("puts the tag below the box top when the box touches the top edge", () => {
    expect(placeTag({ x: 100, y: 10, h: 50 }, tag, frame)).toEqual({ x: 100, y: 60 });
  });

  it("never runs past the right edge of the photo", () => {
    const { x } = placeTag({ x: 1150, y: 300, h: 50 }, tag, frame);
    expect(x + tag.w).toBeLessThanOrEqual(frame.w);
  });

  it("never runs past the bottom edge of the photo", () => {
    const { y } = placeTag({ x: 100, y: 5, h: 700 }, tag, frame);
    expect(y + tag.h).toBeLessThanOrEqual(frame.h);
  });
});

describe("placeTags (G-28 follow-up)", () => {
  const frame = { w: 1280, h: 720 };
  const overlap = (a: { x: number; y: number }, b: { x: number; y: number }, t: { w: number; h: number }) =>
    a.x < b.x + t.w && b.x < a.x + t.w && a.y < b.y + t.h && b.y < a.y + t.h;

  it("keeps placeTag's spot when tags do not touch", () => {
    const items = [
      { box: { x: 100, y: 300, h: 50 }, tag: { w: 200, h: 40 } },
      { box: { x: 700, y: 500, h: 50 }, tag: { w: 200, h: 40 } },
    ];
    expect(placeTags(items, frame)).toEqual(items.map((it) => placeTag(it.box, it.tag, frame)));
  });

  it("tries below the box first, then inside the box", () => {
    const tag = { w: 200, h: 40 };
    const items = [
      { box: { x: 100, y: 100, h: 20 }, tag }, // tag at y 60
      { box: { x: 100, y: 500, h: 20 }, tag }, // tag at y 460
      { box: { x: 100, y: 100, h: 360 }, tag }, // above and below are taken
      { box: { x: 700, y: 300, h: 20 }, tag },
    ];
    const spots = placeTags(items, frame);
    expect(spots[2]).toEqual({ x: 100, y: 100 });
    expect(placeTags([items[0], { box: { x: 150, y: 110, h: 20 }, tag }], frame)[1]).toEqual({ x: 150, y: 130 });
  });

  it("moves tag 3 off tag 1 on sample s05 at 375 px, inside the photo", () => {
    const sample = getSample("s05")!;
    const font = tagFontSize(1280, 343 / 1280); // 11 px on screen
    const tag = { w: 14 * font * 0.58 + font * 0.8, h: font * 1.5 }; // "1 · 31% review"
    const items = sample.detections.map((d) => ({ box: { x: d.box.x * 1280, y: d.box.y * 720, h: d.box.h * 720 }, tag }));
    // Without avoidance, tag 3 covers the end of tag 1.
    expect(overlap(placeTag(items[0].box, tag, frame), placeTag(items[2].box, tag, frame), tag)).toBe(true);
    const spots = placeTags(items, frame, 4);
    for (let i = 0; i < spots.length; i++) {
      for (let j = i + 1; j < spots.length; j++) expect(overlap(spots[i], spots[j], tag)).toBe(false);
      expect(spots[i].x).toBeGreaterThanOrEqual(0);
      expect(spots[i].y).toBeGreaterThanOrEqual(0);
      expect(spots[i].x + tag.w).toBeLessThanOrEqual(frame.w);
      expect(spots[i].y + tag.h).toBeLessThanOrEqual(frame.h);
    }
  });
});

describe("dashed review boxes (G-47 follow-up)", () => {
  // Server render: no draw-in, the same markup as with reduced motion.
  const sample = getSample("s05")!;
  const html = renderToStaticMarkup(
    createElement(DetectionOverlay, {
      imageWidth: sample.imageWidth,
      imageHeight: sample.imageHeight,
      detections: sample.detections,
      derived: deriveDetections(sample.detections),
      alt: "s05",
    }),
  );
  const rects = html.match(/<rect [^>]*>/g) ?? [];

  it("draws review boxes with the dash pattern, not motion's single dash", () => {
    const review = rects.filter((r) => r.includes('stroke="var(--box-review)"'));
    expect(review).toHaveLength(2);
    for (const r of review) {
      expect(r).toContain('stroke-dasharray="16 10"');
      expect(r).not.toMatch(/pathLength/i);
    }
  });

  it("keeps counted boxes solid", () => {
    const counted = rects.filter((r) => r.includes('stroke="var(--box)"'));
    expect(counted).toHaveLength(1);
    expect(counted[0]).not.toContain('stroke-dasharray="16 10"');
  });
});

describe("box halo (G-48)", () => {
  it("leaves at least 1.5 px of dark rim beside the stroke on a phone", () => {
    const scale = 343 / 1280; // 375 px wide screen
    const stroke = 1280 / 320; // box stroke in viewBox units, as in the overlay
    const rim = ((stroke * HALO_SCALE - stroke) / 2) * scale;
    expect(rim).toBeGreaterThanOrEqual(1.5);
  });
});
