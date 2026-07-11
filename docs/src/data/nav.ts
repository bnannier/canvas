import navConfigJson from "./nav.config.json";

// The single source of truth for navigation is nav.config.json: a `routes` registry,
// a `web.sidebar` tree (with the component leaves enumerated), and a `mobile.tabs`
// node. This module is the typed loader over it. It rebuilds the SAME NavGroup[] the
// sidebar already consumes (so the web sidebar is unchanged) and exposes the mobile
// config for the native tab bar. The JSON carries icon NAMES in kebab-case; the sidebar
// renders them with the kit `Icon` atom, so `icon()` just maps a JSON name to the kit's
// camelCase glyph key (e.g. "bar-chart-2" -> "barChart2"); no external icon package.
function icon(name: string): string {
  return name.replace(/-([a-z0-9])/g, (_m, c: string) => c.toUpperCase());
}

export interface NavItem {
  slug: string;
  label: string;
  href: string;
  /** A kit `Icon` glyph key (camelCase prop name), e.g. "barChart2". */
  icon: string;
}
export interface NavGroup {
  label: string;
  /** A kit `Icon` glyph key (camelCase prop name). */
  icon: string;
  items: NavItem[];
}

// ── nav.config.json shapes (the on-disk single source of truth) ──────────────
export interface NavConfigRoute {
  label: string;
  href: string;
  icon: string;
}
interface NavConfigLeaf {
  slug: string;
  label: string;
  icon: string;
}
type NavConfigGroup =
  | { group: string; icon: string; collapsible?: boolean; routes: string[] }
  | { group: string; icon: string; collapsible?: boolean; base: string; components: NavConfigLeaf[] };
export interface NavTab {
  id: string;
  label: string;
  role?: "search";
  icon: { ios: string; android: string };
  topbar?: { inline?: string[]; overflow?: string[]; categories?: string[] };
}
export interface NavConfig {
  routes: Record<string, NavConfigRoute>;
  web: { sidebar: NavConfigGroup[] };
  mobile: { tabs: NavTab[] };
}

const CONFIG = navConfigJson as unknown as NavConfig;

