import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve, dirname } from "node:path";
import { createRequire } from "node:module";

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
  plugins: [react(), tailwindcss()],
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
