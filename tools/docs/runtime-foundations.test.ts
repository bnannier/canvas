import { afterEach, expect, test } from "bun:test";
import { mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
const { readBuildInfo, sourceFingerprint, sourceDirty, SOURCE_INPUTS } = require("../../docs/scripts/build-info.cjs");
const { execFileSync } = require("node:child_process");
const appConfig = require("../../docs/app.config.js");
const temporary: string[] = [];
afterEach(() => { for (const root of temporary.splice(0)) rmSync(root, { recursive: true, force: true }); });

test("runtime identity changes with source bytes and preserves candidate versus source revisions", () => {
  const root = mkdtempSync(join(tmpdir(), "canvas-build-info-"));
  temporary.push(root);
  mkdirSync(join(root, "src"));
  writeFileSync(join(root, "package.json"), JSON.stringify({ name: "@nannier/canvas", version: "2.62.1" }));
  writeFileSync(join(root, "src/index.ts"), "export const value = 1;");
  const inspect = () => ({ revision: "b".repeat(40), dirty: true });
  const first = readBuildInfo(root, { SOURCE_SHA: "a".repeat(40) }, inspect);
  expect(first.sourceRevision).toBe("a".repeat(40));
  expect(first.candidateRevision).toBe("b".repeat(40));
  expect(first.sourceDirty).toBe(true);
  expect(first.packageVersion).toBe("2.62.1");
  expect(first.inputMode).toBe("source");
  expect(sourceFingerprint(root)).toBe(first.sourceFingerprint);
  writeFileSync(join(root, "src/index.ts"), "export const value = 2;");
  expect(sourceFingerprint(root)).not.toBe(first.sourceFingerprint);
  const beforeFixture = sourceFingerprint(root);
  mkdirSync(join(root, "examples/starter/smoke/fixtures"), { recursive: true });
  writeFileSync(join(root, "examples/starter/smoke/fixtures/control-refs.tsx"), "export const fixture = 'shared';");
  expect(sourceFingerprint(root)).not.toBe(beforeFixture);
  expect(() => readBuildInfo(root, { SOURCE_SHA: "not-a-revision" }, inspect)).toThrow("Invalid source revision");
});

test("the source is dirty only when a path the source fingerprint reads differs from the commit", () => {
  const root = mkdtempSync(join(tmpdir(), "canvas-source-dirty-"));
  temporary.push(root);
  const env = Object.fromEntries(Object.entries(process.env).filter(([name]) => !name.startsWith("GIT_")));
  const git = (...args: string[]) => execFileSync("git", args, { cwd: root, env: { ...env, GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_NOSYSTEM: "1" }, stdio: "ignore" });
  mkdirSync(join(root, "src"));
  mkdirSync(join(root, "audit/turns"), { recursive: true });
  writeFileSync(join(root, "package.json"), JSON.stringify({ name: "@nannier/canvas", version: "2.62.1" }));
  writeFileSync(join(root, "src/index.ts"), "export const value = 1;");
  writeFileSync(join(root, "audit/README.md"), "# Audit");
  git("init", "-q");
  git("add", "-A");
  git("-c", "user.name=t", "-c", "user.email=t@example.com", "commit", "-q", "-m", "init");
  expect(sourceDirty(root)).toBe(false);
  // A turn record, a checklist or a tool is not the source a build or a capture is made from.
  writeFileSync(join(root, "audit/turns/radio.md"), "# Turn record: Radio");
  writeFileSync(join(root, "audit/README.md"), "# Audit, changed");
  expect(sourceDirty(root)).toBe(false);
  expect(readBuildInfo(root, {}).sourceDirty).toBe(false);
  // A change, an addition or a deletion under the source fingerprint's paths is.
  writeFileSync(join(root, "src/index.ts"), "export const value = 2;");
  expect(sourceDirty(root)).toBe(true);
  git("checkout", "--", "src/index.ts");
  writeFileSync(join(root, "src/extra.ts"), "export const extra = 1;");
  expect(sourceDirty(root)).toBe(true);
  rmSync(join(root, "src/extra.ts"));
  expect(sourceDirty(root)).toBe(false);
  rmSync(join(root, "package.json"));
  expect(sourceDirty(root)).toBe(true);
  // One list of paths for both, so they never disagree about what the source is.
  expect(SOURCE_INPUTS.directories).toContain("docs/src");
  expect(SOURCE_INPUTS.files).toContain("bun.lock");
});

test("every docs testing route belongs to a declared native tab stack", () => {
  const root = resolve(import.meta.dir, "../..");
  const app = join(root, "docs/src/app");
  const nav = JSON.parse(readFileSync(join(root, "docs/src/data/nav.config.json"), "utf8"));
  const groups = new Set(nav.mobile.tabs.map((tab: { id: string }) => `(${tab.id})`));
  const fixtures = readdirSync(app, { recursive: true }).map(String).filter((name) => /(?:^|\/)testing\/.*\.tsx$/.test(name));
  expect(fixtures.length).toBeGreaterThanOrEqual(4);
  for (const fixture of fixtures) expect(groups.has(fixture.split("/")[0])).toBe(true);
});

test("build diagnostics preserve existing app configuration and subpath exports", () => {
  const previous = process.env.EXPO_BASE_URL;
  try {
    process.env.EXPO_BASE_URL = "/canvas";
    const actual = appConfig({ config: { name: "Canvas", experiments: { typedRoutes: true }, extra: { example: "retained" } } });
    expect(actual.name).toBe("Canvas");
    expect(actual.experiments).toEqual({ typedRoutes: true, baseUrl: "/canvas" });
    expect(actual.extra.example).toBe("retained");
    expect(actual.extra.canvasBuild.inputMode).toBe("source");
  } finally {
    if (previous === undefined) delete process.env.EXPO_BASE_URL;
    else process.env.EXPO_BASE_URL = previous;
  }
});
