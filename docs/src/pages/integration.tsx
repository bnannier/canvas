import { CodeBlock } from "@/components/code-block";
import { Toc } from "@/components/toc";

const tocItems = [
  { id: "install", label: "Installation" },
  { id: "importing-css", label: "Importing CSS" },
  { id: "js-utilities", label: "JS Utilities" },
  { id: "reading-tokens", label: "Reading Tokens" },
  { id: "class-composition", label: "Class Composition" },
  { id: "downstream", label: "Downstream Packages" },
  { id: "end-user-apps", label: "End-User Apps" },
  { id: "layer-order", label: "CSS Layer Order" },
  { id: "exports", label: "Package Exports" },
];

const installCode = `npm install @olympusoss/canvas`;

const allInOneCode = `@import "@olympusoss/canvas/styles/canvas.css";`;

const selectiveCode = `/* Required foundation */
@layer canvas.reset, canvas.tokens, canvas.base, canvas.components, canvas.patterns;

@import "@olympusoss/canvas/styles/reset.css";
@import "@olympusoss/canvas/styles/tokens/colors.css";
@import "@olympusoss/canvas/styles/tokens/typography.css";
@import "@olympusoss/canvas/styles/tokens/radius.css";
@import "@olympusoss/canvas/styles/base.css";

/* Only the components you use */
@import "@olympusoss/canvas/styles/components/button.css";
@import "@olympusoss/canvas/styles/components/card.css";

/* Patterns you want */
@import "@olympusoss/canvas/styles/patterns/focus.css";`;

const jsImportCode = `import { setTheme, toggleTheme, setSurface, setDensity } from "@olympusoss/canvas";
import { token, hsl } from "@olympusoss/canvas";
import { cn } from "@olympusoss/canvas";`;

const tokenReadCode = `import { token, hsl } from "@olympusoss/canvas";

token("foreground");       // "240 10% 3.9%" (raw HSL channels)
token("radius-md");        // "6px"
token("font-sans");        // "\\"Inter\\", system-ui, -apple-system, sans-serif"

hsl("foreground");         // "hsl(240 10% 3.9%)"
hsl("primary", 0.5);       // "hsl(240 5.9% 10% / 0.5)"`;

const cnCode = `import { cn } from "@olympusoss/canvas";

cn("btn", "btn-default");                    // "btn btn-default"
cn("btn", isSmall && "btn-sm");              // "btn btn-sm" or "btn"
cn("card", undefined, null, "card-header");  // "card card-header"`;

const downstreamWrapCode = `// React example
import { cn } from "@olympusoss/canvas";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export function Button({ variant = "default", size, className, ...props }: ButtonProps) {
  return (
    <button
      className={cn("btn", \`btn-\${variant}\`, size && \`btn-\${size}\`, className)}
      {...props}
    />
  );
}`;

const appSetupCode = `// app entry point
import "@olympusoss/canvas/styles/canvas.css";
import { setTheme } from "@olympusoss/canvas";

// Initialize theme from user preference
const stored = localStorage.getItem("theme");
if (stored === "dark" || stored === "light") {
  setTheme(stored);
}`;

const customLayoutCode = `.custom-panel {
  background-color: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  box-shadow: var(--shadow-elevated);
}`;

const layerOverrideCode = `@layer app {
  .btn-default {
    background-color: hsl(217 91% 60%);
  }
}`;

const EXPORTS = [
  { path: "@olympusoss/canvas", content: "JS utilities (theme, tokens, cn)" },
  { path: "@olympusoss/canvas/styles/*", content: "CSS files (wildcard)" },
  { path: "@olympusoss/canvas/styles/canvas.css", content: "All-in-one CSS entry" },
];

