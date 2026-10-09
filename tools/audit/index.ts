#!/usr/bin/env bun
// `bun run audit:index`: the reviewer's index of the component audit (plan 1e). It builds
// .audit/current/ from the newest capture of every cell across every run under
// .audit/runs (runs.ts selectCurrent), so a partial re-capture (`--only`, `--variants`)
// replaces exactly the cells it took and every other cell stays at the run that took it
// last:
//
//   .audit/current/<slug>/index.md   one component (or pattern or template page): its
//                                    checklist, its contact sheets (sheets.ts), the runs its
//                                    cells come from with their commit and source
//                                    fingerprint, and one row per cell with its flags, the
//                                    axe violations by impact, the smallest painted font,
//                                    the contrast fails, overflow, clipped text, small
//                                    targets, console problems, an interaction state not
//                                    reached, and the cell's run, commit and fingerprint
//   .audit/current/SUMMARY.md        every component ranked by its cells' flags
//   .audit/current/current.json      the same selection, one entry per cell, for tools
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

import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { ROOT } from "../../e2e/support/routes.ts";
import { AXE_IMPACTS, type CellAnalysis } from "./analyze.ts";
import { COMPONENTS_DIR, PAGES_DIR } from "./checklists.ts";
import { LOOKS, SURFACES, WIDTHS, components, pages, NATIVE_CELLS_PER_VARIANT, WEB_CELLS_PER_VARIANT, type Platform } from "./inventory.ts";
import { ANALYSIS_FILE, CURRENT_DIR, checkOnly, currentCells, notReached, parseToolArgs, readJsonFile, STATE_NOT_REACHED, type AuditRun, type CapturedCell } from "./runs.ts";
import { CARD_FILE, PROBE_FILE } from "./web-capture.ts";

export const INDEX_FILE = "index.md";
export const SUMMARY_FILE = "SUMMARY.md";
export const CURRENT_FILE = "current.json";

/** One cell's line in an index. */
export interface CellRow {
  id: string;
  family: CapturedCell["family"];
  platform: Platform;
  variant: string | null;
  state: string | null;
  section: string | null;
  run: string;
  capturedAt: string;
  sha: string | null;
  dirty: boolean | null;
  fingerprint: string | null;
  status: string;
  error: string | null;
  analyzed: boolean;
  flags: string[];
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
  /** The file a reader opens for the cell, relative to the checkout root. */
  file: string | null;
}

/** The flags a cell is filed under: its analysis' where it has one, else what its capture recorded. */
export function cellFlags(cell: Pick<CapturedCell, "status" | "flags">, analysis: CellAnalysis | null): string[] {
  if (analysis) return analysis.flags;
  const flags = [...cell.flags];
  if (cell.status === "failed") flags.unshift("failed");
  if (cell.status === "unstable") flags.push("unstable");
  if (notReached(cell) && !flags.includes(STATE_NOT_REACHED)) flags.push(STATE_NOT_REACHED);
  return [...new Set(flags)];
}

