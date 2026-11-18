import { reactNativeWebFlowPlugin } from "./web-flow.mjs";

// Shared by the documented plain-web setup and the packed-package consumers.
// Resolve peers in the consumer app, never in Canvas's checkout.
export function reactNativeWebOptions(consumerRequire, { development = false } = {}) {
  return {
    platform: "browser",
    jsx: "automatic",
    plugins: [reactNativeWebFlowPlugin(consumerRequire)],
    alias: { "react-native": "react-native-web" },
    resolveExtensions: [".web.tsx", ".web.ts", ".web.jsx", ".web.js", ".tsx", ".ts", ".jsx", ".js", ".json"],
    define: {
      "process.env.NODE_ENV": JSON.stringify(development ? "development" : "production"),
      __DEV__: String(development),
      global: "globalThis",
    },
  };
}
