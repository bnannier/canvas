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
 *      variant's card is (and the viewport put back after), photographed with the margin
 *      its own paint needs (tools/audit/web-capture.ts `paintedMargin`: how far past the
 *      section's box the furthest shadow, outline or lifted box of it or anything in it
 *      reaches, side by side), so a card's drop shadow at its edge is not cropped, the
 *      viewport grown again when the part of the page no chrome covers cannot hold the
 *      margin too; and probed the way a variant cell's row is: the in-page probe (texts,
 *      contrast, floors, clipping, targets against the web's 24 px), its aria snapshot and
 *      its material effects. The section's `origin` (where its boxes are measured from, in
 *      the viewport) and the shot's `clip` place every text in its photograph for the
 *      analysis (tools/audit/analyze.ts).
 *   5. The page's overflow (the document, the page scroller and each section), axe over
 *      the sections where the run's policy says, and the console, CSP and request problems
 *      during the cell; all of it to probe.json, with how long each step took.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { expect, type Locator, type Page } from "@playwright/test";
import { scan } from "../support/axe";
import { probePageOverflow, probePaint, probeRow } from "../support/audit-probes";
import { BASE_PATH, LOOKS, animationFrames, fitElementForScreenshot, gotoDocs, settled, settledBox } from "../support/docs";
import type { PageProblems } from "../support/fixtures";
import { readMaterialEffects } from "../support/material-evidence";
import { OVERFLOW_TOLERANCE, deriveRow, flagsOf, summarizeProbe, type ProbeRow } from "../../tools/audit/probe-math.ts";
import {
  FAILURE_FILE,
  PROBE_FILE,
  VIEWPORT_FILE,
  cutSides,
  marginClip,
  paintedMargin,
  sectionFile,
  webPageCellId,
  type Box,
  type Margin,
  type PageCell,
  type PageCellRecord,
  type PaintedMargin,
  type Side,
} from "../../tools/audit/web-capture.ts";
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

/**
 * Runs in the page: the band of the viewport no docs chrome covers: below the top bar (or
 * the page scroller's top, whichever is lower) and above a phone's floating tab bar (or the
 * scroller's bottom).
 */
function exposedBand(): { left: number; top: number; right: number; bottom: number } {
  const banner = document.querySelector('[role="banner"]')?.getBoundingClientRect();
  const scroller = document.querySelector("[data-page-scroll]")?.getBoundingClientRect();
  const nav = document.querySelector('nav[aria-label="Primary"], [role="navigation"][aria-label="Primary"]')?.getBoundingClientRect();
  const top = Math.max(0, banner ? banner.bottom : 0, scroller ? scroller.top : 0);
  let bottom = Math.min(window.innerHeight, scroller ? scroller.bottom : window.innerHeight);
  // A navigation floating over the lower half of the page is the phone's tab bar.
  if (nav && nav.top > window.innerHeight / 2) bottom = Math.min(bottom, nav.top);
  return { left: 0, top, right: window.innerWidth, bottom };
}

/** Time each step of a cell, adding up repeats, for probe.json. */
function stopwatch() {
  const ms: Record<string, number> = {};
  return {
    ms,
    async time<T>(step: string, work: () => Promise<T>): Promise<T> {
      const started = Date.now();
      try {
        return await work();
      } finally {
        ms[step] = (ms[step] ?? 0) + (Date.now() - started);
      }
    },
  };
}

/** What a section's photograph took in: its clip, the margin its paint needs, what sets each side, and the sides the band still cut. */
interface SectionShot {
  clip: Box;
  margin: Margin;
  by: PaintedMargin["by"];
  /** Sides whose paint reaches past the band no chrome covers even after the viewport grew (the page ends there): the photograph cuts it as the page does. */
  cut: Side[];
}

/**
 * Photograph a section with the margin its own paint needs around it (the furthest shadow,
 * outline or lifted box of it or anything in it, tools/audit/web-capture.ts
 * `paintedMargin`): fitted as a card is, the viewport grown further when the uncovered band
 * cannot hold the section and its margin too, the section scrolled to its top margin below
 * the band's top, and the clip kept inside the band.
 */
