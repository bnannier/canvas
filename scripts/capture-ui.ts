/**
 * Multi-mode UI capture for visual verification of the docs app chrome + pages.
 * Screenshots every route in 3 modes: desktop-dark, desktop-light, mobile-dark.
 * Output: test/ui/<mode>/<kind>-<slug>.png
 *
 * Prerequisites:
 *   - The docs web server BASE points at: `bun run dev` in docs/ (serves Metro on 8081).
 *   - Playwright's browser, downloaded once per machine: `npx playwright install chromium`.
 *     Without it chromium.launch() dies with "Executable doesn't exist ... chrome-headless-shell".
 *
 * Usage:
 *   bun scripts/capture-ui.ts                                  # every route, every mode
 *   bun scripts/capture-ui.ts --only=button,inbox              # a subset of routes, by slug
 *   bun scripts/capture-ui.ts --modes=desktop-light            # a subset of modes
 *   BASE=<docs web server URL> bun scripts/capture-ui.ts
 */
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { chromium, type Page } from "@playwright/test";
import navConfig from "../docs/src/data/nav.config.json";

const ROOT = join(import.meta.dir, "..");
const OUT = join(ROOT, "test", "ui");
const BASE = process.env.BASE ?? "http://localhost:8081";

const arg = (name: string) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split("=")[1];
const only = arg("only")?.split(",").filter(Boolean);
const modeFilter = arg("modes")?.split(",").filter(Boolean);

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

// The route list comes from nav.config.json, the docs' single source of truth for
// navigation: docs/scripts/check-nav-sync.ts holds it equal to the docs core data in
// CI, so it cannot drift out from under this script. It is also plain JSON, which is
// what makes it usable here at all -- the pattern and template data modules compose
// real kit components, so importing them pulls in React Native and no longer parses
// outside Metro. (This script used to import them directly and died on startup.)
interface NavConfig {
  routes: Record<string, { href: string }>;
  web: { sidebar: { base?: string; components?: { slug: string }[] }[] };
}

interface Route { kind: string; slug: string; route: string; }

const nav = navConfig as NavConfig;

// `/` and `/components` keep the names the old hard-coded list gave them; every other
// guide route takes its path, so /tokens/colors files as chrome-tokens-colors.png.
function chromeSlug(href: string): string {
  if (href === "/") return "home";
  if (href === "/components") return "components-index";
  return href.replace(/^\//, "").replace(/\//g, "-");
}

const KIND_BY_BASE: Record<string, string> = {
  "/components": "component",
  "/templates": "template",
  "/patterns": "pattern",
};

// Two real pages the sidebar does not link, kept so the capture still covers every
// route the docs app serves. (The old list also carried /migration, which no longer
// resolves to a route file and only ever captured the not-found page.)
const UNLINKED: Route[] = [
  { kind: "chrome", slug: "tokens", route: "/tokens" },
  { kind: "chrome", slug: "utilities", route: "/utilities" },
];

const routes: Route[] = [
  ...Object.values(nav.routes).map((r) => ({ kind: "chrome", slug: chromeSlug(r.href), route: r.href })),
  ...UNLINKED,
  ...nav.web.sidebar.flatMap((g) =>
    g.base && g.components
      ? g.components.map((c) => ({ kind: KIND_BY_BASE[g.base as string] ?? "page", slug: c.slug, route: `${g.base}/${c.slug}` }))
      : [],
  ),
].filter((r) => !only || only.includes(r.slug));

// ---------------------------------------------------------------------------
// Modes
// ---------------------------------------------------------------------------

type Scheme = "light" | "dark";

interface Mode { name: string; scheme: Scheme; viewport: { width: number; height: number }; }

const modes: Mode[] = [
  { name: "desktop-dark", scheme: "dark", viewport: { width: 1280, height: 900 } },
  { name: "desktop-light", scheme: "light", viewport: { width: 1280, height: 900 } },
  { name: "mobile-dark", scheme: "dark", viewport: { width: 390, height: 844 } },
].filter((m) => !modeFilter || modeFilter.includes(m.name));

// ---------------------------------------------------------------------------
// Scheme: read it off the pixels, switch it through the docs' own control
// ---------------------------------------------------------------------------

// The docs are react-native-web, so the DOM carries only generated `css-*` class names:
// there is no `.dark` class and no data attribute to read the scheme off. Read it from
// what the app actually paints instead -- the largest opaque background on the page,
// which is the same surface the screenshot is mostly made of. `body` is in the scan for
// the one route that is not the RN app: the baked static page under docs/public shadows
// /privacy and paints its background straight onto body.
function dominantBackground(): [number, number, number] | null {
  let bestArea = 0;
  let best: [number, number, number] | null = null;
  for (const el of Array.from(document.querySelectorAll("body, div"))) {
    const box = el.getBoundingClientRect();
    const area = box.width * box.height;
    if (area < 20000 || area <= bestArea) continue;
    const m = /^rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)$/.exec(getComputedStyle(el).backgroundColor);
    // Skip the translucent scrims and glass fills layered over the page: only an opaque
    // surface says which scheme is being painted.
    if (!m || (m[4] !== undefined && Number(m[4]) < 0.9)) continue;
    bestArea = area;
    best = [Number(m[1]), Number(m[2]), Number(m[3])];
  }
  return best;
}

