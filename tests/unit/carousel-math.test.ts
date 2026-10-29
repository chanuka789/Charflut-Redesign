import { describe, expect, it } from "vitest";
import { nearestIndex, shortestDelta, slideDepth, slideDistance, wrapIndex } from "@/lib/carousel-math";

describe("wrapIndex", () => {
  it("wraps negatives and overflow", () => {
    expect(wrapIndex(-1, 6)).toBe(5);
    expect(wrapIndex(6, 6)).toBe(0);
    expect(wrapIndex(13, 6)).toBe(1);
  });
});

describe("slideDistance", () => {
  it("takes the short way round in loop mode", () => {
    expect(slideDistance(5, 0, 6, true)).toBe(-1);
    expect(slideDistance(1, 0, 6, true)).toBe(1);
    expect(slideDistance(0, 5.5, 6, true)).toBeCloseTo(0.5);
  });
  it("is linear without looping", () => {
    expect(slideDistance(5, 0, 6, false)).toBe(5);
  });
});

describe("shortestDelta", () => {
  it("goes backwards across the seam", () => {
    expect(shortestDelta(0, 5, 6, true)).toBe(-1);
    expect(shortestDelta(5, 0, 6, true)).toBe(1);
    expect(shortestDelta(1, 3, 6, true)).toBe(2);
  });
});

describe("nearestIndex", () => {
  it("rounds and wraps", () => {
    expect(nearestIndex(5.6, 6, true)).toBe(0);
    expect(nearestIndex(-0.4, 6, true)).toBe(0);
    expect(nearestIndex(-0.6, 6, true)).toBe(5);
    expect(nearestIndex(9, 6, false)).toBe(5);
  });
});

describe("slideDepth", () => {
  const opts = { spacing: 200, radius: 2, maxBlur: 6 };
  it("keeps the centre slide sharp and full size", () => {
    const d = slideDepth(0, opts);
    expect(d).toMatchObject({ x: 0, scale: 1, opacity: 1, blur: 0, visible: true });
  });
  it("shrinks, blurs and fades with distance, symmetrically", () => {
    const one = slideDepth(1, opts);
    const two = slideDepth(2, opts);
    expect(two.scale).toBeLessThan(one.scale);
    expect(two.blur).toBeGreaterThan(one.blur);
    expect(two.opacity).toBeLessThan(one.opacity);
    expect(slideDepth(-1, opts).x).toBe(-one.x);
    expect(two.zIndex).toBeLessThan(one.zIndex);
  });
  it("hides slides beyond the radius", () => {
    expect(slideDepth(3, opts).visible).toBe(false);
  });
});
