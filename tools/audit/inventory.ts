// The one source of capture ids for the component audit: every component with its
// example variants, every pattern and template page, and the axes a capture runs over
// (looks, surfaces, widths, platforms). Every audit runner, analyzer, sheet builder and
// checklist reads this module, so two of them can never disagree about what a cell is
// called or how many there are.
//
// The routes and variants come from e2e/support/routes.ts, which derives them from
// the docs' own nav config and each component's markdown, so the inventory cannot
// drift from what the docs app serves. No React Native import: the docs' pattern and
// template data modules compose real kit components, so this reads the nav config and
// markdown the way the e2e suite does, reads a page's sections out of its data module's
// source (`pageSections`), and runs under plain bun.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";
import { COMPONENTS } from "../../docs/src/core/data/components.ts";
import type { Category } from "../../docs/src/core/data/types.ts";
import { ROOT, componentExamples, contentRoutes, variantSlug } from "../../e2e/support/routes.ts";
import { breakpoints, type BreakpointKey } from "../../src/style/tokens.ts";

/** The three looks: the two light palettes and Dark Factory's one dark palette. */
export const LOOKS = ["blush", "mint", "dark"] as const;
export type Look = (typeof LOOKS)[number];

/** The two surface modes of the ThemeProvider. */
export const SURFACES = ["solid", "glass"] as const;
export type Surface = (typeof SURFACES)[number];

/**
 * The web viewports. Desktop is 1440 because Dark Factory's own reference strips are
 * 1440/768/390; the kit's `page` cap (1280) then shows inside it.
 */
export const WIDTHS = [
  { key: "phone", width: 390, height: 844 },
  { key: "tablet", width: 768, height: 1024 },
  { key: "desktop", width: 1440, height: 900 },
] as const;
export type WidthKey = (typeof WIDTHS)[number]["key"];

/**
 * The web widths at and below a breakpoint of the kit's scale (src/style/tokens.ts
 * `breakpoints`): where a component that switches on the viewport's bucket (`useBreakpoint`)
 * takes the form it has at and below that breakpoint, as FilterPanel's and Sidebar's
 * drawers do at and below their `drawerBreakpoint`.
 */
export function widthsAtOrBelow(breakpoint: BreakpointKey): WidthKey[] {
  return WIDTHS.filter((w) => w.width <= breakpoints[breakpoint]).map((w) => w.key);
}

export const PLATFORMS = ["web", "ios", "android"] as const;
export type Platform = (typeof PLATFORMS)[number];

/** Cells one variant stands for on the web: widths x looks x surfaces. */
export const WEB_CELLS_PER_VARIANT = WIDTHS.length * LOOKS.length * SURFACES.length;
/** Cells one variant stands for on one native platform: looks x surfaces. */
export const NATIVE_CELLS_PER_VARIANT = LOOKS.length * SURFACES.length;

export interface ComponentVariant {
  /** The component page's slug. */
  slug: string;
  /** The Playground rail label, as the markdown spells it. */
  label: string;
  /** The capture directory name: `variantSlug(label)`, `default` for the Usage fence. */
  variant: string;
  /** The docs route that opens this example. */
  path: string;
}

export interface InventoryComponent {
  slug: string;
  name: string;
  category: Category;
  /** The source directory under `src/<category>/`. */
  dir: string;
  route: string;
  variants: ComponentVariant[];
}

export type PageKind = "pattern" | "template";

export interface InventoryPage {
  kind: PageKind;
  slug: string;
  /** The checklist and capture directory name: `<kind>-<slug>`. */
  id: string;
  route: string;
  /** The docs data module that composes the page, repo-relative. */
  module: string;
  /**
   * The sections the page renders, in order: each title and its key (`sectionKeys`), which
   * names the section's checklist row and its capture (the docs mark each section on the
   * web with the same key, docs/src/ui/mockup-page.tsx).
   */
  sections: { key: string; title: string }[];
}

/** Every component page with its example variants, in docs order. */
export function components(): InventoryComponent[] {
  const bySlug = new Map(COMPONENTS.map((c) => [c.slug, c]));
  return componentExamples().map(({ route, examples }) => {
    const doc = bySlug.get(route.name);
    if (!doc) throw new Error(`inventory: ${route.path} has examples but no COMPONENTS entry`);
    const variants = examples.map((example) => ({
      slug: route.name,
      label: example.label,
      variant: variantSlug(example.label),
      path: example.path,
    }));
    const seen = new Set<string>();
    for (const { variant, label } of variants) {
      if (seen.has(variant)) throw new Error(`inventory: ${route.path} has two examples whose labels slugify to "${variant}" (one is "${label}")`);
      seen.add(variant);
    }
    return { slug: route.name, name: doc.name, category: doc.category, dir: doc.dir ?? doc.slug, route: route.path, variants };
  });
}

