// The per-component and per-page audit checklists under audit/: one markdown file per
// docs route, half generated and half hand-maintained.
//
// Generated, and rewritten on every `--write`: the facts block (tools/audit/facts.ts)
// and the variants table (one row per example variant from tools/audit/inventory.ts,
// with a tick cell per platform; a page's rows are the whole page and one per section,
// keyed by the section title's slug). Each sits between its own HTML-comment markers,
// and the variants table is MERGED by variant key, so a reviewer's ticks and notes
// survive a regeneration that adds, removes or relabels examples.
//
// A reviewer's ticks and notes are never discarded. A row is read with an escape-aware
// split (`\|` stays in its cell), and everything after the three tick cells is the note,
// so a "|" typed in a note is kept and escaped on the next write rather than taken for a
// column. A row that cannot be read (a tick cell that is not `[ ]` or `[x]`, a key that
// is not back-ticked, a key twice), or a row carrying ticks or a note whose key the
// inventory no longer has, makes `--write` refuse that file and name the line; the
// reviewer fixes it by hand and runs it again.
//
// Hand-maintained, and seeded ONCE on the file's first write from
// tools/audit/plan-specifics.ts: the universal rubric, the family checklists, the
// component's specific checks, the findings table and the sign-off table. After that
// `--write` never touches them: everything outside the two marker pairs is carried over
// byte for byte, so running `--write` twice changes nothing.
//
// Every table here is read with the one escape-aware reader in tools/audit/table.ts:
// the variants table, and the hand-maintained findings and sign-off tables that
// audit:status counts, so a "|" typed in a summary or an empty cell typed `| |` reads the
// same in all three, and a row that cannot be read is named by line, never dropped.
//
// `--check` (wired as audit:checklists:check, in CI and the pre-push hook) fails on a
// route with no checklist, an orphan checklist (a `.md` file no route calls for), a
// stale facts block, a malformed variants, findings or sign-off row (by line number;
// audit:status could not count it), a finding whose Cell is neither one of that
// checklist's capture ids in tools/audit/inventory.ts nor `source` (by line), variant
// rows that drift from the inventory, a variants table `--write` would rewrite, and a
// missing findings table or sign-off section.

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT } from "../../e2e/support/routes.ts";
import {
  TOUCH_TARGET_COVERAGE,
  TOUCH_TARGET_MODULES,
  TOUCH_TARGET_SKIN,
  componentFacts,
  loadCorpus,
  pageFacts,
  type ComponentFacts,
  type FactsCorpus,
  type PageFacts,
  type ReferenceCell,
  type SweepFact,
} from "./facts.ts";
import {
  NATIVE_CELLS_PER_VARIANT,
  PAGE_ROW_KEY,
  WEB_CELLS_PER_VARIANT,
  cellId,
  cellsFor,
  components,
  pageCellId,
  pageCellsFor,
  pages,
  sectionKeys,
  type InventoryComponent,
  type InventoryPage,
} from "./inventory.ts";
import { COMPONENT_PLANS, FAMILY_CHECKLISTS, FAMILY_LABEL, PAGE_PLAN, UNIVERSAL_RUBRIC, type Family } from "./plan-specifics.ts";
import { SEPARATOR_LINE, headerRow, readSectionTable, separatorRow, splitRow, type MalformedRow, type TableShape } from "./table.ts";

export type { MalformedRow } from "./table.ts";

export const FACTS_BEGIN = "<!-- audit:facts:begin -->";
export const FACTS_END = "<!-- audit:facts:end -->";
export const VARIANTS_BEGIN = "<!-- audit:variants:begin -->";
export const VARIANTS_END = "<!-- audit:variants:end -->";

export const COMPONENTS_DIR = "components";
export const PAGES_DIR = "pages";

/** The platforms a variant row carries a tick cell for, with the cells each tick stands for. */
export const TICK_COLUMNS = [
  { key: "web", heading: `Web (${WEB_CELLS_PER_VARIANT})` },
  { key: "ios", heading: `iOS (${NATIVE_CELLS_PER_VARIANT})` },
  { key: "android", heading: `Android (${NATIVE_CELLS_PER_VARIANT})` },
] as const;

export const SIGN_OFF_PLATFORMS = ["web", "ios", "android"] as const;

/** A variants row as the reader splits it; the label and the note are free text, and a "|" typed in the note stays in it. */
export const VARIANTS_SHAPE: TableShape = { name: "variants", columns: ["variant", "label", "web", "ios", "android", "notes"], minCells: 5, free: 5 };

/** The findings table: a "|" typed in a summary stays in it, and a finding with no fix commit yet may leave that cell off. */
export const FINDINGS_SHAPE: TableShape = { name: "findings", columns: ["ID", "Severity", "Cell", "Summary", "Status", "Fix commit"], minCells: 5, free: 3 };

/** The sign-off table: a "|" typed in a result stays in it, and the result may be left off. */
export const SIGN_OFF_SHAPE: TableShape = { name: "sign-off", columns: ["Platform", "Run id", "Reviewer", "Date", "Result"], minCells: 4, free: 4 };

export const FINDING_SEVERITIES = ["critical", "high", "medium", "low"] as const;
/** The Status vocabulary, exactly as audit/README.md spells it (tools/audit/checklists.test.ts holds the two together). */
export const FINDING_STATUSES = ["open", "verified", "fixed", "wontfix", "duplicate"] as const;

