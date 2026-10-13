/**
 * Whether the browser the audit captures in really renders a backdrop blur.
 *
 * Every glass cell on the web is the kit's frost, a `backdrop-filter` blur, over the page.
 * Chromium's old headless shell leaves part of that blur unrendered: text behind a frosted
 * card stays sharp in the photograph, and every contrast the analysis reads off a glass
 * cell is read through a frost the user never sees (tools/native/liquid-motion.md, GLS-1;
 * the GlassSurface turn found the audit had been capturing that way). It fails only once the
 * content behind the frost has scrolled, as every docs page has: over a page at rest the old
 * shell blurs as the new mode does. The capture runs in the new headless mode
 * (`channel: "chromium"`, playwright.audit.config.ts), and the global setup asks this before
 * any cell: a fixed frosted panel over black-on-white text scrolled under it, whose
 * strongest step between neighbouring pixels must fall well below the bare text's beside it
 * (measured 2026-10-13: about 0.6 of it in the old shell, 0.03 in the new mode).
 */
import { chromium, type LaunchOptions } from "@playwright/test";
import sharp from "sharp";

/** Bare text's strongest neighbour step is the whole black-to-white range; a 24 px frost leaves a fraction. */
export const BLUR_SHARPNESS_LIMIT = 0.2;

const LINES = Array.from({ length: 14 }, (_, i) => (i % 2 ? "IIII MMMM IIII MMMM" : "MMMM IIII MMMM IIII")).join("<br>");
const PAGE = `<!doctype html><html><body style="margin:0;background:#fff">
<div style="font:700 28px/1.2 sans-serif;color:#000;height:1200px">${LINES}</div>
<div id="frost" style="position:fixed;left:20px;top:20px;width:180px;height:180px;background:rgba(255,255,255,0.1);-webkit-backdrop-filter:blur(24px);backdrop-filter:blur(24px)"></div>
</body></html>`;

/** The strongest luminance step between horizontal neighbours in an RGBA picture, 0 to 1. */
export function strongestStep(pixels: Uint8Array | Buffer, width: number, height: number): number {
  let strongest = 0;
  const luminance = (i: number) => (0.2126 * pixels[i] + 0.7152 * pixels[i + 1] + 0.0722 * pixels[i + 2]) / 255;
  for (let y = 0; y < height; y++) {
    for (let x = 1; x < width; x++) {
      const i = (y * width + x) * 4;
      strongest = Math.max(strongest, Math.abs(luminance(i) - luminance(i - 4)));
    }
  }
  return strongest;
}

async function stepIn(png: Buffer): Promise<number> {
  const { data, info } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return strongestStep(data, info.width, info.height);
}

/**
 * The strongest step under the frost and on the bare text beside it, in the browser
 * `launch` names; `blurs` when the frost's is at most BLUR_SHARPNESS_LIMIT of the text's.
 */
export async function backdropBlurCheck(launch: LaunchOptions): Promise<{ frosted: number; bare: number; blurs: boolean }> {
  const browser = await chromium.launch(launch);
  try {
    const page = await browser.newPage({ viewport: { width: 400, height: 220 }, deviceScaleFactor: 2 });
    await page.setContent(PAGE);
    await page.evaluate(() => document.fonts.ready);
    // The text scrolls under the fixed frost, as a docs page does under an open card.
    await page.evaluate(() => window.scrollTo(0, 120));
    await page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))));
    const frosted = await stepIn(await page.screenshot({ clip: { x: 28, y: 28, width: 164, height: 164 } }));
    const bare = await stepIn(await page.screenshot({ clip: { x: 220, y: 20, width: 180, height: 180 } }));
    return { frosted, bare, blurs: bare > 0 && frosted <= bare * BLUR_SHARPNESS_LIMIT };
  } finally {
    await browser.close();
  }
}
