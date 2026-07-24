/*
 * App icon generator. Bakes the Canvas mark (docs/src/brand/canvas-mark-geometry.ts, the
 * same geometry the in-app <CanvasMark/> logo and the favicon both draw) into every
 * launcher and store icon, so the app icon can never drift from the brand the way the
 * previous blue chevron had:
 *
 *   docs/assets/images/icon.png                       1024, OPAQUE, iOS + the Expo source icon
 *   docs/assets/images/android-icon-foreground.png     512, alpha, adaptive icon foreground
 *   docs/assets/images/android-icon-background.png     512, OPAQUE, adaptive icon background
 *   docs/assets/images/android-icon-monochrome.png     512, alpha, Android 13+ themed icon
 *   store/assets/appstore-icon-1024.png               1024, OPAQUE, App Store upload artifact
 *   store/assets/play-icon-512.png                     512, OPAQUE, Play listing artifact
 *
 * Run: bun run appicon:gen
 *
 * Two hard store rules drive the alpha handling below. App Store Connect REJECTS a 1024
 * marketing icon that carries an alpha channel, so every opaque output is flattened and
 * written without one. Android adaptive foregrounds are the opposite: they must keep
 * transparency, because the launcher composites them over the background layer and masks
 * the result to whatever shape the OEM uses.
 *
 * Rasterizing needs a real renderer, so these are screenshotted out of headless chromium
 * (playwright, already a devDependency), matching tools/favicongen/generate.ts.
 */
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { chromium, type Browser } from "playwright";
import {
  MARK_PATHS,
  MARK_OFFSET_X,
  MARK_VIEWBOX,
  buildSectors,
} from "../../docs/src/brand/canvas-mark-geometry.ts";

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, "../..");

// The brand's near-black, the same value app.json already used for the adaptive icon
// background, so the launcher background layer and the iOS icon share one surface color.
const BRAND_DARK = "#0B0B0F";

// Closes the sub-pixel seams between abutting sectors, which a large raster would
// otherwise magnify into visible radial hairlines. See buildSectors.
const SECTOR_OVERLAP_DEG = 0.35;

// How much of the canvas the mark occupies.
// iOS renders the icon full bleed and masks it to a squircle, so the mark stays well
// inside the corner radius. Android only guarantees the CENTER 66 of 108dp survives
// masking (61%), so the adaptive layers sit a little tighter still.
const IOS_MARK_SCALE = 0.56;
const ANDROID_MARK_SCALE = 0.52;

function markSvg(scale: number, mono: string | null): string {
  const clip = MARK_PATHS.map((d) => `<path d="${d}"/>`).join("");
  // Monochrome (Android themed icons) is the silhouette alone: the launcher tints it, so
  // the rainbow sweep is replaced by one flat fill rather than being drawn and recolored.
  // The six arcs are concatenated into ONE path element rather than drawn as six, because
  // six abutting fills each antialias their own edge and leave hairline seams along every
  // shared boundary. As subpaths of a single path they are one nonzero fill, so the
  // silhouette rasterizes seamlessly. (The colored sweep solves the same problem with
  // SECTOR_OVERLAP_DEG, which it needs because its sectors carry different fills.)
  const body = mono
    ? `<g transform="translate(${MARK_OFFSET_X}, 0)"><path d="${MARK_PATHS.join(" ")}" fill="${mono}"/></g>`
    : `<defs><clipPath id="m">${clip}</clipPath></defs>` +
      `<g transform="translate(${MARK_OFFSET_X}, 0)" clip-path="url(#m)">` +
      buildSectors(SECTOR_OVERLAP_DEG).map((s) => `<path d="${s.d}" fill="${s.color}"/>`).join("") +
      `</g>`;
  const pct = (scale * 100).toFixed(2);
  return (
    `<svg viewBox="0 0 ${MARK_VIEWBOX} ${MARK_VIEWBOX}" xmlns="http://www.w3.org/2000/svg" ` +
    `style="width:${pct}%;height:${pct}%;position:absolute;left:50%;top:50%;transform:translate(-50%,-50%)">${body}</svg>`
  );
}

// A soft bloom of the mark's own hues behind it, echoing the aurora the docs hero puts
// behind the logo. Kept low-alpha and well inside the edge so the icon still reads as a
// clean mark at 40px on a home screen rather than a smear of color.
const BLOOM =
  `<div style="position:absolute;left:50%;top:50%;width:78%;height:78%;` +
  `transform:translate(-50%,-50%);border-radius:50%;filter:blur(56px);opacity:.42;` +
  `background:conic-gradient(from 90deg,#b24dff,#ff2d6e,#ff6a4d,#ffb43d,#27cdf2,#46e082,#b24dff)"></div>`;

