// Checks the kit's public prop surface against the design hand-off's, and regenerates
// HANDOFF-PARITY.md.
//
// Why this exists: validate-tokens guards the TOKEN layer by value, but nothing guarded the
// COMPONENT layer, so a capability the hand-off specifies could go missing (or a hand-off revision
// could add one) with no signal at all. That is how `Field`, `DashboardGrid` and `ChartFrame` went
// unnoticed as absent.
//
// What it does NOT do: demand identical prop NAMES. Canvas is a React Native kit whose CLAUDE.md
// bans the string-enum props the hand-off uses freely (`size="lg"` is rejected in favour of
// `large`), and RN has no `onClick`. Those differences are intentional and are recorded, with a
// reason, in tools/handoff-parity/divergences.json. The build fails only on an UNCLASSIFIED
// difference — a real gap, or a hand-off prop nobody has adjudicated yet.

import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const ROOT = join(import.meta.dir, "..");
const DIST = join(ROOT, "dist");
const SNAPSHOT = join(ROOT, "tools", "handoff-parity", "handoff-props.json");
const DIVERGENCES = join(ROOT, "tools", "handoff-parity", "divergences.json");
const REPORT = join(ROOT, "HANDOFF-PARITY.md");

type Kind = "renamed" | "boolean-axis" | "web-only" | "intentional-omission" | "open-gap";
interface Divergence {
  kind: Kind;
  /** The canvas prop (or props) that carry the capability instead. */
  to?: string | string[];
  /** For an open gap: the phase that closes it, or "unscheduled". */
  plannedIn?: string;
  reason: string;
}

const KIND_LABEL: Record<Kind, string> = {
  renamed: "Renamed",
  "boolean-axis": "Boolean axis",
  "web-only": "Web-only",
  "intentional-omission": "Not offered",
  "open-gap": "Open gap",
};

/** An open gap is acknowledged, not settled: it counts as classified but is reported separately. */
const isGap = (d: Divergence): boolean => d.kind === "open-gap";

// ---------- canvas side: read the built type surface, resolving `extends` ----------

async function distSources(): Promise<string> {
  let out = "";
  const walk = async (dir: string): Promise<void> => {
    for (const e of await readdir(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) await walk(p);
      else if (e.name.endsWith(".d.ts")) out += `${await readFile(p, "utf-8")}\n`;
    }
  };
  await walk(DIST);
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
 * …>`), and without it every prop in that slice reads as missing: `Input.defaultValue` and
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
function allMembers(src: string, name: string, seen = new Set<string>()): Set<string> | null {
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

const snapshot = JSON.parse(await readFile(SNAPSHOT, "utf-8")) as {
  components: Record<string, { tier: string; props: Record<string, { type: string; doc?: string }> }>;
};
const divergences = JSON.parse(await readFile(DIVERGENCES, "utf-8")) as {
  global: Record<string, Divergence>;
  components: Record<string, Record<string, Divergence>>;
  absentComponents: Record<string, Divergence>;
  /**
   * Differences in VALUE rather than in the prop surface: the same prop exists on both sides but
   * resolves to different metrics. This check cannot detect them — comparing names says nothing
   * about what a name resolves to — so they are recorded by hand from measurement and reported
   * here to keep the blind spot visible rather than implied.
   */
  metricGaps: Record<string, { component: string; canvas: string; handoff: string; plannedIn?: string; reason: string }>;
};

let dist: string;
try {
  dist = await distSources();
} catch {
  console.error("dist/ not found. Run `bun run build` first (CI builds before this check).");
  process.exit(1);
}

interface Row {
  component: string;
  tier: string;
  prop: string;
  type: string;
  doc?: string;
  divergence?: Divergence;
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
function brokenRedirect(
  canvas: Set<string>,
  component: string,
  prop: string,
  d: Divergence,
): string | null {
  if (d.kind !== "renamed" && d.kind !== "boolean-axis") return null;
  const targets = (Array.isArray(d.to) ? d.to : d.to ? [d.to] : []).filter((t) => t && t !== "—");
  if (!targets.length) return null;
  const resolves = (t: string) =>
    canvas.has(t) || (/^[A-Z]/.test(t) && allMembers(dist, `${t}Props`) !== null);
  if (targets.some(resolves)) return null;
  return `${component}.${prop} (${d.kind}) redirects to ${targets.map((t) => `\`${t}\``).join(", ")}, which ${targets.length > 1 ? "do" : "does"} not exist on ${component}Props`;
}

const missingComponents: { name: string; tier: string; props: number; divergence?: Divergence }[] = [];
const classified: Row[] = [];
const unclassified: Row[] = [];
const brokenRedirects: string[] = [];
/**
 * Records this check can never read: the same guarantee as `brokenRedirect`, from the other end.
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
const deadRecords: string[] = [];
let satisfied = 0;
let handoffProps = 0;

for (const [name, comp] of Object.entries(snapshot.components)) {
  const canvas = allMembers(dist, `${name}Props`);
  if (!canvas) {
    missingComponents.push({
      name,
      tier: comp.tier,
      props: Object.keys(comp.props).length,
      divergence: divergences.absentComponents[name],
    });
    continue;
  }
  for (const [prop, meta] of Object.entries(comp.props)) {
    handoffProps++;
    if (canvas.has(prop)) {
      satisfied++;
      const dead = divergences.components[name]?.[prop];
      if (dead)
        deadRecords.push(
          `${name}.${prop} (${dead.kind}) is recorded in divergences.json, but ${name}Props declares \`${prop}\` itself, so the record is never read`,
        );
      continue;
    }
    const d = divergences.components[name]?.[prop] ?? divergences.global[prop];
    const row: Row = { component: name, tier: comp.tier, prop, type: meta.type, doc: meta.doc, divergence: d };
    if (d) {
      classified.push(row);
      const bad = brokenRedirect(canvas, name, prop, d);
      if (bad) brokenRedirects.push(bad);
    } else unclassified.push(row);
  }
}