/** A Fix commit cell: a commit SHA, 7 to 40 hex digits, back-ticked or not. */
export const FIX_COMMIT = /^`?[0-9a-f]{7,40}`?$/i;

export interface ChecklistSources {
  components: InventoryComponent[];
  pages: InventoryPage[];
  corpus: FactsCorpus;
}

/** The real inventory and facts of this checkout. */
export function defaultSources(root = ROOT): ChecklistSources {
  return { components: components(), pages: pages(), corpus: loadCorpus(root) };
}

// ---------- rendering ----------

/** A value in a markdown table cell: one line, every unescaped pipe escaped (so re-rendering a cell is a no-op). */
const cell = (value: string): string => value.replace(/\s*\n\s*/g, " ").replace(/(?<!\\)\|/g, "\\|").trim();
const code = (value: string): string => `\`${value}\``;
const list = (values: string[], empty = "none"): string => (values.length ? values.map(code).join(", ") : empty);

function referenceCell(label: string, c: ReferenceCell): string {
  if (c.kind === "none") return `${label}: none (${c.text})`;
  if (c.kind === "link") return `${label}: link [${c.text}](${c.url})${c.note ? ` (${c.note})` : ""}`;
  return `${label}: ${c.text}`;
}

/** Who a package's own component belongs to, as a fact says it. */
const packageOwner = (specifier: string): string => (specifier === "react-native" ? "React Native" : code(specifier));

function implementationLine(facts: ComponentFacts): string {
  const impl = facts.implementation;
  const markdownOnly = `${code(`${facts.sourceDir}/`)} holds only its markdown`;
  switch (impl.kind) {
    case "directory":
      return `its own source directory, ${code(`${facts.sourceDir}/`)} (${impl.modules.length} TypeScript modules)`;
    case "module":
      return `declared in ${list(impl.modules)}${impl.reactNative ? `, which imports React Native's own ${code(impl.reactNative)}` : ""}; ${markdownOnly}`;
    case "package":
      return `${packageOwner(impl.specifier)}'s own ${code(impl.name)}, re-exported from ${code(impl.via)}; the kit has no source of its own for it, and ${markdownOnly}`;
    case "unresolved":
      return `not found: ${code(`${facts.sourceDir}/`)} has no entry module and \`src/index.ts\` does not export ${code(facts.exports[0])}`;
  }
}

function platformEntriesLine(facts: ComponentFacts): string {
  const impl = facts.implementation;
  if (impl.kind === "package") return `none in the kit: ${packageOwner(impl.specifier)}'s own ${code(impl.name)}, imported the same way on every platform`;
  if (impl.kind === "module") {
    return impl.platformBuilds
      ? `${list(impl.modules)} has platform builds of its own, which tools/skins/divergence.ts does not read outside the component directories`
      : `none (${list(impl.modules)} is one build on every platform)`;
  }
  return facts.skins.hasPlatformEntries ? `${skinLine("iOS", facts)}. ${skinLine("Android", facts)}` : "none (one build on every platform)";
}

/** What a source fact says when the component has no kit source to read. */
const NO_SOURCE = "not applicable: the kit has no source of its own for it";

function touchTargetLine(facts: ComponentFacts): string {
  if (!facts.implementation.modules.length) return NO_SOURCE;
  const { modules, coverage } = facts.touchTarget;
  const names = modules.length
    ? modules.map((t) => `${code(t.module)}: ${t.names.join(", ")}`).join("; ")
    : `no touch-target name (the exports of ${TOUCH_TARGET_MODULES.map((m) => code(m)).join(", ")}, the ${code(TOUCH_TARGET_SKIN)} fields, or \`hitSlop\`) in its implementation modules`;
  return coverage ? `${names}. ${code(TOUCH_TARGET_COVERAGE)} records it as ${coverage.list}: ${coverage.reason}` : names;
}

function sweepsLine(sweeps: SweepFact[]): string {
  return `${sweeps.length}: ${sweeps.length ? sweeps.map((s) => `${code(s.file)} (${s.catalogs.join(", ")})`).join(", ") : "none"}`;
}

function skinLine(platform: "iOS" | "Android", facts: ComponentFacts): string {
  const skin = facts.skins[platform];
  const names = Object.keys(skin.exports);
  if (!names.length) return `${platform}: re-exports the shared build (nothing built per platform)`;
  const web = names.filter((name) => skin.exports[name] === null);
  const own = names.filter((name) => skin.exports[name] !== null).map((name) => `${name} (${skin.exports[name]})`);
  const parts = [];
  if (web.length) parts.push(`web build: ${web.join(", ")}`);
  if (own.length) parts.push(`own build: ${own.join("; ")}`);
  return `${platform}: ${parts.join("; ")}`;
}

