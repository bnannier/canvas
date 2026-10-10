#!/usr/bin/env bun
// `bun run audit:turn -- --slug=<slug> --phase=before|after`: one component's turn capture
// (the plan's "per-component turn", steps 1 and 5), every capture of one slug in order,
// with the run ids recorded under the phase in the slug's turn record:
//
//   1. the web export: docs/dist is reused when the source fingerprint it embeds is this
//      checkout's, built (`cd docs && bun run build:web`) when it is missing or stale, and
//      refused when it is still not this checkout's after the build (or with --no-build);
//   2. the turn serves that export itself, over HTTPS on a free loopback port, for its own
//      captures only (never the suite's 4173, which another checkout may be serving);
//   3. `audit:web` for the slug's example variants, then its interaction states (the
//      components the state table gives recipes), then the pages among the slugs, each
//      against the turn's server (`--base`); audit:web refuses a stale export again itself;
//   4. on iOS and Android, the installed Canvas Audit build is read off each device
//      (tools/audit/native/installed.ts) and reused when it is this checkout's, Release,
//      source and native fingerprints alike; otherwise `audit:native:build --incremental`
//      builds the platforms that need it, and the build is read again; then `audit:native`
//      photographs the slugs on both devices;
//   5. `audit:analyze`, `audit:sheets` and `audit:index`, each scoped to the slugs;
//   6. every run the steps made, appended under the phase to audit/turns/<id>.md
//      (tools/audit/turn-record.ts), which the slug's checklist links;
//   7. the index and the contact sheets to read, printed per slug.
//
// The slug is a component slug (`button`), a page id or slug (`template-signin`, `signin`),
// or a foundation (`glass-pane`, `GlassPane`); a component's slug names the component
// alone (`calendar`; its template page is `template-calendar`). A foundation expands to its
// Capture through list (tools/audit/foundations.ts): the components that render through it, direct consumers
// first, then those through shared modules, then those through other kit components, then
// the pages. `--only-first=<n>` keeps the first n of that list, for a quick look; the turn
// record says the run was capped, and a sign-off still needs the whole list.
//
//   --dry-run         print the whole plan and run nothing (no build, no server, no device)
//   --web-only        steps 1 to 3 and 5 to 7, for when the devices are busy
//   --native-only     steps 4 to 7
//   --no-build        refuse a missing or stale export rather than build one
//   --devices=ios:<udid>,android:<serial>   passed to the native build and capture
//   --workers=<n>     passed to audit:web
//
// Exit status: 0 when every step ran and every run captured all it planned (a state not
// reached is captured, as audit:web counts it: its reason is the record, and a finding);
// 1 when a step failed or a run left cells failed or missing (the runs are still
// recorded); 2 for a usage error or a refusal (a stale export, an unknown slug).

import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { ROOT } from "../../e2e/support/routes.ts";
import { STATE_NAMES, stateSpecsOf } from "../../e2e/support/state-recipes.ts";
import { COMPONENTS_DIR, PAGES_DIR } from "./checklists.ts";
import { FOUNDATION_DIR, findFoundation, foundationFacts, foundationSources, type Foundation } from "./foundations.ts";
import { NATIVE_CELLS_PER_VARIANT, components, pages, type InventoryComponent, type InventoryPage } from "./inventory.ts";
import { CURRENT_DIR, listRuns, type AuditRun } from "./runs.ts";
import { RUN_ID, TURN_PHASES, appendTurnRuns, turnRecordFile, type RunKind, type TurnPhase, type TurnRun } from "./turn-record.ts";
import { MANIFEST_FILE, parseWebFilters, planPageCapture, planStateCapture, planWebCapture } from "./web-capture.ts";

const require = createRequire(import.meta.url);
const { sourceFingerprint, nativeFingerprint } = require("../../docs/scripts/build-info.cjs") as { sourceFingerprint(root: string): string; nativeFingerprint(root: string): string };

const USAGE = `usage: bun run audit:turn -- --slug=<component, page or foundation> --phase=before|after
                              [--dry-run] [--web-only | --native-only] [--only-first=<n>] [--no-build]
                              [--devices=ios:<udid>,android:<serial>] [--workers=<n>]`;

export const NATIVE_PLATFORMS = ["ios", "android"] as const;
export type NativePlatform = (typeof NATIVE_PLATFORMS)[number];

// ---------- arguments ----------