// An absent-component record outlives its purpose the same way: once the kit exports the
// component, the record is no longer why it is missing, it is a claim that it still is.
for (const name of Object.keys(divergences.absentComponents)) {
  if (allMembers(dist, `${name}Props`))
    deadRecords.push(
      `absentComponents.${name} (${divergences.absentComponents[name]!.kind}) is recorded in divergences.json, but the kit exports ${name}Props, so the record is never read`,
    );
}

// ---------- report ----------

const settled = classified.filter((r) => !isGap(r.divergence!));
const openGaps = classified.filter((r) => isGap(r.divergence!));
const absentTracked = missingComponents.filter((c) => c.divergence);
const absentUntracked = missingComponents.filter((c) => !c.divergence);

const byComponent = (rows: Row[]): Map<string, Row[]> => {
  const m = new Map<string, Row[]>();
  for (const r of rows) {
    const list = m.get(r.component);
    if (list) list.push(r);
    else m.set(r.component, [r]);
  }
  return m;
};

const esc = (t: string): string => t.replace(/\|/g, "\\|");

const lines: string[] = [];
lines.push("# Hand-off parity");
lines.push("");
lines.push("<!-- Generated by scripts/check-handoff-parity.ts. Do not edit by hand: run `bun run check-parity`. -->");
lines.push("");
lines.push(
  "How this kit's public prop surface compares to the design hand-off's. Parity here means the same",
  "CAPABILITY, not the same prop name. Canvas is a React Native kit whose semantic-boolean prop rule",
  "rejects the string-enum props the hand-off uses freely (`size=\"lg\"` is spelled `large`), and React",
  "Native has no `onClick`. A difference is only a defect when it is a capability the kit cannot",
  "express.",
);
lines.push("");
lines.push(
  "Every difference is adjudicated in `tools/handoff-parity/divergences.json`. **Settled** ones are",
  "closed questions. **Open gaps** are real missing capabilities, acknowledged and tracked. The check",
  "fails on a difference recorded in neither place, so a hand-off revision surfaces loudly, and on a",
  "**broken redirect**: a settled record naming a Canvas prop that does not exist. That guard was",
  "added after three records (`Gauge.size`, `PieChart.size`, `Drawer.size`) were found pointing at",
  "`small`/`large` props their components had never had, which read as settled parity and sent",
  "documentation examples chasing props that silently do nothing.",
);
lines.push("");
lines.push(
  "It also fails on a **dead record**: one for a prop the kit now declares under the hand-off's own",
  "name, or for a component the kit now exports. A record is consulted only while the hand-off prop",
  "is ABSENT here, so shipping the capability makes its record unreadable, and every dead one found",
  "so far had gone false as well (`Tooltip.children` still said the Tooltip could not attach to a",
  "caller's node; `ActionPanel.children` and `Navbar.actions` denied slots their components had",
  "gained the day before). Those went unnoticed because closing a gap regenerates this report and",
  "the row simply disappears, leaving the record behind with nothing pointing at it.",
);
lines.push("");
lines.push(
  "**What this check cannot see.** It compares the prop SURFACE, not what a prop resolves to. Where",
  "a name exists on both sides it is counted satisfied even if the two render different metrics, so",
  "a scale or spacing drift passes silently. Those are recorded under Metric gaps below, from",
  "measurement rather than from this check. Redirect TARGETS are verified, so a settled record",
  "cannot name a prop that is absent, but nothing checks that the target is the RIGHT prop. It also",
  "compares against a committed snapshot of the",
  "hand-off, so it cannot tell you the snapshot itself has fallen behind the design source; refresh",
  "it with `tools/handoff-parity/extract.ts --from <export>`.",
);
lines.push("");
lines.push("## Summary");
lines.push("");
lines.push("| | |");
lines.push("|---|---|");
lines.push(`| Hand-off components | ${Object.keys(snapshot.components).length} |`);
lines.push(`| Present in the kit | ${Object.keys(snapshot.components).length - missingComponents.length} |`);
lines.push(`| Absent (tracked) | ${absentTracked.length} |`);
lines.push(`| Hand-off props compared | ${handoffProps} |`);
lines.push(`| Same name, present | ${satisfied} |`);
lines.push(`| Settled divergences | ${settled.length} |`);
lines.push(`| Open gaps (tracked) | ${openGaps.length} |`);
lines.push(`| Metric gaps (not detectable here) | ${Object.keys(divergences.metricGaps ?? {}).length} |`);
lines.push(`| **Unclassified** | **${unclassified.length + absentUntracked.length}** |`);
lines.push("");

