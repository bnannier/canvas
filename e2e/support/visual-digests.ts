/** Approved frame dimensions and optional strict pixel diagnostics, without images. */
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import sharp from "sharp";
import type { Locator, Page, TestInfo } from "@playwright/test";

export interface PixelDigest {
  width: number;
  height: number;
  sha256: string;
}

interface DigestFile {
  format: "sha256-srgb-rgba8-v1";
  digests: Record<string, PixelDigest>;
}

const DIGESTS_PATH = resolve(__dirname, "../visual/pixel-digests.json");

/** Decode to canonical sRGB RGBA bytes: PNG compression/metadata cannot affect it. */
export async function pixelDigest(png: Buffer): Promise<PixelDigest> {
  const { data, info } = await sharp(png).toColourspace("srgb").ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { width: info.width, height: info.height, sha256: createHash("sha256").update(data).digest("hex") };
}

const samePixels = (a: PixelDigest, b: PixelDigest) =>
  a.width === b.width && a.height === b.height && a.sha256 === b.sha256;

/** Two consecutive identical decoded frames are required; an unstable view fails. */
export async function stablePixelDigest(capture: (remainingMs: number) => Promise<Buffer>, timeout = 10_000, approved?: { name: string; digest: PixelDigest }): Promise<PixelDigest> {
  const deadline = Date.now() + timeout;
  let previous: PixelDigest | undefined;
  let lastStable: PixelDigest | undefined;
  let polls = 0;
  while (Date.now() < deadline) {
    let png: Buffer;
    try {
      png = await capture(Math.max(1, deadline - Date.now()));
    } catch (error) {
      if (error instanceof Error && error.name === "TimeoutError" && Date.now() >= deadline) break;
      throw error;
    }
    const current = await pixelDigest(png);
    if (Date.now() > deadline) break;
    if (previous && samePixels(previous, current)) {
      lastStable = current;
      if (!approved || samePixels(current, approved.digest)) return current;
    }
    previous = current;
    // Match Playwright's state-polling cadence. Yielding between comparisons lets
    // pending image rasterization and compositor updates settle instead of keeping
    // the renderer busy with uninterrupted screenshot requests.
    const delay = Math.min(approved ? [100, 250, 500][Math.min(polls++, 2)]! : 100, Math.max(0, deadline - Date.now()));
    if (delay > 0) await new Promise((resume) => setTimeout(resume, delay));
  }
  if (approved && lastStable) assertPixelDigest(approved.name, lastStable, approved.digest);
  throw new Error(`Visual capture did not produce two consecutive identical approved frames within ${timeout}ms. No digest was updated.`);
}

export function assertPixelDigest(name: string, actual: PixelDigest, expected: PixelDigest | undefined): void {
  if (!expected) throw new Error(`Missing approved pixel digest: ${name}. Review the live view before explicitly updating digests locally.`);
  if (!samePixels(actual, expected)) {
    throw new Error(`Pixel regression: ${name}\nExpected ${expected.width}x${expected.height} SHA256 ${expected.sha256}\nReceived ${actual.width}x${actual.height} SHA256 ${actual.sha256}\nNo screenshots or image diffs were saved. Review the live view; failures never accept new digests.`);
  }
}

/** The default gate preserves geometry coverage, not color or individual pixels. */
export function assertVisualDimensions(name: string, actual: PixelDigest, expected: PixelDigest | undefined): void {
  if (!expected) throw new Error(`Missing approved frame dimensions: ${name}. Review the live view before explicitly updating metadata locally.`);
  if (actual.width !== expected.width || actual.height !== expected.height) {
    throw new Error(`Visual frame dimensions changed: ${name}\nExpected ${expected.width}x${expected.height}\nReceived ${actual.width}x${actual.height}\nNo images were saved and no approval was updated.`);
  }
}

type CaptureBox = { x: number; y: number; width: number; height: number };

/**
 * Playwright encloses an element's fractional origin and far edge independently.
 * A position-only change can therefore add a raster row without growing the box.
 * Allow an integer-origin capture only when that rounding explains the entire
 * mismatch and the live box's own rounded-up extent still matches its approval.
 */
