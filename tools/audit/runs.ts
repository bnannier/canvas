// Reading capture runs back: every run under .audit/runs/, what its manifest says about
// the source it captured, every cell its cells.jsonl records, and which capture of each
// cell is the newest across all of them. The analysis (analyze.ts), the contact sheets
// (sheets.ts), the reviewer index (index.ts) and the pruner (prune.ts) all read runs
// through this one module, so they agree on what "the current capture of a cell" is.
//
// A run is a directory `<stamp>-<platform>-<sha7>`: the web runner's stamp is
// `20261009-143012` (web-capture.ts runStamp), the native host's `20261009T143012Z`
// (native/run.ts runStamp). Each run directory holds:
//   manifest.json   the web runner's (startedAt, source.sha, served.sourceFingerprint) or the
//                   native host's (started, sourceRevision, sourceFingerprint)
//   cells.jsonl     one record per finished cell; its `id` is the cell's path in the run
//
// Cell ids, the cell's path under its run (inventory.ts cellId and pageCellId,
// web-capture.ts stateCellId and webPageCellId, the native host's):
//   web/<slug>/<variant>/<width>.<look>.<surface>              {card.png, probe.json}
//   ios|android/<slug>/<variant>/<look>.<surface>              {screen.png, card.png, probe.json, a11y.json}
//   web-states/<slug>/<name>.<row>/<width>.<look>.<surface>    {state.png, probe.json}
//   web-pages/<kind>-<slug>/<width>.<look>.<surface>           {viewport.png, section.<key>.png, probe.json}
//   ios-pages|android-pages/<kind>-<slug>/<look>.<surface>     as a native variant's
// A state cell's id names its recipe and the platform row it was reached from: the recipe's
// name is its state, or `<state>-<variant>` for a state a component has several recipes of
// (a Dropdown disabled on its trigger and on an item in its menu), and
// `<state>-<variant>-inside` for one applied inside the overlay its example opens beside one
// on that example's own surface (Command's focus on a palette row); the example a recipe
// applies the state to is on its record too (`variant`, `label`). A page cell holds every
// section of the page, each photographed beside the first
// screen. A state the recipe could not reach is recorded with the status
// `state-not-reached` and the reason, and has no photograph.
//
// The newest capture of a cell is the one recorded last: by the time its record says it
// finished (`at`, which the web cells and the native host both write), then by its run's
// start, then by its line in cells.jsonl. A record without `at` (a native run older than
// the stamp) takes its run's start time, which orders it correctly against every other
// run of its platform, since two native runs of one platform cannot share the host's port.

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { STATE_NAMES, stateSpecsOf, type StateName } from "../../e2e/support/state-recipes.ts";
import { LOOKS, PLATFORMS, SURFACES, WIDTHS, resolveNamesOrThrow, type InventoryComponent, type InventoryPage, type Look, type Platform, type Surface, type WidthKey } from "./inventory.ts";
import { ROW_PLATFORMS, type RowPlatform } from "./probe-math.ts";
import { CELLS_FILE, MANIFEST_FILE, PAGES_DIR, RUNS_DIR, STATES_DIR, type CellStatus } from "./web-capture.ts";

/** Where the reviewer's view of the newest captures is built, relative to the checkout root. */
export const CURRENT_DIR = ".audit/current";
/** The analysis step's output, written beside a cell's probe.json. */
export const ANALYSIS_FILE = "analysis.json";

/** The status a state cell is recorded with when its recipe could not bring the state about (web-capture.ts CellStatus). */
export const STATE_NOT_REACHED = "state-not-reached" satisfies CellStatus;

export type CellFamily = "variant" | "state" | "page";

