#!/usr/bin/env bun
// `bun run audit:web`: the component audit's web capture (plans 1c and 1d). Plans the
// cells from the inventory, the state recipes and the flags, makes the run directory
// `.audit/runs/<stamp>-web-<sha7>/`, runs the Playwright capture
// (playwright.audit.config.ts, e2e/audit/{variants,states,pages}.audit.ts), and writes the
// run's manifest.json beside the cells.jsonl the cells append to, then prints a summary.
//
//   bun run audit:web                                every component, all 18 cells per variant
//   bun run audit:web -- --only=button,dialog        two components
//   bun run audit:web -- --only=button --variants=default,primary --looks=dark --surfaces=solid --widths=phone
//   bun run audit:web -- --states                    every interaction state instead of the variants
//   bun run audit:web -- --states=hover,open --only=button,dialog
//   bun run audit:web -- --pages                     every pattern and template page instead
//   bun run audit:web -- --pages --only=template-signin,pattern-glass
//   bun run audit:web -- --states --pages            both (the variants are captured only when neither is asked for)
//   bun run audit:web -- --axe=all | --axe=none | --axe=phone,tablet,desktop   (default: solid at phone,desktop)
//   bun run audit:web -- --base=http://localhost:8081   capture a running server (Metro) instead of docs/dist
//   bun run audit:web -- --workers=4
//   bun run audit:web -- --allow-stale                capture another checkout's source anyway
//
// `--only` names components for the variants and the states and pages for the pages (by id,
// `template-signin`, or by a slug no component has, `signin`: inventory.ts `resolveNames`,
// so `calendar` is the component and `template-calendar` its page); `--variants` narrows the
// variants only.
//
// Only this checkout's source is captured. The capture's global setup
// (e2e/audit/global-setup.ts) opens /testing/diagnostics on the server the cells really hit
// (without --base the configuration reuses a server already on the export port) and tells
// a static export from a live dev server by how the page gets its code. A static export's
// source fingerprint (docs/scripts/build-info.cjs at export time) must equal this
// checkout's `sourceFingerprint()`; a live dev server (Metro) builds from the source on
// disk, so it is recorded as one, and the project root its /status names must be this
// checkout's docs app. A refusal stops the run before its first cell and lands in the
// manifest as `refused`, with its reason under `refusal`; so does a global setup that
// stopped before it recorded the server at all (the server down, its diagnostics page not
// loading), since whose source that server shows is unknown (web-capture.ts `webRunOutcome`).
//
// The manifest's capture settings (browser, device scale, reduced motion, the fixed clock,
// the launch switches) are read off playwright.audit.config.ts and e2e/support/docs.ts
// FIXED_TIME, the same objects the capture runs with.
//
// Exit status: 0 when every planned cell was captured (a state not reached is captured:
// its reason is the record), 1 when a cell failed or the capture stopped early, 2 for a
// refusal or a usage error.

import { spawn, execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { ROOT } from "../../e2e/support/routes.ts";
import { stateSpecsOf } from "../../e2e/support/state-recipes.ts";
import { components, pages } from "./inventory.ts";
import {
  AUDIT_ENV,
  CELLS_FILE,
  MANIFEST_FILE,
  PAGES_DIR,
  RUNS_DIR,
  SERVED_FILE,
  STATES_DIR,
  captureSettings,
  describeAxe,
  describeKinds,
  describeServed,
  parseKinds,
  parseRunArgs,
  parseWebFilters,
  planPageCapture,
  planStateCapture,
  planWebCapture,
  readCellRecords,
  runDirName,
  splitOnly,
  summarizeCells,
  webRunOutcome,
  workersFrom,
  type CaptureKinds,
  type CaptureSettings,
  type CellSummary,
  type PagePlan,
  type ServedRecord,
  type StatePlan,
  type WebPlan,
} from "./web-capture.ts";

const USAGE = `usage: bun run audit:web -- [--states[=<states>]] [--pages] [--only=<slugs or page ids>] [--variants=<keys>]
                              [--looks=blush,mint,dark] [--surfaces=solid,glass] [--widths=phone,tablet,desktop]
                              [--axe=none|all|<widths>] [--base=<url>] [--workers=<n>] [--allow-stale]
  states: hover, focus, pressed, open, invalid, disabled`;

function git(...args: string[]): string {
  // Local inspection only, as build-info.cjs does it: no hook may point it elsewhere.
  const env = Object.fromEntries(Object.entries(process.env).filter(([name]) => !name.startsWith("GIT_")));
  return execFileSync("git", args, { cwd: ROOT, encoding: "utf8", env, stdio: ["ignore", "pipe", "pipe"] }).trim();
}

function diskBytes(dir: string): number {
  let total = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) total += diskBytes(path);
    else if (entry.isFile()) total += statSync(path).size;
  }
  return total;
}

