import { expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";

const metadata = (relative: string) => JSON.parse(readFileSync(new URL(relative, import.meta.url), "utf8"));

// Canvas ships as one package (CLAUDE.md, "One package"). Its Android capture module lives in
// android/ and Expo autolinks it from the package root, so no second workspace or npm package
// exists to version, publish or install.
test("Canvas carries its Android capture module in its one package", () => {
  const root = metadata("../../package.json");
  expect(root.workspaces).toBeUndefined();
  expect(existsSync(new URL("../../packages", import.meta.url))).toBe(false);
  expect(root.files).toEqual(expect.arrayContaining(["android/build.gradle", "android/src/main", "expo-module.config.json"]));
  expect(Object.keys({ ...root.dependencies, ...root.peerDependencies }).filter((name) => name.startsWith("@nannier/"))).toEqual([]);
  // The module binds through expo-modules-core, which only an Expo app provides.
  expect(root.dependencies?.["expo-modules-core"]).toBeUndefined();
  expect(root.peerDependenciesMeta["expo-modules-core"]).toEqual({ optional: true });
  expect(metadata("../../expo-module.config.json")).toEqual({ platforms: ["android"], android: { modules: ["io.ionize.canvas.blur.CanvasBlurModule"] } });
});

test("docs autolink the module from the Canvas root, never through consumer source pins", () => {
  const docs = metadata("../../docs/package.json");
  const starter = metadata("../../examples/starter/package.json");
  const smoke = metadata("../../smoke/package.json");
  expect(docs.expo.autolinking.nativeModulesDir).toBe("..");
  for (const pkg of [docs, starter, smoke]) {
    expect(pkg.dependencies["@nannier/canvas-blur"]).toBeUndefined();
    expect(Object.values(pkg.dependencies).some((value) => /^(file|link|workspace):/.test(String(value)))).toBe(false);
  }
});
