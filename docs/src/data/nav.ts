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
// The hamburger is the active tab's secondary nav, and its SHAPE depends on the tab:
// Home/Utilities are a flat list of links; Components is a list of categories, each
// drilling into its component pages. `nativeMenuFor` resolves a tab id (== section)
// to one of these two shapes, reusing the existing NAV_ROUTES (link registry) and
// NAV_GROUPS (the category -> components tree the web sidebar already consumes). iOS
// renders `groups` as native UIMenu submenus; Android renders them as a drill-down sheet.
export interface MenuLeaf {
  /** The page slug (matches getActiveSlug), so the menu can mark the current page. */
  slug: string;
  label: string;
  href: string;
}
export interface MenuGroup {
  label: string;
  items: MenuLeaf[];
}
export type NativeMenu = { kind: "flat"; items: MenuLeaf[] } | { kind: "groups"; groups: MenuGroup[] };

export function nativeMenuFor(section: string): NativeMenu {
  const tab = MOBILE_TABS.find((t) => t.id === section);
  const categories = tab?.topbar?.categories;
  if (categories && categories.length) {
    const byLabel = new Map(NAV_GROUPS.map((g) => [g.label, g] as const));
    const groups: MenuGroup[] = categories
      .map((c) => byLabel.get(c))
      .filter((g): g is NavGroup => Boolean(g))
      .map((g) => ({ label: g.label, items: g.items.map((i) => ({ slug: i.slug, label: i.label, href: i.href })) }));
    return { kind: "groups", groups };
  }
  const keys = [...(tab?.topbar?.inline ?? []), ...(tab?.topbar?.overflow ?? [])];
  const items = keys.map((k) => {
    const r = routeItem(k);
    return { slug: r.slug, label: r.label, href: r.href };
  });
  return { kind: "flat", items };
}
