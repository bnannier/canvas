// The per-component and per-page audit checklists under audit/: one markdown file per
// docs route, half generated and half hand-maintained.
//
// Generated, and rewritten on every `--write`: the facts block (tools/audit/facts.ts)
// and the variants table (one row per example variant from tools/audit/inventory.ts,
// with a tick cell per platform). Each sits between its own HTML-comment markers, and
// the variants table is MERGED by variant key, so a reviewer's ticks and notes survive
// a regeneration that adds, removes or relabels examples.
//
// Hand-maintained, and seeded ONCE on the file's first write from
// tools/audit/plan-specifics.ts: the universal rubric, the family checklists, the
// component's specific checks, the findings table and the sign-off table. After that
// `--write` never touches them: everything outside the two marker pairs is carried over
// byte for byte, so running `--write` twice changes nothing.
//
// `--check` (wired as audit:checklists:check, in CI and the pre-push hook) fails on a
// route with no checklist, an orphan checklist, a stale facts block, variant rows that
// drift from the inventory, and a missing sign-off section.

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT } from "../../e2e/support/routes.ts";
import { componentFacts, loadCorpus, pageFacts, type ComponentFacts, type FactsCorpus, type PageFacts, type ReferenceCell } from "./facts.ts";
import { NATIVE_CELLS_PER_VARIANT, WEB_CELLS_PER_VARIANT, components, pages, type InventoryComponent, type InventoryPage } from "./inventory.ts";
import { COMPONENT_PLANS, FAMILY_CHECKLISTS, FAMILY_LABEL, PAGE_PLAN, UNIVERSAL_RUBRIC, type Family } from "./plan-specifics.ts";

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
    ["Exports", facts.exports.join(", ")],
    [
      "Platform entries",
      facts.skins.hasPlatformEntries ? `${skinLine("iOS", facts)}. ${skinLine("Android", facts)}` : "none (one build on every platform)",
    ],
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
    ["MeasureProps", facts.measureProps.length ? `adopted in ${list(facts.measureProps)}` : "not adopted"],
    [
      "Touch target",
      facts.touchTarget.useMinTargetSlop.length || facts.touchTarget.minTarget.length
        ? `useMinTargetSlop in ${list(facts.touchTarget.useMinTargetSlop)}; minTarget in ${list(facts.touchTarget.minTarget)}`
        : "no minTarget or useMinTargetSlop in the source directory",
    ],
    ["Tests naming it", `${facts.tests.length}: ${list(facts.tests)}`],
    ["E2E naming it", `${facts.e2e.length}: ${list(facts.e2e)}`],
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
    ["Kit imports in the module", facts.kitImports.join(", ") || "none"],
    ["E2E naming it", `${facts.e2e.length}: ${list(facts.e2e)}`],
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

/** The rows of a variants table body, keyed by variant. */
export function parseVariantsTable(lines: string[]): Map<string, VariantTicks> {
  const out = new Map<string, VariantTicks>();
  for (const line of lines) {
    if (!line.startsWith("| `")) continue;
    const cells = line.replace(/^\|\s?/, "").replace(/\s?\|$/, "").split(" | ").map((c) => c.trim());
    if (cells.length !== 6) continue;
    const [key, , web, ios, android, notes] = cells;
    out.set(key.replace(/^`|`$/g, ""), { web, ios, android, notes });
  }
  return out;
}

export function componentVariantRows(component: InventoryComponent): VariantRow[] {
  return component.variants.map((v) => ({ key: v.variant, label: v.label }));
}

/** A page's rows: the whole page, then one per section, keyed by position so a retitle keeps its ticks. */
export function pageVariantRows(facts: PageFacts): VariantRow[] {
  return [{ key: "page", label: "Whole page" }, ...facts.sections.map((title, i) => ({ key: `section-${i + 1}`, label: title }))];
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
    "| ID | Severity | Cell | Summary | Status | Fix commit |",
    "|---|---|---|---|---|---|",
    "",
  ];
}

