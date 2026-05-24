import { ColorSwatch } from "@/components/color-swatch";
import { CodeBlock } from "@/components/code-block";
import { Toc } from "@/components/toc";

const tocItems = [
  { id: "semantic-colors", label: "Semantic Colors" },
  { id: "chart-colors", label: "Chart Colors" },
  { id: "sidebar-colors", label: "Sidebar Colors" },
  { id: "brand-colors", label: "Brand Colors" },
  { id: "status-colors", label: "Status Colors" },
  { id: "typography", label: "Typography" },
  { id: "radius", label: "Radius" },
  { id: "spacing", label: "Spacing" },
  { id: "shadows", label: "Shadows" },
  { id: "z-index", label: "Z-Index" },
  { id: "motion", label: "Motion" },
];

const SEMANTIC_COLORS = [
  { property: "--background", light: "0 0% 100%", dark: "240 10% 3.9%" },
  { property: "--foreground", light: "240 10% 3.9%", dark: "0 0% 98%" },
  { property: "--card", light: "0 0% 100%", dark: "240 10% 3.9%" },
  { property: "--card-foreground", light: "240 10% 3.9%", dark: "0 0% 98%" },
  { property: "--popover", light: "0 0% 100%", dark: "240 10% 3.9%" },
  { property: "--popover-foreground", light: "240 10% 3.9%", dark: "0 0% 98%" },
  { property: "--primary", light: "240 5.9% 10%", dark: "0 0% 98%" },
  { property: "--primary-foreground", light: "0 0% 98%", dark: "240 5.9% 10%" },
  { property: "--secondary", light: "240 4.8% 95.9%", dark: "240 3.7% 15.9%" },
  { property: "--secondary-foreground", light: "240 5.9% 10%", dark: "0 0% 98%" },
  { property: "--muted", light: "240 4.8% 95.9%", dark: "240 3.7% 15.9%" },
  { property: "--muted-foreground", light: "240 3.8% 46.1%", dark: "240 5% 64.9%" },
  { property: "--accent", light: "240 4.8% 95.9%", dark: "240 3.7% 15.9%" },
  { property: "--accent-foreground", light: "240 5.9% 10%", dark: "0 0% 98%" },
  { property: "--destructive", light: "0 72% 51%", dark: "0 62.8% 30.6%" },
  { property: "--destructive-foreground", light: "0 0% 98%", dark: "0 0% 98%" },
  { property: "--border", light: "240 5.9% 90%", dark: "240 3.7% 15.9%" },
  { property: "--input", light: "240 5.9% 90%", dark: "240 3.7% 15.9%" },
  { property: "--ring", light: "240 5.9% 10%", dark: "240 4.9% 83.9%" },
];

const CHART_COLORS = [
  { property: "--chart-1", light: "12 76% 61%", dark: "220 70% 50%" },
  { property: "--chart-2", light: "173 58% 39%", dark: "160 60% 45%" },
  { property: "--chart-3", light: "197 37% 24%", dark: "30 80% 55%" },
  { property: "--chart-4", light: "43 74% 66%", dark: "280 65% 60%" },
  { property: "--chart-5", light: "27 87% 67%", dark: "340 75% 55%" },
];

const SIDEBAR_COLORS = [
  { property: "--sidebar-background", light: "0 0% 98%", dark: "240 5.9% 10%" },
  { property: "--sidebar-foreground", light: "240 5.3% 26.1%", dark: "240 4.8% 95.9%" },
  { property: "--sidebar-primary", light: "240 5.9% 10%", dark: "224.3 76.3% 48%" },
  { property: "--sidebar-primary-foreground", light: "0 0% 98%", dark: "0 0% 100%" },
  { property: "--sidebar-accent", light: "240 4.8% 95.9%", dark: "240 3.7% 15.9%" },
  { property: "--sidebar-accent-foreground", light: "240 5.9% 10%", dark: "240 4.8% 95.9%" },
  { property: "--sidebar-border", light: "220 13% 91%", dark: "240 3.7% 15.9%" },
  { property: "--sidebar-ring", light: "217.2 91.2% 59.8%", dark: "217.2 91.2% 59.8%" },
];

const BRAND_COLORS = [
  { property: "--brand-blue-700", value: "#1e40af" },
  { property: "--brand-blue-400", value: "#60a5fa" },
  { property: "--orb-indigo", value: "#6366f1" },
  { property: "--orb-violet", value: "#8b5cf6" },
  { property: "--orb-cyan", value: "#06b6d4" },
];

