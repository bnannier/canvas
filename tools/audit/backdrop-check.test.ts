import { describe, expect, it } from "bun:test";
import { BLUR_SHARPNESS_LIMIT, strongestStep } from "../../e2e/audit/backdrop-check.ts";

// The audit's capture refuses a browser that leaves a backdrop blur unrendered; the measure
// is the strongest luminance step between horizontal neighbours.

function picture(row: number[]): Uint8Array {
  const pixels = new Uint8Array(row.length * 4);
  row.forEach((value, i) => pixels.set([value, value, value, 255], i * 4));
  return pixels;
}

describe("the backdrop check's sharpness measure", () => {
  it("reads sharp black-on-white text as the whole range", () => {
    expect(strongestStep(picture([255, 255, 0, 0, 255]), 5, 1)).toBeCloseTo(1, 5);
  });

  it("reads a blurred ramp as a small step, under the limit", () => {
    const ramp = picture([255, 245, 235, 225, 215, 205]);
    expect(strongestStep(ramp, 6, 1)).toBeLessThan(BLUR_SHARPNESS_LIMIT);
  });

  it("reads a flat picture as no step", () => {
    expect(strongestStep(picture([128, 128, 128]), 3, 1)).toBe(0);
  });
});
