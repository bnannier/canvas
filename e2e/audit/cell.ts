/**
 * Capturing one web cell of the component audit: one example (variant), at one width, in
 * one look and surface. `captureCell` never throws: whatever stops a cell is recorded on
 * it, and the run moves on to the next one.
 *
 * Per cell, in order:
 *   1. `gotoDocs` at the cell's width, look and surface. The theme is seeded from the
 *      launch URL once per load (docs/src/theme/docs-theme.tsx), so every cell is a fresh
 *      load; nothing switches the look in the page.
 *   2. `document.fonts.ready`.
 *   3. Structure before pixels: the page must still be at the example's own address, and
 *      the example rail (testID `playground-examples`) must have exactly the expected
 *      label selected, so a silent redirect to another example fails the cell instead of
 *      photographing the wrong thing.
 *   4. `fitElementForScreenshot` grows the viewport to hold the card, then one `card.png`
 *      of `[data-preview-card]` at the context's device scale (2).
 *   5. The probe: the card's and each platform row's boxes (the row crops are cut from
 *      card.png later), each row's `ariaSnapshot()`, `readMaterialEffects`, the in-page
 *      probe (e2e/support/audit-probes.ts), how far the page boxes overflow, axe on the web
 *      row where the run's axe policy says, and the page's console, CSP and request
 *      problems during this cell. All of it goes to `probe.json`.
 *
 * One page serves a whole test, so the problem watcher (`watchForProblems`, the e2e
 * suite's own gate) is attached once and each cell reads its share by length. A cell that
 * fails closes the page, so whatever it left hanging (an evaluate on a stalled renderer, a
 * crashed tab) cannot reach the next cell; the session opens a fresh one.
 */
