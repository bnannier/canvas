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

export default defineConfig({
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
    include: ["react-native-web"],
  },
});
