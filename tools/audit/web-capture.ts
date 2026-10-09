// The web capture runner's rules, with no Playwright and no React Native import: which
// cells a run captures (the inventory narrowed by the run's filters), where each cell's
// files go, what one line of cells.jsonl says, how `bun run audit:web`'s flags map onto
// the environment the Playwright side reads, what kind of server the cells hit and how it
// is judged fresh, the capture settings a run's manifest records, and how a finished run is
// summarized. The runner (tools/audit/run-web.ts), the Playwright spec
// (e2e/audit/variants.audit.ts) and the unit tests read this one module, so the cells the
// runner plans and the cells the spec captures cannot disagree.
//
// A run captures one or more kinds of cell (plan 1c and 1d): the example variants (the
// default), the interaction states (`--states`, e2e/support/state-recipes.ts) and the
// pattern and template pages (`--pages`).
//
// Output layout (plan, "Output layout"):
//   .audit/runs/<stamp>-web-<sha7>/manifest.json
//   .audit/runs/<stamp>-web-<sha7>/cells.jsonl
//   .audit/runs/<stamp>-web-<sha7>/web/<slug>/<variant>/<width>.<look>.<surface>/{card.png, probe.json}
//   .audit/runs/<stamp>-web-<sha7>/web-states/<slug>/<state>.<row>/<width>.<look>.<surface>/{state.png, probe.json}
//   .audit/runs/<stamp>-web-<sha7>/web-pages/<kind>-<slug>/<width>.<look>.<surface>/{viewport.png, section.<key>.png, probe.json}
// The analysis step (plan 1e) adds analysis.json beside them.

import { join } from "node:path";
import { STATE_NAMES, type StateName } from "../../e2e/support/state-recipes.ts";
import {
  LOOKS,
  SURFACES,
  WIDTHS,
  cellId,
  pageCellId,
  type ComponentVariant,
  type InventoryComponent,
  type InventoryPage,
  type Look,
  type Platform,
  type Surface,
  type WidthKey,
} from "./inventory.ts";
import type { RowPlatform } from "./probe-math.ts";

/** Where capture runs live, relative to the checkout root. Gitignored. */
export const RUNS_DIR = ".audit/runs";
export const MANIFEST_FILE = "manifest.json";
export const CELLS_FILE = "cells.jsonl";
export const CARD_FILE = "card.png";
export const PROBE_FILE = "probe.json";
/** A failed cell's viewport, when the page could still be photographed. */
export const FAILURE_FILE = "failure.png";
/** Where a run's interaction-state cells and page cells go, beside `web/`. */
export const STATES_DIR = "web-states";
export const PAGES_DIR = "web-pages";
/** A reached state's photograph: its row, or the viewport an overlay opened in. */
export const STATE_FILE = "state.png";
/** A page cell's first screen, above the fold at the cell's own viewport. */
export const VIEWPORT_FILE = "viewport.png";
/** A page cell's photograph of one section, by the section's key. */
export const sectionFile = (key: string): string => `section.${key}.png`;
/**
 * What the Playwright global setup read off the served export, for the runner to fold
 * into the manifest; the runner removes it once it has.
 */
export const SERVED_FILE = "served.json";

/** The environment the Playwright side reads; `bun run audit:web` sets it from its flags. */
export const AUDIT_ENV = {
  only: "AUDIT_ONLY",
  variants: "AUDIT_VARIANTS",
  looks: "AUDIT_LOOKS",
  surfaces: "AUDIT_SURFACES",
  widths: "AUDIT_WIDTHS",
  axe: "AUDIT_AXE",
  workers: "AUDIT_WORKERS",
  runDir: "AUDIT_RUN_DIR",
  allowStale: "AUDIT_ALLOW_STALE",
  /** `all`, or the interaction states to capture (comma-separated); unset captures none. */
  states: "AUDIT_STATES",
  /** `1` captures the pattern and template pages. */
  pages: "AUDIT_PAGES",
} as const;

export const DEFAULT_WORKERS = 6;

export type Env = Record<string, string | undefined>;
export type WidthSpec = (typeof WIDTHS)[number];

/**
 * Where axe runs. By default on the web row of solid cells at phone and desktop width, in
 * every look: glass frosts are GPU-dependent, so axe's colour checks have nothing stable
 * to read there, and tablet sits between the two layouts the kit switches on.
 */
export type AxePolicy = { kind: "none" } | { kind: "all" } | { kind: "solid"; widths: WidthKey[] };
export const DEFAULT_AXE_WIDTHS: readonly WidthKey[] = ["phone", "desktop"];

