// The e2e catalog sweeps: the specs that drive a whole catalog of docs routes instead of
// naming one. e2e/a11y/components.e2e.ts scans every page `componentRoutes()` lists,
// e2e/smoke/examples.e2e.ts renders every example `componentExamples()` lists,
// e2e/behavior/overlays.e2e.ts opens every overlay of OVERLAYS, and none of them names
// a route in a literal, so a reader of route strings credits them with nothing.
//
// A catalog is one of the e2e support exports below, whose rows the facts compute by
// calling the same function (or reading the same constant) the spec does. A spec sweeps
// a catalog when a `for...of` (or a `.forEach`) iterates it, alone, through `.filter()`
// with a predicate the static reader can evaluate on every row, through `.map()`, or
// spread into an array literal, AND the loop navigates with a route that reads the
// loop's variable (`gotoDocs(page, route.path)`, `page.goto(...)`): a loop that only
// checks the catalog's data (e2e/visual/material-coverage.e2e.ts) drives nothing. A loop
// over a catalog in a form the reader cannot follow is an error, never a silent miss,
// because the facts would then under-report every route it drives.

import { dirname, relative, resolve, sep } from "node:path";
import ts from "typescript";
import { MATERIAL_ROUTES, nativeMaterialRoutes } from "../../e2e/support/material-routes.ts";
import { MATERIAL_OVERLAY_RECIPES, OVERLAY_RECIPES } from "../../e2e/support/overlay-recipes.ts";
import { aliasRoutes, allRoutes, componentExamples, componentRoutes, contentRoutes, examplesFor, guideRoutes } from "../../e2e/support/routes.ts";
import { Host, StaticReader, UNKNOWN, isValueRead, unwrap, type EvalHooks, type Env } from "./static-eval.ts";

export interface Catalog {
  /** The support module that exports it, repo-relative, without its extension. */
  module: string;
  /** The name it is exported under. */
  name: string;
  /** A function the spec calls (`componentRoutes()`), or a constant it reads (`MATERIAL_ROUTES`). */
  call: boolean;
  /** Its rows, as the spec sees them, for the arguments it is called with. */
  rows: (args: unknown[]) => readonly unknown[];
  /** The docs route a row drives. */
  route: (row: never) => string;
}

const page = (row: { path: string }) => row.path;
const overlay = (row: { slug: string }) => `/components/${row.slug}`;

/**
 * Every e2e catalog. OVERLAYS and MATERIAL_OVERLAYS are e2e/support/overlays.ts's
 * recipes bound to Playwright (`OVERLAY_RECIPES.map(bind)`, slug for slug), read here
 * through the recipes because the bound module imports Playwright.
 */
export const CATALOGS: Catalog[] = [
  { module: "e2e/support/routes", name: "componentRoutes", call: true, rows: () => componentRoutes(), route: page },
  { module: "e2e/support/routes", name: "contentRoutes", call: true, rows: () => contentRoutes(), route: page },
  { module: "e2e/support/routes", name: "guideRoutes", call: true, rows: () => guideRoutes(), route: page },
  { module: "e2e/support/routes", name: "aliasRoutes", call: true, rows: () => aliasRoutes(), route: page },
  { module: "e2e/support/routes", name: "allRoutes", call: true, rows: () => allRoutes(), route: page },
  { module: "e2e/support/routes", name: "componentExamples", call: true, rows: () => componentExamples(), route: (row: { route: { path: string } }) => row.route.path },
  { module: "e2e/support/routes", name: "examplesFor", call: true, rows: (args) => examplesFor(...(args as [string, string, string?])), route: page },
  { module: "e2e/support/material-routes", name: "MATERIAL_ROUTES", call: false, rows: () => MATERIAL_ROUTES, route: page },
  { module: "e2e/support/material-routes", name: "nativeMaterialRoutes", call: true, rows: (args) => nativeMaterialRoutes(args[0] as "solid" | "glass"), route: page },
  { module: "e2e/support/overlay-recipes", name: "OVERLAY_RECIPES", call: false, rows: () => OVERLAY_RECIPES, route: overlay },
  { module: "e2e/support/overlay-recipes", name: "MATERIAL_OVERLAY_RECIPES", call: false, rows: () => MATERIAL_OVERLAY_RECIPES, route: overlay },
  { module: "e2e/support/overlays", name: "OVERLAYS", call: false, rows: () => OVERLAY_RECIPES, route: overlay },
  { module: "e2e/support/overlays", name: "MATERIAL_OVERLAYS", call: false, rows: () => MATERIAL_OVERLAY_RECIPES, route: overlay },
];

