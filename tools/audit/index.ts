#!/usr/bin/env bun
// `bun run audit:index`: the reviewer's index of the component audit (plan 1e). It builds
// .audit/current/ from the newest capture of every cell across every run under
// .audit/runs (runs.ts selectCurrent), so a partial re-capture (`--only`, `--variants`,
// `--states`, `--pages`) replaces exactly the cells it took and every other cell stays at
// the run that took it last:
//
//   .audit/current/<slug>/index.md   one component, pattern or template page: its checklist,
//                                    its contact sheets (sheets.ts), the runs its cells come
//                                    from with their commit and source fingerprint, and one
//                                    row per cell with its flags, the axe violations by
//                                    impact, the smallest painted font, the contrast fails,
//                                    overflow, clipped text, small targets, console problems,
//                                    and the cell's run, commit and fingerprint. A component's
//                                    interaction states have their own table: the example,
//                                    the state reached or not and why, the state's own flags
//                                    and what its release found. A page's sections are linked
//                                    one by one, by width, look and surface, with what the
//                                    analysis found in each.
//   .audit/current/SUMMARY.md        every component and page ranked by its cells' flags,
//                                    with its interaction states not reached and its release
//                                    flags, then every state not reached and every release
//                                    flag across them
//   .audit/current/current.json      the same selection, one entry per cell, for tools, and
//                                    the --run names it was built from
//
// A whole build (no --only) also removes the index.md of a component or page with no
// current cell, so no page of the view points at a capture the view does not hold;
// `audit:prune` rebuilds the view after it deletes a run, for the same reason
// (`brokenLinks` is the check).
//
// A cell's flags are its analysis' (analyze.ts, analysis.json) when it has been analyzed,
// else the capture's own, so run `bun run audit:analyze` first; the index says which
// cells are not analyzed.
//
//   bun run audit:index                       every component with captures
//   bun run audit:index -- --only=button      that component's index.md (SUMMARY.md and
//                                             current.json are always rebuilt whole)
//   bun run audit:index -- --run=<run id>     the view of those runs alone
//
// Exit status: 0, or 2 for a usage error.

import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { RELEASE_FLAGS, STATE_FLAGS, STATE_NAMES, stateSpecsOf } from "../../e2e/support/state-recipes.ts";
import { ROOT } from "../../e2e/support/routes.ts";
import { AXE_IMPACTS, type CellAnalysis, type RegionAnalysis } from "./analyze.ts";
import { COMPONENTS_DIR, PAGES_DIR } from "./checklists.ts";
import { LOOKS, SURFACES, WIDTHS, components, pages, NATIVE_CELLS_PER_VARIANT, WEB_CELLS_PER_VARIANT, type Platform } from "./inventory.ts";
import type { RowPlatform } from "./probe-math.ts";
import { ANALYSIS_FILE, CURRENT_DIR, checkOnly, currentCells, notReached, parseToolArgs, readJsonFile, recipeRank, STATE_NOT_REACHED, type AuditRun, type CapturedCell } from "./runs.ts";
import { CARD_FILE, PROBE_FILE, RUNS_DIR, STATE_FILE, VIEWPORT_FILE, parseWebFilters, planStateCapture, sectionFile } from "./web-capture.ts";

export const INDEX_FILE = "index.md";
export const SUMMARY_FILE = "SUMMARY.md";
export const CURRENT_FILE = "current.json";

/** One section photograph of a page cell. */
export interface SectionShot {
  key: string;
  /** The photograph, relative to the checkout root. */
  file: string;
  /** What the analysis found in the section, when the cell is analyzed. */
  found: RegionAnalysis | null;
}

/** One cell's line in an index. */
export interface CellRow {
  id: string;
  family: CapturedCell["family"];
  platform: Platform;
  variant: string | null;
  /** A state cell's example label. */
  label: string | null;
  state: string | null;
  /** A state cell's recipe, by its name (the state, or `<state>-<variant>` for a state with several recipes). */
  recipe: string | null;
  /** The platform row of the browser card a state was reached from. */
  row: RowPlatform | null;
  width: string | null;
  run: string;
  capturedAt: string;
  sha: string | null;
  dirty: boolean | null;
  fingerprint: string | null;
  status: string;
  /** Why a failed cell failed, or why a state was not reached. */
  error: string | null;
  analyzed: boolean;
  flags: string[];
  /** A state's own defects (STATE_FLAGS) and what its release found (RELEASE_FLAGS), among `flags`. */
  stateFlags: string[];
  releaseFlags: string[];
  /** Violations by impact, or null where axe did not scan the cell. */
  axe: Record<string, number> | null;
  minFont: number | null;
  /** DOM fails, pixel fail-likely, pixel review; null where nothing was judged. */
  contrast: { dom: number; likely: number; review: number } | null;
  overflow: string[];
  clipped: number | null;
  smallTargets: number | null;
  problems: number | null;
  notReached: boolean;
  /** The file a reader opens for the cell (its photograph, else its probe), relative to the checkout root. */
  file: string | null;
  /** A page cell's section photographs, in the page's order. */
  sections: SectionShot[];
}

/** The flags a cell is filed under: its analysis' where it has one, else what its capture recorded. */
export function cellFlags(cell: Pick<CapturedCell, "status" | "flags">, analysis: CellAnalysis | null): string[] {
  if (analysis) return analysis.flags;
  const flags = [...cell.flags];
  if (cell.status === "failed") flags.unshift("failed");
  if (cell.status === "unstable") flags.push("unstable");
  if (notReached(cell)) flags.unshift(STATE_NOT_REACHED);
  return [...new Set(flags)];
}

