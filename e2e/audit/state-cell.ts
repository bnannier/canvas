/**
 * Capturing one interaction-state cell of the component audit (plan 1d): one component's
 * state (e2e/support/state-recipes.ts), reached from one platform row of one example, at
 * one width, in one look and surface. `captureStateCell` never throws.
 *
 * Per cell, in order:
 *   1. `gotoDocs` at the cell's width, look and surface: a fresh load, as a variant cell's.
 *   2. Structure before anything: the page is at the example's own address and its rail
 *      has that example selected (./cell.ts `verifyStructure`).
 *   3. A state photographed in its row has the card fitted into a viewport grown to hold
 *      it, as a variant cell's is. A state photographed in the viewport (an open overlay)
 *      keeps the cell's own viewport, since a sheet is placed against it and a dialog
 *      centred in it: a viewport grown to a tall card's height would place them wrong.
 *   4. The recipe's apply, then its verify. A state verify cannot confirm is recorded as
 *      `state-not-reached` with the reason and the evidence, released, and never
 *      photographed.
 *   5. A reached state is photographed (state.png: the row with the shot margin, 12 px, for a ring
 *      or a lifted shade, or the viewport), then probed the way a variant cell is: the
 *      row (and the panel the state opened, judged by the row's platform floors; a panel
 *      drawn inside the row is read with the row, so its texts count once) through the
 *      in-page probe, their aria snapshots and material effects, the page's overflow, axe
 *      on the web row where the run's policy says, and the page's console, CSP and
 *      request problems during the cell. The state's flags join the probe's. Each region
 *      records where its boxes are measured from in the viewport (`origin`) and the shot
 *      its clip, so the analysis finds every text in state.png (tools/audit/analyze.ts).
 *   6. The recipe's release, which ends the state the way a person would and measures how
 *      that went (a press that should have been cancelled and was not, an inspection or an
 *      overlay that would not clear): its report goes into probe.json and its flags into
 *      the cell's (cells.jsonl and the run summary), for a state not reached as well.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Locator, Page } from "@playwright/test";
import { colorsFor } from "../../src/style/tokens.ts";
import { scan } from "../support/axe";
import { probePageOverflow, probeRow } from "../support/audit-probes";
import { LOOKS, fitElementForScreenshot, gotoDocs, platformRow, previewCard, settledBox, stage } from "../support/docs";
import type { PageProblems } from "../support/fixtures";
import { rgb } from "../support/focus-ring";
import { readMaterialEffects } from "../support/material-evidence";
import type { StateRecipe, StateScene } from "../support/state-recipes";
import { deriveRow, flagsOf, overflowOf, summarizeProbe, type ProbeRow } from "../../tools/audit/probe-math.ts";
import { FAILURE_FILE, PROBE_FILE, STATE_FILE, marginClip, stateCellId, type StateCell, type StateCellRecord } from "../../tools/audit/web-capture.ts";
import { RENDER_FAILURE, bytesOf, guardCell, markOf, problemsSince, verifyStructure, type AuditSession } from "./cell";

/** The longest one state cell may take before it is recorded as failed and its page closed. */
export const STATE_CELL_TIMEOUT_MS = 90_000;

/** How long one action or wait inside a recipe may take: a missing control fails fast, not at the cell's limit. */
const ACTION_TIMEOUT_MS = 15_000;

export interface StateCellOptions {
  runDir: string;
  worker: number;
  /** How many examples the component's page has: one means it has no rail. */
  examples: number;
  /** Whether axe scans the web row (a state reached in the web row only). */
  axe: boolean;
}

interface Outcome {
  status: "ok" | "state-not-reached";
  reason?: string;
  flags: string[];
}