if (missingComponents.length) {
  lines.push("## Components absent from the kit");
  lines.push("");
  lines.push("| Component | Tier | Hand-off props | Planned | Why it is missing |");
  lines.push("|---|---|---|---|---|");
  for (const c of missingComponents)
    lines.push(
      `| \`${c.name}\` | ${c.tier} | ${c.props} | ${c.divergence?.plannedIn ?? "**unrecorded**"} | ${c.divergence?.reason ?? "—"} |`,
    );
  lines.push("");
}

if (unclassified.length) {
  lines.push("## Unclassified differences");
  lines.push("");
  lines.push("Each is either a real capability gap or a difference nobody has adjudicated yet.");
  lines.push("Close it in the kit, or record it in `divergences.json` with the reason.");
  lines.push("");
  for (const [component, rows] of byComponent(unclassified)) {
    lines.push(`### \`${component}\``);
    lines.push("");
    lines.push("| Prop | Type | What it does in the hand-off |");
    lines.push("|---|---|---|");
    for (const r of rows) lines.push(`| \`${r.prop}\` | \`${esc(r.type)}\` | ${r.doc ?? "—"} |`);
    lines.push("");
  }
}

if (openGaps.length) {
  lines.push("## Open gaps");
  lines.push("");
  lines.push("Capabilities the hand-off specifies that the kit does not offer. Acknowledged, not settled.");
  lines.push("");
  lines.push("| Component | Prop | Planned | What it does in the hand-off |");
  lines.push("|---|---|---|---|");
  for (const r of openGaps)
    lines.push(`| \`${r.component}\` | \`${r.prop}\` | ${r.divergence!.plannedIn ?? "unscheduled"} | ${r.divergence!.reason} |`);
  lines.push("");
}