export interface WebFilters {
  /** Component slugs, or null for every component. */
  only: string[] | null;
  /** Variant keys (`variantSlug(label)`, `default` for the Usage fence), or null for every variant. */
  variants: string[] | null;
  looks: Look[];
  surfaces: Surface[];
  widths: WidthKey[];
  axe: AxePolicy;
}

/** A comma-separated value as its entries, or null when it is unset or empty. */
export function listOf(value: string | undefined): string[] | null {
  if (value === undefined) return null;
  const entries = value.split(",").map((entry) => entry.trim()).filter(Boolean);
  return entries.length ? [...new Set(entries)] : null;
}

/** The named values of one axis, in the axis' own order; every one of them when none is named. */
function pick<T extends string>(name: string, value: string | undefined, allowed: readonly T[]): T[] {
  const named = listOf(value);
  if (!named) return [...allowed];
  const unknown = named.filter((entry) => !(allowed as readonly string[]).includes(entry));
  if (unknown.length) throw new Error(`${name}: unknown ${unknown.map((u) => `"${u}"`).join(", ")}; the values are ${allowed.join(", ")}`);
  return allowed.filter((entry) => named.includes(entry));
}

const WIDTH_KEYS = WIDTHS.map((w) => w.key) as WidthKey[];

/** `none`, `all`, or the widths axe runs at on solid cells (`phone,desktop` when unset). */
export function parseAxe(value: string | undefined): AxePolicy {
  const text = value?.trim();
  if (!text) return { kind: "solid", widths: [...DEFAULT_AXE_WIDTHS] };
  if (text === "none") return { kind: "none" };
  if (text === "all") return { kind: "all" };
  return { kind: "solid", widths: pick(AUDIT_ENV.axe, text, WIDTH_KEYS) };
}

export function describeAxe(policy: AxePolicy): string {
  if (policy.kind === "none") return "off";
  if (policy.kind === "all") return "every cell";
  return `solid at ${policy.widths.join(", ")}`;
}

/** Whether axe scans the web row of a cell at this width and surface. */
export function axeApplies(policy: AxePolicy, width: WidthKey, surface: Surface): boolean {
  if (policy.kind === "none") return false;
  if (policy.kind === "all") return true;
  return surface === "solid" && policy.widths.includes(width);
}

/** The run's filters, read from the environment; an unknown look, surface or width throws. */
export function parseWebFilters(env: Env): WebFilters {
  return {
    only: listOf(env[AUDIT_ENV.only]),
    variants: listOf(env[AUDIT_ENV.variants]),
    looks: pick(AUDIT_ENV.looks, env[AUDIT_ENV.looks], LOOKS),
    surfaces: pick(AUDIT_ENV.surfaces, env[AUDIT_ENV.surfaces], SURFACES),
    widths: pick(AUDIT_ENV.widths, env[AUDIT_ENV.widths], WIDTH_KEYS),
    axe: parseAxe(env[AUDIT_ENV.axe]),
  };
}

/** One Playwright test: a component in one look and surface, looping its variants by widths. */
export interface WebGroup {
  slug: string;
  look: Look;
  surface: Surface;
  variants: ComponentVariant[];
  widths: WidthSpec[];
  /** How many examples the component's page has in all, filtered or not: one means no rail. */
  examples: number;
}

export interface WebPlan {
  groups: WebGroup[];
  components: number;
  variants: number;
  cells: number;
}

/**
 * The cells a run captures: every component (or the `only` ones, in docs order), every
 * variant (or the named ones), by every look, surface and width named. A slug or variant
 * key no component has throws, so a typo cannot pass as an empty run.
 */
export function planWebCapture(inventory: InventoryComponent[], filters: WebFilters): WebPlan {
  if (filters.only) {
    const known = new Set(inventory.map((c) => c.slug));
    const unknown = filters.only.filter((slug) => !known.has(slug));
    if (unknown.length) throw new Error(`${AUDIT_ENV.only}: no component page is called ${unknown.map((u) => `"${u}"`).join(", ")}`);
  }
  const chosen = filters.only ? inventory.filter((c) => filters.only!.includes(c.slug)) : inventory;
  const selected = chosen
    .map((component) => ({
      component,
      variants: filters.variants ? component.variants.filter((v) => filters.variants!.includes(v.variant)) : component.variants,
    }))
    .filter((entry) => entry.variants.length > 0);
  if (filters.variants) {
    const found = new Set(selected.flatMap((entry) => entry.variants.map((v) => v.variant)));
    const missing = filters.variants.filter((key) => !found.has(key));
    if (missing.length) {
      throw new Error(`${AUDIT_ENV.variants}: no selected component has a variant ${missing.map((m) => `"${m}"`).join(", ")}`);
    }
  }
  const widths = WIDTHS.filter((w) => filters.widths.includes(w.key));
  const groups: WebGroup[] = [];
  for (const { component, variants } of selected) {
    for (const look of filters.looks) {
      for (const surface of filters.surfaces) {
        groups.push({ slug: component.slug, look, surface, variants, widths: [...widths], examples: component.variants.length });
      }
    }
  }
  const variantCount = selected.reduce((n, entry) => n + entry.variants.length, 0);
  return {
    groups,
    components: selected.length,
    variants: variantCount,
    cells: groups.reduce((n, group) => n + group.variants.length * group.widths.length, 0),
  };
}

