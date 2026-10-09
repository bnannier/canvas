/**
 * Capturing one page cell of the component audit (plan 1d): one pattern or template page
 * at one width, in one look and surface. `capturePageCell` never throws.
 *
 * Per cell, in order:
 *   1. `gotoDocs` at the cell's width, look and surface: a fresh load.
 *   2. Structure before pixels: the page is at its own address, and the sections it marks
 *      (docs/src/ui/mockup-page.tsx stamps `data-mockup-section` with each section's key on
 *      the web) are exactly the inventory's, in order (tools/audit/inventory.ts reads them
 *      from the page's data module), so a renamed, added or dropped section fails the cell
 *      instead of being photographed under the wrong name.
 *   3. viewport.png: the first screen at the cell's own viewport, the page scrolled to its
 *      top, the way a reader lands on it.
 *   4. One section.<key>.png per section, each fitted into a viewport grown to hold it as a
 *      variant's card is (and the viewport put back after), and probed the way a variant
 *      cell's row is: the in-page probe (texts, contrast, floors, clipping, targets against
 *      the web's 24 px), its aria snapshot and its material effects.
 *   5. The page's overflow (the document, the page scroller and each section), axe over
 *      the sections where the run's policy says, and the console, CSP and request problems
 *      during the cell; all of it to probe.json.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { expect, type Page } from "@playwright/test";
import { scan } from "../support/axe";
import { probePageOverflow, probeRow } from "../support/audit-probes";
import { BASE_PATH, LOOKS, animationFrames, fitElementForScreenshot, gotoDocs, settled } from "../support/docs";
import type { PageProblems } from "../support/fixtures";
import { readMaterialEffects } from "../support/material-evidence";
import { OVERFLOW_TOLERANCE, deriveRow, flagsOf, summarizeProbe, type ProbeRow } from "../../tools/audit/probe-math.ts";
import { FAILURE_FILE, PROBE_FILE, VIEWPORT_FILE, sectionFile, webPageCellId, type PageCell, type PageCellRecord } from "../../tools/audit/web-capture.ts";
import { bytesOf, guardCell, markOf, problemsSince, type AuditSession } from "./cell";

/** The longest one page cell may take: a template has up to a dozen sections to fit, shoot and probe. */
export const PAGE_CELL_TIMEOUT_MS = 180_000;

/** The attribute the docs mark each section with on the web. */
const SECTION_ATTRIBUTE = "data-mockup-section";

export interface PageCellOptions {
  runDir: string;
  worker: number;
  /** Whether axe scans the page's sections. */
  axe: boolean;
}

/** Capture one page cell into its directory and return its record. Never throws. */
export async function capturePageCell(session: AuditSession, cell: PageCell, options: PageCellOptions): Promise<PageCellRecord> {
  const started = Date.now();
  const id = webPageCellId(cell);
  const dir = join(options.runDir, id);
  mkdirSync(dir, { recursive: true });
  const files = [VIEWPORT_FILE, PROBE_FILE, ...cell.page.sections.map((s) => sectionFile(s.key))];
  const base = {
    kind: "page" as const,
    id,
    page: cell.page.id,
    route: cell.page.route,
    width: cell.width.key,
    look: cell.look,
    surface: cell.surface,
    worker: options.worker,
  };
  const result = await guardCell(session, dir, `the page cell ${id}`, PAGE_CELL_TIMEOUT_MS, (page, problems) => capture(page, problems, cell, dir, options));
  if (result.ok) {
    return { ...base, status: "ok", flags: result.value, sections: cell.page.sections.length, ms: Date.now() - started, bytes: bytesOf(dir, files), at: new Date().toISOString() };
  }
  return {
    ...base,
    status: "failed",
    error: result.error,
    flags: [],
    sections: 0,
    ms: Date.now() - started,
    bytes: bytesOf(dir, [...files, FAILURE_FILE]),
    at: new Date().toISOString(),
  };
}

