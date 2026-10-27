// Photographs the v4 hand-off's docs shell for the `v4-page` reference card
// (tools/native/liquid-motion.md, `### v4-page`; audit/v4-redesign/PLAN.md, Phase 3):
//
//   bun tools/v4/capture-shell.ts
//
// It serves the vendored hand-off (tools/v4/handoff) from this checkout, opens its Controls
// section page in Playwright's Chromium, and writes into tools/native/reference/v4-page/:
//   pill-<scheme>-<glass|solid>-<width>.png  the floating navbar pill, at 1440, 1024, 768, 390
//   grain-<scheme>-dpr<n>.png                the grain over the flat page alone, 360 CSS px square
//                                            at the window's origin (2 x 2 tiles), DPR 1 and 2, as
//                                            the hand-off renders it
//   grain-<scheme>-dpr<n>-authored.png       the same with the grain SVG the hand-off authored:
//                                            its runtime's template encoder rewrites the SVG's
//                                            camelCase attributes inside the CSS data URI
//                                            (`baseFrequency` to `sc-camel-base-frequency`), so the
//                                            live page draws a turbulence at frequency 0, a flat
//                                            veil; this restores the vendored file's own `--grain`
//   rail-<scheme>-1440.png                   the section rail
//   footer-<scheme>-<width>.png              the footer, at 1440 and 390
//   metrics.json                             the geometry the card quotes, measured off the DOM
//
// The hand-off loads its fonts from Google Fonts, so this needs the network.

import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { chromium, type Page } from "playwright";

const ROOT = resolve(import.meta.dir, "handoff");
const OUT = resolve(import.meta.dir, "../native/reference/v4-page");
mkdirSync(OUT, { recursive: true });

const server = Bun.serve({
  port: 0,
  hostname: "127.0.0.1",
  async fetch(req) {
    const file = Bun.file(join(ROOT, decodeURIComponent(new URL(req.url).pathname)));
    return (await file.exists()) ? new Response(file) : new Response("not found", { status: 404 });
  },
});
const url = `http://127.0.0.1:${server.port}/${encodeURIComponent("Canvas v4.0.0 Controls.dc.html")}`;

type Scheme = "dark" | "light";
const SCHEMES: Scheme[] = ["dark", "light"];
const metrics: Record<string, unknown> = {};

/** The `--grain` image the vendored page declares, before its runtime touches it. */
const AUTHORED_GRAIN = (await Bun.file(join(ROOT, "Canvas v4.0.0 Controls.dc.html")).text()).match(/--grain:(url\("data:image\/svg\+xml,[^"]+"\))/)![1]!;

async function open(page: Page, scheme: Scheme, glass = true) {
  await page.goto(url);
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1000);
  if (scheme === "light") await page.getByText("Light", { exact: true }).first().click();
  if (!glass) await page.locator('button[title="Toggle glass surfaces"]').click();
  await page.waitForTimeout(800);
}

/** The pill, its links and its separators, as the DOM lays them out. */
function pillMetrics(page: Page) {
  return page.evaluate(() => {
    const pill = document.querySelector("nav > div") as HTMLElement;
    const cs = getComputedStyle(pill);
    const box = pill.getBoundingClientRect();
    const link = pill.querySelector('a[href*="Foundations"]') as HTMLElement;
    const brand = pill.querySelector("a") as HTMLElement;
    const lb = link.getBoundingClientRect();
    const lcs = getComputedStyle(link);
    const bcs = getComputedStyle(brand);
    return {
      box: { x: box.x, y: box.y, width: box.width, height: box.height },
      scrollWidth: pill.scrollWidth,
      clientWidth: pill.clientWidth,
      padding: cs.padding,
      gap: cs.gap,
      radius: cs.borderRadius,
      border: `${cs.borderTopWidth} ${cs.borderTopColor}`,
      background: cs.backgroundColor,
      backdrop: cs.backdropFilter,
      shadow: cs.boxShadow,
      link: { height: lb.height, padding: lcs.padding, font: `${lcs.fontWeight} ${lcs.fontSize} ${lcs.fontFamily.split(",")[0]}`, color: lcs.color },
      brand: { font: `${bcs.fontWeight} ${bcs.fontSize} ${bcs.fontFamily.split(",")[0]}`, letterSpacing: bcs.letterSpacing, color: bcs.color },
    };
  });
}

const browser = await chromium.launch();

// The pill: both schemes, glass and solid, at the four widths.
for (const width of [1440, 1024, 768, 390]) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 2 });
  const page = await context.newPage();
  for (const scheme of SCHEMES) {
    for (const glass of [true, false]) {
      await open(page, scheme, glass);
      const name = `pill-${scheme}-${glass ? "glass" : "solid"}-${width}`;
      // The pill floats over the page with a 14 px top offset and a shadow below it, so the
      // strip keeps the band of page it sits in: the window's top 72 px.
      await page.screenshot({ path: join(OUT, `${name}.png`), clip: { x: 0, y: 0, width, height: 72 }, animations: "disabled" });
      metrics[name] = await pillMetrics(page);
    }
  }
  await context.close();
}