/** What a cell id says about the cell. */
export interface CellKey {
  id: string;
  family: CellFamily;
  platform: Platform;
  /** The component slug, or a page's id (`<kind>-<slug>`). */
  slug: string;
  /** A variant cell's example; null in a state id, whose example its record names (CapturedCell `variant`). */
  variant: string | null;
  /** A state cell's state. */
  state: StateName | null;
  /**
   * A state cell's recipe, by its name: the state, or `<state>-<variant>` for a state the
   * component has several recipes of, `<state>-<variant>-inside` for one applied inside the
   * overlay its example opens beside one on that example's surface
   * (e2e/support/state-recipes.ts `recipeName`).
   */
  recipe: string | null;
  /** The platform row of the browser card a state cell was reached from. */
  row: RowPlatform | null;
  width: WidthKey | null;
  look: Look;
  surface: Surface;
}

const WIDTH_KEYS = WIDTHS.map((w) => w.key) as readonly string[];
const isLook = (value: string): value is Look => (LOOKS as readonly string[]).includes(value);
const isSurface = (value: string): value is Surface => (SURFACES as readonly string[]).includes(value);
const isState = (value: string): value is StateName => (STATE_NAMES as readonly string[]).includes(value);
const isRow = (value: string): value is RowPlatform => (ROW_PLATFORMS as readonly string[]).includes(value);

/**
 * Read a cell id, or null for one that follows none of the layouts above (a state the
 * recipes do not name, a row no card has, a page id with a section in it). The id is the
 * source of truth for where the cell sits; a record's own fields are not consulted.
 */
export function parseCellId(id: string): CellKey | null {
  const parts = id.split("/");
  if (parts.length < 3 || parts.some((part) => part === "")) return null;
  const head = parts[0]!;
  const leaf = parts[parts.length - 1]!.split(".");
  const middle = parts.slice(2, -1);
  const slug = parts[1]!;
  let family: CellFamily;
  let platform: string;
  if (head === STATES_DIR) {
    family = "state";
    platform = "web";
  } else if (head.endsWith("-pages")) {
    family = "page";
    platform = head.slice(0, -"-pages".length);
    if (platform === "web" && head !== PAGES_DIR) return null;
  } else {
    family = "variant";
    platform = head;
  }
  if (!(PLATFORMS as readonly string[]).includes(platform)) return null;
  const web = platform === "web";
  if (leaf.length !== (web ? 3 : 2)) return null;
  const [width, look, surface] = web ? leaf : [null, leaf[0]!, leaf[1]!];
  if (width !== null && !WIDTH_KEYS.includes(width)) return null;
  if (!isLook(look!) || !isSurface(surface!)) return null;
  let variant: string | null = null;
  let state: StateName | null = null;
  let recipe: string | null = null;
  let row: RowPlatform | null = null;
  if (family === "variant") {
    if (middle.length !== 1) return null;
    variant = middle[0]!;
  } else if (family === "state") {
    // `<name>.<row>`: the recipe's name (`<state>`, `<state>-<variant>` or `<state>-<variant>-inside`), and the row of the browser card it was reached from.
    const named = middle.length === 1 ? middle[0]!.split(".") : [];
    if (named.length !== 2 || !isRow(named[1]!)) return null;
    const recipeName = /^([a-z]+)(?:-([a-z0-9]+)(?:-inside)?)?$/.exec(named[0]!);
    if (!recipeName || !isState(recipeName[1]!)) return null;
    recipe = named[0]!;
    state = recipeName[1];
    row = named[1];
  } else if (middle.length !== 0) return null;
  return { id, family, platform: platform as Platform, slug, variant, state, recipe, row, width: width as WidthKey | null, look, surface: surface! };
}

/**
 * Where a state cell's recipe stands among its component's in the state table
 * (e2e/support/state-recipes.ts, in capture order), or -1 for a recipe the table no longer
 * has: a state that gained a second recipe names each of them for its example, so the cells
 * its one recipe left under the plain state's name are no longer current.
 */
export function recipeRank(cell: Pick<CellKey, "slug" | "recipe">): number {
  if (cell.recipe === null) return -1;
  return stateSpecsOf(cell.slug).findIndex((spec) => spec.name === cell.recipe);
}

