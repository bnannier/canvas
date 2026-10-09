// The comparison behind the hand-off parity check: the kit's public prop surface (read from
// the built declarations in dist/) against the design hand-off's committed snapshot
// (`handoff-props.json`), with every difference looked up in `divergences.json`. One module,
// so the two readers of that comparison cannot disagree: scripts/check-handoff-parity.ts,
// which turns it into HANDOFF-PARITY.md and the CI verdict, and the audit's facts
// (tools/audit/facts.ts), which list each component's open gaps and settled divergences.
//
// No side effects on import: nothing is read until a function is called.

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

export type Kind = "renamed" | "boolean-axis" | "web-only" | "intentional-omission" | "open-gap";

export interface Divergence {
  kind: Kind;
  /** The canvas prop (or props) that carry the capability instead. */
  to?: string | string[];
  /** For an open gap: the phase that closes it, or "unscheduled". */
  plannedIn?: string;
  reason: string;
}

export interface MetricGapRecord {
  component: string;
  canvas: string;
  handoff: string;
  plannedIn?: string;
  reason: string;
}

/** `tools/handoff-parity/divergences.json`. */
export interface Divergences {
  global: Record<string, Divergence>;
  components: Record<string, Record<string, Divergence>>;
  absentComponents: Record<string, Divergence>;
  /**
   * Differences in VALUE rather than in the prop surface: the same prop exists on both sides but
   * resolves to different metrics. The comparison cannot detect them (comparing names says nothing
   * about what a name resolves to), so they are recorded by hand from measurement and reported to
   * keep the blind spot visible rather than implied.
   */
  metricGaps: Record<string, MetricGapRecord>;
}

/** `tools/handoff-parity/handoff-props.json`. */
export interface Snapshot {
  components: Record<string, { tier: string; props: Record<string, { type: string; doc?: string }> }>;
}

export const KIND_LABEL: Record<Kind, string> = {
  renamed: "Renamed",
  "boolean-axis": "Boolean axis",
  "web-only": "Web-only",
  "intentional-omission": "Not offered",
  "open-gap": "Open gap",
};

/** An open gap is acknowledged, not settled: it counts as classified but is reported separately. */
export const isGap = (d: Divergence): boolean => d.kind === "open-gap";

export const SNAPSHOT_PATH = join("tools", "handoff-parity", "handoff-props.json");
export const DIVERGENCES_PATH = join("tools", "handoff-parity", "divergences.json");

export function readSnapshot(root: string): Snapshot {
  return JSON.parse(readFileSync(join(root, SNAPSHOT_PATH), "utf-8")) as Snapshot;
}

export function readDivergences(root: string): Divergences {
  return JSON.parse(readFileSync(join(root, DIVERGENCES_PATH), "utf-8")) as Divergences;
}

/** Raised when dist/ has not been built, so the kit's prop surface cannot be read. */
export class MissingDistError extends Error {
  constructor(dist: string) {
    super(`${dist} not found. Run \`bun run build\` first (CI and the pre-push hook build before every reader of it).`);
    this.name = "MissingDistError";
  }
}

// ---------- canvas side: read the built type surface, resolving `extends` ----------

/** Every `.d.ts` under dist/, concatenated in directory order. */
export function distSources(dist: string): string {
  if (!existsSync(dist)) throw new MissingDistError(dist);
  let out = "";
  const walk = (dir: string): void => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith(".d.ts")) out += `${readFileSync(p, "utf-8")}\n`;
    }
  };
  walk(dist);
  return out;
}

function interfaceAt(src: string, name: string): { heritage: string; body: string } | null {
  const open = new RegExp(`interface\\s+${name}\\b([^{]*)\\{`, "g").exec(src);
  if (!open) return null;
  let depth = 1;
  let i = open.index + open[0].length;
  const start = i;
  for (; i < src.length && depth > 0; i++) {
    if (src[i] === "{") depth++;
    else if (src[i] === "}") depth--;
  }
  return { heritage: open[1] ?? "", body: src.slice(start, i - 1) };
}