/** The lines of a component's facts block, between the markers. */
export function renderComponentFacts(facts: ComponentFacts): string[] {
  const rows: [string, string][] = [
    ["Route", code(facts.route)],
    ["Category", `${facts.category} (${code(`${facts.sourceDir}/`)})`],
    ["Markdown", code(facts.markdown)],
    ["Source files", list(facts.sourceFiles)],
    ["Implementation", implementationLine(facts)],
    ["Exports", facts.exports.join(", ")],
    ["Platform entries", platformEntriesLine(facts)],
    [
      "Platform-skins registry",
      facts.registry.ios.length || facts.registry.android.length
        ? `iOS: ${facts.registry.ios.join(", ") || "none"}; Android: ${facts.registry.android.join(", ") || "none"}`
        : "none (every export is the web build, so the docs three-up renders it as is)",
    ],
    [
      "Reference row",
      facts.reference
        ? `${code(facts.reference.key)} (${facts.reference.treatment}, ${facts.reference.build}). ${referenceCell("iOS", facts.reference.ios)}. ${referenceCell("Android", facts.reference.android)}. ${referenceCell("Web", facts.reference.web)}`
        : "none: `PLATFORM-REFERENCES.md` has no row for this component (K8)",
    ],
    [
      "Materials manifest",
      facts.materials.length
        ? facts.materials.map((m) => `${m.name}: ${m.tier}, ${m.roles.join(" + ")}; verification ${m.verification.join(", ")}`).join(". ")
        : "none",
    ],
    ["Hand-off open gaps", facts.handoff.open.length ? facts.handoff.open.map((g) => `${g.component}.${g.prop} (${g.planned})`).join(", ") : "none"],
    ["Hand-off settled", facts.handoff.settled.length ? facts.handoff.settled.map((s) => `${s.component}.${s.prop} (${s.kind}: ${s.equivalent})`).join(", ") : "none"],
    [
      "Hand-off metric gaps",
      facts.handoff.metricGaps.length ? facts.handoff.metricGaps.map((g) => `${g.id}: ${g.canvas} vs hand-off ${g.handoff} (${g.plannedIn})`).join("; ") : "none",
    ],
    [
      "Interactions registry",
      `${facts.interactions.inInventory ? "in the inventory" : "NOT in the inventory"}; evidence: ${
        facts.interactions.evidence.length ? facts.interactions.evidence.map((e) => `${e.id} (${e.layer}, ${e.file})`).join(", ") : "none registered"
      }`,
    ],
    ["Overlay recipe", facts.overlayRecipe ? `yes (${facts.overlayRecipe.role})` : "none"],
    ["MeasureProps", !facts.implementation.modules.length ? NO_SOURCE : facts.measureProps.length ? `adopted in ${list(facts.measureProps)}` : "not adopted"],
    ["Touch target", touchTargetLine(facts)],
    ["Tests importing it", `${facts.tests.length}: ${list(facts.tests)}`],
    ["E2E naming it", `${facts.e2e.length}: ${list(facts.e2e)}`],
    ["E2E catalog sweeps", sweepsLine(facts.e2eSweeps)],
  ];
  return ["| Fact | Value |", "|---|---|", ...rows.map(([fact, value]) => `| ${fact} | ${cell(value)} |`)];
}

/** The lines of a page's facts block, between the markers. */
export function renderPageFacts(facts: PageFacts): string[] {
  const rows: [string, string][] = [
    ["Route", code(facts.route)],
    ["Kind", facts.kind],
    ["Data module", code(facts.module)],
    ["Sections", facts.sections.length ? facts.sections.map((title, i) => `${i + 1}. ${title}`).join("; ") : "none parsed"],
    ["Kit names its entry uses", facts.kitNames.join(", ") || "none"],
    ["E2E naming it", `${facts.e2e.length}: ${list(facts.e2e)}`],
    ["E2E catalog sweeps", sweepsLine(facts.e2eSweeps)],
  ];
  return ["| Fact | Value |", "|---|---|", ...rows.map(([fact, value]) => `| ${fact} | ${cell(value)} |`)];
}

export interface VariantRow {
  key: string;
  label: string;
}

export interface VariantTicks {
  web: string;
  ios: string;
  android: string;
  notes: string;
}

const EMPTY_TICKS: VariantTicks = { web: "[ ]", ios: "[ ]", android: "[ ]", notes: "" };

export function variantsHeader(): string[] {
  return [`| Variant | Label | ${TICK_COLUMNS.map((c) => c.heading).join(" | ")} | Notes |`, "|---|---|---|---|---|---|"];
}

/** The variants table, carrying over the ticks and notes of rows that still exist. */
export function renderVariantsTable(rows: VariantRow[], existing: Map<string, VariantTicks>): string[] {
  return [
    ...variantsHeader(),
    ...rows.map((row) => {
      const ticks = existing.get(row.key) ?? EMPTY_TICKS;
      return `| ${code(row.key)} | ${cell(row.label)} | ${ticks.web} | ${ticks.ios} | ${ticks.android} | ${cell(ticks.notes)} |`;
    }),
  ];
}

/** A variants row as a reviewer left it, with its 1-based line number in the file. */
export interface VariantsTableRow {
  key: string;
  ticks: VariantTicks;
  line: number;
}

export interface VariantsTable {
  rows: VariantsTableRow[];
  malformed: MalformedRow[];
}

