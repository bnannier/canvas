// The audit's Foundations tier (the plan's "Foundations"): the style-layer renderables with
// no component page of their own (AnchoredOverlay, GlassSurface, ThemeProvider and the
// rest, `STYLE_LAYER_RENDERABLES`) and the design tokens the `tokens/*` docs pages
// document. Each gets a checklist under audit/foundation/, whose facts this module
// gathers from the kit's source and its own manifests, with no React Native import:
//
//   - its source files and public exports, each with its classification in the public API
//     manifest (tools/api/manifest.ts) and its K12-2 status (a deprecated alias to come, or
//     public, by the owner's decisions in audit/DECISIONS.md);
//   - the docs routes that document it or are planned to (the API manifest's `docs` and
//     PENDING_DOCS), and its materials manifest entry;
//   - the tests that import it (the same import rule the component facts use);
//   - its consumers: every kit component that renders through it, read from the source by
//     the kit graph (tools/audit/kit-graph.ts), directly, through shared modules, or
//     through other kit components;
//   - the pattern and template pages whose own entry names one of its exports;
//   - its Capture through list: the component slugs and page ids whose captures show it,
//     in the consumers' order, which `bun run audit:turn -- --slug=<foundation>` expands to.
//
// A renderable foundation is the module that declares its name (on every platform) and
// the public exports whose way out of the kit's entry passes through that module, so
// FloatingLabel and LabelContent (one module) share their exports, and so do Portal and
// OverlayProvider. The design tokens are the public names the API manifest documents on a
// `tokens/*` page, or plans to.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { guideRoutes } from "../../e2e/support/routes.ts";
import { PENDING_DOCS, publicApi } from "../api/manifest.ts";
import type { ApiEntry, ApiKind } from "../api/types.ts";
import { materialCoverage } from "../materials/manifest.ts";
import type { MaterialCoverageEntry } from "../materials/types.ts";
import { componentImplementation, pageKitNames, type FactsCorpus, type KitImports } from "./facts.ts";
import { components as inventoryComponents, pageModule, pages as inventoryPages, type InventoryComponent, type InventoryPage } from "./inventory.ts";
import { KitGraph, consumersOf, type Consumer, type ConsumerCandidate, type KitSymbol } from "./kit-graph.ts";
import { STYLE_LAYER_RENDERABLES, TOKENS_FOUNDATION } from "./plan-specifics.ts";
import { turnRecordFile } from "./turn-record.ts";

/** The kit's public entry, where every public name's way out starts. */
export const KIT_ENTRY = "src/index.ts";

/** The checklist directory of the Foundations tier, under audit/. */
export const FOUNDATION_DIR = "foundation";

export interface Foundation {
  /** The renderable's export name, or `Tokens`. */
  name: string;
  /** Its checklist and turn id: the name in kebab case (`glass-modal-blur-target`). */
  id: string;
  kind: "renderable" | "tokens";
}