export interface TurnArgs {
  slug: string | null;
  phase: TurnPhase | null;
  dryRun: boolean;
  webOnly: boolean;
  nativeOnly: boolean;
  onlyFirst: number | null;
  noBuild: boolean;
  devices: string | null;
  workers: string | null;
  help: boolean;
  errors: string[];
}

export function parseTurnArgs(argv: string[]): TurnArgs {
  const args: TurnArgs = { slug: null, phase: null, dryRun: false, webOnly: false, nativeOnly: false, onlyFirst: null, noBuild: false, devices: null, workers: null, help: false, errors: [] };
  const flags = new Set(["dry-run", "web-only", "native-only", "no-build", "help"]);
  for (const arg of argv) {
    if (arg === "--") continue;
    const match = /^--([a-z-]+)(?:=(.*))?$/.exec(arg);
    if (!match) {
      args.errors.push(`unexpected argument "${arg}"`);
      continue;
    }
    const [, name, value] = match as unknown as [string, string, string | undefined];
    if (flags.has(name)) {
      if (value !== undefined) args.errors.push(`--${name} takes no value`);
      else if (name === "dry-run") args.dryRun = true;
      else if (name === "web-only") args.webOnly = true;
      else if (name === "native-only") args.nativeOnly = true;
      else if (name === "no-build") args.noBuild = true;
      else args.help = true;
      continue;
    }
    if (value === undefined || value === "") {
      args.errors.push(`--${name} needs a value (--${name}=<value>)`);
      continue;
    }
    if (name === "slug") args.slug = value;
    else if (name === "phase") {
      if ((TURN_PHASES as readonly string[]).includes(value)) args.phase = value as TurnPhase;
      else args.errors.push(`--phase takes ${TURN_PHASES.join(" or ")}, not "${value}"`);
    } else if (name === "only-first") {
      if (/^[1-9]\d*$/.test(value)) args.onlyFirst = Number(value);
      else args.errors.push(`--only-first takes a positive whole number, not "${value}"`);
    } else if (name === "devices") args.devices = value;
    else if (name === "workers") {
      if (/^[1-9]\d*$/.test(value)) args.workers = value;
      else args.errors.push(`--workers takes a positive whole number, not "${value}"`);
    } else args.errors.push(`unknown flag --${name}`);
  }
  if (!args.help) {
    if (args.slug === null) args.errors.push("--slug is required");
    if (args.phase === null && !args.errors.some((e) => e.startsWith("--phase"))) args.errors.push("--phase is required (before or after)");
    if (args.webOnly && args.nativeOnly) args.errors.push("--web-only and --native-only exclude each other (pass neither for both)");
  }
  return args;
}

// ---------- what the slug is ----------

export type TurnTarget =
  | { kind: "component"; id: string; title: string; checklist: string; component: InventoryComponent }
  | { kind: "page"; id: string; title: string; checklist: string; page: InventoryPage }
  | { kind: "foundation"; id: string; title: string; checklist: string; foundation: Foundation };

/**
 * What `--slug` names, by the inventory's name grammar (inventory.ts `resolveNames`) with
 * the foundations beside it, canonical names first: a component's slug (its only name), a
 * page's id, a foundation's id or name; then a page's slug, when no component, page or
 * foundation has it as a name and no other page shares it. So `calendar` is the Calendar
 * component and `template-calendar` its page; a foundation whose id a component or a page
 * also had would be named by its name (`GlassPane`), which nothing else can have.
 */
export function resolveTarget(name: string, list: readonly InventoryComponent[] = components(), pageList: readonly InventoryPage[] = pages()): TurnTarget {
  const component = list.find((c) => c.slug === name);
  if (component) return { kind: "component", id: component.slug, title: component.name, checklist: `audit/${COMPONENTS_DIR}/${component.slug}.md`, component };
  const page = pageList.find((p) => p.id === name) ?? null;
  const foundation = findFoundation(name);
  const asPage = (p: InventoryPage): TurnTarget => ({ kind: "page", id: p.id, title: `${p.kind} ${p.slug}`, checklist: `audit/${PAGES_DIR}/${p.id}.md`, page: p });
  if (page) return asPage(page);
  if (foundation) return { kind: "foundation", id: foundation.id, title: foundation.name, checklist: `audit/${FOUNDATION_DIR}/${foundation.id}.md`, foundation };
  const bySlug = pageList.filter((p) => p.slug === name);
  if (bySlug.length === 1) return asPage(bySlug[0]!);
  if (bySlug.length > 1) throw new Error(`--slug=${name} is the slug of ${bySlug.length} pages; name one by its id (${bySlug.map((p) => p.id).join(", ")})`);
  throw new Error(`--slug=${name} names no component, page or foundation (a component slug such as button, a page id such as template-signin, or a foundation such as glass-pane)`);
}