/** The id of a cell's group across looks and surfaces: its id with the look and surface taken off the leaf. */
export function groupKey(key: CellKey): string {
  const parts = key.id.split("/");
  parts[parts.length - 1] = key.width ?? "native";
  return parts.join("/");
}

/** One capture run, as its directory name and manifest describe it. */
export interface AuditRun {
  /** The directory name: `<stamp>-<platform>-<sha7>`. */
  id: string;
  dir: string;
  platform: Platform;
  /** When the run started (ISO): the manifest's, else read off the directory name. */
  startedAt: string;
  /** The manifest's status: complete, incomplete, interrupted, refused, running; a native run's complete, refused, abandoned or running. */
  status: string;
  /** Whether the run has ended (a finished time or a final status). */
  finished: boolean;
  sha: string | null;
  dirty: boolean | null;
  /** The source fingerprint of what the cells show (docs/scripts/build-info.cjs sourceFingerprint). */
  fingerprint: string | null;
  /** Whether what was captured is the checkout's source; false for a web run captured with --allow-stale. */
  fresh: boolean | null;
  /** What served the cells: `static export`, `live dev server`, or the device. */
  served: string | null;
}

/** A run directory's name: its stamp, platform and short commit. */
export function parseRunName(name: string): { startedAt: string; platform: Platform; sha7: string } | null {
  const web = /^(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})(\d{2})-(web)-([0-9a-f]{7})$/.exec(name);
  const native = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z-(ios|android)-([0-9a-f]{7})$/.exec(name);
  const match = web ?? native;
  if (!match) return null;
  const [, y, mo, d, h, mi, s, platform, sha7] = match;
  return { startedAt: `${y}-${mo}-${d}T${h}:${mi}:${s}.000Z`, platform: platform as Platform, sha7: sha7! };
}

type Json = Record<string, unknown>;
const str = (value: unknown): string | null => (typeof value === "string" && value !== "" ? value : null);
const obj = (value: unknown): Json | null => (value !== null && typeof value === "object" && !Array.isArray(value) ? (value as Json) : null);

/** A run as its directory name and manifest say; the manifest may be missing or still `running`. */
export function describeRun(id: string, dir: string, manifest: Json | null): AuditRun | null {
  const named = parseRunName(id);
  const platform = (str(manifest?.platform) ?? named?.platform) as Platform | null;
  if (!platform || !(PLATFORMS as readonly string[]).includes(platform)) return null;
  const startedAt = str(manifest?.startedAt) ?? str(manifest?.started) ?? named?.startedAt;
  if (!startedAt) return null;
  if (platform === "web") {
    const source = obj(manifest?.source);
    const served = obj(manifest?.served);
    const checkout = obj(served?.checkout);
    const status = str(manifest?.status) ?? "unknown";
    const mode = str(served?.mode);
    return {
      id,
      dir,
      platform,
      startedAt,
      status,
      finished: status !== "running" && status !== "unknown",
      sha: str(source?.sha),
      dirty: typeof source?.dirty === "boolean" ? source.dirty : null,
      // A static export shows the source it was built from; a live dev server shows the
      // checkout's source on disk, which the runner fingerprinted.
      fingerprint: mode === "live dev server" ? str(checkout?.fingerprint) : str(served?.sourceFingerprint),
      fresh: typeof served?.fresh === "boolean" ? served.fresh : null,
      served: mode,
    };
  }
  const device = obj(manifest?.device);
  const build = obj(obj(manifest?.app)?.build);
  const finishedAt = str(manifest?.finished);
  const status = str(manifest?.refused) ? "refused" : str(manifest?.abandoned) ? "abandoned" : finishedAt ? "complete" : manifest ? "running" : "unknown";
  return {
    id,
    dir,
    platform,
    startedAt,
    status,
    finished: finishedAt !== null,
    sha: str(manifest?.sourceRevision) ?? str(build?.sourceRevision),
    dirty: typeof build?.sourceDirty === "boolean" ? build.sourceDirty : null,
    fingerprint: str(manifest?.sourceFingerprint) ?? str(build?.sourceFingerprint),
    // The host refuses a build whose fingerprints are not the checkout's, so a native cell is always the build's own source.
    fresh: true,
    served: device ? [str(device.name), str(device.model), str(device.os)].filter(Boolean).join(", ") || null : null,
  };
}

