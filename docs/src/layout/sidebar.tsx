import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { CanvasMark } from "@/components/canvas-mark";
import {
  Home, Layers, Palette, User, Award, ChevronRight,
  MousePointerClick, Columns2, CheckSquare, Search,
  ChevronDown, Info, TextCursorInput, Keyboard,
  ChevronsLeft, CircleDot, List, Minus, Loader,
  ToggleLeft, AlignLeft, MessageCircle,
  AlertTriangle, Square, Inbox, FileText, FileInput,
  BarChart2, Calendar, Terminal, Table, Filter,
  MoreHorizontal, PanelRight, Footprints, Folder,
  Navigation, Layout, Shield, Activity, Users,
  ChartLine, Lock, Settings, Check, Eye,
  Type, ChevronLeft, X, Gauge, Smartphone,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  slug: string;
  label: string;
  to: string;
  icon: LucideIcon;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { slug: "", label: "About Canvas", to: "/", icon: Home },
      { slug: "components", label: "All components", to: "/components", icon: Layers },
    ],
  },
  {
    label: "Tokens",
    items: [
      { slug: "tokens", label: "Colors & Theme", to: "/tokens", icon: Palette },
      { slug: "tokens-spacing", label: "Spacing & Shape", to: "/tokens/spacing", icon: Layers },
      { slug: "tokens-typography", label: "Typography", to: "/tokens/typography", icon: Type },
    ],
  },
  {
    label: "Atoms",
    items: [
      { slug: "avatar", label: "Avatars", to: "/components/avatar", icon: User },
      { slug: "badge", label: "Badges", to: "/components/badge", icon: Award },
      { slug: "breadcrumb", label: "Breadcrumbs", to: "/components/breadcrumb", icon: ChevronRight },
      { slug: "button-group", label: "Button Groups", to: "/components/button-group", icon: Columns2 },
      { slug: "button", label: "Buttons", to: "/components/button", icon: MousePointerClick },
      { slug: "checkbox", label: "Checkboxes", to: "/components/checkbox", icon: CheckSquare },
      { slug: "combobox", label: "Comboboxes", to: "/components/combobox", icon: Search },
      { slug: "separator", label: "Dividers", to: "/components/separator", icon: Minus },
      { slug: "dropdown", label: "Dropdowns", to: "/components/dropdown", icon: ChevronDown },
      { slug: "icon", label: "Icons", to: "/components/icon", icon: Info },
      { slug: "input-group", label: "Input Groups", to: "/components/input-group", icon: Columns2 },
      { slug: "input", label: "Inputs & Forms", to: "/components/input", icon: TextCursorInput },
      { slug: "pagination", label: "Pagination", to: "/components/pagination", icon: ChevronsLeft },
      { slug: "radio", label: "Radios", to: "/components/radio", icon: CircleDot },
      { slug: "select", label: "Selects", to: "/components/select", icon: List },
      { slug: "skeleton", label: "Skeletons", to: "/components/skeleton", icon: Loader },
      { slug: "textarea", label: "Textareas", to: "/components/textarea", icon: AlignLeft },
      { slug: "switch", label: "Toggles", to: "/components/switch", icon: ToggleLeft },
      { slug: "tooltip", label: "Tooltips", to: "/components/tooltip", icon: MessageCircle },
    ],
  },
  {
    label: "Molecules",
    items: [
      { slug: "action-panels", label: "Action Panels", to: "/components/action-panels", icon: Shield },
      { slug: "alert", label: "Alerts", to: "/components/alert", icon: AlertTriangle },
      { slug: "card", label: "Cards", to: "/components/card", icon: Square },
      { slug: "description-lists", label: "Description Lists", to: "/components/description-lists", icon: Info },
      { slug: "empty-state", label: "Empty States", to: "/components/empty-state", icon: Inbox },
      { slug: "feeds", label: "Feeds", to: "/components/feeds", icon: Activity },
      { slug: "field", label: "Field Display", to: "/components/field", icon: FileText },
      { slug: "form", label: "Form Layouts", to: "/components/form", icon: FileInput },
      { slug: "grid-lists", label: "Grid Lists", to: "/components/grid-lists", icon: Layers },
      { slug: "media-objects", label: "Media Objects", to: "/components/media-objects", icon: Users },
      { slug: "stacked-lists", label: "Stacked Lists", to: "/components/stacked-lists", icon: Layers },
      { slug: "stats", label: "Stats", to: "/components/stats", icon: BarChart2 },
    ],
  },
  {
    label: "Organisms",
    items: [
      { slug: "calendar", label: "Calendars", to: "/components/calendar", icon: Calendar },
      { slug: "charts", label: "Charts", to: "/components/charts", icon: ChartLine },
      { slug: "command", label: "Command Palette", to: "/components/command", icon: Terminal },
      { slug: "data-table", label: "Data Tables", to: "/components/data-table", icon: Table },
      { slug: "filter-panel", label: "Filter Panels", to: "/components/filter-panel", icon: Filter },
      { slug: "navbars", label: "Navbars", to: "/components/navbars", icon: Navigation },
      { slug: "sidebar", label: "Navigation", to: "/components/sidebar", icon: Navigation },
      { slug: "dialog", label: "Overlays", to: "/components/dialog", icon: PanelRight },
      { slug: "stepper", label: "Steppers", to: "/components/stepper", icon: Footprints },
      { slug: "tabs", label: "Tabs", to: "/components/tabs", icon: Folder },
    ],
  },
  {
    label: "Templates",
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

function getActiveSlug(pathname: string): string {
  if (pathname === "/") return "";
  const match = pathname.match(/^\/components\/(.+)$/);
  if (match) return match[1];
  const tplMatch = pathname.match(/^\/templates\/(.+)$/);
  if (tplMatch) return "tpl-" + tplMatch[1];
  const patMatch = pathname.match(/^\/patterns\/(.+)$/);
  if (patMatch) return "pat-" + patMatch[1];
  return pathname.replace(/^\//, "");
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
  onSearchOpen: () => void;
}

export function Sidebar({ open, collapsed, onClose, onToggleCollapse, onSearchOpen }: SidebarProps) {
  const location = useLocation();
  const activeSlug = getActiveSlug(location.pathname);
  const activeGroup = getActiveGroup(location.pathname);

  const [openGroups, setOpenGroups] = useState<Set<string>>(
    () => new Set(activeGroup ? [activeGroup] : []),
  );

  function toggleGroup(label: string) {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });
  }

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
              <CanvasMark size={22} />
            </button>
          ) : (
            <>
              <CanvasMark size={22} />
              <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
                <span className="sidebar-brand-name">Canvas</span>
                <span style={{
                  fontSize: "10px",
                  fontWeight: 500,
                  letterSpacing: "0.04em",
                  color: "hsl(var(--muted-foreground))",
                  marginTop: 2,
                }}>
                  design system
                </span>
              </div>
              <div style={{ flex: 1 }} />
              <button
                className="sidebar-collapse-btn"
                onClick={onToggleCollapse}
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
          {!collapsed && (
            <button className="docs-sidebar-search" onClick={onSearchOpen}>
              Search...
              <kbd className="kbd">⌘K</kbd>
            </button>
          )}

          {NAV_GROUPS.map((g) => {
            const groupHasActive = g.items.some((i) => i.slug === activeSlug);
            const isOpen = openGroups.has(g.label);

            if (collapsed) {
              return (
                <div key={g.label} className="sidebar-group">
                  {g.items.map((item) => (
                    <NavLink
                      key={item.slug}
                      to={item.to}
                      className={({ isActive }) => `sidebar-item${isActive ? " active" : ""}`}
                      onClick={onClose}
                      title={item.label}
                      end={item.to === "/"}
                    >
                      <item.icon size={16} />
                      <span className="label">{item.label}</span>
                    </NavLink>
                  ))}
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
                  {groupHasActive && !isOpen && (
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
                    {g.items.map((item) => (
                      <NavLink
                        key={item.slug}
                        to={item.to}
                        className={({ isActive }) => `sidebar-item${isActive ? " active" : ""}`}
                        onClick={onClose}
                        end={item.to === "/"}
                      >
                        <item.icon size={16} />
                        <span className="label">{item.label}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
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
