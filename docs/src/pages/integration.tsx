import { CodeBlock } from "@/components/code-block";
import { Toc } from "@/components/toc";

const tocItems = [
  { id: "install", label: "Installation" },
  { id: "quick-start", label: "Quick start" },
  { id: "web-setup", label: "React Native Web" },
  { id: "web-theming", label: "Theming on the web" },
  { id: "utilities", label: "cn() utility" },
  { id: "tokens", label: "Reading tokens" },
  { id: "building", label: "Building on Canvas" },
  { id: "exports", label: "Package exports" },
];

const installCode = `npm install @olympusoss/canvas react react-native react-native-svg`;

const quickStartCode = `import { ThemeProvider, Button } from "@olympusoss/canvas";

// Wrap the app once in ThemeProvider; it follows the OS appearance by default
// (pass scheme="light" | "dark" to force one). Components are React Native, so
// style them with Canvas's semantic boolean props.
export function App() {
  return (
    <ThemeProvider>
      <Button primary large>Save</Button>
    </ThemeProvider>
  );
}`;

const viteConfigCode = `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // react-native-web reads these globals.
  define: { __DEV__: "true", global: "globalThis" },
  resolve: {
    // The single line that makes Canvas run in the browser.
    alias: { "react-native": "react-native-web" },
    // Prefer .web.* implementations (react-native-svg ships them).
    extensions: [".web.tsx", ".web.ts", ".web.js", ".tsx", ".ts", ".js"],
  },
  optimizeDeps: {
    include: ["react-native-web", "react-native-svg"],
    esbuildOptions: {
      resolveExtensions: [".web.tsx", ".web.ts", ".web.js", ".tsx", ".ts", ".js"],
    },
  },
});`;

const webEntryCode = `import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@olympusoss/canvas";
// The CSS token layer: custom properties + the .dark / [data-surface] / [data-density]
// hooks. Needed only for the DOM theme helpers and any custom CSS you write with var().
import "@olympusoss/canvas/styles/canvas.css";
import { App } from "./app";
import { useHtmlScheme } from "./use-html-scheme";

function Root() {
  // Keep the RN ThemeProvider in sync with the <html> theme (see the hook below).
  const scheme = useHtmlScheme();
  return (
    <ThemeProvider scheme={scheme}>
      <App />
    </ThemeProvider>
  );
}

createRoot(document.getElementById("root")!).render(<Root />);`;

const schemeHookCode = `import { useSyncExternalStore } from "react";

// setTheme() toggles <html class="dark">. Mirror that class into the value the
// ThemeProvider consumes, so the React Native components re-theme with the page.
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

const getSnapshot = () =>
  document.documentElement.classList.contains("dark") ? "dark" : "light";

export function useHtmlScheme(): "light" | "dark" {
  return useSyncExternalStore(subscribe, getSnapshot, () => "light");
}`;

const themeApiCode = `import { setTheme, toggleTheme, setSurface, setDensity } from "@olympusoss/canvas";

setTheme("dark");       // toggles <html class="dark"> and persists to localStorage
toggleTheme();          // flips light <-> dark, returns the next theme
setSurface("glass");    // <html data-surface="glass">  (solid is the default)
setDensity("compact");  // <html data-density="compact"> (regular is the default)`;

const cnCode = `import { cn } from "@olympusoss/canvas";

// Compose classNames for Canvas primitives; the engine resolves them to RN styles.
// Falsy values are dropped, so conditionals stay inline.
cn("flex-row items-center gap-2", isActive && "bg-accent", className);`;

const tokenCode = `import { token } from "@olympusoss/canvas";

// Web only: reads a CSS custom property off <html>, so it reflects the live theme.
// Requires canvas.css to be loaded; on native, theme values come from ThemeProvider.
token("primary");     // "oklch(0.511 0.262 276.966)"
token("radius-md");   // "0.375rem"

// Color tokens are oklch, so the legacy hsl() helper does not apply to them.
// For an alpha variant, compose in CSS:
//   color-mix(in oklch, var(--primary) 50%, transparent)`;