/** Every run under `root`/.audit/runs, oldest first, and what could not be read. */
export function listRuns(root: string): { runs: AuditRun[]; problems: string[] } {
  const base = join(root, RUNS_DIR);
  const runs: AuditRun[] = [];
  const problems: string[] = [];
  if (!existsSync(base)) return { runs, problems };
  for (const name of readdirSync(base).sort()) {
    const dir = join(base, name);
    if (!statSync(dir).isDirectory()) continue;
    let manifest: Json | null = null;
    const manifestPath = join(dir, MANIFEST_FILE);
    if (existsSync(manifestPath)) {
      try {
        manifest = obj(JSON.parse(readFileSync(manifestPath, "utf8")));
      } catch (error) {
        problems.push(`${name}/${MANIFEST_FILE}: ${(error as Error).message}`);
      }
    }
    if (!manifest && !existsSync(join(dir, CELLS_FILE))) continue;
    const run = describeRun(name, dir, manifest);
    if (run) runs.push(run);
    else problems.push(`${name}: not a capture run (no platform or start time in its name or manifest)`);
  }
  runs.sort((a, b) => a.startedAt.localeCompare(b.startedAt) || a.id.localeCompare(b.id));
  return { runs, problems };
}

/** One recorded capture of a cell in one run. */
export interface CapturedCell extends CellKey {
  /** The example: a variant cell's from its id, a state cell's from its record (the recipe's example). */
  variant: string | null;
  /** A state cell's example label, from its record. */
  label: string | null;
  run: AuditRun;
  /** The cell's directory (absolute). */
  dir: string;
  /** ok, failed, unstable (native), or state-not-reached. */
  status: string;
  /** Why a failed cell failed, or why a state was not reached. */
  error: string | null;
  /** The flags the capture filed the cell under (the web probe's; native and state records may carry none). */
  flags: string[];
  /** When the cell finished: its record's `at`, else its run's start. */
  capturedAt: string;
  /** Its line in cells.jsonl (1-based): a later line is a later capture. */
  line: number;
  record: Json;
}

/** Whether a capture is a state the recipe could not reach. */
export function notReached(cell: Pick<CapturedCell, "status">): boolean {
  return cell.status === STATE_NOT_REACHED;
}

/** The cells of one run's cells.jsonl text, the last record of an id winning; unreadable lines are counted. */
export function readRunCells(run: AuditRun, text: string): { cells: CapturedCell[]; unreadable: number; unknown: string[] } {
  const byId = new Map<string, CapturedCell>();
  let unreadable = 0;
  const unknown: string[] = [];
  text.split("\n").forEach((line, index) => {
    if (!line.trim()) return;
    let record: Json | null;
    try {
      record = obj(JSON.parse(line));
    } catch {
      unreadable += 1;
      return;
    }
    const id = str(record?.id);
    if (!record || !id) {
      unreadable += 1;
      return;
    }
    const key = parseCellId(id);
    if (!key) {
      unknown.push(id);
      return;
    }
    const flags = Array.isArray(record.flags) ? record.flags.filter((flag): flag is string => typeof flag === "string") : [];
    byId.set(id, {
      ...key,
      variant: key.variant ?? (key.family === "state" ? str(record.variant) : null),
      label: key.family === "state" ? str(record.label) : null,
      run,
      dir: join(run.dir, id),
      status: str(record.status) ?? "unknown",
      error: str(record.error) ?? str(record.reason),
      flags,
      capturedAt: str(record.at) ?? run.startedAt,
      line: index + 1,
      record,
    });
  });
  return { cells: [...byId.values()], unreadable, unknown };
}

