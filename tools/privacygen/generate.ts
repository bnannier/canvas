// Production SSR uses actual web renderers, never the tests' SVG/player stubs.
import { plugin } from "bun";
import { createRequire } from "node:module";
import { resolve } from "node:path";

const require = createRequire(import.meta.url);
plugin({ name: "privacy-real-web-renderers", setup(build) {
  build.module("react-native", () => ({ exports: require("react-native-web"), loader: "object" }));
  build.module("react-native-svg", () => ({ exports: require("react-native-svg/lib/module/elements.web.js"), loader: "object" }));
  build.module("@nannier/canvas", () => ({ exports: require("../../src/index.ts"), loader: "object" }));
} });

const { generatePrivacy } = await import("./render.tsx");
generatePrivacy({
  output: process.argv.includes("--out") ? resolve(process.argv[process.argv.indexOf("--out") + 1]!) : undefined,
  check: process.argv.includes("--check"),
  basePath: process.env.EXPO_BASE_URL ?? "",
});
