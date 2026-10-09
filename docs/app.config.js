const { resolve } = require("node:path");
const { readBuildInfo } = require("./scripts/build-info.cjs");

module.exports = ({ config }) => {
  const app = {
    ...config,
    // Preserve the optional subpath export supported by the static-server suite.
    experiments: { ...config.experiments, baseUrl: process.env.EXPO_BASE_URL ?? "" },
    extra: { ...config.extra, canvasBuild: readBuildInfo(resolve(__dirname, "..")) },
  };
  return process.env.CANVAS_AUDIT_BUILD === "1" ? auditApp(app) : app;
};

// The component audit's native build (tools/audit/native/build.ts), which carries the
// in-app capture driver. It is its own app, so it installs beside the docs development
// app the Preview links open and never replaces it: its own bundle identifier and
// package, its own name on the home screen, and its own URL scheme, since two apps
// claiming `canvas` would leave the opener's deep links to whichever the OS picks (an
// Android chooser, a coin toss on iOS). A local Release build would otherwise fetch the
// published over-the-air bundle from `updates.url` and photograph that instead of this
// checkout, so updates are off. The plugins let it speak plain HTTP to the capture host
// on the loopback address, and give the Release Gradle build the memory it needs.
function auditApp(config) {
  return {
    ...config,
    name: "Canvas Audit",
    scheme: "canvas-audit",
    ios: { ...config.ios, bundleIdentifier: "com.nannier.canvas.audit" },
    android: { ...config.android, package: "com.nannier.canvas.audit" },
    updates: { ...config.updates, enabled: false },
    plugins: [...(config.plugins ?? []), "./plugins/with-cleartext-loopback.js", "./plugins/with-gradle-release-memory.js"],
  };
}
