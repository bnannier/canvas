// Photographs the vendored v4 design hand-off (tools/v4/handoff) into .v4-reference/, the
// design images Lookout's design-parity judge compares the docs against (lookout.config.ts
// `design:`), and that a person compares side by side with a docs page.
//
//   bun tools/v4/capture-references.ts [--only <name-substring>] [--light | --light-only]
//
// It serves the hand-off from this checkout, opens each page at 1440 wide in Playwright's
// Chromium, and writes, per scheme:
//   pages/<page>.png               the whole page (Library, the eight sections, Skins)
//   cards/<card-id>.png            every section card (`#c-*`), as the section page draws it
//   heroes/<section>.png           a section page's hero (its `<cv-hero>` host, the 300 px stage;
//                                  Library has none)
//   components/<slug>.png          a component's whole detail page
//   components/<slug>/<id>.png     one section of it (`DETAIL_SECTIONS` below): the crop
//                                  Lookout judges against the docs page's same section
//   components/<slug>-platforms.png  the detail page's three-platform skins row
//   templates/<template>-<platform>.png  every template in every device frame
//
// The hand-off loads Google Fonts and a QR script from a CDN, so this needs the network.

import { mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { chromium, type Page } from "playwright";

const ROOT = resolve(import.meta.dir, "handoff");
const OUT = resolve(import.meta.dir, "../../.v4-reference");
const args = process.argv.slice(2);
const only = args.includes("--only") ? args[args.indexOf("--only") + 1] : undefined;
const schemes = args.includes("--light-only")
  ? (["light"] as const)
  : args.includes("--light")
    ? (["dark", "light"] as const)
    : (["dark"] as const);

const SECTIONS = ["Library", "Foundations", "Layout", "Controls", "Inputs", "Navigation", "Data", "Charts", "Overlays", "Skins"];

// The component page's sections, by the id the docs page's `data-detail-section` markers
// and lookout.config.ts's section routes share: the hand-off's `#cv-*` sections, its
// unlabelled <header> and the previous/next grid after Tokens. A section the hand-off
// skips for a component (no variants, sizes, states, anatomy or usage) yields no file.
const DETAIL_SECTIONS: Record<string, string> = {
  header: "main header",
  pg: "#cv-pg",
  var: "#cv-var",
  sz: "#cv-sz",
  st: "#cv-st",
  an: "#cv-an",
  props: "#cv-props",
  a11y: "#cv-a11y",
  pf: "#cv-pf",
  use: "#cv-use",
  tok: "#cv-tok",
  prevnext: "#cv-tok + div",
};

const server = Bun.serve({
  port: 0,
  hostname: "127.0.0.1",
  async fetch(req) {
    const path = decodeURIComponent(new URL(req.url).pathname);
    const file = Bun.file(join(ROOT, path));
    return (await file.exists()) ? new Response(file) : new Response("not found", { status: 404 });
  },
});
const base = `http://127.0.0.1:${server.port}`;
const pageUrl = (name: string) => `${base}/${encodeURIComponent(`Canvas v4.0.0 ${name}.dc.html`)}`;

const want = (name: string) => !only || name.includes(only);

/** Waits for the prototype runtime, its fonts and its looping heroes' first frame. */
async function settle(page: Page) {
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1200);
}

/** The navbar's scheme switch is the one control that sets the prototype's scheme. */
async function setScheme(page: Page, scheme: "dark" | "light") {
  if (scheme === "dark") return;
  await page.getByText("Light", { exact: true }).first().click();
  await page.waitForTimeout(700);
}

/**
 * Shoots the page, or one element of it. An element is first landed on whole pixels: an
 * element screenshot clips to the element's box rounded outward, so a box at a fractional
 * offset (the line boxes above it are fractional, 30.8 px for a section title) comes out a
 * row taller or shorter than the same box at another fraction, with its text on another
 * sub-pixel. The fraction is moved off with a transform for the shot, as lookout.config.ts's
 * fit states do to the docs' element, so the two crops compared sit on the same pixel grid.
 */
