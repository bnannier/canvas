// Per-component facts for the audit checklists, gathered from the repo's own records
// with no React Native import, so it runs under plain bun: the docs catalog, the skin
// divergence read from source text, the docs' platform-skin registry, the platform
// reference catalog, the materials manifest, the hand-off parity records, the
// interaction evidence registry, the overlay recipes, the test and e2e trees (read with
// the static reader in tools/audit/static-eval.ts where they reach the kit or a route
// through data, and the e2e catalog sweeps in tools/audit/sweeps.ts), the touch-target
// coverage test's tables, and the modules that build the component (its own directory,
// or where the kit's entry leads a raw primitive's name). Each fact names where it came
// from, so a reviewer can go and look; none of them is a verdict.
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
import { componentSkins, hasPlatformBuilds, traceExport, type ComponentSkins, type Platform as SkinPlatform } from "../skins/divergence.ts";
import { registeredSkins } from "../skins/registry.ts";
import type { InventoryPage } from "./inventory.ts";
import { StaticReader } from "./static-eval.ts";
import { catalogHooks, readSweeps, type Sweep } from "./sweeps.ts";
import { splitRow, type TableShape } from "./table.ts";

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

/**
 * Where a component is built. Most are built in their own source directory; the raw
 * primitives' directories hold only their markdown, and each is either a kit module
 * outside it (Text and TextInput in src/style/text.tsx, Pressable in
 * src/style/pressable.tsx) or React Native's own component, which the kit re-exports
 * (View and ScrollView, from src/style/primitives.ts). Read by following the kit's
 * public entry, src/index.ts, through its re-exports (tools/skins/divergence.ts,
 * traceExport).
 */
export type Implementation =
  | { kind: "directory"; modules: string[] }
  | { kind: "module"; modules: string[]; reactNative: string | null; platformBuilds: boolean }
  | { kind: "package"; modules: []; specifier: string; name: string; via: string }
  | { kind: "unresolved"; modules: [] };

/** A module of a component whose code names the touch-target vocabulary, with the names it names. */
export interface TouchTargetModule {
  /** The module: relative to the source directory inside it, repo-relative outside it. */
  module: string;
  names: string[];
}

/** How test/touch-target-coverage.test.ts records a pressable component that declares no `minTarget` in its skin. */
export interface TouchTargetRecord {
  /** Which of its tables lists it. */
  list: "covered another way" | "known gap";
  reason: string;
}

/** What the component's code and the coverage test say about the touch-target floor. */
export interface TouchTargetFact {
  modules: TouchTargetModule[];
  coverage: TouchTargetRecord | null;
}

/** An e2e module that sweeps a catalog of docs routes including this one (see tools/audit/sweeps.ts). */
export interface SweepFact {
  file: string;
  /** The catalogs whose rows reach the route. */
  catalogs: string[];
}