/** A name in kebab case: `GlassModalBlurTarget` is `glass-modal-blur-target`. */
export function foundationId(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

/** Every foundation, alphabetical: the style-layer renderables and the design tokens. */
export function foundations(): Foundation[] {
  return [
    ...STYLE_LAYER_RENDERABLES.map((name) => ({ name, id: foundationId(name), kind: "renderable" as const })),
    { name: TOKENS_FOUNDATION, id: foundationId(TOKENS_FOUNDATION), kind: "tokens" as const },
  ].sort((a, b) => a.name.localeCompare(b.name));
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
  /** Where its turn records its capture runs, repo-relative. */
  turnRecord: string;
}

/** The public names a foundation is made of, each with the kit files that declare it. */
function foundationNames(graph: KitGraph, foundation: Foundation, homes: Set<string>): { name: string; value: boolean; declared: string[] }[] {
  const out: { name: string; value: boolean; declared: string[] }[] = [];
  const tokenRoutes = new Set(tokenPages().map((path) => path.slice(1)));
  for (const name of Object.keys(publicApi).sort((a, b) => a.localeCompare(b))) {
    const values = graph.exportOrigins(KIT_ENTRY, name, "value");
    const value = values.length > 0;
    const origins = value ? values : graph.exportOrigins(KIT_ENTRY, name, "type");
    const declared = origins.map((o) => ("file" in o ? o.file : o.package)).filter((v, i, all) => all.indexOf(v) === i).sort();
    let ours: boolean;
    if (foundation.kind === "tokens") {
      const entry = publicApi[name]!;
      const route = entry.docs ?? PENDING_DOCS[name] ?? null;
      ours = route !== null && tokenRoutes.has(route);
    } else {
      ours = graph.exportChain(KIT_ENTRY, name, value ? "value" : "type").some((file) => homes.has(file));
    }
    if (ours) out.push({ name, value, declared });
  }
  return out;
}

/** The files that declare a renderable foundation's name, on every platform. */
export function foundationHomes(graph: KitGraph, foundation: Foundation): string[] {
  if (foundation.kind === "tokens") return [];
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
}

export function foundationSources(root: string, kit = new KitGraph(root), pageList: InventoryPage[] = inventoryPages()): FoundationSources {
  const pageNames = new Map(
    pageList.map((page) => {
      const module = pageModule(page.kind, page.slug);
      return [page.id, pageKitNames(module, readFileSync(join(root, module), "utf8"), page.slug)] as const;
    }),
  );
  return { kit, candidates: consumerCandidates(root), pages: pageList, pageNames };
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
  const names = foundationNames(kit, foundation, new Set(homes));
  if (!names.length) throw new Error(`foundations: no public export of the kit belongs to ${foundation.name}`);
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
  const sourceFiles = [...new Set([...homes, ...exports.flatMap((e) => e.declared.filter((d) => d.startsWith("src/")))])].sort();
  const materials = materialCoverage.find((m) => m.tier === "style" && m.name === foundation.name) ?? null;
  const tokenRoutes = foundation.kind === "tokens" ? tokenPages().map((p) => p.slice(1)) : [];
  const docs = docsPages(exports, sources.pages, [...tokenRoutes, ...(materials?.docsRoute ? [materials.docsRoute] : [])]);
  const exportNames = exports.map((e) => e.name);
  // The consumer edges are the values among its public exports, at their declarations.
  const targets: KitSymbol[] = exports.filter((e) => e.value).flatMap((e) => kit.exportOrigins(KIT_ENTRY, e.name, "value").filter((o): o is KitSymbol => "file" in o));
  const consumers = consumersOf(kit, targets, sources.candidates);
  const valueNames = new Set(exports.filter((e) => e.value).map((e) => e.name));
  const pages = sources.pages.flatMap((p) => {
    const used = (sources.pageNames.get(p.id) ?? []).filter((n) => valueNames.has(n));
    return used.length ? [{ id: p.id, names: used }] : [];
  });
  const documentingPages = docs.filter((d) => d.page !== null).map((d) => d.page!);
  const capturePages = sources.pages.map((p) => p.id).filter((id) => pages.some((p) => p.id === id) || documentingPages.includes(id));
  return {
    foundation,
    homes: foundation.kind === "tokens" ? tokenRoutes.map((r) => `/${r}`) : homes,
    sourceFiles,
    exports,
    docs,
    materials,
    tests: corpus.tests.filter(({ imports }) => importsFoundation(imports, exportNames)).map(({ file }) => file),
    consumers,
    pages,
    captureThrough: { components: consumers.map((c) => c.slug), pages: capturePages },
    notCaptured: docs.filter((d) => d.page === null),
    turnRecord: `audit/${turnRecordFile(foundation.id)}`,
  };
}

/** A foundation by its id (`glass-pane`) or its name (`GlassPane`), or null. */
export function findFoundation(name: string): Foundation | null {
  return foundations().find((f) => f.id === name || f.name === name) ?? null;
}
