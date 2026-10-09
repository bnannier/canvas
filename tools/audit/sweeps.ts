// The e2e catalog sweeps: the specs that drive a whole catalog of docs routes instead of
// naming one. e2e/a11y/components.e2e.ts scans every page `componentRoutes()` lists,
// e2e/smoke/examples.e2e.ts renders every example `componentExamples()` lists,
// e2e/behavior/overlays.e2e.ts opens every overlay of OVERLAYS, and none of them names
// a route in a literal, so a reader of route strings credits them with nothing.
//
// A catalog is one of the e2e support exports below, whose rows the facts compute by
// calling the same function (or reading the same constant) the spec does. A spec sweeps
// a catalog when a loop iterates it (a `for...of`, a `for...in`, an indexed `for` up to
// its length, or the callback of `.forEach()`, `.map()`, `.flatMap()` or `.filter()`),
// alone, through `.filter()` with a predicate the static reader can evaluate on every
// row, through `.map()`, or spread into an array literal, AND the loop navigates with a
// route that reads the loop's variable (`gotoDocs(page, route.path)`, `page.goto(...)`),
// directly or through a helper of the module it hands the variable to: a loop that only
// checks the catalog's data (e2e/visual/material-coverage.e2e.ts) drives nothing. A
// sweep is credited with the rows its navigations reach, so a row a guard skips
// (`if (...) continue;`) is not credited; whether a guard can be read is the navigation
// check's to answer (tools/audit/facts.ts), which fails on one it cannot read.
//
// A loop over a catalog in a form the reader cannot follow (`.slice()`, a callback that
// stops early, `.some()`, a loop it cannot tell runs) is an error, never a silent miss,
// because the facts would then under-report every route it drives.

import { dirname, relative, resolve, sep } from "node:path";
import ts from "typescript";
import { MATERIAL_ROUTES, nativeMaterialRoutes } from "../../e2e/support/material-routes.ts";
import { MATERIAL_OVERLAY_RECIPES, OVERLAY_RECIPES } from "../../e2e/support/overlay-recipes.ts";
import { aliasRoutes, allRoutes, componentExamples, componentRoutes, contentRoutes, examplesFor, guideRoutes } from "../../e2e/support/routes.ts";
import { NOT_HANDLED, type Intercept } from "./hosts.ts";
import { Host, StaticReader, UNKNOWN, indexedLoop, isFunctionNode, isValueRead, outermost, unwrap, type Env, type LoopNode } from "./static-eval.ts";

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

/** The catalog a module's import names (the module repo-relative or absolute), or null. */
function catalogImported(root: string, file: string, specifier: string, imported: string): Catalog | null {
  if (!specifier.startsWith(".")) return null;
  const module = relative(root, resolve(root, dirname(file), specifier)).split(sep).join("/").replace(/\.(tsx?|js)$/, "");
  return CATALOGS.find((c) => c.module === module && c.name === imported) ?? null;
}