async function shootSection(page: Page, section: Locator, path: string): Promise<SectionShot> {
  await fitElementForScreenshot(page, section);
  let band = await page.evaluate(exposedBand);
  let painted = paintedMargin(await probePaint(section));
  // Growing the viewport can reflow the page, so the margin is read again until the band holds it.
  for (let pass = 0; pass < 3; pass++) {
    const { height } = await settledBox(section);
    const short = height + painted.margin.top + painted.margin.bottom - (band.bottom - band.top);
    if (short <= 0) break;
    const size = page.viewportSize()!;
    await page.setViewportSize({ ...size, height: size.height + Math.ceil(short) });
    band = await page.evaluate(exposedBand);
    painted = paintedMargin(await probePaint(section));
  }
  await section.evaluate((node, y) => {
    const scroller = node.closest<HTMLElement>("[data-page-scroll]");
    if (scroller) scroller.scrollTop += node.getBoundingClientRect().top - y;
  }, band.top + painted.margin.top);
  await animationFrames(page, 2);
  const box = await section.boundingBox();
  if (!box) throw new Error("a section has no box once it is fitted");
  painted = paintedMargin(await probePaint(section));
  const clip = marginClip(box, band, painted.margin);
  await page.screenshot({ path, clip, animations: "disabled", caret: "hide" });
  return { clip, margin: painted.margin, by: painted.by, cut: cutSides(box, clip, painted.margin) };
}

async function capture(page: Page, problems: PageProblems, cell: PageCell, dir: string, options: PageCellOptions): Promise<string[]> {
  const mark = markOf(problems);
  const watch = stopwatch();
  const { time } = watch;
  const look = LOOKS.find((l) => l.id === cell.look);
  if (!look) throw new Error(`no docs look is called ${cell.look}`);
  const viewport = { width: cell.width.width, height: cell.width.height };
  await time("goto", () => gotoDocs(page, cell.page.route, { scheme: look.scheme, palette: look.palette, surface: cell.surface, viewport }));
  await time("fonts", () => page.evaluate(() => document.fonts.ready.then(() => undefined)));

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
    await time("structure", () => expect.poll(async () => (found = await readKeys()), { timeout: 10_000 }).toEqual(want));
  } catch {
    throw new Error(`${expected} marks the sections [${found.join(", ")}] where the inventory has [${want.join(", ")}] (docs/src/ui/mockup-page.tsx against the page's data module)`);
  }
  // A page measures its grids and charts a frame or two after it hydrates: wait for its height to hold.
  await time("settle", async () => {
    await animationFrames(page, 2);
    await settled(() => page.locator("[data-page-scroll]").first().evaluate((node) => node.scrollHeight));
  });

  // The first screen, as a reader lands on it.
  await page.locator("[data-page-scroll]").first().evaluate((node) => node.scrollTo({ top: 0 }));
  await time("viewport shot", () => page.screenshot({ path: join(dir, VIEWPORT_FILE), animations: "disabled", caret: "hide" }));

  const sections: Record<string, unknown>[] = [];
  const rows: ProbeRow[] = [];
  let userAgent = "";
  for (const { key, title } of cell.page.sections) {
    const section = page.locator(`[${SECTION_ATTRIBUTE}="${key}"]`).first();
    const file = sectionFile(key);
    const shot = await time("section shots", () => shootSection(page, section, join(dir, file)));
    const grown = page.viewportSize();
    const derived = deriveRow(await time("section probes", () => probeRow(section, "web")));
    rows.push(derived);
    const { userAgent: agent, ...material } = await time("section materials", () => readMaterialEffects(section));
    userAgent = agent;
    sections.push({
      key,
      title,
      file,
      viewport: grown,
      clip: shot.clip,
      margin: shot.margin,
      marginBy: shot.by,
      ...(shot.cut.length ? { cut: shot.cut } : {}),
      origin: derived.origin,
      box: derived.box,
      aria: await time("section aria", () => section.ariaSnapshot()),
      material,
      overflowX: derived.overflowX,
      texts: derived.texts,
      interactive: derived.interactive,
    });
    // The next section is fitted from the cell's own viewport, not from this one's.
    await page.setViewportSize(viewport);
  }

  // How far the document, the page scroller and each section run past their boxes.
  const read = await time("overflow", () => probePageOverflow(page.locator(`[${SECTION_ATTRIBUTE}]`).first()));
  const boxes: Record<string, number> = { document: read.document.scrollWidth - read.document.clientWidth };
  if (read.page) boxes.page = read.page.scrollWidth - read.page.clientWidth;
  cell.page.sections.forEach(({ key }, i) => {
    boxes[`section:${key}`] = rows[i]!.overflowX;
  });
  const overflowing = Object.entries(boxes).filter(([, by]) => by > OVERFLOW_TOLERANCE).map(([box]) => box);

  let axe: { scanned: boolean; violations: { id: string; impact: string; help: string; nodes: number; targets: string[] }[] } = { scanned: false, violations: [] };
  if (options.axe) {
    const violations = await time("axe", () => scan(page, `[${SECTION_ATTRIBUTE}]`));
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
    ms: watch.ms,
  };
  writeFileSync(join(dir, PROBE_FILE), `${JSON.stringify(probe, null, 2)}\n`);
  return flagsOf(summary);
}