// ── Active-state helpers (pathname is group-transparent, so these are unchanged) ─
export function getActiveSlug(pathname: string): string {
  if (pathname === "/") return "";
  const m = pathname.match(/^\/components\/(.+)$/);
  if (m) return m[1];
  const tpl = pathname.match(/^\/templates\/(.+)$/);
  if (tpl) return "tpl-" + tpl[1];
  const pat = pathname.match(/^\/patterns\/(.+)$/);
  if (pat) return "pat-" + pat[1];
  return pathname.replace(/^\//, "").replace(/\//g, "-");
}

// A NavItem's slug is derivable from its href (same rule the router uses), so the JSON
// never has to store it for registry routes and we stay consistent with getActiveSlug.
function navItem(label: string, href: string, iconName: string): NavItem {
  return { slug: getActiveSlug(href), label, href, icon: icon(iconName) };
}

export const NAV_ROUTES = CONFIG.routes;

export function routeItem(key: string): NavItem {
  const r = CONFIG.routes[key];
  return navItem(r.label, r.href, r.icon);
}

// The web sidebar tree, rebuilt from the JSON into the exact shape sidebar.tsx consumes.
export const NAV_GROUPS: NavGroup[] = CONFIG.web.sidebar.map((g): NavGroup => {
  const items: NavItem[] =
    "components" in g
      ? g.components.map((c) => navItem(c.label, `${g.base}/${c.slug}`, c.icon))
      : g.routes.map((k) => routeItem(k));
  return { label: g.group, icon: icon(g.icon), items };
});

// Alphabetize within each group.
for (const group of NAV_GROUPS) {
  group.items.sort((a, b) => a.label.localeCompare(b.label));
}

export const COMPARE_ITEM: NavItem = { slug: "compare", label: "Compare", href: "/compare", icon: "gitCompare" };

export function getActiveGroup(pathname: string): string | null {
  const slug = getActiveSlug(pathname);
  for (const g of NAV_GROUPS) {
    if (g.items.some((i) => i.slug === slug)) return g.label;
  }
  return null;
}

// Flattened, ordered content pages for prev/next nav (excludes the home route).
export const FLAT_PAGES: NavItem[] = NAV_GROUPS.flatMap((g) => g.items).filter((i) => i.href !== "/");

// ── Mobile (iOS + Android) tab bar config, consumed by the native nav chrome ─────
export const MOBILE_TABS: NavTab[] = CONFIG.mobile.tabs;

// Which tab/section a route belongs to (the route groups are URL-transparent, so derive it
// from the path). Used by the native header and the mobile-web shell to source the active
// section + its secondary nav.
export function sectionFor(pathname: string): "home" | "components" | "utilities" {
  if (pathname.startsWith("/tokens") || pathname === "/utilities") return "utilities";
  if (pathname.startsWith("/components") || pathname.startsWith("/templates") || pathname.startsWith("/patterns")) return "components";
  return "home";
}

// ── Native header menu model ─────────────────────────────────────────────────
// The hamburger is the active tab's secondary nav, modelled as a RECURSIVE tree of
// leaves (a page link) and submenus (a labelled drill-in). `nativeMenuFor` builds the
// tree per tab, reusing NAV_ROUTES (link registry) and NAV_GROUPS (the category ->
// components tree the web sidebar consumes):
//   • Home is a full SITE MAP: the About/guide links, plus a Components submenu that
//     drills category -> component page, plus a Utilities submenu, so every page is
//     reachable from Home.
//   • Components is the category submenus, with the active category surfaced FIRST as an
//     inline section (its sibling pages show immediately) and the rest as drill-ins.
//   • Utilities is a flat list of links.
// iOS renders the tree as nested native UIMenu submenus; Android/mobile-web render it as
// an N-level drill-down sheet (TabOverflowMenu).
export interface MenuLeaf {
  /** The page slug (matches getActiveSlug), so the menu can mark the current page. */
  slug: string;
  label: string;
  href: string;
}
export type MenuNode =
  | ({ kind: "leaf" } & MenuLeaf)
  | { kind: "submenu"; label: string; inline?: boolean; items: MenuNode[] };

const leafNode = (i: NavItem): MenuNode => ({ kind: "leaf", slug: i.slug, label: i.label, href: i.href });

// Ordered category labels -> a submenu per category holding its component-page leaves.
// Reused by the Components tab AND Home's Components submenu.
function categorySubmenus(categories: string[]): MenuNode[] {
  const byLabel = new Map(NAV_GROUPS.map((g) => [g.label, g] as const));
  return categories
    .map((c) => byLabel.get(c))
    .filter((g): g is NavGroup => Boolean(g))
    .map((g) => ({ kind: "submenu" as const, label: g.label, items: g.items.map(leafNode) }));
}

export function nativeMenuFor(section: string, activeGroup?: string | null): MenuNode[] {
  const tab = MOBILE_TABS.find((t) => t.id === section);
  const categories = tab?.topbar?.categories;

  // Components: category submenus, with the active category pulled to the front and marked
  // inline so its sibling pages render immediately instead of behind a drill-in.
  if (categories && categories.length) {
    const nodes = categorySubmenus(categories);
    if (activeGroup) {
      const idx = nodes.findIndex((n) => n.kind === "submenu" && n.label === activeGroup);
      if (idx > -1) {
        const [active] = nodes.splice(idx, 1);
        if (active.kind === "submenu") active.inline = true;
        nodes.unshift(active);
      }
    }
    return nodes;
  }

  const keys = [...(tab?.topbar?.inline ?? []), ...(tab?.topbar?.overflow ?? [])];

  // Home: the full site map. The lone "components" link is replaced by a Components submenu,
  // and a Utilities submenu is appended, so the whole site drills open from Home.
  if (section === "home") {
    const componentsTab = MOBILE_TABS.find((t) => t.id === "components");
    const utilitiesTab = MOBILE_TABS.find((t) => t.id === "utilities");
    const utilKeys = [...(utilitiesTab?.topbar?.inline ?? []), ...(utilitiesTab?.topbar?.overflow ?? [])];
    const guideKeys = keys.filter((k) => k !== "components");
    const [firstKey, ...restKeys] = guideKeys; // About leads; the remaining guides follow the submenus
    return [
      ...(firstKey ? [leafNode(routeItem(firstKey))] : []),
      { kind: "submenu", label: "Components", items: categorySubmenus(componentsTab?.topbar?.categories ?? []) },
      { kind: "submenu", label: "Utilities", items: utilKeys.map((k) => leafNode(routeItem(k))) },
      ...restKeys.map((k) => leafNode(routeItem(k))),
    ];
  }

  // Other flat sections (Utilities tab): a flat list of links.
  return keys.map((k) => leafNode(routeItem(k)));
}