export function fractionalOriginClip(box: CaptureBox, actual: PixelDigest, expected: PixelDigest | undefined): CaptureBox | undefined {
  if (!expected || (actual.width === expected.width && actual.height === expected.height)) return;
  const width = Math.ceil(box.width);
  const height = Math.ceil(box.height);
  if (width !== expected.width || height !== expected.height) return;
  // Match the pinned Playwright enclosingIntRect epsilon, rather than accepting
  // an arbitrary one-pixel difference or forcing the clip to approved dimensions.
  const enclosingWidth = Math.ceil(box.x + box.width - 1e-3) - Math.floor(box.x + 1e-3);
  const enclosingHeight = Math.ceil(box.y + box.height - 1e-3) - Math.floor(box.y + 1e-3);
  if (actual.width !== enclosingWidth || actual.height !== enclosingHeight) return;
  return { x: Math.round(box.x), y: Math.round(box.y), width, height };
}

/** Recheck the live bounds on every frame, so a growing box cannot be cropped away. */
export async function alignedVisualDimensions(target: Locator, actual: PixelDigest, expected: PixelDigest | undefined, timeout?: number): Promise<PixelDigest> {
  if (!expected || (actual.width === expected.width && actual.height === expected.height)) return actual;
  const box = await target.boundingBox();
  if (!box || !fractionalOriginClip(box, actual, expected)) return actual;
  return stablePixelDigest(async (remainingMs) => {
    const current = await target.boundingBox();
    const clip = current ? fractionalOriginClip(current, actual, expected) : undefined;
    const options = { type: "png" as const, animations: "disabled" as const, caret: "hide" as const, timeout: remainingMs };
    return clip ? target.page().screenshot({ ...options, clip }) : target.screenshot(options);
  }, timeout);
}

/** Only the explicit, local reviewed-update command may write text metadata. */
export function digestUpdateRequested(env: NodeJS.ProcessEnv = process.env): boolean {
  const requested = env.E2E_UPDATE_DIGESTS;
  if (!requested) return false;
  if (env.CI) throw new Error("Pixel digest updates are forbidden on CI.");
  if (requested !== "reviewed") throw new Error("Set E2E_UPDATE_DIGESTS=reviewed only after manually reviewing the affected live views.");
  return true;
}

export async function expectVisualDimensions(target: Page | Locator, name: string, options: { fullPage?: boolean; timeout?: number } = {}): Promise<void> {
  const update = digestUpdateRequested();
  const strict = process.env.E2E_STRICT_PIXEL_DIGESTS === "1";
  // Keep the existing Linux font-rasterization contract. Other OSes run the flow.
  if (process.platform !== "linux" && !process.env.E2E_FORCE_VISUAL) {
    if (update) throw new Error("Review and update pixel digests inside the pinned Linux Playwright environment.");
    return;
  }
  const file = JSON.parse(readFileSync(DIGESTS_PATH, "utf8")) as DigestFile;
  if (file.format !== "sha256-srgb-rgba8-v1") throw new Error("Unsupported pixel digest format.");
  const expected = file.digests[name];
  let actual = await stablePixelDigest((remainingMs) => target.screenshot({
    type: "png", animations: "disabled", caret: "hide", timeout: remainingMs,
    ...(options.fullPage === undefined ? {} : { fullPage: options.fullPage }),
  }), options.timeout, strict && !update && expected ? { name, digest: expected } : undefined);
  if (!update) {
    // Preserve historical captures, strict pixel diagnostics, and reviewed updates.
    // Only a default element-frame mismatch may retry with live integer bounds.
    if (!strict && "boundingBox" in target) actual = await alignedVisualDimensions(target, actual, expected, options.timeout);
    assertVisualDimensions(name, actual, expected);
    if (strict) assertPixelDigest(name, actual, expected);
    return;
  }
  // The update command runs one worker; read afresh to preserve earlier updates.
  file.digests[name] = actual;
  file.digests = Object.fromEntries(Object.entries(file.digests).sort(([a], [b]) => a.localeCompare(b, "en")));
  writeFileSync(DIGESTS_PATH, `${JSON.stringify(file, null, 2)}\n`);
}

/** Failure diagnostics retain one-way text metadata instead of image attachments. */
export async function attachVisualDigest(target: Page | Locator, info: Pick<TestInfo, "attach">, name: string, options: { fullPage?: boolean } = {}): Promise<void> {
  const pixels = await pixelDigest(await target.screenshot({ ...options, animations: "disabled", caret: "hide" }));
  await info.attach(`${name}.json`, { body: JSON.stringify(pixels, null, 2), contentType: "application/json" });
}
