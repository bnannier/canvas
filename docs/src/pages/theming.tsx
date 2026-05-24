import { CodeBlock } from "@/components/code-block";
import { Toc } from "@/components/toc";
import { setTheme, setSurface, setDensity } from "../../../src/theme";

const tocItems = [
  { id: "light-dark", label: "Light / Dark" },
  { id: "glass", label: "Glass Surface" },
  { id: "density", label: "Density" },
  { id: "combining", label: "Combining Axes" },
  { id: "patterns", label: "Additional Patterns" },
];

const darkToggleCode = `<!-- Light (default) -->
<html>

<!-- Dark -->
<html class="dark">`;

const jsThemeCode = `import { getTheme, setTheme, toggleTheme } from "@olympusoss/canvas";

getTheme();        // "light" | "dark"
setTheme("dark");  // applies .dark to <html>
toggleTheme();     // switches and returns the new theme`;

const systemPrefCode = `import { setTheme } from "@olympusoss/canvas";

const mq = window.matchMedia("(prefers-color-scheme: dark)");
setTheme(mq.matches ? "dark" : "light");
mq.addEventListener("change", (e) => setTheme(e.matches ? "dark" : "light"));`;

const glassCode = `<html data-surface="glass">
<html class="dark" data-surface="glass">`;

const jsSurfaceCode = `import { getSurface, setSurface } from "@olympusoss/canvas";

getSurface();            // "default" | "glass"
setSurface("glass");     // sets data-surface="glass"
setSurface("default");   // removes the attribute`;

const densityCode = `<!-- Regular (default, no attribute needed) -->
<html>

<!-- Compact -->
<html data-density="compact">

<!-- Comfy -->
<html data-density="comfy">`;

const jsDensityCode = `import { getDensity, setDensity } from "@olympusoss/canvas";

getDensity();            // "compact" | "regular" | "comfy"
setDensity("compact");   // sets data-density="compact"
setDensity("regular");   // removes the attribute`;

const combiningCode = `<html class="dark" data-surface="glass" data-density="compact">`;

const jsCombineCode = `import { setTheme, setSurface, setDensity } from "@olympusoss/canvas";

setTheme("dark");
setSurface("glass");
setDensity("compact");`;

