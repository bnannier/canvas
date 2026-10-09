// Per-component facts for the audit checklists, gathered from the repo's own records
// with no React Native import, so it runs under plain bun: the docs catalog, the skin
// divergence read from source text, the docs' platform-skin registry, the platform
// reference catalog, the materials manifest, the hand-off parity report, the
// interaction evidence registry, the overlay recipes, the test and e2e trees, and the
// component's own source directory. Each fact names where it came from, so a reviewer
// can go and look; none of them is a verdict.
//
// `bun tools/audit/facts.ts <slug>` prints one component's facts as JSON.

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import ts from "typescript";
import { COMPONENTS } from "../../docs/src/core/data/components.ts";
import type { Category } from "../../docs/src/core/data/types.ts";
import { ROOT, componentDocPath } from "../../e2e/support/routes.ts";
import { MATERIAL_OVERLAY_RECIPES, TOAST_RECIPE } from "../../e2e/support/overlay-recipes.ts";
import { evidence as interactionEvidence, inventory as interactionInventory } from "../interactions/registry.ts";
import { materialCoverage } from "../materials/manifest.ts";
import { componentSkins, type ComponentSkins, type Platform as SkinPlatform } from "../skins/divergence.ts";
import { registeredSkins } from "../skins/registry.ts";
import type { InventoryPage } from "./inventory.ts";

export interface SkinFact {
  /** Whether the platform entry diverges from the web build on this platform, for any export. */
  divergent: boolean;
  /** Per built export: the reason it diverges, or null for the web build. */
  exports: Record<string, string | null>;
}

export interface ReferenceCell {
  /** A real reference link, a `(none: ...)` note stating the platform has no such control, or plain text. */
  kind: "link" | "none" | "text";
  text: string;
  url?: string;
  /** The trailing parenthetical after a link, when the row carries one. */
  note?: string;
}

export interface ReferenceRow {
  /** The first word of the Component cell: the key a slug is matched against. */
  key: string;
  component: string;
  treatment: string;
  build: string;
  ios: ReferenceCell;
  android: ReferenceCell;
  web: ReferenceCell;
}

export interface MaterialFact {
  name: string;
  tier: string;
  roles: string[];
  verification: string[];
}

export interface HandoffGap {
  component: string;
  prop: string;
  planned: string;
  what: string;
}

export interface HandoffSettled {
  component: string;
  prop: string;
  kind: string;
  equivalent: string;
}

export interface MetricGap {
  id: string;
  component: string;
  canvas: string;
  handoff: string;
  plannedIn: string;
}

export interface ComponentFacts {
  slug: string;
  name: string;
  category: Category;
  dir: string;
  route: string;
  /** Repo-relative source directory, when the component has one (the raw primitives have only markdown). */
  sourceDir: string;
  sourceFiles: string[];
  markdown: string;
  /** The value names the web entry exports (the raw primitives: the component's name). */
  exports: string[];
  skins: { hasPlatformEntries: boolean; iOS: SkinFact; Android: SkinFact };
  /** The component's exports registered in the docs' platform-skin registry, per table. */
  registry: { ios: string[]; android: string[] };
  /** The `PLATFORM-REFERENCES.md` row the slug maps to, or null when the catalog has none. */
  reference: ReferenceRow | null;
  materials: MaterialFact[];
  handoff: { open: HandoffGap[]; settled: HandoffSettled[]; metricGaps: MetricGap[] };
  interactions: { inInventory: boolean; evidence: { id: string; layer: string; file: string; test: string }[] };
  /** The e2e overlay recipe that opens it, when one exists. */
  overlayRecipe: { role: string } | null;
  /** Files under test/ naming one of its exports or its route. */
  tests: string[];
  /** Files under e2e/ naming one of its exports or its route. */
  e2e: string[];
  /** Source files adopting the measure axis. */
  measureProps: string[];
  /** Source files reading the touch-target floor. */
  touchTarget: { useMinTargetSlop: string[]; minTarget: string[] };
}

export interface PageFacts {
  kind: InventoryPage["kind"];
  slug: string;
  route: string;
  /** The docs data module that composes the page, repo-relative. */
  module: string;
  /** The section titles the page renders, in order. */
  sections: string[];
  /** The kit names the module imports from `@nannier/canvas`. */
  kitImports: string[];
  /** Files under e2e/ naming its route. */
  e2e: string[];
}

const GROUP_OF: Record<Category, string> = { Atoms: "atoms", Molecules: "molecules", Organisms: "organisms", Charts: "charts" };

/**
 * Slugs whose reference row is keyed under another name: the kit's `Stepper` is the
 * catalog's `stepper-control` (the +/- control, not the wizard), `Emblem` is the
 * `icon-tile` composite, and `Drawer` is the `overlays` row (sheets and side sheets).
 * Every chart shares the one `charts` row.
 */
