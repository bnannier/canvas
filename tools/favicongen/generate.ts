/*
 * Favicon generator. Bakes the Canvas mark (docs/src/brand/canvas-mark-geometry.ts, the
 * same geometry the in-app <CanvasMark/> logo draws) into the docs' two favicon assets:
 *
 *   docs/assets/images/favicon.png  the source Expo rasterizes into the shipped favicon
 *   docs/public/favicon.svg         the vector mark, crisp at any size
 *
 * Run: bun run favicon:gen
 *
 * On `expo export -p web`, app.json's `web.favicon` points at the PNG; Expo contains it to
 * 48x48, encodes 16/32/48 into dist/favicon.ico and injects
 * `<link rel="icon" href="{baseUrl}/favicon.ico">`. That baseUrl prefix is why the PNG
 * stays the source of truth rather than a hand-authored public/favicon.ico: Expo consumes
 * a public/favicon.ico verbatim but then skips the link tag, and the bare
 * browser-convention request for /favicon.ico misses under the Pages subpath (/canvas/).
 *
 * Rasterizing needs a real renderer, so the PNG is screenshotted out of headless chromium
 * (playwright, already a devDependency) rather than shelling out to a separate image tool.
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { chromium } from "playwright";
import {
  MARK_PATHS,
  MARK_OFFSET_X,
  MARK_VIEWBOX,
  buildSectors,
} from "../../docs/src/brand/canvas-mark-geometry.ts";

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, "../..");

// Expo contains the source to 48x48 before encoding the .ico, so this only needs to be
// comfortably above that; 512 is the conventional source-icon size and downsamples clean.
const PNG_SIZE = 512;

// Closes the sub-pixel seams between abutting sectors, which a 512px raster would
// otherwise magnify into visible radial hairlines. See buildSectors.
const SECTOR_OVERLAP_DEG = 0.35;

function markSvg(size: number, overlapDeg: number): string {
  const clip = MARK_PATHS.map((d) => `<path d="${d}"/>`).join("");
  const sectors = buildSectors(overlapDeg)
    .map((s) => `<path d="${s.d}" fill="${s.color}"/>`)
    .join("");
  return (
    `<svg width="${size}" height="${size}" viewBox="0 0 ${MARK_VIEWBOX} ${MARK_VIEWBOX}" fill="none" xmlns="http://www.w3.org/2000/svg">` +
    `<defs><clipPath id="canvas-mark">${clip}</clipPath></defs>` +
    `<g transform="translate(${MARK_OFFSET_X}, 0)" clip-path="url(#canvas-mark)">${sectors}</g>` +
    `</svg>`
  );
}

const svgPath = resolve(repo, "docs/public/favicon.svg");
writeFileSync(svgPath, markSvg(MARK_VIEWBOX, SECTOR_OVERLAP_DEG) + "\n");
console.log(`wrote ${svgPath}`);

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: PNG_SIZE, height: PNG_SIZE } });
  await page.setContent(
    `<body style="margin:0">${markSvg(PNG_SIZE, SECTOR_OVERLAP_DEG)}</body>`,
  );
  const pngPath = resolve(repo, "docs/assets/images/favicon.png");
  // omitBackground keeps the mark on transparency; Expo composites it onto whatever the
  // browser tab is, light or dark.
  await page.screenshot({ path: pngPath, omitBackground: true });
  console.log(`wrote ${pngPath} (${PNG_SIZE}x${PNG_SIZE})`);
} finally {
  await browser.close();
}
