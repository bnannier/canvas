import { CodeBlock } from "@/components/code-block";
import { Toc } from "@/components/toc";

const tocItems = [
  { id: "what-changed", label: "What Changed" },
  { id: "architecture", label: "Architecture" },
  { id: "downstream", label: "Downstream Packages" },
  { id: "mapping", label: "Component Mappings" },
  { id: "theming-migration", label: "Theming Migration" },
  { id: "steps", label: "Migration Steps" },
];

const v2Code = `import { Button } from "@olympusoss/canvas";
<Button variant="outline" size="sm">Cancel</Button>`;

const v3CssCode = `<button class="btn btn-outline btn-sm">Cancel</button>`;

const v3ReactCode = `import { Button } from "@olympusoss/canvas-react";
<Button variant="outline" size="sm">Cancel</Button>`;

const v3ThemeCode = `<html class="dark" data-surface="glass" data-density="compact">`;

const COMPONENT_MAPPINGS = [
  { v2: "<Button>", v3: ".btn + .btn-default, .btn-outline, etc." },
  { v2: "<Input>", v3: ".input" },
  { v2: "<Card>", v3: ".card, .card-header, .card-content, .card-footer" },
  { v2: "<Badge>", v3: ".badge + .badge-default, .badge-secondary, etc." },
  { v2: "<Avatar>", v3: ".avatar" },
  { v2: "<Separator>", v3: ".sep, .sep-v" },
  { v2: "<Dialog>", v3: ".dialog-overlay, .dialog, .dialog-header, etc." },
  { v2: "<Sheet>", v3: ".sheet-overlay, .sheet, .sheet-right, etc." },
  { v2: "<Tabs>", v3: ".tabs-list, .tab, .tabs-content" },
  { v2: "<Alert>", v3: ".alert + .alert-default, .alert-destructive, etc." },
  { v2: "<Toast>", v3: ".toast-viewport, .toast, etc." },
  { v2: "<Select>", v3: ".select or .select-trigger" },
  { v2: "<Checkbox>", v3: ".checkbox, .checkbox-label" },
  { v2: "<Switch>", v3: ".switch" },
  { v2: "<DataTable>", v3: ".dt-wrap, .dt-table, .dt-toolbar, etc." },
  { v2: "<Sidebar>", v3: ".sidebar, .sidebar-item, etc." },
  { v2: "<Tooltip>", v3: ".tooltip, .tooltip-arrow" },
  { v2: "<Popover>", v3: ".popover" },
  { v2: "<DropdownMenu>", v3: ".dropdown, .dropdown-item" },
  { v2: "<Breadcrumb>", v3: ".breadcrumb, .breadcrumb-item" },
  { v2: "<Pagination>", v3: ".pagination, .page-btn" },
  { v2: "<Skeleton>", v3: ".skeleton, .skeleton-text, .skeleton-circle" },
  { v2: "<Spinner>", v3: ".spinner" },
  { v2: "<Command>", v3: ".command-dialog, .command-input, .command-item" },
];

const ARCH_COMPARISON = [
  { concern: "Components", v2: "React (JSX/TSX)", v3: "CSS classes (plain HTML)" },
  { concern: "Styling", v2: "Tailwind utilities", v3: "Semantic CSS custom properties" },
  { concern: "Theming", v2: "Tailwind config + CSS vars", v3: "CSS custom properties only" },
  { concern: "Primitives", v2: "Radix UI", v3: "None (bring your own)" },
  { concern: "Charts", v2: "Recharts", v3: "None (bring your own)" },
  { concern: "Tables", v2: "TanStack Table", v3: 'CSS only (.dt-* classes)' },
  { concern: "Editor", v2: "TipTap", v3: "None" },
  { concern: "Framework", v2: "React only", v3: "Framework-agnostic" },
  { concern: "Build", v2: "Required (Tailwind JIT)", v3: "None (valid CSS)" },
];