const KEY_CELL = /^`([^`]+)`$/;
const TICK_CELL = /^\[[ xX]\]/;
const HEADER_LINE = /^\|\s*Variant\s*\|/;

/**
 * The rows of a variants table, read so that nothing a reviewer wrote is lost: the cells
 * are split on unescaped pipes only (tools/audit/table.ts, the one reader every audit
 * table goes through), and the note is everything after the three tick cells (a "|"
 * typed in a note stays in the note). The header and separator lines are recognized by
 * their text, not their position, and blank lines carry nothing. Any other line that
 * does not read as a row is returned as malformed, with its line number (`firstLine` is
 * the file line of `lines[0]`).
 */
export function readVariantsTable(lines: string[], firstLine = 1): VariantsTable {
  const table: VariantsTable = { rows: [], malformed: [] };
  const seen = new Map<string, number>();
  lines.forEach((raw, i) => {
    const line = firstLine + i;
    const text = raw.trim();
    if (!text || HEADER_LINE.test(text) || SEPARATOR_LINE.test(text)) return;
    const bad = (reason: string) => table.malformed.push({ line, reason });
    const split = splitRow(text, VARIANTS_SHAPE);
    if ("reason" in split) return bad(split.reason);
    const [keyCell, , web, ios, android, notes] = split.cells;
    const key = KEY_CELL.exec(keyCell)?.[1];
    if (!key) return bad(`the variant cell reads "${keyCell}", not a back-ticked key`);
    const ticks = { web, ios, android };
    for (const column of TICK_COLUMNS) {
      const value = ticks[column.key];
      if (!TICK_CELL.test(value)) {
        return bad(`the ${column.heading} cell reads "${value}", not \`[ ]\` or \`[x]\` (a "|" in the label, or a missing cell, shifts the columns; write a pipe in a cell as \`\\|\`)`);
      }
    }
    const first = seen.get(key);
    if (first !== undefined) return bad(`a second row for \`${key}\` (the first is on line ${first})`);
    seen.set(key, line);
    table.rows.push({ key, ticks: { ...ticks, notes }, line });
  });
  return table;
}

/** The readable rows of a variants table body, keyed by variant. */
export function parseVariantsTable(lines: string[]): Map<string, VariantTicks> {
  return new Map(readVariantsTable(lines).rows.map((row) => [row.key, row.ticks]));
}

/** Whether a row carries a reviewer's work: a tick cell other than an empty box, or a note. */
export function carriesWork(ticks: VariantTicks): boolean {
  return [ticks.web, ticks.ios, ticks.android].some((value) => value !== EMPTY_TICKS.web) || ticks.notes !== "";
}

/** The rows a regeneration would drop although they carry a reviewer's work. */
export function droppedWork(table: VariantsTable, rows: VariantRow[]): VariantsTableRow[] {
  const wanted = new Set(rows.map((row) => row.key));
  return table.rows.filter((row) => !wanted.has(row.key) && carriesWork(row.ticks));
}

/** The file line of a block's first inner line (the line after its begin marker). */
export function blockFirstLine(content: string, block: Block): number {
  return content.slice(0, block.start).split("\n").length + 1;
}

export function componentVariantRows(component: InventoryComponent): VariantRow[] {
  return component.variants.map((v) => ({ key: v.variant, label: v.label }));
}

/**
 * A page's rows: the whole page, then one per section, keyed by the section title's
 * slug (`sectionKeys`), so inserting, removing or moving a section leaves every other
 * row's ticks where they are.
 */
export function pageVariantRows(id: string, facts: PageFacts): VariantRow[] {
  const keys = sectionKeys(id, facts.sections);
  return [{ key: PAGE_ROW_KEY, label: "Whole page" }, ...facts.sections.map((title, i) => ({ key: keys[i], label: title }))];
}

const checkItem = (text: string): string => `- [ ] ${text}`;

function rubricSection(): string[] {
  return [
    "## Universal rubric",
    "",
    "Severity follows rn-library-audit: critical (broken for a class of users), high (clear violation), medium, low. Evidence: S = source or test read, A = accessibility tree or DOM probe, P = photograph, N = native device check.",
    "",
    ...UNIVERSAL_RUBRIC.map((item, i) => checkItem(`${i + 1}. **${item.title}** (${item.evidence}): ${item.text}`)),
    "",
  ];
}

function familySections(families: Family[]): string[] {
  return [
    "## Family checklists",
    "",
    ...families.flatMap((family) => [`### ${FAMILY_LABEL[family]}`, "", ...FAMILY_CHECKLISTS[family].map(checkItem), ""]),
  ];
}

function specificsSection(native: string | null, specifics: string[]): string[] {
  return [
    "## Specific checks",
    "",
    ...(native ? [`Native shape owed per \`PLATFORM-REFERENCES.md\` (iOS / Android): ${native}.`, ""] : []),
    ...specifics.map(checkItem),
    "",
  ];
}

function findingsSection(): string[] {
  return [
    "## Findings",
    "",
    "One row per finding. Severity: critical, high, medium, low. Cell: a capture id from the inventory (`web/<slug>/<variant>/<width>.<look>.<surface>`, `ios/<slug>/<variant>/<look>.<surface>`) or `source`. Status: open, verified, fixed, wontfix (the owner's decision, with the reason in the summary), duplicate. Fix commit: the short SHA that closed it.",
    "",
    headerRow(FINDINGS_SHAPE),
    separatorRow(FINDINGS_SHAPE),
    "",
  ];
}