/** One web cell, with what opening it needs. */
export interface WebCell {
  slug: string;
  variant: string;
  label: string;
  path: string;
  width: WidthSpec;
  look: Look;
  surface: Surface;
}

export function webCellId(cell: WebCell): string {
  return cellId({ platform: "web", slug: cell.slug, variant: cell.variant, width: cell.width.key, look: cell.look, surface: cell.surface });
}

/** The cell's directory under a run: `<runDir>/web/<slug>/<variant>/<width>.<look>.<surface>`. */
export function cellDir(runDir: string, cell: WebCell): string {
  return join(runDir, webCellId(cell));
}

// --- What a run captures ---------------------------------------------------------------

/** The kinds of cell a run captures. Variants are captured when neither states nor pages are asked for. */
export interface CaptureKinds {
  variants: boolean;
  /** The interaction states captured, in their own order, or null when the run captures none. */
  states: StateName[] | null;
  pages: boolean;
}

/** The kinds, read from the environment: AUDIT_STATES (`all` or a list of states) and AUDIT_PAGES (`1`). */
export function parseKinds(env: Env): CaptureKinds {
  const named = env[AUDIT_ENV.states]?.trim();
  const states = !named ? null : named === "all" ? [...STATE_NAMES] : pick(AUDIT_ENV.states, named, STATE_NAMES);
  const pagesValue = env[AUDIT_ENV.pages]?.trim();
  if (pagesValue && pagesValue !== "1") throw new Error(`${AUDIT_ENV.pages} must be 1 or unset, not "${pagesValue}"`);
  const pages = pagesValue === "1";
  return { variants: states === null && !pages, states, pages };
}

/** The kinds in a line, for the console and the manifest. */
export function describeKinds(kinds: CaptureKinds): string {
  return [
    kinds.variants && "variants",
    kinds.states && `states (${kinds.states.join(", ")})`,
    kinds.pages && "pages",
  ].filter(Boolean).join(", ");
}

/**
 * `--only` split between the kinds a run captures: component slugs to the variants and
 * states, page ids (`template-signin`) or page slugs (`signin`) to the pages; a slug that
 * is both (`calendar`) goes to each kind that takes it. A name nothing has, or one only a
 * kind the run does not capture has, throws, so a typo is not an empty run. Null for a
 * kind means everything; an empty list means none.
 */
export function splitOnly(
  only: string[] | null,
  kinds: CaptureKinds,
  inventory: InventoryComponent[],
  pageList: InventoryPage[],
): { components: string[] | null; pages: string[] | null } {
  const takesComponents = kinds.variants || kinds.states !== null;
  if (!only) return { components: takesComponents ? null : [], pages: kinds.pages ? null : [] };
  const slugs = new Set(inventory.map((c) => c.slug));
  const pageIds = new Map<string, string>();
  for (const p of pageList) {
    pageIds.set(p.id, p.id);
    pageIds.set(p.slug, p.id);
  }
  const components: string[] = [];
  const pages: string[] = [];
  const unknown: string[] = [];
  const pageOnly: string[] = [];
  const componentOnly: string[] = [];
  for (const name of only) {
    const isComponent = slugs.has(name);
    const page = pageIds.get(name);
    if (!isComponent && !page) unknown.push(name);
    else if (isComponent && takesComponents) {
      components.push(name);
      if (page && kinds.pages) pages.push(page);
    } else if (page && kinds.pages) pages.push(page);
    else if (page) pageOnly.push(name);
    else componentOnly.push(name);
  }
  const quoted = (names: string[]) => names.map((n) => `"${n}"`).join(", ");
  if (unknown.length) throw new Error(`${AUDIT_ENV.only}: no component or page is called ${quoted(unknown)}`);
  if (pageOnly.length) throw new Error(`${AUDIT_ENV.only}: ${quoted(pageOnly)} names a page, and this run captures no pages (pass --pages)`);
  if (componentOnly.length) throw new Error(`${AUDIT_ENV.only}: ${quoted(componentOnly)} names a component, and this run captures only pages (pass --states, or drop --pages for the variants)`);
  return { components: takesComponents ? components : [], pages: kinds.pages ? [...new Set(pages)] : [] };
}