async function readScheme(page: Page): Promise<Scheme | null> {
  const rgb = await page.evaluate(dominantBackground);
  if (!rgb) return null;
  const [r, g, b] = rgb;
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 < 0.5 ? "dark" : "light";
}

/** Wait for the app to mount and paint, and report the scheme it came up in. */
async function waitForPaint(page: Page, timeout = 15000): Promise<Scheme> {
  const deadline = Date.now() + timeout;
  for (;;) {
    const scheme = await readScheme(page);
    if (scheme) return scheme;
    if (Date.now() > deadline) throw new Error("the docs app never painted a background");
    await page.waitForTimeout(200);
  }
}

/**
 * Put the page into `target` by clicking the docs' own scheme toggle, then prove it took.
 *
 * The toggle is the only way in: DocsThemeProvider keeps the scheme in React state with a
 * dark default and persists nothing, so every freshly loaded page starts dark. An earlier
 * version of this script set a `canvas-theme` localStorage key in an init script instead,
 * which no part of the docs app reads (the key belongs to the kit's web CSS hand-off in
 * src/theme.ts, which the docs do not use), so the whole desktop-light set was really
 * dark screenshots under a light-mode name. Reading the scheme back is what keeps a
 * silent no-op like that from passing as a capture again.
 */
async function applyScheme(page: Page, target: Scheme, current: Scheme): Promise<void> {
  if (current === target) return;
  const toggle = page.getByLabel("Toggle color scheme");
  if ((await toggle.count()) === 0) {
    throw new Error(`no scheme toggle in this viewport, so ${target} cannot be reached (the mobile web shell drops the topbar below 640px)`);
  }
  await toggle.first().click();
  const deadline = Date.now() + 5000;
  for (;;) {
    const now = await readScheme(page);
    if (now === target) return;
    if (Date.now() > deadline) throw new Error(`still ${now} after clicking the scheme toggle; wanted ${target}`);
    await page.waitForTimeout(150);
  }
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

async function main() {
  console.log(`Capturing ${routes.length} routes in [${modes.map((m) => m.name).join(", ")}] from ${BASE}`);
  const browser = await chromium.launch();
  const failures: string[] = [];
  let shots = 0;

  for (const m of modes) {
    await mkdir(join(OUT, m.name), { recursive: true });
    // colorScheme decides what `prefers-color-scheme` reports. The docs app ignores it
    // (its provider hard-codes a dark default, which is what applyScheme clicks past),
    // but the static privacy page follows it, so this is what puts THAT page in the mode.
    const context = await browser.newContext({ viewport: m.viewport, deviceScaleFactor: 1, colorScheme: m.scheme });
    let captured = 0;
    for (const r of routes) {
      const page = await context.newPage();
      try {
        await page.goto(`${BASE}${r.route}`, { waitUntil: "load", timeout: 20000 });
        await applyScheme(page, m.scheme, await waitForPaint(page));
        // Let the scheme change's transitions settle before the shutter.
        await page.waitForTimeout(400);
        await page.screenshot({ path: join(OUT, m.name, `${r.kind}-${r.slug}.png`), fullPage: true });
        captured++;
        shots++;
      } catch (e) {
        const msg = `${m.name} ${r.route}: ${e instanceof Error ? e.message : String(e)}`;
        console.error(`FAIL ${msg}`);
        failures.push(msg);
      }
      await page.close();
    }
    await context.close();
    console.log(`captured ${m.name}: ${captured}/${routes.length} routes`);
  }

  await browser.close();
  console.log(`\nTotal ${shots} screenshots in ${OUT}`);

  // A route that could not be captured, or could not be put into its mode's scheme, is a
  // failed run: exiting 0 here is what let a whole mislabeled mode go unnoticed before.
  if (failures.length) {
    console.error(`\n${failures.length} route(s) failed:`);
    for (const f of failures) console.error(`  - ${f}`);
    process.exit(1);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