/** The slugs a turn captures: its own, or a foundation's Capture through list, kept to the first n when capped. */
export interface TurnScope {
  components: string[];
  pages: string[];
  /** For a foundation capped with --only-first: how many slugs its list has, and how many the turn keeps. */
  capped: { total: number; kept: number } | null;
}

export function turnScope(target: TurnTarget, onlyFirst: number | null, captureThrough?: { components: string[]; pages: string[] }): TurnScope {
  if (target.kind !== "foundation") {
    if (onlyFirst !== null) throw new Error(`--only-first caps a foundation's Capture through list; ${target.id} is a ${target.kind}, captured whole`);
    return target.kind === "component" ? { components: [target.id], pages: [], capped: null } : { components: [], pages: [target.id], capped: null };
  }
  const through = captureThrough ?? foundationFacts(target.foundation, { tests: [] }, foundationSources(ROOT)).captureThrough;
  const all = [...through.components.map((slug) => ({ slug, page: false })), ...through.pages.map((slug) => ({ slug, page: true }))];
  if (!all.length) throw new Error(`${target.id} has nothing in its Capture through list (no component renders through it and no page shows it), so there is nothing to capture it through`);
  const kept = onlyFirst === null ? all : all.slice(0, onlyFirst);
  return {
    components: kept.filter((s) => !s.page).map((s) => s.slug),
    pages: kept.filter((s) => s.page).map((s) => s.slug),
    capped: onlyFirst !== null && onlyFirst < all.length ? { total: all.length, kept: kept.length } : null,
  };
}

// ---------- the plan ----------

/** The placeholder the web captures' `--base` carries until the turn's server has a port. */
export const BASE_PLACEHOLDER = "https://127.0.0.1:<port>";

export type TurnStep =
  | { kind: "export" }
  | { kind: "serve" }
  | { kind: "capture"; run: Exclude<RunKind, "native">; slugs: string[]; argv: string[]; cells: number; what: string }
  | { kind: "native-build"; platforms: NativePlatform[]; argv: string[] }
  | { kind: "native"; slugs: string[]; argv: string[]; cellsPerPlatform: number }
  | { kind: "post"; argv: string[] }
  | { kind: "record" }
  | { kind: "sheets" };

export interface TurnPlan {
  target: TurnTarget;
  phase: TurnPhase;
  scope: TurnScope;
  /** Every slug the turn captures, in order: the components, then the pages. */
  slugs: string[];
  web: boolean;
  native: boolean;
  steps: TurnStep[];
  noBuild: boolean;
}

const bunRun = (script: string, ...args: string[]) => ["bun", "run", script, "--", ...args];