const buildingCode = `import { View, Text, cn } from "@olympusoss/canvas";

// Build your own components on the engine primitives the same way Canvas does:
// a className-driven View/Text/Pressable/Image/TextInput/ScrollView, with flat boolean
// props for each style choice (not string enums).
interface CalloutProps {
  children: React.ReactNode;
  /** Emphasised, filled style. */
  primary?: boolean;
}

export function Callout({ children, primary }: CalloutProps) {
  return (
    <View className={cn("rounded-md border border-border p-4", primary ? "bg-primary" : "bg-card")}>
      <Text className={cn("text-sm", primary ? "text-primary-foreground" : "text-foreground")}>
        {children}
      </Text>
    </View>
  );
}`;

const EXPORTS = [
  { path: "@olympusoss/canvas", content: "Components, the engine (ThemeProvider, View, Text, Pressable, Image, TextInput, ScrollView, useStyles, useTheme), and the cn / token / theme utilities. Ships as TypeScript source." },
  { path: "@olympusoss/canvas/styles/canvas.css", content: "Tailwind v4 token layer: the CSS custom properties plus the .dark / [data-surface] / [data-density] theme hooks. Web only." },
];

export function IntegrationPage() {
  return (
    <div className="docs-content">
      <div style={{ minWidth: 0 }}>
        <div className="page-header" style={{ marginBottom: "1.5rem" }}>
          <div>
            <div className="page-header-title"><h1>Integration</h1></div>
            <p className="sub">Consume Canvas, a universal React Native UI kit, on native and on the web.</p>
          </div>
        </div>

        <section id="install" className="docs-section" style={{ marginBottom: "2rem" }}>
          <h2 className="h4" style={{ marginBottom: "0.75rem" }}>Installation</h2>
          <p className="small muted" style={{ marginBottom: "0.5rem" }}>
            Canvas is published as <code className="code">@olympusoss/canvas</code> and lists
            {" "}<code className="code">react</code>, <code className="code">react-native</code>, and
            {" "}<code className="code">react-native-svg</code> as peer dependencies.
          </p>
          <CodeBlock code={installCode} language="bash" />
        </section>

        <div className="sep" style={{ margin: "1.5rem 0" }} />

        <section id="quick-start" className="docs-section" style={{ marginBottom: "2rem" }}>
          <h2 className="h4" style={{ marginBottom: "0.75rem" }}>Quick start (native)</h2>
          <p className="small muted" style={{ marginBottom: "0.5rem" }}>
            On iOS and Android (Expo or React Native CLI), wrap the app in
            {" "}<code className="code">ThemeProvider</code> and use the components. No CSS, no build step beyond
            your normal RN bundler.
          </p>
          <CodeBlock code={quickStartCode} language="tsx" />
        </section>

        <div className="sep" style={{ margin: "1.5rem 0" }} />

        <section id="web-setup" className="docs-section" style={{ marginBottom: "2rem" }}>
          <h2 className="h4" style={{ marginBottom: "0.75rem" }}>React Native Web</h2>
          <p className="small muted" style={{ marginBottom: "0.5rem" }}>
            In the browser, Canvas runs through <strong>react-native-web</strong>: alias
            {" "}<code className="code">react-native</code> to <code className="code">react-native-web</code> in your
            bundler. Here is a Vite config (Metro and webpack take the same alias). The
            {" "}<code className="code">@tailwindcss/vite</code> plugin is what processes
            {" "}<code className="code">canvas.css</code> in the next section.
          </p>
          <CodeBlock code={viteConfigCode} language="ts" />
        </section>

        <div className="sep" style={{ margin: "1.5rem 0" }} />

        <section id="web-theming" className="docs-section" style={{ marginBottom: "2rem" }}>
          <h2 className="h4" style={{ marginBottom: "0.75rem" }}>Theming on the web</h2>
          <p className="small muted" style={{ marginBottom: "0.75rem" }}>
            Components theme themselves through <code className="code">ThemeProvider</code> (the engine resolves
            classNames to styles for the active scheme). On the web you also import the CSS token layer so the DOM
            theme helpers and any custom CSS you write stay in sync. The helpers toggle attributes on
            {" "}<code className="code">&lt;html&gt;</code>; a small hook mirrors the <code className="code">.dark</code> class back
            into the provider so the React Native components follow the page.
          </p>
          <CodeBlock code={webEntryCode} language="tsx" />
          <h3 className="h5" style={{ margin: "1.5rem 0 0.5rem" }}>The scheme-sync hook</h3>
          <CodeBlock code={schemeHookCode} language="tsx" />
          <h3 className="h5" style={{ margin: "1.5rem 0 0.5rem" }}>Theme, surface, density helpers</h3>
          <p className="small muted" style={{ marginBottom: "0.5rem" }}>
            These set (and persist) the <code className="code">&lt;html&gt;</code> attributes the token layer keys off.
            They are web-only (they touch <code className="code">document</code> and <code className="code">localStorage</code>).
          </p>
          <CodeBlock code={themeApiCode} language="tsx" />
        </section>

        <div className="sep" style={{ margin: "1.5rem 0" }} />

        <section id="utilities" className="docs-section" style={{ marginBottom: "2rem" }}>
          <h2 className="h4" style={{ marginBottom: "0.75rem" }}>The cn() utility</h2>
          <p className="small muted" style={{ marginBottom: "0.5rem" }}>
            <code className="code">cn()</code> joins classNames and drops falsy values, the same helper Canvas
            components use internally to compose the engine className.
          </p>
          <CodeBlock code={cnCode} language="tsx" />
        </section>

        <div className="sep" style={{ margin: "1.5rem 0" }} />

        <section id="tokens" className="docs-section" style={{ marginBottom: "2rem" }}>
          <h2 className="h4" style={{ marginBottom: "0.75rem" }}>Reading tokens (web)</h2>
          <p className="small muted" style={{ marginBottom: "0.5rem" }}>
            <code className="code">token()</code> reads the live computed value of a CSS custom property off
            {" "}<code className="code">document.documentElement</code>, so it reflects the current theme. It needs
            {" "}<code className="code">canvas.css</code> loaded and is web-only; on native, read theme values from
            {" "}<code className="code">useTheme()</code> instead.
          </p>
          <CodeBlock code={tokenCode} language="tsx" />
        </section>

        <div className="sep" style={{ margin: "1.5rem 0" }} />

        <section id="building" className="docs-section" style={{ marginBottom: "2rem" }}>
          <h2 className="h4" style={{ marginBottom: "0.75rem" }}>Building on Canvas</h2>
          <p className="body" style={{ marginBottom: "0.75rem" }}>
            Compose Canvas components directly, or build your own on the engine primitives
            (<code className="code">View</code>, <code className="code">Text</code>, <code className="code">Pressable</code>,
            {" "}<code className="code">Image</code>, <code className="code">TextInput</code>, <code className="code">ScrollView</code>).
            Follow the Canvas convention: one flat boolean prop per style choice, not string-enum
            {" "}<code className="code">variant</code>/<code className="code">size</code> props.
          </p>
          <CodeBlock code={buildingCode} language="tsx" />
        </section>

        <div className="sep" style={{ margin: "1.5rem 0" }} />

        <section id="exports" className="docs-section" style={{ marginBottom: "2rem" }}>
          <h2 className="h4" style={{ marginBottom: "0.75rem" }}>Package exports</h2>
          <table className="dt-table">
            <thead><tr><th>Export path</th><th>Content</th></tr></thead>
            <tbody>
              {EXPORTS.map((e) => (
                <tr key={e.path}>
                  <td><code className="code">{e.path}</code></td>
                  <td className="small">{e.content}</td>
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
