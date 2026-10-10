// The component pages docgen reads, and the gate on their shape. Shared by the
// generator (tools/docgen/generate.ts) and the corpus test
// (tools/docgen/doc-structure.test.ts), so the two walk exactly the same files and
// report exactly the same findings. The gate reads each component's audit checklist
// too, for the one rule that follows the audit (S10).

import * as fs from "node:fs";
import * as path from "node:path";
import * as ts from "typescript";
import { docStructureViolations } from "./parse-md.ts";
import { COMPONENTS } from "../../docs/src/core/data/components.ts";
import { signedOffPlatforms } from "../audit/sign-off.ts";

/** The kit categories under src/ that hold component pages. */
export const CATEGORIES = ["atoms", "molecules", "organisms", "charts"] as const;
export type Category = (typeof CATEGORIES)[number];

/** One component page: src/<category>/<dir>/<dir>.md and its text. */
export type ComponentPage = { category: Category; dir: string; source: string; content: string };

/** The docs registry, from the repo root: findings about a registry entry point into it. */
export const REGISTRY_SOURCE = "docs/src/core/data/components.ts";

/** Where a component's audit checklist lives, from the repo root: audit/components/<slug>.md. */
export const CHECKLIST_DIR = "audit/components";

/**
 * The registry fields the gate reads, the line of the entry's `slug` in REGISTRY_SOURCE,
 * and the platforms the component's audit checklist signs off (rule S10).
 */
export type RegisteredComponent = { slug: string; dir?: string; name: string; line: number; signedOff: readonly string[] };

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
 * The line of each entry's `slug` in the registry's source, by slug, read from the
 * module's syntax tree (the first entry wins a repeated slug).
 */
export function registrySlugLines(source: string): Map<string, number> {
  const file = ts.createSourceFile(REGISTRY_SOURCE, source, ts.ScriptTarget.Latest, true);
  const lines = new Map<string, number>();
  const visit = (node: ts.Node) => {
    if (ts.isPropertyAssignment(node) && ts.isIdentifier(node.name) && node.name.text === "slug" && ts.isStringLiteral(node.initializer)) {
      const slug = node.initializer.text;
      if (!lines.has(slug)) lines.set(slug, file.getLineAndCharacterOfPosition(node.getStart(file)).line + 1);
    }
    ts.forEachChild(node, visit);
  };
  visit(file);
  return lines;
}

/**
 * The platforms a component's audit checklist (audit/components/<slug>.md) signs off,
 * read with the audit's own sign-off reader (tools/audit/sign-off.ts); none while the
 * checklist does not exist yet.
 */
export function checklistSignOffs(repo: string, slug: string): string[] {
  const file = path.join(repo, CHECKLIST_DIR, `${slug}.md`);
  return fs.existsSync(file) ? signedOffPlatforms(fs.readFileSync(file, "utf8")) : [];
}

/**
 * The registered components (docs/src/core/data/components.ts), each with the line its
 * `slug` sits on, so a finding about an entry is located like every other finding, and
 * the platforms its audit checklist signs off. An entry whose slug is not written as a
 * string literal there cannot be located, and fails rather than point at a made-up line.
 */
export function registeredComponents(repo: string): RegisteredComponent[] {
  const lines = registrySlugLines(fs.readFileSync(path.join(repo, REGISTRY_SOURCE), "utf8"));
  return COMPONENTS.map((c) => {
    const line = lines.get(c.slug);
    if (line === undefined) throw new Error(`${REGISTRY_SOURCE}: no \`slug: "${c.slug}"\` literal locates the registry entry for "${c.name}"`);
    return { slug: c.slug, dir: c.dir, name: c.name, line, signedOff: checklistSignOffs(repo, c.slug) };
  });
}

/**
 * The structure findings for a set of pages against the docs registry, each one
 * located ("src/atoms/popover/popover.md:27 S3: ..."). Beyond the per-page rules
 * (docStructureViolations), S1 also holds the pages and the registry to each other:
 * every page documents a registered component, and every registered component (its
 * `dir`, or its `slug` when they match) has a page, a missing one reported at the
 * entry's line in the registry. S10 holds a page to its component's audit checklist:
 * once the checklist signs a platform off, the page carries "## Accessibility".
 */
export function pageStructureViolations(pages: ComponentPage[], components: readonly RegisteredComponent[]): string[] {
  const byDir = new Map(components.map((c) => [c.dir ?? c.slug, c]));
  const out: string[] = [];
  for (const page of pages) {
    const component = byDir.get(page.dir);
    if (component === undefined) {
      out.push(`${page.source}:1 S1: no component in ${REGISTRY_SOURCE} documents "${page.dir}"; register it there (dir: "${page.dir}" when its slug differs)`);
      continue;
    }
    const signedOff = { checklist: `${CHECKLIST_DIR}/${component.slug}.md`, platforms: component.signedOff };
    for (const v of docStructureViolations(page.content, { name: component.name, signedOff })) out.push(`${page.source}:${v.line} ${v.rule}: ${v.message}`);
  }
  const documented = new Set(pages.map((p) => p.dir));
  for (const c of components) {
    const dir = c.dir ?? c.slug;
    if (!documented.has(dir)) {
      out.push(`${REGISTRY_SOURCE}:${c.line} S1: "${c.name}" has no page; add src/<category>/${dir}/${dir}.md`);
    }
  }
  return out;
}