/** The photograph a reader opens for a cell: a variant's card, a state's shot, a page's first screen (a native page's card). */
const PHOTO: Record<CapturedCell["family"], (platform: Platform) => string> = {
  variant: () => CARD_FILE,
  state: () => STATE_FILE,
  page: (platform) => (platform === "web" ? VIEWPORT_FILE : CARD_FILE),
};

/** One cell as its index row, from its capture and (when it has one for this capture) its analysis. */
export function cellRow(cell: CapturedCell, analysis: CellAnalysis | null, root: string, sectionKeys: string[] = []): CellRow {
  const own = analysis && analysis.run === cell.run.id && analysis.id === cell.id ? analysis : null;
  const web = cell.platform === "web";
  const photo = join(cell.dir, PHOTO[cell.family](cell.platform));
  const probe = join(cell.dir, PROBE_FILE);
  const file = existsSync(photo) ? photo : existsSync(probe) ? probe : null;
  // Judged only where there was something to judge targets on: a web cell's regions, an Android cell's dump.
  const reports = own ? Object.values(own.targets) : [];
  const smallTargets = reports.length ? reports.reduce((n, report) => n + (report?.small.length ?? 0), 0) : null;
  const flags = cellFlags(cell, own);
  const sections = cell.family === "page" && web
    ? sectionKeys
        .map((key) => ({ key, path: join(cell.dir, sectionFile(key)) }))
        .filter(({ path }) => existsSync(path))
        .map(({ key, path }) => ({ key, file: relative(root, path), found: own?.regions?.[`section:${key}`] ?? null }))
    : [];
  // Nothing was probed for a state not reached: its row says why, and what its release found.
  const judged = own && web && !notReached(cell);
  return {
    id: cell.id,
    family: cell.family,
    platform: cell.platform,
    variant: cell.variant,
    label: cell.label,
    state: cell.state,
    recipe: cell.recipe,
    row: cell.row,
    width: cell.width,
    run: cell.run.id,
    capturedAt: cell.capturedAt,
    sha: cell.run.sha,
    dirty: cell.run.dirty,
    fingerprint: cell.run.fingerprint,
    status: cell.status,
    error: cell.error,
    analyzed: own !== null,
    flags,
    stateFlags: flags.filter((flag) => flag in STATE_FLAGS),
    releaseFlags: flags.filter((flag) => flag in RELEASE_FLAGS),
    axe: judged && own.axe.scanned ? own.axe.byImpact : null,
    minFont: own?.fonts.min ?? null,
    contrast: judged ? { dom: own.contrast.dom.fails, likely: own.contrast.pixels.failLikely, review: own.contrast.pixels.review } : null,
    overflow: own?.overflow ?? [],
    clipped: judged ? own.clippedText : null,
    smallTargets: notReached(cell) ? null : smallTargets,
    problems: own ? own.problems : null,
    notReached: notReached(cell),
    file: file ? relative(root, file) : null,
    sections,
  };
}

// --- Rendering ---------------------------------------------------------------------------

