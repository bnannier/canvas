import { useState, useRef, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { CanvasMark } from "@/components/canvas-mark";
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
  Type, ChevronLeft, X, Gauge, Smartphone, LayoutGrid, Code,
  Group, ListChecks, MessageSquareWarning,
  BookOpen, Plug, Moon, Globe, GitCompare,
  Box, Pointer, Image as ImageIcon, MoveVertical,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  slug: string;
  label: string;
  to: string;
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
      { slug: "", label: "About Canvas", to: "/", icon: Home },
      { slug: "components", label: "All components", to: "/components", icon: Layers },
    ],
  },
  {
    label: "Tokens & Utilities",
    icon: Palette,
    items: [
      { slug: "tokens", label: "Colors & Theme", to: "/tokens", icon: Palette },
      { slug: "tokens-spacing", label: "Spacing & Shape", to: "/tokens/spacing", icon: Layers },
      { slug: "tokens-typography", label: "Typography", to: "/tokens/typography", icon: Type },
      { slug: "utilities", label: "Layout & Flexbox", to: "/utilities", icon: LayoutGrid },
    ],
  },
  {
    label: "Guides",
    icon: BookOpen,
    items: [
      { slug: "integration", label: "Integration", to: "/integration", icon: Plug },
      { slug: "theming", label: "Theming", to: "/theming", icon: Moon },
      { slug: "rn-primitives", label: "React Native", to: "/rn-primitives", icon: Smartphone },
      { slug: "browser-support", label: "Browser Support", to: "/browser-support", icon: Globe },
    ],
  },
  {
    label: "Atoms",
    icon: MousePointerClick,
    items: [
      { slug: "view", label: "View", to: "/components/view", icon: Box },
      { slug: "text", label: "Text", to: "/components/text", icon: Type },
      { slug: "pressable", label: "Pressable", to: "/components/pressable", icon: Pointer },
      { slug: "image", label: "Image", to: "/components/image", icon: ImageIcon },
      { slug: "text-input", label: "Text Input", to: "/components/text-input", icon: TextCursorInput },
      { slug: "scroll-view", label: "Scroll View", to: "/components/scroll-view", icon: MoveVertical },
      { slug: "avatar", label: "Avatars", to: "/components/avatar", icon: User },
      { slug: "badge", label: "Badges", to: "/components/badge", icon: Award },
      { slug: "breadcrumb", label: "Breadcrumbs", to: "/components/breadcrumb", icon: ChevronRight },
      { slug: "button-group", label: "Button Groups", to: "/components/button-group", icon: Columns2 },
      { slug: "button", label: "Buttons", to: "/components/button", icon: MousePointerClick },
      { slug: "checkbox", label: "Checkboxes", to: "/components/checkbox", icon: CheckSquare },
      { slug: "combobox", label: "Comboboxes", to: "/components/combobox", icon: Search },
      { slug: "divider", label: "Dividers", to: "/components/divider", icon: Minus },
      { slug: "dropdown", label: "Dropdowns", to: "/components/dropdown", icon: ChevronDown },
      { slug: "icon", label: "Icons", to: "/components/icon", icon: Info },
      { slug: "input", label: "Inputs & Forms", to: "/components/input", icon: TextCursorInput },
      { slug: "kbd", label: "Kbd", to: "/components/kbd", icon: Keyboard },
      { slug: "listbox", label: "Listboxes", to: "/components/listbox", icon: ListChecks },
      { slug: "pagination", label: "Pagination", to: "/components/pagination", icon: ChevronsLeft },
      { slug: "popover", label: "Popover", to: "/components/popover", icon: Square },
      { slug: "radio", label: "Radios", to: "/components/radio", icon: CircleDot },
      { slug: "select", label: "Selects", to: "/components/select", icon: List },
      { slug: "skeleton", label: "Skeletons", to: "/components/skeleton", icon: Loader },
      { slug: "spinner", label: "Spinner", to: "/components/spinner", icon: Loader },
      { slug: "textarea", label: "Textareas", to: "/components/textarea", icon: AlignLeft },
      { slug: "switch", label: "Toggles", to: "/components/switch", icon: ToggleLeft },
      { slug: "tooltip", label: "Tooltips", to: "/components/tooltip", icon: MessageCircle },
      { slug: "typography", label: "Typography", to: "/components/typography", icon: Type },
    ],
  },
  {
    label: "Molecules",
    icon: Layers,
    items: [
      { slug: "action-panels", label: "Action Panels", to: "/components/action-panels", icon: Shield },
      { slug: "alert", label: "Alerts", to: "/components/alert", icon: AlertTriangle },
      { slug: "alert-dialog", label: "Alert Dialog", to: "/components/alert-dialog", icon: MessageSquareWarning },
      { slug: "card", label: "Cards", to: "/components/card", icon: Square },
      { slug: "code-block", label: "Code Block", to: "/components/code-block", icon: Code },
      { slug: "description-lists", label: "Description Lists", to: "/components/description-lists", icon: Info },
      { slug: "empty-state", label: "Empty States", to: "/components/empty-state", icon: Inbox },
      { slug: "feeds", label: "Feeds", to: "/components/feeds", icon: Activity },
      { slug: "field", label: "Field Display", to: "/components/field", icon: FileText },
      { slug: "fieldset", label: "Fieldsets", to: "/components/fieldset", icon: Group },
      { slug: "form", label: "Form Layouts", to: "/components/form", icon: FileInput },
      { slug: "grid-lists", label: "Grid Lists", to: "/components/grid-lists", icon: Layers },
      { slug: "media-objects", label: "Media Objects", to: "/components/media-objects", icon: Users },
      { slug: "stacked-lists", label: "Stacked Lists", to: "/components/stacked-lists", icon: Layers },
      { slug: "stats", label: "Stats", to: "/components/stats", icon: BarChart2 },
    ],
  },
  {
    label: "Organisms",
    icon: Layout,
    items: [
      { slug: "calendar", label: "Calendars", to: "/components/calendar", icon: Calendar },
      { slug: "charts", label: "Charts", to: "/components/charts", icon: ChartLine },
      { slug: "command", label: "Command Palette", to: "/components/command", icon: Terminal },
      { slug: "data-table", label: "Data Tables", to: "/components/data-table", icon: Table },
      { slug: "dialog", label: "Dialog", to: "/components/dialog", icon: AppWindow },
      { slug: "filter-panel", label: "Filter Panels", to: "/components/filter-panel", icon: Filter },
      { slug: "navbars", label: "Navbars", to: "/components/navbars", icon: Navigation },
      { slug: "sidebar", label: "Navigation", to: "/components/sidebar", icon: Navigation },
      { slug: "overlays", label: "Overlays", to: "/components/overlays", icon: PanelRight },
      { slug: "row-menu", label: "Row Menu", to: "/components/row-menu", icon: MoreHorizontal },
      { slug: "stepper", label: "Steppers", to: "/components/stepper", icon: Footprints },
      { slug: "tabs", label: "Tabs", to: "/components/tabs", icon: Folder },
    ],
  },
  {
    label: "Templates",
    icon: FileText,
    items: [
      { slug: "tpl-calendar", label: "Calendar", to: "/templates/calendar", icon: Calendar },
      { slug: "tpl-dashboard", label: "Dashboard", to: "/templates/dashboard", icon: Layout },
      { slug: "tpl-detail-sidebar", label: "Detail w/ sidebar", to: "/templates/detail-sidebar", icon: PanelRight },
      { slug: "tpl-identities", label: "Identities", to: "/templates/identities", icon: Users },
      { slug: "tpl-onboarding", label: "Onboarding", to: "/templates/onboarding", icon: Check },
      { slug: "tpl-profile", label: "Profile", to: "/templates/profile", icon: User },
      { slug: "tpl-settings", label: "Settings", to: "/templates/settings", icon: Settings },
      { slug: "tpl-signin", label: "Sign-in", to: "/templates/signin", icon: Lock },
    ],
  },
  {
    label: "Patterns",
    icon: Settings,
    items: [
      { slug: "pat-accessibility", label: "Accessibility", to: "/patterns/accessibility", icon: Eye },
      { slug: "pat-density", label: "Density", to: "/patterns/density", icon: Gauge },
      { slug: "pat-form-validation", label: "Form Validation", to: "/patterns/form-validation", icon: AlertTriangle },
      { slug: "pat-glass", label: "Glass Surface", to: "/patterns/glass", icon: Layers },
      { slug: "pat-loading", label: "Loading", to: "/patterns/loading", icon: Loader },
      { slug: "pat-responsive", label: "Responsive", to: "/patterns/responsive", icon: Smartphone },
    ],
  },
];