// --- Interaction states (plan 1d) -------------------------------------------------------

/** What the planner needs of a state recipe (e2e/support/state-recipes.ts `stateSpecsOf`). */
export interface StateSpec {
  state: StateName;
  variant: string;
  rows: readonly RowPlatform[];
  /** The widths the recipe is captured at. */
  widths: readonly WidthKey[];
}

/** One interaction-state cell: a component's state, from one row, at one width (the look and surface are its group's). */
export interface StateCellPlan {
  state: StateName;
  variant: ComponentVariant;
  row: RowPlatform;
  width: WidthSpec;
}

/** One Playwright test: a component's states in one look and surface. */
export interface StateGroup {
  slug: string;
  look: Look;
  surface: Surface;
  cells: StateCellPlan[];
  /** How many examples the component's page has in all: one means it has no rail. */
  examples: number;
}

export interface StatePlan {
  groups: StateGroup[];
  components: number;
  /** State recipes captured (a recipe opened from three rows counts once). */
  recipes: number;
  cells: number;
  /** Cells per state. */
  byState: Partial<Record<StateName, number>>;
}

/**
 * The state cells a run captures: every component (or the `only` ones, in docs order) that
 * has recipes, each recipe of the named states, from each of its rows, at each of its widths
 * the run keeps (hover, focus, pressed, invalid and disabled at the desktop; open at all
 * three; a state that exists only at some widths, at those), in every look and surface
 * named. A recipe naming an example its page does not have throws: the cell would
 * photograph the wrong example.
 */
export function planStateCapture(
  inventory: InventoryComponent[],
  specsOf: (slug: string) => StateSpec[],
  filters: WebFilters,
  states: StateName[],
): StatePlan {
  if (filters.only) {
    const known = new Set(inventory.map((c) => c.slug));
    const unknown = filters.only.filter((slug) => !known.has(slug));
    if (unknown.length) throw new Error(`${AUDIT_ENV.only}: no component page is called ${unknown.map((u) => `"${u}"`).join(", ")}`);
  }
  const chosen = filters.only ? inventory.filter((c) => filters.only!.includes(c.slug)) : inventory;
  const groups: StateGroup[] = [];
  const byState: Partial<Record<StateName, number>> = {};
  let components = 0;
  let recipes = 0;
  for (const component of chosen) {
    const cells: StateCellPlan[] = [];
    for (const spec of specsOf(component.slug).filter((s) => states.includes(s.state))) {
      const variant = component.variants.find((v) => v.variant === spec.variant);
      if (!variant) throw new Error(`the ${component.slug} ${spec.state} recipe names the example "${spec.variant}", which ${component.route} does not have`);
      const widths = WIDTHS.filter((w) => filters.widths.includes(w.key) && spec.widths.includes(w.key));
      if (!widths.length) continue;
      recipes += 1;
      for (const row of spec.rows) for (const width of widths) cells.push({ state: spec.state, variant, row, width });
    }
    if (!cells.length) continue;
    components += 1;
    for (const look of filters.looks) {
      for (const surface of filters.surfaces) {
        groups.push({ slug: component.slug, look, surface, cells: [...cells], examples: component.variants.length });
        for (const cell of cells) byState[cell.state] = (byState[cell.state] ?? 0) + 1;
      }
    }
  }
  return { groups, components, recipes, cells: groups.reduce((n, g) => n + g.cells.length, 0), byState };
}

/** One state cell, with its look and surface. */
export interface StateCell extends StateCellPlan {
  slug: string;
  look: Look;
  surface: Surface;
}

/** A state cell's id and path under a run: `web-states/<slug>/<state>.<row>/<width>.<look>.<surface>`. */
export function stateCellId(cell: Pick<StateCell, "slug" | "state" | "row" | "look" | "surface"> & { width: { key: WidthKey } }): string {
  return `${STATES_DIR}/${cell.slug}/${cell.state}.${cell.row}/${cell.width.key}.${cell.look}.${cell.surface}`;
}

// --- Pages (plan 1d) ------------------------------------------------------------------

/** One Playwright test: a pattern or template page in one look and surface, looping widths. */
export interface PageGroup {
  page: InventoryPage;
  look: Look;
  surface: Surface;
  widths: WidthSpec[];
}

export interface PagePlan {
  groups: PageGroup[];
  pages: number;
  /** Sections photographed per pass over every page once. */
  sections: number;
  cells: number;
}

