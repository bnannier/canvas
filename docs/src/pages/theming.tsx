import { Markdown } from "@/components/markdown";
import { Toc } from "@/components/toc";
import { setTheme, setSurface, setDensity } from "../../../src/theme";
import nativeProviderCode from "./snippets/theming/native-provider.md?raw";
import useThemeCode from "./snippets/theming/use-theme.md?raw";
import darkToggleCode from "./snippets/theming/dark-toggle.md?raw";
import jsThemeCode from "./snippets/theming/js-theme.md?raw";
import systemPrefCode from "./snippets/theming/system-pref.md?raw";
import glassCode from "./snippets/theming/glass.md?raw";
import jsSurfaceCode from "./snippets/theming/js-surface.md?raw";
import densityCode from "./snippets/theming/density.md?raw";
import jsDensityCode from "./snippets/theming/js-density.md?raw";
import combiningCode from "./snippets/theming/combining.md?raw";
import jsCombineCode from "./snippets/theming/js-combine.md?raw";

const tocItems = [
  { id: "native", label: "Native (ThemeProvider)" },
  { id: "light-dark", label: "Light / Dark" },
  { id: "glass", label: "Glass Surface" },
  { id: "density", label: "Density" },
  { id: "combining", label: "Combining Axes" },
];

export function ThemingPage() {
  return (
    <div className="docs-content">
      <div style={{ minWidth: 0 }}>
        <div className="page-header" style={{ marginBottom: "1.5rem" }}>
          <div>
            <div className="page-header-title"><h1>Theming</h1></div>
            <p className="sub">Three theming axes (light/dark, glass surface, density) on one model: <code className="code">ThemeProvider</code> on native, the matching <code className="code">&lt;html&gt;</code> hooks and helpers on the web.</p>
          </div>
        </div>

        <section id="native" className="docs-section" style={{ marginBottom: "2rem" }}>
          <h2 className="h4" style={{ marginBottom: "0.75rem" }}>Native (ThemeProvider)</h2>
          <p className="body" style={{ marginBottom: "1rem" }}>
            On iOS and Android, wrap the app once in <code className="code">ThemeProvider</code>. It follows the OS
            appearance by default; pass <code className="code">scheme</code> (<code className="code">"light"</code> or
            {" "}<code className="code">"dark"</code>) to force one, and <code className="code">surface="glass"</code> for the
            frosted surfaces. No CSS and no <code className="code">&lt;html&gt;</code> attributes are involved on native.
          </p>
          <Markdown source={nativeProviderCode} />
          <p className="body" style={{ margin: "1rem 0 0.5rem" }}>
            Read the active theme anywhere under the provider with <code className="code">useTheme()</code>.
          </p>
          <Markdown source={useThemeCode} />
          <div className="alert alert-default" style={{ marginTop: "1rem" }}>
            <p className="small"><strong>Density on native</strong> is a per-component choice, not a provider prop: pass a
            density boolean to the components that support it (for example <code className="code">&lt;Card compact&gt;</code>
            {" "}or <code className="code">&lt;Card comfortable&gt;</code>). The <code className="code">data-density</code> hook
            below is the web equivalent.</p>
          </div>
        </section>

        <div className="sep" style={{ margin: "1.5rem 0" }} />

        <section id="light-dark" className="docs-section" style={{ marginBottom: "2rem" }}>
          <h2 className="h4" style={{ marginBottom: "0.75rem" }}>Light / Dark Mode</h2>
          <p className="body" style={{ marginBottom: "1rem" }}>
            Light mode is the default. On the web, dark mode is the <code className="code">dark</code> class on
            {" "}<code className="code">&lt;html&gt;</code>; the helpers toggle it and the token layer flips every color token,
            so components never change. (On native, pass <code className="code">scheme</code> to
            {" "}<code className="code">ThemeProvider</code> instead.)
          </p>
          <Markdown source={darkToggleCode} />

          <div style={{ display: "flex", gap: "0.5rem", margin: "1rem 0" }}>
            <button className="btn btn-outline btn-sm" onClick={() => setTheme("light")}>Light</button>
            <button className="btn btn-outline btn-sm" onClick={() => setTheme("dark")}>Dark</button>
          </div>

          <h3 className="h5" style={{ margin: "1.5rem 0 0.5rem" }}>Web helpers</h3>
          <Markdown source={jsThemeCode} />

          <h3 className="h5" style={{ margin: "1.5rem 0 0.5rem" }}>Respecting system preference</h3>
          <p className="small muted" style={{ marginBottom: "0.5rem" }}>On the web the helpers do not auto-detect <code className="code">prefers-color-scheme</code>. Wire it yourself:</p>
          <Markdown source={systemPrefCode} />
        </section>

        <div className="sep" style={{ margin: "1.5rem 0" }} />

        <section id="glass" className="docs-section" style={{ marginBottom: "2rem" }}>
          <h2 className="h4" style={{ marginBottom: "0.75rem" }}>Glass Surface</h2>
          <p className="body" style={{ marginBottom: "1rem" }}>
            Following Apple&rsquo;s Liquid Glass model, glass is the material for the functional layer: overlays
            (popovers, menus, dialogs, sheets) plus navbars and sidebars read as glass, while content surfaces
            (cards, lists, tables) stay solid (&ldquo;don&rsquo;t use glass in the content layer&rdquo;). It is a
            theming-level switch (the ThemeProvider swaps the popover surface token), not a per-component prop. Those
            functional-layer surfaces render through Canvas&rsquo;s GlassSurface primitive, which paints the real material
            per platform: Apple&rsquo;s native Liquid Glass on iOS 26+ (via expo-glass-effect), a frosted blur on web and
            Android (via expo-blur), and a translucent fallback when those optional modules aren&rsquo;t installed. Turn it
            on with <code className="code">surface="glass"</code> on <code className="code">ThemeProvider</code> on
            native, or <code className="code">data-surface="glass"</code> on <code className="code">&lt;html&gt;</code> on the web.
          </p>
          <Markdown source={glassCode} />

          <div style={{ display: "flex", gap: "0.5rem", margin: "1rem 0" }}>
            <button className="btn btn-outline btn-sm" onClick={() => setSurface("default")}>Default</button>
            <button className="btn btn-outline btn-sm" onClick={() => setSurface("glass")}>Glass</button>
          </div>

          <h3 className="h5" style={{ margin: "1rem 0 0.5rem" }}>What changes</h3>
          <ul style={{ paddingLeft: "1.25rem", fontSize: "0.875rem", lineHeight: 1.75 }}>
            <li>Functional-layer surfaces (overlays, navbars, sidebars) render the glass material via GlassSurface: native Liquid Glass on iOS 26+, a frosted blur on web and Android; content cards, lists, and tables stay solid</li>
            <li>Border colors shift to white-alpha edges</li>
            <li>On the web, the body background becomes a multi-color aurora gradient that the frosted surfaces refract</li>
          </ul>

          <h3 className="h5" style={{ margin: "1.5rem 0 0.5rem" }}>Web helpers</h3>
          <Markdown source={jsSurfaceCode} />
        </section>

        <div className="sep" style={{ margin: "1.5rem 0" }} />

        <section id="density" className="docs-section" style={{ marginBottom: "2rem" }}>
          <h2 className="h4" style={{ marginBottom: "0.75rem" }}>Density</h2>
          <p className="body" style={{ marginBottom: "1rem" }}>
            Density controls spacing in content areas and data tables. Three levels: compact, regular (default), and comfy.
            On the web it is the <code className="code">data-density</code> attribute, which your content CSS and the
            {" "}<code className="code">data-density</code>-aware components key off; on native, components expose per-component
            density props (for example <code className="code">&lt;Card compact&gt;</code>).
          </p>
          <Markdown source={densityCode} />

          <div style={{ display: "flex", gap: "0.5rem", margin: "1rem 0" }}>
            <button className="btn btn-outline btn-sm" onClick={() => setDensity("compact")}>Compact</button>
            <button className="btn btn-outline btn-sm" onClick={() => setDensity("regular")}>Regular</button>
            <button className="btn btn-outline btn-sm" onClick={() => setDensity("comfy")}>Comfy</button>
          </div>
          <p className="small muted" style={{ marginBottom: "0.75rem" }}>
            The buttons set <code className="code">data-density</code> on this page; watch the content and table padding shift.
          </p>

          <h3 className="h5" style={{ margin: "1.5rem 0 0.5rem" }}>Web helpers</h3>
          <Markdown source={jsDensityCode} />
        </section>

        <div className="sep" style={{ margin: "1.5rem 0" }} />

        <section id="combining" className="docs-section" style={{ marginBottom: "2rem" }}>
          <h2 className="h4" style={{ marginBottom: "0.75rem" }}>Combining Axes</h2>
          <p className="body" style={{ marginBottom: "1rem" }}>
            All three axes are independent and composable. On the web they are three separate
            {" "}<code className="code">&lt;html&gt;</code> hooks; on native, scheme and surface are
            {" "}<code className="code">ThemeProvider</code> props and density is per component.
          </p>
          <Markdown source={combiningCode} />
          <div style={{ marginTop: "0.75rem" }}>
            <Markdown source={jsCombineCode} />
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