function signOffSection(): string[] {
  return [
    "## Sign-off",
    "",
    "A platform is signed off when every variant cell for it is ticked, no critical or high finding is open, every medium or low is fixed or carries the owner's decision, and the run id names the after-capture run under `.audit/runs/` that shows it.",
    "",
    "| Platform | Run id | Reviewer | Date | Result |",
    "|---|---|---|---|---|",
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
    ...renderVariantsTable(pageVariantRows(facts), new Map()),
    VARIANTS_END,
    "",
    ...rubricSection(),
    ...familySections(PAGE_PLAN.families),
    ...specificsSection(null, PAGE_PLAN.specifics),
    ...findingsSection(),
    ...signOffSection(),
  ].join("\n");
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

/** The existing file with its generated blocks regenerated and everything else untouched. */
export function mergeChecklist(existing: string, factsLines: string[], rows: VariantRow[], file: string): string {
  const facts = findBlock(existing, FACTS_BEGIN, FACTS_END);
  if (!facts) throw new Error(`audit: ${file} has no facts block markers; restore them or delete the file to reseed it`);
  const next = replaceBlock(existing, facts, FACTS_BEGIN, factsLines, FACTS_END);
  const variants = findBlock(next, VARIANTS_BEGIN, VARIANTS_END);
  if (!variants) throw new Error(`audit: ${file} has no variants table markers; restore them or delete the file to reseed it`);
  return replaceBlock(next, variants, VARIANTS_BEGIN, renderVariantsTable(rows, parseVariantsTable(variants.lines)), VARIANTS_END);
}

// ---------- the files ----------

export interface ChecklistEntry {
  /** The path under the audit directory. */
  file: string;
  factsLines: string[];
  rows: VariantRow[];
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
      seed: () => seedComponentChecklist(component, facts),
    };
  });
  for (const page of sources.pages) {
    const facts = pageFacts(page, sources.corpus);
    entries.push({
      file: `${PAGES_DIR}/${page.id}.md`,
      factsLines: renderPageFacts(facts),
      rows: pageVariantRows(facts),
      seed: () => seedPageChecklist(page, facts),
    });
  }
  return entries;
}

export interface WriteResult {
  seeded: string[];
  updated: string[];
  unchanged: string[];
}

/** Write or merge every checklist. Files already in place keep their hand-maintained sections. */
export function writeChecklists(auditDir: string, sources: ChecklistSources): WriteResult {
  const result: WriteResult = { seeded: [], updated: [], unchanged: [] };
  for (const entry of checklistEntries(sources)) {
    const path = join(auditDir, entry.file);
    mkdirSync(join(auditDir, entry.file, ".."), { recursive: true });
    if (!existsSync(path)) {
      writeFileSync(path, entry.seed());
      result.seeded.push(entry.file);
      continue;
    }
    const existing = readFileSync(path, "utf8");
    const next = mergeChecklist(existing, entry.factsLines, entry.rows, entry.file);
    if (next === existing) result.unchanged.push(entry.file);
    else {
      writeFileSync(path, next);
      result.updated.push(entry.file);
    }
  }
  return result;
}

function hasSignOff(content: string): boolean {
  const at = content.indexOf("\n## Sign-off");
  if (at === -1) return false;
  const section = content.slice(at).split(/\n## (?!Sign-off)/)[0];
  return SIGN_OFF_PLATFORMS.every((platform) => new RegExp(`^\\| ${platform} \\|`, "m").test(section));
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
    else {
      const found = [...parseVariantsTable(variants.lines).keys()];
      const wanted = entry.rows.map((row) => row.key);
      const header = variants.lines.slice(0, 2).join("\n");
      if (header !== variantsHeader().join("\n") || found.join(",") !== wanted.join(",")) {
        errors.push(`audit/${entry.file}: variant rows drift from the inventory (expected ${wanted.join(", ")}; found ${found.join(", ") || "none"}; run \`bun run audit:checklists\`)`);
      }
    }
    if (!hasSignOff(content)) errors.push(`audit/${entry.file}: sign-off section missing (a "## Sign-off" heading with a row per platform: web, ios, android)`);
  }
  for (const dir of [COMPONENTS_DIR, PAGES_DIR]) {
    const absolute = join(auditDir, dir);
    if (!existsSync(absolute)) continue;
    for (const name of readdirSync(absolute).sort()) {
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