/** A table cell's text, with the pipes and line breaks a Markdown table cannot hold escaped. */
export function mdCell(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

const dash = "-";
const num = (value: number | null) => (value === null ? dash : String(value));
const short = (sha: string | null, dirty: boolean | null) => (sha ? `${sha.slice(0, 7)}${dirty ? " (dirty)" : ""}` : dash);
const print12 = (fingerprint: string | null) => (fingerprint ? fingerprint.slice(0, 12) : dash);
/** A recorded reason's first line, whole: a table cell holds it, and a cut reason loses what it names last. */
const firstLine = (text: string) => text.split("\n")[0]!;

/** A link from `from` (a directory, relative to the checkout) to `to` (relative to the checkout). */
const link = (from: string, to: string) => relative(from, to).split("\\").join("/");

export interface SheetLinks {
  /** Sheet file names per variant, as written under sheets/<variant>/. */
  variants: Map<string, string[]>;
  /** The component's or page's own sheets (states.jpg, viewport-solid.jpg and the like) under sheets/. */
  component: string[];
}

/** What a full capture holds of one component or page. */
export interface Expected {
  /** Variant (or page) cells per platform. */
  cells: Record<Platform, number>;
  /** Interaction-state cells a full `--states` run takes (web-capture.ts planStateCapture); 0 for a page. */
  states: number;
}

export interface ComponentIndex {
  slug: string;
  name: string;
  kind: "component" | "page";
  /** The checklist, relative to the checkout root. */
  checklist: string;
  checklistExists: boolean;
  /** Variant keys and their labels, in docs order; a page's one entry is the whole page. */
  variants: { key: string; label: string }[];
  /** A page's sections, in order. */
  sections: { key: string; title: string }[];
  expected: Expected;
  rows: CellRow[];
  runs: AuditRun[];
  sheets: SheetLinks;
  builtAt: string;
  /** The checkout root the runs' directories are under. */
  root: string;
}

/** Flag counts over rows, most frequent first. */
export function flagCounts(rows: Pick<CellRow, "flags">[]): [string, number][] {
  const counts = new Map<string, number>();
  for (const row of rows) for (const flag of row.flags) counts.set(flag, (counts.get(flag) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

const PLATFORM_ORDER: Platform[] = ["web", "ios", "android"];
const WIDTH_ORDER = WIDTHS.map((w) => w.key) as string[];
const LOOK_SURFACE = LOOKS.flatMap((look) => SURFACES.map((surface) => `${look}.${surface}`));
/** The rows of the browser card a state is reached from, in the order a reader takes them. */
const ROW_ORDER: RowPlatform[] = ["web", "ios", "android"];

/** Rows in reading order: a state's recipe (in the state table's order) and row first, then platform, width, look and surface. */
export function sortRows(rows: CellRow[]): CellRow[] {
  const leaf = (row: CellRow) => row.id.split("/").pop()!;
  const rank = (row: CellRow) => {
    const parts = leaf(row).split(".");
    const width = row.platform === "web" ? WIDTH_ORDER.indexOf(parts[0]!) : 0;
    const ls = LOOK_SURFACE.indexOf(parts.slice(row.platform === "web" ? 1 : 0).join("."));
    const state = row.state ? STATE_NAMES.indexOf(row.state as (typeof STATE_NAMES)[number]) : -1;
    const recipe = row.family === "state" ? recipeRank({ slug: row.id.split("/")[1]!, recipe: row.recipe }) : -1;
    const from = row.row ? ROW_ORDER.indexOf(row.row) : -1;
    return [state, recipe, from, PLATFORM_ORDER.indexOf(row.platform), width, ls];
  };
  return [...rows].sort((a, b) => {
    const ra = rank(a);
    const rb = rank(b);
    for (let i = 0; i < ra.length; i++) if (ra[i] !== rb[i]) return ra[i]! - rb[i]!;
    return a.id.localeCompare(b.id);
  });
}

const CELL_HEADER = [
  "| Cell | Status | Flags | Axe crit/ser/mod/min | Min font px | Contrast dom/likely/review | Overflow | Clipped | Small targets | Problems | Run | Commit | Fingerprint |",
  "|---|---|---|---|---|---|---|---|---|---|---|---|---|",
];

const STATE_HEADER = [
  "| Cell | Example | Reached | State flags | Release flags | Other flags | Axe crit/ser/mod/min | Min font px | Contrast dom/likely/review | Clipped | Small targets | Problems | Run | Commit | Fingerprint |",
  "|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|",
];

const cellName = (row: CellRow, dir: string) => (row.file ? `[${mdCell(row.id)}](${link(dir, row.file)})` : mdCell(row.id));
const axeOf = (row: CellRow) => (row.axe ? AXE_IMPACTS.map((impact) => row.axe![impact] ?? 0).join("/") : dash);
const contrastOf = (row: CellRow) => (row.contrast ? `${row.contrast.dom}/${row.contrast.likely}/${row.contrast.review}` : dash);
const tail = (row: CellRow) => `${row.run} | ${short(row.sha, row.dirty)} | ${print12(row.fingerprint)} |`;

function cellLine(row: CellRow, dir: string): string {
  const status = row.status === "failed" && row.error ? `failed: ${firstLine(row.error)}` : row.status;
  const flags = row.flags.length ? row.flags.join(", ") : row.analyzed ? "none" : "none (not analyzed)";
  return `| ${cellName(row, dir)} | ${mdCell(status)} | ${mdCell(flags)} | ${axeOf(row)} | ${num(row.minFont)} | ${contrastOf(row)} | ${row.overflow.length ? mdCell(row.overflow.join(", ")) : dash} | ${num(row.clipped)} | ${num(row.smallTargets)} | ${num(row.problems)} | ${tail(row)}`;
}

function stateLine(row: CellRow, dir: string): string {
  const reached = row.notReached
    ? `not reached: ${firstLine(row.error ?? "no reason recorded")}`
    : row.status === "failed"
      ? `failed: ${firstLine(row.error ?? "unknown")}`
      : "yes";
  const others = row.flags.filter((flag) => flag !== STATE_NOT_REACHED && !row.stateFlags.includes(flag) && !row.releaseFlags.includes(flag));
  const list = (flags: string[]) => (flags.length ? mdCell(flags.join(", ")) : dash);
  const other = others.length ? mdCell(others.join(", ")) : row.analyzed || row.notReached ? dash : "(not analyzed)";
  return `| ${cellName(row, dir)} | ${mdCell(row.label ? `${row.label} (\`${row.variant}\`)` : row.variant ?? dash)} | ${mdCell(reached)} | ${list(row.stateFlags)} | ${list(row.releaseFlags)} | ${other} | ${axeOf(row)} | ${num(row.minFont)} | ${contrastOf(row)} | ${num(row.clipped)} | ${num(row.smallTargets)} | ${num(row.problems)} | ${tail(row)}`;
}

const SHEET_ORDER = ["card-solid", "card-glass", "native", "compare", "compare-glass"];

/** A sheet file's stem: its name without the part number of a numbered sheet (sheets.ts partFile) or the extension. */
export const sheetStem = (file: string) => file.replace(/(-\d+)?\.jpg$/, "");
const partNumber = (file: string) => Number(/-(\d+)\.jpg$/.exec(file)?.[1] ?? 0);

/** Links to the sheets of one grid: by its name alone, or by number when it was cut into numbered sheets. */
function named(files: string[], stem: string, text: string, href: (file: string) => string): string | null {
  const parts = files.filter((file) => sheetStem(file) === stem).sort((a, b) => partNumber(a) - partNumber(b));
  if (!parts.length) return null;
  if (parts.length === 1 && parts[0] === `${stem}.jpg`) return `[${text}](${href(parts[0])})`;
  return `${text} (${parts.map((file) => `[${partNumber(file)}](${href(file)})`).join(", ")})`;
}

function sheetLine(variant: string, files: string[], dir: string): string {
  const href = (file: string) => link(dir, join(dir, "sheets", variant, file));
  const cards = [named(files, "card-solid", "solid", href), named(files, "card-glass", "glass", href)].filter(Boolean).join(", ") || dash;
  const rows = (["ios", "android", "web"] as const)
    .map((platform) => {
      const widths = WIDTH_ORDER.map((width) => named(files, `row-${platform}-${width}`, width, href)).filter(Boolean);
      return widths.length ? `${platform} ${widths.join(" ")}` : null;
    })
    .filter(Boolean)
    .join("; ") || dash;
  const compare = [named(files, "compare", "solid", href), named(files, "compare-glass", "glass", href)].filter(Boolean).join(", ") || dash;
  const others = files.filter((file) => !SHEET_ORDER.includes(sheetStem(file)) && !file.startsWith("row-"));
  return `| \`${variant}\` | ${cards} | ${rows} | ${named(files, "native", "native", href) ?? dash} | ${compare}${others.length ? `; ${others.map((file) => `[${file}](${href(file)})`).join(", ")}` : ""} |`;
}

/** The component's own sheets (states, a page's first screen), each grid linked by name or by number. */
function ownSheets(files: string[], dir: string, stems: { stem: string; text: string }[]): string[] {
  const href = (file: string) => link(dir, join(dir, "sheets", file));
  const known = stems.map(({ stem, text }) => named(files, stem, text, href)).filter((entry): entry is string => entry !== null);
  const others = files.filter((file) => !stems.some(({ stem }) => sheetStem(file) === stem)).map((file) => `[${file}](${href(file)})`);
  return [...known, ...others];
}

const STATE_SHEET_STEMS = [{ stem: "states", text: "desktop" }, { stem: "states-tablet", text: "tablet" }, { stem: "states-phone", text: "phone" }];
const PAGE_SHEET_STEMS = [{ stem: "viewport-solid", text: "solid" }, { stem: "viewport-glass", text: "glass" }];

/** What the analysis found in one section photograph, said beside its link. */
function sectionFindings(found: RegionAnalysis | null): string {
  if (!found) return "";
  const parts: string[] = [];
  const { domFails, failLikely, review } = found.contrast;
  if (domFails || failLikely || review) parts.push(`contrast ${domFails}/${failLikely}/${review}`);
  if (found.smallTargets) parts.push(`${found.smallTargets} small`);
  return parts.length ? ` (${parts.join("; ")})` : "";
}

/** The page's sections, each linked by width, look and surface, with what the analysis found in it. */
function sectionTable(model: ComponentIndex, dir: string): string[] {
  const web = model.rows.filter((row) => row.family === "page" && row.platform === "web");
  if (!web.some((row) => row.sections.length)) return [];
  const out = [
    "## Sections",
    "",
    "Each section photographed on its own (`section.<key>.png`), fitted with the margin its own paint needs, by width, look and surface. Beside a photograph, what the analysis found in that section: contrast DOM fails, likely and review, and small targets (web 24 px).",
    "",
    `| Section | Width | ${LOOK_SURFACE.map((ls) => ls.replace(".", " ")).join(" | ")} |`,
    `|---|---|${LOOK_SURFACE.map(() => "---").join("|")}|`,
  ];
  for (const { key, title } of model.sections) {
    for (const width of WIDTH_ORDER) {
      const cells = LOOK_SURFACE.map((ls) => {
        const shot = web.find((row) => row.id.endsWith(`/${width}.${ls}`))?.sections.find((section) => section.key === key);
        return shot ? `[shot](${link(dir, shot.file)})${sectionFindings(shot.found)}` : dash;
      });
      if (cells.every((cell) => cell === dash)) continue;
      out.push(`| ${mdCell(title)} (\`${key}\`) | ${width} | ${cells.join(" | ")} |`);
    }
  }
  out.push("");
  return out;
}

/** What a component's state cells hold: reached and not, and the flags the states and their releases carry. */
function stateSummary(states: CellRow[]): string[] {
  const unreached = states.filter((row) => row.notReached).length;
  const lines = ["## Interaction states", "", `${states.length} cell(s), ${states.length - unreached} reached and ${unreached} not reached; each is listed under Cells below with its example, why it was not reached, and what the state and its release found.`, ""];
  const counted = (flags: (row: CellRow) => string[], meaning: Record<string, string>) =>
    flagCounts(states.map((row) => ({ flags: flags(row) }))).map(([flag, n]) => `| ${flag} | ${n} | ${mdCell(meaning[flag] ?? "")} |`);
  const own = counted((row) => row.stateFlags, STATE_FLAGS);
  const release = counted((row) => row.releaseFlags, RELEASE_FLAGS);
  if (own.length || release.length) {
    lines.push("| State or release flag | Cells | What it means |", "|---|---|---|", ...own, ...release, "");
  }
  return lines;
}

/** One component's or page's index.md, from its model; `dir` is the index's directory relative to the checkout. */
export function renderComponentIndex(model: ComponentIndex, dir: string): string {
  const out: string[] = [];
  const captured = (platform: Platform) => model.rows.filter((row) => row.platform === platform && row.family !== "state").length;
  const states = model.rows.filter((row) => row.family === "state");
  const flagged = model.rows.filter((row) => row.flags.length > 0).length;
  const unanalyzed = model.rows.filter((row) => !row.analyzed).length;
  out.push(`# ${model.name}`, "");
  out.push(`\`${model.slug}\`: the audit index of the newest capture of each of its cells across every run, built ${model.builtAt} by \`bun run audit:index\`. Generated; do not edit.`, "");
  out.push(`- Checklist: ${model.checklistExists ? `[${model.checklist}](${link(dir, model.checklist)})` : `${model.checklist} (missing)`}`);
  const statesLine = model.expected.states || states.length ? `; interaction states ${states.length} of ${model.expected.states}${states.length ? ` (${states.filter((row) => row.notReached).length} not reached)` : ""}` : "";
  out.push(`- Captured: ${PLATFORM_ORDER.map((platform) => `${platform} ${captured(platform)} of ${model.expected.cells[platform]}`).join(", ")}${statesLine}`);
  out.push(`- Flagged: ${flagged} of ${model.rows.length} cell(s)${unanalyzed ? `; ${unanalyzed} not analyzed (run \`bun run audit:analyze\`)` : ""}`);
  out.push("");
  out.push("## Runs", "", "The runs its cells come from; a cell is shown from the run that captured it last.", "");
  out.push("| Run | Platform | Started | Commit | Source fingerprint | Served | Status | Cells shown |", "|---|---|---|---|---|---|---|---|");
  for (const run of model.runs) {
    const shown = model.rows.filter((row) => row.run === run.id).length;
    const manifest = join(relative(model.root, run.dir), "manifest.json");
    out.push(`| [${run.id}](${link(dir, manifest)}) | ${run.platform} | ${run.startedAt} | ${short(run.sha, run.dirty)} | ${print12(run.fingerprint)}${run.fresh === false ? " (not this checkout's source)" : ""} | ${mdCell(run.served ?? dash)} | ${run.status} | ${shown} |`);
  }
  out.push("");
  const flags = flagCounts(model.rows);
  out.push("## Flags", "");
  if (flags.length) {
    out.push("| Flag | Cells |", "|---|---|", ...flags.map(([flag, n]) => `| ${flag} | ${n} |`));
  } else out.push("No cell is flagged.");
  out.push("");
  if (states.length) out.push(...stateSummary(states));
  const sheetVariants = model.variants.filter((variant) => model.sheets.variants.has(variant.key));
  if (sheetVariants.length || model.sheets.component.length) {
    out.push("## Sheets", "", "Contact sheets (`bun run audit:sheets`), every tile labelled with its cell id and the commit it was captured at, every sheet titled with the runs it draws from. A numbered sheet is one share of a grid too large to read on one.", "");
    if (sheetVariants.length) {
      out.push("| Variant | Card (widths x looks) | Rows (looks x surfaces) | Devices | Browser beside device |", "|---|---|---|---|---|");
      for (const variant of sheetVariants) out.push(sheetLine(variant.key, model.sheets.variants.get(variant.key)!, dir));
      out.push("");
    }
    if (model.sheets.component.length) {
      const stems = model.kind === "page" ? PAGE_SHEET_STEMS : STATE_SHEET_STEMS;
      const title = model.kind === "page" ? "The first screen (widths x looks)" : "Interaction states (states x looks and surfaces), by width";
      out.push(`${title}: ${ownSheets(model.sheets.component, dir, stems).join(", ")}`, "");
    }
  }
  if (model.kind === "page") out.push(...sectionTable(model, dir));
  out.push("## Cells", "");
  out.push("Contrast counts DOM fails, then the photograph-sampled texts that are likely to fail and the ones to review (analyze.ts). Small targets counts the interactive boxes under their platform's floor (web 24 px, iOS 44 pt, Android 48 dp; the iOS and Android rows of the browser card and the Android device show the visible box, a hitSlop is not observable).", "");
  const groups: { title: string; rows: CellRow[]; line: (row: CellRow, dir: string) => string; header: string[] }[] = [];
  const keyOf = (row: CellRow) => (row.family === "page" ? "page" : row.variant ?? "");
  for (const variant of model.variants) {
    const rows = model.rows.filter((row) => row.family !== "state" && keyOf(row) === variant.key);
    if (rows.length) groups.push({ title: `\`${variant.key}\`: ${variant.label}`, rows, line: cellLine, header: CELL_HEADER });
  }
  const known = new Set(model.variants.map((variant) => variant.key));
  const strays = model.rows.filter((row) => row.family !== "state" && !known.has(keyOf(row)));
  if (strays.length) groups.push({ title: "Cells of variants the inventory no longer has", rows: strays, line: cellLine, header: CELL_HEADER });
  if (states.length) groups.push({ title: "Interaction states", rows: states, line: stateLine, header: STATE_HEADER });
  for (const group of groups) {
    out.push(`### ${group.title}`, "", ...group.header, ...sortRows(group.rows).map((row) => group.line(row, dir)), "");
  }
  return `${out.join("\n").trimEnd()}\n`;
}

export interface SummaryEntry {
  slug: string;
  name: string;
  kind: "component" | "page";
  rows: Pick<CellRow, "id" | "flags" | "platform" | "family" | "notReached" | "releaseFlags" | "error" | "state" | "recipe" | "row" | "label">[];
  expected: Expected;
  /** The index, relative to the checkout root, or null when it was not written. */
  index: string | null;
}

/** Entries ranked by the flags their cells carry, then by flagged cells, then by slug. */
export function rankEntries<T extends Pick<SummaryEntry, "slug" | "rows">>(entries: T[]): T[] {
  const total = (entry: T) => entry.rows.reduce((n, row) => n + row.flags.length, 0);
  const flagged = (entry: T) => entry.rows.filter((row) => row.flags.length > 0).length;
  return [...entries].sort((a, b) => total(b) - total(a) || flagged(b) - flagged(a) || a.slug.localeCompare(b.slug));
}

/** SUMMARY.md: every captured component and page ranked by its flags, its states not reached and its release flags, and the ones not captured at all. */
export function renderSummary(entries: SummaryEntry[], uncaptured: string[], runs: AuditRun[], builtAt: string, dir: string): string {
  const out: string[] = [];
  const all = entries.flatMap((entry) => entry.rows);
  const states = all.filter((row) => row.family === "state");
  const nameOf = (entry: SummaryEntry) => (entry.index ? `[${mdCell(entry.name)}](${link(dir, entry.index)})` : mdCell(entry.name));
  out.push("# Component audit: current captures", "");
  out.push(`The newest capture of every cell across ${runs.length} run(s), built ${builtAt} by \`bun run audit:index\`. Generated; do not edit. Ranked by the flags their cells carry.`, "");
  out.push(`- Cells: ${all.length}, ${all.filter((row) => row.flags.length > 0).length} flagged; ${PLATFORM_ORDER.map((platform) => `${platform} ${all.filter((row) => row.platform === platform).length}`).join(", ")}`);
  out.push(`- Of them: ${all.filter((row) => row.family === "variant").length} example variant cell(s), ${states.length} interaction-state cell(s) (${states.filter((row) => row.notReached).length} not reached), ${all.filter((row) => row.family === "page").length} page cell(s)`);
  out.push(`- Runs: ${runs.map((run) => run.id).join(", ") || "none"}`);
  out.push("");
  out.push("| Rank | Component or page | Flags | Flagged cells | Captured web/ios/android | States (not reached) | Release flags | Top flags |", "|---|---|---|---|---|---|---|---|");
  rankEntries(entries).forEach((entry, i) => {
    const total = entry.rows.reduce((n, row) => n + row.flags.length, 0);
    const flagged = entry.rows.filter((row) => row.flags.length > 0).length;
    const captured = PLATFORM_ORDER.map((platform) => `${entry.rows.filter((row) => row.platform === platform && row.family !== "state").length}/${entry.expected.cells[platform]}`).join(" ");
    const own = entry.rows.filter((row) => row.family === "state");
    const statesCell = entry.expected.states || own.length ? `${own.length}/${entry.expected.states} (${own.filter((row) => row.notReached).length})` : dash;
    const release = flagCounts(own.map((row) => ({ flags: row.releaseFlags }))).map(([flag, n]) => `${flag} ${n}`).join(", ") || dash;
    const top = flagCounts(entry.rows).slice(0, 4).map(([flag, n]) => `${flag} ${n}`).join(", ") || "none";
    out.push(`| ${i + 1} | ${nameOf(entry)} | ${total} | ${flagged} of ${entry.rows.length} | ${captured} | ${statesCell} | ${mdCell(release)} | ${mdCell(top)} |`);
  });
  out.push("");
  const flags = flagCounts(all);
  out.push("## Flags", "");
  if (flags.length) out.push("| Flag | Cells |", "|---|---|", ...flags.map(([flag, n]) => `| ${flag} | ${n} |`));
  else out.push("No cell is flagged.");
  out.push("");
  if (states.length) {
    out.push("## Interaction states not reached", "");
    // One line per component, state and row: the looks and surfaces it was not reached in, and the first reason.
    const groups = new Map<string, { entry: SummaryEntry; key: string; label: string | null; cells: string[]; reason: string }>();
    for (const entry of entries) {
      for (const row of entry.rows) {
        if (!row.notReached) continue;
        const key = `${row.recipe ?? row.state}.${row.row}`;
        const id = `${entry.slug}/${key}`;
        const group = groups.get(id) ?? { entry, key, label: row.label, cells: [], reason: row.error ?? "no reason recorded" };
        group.cells.push(row.id.split("/").pop()!);
        groups.set(id, group);
      }
    }
    if (groups.size) {
      out.push("| Component | State and row | Example | Cells | Why (the first) |", "|---|---|---|---|---|");
      for (const group of groups.values()) {
        out.push(`| ${nameOf(group.entry)} | ${group.key} | ${mdCell(group.label ?? dash)} | ${group.cells.length}: ${mdCell(group.cells.join(", "))} | ${mdCell(firstLine(group.reason))} |`);
      }
    } else out.push("Every captured state was reached.");
    out.push("");
    out.push("## Release flags", "", "What a state's release found when it ended the state the way a person would (e2e/support/state-recipes.ts RELEASE_FLAGS); recorded for a state not reached as well.", "");
    const release = new Map<string, Map<string, { entry: SummaryEntry; n: number }>>();
    for (const entry of entries) {
      for (const row of entry.rows) {
        for (const flag of row.releaseFlags) {
          const byEntry = release.get(flag) ?? new Map();
          const at = byEntry.get(entry.slug) ?? { entry, n: 0 };
          at.n += 1;
          byEntry.set(entry.slug, at);
          release.set(flag, byEntry);
        }
      }
    }
    if (release.size) {
      out.push("| Flag | What it means | Cells | Components |", "|---|---|---|---|");
      for (const [flag, byEntry] of [...release.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
        const list = [...byEntry.values()];
        out.push(`| ${flag} | ${mdCell(RELEASE_FLAGS[flag as keyof typeof RELEASE_FLAGS] ?? "")} | ${list.reduce((n, at) => n + at.n, 0)} | ${list.map((at) => `${nameOf(at.entry)} ${at.n}`).join(", ")} |`);
      }
    } else out.push("No release found anything wrong.");
    out.push("");
  }
  out.push("## Not captured", "", uncaptured.length ? `${uncaptured.length} component or page route(s) with no capture in any run: ${uncaptured.join(", ")}.` : "Every component and page has at least one captured cell.");
  return `${out.join("\n").trimEnd()}\n`;
}

// --- The command -------------------------------------------------------------------------

interface Target {
  slug: string;
  name: string;
  kind: "component" | "page";
  checklist: string;
  variants: { key: string; label: string }[];
  sections: { key: string; title: string }[];
  expected: Expected;
}

/** Every component and page the inventory has, as an index target, with what a full capture holds of it. */
export function targets(): Target[] {
  const inventory = components();
  // The state cells a full `--states` run plans per component, every look, surface and width.
  const plan = planStateCapture(inventory, stateSpecsOf, parseWebFilters({}), [...STATE_NAMES]);
  const states = new Map<string, number>();
  for (const group of plan.groups) states.set(group.slug, (states.get(group.slug) ?? 0) + group.cells.length);
  const list: Target[] = inventory.map((component) => ({
    slug: component.slug,
    name: component.name,
    kind: "component" as const,
    checklist: `audit/${COMPONENTS_DIR}/${component.slug}.md`,
    variants: component.variants.map((variant) => ({ key: variant.variant, label: variant.label })),
    sections: [],
    expected: {
      cells: { web: component.variants.length * WEB_CELLS_PER_VARIANT, ios: component.variants.length * NATIVE_CELLS_PER_VARIANT, android: component.variants.length * NATIVE_CELLS_PER_VARIANT },
      states: states.get(component.slug) ?? 0,
    },
  }));
  for (const page of pages()) {
    list.push({
      slug: page.id,
      name: page.id,
      kind: "page",
      checklist: `audit/${PAGES_DIR}/${page.id}.md`,
      variants: [{ key: "page", label: "the whole page" }],
      sections: page.sections,
      expected: { cells: { web: WEB_CELLS_PER_VARIANT, ios: NATIVE_CELLS_PER_VARIANT, android: NATIVE_CELLS_PER_VARIANT }, states: 0 },
    });
  }
  return list;
}

function sheetFiles(dir: string): SheetLinks {
  const base = join(dir, "sheets");
  const variants = new Map<string, string[]>();
  const component: string[] = [];
  if (!existsSync(base)) return { variants, component };
  for (const entry of readdirSync(base, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      const files = readdirSync(join(base, entry.name)).filter((file) => file.endsWith(".jpg")).sort();
      if (files.length) variants.set(entry.name, files);
    } else if (entry.name.endsWith(".jpg")) component.push(entry.name);
  }
  return { variants, component: component.sort() };
}

export interface IndexOptions {
  /** Only these runs (ids or prefixes), or every run. */
  runs: string[] | null;
  /** Write only these components' and pages' index.md; SUMMARY.md and current.json are always whole. */
  only: string[] | null;
}

export interface IndexResult {
  runs: AuditRun[];
  cells: number;
  entries: number;
  flagged: number;
  unanalyzed: number;
  /** Interaction-state cells, and those not reached. */
  states: number;
  notReached: number;
  written: number;
  /** index.md files of components and pages with no current cell, removed by a whole build. */
  removed: string[];
  /** Run problems and cells the inventory no longer has. */
  warnings: string[];
}

/** The selection a built view records, so a rebuild (audit:prune) keeps it. */
export interface CurrentSelection {
  /** The --run names the view was built from, or null for every run. */
  runs: string[] | null;
}

/**
 * Build `root`/.audit/current from the newest capture of every cell in the chosen runs:
 * each component's and page's index.md (only the `only` ones when given), SUMMARY.md and
 * current.json. A whole build (no `only`) removes the index.md of every component or page
 * that has no current cell, so nothing in the view points at a capture the view no longer
 * holds. Throws on an unknown `only` name or `--run`.
 */
export function buildIndex(root: string, options: IndexOptions, builtAt = new Date().toISOString()): IndexResult {
  checkOnly(options.only);
  // SUMMARY.md and current.json always cover every cell; `only` narrows the index.md files written.
  const selection = currentCells(root, { runs: options.runs, only: null });
  const warnings = [...selection.problems];
  const current = join(root, CURRENT_DIR);
  mkdirSync(current, { recursive: true });
  const bySlug = new Map<string, CapturedCell[]>();
  for (const cell of selection.cells) {
    const list = bySlug.get(cell.slug);
    if (list) list.push(cell);
    else bySlug.set(cell.slug, [cell]);
  }
  const entries: SummaryEntry[] = [];
  const all: CellRow[] = [];
  const uncaptured: string[] = [];
  const records: unknown[] = [];
  let written = 0;
  const inventory = targets();
  for (const target of inventory) {
    // A state cell of a recipe the state table no longer has is left out, as a cell of a
    // component the inventory no longer has is.
    const stale = (bySlug.get(target.slug) ?? []).filter((cell) => cell.family === "state" && recipeRank(cell) < 0);
    if (stale.length) warnings.push(`${stale.length} current cell(s) of ${target.slug}'s state recipe(s) ${[...new Set(stale.map((cell) => cell.recipe))].join(", ")}, which the state table no longer has, are left out`);
    const cells = bySlug.get(target.slug)?.filter((cell) => !stale.includes(cell));
    if (!cells?.length) {
      uncaptured.push(target.slug);
      continue;
    }
    const sectionKeys = target.sections.map((section) => section.key);
    const rows = cells.map((cell) => cellRow(cell, readJsonFile<CellAnalysis>(join(cell.dir, ANALYSIS_FILE)), root, sectionKeys));
    all.push(...rows);
    for (const row of rows) {
      records.push({
        id: row.id,
        family: row.family,
        run: row.run,
        capturedAt: row.capturedAt,
        status: row.status,
        ...(row.family === "state" ? { state: row.state, recipe: row.recipe, row: row.row, variant: row.variant, notReached: row.notReached, ...(row.notReached ? { reason: row.error } : {}), stateFlags: row.stateFlags, releaseFlags: row.releaseFlags } : {}),
        analyzed: row.analyzed,
        flags: row.flags,
        sha: row.sha,
        fingerprint: row.fingerprint,
        file: row.file,
        ...(row.sections.length ? { sections: row.sections.map((section) => ({ key: section.key, file: section.file })) } : {}),
      });
    }
    const dir = join(CURRENT_DIR, target.slug);
    const indexPath = join(dir, INDEX_FILE);
    const wanted = !options.only || options.only.includes(target.slug) || options.only.some((name) => target.kind === "page" && target.slug.endsWith(`-${name}`));
    if (wanted) {
      mkdirSync(join(root, dir), { recursive: true });
      const runIds = new Set(rows.map((row) => row.run));
      const model: ComponentIndex = {
        ...target,
        root,
        checklistExists: existsSync(join(root, target.checklist)),
        rows,
        runs: selection.runs.filter((run) => runIds.has(run.id)),
        sheets: sheetFiles(join(root, dir)),
        builtAt,
      };
      writeFileSync(join(root, indexPath), renderComponentIndex(model, dir));
      written += 1;
    }
    entries.push({ slug: target.slug, name: target.name, kind: target.kind, rows, expected: target.expected, index: existsSync(join(root, indexPath)) ? indexPath : null });
  }
  const removed: string[] = [];
  if (!options.only) {
    const indexed = new Set(entries.map((entry) => entry.slug));
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const stale = join(CURRENT_DIR, entry.name, INDEX_FILE);
      if (entry.isDirectory() && !indexed.has(entry.name) && existsSync(join(root, stale))) {
        rmSync(join(root, stale));
        removed.push(stale);
      }
    }
  }
  const known = new Set(inventory.map((target) => target.slug));
  for (const [slug, cells] of bySlug) if (!known.has(slug)) warnings.push(`${cells.length} current cell(s) of "${slug}", which the inventory no longer has, are left out`);
  writeFileSync(join(current, SUMMARY_FILE), renderSummary(entries, uncaptured, selection.runs, builtAt, CURRENT_DIR));
  const recorded: CurrentSelection = { runs: options.runs };
  writeFileSync(join(current, CURRENT_FILE), `${JSON.stringify({ schema: 1, builtAt, selection: recorded, runs: selection.runs.map((run) => ({ id: run.id, platform: run.platform, startedAt: run.startedAt, status: run.status, sha: run.sha, dirty: run.dirty, fingerprint: run.fingerprint, fresh: run.fresh })), cells: records }, null, 2)}\n`);
  const states = all.filter((row) => row.family === "state");
  return {
    runs: selection.runs,
    cells: all.length,
    entries: entries.length,
    flagged: all.filter((row) => row.flags.length).length,
    unanalyzed: all.filter((row) => !row.analyzed).length,
    states: states.length,
    notReached: states.filter((row) => row.notReached).length,
    written,
    removed,
    warnings,
  };
}

/** The selection the built view at `root` records, or null when there is no built view. */
export function builtSelection(root: string): CurrentSelection | null {
  const path = join(root, CURRENT_DIR, CURRENT_FILE);
  if (!existsSync(path)) return null;
  const built = readJsonFile<{ selection?: CurrentSelection }>(path);
  return { runs: built?.selection?.runs ?? null };
}

const LINK = /\]\(([^)\s]+)\)/g;

