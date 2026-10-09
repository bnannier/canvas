#!/usr/bin/env bun
// `bun run audit:prune`: delete old capture runs under .audit/runs (plan 1e: a full sweep
// is 20 to 25 GB, kept to two runs). A run goes only when nothing a reviewer needs is in
// it: it is not one of the newest `--keep` runs of its platform (default 2), it has
// finished, and every cell it holds has at least `--keep` newer captures in other runs. So
// the newest `--keep` captures of every cell survive, which is the before and the after a
// fix is judged by, and a full sweep is never deleted while a later partial re-capture
// covers only some of its cells. The current view (.audit/current, index.ts) never loses a
// cell to a prune, and never points at a deleted run: once a run is deleted the view is
// rebuilt from the runs that remain (with the --run names it was built from, those that
// still name a run), since a view built before newer captures arrived can still point at
// a run whose every cell has since been re-captured. Its links are then checked, and a
// broken one fails the command. The contact sheets are images and keep what they showed;
// `bun run audit:sheets` redraws them from the current captures.
//
//   bun run audit:prune                        delete what can go, keeping two captures of every cell
//   bun run audit:prune -- --keep=3            keep three
//   bun run audit:prune -- --dry-run           say what would go and why the rest stays
//   bun run audit:prune -- --only=button       consider only runs that captured nothing but these
//   bun run audit:prune -- --run=<run id>      consider only these runs
//
// A run that has not finished (its manifest says running: in progress, or killed) is never
// deleted; remove one by hand once it is known to be dead. Exit status: 0, 1 when a link
// of the view is broken after the prune, or 2 for a usage error.

import { rmSync } from "node:fs";
import { join, relative } from "node:path";
import { ROOT } from "../../e2e/support/routes.ts";
import { brokenLinks, buildIndex, builtSelection, CURRENT_FILE, type IndexResult } from "./index.ts";
import { capturesById, cellMatches, checkOnly, CURRENT_DIR, listRuns, loadCells, parseToolArgs, pickRuns, readJsonFile, type AuditRun, type CapturedCell } from "./runs.ts";
import { PLATFORMS } from "./inventory.ts";

export const DEFAULT_KEEP = 2;

export interface PruneDecision {
  run: AuditRun;
  remove: boolean;
  reason: string;
}

export interface PruneOptions {
  keep: number;
  /** Only these runs may be removed (the rest are left as they are). */
  candidates: Set<string> | null;
  /** Only runs that captured nothing but these components or pages may be removed. */
  only: string[] | null;
}

/** What to do with every run: remove it, or keep it and why. */
export function planPrune(runs: AuditRun[], cells: CapturedCell[], options: PruneOptions): PruneDecision[] {
  if (options.keep < 1) throw new Error("--keep must be at least 1: the newest capture of every cell is what the index shows");
  const history = capturesById(cells);
  const byRun = new Map<string, CapturedCell[]>();
  for (const cell of cells) {
    const list = byRun.get(cell.run.id);
    if (list) list.push(cell);
    else byRun.set(cell.run.id, [cell]);
  }
  const newest = new Set<string>();
  for (const platform of PLATFORMS) {
    const ofPlatform = runs.filter((run) => run.platform === platform).sort((a, b) => b.startedAt.localeCompare(a.startedAt) || b.id.localeCompare(a.id));
    for (const run of ofPlatform.slice(0, options.keep)) newest.add(run.id);
  }
  return runs.map((run): PruneDecision => {
    const held = byRun.get(run.id) ?? [];
    if (options.candidates && !options.candidates.has(run.id)) return { run, remove: false, reason: "not named by --run" };
    if (options.only && (held.length === 0 || !held.every((cell) => cellMatches(cell, options.only)))) {
      return { run, remove: false, reason: held.length ? "captured components or pages --only does not name" : "holds no cell, and --only names components" };
    }
    if (newest.has(run.id)) return { run, remove: false, reason: `one of the newest ${options.keep} ${run.platform} run(s)` };
    if (!run.finished) return { run, remove: false, reason: `not finished (${run.status}): still running, or killed; delete it by hand once it is known to be dead` };
    // How many newer captures each of its cells has; fewer than `keep` means this run holds one of the newest `keep`.
    const needed = held.filter((cell) => history.get(cell.id)!.indexOf(cell) < options.keep);
    if (needed.length) {
      const current = needed.filter((cell) => history.get(cell.id)![0] === cell).length;
      return { run, remove: false, reason: `holds one of the newest ${options.keep} captures of ${needed.length} cell(s)${current ? ` (the current one of ${current})` : ""}` };
    }
    return { run, remove: true, reason: held.length ? `every one of its ${held.length} cell(s) has ${options.keep} newer capture(s)` : "holds no cell" };
  });
}

/** The --run names of a built view that still name a run once `removed` are gone: null (every run) when none is left. */
export function survivingSelection(names: string[] | null, remaining: AuditRun[]): string[] | null {
  if (!names) return null;
  const kept = names.filter((name) => {
    try {
      pickRuns(remaining, [name]);
      return true;
    } catch {
      return false;
    }
  });
  return kept.length ? kept : null;
}

export interface PruneOutcome {
  decisions: PruneDecision[];
  /** The built view's links into the runs that go: what a prune without the rebuild would leave dangling. */
  pointing: number;
  /** The rebuilt view, when a run went and a view was built; null otherwise. */
  rebuilt: { selection: string[] | null; was: string[] | null; result: IndexResult } | null;
  /** Links in the view after the prune whose target is missing: empty unless something is wrong. */
  broken: string[];
  warnings: string[];
}

