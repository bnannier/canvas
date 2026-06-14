import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve, dirname, join } from "node:path";
import { createRequire } from "node:module";
import { copyFileSync } from "node:fs";

// GitHub Pages has no SPA rewrite: a hard navigation or refresh on a client
// route (e.g. /canvas/components/button) 404s unless a 404.html serves the app.
// Emit 404.html as a copy of the built index.html so Pages falls back to it and
// the router resolves the path client-side. Build-only (closeBundle).
function spa404Fallback(): Plugin {
  return {
    name: "spa-404-fallback",
    closeBundle() {
      const dist = resolve(__dirname, "dist");
      try {
        copyFileSync(join(dist, "index.html"), join(dist, "404.html"));
      } catch {
        /* dev builds have no dist; ignore */
      }
    },
  };
}

// The docs render real Canvas components through React Native Web: react-native
// is aliased to react-native-web, and @olympusoss/canvas points at the package
// source so the docs dogfood the published API.
//
// The alias must be an absolute path: the canvas source imports react-native
// from outside docs/, so a bare "react-native-web" specifier would be resolved
// against canvas/node_modules (where it does not live) and fail.
const requireFrom = createRequire(resolve(__dirname, "package.json"));
const reactNativeWeb = dirname(requireFrom.resolve("react-native-web/package.json"));

// Allow overriding the base path at build time for GitHub Pages, where the docs
// are served from https://olympusoss.github.io/canvas/. The deploy workflow sets
// VITE_BASE_PATH=/canvas/; local dev keeps the root "/". The router reads the
// same value via import.meta.env.BASE_URL (see src/app.tsx).
const base = process.env.VITE_BASE_PATH ?? "/";

export default defineConfig({
  base,
  plugins: [react(), tailwindcss(), spa404Fallback()],
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV !== "production"),
    global: "globalThis",
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      "@olympusoss/canvas": resolve(__dirname, "../src/index.ts"),
      "react-native": reactNativeWeb,
    },
    extensions: [".web.tsx", ".web.ts", ".web.jsx", ".web.js", ".tsx", ".ts", ".jsx", ".js", ".json"],
  },
  optimizeDeps: {
    include: ["react-native-web", "react-native-svg"],
    // The dep pre-bundler (esbuild) has its own resolver that does NOT read the
    // resolve.extensions above, so without this it follows react-native-svg's
    // native Fabric entry (which imports RN internals RNW lacks) instead of its
    // .web.js variants. Mirror the web-first extension order here so pre-bundling
    // resolves the same web files the production Rollup build already does.
    esbuildOptions: {
      resolveExtensions: [".web.tsx", ".web.ts", ".web.jsx", ".web.js", ".tsx", ".ts", ".jsx", ".js", ".json"],
    },
  },
});