/**
 * The rows of a catalog per argument list, read once, so a rows array is the same object
 * wherever a spec reaches it, and each catalog's own array (OVERLAYS and OVERLAY_RECIPES
 * share their rows, never their array), so the array names the catalog it came from.
 */
const rowsCache = new Map<string, readonly unknown[]>();
const catalogOfRows = new Map<readonly unknown[], Catalog>();

function rowsOf(catalog: Catalog, args: unknown[]): readonly unknown[] {
  const key = `${catalog.module}#${catalog.name}#${JSON.stringify(args)}`;
  let rows = rowsCache.get(key);
  if (!rows) {
    rows = [...catalog.rows(args)];
    rowsCache.set(key, rows);
    catalogOfRows.set(rows, catalog);
  }
  return rows;
}

/** The catalog a module's import names, or null. */
function catalogImported(root: string, file: string, specifier: string, imported: string): Catalog | null {
  if (!specifier.startsWith(".")) return null;
  const module = relative(root, resolve(root, dirname(file), specifier)).split(sep).join("/").replace(/\.(tsx?|js)$/, "");
  return CATALOGS.find((c) => c.module === module && c.name === imported) ?? null;
}

/** The hooks that hand the static reader each catalog a module imports: a constant's rows, or a function it may call. */
export function catalogHooks(root: string, file: string, extra: Omit<EvalHooks, "importValue"> = {}): EvalHooks {
  return {
    ...extra,
    importValue(specifier, imported) {
      const catalog = catalogImported(root, file, specifier, imported);
      if (!catalog) return UNKNOWN;
      return catalog.call ? new Host((args) => rowsOf(catalog, args)) : rowsOf(catalog, []);
    },
  };
}

/** One row of a catalog on its way through `.filter()` and `.map()`: where it came from, and what it now is. */
interface Item {
  catalog: Catalog;
  row: unknown;
  current: unknown;
}

/** A loop over a catalog that the reader cannot follow, so its routes would be missed. */
export class UnreadableSweep extends Error {
  constructor(file: string, sf: ts.SourceFile, node: ts.Node, what: string) {
    const line = sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;
    super(
      `${file}:${line}: ${what}; the audit facts cannot tell which routes it drives. Iterate the catalog alone, through .filter() whose predicate compares the row's fields with literals, through .map(), or spread into an array literal (tools/audit/sweeps.ts)`,
    );
    this.name = "UnreadableSweep";
  }
}

/** Whether an expression reads a catalog anywhere, through local consts. */
function readsCatalog(root: string, file: string, reader: StaticReader, node: ts.Node, seen = new Set<ts.Node>()): boolean {
  let found = false;
  const visit = (n: ts.Node): void => {
    if (found) return;
    if (ts.isIdentifier(n) && isValueRead(n)) {
      const b = reader.resolve(n);
      if (b?.kind === "import" && catalogImported(root, file, b.specifier, b.imported)) found = true;
      else if (b?.kind === "const" && b.decl.initializer && !seen.has(b.decl)) {
        seen.add(b.decl);
        found = readsCatalog(root, file, reader, b.decl.initializer, seen);
      }
    }
    ts.forEachChild(n, visit);
  };
  visit(node);
  return found;
}

export interface SweepContext {
  root: string;
  file: string;
  sf: ts.SourceFile;
  reader: StaticReader;
}