/** One cell as its index row, from its capture and (when it has one for this capture) its analysis. */
export function cellRow(cell: CapturedCell, analysis: CellAnalysis | null, root: string): CellRow {
  const own = analysis && analysis.run === cell.run.id && analysis.id === cell.id ? analysis : null;
  const web = cell.platform === "web";
  const card = join(cell.dir, CARD_FILE);
  const probe = join(cell.dir, PROBE_FILE);
  const file = existsSync(card) ? card : existsSync(probe) ? probe : null;
  // Judged only where there was something to judge targets on: a web cell's rows, an Android cell's dump.
  const reports = own ? Object.values(own.targets) : [];
  const smallTargets = reports.length ? reports.reduce((n, report) => n + (report?.small.length ?? 0), 0) : null;
  return {
    id: cell.id,
    family: cell.family,
    platform: cell.platform,
    variant: cell.variant,
    state: cell.state,
    section: cell.section,
    run: cell.run.id,
    capturedAt: cell.capturedAt,
    sha: cell.run.sha,
    dirty: cell.run.dirty,
    fingerprint: cell.run.fingerprint,
    status: cell.status,
    error: cell.error,
    analyzed: own !== null,
    flags: cellFlags(cell, own),
    axe: own && web && own.axe.scanned ? own.axe.byImpact : null,
    minFont: own?.fonts.min ?? null,
    contrast: own && web ? { dom: own.contrast.dom.fails, likely: own.contrast.pixels.failLikely, review: own.contrast.pixels.review } : null,
    overflow: own?.overflow ?? [],
    clipped: own && web ? own.clippedText : null,
    smallTargets,
    problems: own ? own.problems : null,
    notReached: notReached(cell),
    file: file ? relative(root, file) : null,
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

/** A link from `from` (a directory, relative to the checkout) to `to` (relative to the checkout). */
const link = (from: string, to: string) => relative(from, to).split("\\").join("/");

export interface SheetLinks {
  /** Sheet file names per variant, as written under sheets/<variant>/. */
  variants: Map<string, string[]>;
  /** The component's own sheets (states.jpg and the like) under sheets/. */
  component: string[];
}

export interface ComponentIndex {
  slug: string;
  name: string;
  kind: "component" | "page";
  /** The checklist, relative to the checkout root. */
  checklist: string;
  checklistExists: boolean;
  /** Variant keys and their labels, in docs order (a page's sections). */
  variants: { key: string; label: string }[];
  /** Cells the inventory expects per platform. */
  expected: Record<Platform, number>;
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

/** Rows in reading order: platform, then width, then look and surface. */
export function sortRows(rows: CellRow[]): CellRow[] {
  const leaf = (row: CellRow) => row.id.split("/").pop()!;
  const rank = (row: CellRow) => {
    const parts = leaf(row).split(".");
    const width = row.platform === "web" ? WIDTH_ORDER.indexOf(parts[0]!) : 0;
    const ls = LOOK_SURFACE.indexOf(parts.slice(row.platform === "web" ? 1 : 0).join("."));
    return [PLATFORM_ORDER.indexOf(row.platform), width, ls];
  };
  return [...rows].sort((a, b) => {
    const ra = rank(a);
    const rb = rank(b);
    for (let i = 0; i < ra.length; i++) if (ra[i] !== rb[i]) return ra[i]! - rb[i]!;
    return a.id.localeCompare(b.id);
  });
}

const CELL_HEADER = [
  "| Cell | Status | Flags | Axe crit/ser/mod/min | Min font px | Contrast dom/likely/review | Overflow | Clipped | Small targets | Problems | State | Run | Commit | Fingerprint |",
  "|---|---|---|---|---|---|---|---|---|---|---|---|---|---|",
];

function cellLine(row: CellRow, dir: string): string {
  const name = row.file ? `[${mdCell(row.id)}](${link(dir, row.file)})` : mdCell(row.id);
  const status = row.status === "failed" && row.error ? `failed: ${row.error.split("\n")[0]!.slice(0, 120)}` : row.status;
  const axe = row.axe ? AXE_IMPACTS.map((impact) => row.axe![impact] ?? 0).join("/") : dash;
  const contrast = row.contrast ? `${row.contrast.dom}/${row.contrast.likely}/${row.contrast.review}` : dash;
  const flags = row.flags.length ? row.flags.join(", ") : row.analyzed ? "none" : "none (not analyzed)";
  const state = row.notReached ? "not reached" : row.state ?? dash;
  return `| ${name} | ${mdCell(status)} | ${mdCell(flags)} | ${axe} | ${num(row.minFont)} | ${contrast} | ${row.overflow.length ? mdCell(row.overflow.join(", ")) : dash} | ${num(row.clipped)} | ${num(row.smallTargets)} | ${num(row.problems)} | ${state} | ${row.run} | ${short(row.sha, row.dirty)} | ${print12(row.fingerprint)} |`;
}

const SHEET_ORDER = ["card-solid", "card-glass", "native", "compare", "compare-glass"];

function sheetLine(variant: string, files: string[], dir: string): string {
  const href = (file: string) => link(dir, join(dir, "sheets", variant, file));
  const named = (stem: string, text: string) => (files.includes(`${stem}.jpg`) ? `[${text}](${href(`${stem}.jpg`)})` : null);
  const cards = [named("card-solid", "solid"), named("card-glass", "glass")].filter(Boolean).join(", ") || dash;
  const rows = (["ios", "android", "web"] as const)
    .map((platform) => {
      const widths = WIDTH_ORDER.map((width) => named(`row-${platform}-${width}`, width)).filter(Boolean);
      return widths.length ? `${platform} ${widths.join(" ")}` : null;
    })
    .filter(Boolean)
    .join("; ") || dash;
  const compare = [named("compare", "solid"), named("compare-glass", "glass")].filter(Boolean).join(", ") || dash;
  const others = files.filter((file) => !SHEET_ORDER.includes(file.replace(/\.jpg$/, "")) && !file.startsWith("row-"));
  return `| \`${variant}\` | ${cards} | ${rows} | ${named("native", "native") ?? dash} | ${compare}${others.length ? `; ${others.map((file) => `[${file}](${href(file)})`).join(", ")}` : ""} |`;
}

/** One component's index.md, from its model; `dir` is the index's directory relative to the checkout. */
export function renderComponentIndex(model: ComponentIndex, dir: string): string {
  const out: string[] = [];
  const captured = (platform: Platform) => model.rows.filter((row) => row.platform === platform && row.family !== "state").length;
  const flagged = model.rows.filter((row) => row.flags.length > 0).length;
  const unanalyzed = model.rows.filter((row) => !row.analyzed).length;
  out.push(`# ${model.name}`, "");
  out.push(`\`${model.slug}\`: the audit index of the newest capture of each of its cells across every run, built ${model.builtAt} by \`bun run audit:index\`. Generated; do not edit.`, "");
  out.push(`- Checklist: ${model.checklistExists ? `[${model.checklist}](${link(dir, model.checklist)})` : `${model.checklist} (missing)`}`);
  out.push(`- Captured: ${PLATFORM_ORDER.map((platform) => `${platform} ${captured(platform)} of ${model.expected[platform]}`).join(", ")}${model.rows.some((row) => row.family === "state") ? `; ${model.rows.filter((row) => row.family === "state").length} interaction-state cell(s)` : ""}`);
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
  const sheetVariants = model.variants.filter((variant) => model.sheets.variants.has(variant.key));
  if (sheetVariants.length || model.sheets.component.length) {
    out.push("## Sheets", "", "Contact sheets (`bun run audit:sheets`), every tile labelled with its cell id.", "");
    if (sheetVariants.length) {
      out.push("| Variant | Card (widths x looks) | Rows (looks x surfaces) | Devices | Browser beside device |", "|---|---|---|---|---|");
      for (const variant of sheetVariants) out.push(sheetLine(variant.key, model.sheets.variants.get(variant.key)!, dir));
      out.push("");
    }
    if (model.sheets.component.length) {
      out.push(`Interaction states: ${model.sheets.component.map((file) => `[${file}](${link(dir, join(dir, "sheets", file))})`).join(", ")}`, "");
    }
  }
  out.push("## Cells", "");
  out.push("Contrast counts DOM fails, then the photograph-sampled texts that are likely to fail and the ones to review (analyze.ts). Small targets counts the interactive boxes under their platform's floor (web 24 px, iOS 44 pt, Android 48 dp; the iOS and Android rows of the browser card and the Android device show the visible box, a hitSlop is not observable).", "");
  const groups: { title: string; rows: CellRow[] }[] = [];
  for (const variant of model.variants) {
    const rows = model.rows.filter((row) => row.family !== "state" && (row.variant ?? row.section ?? "page") === variant.key);
    if (rows.length) groups.push({ title: `\`${variant.key}\`: ${variant.label}`, rows });
  }
  const known = new Set(model.variants.map((variant) => variant.key));
  const strays = model.rows.filter((row) => row.family !== "state" && !known.has(row.variant ?? row.section ?? "page"));
  if (strays.length) groups.push({ title: "Cells of variants the inventory no longer has", rows: strays });
  const states = model.rows.filter((row) => row.family === "state");
  if (states.length) groups.push({ title: "Interaction states", rows: states });
  for (const group of groups) {
    out.push(`### ${group.title}`, "", ...CELL_HEADER, ...sortRows(group.rows).map((row) => cellLine(row, dir)), "");
  }
  return `${out.join("\n").trimEnd()}\n`;
}

export interface SummaryEntry {
  slug: string;
  name: string;
  kind: "component" | "page";
  rows: Pick<CellRow, "flags" | "platform" | "family">[];
  expected: Record<Platform, number>;
  /** The index, relative to the checkout root, or null when it was not written. */
  index: string | null;
}

/** Entries ranked by the flags their cells carry, then by flagged cells, then by slug. */
export function rankEntries<T extends Pick<SummaryEntry, "slug" | "rows">>(entries: T[]): T[] {
  const total = (entry: T) => entry.rows.reduce((n, row) => n + row.flags.length, 0);
  const flagged = (entry: T) => entry.rows.filter((row) => row.flags.length > 0).length;
  return [...entries].sort((a, b) => total(b) - total(a) || flagged(b) - flagged(a) || a.slug.localeCompare(b.slug));
}

/** SUMMARY.md: every captured component ranked by its flags, and the ones not captured at all. */
export function renderSummary(entries: SummaryEntry[], uncaptured: string[], runs: AuditRun[], builtAt: string, dir: string): string {
  const out: string[] = [];
  const all = entries.flatMap((entry) => entry.rows);
  out.push("# Component audit: current captures", "");
  out.push(`The newest capture of every cell across ${runs.length} run(s), built ${builtAt} by \`bun run audit:index\`. Generated; do not edit. Ranked by the flags their cells carry.`, "");
  out.push(`- Cells: ${all.length}, ${all.filter((row) => row.flags.length > 0).length} flagged; ${PLATFORM_ORDER.map((platform) => `${platform} ${all.filter((row) => row.platform === platform).length}`).join(", ")}`);
  out.push(`- Runs: ${runs.map((run) => run.id).join(", ") || "none"}`);
  out.push("");
  out.push("| Rank | Component | Flags | Flagged cells | Captured web/ios/android | Top flags |", "|---|---|---|---|---|---|");
  rankEntries(entries).forEach((entry, i) => {
    const total = entry.rows.reduce((n, row) => n + row.flags.length, 0);
    const flagged = entry.rows.filter((row) => row.flags.length > 0).length;
    const captured = PLATFORM_ORDER.map((platform) => `${entry.rows.filter((row) => row.platform === platform && row.family !== "state").length}/${entry.expected[platform]}`).join(" ");
    const top = flagCounts(entry.rows).slice(0, 4).map(([flag, n]) => `${flag} ${n}`).join(", ") || "none";
    const name = entry.index ? `[${mdCell(entry.name)}](${link(dir, entry.index)})` : mdCell(entry.name);
    out.push(`| ${i + 1} | ${name} | ${total} | ${flagged} of ${entry.rows.length} | ${captured} | ${mdCell(top)} |`);
  });
  out.push("");
  const flags = flagCounts(all);
  out.push("## Flags", "");
  if (flags.length) out.push("| Flag | Cells |", "|---|---|", ...flags.map(([flag, n]) => `| ${flag} | ${n} |`));
  else out.push("No cell is flagged.");
  out.push("");
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
  expected: Record<Platform, number>;
}

/** Every component and page the inventory has, as an index target. */
export function targets(): Target[] {
  const list: Target[] = components().map((component) => ({
    slug: component.slug,
    name: component.name,
    kind: "component" as const,
    checklist: `audit/${COMPONENTS_DIR}/${component.slug}.md`,
    variants: component.variants.map((variant) => ({ key: variant.variant, label: variant.label })),
    expected: { web: component.variants.length * WEB_CELLS_PER_VARIANT, ios: component.variants.length * NATIVE_CELLS_PER_VARIANT, android: component.variants.length * NATIVE_CELLS_PER_VARIANT },
  }));
  for (const page of pages()) {
    list.push({
      slug: page.id,
      name: page.id,
      kind: "page",
      checklist: `audit/${PAGES_DIR}/${page.id}.md`,
      variants: [{ key: "page", label: "the whole page" }],
      expected: { web: WEB_CELLS_PER_VARIANT, ios: NATIVE_CELLS_PER_VARIANT, android: NATIVE_CELLS_PER_VARIANT },
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

const USAGE = "usage: bun run audit:index -- [--only=<slugs>] [--run=<run ids>]";

async function main(): Promise<number> {
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
  let selection: ReturnType<typeof currentCells>;
  try {
    checkOnly(args.only);
    // SUMMARY.md and current.json always cover every cell; --only narrows the index.md files written.
    selection = currentCells(ROOT, { runs: args.runs, only: null });
  } catch (error) {
    console.error(`audit:index: ${(error as Error).message}`);
    return 2;
  }
  for (const problem of selection.problems) console.warn(`  warning  ${problem}`);
  const builtAt = new Date().toISOString();
  const current = join(ROOT, CURRENT_DIR);
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
  for (const target of targets()) {
    const cells = bySlug.get(target.slug);
    if (!cells) {
      uncaptured.push(target.slug);
      continue;
    }
    const rows = cells.map((cell) => cellRow(cell, readJsonFile<CellAnalysis>(join(cell.dir, ANALYSIS_FILE)), ROOT));
    all.push(...rows);
    for (const row of rows) records.push({ id: row.id, run: row.run, capturedAt: row.capturedAt, status: row.status, analyzed: row.analyzed, flags: row.flags, sha: row.sha, fingerprint: row.fingerprint, file: row.file });
    const dir = join(CURRENT_DIR, target.slug);
    const indexPath = join(dir, INDEX_FILE);
    const wanted = !args.only || args.only.includes(target.slug) || args.only.some((name) => target.kind === "page" && target.slug.endsWith(`-${name}`));
    if (wanted) {
      mkdirSync(join(ROOT, dir), { recursive: true });
      const runIds = new Set(rows.map((row) => row.run));
      // A page's sections are known from its captures; the whole page comes first.
      const sections = target.kind === "page" ? [...new Set(rows.map((row) => row.section).filter((section): section is string => section !== null))].sort() : [];
      const model: ComponentIndex = {
        ...target,
        variants: [...target.variants, ...sections.map((key) => ({ key, label: `section ${key}` }))],
        root: ROOT,
        checklistExists: existsSync(join(ROOT, target.checklist)),
        rows,
        runs: selection.runs.filter((run) => runIds.has(run.id)),
        sheets: sheetFiles(join(ROOT, dir)),
        builtAt,
      };
      writeFileSync(join(ROOT, indexPath), renderComponentIndex(model, dir));
      written += 1;
    }
    entries.push({ slug: target.slug, name: target.name, kind: target.kind, rows, expected: target.expected, index: existsSync(join(ROOT, indexPath)) ? indexPath : null });
  }
  const strays = [...bySlug.keys()].filter((slug) => !targets().some((target) => target.slug === slug));
  for (const slug of strays) console.warn(`  warning  ${bySlug.get(slug)!.length} current cell(s) of "${slug}", which the inventory no longer has, are left out`);
  writeFileSync(join(current, SUMMARY_FILE), renderSummary(entries, uncaptured, selection.runs, builtAt, CURRENT_DIR));
  writeFileSync(join(current, CURRENT_FILE), `${JSON.stringify({ schema: 1, builtAt, runs: selection.runs.map((run) => ({ id: run.id, platform: run.platform, startedAt: run.startedAt, status: run.status, sha: run.sha, dirty: run.dirty, fingerprint: run.fingerprint, fresh: run.fresh })), cells: records }, null, 2)}\n`);
  console.log(`audit:index: ${all.length} current cell(s) of ${entries.length} component(s) and page(s) from ${selection.runs.length} run(s); ${written} index.md written`);
  console.log(`  flagged  ${all.filter((row) => row.flags.length).length} cell(s); not analyzed ${all.filter((row) => !row.analyzed).length}`);
  console.log(`  summary  ${relative(ROOT, join(current, SUMMARY_FILE))}`);
  console.log(`  time     ${((Date.now() - started) / 1000).toFixed(1)} s`);
  return 0;
}

if (import.meta.main) process.exit(await main());
