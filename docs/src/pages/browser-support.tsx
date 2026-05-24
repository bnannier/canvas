import { Toc } from "@/components/toc";

const tocItems = [
  { id: "feature-matrix", label: "Feature Matrix" },
  { id: "minimum-versions", label: "Minimum Versions" },
  { id: "feature-details", label: "Feature Details" },
  { id: "degradation", label: "Graceful Degradation" },
];

const FEATURES = [
  { feature: "Custom Properties", usage: "All tokens and theming", chrome: "49+", firefox: "31+", safari: "9.1+", edge: "15+" },
  { feature: "@layer", usage: "Cascade control (5 layers)", chrome: "99+", firefox: "97+", safari: "15.4+", edge: "99+" },
  { feature: "color-mix()", usage: "Not used directly (reserved)", chrome: "111+", firefox: "113+", safari: "16.2+", edge: "111+" },
  { feature: "light-dark()", usage: "Not used directly (reserved)", chrome: "123+", firefox: "120+", safari: "17.5+", edge: "123+" },
  { feature: "backdrop-filter", usage: "Glass surface, topbar blur", chrome: "76+", firefox: "103+", safari: "9+", edge: "17+" },
  { feature: ":has()", usage: "Checkbox label disabled state", chrome: "105+", firefox: "121+", safari: "15.4+", edge: "105+" },
  { feature: "@container", usage: "Not currently used (reserved)", chrome: "105+", firefox: "110+", safari: "16+", edge: "105+" },
  { feature: "scrollbar-width", usage: "Thin scrollbar pattern", chrome: "64+", firefox: "64+", safari: "N/A", edge: "79+" },
  { feature: "scrollbar-color", usage: "Scrollbar theming", chrome: "64+", firefox: "64+", safari: "N/A", edge: "79+" },
];

const MIN_VERSIONS = [
  { browser: "Chrome", version: "105+", reason: ":has() selector" },
  { browser: "Firefox", version: "121+", reason: ":has() selector" },
  { browser: "Safari", version: "15.4+", reason: "@layer, :has()" },
  { browser: "Edge", version: "105+", reason: ":has() selector" },
];

const DETAILS = [
  {
    title: "CSS Custom Properties",
    description: "Foundation of the entire token system. All visual decisions (colors, spacing, typography, radius, shadows, z-index, motion) are custom properties.",
  },
  {
    title: "@layer",
    description: "Canvas declares five cascade layers in strict order. Without @layer support, all styles collapse into the default layer and specificity is determined solely by source order. The visual result will still work in most cases.",
  },
  {
    title: "backdrop-filter",
    description: "Used for the glass surface pattern and the sticky topbar blur. When unsupported, glass surfaces fall back to their translucent background colors without the blur effect.",
  },
  {
    title: ":has()",
    description: "Used in checkbox.css for .checkbox-label:has(.checkbox:disabled). When unsupported, disabled checkbox labels will not dim automatically. This is a progressive enhancement; functionality is unaffected.",
  },
  {
    title: "scrollbar-width / scrollbar-color",
    description: "Used for thin scrollbar styling. Safari does not support these properties as of Safari 17. On Safari, the system default scrollbar appearance is used.",
  },
];

const DEGRADATION = [
  { scenario: "No glass support", behavior: "Translucent backgrounds still render; the blur is skipped." },
  { scenario: "No @layer support", behavior: "Styles still apply via source order. Overrides may need higher specificity." },
  { scenario: "No :has() support", behavior: "Minor cosmetic differences (disabled labels not dimming)." },
  { scenario: "No scrollbar styling", behavior: "System default scrollbars appear." },
  { scenario: "Reduced motion", behavior: "prefers-reduced-motion: reduce disables all animations and transitions automatically." },
  { scenario: "High contrast", behavior: "prefers-contrast: more increases border widths, removes shadows." },
];

export function BrowserSupportPage() {
  return (
    <div className="docs-content">
      <div style={{ minWidth: 0 }}>
        <div className="page-header" style={{ marginBottom: "1.5rem" }}>
          <div>
            <div className="page-header-title"><h1>Browser Support</h1></div>
            <p className="sub">CSS feature matrix and minimum browser versions for Canvas.</p>
          </div>
        </div>

        <section id="feature-matrix" className="docs-section" style={{ marginBottom: "2rem" }}>
          <h2 className="h4" style={{ marginBottom: "0.75rem" }}>Feature Matrix</h2>
          <div style={{ overflowX: "auto" }}>
            <table className="dt-table">
              <thead>
                <tr>
                  <th>CSS Feature</th>
                  <th>Usage in Canvas</th>
                  <th>Chrome</th>
                  <th>Firefox</th>
                  <th>Safari</th>
                  <th>Edge</th>
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((f) => (
                  <tr key={f.feature}>
                    <td><code className="code">{f.feature}</code></td>
                    <td className="small">{f.usage}</td>
                    <td>{f.chrome}</td>
                    <td>{f.firefox}</td>
                    <td>{f.safari}</td>
                    <td>{f.edge}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="sep" style={{ margin: "1.5rem 0" }} />

        <section id="minimum-versions" className="docs-section" style={{ marginBottom: "2rem" }}>
          <h2 className="h4" style={{ marginBottom: "0.75rem" }}>Minimum Versions</h2>
          <p className="small muted" style={{ marginBottom: "0.75rem" }}>Based on the features actively used, the effective minimum browser versions are:</p>
          <table className="dt-table">
            <thead><tr><th>Browser</th><th>Minimum Version</th><th>Reason</th></tr></thead>
            <tbody>
              {MIN_VERSIONS.map((v) => (
                <tr key={v.browser}>
                  <td style={{ fontWeight: 500 }}>{v.browser}</td>
                  <td>{v.version}</td>
                  <td className="small muted">{v.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <div className="sep" style={{ margin: "1.5rem 0" }} />

        <section id="feature-details" className="docs-section" style={{ marginBottom: "2rem" }}>
          <h2 className="h4" style={{ marginBottom: "0.75rem" }}>Feature Details</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {DETAILS.map((d) => (
              <div key={d.title} className="card" style={{ padding: "1rem" }}>
                <h3 className="h5">{d.title}</h3>
                <p className="small muted" style={{ marginTop: "0.25rem" }}>{d.description}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="sep" style={{ margin: "1.5rem 0" }} />

        <section id="degradation" className="docs-section" style={{ marginBottom: "2rem" }}>
          <h2 className="h4" style={{ marginBottom: "0.75rem" }}>Graceful Degradation</h2>
          <p className="small muted" style={{ marginBottom: "0.75rem" }}>Canvas is designed to degrade gracefully:</p>
          <table className="dt-table">
            <thead><tr><th>Scenario</th><th>Behavior</th></tr></thead>
            <tbody>
              {DEGRADATION.map((d) => (
                <tr key={d.scenario}>
                  <td style={{ fontWeight: 500 }}>{d.scenario}</td>
                  <td className="small">{d.behavior}</td>
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
