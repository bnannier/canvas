import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { CanvasMark } from "@/components/canvas-mark";
import {
  Home, Layers, Palette, User, Award, ChevronRight, MousePointerClick,
  Columns2, CheckSquare, Search, ChevronDown, Info, TextCursorInput,
  Keyboard, ChevronsLeft, MessageSquare, CircleDot, List, Minus, Loader,
  Loader2, ToggleLeft, AlignLeft, MessageCircle, Type, AlertTriangle,
  Square, Code, Inbox, FileText, FileInput, LayoutDashboard, BarChart2,
  Calendar, Terminal, Table, Maximize2, Filter, Heading, MoreHorizontal,
  PanelRight, PanelLeft, Footprints, Folder, Bell, Navigation, ArrowRight,
  Plug, Globe, ChevronLeft, X, Layout,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { CATEGORIES, type Category } from "@/data/types";

interface NavItem {
  slug: string;
  label: string;
  to: string;
  icon: LucideIcon;
}

interface NavGroup {
  label: string;
  items: NavItem[];
  collapsible: boolean;
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    collapsible: false,
    items: [
      { slug: "", label: "About Canvas", to: "/", icon: Home },
    ],
  },
  {
    label: "Tokens",
    collapsible: true,
    items: [
      { slug: "tokens", label: "Tokens", to: "/tokens", icon: Layers },
      { slug: "theming", label: "Theming", to: "/theming", icon: Palette },
    ],
  },
  {
    label: "Atoms",
    collapsible: true,
    items: [
      { slug: "avatar", label: "Avatar", to: "/components/avatar", icon: User },
      { slug: "badge", label: "Badge", to: "/components/badge", icon: Award },
      { slug: "breadcrumb", label: "Breadcrumb", to: "/components/breadcrumb", icon: ChevronRight },
      { slug: "button", label: "Button", to: "/components/button", icon: MousePointerClick },
      { slug: "button-group", label: "Button Group", to: "/components/button-group", icon: Columns2 },
      { slug: "checkbox", label: "Checkbox", to: "/components/checkbox", icon: CheckSquare },
      { slug: "combobox", label: "Combobox", to: "/components/combobox", icon: Search },
      { slug: "dropdown", label: "Dropdown", to: "/components/dropdown", icon: ChevronDown },
      { slug: "icon", label: "Icon", to: "/components/icon", icon: Info },
      { slug: "input", label: "Input", to: "/components/input", icon: TextCursorInput },
      { slug: "input-group", label: "Input Group", to: "/components/input-group", icon: Columns2 },
      { slug: "kbd", label: "Kbd", to: "/components/kbd", icon: Keyboard },
      { slug: "pagination", label: "Pagination", to: "/components/pagination", icon: ChevronsLeft },
      { slug: "popover", label: "Popover", to: "/components/popover", icon: MessageSquare },
      { slug: "radio", label: "Radio", to: "/components/radio", icon: CircleDot },
      { slug: "select", label: "Select", to: "/components/select", icon: List },
      { slug: "separator", label: "Separator", to: "/components/separator", icon: Minus },
      { slug: "skeleton", label: "Skeleton", to: "/components/skeleton", icon: Loader },
      { slug: "spinner", label: "Spinner", to: "/components/spinner", icon: Loader2 },
      { slug: "switch", label: "Switch", to: "/components/switch", icon: ToggleLeft },
      { slug: "textarea", label: "Textarea", to: "/components/textarea", icon: AlignLeft },
      { slug: "tooltip", label: "Tooltip", to: "/components/tooltip", icon: MessageCircle },
      { slug: "typography", label: "Typography", to: "/components/typography", icon: Type },
    ],
  },
  {
    label: "Molecules",
    collapsible: true,
    items: [
      { slug: "alert", label: "Alert", to: "/components/alert", icon: AlertTriangle },
      { slug: "card", label: "Card", to: "/components/card", icon: Square },
      { slug: "code-block", label: "Code Block", to: "/components/code-block", icon: Code },
      { slug: "empty-state", label: "Empty State", to: "/components/empty-state", icon: Inbox },
      { slug: "field", label: "Field", to: "/components/field", icon: FileText },
      { slug: "form", label: "Form", to: "/components/form", icon: FileInput },
      { slug: "section-card", label: "Section Card", to: "/components/section-card", icon: Layout },
      { slug: "stat-card", label: "Stat Card", to: "/components/stat-card", icon: BarChart2 },
    ],
  },
  {
    label: "Organisms",
    collapsible: true,
    items: [
      { slug: "app-shell", label: "App Shell", to: "/components/app-shell", icon: LayoutDashboard },
      { slug: "calendar", label: "Calendar", to: "/components/calendar", icon: Calendar },
      { slug: "command", label: "Command", to: "/components/command", icon: Terminal },
      { slug: "data-table", label: "Data Table", to: "/components/data-table", icon: Table },
      { slug: "dialog", label: "Dialog", to: "/components/dialog", icon: Maximize2 },
      { slug: "filter-panel", label: "Filter Panel", to: "/components/filter-panel", icon: Filter },
      { slug: "page-header", label: "Page Header", to: "/components/page-header", icon: Heading },
      { slug: "row-menu", label: "Row Menu", to: "/components/row-menu", icon: MoreHorizontal },
      { slug: "sheet", label: "Sheet", to: "/components/sheet", icon: PanelRight },
      { slug: "sidebar", label: "Sidebar", to: "/components/sidebar", icon: PanelLeft },
      { slug: "stepper", label: "Stepper", to: "/components/stepper", icon: Footprints },
      { slug: "tabs", label: "Tabs", to: "/components/tabs", icon: Folder },
      { slug: "toast", label: "Toast", to: "/components/toast", icon: Bell },
      { slug: "topbar", label: "Topbar", to: "/components/topbar", icon: Navigation },
    ],
  },
  {
    label: "Guides",
    collapsible: true,
    items: [
      { slug: "migration", label: "Migration", to: "/migration", icon: ArrowRight },
      { slug: "integration", label: "Integration", to: "/integration", icon: Plug },
      { slug: "browser-support", label: "Browser Support", to: "/browser-support", icon: Globe },
    ],
  },
];

function getActiveSlug(pathname: string): string {
  if (pathname === "/") return "";
  const match = pathname.match(/^\/components\/(.+)$/);
  if (match) return match[1];
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

            if (!g.collapsible) {
              return (
                <div key={g.label} className="sidebar-group">
                  <div className="sidebar-group-label">{g.label}</div>
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
              );
            }

            const isOpen = openGroups.has(g.label);
            const groupHasActive = g.items.some((i) => i.slug === activeSlug);
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
