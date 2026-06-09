import { Link } from "react-router-dom";
import { CodeBlock } from "@/components/code-block";
import { Toc } from "@/components/toc";

const linkStyle = { color: "var(--primary)", textDecoration: "underline", textUnderlineOffset: "2px" } as const;

const tocItems = [
  { id: "what-changed", label: "What Changed" },
  { id: "architecture", label: "Architecture" },
  { id: "styling-model", label: "Styling Model" },
  { id: "mapping", label: "Component Mappings" },
  { id: "theming-migration", label: "Theming" },
  { id: "web-setup", label: "React Native Web" },
  { id: "steps", label: "Migration Steps" },
];

// The original React library (v2): string-enum variant / size props.
const reactLibCode = `import { Button } from "@olympusoss/canvas";
<Button variant="outline" size="sm">Cancel</Button>`;

// The intermediate CSS-first design system: assemble component + modifier classes.
const cssFrameworkCode = `<button class="btn btn-outline btn-sm">Cancel</button>`;

// The current universal RN kit: a React Native component, flat boolean props.
const currentCode = `import { Button } from "@olympusoss/canvas";

// One flat boolean prop per style choice, not a class string and not a
// variant="..." / size="..." enum. The prop name is the value.
<Button outline small>Cancel</Button>`;

const themeNativeCode = `import { ThemeProvider, Button } from "@olympusoss/canvas";

// Native: wrap the app once. ThemeProvider follows the OS appearance by default
// (pass scheme="light" | "dark" to force one). No CSS, no .dark class.
export function App() {
  return (
    <ThemeProvider>
      <Button primary large>Save</Button>
    </ThemeProvider>
  );
}`;

const themeWebCode = `import { setTheme, toggleTheme, setSurface, setDensity } from "@olympusoss/canvas";

// Web: these helpers replace setting <html> attributes by hand. They toggle
// (and persist) the same hooks the canvas.css token layer keys off.
setTheme("dark");       // was: <html class="dark">
toggleTheme();          // flips light <-> dark, returns the next theme
setSurface("glass");    // was: <html data-surface="glass">
setDensity("compact");  // was: <html data-density="compact">`;

// Old CSS-first classes mapped to the current React Native component, with a
// semantic-prop example where the component exposes style axes.
const COMPONENT_MAPPINGS = [
  { old: ".btn, .btn-outline, .btn-sm", now: "<Button>", props: "<Button outline small>" },
  { old: ".input", now: "<Input>", props: "<Input error large>" },
  { old: ".card, .card-header, .card-content, .card-footer", now: "<Card> + <CardHeader> / <CardContent> / <CardFooter>", props: "<Card raised compact>" },
  { old: ".badge, .badge-secondary", now: "<Badge>", props: "<Badge secondary>, <Badge success>" },
  { old: ".alert, .alert-destructive", now: "<Alert>", props: "<Alert error> (intents: info / success / warning / error)" },
  { old: ".avatar", now: "<Avatar>", props: "<Avatar large ring>" },
  { old: ".sep, .sep-v", now: "<Divider>", props: "<Divider vertical>, <Divider soft>" },
  { old: ".checkbox, .checkbox-label", now: "<Checkbox>", props: "" },
  { old: ".switch", now: "<Switch>", props: "" },
  { old: ".tabs-list, .tab, .tabs-content", now: "<Tabs>", props: "" },
  { old: ".select, .select-trigger", now: "<Select>", props: "" },
  { old: ".dialog, .dialog-header, .dialog-overlay", now: "<Dialog>", props: "" },
  { old: ".popover", now: "<Popover>", props: "" },
  { old: ".tooltip, .tooltip-arrow", now: "<Tooltip>", props: "" },
  { old: ".dropdown, .dropdown-item", now: "<Dropdown>", props: "" },
  { old: ".dt-wrap, .dt-table, .dt-toolbar", now: "<DataTable>", props: "" },
  { old: ".sidebar, .sidebar-item", now: "<Sidebar>", props: "" },
  { old: ".pagination, .page-btn", now: "<Pagination>", props: "" },
  { old: ".command-dialog, .command-input, .command-item", now: "<Command>", props: "" },
  { old: ".breadcrumb, .breadcrumb-item", now: "<Breadcrumb>", props: "" },
  { old: ".skeleton, .skeleton-text, .skeleton-circle", now: "<Skeleton>", props: "" },
  { old: ".spinner", now: "<Spinner>", props: "" },
];