function signOffSection(): string[] {
  return [
    "## Sign-off",
    "",
    "A platform is signed off when every variant cell for it is ticked, no critical or high finding is open, every medium or low is fixed or carries the owner's decision, and the run id names the after-capture run under `.audit/runs/` that shows it.",
    "",
    headerRow(SIGN_OFF_SHAPE),
    separatorRow(SIGN_OFF_SHAPE),
    ...SIGN_OFF_PLATFORMS.map((platform) => `| ${platform} |  |  |  |  |`),
    "",
  ];
}

function variantsIntro(): string[] {
  return [
    `Web: ${WEB_CELLS_PER_VARIANT} cells per variant (3 widths x 3 looks x 2 surfaces). iOS and Android: ${NATIVE_CELLS_PER_VARIANT} each (3 looks x 2 surfaces). Tick a cell once every capture it stands for has been reviewed against this checklist; keep notes short and put anything actionable in Findings.`,
    "",
  ];
}

/** A component's checklist from scratch: the generated blocks plus the seeded sections. */
export function seedComponentChecklist(component: InventoryComponent, facts: ComponentFacts): string {
  const plan = COMPONENT_PLANS.find((p) => p.slug === component.slug);
  if (!plan) throw new Error(`audit: tools/audit/plan-specifics.ts has no row for ${component.slug}`);
  return [
    `# ${component.name}`,
    "",
    `Audit checklist for ${code(component.route)}. The facts block and the variants table are generated by \`bun run audit:checklists\` (between the markers); everything else is maintained by hand and survives regeneration. See \`audit/README.md\`.`,
    "",
    FACTS_BEGIN,
    ...renderComponentFacts(facts),
    FACTS_END,
    "",
    "## Variants",
    "",
    ...variantsIntro(),
    VARIANTS_BEGIN,
    ...renderVariantsTable(componentVariantRows(component), new Map()),
    VARIANTS_END,
    "",
    ...rubricSection(),
    ...familySections(plan.families),
    ...specificsSection(plan.native, plan.specifics),
    ...findingsSection(),
    ...signOffSection(),
  ].join("\n");
}

/** A page's checklist from scratch. */
export function seedPageChecklist(page: InventoryPage, facts: PageFacts): string {
  const kind = page.kind === "pattern" ? "Pattern" : "Template";
  return [
    `# ${kind}: ${page.slug}`,
    "",
    `Audit checklist for ${code(page.route)}. The facts block and the variants table are generated by \`bun run audit:checklists\` (between the markers); everything else is maintained by hand and survives regeneration. See \`audit/README.md\`.`,
    "",
    FACTS_BEGIN,
    ...renderPageFacts(facts),
    FACTS_END,
    "",
    "## Variants",
    "",
    ...variantsIntro(),
    VARIANTS_BEGIN,
    ...renderVariantsTable(pageVariantRows(page.id, facts), new Map()),
    VARIANTS_END,
    "",
    ...rubricSection(),
    ...familySections(PAGE_PLAN.families),
    ...specificsSection(null, PAGE_PLAN.specifics),
    ...findingsSection(),
    ...signOffSection(),
  ].join("\n");
}

// ---------- the hand-maintained tables ----------

/** A finding as a reviewer wrote it, with its 1-based line number in the file. */
export interface Finding {
  id: string;
  severity: (typeof FINDING_SEVERITIES)[number];
  cell: string;
  summary: string;
  status: (typeof FINDING_STATUSES)[number];
  fix: string;
  line: number;
}

/** The findings table: whether it is there, its readable rows, and every line it could not read. */
export interface FindingsTable {
  found: boolean;
  rows: Finding[];
  malformed: MalformedRow[];
}

const oneOf = <T extends string>(values: readonly T[], value: string): T | null => (values as readonly string[]).includes(value) ? (value as T) : null;

/** The word a finding's Cell takes when it was found by reading the source rather than in a capture. */
export const SOURCE_CELL = "source";

/** The capture ids a component's checklist may name in its Findings Cell column: every cell of every variant (tools/audit/inventory.ts). */
export function componentCells(component: InventoryComponent): Set<string> {
  return new Set(component.variants.flatMap((v) => cellsFor(component.slug, v.variant).map(cellId)));
}

/** The capture ids a page's checklist may name in its Findings Cell column. */
export function pageCells(page: InventoryPage): Set<string> {
  return new Set(pageCellsFor(page.id).map(pageCellId));
}

/** Every checklist the inventory calls for (its path under audit/), with the capture ids its findings may name. */
export function captureCells(): Map<string, Set<string>> {
  return new Map([
    ...components().map((c) => [`${COMPONENTS_DIR}/${c.slug}.md`, componentCells(c)] as const),
    ...pages().map((p) => [`${PAGES_DIR}/${p.id}.md`, pageCells(p)] as const),
  ]);
}

/**
 * The findings under `## Findings`, read with the one table reader: a "|" typed in a
 * summary stays in the summary, an empty cell is an empty cell, and a row whose severity
 * or status is not one of the table's words (a missing cell shifts them), whose ID is
 * empty or taken, that reads `fixed` with no Fix commit, or whose Fix commit is not a
 * commit SHA, is reported by line rather than counted or dropped. With `cells` (the
 * checklist's capture ids, `componentCells` / `pageCells`), a Cell that is neither one
 * of them nor `source` is reported by line too (back-ticks around it are allowed).
 */
