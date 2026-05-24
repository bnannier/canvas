import { Link } from "react-router-dom";
import { CATEGORIES } from "@/data/types";
import { COMPONENTS } from "@/data/components";

const GUIDE_LINKS = [
  { to: "/tokens", title: "Tokens", description: "Colors, typography, spacing, radius, shadows, and motion" },
  { to: "/theming", title: "Theming", description: "Light/dark mode, glass surface, density controls" },
  { to: "/integration", title: "Integration", description: "How to consume Canvas in your app or package" },
  { to: "/migration", title: "Migration", description: "Migrating from Canvas v2 to v3" },
  { to: "/browser-support", title: "Browser Support", description: "CSS feature matrix and minimum versions" },
];

const CATEGORY_FIRST_COMPONENT: Record<string, string> = {
  Layout: "app-shell",
  Typography: "typography",
  Forms: "button",
  "Data Display": "card",
  Feedback: "alert",
  Navigation: "tabs",
};

export function Home() {
  return (
    <div>
      <div className="docs-hero">
        <h1 className="docs-hero-title">Canvas</h1>
        <p className="docs-hero-sub">
          A modular, CSS-first design system. {COMPONENTS.length} components, 7 token
          files, light/dark mode, glass surface, and density controls. No framework required.
        </p>
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "1.5rem" }}>
          <Link to="/integration" className="btn btn-default">Get Started</Link>
          <Link to="/components/button" className="btn btn-outline">Components</Link>
        </div>
      </div>

      <div className="sep" style={{ margin: "1.5rem 0" }} />

      <h2 className="h3" style={{ marginBottom: "1rem" }}>Quick Start</h2>
      <div className="docs-import-block">
        <code>npm install @olympusoss/canvas</code>
      </div>
      <div className="docs-import-block" style={{ marginTop: "0.5rem" }}>
        <code>@import "@olympusoss/canvas/styles/canvas.css";</code>
      </div>
      <p className="small muted" style={{ marginTop: "0.5rem" }}>
        Then use CSS classes directly: <code className="code">&lt;button class="btn btn-default"&gt;Click&lt;/button&gt;</code>
      </p>

      <div className="sep" style={{ margin: "2rem 0" }} />

      <h2 className="h3" style={{ marginBottom: "1rem" }}>Components</h2>
      <div className="docs-category-grid">
        {CATEGORIES.map((cat) => {
          const count = COMPONENTS.filter((c) => c.category === cat).length;
          const firstSlug = CATEGORY_FIRST_COMPONENT[cat] ?? "";
          return (
            <Link
              key={cat}
              to={`/components/${firstSlug}`}
              className="card"
              style={{ padding: "1.25rem", textDecoration: "none", color: "inherit" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <h3 className="h4" style={{ marginBottom: "0.25rem" }}>{cat}</h3>
                <span className="badge badge-secondary">{count}</span>
              </div>
              <p className="small muted">{getCategoryDescription(cat)}</p>
            </Link>
          );
        })}
      </div>

      <div className="sep" style={{ margin: "2rem 0" }} />

      <h2 className="h3" style={{ marginBottom: "1rem" }}>Guides</h2>
      <div className="docs-category-grid">
        {GUIDE_LINKS.map((g) => (
          <Link
            key={g.to}
            to={g.to}
            className="card"
            style={{ padding: "1.25rem", textDecoration: "none", color: "inherit" }}
          >
            <h3 className="h4" style={{ marginBottom: "0.25rem" }}>{g.title}</h3>
            <p className="small muted">{g.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

function getCategoryDescription(cat: string): string {
  const descriptions: Record<string, string> = {
    Layout: "App shell, sidebar, topbar, page header, separator",
    Typography: "Type scale, kbd, code block, icon defaults",
    Forms: "Buttons, inputs, selects, checkboxes, radios, switches, and more",
    "Data Display": "Cards, tables, badges, avatars, skeletons, calendars",
    Feedback: "Alerts, dialogs, sheets, toasts, tooltips, dropdowns, command palette",
    Navigation: "Tabs, breadcrumbs, pagination, row menu, stepper",
  };
  return descriptions[cat] ?? "";
}