export function IntegrationPage() {
  return (
    <div className="docs-content">
      <div style={{ minWidth: 0 }}>
        <div className="page-header" style={{ marginBottom: "1.5rem" }}>
          <div>
            <div className="page-header-title"><h1>Integration</h1></div>
            <p className="sub">How downstream packages and end-user apps consume Canvas.</p>
          </div>
        </div>

        <section id="install" className="docs-section" style={{ marginBottom: "2rem" }}>
          <h2 className="h4" style={{ marginBottom: "0.75rem" }}>Installation</h2>
          <CodeBlock code={installCode} language="bash" />
        </section>

        <div className="sep" style={{ margin: "1.5rem 0" }} />

        <section id="importing-css" className="docs-section" style={{ marginBottom: "2rem" }}>
          <h2 className="h4" style={{ marginBottom: "0.75rem" }}>Importing CSS</h2>

          <h3 className="h5" style={{ marginBottom: "0.5rem" }}>All-in-one</h3>
          <CodeBlock code={allInOneCode} language="css" />

          <h3 className="h5" style={{ margin: "1.5rem 0 0.5rem" }}>Selective imports</h3>
          <p className="small muted" style={{ marginBottom: "0.5rem" }}>When importing selectively, declare the layer order at the top to preserve correct cascade specificity.</p>
          <CodeBlock code={selectiveCode} language="css" />
        </section>

        <div className="sep" style={{ margin: "1.5rem 0" }} />

        <section id="js-utilities" className="docs-section" style={{ marginBottom: "2rem" }}>
          <h2 className="h4" style={{ marginBottom: "0.75rem" }}>JS Utilities</h2>
          <p className="small muted" style={{ marginBottom: "0.5rem" }}>All exports are framework-agnostic and work in any environment with a DOM.</p>
          <CodeBlock code={jsImportCode} language="javascript" />
        </section>

        <div className="sep" style={{ margin: "1.5rem 0" }} />

        <section id="reading-tokens" className="docs-section" style={{ marginBottom: "2rem" }}>
          <h2 className="h4" style={{ marginBottom: "0.75rem" }}>Reading Tokens from JS</h2>
          <p className="small muted" style={{ marginBottom: "0.5rem" }}>
            Use <code className="code">token()</code> to read the computed value of any CSS custom property. These read live computed values from <code className="code">document.documentElement</code>, so they reflect the current theme.
          </p>
          <CodeBlock code={tokenReadCode} language="javascript" />
        </section>

        <div className="sep" style={{ margin: "1.5rem 0" }} />

        <section id="class-composition" className="docs-section" style={{ marginBottom: "2rem" }}>
          <h2 className="h4" style={{ marginBottom: "0.75rem" }}>Class Composition</h2>
          <p className="small muted" style={{ marginBottom: "0.5rem" }}>
            The <code className="code">cn()</code> utility merges class names, filtering out falsy values.
          </p>
          <CodeBlock code={cnCode} language="javascript" />
        </section>

        <div className="sep" style={{ margin: "1.5rem 0" }} />

        <section id="downstream" className="docs-section" style={{ marginBottom: "2rem" }}>
          <h2 className="h4" style={{ marginBottom: "0.75rem" }}>Building Downstream Packages</h2>
          <p className="body" style={{ marginBottom: "0.75rem" }}>
            Downstream packages (<code className="code">canvas-react</code>, <code className="code">canvas-vue</code>, etc.) depend on Canvas for tokens and CSS, then wrap CSS patterns in framework components.
          </p>
          <CodeBlock code={downstreamWrapCode} language="javascript" />
        </section>

        <div className="sep" style={{ margin: "1.5rem 0" }} />

        <section id="end-user-apps" className="docs-section" style={{ marginBottom: "2rem" }}>
          <h2 className="h4" style={{ marginBottom: "0.75rem" }}>End-User Apps</h2>
          <p className="body" style={{ marginBottom: "0.75rem" }}>
            End-user apps typically consume a downstream framework package rather than Canvas directly. They may also import Canvas CSS or utilities when needed.
          </p>

          <h3 className="h5" style={{ marginBottom: "0.5rem" }}>Typical setup</h3>
          <CodeBlock code={appSetupCode} language="javascript" />

          <h3 className="h5" style={{ margin: "1.5rem 0 0.5rem" }}>Custom layouts using Canvas tokens</h3>
          <CodeBlock code={customLayoutCode} language="css" />
        </section>

        <div className="sep" style={{ margin: "1.5rem 0" }} />

        <section id="layer-order" className="docs-section" style={{ marginBottom: "2rem" }}>
          <h2 className="h4" style={{ marginBottom: "0.75rem" }}>CSS Layer Order</h2>
          <p className="body" style={{ marginBottom: "0.75rem" }}>
            Canvas uses five cascade layers. Your own styles sit outside these layers (highest priority) or in your own named layer:
          </p>
          <div className="docs-import-block" style={{ marginBottom: "0.75rem" }}>
            <code>canvas.reset &lt; canvas.tokens &lt; canvas.base &lt; canvas.components &lt; canvas.patterns &lt; (unlayered)</code>
          </div>
          <p className="small muted" style={{ marginBottom: "0.5rem" }}>Override Canvas styles with unlayered CSS or a higher-priority layer:</p>
          <CodeBlock code={layerOverrideCode} language="css" />
        </section>

        <div className="sep" style={{ margin: "1.5rem 0" }} />

        <section id="exports" className="docs-section" style={{ marginBottom: "2rem" }}>
          <h2 className="h4" style={{ marginBottom: "0.75rem" }}>Package Exports</h2>
          <table className="dt-table">
            <thead><tr><th>Export Path</th><th>Content</th></tr></thead>
            <tbody>
              {EXPORTS.map((e) => (
                <tr key={e.path}>
                  <td><code className="code">{e.path}</code></td>
                  <td>{e.content}</td>
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