export const REFERENCE_ROW_ALIASES: Record<string, string> = { stepper: "stepper-control", emblem: "icon-tile", drawer: "overlays" };

function parse(file: string, source: string): ts.SourceFile {
  const kind = file.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  return ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, kind);
}

function isExported(node: ts.Node): boolean {
  return ts.canHaveModifiers(node) && (ts.getModifiers(node) ?? []).some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
}

/** The value names a module exports: consts (destructured included), functions, classes and `export { }` lists. */
export function valueExports(file: string, source: string): string[] {
  const names: string[] = [];
  const add = (name: string) => {
    if (!names.includes(name)) names.push(name);
  };
  for (const statement of parse(file, source).statements) {
    if (ts.isVariableStatement(statement) && isExported(statement)) {
      for (const decl of statement.declarationList.declarations) {
        if (ts.isIdentifier(decl.name)) add(decl.name.text);
        else if (ts.isObjectBindingPattern(decl.name)) {
          for (const element of decl.name.elements) if (ts.isIdentifier(element.name)) add(element.name.text);
        }
      }
    } else if ((ts.isFunctionDeclaration(statement) || ts.isClassDeclaration(statement)) && isExported(statement) && statement.name) {
      add(statement.name.text);
    } else if (ts.isExportDeclaration(statement) && !statement.isTypeOnly && statement.exportClause && ts.isNamedExports(statement.exportClause)) {
      for (const element of statement.exportClause.elements) if (!element.isTypeOnly) add(element.name.text);
    }
  }
  return names;
}

function classifyCell(cell: string): ReferenceCell {
  const text = cell.trim();
  const none = /^\(none:\s*([\s\S]*)\)$/.exec(text);
  if (none) return { kind: "none", text: none[1].trim() };
  const link = /^\[([^\]]+)\]\((<[^>]+>|[^)]+)\)\s*([\s\S]*)$/.exec(text);
  if (link) {
    const url = link[2].replace(/^<|>$/g, "");
    const note = link[3].trim().replace(/^\(|\)$/g, "");
    return note ? { kind: "link", text: link[1], url, note } : { kind: "link", text: link[1], url };
  }
  return { kind: "text", text };
}

/** Every row of the catalog's table in `PLATFORM-REFERENCES.md`. */
export function referenceRows(markdown: string): ReferenceRow[] {
  const rows: ReferenceRow[] = [];
  for (const line of markdown.split("\n")) {
    if (!line.startsWith("| ") || /^\|\s*Component\s*\|/.test(line) || /^\|-+\|/.test(line.replace(/\s/g, ""))) continue;
    const cells = line.replace(/^\|\s?/, "").replace(/\s?\|$/, "").split(" | ");
    if (cells.length !== 6) throw new Error(`PLATFORM-REFERENCES.md: expected 6 cells, found ${cells.length}: ${line}`);
    const [component, treatment, build, ios, android, web] = cells.map((c) => c.trim());
    rows.push({ key: component.split(" ")[0], component, treatment, build, ios: classifyCell(ios), android: classifyCell(android), web: classifyCell(web) });
  }
  return rows;
}

/** The catalog key a component slug maps to, or null when the catalog has no row for it. */
export function referenceKeyFor(slug: string, category: Category, keys: Set<string>): string | null {
  const alias = REFERENCE_ROW_ALIASES[slug];
  if (alias) return keys.has(alias) ? alias : null;
  if (keys.has(slug)) return slug;
  return category === "Charts" && keys.has("charts") ? "charts" : null;
}