async function capture(page: Page, problems: PageProblems, cell: PageCell, dir: string, options: PageCellOptions): Promise<string[]> {
  const mark = markOf(problems);
  const look = LOOKS.find((l) => l.id === cell.look);
  if (!look) throw new Error(`no docs look is called ${cell.look}`);
  const viewport = { width: cell.width.width, height: cell.width.height };
  await gotoDocs(page, cell.page.route, { scheme: look.scheme, palette: look.palette, surface: cell.surface, viewport });
  await page.evaluate(() => document.fonts.ready.then(() => undefined));

  // Structure first: the address, then the sections the page marks against the inventory's.
  const expected = `${BASE_PATH}${cell.page.route}`;
  try {
    await expect.poll(() => new URL(page.url()).pathname, { timeout: 5_000 }).toBe(expected);
  } catch {
    throw new Error(`opened ${expected} but the page is at ${new URL(page.url()).pathname}: a redirect, so this is not the page the cell names`);
  }
  const want = cell.page.sections.map((s) => s.key);
  const marked = page.locator(`[${SECTION_ATTRIBUTE}]`);
  const readKeys = () => marked.evaluateAll((nodes, name) => nodes.map((node) => node.getAttribute(name) ?? ""), SECTION_ATTRIBUTE);
  let found: string[] = [];
  try {
    await expect.poll(async () => (found = await readKeys()), { timeout: 10_000 }).toEqual(want);
  } catch {
    throw new Error(`${expected} marks the sections [${found.join(", ")}] where the inventory has [${want.join(", ")}] (docs/src/ui/mockup-page.tsx against the page's data module)`);
  }
  // A page measures its grids and charts a frame or two after it hydrates: wait for its height to hold.
  await animationFrames(page, 2);
  await settled(() => page.locator("[data-page-scroll]").first().evaluate((node) => node.scrollHeight));

  // The first screen, as a reader lands on it.
  await page.locator("[data-page-scroll]").first().evaluate((node) => node.scrollTo({ top: 0 }));
  await page.screenshot({ path: join(dir, VIEWPORT_FILE), animations: "disabled", caret: "hide" });

  const sections: Record<string, unknown>[] = [];
  const rows: ProbeRow[] = [];
  let userAgent = "";
  for (const { key, title } of cell.page.sections) {
    const section = page.locator(`[${SECTION_ATTRIBUTE}="${key}"]`).first();
    await fitElementForScreenshot(page, section);
    const grown = page.viewportSize();
    const file = sectionFile(key);
    await section.screenshot({ path: join(dir, file), animations: "disabled", caret: "hide" });
    const derived = deriveRow(await probeRow(section, "web"));
    rows.push(derived);
    const { userAgent: agent, ...material } = await readMaterialEffects(section);
    userAgent = agent;
    sections.push({
      key,
      title,
      file,
      viewport: grown,
      box: derived.box,
      aria: await section.ariaSnapshot(),
      material,
      overflowX: derived.overflowX,
      texts: derived.texts,
      interactive: derived.interactive,
    });
    // The next section is fitted from the cell's own viewport, not from this one's.
    await page.setViewportSize(viewport);
  }

  // How far the document, the page scroller and each section run past their boxes.
  const read = await probePageOverflow(page.locator(`[${SECTION_ATTRIBUTE}]`).first());
  const boxes: Record<string, number> = { document: read.document.scrollWidth - read.document.clientWidth };
  if (read.page) boxes.page = read.page.scrollWidth - read.page.clientWidth;
  cell.page.sections.forEach(({ key }, i) => {
    boxes[`section:${key}`] = rows[i]!.overflowX;
  });
  const overflowing = Object.entries(boxes).filter(([, by]) => by > OVERFLOW_TOLERANCE).map(([box]) => box);

  let axe: { scanned: boolean; violations: { id: string; impact: string; help: string; nodes: number; targets: string[] }[] } = { scanned: false, violations: [] };
  if (options.axe) {
    const violations = await scan(page, `[${SECTION_ATTRIBUTE}]`);
    axe = {
      scanned: true,
      violations: violations.map(({ id, impact, help, nodes, raw }) => ({ id, impact, help, nodes, targets: raw.nodes.slice(0, 20).map((node) => node.target.map(String).join(" ")) })),
    };
  }
  const reported = problemsSince(problems, mark);
  const summary = summarizeProbe(rows, overflowing, { axeViolations: axe.violations.length, problems: reported.length, renderFailed: false });
  const probe = {
    schema: 1,
    cell: { id: webPageCellId(cell), page: cell.page.id, route: cell.page.route, width: cell.width.key, look: cell.look, surface: cell.surface },
    url: page.url(),
    userAgent,
    structure: { path: expected, sections: want },
    dpr: await page.evaluate(() => window.devicePixelRatio),
    viewport: { size: viewport, file: VIEWPORT_FILE },
    sections,
    overflow: boxes,
    axe,
    problems: reported,
    summary,
  };
  writeFileSync(join(dir, PROBE_FILE), `${JSON.stringify(probe, null, 2)}\n`);
  return flagsOf(summary);
}