/**
 * Every link in the built view at `root` whose target is missing: the Markdown links of
 * SUMMARY.md and every index.md, resolved from the file's directory, and the cell files,
 * section photographs and run directories current.json names. Empty when the view is whole.
 */
export function brokenLinks(root: string): string[] {
  const current = join(root, CURRENT_DIR);
  if (!existsSync(current)) return [];
  const broken: string[] = [];
  const pages = [join(current, SUMMARY_FILE), ...readdirSync(current, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => join(current, entry.name, INDEX_FILE))];
  for (const page of pages) {
    if (!existsSync(page)) continue;
    for (const match of readFileSync(page, "utf8").matchAll(LINK)) {
      const target = match[1]!;
      if (/^[a-z]+:/i.test(target)) continue;
      if (!existsSync(join(dirname(page), target))) broken.push(`${relative(root, page)} -> ${target}`);
    }
  }
  const built = readJsonFile<{ runs?: { id: string }[]; cells?: { id: string; file: string | null; sections?: { file: string }[] }[] }>(join(current, CURRENT_FILE));
  for (const run of built?.runs ?? []) if (!existsSync(join(root, RUNS_DIR, run.id))) broken.push(`${CURRENT_DIR}/${CURRENT_FILE} -> run ${run.id}`);
  for (const cell of built?.cells ?? []) {
    for (const file of [cell.file, ...(cell.sections ?? []).map((section) => section.file)]) {
      if (file && !existsSync(join(root, file))) broken.push(`${CURRENT_DIR}/${CURRENT_FILE} -> ${file}`);
    }
  }
  return broken;
}

