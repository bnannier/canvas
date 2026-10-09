#!/usr/bin/env bun
// `bun run audit:web`: the component audit's web capture (plan 1c). Plans the cells from
// the inventory and the flags, makes the run directory
// `.audit/runs/<stamp>-web-<sha7>/`, runs the Playwright capture
// (playwright.audit.config.ts, e2e/audit/variants.audit.ts), and writes the run's
// manifest.json beside the cells.jsonl the cells append to, then prints a summary.
//
//   bun run audit:web                                every component, all 18 cells per variant
//   bun run audit:web -- --only=button,dialog        two components
//   bun run audit:web -- --only=button --variants=default,primary --looks=dark --surfaces=solid --widths=phone
//   bun run audit:web -- --axe=all | --axe=none | --axe=phone,tablet,desktop   (default: solid at phone,desktop)
//   bun run audit:web -- --base=http://localhost:8081   capture a running server (Metro) instead of docs/dist
//   bun run audit:web -- --workers=4
//   bun run audit:web -- --allow-stale                capture another checkout's source anyway
//
// Only this checkout's source is captured. The capture's global setup
// (e2e/audit/global-setup.ts) opens /testing/diagnostics on the server the cells really hit
// (without --base the configuration reuses a server already on the export port) and tells
// a static export from a live dev server by how the page gets its code. A static export's
// source fingerprint (docs/scripts/build-info.cjs at export time) must equal this
// checkout's `sourceFingerprint()`; a live dev server (Metro) builds from the source on
// disk, so it is recorded as one, and the project root its /status names must be this
// checkout's docs app. A refusal stops the run before its first cell and lands in the
// manifest as `refused`.
//
// The manifest's capture settings (browser, device scale, reduced motion, the fixed clock,
// the launch switches) are read off playwright.audit.config.ts and e2e/support/docs.ts
// FIXED_TIME, the same objects the capture runs with.
//
// Exit status: 0 when every planned cell was captured, 1 when a cell failed or the
// capture stopped early, 2 for a refusal or a usage error.