/** A row of a markdown table whose first two cells are back-ticked names. */
function tableRows(markdown: string, heading: string): string[][] {
  const start = markdown.indexOf(`\n## ${heading}\n`);
  if (start === -1) return [];
  const section = markdown.slice(start + 1).split(/\n## /)[0];
  return section
    .split("\n")
    .filter((line) => line.startsWith("| `"))
    .map((line) => line.replace(/^\|\s?/, "").replace(/\s?\|$/, "").split(" | ").map((c) => c.trim()));
}

const unticked = (cell: string): string => cell.replace(/^`|`$/g, "");

/** The open gaps the hand-off parity report lists, per hand-off component name. */
export function handoffOpenGaps(report: string): HandoffGap[] {
  return tableRows(report, "Open gaps").map(([component, prop, planned, what]) => ({ component: unticked(component), prop: unticked(prop), planned, what }));
}

/** The dashes the parity report writes for "no Canvas equivalent": em dash, en dash, hyphen. */
const NO_EQUIVALENT = new Set([String.fromCharCode(0x2014), String.fromCharCode(0x2013), "-"]);

/**
 * The settled divergences the hand-off parity report lists, per hand-off component
 * name. The report marks "no Canvas equivalent" (an intentional omission, a web-only
 * prop) with a dash in the equivalent column; it is read as the word `none`.
 */
export function handoffSettled(report: string): HandoffSettled[] {
  return tableRows(report, "Settled divergences").map(([component, prop, kind, equivalent]) => ({
    component: unticked(component),
    prop: unticked(prop),
    kind,
    equivalent: NO_EQUIVALENT.has(equivalent) ? "none" : equivalent,
  }));
}

interface DivergencesFile {
  metricGaps: Record<string, { component: string; canvas: string; handoff: string; plannedIn?: string }>;
}

function walk(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

/** The repo-wide records every component's facts read, loaded once. */
export interface FactsCorpus {
  root: string;
  skins: ComponentSkins[];
  registry: ReturnType<typeof registeredSkins>;
  reference: ReferenceRow[];
  openGaps: HandoffGap[];
  settled: HandoffSettled[];
  metricGaps: MetricGap[];
  /** Repo-relative path and content of every file under test/ and e2e/. */
  tests: { file: string; text: string }[];
  e2e: { file: string; text: string }[];
}

export function loadCorpus(root = ROOT): FactsCorpus {
  const read = (path: string) => readFileSync(join(root, path), "utf8");
  const divergences = JSON.parse(read("tools/handoff-parity/divergences.json")) as DivergencesFile;
  const metricGaps = Object.entries(divergences.metricGaps).map(([id, gap]) => ({
    id,
    component: gap.component,
    canvas: gap.canvas,
    handoff: gap.handoff,
    plannedIn: gap.plannedIn ?? "unscheduled",
  }));
  const tree = (dir: string, pattern: RegExp) =>
    walk(join(root, dir))
      .filter((file) => pattern.test(file))
      .sort()
      .map((file) => ({ file: relative(root, file), text: readFileSync(file, "utf8") }));
  return {
    root,
    skins: componentSkins(join(root, "src")),
    registry: registeredSkins(read("docs/src/core/platform-skins.ts")),
    reference: referenceRows(read("PLATFORM-REFERENCES.md")),
    openGaps: handoffOpenGaps(read("HANDOFF-PARITY.md")),
    settled: handoffSettled(read("HANDOFF-PARITY.md")),
    metricGaps,
    tests: tree("test", /\.tsx?$/),
    e2e: tree("e2e", /\.ts$/),
  };
}

const escapeRegExp = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** The files whose text names one of the words as a whole word, or contains one of the literals. */
function mentions(files: { file: string; text: string }[], words: string[], literals: string[]): string[] {
  const word = words.length ? new RegExp(`\\b(?:${words.map(escapeRegExp).join("|")})\\b`) : null;
  return files.filter(({ text }) => (word?.test(text) ?? false) || literals.some((l) => text.includes(l))).map(({ file }) => file);
}

/** The files among a component's sources whose text names the word. */
function sourcesNaming(root: string, sourceDir: string, files: string[], word: RegExp): string[] {
  return files.filter((file) => word.test(readFileSync(join(root, sourceDir, file), "utf8")));
}

export function componentFacts(slug: string, corpus: FactsCorpus): ComponentFacts {
  const doc = COMPONENTS.find((c) => c.slug === slug);
  if (!doc) throw new Error(`facts: no COMPONENTS entry for ${slug}`);
  const dir = doc.dir ?? doc.slug;
  const group = GROUP_OF[doc.category];
  const sourceDir = `src/${group}/${dir}`;
  const absoluteDir = join(corpus.root, sourceDir);
  const sourceFiles = existsSync(absoluteDir) ? readdirSync(absoluteDir).filter((f) => statSync(join(absoluteDir, f)).isFile()).sort() : [];
  const markdown = relative(corpus.root, componentDocPath(doc.category, dir));

  const entry = [`${dir}.tsx`, `${dir}.ts`].find((f) => sourceFiles.includes(f));
  const exports = entry ? valueExports(entry, readFileSync(join(absoluteDir, entry), "utf8")) : [doc.name.replace(/[^A-Za-z]/g, "")];

  const skins = corpus.skins.find((c) => c.group === group && c.dir === dir);
  const skinFact = (platform: SkinPlatform): SkinFact => ({
    divergent: Boolean(skins?.divergent[platform]),
    exports: Object.fromEntries((skins?.exports ?? []).map((name) => [name, skins?.exportDivergence[name]?.[platform] ?? null])),
  });

  const keys = new Set(corpus.reference.map((row) => row.key));
  const referenceKey = referenceKeyFor(slug, doc.category, keys);
  const route = `/components/${slug}`;
  const isOurs = (component: string) => exports.includes(component);

  return {
    slug,
    name: doc.name,
    category: doc.category,
    dir,
    route,
    sourceDir,
    sourceFiles,
    markdown,
    exports,
    skins: { hasPlatformEntries: skins?.hasPlatformEntries ?? false, iOS: skinFact("iOS"), Android: skinFact("Android") },
    registry: {
      ios: exports.filter((name) => corpus.registry.ios.has(name)),
      android: exports.filter((name) => corpus.registry.android.has(name)),
    },
    reference: referenceKey ? (corpus.reference.find((row) => row.key === referenceKey) ?? null) : null,
    materials: materialCoverage
      .filter((e) => e.docsRoute === `components/${slug}`)
      .map((e) => ({ name: e.name, tier: e.tier, roles: [...e.roles], verification: [...e.verification] })),
    handoff: {
      open: corpus.openGaps.filter((gap) => isOurs(gap.component)),
      settled: corpus.settled.filter((row) => isOurs(row.component)),
      metricGaps: corpus.metricGaps.filter((gap) => isOurs(gap.component)),
    },
    interactions: {
      inInventory: interactionInventory.includes(slug),
      evidence: interactionEvidence.filter((e) => e.components.includes(slug)).map(({ id, layer, file, test }) => ({ id, layer, file, test })),
    },
    overlayRecipe: MATERIAL_OVERLAY_RECIPES.find((r) => r.slug === slug)
      ? { role: MATERIAL_OVERLAY_RECIPES.find((r) => r.slug === slug)!.role }
      : TOAST_RECIPE.slug === slug
        ? { role: "live region" }
        : null,
    tests: mentions(corpus.tests, exports, [route]),
    e2e: mentions(corpus.e2e, exports, [route]),
    measureProps: sourcesNaming(corpus.root, sourceDir, sourceFiles, /\bMeasureProps\b/),
    touchTarget: {
      useMinTargetSlop: sourcesNaming(corpus.root, sourceDir, sourceFiles, /\buseMinTargetSlop\b/),
      minTarget: sourcesNaming(corpus.root, sourceDir, sourceFiles, /\bminTarget\b/),
    },
  };
}

/** The `title` of each entry in the `sections` array of the object literal whose `slug` is the page's. */
export function pageSections(file: string, source: string, slug: string): string[] {
  const sf = parse(file, source);
  const stringOf = (node: ts.ObjectLiteralExpression, key: string): string | null => {
    for (const property of node.properties) {
      if (!ts.isPropertyAssignment(property) || property.name.getText(sf) !== key) continue;
      return ts.isStringLiteral(property.initializer) || ts.isNoSubstitutionTemplateLiteral(property.initializer) ? property.initializer.text : null;
    }
    return null;
  };
  let titles: string[] | null = null;
  const visit = (node: ts.Node): void => {
    if (titles) return;
    if (ts.isObjectLiteralExpression(node) && stringOf(node, "slug") === slug) {
      const sections = node.properties.find((p): p is ts.PropertyAssignment => ts.isPropertyAssignment(p) && p.name.getText(sf) === "sections");
      if (sections && ts.isArrayLiteralExpression(sections.initializer)) {
        titles = sections.initializer.elements.flatMap((element) => (ts.isObjectLiteralExpression(element) ? [stringOf(element, "title") ?? "(untitled)"] : []));
        return;
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return titles ?? [];
}

/** The names a module imports from `@nannier/canvas`. */
export function kitImports(file: string, source: string): string[] {
  const names: string[] = [];
  for (const statement of parse(file, source).statements) {
    if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier) || statement.moduleSpecifier.text !== "@nannier/canvas") continue;
    const bindings = statement.importClause?.namedBindings;
    if (bindings && ts.isNamedImports(bindings)) for (const element of bindings.elements) names.push(element.name.text);
  }
  return names.sort();
}

export function pageFacts(page: InventoryPage, corpus: FactsCorpus): PageFacts {
  const module = page.kind === "pattern" ? "docs/src/core/data/patterns.tsx" : `docs/src/core/data/templates/${page.slug}.tsx`;
  const source = readFileSync(join(corpus.root, module), "utf8");
  return {
    kind: page.kind,
    slug: page.slug,
    route: page.route,
    module,
    sections: pageSections(module, source, page.slug),
    kitImports: kitImports(module, source),
    e2e: mentions(corpus.e2e, [], [page.route]),
  };
}

if (import.meta.main) {
  const slug = process.argv[2];
  if (!slug) {
    console.error("usage: bun tools/audit/facts.ts <component slug>");
    process.exit(2);
  }
  console.log(JSON.stringify(componentFacts(slug, loadCorpus()), null, 2));
}