/** The page cells a run captures: every page (or the `only` ones, by id), at every width, look and surface named. */
export function planPageCapture(pageList: InventoryPage[], filters: WebFilters): PagePlan {
  if (filters.only) {
    const known = new Set(pageList.map((p) => p.id));
    const unknown = filters.only.filter((id) => !known.has(id));
    if (unknown.length) throw new Error(`${AUDIT_ENV.only}: no pattern or template page is called ${unknown.map((u) => `"${u}"`).join(", ")}`);
  }
  const chosen = filters.only ? pageList.filter((p) => filters.only!.includes(p.id)) : pageList;
  const widths = WIDTHS.filter((w) => filters.widths.includes(w.key));
  const groups: PageGroup[] = [];
  for (const page of chosen) {
    for (const look of filters.looks) {
      for (const surface of filters.surfaces) groups.push({ page, look, surface, widths: [...widths] });
    }
  }
  return {
    groups,
    pages: chosen.length,
    sections: chosen.reduce((n, p) => n + p.sections.length, 0),
    cells: groups.reduce((n, g) => n + g.widths.length, 0),
  };
}

/** One page cell. */
export interface PageCell {
  page: InventoryPage;
  width: WidthSpec;
  look: Look;
  surface: Surface;
}

/** A page cell's id and path under a run: `web-pages/<kind>-<slug>/<width>.<look>.<surface>`. */
export function webPageCellId(cell: PageCell): string {
  return pageCellId({ platform: "web", page: cell.page.id, width: cell.width.key, look: cell.look, surface: cell.surface });
}

/** A run's timestamp: UTC, sortable, filename-safe (`20261009-143012`). */
export function runStamp(date: Date): string {
  const iso = date.toISOString();
  return `${iso.slice(0, 10).replace(/-/g, "")}-${iso.slice(11, 19).replace(/:/g, "")}`;
}

/** A run's directory name: `<stamp>-<platform>-<sha7>`. */
export function runDirName(date: Date, platform: Platform, sha: string): string {
  if (!/^[0-9a-f]{7,40}$/.test(sha)) throw new Error(`runDirName: "${sha}" is not a commit sha`);
  return `${runStamp(date)}-${platform}-${sha.slice(0, 7)}`;
}

/**
 * What happened to a cell: captured, failed (the capture machinery or the page broke), or,
 * for an interaction state, not reached (its recipe could not confirm the state, so nothing
 * was photographed; the reason is on the record and in probe.json).
 */
export type CellStatus = "ok" | "failed" | "state-not-reached";

interface CellRecordBase {
  id: string;
  width: WidthKey;
  look: Look;
  surface: Surface;
  status: CellStatus;
  /** A failed cell: what stopped it. */
  error?: string;
  /** A state not reached: why. */
  reason?: string;
  /** A captured cell: what its probe found worth a reviewer's look (probe-math `flagsOf`, and a state's own). */
  flags: string[];
  /** Wall time of the cell, navigation to the last file written. */
  ms: number;
  /** Bytes the cell wrote. */
  bytes: number;
  /** The Playwright worker that captured it. */
  worker: number;
  /** When it finished (ISO). */
  at: string;
}

/** One line of cells.jsonl for an example variant (no `kind`: the lines runs wrote before states and pages). */
export interface VariantCellRecord extends CellRecordBase {
  kind?: "variant";
  slug: string;
  variant: string;
  label: string;
}

/** One line of cells.jsonl for an interaction state. */
export interface StateCellRecord extends CellRecordBase {
  kind: "state";
  slug: string;
  variant: string;
  label: string;
  state: StateName;
  row: RowPlatform;
}

/** One line of cells.jsonl for a pattern or template page. */
export interface PageCellRecord extends CellRecordBase {
  kind: "page";
  /** `<kind>-<slug>`. */
  page: string;
  route: string;
  /** Sections photographed. */
  sections: number;
}

/** One line of cells.jsonl: what happened to one cell. */
export type CellRecord = VariantCellRecord | StateCellRecord | PageCellRecord;

/** Read cells.jsonl's text; a torn last line (a run killed mid-write) is skipped, not fatal. */
export function readCellRecords(text: string): { records: CellRecord[]; unreadable: number } {
  const records: CellRecord[] = [];
  let unreadable = 0;
  for (const line of text.split("\n")) {
    if (!line.trim()) continue;
    try {
      records.push(JSON.parse(line) as CellRecord);
    } catch {
      unreadable += 1;
    }
  }
  return { records, unreadable };
}

export interface CellSummary {
  cells: number;
  ok: number;
  failed: number;
  /** Interaction states whose recipe could not confirm them. */
  notReached: number;
  /** Captured cells per flag. */
  flags: Record<string, number>;
  /** Wall time per cell, in ms. */
  ms: { mean: number; p50: number; p95: number; max: number };
  bytes: number;
  failures: { id: string; error: string }[];
  /** Every state not reached, with why. */
  unreached: { id: string; reason: string }[];
  /** Cells per kind. */
  kinds: Record<"variant" | "state" | "page", number>;
}