/** The catalog rows an iterable expression reaches, or null when it reaches no catalog. */
function items(ctx: SweepContext, expr: ts.Expression, env: Env): Item[] | null {
  const e = unwrap(expr);
  if (ts.isIdentifier(e)) {
    const b = ctx.reader.resolve(e);
    if (b?.kind === "const" && b.path.length === 0 && b.decl.initializer) return items(ctx, b.decl.initializer, b.topLevel ? new Map() : env);
  }
  if (ts.isArrayLiteralExpression(e)) {
    // The spread pieces; a plain element is a route the spec names itself.
    let out: Item[] | null = null;
    for (const el of e.elements) {
      if (!ts.isSpreadElement(el)) continue;
      const part = items(ctx, el.expression, env);
      if (part) out = [...(out ?? []), ...part];
    }
    return out;
  }
  if (ts.isCallExpression(e) && ts.isPropertyAccessExpression(e.expression) && ["filter", "map"].includes(e.expression.name.text)) {
    const base = items(ctx, e.expression.expression, env);
    if (!base) return null;
    const fn = e.arguments.length ? ctx.reader.evaluate(e.arguments[0], env) : UNKNOWN;
    if (e.expression.name.text === "map") return base.map((item, i) => ({ ...item, current: ctx.reader.apply(fn, [item.current, i]) }));
    return base.filter((item, i) => {
      const keep = ctx.reader.apply(fn, [item.current, i]);
      if (keep === UNKNOWN) throw new UnreadableSweep(ctx.file, ctx.sf, e, `it filters ${item.catalog.name} with a predicate the reader cannot evaluate on every row`);
      return Boolean(keep);
    });
  }
  const value = ctx.reader.evaluate(e, env);
  const catalog = Array.isArray(value) ? catalogOfRows.get(value) : undefined;
  if (catalog) return (value as unknown[]).map((row) => ({ catalog, row, current: row }));
  if (readsCatalog(ctx.root, ctx.file, ctx.reader, e)) throw new UnreadableSweep(ctx.file, ctx.sf, e, "it iterates a catalog in a form the reader does not follow");
  return null;
}

/** How each navigation call names its route: `gotoDocs(page, route)` (e2e/support/docs.ts) and Playwright's `page.goto(route)`. */
function navigationRoute(call: ts.CallExpression): ts.Expression | undefined {
  const callee = unwrap(call.expression);
  if (ts.isIdentifier(callee) && callee.text === "gotoDocs") return call.arguments[1];
  if (ts.isPropertyAccessExpression(callee) && callee.name.text === "goto") return call.arguments[0];
  return undefined;
}

/** Whether an expression reads any of these bindings, through local consts. */
function readsBinding(reader: StaticReader, node: ts.Node, ids: Set<ts.Identifier>, seen = new Set<ts.Node>()): boolean {
  let found = false;
  const visit = (n: ts.Node): void => {
    if (found) return;
    if (ts.isIdentifier(n) && isValueRead(n)) {
      const b = reader.resolve(n);
      if ((b?.kind === "loop" || b?.kind === "param") && ids.has(b.id)) found = true;
      else if (b?.kind === "const" && b.decl.initializer && !seen.has(b.decl)) {
        seen.add(b.decl);
        found = readsBinding(reader, b.decl.initializer, ids, seen);
      }
    }
    ts.forEachChild(n, visit);
  };
  visit(node);
  return found;
}

/** The function a call reaches in the module itself: a function declaration, or a const bound to a function literal. */
function localFunction(reader: StaticReader, call: ts.CallExpression): ts.SignatureDeclaration & { body?: ts.Node } | null {
  const callee = unwrap(call.expression);
  if (!ts.isIdentifier(callee)) return null;
  const b = reader.resolve(callee);
  if (b?.kind === "function") return b.decl;
  if (b?.kind === "const" && b.path.length === 0 && b.decl.initializer) {
    const init = unwrap(b.decl.initializer);
    if (ts.isArrowFunction(init) || ts.isFunctionExpression(init)) return init;
  }
  return null;
}

