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
// A fact is exactly true, or loading the corpus fails with the file and line of the code
// it cannot read. Every dynamic import in a test or spec resolves to the modules it
// loads in every way it is reached (a helper's argument at each call site, a table's
// row, a file the test lists from the checkout), and every kit member it reads off a
// namespace resolves to its names; every navigation in a spec resolves to its route,
// and each route it reaches is either one the spec names or one a catalog sweep is
// credited with. Where the reader cannot tell, the corpus throws (UnreadableImport,
// UnreadableNavigation, UnreadableSweep) rather than drop the import or the route. A
// module a test copies into a `mkdtemp` directory outside the checkout has no name the
// reader can know, but it is provably not the kit's (tools/audit/hosts.ts, PathUnder).
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
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import ts from "typescript";
import { COMPONENTS } from "../../docs/src/core/data/components.ts";
import type { Category } from "../../docs/src/core/data/types.ts";
import { ROOT, componentDocPath, variantSlug } from "../../e2e/support/routes.ts";
import { MATERIAL_OVERLAY_RECIPES, TOAST_RECIPE } from "../../e2e/support/overlay-recipes.ts";
import { STATE_RECIPES, recipesOf } from "../../e2e/support/state-recipes.ts";
import { KIND_LABEL, compareCheckout, isGap, redirectTargets } from "../handoff-parity/compare.ts";
import { evidence as interactionEvidence, inventory as interactionInventory } from "../interactions/registry.ts";
import { materialCoverage } from "../materials/manifest.ts";
import { ENTRY, componentSkins, hasPlatformBuilds, resolveSource, traceExport, type ComponentSkins, type Platform as SkinPlatform } from "../skins/divergence.ts";
import { referenceKeyFor, referenceRows, type ReferenceRow } from "../skins/references.ts";
import { registeredSkins } from "../skins/registry.ts";
import { ModuleGraph, NOT_HANDLED, PathUnder, resolveModule, within, type Intercept } from "./hosts.ts";
import { SignalReader } from "./interaction-signals.ts";
import { componentSignals, coverageOf, docsRowsOf, railExamples, type StateAnswer, type Unreachable } from "./state-coverage.ts";
import { pageModule, pageSections, type InventoryPage } from "./inventory.ts";
import type { RowPlatform } from "./probe-math.ts";
import { StaticReader, isValueRead, outermost, unwrap, type Binding } from "./static-eval.ts";
import { catalogIntercept, insideFunctionNamed, navigationRoute, readSweeps, type Sweep } from "./sweeps.ts";