function ownMembers(body: string): Set<string> {
  const out = new Set<string>();
  let depth = 0;
  for (const raw of body.split("\n")) {
    const line = raw.trim();
    if (depth === 0 && !line.startsWith("*") && !line.startsWith("//")) {
      const m = line.match(/^["']?([a-zA-Z_][\w-]*)["']?\??\s*:/);
      if (m) out.add(m[1]);
    }
    depth += (line.match(/\{/g) ?? []).length - (line.match(/\}/g) ?? []).length;
    if (depth < 0) depth = 0;
  }
  return out;
}

/**
 * A `type X = Pick<Y, "a" | "b">` alias, read as the set of names it picks. The picked names are
 * string literals, so the base type never has to be resolved. Needed because the field family
 * inherits its behavior slice this way (`TextEntryProps = Pick<RNTextInputProps, "defaultValue" |
 * ...>`), and without it every prop in that slice reads as missing: `Input.defaultValue` and
 * `Textarea.defaultValue` both reported as divergences while being present all along.
 */
function pickedMembers(src: string, name: string): Set<string> | null {
  const m = new RegExp(`type\\s+${name}\\s*=\\s*Pick<[^,]+,([^>]+)>`).exec(src);
  if (!m) return null;
  const names = [...m[1].matchAll(/["']([^"']+)["']/g)].map((x) => x[1]);
  return names.length ? new Set(names) : null;
}

/**
 * Every prop an interface exposes, including inherited ones. Resolving `extends` is essential and
 * not optional: `AreaChartProps extends CartesianSeriesProps`, so an own-members-only read reports
 * every inherited prop as missing and the whole report becomes noise.
 */
export function allMembers(src: string, name: string, seen = new Set<string>()): Set<string> | null {
  if (seen.has(name)) return new Set();
  seen.add(name);
  const found = interfaceAt(src, name);
  if (!found) return pickedMembers(src, name);
  const props = ownMembers(found.body);
  const ext = found.heritage.match(/extends\s+([^{]+)/);
  if (ext) {
    for (const raw of ext[1].split(",")) {
      const base = raw.trim().replace(/<.*/, "").split(".").pop();
      if (!base) continue;
      const inherited = allMembers(src, base, seen);
      if (inherited) for (const p of inherited) props.add(p);
    }
  }
  return props;
}

// ---------- compare ----------

export interface Row {
  component: string;
  tier: string;
  prop: string;
  type: string;
  doc?: string;
  divergence?: Divergence;
}

export interface MissingComponent {
  name: string;
  tier: string;
  props: number;
  divergence?: Divergence;
}

/** A redirect target that means "no Canvas equivalent" rather than naming a prop. */
const NO_TARGET = String.fromCharCode(0x2014);

/** The Canvas props or components a record redirects to; empty when it names none. */
export function redirectTargets(d: Divergence): string[] {
  return Array.isArray(d.to) ? d.to : d.to ? [d.to] : [];
}

/**
 * A `renamed` / `boolean-axis` record is a CLAIM: "the kit carries this capability, under this
 * name". Nothing used to test the claim, because the check only ever looks up the HAND-OFF's name
 * and, on missing it, believes whatever the record says. So a record could point at a prop that
 * does not exist and the difference still counted as settled: `Gauge.size` claimed `small`/`large`
 * on a component with no size axis at all, and writing docs against that claim produced three
 * "sizes" that rendered identically. Every redirect target is verified here instead.
 *
 * A target that names a COMPONENT rather than a prop is legitimate (`LineChart.area` redirects to
 * the AreaChart component, `StackedBar.grouped` to Chart), so a PascalCase target is accepted when
 * the kit really exports a props interface under that name.
 */
function brokenRedirect(dist: string, canvas: Set<string>, component: string, prop: string, d: Divergence): string | null {
  if (d.kind !== "renamed" && d.kind !== "boolean-axis") return null;
  const targets = redirectTargets(d).filter((t) => t && t !== NO_TARGET);
  if (!targets.length) return null;
  const resolves = (t: string) => canvas.has(t) || (/^[A-Z]/.test(t) && allMembers(dist, `${t}Props`) !== null);
  if (targets.some(resolves)) return null;
  return `${component}.${prop} (${d.kind}) redirects to ${targets.map((t) => `\`${t}\``).join(", ")}, which ${targets.length > 1 ? "do" : "does"} not exist on ${component}Props`;
}

export interface Comparison {
  missingComponents: MissingComponent[];
  /** Hand-off props the kit lacks under that name, with the record that adjudicates each, in snapshot order. */
  classified: Row[];
  /** Hand-off props the kit lacks with no record at all. */
  unclassified: Row[];
  brokenRedirects: string[];
  /**
   * Records the check can never read: the same guarantee as `brokenRedirect`, from the other end.
   * That one catches a settled record pointing at a prop the kit LACKS; this one catches a record
   * about a prop the kit HAS. A divergence is consulted only when the hand-off prop is absent, so
   * the day a component ships that prop under the hand-off's own name its record stops being
   * adjudication and becomes an unread claim nothing tests. Every one found so far was false by
   * then: `Tooltip.children` asserted Canvas's Tooltip "cannot attach to a caller's node" while the
   * element trigger shipped, `ActionPanel.children` sent the reader to `description` past the
   * component's own children slot, and `Navbar.actions` denied a ReactNode slot the bar takes.
   * Deleting them one sweep at a time is what this replaces.
   *
   * Scoped to claims about the KIT, deliberately. A `global` record is the fallback for any
   * component prop no component-level record claims, so it is legitimately unread whenever every
   * such prop happens to be adjudicated per component: unread is its resting state. A record under
   * a component the kit has not shipped is skipped as well (the component is reported absent as a
   * whole, and the record goes live the day it lands), and a record whose hand-off prop is gone is
   * a claim about the SNAPSHOT rather than the kit, which the extract tool owns.
   */
  deadRecords: string[];
  satisfied: number;
  handoffProps: number;
}

/** The kit's prop surface (`dist`, from `distSources`) against the snapshot, through the records. */
export function compareParity(snapshot: Snapshot, divergences: Divergences, dist: string): Comparison {
  const out: Comparison = { missingComponents: [], classified: [], unclassified: [], brokenRedirects: [], deadRecords: [], satisfied: 0, handoffProps: 0 };
  for (const [name, comp] of Object.entries(snapshot.components)) {
    const canvas = allMembers(dist, `${name}Props`);
    if (!canvas) {
      out.missingComponents.push({ name, tier: comp.tier, props: Object.keys(comp.props).length, divergence: divergences.absentComponents[name] });
      continue;
    }
    for (const [prop, meta] of Object.entries(comp.props)) {
      out.handoffProps++;
      if (canvas.has(prop)) {
        out.satisfied++;
        const dead = divergences.components[name]?.[prop];
        if (dead) {
          out.deadRecords.push(
            `${name}.${prop} (${dead.kind}) is recorded in divergences.json, but ${name}Props declares \`${prop}\` itself, so the record is never read`,
          );
        }
        continue;
      }
      const d = divergences.components[name]?.[prop] ?? divergences.global[prop];
      const row: Row = { component: name, tier: comp.tier, prop, type: meta.type, doc: meta.doc, divergence: d };
      if (d) {
        out.classified.push(row);
        const bad = brokenRedirect(dist, canvas, name, prop, d);
        if (bad) out.brokenRedirects.push(bad);
      } else out.unclassified.push(row);
    }
  }
  // An absent-component record outlives its purpose the same way: once the kit exports the
  // component, the record is no longer why it is missing, it is a claim that it still is.
  for (const name of Object.keys(divergences.absentComponents)) {
    if (allMembers(dist, `${name}Props`)) {
      out.deadRecords.push(
        `absentComponents.${name} (${divergences.absentComponents[name]!.kind}) is recorded in divergences.json, but the kit exports ${name}Props, so the record is never read`,
      );
    }
  }
  return out;
}

/** The comparison of a checkout: its snapshot, its records and its built dist/. */
export function compareCheckout(root: string): { snapshot: Snapshot; divergences: Divergences; comparison: Comparison } {
  const snapshot = readSnapshot(root);
  const divergences = readDivergences(root);
  return { snapshot, divergences, comparison: compareParity(snapshot, divergences, distSources(join(root, "dist"))) };
}