/**
 * Whether a loop body navigates to a route built from the loop's own variables, directly
 * or through a local helper it hands them to (`expectFits(page, route.path, ...)`, whose
 * own `gotoDocs(page, path)` reads that parameter).
 */
function navigates(reader: StaticReader, body: ts.Node, ids: Set<ts.Identifier>, seen = new Set<ts.Node>()): boolean {
  let found = false;
  const visit = (n: ts.Node): void => {
    if (found) return;
    if (ts.isCallExpression(n)) {
      const route = navigationRoute(n);
      if (route && readsBinding(reader, route, ids)) {
        found = true;
        return;
      }
      const helper = localFunction(reader, n);
      if (helper?.body && !seen.has(helper)) {
        const params = new Set<ts.Identifier>();
        n.arguments.forEach((arg, i) => {
          const param = helper.parameters[i];
          if (param && readsBinding(reader, arg, ids)) for (const id of idsOf(param.name)) params.add(id);
        });
        if (params.size && navigates(reader, helper.body, params, new Set([...seen, helper]))) {
          found = true;
          return;
        }
      }
    }
    ts.forEachChild(n, visit);
  };
  visit(body);
  return found;
}

/** One loop of a spec that sweeps a catalog. */
export interface Sweep {
  /** The 1-based line of the loop. */
  line: number;
  /** The catalogs it iterates, by their exported names. */
  catalogs: string[];
  /** The docs route each row it iterates drives. */
  routes: string[];
}

export interface SweepRead {
  /** The loops that navigate to each row of a catalog. */
  sweeps: Sweep[];
  /** Every loop over a catalog, sweep or not: the static reader leaves their rows unbound when it reads a route the spec names itself. */
  catalogLoops: Set<ts.ForOfStatement>;
}

/** The catalog sweeps of one e2e module. */
export function readSweeps(ctx: SweepContext): SweepRead {
  const out: SweepRead = { sweeps: [], catalogLoops: new Set() };
  const consider = (node: ts.Node, iterable: ts.Expression, body: ts.Node, ids: Set<ts.Identifier>, loop?: ts.ForOfStatement): void => {
    const found: Item[] = [];
    let reached = false;
    for (const env of ctx.reader.envs(iterable) ?? [new Map()]) {
      const part = items(ctx, iterable, env);
      if (!part) continue;
      reached = true;
      found.push(...part);
    }
    if (!reached) return;
    if (loop) out.catalogLoops.add(loop);
    if (!navigates(ctx.reader, body, ids)) return;
    out.sweeps.push({
      line: ctx.sf.getLineAndCharacterOfPosition(node.getStart(ctx.sf)).line + 1,
      catalogs: [...new Set(found.map((item) => item.catalog.name))],
      routes: [...new Set(found.map((item) => item.catalog.route(item.row as never)))],
    });
  };
  const visit = (node: ts.Node): void => {
    if (ts.isForOfStatement(node) && ts.isVariableDeclarationList(node.initializer)) {
      const ids = new Set(node.initializer.declarations.flatMap((decl) => idsOf(decl.name)));
      consider(node, node.expression, node.statement, ids, node);
    } else if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression) && node.expression.name.text === "forEach") {
      const fn = node.arguments[0] ? unwrap(node.arguments[0]) : undefined;
      if (fn && (ts.isArrowFunction(fn) || ts.isFunctionExpression(fn)) && fn.parameters[0]) {
        consider(node, node.expression.expression, fn.body, new Set(idsOf(fn.parameters[0].name)));
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(ctx.sf);
  return out;
}

function idsOf(name: ts.BindingName): ts.Identifier[] {
  if (ts.isIdentifier(name)) return [name];
  return name.elements.flatMap((el) => (ts.isOmittedExpression(el) ? [] : idsOf(el.name)));
}