/** The built view's cells and runs that point into `runs`. */
function viewLinksInto(root: string, runs: AuditRun[]): number {
  const ids = new Set(runs.map((run) => run.id));
  const built = readJsonFile<{ runs?: { id: string }[]; cells?: { run: string }[] }>(join(root, CURRENT_DIR, CURRENT_FILE));
  return (built?.runs ?? []).filter((run) => ids.has(run.id)).length + (built?.cells ?? []).filter((cell) => ids.has(cell.run)).length;
}

/**
 * Plan the prune of the runs under `root`, and unless `dryRun` delete what can go and, when
 * anything went and a view is built, rebuild the view from what remains and check its links.
 * Throws on a usage error (an unknown --only name or --run).
 */
export function pruneRuns(root: string, options: Omit<PruneOptions, "candidates"> & { runs: string[] | null; dryRun: boolean }): PruneOutcome {
  checkOnly(options.only);
  const listed = listRuns(root);
  const warnings = [...listed.problems];
  const candidates = options.runs ? new Set(pickRuns(listed.runs, options.runs).map((run) => run.id)) : null;
  const loaded = loadCells(listed.runs);
  warnings.push(...loaded.problems);
  const decisions = planPrune(listed.runs, loaded.cells, { keep: options.keep, candidates, only: options.only });
  const going = decisions.filter((decision) => decision.remove).map((decision) => decision.run);
  const pointing = viewLinksInto(root, going);
  const built = builtSelection(root);
  if (options.dryRun || going.length === 0) return { decisions, pointing, rebuilt: null, broken: brokenLinks(root), warnings };
  for (const run of going) rmSync(run.dir, { recursive: true, force: true });
  let rebuilt: PruneOutcome["rebuilt"] = null;
  if (built) {
    const remaining = listed.runs.filter((run) => !going.includes(run));
    const selection = survivingSelection(built.runs, remaining);
    const result = buildIndex(root, { runs: selection, only: null });
    warnings.push(...result.warnings);
    rebuilt = { selection, was: built.runs, result };
  }
  return { decisions, pointing, rebuilt, broken: brokenLinks(root), warnings };
}

const USAGE = "usage: bun run audit:prune -- [--keep=<n>] [--dry-run] [--only=<slugs>] [--run=<run ids>]";

function main(): number {
  const args = parseToolArgs(process.argv.slice(2), ["only", "run", "keep", "dry-run"]);
  if (args.help) {
    console.log(USAGE);
    return 0;
  }
  if (args.errors.length) {
    console.error(`audit:prune: ${args.errors.join("; ")}\n${USAGE}`);
    return 2;
  }
  const keep = args.keep ?? DEFAULT_KEEP;
  let outcome: PruneOutcome;
  try {
    outcome = pruneRuns(ROOT, { keep, only: args.only, runs: args.runs, dryRun: args.dryRun });
  } catch (error) {
    console.error(`audit:prune: ${(error as Error).message}`);
    return 2;
  }
  for (const warning of outcome.warnings) console.warn(`  warning  ${warning}`);
  const removing = outcome.decisions.filter((decision) => decision.remove);
  const verb = args.dryRun ? "would be removed" : "removed";
  console.log(`audit:prune${args.dryRun ? " (dry run)" : ""}: ${removing.length} of ${outcome.decisions.length} run(s) ${verb}, keeping ${keep} capture(s) of every cell`);
  for (const decision of outcome.decisions) {
    console.log(`  ${decision.remove ? (args.dryRun ? "would remove" : "removed") : "kept"}  ${relative(ROOT, decision.run.dir)}: ${decision.reason}`);
  }
  const view = join(CURRENT_DIR, CURRENT_FILE);
  if (args.dryRun) {
    if (outcome.pointing) console.log(`  view     ${outcome.pointing} entr${outcome.pointing === 1 ? "y of" : "ies of"} ${view} point${outcome.pointing === 1 ? "s" : ""} into those runs; a prune rebuilds the view from the runs that remain`);
  } else if (outcome.rebuilt) {
    const { selection, was, result } = outcome.rebuilt;
    const from = selection ? `--run=${selection.join(",")}` : "every remaining run";
    const changed = was && !selection ? ` (it was built from --run=${was.join(",")}, none of which is left)` : "";
    console.log(`  view     rebuilt ${CURRENT_DIR} from ${from}${changed}: ${result.cells} current cell(s), ${result.written} index.md written${result.removed.length ? `, ${result.removed.length} removed` : ""}; ${outcome.pointing} entr${outcome.pointing === 1 ? "y" : "ies"} had pointed into the removed runs`);
    console.log(`  sheets   images, not rebuilt: \`bun run audit:sheets\` redraws them from the current captures`);
  }
  if (outcome.broken.length) {
    console.error(`  broken   ${outcome.broken.length} link(s) in ${CURRENT_DIR} point at nothing:`);
    for (const link of outcome.broken.slice(0, 20)) console.error(`    ${link}`);
    console.error("  `bun run audit:index` rebuilds the view from the runs there are");
    return args.dryRun ? 0 : 1;
  }
  console.log(`  links    every link in ${CURRENT_DIR} resolves`);
  return 0;
}

if (import.meta.main) process.exit(main());
