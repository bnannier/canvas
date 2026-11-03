// Compiles the kit's built dist/ for the browser the way Expo's web bundler resolves it, so
// the design-sync converter (which bundles with plain esbuild defaults) receives a web build
// of the real package rather than one that imports React Native itself.
//
// What plain esbuild lacks for a React Native package, and this step supplies:
// - `react-native` resolves to `react-native-web` (Metro's web alias);
// - `.web.js` / `.web.ts(x)` win over the plain file inside dependencies (react-native-svg,
//   expo-video and expo-modules-core ship their browser implementation that way);
// - `__DEV__` and `process.env.EXPO_OS` are defined, as Metro defines them on the web.
//
// React and its runtime stay external: the converter maps them to the shared window.React it
// vendors, so every card and design renders against one React instance. The kit's optional
// peers stay behind their guarded requires; one that is not installed (expo-clipboard,
// react-native-safe-area-context) is left unresolved and the kit takes its documented fallback.
//
// Run from the repo root after `bun run build`: node .design-sync/web-entry.mjs
import { build } from "esbuild";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outfile = resolve(root, ".design-sync/.cache/web/index.mjs");
mkdirSync(dirname(outfile), { recursive: true });

const result = await build({
  absWorkingDir: root,
  entryPoints: ["dist/index.js"],
  outfile,
  bundle: true,
  format: "esm",
  platform: "browser",
  target: "es2020",
  external: ["react", "react/jsx-runtime", "react/jsx-dev-runtime", "react-dom", "react-dom/client", "react-is", "scheduler"],
  alias: { "react-native": "react-native-web" },
  resolveExtensions: [".web.tsx", ".web.ts", ".web.jsx", ".web.js", ".tsx", ".ts", ".jsx", ".js", ".mjs", ".cjs", ".json"],
  mainFields: ["browser", "module", "main"],
  conditions: ["browser", "import", "default"],
  loader: { ".js": "jsx", ".png": "dataurl", ".svg": "dataurl", ".ttf": "dataurl", ".woff2": "dataurl" },
  define: {
    __DEV__: "false",
    "process.env.NODE_ENV": '"production"',
    "process.env.EXPO_OS": '"web"',
    global: "globalThis",
  },
  logLevel: "warning",
  metafile: true,
});

// The CSS token hand-off (styles/canvas.css) as one file: the converter copies its cssEntry
// verbatim and does not follow relative @imports, so they are inlined here, in load order.
const cssOut = resolve(root, ".design-sync/.cache/web/canvas.css");
await build({ absWorkingDir: root, entryPoints: ["styles/canvas.css"], outfile: cssOut, bundle: true, logLevel: "warning" });

const inputs = Object.keys(result.metafile.inputs);
const pkgs = new Set(inputs.filter((p) => p.includes("node_modules/")).map((p) => p.split("node_modules/").pop().split("/").slice(0, p.split("node_modules/").pop().startsWith("@") ? 2 : 1).join("/")));
console.error(`web entry: ${outfile.slice(root.length + 1)} (${inputs.length} inputs; bundled: ${[...pkgs].sort().join(", ")})`);