function size(bytes: number): string {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}
const seconds = (ms: number) => `${(ms / 1000).toFixed(1)} s`;
function duration(ms: number): string {
  const total = Math.round(ms / 1000);
  return total >= 60 ? `${Math.floor(total / 60)}m ${String(total % 60).padStart(2, "0")}s` : `${total}s`;
}

function writeJson(path: string, value: unknown): void {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function readJson<T>(path: string): T | null {
  try {
    return JSON.parse(readFileSync(path, "utf8")) as T;
  } catch {
    return null;
  }
}

async function main(): Promise<number> {
  const args = parseRunArgs(process.argv.slice(2));
  if (args.help) {
    console.log(USAGE);
    return 0;
  }
  if (args.errors.length) {
    console.error(`audit:web: ${args.errors.join("; ")}\n${USAGE}`);
    return 2;
  }
  // The flags win over anything already in the environment. They go into this process's
  // own environment, so the configuration read below for the manifest resolves exactly as
  // it does in the Playwright process that inherits it.
  Object.assign(process.env, args.env);
  const env: Record<string, string | undefined> = process.env;
  let kinds: CaptureKinds;
  let variantPlan: WebPlan | null = null;
  let statePlan: StatePlan | null = null;
  let pagePlan: PagePlan | null = null;
  let filters: ReturnType<typeof parseWebFilters>;
  let workers: number;
  let capture: CaptureSettings;
  try {
    filters = parseWebFilters(env);
    kinds = parseKinds(env);
    if (filters.variants && !kinds.variants) throw new Error("--variants narrows the variant capture, which a run with --states or --pages does not take");
    const inventory = components();
    const pageList = pages();
    const only = splitOnly(filters.only, kinds, inventory, pageList);
    if (kinds.variants) variantPlan = planWebCapture(inventory, { ...filters, only: only.components });
    if (kinds.states) statePlan = planStateCapture(inventory, stateSpecsOf, { ...filters, only: only.components }, kinds.states);
    if (kinds.pages) pagePlan = planPageCapture(pageList, { ...filters, only: only.pages });
    workers = workersFrom(env);
    const [{ default: auditConfig }, { FIXED_TIME }] = await Promise.all([
      import("../../playwright.audit.config.ts"),
      import("../../e2e/support/docs.ts"),
    ]);
    capture = captureSettings(auditConfig, FIXED_TIME);
  } catch (error) {
    console.error(`audit:web: ${(error as Error).message}`);
    return 2;
  }
  const planned = {
    cells: (variantPlan?.cells ?? 0) + (statePlan?.cells ?? 0) + (pagePlan?.cells ?? 0),
    tests: (variantPlan?.groups.length ?? 0) + (statePlan?.groups.length ?? 0) + (pagePlan?.groups.length ?? 0),
  };
  if (!planned.cells) {
    console.error("audit:web: the filters leave no cell to capture");
    return 2;
  }

  const sha = git("rev-parse", "HEAD");
  const dirty = git("status", "--porcelain", "--untracked-files=normal") !== "";
  const packageVersion = (JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as { version: string }).version;
  const startedAt = new Date();
  const id = runDirName(startedAt, "web", sha);
  const runDir = join(ROOT, RUNS_DIR, id);
  if (existsSync(runDir)) {
    console.error(`audit:web: ${relative(ROOT, runDir)} already exists`);
    return 2;
  }
  mkdirSync(runDir, { recursive: true });

  const manifestPath = join(runDir, MANIFEST_FILE);
  const manifest: Record<string, unknown> = {
    schema: 1,
    id,
    platform: "web",
    status: "running",
    startedAt: startedAt.toISOString(),
    finishedAt: null,
    command: ["bun", "run", "audit:web", "--", ...process.argv.slice(2)].join(" "),
    source: { sha, dirty, packageVersion },
    served: null,
    base: env.E2E_BASE_URL ?? "docs/dist via the suite's export server (playwright.config.ts DOCS_SERVER)",
    allowStale: args.allowStale,
    workers,
    capture,
    filters: {
      kinds: describeKinds(kinds),
      only: filters.only,
      variants: filters.variants,
      states: kinds.states,
      looks: filters.looks,
      surfaces: filters.surfaces,
      widths: filters.widths,
      axe: describeAxe(filters.axe),
    },
    planned: {
      ...planned,
      variants: variantPlan && { components: variantPlan.components, variants: variantPlan.variants, tests: variantPlan.groups.length, cells: variantPlan.cells },
      states: statePlan && { components: statePlan.components, recipes: statePlan.recipes, tests: statePlan.groups.length, cells: statePlan.cells, byState: statePlan.byState },
      pages: pagePlan && { pages: pagePlan.pages, sections: pagePlan.sections, tests: pagePlan.groups.length, cells: pagePlan.cells },
    },
    results: null,
    files: {
      cells: CELLS_FILE,
      ...(variantPlan ? { cell: "web/<slug>/<variant>/<width>.<look>.<surface>/{card.png, probe.json}" } : {}),
      ...(statePlan ? { state: `${STATES_DIR}/<slug>/<name>.<row>/<width>.<look>.<surface>/{state.png, probe.json} (the name: the state, or <state>-<variant> for a state with several recipes, <state>-<variant>-inside for one inside its example's overlay; probe.json alone for a state not reached)` } : {}),
      ...(pagePlan ? { page: `${PAGES_DIR}/<kind>-<slug>/<width>.<look>.<surface>/{viewport.png, section.<key>.png, probe.json}` } : {}),
    },
  };
  writeJson(manifestPath, manifest);

  console.log(`audit:web ${id}`);
  if (variantPlan) console.log(`  planned  variants: ${variantPlan.components} component(s), ${variantPlan.variants} variant(s), ${variantPlan.cells} cells in ${variantPlan.groups.length} test(s)`);
  if (statePlan) {
    const byState = Object.entries(statePlan.byState).map(([state, n]) => `${state} ${n}`).join(", ");
    console.log(`  planned  states: ${statePlan.components} component(s), ${statePlan.recipes} recipe(s), ${statePlan.cells} cells in ${statePlan.groups.length} test(s) (${byState})`);
  }
  if (pagePlan) console.log(`  planned  pages: ${pagePlan.pages} page(s) of ${pagePlan.sections} section(s), ${pagePlan.cells} cells in ${pagePlan.groups.length} test(s)`);
  console.log(
    `  axes     looks ${filters.looks.join(",")}; surfaces ${filters.surfaces.join(",")}; widths ${filters.widths.join(",")}; axe ${describeAxe(filters.axe)}; ${workers} worker(s)`,
  );

  const childEnv: Record<string, string> = Object.fromEntries(Object.entries(env).filter((entry): entry is [string, string] => entry[1] !== undefined));
  childEnv[AUDIT_ENV.runDir] = runDir;
  const playwright = join(ROOT, "node_modules", ".bin", "playwright");
  const child = spawn(playwright, ["test", "--config", join(ROOT, "playwright.audit.config.ts")], { cwd: ROOT, env: childEnv, stdio: "inherit" });
  // A Ctrl-C reaches Playwright from the terminal as well (one process group), and a second
  // SIGINT makes it abandon its teardown, so SIGINT is only noted; SIGTERM is ours alone and
  // is passed on. Either way the manifest is still written, as `interrupted`.
  let interrupted = false;
  const onInterrupt = () => {
    interrupted = true;
  };
  const onTerminate = () => {
    interrupted = true;
    child.kill("SIGTERM");
  };
  process.on("SIGINT", onInterrupt);
  process.on("SIGTERM", onTerminate);
  let started = true;
  const exitCode = await new Promise<number>((resolve) => {
    child.on("exit", (code, signal) => resolve(code ?? (signal ? 130 : 1)));
    child.on("error", (error) => {
      started = false;
      console.error(`audit:web: could not start Playwright: ${error.message}`);
      resolve(1);
    });
  });
  process.off("SIGINT", onInterrupt);
  process.off("SIGTERM", onTerminate);
  const finished = new Date();

  const servedPath = join(runDir, SERVED_FILE);
  const served = readJson<ServedRecord>(servedPath);
  if (served) rmSync(servedPath);
  const cellsPath = join(runDir, CELLS_FILE);
  const { records, unreadable } = existsSync(cellsPath) ? readCellRecords(readFileSync(cellsPath, "utf8")) : { records: [], unreadable: 0 };
  const summary: CellSummary = summarizeCells(records);
  const outcome = webRunOutcome({ served, started, interrupted, cells: summary.cells, planned: planned.cells, failed: summary.failed, exitCode });
  const { status } = outcome;
  const wallMs = finished.getTime() - startedAt.getTime();
  const bytes = diskBytes(runDir);

  Object.assign(manifest, {
    status,
    finishedAt: finished.toISOString(),
    served,
    refusal: outcome.refusal,
    results: {
      playwrightExitCode: exitCode,
      cells: summary.cells,
      kinds: summary.kinds,
      ok: summary.ok,
      failed: summary.failed,
      notReached: summary.notReached,
      missing: Math.max(0, planned.cells - summary.cells),
      unreadableLines: unreadable,
      flags: summary.flags,
      msPerCell: summary.ms,
      wallMs,
      bytes,
      failures: summary.failures,
      unreached: summary.unreached,
    },
  });
  writeJson(manifestPath, manifest);

  console.log("");
  console.log(`audit:web ${id}: ${status}`);
  if (served) console.log(`  served   ${describeServed(served)}`);
  if (outcome.refusal !== null) {
    console.error(`  refused  ${outcome.refusal}`);
    console.log(`  manifest ${relative(ROOT, manifestPath)}`);
    return outcome.exit;
  }
  console.log(
    `  captured ${summary.cells} of ${planned.cells} cells: ${summary.ok} ok, ${summary.failed} failed` +
      (kinds.states ? `, ${summary.notReached} state(s) not reached` : "") +
      (summary.cells < planned.cells ? `, ${planned.cells - summary.cells} never captured` : ""),
  );
  const flagged = Object.entries(summary.flags).sort((a, b) => b[1] - a[1]);
  console.log(`  flags    ${flagged.length ? flagged.map(([flag, n]) => `${flag} ${n}`).join(", ") : "none"}`);
  console.log(`  time     ${duration(wallMs)} wall; per cell mean ${seconds(summary.ms.mean)}, p50 ${seconds(summary.ms.p50)}, p95 ${seconds(summary.ms.p95)}, max ${seconds(summary.ms.max)} (${workers} worker(s))`);
  console.log(`  disk     ${size(bytes)}${summary.cells ? `, ${size(bytes / summary.cells)} per cell` : ""}`);
  for (const failure of summary.failures.slice(0, 20)) console.log(`  failed   ${failure.id}: ${failure.error.split("\n")[0]}`);
  if (summary.failures.length > 20) console.log(`  failed   ... and ${summary.failures.length - 20} more (manifest.json)`);
  for (const miss of summary.unreached.slice(0, 20)) console.log(`  unreached ${miss.id}: ${miss.reason.split("\n")[0]}`);
  if (summary.unreached.length > 20) console.log(`  unreached ... and ${summary.unreached.length - 20} more (manifest.json)`);
  if (unreadable) console.log(`  warning  ${unreadable} unreadable line(s) in ${CELLS_FILE}`);
  console.log(`  output   ${relative(ROOT, runDir)}`);
  return outcome.exit;
}

process.exit(await main());