const STATUS_COLORS_LITERAL = [
  { property: "--color-success", value: "hsl(143 70% 45%)" },
  { property: "--color-warning", value: "hsl(38 92% 50%)" },
  { property: "--color-info", value: "hsl(217 91% 60%)" },
];

const STATUS_BG_FG = [
  { property: "--success-bg", light: "141 79% 85%", dark: "149 50% 22%" },
  { property: "--success-fg", light: "144 61% 20%", dark: "142 70% 65%" },
  { property: "--warning-bg", light: "48 96% 89%", dark: "38 50% 20%" },
  { property: "--warning-fg", light: "40 80% 27%", dark: "43 90% 65%" },
  { property: "--error-bg", light: "0 93% 94%", dark: "0 50% 18%" },
  { property: "--error-fg", light: "0 70% 35%", dark: "0 80% 70%" },
  { property: "--info-bg", light: "214 95% 93%", dark: "217 50% 22%" },
  { property: "--info-fg", light: "221 83% 45%", dark: "217 90% 72%" },
];

const RADIUS = [
  { property: "--radius-sm", value: "4px" },
  { property: "--radius-md", value: "6px" },
  { property: "--radius-lg", value: "8px" },
  { property: "--radius-xl", value: "12px" },
  { property: "--radius-2xl", value: "16px" },
  { property: "--radius-full", value: "9999px" },
];

const SPACING = [
  { property: "--space-0", value: "0px" },
  { property: "--space-px", value: "1px" },
  { property: "--space-0-5", value: "0.125rem (2px)" },
  { property: "--space-1", value: "0.25rem (4px)" },
  { property: "--space-1-5", value: "0.375rem (6px)" },
  { property: "--space-2", value: "0.5rem (8px)" },
  { property: "--space-2-5", value: "0.625rem (10px)" },
  { property: "--space-3", value: "0.75rem (12px)" },
  { property: "--space-4", value: "1rem (16px)" },
  { property: "--space-5", value: "1.25rem (20px)" },
  { property: "--space-6", value: "1.5rem (24px)" },
  { property: "--space-8", value: "2rem (32px)" },
  { property: "--space-10", value: "2.5rem (40px)" },
  { property: "--space-12", value: "3rem (48px)" },
  { property: "--space-16", value: "4rem (64px)" },
];

const SHADOWS = [
  { property: "--shadow-xs", description: "Minimal shadow for subtle depth" },
  { property: "--shadow-sm", description: "Subtle dual-layer shadow" },
  { property: "--shadow-md", description: "Medium spread (12px)" },
  { property: "--shadow-lg", description: "Large spread (32px)" },
  { property: "--shadow-elevated", description: "shadow-md + inset highlight" },
];

const Z_INDEX = [
  { property: "--z-base", value: "0" },
  { property: "--z-dropdown", value: "10" },
  { property: "--z-sticky", value: "20" },
  { property: "--z-overlay", value: "30" },
  { property: "--z-sidebar", value: "40" },
  { property: "--z-modal", value: "50" },
  { property: "--z-popover", value: "60" },
  { property: "--z-toast", value: "70" },
];

const MOTION_KEYFRAMES = [
  { name: "toast-in", effect: "Fade up 8px" },
  { name: "modal-in", effect: "Fade + scale from 0.96" },
  { name: "fade-in", effect: "Opacity 0 to 1" },
  { name: "slide-in", effect: "Translate from right (100%)" },
];

const MOTION_DURATION = [
  { property: "--duration-fast", value: "150ms" },
  { property: "--duration-normal", value: "200ms" },
  { property: "--duration-slow", value: "300ms" },
  { property: "--ease-out", value: "cubic-bezier(0.32, 0.72, 0, 1)" },
];

const ANIMATION_SHORTHANDS = [
  { property: "--animate-toast-in", value: "toast-in var(--duration-normal) ease-out" },
  { property: "--animate-modal-in", value: "modal-in 180ms ease-out" },
  { property: "--animate-fade-in", value: "fade-in var(--duration-normal) ease-out" },
  { property: "--animate-slide-in", value: "slide-in 240ms var(--ease-out)" },
];