interface Spec {
  out: string;
  size: number;
  opaque: boolean;
  scale: number;
  mono?: string;
  bloom?: boolean;
  markless?: boolean;
}

const SPECS: Spec[] = [
  { out: "docs/assets/images/icon.png", size: 1024, opaque: true, scale: IOS_MARK_SCALE, bloom: true },
  { out: "store/assets/appstore-icon-1024.png", size: 1024, opaque: true, scale: IOS_MARK_SCALE, bloom: true },
  { out: "store/assets/play-icon-512.png", size: 512, opaque: true, scale: IOS_MARK_SCALE, bloom: true },
  { out: "docs/assets/images/android-icon-foreground.png", size: 512, opaque: false, scale: ANDROID_MARK_SCALE },
  { out: "docs/assets/images/android-icon-monochrome.png", size: 512, opaque: false, scale: ANDROID_MARK_SCALE, mono: "#FFFFFF" },
  { out: "docs/assets/images/android-icon-background.png", size: 512, opaque: true, scale: 0, markless: true },
];

async function render(browser: Browser, spec: Spec): Promise<void> {
  const page = await browser.newPage({ viewport: { width: spec.size, height: spec.size } });
  const layers =
    (spec.opaque && spec.bloom ? BLOOM : "") + (spec.markless ? "" : markSvg(spec.scale, spec.mono ?? null));
  await page.setContent(
    `<body style="margin:0;width:${spec.size}px;height:${spec.size}px;position:relative;overflow:hidden;` +
      `background:${spec.opaque ? BRAND_DARK : "transparent"}">${layers}</body>`,
  );
  const path = resolve(repo, spec.out);
  mkdirSync(dirname(path), { recursive: true });
  // omitBackground only for the layers that must keep alpha; the opaque ones are captured
  // over the real background so no alpha channel is ever written (App Store rule above).
  await page.screenshot({ path, omitBackground: !spec.opaque });
  await page.close();
  console.log(`wrote ${spec.out} (${spec.size}x${spec.size}, ${spec.opaque ? "opaque" : "alpha"})`);
}

// The Play listing's feature graphic: a 1024x500 banner, which Google requires to be fully
// opaque. It is brand-forward rather than a screenshot collage, because Play renders it as
// a wide header where the mark and name have to register at a glance. Geist is loaded
// straight from the docs app's own font package so the wordmark matches the product.
const GEIST = (weight: string) =>
  `file://${resolve(repo, `docs/node_modules/@expo-google-fonts/geist/${weight}/Geist_${weight}.ttf`)}`;

function featureGraphicHtml(w: number, h: number): string {
  return (
    `<style>` +
    `@font-face{font-family:Geist;font-weight:700;src:url('${GEIST("700Bold")}')}` +
    `@font-face{font-family:Geist;font-weight:400;src:url('${GEIST("400Regular")}')}` +
    // Centered, not left aligned: Play crops the feature graphic's edges on some surfaces,
    // so the mark and wordmark have to sit in the middle to survive it.
    `body{margin:0;width:${w}px;height:${h}px;background:${BRAND_DARK};position:relative;` +
    `overflow:hidden;display:flex;align-items:center;justify-content:center;gap:56px;` +
    `padding:0 76px;box-sizing:border-box;font-family:Geist,sans-serif}` +
    `</style>` +
    // Bloom anchored behind the mark, mirroring the icon's treatment.
    `<div style="position:absolute;left:33%;top:50%;width:420px;height:420px;` +
    `transform:translate(-50%,-50%);border-radius:50%;filter:blur(80px);opacity:.38;` +
    `background:conic-gradient(from 90deg,#b24dff,#ff2d6e,#ff6a4d,#ffb43d,#27cdf2,#46e082,#b24dff)"></div>` +
    `<div style="position:relative;width:210px;height:210px;flex:none">${markSvg(1, null)}</div>` +
    `<div style="position:relative;min-width:0">` +
    `<div style="font-weight:700;font-size:86px;line-height:1;color:#fff;letter-spacing:-2px">Canvas</div>` +
    `<div style="font-weight:400;font-size:31px;line-height:1.35;color:#A1A1AA;margin-top:18px">` +
    `One component API.<br/>Three native looks.</div>` +
    `</div>`
  );
}

const browser = await chromium.launch();
try {
  for (const spec of SPECS) await render(browser, spec);

  const page = await browser.newPage({ viewport: { width: 1024, height: 500 } });
  await page.setContent(featureGraphicHtml(1024, 500));
  await page.waitForTimeout(400); // let the @font-face files load before the capture
  const fg = resolve(repo, "store/assets/play-feature-graphic-1024x500.png");
  await page.screenshot({ path: fg });
  await page.close();
  console.log("wrote store/assets/play-feature-graphic-1024x500.png (1024x500, opaque)");
} finally {
  await browser.close();
}