function percentile(sorted: number[], p: number): number {
  if (!sorted.length) return 0;
  return sorted[Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1))]!;
}

/**
 * The margin around an element photographed for a state or a page section: a focus ring,
 * a lifted card's shade or a drop shadow drawn just outside the element's box shows in it.
 */
export const SHOT_MARGIN = 12;

export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** A box grown by `margin` on every side and kept inside `bounds` (the viewport, or the part of the page no chrome covers). */
export function marginClip(box: Box, bounds: { left: number; top: number; right: number; bottom: number }, margin = SHOT_MARGIN): Box {
  const x = Math.max(bounds.left, box.x - margin);
  const y = Math.max(bounds.top, box.y - margin);
  return {
    x,
    y,
    width: Math.min(bounds.right, box.x + box.width + margin) - x,
    height: Math.min(bounds.bottom, box.y + box.height + margin) - y,
  };
}

/** Counts and timings over a run's records. A cell captured twice counts once, by its last record. */
export function summarizeCells(all: CellRecord[]): CellSummary {
  const byId = new Map<string, CellRecord>();
  for (const record of all) byId.set(record.id, record);
  const records = [...byId.values()];
  const flags: Record<string, number> = {};
  for (const record of records) for (const flag of record.flags) flags[flag] = (flags[flag] ?? 0) + 1;
  const times = records.map((r) => r.ms).sort((a, b) => a - b);
  const kinds = { variant: 0, state: 0, page: 0 };
  for (const record of records) kinds[record.kind ?? "variant"] += 1;
  return {
    cells: records.length,
    ok: records.filter((r) => r.status === "ok").length,
    failed: records.filter((r) => r.status === "failed").length,
    notReached: records.filter((r) => r.status === "state-not-reached").length,
    flags,
    ms: {
      mean: times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0,
      p50: percentile(times, 50),
      p95: percentile(times, 95),
      max: times.length ? times[times.length - 1]! : 0,
    },
    bytes: records.reduce((n, r) => n + r.bytes, 0),
    failures: records.filter((r) => r.status === "failed").map((r) => ({ id: r.id, error: r.error ?? "unknown" })),
    unreached: records.filter((r) => r.status === "state-not-reached").map((r) => ({ id: r.id, reason: r.reason ?? "unknown" })),
    kinds,
  };
}

/**
 * What kind of server the cells hit. A static export is a bundle frozen when it was built,
 * so its source fingerprint says what it shows. A live dev server (Metro, `bun run dev` in
 * docs/, the fixer loop's `--base=http://localhost:8081`) builds each bundle from the source
 * on disk when it is asked for it, so a fingerprint it reports is only what the source was
 * when that bundle was transformed, and what it shows is whatever its project's source is now.
 */
export const SERVED_MODES = { export: "static export", dev: "live dev server" } as const;
export type ServedMode = (typeof SERVED_MODES)[keyof typeof SERVED_MODES];

/** What Metro answers on `/status` (React Native's and Expo's dev servers alike). */
export const PACKAGER_RUNNING = "packager-status:running";
/** The response header in which Metro's `/status` names the project root it serves. */
export const PROJECT_ROOT_HEADER = "x-react-native-project-root";

/** What the server answered on `/status`, or null when it did not answer. */
export interface PackagerStatus {
  body: string;
  /** The `X-React-Native-Project-Root` header, when it sent one. */
  projectRoot: string | null;
}

/** The served bundle's identity: how the page gets its code, and what /testing/diagnostics reports. */
export interface ServedIdentity {
  url: string;
  mode: ServedMode;
  /** The bundle a dev server builds for the page on request (`.../entry.bundle?platform=web&dev=true...`); null on an export. */
  bundle: string | null;
  /** The project a dev server serves, as its `/status` names it; null on an export, or when it names none. */
  projectRoot: string | null;
  sourceFingerprint: string | null;
  candidateRevision: string | null;
  sourceDirty: string | null;
  packageVersion: string | null;
  inputMode: string | null;
}

/**
 * Tell a live dev server from a static export by how the page gets its code: Metro serves
 * the page a bundle it builds on request (a `.bundle` URL), an export the hashed files it
 * wrote. A dev server's project root is read off its `/status` answer, and only when that is
 * Metro's own.
 */
