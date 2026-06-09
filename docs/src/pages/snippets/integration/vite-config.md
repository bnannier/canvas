```ts
import { defineConfig } from "vite";
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
});
```
