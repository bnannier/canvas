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
 * Every prop an interface exposes, including inherited ones. Resolving `extends` is essential and
 * not optional: `AreaChartProps extends CartesianSeriesProps`, so an own-members-only read reports
 * every inherited prop as missing and the whole report becomes noise.
 */
function allMembers(src: string, name: string, seen = new Set<string>()): Set<string> | null {
  if (seen.has(name)) return new Set();
  seen.add(name);
  const found = interfaceAt(src, name);
  if (!found) return null;
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

const missingComponents: { name: string; tier: string; props: number; divergence?: Divergence }[] = [];
const classified: Row[] = [];
const unclassified: Row[] = [];
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
      continue;
    }
    const d = divergences.components[name]?.[prop] ?? divergences.global[prop];
    const row: Row = { component: name, tier: comp.tier, prop, type: meta.type, doc: meta.doc, divergence: d };
    if (d) classified.push(row);
    else unclassified.push(row);
  }
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
  "fails only on a difference recorded in neither place, so a hand-off revision surfaces loudly.",
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

const failures = unclassified.length + absentUntracked.length + (reportStale ? 1 : 0);
if (failures) {
  console.log("");
  for (const c of absentUntracked) console.log(`  UNRECORDED COMPONENT  ${c.name} (${c.tier})`);
  for (const r of unclassified) console.log(`  UNCLASSIFIED PROP     ${r.component}.${r.prop}: ${r.type}`);
  if (reportStale) console.log(`  STALE REPORT          ${REPORT} is out of date; run \`bun run check-parity\`.`);
  console.log("");
  if (unclassified.length || absentUntracked.length)
    console.log("Close the gap in the kit, or record it in tools/handoff-parity/divergences.json.");
  process.exit(1);
}
console.log("Hand-off parity check passed.");
