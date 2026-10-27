// Bakes the v4 hand-off's grain tile into the PNGs the docs tile over the page
// (audit/v4-redesign/PLAN.md, decision S6).
//
//   bun tools/v4/bake-grain.ts            write docs/assets/images/grain.png, @2x, @3x and grain.bake.json
//   bun tools/v4/bake-grain.ts --check    fail when the committed PNGs are not what a bake draws
//
// react-native-svg renders no `FeTurbulence`, so the noise cannot be drawn at runtime on
// iOS or Android. The bake renders the hand-off's own SVG (`grainSvg()`, built from the
// `GRAIN` table in docs/src/shell/page-look.ts, the tunable) the way the hand-off paints
// it: a CSS background image of one 180 px tile, in Playwright's Chromium, at each device
// pixel ratio in `GRAIN.scales`, with a transparent page so the noise keeps its alpha. Each
// PNG is that tile at 180 CSS px times the scale, so `require("grain.png")` resolves to
// the density the device asks for.
//
// The manifest records the table the bake read and a SHA-256 of each PNG's decoded RGBA
// pixels, so test/docs-page-look.test.ts can hold the committed files to the table without
// launching a browser, and `--check` re-bakes and compares pixels.

import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { chromium } from "playwright";
import sharp from "sharp";
import { GRAIN, grainSvg } from "../../docs/src/shell/page-look.ts";

const OUT = resolve(import.meta.dir, "../../docs/assets/images");
const MANIFEST = join(OUT, "grain.bake.json");
const check = process.argv.includes("--check");

/** The file name a scale bakes to: grain.png, grain@2x.png, grain@3x.png. */
export function grainFile(scale: number): string {
  return scale === 1 ? "grain.png" : `grain@${scale}x.png`;
}

/** SHA-256 of a PNG's decoded RGBA pixels, with its size. */
export async function pixelHash(png: Buffer): Promise<{ width: number; height: number; sha256: string }> {
  const { data, info } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { width: info.width, height: info.height, sha256: createHash("sha256").update(data).digest("hex") };
}

async function bake(): Promise<Map<number, Buffer>> {
  const uri = `data:image/svg+xml,${encodeURIComponent(grainSvg())}`;
  const browser = await chromium.launch();
  const out = new Map<number, Buffer>();
  try {
    for (const scale of GRAIN.scales) {
      const context = await browser.newContext({ viewport: { width: 400, height: 400 }, deviceScaleFactor: scale });
      const page = await context.newPage();
      await page.setContent(
        `<!doctype html><html><body style="margin:0;background:transparent">` +
          `<div id="t" style="width:${GRAIN.tile}px;height:${GRAIN.tile}px;background-image:url(&quot;${uri}&quot;);background-size:${GRAIN.tile}px ${GRAIN.tile}px"></div>` +
          `</body></html>`,
      );
      await page.waitForFunction(() => document.readyState === "complete");
      await page.waitForTimeout(200);
      out.set(scale, await page.locator("#t").screenshot({ omitBackground: true, animations: "disabled" }));
      await context.close();
    }
  } finally {
    await browser.close();
  }
  return out;
}

if (import.meta.main) {
  const baked = await bake();
  const files: Record<string, { scale: number; width: number; height: number; sha256: string }> = {};
  for (const [scale, png] of baked) {
    const hash = await pixelHash(png);
    if (hash.width !== GRAIN.tile * scale || hash.height !== GRAIN.tile * scale) {
      throw new Error(`grain at ${scale}x baked ${hash.width} x ${hash.height}, not ${GRAIN.tile * scale} square`);
    }
    files[grainFile(scale)] = { scale, ...hash };
  }
  const manifest = { svg: grainSvg(), grain: GRAIN, files };
  if (check) {
    const stale: string[] = [];
    for (const [name, want] of Object.entries(files)) {
      const path = join(OUT, name);
      if (!existsSync(path)) {
        stale.push(`${name} is missing`);
        continue;
      }
      const have = await pixelHash(readFileSync(path));
      if (have.sha256 !== want.sha256) stale.push(`${name} differs from a fresh bake`);
    }
    if (!existsSync(MANIFEST) || readFileSync(MANIFEST, "utf8") !== `${JSON.stringify(manifest, null, 2)}\n`) stale.push("grain.bake.json is stale");
    if (stale.length) {
      console.error(`The grain is stale; run bun tools/v4/bake-grain.ts:\n  ${stale.join("\n  ")}`);
      process.exit(1);
    }
    console.log("grain: the committed PNGs are the bake's output");
  } else {
    for (const [scale, png] of baked) writeFileSync(join(OUT, grainFile(scale)), png);
    writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
    for (const [name, f] of Object.entries(files)) console.log(`${name} ${f.width} x ${f.height} ${f.sha256.slice(0, 12)}`);
  }
}