const USAGE = "usage: bun run audit:index -- [--only=<slugs>] [--run=<run ids>]";

function main(): number {
  const args = parseToolArgs(process.argv.slice(2));
  if (args.help) {
    console.log(USAGE);
    return 0;
  }
  if (args.errors.length) {
    console.error(`audit:index: ${args.errors.join("; ")}\n${USAGE}`);
    return 2;
  }
  const started = Date.now();
  let result: IndexResult;
  try {
    result = buildIndex(ROOT, { runs: args.runs, only: args.only });
  } catch (error) {
    console.error(`audit:index: ${(error as Error).message}`);
    return 2;
  }
  for (const warning of result.warnings) console.warn(`  warning  ${warning}`);
  console.log(`audit:index: ${result.cells} current cell(s) of ${result.entries} component(s) and page(s) from ${result.runs.length} run(s); ${result.written} index.md written`);
  if (result.removed.length) console.log(`  removed  ${result.removed.length} index.md of components and pages with no current cell: ${result.removed.join(", ")}`);
  console.log(`  flagged  ${result.flagged} cell(s); not analyzed ${result.unanalyzed}`);
  if (result.states) console.log(`  states   ${result.states} interaction-state cell(s), ${result.notReached} not reached`);
  console.log(`  summary  ${join(CURRENT_DIR, SUMMARY_FILE)}`);
  console.log(`  time     ${((Date.now() - started) / 1000).toFixed(1)} s`);
  return 0;
}

if (import.meta.main) process.exit(main());
