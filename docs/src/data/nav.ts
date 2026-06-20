import {
  Home, Layers, Palette, User, Award, ChevronRight, AppWindow,
  MousePointerClick, Columns2, CheckSquare, Search,
  ChevronDown, Info, TextCursorInput, Keyboard,
  ChevronsLeft, CircleDot, List, Minus, Loader,
  ToggleLeft, AlignLeft, MessageCircle,
  AlertTriangle, Square, Inbox, FileText, FileInput,
  BarChart2, Calendar, Terminal, Table, Filter,
  MoreHorizontal, PanelRight, Footprints, Folder,
  Navigation, Layout, Shield, Activity, Users,
  ChartLine, Lock, Settings, Check, Eye,
  Type, Gauge, Smartphone, LayoutGrid, Code,
  Group, ListChecks, MessageSquareWarning,
  BookOpen, Plug, Moon, Globe, GitCompare,
  Box, Pointer, Image as ImageIcon, MoveVertical,
  Rocket,
  type LucideIcon,
} from "lucide-react-native";
import navConfigJson from "./nav.config.json";

// The single source of truth for navigation is nav.config.json: a `routes` registry,
// a `web.sidebar` tree (with the component leaves enumerated), and a `mobile.tabs`
// node. This module is the typed loader over it. It rebuilds the SAME NavGroup[] the
// sidebar already consumes (so the web sidebar is unchanged) and exposes the mobile
// config for the native tab bar. The JSON carries lucide icon NAMES; this map resolves
// them back to the components (kept here so the icon set is tree-shakeable and typed).
const ICONS: Record<string, LucideIcon> = {
  "home": Home, "layers": Layers, "palette": Palette, "user": User, "award": Award,
  "chevron-right": ChevronRight, "app-window": AppWindow, "mouse-pointer-click": MousePointerClick,
  "columns-2": Columns2, "check-square": CheckSquare, "search": Search, "chevron-down": ChevronDown,
  "info": Info, "text-cursor-input": TextCursorInput, "keyboard": Keyboard, "chevrons-left": ChevronsLeft,
  "circle-dot": CircleDot, "list": List, "minus": Minus, "loader": Loader, "toggle-left": ToggleLeft,
  "align-left": AlignLeft, "message-circle": MessageCircle, "alert-triangle": AlertTriangle, "square": Square,
  "inbox": Inbox, "file-text": FileText, "file-input": FileInput, "bar-chart-2": BarChart2, "calendar": Calendar,
  "terminal": Terminal, "table": Table, "filter": Filter, "more-horizontal": MoreHorizontal, "panel-right": PanelRight,
  "footprints": Footprints, "folder": Folder, "navigation": Navigation, "layout": Layout, "shield": Shield,
  "activity": Activity, "users": Users, "chart-line": ChartLine, "lock": Lock, "settings": Settings, "check": Check,
  "eye": Eye, "type": Type, "gauge": Gauge, "smartphone": Smartphone, "layout-grid": LayoutGrid, "code": Code,
  "group": Group, "list-checks": ListChecks, "message-square-warning": MessageSquareWarning, "book-open": BookOpen,
  "plug": Plug, "moon": Moon, "globe": Globe, "git-compare": GitCompare, "box": Box, "pointer": Pointer,
  "image": ImageIcon, "move-vertical": MoveVertical, "rocket": Rocket,
};

function icon(name: string): LucideIcon {
  return ICONS[name] ?? Square;
}

export interface NavItem {
  slug: string;
  label: string;
  href: string;
  icon: LucideIcon;
}
export interface NavGroup {
  label: string;
  icon: LucideIcon;
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

export const COMPARE_ITEM: NavItem = { slug: "compare", label: "Compare", href: "/compare", icon: GitCompare };

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