/** Capture one state cell into its directory and return its record. Never throws. */
export async function captureStateCell(session: AuditSession, cell: StateCell, recipe: StateRecipe, options: StateCellOptions): Promise<StateCellRecord> {
  const started = Date.now();
  const id = stateCellId(cell);
  const dir = join(options.runDir, id);
  mkdirSync(dir, { recursive: true });
  const base = {
    kind: "state" as const,
    id,
    slug: cell.slug,
    variant: cell.variant.variant,
    label: cell.variant.label,
    state: cell.state,
    row: cell.row,
    width: cell.width.key,
    look: cell.look,
    surface: cell.surface,
    worker: options.worker,
  };
  const result = await guardCell(session, dir, `the state cell ${id}`, STATE_CELL_TIMEOUT_MS, (page, problems) => capture(page, problems, cell, recipe, dir, options));
  if (result.ok) {
    const { status, reason, flags } = result.value;
    return {
      ...base,
      status,
      ...(reason ? { reason } : {}),
      flags,
      ms: Date.now() - started,
      bytes: bytesOf(dir, [STATE_FILE, PROBE_FILE]),
      at: new Date().toISOString(),
    };
  }
  return {
    ...base,
    status: "failed",
    error: result.error,
    flags: [],
    ms: Date.now() - started,
    bytes: bytesOf(dir, [PROBE_FILE, FAILURE_FILE]),
    at: new Date().toISOString(),
  };
}

/** One probed region: the row, or the panel the state opened. */
async function probeRegion(region: Locator, platform: StateCell["row"]): Promise<{ derived: ProbeRow; aria: string; material: Omit<Awaited<ReturnType<typeof readMaterialEffects>>, "userAgent">; userAgent: string }> {
  const derived = deriveRow(await probeRow(region, platform));
  const { userAgent, ...material } = await readMaterialEffects(region);
  return { derived, aria: await region.ariaSnapshot(), material, userAgent };
}