export function classifyServed(scripts: string[], status: PackagerStatus | null): Pick<ServedIdentity, "mode" | "bundle" | "projectRoot"> {
  const bundle = scripts.find((src) => /\.bundle(?:[?#]|$)/.test(src)) ?? null;
  if (!bundle) return { mode: SERVED_MODES.export, bundle: null, projectRoot: null };
  const projectRoot = status !== null && status.body.trim() === PACKAGER_RUNNING ? status.projectRoot?.trim() || null : null;
  return { mode: SERVED_MODES.dev, bundle, projectRoot };
}

/** This checkout, as the served bundle is compared with it. */
export interface CheckoutIdentity {
  /** `sourceFingerprint()` of docs/scripts/build-info.cjs, over this checkout now. */
  fingerprint: string;
  /** This checkout's docs app directory (the project a dev server for it serves), with symlinks resolved. */
  docsRoot: string;
}

export interface Freshness {
  fresh: boolean;
  /** What was compared: an export's source fingerprint, or a dev server's project root. */
  by: "source fingerprint" | "project root";
  /** Why it is stale, as the refusal says it. */
  reason?: string;
}

/**
 * Whether the served bundle shows this checkout's source as it is now.
 *
 * A static export: the fingerprint /testing/diagnostics reports against
 * `sourceFingerprint()` of docs/scripts/build-info.cjs (a hash of src, styles, docs/src, the
 * smoke fixtures and the package and docs configs). The revision is not compared: an export
 * built from a dirty tree is fresh exactly when its source is what is checked out.
 *
 * A live dev server: it shows its project's source as it is on disk, so the question is
 * whose source that is. It is fresh when the project root its `/status` names (resolved by
 * the caller) is this checkout's docs app, whatever fingerprint it reports.
 */
export function freshness(served: Pick<ServedIdentity, "url" | "mode" | "sourceFingerprint" | "projectRoot">, checkout: CheckoutIdentity): Freshness {
  if (served.mode === SERVED_MODES.dev) {
    const by = "project root";
    if (!served.projectRoot) {
      return {
        fresh: false,
        by,
        reason: `${served.url} is a live dev server that names no project root (Metro's /status answers with an X-React-Native-Project-Root header), so whose source it serves cannot be told: point --base at this checkout's docs dev server, or pass --allow-stale to capture it anyway`,
      };
    }
    if (served.projectRoot !== checkout.docsRoot) {
      return {
        fresh: false,
        by,
        reason: `${served.url} is a live dev server for ${served.projectRoot}, not this checkout's docs app (${checkout.docsRoot}), so it shows another checkout's source: start the docs dev server in this checkout and point --base at it, or pass --allow-stale to capture it anyway`,
      };
    }
    return { fresh: true, by };
  }
  const by = "source fingerprint";
  const fingerprint = served.sourceFingerprint;
  if (!fingerprint || !/^[a-f0-9]{64}$/.test(fingerprint)) {
    return { fresh: false, by, reason: `${served.url} reports no source fingerprint (${fingerprint ?? "nothing"}), so what it serves cannot be matched to this checkout` };
  }
  if (fingerprint !== checkout.fingerprint) {
    return {
      fresh: false,
      by,
      reason: `${served.url} serves an export built from source ${fingerprint.slice(0, 12)}, but this checkout's source is ${checkout.fingerprint.slice(0, 12)}: rebuild it (cd docs && bun run build:web), point --base at a server built from this checkout, or pass --allow-stale to capture it anyway`,
    };
  }
  return { fresh: true, by };
}

/** What the capture's global setup records about the served bundle, for the runner's manifest. */
export interface ServedRecord extends ServedIdentity, Freshness {
  checkout: CheckoutIdentity;
  allowStale: boolean;
}

/** One line on what was captured: the kind of server, whose source it shows, and the verdict. */
export function describeServed(served: ServedRecord): string {
  const verdict = served.fresh ? "this checkout" : served.allowStale ? "NOT this checkout, captured with --allow-stale" : "NOT this checkout";
  if (served.mode === SERVED_MODES.dev) {
    return `${served.url}: ${served.mode} for ${served.projectRoot ?? "a project it does not name"} (${verdict}; it builds from the source on disk, so its fingerprint is not compared)`;
  }
  return `${served.url}: ${served.mode} of source ${served.sourceFingerprint?.slice(0, 12) ?? "unknown"} (${verdict})`;
}

/** The settings a capture runs with, as its run's manifest records them. */
export interface CaptureSettings {
  browser: string;
  deviceScaleFactor: number;
  reducedMotion: string;
  /** The instant the page clock is pinned to (e2e/support/docs.ts FIXED_TIME), ISO. */
  fixedTime: string;
  launchArgs: string[];
}

/** The part of a Playwright `use` block the capture settings come from. */
interface CaptureUse {
  browserName?: string;
  deviceScaleFactor?: number;
  contextOptions?: { reducedMotion?: string | null };
  launchOptions?: { args?: string[] };
}

/**
 * The capture settings of the audit's Playwright configuration, read off the configuration
 * itself (its one project's `use` over its own, as Playwright merges them) and the clock the
 * cells pin, so the manifest says what the capture ran with and cannot drift from it. A
 * setting the configuration leaves to Playwright's default throws rather than being guessed.
 */
export function captureSettings(config: { use?: CaptureUse; projects?: { use?: CaptureUse }[] }, fixedTime: Date): CaptureSettings {
  const projects = config.projects ?? [];
  if (projects.length !== 1) throw new Error(`the audit configuration has ${projects.length} projects, where the capture runs exactly one`);
  const use: CaptureUse = { ...config.use, ...projects[0]!.use };
  const { browserName, deviceScaleFactor } = use;
  const reducedMotion = use.contextOptions?.reducedMotion;
  const unset = [
    browserName === undefined && "browserName",
    deviceScaleFactor === undefined && "deviceScaleFactor",
    (reducedMotion === undefined || reducedMotion === null) && "contextOptions.reducedMotion",
  ].filter((name): name is string => typeof name === "string");
  if (unset.length) throw new Error(`the audit configuration does not set ${unset.join(", ")}`);
  return {
    browser: browserName!,
    deviceScaleFactor: deviceScaleFactor!,
    reducedMotion: reducedMotion!,
    fixedTime: fixedTime.toISOString(),
    launchArgs: use.launchOptions?.args ?? [],
  };
}

/** `bun run audit:web`'s flags, and the environment variable each one sets. */
export const FLAG_ENV: Record<string, string> = {
  only: AUDIT_ENV.only,
  variants: AUDIT_ENV.variants,
  looks: AUDIT_ENV.looks,
  surfaces: AUDIT_ENV.surfaces,
  widths: AUDIT_ENV.widths,
  axe: AUDIT_ENV.axe,
  workers: AUDIT_ENV.workers,
  base: "E2E_BASE_URL",
};

export interface RunArgs {
  env: Record<string, string>;
  allowStale: boolean;
  help: boolean;
  errors: string[];
}

/**
 * Map the command line onto the environment. Takes `--name=value` and `--name value`;
 * `--allow-stale`, `--pages` and `--help` take none, and `--states` takes one only after
 * an `=` (`--states` is every state, `--states=hover,open` those two). An unknown flag, a
 * missing value, a worker count that is not a positive integer or a base that is not an
 * http(s) URL is an error.
 */
export function parseRunArgs(argv: string[]): RunArgs {
  const result: RunArgs = { env: {}, allowStale: false, help: false, errors: [] };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    if (arg === "--") continue;
    const match = /^--([a-z-]+)(?:=(.*))?$/.exec(arg);
    if (!match) {
      result.errors.push(`unexpected argument "${arg}"`);
      continue;
    }
    const name = match[1]!;
    if (name === "allow-stale" || name === "help" || name === "pages") {
      if (match[2] !== undefined) result.errors.push(`--${name} takes no value`);
      if (name === "allow-stale") result.allowStale = true;
      else if (name === "pages") result.env[AUDIT_ENV.pages] = "1";
      else result.help = true;
      continue;
    }
    if (name === "states") {
      const value = match[2]?.trim();
      if (value === "") result.errors.push("--states= needs a state, or drop the = for every state");
      else result.env[AUDIT_ENV.states] = value ?? "all";
      continue;
    }
    const variable = FLAG_ENV[name];
    if (!variable) {
      result.errors.push(`unknown flag --${name}`);
      continue;
    }
    let value = match[2];
    if (value === undefined) {
      const next = argv[i + 1];
      if (next === undefined || next.startsWith("--")) {
        result.errors.push(`--${name} needs a value`);
        continue;
      }
      value = next;
      i += 1;
    }
    if (name === "workers" && !/^[1-9]\d*$/.test(value)) result.errors.push(`--workers must be a positive integer, not "${value}"`);
    if (name === "base" && !/^https?:\/\/[^\s/]+/.test(value)) result.errors.push(`--base must be an http(s) URL, not "${value}"`);
    result.env[variable] = name === "base" ? value.replace(/\/+$/, "") : value;
  }
  if (result.allowStale) result.env[AUDIT_ENV.allowStale] = "1";
  return result;
}

/** The worker count the audit configuration runs with. */
export function workersFrom(env: Env): number {
  const value = env[AUDIT_ENV.workers];
  if (value === undefined || value === "") return DEFAULT_WORKERS;
  if (!/^[1-9]\d*$/.test(value)) throw new Error(`${AUDIT_ENV.workers} must be a positive integer, not "${value}"`);
  return Number(value);
}
