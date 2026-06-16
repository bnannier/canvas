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
  type LucideIcon,
} from "lucide-react-native";

// The docs navigation, mirroring the Vite sidebar exactly: the same groups, items,
// order, and per-item lucide icons (lucide-react-native gives the identical glyphs).
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

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    icon: Home,
    items: [
      { slug: "", label: "About Canvas", href: "/", icon: Home },
      { slug: "components", label: "All components", href: "/components", icon: Layers },
    ],
  },
  {
    label: "Tokens & Utilities",
    icon: Palette,
    items: [
      { slug: "tokens-colors", label: "Colors & Theme", href: "/tokens/colors", icon: Palette },
      { slug: "tokens-spacing", label: "Spacing & Shape", href: "/tokens/spacing", icon: Layers },
      { slug: "tokens-typography", label: "Typography", href: "/tokens/typography", icon: Type },
      { slug: "tokens-layout", label: "Layout & Flexbox", href: "/tokens/layout", icon: LayoutGrid },
    ],
  },
  {
    label: "Guides",
    icon: BookOpen,
    items: [
      { slug: "integration", label: "Integration", href: "/integration", icon: Plug },
      { slug: "theming", label: "Theming", href: "/theming", icon: Moon },
      { slug: "rn-primitives", label: "React Native", href: "/rn-primitives", icon: Smartphone },
      { slug: "browser-support", label: "Browser Support", href: "/browser-support", icon: Globe },
    ],
  },
  {
    label: "Atoms",
    icon: MousePointerClick,
    items: [
      { slug: "view", label: "View", href: "/components/view", icon: Box },
      { slug: "text", label: "Text", href: "/components/text", icon: Type },
      { slug: "pressable", label: "Pressable", href: "/components/pressable", icon: Pointer },
      { slug: "image", label: "Image", href: "/components/image", icon: ImageIcon },
      { slug: "text-input", label: "Text Input", href: "/components/text-input", icon: TextCursorInput },
      { slug: "scroll-view", label: "Scroll View", href: "/components/scroll-view", icon: MoveVertical },
      { slug: "avatar", label: "Avatars", href: "/components/avatar", icon: User },
      { slug: "badge", label: "Badges", href: "/components/badge", icon: Award },
      { slug: "breadcrumb", label: "Breadcrumbs", href: "/components/breadcrumb", icon: ChevronRight },
      { slug: "button-group", label: "Button Groups", href: "/components/button-group", icon: Columns2 },
      { slug: "button", label: "Buttons", href: "/components/button", icon: MousePointerClick },
      { slug: "checkbox", label: "Checkboxes", href: "/components/checkbox", icon: CheckSquare },
      { slug: "combobox", label: "Comboboxes", href: "/components/combobox", icon: Search },
      { slug: "divider", label: "Dividers", href: "/components/divider", icon: Minus },
      { slug: "dropdown", label: "Dropdowns", href: "/components/dropdown", icon: ChevronDown },
      { slug: "icon", label: "Icons", href: "/components/icon", icon: Info },
      { slug: "input", label: "Inputs & Forms", href: "/components/input", icon: TextCursorInput },
      { slug: "kbd", label: "Kbd", href: "/components/kbd", icon: Keyboard },
      { slug: "listbox", label: "Listboxes", href: "/components/listbox", icon: ListChecks },
      { slug: "pagination", label: "Pagination", href: "/components/pagination", icon: ChevronsLeft },
      { slug: "popover", label: "Popover", href: "/components/popover", icon: Square },
      { slug: "radio", label: "Radios", href: "/components/radio", icon: CircleDot },
      { slug: "select", label: "Selects", href: "/components/select", icon: List },
      { slug: "skeleton", label: "Skeletons", href: "/components/skeleton", icon: Loader },
      { slug: "spinner", label: "Spinner", href: "/components/spinner", icon: Loader },
      { slug: "textarea", label: "Textareas", href: "/components/textarea", icon: AlignLeft },
      { slug: "toggle", label: "Toggles", href: "/components/toggle", icon: ToggleLeft },
      { slug: "tooltip", label: "Tooltips", href: "/components/tooltip", icon: MessageCircle },
      { slug: "typography", label: "Typography", href: "/components/typography", icon: Type },
    ],
  },
  {
    label: "Molecules",
    icon: Layers,
    items: [
      { slug: "action-panels", label: "Action Panels", href: "/components/action-panels", icon: Shield },
      { slug: "alert", label: "Alerts", href: "/components/alert", icon: AlertTriangle },
      { slug: "alert-dialog", label: "Alert Dialog", href: "/components/alert-dialog", icon: MessageSquareWarning },
      { slug: "card", label: "Cards", href: "/components/card", icon: Square },
      { slug: "code-block", label: "Code Block", href: "/components/code-block", icon: Code },
      { slug: "description-lists", label: "Description Lists", href: "/components/description-lists", icon: Info },
      { slug: "empty-state", label: "Empty States", href: "/components/empty-state", icon: Inbox },
      { slug: "feeds", label: "Feeds", href: "/components/feeds", icon: Activity },
      { slug: "field", label: "Field Display", href: "/components/field", icon: FileText },
      { slug: "fieldset", label: "Fieldsets", href: "/components/fieldset", icon: Group },
      { slug: "form", label: "Form Layouts", href: "/components/form", icon: FileInput },
      { slug: "grid-lists", label: "Grid Lists", href: "/components/grid-lists", icon: Layers },
      { slug: "media-objects", label: "Media Objects", href: "/components/media-objects", icon: Users },
      { slug: "stacked-lists", label: "Stacked Lists", href: "/components/stacked-lists", icon: Layers },
      { slug: "stats", label: "Stats", href: "/components/stats", icon: BarChart2 },
    ],
  },
  {
    label: "Organisms",
    icon: Layout,
    items: [
      { slug: "calendar", label: "Calendars", href: "/components/calendar", icon: Calendar },
      { slug: "charts", label: "Charts", href: "/components/charts", icon: ChartLine },
      { slug: "command", label: "Command Palette", href: "/components/command", icon: Terminal },
      { slug: "data-table", label: "Data Tables", href: "/components/data-table", icon: Table },
      { slug: "dialog", label: "Dialog", href: "/components/dialog", icon: AppWindow },
      { slug: "filter-panel", label: "Filter Panels", href: "/components/filter-panel", icon: Filter },
      { slug: "navbars", label: "Navbars", href: "/components/navbars", icon: Navigation },
      { slug: "navigation", label: "Navigation", href: "/components/navigation", icon: Navigation },
      { slug: "overlays", label: "Overlays", href: "/components/overlays", icon: PanelRight },
      { slug: "row-menu", label: "Row Menu", href: "/components/row-menu", icon: MoreHorizontal },
      { slug: "stepper", label: "Steppers", href: "/components/stepper", icon: Footprints },
      { slug: "tabs", label: "Tabs", href: "/components/tabs", icon: Folder },
    ],
  },
  {
    label: "Templates",
    icon: FileText,
    items: [
      { slug: "tpl-calendar", label: "Calendar", href: "/templates/calendar", icon: Calendar },
      { slug: "tpl-dashboard", label: "Dashboard", href: "/templates/dashboard", icon: Layout },
      { slug: "tpl-detail-sidebar", label: "Detail w/ sidebar", href: "/templates/detail-sidebar", icon: PanelRight },
      { slug: "tpl-identities", label: "Identities", href: "/templates/identities", icon: Users },
      { slug: "tpl-onboarding", label: "Onboarding", href: "/templates/onboarding", icon: Check },
      { slug: "tpl-profile", label: "Profile", href: "/templates/profile", icon: User },
      { slug: "tpl-settings", label: "Settings", href: "/templates/settings", icon: Settings },
      { slug: "tpl-signin", label: "Sign-in", href: "/templates/signin", icon: Lock },
    ],
  },
  {
    label: "Patterns",
    icon: Settings,
    items: [
      { slug: "pat-accessibility", label: "Accessibility", href: "/patterns/accessibility", icon: Eye },
      { slug: "pat-density", label: "Density", href: "/patterns/density", icon: Gauge },
      { slug: "pat-form-validation", label: "Form Validation", href: "/patterns/form-validation", icon: AlertTriangle },
      { slug: "pat-glass", label: "Glass Surface", href: "/patterns/glass", icon: Layers },
      { slug: "pat-loading", label: "Loading", href: "/patterns/loading", icon: Loader },
      { slug: "pat-responsive", label: "Responsive", href: "/patterns/responsive", icon: Smartphone },
    ],
  },
];

for (const group of NAV_GROUPS) {
  group.items.sort((a, b) => a.label.localeCompare(b.label));
}

export const COMPARE_ITEM: NavItem = { slug: "compare", label: "Compare", href: "/compare", icon: GitCompare };

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

export function getActiveGroup(pathname: string): string | null {
  const slug = getActiveSlug(pathname);
  for (const g of NAV_GROUPS) {
    if (g.items.some((i) => i.slug === slug)) return g.label;
  }
  return null;
}

// Flattened, ordered content pages for prev/next nav (excludes the home route).
export const FLAT_PAGES: NavItem[] = NAV_GROUPS.flatMap((g) => g.items).filter((i) => i.href !== "/");