async function capture(page: Page, problems: PageProblems, cell: StateCell, recipe: StateRecipe, dir: string, options: StateCellOptions): Promise<Outcome> {
  const mark = markOf(problems);
  page.setDefaultTimeout(ACTION_TIMEOUT_MS);
  const look = LOOKS.find((l) => l.id === cell.look);
  if (!look) throw new Error(`no docs look is called ${cell.look}`);
  const viewport = { width: cell.width.width, height: cell.width.height };
  await gotoDocs(page, cell.variant.path, { scheme: look.scheme, palette: look.palette, surface: cell.surface, viewport });
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  const structure = await verifyStructure(page, cell.variant, options.examples);

  const card = previewCard(page).first();
  await card.waitFor({ state: "visible", timeout: 10_000 });
  if (recipe.frame === "row") await fitElementForScreenshot(page, card);
  else await settledBox(card);
  const grown = page.viewportSize();
  const row = platformRow(page, cell.row).first();
  if (!(await row.count())) throw new Error(`the preview card has no ${cell.row} row`);

  const scene: StateScene = {
    page,
    stage: stage(page).first(),
    row,
    platform: cell.row,
    ring: rgb(colorsFor(look.palette ?? "blush", look.scheme).ring),
  };
  const header = {
    schema: 1,
    cell: {
      id: stateCellId(cell),
      slug: cell.slug,
      state: cell.state,
      row: cell.row,
      variant: cell.variant.variant,
      label: cell.variant.label,
      width: cell.width.key,
      look: cell.look,
      surface: cell.surface,
    },
    recipe: { state: recipe.state, variant: recipe.variant, how: recipe.how, frame: recipe.frame },
    url: page.url(),
    structure,
    dpr: await page.evaluate(() => window.devicePixelRatio),
    viewport: { initial: viewport, grown },
  };

  const applied = await recipe.apply(scene);
  const verdict = await recipe.verify(scene, applied);
  if (!verdict.reached) {
    // The release still runs and is still measured: a press with no look of its own can
    // still fire when it should have been cancelled.
    const release = await recipe.release(scene, applied);
    const probe = {
      ...header,
      status: "state-not-reached",
      reason: verdict.reason,
      evidence: verdict.evidence,
      release: release.report,
      flags: release.flags,
      problems: problemsSince(problems, mark),
    };
    writeFileSync(join(dir, PROBE_FILE), `${JSON.stringify(probe, null, 2)}\n`);
    return { status: "state-not-reached", reason: verdict.reason, flags: release.flags };
  }

  // The photograph, while the state holds.
  const size = page.viewportSize() ?? viewport;
  let clip: { x: number; y: number; width: number; height: number } | null = null;
  if (recipe.frame === "row") {
    const box = await row.boundingBox();
    if (!box) throw new Error(`the ${cell.row} row has no box once the state is applied`);
    clip = marginClip(box, { left: 0, top: 0, right: size.width, bottom: size.height });
    await page.screenshot({ path: join(dir, STATE_FILE), clip, animations: "disabled", caret: "hide" });
  } else {
    await page.screenshot({ path: join(dir, STATE_FILE), animations: "disabled", caret: "hide" });
  }

  // The probe, while the state holds. A panel drawn inside the row (a Dialog, an
  // AlertDialog, a Toast, a Tooltip's bubble) is already read with the row: its texts and
  // targets are judged once, and its own entry keeps where it is, its tree and its material.
  const rowProbe = await probeRegion(row, cell.row);
  const panelProbe = verdict.panel ? await probeRegion(verdict.panel, cell.row) : null;
  const panelInRow = verdict.panel ? await row.evaluate((node, panel) => node.contains(panel), await verdict.panel.elementHandle()) : false;
  const regions = [rowProbe.derived, ...(panelProbe && !panelInRow ? [panelProbe.derived] : [])];
  const overflow = overflowOf(await probePageOverflow(card), [rowProbe.derived]);
  const renderFailed = (await card.getByText(RENDER_FAILURE, { exact: true }).count()) > 0;
  let axe: { scanned: boolean; violations: { id: string; impact: string; help: string; nodes: number; targets: string[] }[] } = { scanned: false, violations: [] };
  if (options.axe && cell.row === "web") {
    const violations = await scan(page, '[data-platform-row="web"]');
    axe = {
      scanned: true,
      violations: violations.map(({ id, impact, help, nodes, raw }) => ({ id, impact, help, nodes, targets: raw.nodes.slice(0, 20).map((node) => node.target.map(String).join(" ")) })),
    };
  }
  // The release, and what it measured: its flags join the state's and the probe's.
  const release = await recipe.release(scene, applied);
  const reported = problemsSince(problems, mark);
  const summary = summarizeProbe(regions, overflow.overflowing, { axeViolations: axe.violations.length, problems: reported.length, renderFailed });
  const flags = [...new Set([...flagsOf(summary), ...verdict.flags, ...release.flags])];

  const region = (probe: typeof rowProbe) => ({
    platform: probe.derived.platform,
    origin: probe.derived.origin,
    box: probe.derived.box,
    aria: probe.aria,
    material: probe.material,
    overflowX: probe.derived.overflowX,
    texts: probe.derived.texts,
    interactive: probe.derived.interactive,
  });
  const probe = {
    ...header,
    status: "ok",
    evidence: verdict.evidence,
    shot: { file: STATE_FILE, frame: recipe.frame, clip },
    userAgent: rowProbe.userAgent,
    row: region(rowProbe),
    panel: !panelProbe
      ? null
      : panelInRow
        ? { inRow: true, platform: panelProbe.derived.platform, origin: panelProbe.derived.origin, box: panelProbe.derived.box, aria: panelProbe.aria, material: panelProbe.material }
        : { inRow: false, ...region(panelProbe) },
    overflow: overflow.boxes,
    axe,
    problems: reported,
    summary,
    flags,
    release: release.report,
  };
  writeFileSync(join(dir, PROBE_FILE), `${JSON.stringify(probe, null, 2)}\n`);
  return { status: "ok", flags };
}
