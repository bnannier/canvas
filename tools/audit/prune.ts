#!/usr/bin/env bun
// `bun run audit:prune`: delete old capture runs under .audit/runs (plan 1e: a full sweep
// is 20 to 25 GB, kept to two runs). A run goes only when nothing a reviewer needs is in
// it: it is not one of the newest `--keep` runs of its platform (default 2), it has
// finished, and every cell it holds has at least `--keep` newer captures in other runs. So
// the newest `--keep` captures of every cell survive, which is the before and the after a
// fix is judged by, and a full sweep is never deleted while a later partial re-capture
// covers only some of its cells. The current view (.audit/current, index.ts) never loses a
// cell to a prune.
//
//   bun run audit:prune                        delete what can go, keeping two captures of every cell
//   bun run audit:prune -- --keep=3            keep three
//   bun run audit:prune -- --dry-run           say what would go and why the rest stays
//   bun run audit:prune -- --only=button       consider only runs that captured nothing but these
//   bun run audit:prune -- --run=<run id>      consider only these runs
//
// A run that has not finished (its manifest says running: in progress, or killed) is never
// deleted; remove one by hand once it is known to be dead. Exit status: 0, or 2 for a
// usage error.

import { rmSync } from "node:fs";
import { relative } from "node:path";
import { ROOT } from "../../e2e/support/routes.ts";
import { capturesById, cellMatches, checkOnly, listRuns, loadCells, parseToolArgs, pickRuns, type AuditRun, type CapturedCell } from "./runs.ts";
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
  const listed = listRuns(ROOT);
  for (const problem of listed.problems) console.warn(`  warning  ${problem}`);
  let decisions: PruneDecision[];
  try {
    checkOnly(args.only);
    const candidates = args.runs ? new Set(pickRuns(listed.runs, args.runs).map((run) => run.id)) : null;
    const loaded = loadCells(listed.runs);
    for (const problem of loaded.problems) console.warn(`  warning  ${problem}`);
    decisions = planPrune(listed.runs, loaded.cells, { keep: args.keep ?? DEFAULT_KEEP, candidates, only: args.only });
  } catch (error) {
    console.error(`audit:prune: ${(error as Error).message}`);
    return 2;
  }
  const removing = decisions.filter((decision) => decision.remove);
  const verb = args.dryRun ? "would be removed" : "removed";
  console.log(`audit:prune${args.dryRun ? " (dry run)" : ""}: ${removing.length} of ${decisions.length} run(s) ${verb}, keeping ${args.keep ?? DEFAULT_KEEP} capture(s) of every cell`);
  for (const decision of decisions) {
    console.log(`  ${decision.remove ? (args.dryRun ? "would remove" : "removed") : "kept"}  ${relative(ROOT, decision.run.dir)}: ${decision.reason}`);
    if (decision.remove && !args.dryRun) rmSync(decision.run.dir, { recursive: true, force: true });
  }
  return 0;
}

if (import.meta.main) process.exit(main());