export function MigrationPage() {
  return (
    <div className="docs-content">
      <div style={{ minWidth: 0 }}>
        <div className="page-header" style={{ marginBottom: "1.5rem" }}>
          <div>
            <div className="page-header-title"><h1>Migration Guide</h1></div>
            <p className="sub">Migrating from Canvas v2 (React component library) to v3 (CSS-first design system).</p>
          </div>
          <div className="page-header-actions">
            <span className="badge badge-secondary">v2 &rarr; v3</span>
          </div>
        </div>

        <section id="what-changed" className="docs-section" style={{ marginBottom: "2rem" }}>
          <h2 className="h4" style={{ marginBottom: "0.75rem" }}>What Changed</h2>
          <p className="body" style={{ marginBottom: "0.75rem" }}>
            Canvas v2 was a React component library with 80+ components, Tailwind integration, Radix primitives, Recharts, TanStack Table, TipTap, and other runtime dependencies.
          </p>
          <p className="body">
            Canvas v3 is a clean break. It is a pure CSS design system with optional JS utilities. There are no React components, no framework code, and no Tailwind. The dependency arrow reversed: framework-specific component libraries are now separate packages that depend on Canvas.
          </p>
        </section>

        <div className="sep" style={{ margin: "1.5rem 0" }} />

        <section id="architecture" className="docs-section" style={{ marginBottom: "2rem" }}>
          <h2 className="h4" style={{ marginBottom: "0.75rem" }}>Architecture Comparison</h2>
          <table className="dt-table">
            <thead><tr><th>Concern</th><th>v2</th><th>v3</th></tr></thead>
            <tbody>
              {ARCH_COMPARISON.map((row) => (
                <tr key={row.concern}>
                  <td style={{ fontWeight: 500 }}>{row.concern}</td>
                  <td>{row.v2}</td>
                  <td>{row.v3}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <div className="sep" style={{ margin: "1.5rem 0" }} />

        <section id="downstream" className="docs-section" style={{ marginBottom: "2rem" }}>
          <h2 className="h4" style={{ marginBottom: "0.75rem" }}>Downstream Packages</h2>
          <p className="body" style={{ marginBottom: "0.75rem" }}>
            Framework-specific component libraries now live in dedicated packages:
          </p>
          <ul style={{ paddingLeft: "1.25rem", fontSize: "0.875rem", lineHeight: 1.75 }}>
            <li><code className="code">@olympusoss/canvas-react</code> &ndash; React components for web</li>
            <li><code className="code">@olympusoss/canvas-react-native</code> &ndash; React Native components</li>
            <li><code className="code">@olympusoss/canvas-vue</code> &ndash; Vue components</li>
            <li><code className="code">@olympusoss/canvas-flux</code> &ndash; Flux components</li>
          </ul>
          <p className="body" style={{ marginTop: "0.75rem" }}>
            These packages depend on <code className="code">@olympusoss/canvas</code> for tokens and CSS. If your app used v2 React components directly, migrate to <code className="code">@olympusoss/canvas-react</code> or build your own components on Canvas CSS.
          </p>
        </section>

        <div className="sep" style={{ margin: "1.5rem 0" }} />

        <section id="mapping" className="docs-section" style={{ marginBottom: "2rem" }}>
          <h2 className="h4" style={{ marginBottom: "0.75rem" }}>Mapping v2 Imports to v3</h2>

          <h3 className="h5" style={{ marginBottom: "0.5rem" }}>Before (v2)</h3>
          <CodeBlock code={v2Code} language="html" />

          <h3 className="h5" style={{ margin: "1rem 0 0.5rem" }}>After (v3, plain CSS)</h3>
          <CodeBlock code={v3CssCode} language="html" />

          <h3 className="h5" style={{ margin: "1rem 0 0.5rem" }}>After (v3, via canvas-react)</h3>
          <CodeBlock code={v3ReactCode} language="html" />

          <h3 className="h5" style={{ margin: "1.5rem 0 0.5rem" }}>Component Mappings</h3>
          <table className="dt-table">
            <thead><tr><th>v2 React Component</th><th>v3 CSS Classes</th></tr></thead>
            <tbody>
              {COMPONENT_MAPPINGS.map((row) => (
                <tr key={row.v2}>
                  <td><code className="code">{row.v2}</code></td>
                  <td><code className="code" style={{ fontSize: "0.75rem" }}>{row.v3}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <div className="sep" style={{ margin: "1.5rem 0" }} />

        <section id="theming-migration" className="docs-section" style={{ marginBottom: "2rem" }}>
          <h2 className="h4" style={{ marginBottom: "0.75rem" }}>Theming Migration</h2>
          <p className="body" style={{ marginBottom: "0.75rem" }}>
            v2 used Tailwind config extensions and <code className="code">tailwind.config.js</code> color mappings. Dark mode was Tailwind's <code className="code">dark:</code> variant.
          </p>
          <p className="body" style={{ marginBottom: "0.75rem" }}>
            v3 uses CSS custom properties exclusively. Dark mode is the <code className="code">.dark</code> class on <code className="code">&lt;html&gt;</code>. Glass surface and density are HTML data attributes.
          </p>
          <CodeBlock code={v3ThemeCode} language="html" />
        </section>

        <div className="sep" style={{ margin: "1.5rem 0" }} />

        <section id="steps" className="docs-section" style={{ marginBottom: "2rem" }}>
          <h2 className="h4" style={{ marginBottom: "0.75rem" }}>Migration Steps</h2>
          <ol style={{ paddingLeft: "1.25rem", fontSize: "0.875rem", lineHeight: 2 }}>
            <li><strong>Choose your path.</strong> Adopt a downstream package (<code className="code">canvas-react</code>, etc.) or build components directly on Canvas CSS classes.</li>
            <li><strong>Replace imports.</strong> Swap <code className="code">@olympusoss/canvas</code> React imports for CSS class usage or the new downstream package.</li>
            <li><strong>Remove Tailwind.</strong> v3 does not use Tailwind. Remove Canvas-related Tailwind config and replace utility classes with Canvas custom properties or component classes.</li>
            <li><strong>Import CSS.</strong> Add <code className="code">@import "@olympusoss/canvas/styles/canvas.css"</code> to your entry point, or import individual files.</li>
            <li><strong>Update theming.</strong> Replace Tailwind dark-mode config with the <code className="code">.dark</code> class and data attributes.</li>
            <li><strong>Handle primitives yourself.</strong> v3 has no Radix dependency. If you need accessible primitives (focus trapping, ARIA, keyboard nav), bring your own or use a downstream package.</li>
          </ol>

          <div className="alert alert-default" style={{ marginTop: "1rem" }}>
            <p className="small"><strong>Pinning v2:</strong> The v2 branch/tag remains available. Pin your dependency to the last v2 release if you need time to migrate.</p>
          </div>
        </section>
      </div>

      <div style={{ display: "none" }} className="docs-toc-col">
        <Toc items={tocItems} />
      </div>
      <style>{`
        @media (min-width: 1280px) {
          .docs-toc-col { display: block !important; }
        }
      `}</style>
    </div>
  );
}