import { spawn, execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { ROOT } from "../../e2e/support/routes.ts";
import { components } from "./inventory.ts";
import {
  AUDIT_ENV,
  CELLS_FILE,
  MANIFEST_FILE,
  RUNS_DIR,
  SERVED_FILE,
  captureSettings,
  describeAxe,
  describeServed,
  parseRunArgs,
  parseWebFilters,
  planWebCapture,
  readCellRecords,
  runDirName,
  summarizeCells,
  workersFrom,
  type CaptureSettings,
  type CellSummary,
  type ServedRecord,
} from "./web-capture.ts";

const USAGE = `usage: bun run audit:web -- [--only=<slugs>] [--variants=<keys>] [--looks=blush,mint,dark]
                              [--surfaces=solid,glass] [--widths=phone,tablet,desktop]
                              [--axe=none|all|<widths>] [--base=<url>] [--workers=<n>] [--allow-stale]`;

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
  let plan: ReturnType<typeof planWebCapture>;
  let filters: ReturnType<typeof parseWebFilters>;
  let workers: number;
  let capture: CaptureSettings;
  try {
    filters = parseWebFilters(env);
    plan = planWebCapture(components(), filters);
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
  if (!plan.cells) {
    console.error("audit:web: the filters leave no cell to capture");
    return 2;
  }

  const sha = git("rev-parse", "HEAD");
  const dirty = git("status", "--porcelain", "--untracked-files=normal") !== "";
  const packageVersion = (JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as { version: string }).version;
  const started = new Date();
  const id = runDirName(started, "web", sha);
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
    startedAt: started.toISOString(),
    finishedAt: null,
    command: ["bun", "run", "audit:web", "--", ...process.argv.slice(2)].join(" "),
    source: { sha, dirty, packageVersion },
    served: null,
    base: env.E2E_BASE_URL ?? "docs/dist via the suite's export server (playwright.config.ts DOCS_SERVER)",
    allowStale: args.allowStale,
    workers,
    capture,
    filters: {
      only: filters.only,
      variants: filters.variants,
      looks: filters.looks,
      surfaces: filters.surfaces,
      widths: filters.widths,
      axe: describeAxe(filters.axe),
    },
    planned: { components: plan.components, variants: plan.variants, tests: plan.groups.length, cells: plan.cells },
    results: null,
    files: { cells: CELLS_FILE, cell: "web/<slug>/<variant>/<width>.<look>.<surface>/{card.png, probe.json}" },
  };
  writeJson(manifestPath, manifest);

  console.log(`audit:web ${id}`);
  console.log(
    `  planned  ${plan.components} component(s), ${plan.variants} variant(s), ${plan.cells} cells in ${plan.groups.length} test(s); ` +
    `looks ${filters.looks.join(",")}; surfaces ${filters.surfaces.join(",")}; widths ${filters.widths.join(",")}; axe ${describeAxe(filters.axe)}; ${workers} worker(s)`,
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
  const exitCode = await new Promise<number>((resolve) => {
    child.on("exit", (code, signal) => resolve(code ?? (signal ? 130 : 1)));
    child.on("error", (error) => {
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
  const refused = served !== null && !served.fresh && !served.allowStale;
  const complete = !refused && !interrupted && summary.cells === plan.cells;
  const status = refused ? "refused" : interrupted ? "interrupted" : complete ? "complete" : "incomplete";
  const wallMs = finished.getTime() - started.getTime();
  const bytes = diskBytes(runDir);

  Object.assign(manifest, {
    status,
    finishedAt: finished.toISOString(),
    served,
    results: {
      playwrightExitCode: exitCode,
      cells: summary.cells,
      ok: summary.ok,
      failed: summary.failed,
      missing: Math.max(0, plan.cells - summary.cells),
      unreadableLines: unreadable,
      flags: summary.flags,
      msPerCell: summary.ms,
      wallMs,
      bytes,
      failures: summary.failures,
    },
  });
  writeJson(manifestPath, manifest);

  console.log("");
  console.log(`audit:web ${id}: ${status}`);
  if (served) console.log(`  served   ${describeServed(served)}`);
  if (refused) {
    console.error(`  refused  ${served!.reason}`);
    console.log(`  manifest ${relative(ROOT, manifestPath)}`);
    return 2;
  }
  console.log(`  captured ${summary.cells} of ${plan.cells} cells: ${summary.ok} ok, ${summary.failed} failed${summary.cells < plan.cells ? `, ${plan.cells - summary.cells} never reached` : ""}`);
  const flagged = Object.entries(summary.flags).sort((a, b) => b[1] - a[1]);
  console.log(`  flags    ${flagged.length ? flagged.map(([flag, n]) => `${flag} ${n}`).join(", ") : "none"}`);
  console.log(`  time     ${duration(wallMs)} wall; per cell mean ${seconds(summary.ms.mean)}, p50 ${seconds(summary.ms.p50)}, p95 ${seconds(summary.ms.p95)}, max ${seconds(summary.ms.max)} (${workers} worker(s))`);
  console.log(`  disk     ${size(bytes)}${summary.cells ? `, ${size(bytes / summary.cells)} per cell` : ""}`);
  for (const failure of summary.failures.slice(0, 20)) console.log(`  failed   ${failure.id}: ${failure.error.split("\n")[0]}`);
  if (summary.failures.length > 20) console.log(`  failed   ... and ${summary.failures.length - 20} more (manifest.json)`);
  if (unreadable) console.log(`  warning  ${unreadable} unreadable line(s) in ${CELLS_FILE}`);
  console.log(`  output   ${relative(ROOT, runDir)}`);
  return complete && summary.failed === 0 && exitCode === 0 ? 0 : 1;
}

process.exit(await main());