export function readFindings(content: string, cells?: ReadonlySet<string>): FindingsTable {
  const table = readSectionTable(content, "Findings", FINDINGS_SHAPE);
  const out: FindingsTable = { found: table.found, rows: [], malformed: [...table.malformed] };
  const seen = new Map<string, number>();
  for (const { cells: row, line } of table.rows) {
    const [id, severityCell, cellText, summary, statusCell, fix] = row;
    const cell = cellText.replace(/^`([^`]*)`$/, "$1");
    const severity = oneOf(FINDING_SEVERITIES, severityCell.toLowerCase());
    const status = oneOf(FINDING_STATUSES, statusCell.toLowerCase());
    const bad = (reason: string) => out.malformed.push({ line, reason });
    if (!id) bad("the ID cell is empty");
    else if (!severity) bad(`the Severity cell reads "${severityCell}", not one of ${FINDING_SEVERITIES.join(", ")} (a missing cell shifts the columns; write a pipe in a cell as \`\\|\`)`);
    else if (!status) bad(`the Status cell reads "${statusCell}", not one of ${FINDING_STATUSES.join(", ")} (a missing cell shifts the columns; write a pipe in a cell as \`\\|\`)`);
    else if (status === "fixed" && !fix) bad("the Status cell reads fixed but the Fix commit cell is empty; record the SHA of the commit that closed it");
    else if (fix && !FIX_COMMIT.test(fix)) bad(`the Fix commit cell reads "${fix}", not a commit SHA (7 to 40 hex digits)`);
    else if (cells && cell !== SOURCE_CELL && !cells.has(cell)) {
      bad(`the Cell cell reads "${cellText}", not one of this checklist's capture ids (tools/audit/inventory.ts: \`web/<slug>/<variant>/<width>.<look>.<surface>\`, \`ios/<slug>/<variant>/<look>.<surface>\`, \`web-pages/<kind>-<slug>/<width>.<look>.<surface>\`, ...) or \`${SOURCE_CELL}\``);
    }
    else if (seen.has(id)) bad(`a second finding ${id} (the first is on line ${seen.get(id)})`);
    else {
      seen.set(id, line);
      out.rows.push({ id, severity, cell, summary, status, fix, line });
    }
  }
  out.malformed.sort((a, b) => a.line - b.line);
  return out;
}

/** A sign-off row as a reviewer left it. */
export interface SignOff {
  platform: (typeof SIGN_OFF_PLATFORMS)[number];
  runId: string;
  reviewer: string;
  date: string;
  result: string;
  line: number;
}

/** The sign-off table: whether it is there, its readable rows, and every line it could not read. */
export interface SignOffTable {
  found: boolean;
  rows: SignOff[];
  malformed: MalformedRow[];
}

/** The sign-off rows under `## Sign-off`, one per platform, read with the one table reader. */
export function readSignOffs(content: string): SignOffTable {
  const table = readSectionTable(content, "Sign-off", SIGN_OFF_SHAPE);
  const out: SignOffTable = { found: table.found, rows: [], malformed: [...table.malformed] };
  const seen = new Map<string, number>();
  for (const { cells, line } of table.rows) {
    const [platformCell, runId, reviewer, date, result] = cells;
    const platform = oneOf(SIGN_OFF_PLATFORMS, platformCell.toLowerCase());
    if (!platform) out.malformed.push({ line, reason: `the Platform cell reads "${platformCell}", not one of ${SIGN_OFF_PLATFORMS.join(", ")}` });
    else if (seen.has(platform)) out.malformed.push({ line, reason: `a second sign-off row for ${platform} (the first is on line ${seen.get(platform)})` });
    else {
      seen.set(platform, line);
      out.rows.push({ platform, runId, reviewer, date, result, line });
    }
  }
  out.malformed.sort((a, b) => a.line - b.line);
  return out;
}

/** Every line of a checklist's hand-maintained tables that cannot be read, and a table that is missing, as messages. */
export function handTableProblems(content: string, cells?: ReadonlySet<string>): { line: number | null; message: string }[] {
  const findings = readFindings(content, cells);
  const signOffs = readSignOffs(content);
  const problems: { line: number | null; message: string }[] = [];
  if (!findings.found && !findings.malformed.length) {
    problems.push({ line: null, message: `findings table missing (a "## Findings" heading over the \`${headerRow(FINDINGS_SHAPE)}\` table)` });
  }
  problems.push(...findings.malformed.map((row) => ({ line: row.line, message: `malformed findings row: ${row.reason}` })));
  const missing = SIGN_OFF_PLATFORMS.filter((platform) => !signOffs.rows.some((row) => row.platform === platform));
  if (!signOffs.found && !signOffs.malformed.length) {
    problems.push({ line: null, message: `sign-off section missing (a "## Sign-off" heading with a row per platform: ${SIGN_OFF_PLATFORMS.join(", ")})` });
  } else if (signOffs.found && missing.length) {
    problems.push({ line: null, message: `sign-off table has no readable row for ${missing.join(", ")} (one row per platform: ${SIGN_OFF_PLATFORMS.join(", ")})` });
  }
  problems.push(...signOffs.malformed.map((row) => ({ line: row.line, message: `malformed sign-off row: ${row.reason}` })));
  return problems;
}

