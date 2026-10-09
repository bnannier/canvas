import { afterEach, expect, test } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { runInNewContext } from "node:vm";
const appConfig = require("../../docs/app.config.js");
const { nativeFingerprint, sourceFingerprint } = require("../../docs/scripts/build-info.cjs");

// The component audit's native build (tools/audit/native/build.ts) is the docs app under
// its own identity, so it installs beside the docs development app the Preview links
// open instead of replacing it, and a link to `canvas://` still reaches that app.

const docs = resolve(import.meta.dir, "../../docs");
const base = {
  name: "Canvas",
  scheme: "canvas",
  ios: { bundleIdentifier: "com.nannier.canvas", supportsTablet: true },
  android: { package: "com.nannier.canvas", adaptiveIcon: { backgroundColor: "#0B0B0F" } },
  plugins: ["expo-router", "expo-font"],
  updates: { url: "https://u.expo.dev/project" },
  extra: { router: {} },
};
const previous = { build: process.env.CANVAS_AUDIT_BUILD, native: process.env.CANVAS_AUDIT_NATIVE_FINGERPRINT };
const temporary: string[] = [];
afterEach(() => {
  if (previous.build === undefined) delete process.env.CANVAS_AUDIT_BUILD;
  else process.env.CANVAS_AUDIT_BUILD = previous.build;
  if (previous.native === undefined) delete process.env.CANVAS_AUDIT_NATIVE_FINGERPRINT;
  else process.env.CANVAS_AUDIT_NATIVE_FINGERPRINT = previous.native;
  for (const root of temporary.splice(0)) rmSync(root, { recursive: true, force: true });
});

test("an ordinary build keeps the docs app's identity and plugins", () => {
  delete process.env.CANVAS_AUDIT_BUILD;
  const config = appConfig({ config: base });
  expect(config.name).toBe("Canvas");
  expect(config.scheme).toBe("canvas");
  expect(config.ios.bundleIdentifier).toBe("com.nannier.canvas");
  expect(config.android.package).toBe("com.nannier.canvas");
  expect(config.plugins).toEqual(base.plugins);
  expect(config.updates).toEqual(base.updates);
});

test("the audit build is its own app, with updates off and the loopback plugins", () => {
  process.env.CANVAS_AUDIT_BUILD = "1";
  const config = appConfig({ config: base });
  expect(config.name).toBe("Canvas Audit");
  expect(config.scheme).toBe("canvas-audit");
  expect(config.ios).toEqual({ ...base.ios, bundleIdentifier: "com.nannier.canvas.audit" });
  expect(config.android).toEqual({ ...base.android, package: "com.nannier.canvas.audit" });
  expect(config.updates).toEqual({ ...base.updates, enabled: false });
  expect(config.plugins.slice(0, base.plugins.length)).toEqual(base.plugins);
  const added = config.plugins.slice(base.plugins.length);
  expect(added).toEqual(["./plugins/with-cleartext-loopback.js", "./plugins/with-gradle-release-memory.js"]);
  for (const plugin of added) expect(existsSync(resolve(docs, plugin))).toBe(true);
  // The build identity the capture host checks is still there.
  expect(config.extra.canvasBuild.sourceFingerprint).toMatch(/^[a-f0-9]{64}$/);
  expect(config.extra.router).toEqual({});
});

test("the audit build carries the native fingerprint its build passes in, and only a well-formed one", () => {
  process.env.CANVAS_AUDIT_BUILD = "1";
  delete process.env.CANVAS_AUDIT_NATIVE_FINGERPRINT;
  // Read without the build (Metro, a manual build): no stamp, which the capture host refuses.
  expect(appConfig({ config: base }).extra.canvasBuild.nativeFingerprint).toBeNull();
  process.env.CANVAS_AUDIT_NATIVE_FINGERPRINT = "c".repeat(64);
  const config = appConfig({ config: base });
  expect(config.extra.canvasBuild.nativeFingerprint).toBe("c".repeat(64));
  expect(config.extra.canvasBuild.sourceFingerprint).toMatch(/^[a-f0-9]{64}$/);
  process.env.CANVAS_AUDIT_NATIVE_FINGERPRINT = "not-a-fingerprint";
  expect(() => appConfig({ config: base })).toThrow("CANVAS_AUDIT_NATIVE_FINGERPRINT");
  // An ordinary build carries none, whatever the environment says.
  delete process.env.CANVAS_AUDIT_BUILD;
  expect(appConfig({ config: base }).extra.canvasBuild.nativeFingerprint).toBeUndefined();
});

