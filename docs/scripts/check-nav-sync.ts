// Guards the single source of truth: every component/template/pattern enumerated in
// src/data/nav.config.json must exist in docs-core (and vice versa), so a page can
// never silently drift out of the navigation. Run by CI (docs.yml) and `bun run check:nav`.
//
// Imports only the JSON + docs-core data registries (no React Native), so it runs in
// plain bun/node.
import navConfig from "../src/data/nav.config.json";
import { COMPONENTS } from "../../docs-core/data/components";
import { getAllTemplates } from "../../docs-core/data/templates";
import { getAllPatterns } from "../../docs-core/data/patterns";

interface SidebarGroup {
  group: string;
  base?: string;
  components?: { slug: string }[];
}
const sidebar = (navConfig as { web: { sidebar: SidebarGroup[] } }).web.sidebar;

function navLeafSlugs(base: string): string[] {
  return sidebar
    .filter((g) => g.base === base && Array.isArray(g.components))
    .flatMap((g) => g.components!.map((c) => c.slug));
}

function diff(name: string, navSlugs: string[], coreSlugs: string[]): string[] {
  const errs: string[] = [];
  const navSet = new Set<string>();
  for (const s of navSlugs) {
    if (navSet.has(s)) errs.push(`${name}: duplicate slug "${s}" in nav.config.json`);
    navSet.add(s);
  }
  const coreSet = new Set(coreSlugs);
  for (const s of coreSlugs) if (!navSet.has(s)) errs.push(`${name}: "${s}" is in docs-core but missing from nav.config.json`);
  for (const s of navSet) if (!coreSet.has(s)) errs.push(`${name}: "${s}" is in nav.config.json but not in docs-core`);
  return errs;
}

const errors = [
  ...diff("components", navLeafSlugs("/components"), COMPONENTS.map((c) => c.slug)),
  ...diff("templates", navLeafSlugs("/templates"), getAllTemplates().map((t) => t.slug)),
  ...diff("patterns", navLeafSlugs("/patterns"), getAllPatterns().map((p) => p.slug)),
];

if (errors.length) {
  console.error("✗ nav.config.json is out of sync with docs-core:\n" + errors.map((e) => "  - " + e).join("\n"));
  process.exit(1);
}

console.log(
  `✓ nav.config.json in sync with docs-core ` +
    `(${COMPONENTS.length} components, ${getAllTemplates().length} templates, ${getAllPatterns().length} patterns)`,
);