// ---------- merging ----------

export interface Block {
  /** The lines between the markers, markers excluded. */
  lines: string[];
  /** The character offsets of the block in the file, markers included. */
  start: number;
  end: number;
}

/** The block between a marker pair, or null when either marker is missing or out of order. */
export function findBlock(content: string, begin: string, end: string): Block | null {
  const start = content.indexOf(begin);
  const close = content.indexOf(end, start + begin.length);
  if (start === -1 || close === -1) return null;
  const inner = content.slice(start + begin.length, close);
  return { lines: inner.split("\n").slice(1, -1), start, end: close + end.length };
}

function replaceBlock(content: string, block: Block, begin: string, lines: string[], end: string): string {
  return `${content.slice(0, block.start)}${[begin, ...lines, end].join("\n")}${content.slice(block.end)}`;
}

/** A checklist `--write` will not regenerate, because doing so would guess or lose a reviewer's work. */
export class ChecklistRefusal extends Error {
  constructor(
    readonly file: string,
    readonly problems: string[],
  ) {
    super(`audit: refusing to rewrite audit/${file}:\n${problems.map((p) => `  ${p}`).join("\n")}`);
    this.name = "ChecklistRefusal";
  }
}

/** Why a variants table cannot be regenerated without losing a reviewer's work, as messages; empty when it can. */
export function variantsRefusals(table: VariantsTable, rows: VariantRow[]): string[] {
  return [
    ...table.malformed.map((row) => `line ${row.line}: malformed variants row: ${row.reason}; fix the row by hand`),
    ...droppedWork(table, rows).map(
      (row) =>
        `line ${row.line}: \`${row.key}\` is no longer a row of this route (its example or section was removed, or its title now slugifies differently) and carries ticks or a note; move them to the row that replaces it, or clear them`,
    ),
  ];
}

/** The existing file with its generated blocks regenerated and everything else untouched. */
export function mergeChecklist(existing: string, factsLines: string[], rows: VariantRow[], file: string): string {
  if (!findBlock(existing, FACTS_BEGIN, FACTS_END)) {
    throw new ChecklistRefusal(file, ["no facts block markers; restore them or delete the file to reseed it"]);
  }
  const variants = findBlock(existing, VARIANTS_BEGIN, VARIANTS_END);
  if (!variants) throw new ChecklistRefusal(file, ["no variants table markers; restore them or delete the file to reseed it"]);
  // Read the table from the file as it stands, so a refusal names the reviewer's own line numbers.
  const table = readVariantsTable(variants.lines, blockFirstLine(existing, variants));
  const refusals = variantsRefusals(table, rows);
  if (refusals.length) throw new ChecklistRefusal(file, refusals);
  const ticks = new Map(table.rows.map((row) => [row.key, row.ticks]));
  const next = replaceBlock(existing, variants, VARIANTS_BEGIN, renderVariantsTable(rows, ticks), VARIANTS_END);
  return replaceBlock(next, findBlock(next, FACTS_BEGIN, FACTS_END)!, FACTS_BEGIN, factsLines, FACTS_END);
}

// ---------- the files ----------

export interface ChecklistEntry {
  /** The path under the audit directory. */
  file: string;
  factsLines: string[];
  rows: VariantRow[];
  /** The capture ids its findings may name in their Cell (besides `source`). */
  cells: Set<string>;
  seed: () => string;
}

/** Every checklist the inventory calls for, with what its generated blocks must hold. */
export function checklistEntries(sources: ChecklistSources): ChecklistEntry[] {
  const entries: ChecklistEntry[] = sources.components.map((component) => {
    const facts = componentFacts(component.slug, sources.corpus);
    return {
      file: `${COMPONENTS_DIR}/${component.slug}.md`,
      factsLines: renderComponentFacts(facts),
      rows: componentVariantRows(component),
      cells: componentCells(component),
      seed: () => seedComponentChecklist(component, facts),
    };
  });
  for (const page of sources.pages) {
    const facts = pageFacts(page, sources.corpus);
    entries.push({
      file: `${PAGES_DIR}/${page.id}.md`,
      factsLines: renderPageFacts(facts),
      rows: pageVariantRows(page.id, facts),
      cells: pageCells(page),
      seed: () => seedPageChecklist(page, facts),
    });
  }
  return entries;
}

export interface WriteResult {
  seeded: string[];
  updated: string[];
  unchanged: string[];
  /** Files left exactly as they were, because regenerating them would guess or lose a reviewer's work. */
  refused: ChecklistRefusal[];
}

/** Write or merge every checklist. Files already in place keep their hand-maintained sections. */
export function writeChecklists(auditDir: string, sources: ChecklistSources): WriteResult {
  const result: WriteResult = { seeded: [], updated: [], unchanged: [], refused: [] };
  for (const entry of checklistEntries(sources)) {
    const path = join(auditDir, entry.file);
    mkdirSync(join(auditDir, entry.file, ".."), { recursive: true });
    if (!existsSync(path)) {
      writeFileSync(path, entry.seed());
      result.seeded.push(entry.file);
      continue;
    }
    const existing = readFileSync(path, "utf8");
    let next: string;
    try {
      next = mergeChecklist(existing, entry.factsLines, entry.rows, entry.file);
    } catch (error) {
      if (!(error instanceof ChecklistRefusal)) throw error;
      result.refused.push(error);
      continue;
    }
    if (next === existing) result.unchanged.push(entry.file);
    else {
      writeFileSync(path, next);
      result.updated.push(entry.file);
    }
  }
  return result;
}

