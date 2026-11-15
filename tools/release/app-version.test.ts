import { afterEach, expect, test } from "bun:test";
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { verifyAppVersion } from "../../scripts/verify-app-version.mjs";

const temporary: string[] = [];
afterEach(() => { for (const root of temporary.splice(0)) rmSync(root, { recursive: true, force: true }); });

test("Expo follows the candidate's package bump despite stale static config, in ordinary and audit builds", () => {
  const root = mkdtempSync(join(tmpdir(), "canvas-app-version-"));
  temporary.push(root);
  mkdirSync(join(root, "docs/scripts"), { recursive: true });
  for (const file of ["docs/app.config.js", "docs/scripts/build-info.cjs"]) copyFileSync(resolve(file), join(root, file));
  const appConfig = createRequire(join(root, "package.json"))(join(root, "docs/app.config.js"));
  const before = process.env.CANVAS_AUDIT_BUILD;
  try {
    for (const version of ["4.4.0", "4.5.0", "5.0.0"]) {
      writeFileSync(join(root, "package.json"), JSON.stringify({ name: "@nannier/canvas", version }));
      for (const audit of ["0", "1"]) {
        process.env.CANVAS_AUDIT_BUILD = audit;
        const config = appConfig({ config: { version: "1.0.0", runtimeVersion: { policy: "appVersion" } } });
        expect(config.version).toBe(version);
        expect(verifyAppVersion({ version }, { version }, config)).toBe(version);
      }
    }
  } finally {
    if (before === undefined) delete process.env.CANVAS_AUDIT_BUILD;
    else process.env.CANVAS_AUDIT_BUILD = before;
  }
});

test("native release gate rejects stale app versions, mismatched candidates, prereleases and stale runtimes", () => {
  const pkg = { version: "4.5.0" };
  const config = { version: "4.5.0", runtimeVersion: { policy: "appVersion" } };
  expect(() => verifyAppVersion(pkg, pkg, { ...config, version: "1.0.0" })).toThrow("refusing to queue EAS");
  expect(() => verifyAppVersion(pkg, { version: "4.4.0" }, config)).toThrow("release candidate");
  expect(() => verifyAppVersion(pkg, pkg, { ...config, runtimeVersion: "1.0.0" })).toThrow("runtimeVersion");
  for (const version of ["4.5.0-beta.1", "4.5", "04.5.0", undefined]) {
    expect(() => verifyAppVersion({ version }, pkg, config)).toThrow("stable Canvas package version");
  }
});

test("both native jobs verify resolved Expo config after restoring the candidate and before EAS", () => {
  type Step = { run?: string; "continue-on-error"?: boolean; if?: string };
  const workflow = Bun.YAML.parse(readFileSync(resolve(".github/workflows/deploy.yml"), "utf8")) as {
    jobs: Record<string, { steps: Step[] }>;
  };
  for (const platform of ["ios", "android"]) {
    const steps = workflow.jobs[platform]!.steps;
    const restore = steps.findIndex((step) => step.run?.includes("release.mjs restore"));
    const verify = steps.findIndex((step) => step.run?.includes("verify-app-version.mjs"));
    const build = steps.findIndex((step) => step.run?.includes("eas build"));
    expect(restore).toBeGreaterThanOrEqual(0);
    expect(verify).toBeGreaterThan(restore);
    expect(build).toBeGreaterThan(verify);
    expect(steps[verify]!.run).toContain("expo config --type public --json");
    expect(steps[verify]!.run).toContain('"$RUNNER_TEMP/candidate" "$RUNNER_TEMP/expo-config.json"');
    expect(steps[verify]!["continue-on-error"]).toBeUndefined();
    expect(steps[verify]!.if).toBeUndefined();
  }
});
