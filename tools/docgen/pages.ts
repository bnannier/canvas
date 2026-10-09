// The component pages docgen reads, and the gate on their shape. Shared by the
// generator (tools/docgen/generate.ts) and the corpus test
// (tools/docgen/doc-structure.test.ts), so the two walk exactly the same files and
// report exactly the same findings.

import * as fs from "node:fs";
import * as path from "node:path";
import { docStructureViolations } from "./parse-md.ts";

/** The kit categories under src/ that hold component pages. */
export const CATEGORIES = ["atoms", "molecules", "organisms", "charts"] as const;
export type Category = (typeof CATEGORIES)[number];

/** One component page: src/<category>/<dir>/<dir>.md and its text. */
export type ComponentPage = { category: Category; dir: string; source: string; content: string };

/** The registry fields the gate reads (docs/src/core/data/components.ts). */
export type RegisteredComponent = { slug: string; dir?: string; name: string };

/** Every component page in the repo, by category, then dir name. */
export function componentPages(repo: string): ComponentPage[] {
  const pages: ComponentPage[] = [];
  for (const category of CATEGORIES) {
    const catDir = path.join(repo, "src", category);
    if (!fs.existsSync(catDir)) continue;
    for (const dir of fs.readdirSync(catDir).sort()) {
      const source = `src/${category}/${dir}/${dir}.md`;
      const file = path.join(repo, source);
      if (!fs.existsSync(file)) continue;
      pages.push({ category, dir, source, content: fs.readFileSync(file, "utf8") });
    }
  }
  return pages;
}

/**
 * The structure findings for a set of pages against the docs registry, each one
 * located ("src/atoms/popover/popover.md:27 S3: ..."). Beyond the per-page rules
 * (docStructureViolations), S1 also holds the pages and the registry to each other:
 * every page documents a registered component, and every registered component (its
 * `dir`, or its `slug` when they match) has a page.
 */
export function pageStructureViolations(pages: ComponentPage[], components: readonly RegisteredComponent[]): string[] {
  const names = new Map(components.map((c) => [c.dir ?? c.slug, c.name]));
  const out: string[] = [];
  for (const page of pages) {
    const name = names.get(page.dir);
    if (name === undefined) {
      out.push(`${page.source}:1 S1: no component in docs/src/core/data/components.ts documents "${page.dir}"; register it there (dir: "${page.dir}" when its slug differs)`);
      continue;
    }
    for (const v of docStructureViolations(page.content, { name })) out.push(`${page.source}:${v.line} ${v.rule}: ${v.message}`);
  }
  const documented = new Set(pages.map((p) => p.dir));
  for (const c of components) {
    const dir = c.dir ?? c.slug;
    if (!documented.has(dir)) {
      out.push(`docs/src/core/data/components.ts S1: "${c.name}" has no page; add src/<category>/${dir}/${dir}.md`);
    }
  }
  return out;
}