/** The catalogs, handed to the module graph (tools/audit/hosts.ts): a constant's rows, or a function it may call. */
export function catalogIntercept(root: string): Intercept {
  return (file, specifier, imported) => {
    const catalog = catalogImported(root, file, specifier, imported);
    if (!catalog) return NOT_HANDLED;
    return catalog.call ? new Host((args) => rowsOf(catalog, args)) : rowsOf(catalog, []);
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
      `${file}:${line}: ${what}; the audit facts cannot tell which routes it drives. Iterate the catalog alone, through .filter() whose predicate compares the row's fields with literals, through .map(), or spread into an array literal, in a for...of, a for...in, an indexed for or a .forEach() or .map() callback (tools/audit/sweeps.ts)`,
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
  /** The module, repo-relative. */
  file: string;
  sf: ts.SourceFile;
  /** The module's full reader: catalogs' rows bound, no loop skipped. */
  reader: StaticReader;
}

/** The catalog rows an iterable expression reaches, or null when it reaches no catalog. */
function items(ctx: SweepContext, expr: ts.Expression, env: Env): Item[] | null {
  const e = unwrap(expr);
  if (ts.isIdentifier(e)) {
    const b = ctx.reader.resolve(e);
    if (b?.kind === "const" && b.path.length === 0 && b.decl.initializer) {
      // A table the module changes is not its initializer's rows.
      const changed = ctx.reader.mutationOf(b.id);
      if (changed && readsCatalog(ctx.root, ctx.file, ctx.reader, b.decl.initializer)) {
        throw new UnreadableSweep(ctx.file, ctx.sf, e, `it iterates ${b.id.text}, a catalog's rows the module changes at ${ctx.reader.at(changed)}`);
      }
      return items(ctx, b.decl.initializer, b.topLevel ? new Map() : env);
    }
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
export function navigationRoute(call: ts.CallExpression): ts.Expression | undefined {
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
function localFunction(reader: StaticReader, call: ts.CallExpression): (ts.SignatureDeclaration & { body?: ts.Node }) | null {
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
 * The navigations a loop body makes with a route built from the loop's own variables,
 * directly or through a local helper it hands them to (`expectFits(page, route.path, ...)`,
 * whose own `gotoDocs(page, path)` reads that parameter).
 */
function navigationsFrom(reader: StaticReader, body: ts.Node, ids: Set<ts.Identifier>, seen = new Set<ts.Node>()): ts.CallExpression[] {
  const found: ts.CallExpression[] = [];
  const visit = (n: ts.Node): void => {
    if (ts.isCallExpression(n)) {
      const route = navigationRoute(n);
      if (route && readsBinding(reader, route, ids)) found.push(n);
      const helper = localFunction(reader, n);
      if (helper?.body && !seen.has(helper)) {
        const params = new Set<ts.Identifier>();
        n.arguments.forEach((arg, i) => {
          const param = helper.parameters[i];
          if (param && readsBinding(reader, arg, ids)) for (const id of idsOf(param.name)) params.add(id);
        });
        if (params.size) found.push(...navigationsFrom(reader, helper.body, params, new Set([...seen, helper])));
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
  /** The docs route each row it iterates drives, for the rows its navigations reach. */
  routes: string[];
}

export interface SweepRead {
  /** The loops that navigate to each row of a catalog. */
  sweeps: Sweep[];
  /** Every loop over a catalog, sweep or not: the named reader leaves their rows unbound when it reads a route the spec names itself. */
  catalogLoops: Set<LoopNode>;
}

const EVERY_ROW = new Set(["forEach", "map", "flatMap", "filter"]);
const EARLY_STOP = new Set(["some", "every", "find", "findIndex", "findLast", "findLastIndex"]);

/** The catalog sweeps of one e2e module. */
export function readSweeps(ctx: SweepContext): SweepRead {
  const out: SweepRead = { sweeps: [], catalogLoops: new Set() };
  const line = (node: ts.Node) => ctx.sf.getLineAndCharacterOfPosition(node.getStart(ctx.sf)).line + 1;
  const consider = (node: ts.Node, iterable: ts.Expression, body: ts.Node, ids: Set<ts.Identifier>, loop: LoopNode, early: string | null): void => {
    const found: Item[] = [];
    let reached = false;
    const { candidates, overflow } = ctx.reader.contexts(iterable);
    for (const c of candidates) {
      const part = items(ctx, iterable, c.env);
      if (!part) continue;
      if (overflow) throw new UnreadableSweep(ctx.file, ctx.sf, node, `it iterates ${part[0]?.catalog.name ?? "a catalog"} where ${overflow}`);
      if (c.doubt?.filters) throw new UnreadableSweep(ctx.file, ctx.sf, node, `it iterates ${part[0]?.catalog.name ?? "a catalog"}, but the reader cannot tell which rows reach the loop (${c.doubt.why})`);
      reached = true;
      found.push(...part);
    }
    if (!reached) return;
    out.catalogLoops.add(loop);
    const navigations = navigationsFrom(ctx.reader, body, ids);
    if (!navigations.length) return;
    if (early) throw new UnreadableSweep(ctx.file, ctx.sf, node, `its .${early}() callback navigates, and .${early}() stops at the first row the callback decides`);
    // The routes the body's navigations reach, guards and helpers included.
    const reachedRoutes = new Set<string>();
    for (const nav of navigations) for (const value of ctx.reader.values(navigationRoute(nav)!).reached) if (typeof value.value === "string") reachedRoutes.add(value.value);
    const routes = [...new Set(found.map((item) => item.catalog.route(item.row as never)))];
    out.sweeps.push({
      line: line(node),
      catalogs: [...new Set(found.map((item) => item.catalog.name))],
      routes: routes.filter((route) => reachedRoutes.has(route)),
    });
  };
  const visit = (node: ts.Node): void => {
    if ((ts.isForOfStatement(node) || ts.isForInStatement(node)) && ts.isVariableDeclarationList(node.initializer)) {
      const ids = new Set(node.initializer.declarations.flatMap((decl) => idsOf(decl.name)));
      consider(node, node.expression, node.statement, ids, node, null);
    } else if (ts.isForStatement(node)) {
      const indexed = indexedLoop(node);
      const end = indexed ? unwrap(indexed.end) : null;
      // `i < X.length`: the rows of X, by index.
      if (indexed && end && ts.isPropertyAccessExpression(end) && end.name.text === "length") consider(node, end.expression, node.statement, new Set([indexed.id]), node, null);
      else if (node.condition && readsCatalog(ctx.root, ctx.file, ctx.reader, node.condition)) throw new UnreadableSweep(ctx.file, ctx.sf, node, "a for loop over a catalog that is not `for (let i = 0; i < X.length; i++)`");
    } else if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)) {
      const method = node.expression.name.text;
      const fn = node.arguments[0] ? unwrap(node.arguments[0]) : undefined;
      if (fn && (ts.isArrowFunction(fn) || ts.isFunctionExpression(fn)) && fn.parameters[0] && (EVERY_ROW.has(method) || EARLY_STOP.has(method)) && outermost(fn) === node.arguments[0]) {
        consider(node, node.expression.expression, fn.body, new Set(idsOf(fn.parameters[0].name)), fn, EARLY_STOP.has(method) ? method : null);
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

/** Whether a node lies in the body of a function declaration of this name. */
export function insideFunctionNamed(node: ts.Node, name: string): boolean {
  for (let n: ts.Node | undefined = node.parent; n; n = n.parent) if (isFunctionNode(n) && ts.isFunctionDeclaration(n) && n.name?.text === name) return true;
  return false;
}
