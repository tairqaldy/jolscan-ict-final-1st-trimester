/**
 * G-28: box tags on the detection overlay stay readable on phones and inside
 * the photo. The component lives in components/app; its sizing helpers are
 * pure, so they are tested here with the other unit tests.
 */
import { describe, expect, it } from "vitest";
import { HALO_SCALE, MIN_TAG_PX, placeTag, tagFontSize } from "@/components/app/detection-overlay";

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

describe("box halo (G-48)", () => {
  it("leaves at least 1.5 px of dark rim beside the stroke on a phone", () => {
    const scale = 343 / 1280; // 375 px wide screen
    const stroke = 1280 / 320; // box stroke in viewBox units, as in the overlay
    const rim = ((stroke * HALO_SCALE - stroke) / 2) * scale;
    expect(rim).toBeGreaterThanOrEqual(1.5);
  });
});
