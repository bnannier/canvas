// The audit's Foundations tier (the plan's "Foundations"): the style-layer renderables with
// no component page of their own (AnchoredOverlay, GlassSurface, ThemeProvider and the
// rest, `STYLE_LAYER_RENDERABLES`), the design tokens the `tokens/*` docs pages document,
// and the kit internals the generated `/foundation` reference page documents
// (FoundationReference), so that every deprecation the owner decided is on one of the tier's
// checklists. Each gets a checklist under audit/foundation/, whose facts this module
// gathers from the kit's source and its own manifests, with no React Native import:
//
//   - its source files (its homes, its exports' declarations and its implementation: the
//     private declarations they read, `foundationCode`) and its public exports, each with its
//     classification in the public API manifest (tools/api/manifest.ts) and its K12-2 status
//     (a deprecated alias to come, or public, by the owner's decisions in audit/DECISIONS.md);
//   - the docs routes that document it or are planned to (the API manifest's `docs` and
//     PENDING_DOCS), and its materials manifest entry;
//   - the tests of it: those that import one of its exports or one of its implementation's
//     declarations by name, and those named for it (`test/<id>-<what>.test.tsx`);
//   - its consumers: every kit component that renders through it (reads one of its public
//     values or one of its seams, the private declarations it alone reads), read from the
//     source by the kit graph (tools/audit/kit-graph.ts), directly, through shared modules,
//     or through other kit components;
//   - the pattern and template pages whose own entry names one of its exports;
//   - its Capture through list: the component slugs and page ids whose captures show it,
//     in the consumers' order, which `bun run audit:turn -- --slug=<foundation>` expands to.
//
// A renderable foundation is the module that declares its name (on every platform) and
// the public exports whose way out of the kit's entry passes through that module, so
// FloatingLabel and LabelContent (one module) share their exports, and so do Portal and
// OverlayProvider. The design tokens and the reference's internals are read in
// `memberships`.

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { guideRoutes } from "../../e2e/support/routes.ts";
import { PENDING_DOCS, publicApi } from "../api/manifest.ts";
import type { ApiEntry, ApiKind } from "../api/types.ts";
import { materialCoverage } from "../materials/manifest.ts";
import type { MaterialCoverageEntry } from "../materials/types.ts";
import { componentImplementation, kitImportsOf, pageKitNames, type FactsCorpus, type KitImports } from "./facts.ts";
import { components as inventoryComponents, pageModule, pages as inventoryPages, type InventoryComponent, type InventoryPage } from "./inventory.ts";
import { KitGraph, MODULE_BODY, consumersOf, moduleFiles, ownersByReaders, symbolId, symbolOf, type Consumer, type ConsumerCandidate, type KitSymbol } from "./kit-graph.ts";
import { REFERENCE_FOUNDATION, STYLE_LAYER_RENDERABLES, TOKENS_FOUNDATION } from "./plan-specifics.ts";
import { turnRecordFile } from "./turn-record.ts";

/** The kit's public entry, where every public name's way out starts. */
export const KIT_ENTRY = "src/index.ts";

/** The checklist directory of the Foundations tier, under audit/. */
export const FOUNDATION_DIR = "foundation";

export interface Foundation {
  /** The renderable's export name, `Tokens`, or `FoundationReference`. */
  name: string;
  /** Its checklist and turn id: the name in kebab case (`glass-modal-blur-target`). */
  id: string;
  /** A style-layer renderable, the design tokens, or the kit internals of the `/foundation` reference page. */
  kind: "renderable" | "tokens" | "reference";
}

/** The docs route of the generated foundation API reference (K12-10 OD2), which the reference foundation is. */
export const REFERENCE_ROUTE = "foundation";