export function ThemingPage() {
  return (
    <div className="docs-content">
      <div style={{ minWidth: 0 }}>
        <div className="page-header" style={{ marginBottom: "1.5rem" }}>
          <div>
            <div className="page-header-title"><h1>Theming</h1></div>
            <p className="sub">Three independent theming axes: light/dark mode, glass surface, and density. All controlled via HTML attributes.</p>
          </div>
        </div>

        <section id="light-dark" className="docs-section" style={{ marginBottom: "2rem" }}>
          <h2 className="h4" style={{ marginBottom: "0.75rem" }}>Light / Dark Mode</h2>
          <p className="body" style={{ marginBottom: "1rem" }}>
            Light mode is the default. Toggle dark mode by adding the <code className="code">dark</code> class to <code className="code">&lt;html&gt;</code>. All color tokens flip automatically; components never change.
          </p>
          <CodeBlock code={darkToggleCode} language="html" />

          <div style={{ display: "flex", gap: "0.5rem", margin: "1rem 0" }}>
            <button className="btn btn-outline btn-sm" onClick={() => setTheme("light")}>Light</button>
            <button className="btn btn-outline btn-sm" onClick={() => setTheme("dark")}>Dark</button>
          </div>

          <h3 className="h5" style={{ margin: "1.5rem 0 0.5rem" }}>JS utilities</h3>
          <CodeBlock code={jsThemeCode} language="javascript" />

          <h3 className="h5" style={{ margin: "1.5rem 0 0.5rem" }}>Respecting system preference</h3>
          <p className="small muted" style={{ marginBottom: "0.5rem" }}>Canvas does not auto-detect <code className="code">prefers-color-scheme</code>. Wire it yourself:</p>
          <CodeBlock code={systemPrefCode} language="javascript" />
        </section>

        <div className="sep" style={{ margin: "1.5rem 0" }} />

        <section id="glass" className="docs-section" style={{ marginBottom: "2rem" }}>
          <h2 className="h4" style={{ marginBottom: "0.75rem" }}>Glass Surface</h2>
          <p className="body" style={{ marginBottom: "1rem" }}>
            Glass mode adds frosted-pane effects to cards, sidebars, topbars, inputs, and overlays. It also replaces the default body gradient with an aurora-style multi-color backdrop.
          </p>
          <CodeBlock code={glassCode} language="html" />

          <div style={{ display: "flex", gap: "0.5rem", margin: "1rem 0" }}>
            <button className="btn btn-outline btn-sm" onClick={() => setSurface("default")}>Default</button>
            <button className="btn btn-outline btn-sm" onClick={() => setSurface("glass")}>Glass</button>
          </div>

          <h3 className="h5" style={{ margin: "1rem 0 0.5rem" }}>What changes</h3>
          <ul style={{ paddingLeft: "1.25rem", fontSize: "0.875rem", lineHeight: 1.75 }}>
            <li>Cards, stat-cards, topbar, sidebar gain <code className="code">backdrop-filter: blur(18px)</code></li>
            <li>Inputs get a lighter blur (8px)</li>
            <li>Overlays (popover, menus, sheets) get a stronger blur (20px)</li>
            <li>Border colors switch to white-alpha edges</li>
            <li>Body background becomes a multi-orb gradient</li>
          </ul>

          <h3 className="h5" style={{ margin: "1.5rem 0 0.5rem" }}>JS utilities</h3>
          <CodeBlock code={jsSurfaceCode} language="javascript" />
        </section>

        <div className="sep" style={{ margin: "1.5rem 0" }} />

        <section id="density" className="docs-section" style={{ marginBottom: "2rem" }}>
          <h2 className="h4" style={{ marginBottom: "0.75rem" }}>Density</h2>
          <p className="body" style={{ marginBottom: "1rem" }}>
            Density controls spacing in content areas and data tables. Three levels: compact, regular (default), and comfy.
          </p>
          <CodeBlock code={densityCode} language="html" />

          <div style={{ display: "flex", gap: "0.5rem", margin: "1rem 0" }}>
            <button className="btn btn-outline btn-sm" onClick={() => setDensity("compact")}>Compact</button>
            <button className="btn btn-outline btn-sm" onClick={() => setDensity("regular")}>Regular</button>
            <button className="btn btn-outline btn-sm" onClick={() => setDensity("comfy")}>Comfy</button>
          </div>

          <h3 className="h5" style={{ margin: "1rem 0 0.5rem" }}>What changes</h3>
          <table className="dt-table">
            <thead>
              <tr><th>Element</th><th>Compact</th><th>Regular</th><th>Comfy</th></tr>
            </thead>
            <tbody>
              <tr><td><code className="code">.app-content</code> padding</td><td>0.75rem</td><td>1rem / 1.75rem</td><td>1.5rem / 2.25rem</td></tr>
              <tr><td><code className="code">.dt-toolbar</code> padding</td><td>0.75rem</td><td>1rem</td><td>1.25rem</td></tr>
              <tr><td><code className="code">.dt-table th</code> padding</td><td>0.75rem / 0.5rem</td><td>1rem / 0.625rem</td><td>18px / 0.875rem</td></tr>
              <tr><td><code className="code">.dt-table td</code> padding</td><td>0.75rem / 0.5rem</td><td>1rem / 0.75rem</td><td>18px / 1rem</td></tr>
              <tr><td><code className="code">.dt-table td</code> font-size</td><td>12.5px</td><td>13px</td><td>13.5px</td></tr>
            </tbody>
          </table>

          <h3 className="h5" style={{ margin: "1.5rem 0 0.5rem" }}>JS utilities</h3>
          <CodeBlock code={jsDensityCode} language="javascript" />
        </section>

        <div className="sep" style={{ margin: "1.5rem 0" }} />

        <section id="combining" className="docs-section" style={{ marginBottom: "2rem" }}>
          <h2 className="h4" style={{ marginBottom: "0.75rem" }}>Combining Axes</h2>
          <p className="body" style={{ marginBottom: "1rem" }}>All three axes are independent and composable.</p>
          <CodeBlock code={combiningCode} language="html" />
          <div style={{ marginTop: "0.75rem" }}>
            <CodeBlock code={jsCombineCode} language="javascript" />
          </div>
        </section>

        <div className="sep" style={{ margin: "1.5rem 0" }} />

        <section id="patterns" className="docs-section" style={{ marginBottom: "2rem" }}>
          <h2 className="h4" style={{ marginBottom: "0.75rem" }}>Additional Patterns</h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div className="card" style={{ padding: "1rem" }}>
              <h3 className="h5">Reduced Motion</h3>
              <p className="small muted" style={{ marginTop: "0.25rem" }}>
                <code className="code">patterns/reduced-motion.css</code> respects <code className="code">prefers-reduced-motion: reduce</code> by collapsing all animation and transition durations. No opt-in needed.
              </p>
            </div>
            <div className="card" style={{ padding: "1rem" }}>
              <h3 className="h5">High Contrast</h3>
              <p className="small muted" style={{ marginTop: "0.25rem" }}>
                <code className="code">patterns/high-contrast.css</code> responds to <code className="code">prefers-contrast: more</code> by increasing border widths, removing shadows, and boosting muted-foreground contrast.
              </p>
            </div>
            <div className="card" style={{ padding: "1rem" }}>
              <h3 className="h5">Focus Pulse</h3>
              <p className="small muted" style={{ marginTop: "0.25rem" }}>
                All interactive elements get an animated ring pulse on focus via <code className="code">patterns/focus.css</code>. Suppress on individual elements with the <code className="code">.no-focus-pulse</code> class.
              </p>
            </div>
            <div className="card" style={{ padding: "1rem" }}>
              <h3 className="h5">Scrollbar</h3>
              <p className="small muted" style={{ marginTop: "0.25rem" }}>
                Thin scrollbar styling applied globally via <code className="code">patterns/scrollbar.css</code>. Glass mode uses white-alpha scrollbar colors.
              </p>
            </div>
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