/** Every recorded cell of `runs`, and what could not be read. */
export function loadCells(runs: AuditRun[]): { cells: CapturedCell[]; problems: string[] } {
  const cells: CapturedCell[] = [];
  const problems: string[] = [];
  for (const run of runs) {
    const path = join(run.dir, CELLS_FILE);
    if (!existsSync(path)) continue;
    const read = readRunCells(run, readFileSync(path, "utf8"));
    cells.push(...read.cells);
    if (read.unreadable) problems.push(`${run.id}/${CELLS_FILE}: ${read.unreadable} unreadable line(s)`);
    if (read.unknown.length) problems.push(`${run.id}/${CELLS_FILE}: ${read.unknown.length} id(s) in no known layout, e.g. ${read.unknown[0]}`);
  }
  return { cells, problems };
}

/** Whether capture `a` is newer than capture `b` of the same cell. */
export function newer(a: CapturedCell, b: CapturedCell): boolean {
  if (a.capturedAt !== b.capturedAt) return a.capturedAt > b.capturedAt;
  if (a.run.startedAt !== b.run.startedAt) return a.run.startedAt > b.run.startedAt;
  if (a.run.id !== b.run.id) return a.run.id > b.run.id;
  return a.line > b.line;
}

/** Every capture of each cell, newest first, by cell id. */
export function capturesById(cells: CapturedCell[]): Map<string, CapturedCell[]> {
  const byId = new Map<string, CapturedCell[]>();
  for (const cell of cells) {
    const list = byId.get(cell.id);
    if (list) list.push(cell);
    else byId.set(cell.id, [cell]);
  }
  for (const list of byId.values()) list.sort((a, b) => (newer(a, b) ? -1 : newer(b, a) ? 1 : 0));
  return byId;
}

/**
 * The newest capture of every cell across `cells`, in id order: a partial re-capture
 * (`--only`, `--variants`) replaces exactly the cells it took and leaves every other cell
 * at the run that took it last. The newest record wins whatever its status, so a cell that
 * failed on its latest capture shows as failed, not as an older photograph.
 */
export function selectCurrent(cells: CapturedCell[]): CapturedCell[] {
  return [...capturesById(cells).values()].map((list) => list[0]!).sort((a, b) => a.id.localeCompare(b.id));
}

/** The runs `names` pick out of `runs`: each an exact run id or the prefix of exactly one. */
export function pickRuns(runs: AuditRun[], names: string[]): AuditRun[] {
  const picked = new Set<AuditRun>();
  for (const name of names) {
    const exact = runs.find((run) => run.id === name);
    const matches = exact ? [exact] : runs.filter((run) => run.id.startsWith(name));
    if (matches.length === 0) throw new Error(`--run: no run under ${RUNS_DIR} is called or starts with "${name}"`);
    if (matches.length > 1) throw new Error(`--run: "${name}" starts ${matches.length} runs (${matches.map((r) => r.id).join(", ")}); name one`);
    picked.add(matches[0]!);
  }
  return runs.filter((run) => picked.has(run));
}

/**
 * What `--only` names, read by the inventory's one grammar (inventory.ts `resolveNames`):
 * the component slugs, and the page ids its page names resolve to. A component's slug names
 * the component alone (`calendar` is never `template-calendar`), and a page is matched by
 * its id, never by a suffix of it (`sidebar` is not `template-detail-sidebar`).
 */
export interface OnlyTargets {
  components: ReadonlySet<string>;
  /** Page ids. */
  pages: ReadonlySet<string>;
}