/** A name in kebab case: `GlassModalBlurTarget` is `glass-modal-blur-target`. */
export function foundationId(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

/** Every foundation, alphabetical: the style-layer renderables, the design tokens and the `/foundation` reference's internals. */
export function foundations(): Foundation[] {
  return [
    ...STYLE_LAYER_RENDERABLES.map((name) => ({ name, id: foundationId(name), kind: "renderable" as const })),
    { name: TOKENS_FOUNDATION, id: foundationId(TOKENS_FOUNDATION), kind: "tokens" as const },
    { name: REFERENCE_FOUNDATION, id: foundationId(REFERENCE_FOUNDATION), kind: "reference" as const },
  ].sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * The page module an expo-router route renders: `docs/src/app/<route>.tsx` or
 * `<route>/index.tsx`, under any route group (`(utilities)`). Exactly one, or it throws, so a
 * renamed page fails the facts rather than leave its names out.
 */
export function routeModule(root: string, route: string): string {
  const app = "docs/src/app";
  const dirs = [app, ...readdirSync(join(root, app)).filter((d) => /^\(.+\)$/.test(d) && statSync(join(root, app, d)).isDirectory()).map((d) => `${app}/${d}`)];
  const trimmed = route.replace(/^\//, "");
  const found = dirs.flatMap((dir) => [`${dir}/${trimmed}.tsx`, `${dir}/${trimmed}/index.tsx`]).filter((file) => existsSync(join(root, file)));
  if (found.length !== 1) throw new Error(`foundations: the route ${route} is rendered by ${found.length === 0 ? "no module" : `${found.length} modules (${found.join(", ")})`} under ${app}`);
  return found[0]!;
}

/** The kit names each `tokens/*` page imports (its own source, not the docs' frame around it), by route. */
export function tokenPageNames(root: string): Map<string, string[]> {
  return new Map(
    tokenPages().map((route) => {
      const file = routeModule(root, route);
      return [route, [...kitImportsOf(root, file, readFileSync(join(root, file), "utf8")).names].sort()] as const;
    }),
  );
}

/** The docs' token reference pages (`/tokens/colors` and the rest), from the docs' own nav. */
export function tokenPages(): string[] {
  return guideRoutes()
    .filter((route) => route.path.startsWith("/tokens/") && !route.redirects)
    .map((route) => route.path)
    .sort();
}

/**
 * The names the owner's decisions retire as deprecated aliases beyond the kit internals the
 * manifest records as internal by accident (audit/DECISIONS.md): the shadow helpers (K12-2
 * OD4), React Native's pass-throughs (K12-2 OD5) and the Riskora type ladder (K12-7 OD3).
 */
export const DECIDED_DEPRECATIONS: Readonly<Record<string, string>> = {
  shadow: "K12-2 OD4",
  customShadow: "K12-2 OD4",
  ShadowLevel: "K12-2 OD4",
  StyleSheet: "K12-2 OD5",
  useWindowDimensions: "K12-2 OD5",
  fontSize: "K12-7 OD3",
  fontWeight: "K12-7 OD3",
  lineHeight: "K12-7 OD3",
  letterSpacing: "K12-7 OD3",
};

/** An export's K12-2 status: a deprecated alias already, one to come (and by which decision), or public. */
export function k12Status(name: string, entry: ApiEntry): string {
  if (entry.kind === "deprecated-alias") return entry.replacement ? `deprecated alias already (use \`${entry.replacement}\`)` : "deprecated alias already";
  if (entry.kind === "internal-by-accident") return "deprecated alias to come (K12-2)";
  const decided = DECIDED_DEPRECATIONS[name];
  return decided ? `deprecated alias to come (${decided})` : "public";
}

export interface FoundationExport {
  name: string;
  kind: ApiKind;
  /** Whether it is a value (a type-only export cannot render, so it is no consumer edge). */
  value: boolean;
  /** The kit files that declare it, or the package it passes on (`react-native`). */
  declared: string[];
  /** The route that documents it, with the section, when the manifest names one. */
  documented: { route: string; section: string | null } | null;
  /** The route planned for it while its docs are pending (PENDING_DOCS). */
  planned: string | null;
  k12: string;
}

export interface FoundationDocsPage {
  route: string;
  /** What it documents or is planned to document. */
  documents: string[];
  planned: string[];
  /** The inventory page id that captures it (`pattern-glass`), or null for a guide page the capture inventory does not hold. */
  page: string | null;
  /** Whether the docs serve the route today (a planned page may not be built yet). */
  exists: boolean;
}

export interface FoundationFacts {
  foundation: Foundation;
  /** The files that declare its name (a renderable) or the token pages (Tokens). */
  homes: string[];
  /** Its homes, the files declaring its exports, and its implementation's files (`FoundationCode`). */
  sourceFiles: string[];
  exports: FoundationExport[];
  docs: FoundationDocsPage[];
  materials: MaterialCoverageEntry | null;
  tests: string[];
  consumers: Consumer[];
  /** The pattern and template pages whose own entry names one of its exports, with the names. */
  pages: { id: string; names: string[] }[];
  /** What a turn captures it through: consumer components in their order, then pages. */
  captureThrough: { components: string[]; pages: string[] };
  /** The routes that document it (or are planned to) that the capture inventory does not hold. */
  notCaptured: FoundationDocsPage[];
  /** The private declarations it alone reads (`FoundationCode.seams`). */
  seams: KitSymbol[];
  /** Where its turn records its capture runs, repo-relative. */
  turnRecord: string;
}

/** A public name as the foundations read it: a value or a type, the kit files that declare it, and the modules its way out passes through. */
interface PublicName {
  name: string;
  value: boolean;
  declared: string[];
  chain: string[];
}

/**
 * Which public names each foundation is made of, by foundation id:
 *
 *   - a renderable: the names whose way out of the kit's entry passes through its home;
 *   - the design tokens: the names the API manifest documents or plans on a `tokens/*` page,
 *     the kit names those pages show that are neither a component nor a renderable's
 *     (`shadow` on `/tokens/spacing`), and every other public name of the modules those are
 *     declared in, the renderables' homes left out (the type ladder in `src/style/tokens.ts`,
 *     `customShadow` beside `shadow`);
 *   - the reference: the names the API manifest documents or plans on `/foundation` that no
 *     renderable and not the tokens hold.
 */
function memberships(sources: FoundationSources): Map<string, PublicName[]> {
  const cached = membershipCache.get(sources);
  if (cached) return cached;
  const { kit } = sources;
  const info: PublicName[] = Object.keys(publicApi)
    .sort((a, b) => a.localeCompare(b))
    .map((name) => {
      const values = kit.exportOrigins(KIT_ENTRY, name, "value");
      const value = values.length > 0;
      const origins = value ? values : kit.exportOrigins(KIT_ENTRY, name, "type");
      const declared = origins.map((o) => ("file" in o ? o.file : o.package)).filter((v, i, all) => all.indexOf(v) === i).sort();
      return { name, value, declared, chain: kit.exportChain(KIT_ENTRY, name, value ? "value" : "type") };
    });
  const out = new Map<string, PublicName[]>();
  const all = foundations();
  const renderableHomes = new Set<string>();
  const held = new Set<string>();
  for (const f of all.filter((x) => x.kind === "renderable")) {
    const homes = new Set(foundationHomes(kit, f));
    for (const home of homes) renderableHomes.add(home);
    const names = info.filter((n) => n.chain.some((file) => homes.has(file)));
    for (const n of names) held.add(n.name);
    out.set(f.id, names);
  }
  const routeOf = (name: string) => publicApi[name]!.docs ?? PENDING_DOCS[name] ?? null;
  const tokenRoutes = new Set(tokenPages().map((path) => path.slice(1)));
  // A token page's frame (its cards, tables and the toasts an example raises) is made of
  // components, whose names and modules are theirs, not the tokens'.
  const componentModules = new Set(sources.candidates.flatMap((c) => c.modules));
  const shown = new Set([...sources.tokenNames.values()].flat());
  const documented = info.filter((n) => tokenRoutes.has(routeOf(n.name) ?? ""));
  const onPages = info.filter((n) => shown.has(n.name) && !held.has(n.name) && !["component", "part"].includes(publicApi[n.name]!.kind) && !n.declared.some((file) => componentModules.has(file)));
  const tokenHomes = new Set([...documented, ...onPages].flatMap((n) => n.declared.filter((file) => file.startsWith("src/") && !renderableHomes.has(file) && !componentModules.has(file))));
  const fromHomes = info.filter((n) => !held.has(n.name) && n.chain.some((file) => tokenHomes.has(file)));
  const tokenNames = new Set([...documented, ...onPages, ...fromHomes].map((n) => n.name));
  const tokens = all.find((f) => f.kind === "tokens")!;
  out.set(tokens.id, info.filter((n) => tokenNames.has(n.name)));
  const reference = all.find((f) => f.kind === "reference")!;
  out.set(reference.id, info.filter((n) => !held.has(n.name) && !tokenNames.has(n.name) && routeOf(n.name) === REFERENCE_ROUTE));
  membershipCache.set(sources, out);
  return out;
}

const membershipCache = new WeakMap<FoundationSources, Map<string, PublicName[]>>();

/**
 * The names the owner's decisions retire that no foundation's checklist holds: every
 * `internal-by-accident` export (K12-2), every name `DECIDED_DEPRECATIONS` adds, and every
 * deprecated alias already. The Foundations tier carries the 111 deprecations (the plan's
 * "Foundations"), so this is empty, and audit:checklists:check fails when it is not.
 */
export function unplacedDeprecations(sources: FoundationSources, api: Readonly<Record<string, ApiEntry>> = publicApi): string[] {
  const placed = new Set([...memberships(sources).values()].flat().map((n) => n.name));
  return Object.entries(api)
    .filter(([name, entry]) => entry.kind === "internal-by-accident" || entry.kind === "deprecated-alias" || name in DECIDED_DEPRECATIONS)
    .map(([name]) => name)
    .filter((name) => !placed.has(name))
    .sort((a, b) => a.localeCompare(b));
}

/** The files that declare a renderable foundation's name, on every platform. */
export function foundationHomes(graph: KitGraph, foundation: Foundation): string[] {
  if (foundation.kind !== "renderable") return [];
  const origins = graph.exportOrigins(KIT_ENTRY, foundation.name, "value").filter((o): o is KitSymbol => "file" in o);
  if (!origins.length) throw new Error(`foundations: ${KIT_ENTRY} exports no value named ${foundation.name} that the kit declares`);
  return [...new Set(origins.map((o) => o.file))].sort();
}

/**
 * Whether a test imports a foundation: one of its public exports by name, from the kit's
 * entry or any kit module (a named import, a member read off a kit namespace; see
 * `kitImportsOf`). Not by its module's path alone: a foundation's module can hold another
 * contract's helpers (glass-surface.shared.tsx is GlassModalBlurTarget's home and the
 * GlassSurface shell's), so importing the module is not importing the foundation.
 */
export function importsFoundation(imports: Pick<KitImports, "names">, names: readonly string[]): boolean {
  return names.some((name) => imports.names.has(name));
}

/** Every component as the consumer reader takes it, in the inventory's (the docs') order. */
export function consumerCandidates(root: string, list: readonly InventoryComponent[] = inventoryComponents()): ConsumerCandidate[] {
  return list.map((component) => {
    const { sourceDir, implementation } = componentImplementation(root, component.slug);
    return { slug: component.slug, modules: implementation.modules, sourceDir: implementation.kind === "directory" ? sourceDir : null };
  });
}

/** What the reader needs besides the corpus: the kit graph, the components and the pages. */
export interface FoundationSources {
  kit: KitGraph;
  candidates: ConsumerCandidate[];
  pages: InventoryPage[];
  /** Each page's own entry's kit names (`pageKitNames`), by page id. */
  pageNames: Map<string, string[]>;
  /** The kit names each `tokens/*` page imports, by route (`tokenPageNames`). */
  tokenNames: Map<string, string[]>;
}

/**
 * A foundation's code, read from the kit graph: what its turn reviews and what its
 * consumers are found from.
 *
 *   - `exports`: the declarations of its public value exports;
 *   - `implementation`: the private declarations those read, through private declarations
 *     alone. A declaration is private when no public export of the kit resolves to it, it
 *     is outside every component's own modules, and no component's own module reads it:
 *     the kit's shared vocabulary (a hook every component calls) is not one foundation's
 *     code. GlassSurface's shell, material runtime and web frost; the overlay layer
 *     AnchoredOverlay publishes through;
 *   - `seams`: the implementation it owns (kit-graph.ts `ownersByReaders`): every reader
 *     among the foundations' exports and the private declarations they own is its own.
 *     The overlay layer is Portal's and AnchoredOverlay's both, so it is a seam of
 *     neither; BreakpointOverrideContext is read by BreakpointOverride's hooks and by that
 *     shared layer, which relays it into every portal, so it is BreakpointOverride's.
 *
 * Its consumers are the components that read its exports or its seams; its Source files
 * are its homes, its exports' files and its implementation's; a test that imports one of
 * its implementation's declarations tests it.
 */
export interface FoundationCode {
  exports: KitSymbol[];
  implementation: KitSymbol[];
  seams: KitSymbol[];
}

const codeCache = new WeakMap<FoundationSources, Map<string, FoundationCode>>();

/** A foundation's public names, each with the kit files that declare it (`memberships`). */
function exportNamesOf(sources: FoundationSources, foundation: Foundation): PublicName[] {
  const names = memberships(sources).get(foundation.id);
  if (!names?.length) throw new Error(`foundations: no public export of the kit belongs to ${foundation.name}`);
  return names;
}

/** Every foundation's code (`FoundationCode`), by foundation id, read once per sources. */
export function foundationCode(sources: FoundationSources): ReadonlyMap<string, FoundationCode> {
  const cached = codeCache.get(sources);
  if (cached) return cached;
  const { kit } = sources;
  const edges = kit.edges();
  const readers = kit.readers();
  const publicDecls = new Set<string>();
  for (const name of Object.keys(publicApi)) for (const o of kit.exportOrigins(KIT_ENTRY, name, "value")) if ("file" in o) publicDecls.add(symbolId(o));
  const componentNodes = new Set(sources.candidates.flatMap((c) => c.modules.flatMap((m) => kit.nodesOf(m))));
  const isPrivate = (id: string): boolean =>
    edges.has(id) &&
    symbolOf(id).name !== MODULE_BODY &&
    !publicDecls.has(id) &&
    !componentNodes.has(id) &&
    ![...(readers.get(id) ?? [])].some((reader) => componentNodes.has(reader));
  const all = foundations();
  const exportsOf = new Map<string, string[]>();
  const seed = new Map<string, Set<string>>();
  for (const f of all) {
    const ids = exportNamesOf(sources, f)
      .filter((e) => e.value)
      .flatMap((e) => kit.exportOrigins(KIT_ENTRY, e.name, "value").filter((o): o is KitSymbol => "file" in o).map(symbolId));
    const unique = [...new Set(ids)];
    exportsOf.set(f.id, unique);
    for (const id of unique) seed.set(id, new Set([...(seed.get(id) ?? []), f.id]));
  }
  const implementationOf = new Map<string, string[]>();
  for (const f of all) {
    const seen = new Set(exportsOf.get(f.id));
    const queue = [...seen];
    const found: string[] = [];
    for (let i = 0; i < queue.length; i++) {
      for (const to of edges.get(queue[i]!) ?? []) {
        if (seen.has(to)) continue;
        seen.add(to);
        if (!isPrivate(to)) continue;
        found.push(to);
        queue.push(to);
      }
    }
    implementationOf.set(f.id, found.sort());
  }
  // Ownership is read over the implementations and the module bodies outside the components
  // (a module's top-level statements, which every declaration of the module reads).
  const bodies = kit.files.map((file) => symbolId({ file, name: MODULE_BODY })).filter((id) => !componentNodes.has(id));
  const within = new Set([...[...implementationOf.values()].flat(), ...bodies]);
  const owners = ownersByReaders(kit, seed, within);
  const code = new Map<string, FoundationCode>();
  for (const f of all) {
    const implementation = implementationOf.get(f.id)!;
    code.set(f.id, {
      exports: exportsOf.get(f.id)!.map(symbolOf),
      implementation: implementation.map(symbolOf),
      seams: implementation.filter((id) => owners.get(id)?.has(f.id)).map(symbolOf),
    });
  }
  codeCache.set(sources, code);
  return code;
}

/**
 * The kit modules a test imports, as the graph's files (a `src/...` path with or without its
 * extension, `src` for the package entry); `dist/...` is the build, which the graph does not
 * cover.
 */
function graphModules(root: string, kitPaths: readonly string[]): string[] {
  return [...new Set(kitPaths.flatMap((path) => moduleFiles(root, "index.ts", `./${path}`)))];
}

/**
 * Whether a test imports one of a foundation's implementation declarations by name: a name
 * it imports that one of the kit modules it imports resolves to one of them (test/glass-
 * surface.test.ts imports the GlassSurface shell's `specularRim` from glass-surface.shared.tsx).
 */
export function importsImplementation(kit: KitGraph, imports: Pick<KitImports, "names" | "modules">, implementation: readonly KitSymbol[]): boolean {
  if (!implementation.length || !imports.names.size) return false;
  const ids = new Set(implementation.map(symbolId));
  for (const file of graphModules(kit.root, imports.modules)) {
    if (!kit.files.includes(file)) continue;
    for (const name of imports.names) {
      if (kit.exportOrigins(file, name, "value").some((o) => "file" in o && ids.has(symbolId(o)))) return true;
    }
  }
  return false;
}

/** Whether a test file is named for a foundation: `test/<id>.test.tsx` or `test/<id>-<what>.test.tsx` (test/anchored-overlay-dismissal.test.tsx). */
export function namedFor(file: string, foundation: Pick<Foundation, "id">): boolean {
  const base = file.split("/").pop() ?? file;
  return base.startsWith(`${foundation.id}.`) || base.startsWith(`${foundation.id}-`);
}

export function foundationSources(root: string, kit = new KitGraph(root), pageList: InventoryPage[] = inventoryPages()): FoundationSources {
  const pageNames = new Map(
    pageList.map((page) => {
      const module = pageModule(page.kind, page.slug);
      return [page.id, pageKitNames(module, readFileSync(join(root, module), "utf8"), page.slug)] as const;
    }),
  );
  return { kit, candidates: consumerCandidates(root), pages: pageList, pageNames, tokenNames: tokenPageNames(root) };
}

/** The docs routes a foundation's exports are documented on or planned for, and whether the capture inventory holds each. */
function docsPages(exports: FoundationExport[], pageList: InventoryPage[], extra: string[]): FoundationDocsPage[] {
  const served = new Set([...guideRoutes().filter((r) => !r.redirects).map((r) => r.path.slice(1)), ...pageList.map((p) => p.route.slice(1))]);
  const byRoute = new Map<string, FoundationDocsPage>();
  const page = (route: string) => {
    let found = byRoute.get(route);
    if (!found) {
      found = { route, documents: [], planned: [], page: pageList.find((p) => p.route === `/${route}`)?.id ?? null, exists: served.has(route) };
      byRoute.set(route, found);
    }
    return found;
  };
  for (const route of extra) page(route);
  for (const e of exports) {
    if (e.documented) page(e.documented.route).documents.push(e.name);
    if (e.planned) page(e.planned).planned.push(e.name);
  }
  return [...byRoute.values()].sort((a, b) => a.route.localeCompare(b.route));
}

/** One foundation's facts. */
export function foundationFacts(foundation: Foundation, corpus: Pick<FactsCorpus, "tests">, sources: FoundationSources): FoundationFacts {
  const { kit } = sources;
  const homes = foundationHomes(kit, foundation);
  const names = exportNamesOf(sources, foundation);
  const code = foundationCode(sources).get(foundation.id)!;
  const exports: FoundationExport[] = names.map(({ name, value, declared }) => {
    const entry = publicApi[name]!;
    return {
      name,
      kind: entry.kind,
      value,
      declared,
      documented: entry.docs ? { route: entry.docs, section: entry.section ?? null } : null,
      planned: PENDING_DOCS[name] ?? null,
      k12: k12Status(name, entry),
    };
  });
  const sourceFiles = [...new Set([...homes, ...exports.flatMap((e) => e.declared.filter((d) => d.startsWith("src/"))), ...code.implementation.map((s) => s.file)])].sort();
  const materials = materialCoverage.find((m) => m.tier === "style" && m.name === foundation.name) ?? null;
  // Its own guide pages: the token pages for the tokens, the generated reference for the internals.
  const ownRoutes = foundation.kind === "tokens" ? tokenPages().map((p) => p.slice(1)) : foundation.kind === "reference" ? [REFERENCE_ROUTE] : [];
  const docs = docsPages(exports, sources.pages, [...ownRoutes, ...(materials?.docsRoute ? [materials.docsRoute] : [])]);
  const exportNames = exports.map((e) => e.name);
  // The consumer edges are the values among its public exports, at their declarations, and its seams.
  const consumers = consumersOf(kit, [...code.exports, ...code.seams], sources.candidates);
  const valueNames = new Set(exports.filter((e) => e.value).map((e) => e.name));
  const pages = sources.pages.flatMap((p) => {
    const used = (sources.pageNames.get(p.id) ?? []).filter((n) => valueNames.has(n));
    return used.length ? [{ id: p.id, names: used }] : [];
  });
  const documentingPages = docs.filter((d) => d.page !== null).map((d) => d.page!);
  const capturePages = sources.pages.map((p) => p.id).filter((id) => pages.some((p) => p.id === id) || documentingPages.includes(id));
  return {
    foundation,
    homes: foundation.kind === "renderable" ? homes : ownRoutes.map((r) => `/${r}`),
    sourceFiles,
    exports,
    docs,
    materials,
    tests: corpus.tests
      .filter(({ file, imports }) => importsFoundation(imports, exportNames) || importsImplementation(kit, imports, code.implementation) || namedFor(file, foundation))
      .map(({ file }) => file),
    consumers,
    pages,
    captureThrough: { components: consumers.map((c) => c.slug), pages: capturePages },
    notCaptured: docs.filter((d) => d.page === null),
    seams: code.seams,
    turnRecord: `audit/${turnRecordFile(foundation.id)}`,
  };
}

/** A foundation by its id (`glass-pane`) or its name (`GlassPane`), or null. */
export function findFoundation(name: string): Foundation | null {
  return foundations().find((f) => f.id === name || f.name === name) ?? null;
}
