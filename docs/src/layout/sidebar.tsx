import { NavLink } from "react-router-dom";
import { CATEGORIES, type Category } from "@/data/types";

interface ComponentEntry {
  slug: string;
  name: string;
  category: Category;
}

const GUIDE_PAGES = [
  { slug: "tokens", label: "Tokens" },
  { slug: "theming", label: "Theming" },
];

const REFERENCE_PAGES = [
  { slug: "migration", label: "Migration" },
  { slug: "integration", label: "Integration" },
  { slug: "browser-support", label: "Browser Support" },
];

const COMPONENTS: ComponentEntry[] = [
  { slug: "app-shell", name: "App Shell", category: "Layout" },
  { slug: "sidebar", name: "Sidebar", category: "Layout" },
  { slug: "topbar", name: "Topbar", category: "Layout" },
  { slug: "page-header", name: "Page Header", category: "Layout" },
  { slug: "separator", name: "Separator", category: "Layout" },
  { slug: "typography", name: "Typography", category: "Typography" },
  { slug: "kbd", name: "Kbd", category: "Typography" },
  { slug: "code-block", name: "Code Block", category: "Typography" },
  { slug: "icon", name: "Icon", category: "Typography" },
  { slug: "button", name: "Button", category: "Forms" },
  { slug: "button-group", name: "Button Group", category: "Forms" },
  { slug: "input", name: "Input", category: "Forms" },
  { slug: "textarea", name: "Textarea", category: "Forms" },
  { slug: "select", name: "Select", category: "Forms" },
  { slug: "checkbox", name: "Checkbox", category: "Forms" },
  { slug: "radio", name: "Radio", category: "Forms" },
  { slug: "switch", name: "Switch", category: "Forms" },
  { slug: "combobox", name: "Combobox", category: "Forms" },
  { slug: "input-group", name: "Input Group", category: "Forms" },
  { slug: "form", name: "Form", category: "Forms" },
  { slug: "field", name: "Field", category: "Forms" },
  { slug: "filter-panel", name: "Filter Panel", category: "Forms" },
  { slug: "card", name: "Card", category: "Data Display" },
  { slug: "stat-card", name: "Stat Card", category: "Data Display" },
  { slug: "section-card", name: "Section Card", category: "Data Display" },
  { slug: "data-table", name: "Data Table", category: "Data Display" },
  { slug: "badge", name: "Badge", category: "Data Display" },
  { slug: "avatar", name: "Avatar", category: "Data Display" },
  { slug: "empty-state", name: "Empty State", category: "Data Display" },
  { slug: "skeleton", name: "Skeleton", category: "Data Display" },
  { slug: "spinner", name: "Spinner", category: "Data Display" },
  { slug: "calendar", name: "Calendar", category: "Data Display" },
  { slug: "alert", name: "Alert", category: "Feedback" },
  { slug: "dialog", name: "Dialog", category: "Feedback" },
  { slug: "sheet", name: "Sheet", category: "Feedback" },
  { slug: "toast", name: "Toast", category: "Feedback" },
  { slug: "tooltip", name: "Tooltip", category: "Feedback" },
  { slug: "popover", name: "Popover", category: "Feedback" },
  { slug: "dropdown", name: "Dropdown", category: "Feedback" },
  { slug: "command", name: "Command", category: "Feedback" },
  { slug: "tabs", name: "Tabs", category: "Navigation" },
  { slug: "breadcrumb", name: "Breadcrumb", category: "Navigation" },
  { slug: "pagination", name: "Pagination", category: "Navigation" },
  { slug: "row-menu", name: "Row Menu", category: "Navigation" },
  { slug: "stepper", name: "Stepper", category: "Navigation" },
];

function itemClass({ isActive }: { isActive: boolean }) {
  return `sidebar-item${isActive ? " active" : ""}`;
}

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  onSearchOpen: () => void;
}

export function Sidebar({ open, onClose, onSearchOpen }: SidebarProps) {
  return (
    <>
      {open && (
        <div
          className="docs-sidebar-backdrop"
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgb(0 0 0 / 0.4)",
            zIndex: 39,
            display: "none",
          }}
        />
      )}
      <nav className={`sidebar${open ? " open" : ""}`}>
        <div className="sidebar-brand">
          <NavLink
            to="/"
            style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.625rem" }}
            onClick={onClose}
          >
            <span className="sidebar-brand-name">Canvas</span>
            <span className="badge badge-secondary" style={{ fontSize: "0.6875rem" }}>v3</span>
          </NavLink>
        </div>

        <div className="sidebar-nav" style={{ overflowY: "auto", flex: 1 }}>
          <button className="docs-sidebar-search" onClick={onSearchOpen}>
            Search...
            <kbd className="kbd">⌘K</kbd>
          </button>

          <div className="sidebar-group">
            <div className="sidebar-group-label">Foundations</div>
            {GUIDE_PAGES.map((p) => (
              <NavLink key={p.slug} to={`/${p.slug}`} className={itemClass} onClick={onClose}>
                {p.label}
              </NavLink>
            ))}
          </div>

          {CATEGORIES.map((cat) => {
            const items = COMPONENTS.filter((c) => c.category === cat);
            return (
              <div key={cat} className="sidebar-group">
                <div className="sidebar-group-label">{cat}</div>
                {items.map((c) => (
                  <NavLink
                    key={c.slug}
                    to={`/components/${c.slug}`}
                    className={itemClass}
                    onClick={onClose}
                  >
                    {c.name}
                  </NavLink>
                ))}
              </div>
            );
          })}

          <div className="sidebar-group">
            <div className="sidebar-group-label">Guides</div>
            {REFERENCE_PAGES.map((p) => (
              <NavLink key={p.slug} to={`/${p.slug}`} className={itemClass} onClick={onClose}>
                {p.label}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>
      <style>{`
        @media (max-width: 1023px) {
          .docs-sidebar-backdrop { display: block !important; }
        }
      `}</style>
    </>
  );
}