/** Every step of a turn, with the commands it runs and the cells each capture plans, from the inventory and the state table. */
export function planTurn(args: Pick<TurnArgs, "webOnly" | "nativeOnly" | "noBuild" | "devices" | "workers">, target: TurnTarget, phase: TurnPhase, scope: TurnScope, list: InventoryComponent[] = components(), pageList: InventoryPage[] = pages()): TurnPlan {
  const web = !args.nativeOnly;
  const native = !args.webOnly;
  const slugs = [...scope.components, ...scope.pages];
  const filters = parseWebFilters({});
  const steps: TurnStep[] = [];
  const base = `--base=${BASE_PLACEHOLDER}`;
  const extra = args.workers ? [`--workers=${args.workers}`] : [];
  if (web) {
    steps.push({ kind: "export" }, { kind: "serve" });
    if (scope.components.length) {
      const variants = planWebCapture(list, { ...filters, only: scope.components });
      steps.push({ kind: "capture", run: "variants", slugs: scope.components, argv: bunRun("audit:web", `--only=${scope.components.join(",")}`, base, ...extra), cells: variants.cells, what: `${variants.variants} variant(s) of ${variants.components} component(s)` });
      const withStates = scope.components.filter((slug) => stateSpecsOf(slug).length > 0);
      if (withStates.length) {
        const states = planStateCapture(list, stateSpecsOf, { ...filters, only: withStates }, [...STATE_NAMES]);
        steps.push({ kind: "capture", run: "states", slugs: withStates, argv: bunRun("audit:web", "--states", `--only=${withStates.join(",")}`, base, ...extra), cells: states.cells, what: `${states.recipes} state recipe(s) of ${states.components} component(s)` });
      }
    }
    if (scope.pages.length) {
      const pagePlan = planPageCapture(pageList, { ...filters, only: scope.pages });
      steps.push({ kind: "capture", run: "pages", slugs: scope.pages, argv: bunRun("audit:web", "--pages", `--only=${scope.pages.join(",")}`, base, ...extra), cells: pagePlan.cells, what: `${pagePlan.pages} page(s) of ${pagePlan.sections} section(s)` });
    }
  }
  if (native) {
    const devices = args.devices ? [`--devices=${args.devices}`] : [];
    steps.push({ kind: "native-build", platforms: [...NATIVE_PLATFORMS], argv: bunRun("audit:native:build", `--platform=${NATIVE_PLATFORMS.join(",")}`, "--incremental", ...devices) });
    const perPlatform = (scope.components.reduce((n, slug) => n + list.find((c) => c.slug === slug)!.variants.length, 0) + scope.pages.length) * NATIVE_CELLS_PER_VARIANT;
    steps.push({ kind: "native", slugs, argv: bunRun("audit:native", `--platform=${NATIVE_PLATFORMS.join(",")}`, `--only=${slugs.join(",")}`, ...devices), cellsPerPlatform: perPlatform });
  }
  const only = `--only=${slugs.join(",")}`;
  steps.push({ kind: "post", argv: bunRun("audit:analyze", only) }, { kind: "post", argv: bunRun("audit:sheets", only) }, { kind: "post", argv: bunRun("audit:index", only) }, { kind: "record" }, { kind: "sheets" });
  return { target, phase, scope, slugs, web, native, steps, noBuild: args.noBuild };
}

// ---------- the web export ----------

export interface ExportState {
  kind: "missing" | "fresh" | "stale" | "unreadable";
  /** The source fingerprint the export's entry bundle embeds, when it could be read. */
  embedded: string | null;
  checkout: string;
  /** Why it could not be read, or what was read. */
  detail: string;
}

/** The entry bundle docs/dist/index.html loads, and the source fingerprint embedded in it (`extra.canvasBuild`, docs/app.config.js). */
export function readExportFingerprint(dist: string): { fingerprint: string | null; detail: string } {
  const index = join(dist, "index.html");
  if (!existsSync(index)) return { fingerprint: null, detail: "no docs/dist/index.html" };
  const entry = /\/_expo\/static\/js\/web\/entry-[0-9a-f]+\.js/.exec(readFileSync(index, "utf8"))?.[0];
  if (!entry) return { fingerprint: null, detail: "docs/dist/index.html loads no entry bundle (`/_expo/static/js/web/entry-<hash>.js`)" };
  const file = join(dist, entry);
  if (!existsSync(file)) return { fingerprint: null, detail: `docs/dist/index.html loads ${entry}, which docs/dist does not hold` };
  const found = [...new Set([...readFileSync(file, "utf8").matchAll(/\\?"sourceFingerprint\\?"\s*:\s*\\?"([0-9a-f]{64})\\?"/g)].map((m) => m[1]!))];
  if (found.length !== 1) return { fingerprint: null, detail: `${entry} embeds ${found.length === 0 ? "no" : `${found.length} different`} source fingerprint${found.length === 1 ? "" : "s"}` };
  return { fingerprint: found[0]!, detail: entry };
}

/** Whether docs/dist is this checkout's source: what audit:web's own check would say before its first cell. */
export function exportState(root: string, checkout = sourceFingerprint(root)): ExportState {
  const dist = join(root, "docs", "dist");
  if (!existsSync(join(dist, "index.html"))) return { kind: "missing", embedded: null, checkout, detail: "docs/dist holds no export" };
  const read = readExportFingerprint(dist);
  if (!read.fingerprint) return { kind: "unreadable", embedded: null, checkout, detail: read.detail };
  return { kind: read.fingerprint === checkout ? "fresh" : "stale", embedded: read.fingerprint, checkout, detail: read.detail };
}

// ---------- printing the plan ----------

