/**
 * Samples the colours the design hand-off actually PAINTS, by rendering its own guideline cards
 * in a browser and reading the pixels back.
 *
 * Why this exists, when validate-tokens already compares colours: that check reads
 * styles/tokens/colors.css and src/style/tokens.ts, and both of those live behind this commit. It
 * can only prove they agree with each other. That is exactly the property that let the `--ring`
 * error survive — the CSS and the JS matched perfectly while both diverged from the design source
 * for as long as they agreed. This reads the hand-off's own files, which is the one input nobody
 * here can edit into agreement.
 *
 * Rendering rather than parsing is the other half. A text parse gets `var()` chains,
 * `color-mix(in oklab, …)` and out-of-gamut clipping wrong; the browser resolves all three, and a
 * painted pixel is what a user sees. The swatch's inline style says WHICH token it is; the
 * screenshot says what that token became.
 *
 * Usage:
 *   bun tools/render-parity/sample-colors.ts --handoff /path/to/canvas-react
 *   bun tools/render-parity/sample-colors.ts --handoff <path> --out samples.json
 */

import { createServer, type Server } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { chromium, type Browser, type Page } from "@playwright/test";
import sharp from "sharp";

export interface ColorSample {
  /** The custom property the swatch paints, e.g. "destructive". */
  token: string;
  /** The card it was sampled from, e.g. "colors-semantic". */
  card: string;
  /** The painted pixel, lowercase hex. */
  hex: string;
}

const MIME: Record<string, string> = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
};

/**
 * A static server rooted at the hand-off export. The cards link `../styles.css` and pull tokens
 * through it, so they must be served from the export root rather than opened as file:// (where the
 * relative import resolves but the sheet is treated as opaque by some engines).
 */
export function serveDir(root: string): Promise<{ origin: string; close: () => Promise<void> }> {
  const server: Server = createServer(async (req, res) => {
    try {
      const rel = normalize(decodeURIComponent((req.url ?? "/").split("?")[0])).replace(/^(\.\.[/\\])+/, "");
      const file = join(root, rel);
      const info = await stat(file).catch(() => null);
      const target = info?.isDirectory() ? join(file, "index.html") : file;
      const body = await readFile(target);
      res.writeHead(200, { "content-type": MIME[extname(target)] ?? "application/octet-stream" });
      res.end(body);
    } catch {
      res.writeHead(404).end("not found");
    }
  });
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const addr = server.address();
      const port = typeof addr === "object" && addr ? addr.port : 0;
      resolve({
        origin: `http://127.0.0.1:${port}`,
        close: () => new Promise<void>((done) => server.close(() => done())),
      });
    });
  });
}

/** Read the single pixel at the centre of a box, as painted. */
async function pixelAt(page: Page, box: { x: number; y: number; width: number; height: number }): Promise<string> {
  const clip = { x: box.x + box.width / 2 - 1, y: box.y + box.height / 2 - 1, width: 2, height: 2 };
  const shot = await page.screenshot({ clip });
  const { data } = await sharp(shot).raw().toBuffer({ resolveWithObject: true });
  return `#${[data[0], data[1], data[2]].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

/**
 * Every swatch on a card, as {token, box}. The inline style names the custom property, which is how
 * a painted pixel gets attributed to a token without trusting any of our own files.
 */
async function swatchesOn(page: Page): Promise<{ token: string; box: { x: number; y: number; width: number; height: number } }[]> {
  const found = await page.evaluate(() => {
    const out: { token: string; x: number; y: number; width: number; height: number }[] = [];
    for (const el of Array.from(document.querySelectorAll<HTMLElement>("[style]"))) {
      const m = /background:\s*var\(--([\w-]+)\)/.exec(el.getAttribute("style") ?? "");
      if (!m) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 4 || r.height < 4) continue; // legend dots and rules carry no readable fill
      out.push({ token: m[1], x: r.x, y: r.y, width: r.width, height: r.height });
    }
    return out;
  });
  return found.map(({ token, ...box }) => ({ token, box }));
}

export async function sampleCards(
  handoffRoot: string,
  cards: string[],
  scheme: "light" | "dark",
): Promise<ColorSample[]> {
  const { origin, close } = await serveDir(handoffRoot);
  let browser: Browser | undefined;
  const samples: ColorSample[] = [];
  try {
    browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 900, height: 400 }, deviceScaleFactor: 1 });
    // Keep the check hermetic. The hand-off's fonts.css pulls Geist from the Google Fonts CDN,
    // which would make this depend on the network and stall `networkidle` in CI. Fonts cannot
    // change a swatch's fill, so anything off our own origin is aborted.
    await page.route("**/*", (route) => {
      const url = route.request().url();
      return url.startsWith(origin) || url.startsWith("data:") ? route.continue() : route.abort();
    });
    for (const card of cards) {
      await page.goto(`${origin}/guidelines/${card}.html`, { waitUntil: "networkidle" });
      // The hand-off keys dark off a `.dark` class on the root, never prefers-color-scheme, so the
      // scheme has to be set rather than emulated.
      await page.evaluate((s) => document.documentElement.classList.toggle("dark", s === "dark"), scheme);
      for (const { token, box } of await swatchesOn(page)) {
        samples.push({ token, card, hex: await pixelAt(page, box) });
      }
    }
  } finally {
    await browser?.close();
    await close();
  }
  return samples;
}

/** The colour guideline cards. Brand and semantic carry the tokens; the rest are hue ramps. */
export const COLOR_CARDS = ["colors-brand", "colors-neutral", "colors-semantic"];

if (import.meta.main) {
  const argv = process.argv;
  const at = argv.indexOf("--handoff");
  if (at === -1 || !argv[at + 1]) {
    console.error("usage: bun tools/render-parity/sample-colors.ts --handoff <path-to-export> [--out file.json]");
    process.exit(1);
  }
  const root = argv[at + 1];
  const light = await sampleCards(root, COLOR_CARDS, "light");
  const dark = await sampleCards(root, COLOR_CARDS, "dark");
  const outAt = argv.indexOf("--out");
  const payload = { light, dark };
  if (outAt !== -1 && argv[outAt + 1]) {
    await Bun.write(argv[outAt + 1], `${JSON.stringify(payload, null, 2)}\n`);
    console.log(`Wrote ${argv[outAt + 1]}`);
  }
  console.log(`Sampled ${light.length} light and ${dark.length} dark swatches from ${COLOR_CARDS.length} cards`);
  for (const s of light.slice(0, 8)) console.log(`  light ${s.token.padEnd(22)} ${s.hex}  (${s.card})`);
}
