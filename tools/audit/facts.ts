// Per-component facts for the audit checklists, gathered from the repo's own records
// with no React Native import, so it runs under plain bun: the docs catalog, the skin
// divergence read from source text, the docs' platform-skin registry, the platform
// reference catalog, the materials manifest, the hand-off parity records, the
// interaction evidence registry, the overlay recipes, the test and e2e trees, and the
// component's own source directory. Each fact names where it came from, so a reviewer
// can go and look; none of them is a verdict.
//
// The hand-off parity records come from their source, `tools/handoff-parity/
// divergences.json`, never from the HANDOFF-PARITY.md generated from it. Which records
// apply to a component (a `global` record covers every hand-off prop the kit lacks
// under that name) depends on the hand-off snapshot and the kit's built prop surface,
// so those are read through tools/handoff-parity/compare.ts, the same comparison the
// report is generated from; it reads dist/, so `bun run build` comes first (CI and the
// pre-push hook build before the audit check).
//
// `bun tools/audit/facts.ts <slug>` prints one component's facts as JSON.

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import ts from "typescript";
import { COMPONENTS } from "../../docs/src/core/data/components.ts";
import type { Category } from "../../docs/src/core/data/types.ts";
import { ROOT, componentDocPath } from "../../e2e/support/routes.ts";
import { MATERIAL_OVERLAY_RECIPES, TOAST_RECIPE } from "../../e2e/support/overlay-recipes.ts";
import { KIND_LABEL, compareCheckout, isGap, redirectTargets } from "../handoff-parity/compare.ts";
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
  /** Files under test/ importing it from the kit (see `importsComponent`). */
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