const ARCH_COMPARISON = [
  { concern: "Components", prior: "CSS classes (plain HTML)", current: "React Native components" },
  { concern: "Styling API", prior: "Semantic CSS + utility classes", current: "Semantic boolean props" },
  { concern: "Platforms", prior: "Web only (any framework)", current: "iOS, Android, and web (react-native-web)" },
  { concern: "Primitives", prior: "None (bring your own markup)", current: "Box, Text, Pressable, Image, TextInput, Scroll" },
  { concern: "Theming", prior: ".dark class + data-attrs, set by hand", current: "ThemeProvider (native); setTheme / setSurface / setDensity (web)" },
  { concern: "Stylesheet", prior: "Modular CSS (atoms / molecules / organisms)", current: "One token layer: styles/canvas.css (web only)" },
  { concern: "Build", prior: "None (static CSS)", current: "RN / JS bundler; web aliases react-native to react-native-web" },
  { concern: "Framework", prior: "Framework-agnostic", current: "React and React Native" },
];

export function MigrationPage() {
  return (
    <div className="docs-content">
      <div style={{ minWidth: 0 }}>
        <div className="page-header" style={{ marginBottom: "1.5rem" }}>
          <div>
            <div className="page-header-title"><h1>Migration Guide</h1></div>
            <p className="sub">Moving to Canvas, the universal React Native UI kit, from the earlier CSS-first design system.</p>
          </div>
          <div className="page-header-actions">
            <span className="badge badge-secondary">CSS &rarr; React Native</span>
          </div>
        </div>

        <section id="what-changed" className="docs-section" style={{ marginBottom: "2rem" }}>
          <h2 className="h4" style={{ marginBottom: "0.75rem" }}>What Changed</h2>
          <p className="body" style={{ marginBottom: "0.75rem" }}>
            Canvas has had three shapes. It began as a React component library (string-enum
            {" "}<code className="code">variant</code> / <code className="code">size</code> props, with Radix, Recharts,
            and TanStack Table as runtime dependencies). It then became a framework-agnostic, CSS-first design system:
            plain HTML styled with <code className="code">.btn</code>, <code className="code">.card</code>, and
            {" "}<code className="code">.input</code> classes, no framework code at all.
          </p>
          <p className="body">
            Canvas is now a <strong>universal React Native UI kit</strong>. The components are React Native components
            again, styled with semantic boolean props, and they run natively on iOS and Android and on the web through
            react-native-web. The bare <code className="code">.btn</code> / <code className="code">.card</code> component
            classes are gone: the package ships exactly one stylesheet, <code className="code">styles/canvas.css</code>, a
            Tailwind v4 token layer (custom properties plus the <code className="code">.dark</code> /
            {" "}<code className="code">[data-surface]</code> / <code className="code">[data-density]</code> hooks), and no
            component CSS. If you are on the CSS-first design system, this guide is the path forward; the same mappings
            apply if you are coming from the original React library.
          </p>
        </section>

        <div className="sep" style={{ margin: "1.5rem 0" }} />

        <section id="architecture" className="docs-section" style={{ marginBottom: "2rem" }}>
          <h2 className="h4" style={{ marginBottom: "0.75rem" }}>Architecture Comparison</h2>
          <table className="dt-table">
            <thead><tr><th>Concern</th><th>CSS-first design system (prior)</th><th>Universal RN kit (current)</th></tr></thead>
            <tbody>
              {ARCH_COMPARISON.map((row) => (
                <tr key={row.concern}>
                  <td style={{ fontWeight: 500 }}>{row.concern}</td>
                  <td>{row.prior}</td>
                  <td>{row.current}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <div className="sep" style={{ margin: "1.5rem 0" }} />

        <section id="styling-model" className="docs-section" style={{ marginBottom: "2rem" }}>
          <h2 className="h4" style={{ marginBottom: "0.75rem" }}>The Styling Model</h2>
          <p className="body" style={{ marginBottom: "0.75rem" }}>
            This is the change that touches every call site. The CSS-first system styled a component by assembling a
            class string (<code className="code">class="btn btn-outline btn-sm"</code>). The current kit exposes each
            style choice as its own flat boolean prop, named for the meaning it carries; passing the prop turns it on. The
            prop name is the value.
          </p>

          <h3 className="h5" style={{ margin: "1rem 0 0.5rem" }}>Original React library</h3>
          <CodeBlock code={reactLibCode} language="tsx" />

          <h3 className="h5" style={{ margin: "1rem 0 0.5rem" }}>CSS-first design system</h3>
          <CodeBlock code={cssFrameworkCode} language="html" />

          <h3 className="h5" style={{ margin: "1rem 0 0.5rem" }}>Universal RN kit (current)</h3>
          <CodeBlock code={currentCode} language="tsx" />

          <p className="body" style={{ marginTop: "0.75rem" }}>
            Props are grouped into orthogonal axes (intent, size, surface, density, plus stacking state and layout
            booleans). You pass at most one prop per axis, and props from different axes combine freely, so
            {" "}<code className="code">&lt;Button primary large block&gt;</code> is three axes applied together. There is no
            {" "}<code className="code">variant="..."</code> or <code className="code">size="lg"</code> string-enum API, no CSS
            classes, and no raw utility-class soup passed in to restyle a component: every visual variation is a boolean
            prop.
          </p>
        </section>

        <div className="sep" style={{ margin: "1.5rem 0" }} />

        <section id="mapping" className="docs-section" style={{ marginBottom: "2rem" }}>
          <h2 className="h4" style={{ marginBottom: "0.75rem" }}>Component Mappings</h2>
          <p className="body" style={{ marginBottom: "0.75rem" }}>
            Each former CSS class set maps to a React Native component imported from
            {" "}<code className="code">@olympusoss/canvas</code>. Modifier classes become semantic boolean props.
          </p>
          <table className="dt-table">
            <thead><tr><th>CSS-first classes</th><th>Current component</th><th>Semantic props</th></tr></thead>
            <tbody>
              {COMPONENT_MAPPINGS.map((row) => (
                <tr key={row.old}>
                  <td><code className="code" style={{ fontSize: "0.75rem" }}>{row.old}</code></td>
                  <td><code className="code">{row.now}</code></td>
                  <td>{row.props ? <code className="code" style={{ fontSize: "0.75rem" }}>{row.props}</code> : <span className="muted small">&ndash;</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <div className="sep" style={{ margin: "1.5rem 0" }} />

        <section id="theming-migration" className="docs-section" style={{ marginBottom: "2rem" }}>
          <h2 className="h4" style={{ marginBottom: "0.75rem" }}>Theming</h2>
          <p className="body" style={{ marginBottom: "0.75rem" }}>
            The CSS-first system themed itself by setting attributes on <code className="code">&lt;html&gt;</code> by hand:
            the <code className="code">.dark</code> class for dark mode, <code className="code">data-surface="glass"</code> for
            the glass surface, and <code className="code">data-density</code> for density. Components now theme themselves
            through <code className="code">ThemeProvider</code>, and the web helpers drive those same hooks for you.
          </p>
          <h3 className="h5" style={{ margin: "1rem 0 0.5rem" }}>Native</h3>
          <CodeBlock code={themeNativeCode} language="tsx" />
          <h3 className="h5" style={{ margin: "1.5rem 0 0.5rem" }}>Web</h3>
          <p className="body" style={{ marginBottom: "0.5rem" }}>
            On the web you also import <code className="code">@olympusoss/canvas/styles/canvas.css</code> so the token layer
            and any custom <code className="code">var()</code> CSS stay in sync. The helpers set and persist the
            {" "}<code className="code">&lt;html&gt;</code> attributes (they touch <code className="code">document</code> and
            {" "}<code className="code">localStorage</code>, so they are web-only).
          </p>
          <CodeBlock code={themeWebCode} language="tsx" />
          <p className="small muted" style={{ marginTop: "0.5rem" }}>
            See the <Link to="/theming" style={linkStyle}>Theming</Link> guide for the full surface and density model.
          </p>
        </section>

        <div className="sep" style={{ margin: "1.5rem 0" }} />

        <section id="web-setup" className="docs-section" style={{ marginBottom: "2rem" }}>
          <h2 className="h4" style={{ marginBottom: "0.75rem" }}>React Native Web</h2>
          <p className="body">
            On the web the kit runs through react-native-web. The one required change in your bundler is aliasing
            {" "}<code className="code">react-native</code> to <code className="code">react-native-web</code>; a small hook
            mirrors the <code className="code">&lt;html&gt;</code> theme back into <code className="code">ThemeProvider</code> so
            the components follow the page. The <Link to="/integration" style={linkStyle}>Integration</Link> guide has the
            complete Vite config and the scheme-sync hook, and the
            {" "}<Link to="/rn-primitives" style={linkStyle}>React Native</Link> guide covers building custom UI on the engine
            primitives.
          </p>
        </section>

        <div className="sep" style={{ margin: "1.5rem 0" }} />

        <section id="steps" className="docs-section" style={{ marginBottom: "2rem" }}>
          <h2 className="h4" style={{ marginBottom: "0.75rem" }}>Migration Steps</h2>
          <ol style={{ paddingLeft: "1.25rem", fontSize: "0.875rem", lineHeight: 2, listStyleType: "decimal" }}>
            <li><strong>Install the peers.</strong> <code className="code">npm install @olympusoss/canvas react react-native react-native-svg</code>. The kit lists react, react-native, and react-native-svg as peer dependencies.</li>
            <li><strong>Wrap the app in ThemeProvider.</strong> Once, at the root. It follows the OS appearance by default (pass <code className="code">scheme</code> to force one) and replaces the <code className="code">.dark</code> class you used to set on <code className="code">&lt;html&gt;</code>.</li>
            <li><strong>Replace classes with components.</strong> Swap <code className="code">class="btn btn-outline btn-sm"</code> markup for the React Native component with boolean props (<code className="code">&lt;Button outline small&gt;</code>). Use the mapping table above.</li>
            <li><strong>Drop the component CSS.</strong> The <code className="code">.btn</code> / <code className="code">.card</code> classes and the modular CSS files are gone. On native you import no CSS at all; on the web, import the single token layer <code className="code">@olympusoss/canvas/styles/canvas.css</code>.</li>
            <li><strong>Set up react-native-web (web only).</strong> Alias <code className="code">react-native</code> to <code className="code">react-native-web</code> in your bundler and mirror the <code className="code">&lt;html&gt;</code> theme into the provider. See the Integration guide.</li>
            <li><strong>Move theming to the helpers.</strong> Replace hand-set <code className="code">&lt;html&gt;</code> attributes with <code className="code">setTheme</code> / <code className="code">setSurface</code> / <code className="code">setDensity</code> on the web, or <code className="code">ThemeProvider</code> props on native.</li>
            <li><strong>Build custom UI on the engine primitives.</strong> Where you wrote bespoke markup against CSS classes, compose <code className="code">Box</code> / <code className="code">Text</code> / <code className="code">Pressable</code> (and Image / TextInput / Scroll) with <code className="code">className</code>, the way Canvas builds its own components.</li>
          </ol>

          <div className="alert alert-default" style={{ marginTop: "1rem" }}>
            <p className="small"><strong>Need time to migrate?</strong> The earlier releases stay on npm. Pin your dependency to the last CSS-first release (the <code className="code">.btn</code> / <code className="code">.card</code> design system) or the original v2 React library, and upgrade when you are ready.</p>
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
