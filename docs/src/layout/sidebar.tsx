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
  // Atoms
  { slug: "avatar", name: "Avatar", category: "Atoms" },
  { slug: "badge", name: "Badge", category: "Atoms" },
  { slug: "breadcrumb", name: "Breadcrumb", category: "Atoms" },
  { slug: "button", name: "Button", category: "Atoms" },
  { slug: "button-group", name: "Button Group", category: "Atoms" },
  { slug: "checkbox", name: "Checkbox", category: "Atoms" },
  { slug: "combobox", name: "Combobox", category: "Atoms" },
  { slug: "dropdown", name: "Dropdown", category: "Atoms" },
  { slug: "icon", name: "Icon", category: "Atoms" },
  { slug: "input", name: "Input", category: "Atoms" },
  { slug: "input-group", name: "Input Group", category: "Atoms" },
  { slug: "kbd", name: "Kbd", category: "Atoms" },
  { slug: "pagination", name: "Pagination", category: "Atoms" },
  { slug: "popover", name: "Popover", category: "Atoms" },
  { slug: "radio", name: "Radio", category: "Atoms" },
  { slug: "select", name: "Select", category: "Atoms" },
  { slug: "separator", name: "Separator", category: "Atoms" },
  { slug: "skeleton", name: "Skeleton", category: "Atoms" },
  { slug: "spinner", name: "Spinner", category: "Atoms" },
  { slug: "switch", name: "Switch", category: "Atoms" },
  { slug: "textarea", name: "Textarea", category: "Atoms" },
  { slug: "tooltip", name: "Tooltip", category: "Atoms" },
  { slug: "typography", name: "Typography", category: "Atoms" },
  // Molecules
  { slug: "alert", name: "Alert", category: "Molecules" },
  { slug: "card", name: "Card", category: "Molecules" },
  { slug: "code-block", name: "Code Block", category: "Molecules" },
  { slug: "empty-state", name: "Empty State", category: "Molecules" },
  { slug: "field", name: "Field", category: "Molecules" },
  { slug: "form", name: "Form", category: "Molecules" },
  { slug: "section-card", name: "Section Card", category: "Molecules" },
  { slug: "stat-card", name: "Stat Card", category: "Molecules" },
  // Organisms
  { slug: "app-shell", name: "App Shell", category: "Organisms" },
  { slug: "calendar", name: "Calendar", category: "Organisms" },
  { slug: "command", name: "Command", category: "Organisms" },
  { slug: "data-table", name: "Data Table", category: "Organisms" },
  { slug: "dialog", name: "Dialog", category: "Organisms" },
  { slug: "filter-panel", name: "Filter Panel", category: "Organisms" },
  { slug: "page-header", name: "Page Header", category: "Organisms" },
  { slug: "row-menu", name: "Row Menu", category: "Organisms" },
  { slug: "sheet", name: "Sheet", category: "Organisms" },
  { slug: "sidebar", name: "Sidebar", category: "Organisms" },
  { slug: "stepper", name: "Stepper", category: "Organisms" },
  { slug: "tabs", name: "Tabs", category: "Organisms" },
  { slug: "toast", name: "Toast", category: "Organisms" },
  { slug: "topbar", name: "Topbar", category: "Organisms" },
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