export interface ComponentFacts {
  slug: string;
  name: string;
  category: Category;
  dir: string;
  route: string;
  /** Repo-relative source directory, when the component has one (the raw primitives have only markdown). */
  sourceDir: string;
  /** Every file under the source directory (nested ones, such as the Checkbox indicator, included), relative to it. */
  sourceFiles: string[];
  /** The TypeScript modules among them, tests left out. */
  sourceModules: string[];
  /** Where it is built; its `modules` (repo-relative) are what the source facts read. */
  implementation: Implementation;
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
  /**
   * Files under e2e/ importing it from the kit, or naming the exact route (see
   * `drivesRoute`) of its docs page or of a hidden `/testing/*` harness page that renders
   * it, in a string their code holds or builds.
   */
  e2e: string[];
  /** Files under e2e/ that sweep a catalog of docs routes including its page. */
  e2eSweeps: SweepFact[];
  /** Implementation modules whose code names the measure axis (`MeasureProps`), displayed as `TouchTargetModule.module` is. */
  measureProps: string[];
  /** Implementation modules whose code names the touch-target vocabulary (`touchTargetVocabulary`), and the coverage test's record of it. */
  touchTarget: TouchTargetFact;
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
  /** Files under e2e/ naming its exact route (see `drivesRoute`) in a string their code holds or builds. */
  e2e: string[];
  /** Files under e2e/ that sweep a catalog of docs routes including it. */
  e2eSweeps: SweepFact[];
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

/** The catalog's table, read with the one table reader every audit table goes through. */
const REFERENCE_SHAPE: TableShape = { name: "PLATFORM-REFERENCES.md", columns: ["Component", "Treatment", "Build", "iOS", "Android", "Web"], minCells: 6 };

/** Every row of the catalog's table in `PLATFORM-REFERENCES.md`. */
export function referenceRows(markdown: string): ReferenceRow[] {
  const rows: ReferenceRow[] = [];
  markdown.split("\n").forEach((line, i) => {
    if (!line.startsWith("| ") || /^\|\s*Component\s*\|/.test(line) || /^\|-+\|/.test(line.replace(/\s/g, ""))) return;
    const split = splitRow(line, REFERENCE_SHAPE);
    if ("reason" in split) throw new Error(`PLATFORM-REFERENCES.md:${i + 1}: ${split.reason}: ${line}`);
    const [component, treatment, build, ios, android, web] = split.cells;
    rows.push({ key: component.split(" ")[0], component, treatment, build, ios: classifyCell(ios), android: classifyCell(android), web: classifyCell(web) });
  });
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

/** Every file under a directory, relative to it with forward slashes, sorted. */
function filesUnder(dir: string): string[] {
  return walk(dir)
    .map((path) => relative(dir, path).split(sep).join("/"))
    .sort();
}

/** Whether a file is a TypeScript module of the component's source rather than its markdown or a test. */
export const isSourceModule = (file: string): boolean => /\.tsx?$/.test(file) && !/\.(test|spec)\.tsx?$/.test(file);

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

/** What a test, e2e or docs module imports from the kit. */
export interface KitImports {
  /**
   * The repo-relative kit paths it imports, statically, through `import()` or through
   * `require()`. A template literal specifier is read with the static reader
   * (tools/audit/static-eval.ts) once per row of the loops it reads, so
   * `../src/${c.dir}/${c.file}${suffix}.tsx` over a CASES table names each row's module;
   * where a substitution cannot be known, the text before it is a `prefix`
   * (`../src/atoms/avatar/${file}.tsx` is somewhere under `src/atoms/avatar/`).
   */
  modules: { path: string; prefix: boolean }[];
  /**
   * The names it imports from a kit module: named imports, the names a dynamic import is
   * destructured into or read by, and the members read off a namespace import, by name
   * (`mod.Button`) or by a key the static reader can know (`mod[c.name]` over a table).
   */
  names: Set<string>;
}

/**
 * The names the kit is imported under: the package, and the starter's alias of it that
 * the smoke fixtures import (docs/metro.config.js and docs/tsconfig.json resolve both to
 * the kit's source).
 */
const KIT_PACKAGES = ["@nannier/canvas", "@nannier-com/canvas"];

/** The repo-relative path a specifier reaches in the kit (`src/`, `dist/`, the package), or null outside it. */
function kitPath(root: string, file: string, specifier: string): string | null {
  if (KIT_PACKAGES.some((pkg) => specifier === pkg || specifier.startsWith(`${pkg}/`))) return "src";
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
  const reader = new StaticReader(sf);
  const out: KitImports = { modules: [], names: new Set() };
  const namespaces = new Set<string>();
  const seenModules = new Set<string>();
  const addModule = (module: { path: string; prefix: boolean }): void => {
    const key = `${module.path}#${module.prefix}`;
    if (seenModules.has(key)) return;
    seenModules.add(key);
    out.modules.push(module);
  };
  /** The kit modules a dynamic specifier names, one per row of the loops it reads. */
  const dynamicModules = (arg: ts.Expression): { path: string; prefix: boolean }[] => {
    if (ts.isStringLiteral(arg) || ts.isNoSubstitutionTemplateLiteral(arg)) {
      const path = kitPath(root, file, arg.text);
      return path ? [{ path, prefix: false }] : [];
    }
    if (!ts.isTemplateExpression(arg)) return [];
    const found: { path: string; prefix: boolean }[] = [];
    for (const env of reader.envs(arg) ?? [new Map()]) {
      const { text, complete } = reader.templateText(arg, env);
      const path = text ? kitPath(root, file, text) : null;
      // A text ending in a slash names a whole directory; resolving it drops the slash.
      if (path) found.push(complete ? { path, prefix: false } : { path: text.endsWith("/") ? `${path}/` : path, prefix: true });
    }
    return found;
  };
  const visit = (node: ts.Node): void => {
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
      const path = kitPath(root, file, node.moduleSpecifier.text);
      if (path) {
        if (ts.isImportDeclaration(node)) {
          const clause = node.importClause;
          if (clause && !clause.isTypeOnly) {
            addModule({ path, prefix: false });
            const bindings = clause.namedBindings;
            if (bindings && ts.isNamespaceImport(bindings)) namespaces.add(bindings.name.text);
            else if (bindings) for (const element of bindings.elements) if (!element.isTypeOnly) out.names.add((element.propertyName ?? element.name).text);
          }
        } else if (!node.isTypeOnly) {
          addModule({ path, prefix: false });
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
      const modules = dynamicModules(node.arguments[0]);
      if (modules.length) {
        modules.forEach(addModule);
        const use = importUse(node);
        const parent = use.parent;
        if (ts.isPropertyAccessExpression(parent) && parent.expression === use) out.names.add(parent.name.text);
        else if (ts.isElementAccessExpression(parent) && parent.expression === use) for (const name of reader.strings(parent.argumentExpression)) out.names.add(name);
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
      // `mod[c.name]`: each key the reader can know, across the rows of the loops it reads.
      if (ts.isElementAccessExpression(node) && ts.isIdentifier(node.expression) && namespaces.has(node.expression.text)) {
        for (const name of reader.strings(node.argumentExpression)) out.names.add(name);
      }
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

/** The relative module specifiers a module imports or re-exports statically. */
function relativeImports(file: string, source: string): string[] {
  const out: string[] = [];
  for (const statement of parse(file, source).statements) {
    if (!(ts.isImportDeclaration(statement) || ts.isExportDeclaration(statement))) continue;
    const specifier = statement.moduleSpecifier;
    if (specifier && ts.isStringLiteral(specifier) && specifier.text.startsWith(".")) out.push(specifier.text);
  }
  return out;
}

/** The file a relative specifier names, extension-less or `.js`, or null when none exists. */
function resolveModule(fromFile: string, specifier: string): string | null {
  const base = resolve(dirname(fromFile), specifier);
  const stem = base.replace(/\.js$/, "");
  for (const candidate of [base, `${stem}.tsx`, `${stem}.ts`, join(base, "index.tsx"), join(base, "index.ts")]) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  return null;
}

/** The hidden harness pages under the docs app's `/testing/*` routes. */
export const TESTING_DIR = "docs/src/app/(home)/testing";

/** The shared fixture bodies a harness page renders (CLAUDE.md, the tuning harness). */
const FIXTURES_ROOT = "examples/";

/**
 * What a hidden `/testing/*` harness page renders from the kit: its own kit imports and
 * those of the fixture bodies it imports from `examples/`, followed through the fixtures'
 * own relative imports. The docs' page frame it sits in is scaffolding and is not read.
 */
export function testingRoutes(root: string): { route: string; file: string; imports: KitImports }[] {
  const dir = join(root, TESTING_DIR);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => /^[a-z0-9-]+\.tsx$/.test(name))
    .sort()
    .map((name) => {
      const page = join(dir, name);
      const imports: KitImports = { modules: [], names: new Set() };
      const seen = new Set<string>();
      const read = (path: string, follow: (target: string) => boolean): void => {
        if (seen.has(path)) return;
        seen.add(path);
        const source = readFileSync(path, "utf8");
        const own = kitImportsOf(root, relative(root, path), source);
        imports.modules.push(...own.modules);
        for (const n of own.names) imports.names.add(n);
        for (const specifier of relativeImports(path, source)) {
          const target = resolveModule(path, specifier);
          if (target && follow(target)) read(target, follow);
        }
      };
      read(page, (target) => relative(root, target).split(sep).join("/").startsWith(FIXTURES_ROOT));
      return { route: `/testing/${name.replace(/\.tsx$/, "")}`, file: relative(root, page), imports };
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
  /** Repo-relative path of every test file under test/, with what it imports from the kit. */
  tests: { file: string; imports: KitImports }[];
  /** Repo-relative path of every file under e2e/, with what it reaches (see `e2eReach`). */
  e2e: ({ file: string } & E2eReach)[];
  /** The hidden `/testing/*` harness routes e2e drives, with what each renders from the kit. */
  testingRoutes: ReturnType<typeof testingRoutes>;
  /** The names that implement the touch-target floor (see `touchTargetVocabulary`). */
  touchVocabulary: string[];
  /** The coverage test's record of each pressable component that declares no `minTarget`, by `<group>/<dir>` (see `touchTargetRecords`). */
  touchRecords: Map<string, TouchTargetRecord>;
}

/** What one e2e module reaches. */
export interface E2eReach {
  /** What it imports from the kit. */
  imports: KitImports;
  /**
   * The strings its code holds (see `codeLiterals`) and the strings the static reader can
   * build (`/components/${slug}` over a literal array of slugs); a catalog loop's rows are
   * left unbound here, because its routes are a sweep, not a route the spec names.
   */
  literals: CodeLiteral[];
  /** The loops that sweep a catalog of docs routes (tools/audit/sweeps.ts). */
  sweeps: Sweep[];
}

/** The expressions whose value is a finished string, not a receiver or a callee a larger expression reads further. */
function isStringRoot(node: ts.Node): node is ts.Expression {
  if (!(ts.isTemplateExpression(node) || ts.isCallExpression(node) || ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node) || ts.isConditionalExpression(node))) {
    if (!(ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.PlusToken)) return false;
  }
  const parent = node.parent;
  if ((ts.isPropertyAccessExpression(parent) || ts.isElementAccessExpression(parent)) && parent.expression === node) return false;
  return !(ts.isCallExpression(parent) && parent.expression === node);
}

/** Every string the static reader can build from a module's expressions. */
function builtStrings(reader: StaticReader, sf: ts.SourceFile): CodeLiteral[] {
  const out = new Set<string>();
  const visit = (node: ts.Node): void => {
    if (ts.isTypeNode(node) || ts.isImportDeclaration(node)) return;
    if (isStringRoot(node)) for (const text of reader.strings(node)) out.add(text);
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return [...out].map((text) => ({ text, open: false }));
}

/** What one e2e module reaches: its kit imports, the strings its code holds or builds, and the catalogs it sweeps. */
export function e2eReach(root: string, file: string, source: string): E2eReach {
  const sf = parse(file, source);
  const { sweeps, catalogLoops } = readSweeps({ root, file, sf, reader: new StaticReader(sf, catalogHooks(root, file)) });
  const named = new StaticReader(sf, catalogHooks(root, file, { skipLoop: (loop) => catalogLoops.has(loop) }));
  return { imports: kitImportsOf(root, file, source), literals: [...codeLiterals(file, source), ...builtStrings(named, sf)], sweeps };
}

/** The sweeps among e2e modules that reach a route, per module. */
function sweepsReaching(corpus: FactsCorpus, route: string): SweepFact[] {
  return corpus.e2e.flatMap(({ file, sweeps }) => {
    const reaching = sweeps.filter((sweep) => drivesRoute(sweep.routes.map((text) => ({ text, open: false })), route));
    return reaching.length ? [{ file, catalogs: [...new Set(reaching.flatMap((sweep) => sweep.catalogs))] }] : [];
  });
}

/**
 * The kit's touch-target modules: the platform floor and its measured slop
 * (touch-target.ts), the slop a control seeds from its skin's box (touch-target-seed.ts),
 * the seam split between two of a component's own controls (touch-seam.ts), and the slop
 * a clipping node carries for the pressables inside it (clip-slop.ts).
 */
export const TOUCH_TARGET_MODULES = ["src/style/touch-target.ts", "src/style/touch-target-seed.ts", "src/style/touch-seam.ts", "src/style/clip-slop.ts"];

/** The interface a skin that owns a pressable implements, declared in touch-target.ts: its fields are the skin's half of the floor. */
export const TOUCH_TARGET_SKIN = "TouchTargetSkin";

/**
 * The names that implement the touch-target floor, read from the modules themselves:
 * every value they export, the fields of the skin interface (`minTarget`), and React
 * Native's own `hitSlop`, which every one of them ends in.
 */
export function touchTargetVocabulary(root: string): string[] {
  const names = new Set<string>(["hitSlop"]);
  for (const module of TOUCH_TARGET_MODULES) {
    const source = readFileSync(join(root, module), "utf8");
    for (const name of valueExports(module, source)) names.add(name);
    for (const s of parse(module, source).statements) {
      if (!ts.isInterfaceDeclaration(s) || s.name.text !== TOUCH_TARGET_SKIN) continue;
      for (const m of s.members) if (m.name && ts.isIdentifier(m.name)) names.add(m.name.text);
    }
  }
  return [...names].sort();
}

/** The test that accounts for every pressable component's touch target, and its two tables. */
export const TOUCH_TARGET_COVERAGE = "test/touch-target-coverage.test.ts";
const TOUCH_TARGET_TABLES: Record<string, TouchTargetRecord["list"]> = { COVERED_ANOTHER_WAY: "covered another way", KNOWN_GAP: "known gap" };

/**
 * The coverage test's record of each pressable component whose skin declares no
 * `minTarget`: how it meets the floor another way (a row tall by skin, a slop the shell
 * adds), or the gap it is known to have. Read from the test's own tables, which it
 * holds against every pressable in the kit; a table the reader cannot find is an error,
 * never an empty record.
 */
export function touchTargetRecords(root: string): Map<string, TouchTargetRecord> {
  const sf = parse(TOUCH_TARGET_COVERAGE, readFileSync(join(root, TOUCH_TARGET_COVERAGE), "utf8"));
  const reader = new StaticReader(sf);
  const out = new Map<string, TouchTargetRecord>();
  for (const [table, list] of Object.entries(TOUCH_TARGET_TABLES)) {
    const decl = sf.statements
      .filter(ts.isVariableStatement)
      .flatMap((s) => [...s.declarationList.declarations])
      .find((d) => ts.isIdentifier(d.name) && d.name.text === table);
    const value = decl?.initializer ? reader.evaluate(decl.initializer) : undefined;
    if (value === null || typeof value !== "object" || Array.isArray(value)) throw new Error(`facts: ${TOUCH_TARGET_COVERAGE} has no ${table} table of literal strings to read`);
    for (const [component, reason] of Object.entries(value)) {
      if (typeof reason !== "string") throw new Error(`facts: ${TOUCH_TARGET_COVERAGE} ${table}["${component}"] is not a literal string`);
      out.set(component, { list, reason });
    }
  }
  return out;
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
    e2e: tree("e2e", /\.tsx?$/).map(({ file, text }) => ({ file, ...e2eReach(root, file, text) })),
    testingRoutes: testingRoutes(root),
    touchVocabulary: touchTargetVocabulary(root),
    touchRecords: touchTargetRecords(root),
  };
}

const escapeRegExp = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * A string in a module's code: a string literal, a template without substitutions, or
 * one static piece of a template (`open` when a substitution follows it, so the text
 * does not end there).
 */
export interface CodeLiteral {
  text: string;
  open: boolean;
}

/** The strings a module's code holds, read with the TypeScript parser, so a comment or a word in prose is never one. */
export function codeLiterals(file: string, source: string): CodeLiteral[] {
  const out: CodeLiteral[] = [];
  const visit = (node: ts.Node): void => {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) || ts.isTemplateTail(node)) out.push({ text: node.text, open: false });
    else if (ts.isTemplateHead(node) || ts.isTemplateMiddle(node)) out.push({ text: node.text, open: true });
    ts.forEachChild(node, visit);
  };
  visit(parse(file, source));
  return out;
}

/**
 * Whether a module's strings drive a docs route exactly: the route followed by a
 * character that cannot continue a slug (`/`, `?`, `#`, a quote) or by the end of the
 * string, so `/components/button` is not driven by `/components/button-group`. A
 * template piece that a substitution follows does not end the route there.
 */
export function drivesRoute(literals: CodeLiteral[], route: string): boolean {
  const followed = new RegExp(`${escapeRegExp(route)}(?=[^a-z0-9-])`);
  const ended = new RegExp(`${escapeRegExp(route)}$`);
  return literals.some(({ text, open }) => followed.test(text) || (!open && ended.test(text)));
}

/** The identifiers a module's code names (a comment, a string or markdown never names one). */
const identifierCache = new Map<string, Set<string>>();

function codeIdentifiers(path: string): Set<string> {
  let names = identifierCache.get(path);
  if (!names) {
    const found = new Set<string>();
    const visit = (node: ts.Node): void => {
      if (ts.isIdentifier(node)) found.add(node.text);
      ts.forEachChild(node, visit);
    };
    visit(parse(path, readFileSync(path, "utf8")));
    names = found;
    identifierCache.set(path, names);
  }
  return names;
}

/** A repo-relative module as a fact names it: relative to the component's source directory inside it, repo-relative outside it. */
const displayModule = (sourceDir: string, module: string): string => (module.startsWith(`${sourceDir}/`) ? module.slice(sourceDir.length + 1) : module);

/** The kit's public entry, where a component with no module of its own in its directory is followed from. */
export const KIT_ENTRY = "src/index.ts";

/**
 * Where a component is built: its own directory when that holds its entry module, or
 * else wherever the kit's public entry leads its name, a kit module that declares it or
 * the package it is re-exported from.
 */
export function implementationOf(root: string, sourceDir: string, sourceModules: string[], hasEntry: boolean, name: string): Implementation {
  if (hasEntry) return { kind: "directory", modules: sourceModules.map((m) => `${sourceDir}/${m}`) };
  const trace = traceExport(join(root, KIT_ENTRY), name);
  if (!trace) return { kind: "unresolved", modules: [] };
  const rel = (path: string) => relative(root, path).split(sep).join("/");
  const last = trace.steps[trace.steps.length - 1];
  if (trace.package) return { kind: "package", modules: [], specifier: trace.package.specifier, name: trace.package.name, via: rel(last.file) };
  // Whether the declaring module imports React Native's own component of the same name (and so wraps it).
  const wraps = parse(last.file, readFileSync(last.file, "utf8")).statements.some(
    (s) =>
      ts.isImportDeclaration(s) &&
      ts.isStringLiteral(s.moduleSpecifier) &&
      s.moduleSpecifier.text === "react-native" &&
      !s.importClause?.isTypeOnly &&
      s.importClause?.namedBindings !== undefined &&
      ts.isNamedImports(s.importClause.namedBindings) &&
      s.importClause.namedBindings.elements.some((el) => !el.isTypeOnly && (el.propertyName ?? el.name).text === last.name),
  );
  return { kind: "module", modules: [rel(last.file)], reactNative: wraps ? last.name : null, platformBuilds: hasPlatformBuilds(last.file) };
}

export function componentFacts(slug: string, corpus: FactsCorpus): ComponentFacts {
  const doc = COMPONENTS.find((c) => c.slug === slug);
  if (!doc) throw new Error(`facts: no COMPONENTS entry for ${slug}`);
  const dir = doc.dir ?? doc.slug;
  const group = GROUP_OF[doc.category];
  const sourceDir = `src/${group}/${dir}`;
  const absoluteDir = join(corpus.root, sourceDir);
  const sourceFiles = filesUnder(absoluteDir);
  const sourceModules = sourceFiles.filter(isSourceModule);
  const markdown = relative(corpus.root, componentDocPath(doc.category, dir));

  const entry = [`${dir}.tsx`, `${dir}.ts`].find((f) => sourceFiles.includes(f));
  const exports = entry ? valueExports(entry, readFileSync(join(absoluteDir, entry), "utf8")) : [doc.name.replace(/[^A-Za-z]/g, "")];
  const implementation = implementationOf(corpus.root, sourceDir, sourceModules, entry !== undefined, exports[0]);
  const naming = (identifier: string) => implementation.modules.filter((module) => codeIdentifiers(join(corpus.root, module)).has(identifier));

  const skins = corpus.skins.find((c) => c.group === group && c.dir === dir);
  const skinFact = (platform: SkinPlatform): SkinFact => ({
    divergent: Boolean(skins?.divergent[platform]),
    exports: Object.fromEntries((skins?.exports ?? []).map((name) => [name, skins?.exportDivergence[name]?.[platform] ?? null])),
  });

  const keys = new Set(corpus.reference.map((row) => row.key));
  const referenceKey = referenceKeyFor(slug, doc.category, keys);
  const route = `/components/${slug}`;
  const harnessRoutes = corpus.testingRoutes.filter((t) => importsComponent(t.imports, exports, sourceDir)).map((t) => t.route);
  const isOurs = (component: string) => exports.includes(component);

  return {
    slug,
    name: doc.name,
    category: doc.category,
    dir,
    route,
    sourceDir,
    sourceFiles,
    sourceModules,
    implementation,
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
    // The same import rule as the tests where e2e imports the kit; otherwise the exact
    // route it drives, the component's own docs page or a hidden harness page that
    // renders it (e2e drives routes and imports almost nothing from the kit).
    e2e: corpus.e2e
      .filter(({ imports, literals }) => importsComponent(imports, exports, sourceDir) || [route, ...harnessRoutes].some((r) => drivesRoute(literals, r)))
      .map(({ file }) => file),
    e2eSweeps: sweepsReaching(corpus, route),
    measureProps: naming("MeasureProps").map((module) => displayModule(sourceDir, module)),
    touchTarget: {
      modules: implementation.modules.flatMap((module) => {
        const names = corpus.touchVocabulary.filter((name) => codeIdentifiers(join(corpus.root, module)).has(name));
        return names.length ? [{ module: displayModule(sourceDir, module), names }] : [];
      }),
      coverage: corpus.touchRecords.get(`${group}/${dir}`) ?? null,
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
    e2e: corpus.e2e.filter(({ literals }) => drivesRoute(literals, page.route)).map(({ file }) => file),
    e2eSweeps: sweepsReaching(corpus, page.route),
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