test("the native fingerprint follows the native build's inputs and nothing else", () => {
  const root = mkdtempSync(join(tmpdir(), "canvas-native-fingerprint-"));
  temporary.push(root);
  const write = (path: string, text: string) => {
    mkdirSync(join(root, path, ".."), { recursive: true });
    writeFileSync(join(root, path), text);
  };
  write("docs/app.json", "{}");
  write("docs/app.config.js", "module.exports = () => ({});");
  write("docs/plugins/with-cleartext-loopback.js", "module.exports = (config) => config;");
  write("packages/canvas-blur/android/src/main/Frost.kt", "class Frost");
  write("src/index.ts", "export const value = 1;");
  const first = nativeFingerprint(root);
  expect(first).toMatch(/^[a-f0-9]{64}$/);
  // JS the bundle carries is the source fingerprint's, not the native one's.
  const source = sourceFingerprint(root);
  write("src/index.ts", "export const value = 2;");
  expect(nativeFingerprint(root)).toBe(first);
  expect(sourceFingerprint(root)).not.toBe(source);
  // Build products and installs inside a native module do not count.
  for (const product of ["node_modules/x/index.js", "dist/index.js", "android/build/out.dex", "android/.gradle/state.bin", "android/.cxx/cache", "android/.kotlin/session"]) {
    write(`packages/canvas-blur/${product}`, "built");
  }
  expect(nativeFingerprint(root)).toBe(first);
  // Every native input does.
  const changes: [string, string][] = [
    ["docs/plugins/with-cleartext-loopback.js", "module.exports = (config) => ({ ...config });"],
    ["docs/plugins/with-new-plugin.js", "module.exports = (config) => config;"],
    ["docs/app.config.js", "module.exports = () => ({ name: 'x' });"],
    ["docs/app.json", "{\"expo\":{}}"],
    ["docs/package.json", "{}"],
    ["docs/bun.lock", "{}"],
    ["docs/patches/expo-modules-jsi@57.1.1.patch", "diff"],
    ["packages/canvas-blur/android/src/main/Frost.kt", "class Frost2"],
  ];
  let last = first;
  for (const [path, text] of changes) {
    write(path, text);
    const next = nativeFingerprint(root);
    expect(next).not.toBe(last);
    last = next;
  }
});

// docs/metro.config.js evaluated for real, with Expo's default config stood in by a stub
// (the docs' own dependencies are not installed where the unit tests run in CI).
function metroCacheVersion(env: Record<string, string | undefined>): string {
  const file = resolve(docs, "metro.config.js");
  const source = readFileSync(file, "utf8");
  const module = { exports: {} as { cacheVersion: string } };
  const stubs: Record<string, unknown> = {
    "expo/metro-config": { getDefaultConfig: () => ({ cacheVersion: "expo", resolver: { blockList: [] }, server: {} }) },
    "./scripts/dev-documents.cjs": { createDevDocumentMiddleware: () => () => undefined },
  };
  const load = (name: string) => (name in stubs ? stubs[name] : createRequire(file)(name));
  runInNewContext(source, { require: load, module, __dirname: docs, process: { ...process, env: { ...process.env, ...env } } });
  return module.exports.cacheVersion;
}

test("the audit flag is part of Metro's transform cache key", () => {
  // Expo inlines the flag into a production transform and does not key the cache on it,
  // so without this a flagged bundle could reuse an ordinary transform, or the reverse.
  const plain = metroCacheVersion({ EXPO_PUBLIC_CANVAS_AUDIT: undefined });
  const audit = metroCacheVersion({ EXPO_PUBLIC_CANVAS_AUDIT: "1" });
  expect(plain).not.toBe(audit);
  expect(plain.startsWith("expo:canvas-")).toBe(true);
  expect(metroCacheVersion({ EXPO_PUBLIC_CANVAS_AUDIT: "0" })).toBe(plain);
});

test("only the exact flag selects the audit build", () => {
  for (const value of ["0", "true", "", "yes"]) {
    process.env.CANVAS_AUDIT_BUILD = value;
    expect(appConfig({ config: base }).ios.bundleIdentifier).toBe("com.nannier.canvas");
  }
});