/** Every way a checklist can be out of step with the inventory, as messages; empty when none. */
export function checkChecklists(auditDir: string, sources: ChecklistSources): string[] {
  const errors: string[] = [];
  const expected = new Set<string>();
  for (const entry of checklistEntries(sources)) {
    expected.add(entry.file);
    const path = join(auditDir, entry.file);
    if (!existsSync(path)) {
      errors.push(`no checklist at audit/${entry.file} (run \`bun run audit:checklists\`)`);
      continue;
    }
    const content = readFileSync(path, "utf8");
    const facts = findBlock(content, FACTS_BEGIN, FACTS_END);
    if (!facts) errors.push(`audit/${entry.file}: facts block markers missing`);
    else if (facts.lines.join("\n") !== entry.factsLines.join("\n")) errors.push(`audit/${entry.file}: stale facts block (run \`bun run audit:checklists\`)`);
    const variants = findBlock(content, VARIANTS_BEGIN, VARIANTS_END);
    if (!variants) errors.push(`audit/${entry.file}: variants table markers missing`);
    else errors.push(...variantsErrors(entry, content, variants));
    for (const problem of handTableProblems(content, entry.cells)) {
      errors.push(problem.line === null ? `audit/${entry.file}: ${problem.message}` : `audit/${entry.file}:${problem.line}: ${problem.message} (fix it by hand)`);
    }
  }
  errors.push(...orphanChecklists(auditDir, expected));
  return errors;
}

/**
 * What is wrong with a checklist's variants table, as messages. A malformed row is
 * reported by its line and nothing more: its key cannot be trusted, so calling the table
 * drift would send the reviewer to `--write`, which refuses the file anyway.
 */
function variantsErrors(entry: ChecklistEntry, content: string, variants: Block): string[] {
  const table = readVariantsTable(variants.lines, blockFirstLine(content, variants));
  if (table.malformed.length) {
    return table.malformed.map(
      (row) => `audit/${entry.file}:${row.line}: malformed variants row: ${row.reason} (fix it by hand; \`bun run audit:checklists\` refuses a file with a malformed row rather than lose its ticks or note)`,
    );
  }
  const found = table.rows.map((row) => row.key);
  const wanted = entry.rows.map((row) => row.key);
  if (found.join(",") !== wanted.join(",")) {
    const stranded = droppedWork(table, entry.rows);
    const advice = stranded.length
      ? `; ${stranded.map((row) => `\`${row.key}\` (line ${row.line})`).join(", ")} carry ticks or notes the inventory has no row for: move them to the row that replaces them, or clear them, then run \`bun run audit:checklists\``
      : "; run `bun run audit:checklists`";
    return [`audit/${entry.file}: variant rows drift from the inventory (expected ${wanted.join(", ")}; found ${found.join(", ") || "none"}${advice})`];
  }
  const rendered = renderVariantsTable(entry.rows, new Map(table.rows.map((row) => [row.key, row.ticks])));
  if (variants.lines.join("\n") !== rendered.join("\n")) {
    return [`audit/${entry.file}: variants table out of date (a relabelled row, a changed header, or a "|" in a note to escape); run \`bun run audit:checklists\`, which keeps every tick and note`];
  }
  return [];
}

/** Every `.md` file under the checklist directories that no docs route calls for. Anything else there (a `.DS_Store`) is not a checklist. */
export function orphanChecklists(auditDir: string, expected: Set<string>): string[] {
  const errors: string[] = [];
  for (const dir of [COMPONENTS_DIR, PAGES_DIR]) {
    const absolute = join(auditDir, dir);
    if (!existsSync(absolute)) continue;
    for (const name of readdirSync(absolute).sort()) {
      if (!name.endsWith(".md")) continue;
      const file = `${dir}/${name}`;
      if (!expected.has(file)) errors.push(`orphan checklist audit/${file}: no docs route calls for it (delete it, or restore the route)`);
    }
  }
  return errors;
}

if (import.meta.main) {
  const mode = process.argv[2];
  const auditDir = join(ROOT, "audit");
  if (mode === "--write") {
    const result = writeChecklists(auditDir, defaultSources());
    console.log(`audit:checklists wrote ${result.seeded.length} new, updated ${result.updated.length}, left ${result.unchanged.length} unchanged under audit/`);
    if (result.refused.length) {
      console.error(`audit:checklists left ${result.refused.length} file(s) untouched:\n${result.refused.map((refusal) => refusal.message).join("\n")}`);
      process.exit(1);
    }
  } else if (mode === "--check") {
    const errors = checkChecklists(auditDir, defaultSources());
    if (errors.length) {
      console.error(`audit:checklists --check found ${errors.length} problem(s):\n${errors.map((e) => `  ${e}`).join("\n")}`);
      process.exit(1);
    }
    console.log("audit:checklists --check verified every checklist against the inventory; the generated blocks are in sync.");
  } else {
    console.error("usage: bun tools/audit/checklists.ts --write | --check");
    process.exit(2);
  }
}