import { appendFileSync, mkdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { expect, type BrowserContext, type Page } from "@playwright/test";
import { scan } from "../support/axe";
import { BASE_PATH, FIXED_TIME, LOOKS, fitElementForScreenshot, gotoDocs, platformRow, previewCard } from "../support/docs";
import { describeProblems, stubRegistry, watchForProblems, type PageProblems } from "../support/fixtures";
import { readMaterialEffects } from "../support/material-evidence";
import { probePageOverflow, probeRow } from "../support/audit-probes";
import {
  ROW_PLATFORMS,
  deriveRow,
  flagsOf,
  overflowOf,
  summarizeProbe,
  type ProbeRow,
} from "../../tools/audit/probe-math.ts";
import {
  CARD_FILE,
  CELLS_FILE,
  FAILURE_FILE,
  PROBE_FILE,
  cellDir,
  webCellId,
  type CellRecord,
  type WebCell,
} from "../../tools/audit/web-capture.ts";

/** The longest one cell may take before it is recorded as failed and its page closed. */
export const CELL_TIMEOUT_MS = 90_000;

/** What ExampleErrorBoundary paints in place of an example that threw (docs/src/ui/playground.tsx). */
export const RENDER_FAILURE = "Example failed to render";

const PROBLEM_KINDS = ["consoleErrors", "pageErrors", "cspViolations", "badResponses", "failedRequests"] as const;
export type ProblemMark = Record<(typeof PROBLEM_KINDS)[number], number>;

/** The run directory the runner made for this run. */
export function auditRunDir(): string {
  const dir = process.env.AUDIT_RUN_DIR;
  if (!dir) throw new Error("AUDIT_RUN_DIR is not set: run the audit through `bun run audit:web`, which makes the run directory and its manifest");
  return dir;
}

/** The page a test's cells run in, reopened after a cell fails. */
export class AuditSession {
  private current: { page: Page; problems: PageProblems } | null = null;

  private constructor(private readonly context: BrowserContext) {}

  static async open(context: BrowserContext): Promise<AuditSession> {
    await stubRegistry(context);
    // The clock is the context's, so every page the session opens starts at FIXED_TIME.
    await context.clock.setFixedTime(FIXED_TIME);
    return new AuditSession(context);
  }

  async page(): Promise<{ page: Page; problems: PageProblems }> {
    if (this.current && !this.current.page.isClosed()) return this.current;
    const page = await this.context.newPage();
    const problems = await watchForProblems(page);
    page.on("crash", () => problems.pageErrors.push("the page crashed"));
    this.current = { page, problems };
    return this.current;
  }

  /** Close the current page so nothing it left running reaches the next cell. */
  async discard(): Promise<void> {
    const current = this.current;
    this.current = null;
    if (current) await current.page.close({ runBeforeUnload: false }).catch(() => {});
  }

  async close(): Promise<void> {
    await this.discard();
  }
}

/** Reject after `ms` with what timed out; the caller closes the page to stop the work. */
export async function withTimeout<T>(work: Promise<T>, ms: number, what: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${what} did not finish in ${ms / 1000} s`)), ms);
  });
  try {
    return await Promise.race([work, timeout]);
  } finally {
    clearTimeout(timer);
  }
}

export const markOf = (problems: PageProblems): ProblemMark =>
  Object.fromEntries(PROBLEM_KINDS.map((kind) => [kind, problems[kind].length])) as ProblemMark;

/** The problems reported since `mark`, as the e2e gate would word them. */
export function problemsSince(problems: PageProblems, mark: ProblemMark): string[] {
  const slice = Object.fromEntries(PROBLEM_KINDS.map((kind) => [kind, problems[kind].slice(mark[kind])])) as Pick<PageProblems, (typeof PROBLEM_KINDS)[number]>;
  return describeProblems({ ...slice, expectNotFound: false, documentStatus: null });
}

/**
 * The page is where the cell opened it and shows the expected example. Throws, naming what
 * it found, when either is not so.
 */
export async function verifyStructure(page: Page, cell: Pick<WebCell, "path" | "label">, examples: number): Promise<{ path: string; selected: string | null }> {
  const expected = `${BASE_PATH}${cell.path}`;
  try {
    await expect.poll(() => new URL(page.url()).pathname, { timeout: 5_000 }).toBe(expected);
  } catch {
    throw new Error(`opened ${expected} but the page is at ${new URL(page.url()).pathname}: a redirect, so this is not the example the cell names`);
  }
  if (examples <= 1) return { path: expected, selected: null };
  const rail = page.getByTestId("playground-examples");
  try {
    await rail.waitFor({ state: "visible", timeout: 10_000 });
  } catch {
    throw new Error(`${expected} shows no example rail (testID playground-examples) in 10 s, though its page has ${examples} examples: it is not the component page, or it did not render`);
  }
  const match = rail.getByRole("tab", { name: cell.label, exact: true, selected: true });
  if ((await match.count()) !== 1) {
    const selected = await rail.getByRole("tab", { selected: true }).evaluateAll((tabs) =>
      tabs.map((tab) => (tab.getAttribute("aria-label") ?? tab.textContent ?? "").replace(/\s+/g, " ").trim()));
    throw new Error(`the example rail selected ${selected.length ? selected.map((s) => `"${s}"`).join(", ") : "no tab"} where "${cell.label}" was opened`);
  }
  return { path: expected, selected: cell.label };
}

export function bytesOf(dir: string, files: string[]): number {
  let total = 0;
  for (const file of files) {
    try {
      total += statSync(join(dir, file)).size;
    } catch {
      // not written
    }
  }
  return total;
}

export interface CellOptions {
  runDir: string;
  worker: number;
  /** How many examples the component's page has: one means it has no rail. */
  examples: number;
  /** Whether axe scans the web row of this cell. */
  axe: boolean;
}

/** What a guarded cell's work returned, or what stopped it. */
export type Guarded<T> = { ok: true; value: T } | { ok: false; error: string };

/**
 * Run one cell's work on the session's page within `timeoutMs`. Whatever stops it is
 * returned, never thrown: the page's viewport goes to failure.png in `dir` when the page
 * can still be photographed, and the page is closed so nothing the work left hanging (an
 * evaluate on a stalled renderer, a crashed tab) reaches the next cell. Every kind of cell
 * runs through it: the variants here, the states (./state-cell.ts) and the pages
 * (./page-cell.ts).
 */
export async function guardCell<T>(
  session: AuditSession,
  dir: string,
  what: string,
  timeoutMs: number,
  work: (page: Page, problems: PageProblems) => Promise<T>,
): Promise<Guarded<T>> {
  let page: Page | null = null;
  try {
    const opened = await session.page();
    page = opened.page;
    return { ok: true, value: await withTimeout(work(opened.page, opened.problems), timeoutMs, what) };
  } catch (error) {
    // Playwright's assertion messages carry terminal colours; the record is read as text.
    const message = (error instanceof Error ? error.message : String(error)).replace(/\u001b\[[0-9;]*m/g, "").split("\n").slice(0, 6).join("\n");
    if (page && !page.isClosed()) {
      await withTimeout(page.screenshot({ path: join(dir, FAILURE_FILE), timeout: 5_000 }), 8_000, "the failure screenshot").catch(() => {});
    }
    await session.discard();
    return { ok: false, error: message };
  }
}

/** Capture one cell into its directory and return its record. Never throws. */
export async function captureCell(session: AuditSession, cell: WebCell, options: CellOptions): Promise<CellRecord> {
  const started = Date.now();
  const id = webCellId(cell);
  const dir = cellDir(options.runDir, cell);
  mkdirSync(dir, { recursive: true });
  const base = {
    id,
    slug: cell.slug,
    variant: cell.variant,
    label: cell.label,
    width: cell.width.key,
    look: cell.look,
    surface: cell.surface,
    worker: options.worker,
  };
  const result = await guardCell(session, dir, `the cell ${id}`, CELL_TIMEOUT_MS, (page, problems) => capture(page, problems, cell, dir, options));
  if (result.ok) {
    return { ...base, status: "ok", flags: result.value, ms: Date.now() - started, bytes: bytesOf(dir, [CARD_FILE, PROBE_FILE]), at: new Date().toISOString() };
  }
  return {
    ...base,
    status: "failed",
    error: result.error,
    flags: [],
    ms: Date.now() - started,
    bytes: bytesOf(dir, [CARD_FILE, PROBE_FILE, FAILURE_FILE]),
    at: new Date().toISOString(),
  };
}

async function capture(page: Page, problems: PageProblems, cell: WebCell, dir: string, options: CellOptions): Promise<string[]> {
  const mark = markOf(problems);
  const look = LOOKS.find((l) => l.id === cell.look);
  if (!look) throw new Error(`no docs look is called ${cell.look}`);
  const viewport = { width: cell.width.width, height: cell.width.height };
  await gotoDocs(page, cell.path, { scheme: look.scheme, palette: look.palette, surface: cell.surface, viewport });
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  const structure = await verifyStructure(page, cell, options.examples);

  const card = previewCard(page).first();
  await card.waitFor({ state: "visible", timeout: 10_000 });
  await fitElementForScreenshot(page, card);
  const grown = page.viewportSize();
  await card.screenshot({ path: join(dir, CARD_FILE), animations: "disabled", caret: "hide" });
  const cardBox = await card.boundingBox();
  if (!cardBox) throw new Error("the preview card has no box after its screenshot");

  const rows: ProbeRow[] = [];
  const evidence: Record<string, { aria: string; material: Omit<Awaited<ReturnType<typeof readMaterialEffects>>, "userAgent"> }> = {};
  let userAgent = "";
  for (const platform of ROW_PLATFORMS) {
    const row = platformRow(page, platform).first();
    if (!(await row.count())) continue;
    const derived = deriveRow(await probeRow(row, platform));
    rows.push(derived);
    const { userAgent: agent, ...material } = await readMaterialEffects(row);
    userAgent = agent;
    evidence[platform] = { aria: await row.ariaSnapshot(), material };
  }
  if (!rows.length) throw new Error("the preview card has no platform rows");
  const overflow = overflowOf(await probePageOverflow(card), rows);
  const renderFailed = (await card.getByText(RENDER_FAILURE, { exact: true }).count()) > 0;

  let axe: { scanned: boolean; violations: { id: string; impact: string; help: string; nodes: number; targets: string[] }[] } = { scanned: false, violations: [] };
  if (options.axe && evidence.web) {
    const violations = await scan(page, '[data-platform-row="web"]');
    axe = {
      scanned: true,
      violations: violations.map(({ id, impact, help, nodes, raw }) => ({
        id,
        impact,
        help,
        nodes,
        targets: raw.nodes.slice(0, 20).map((node) => node.target.map(String).join(" ")),
      })),
    };
  }
  const reported = problemsSince(problems, mark);
  const summary = summarizeProbe(rows, overflow.overflowing, { axeViolations: axe.violations.length, problems: reported.length, renderFailed });

  const probe = {
    schema: 1,
    cell: { id: webCellId(cell), slug: cell.slug, variant: cell.variant, label: cell.label, width: cell.width.key, look: cell.look, surface: cell.surface },
    url: page.url(),
    userAgent,
    structure,
    dpr: await page.evaluate(() => window.devicePixelRatio),
    viewport: { initial: viewport, grown },
    card: { box: cardBox, file: CARD_FILE },
    rows: rows.map((row) => ({
      platform: row.platform,
      box: row.box,
      aria: evidence[row.platform]!.aria,
      material: evidence[row.platform]!.material,
      overflowX: row.overflowX,
      texts: row.texts,
      interactive: row.interactive,
    })),
    overflow: overflow.boxes,
    axe,
    problems: reported,
    summary,
  };
  writeFileSync(join(dir, PROBE_FILE), `${JSON.stringify(probe, null, 2)}\n`);
  return flagsOf(summary);
}

/** Append a cell's record to the run's cells.jsonl: one write per line, so workers' lines never interleave. */
export function recordCell(runDir: string, record: CellRecord): void {
  appendFileSync(join(runDir, CELLS_FILE), `${JSON.stringify(record)}\n`);
}
