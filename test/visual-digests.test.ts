import { describe, expect, test } from "bun:test";
import sharp from "sharp";
import type { Locator, Page } from "@playwright/test";
import { alignedVisualDimensions, assertPixelDigest, assertVisualDimensions, attachVisualDigest, digestUpdateRequested, fractionalOriginClip, pixelDigest, stablePixelDigest } from "../e2e/support/visual-digests.ts";

const image = (red = 12, width = 2, height = 3, compressionLevel = 6) =>
  sharp({ create: { width, height, channels: 4, background: { r: red, g: 34, b: 56, alpha: 1 } } })
    .png({ compressionLevel }).toBuffer();

describe("non-reversible visual verification metadata", () => {
  test("compares decoded pixels independently of PNG encoding", async () => {
    const a = await image(12, 2, 3, 0);
    const b = await image(12, 2, 3, 9);
    expect(a.equals(b)).toBe(false);
    expect(await pixelDigest(a)).toEqual(await pixelDigest(b));
    expect(await pixelDigest(a)).toMatchObject({ width: 2, height: 3, sha256: expect.stringMatching(/^[a-f0-9]{64}$/) });
  });

  test("fails on any pixel change, changed dimensions, or a missing approval", async () => {
    const approved = await pixelDigest(await image());
    expect(() => assertPixelDigest("example", approved, approved)).not.toThrow();
    const repainted = await pixelDigest(await image(13));
    expect(() => assertPixelDigest("example", repainted, approved)).toThrow("Pixel regression");
    // The bytes and hash can be identical while the shape changes.
    const reshaped = await pixelDigest(await image(12, 3, 2));
    expect(reshaped.sha256).toBe(approved.sha256);
    expect(() => assertPixelDigest("example", reshaped, approved)).toThrow("Pixel regression");
    expect(() => assertPixelDigest("example", approved, undefined)).toThrow("Missing approved pixel digest");
  });

  test("the default gate checks approved dimensions and explicitly permits pixel differences", async () => {
    const approved = await pixelDigest(await image());
    const repainted = await pixelDigest(await image(13));
    expect(() => assertVisualDimensions("example", repainted, approved)).not.toThrow();
    const reshaped = await pixelDigest(await image(12, 3, 2));
    expect(() => assertVisualDimensions("example", reshaped, approved)).toThrow("Visual frame dimensions changed");
    expect(() => assertVisualDimensions("example", approved, undefined)).toThrow("Missing approved frame dimensions");
  });

  test("only fractional-origin enclosure can retry an otherwise approved intrinsic extent", () => {
    const expected = { width: 1004, height: 319, sha256: "approved" };
    const actual = { ...expected, height: 320 };
    const box = { x: 252, y: 72.390625, width: 1004, height: 318.8125 };
    expect(fractionalOriginClip(box, actual, expected)).toEqual({ x: 252, y: 72, width: 1004, height: 319 });
    expect(fractionalOriginClip(box, expected, expected)).toBeUndefined();
    expect(fractionalOriginClip(box, { ...actual, height: 321 }, expected)).toBeUndefined();
    expect(fractionalOriginClip({ ...box, y: 72 }, actual, expected)).toBeUndefined();
    expect(fractionalOriginClip({ ...box, height: 319.8125 }, actual, expected)).toBeUndefined();
    expect(fractionalOriginClip({ ...box, width: 1005 }, actual, expected)).toBeUndefined();
    expect(fractionalOriginClip(box, actual, undefined)).toBeUndefined();
  });

  test("a fractional-position retry captures stable live integer bounds", async () => {
    const expected = await pixelDigest(await image());
    const actual = { ...expected, height: 4 };
    const clips: unknown[] = [];
    let measurements = 0;
    const target = {
      boundingBox: async () => { measurements++; return { x: 0, y: 0.390625, width: 2, height: 2.8125 }; },
      page: () => ({ screenshot: async (options: Record<string, unknown>) => { clips.push(options.clip); return image(); } }),
      screenshot: async () => { throw new Error("unexpected unaligned capture"); },
    } as unknown as Locator;
    const result = await alignedVisualDimensions(target, actual, expected);
    expect(result).toEqual(expected);
    expect(measurements).toBe(3);
    expect(clips).toEqual([{ x: 0, y: 0, width: 2, height: 3 }, { x: 0, y: 0, width: 2, height: 3 }]);
  });

  test("matching historical dimensions retain their original capture without a retry", async () => {
    const approved = await pixelDigest(await image());
    const target = { boundingBox: async () => { throw new Error("matching dimensions must not retry"); } } as unknown as Locator;
    expect(await alignedVisualDimensions(target, approved, approved)).toBe(approved);
  });

  test("growth while aligned frames settle is recaptured and fails the approved dimensions", async () => {
    const expected = await pixelDigest(await image());
    const actual = { ...expected, height: 4 };
    let measurements = 0;
    const target = {
      boundingBox: async () => ({ x: 0, y: 0.390625, width: 2, height: ++measurements === 1 ? 2.8125 : 3.8125 }),
      page: () => ({ screenshot: async () => { throw new Error("growth must not reuse the old clip"); } }),
      screenshot: async () => image(12, 2, 5),
    } as unknown as Locator;
    const result = await alignedVisualDimensions(target, actual, expected);
    expect(result.height).toBe(5);
    expect(() => assertVisualDimensions("growing", result, expected)).toThrow("Visual frame dimensions changed");
    expect(measurements).toBe(3);
  });

  test("captures until consecutive decoded frames agree without accepting the first frame", async () => {
    const transient = await image(80);
    const settled = await image();
    const settledReencoded = await image(12, 2, 3, 0);
    const frames = [transient, settled, settledReencoded];
    let calls = 0;
    const actual = await stablePixelDigest(async () => frames[calls++]!);
    expect(calls).toBe(3);
    expect(actual).toEqual(await pixelDigest(settled));
  });

  test("an unstable or overdue capture cannot become an approval", async () => {
    const png = await image();
    await expect(stablePixelDigest(async () => { await Bun.sleep(5); return png; }, 1))
      .rejects.toThrow("did not produce two consecutive identical approved frames");
  });

  test("keeps polling stable transient frames until the approved pixels settle", async () => {
    const transient = await image(80);
    const settled = await image();
    const frames = [transient, transient, settled, settled];
    let calls = 0;
    const approved = await pixelDigest(settled);
    expect(await stablePixelDigest(async () => frames[calls++]!, 10_000, { name: "example", digest: approved })).toEqual(approved);
    expect(calls).toBe(4);
  });

  test("updates require explicit manual review and are always forbidden on CI", () => {
    expect(digestUpdateRequested({})).toBe(false);
    expect(digestUpdateRequested({ E2E_UPDATE_DIGESTS: "reviewed" })).toBe(true);
    expect(() => digestUpdateRequested({ E2E_UPDATE_DIGESTS: "1" })).toThrow("after manually reviewing");
    expect(() => digestUpdateRequested({ CI: "true", E2E_UPDATE_DIGESTS: "reviewed" })).toThrow("forbidden on CI");
  });

  test("diagnostic attachments contain only text digests and never request an image path", async () => {
    const png = await image();
    const attachments: Record<string, unknown>[] = [];
    const target = { screenshot: async (options: Record<string, unknown>) => {
      expect(options).not.toHaveProperty("path");
      return png;
    } } as unknown as Page;
    await attachVisualDigest(target, { attach: async (name, options) => { attachments.push({ name, ...options }); } }, "example");
    expect(attachments).toHaveLength(1);
    expect(attachments[0]).toMatchObject({ name: "example.json", contentType: "application/json" });
    expect(JSON.parse(attachments[0]!.body as string)).toEqual(await pixelDigest(png));
  });
});
