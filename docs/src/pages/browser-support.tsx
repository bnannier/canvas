import { Toc } from "@/components/toc";

const tocItems = [
  { id: "platforms", label: "Platforms" },
  { id: "peers", label: "Peer Dependencies" },
  { id: "web-baseline", label: "Web Browser Baseline" },
  { id: "notes", label: "Notes" },
];

const PLATFORMS = [
  { platform: "iOS", runtime: "React Native (native)", min: "iOS 13.4+" },
  { platform: "Android", runtime: "React Native (native)", min: "Android 6.0+ (API 23)" },
  { platform: "Web", runtime: "react-native-web + the canvas.css token layer", min: "Modern browsers (see baseline below)" },
];

const PEERS = [
  { pkg: "react", range: ">=18", role: "The React runtime Canvas builds on." },
  { pkg: "react-native", range: ">=0.74", role: "Native iOS / Android host, and the module aliased to react-native-web on the web." },
  { pkg: "react-native-svg", range: ">=13", role: "Vector icons and the chart primitives." },
];

const WEB_BASELINE = [
  { browser: "Chrome / Edge", version: "111+", reason: "Tailwind v4 token layer (canvas.css)" },
  { browser: "Safari", version: "16.4+", reason: "Tailwind v4 token layer (canvas.css)" },
  { browser: "Firefox", version: "128+", reason: "Tailwind v4 token layer (canvas.css)" },
];

const NOTES = [
  {
    title: "Native uses no CSS",
    description: "On iOS and Android there is no browser and no CSS feature floor. Components read the active design tokens with useTheme and build their React Native styles from them; the native minimums above come from React Native 0.74 and react-native-svg, the package's peer dependencies.",
  },
  {
    title: "The web floor comes from the stylesheet, not the components",
    description: "Canvas components resolve to inline styles through react-native-web and run in much older browsers. It is the single shipped stylesheet, canvas.css (a Tailwind v4 token layer), that sets the modern-browser baseline above. If you must support older browsers, supply the design tokens as plain CSS custom properties yourself; canvas.css is the only stylesheet Canvas ships.",
  },
  {
    title: "Accessibility and motion",
    description: "Reduced-motion and other accessibility preferences are handled at the platform layer (React Native on native, react-native-web in the browser), not through bundled CSS pattern files.",
  },
];

export function BrowserSupportPage() {
  return (
    <div className="docs-content">
      <div style={{ minWidth: 0 }}>
        <div className="page-header" style={{ marginBottom: "1.5rem" }}>
          <div>
            <div className="page-header-title"><h1>Platform &amp; Browser Support</h1></div>
            <p className="sub">The platforms Canvas runs on (iOS, Android, and the web through react-native-web) and the web browser baseline.</p>
          </div>
        </div>

        <section id="platforms" className="docs-section" style={{ marginBottom: "2rem" }}>
          <h2 className="h4" style={{ marginBottom: "0.75rem" }}>Platforms</h2>
          <p className="small muted" style={{ marginBottom: "0.75rem" }}>
            Canvas is a universal React Native UI kit. It runs natively on iOS and Android, and on the web through
            {" "}<code className="code">react-native-web</code>.
          </p>
          <table className="dt-table">
            <thead><tr><th>Platform</th><th>Runtime</th><th>Minimum</th></tr></thead>
            <tbody>
              {PLATFORMS.map((p) => (
                <tr key={p.platform}>
                  <td style={{ fontWeight: 500 }}>{p.platform}</td>
                  <td className="small">{p.runtime}</td>
                  <td>{p.min}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <div className="sep" style={{ margin: "1.5rem 0" }} />

        <section id="peers" className="docs-section" style={{ marginBottom: "2rem" }}>
          <h2 className="h4" style={{ marginBottom: "0.75rem" }}>Peer Dependencies</h2>
          <p className="small muted" style={{ marginBottom: "0.75rem" }}>
            These peers set the platform floor. Install them alongside <code className="code">@olympusoss/canvas</code>.
          </p>
          <table className="dt-table">
            <thead><tr><th>Package</th><th>Range</th><th>Role</th></tr></thead>
            <tbody>
              {PEERS.map((p) => (
                <tr key={p.pkg}>
                  <td><code className="code">{p.pkg}</code></td>
                  <td>{p.range}</td>
                  <td className="small muted">{p.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <div className="sep" style={{ margin: "1.5rem 0" }} />

        <section id="web-baseline" className="docs-section" style={{ marginBottom: "2rem" }}>
          <h2 className="h4" style={{ marginBottom: "0.75rem" }}>Web Browser Baseline</h2>
          <p className="small muted" style={{ marginBottom: "0.75rem" }}>
            On the web, the modern-browser floor is set by the <code className="code">canvas.css</code> token layer, which is
            {" "}<strong>Tailwind v4</strong>. Tailwind v4 targets these versions:
          </p>
          <table className="dt-table">
            <thead><tr><th>Browser</th><th>Minimum Version</th><th>Reason</th></tr></thead>
            <tbody>
              {WEB_BASELINE.map((b) => (
                <tr key={b.browser}>
                  <td style={{ fontWeight: 500 }}>{b.browser}</td>
                  <td>{b.version}</td>
                  <td className="small muted">{b.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <div className="sep" style={{ margin: "1.5rem 0" }} />

        <section id="notes" className="docs-section" style={{ marginBottom: "2rem" }}>
          <h2 className="h4" style={{ marginBottom: "0.75rem" }}>Notes</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {NOTES.map((n) => (
              <div key={n.title} className="card" style={{ padding: "1rem" }}>
                <h3 className="h5">{n.title}</h3>
                <p className="small muted" style={{ marginTop: "0.25rem" }}>{n.description}</p>
              </div>
            ))}
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