async function shoot(page: Page, file: string, selector?: string) {
  mkdirSync(resolve(file, ".."), { recursive: true });
  if (selector) {
    const element = page.locator(selector).first();
    await element.scrollIntoViewIfNeeded();
    const own = await element.evaluate((node) => {
      const box = node.getBoundingClientRect();
      const dx = box.left - Math.round(box.left);
      const dy = box.top - Math.round(box.top);
      if (dx === 0 && dy === 0) return null;
      const before = (node as HTMLElement).style.transform;
      (node as HTMLElement).style.transform = `translate(${-dx}px, ${-dy}px)`;
      return before;
    });
    await element.screenshot({ path: file, animations: "disabled" });
    if (own !== null) await element.evaluate((node, before) => ((node as HTMLElement).style.transform = before), own);
  } else await page.screenshot({ path: file, fullPage: true, animations: "disabled" });
}

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1, reducedMotion: "reduce" });
const page = await context.newPage();

for (const scheme of schemes) {
  const dir = join(OUT, scheme);
  for (const section of SECTIONS) {
    if (!want(section)) continue;
    await page.goto(pageUrl(section));
    await settle(page);
    await setScheme(page, scheme);
    await shoot(page, join(dir, "pages", `${section.toLowerCase()}.png`));
    // The navbar pill floats over whatever scrolls under it, so the card and hero crops hide
    // it (the nav is `height: 0`; nothing moves), as the component sections below do. The
    // whole-page shot above is taken with it.
    await page.addStyleTag({ content: "nav { visibility: hidden }" });
    if (await page.locator("cv-hero").count()) await shoot(page, join(dir, "heroes", `${section.toLowerCase()}.png`), "cv-hero");
    for (const id of await page.locator('[id^="c-"]').evaluateAll((els) => els.map((e) => e.id))) {
      await shoot(page, join(dir, "cards", `${id.slice(2)}.png`), `#${id}`);
    }
    console.log(`${scheme} ${section}`);
  }

  const slugs: string[] = await (async () => {
    await page.goto(pageUrl("Component"));
    await settle(page);
    return page.evaluate(() => (window as unknown as { CV_DOCS: { order: string[] } }).CV_DOCS.order);
  })();
  for (const slug of slugs) {
    if (!want(slug)) continue;
    await page.goto(`${pageUrl("Component")}#${slug}`);
    await page.reload();
    await settle(page);
    await setScheme(page, scheme);
    await shoot(page, join(dir, "components", `${slug}.png`));
    if (await page.locator("#cv-pf").count()) await shoot(page, join(dir, "components", `${slug}-platforms.png`), "#cv-pf");
    // The navbar pill floats over whatever scrolls under it, so the section crops hide it
    // (the nav is `height: 0`; nothing moves), as the docs' section shots scroll a section
    // out from under their navbar. The reload at the top of the loop drops the style.
    await page.addStyleTag({ content: "nav { visibility: hidden }" });
    for (const [id, selector] of Object.entries(DETAIL_SECTIONS)) {
      if (await page.locator(selector).count()) await shoot(page, join(dir, "components", slug, `${id}.png`), selector);
    }
  }
  console.log(`${scheme} components: ${slugs.length}`);

  if (want("templates")) {
    await page.goto(pageUrl("Templates"));
    await settle(page);
    // The Templates header carries its own scheme toggle in place of the navbar switch.
    if (scheme === "light") {
      await page.getByRole("button", { name: "Toggle scheme" }).click();
      await page.waitForTimeout(700);
    }
    // The template list is the page's sticky left nav; each entry reads "<name>\n<nn>".
    // (A template's own sidebar is an <aside> inside the stage, so it is not the list.)
    const list = page.locator('nav[style*="sticky"] button');
    const names = (await list.allInnerTexts()).map((t) => t.split("\n")[0]!.trim());
    for (const platform of ["Web", "iOS", "Android"]) {
      await page.getByRole("button", { name: platform, exact: true }).first().click();
      for (const [i, name] of names.entries()) {
        await list.nth(i).click();
        await page.waitForTimeout(500);
        await shoot(page, join(dir, "templates", `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${platform.toLowerCase()}.png`), "main");
      }
    }
    console.log(`${scheme} templates`);
  }
}

await browser.close();
server.stop();