const importCode = `@import "@olympusoss/canvas/styles/tokens/colors.css";
@import "@olympusoss/canvas/styles/tokens/typography.css";
@import "@olympusoss/canvas/styles/tokens/radius.css";
@import "@olympusoss/canvas/styles/tokens/motion.css";`;

export function TokensPage() {
  return (
    <div className="docs-content">
      <div style={{ minWidth: 0 }}>
        <div className="page-header" style={{ marginBottom: "1.5rem" }}>
          <div>
            <div className="page-header-title"><h1>Tokens</h1></div>
            <p className="sub">Design token reference. All tokens are CSS custom properties defined in the <code className="code">canvas.tokens</code> layer.</p>
          </div>
        </div>

        <section style={{ marginBottom: "1.5rem" }}>
          <CodeBlock code={importCode} language="css" />
          <p className="small muted" style={{ marginTop: "0.5rem" }}>
            Or use the all-in-one entry: <code className="code">@import "@olympusoss/canvas/styles/canvas.css"</code>
          </p>
        </section>

        <section id="semantic-colors" className="docs-section" style={{ marginBottom: "2rem" }}>
          <h2 className="h4" style={{ marginBottom: "0.75rem" }}>Semantic Colors</h2>
          <p className="small muted" style={{ marginBottom: "1rem" }}>HSL channel values. Use with <code className="code">hsl(var(--token))</code>.</p>
          <div className="docs-category-grid">
            {SEMANTIC_COLORS.map((c) => (
              <ColorSwatch key={c.property} property={c.property} light={c.light} dark={c.dark} />
            ))}
          </div>
        </section>

        <div className="sep" style={{ margin: "1.5rem 0" }} />

        <section id="chart-colors" className="docs-section" style={{ marginBottom: "2rem" }}>
          <h2 className="h4" style={{ marginBottom: "0.75rem" }}>Chart Colors</h2>
          <div className="docs-category-grid">
            {CHART_COLORS.map((c) => (
              <ColorSwatch key={c.property} property={c.property} light={c.light} dark={c.dark} />
            ))}
          </div>
        </section>

        <div className="sep" style={{ margin: "1.5rem 0" }} />

        <section id="sidebar-colors" className="docs-section" style={{ marginBottom: "2rem" }}>
          <h2 className="h4" style={{ marginBottom: "0.75rem" }}>Sidebar Colors</h2>
          <div className="docs-category-grid">
            {SIDEBAR_COLORS.map((c) => (
              <ColorSwatch key={c.property} property={c.property} light={c.light} dark={c.dark} />
            ))}
          </div>
        </section>

        <div className="sep" style={{ margin: "1.5rem 0" }} />

        <section id="brand-colors" className="docs-section" style={{ marginBottom: "2rem" }}>
          <h2 className="h4" style={{ marginBottom: "0.75rem" }}>Brand Colors</h2>
          <p className="small muted" style={{ marginBottom: "1rem" }}>Literal values, not HSL channels.</p>
          <div className="docs-category-grid">
            {BRAND_COLORS.map((c) => (
              <ColorSwatch key={c.property} property={c.property} light={c.value} literal />
            ))}
          </div>
        </section>

        <div className="sep" style={{ margin: "1.5rem 0" }} />

        <section id="status-colors" className="docs-section" style={{ marginBottom: "2rem" }}>
          <h2 className="h4" style={{ marginBottom: "0.75rem" }}>Status Colors</h2>
          <h3 className="h5" style={{ marginBottom: "0.5rem" }}>Literal</h3>
          <div className="docs-category-grid" style={{ marginBottom: "1.5rem" }}>
            {STATUS_COLORS_LITERAL.map((c) => (
              <ColorSwatch key={c.property} property={c.property} light={c.value} literal />
            ))}
          </div>
          <h3 className="h5" style={{ marginBottom: "0.5rem" }}>Background / Foreground (HSL channels)</h3>
          <div className="docs-category-grid">
            {STATUS_BG_FG.map((c) => (
              <ColorSwatch key={c.property} property={c.property} light={c.light} dark={c.dark} />
            ))}
          </div>
        </section>

        <div className="sep" style={{ margin: "1.5rem 0" }} />

        <section id="typography" className="docs-section" style={{ marginBottom: "2rem" }}>
          <h2 className="h4" style={{ marginBottom: "0.75rem" }}>Typography</h2>
          <table className="dt-table">
            <thead><tr><th>Property</th><th>Value</th></tr></thead>
            <tbody>
              <tr><td><code className="code">--font-sans</code></td><td>"Inter", system-ui, -apple-system, sans-serif</td></tr>
              <tr><td><code className="code">--font-mono</code></td><td>"JetBrains Mono", "Fira Code", monospace</td></tr>
            </tbody>
          </table>
        </section>

        <div className="sep" style={{ margin: "1.5rem 0" }} />

        <section id="radius" className="docs-section" style={{ marginBottom: "2rem" }}>
          <h2 className="h4" style={{ marginBottom: "0.75rem" }}>Radius</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem" }}>
            {RADIUS.map((r) => (
              <div key={r.property} style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    border: "2px solid hsl(var(--primary))",
                    borderRadius: r.value,
                    margin: "0 auto 0.5rem",
                  }}
                />
                <code className="code" style={{ fontSize: "0.75rem" }}>{r.property}</code>
                <div className="tiny muted">{r.value}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="sep" style={{ margin: "1.5rem 0" }} />

        <section id="spacing" className="docs-section" style={{ marginBottom: "2rem" }}>
          <h2 className="h4" style={{ marginBottom: "0.75rem" }}>Spacing</h2>
          <table className="dt-table">
            <thead><tr><th>Property</th><th>Value</th></tr></thead>
            <tbody>
              {SPACING.map((s) => (
                <tr key={s.property}>
                  <td><code className="code">{s.property}</code></td>
                  <td>{s.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <div className="sep" style={{ margin: "1.5rem 0" }} />

        <section id="shadows" className="docs-section" style={{ marginBottom: "2rem" }}>
          <h2 className="h4" style={{ marginBottom: "0.75rem" }}>Shadows</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem" }}>
            {SHADOWS.map((s) => (
              <div key={s.property} style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: 80,
                    height: 48,
                    borderRadius: "var(--radius-md, 6px)",
                    background: "hsl(var(--card))",
                    boxShadow: `var(${s.property})`,
                    margin: "0 auto 0.5rem",
                  }}
                />
                <code className="code" style={{ fontSize: "0.75rem" }}>{s.property}</code>
                <div className="tiny muted">{s.description}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="sep" style={{ margin: "1.5rem 0" }} />

        <section id="z-index" className="docs-section" style={{ marginBottom: "2rem" }}>
          <h2 className="h4" style={{ marginBottom: "0.75rem" }}>Z-Index</h2>
          <table className="dt-table">
            <thead><tr><th>Property</th><th>Value</th></tr></thead>
            <tbody>
              {Z_INDEX.map((z) => (
                <tr key={z.property}>
                  <td><code className="code">{z.property}</code></td>
                  <td>{z.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <div className="sep" style={{ margin: "1.5rem 0" }} />

        <section id="motion" className="docs-section" style={{ marginBottom: "2rem" }}>
          <h2 className="h4" style={{ marginBottom: "0.75rem" }}>Motion</h2>

          <h3 className="h5" style={{ marginBottom: "0.5rem" }}>Keyframes</h3>
          <table className="dt-table" style={{ marginBottom: "1.5rem" }}>
            <thead><tr><th>Name</th><th>Effect</th></tr></thead>
            <tbody>
              {MOTION_KEYFRAMES.map((m) => (
                <tr key={m.name}>
                  <td><code className="code">{m.name}</code></td>
                  <td>{m.effect}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 className="h5" style={{ marginBottom: "0.5rem" }}>Duration and Easing</h3>
          <table className="dt-table" style={{ marginBottom: "1.5rem" }}>
            <thead><tr><th>Property</th><th>Value</th></tr></thead>
            <tbody>
              {MOTION_DURATION.map((m) => (
                <tr key={m.property}>
                  <td><code className="code">{m.property}</code></td>
                  <td><code className="code">{m.value}</code></td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 className="h5" style={{ marginBottom: "0.5rem" }}>Animation Shorthands</h3>
          <table className="dt-table">
            <thead><tr><th>Property</th><th>Value</th></tr></thead>
            <tbody>
              {ANIMATION_SHORTHANDS.map((a) => (
                <tr key={a.property}>
                  <td><code className="code">{a.property}</code></td>
                  <td><code className="code" style={{ fontSize: "0.75rem" }}>{a.value}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
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