const metricGaps = Object.values(divergences.metricGaps ?? {});
if (metricGaps.length) {
  lines.push("## Metric gaps");
  lines.push("");
  lines.push(
    "Differences this check CANNOT see. It compares the prop surface, so when a prop exists on both",
    "sides it is reported as satisfied no matter what value it resolves to. These were found by",
    "measuring the rendered result and are recorded by hand.",
  );
  lines.push("");
  lines.push(
    "To find one: render the component's three-up in the docs, read the rendered element's own",
    "computed metrics rather than the source, and compare against a component you believe is",
    "correct as a control. A control matters more than it sounds \u2014 an AvatarMenu whose three rows",
    "all reported the web numbers only looked wrong beside a Dropdown whose three rows differed.",
    "Interactive state has to be driven first: a closed menu measures nothing.",
  );
  lines.push("");
  lines.push("| Component | Canvas | Hand-off | Planned | Why |");
  lines.push("|---|---|---|---|---|");
  for (const g of metricGaps)
    lines.push(`| \`${g.component}\` | ${g.canvas} | ${g.handoff} | ${g.plannedIn ?? "unscheduled"} | ${g.reason} |`);
  lines.push("");
}

if (settled.length) {
  lines.push("## Settled divergences");
  lines.push("");
  lines.push("Differences in spelling or shape where the kit carries the capability its own way.");
  lines.push("");
  lines.push("| Component | Hand-off prop | Kind | Canvas equivalent | Why |");
  lines.push("|---|---|---|---|---|");
  for (const r of settled) {
    const d = r.divergence!;
    const to = d.to ? (Array.isArray(d.to) ? d.to.map((t) => `\`${t}\``).join(", ") : `\`${d.to}\``) : "—";
    lines.push(`| \`${r.component}\` | \`${r.prop}\` | ${KIND_LABEL[d.kind]} | ${to} | ${d.reason} |`);
  }
  lines.push("");
}

const report = `${lines.join("\n")}\n`;

// --check regenerates nothing and instead asserts the committed report is current, the same
// contract docs:gen:check and raster:gen:check use. Without it a divergences.json edit could land
// with a stale HANDOFF-PARITY.md beside it and nothing would notice.
const checkOnly = process.argv.includes("--check");
let reportStale = false;
if (checkOnly) {
  let existing = "";
  try {
    existing = await readFile(REPORT, "utf-8");
  } catch {
    existing = "";
  }
  reportStale = existing !== report;
} else {
  await writeFile(REPORT, report);
}

// ---------- verdict ----------

console.log(
  `Hand-off parity: ${Object.keys(snapshot.components).length} components, ${handoffProps} props compared`,
);
console.log(`  present: ${satisfied}   settled divergences: ${settled.length}   open gaps: ${openGaps.length}`);
console.log(`  components absent from the kit: ${missingComponents.length} (${absentTracked.length} tracked)`);
console.log(checkOnly ? `Report checked: ${reportStale ? "STALE" : "current"}` : `Report written to ${REPORT}`);

const failures =
  unclassified.length + absentUntracked.length + brokenRedirects.length + deadRecords.length + (reportStale ? 1 : 0);
if (failures) {
  console.log("");
  for (const c of absentUntracked) console.log(`  UNRECORDED COMPONENT  ${c.name} (${c.tier})`);
  for (const r of unclassified) console.log(`  UNCLASSIFIED PROP     ${r.component}.${r.prop}: ${r.type}`);
  for (const b of brokenRedirects) console.log(`  BROKEN REDIRECT       ${b}`);
  for (const d of deadRecords) console.log(`  DEAD RECORD           ${d}`);
  if (reportStale) console.log(`  STALE REPORT          ${REPORT} is out of date; run \`bun run check-parity\`.`);
  console.log("");
  if (unclassified.length || absentUntracked.length)
    console.log("Close the gap in the kit, or record it in tools/handoff-parity/divergences.json.");
  if (brokenRedirects.length)
    console.log("A redirect names the prop that carries the capability in Canvas. Point it at a prop that exists, or reclassify the record as an open gap / intentional omission.");
  if (deadRecords.length)
    console.log("The kit closed that difference: delete the record from tools/handoff-parity/divergences.json, since nothing reads it and it still reads as adjudication.");
  process.exit(1);
}
console.log("Hand-off parity check passed.");