const short = (hex: string | null) => (hex ? hex.slice(0, 12) : "none");
const shell = (argv: string[]) => argv.map((a) => (/[\s|<>]/.test(a) ? `'${a}'` : a)).join(" ");

/** The plan as the lines a dry run prints, with what the checkout says now (the export's state, the fingerprints). */
export function formatPlan(plan: TurnPlan, now: { export: ExportState | null; source: string; native: string }): string[] {
  const { target, scope } = plan;
  const lines = [`audit:turn ${target.id} (${target.kind}: ${target.title}), phase ${plan.phase}${plan.web && plan.native ? "" : plan.web ? ", web only" : ", native only"}`];
  lines.push(`  checklist ${target.checklist}`);
  if (target.kind === "foundation") {
    lines.push(`  expands  to its Capture through list${scope.capped ? `, capped by --only-first to the first ${scope.capped.kept} of ${scope.capped.total} (direct consumers first, then through shared modules, then through other kit components, then pages)` : ""}`);
  }
  lines.push(`  slugs    ${scope.components.length} component(s): ${scope.components.join(", ") || "none"}; ${scope.pages.length} page(s): ${scope.pages.join(", ") || "none"}`);
  let n = 0;
  const step = (text: string, ...more: string[]) => {
    n += 1;
    lines.push(`  ${String(n).padStart(2)}. ${text}`, ...more.map((m) => `      ${m}`));
  };
  for (const s of plan.steps) {
    if (s.kind === "export") {
      const state = now.export;
      const reading = state
        ? state.kind === "fresh"
          ? `docs/dist is fresh now (embeds ${short(state.embedded)}, this checkout's source fingerprint): reused`
          : state.kind === "stale"
            ? `docs/dist is stale now (embeds ${short(state.embedded)}, this checkout is ${short(state.checkout)}): ${plan.noBuild ? "refused (--no-build)" : "rebuilt"}`
            : `docs/dist is ${state.kind} now (${state.detail}): ${plan.noBuild ? "refused (--no-build)" : "built"}`
        : "read when the step runs";
      step(
        `web export: reuse docs/dist when the source fingerprint its entry bundle embeds is this checkout's, else ${plan.noBuild ? "refuse (--no-build)" : "build it (cd docs && bun run build:web) and read it again, refusing it if it is still not this checkout's"}`,
        reading,
      );
    } else if (s.kind === "serve") step("serve docs/dist over HTTPS on a free 127.0.0.1 port (the turn's own server, stopped when the web captures end), with the production headers, as the suite's export server does");
    else if (s.kind === "capture") step(shell(s.argv), `${s.run}: ${s.what}, ${s.cells} cell(s); the run id is recorded under ${plan.phase}`);
    else if (s.kind === "native-build") {
      step(
        `native build check on ${s.platforms.join(" and ")}: read the installed com.nannier.canvas.audit off each booted device (tools/audit/native/installed.ts) and reuse it when it is a Release build of this checkout (source fingerprint ${short(now.source)}, native ${short(now.native)})`,
        `otherwise: ${shell(s.argv.map((a) => (a.startsWith("--platform=") ? "--platform=<the platforms that need it>" : a)))}, then read the installed builds again and stop if one is still not this checkout's`,
        "a dry run touches no device, so the installed builds are not read here",
      );
    } else if (s.kind === "native") step(shell(s.argv), `native: ${s.cellsPerPlatform} cell(s) per platform; the iOS and Android run ids are recorded under ${plan.phase}`);
    else if (s.kind === "post") step(shell(s.argv));
    else if (s.kind === "record") step(`append every run id the steps made to audit/${turnRecordFile(target.id)} under "${plan.phase}"`);
    else step(`print the index and the contact sheets to read: ${plan.slugs.map((slug) => `${CURRENT_DIR}/${slug}/`).join(", ")}`);
  }
  return lines;
}

// ---------- running it ----------

/** Runs a command from the checkout with the terminal attached; resolves its exit code. */
function runCommand(argv: string[], cwd = ROOT): Promise<number> {
  const [command, ...rest] = argv;
  // `bun` is this very bun, so every step runs on the version the turn runs on.
  const executable = command === "bun" ? process.execPath : command!;
  return new Promise((resolve) => {
    const child = spawn(executable, rest, { cwd, stdio: "inherit", env: process.env });
    child.on("exit", (code, signal) => resolve(code ?? (signal ? 130 : 1)));
    child.on("error", (error) => {
      console.error(`audit:turn: could not start ${shell(argv)}: ${error.message}`);
      resolve(1);
    });
  });
}