// Keep every category's items alphabetised by label, so the sidebar order stays
// predictable as components are added (no manual re-sorting on each addition).
for (const group of NAV_GROUPS) {
  group.items.sort((a, b) => a.label.localeCompare(b.label));
}

function getActiveSlug(pathname: string): string {
  if (pathname === "/") return "";
  const match = pathname.match(/^\/components\/(.+)$/);
  if (match) return match[1];
  const tplMatch = pathname.match(/^\/templates\/(.+)$/);
  if (tplMatch) return "tpl-" + tplMatch[1];
  const patMatch = pathname.match(/^\/patterns\/(.+)$/);
  if (patMatch) return "pat-" + patMatch[1];
  // Nested token routes (/tokens/spacing) map to dash-joined slugs (tokens-spacing).
  return pathname.replace(/^\//, "").replace(/\//g, "-");
}

function getActiveGroup(pathname: string): string | null {
  const slug = getActiveSlug(pathname);
  for (const g of NAV_GROUPS) {
    if (g.items.some((i) => i.slug === slug)) return g.label;
  }
  return null;
}

interface SidebarProps {
  open: boolean;
  collapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
  onSearchOpen?: () => void;
}

export function Sidebar({ open, collapsed, onClose, onToggleCollapse }: SidebarProps) {
  const location = useLocation();
  const activeSlug = getActiveSlug(location.pathname);
  const activeGroup = getActiveGroup(location.pathname);

  const [openGroups, setOpenGroups] = useState<Set<string>>(
    () => new Set(activeGroup ? [activeGroup] : []),
  );

  // Reveal the active item on navigation: when the route lands on an item in a
  // group (e.g. clicking a tile on the components index), open that group so the
  // active item is visible and highlighted. `openGroups` is otherwise only seeded
  // at mount, so a client-side route change would leave the new item's group
  // collapsed. Accordion-consistent: opening the active group closes the others.
  // No-ops (returns the same Set) when the active group is already the only one
  // open, so a deliberate collapse while staying on a page is preserved.
  useEffect(() => {
    if (!activeGroup) return;
    setOpenGroups((prev) => (prev.size === 1 && prev.has(activeGroup) ? prev : new Set([activeGroup])));
  }, [activeGroup, location.pathname]);

  function toggleGroup(label: string) {
    // Accordion: expanding a group collapses any other open group.
    setOpenGroups((prev) => (prev.has(label) ? new Set<string>() : new Set([label])));
  }

  const tempExpanded = useRef(false);

  function expandToGroup(label: string) {
    setOpenGroups(new Set([label]));
    tempExpanded.current = true;
    onToggleCollapse();
  }

  function handleItemClick() {
    if (tempExpanded.current) {
      tempExpanded.current = false;
      onToggleCollapse();
    }
    onClose();
  }

  // A single nav link, shared by the flat top section, the always-open
  // Tokens & Utilities section, and the collapsible category groups.
  const renderItem = (item: NavItem) => (
    <NavLink
      key={item.to}
      to={item.to}
      className={({ isActive }) => `sidebar-item${isActive ? " active" : ""}`}
      onClick={handleItemClick}
      title={item.label}
      end
    >
      <item.icon size={16} />
      <span className="label">{item.label}</span>
    </NavLink>
  );

  return (
    <>
      {open && (
        <div
          className="lg:hidden"
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgb(0 0 0 / 0.5)",
            zIndex: 30,
          }}
          aria-hidden
        />
      )}
      <aside className={`sidebar${collapsed ? " collapsed" : ""}${open ? " open" : ""}`}>
        <div className="sidebar-brand">
          {collapsed ? (
            <button
              onClick={onToggleCollapse}
              title="Expand sidebar"
              aria-label="Expand sidebar"
              style={{
                border: 0,
                background: "transparent",
                cursor: "pointer",
                padding: 0,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 32,
                height: 32,
                borderRadius: 8,
              }}
            >
              <CanvasMark size={26.62} />
            </button>
          ) : (
            <>
              <CanvasMark size={26.62} />
              <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
                <span className="sidebar-brand-name">Canvas</span>
                <span style={{
                  fontSize: "10px",
                  fontWeight: 500,
                  letterSpacing: "0.04em",
                  color: "var(--muted-foreground)",
                  marginTop: 2,
                }}>
                  design system
                </span>
              </div>
              <div style={{ flex: 1 }} />
              <button
                className="sidebar-collapse-btn"
                onClick={() => { tempExpanded.current = false; onToggleCollapse(); }}
                title="Collapse sidebar"
                aria-label="Collapse sidebar"
                style={{ display: "none" }}
              >
                <ChevronLeft size={14} />
              </button>
              <button
                className="sidebar-collapse-btn sidebar-close-mobile"
                onClick={onClose}
                title="Close menu"
                aria-label="Close menu"
              >
                <X size={14} />
              </button>
            </>
          )}
        </div>

        <nav className="sidebar-nav">
          {/* Primary links (About Canvas, All components) pinned to the top and
              always visible, not folded into a collapsible group, so navigating
              into a category never hides them. */}
          <div className="sidebar-group">
            {NAV_GROUPS[0].items.map(renderItem)}
          </div>

          {/* Tokens & Utilities: an always-open section, never collapsible, so
              its links stay visible even when a category below is expanded. In
              the collapsed icon rail it renders its items only, no header. */}
          <div className="sidebar-group">
            {!collapsed && (
              <div
                style={{
                  padding: "0.375rem 0.625rem",
                  fontSize: "11px",
                  fontWeight: 500,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "var(--muted-foreground)",
                }}
              >
                {NAV_GROUPS[1].label}
              </div>
            )}
            <div style={{ marginTop: collapsed ? 0 : 2 }}>
              {NAV_GROUPS[1].items.map(renderItem)}
            </div>
          </div>

          {/* The collapsible category groups (Atoms, Molecules, ... ); Overview
              and Tokens & Utilities are rendered above, so skip them here. */}
          {NAV_GROUPS.slice(2).map((g) => {
            const groupHasActive = g.items.some((i) => i.slug === activeSlug);
            const isOpen = openGroups.has(g.label);

            if (collapsed) {
              const GroupIcon = g.icon;
              return (
                <div key={g.label} className="sidebar-group">
                  <button
                    className={`sidebar-item${groupHasActive ? " active" : ""}`}
                    onClick={() => expandToGroup(g.label)}
                    title={g.label}
                    style={{
                      border: 0,
                      background: "transparent",
                      cursor: "pointer",
                      width: "100%",
                      fontFamily: "inherit",
                      textAlign: "left",
                    }}
                  >
                    <GroupIcon size={16} />
                    <span className="label">{g.label}</span>
                  </button>
                </div>
              );
            }

            return (
              <div key={g.label} className="sidebar-group">
                <button
                  type="button"
                  className="docs-sidebar-toggle"
                  onClick={() => toggleGroup(g.label)}
                  aria-expanded={isOpen}
                >
                  <span style={{ flex: 1 }}>{g.label}</span>
                  {isOpen && (
                    <span className="docs-sidebar-dot" />
                  )}
                  <span
                    style={{
                      display: "inline-flex",
                      transition: "transform 150ms ease",
                      transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                    }}
                  >
                    <ChevronRight size={11} />
                  </span>
                </button>
                {isOpen && (
                  <div style={{ marginTop: 2 }}>
                    {g.items.map(renderItem)}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Platform compare, a fixed footer below the scrollable nav so it is
            always visible at the very bottom of the sidebar. Kept out of
            NAV_GROUPS so it stays a flat link (not a collapsible group) and
            does not enter page-nav's prev/next chain. */}
        <div
          className="sidebar-group"
          style={{ padding: "0.5rem", borderTop: "1px solid var(--border)" }}
        >
          {renderItem({ slug: "compare", label: "Compare", to: "/compare", icon: GitCompare })}
        </div>
      </aside>
      <style>{`
        @media (min-width: 1024px) {
          .sidebar-collapse-btn:not(.sidebar-close-mobile) { display: inline-flex !important; }
          .sidebar-close-mobile { display: none !important; }
        }
        @media (max-width: 1023px) {
          .sidebar-collapse-btn:not(.sidebar-close-mobile) { display: none !important; }
          .sidebar-close-mobile { display: inline-flex !important; }
        }
      `}</style>
    </>
  );
}