/** Every pattern and template page, in docs order, with its sections. */
export function pages(): InventoryPage[] {
  return contentRoutes()
    .filter((route): route is typeof route & { kind: PageKind } => route.kind === "pattern" || route.kind === "template")
    .map((route) => {
      const kind = route.kind;
      const slug = route.name;
      const id = `${kind}-${slug}`;
      const module = pageModule(kind, slug);
      const titles = pageSections(module, readFileSync(join(ROOT, module), "utf8"), slug);
      const keys = sectionKeys(id, titles);
      return { kind, slug, id, route: route.path, module, sections: titles.map((title, i) => ({ key: keys[i]!, title })) };
    });
}

/** The docs data module a pattern or template page renders from, repo-relative. */
export function pageModule(kind: PageKind, slug: string): string {
  return kind === "pattern" ? "docs/src/core/data/patterns.tsx" : `docs/src/core/data/templates/${slug}.tsx`;
}

/**
 * The `title` of each entry in the `sections` array of the object literal whose `slug` is
 * the page's, read from the data module's source: the modules compose real kit components,
 * so they are parsed, never imported. A section without a literal title reads
 * `(untitled)`; a page with no such entry has no sections.
 */
export function pageSections(file: string, source: string, slug: string): string[] {
  const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, file.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
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

/** The key of a page's whole-page row, ahead of its section rows. */
export const PAGE_ROW_KEY = "page";

/**
 * A page's section keys, one per section title in order: the title slugified the way a
 * variant label is (`variantSlug`), so a section keeps its key when another section is
 * inserted, removed or moved. Two titles that slugify alike, or one that slugifies to
 * the whole page's key, are refused, as two example labels are.
 */
export function sectionKeys(pageId: string, titles: string[]): string[] {
  const seen = new Map<string, string>([[PAGE_ROW_KEY, "the whole page"]]);
  return titles.map((title) => {
    const key = variantSlug(title);
    if (!key) throw new Error(`inventory: ${pageId} has a section whose title "${title}" slugifies to nothing`);
    const taken = seen.get(key);
    if (taken) throw new Error(`inventory: ${pageId} has a section "${title}" whose key "${key}" is taken by ${taken}`);
    seen.set(key, `the section "${title}"`);
    return key;
  });
}

export type Cell =
  | { platform: "web"; slug: string; variant: string; width: WidthKey; look: Look; surface: Surface }
  | { platform: "ios" | "android"; slug: string; variant: string; look: Look; surface: Surface };

/**
 * A cell's id, which is also its path under a capture run:
 * `web/<slug>/<variant>/<width>.<look>.<surface>` or
 * `<ios|android>/<slug>/<variant>/<look>.<surface>`.
 */
export function cellId(cell: Cell): string {
  const leaf = cell.platform === "web" ? `${cell.width}.${cell.look}.${cell.surface}` : `${cell.look}.${cell.surface}`;
  return `${cell.platform}/${cell.slug}/${cell.variant}/${leaf}`;
}

/** Every cell of one variant: 18 on the web and 6 on each native platform. */
export function cellsFor(slug: string, variant: string): Cell[] {
  const cells: Cell[] = [];
  for (const look of LOOKS) {
    for (const surface of SURFACES) {
      for (const { key } of WIDTHS) cells.push({ platform: "web", slug, variant, width: key, look, surface });
      cells.push({ platform: "ios", slug, variant, look, surface });
      cells.push({ platform: "android", slug, variant, look, surface });
    }
  }
  return cells;
}

export type PageCell =
  | { platform: "web"; page: string; width: WidthKey; look: Look; surface: Surface }
  | { platform: "ios" | "android"; page: string; look: Look; surface: Surface };

/**
 * A page cell's id: `web-pages/<kind>-<slug>/<width>.<look>.<surface>` or
 * `<ios|android>-pages/<kind>-<slug>/<look>.<surface>`.
 */
export function pageCellId(cell: PageCell): string {
  const leaf = cell.platform === "web" ? `${cell.width}.${cell.look}.${cell.surface}` : `${cell.look}.${cell.surface}`;
  return `${cell.platform}-pages/${cell.page}/${leaf}`;
}

/** Every cell of one page: 18 on the web and 6 on each native platform. */
export function pageCellsFor(page: string): PageCell[] {
  const cells: PageCell[] = [];
  for (const look of LOOKS) {
    for (const surface of SURFACES) {
      for (const { key } of WIDTHS) cells.push({ platform: "web", page, width: key, look, surface });
      cells.push({ platform: "ios", page, look, surface });
      cells.push({ platform: "android", page, look, surface });
    }
  }
  return cells;
}