const runIds = (root: string) => new Set(listRuns(root).runs.map((run) => run.id));

function readManifest(run: AuditRun): Record<string, unknown> | null {
  try {
    return JSON.parse(readFileSync(join(run.dir, MANIFEST_FILE), "utf8")) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** A run's cell counts as its manifest gives them, and whether it captured everything it planned. */
export function runCells(platform: string, manifest: Record<string, unknown> | null): { text: string; whole: boolean } {
  const num = (v: unknown) => (typeof v === "number" ? v : 0);
  if (!manifest) return { text: "no manifest", whole: false };
  if (platform === "web") {
    const results = manifest.results as Record<string, unknown> | null;
    const planned = num((manifest.planned as Record<string, unknown> | null)?.cells);
    if (!results) return { text: `${planned} planned, none recorded`, whole: false };
    const notReached = num(results.notReached);
    const text = `${num(results.cells)} of ${planned}: ${num(results.ok)} ok, ${num(results.failed)} failed${notReached ? `, ${notReached} not reached` : ""}`;
    return { text, whole: manifest.status === "complete" && num(results.failed) === 0 };
  }
  const summary = manifest.summary as Record<string, unknown> | null;
  const queued = num(manifest.queued);
  if (!summary) return { text: `${queued} queued, none recorded`, whole: false };
  const text = `${num(summary.cells)} of ${queued}: ${num(summary.ok)} ok, ${num(summary.unstable)} unstable, ${num(summary.failed)} failed`;
  return { text, whole: !manifest.refused && !manifest.abandoned && num(summary.failed) === 0 && num(summary.cells) === queued };
}

/** The runs a step made: the runs under .audit/runs now that were not there before it, as turn record rows. */
function newRuns(root: string, before: Set<string>, kind: RunKind, slugs: string[], recorded: string): { rows: TurnRun[]; whole: boolean } {
  const made = listRuns(root).runs.filter((run) => !before.has(run.id) && RUN_ID.test(run.id));
  let whole = made.length > 0;
  const rows = made.map((run) => {
    const cells = runCells(run.platform, readManifest(run));
    if (!cells.whole) whole = false;
    return {
      runId: run.id,
      kind,
      platform: run.platform,
      recorded,
      commit: `${(run.sha ?? run.id.slice(-7)).slice(0, 7)}${run.dirty ? " dirty" : ""}`,
      status: run.status,
      cells: cells.text,
      slugs: slugs.join(", "),
    } satisfies TurnRun;
  });
  return { rows, whole };
}

/** The sheets and index a slug has under .audit/current, as lines to print: the index, then each sheet directory with its files. */
export function sheetLines(root: string, slug: string): string[] {
  const dir = join(root, CURRENT_DIR, slug);
  const index = join(dir, "index.md");
  const lines = [existsSync(index) ? `  ${relative(root, index)}` : `  ${relative(root, dir)}/: no index (nothing captured for it)`];
  const sheets = join(dir, "sheets");
  if (!existsSync(sheets)) return lines;
  const walk = (at: string): void => {
    // Numbered sheets in their order: states-2.jpg before states-10.jpg.
    const entries = readdirSync(at).sort((a, b) => a.localeCompare(b, "en", { numeric: true }));
    const files = entries.filter((name) => name.endsWith(".jpg"));
    if (files.length) lines.push(`  ${relative(root, at)}/: ${files.join(", ")}`);
    for (const name of entries) if (statSync(join(at, name)).isDirectory()) walk(join(at, name));
  };
  walk(sheets);
  return lines;
}

async function nativeBuildCheck(step: Extract<TurnStep, { kind: "native-build" }>, devices: Partial<Record<NativePlatform, string>>): Promise<boolean> {
  const { resolveDevice } = await import("./native/devices.ts");
  const { readInstalledIos, readInstalledAndroid, whyRebuild } = await import("./native/installed.ts");
  const checkout = { source: sourceFingerprint(ROOT), native: nativeFingerprint(ROOT) };
  const read = async (platform: NativePlatform) => {
    const device = await resolveDevice(platform, devices[platform]);
    return { platform, build: platform === "ios" ? await readInstalledIos(device.id) : await readInstalledAndroid(device.id) };
  };
  const verdicts = async () => Promise.all(step.platforms.map(async (platform) => {
    const { build } = await read(platform);
    return { platform, why: whyRebuild(build, checkout) };
  }));
  const first = await verdicts();
  for (const v of first) console.log(`audit:turn: ${v.platform}: ${v.why === null ? "the installed Canvas Audit build is this checkout's (Release); reusing it" : `${v.why}; building`}`);
  const stale = first.filter((v) => v.why !== null).map((v) => v.platform);
  if (!stale.length) return true;
  const argv = step.argv.map((a) => (a.startsWith("--platform=") ? `--platform=${stale.join(",")}` : a));
  console.log(`\naudit:turn: $ ${shell(argv)}`);
  if ((await runCommand(argv)) !== 0) {
    console.error("audit:turn: the native build failed; stopping before the native capture");
    return false;
  }
  const again = await verdicts();
  const still = again.filter((v) => v.why !== null);
  for (const v of still) console.error(`audit:turn: ${v.platform}: after the build, ${v.why}; stopping`);
  return still.length === 0;
}

/**
 * Runs a planned turn. Every run a capture step makes is recorded in the turn record, also
 * when a later step stops the turn, so a capture is never lost to a failure after it.
 */
export async function runTurn(plan: TurnPlan, args: Pick<TurnArgs, "devices">): Promise<number> {
  const recorded: TurnRun[] = [];
  let written = false;
  const record = () => {
    if (written || !recorded.length) return;
    written = true;
    writeRecord(plan, recorded);
  };
  try {
    return await runSteps(plan, args, recorded, record);
  } finally {
    record();
  }
}

async function runSteps(plan: TurnPlan, args: Pick<TurnArgs, "devices">, recorded: TurnRun[], record: () => void): Promise<number> {
  const { parseDeviceOverrides } = await import("./native/devices.ts");
  const devices = parseDeviceOverrides(args.devices ?? undefined) as Partial<Record<NativePlatform, string>>;
  let failed = false;
  let base: string | null = null;
  let server: { close(): Promise<void> } | null = null;
  const lastCapture = plan.steps.reduce((last, s, i) => (s.kind === "capture" ? i : last), -1);
  const note = (text: string) => console.log(`\naudit:turn: ${text}`);
  try {
    for (const [index, step] of plan.steps.entries()) {
      if (step.kind === "export") {
        let state = exportState(ROOT);
        note(`docs/dist is ${state.kind} (${state.detail}; embeds ${short(state.embedded)}, this checkout is ${short(state.checkout)})`);
        if (state.kind !== "fresh") {
          if (plan.noBuild) {
            console.error(`audit:turn: refusing the export: it is ${state.kind} and --no-build was given (build it with cd docs && bun run build:web)`);
            return 2;
          }
          note("$ cd docs && bun run build:web");
          if ((await runCommand(["bun", "run", "build:web"], join(ROOT, "docs"))) !== 0) {
            console.error("audit:turn: the docs export failed to build");
            return 1;
          }
          state = exportState(ROOT);
          if (state.kind !== "fresh") {
            console.error(`audit:turn: refusing the export: after the build it is still ${state.kind} (${state.detail}; embeds ${short(state.embedded)}, this checkout is ${short(state.checkout)}); did the tree change during the build?`);
            return 2;
          }
          note(`docs/dist is fresh (embeds ${short(state.embedded)})`);
        }
      } else if (step.kind === "serve") {
        // The suite's export server, in this process: the production headers, HTTPS on a
        // loopback certificate, mounted under E2E_BASE_PATH as audit:web expects it.
        const { startStaticServer } = await import("../../e2e/support/static-server.ts");
        const started = await startStaticServer({ root: join(ROOT, "docs", "dist"), port: 0, headers: true, https: true, base: process.env.E2E_BASE_PATH ?? "" });
        server = started;
        base = `https://127.0.0.1:${started.port}`;
        note(`serving docs/dist at ${started.url}`);
      } else if (step.kind === "capture") {
        if (!base) throw new Error("a web capture before the turn's server started");
        const argv = step.argv.map((a) => (a === `--base=${BASE_PLACEHOLDER}` ? `--base=${base}` : a));
        const before = runIds(ROOT);
        note(`$ ${shell(argv)}`);
        const code = await runCommand(argv);
        const made = newRuns(ROOT, before, step.run, step.slugs, new Date().toISOString());
        recorded.push(...made.rows);
        if (code === 2 || !made.rows.length) {
          console.error(`audit:turn: audit:web ${made.rows.length ? "refused the capture" : "made no run"} (exit ${code}); stopping`);
          return 2;
        }
        if (code !== 0 || !made.whole) failed = true;
        if (index === lastCapture && server) {
          await server.close();
          server = null;
          note("stopped the turn's export server");
        }
      } else if (step.kind === "native-build") {
        try {
          if (!(await nativeBuildCheck(step, devices))) return 1;
        } catch (error) {
          console.error(`audit:turn: the native build check failed: ${(error as Error).message}\n(the web captures, if any, are recorded; run the native half later with --native-only)`);
          return 1;
        }
      } else if (step.kind === "native") {
        const before = runIds(ROOT);
        note(`$ ${shell(step.argv)}`);
        const code = await runCommand(step.argv);
        const made = newRuns(ROOT, before, "native", step.slugs, new Date().toISOString());
        recorded.push(...made.rows);
        if (!made.rows.length) {
          console.error(`audit:turn: audit:native made no run (exit ${code}); stopping`);
          return 1;
        }
        if (code !== 0 || !made.whole) failed = true;
      } else if (step.kind === "post") {
        note(`$ ${shell(step.argv)}`);
        if ((await runCommand(step.argv)) !== 0) {
          console.error(`audit:turn: ${step.argv[2]} failed; stopping`);
          return 1;
        }
      } else if (step.kind === "record") {
        record();
      } else {
        note(`read these (the index first; each sheet's title names the runs its tiles come from):`);
        for (const slug of plan.slugs) for (const line of sheetLines(ROOT, slug)) console.log(line);
      }
    }
  } finally {
    await server?.close();
  }
  note(`${plan.target.id} ${plan.phase}: ${recorded.length} run(s) recorded in audit/${turnRecordFile(plan.target.id)}${failed ? "; some cells failed or are missing (see each run's manifest)" : ""}`);
  return failed ? 1 : 0;
}

function writeRecord(plan: TurnPlan, runs: TurnRun[]): void {
  const file = join(ROOT, "audit", turnRecordFile(plan.target.id));
  mkdirSync(join(file, ".."), { recursive: true });
  const existing = existsSync(file) ? readFileSync(file, "utf8") : null;
  const slugs = plan.scope.capped ? runs.map((r) => ({ ...r, slugs: `${r.slugs} (capped: the first ${plan.scope.capped!.kept} of ${plan.scope.capped!.total})` })) : runs;
  const title = `${plan.target.title} (${plan.target.kind})`;
  writeFileSync(file, appendTurnRuns(existing, plan.target.id, title, plan.target.checklist, plan.phase, slugs));
  console.log(`\naudit:turn: recorded ${runs.length} run(s) under "${plan.phase}" in ${relative(ROOT, file)}: ${runs.map((r) => r.runId).join(", ")}`);
}

async function main(): Promise<number> {
  const args = parseTurnArgs(process.argv.slice(2));
  if (args.help) {
    console.log(USAGE);
    return 0;
  }
  if (args.errors.length) {
    console.error(`audit:turn: ${args.errors.join("; ")}\n${USAGE}`);
    return 2;
  }
  let plan: TurnPlan;
  try {
    // The device names are the native runner's own grammar, checked before anything runs.
    if (args.devices) (await import("./native/devices.ts")).parseDeviceOverrides(args.devices);
    const target = resolveTarget(args.slug!);
    plan = planTurn(args, target, args.phase!, turnScope(target, args.onlyFirst));
  } catch (error) {
    console.error(`audit:turn: ${(error as Error).message}`);
    return 2;
  }
  const source = sourceFingerprint(ROOT);
  const native = nativeFingerprint(ROOT);
  if (args.dryRun) {
    // A dry run reads the checkout (the export's embedded fingerprint is a file read) and nothing else.
    for (const line of formatPlan(plan, { export: plan.web ? exportState(ROOT, source) : null, source, native })) console.log(line);
    console.log("\naudit:turn: dry run; nothing was built, served, captured or recorded, and no device was read");
    return 0;
  }
  for (const line of formatPlan(plan, { export: null, source, native })) console.log(line);
  return runTurn(plan, args);
}

if (import.meta.main) process.exit(await main());