// The grain over the flat page alone: every child of the themed root but the grain layer
// (its first child) hidden, so the crop is the page colour and the noise.
for (const dpr of [1, 2]) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: dpr });
  const page = await context.newPage();
  for (const scheme of SCHEMES) {
    await open(page, scheme);
    await page.addStyleTag({ content: "[data-ion] > *:not(:first-child){visibility:hidden}" });
    await page.waitForTimeout(200);
    await page.screenshot({ path: join(OUT, `grain-${scheme}-dpr${dpr}.png`), clip: { x: 0, y: 0, width: 360, height: 360 }, animations: "disabled" });
    const rendered = await page.evaluate(() => getComputedStyle(document.querySelector("[data-ion] > div") as HTMLElement).backgroundImage);
    await page.evaluate((image) => {
      (document.querySelector("[data-ion] > div") as HTMLElement).style.backgroundImage = image;
    }, AUTHORED_GRAIN);
    await page.waitForTimeout(300);
    await page.screenshot({ path: join(OUT, `grain-${scheme}-dpr${dpr}-authored.png`), clip: { x: 0, y: 0, width: 360, height: 360 }, animations: "disabled" });
    metrics[`grain-${scheme}-dpr${dpr}-runtime-svg`] = decodeURIComponent(rendered);
    metrics[`grain-${scheme}-dpr${dpr}`] = await page.evaluate(() => {
      const g = document.querySelector("[data-ion] > div") as HTMLElement;
      const cs = getComputedStyle(g);
      const root = getComputedStyle(document.querySelector("[data-ion]") as HTMLElement);
      return { position: cs.position, zIndex: cs.zIndex, opacity: cs.opacity, backgroundSize: cs.backgroundSize, pointerEvents: cs.pointerEvents, mixBlendMode: cs.mixBlendMode, page: root.backgroundColor };
    });
  }
  await context.close();
}

// The rail at 1440 and the footer at 1440 and 390.
for (const width of [1440, 390]) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 2 });
  const page = await context.newPage();
  for (const scheme of SCHEMES) {
    await open(page, scheme);
    if (width === 1440) {
      const rail = page.locator("aside").first();
      await rail.screenshot({ path: join(OUT, `rail-${scheme}-1440.png`), animations: "disabled" });
      metrics[`rail-${scheme}-1440`] = await page.evaluate(() => {
        const aside = document.querySelector("aside") as HTMLElement;
        const box = aside.getBoundingClientRect();
        const content = aside.nextElementSibling as HTMLElement;
        const items = [...aside.querySelectorAll("a, button")].slice(0, 40).map((el) => {
          const b = el.getBoundingClientRect();
          const cs = getComputedStyle(el);
          return { text: (el.textContent ?? "").trim().slice(0, 40), y: Math.round(b.y), height: b.height, font: `${cs.fontWeight} ${cs.fontSize}`, color: cs.color, background: cs.backgroundColor };
        });
        const heads = [...aside.querySelectorAll("div, span")]
          .filter((el) => getComputedStyle(el).textTransform === "uppercase" && el.children.length === 0)
          .slice(0, 12)
          .map((el) => {
            const cs = getComputedStyle(el);
            return { text: (el.textContent ?? "").trim(), font: `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily.split(",")[0]}`, letterSpacing: cs.letterSpacing, color: cs.color };
          });
        return { box: { x: box.x, y: box.y, width: box.width }, contentX: content.getBoundingClientRect().x, items, heads };
      });
    }
    const footer = page.locator("footer").first();
    await footer.screenshot({ path: join(OUT, `footer-${scheme}-${width}.png`), animations: "disabled" });
    metrics[`footer-${scheme}-${width}`] = await page.evaluate(() => {
      const f = document.querySelector("footer") as HTMLElement;
      const inner = f.firstElementChild as HTMLElement;
      const cs = getComputedStyle(f);
      const ics = getComputedStyle(inner);
      return { width: f.getBoundingClientRect().width, padding: cs.padding, rule: `${ics.borderTopWidth} ${ics.borderTopColor}`, ruleGap: ics.paddingTop, height: f.getBoundingClientRect().height };
    });
  }
  await context.close();
}

writeFileSync(join(OUT, "metrics.json"), `${JSON.stringify(metrics, null, 2)}\n`);
await browser.close();
server.stop();
console.log(`wrote ${Object.keys(metrics).length} captures to ${OUT}`);