function walk(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

/** The hand-off parity records of a checkout, per hand-off component, in the report's order. */
export function handoffRecords(root: string): { open: HandoffGap[]; settled: HandoffSettled[]; metricGaps: MetricGap[] } {
  const { divergences, comparison } = compareCheckout(root);
  const open: HandoffGap[] = [];
  const settled: HandoffSettled[] = [];
  for (const row of comparison.classified) {
    const d = row.divergence!;
    if (isGap(d)) open.push({ component: row.component, prop: row.prop, planned: d.plannedIn ?? "unscheduled", what: d.reason });
    else {
      // A record with no redirect target is "no Canvas equivalent" (an intentional omission, a
      // web-only prop): the report draws a dash, the facts say none.
      const targets = redirectTargets(d);
      settled.push({ component: row.component, prop: row.prop, kind: KIND_LABEL[d.kind], equivalent: targets.length ? targets.map((t) => `\`${t}\``).join(", ") : "none" });
    }
  }
  const metricGaps = Object.entries(divergences.metricGaps).map(([id, gap]) => ({
    id,
    component: gap.component,
    canvas: gap.canvas,
    handoff: gap.handoff,
    plannedIn: gap.plannedIn ?? "unscheduled",
  }));
  return { open, settled, metricGaps };
}

/** What a test file imports from the kit. */
export interface KitImports {
  /**
   * The repo-relative kit paths it imports, statically, through `import()` or through
   * `require()`. A template literal specifier contributes its static head as a `prefix`
   * (`../src/atoms/avatar/${file}.tsx` is somewhere under `src/atoms/avatar/`).
   */
  modules: { path: string; prefix: boolean }[];
  /**
   * The names it imports from a kit module: named imports, the names a dynamic import is
   * destructured into or read by, and the members read off a namespace import.
   */
  names: Set<string>;
}

const KIT_PACKAGE = "@nannier/canvas";

/** The repo-relative path a specifier reaches in the kit (`src/`, `dist/`, the package), or null outside it. */
function kitPath(root: string, file: string, specifier: string): string | null {
  if (specifier === KIT_PACKAGE || specifier.startsWith(`${KIT_PACKAGE}/`)) return "src";
  if (!specifier.startsWith(".")) return null;
  const path = relative(root, resolve(root, dirname(file), specifier)).split(sep).join("/");
  return /^(src|dist)(\/|$)/.test(path) ? path : null;
}

/** The expression a dynamic import's value lands in, past `await`, parentheses and casts. */
function importUse(call: ts.Node): ts.Node {
  let node = call;
  while (
    ts.isAwaitExpression(node.parent) ||
    ts.isParenthesizedExpression(node.parent) ||
    ts.isAsExpression(node.parent) ||
    ts.isSatisfiesExpression(node.parent) ||
    ts.isNonNullExpression(node.parent) ||
    ts.isTypeAssertionExpression(node.parent)
  ) {
    node = node.parent;
  }
  return node;
}

/** What one test file imports from the kit, read with the TypeScript parser. */
export function kitImportsOf(root: string, file: string, source: string): KitImports {
  const sf = parse(file, source);
  const out: KitImports = { modules: [], names: new Set() };
  const namespaces = new Set<string>();
  const visit = (node: ts.Node): void => {
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
      const path = kitPath(root, file, node.moduleSpecifier.text);
      if (path) {
        if (ts.isImportDeclaration(node)) {
          const clause = node.importClause;
          if (clause && !clause.isTypeOnly) {
            out.modules.push({ path, prefix: false });
            const bindings = clause.namedBindings;
            if (bindings && ts.isNamespaceImport(bindings)) namespaces.add(bindings.name.text);
            else if (bindings) for (const element of bindings.elements) if (!element.isTypeOnly) out.names.add((element.propertyName ?? element.name).text);
          }
        } else if (!node.isTypeOnly) {
          out.modules.push({ path, prefix: false });
          if (node.exportClause && ts.isNamedExports(node.exportClause)) {
            for (const element of node.exportClause.elements) if (!element.isTypeOnly) out.names.add((element.propertyName ?? element.name).text);
          }
        }
      }
    } else if (
      ts.isCallExpression(node) &&
      node.arguments.length > 0 &&
      (node.expression.kind === ts.SyntaxKind.ImportKeyword || (ts.isIdentifier(node.expression) && node.expression.text === "require"))
    ) {
      const arg = node.arguments[0];
      const literal = ts.isStringLiteral(arg) || ts.isNoSubstitutionTemplateLiteral(arg) ? arg.text : null;
      const head = ts.isTemplateExpression(arg) ? arg.head.text : null;
      const path = literal !== null ? kitPath(root, file, literal) : head ? kitPath(root, file, head) : null;
      if (path) {
        // A head ending in a slash names a whole directory; resolving it drops the slash.
        out.modules.push(literal !== null ? { path, prefix: false } : { path: head!.endsWith("/") ? `${path}/` : path, prefix: true });
        const use = importUse(node);
        const parent = use.parent;
        if (ts.isPropertyAccessExpression(parent) && parent.expression === use) out.names.add(parent.name.text);
        else if (ts.isElementAccessExpression(parent) && parent.expression === use && ts.isStringLiteral(parent.argumentExpression)) out.names.add(parent.argumentExpression.text);
        else if (ts.isVariableDeclaration(parent) && parent.initializer === use) {
          if (ts.isObjectBindingPattern(parent.name)) {
            for (const element of parent.name.elements) {
              const name = element.propertyName ?? element.name;
              if (ts.isIdentifier(name)) out.names.add(name.text);
            }
          } else if (ts.isIdentifier(parent.name)) namespaces.add(parent.name.text);
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  if (namespaces.size) {
    const members = (node: ts.Node): void => {
      if (ts.isPropertyAccessExpression(node) && ts.isIdentifier(node.expression) && namespaces.has(node.expression.text)) out.names.add(node.name.text);
      ts.forEachChild(node, members);
    };
    members(sf);
  }
  return out;
}

/**
 * Whether a test file tests a component: it imports one of the component's exports from
 * the kit, or any module inside the component's own source directory (its skins, its
 * platform entries, its styles). A word match would count every test that renders a
 * `<View>` or mentions "Text" as a test of the primitive; `View` imported from
 * `react-native` rather than from the kit is not the kit's.
 */
export function importsComponent(imports: KitImports, exports: string[], sourceDir: string): boolean {
  if (exports.some((name) => imports.names.has(name))) return true;
  return imports.modules.some(({ path, prefix }) => path.startsWith(`${sourceDir}/`) || (!prefix && path === sourceDir));
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
  /** Repo-relative path of every test file under test/, with what it imports from the kit. */
  tests: { file: string; imports: KitImports }[];
  /** Repo-relative path and content of every file under e2e/. */
  e2e: { file: string; text: string }[];
}

export function loadCorpus(root = ROOT): FactsCorpus {
  const read = (path: string) => readFileSync(join(root, path), "utf8");
  const handoff = handoffRecords(root);
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
    openGaps: handoff.open,
    settled: handoff.settled,
    metricGaps: handoff.metricGaps,
    tests: tree("test", /\.tsx?$/).map(({ file, text }) => ({ file, imports: kitImportsOf(root, file, text) })),
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
    tests: corpus.tests.filter(({ imports }) => importsComponent(imports, exports, sourceDir)).map(({ file }) => file),
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
