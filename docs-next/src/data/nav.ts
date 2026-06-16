import { COMPONENTS } from "docs-core/data/components";
import { getAllPatterns } from "docs-core/data/patterns";
import { getAllTemplates } from "docs-core/data/templates";

// The docs navigation tree, recreated for the native shell. Mirrors the web sidebar's
// groups; the component groups are derived from the shared metadata (alphabetical),
// the rest are the fixed Overview / Tokens / Guides / Templates / Patterns groups.
export interface NavItem {
  label: string;
  href: string;
}
export interface NavGroup {
  title: string;
  collapsible: boolean;
  items: NavItem[];
}

const sortByLabel = (a: NavItem, b: NavItem) => a.label.localeCompare(b.label);

const byCategory = (category: string): NavItem[] =>
  COMPONENTS.filter((c) => c.category === category)
    .map((c) => ({ label: c.name, href: `/components/${c.slug}` }))
    .sort(sortByLabel);

export const NAV_GROUPS: NavGroup[] = [
  {
    title: "Overview",
    collapsible: false,
    items: [
      { label: "About Canvas", href: "/" },
      { label: "All components", href: "/components" },
    ],
  },
  {
    title: "Tokens & Utilities",
    collapsible: false,
    items: [
      { label: "Colors & Theme", href: "/tokens/colors" },
      { label: "Spacing & Shape", href: "/tokens/spacing" },
      { label: "Typography", href: "/tokens/typography" },
      { label: "Layout & Flexbox", href: "/tokens/layout" },
    ],
  },
  {
    title: "Guides",
    collapsible: true,
    items: [
      { label: "Integration", href: "/integration" },
      { label: "Theming", href: "/theming" },
      { label: "React Native", href: "/rn-primitives" },
      { label: "Browser Support", href: "/browser-support" },
    ],
  },
  { title: "Atoms", collapsible: true, items: byCategory("Atoms") },
  { title: "Molecules", collapsible: true, items: byCategory("Molecules") },
  { title: "Organisms", collapsible: true, items: byCategory("Organisms") },
  {
    title: "Templates",
    collapsible: true,
    items: getAllTemplates()
      .map((t) => ({ label: t.name, href: `/templates/${t.slug}` }))
      .sort(sortByLabel),
  },
  {
    title: "Patterns",
    collapsible: true,
    items: getAllPatterns()
      .map((p) => ({ label: p.name, href: `/patterns/${p.slug}` }))
      .sort(sortByLabel),
  },
];

// Flattened, ordered list of real content pages, for prev/next page navigation.
export const FLAT_PAGES: NavItem[] = NAV_GROUPS.flatMap((g) => g.items).filter(
  (i) => i.href !== "/",
);