/** `--only` against the inventory, or null for everything; throws for a name nothing has or a page slug two pages share. */
export function resolveOnly(only: string[] | null, list?: readonly Pick<InventoryComponent, "slug">[], pageList?: readonly Pick<InventoryPage, "id" | "slug">[]): OnlyTargets | null {
  if (!only) return null;
  const named = resolveNamesOrThrow("--only", only, list, pageList);
  return { components: new Set(named.components), pages: new Set(named.pages) };
}

/** Whether a cell belongs to what `--only` names: a component's cells by its slug, a page's by its id. */
export function cellMatches(cell: Pick<CellKey, "slug" | "family">, only: OnlyTargets | null): boolean {
  if (!only) return true;
  return cell.family === "page" ? only.pages.has(cell.slug) : only.components.has(cell.slug);
}

/** The command-line flags the analysis, sheets, index and prune commands share. */
export interface ToolArgs {
  only: string[] | null;
  runs: string[] | null;
  keep: number | null;
  dryRun: boolean;
  help: boolean;
  errors: string[];
}

/** Read `--only=a,b`, `--run=<id>[,<id>]`, `--keep=<n>`, `--dry-run` and `--help`; `allowed` names the flags a command takes. */
export function parseToolArgs(argv: string[], allowed: readonly string[] = ["only", "run"]): ToolArgs {
  const args: ToolArgs = { only: null, runs: null, keep: null, dryRun: false, help: false, errors: [] };
  const list = (value: string) => [...new Set(value.split(",").map((entry) => entry.trim()).filter(Boolean))];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    if (arg === "--") continue;
    const match = /^--([a-z-]+)(?:=(.*))?$/.exec(arg);
    if (!match) {
      args.errors.push(`unexpected argument "${arg}"`);
      continue;
    }
    const name = match[1]!;
    if (name === "help") {
      args.help = true;
      continue;
    }
    if (!allowed.includes(name)) {
      args.errors.push(`unknown flag --${name}`);
      continue;
    }
    if (name === "dry-run") {
      if (match[2] !== undefined) args.errors.push("--dry-run takes no value");
      args.dryRun = true;
      continue;
    }
    let value = match[2];
    if (value === undefined) {
      const next = argv[i + 1];
      if (next === undefined || next.startsWith("--")) {
        args.errors.push(`--${name} needs a value`);
        continue;
      }
      value = next;
      i += 1;
    }
    if (name === "only") args.only = list(value).length ? list(value) : null;
    else if (name === "run") args.runs = list(value).length ? list(value) : null;
    else if (name === "keep") {
      if (!/^[1-9]\d*$/.test(value)) args.errors.push(`--keep must be a positive integer, not "${value}"`);
      else args.keep = Number(value);
    }
  }
  return args;
}

/** The current cells a command works on: the newest capture of each cell in the chosen runs, narrowed to `only`. */
export function currentCells(root: string, args: Pick<ToolArgs, "only" | "runs">): { runs: AuditRun[]; cells: CapturedCell[]; problems: string[] } {
  const only = resolveOnly(args.only);
  const listed = listRuns(root);
  const runs = args.runs ? pickRuns(listed.runs, args.runs) : listed.runs;
  const loaded = loadCells(runs);
  const cells = selectCurrent(loaded.cells).filter((cell) => cellMatches(cell, only));
  return { runs, cells, problems: [...listed.problems, ...loaded.problems] };
}

/** Read a JSON file, or null when it is missing or unreadable. */
export function readJsonFile<T>(path: string): T | null {
  try {
    return JSON.parse(readFileSync(path, "utf8")) as T;
  } catch {
    return null;
  }
}

/** Run `work` over `items` with at most `limit` in flight, keeping the order of the results. */
export async function pool<T, R>(items: T[], limit: number, work: (item: T, index: number) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  const lanes = Array.from({ length: Math.max(1, Math.min(limit, items.length)) }, async () => {
    while (next < items.length) {
      const index = next++;
      results[index] = await work(items[index]!, index);
    }
  });
  await Promise.all(lanes);
  return results;
}