export interface SkinFact {
  /** Whether the platform entry diverges from the web build on this platform, for any export. */
  divergent: boolean;
  /** Per built export: the reason it diverges, or null for the web build. */
  exports: Record<string, string | null>;
  /**
   * The component's exports the platform entry passes on without building them (BadgeGroup
   * beside Badge, GridItem beside Grid): re-exported from a module that is one build on
   * every platform, so `exports` (the builds) does not list them.
   */
  shared: string[];
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

/** A component's interaction states in the state table (e2e/support/state-recipes.ts), and how the table answers the states its source gives it (tools/audit/state-coverage.ts). */
export interface StatesFact {
  /** Whether the table has an entry (it lists exactly the interaction registry's components). */
  listed: boolean;
  /**
   * The recipes the web runner applies (what it sets up, read from the table and never from a
   * capture, since the facts are the source's alone): the example (variant key and rail
   * label), the rows, the widths, the other states its capture shows, whether it is applied
   * inside an overlay it opens first, and the overlay it opens when its source renders more
   * than one.
   */
  recipes: { state: string; variant: string; label: string; rows: string[]; widths: string[]; alsoAnswers: string[]; inOverlay: boolean; opens: string | null }[];
  /** Why it has no state of its own, when the table says so. */
  static: string | null;
  /** States its source gives that the table exempts, each with its reason and why the claim fails (null: it holds). */
  exempt: { state: string; reason: string; failure: string | null }[];
  /** States its source gives with neither a recipe nor an exemption (with the overlay it is in, and the rows it is on when not every row). */
  unanswered: string[];
  /** Where its source disables a control no rail example asks for: `its own surface`, or `the overlay in <name>` (and the rows, when not every row). */
  unshown: string[];
  /**
   * The states its source says the web runner can never show, each with where it is and why:
   * one its source gives only in builds no row of its docs page renders, and one whose only
   * feedback on a row is one react-native-web does not draw (`android_ripple`), both judged on
   * devices; and a recipe's state the source never announces on the web (a field disabled
   * only through `editable`, read-only there), whose cell records that finding.
   */
  unreachable: string[];
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
  /** Its interaction states: what the audit captures, and what it exempts with a verified reason. */
  states: StatesFact;
  /**
   * The test files under test/ (the files `bun test` runs, `*.test.ts(x)`) importing it
   * from the kit, themselves or through the support modules they reach under test/ (see
   * `importsComponent`, `isTestFile`).
   */
  tests: string[];
  /**
   * The e2e specs (`e2e/**\/*.e2e.ts`, the starter's and the audit's own left out) importing
   * it from the kit, themselves or through their support modules, or naming the exact
   * route (see `drivesRoute`) of its docs page or of a hidden `/testing/*` harness page
   * that renders it: in a string literal, or as the route a navigation of theirs builds
   * outside a catalog sweep.
   */
  e2e: string[];
  /** The e2e specs that sweep a catalog of docs routes including its page. */
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
  /**
   * The kit names the page's own entry in the module uses: the value imports from
   * `@nannier/canvas` its code names, through the module's local functions and consts it
   * reaches (`pageKitNames`), so a pattern is not credited with its siblings' imports.
   */
  kitNames: string[];
  /** The e2e specs naming its exact route (see `drivesRoute`): in a string literal, or as the route a navigation of theirs builds. */
  e2e: string[];
  /** The e2e specs that sweep a catalog of docs routes including it. */
  e2eSweeps: SweepFact[];
}

const GROUP_OF: Record<Category, string> = { Atoms: "atoms", Molecules: "molecules", Organisms: "organisms", Charts: "charts" };

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

/** What a test, e2e or docs module imports from the kit, and the other repo modules it reaches. */
export interface KitImports {
  /**
   * The repo-relative kit paths it imports (`src/...`, `dist/...`, `src` for the package),
   * statically, through `import()` or through `require()`. A specifier that is not a
   * literal is read with the static reader (tools/audit/static-eval.ts) in every way the
   * import is reached: once per row of the loops around it, once per call of the helper it
   * is in with that call's arguments (test/touch-target-clips.test.tsx's `entry(path,
   * name)`), and from the files a test lists in the checkout. One it cannot read fails
   * the corpus (UnreadableImport) rather than being dropped.
   */
  modules: string[];
  /**
   * The names it imports from a kit module: named imports, the names a dynamic import is
   * destructured into or read by, and the members read off a namespace (through any
   * parentheses or cast), by name (`mod.Button`), by a key the static reader can know
   * (`mod[c.name]` over a table, `(kit as Record<string, unknown>)[name]` over a literal
   * list), or by `spyOn(ns, "View")`.
   */
  names: Set<string>;
  /** The kit namespaces it reads whole (handed to a call, spread, enumerated), by line: the corpus judges whether one can reach a component's name. */
  whole: WholeUse[];
  /** The repo modules it reaches outside the kit (repo-relative): what it imports, and the paths it builds to a test's support module. */
  reaches: string[];
}

/** A kit namespace read whole, where. */
export interface WholeUse {
  file: string;
  module: string;
  line: number;
  what: string;
}

/** An import (or a member read off one) the reader cannot resolve, so a fact would drop what it loads. */
export class UnreadableImport extends Error {
  constructor(file: string, line: number, what: string) {
    super(
      `${file}:${line}: ${what}; the audit facts cannot tell what it loads from the kit. Name the module and its members in literals, a table the reader can evaluate, or a helper's arguments (tools/audit/static-eval.ts, tools/audit/hosts.ts)`,
    );
    this.name = "UnreadableImport";
  }
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
  const bare = specifier.replace(/\?.*$/, "");
  if (!bare.startsWith(".") && !isAbsolute(bare)) return null;
  const path = relative(root, isAbsolute(bare) ? bare : resolve(root, dirname(file), bare)).split(sep).join("/");
  return /^(src|dist)(\/|$)/.test(path) ? path : null;
}

/** The repo module a non-kit specifier reaches (repo-relative), or null for a package or a path that does not resolve. */
function repoModule(root: string, file: string, specifier: string): string | null {
  const bare = specifier.replace(/\?.*$/, "");
  if (!bare.startsWith(".") && !isAbsolute(bare)) return null;
  const target = resolveModule(resolve(root, file), bare);
  return target && within(root, target) ? relative(root, target).split(sep).join("/") : null;
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

/** The modules' `spyOn`: `spyOn(object, key)` reads the member `key` off `object`. */
const SPY_MODULES = ["bun:test", "vitest", "@jest/globals"];

function isSpyOn(reader: StaticReader, callee: ts.Expression): boolean {
  const e = unwrap(callee);
  if (ts.isIdentifier(e)) {
    const b = reader.resolve(e);
    return b?.kind === "import" && b.imported === "spyOn" && SPY_MODULES.includes(b.specifier);
  }
  return ts.isPropertyAccessExpression(e) && e.name.text === "spyOn" && ts.isIdentifier(e.expression) && ["jest", "vi"].includes(e.expression.text) && !reader.resolve(e.expression);
}

/**
 * Every string an expression is, in every way it is reached, and what keeps the reader
 * from knowing it: a value it cannot read, or (where `relevant` says the value matters) a
 * way it is reached under a doubt that filters the rows, since the strings would then
 * not be exactly the ones that occur. A doubt only about whether the code runs at all (an
 * exported helper) leaves the strings what they are wherever it runs.
 */
export function resolvedStrings(
  reader: StaticReader,
  expr: ts.Expression,
  relevant: (value: string) => boolean = () => true,
  accept: (value: unknown) => boolean = () => false,
): { strings: string[]; problems: string[] } {
  const { reached, overflow } = reader.values(expr);
  const strings = new Set<string>();
  const problems = new Set<string>();
  if (overflow) problems.add(overflow);
  // An expression that reads no row, parameter or let is the same wherever it runs, so a
  // doubt can only say whether it runs, never change which strings it is.
  const constant = reader.idsRead(expr).size === 0;
  for (const r of reached) {
    if (accept(r.value)) continue;
    if (typeof r.value !== "string") {
      const why = [...r.notes, ...(r.doubt ? [r.doubt.why] : [])];
      problems.add(why.length ? `its value cannot be read (${why.join("; ")})` : "its value cannot be read");
    } else if (r.doubt?.filters && !constant) {
      if (relevant(r.value)) problems.add(`the reader cannot tell which rows reach it (${r.doubt.why})`);
    } else strings.add(r.value);
  }
  return { strings: [...strings], problems: [...problems] };
}

const lineOf = (sf: ts.SourceFile, node: ts.Node): number => sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;

/** One line of source, shortened, for a message. */
function snippet(sf: ts.SourceFile, node: ts.Node): string {
  const text = node.getText(sf).replace(/\s+/g, " ");
  return text.length > 70 ? `${text.slice(0, 67)}...` : text;
}

/** What one module imports from the kit, read with the TypeScript parser and the static reader. */
export function kitImportsOf(root: string, file: string, source: string, reader: StaticReader = new ModuleGraph(root).reader(file, source)): KitImports {
  const sf = reader.sf;
  const out: KitImports = { modules: [], names: new Set(), whole: [], reaches: [] };
  const addModule = (path: string): void => {
    if (!out.modules.includes(path)) out.modules.push(path);
  };
  const reach = (path: string | null): void => {
    if (path && !out.reaches.includes(path)) out.reaches.push(path);
  };
  /** The names a key expression reads, or the corpus fails. */
  const keys = (expr: ts.Expression, at: ts.Node, what: string): void => {
    const { strings, problems } = resolvedStrings(reader, expr);
    if (problems.length) throw new UnreadableImport(file, lineOf(sf, at), `${what} by a key the reader cannot know (${problems.join("; ")})`);
    for (const name of strings) out.names.add(name);
  };
  /** The names a binding pattern destructures off a kit module. */
  const pattern = (name: ts.BindingName, modules: string[], at: ts.Node): void => {
    if (ts.isArrayBindingPattern(name)) {
      for (const module of modules) out.whole.push({ file, module, line: lineOf(sf, at), what: snippet(sf, at) });
      return;
    }
    if (!ts.isObjectBindingPattern(name)) return;
    for (const element of name.elements) {
      if (element.dotDotDotToken) {
        for (const module of modules) out.whole.push({ file, module, line: lineOf(sf, at), what: `${snippet(sf, at)} (a rest element)` });
        continue;
      }
      const key = element.propertyName ?? element.name;
      if (ts.isIdentifier(key) || ts.isStringLiteral(key)) out.names.add(key.text);
      else if (ts.isComputedPropertyName(key)) keys(key.expression, at, "it destructures a member of the kit");
    }
  };
  /** Namespaces of kit modules: the binding's name, the modules it may hold, and whether a name read elsewhere is this binding. */
  const namespaces: { id: ts.Identifier; modules: string[]; refers: (b: Binding | null) => boolean }[] = [];
  /** A module a test copies into a run-time directory outside the checkout: provably not the kit's. */
  const outside = (value: unknown): boolean => value instanceof PathUnder && !within(root, value.dir) && !within(value.dir, root);

  const visit = (node: ts.Node): void => {
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
      const specifier = node.moduleSpecifier.text;
      const path = kitPath(root, file, specifier);
      const typeOnly = ts.isImportDeclaration(node) ? node.importClause?.isTypeOnly === true : node.isTypeOnly;
      if (!path) {
        if (!typeOnly) reach(repoModule(root, file, specifier));
      } else if (ts.isImportDeclaration(node)) {
        const clause = node.importClause;
        if (!clause) addModule(path);
        else if (!clause.isTypeOnly) {
          addModule(path);
          const bindings = clause.namedBindings;
          if (bindings && ts.isNamespaceImport(bindings)) {
            namespaces.push({ id: bindings.name, modules: [path], refers: (b) => b?.kind === "import" && b.imported === "*" && b.specifier === specifier });
          } else if (bindings) for (const element of bindings.elements) if (!element.isTypeOnly) out.names.add((element.propertyName ?? element.name).text);
        }
      } else if (!node.isTypeOnly) {
        addModule(path);
        if (node.exportClause && ts.isNamedExports(node.exportClause)) {
          for (const element of node.exportClause.elements) if (!element.isTypeOnly) out.names.add((element.propertyName ?? element.name).text);
        } else out.whole.push({ file, module: path, line: lineOf(sf, node), what: snippet(sf, node) });
      }
    } else if (
      ts.isCallExpression(node) &&
      node.arguments.length > 0 &&
      (node.expression.kind === ts.SyntaxKind.ImportKeyword || (ts.isIdentifier(node.expression) && node.expression.text === "require" && !reader.resolve(node.expression)))
    ) {
      const arg = node.arguments[0];
      const literal = ts.isStringLiteral(arg) || ts.isNoSubstitutionTemplateLiteral(arg) ? arg.text : null;
      const resolved = literal !== null ? { strings: [literal], problems: [] } : resolvedStrings(reader, arg, (value) => kitPath(root, file, value) !== null, outside);
      if (resolved.problems.length) throw new UnreadableImport(file, lineOf(sf, node), `\`${snippet(sf, node)}\`: ${resolved.problems.join("; ")}`);
      const modules: string[] = [];
      for (const specifier of resolved.strings) {
        const path = kitPath(root, file, specifier);
        if (path) modules.push(path);
        else reach(repoModule(root, file, specifier));
      }
      if (modules.length) {
        modules.forEach(addModule);
        const use = importUse(node);
        const parent = use.parent;
        if (ts.isPropertyAccessExpression(parent) && parent.expression === use) out.names.add(parent.name.text);
        else if (ts.isElementAccessExpression(parent) && parent.expression === use) keys(parent.argumentExpression, parent, "it reads a member of the kit");
        else if (ts.isVariableDeclaration(parent) && parent.initializer === use) {
          const name = parent.name;
          if (ts.isIdentifier(name)) namespaces.push({ id: name, modules, refers: (b) => b?.kind === "const" && b.id === name });
          else pattern(name, modules, parent);
        } else if (!ts.isExpressionStatement(parent)) for (const module of modules) out.whole.push({ file, module, line: lineOf(sf, node), what: snippet(sf, parent) });
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);

  // The members read off each namespace, wherever its name is read (through parentheses and casts).
  for (const ns of namespaces) {
    for (const ref of reader.identifiersNamed(ns.id.text)) {
      if (ref === ns.id || !isValueRead(ref) || !ns.refers(reader.resolve(ref))) continue;
      const outer = outermost(ref);
      const parent = outer.parent;
      if (ts.isPropertyAccessExpression(parent) && parent.expression === outer) out.names.add(parent.name.text);
      else if (ts.isElementAccessExpression(parent) && parent.expression === outer) keys(parent.argumentExpression, parent, "it reads a member of a kit namespace");
      else if (ts.isCallExpression(parent) && parent.arguments[0] === outer && parent.arguments[1] && isSpyOn(reader, parent.expression)) keys(parent.arguments[1], parent, "it spies on a member of a kit namespace");
      else if (ts.isVariableDeclaration(parent) && parent.initializer === outer && !ts.isIdentifier(parent.name)) pattern(parent.name, ns.modules, parent);
      else if (!ts.isTypeOfExpression(parent)) for (const module of ns.modules) out.whole.push({ file, module, line: lineOf(sf, ref), what: snippet(sf, parent) });
    }
  }
  return out;
}

/**
 * Whether a module tests a component: it imports one of the component's exports from the
 * kit, or any module inside the component's own source directory (its skins, its
 * platform entries, its styles). A word match would count every test that renders a
 * `<View>` or mentions "Text" as a test of the primitive; `View` imported from
 * `react-native` rather than from the kit is not the kit's.
 */
export function importsComponent(imports: KitImports, exports: string[], sourceDir: string): boolean {
  if (exports.some((name) => imports.names.has(name))) return true;
  return imports.modules.some((path) => path === sourceDir || path.startsWith(`${sourceDir}/`));
}

/** The relative module specifiers a module imports or re-exports statically, values only. */
function relativeImports(file: string, source: string): string[] {
  const out: string[] = [];
  for (const statement of parse(file, source).statements) {
    if (!(ts.isImportDeclaration(statement) || ts.isExportDeclaration(statement))) continue;
    if (ts.isImportDeclaration(statement) ? statement.importClause?.isTypeOnly : statement.isTypeOnly) continue;
    const specifier = statement.moduleSpecifier;
    if (specifier && ts.isStringLiteral(specifier) && specifier.text.startsWith(".")) out.push(specifier.text);
  }
  return out;
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
export function testingRoutes(root: string, graph = new ModuleGraph(root)): { route: string; file: string; imports: KitImports }[] {
  const dir = join(root, TESTING_DIR);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => /^[a-z0-9-]+\.tsx$/.test(name))
    .sort()
    .map((name) => {
      const page = join(dir, name);
      const imports: KitImports = { modules: [], names: new Set(), whole: [], reaches: [] };
      const seen = new Set<string>();
      const read = (path: string, follow: (target: string) => boolean): void => {
        if (seen.has(path)) return;
        seen.add(path);
        const source = readFileSync(path, "utf8");
        const rel = relative(root, path).split(sep).join("/");
        const own = kitImportsOf(root, rel, source, graph.reader(rel));
        for (const module of own.modules) if (!imports.modules.includes(module)) imports.modules.push(module);
        for (const n of own.names) imports.names.add(n);
        imports.whole.push(...own.whole);
        for (const specifier of relativeImports(path, source)) {
          const target = resolveModule(path, specifier);
          if (target && follow(target)) read(target, follow);
        }
      };
      read(page, (target) => relative(root, target).split(sep).join("/").startsWith(FIXTURES_ROOT));
      return { route: `/testing/${name.replace(/\.tsx$/, "")}`, file: relative(root, page), imports };
    });
}

/** The files `bun test` runs: `*.test.ts(x)` and `*.spec.ts(x)` (and their `_test` forms). */
export const isTestFile = (file: string): boolean => /[._](test|spec)\.[cm]?[jt]sx?$/.test(file);

/** The e2e trees that are not the docs suite: the starter app's own (its own baseURL), and the audit's capture runner. */
export const E2E_EXCLUDED = ["e2e/starter/", "e2e/audit/"];

/** The docs e2e specs: what playwright.config.ts runs (`**\/*.e2e.ts` under e2e/), the excluded trees left out. */
export const isSpecFile = (file: string): boolean => /\.e2e\.ts$/.test(file) && !E2E_EXCLUDED.some((dir) => file.startsWith(dir));

/**
 * The docs suite's mount prefix (e2e/support/docs.ts `BASE_PATH`, from E2E_BASE_PATH): a
 * URL the suite builds is the prefix followed by a docs route, and no docs route holds
 * the prefix, so the reader takes it as empty when it builds the route a navigation
 * drives (`${BASE_PATH}/privacy/` drives `/privacy`).
 */
export const MOUNT_PREFIX = { module: "e2e/support/docs", name: "BASE_PATH" };

/** What the e2e readers are handed for an import: a catalog's rows (tools/audit/sweeps.ts), or the mount prefix. */
export function e2eIntercept(root: string): Intercept {
  const catalogs = catalogIntercept(root);
  return (file, specifier, imported) => {
    const caught = catalogs(file, specifier, imported);
    if (caught !== NOT_HANDLED || !specifier.startsWith(".") || imported !== MOUNT_PREFIX.name) return caught;
    const module = relative(root, resolve(dirname(file), specifier)).split(sep).join("/").replace(/\.(tsx?|js)$/, "");
    return module === MOUNT_PREFIX.module ? "" : NOT_HANDLED;
  };
}

/** The module of the docs suite's navigation primitive, whose own `page.goto` is the navigation every `gotoDocs` call makes. */
export const NAVIGATION_PRIMITIVE = { file: "e2e/support/docs.ts", name: "gotoDocs" };

/** A navigation the reader cannot resolve, or one whose route the facts would neither name nor sweep. */
export class UnreadableNavigation extends Error {
  constructor(file: string, line: number, what: string) {
    super(`${file}:${line}: ${what}; the audit facts cannot tell which docs route it drives (tools/audit/static-eval.ts, tools/audit/sweeps.ts)`);
    this.name = "UnreadableNavigation";
  }
}

/** One navigation of a spec. */
export interface Navigation {
  line: number;
  /** The routes it names: what its route comes to with the catalogs' loop rows left unbound. */
  named: string[];
  /** Every route it reaches. */
  all: string[];
}

/** What one e2e module reaches. */
export interface E2eReach {
  /** What it imports from the kit. */
  imports: KitImports;
  /**
   * The strings its code holds (see `codeLiterals`) and the routes its navigations name
   * (with a catalog loop's rows left unbound, because those routes are a sweep, not a
   * route the spec names).
   */
  literals: CodeLiteral[];
  /** The loops that sweep a catalog of docs routes (tools/audit/sweeps.ts). */
  sweeps: Sweep[];
  navigations: Navigation[];
}

/**
 * What one e2e module reaches: its kit imports, its literals and the routes it names,
 * and the catalogs it sweeps. Every navigation (`gotoDocs`, `page.goto`) must resolve to
 * its routes in every way it is reached, and every route it reaches must be one the
 * module names or one a sweep of it is credited with; otherwise UnreadableNavigation.
 */
export function e2eReach(root: string, file: string, source: string, graph = new ModuleGraph(root, e2eIntercept(root))): E2eReach {
  const full = graph.reader(file, source);
  const sf = full.sf;
  const { sweeps, catalogLoops } = readSweeps({ root, file, sf, reader: full });
  const named = new StaticReader(sf, graph.hooks(resolve(root, file), { skipLoop: (loop) => catalogLoops.has(loop) }));
  const literals = codeLiterals(file, source);
  const navigations: Navigation[] = [];
  const primitive = file === NAVIGATION_PRIMITIVE.file;
  const visit = (node: ts.Node): void => {
    if (ts.isCallExpression(node)) {
      const route = navigationRoute(node);
      if (route && !(primitive && insideFunctionNamed(node, NAVIGATION_PRIMITIVE.name))) {
        const line = lineOf(sf, node);
        if (!isSpecFile(file)) throw new UnreadableNavigation(file, line, "a support module navigates, and the facts credit a spec by its own navigations; navigate in the spec, or hand the route to gotoDocs there");
        const all = resolvedStrings(full, route);
        if (all.problems.length) throw new UnreadableNavigation(file, line, `\`${snippet(sf, node)}\`: ${all.problems.join("; ")}`);
        navigations.push({ line, named: named.strings(route), all: all.strings });
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  // Every route a navigation reaches is named, spelled in a literal, or swept.
  const swept = new Set(sweeps.flatMap((s) => s.routes));
  for (const nav of navigations) {
    for (const route of nav.all) {
      if (nav.named.includes(route) || swept.has(route) || drivesRoute(literals, route)) continue;
      throw new UnreadableNavigation(file, nav.line, `it reaches ${route}, which the facts would neither name nor credit to a catalog sweep`);
    }
  }
  return {
    imports: kitImportsOf(root, file, source, full),
    literals: [...literals, ...navigations.flatMap((nav) => nav.named.map((text) => ({ text, open: false })))],
    sweeps,
    navigations,
  };
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

/** The repo-wide records every component's facts read, loaded once. */
export interface FactsCorpus {
  root: string;
  skins: ComponentSkins[];
  registry: ReturnType<typeof registeredSkins>;
  reference: ReferenceRow[];
  openGaps: HandoffGap[];
  settled: HandoffSettled[];
  metricGaps: MetricGap[];
  /** Every test file under test/ (see `isTestFile`), with what it imports from the kit, itself and through the support modules it reaches. */
  tests: { file: string; imports: KitImports }[];
  /** Every docs e2e spec (see `isSpecFile`), with what it reaches (its imports through its support modules too). */
  e2e: ({ file: string } & E2eReach)[];
  /** The hidden `/testing/*` harness routes e2e drives, with what each renders from the kit. */
  testingRoutes: ReturnType<typeof testingRoutes>;
  /** The names that implement the touch-target floor (see `touchTargetVocabulary`). */
  touchVocabulary: string[];
  /** The coverage test's record of each pressable component that declares no `minTarget`, by `<group>/<dir>` (see `touchTargetRecords`). */
  touchRecords: Map<string, TouchTargetRecord>;
  /** Reads the interaction signals of a component's source (tools/audit/interaction-signals.ts). */
  signals: SignalReader;
}

/** The modules `bun test` preloads into every test (bunfig.toml: the top level and `[test]`), repo-relative. */
export function bunPreload(root: string): string[] {
  const path = join(root, "bunfig.toml");
  if (!existsSync(path)) return [];
  const text = readFileSync(path, "utf8");
  const sections = text.split(/^\[([^\]]+)\]\s*$/m);
  // [top level, name, body, name, body, ...]: the top level and the [test] section apply to tests.
  const bodies = [sections[0], ...sections.flatMap((part, i) => (i % 2 === 1 && part.trim() === "test" ? [sections[i + 1] ?? ""] : []))];
  const out: string[] = [];
  for (const body of bodies) {
    const list = /^\s*preload\s*=\s*\[([^\]]*)\]/m.exec(body)?.[1];
    for (const m of list?.matchAll(/"([^"]+)"/g) ?? []) out.push(relative(root, resolve(root, m[1])).split(sep).join("/"));
  }
  return out;
}

/**
 * The support modules a test names by a path rather than an import (a fixture handed to
 * the TypeScript compiler: test/control-refs-types.test.ts), read wherever a string
 * literal of the test ends in a support module's path: the expression it is part of
 * (the path call it is an argument of, or itself) must resolve to an absolute path, and
 * when it is the support module, the test reaches it. A path the reader cannot build
 * fails the corpus.
 */
function supportMentions(root: string, file: string, reader: StaticReader, support: string[]): string[] {
  const out = new Set<string>();
  const tails = support.map((s) => ({ module: s, tail: s.split("/").slice(1).join("/") }));
  const visit = (node: ts.Node): void => {
    if ((ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) && !ts.isImportDeclaration(node.parent) && !ts.isExportDeclaration(node.parent)) {
      const named = tails.filter(({ module, tail }) => node.text === module || node.text === tail || node.text.endsWith(`/${tail}`));
      const loads = ts.isCallExpression(node.parent) && (node.parent.expression.kind === ts.SyntaxKind.ImportKeyword || (ts.isIdentifier(node.parent.expression) && node.parent.expression.text === "require"));
      if (named.length && !loads) {
        const expr = ts.isCallExpression(node.parent) && node.parent.arguments.includes(node) ? node.parent : node;
        const { strings, problems } = resolvedStrings(reader, expr);
        const line = lineOf(reader.sf, node);
        if (problems.length) throw new UnreadableImport(file, line, `it names ${named.map((n) => n.module).join(", ")} by a path the reader cannot build (${problems.join("; ")})`);
        for (const path of strings) {
          if (!isAbsolute(path)) throw new UnreadableImport(file, line, `it names ${named.map((n) => n.module).join(", ")} by the relative path "${path}", whose base the reader cannot know`);
          const rel = relative(root, path).split(sep).join("/");
          if (named.some((n) => n.module === rel)) out.add(rel);
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(reader.sf);
  return [...out];
}

/** A module's own kit imports merged with those of every support module it reaches (transitively), and which those are. */
function withSupport(file: string, own: Map<string, KitImports>, support: Set<string>, extra: string[] = []): { imports: KitImports; reached: Set<string> } {
  const base = own.get(file)!;
  const imports: KitImports = { modules: [...base.modules], names: new Set(base.names), whole: [...base.whole], reaches: [...base.reaches] };
  const reached = new Set<string>();
  const queue = [...base.reaches.filter((r) => support.has(r)), ...extra];
  while (queue.length) {
    const next = queue.shift()!;
    if (next === file || reached.has(next)) continue;
    reached.add(next);
    const theirs = own.get(next);
    if (!theirs) continue;
    for (const module of theirs.modules) if (!imports.modules.includes(module)) imports.modules.push(module);
    for (const name of theirs.names) imports.names.add(name);
    queue.push(...theirs.reaches.filter((r) => support.has(r)));
  }
  return { imports, reached };
}

/** The value names a module exports, through its `export *` re-exports, or null when one leads where the reader cannot list (a package). */
function exportedNames(file: string, seen = new Set<string>()): Set<string> | null {
  if (seen.has(file)) return new Set();
  seen.add(file);
  const source = readFileSync(file, "utf8");
  const names = new Set(valueExports(file, source));
  for (const s of parse(file, source).statements) {
    if (!ts.isExportDeclaration(s) || s.isTypeOnly || !s.moduleSpecifier || !ts.isStringLiteral(s.moduleSpecifier)) continue;
    if (s.exportClause && ts.isNamespaceExport(s.exportClause)) names.add(s.exportClause.name.text);
    if (s.exportClause) continue;
    const target = s.moduleSpecifier.text.startsWith(".") ? resolveModule(file, s.moduleSpecifier.text) : null;
    const inner = target ? exportedNames(target, seen) : null;
    if (!inner) return null;
    for (const name of inner) names.add(name);
  }
  return names;
}

/** Each component export name, with the source directory of the component that exports it. */
function componentOwners(root: string): Map<string, string> {
  const out = new Map<string, string>();
  for (const doc of COMPONENTS) {
    const { sourceDir, exports } = componentSource(root, doc);
    for (const name of exports) out.set(name, sourceDir);
  }
  return out;
}

/**
 * Judge each kit namespace read whole: harmless when the module exports no component's
 * name other than those of the component whose directory holds it (that component is
 * credited by the module's path anyway); otherwise the facts cannot tell which of those
 * components it uses, and the corpus fails.
 */
function judgeWhole(root: string, uses: WholeUse[], owners: Map<string, string>): void {
  const cache = new Map<string, Set<string> | null>();
  for (const use of uses) {
    const module = use.module === "src" ? "src/index.ts" : use.module;
    if (!cache.has(module)) {
      const target = resolveModule(join(root, "x"), `./${module}`);
      cache.set(module, target ? exportedNames(target) : null);
    }
    const names = cache.get(module)!;
    if (!names) throw new UnreadableImport(use.file, use.line, `it reads the kit module ${use.module} whole (\`${use.what}\`), whose exports the reader cannot list`);
    const reached = [...names].filter((name) => {
      const dir = owners.get(name);
      return dir !== undefined && use.module !== dir && !use.module.startsWith(`${dir}/`);
    });
    if (reached.length) {
      throw new UnreadableImport(
        use.file,
        use.line,
        `it reads the kit module ${use.module} whole (\`${use.what}\`), which exports ${reached.length} component name(s) (${reached.slice(0, 4).join(", ")}${reached.length > 4 ? ", ..." : ""}) the facts cannot tell it uses`,
      );
    }
  }
}

export function loadCorpus(root = ROOT): FactsCorpus {
  const read = (path: string) => readFileSync(join(root, path), "utf8");
  const handoff = handoffRecords(root);
  const files = (dir: string, pattern: RegExp): string[] =>
    walk(join(root, dir))
      .map((file) => relative(root, file).split(sep).join("/"))
      .filter((file) => pattern.test(file))
      .sort();
  const owners = componentOwners(root);

  // The tests, and the support modules under test/ they reach.
  const testGraph = new ModuleGraph(root);
  const testTree = files("test", /\.tsx?$/);
  const testSupport = testTree.filter((file) => !isTestFile(file));
  const ownTests = new Map(testTree.map((file) => [file, kitImportsOf(root, file, read(file), testGraph.reader(file))]));
  for (const file of testTree.filter(isTestFile)) ownTests.get(file)!.reaches.push(...supportMentions(root, file, testGraph.reader(file), testSupport));
  const preload = bunPreload(root);
  const reachedSupport = new Set<string>(preload);
  const tests = testTree.filter(isTestFile).map((file) => {
    const { imports, reached } = withSupport(file, ownTests, new Set(testSupport), preload);
    for (const s of reached) reachedSupport.add(s);
    return { file, imports };
  });
  for (const file of testSupport) {
    const own = ownTests.get(file)!;
    if ((own.modules.length || own.names.size) && !reachedSupport.has(file)) {
      throw new Error(`facts: ${file} imports the kit, but no test the audit can read reaches it (by an import, or by a path the reader can build), so its imports would credit no test`);
    }
  }

  // The docs specs, and the support modules under e2e/ they reach.
  const e2eGraph = new ModuleGraph(root, e2eIntercept(root));
  const e2eTree = files("e2e", /\.tsx?$/).filter((file) => !E2E_EXCLUDED.some((dir) => file.startsWith(dir)));
  const e2eSupport = e2eTree.filter((file) => !isSpecFile(file));
  const reaches = new Map(e2eTree.map((file) => [file, e2eReach(root, file, read(file), e2eGraph)]));
  const ownE2e = new Map([...reaches].map(([file, r]) => [file, r.imports]));
  const reachedE2e = new Set<string>();
  const e2e = e2eTree.filter(isSpecFile).map((file) => {
    const { imports, reached } = withSupport(file, ownE2e, new Set(e2eSupport));
    for (const s of reached) reachedE2e.add(s);
    return { file, ...reaches.get(file)!, imports };
  });
  for (const file of e2eSupport) {
    const own = ownE2e.get(file)!;
    if ((own.modules.length || own.names.size) && !reachedE2e.has(file)) throw new Error(`facts: ${file} imports the kit, but no spec reaches it, so its imports would credit no spec`);
  }

  const harness = testingRoutes(root);
  judgeWhole(root, [...[...ownTests.values()].flatMap((i) => i.whole), ...[...ownE2e.values()].flatMap((i) => i.whole), ...harness.flatMap((h) => h.imports.whole)], owners);

  return {
    root,
    skins: componentSkins(join(root, "src")),
    registry: registeredSkins(read("docs/src/core/platform-skins.ts")),
    reference: referenceRows(read("PLATFORM-REFERENCES.md")),
    openGaps: handoff.open,
    settled: handoff.settled,
    metricGaps: handoff.metricGaps,
    tests,
    e2e,
    testingRoutes: harness,
    touchVocabulary: touchTargetVocabulary(root),
    touchRecords: touchTargetRecords(root),
    signals: new SignalReader(root),
  };
}

/** Why a recipe's state is not reachable on the web, as the checklist says it (`Unreachable.why`). */
const UNREACHABLE_BECAUSE: Record<Unreachable["why"], string> = {
  "read-only":
    "its source disables the field only through `editable`, which react-native-web renders read-only, never `aria-disabled` or a native `disabled`, so the page never announces it disabled and the recipe cannot confirm it",
};

/** What the state table says about a component, and whether its exemptions hold against its source and page. */
export function statesFact(slug: string, doc: { category: Category; dir: string; name: string }, corpus: FactsCorpus): StatesFact {
  const entry = STATE_RECIPES[slug];
  if (!entry) return { listed: false, recipes: [], static: null, exempt: [], unanswered: [], unshown: [], unreachable: [] };
  const rail = railExamples(doc);
  const labelOf = (variant: string) => rail.find((example) => variantSlug(example.label) === variant)?.label ?? variant;
  const coverage = coverageOf(slug, entry, componentSignals(corpus.signals, doc), rail, docsRowsOf(slug, doc, corpus.signals));
  const ROW = { web: "web", ios: "iOS", android: "Android" } as const;
  const rowsText = (rows: readonly RowPlatform[]) => ` on the ${rows.map((row) => ROW[row]).join(" and ")} ${rows.length === 1 ? "row" : "rows"}`;
  const onRows = (a: StateAnswer) => (a.rows ? rowsText(a.rows) : "");
  const inOverlay = (a: StateAnswer) => (a.within ? ` in the overlay in \`${a.within}\`` : "");
  const devices = (a: StateAnswer) =>
    a.feedback
      ? `${a.state}${inOverlay(a)}${onRows(a)}, where its controls' only ${a.state} feedback is \`${a.feedback}\`, which react-native-web does not draw (judged on devices)`
      : `${a.state}${inOverlay(a)} (the ${(a.builds ?? []).map((build) => ROW[build]).join(" and ")} ${(a.builds ?? []).length === 1 ? "build" : "builds"}), which no row of its docs page renders (judged on devices)`;
  return {
    listed: true,
    recipes: recipesOf(slug).map((r) => ({ state: r.state, variant: r.variant, label: labelOf(r.variant), rows: [...r.rows], widths: [...r.widths], alsoAnswers: [...(r.alsoAnswers ?? [])], inOverlay: r.inOverlay === true, opens: r.opens ?? null })),
    static: entry.static ? entry.reason : null,
    exempt: coverage.answers.filter((a) => a.by === "exemption").map((a) => ({ state: a.state, reason: a.exemption!.reason, failure: a.failure ?? null })),
    unanswered: coverage.answers.filter((a) => a.by === "nothing").map((a) => `${a.within ? `${a.state} in the overlay in ${a.within}` : a.state}${onRows(a)}`),
    unshown: coverage.answers.filter((a) => a.by === "unshown").map((a) => `${a.within ? `the overlay in ${a.within}` : "its own surface"}${onRows(a)}`),
    unreachable: [
      ...coverage.answers.filter((a) => a.by === "devices").map(devices),
      ...coverage.unreachable.map((u) => `${u.recipe.state} on ${labelOf(u.recipe.variant)}${u.recipe.inOverlay ? " inside the overlay it opens" : ""}${rowsText(u.rows)}: ${UNREACHABLE_BECAUSE[u.why]}`),
    ],
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

/**
 * The value names a group barrel (`src/<group>/index.ts`) publishes from modules inside
 * one component directory, in the barrel's order: its entry and any sibling module the
 * barrel also re-exports (Reveal's `reveal-group.tsx`, the home of RevealGroup). Empty
 * when the barrel names nothing there (a raw primitive's directory holds only markdown).
 */
function barrelExports(root: string, group: string, sourceDir: string): string[] {
  const barrel = join(root, "src", group, "index.ts");
  const dir = join(root, sourceDir);
  const names: string[] = [];
  const add = (name: string) => {
    if (!names.includes(name)) names.push(name);
  };
  for (const s of parse(barrel, readFileSync(barrel, "utf8")).statements) {
    if (!ts.isExportDeclaration(s) || s.isTypeOnly || !s.moduleSpecifier || !ts.isStringLiteral(s.moduleSpecifier)) continue;
    const target = resolveModule(barrel, s.moduleSpecifier.text);
    if (!target || !within(dir, target)) continue;
    if (s.exportClause && ts.isNamedExports(s.exportClause)) {
      for (const element of s.exportClause.elements) if (!element.isTypeOnly) add(element.name.text);
    } else if (!s.exportClause) {
      for (const name of valueExports(target, readFileSync(target, "utf8"))) add(name);
    }
  }
  return names;
}

/**
 * Where a component's source lives, and the value names it publishes: every name its
 * group barrel re-exports from its directory, else its entry's exports, else (a raw
 * primitive) its name.
 */
function componentSource(root: string, doc: (typeof COMPONENTS)[number]) {
  const dir = doc.dir ?? doc.slug;
  const group = GROUP_OF[doc.category];
  const sourceDir = `src/${group}/${dir}`;
  const absoluteDir = join(root, sourceDir);
  const sourceFiles = filesUnder(absoluteDir);
  const entry = [`${dir}.tsx`, `${dir}.ts`].find((f) => sourceFiles.includes(f));
  const published = barrelExports(root, group, sourceDir);
  const exports = published.length
    ? published
    : entry
      ? valueExports(entry, readFileSync(join(absoluteDir, entry), "utf8"))
      : [doc.name.replace(/[^A-Za-z]/g, "")];
  return { dir, group, sourceDir, sourceFiles, entry, exports };
}

/**
 * A component's source directory, the value names it publishes and where it is built
 * (the modules its source facts read), without the rest of its facts: what the audit's
 * consumer reader (tools/audit/kit-graph.ts) takes a component to be.
 */
export function componentImplementation(root: string, slug: string): { sourceDir: string; exports: string[]; implementation: Implementation } {
  const doc = COMPONENTS.find((c) => c.slug === slug);
  if (!doc) throw new Error(`facts: no COMPONENTS entry for ${slug}`);
  const { sourceDir, sourceFiles, entry, exports } = componentSource(root, doc);
  return { sourceDir, exports, implementation: implementationOf(root, sourceDir, sourceFiles.filter(isSourceModule), entry !== undefined, exports[0]) };
}

export function componentFacts(slug: string, corpus: FactsCorpus): ComponentFacts {
  const doc = COMPONENTS.find((c) => c.slug === slug);
  if (!doc) throw new Error(`facts: no COMPONENTS entry for ${slug}`);
  const { dir, group, sourceDir, sourceFiles, entry, exports } = componentSource(corpus.root, doc);
  const sourceModules = sourceFiles.filter(isSourceModule);
  const markdown = relative(corpus.root, componentDocPath(doc.category, dir));
  const implementation = implementationOf(corpus.root, sourceDir, sourceModules, entry !== undefined, exports[0]);
  const naming = (identifier: string) => implementation.modules.filter((module) => codeIdentifiers(join(corpus.root, module)).has(identifier));

  const skins = corpus.skins.find((c) => c.group === group && c.dir === dir);
  const skinFact = (platform: SkinPlatform): SkinFact => {
    const built = skins?.exports ?? [];
    const entryFile = join(corpus.root, sourceDir, `${dir}${ENTRY[platform].ext}`);
    return {
      divergent: Boolean(skins?.divergent[platform]),
      exports: Object.fromEntries(built.map((name) => [name, skins?.exportDivergence[name]?.[platform] ?? null])),
      shared: existsSync(entryFile) ? exports.filter((name) => !built.includes(name) && traceExport(entryFile, name) !== null) : [],
    };
  };

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
    states: statesFact(slug, { category: doc.category, dir, name: doc.name }, corpus),
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

/**
 * The kit names a page's own entry uses: the object literal in its data module whose
 * `slug` is the page's, read with the static reader's scope rules. Every name its code
 * reads that is a value import from `@nannier/canvas` counts, and so does every one read
 * by the module's local functions and consts that code reaches (a pattern's demo
 * component, a template's local helper), followed once each. A type-only import is not
 * a value, and a sibling pattern's code is never reached, so the shared patterns module
 * credits each pattern with its own names only. A slug with no entry is an error.
 */
export function pageKitNames(file: string, source: string, slug: string): string[] {
  const sf = parse(file, source);
  const reader = new StaticReader(sf);
  let entry: ts.ObjectLiteralExpression | null = null;
  const find = (node: ts.Node): void => {
    if (entry) return;
    if (
      ts.isObjectLiteralExpression(node) &&
      node.properties.some(
        (p) => ts.isPropertyAssignment(p) && p.name.getText(sf) === "slug" && (ts.isStringLiteral(p.initializer) || ts.isNoSubstitutionTemplateLiteral(p.initializer)) && p.initializer.text === slug,
      )
    ) {
      entry = node;
      return;
    }
    ts.forEachChild(node, find);
  };
  find(sf);
  if (!entry) throw new Error(`facts: ${file} has no entry whose slug is "${slug}"`);
  const names = new Set<string>();
  const seen = new Set<ts.Node>();
  const visit = (node: ts.Node): void => {
    if (ts.isTypeNode(node)) return;
    if (ts.isIdentifier(node) && isValueRead(node)) {
      const b = reader.resolve(node);
      if (b?.kind === "import" && KIT_PACKAGES.includes(b.specifier)) names.add(b.imported);
      else if (b?.kind === "const" && b.decl.initializer && !seen.has(b.decl)) {
        seen.add(b.decl);
        visit(b.decl.initializer);
      } else if (b?.kind === "function" && !seen.has(b.decl)) {
        seen.add(b.decl);
        if (b.decl.body) visit(b.decl.body);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(entry);
  return [...names].sort();
}

export function pageFacts(page: InventoryPage, corpus: FactsCorpus): PageFacts {
  const module = pageModule(page.kind, page.slug);
  const source = readFileSync(join(corpus.root, module), "utf8");
  return {
    kind: page.kind,
    slug: page.slug,
    route: page.route,
    module,
    sections: pageSections(module, source, page.slug),
    kitNames: pageKitNames(module, source, page.slug),
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
