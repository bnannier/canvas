/**
 * Multi-mode UI capture for visual verification of the docs app chrome + pages.
 * Screenshots every route in 3 modes: desktop-dark, desktop-light, mobile-dark.
 * Output: test/ui/<mode>/<kind>-<slug>.png
 *
 * Usage: BASE=<docs web server URL> bun scripts/capture-ui.ts
 */
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { chromium } from "@playwright/test";
import { COMPONENTS } from "../docs/src/core/data/components.ts";
import { getAllTemplates } from "../docs/src/core/data/templates.ts";
import { getAllPatterns } from "../docs/src/core/data/patterns.ts";

const ROOT = join(import.meta.dir, "..");
const OUT = join(ROOT, "test", "ui");
const BASE = process.env.BASE ?? "http://localhost:8081";

interface Route { kind: string; slug: string; route: string; }

const routes: Route[] = [
  { kind: "chrome", slug: "home", route: "/" },
  { kind: "chrome", slug: "components-index", route: "/components" },
  { kind: "chrome", slug: "tokens", route: "/tokens" },
  { kind: "chrome", slug: "tokens-spacing", route: "/tokens/spacing" },
  { kind: "chrome", slug: "tokens-typography", route: "/tokens/typography" },
  { kind: "chrome", slug: "utilities", route: "/utilities" },
  { kind: "chrome", slug: "theming", route: "/theming" },
  { kind: "chrome", slug: "migration", route: "/migration" },
  { kind: "chrome", slug: "integration", route: "/integration" },
  ...COMPONENTS.map((c) => ({ kind: "component", slug: c.slug, route: `/components/${c.slug}` })),
  ...getAllTemplates().map((t) => ({ kind: "template", slug: t.slug, route: `/templates/${t.slug}` })),
  ...getAllPatterns().map((p) => ({ kind: "pattern", slug: p.slug, route: `/patterns/${p.slug}` })),
];

const modes = [
  { name: "desktop-dark", theme: "dark", viewport: { width: 1280, height: 900 } },
  { name: "desktop-light", theme: "light", viewport: { width: 1280, height: 900 } },
  { name: "mobile-dark", theme: "dark", viewport: { width: 390, height: 844 } },
];

async function main() {
  const browser = await chromium.launch();
  let shots = 0;
  for (const m of modes) {
    await mkdir(join(OUT, m.name), { recursive: true });
    const context = await browser.newContext({ viewport: m.viewport, deviceScaleFactor: 1 });
    await context.addInitScript((theme) => {
      try { localStorage.setItem("canvas-theme", theme as string); } catch {}
    }, m.theme);
    for (const r of routes) {
      const page = await context.newPage();
      try {
        await page.goto(`${BASE}${r.route}`, { waitUntil: "load", timeout: 20000 });
        await page.waitForSelector(".app-content *", { timeout: 8000 });
        await page.waitForTimeout(400);
        await page.screenshot({ path: join(OUT, m.name, `${r.kind}-${r.slug}.png`), fullPage: true });
        shots++;
      } catch (e) {
        console.error(`FAIL ${m.name} ${r.route}: ${e}`);
      }
      await page.close();
    }
    await context.close();
    console.log(`captured ${m.name}: ${routes.length} routes`);
  }
  await browser.close();
  console.log(`\nTotal ${shots} screenshots in ${OUT}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
