/**
 * Objective render-verification for every docs page.
 *
 * Drives the RUNNING docs dev server (default http://localhost:5176) with a real
 * Chromium and, for each component/template/pattern route, asserts against the
 * authoritative data:
 *   - route resolves (h1 === expected name, not the NotFound fallback)
 *   - every section title in the data renders as an <h2>
 *   - components: rendered .example-inner count === data example count, none empty
 *   - templates/patterns: every section has a non-empty rendered .section-card
 *   - no console errors / page errors on load
 * Writes a screenshot per page + a JSON matrix to test/verify/.
 *
 * Usage: bun scripts/verify-docs.ts            (assumes dev server on :5176)
 *        BASE=http://localhost:5176 bun scripts/verify-docs.ts
 */
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { chromium, type Page, type ConsoleMessage } from "@playwright/test";
import { COMPONENTS } from "../docs/src/data/components.ts";
import { getAllTemplates } from "../docs/src/data/templates.ts";
import { getAllPatterns } from "../docs/src/data/patterns.ts";

const ROOT = join(import.meta.dir, "..");
const OUT = join(ROOT, "test", "verify");
const BASE = process.env.BASE ?? "http://localhost:5176";

interface Target {
  kind: "component" | "template" | "pattern";
  slug: string;
  name: string;
  route: string;
  sections: string[];
  examples: number; // components only
  pg: boolean;
  donts: boolean;
}

const targets: Target[] = [
  ...COMPONENTS.map((c) => ({
    kind: "component" as const,
    slug: c.slug,
    name: c.name,
    route: `/components/${c.slug}`,
    sections: c.sections.map((s) => s.title),
    examples: c.sections.reduce((n, s) => n + (s.examples?.length ?? 0), 0),
    pg: !!c.playground,
    donts: !!c.donts,
  })),
  ...getAllTemplates().map((t) => ({
    kind: "template" as const,
    slug: t.slug,
    name: t.name,
    route: `/templates/${t.slug}`,
    sections: t.sections.map((s) => s.title),
    examples: 0,
    pg: false,
    donts: false,
  })),
  ...getAllPatterns().map((p) => ({
    kind: "pattern" as const,
    slug: p.slug,
    name: p.name,
    route: `/patterns/${p.slug}`,
    sections: p.sections.map((s) => s.title),
    examples: 0,
    pg: false,
    donts: false,
  })),
];

async function assertPage(page: Page, t: Target) {
  return page.evaluate((t) => {
    const txt = (el: Element | null) => (el?.textContent ?? "").trim();
    const h1 = txt(document.querySelector("h1"));
    const h2s = [...document.querySelectorAll("h2")].map((e) => (e.textContent ?? "").trim());
    const missingSections = t.sections.filter((s) => !h2s.includes(s));
    const inners = [...document.querySelectorAll(".example-inner")];
    const emptyExamples = inners
      .map((el, i) => ((el.innerHTML ?? "").trim() === "" ? i : -1))
      .filter((i) => i >= 0);
    const sectionCards = [...document.querySelectorAll(".section-card")];
    const emptyCards = sectionCards
      .map((el, i) => ((el.innerHTML ?? "").trim() === "" ? i : -1))
      .filter((i) => i >= 0);
    return {
      h1,
      nameMatch: h1 === t.name,
      h2s,
      missingSections,
      exampleInners: inners.length,
      emptyExamples,
      sectionCards: sectionCards.length,
      emptyCards,
      pgHeading: h2s.includes("Playground"),
      dontsHeading: h2s.some((s) => s.startsWith("Don")),
    };
  }, t);
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });

  const results: any[] = [];

  for (const t of targets) {
    const page = await context.newPage();
    const consoleErrors: string[] = [];
    page.on("console", (m: ConsoleMessage) => {
      if (m.type() === "error") consoleErrors.push(m.text());
    });
    page.on("pageerror", (e) => consoleErrors.push(String(e)));

    let loadOk = true;
    try {
      await page.goto(`${BASE}${t.route}`, { waitUntil: "load", timeout: 15000 });
      await page.waitForSelector("h1", { timeout: 8000 });
      await page.waitForTimeout(250); // let example HTML inject
    } catch {
      loadOk = false;
    }

    const a = loadOk ? await assertPage(page, t) : null;
    const shot = `${t.kind}-${t.slug}.png`;
    try { await page.screenshot({ path: join(OUT, shot), fullPage: true }); } catch {}

    // Pass criteria differ by kind.
    let pass = false;
    const issues: string[] = [];
    if (!loadOk || !a) { issues.push("page did not load"); }
    else {
      if (!a.nameMatch) issues.push(`h1 "${a.h1}" != "${t.name}"`);
      if (a.missingSections.length) issues.push(`missing sections: ${a.missingSections.join(" | ")}`);
      if (consoleErrors.length) issues.push(`console errors: ${consoleErrors.length}`);
      if (t.kind === "component") {
        if (a.exampleInners !== t.examples) issues.push(`examples ${a.exampleInners} != ${t.examples}`);
        if (a.emptyExamples.length) issues.push(`empty examples: ${a.emptyExamples.join(",")}`);
        if (t.pg && !a.pgHeading) issues.push("missing Playground heading");
        if (t.donts && !a.dontsHeading) issues.push("missing Don'ts heading");
      } else {
        if (a.emptyCards.length) issues.push(`empty section cards: ${a.emptyCards.join(",")}`);
      }
      pass = issues.length === 0;
    }

    results.push({ kind: t.kind, slug: t.slug, name: t.name, pass, issues, consoleErrors, assert: a, screenshot: shot });
    await page.close();
  }

  await browser.close();
  await Bun.write(join(OUT, "report.json"), JSON.stringify(results, null, 2));

  // Console report
  const pad = (s: string, n: number) => s.padEnd(n);
  console.log("\nDocs render verification");
  console.log("========================\n");
  console.log(`${pad("page", 34)} ${pad("kind", 10)} result`);
  console.log("-".repeat(70));
  let failed = 0;
  for (const r of results) {
    const status = r.pass ? "PASS" : "FAIL: " + r.issues.join("; ");
    if (!r.pass) failed++;
    console.log(`${pad(r.slug, 34)} ${pad(r.kind, 10)} ${status}`);
  }
  console.log("-".repeat(70));
  console.log(`${results.length} pages, ${results.length - failed} pass, ${failed} fail`);
  console.log(`Screenshots + report.json in ${OUT}`);
  if (failed) process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(1); });
