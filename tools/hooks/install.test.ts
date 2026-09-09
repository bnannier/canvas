import { afterEach, describe, expect, test } from "bun:test";
import {
  chmodSync,
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const sourceRoot = fileURLToPath(new URL("../../", import.meta.url));
const manifest = JSON.parse(readFileSync(join(sourceRoot, "package.json"), "utf8"));
const huskyRoot = resolve(fileURLToPath(import.meta.resolve("husky")), "..");
const temporaryRoots: string[] = [];

afterEach(() => {
  for (const root of temporaryRoots.splice(0)) rmSync(root, { recursive: true, force: true });
});

function environment(root: string, overrides: Record<string, string> = {}) {
  // A test run started by a real Git hook can inherit GIT_DIR and friends.
  // Keep every fixture command confined to its own disposable repository.
  return {
    ...Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith("GIT_"))),
    CI: "",
    HUSKY: "",
    NODE_ENV: "",
    npm_config_production: "",
    npm_config_omit: "",
    GIT_CONFIG_GLOBAL: "/dev/null",
    GIT_CONFIG_NOSYSTEM: "1",
    XDG_CONFIG_HOME: join(root, "config"),
    BUN_INSTALL_CACHE_DIR: join(root, "cache"),
    ...overrides,
  };
}

function run(cwd: string, command: string, args: string[], overrides: Record<string, string> = {}) {
  const result = Bun.spawnSync([command, ...args], {
    cwd,
    env: environment(cwd, overrides),
    stdin: "ignore",
    stdout: "pipe",
    stderr: "pipe",
    timeout: 20_000,
  });
  return { status: result.exitCode, stdout: result.stdout.toString(), stderr: result.stderr.toString() };
}

function succeed(cwd: string, command: string, args: string[], overrides: Record<string, string> = {}) {
  const result = run(cwd, command, args, overrides);
  expect(result.status, `${command} ${args.join(" ")}\n${result.stdout}\n${result.stderr}`).toBe(0);
  return result.stdout.trim();
}

function fixture() {
  const root = mkdtempSync(join(tmpdir(), "canvas-hooks-"));
  temporaryRoots.push(root);
  const repo = join(root, "checkout");
  mkdirSync(join(repo, ".husky"), { recursive: true });
  cpSync(huskyRoot, join(root, "husky"), { recursive: true });
  cpSync(join(sourceRoot, ".husky/install.mjs"), join(repo, ".husky/install.mjs"));
  cpSync(join(sourceRoot, ".husky/pre-push"), join(repo, ".husky/pre-push"));
  writeFileSync(join(repo, "package.json"), JSON.stringify({
    name: "canvas-hook-fixture",
    version: "0.0.0",
    scripts: { prepare: manifest.scripts.prepare },
    files: manifest.files,
    devDependencies: { husky: "file:../husky" },
  }));
  writeFileSync(join(repo, ".gitignore"), "node_modules/\ncache/\nconfig/\n");
  succeed(repo, "git", ["init", "-b", "main"]);
  succeed(repo, "git", ["config", "user.name", "Hook Fixture"]);
  succeed(repo, "git", ["config", "user.email", "hook-fixture@example.invalid"]);
  return { root, repo };
}

function install(repo: string, overrides: Record<string, string> = {}, args: string[] = []) {
  succeed(repo, process.execPath, ["install", "--registry", "http://127.0.0.1:9", ...args], overrides);
}

function assertUnconfigured(repo: string) {
  expect(run(repo, "git", ["config", "--local", "--get", "core.hooksPath"]).status).toBe(1);
  expect(existsSync(join(repo, ".husky/_/pre-push"))).toBe(false);
}

function fakeChecks(repo: string) {
  const bin = join(repo, "node_modules/.bin");
  mkdirSync(bin, { recursive: true });
  const script = `#!/bin/sh
printf '%s\\n' "$*" >> "$HOOK_TEST_LOG"
if [ "\${HOOK_TEST_FAIL-}" = "$*" ]; then exit 23; fi
exit 0
`;
  for (const name of ["bun", "bunx"]) {
    writeFileSync(join(bin, name), script);
    chmodSync(join(bin, name), 0o755);
  }
}

function remote(root: string, repo: string) {
  const origin = join(root, "origin.git");
  succeed(root, "git", ["init", "--bare", origin]);
  succeed(repo, "git", ["remote", "add", "origin", origin]);
  succeed(repo, "git", ["add", ".husky", ".gitignore", "package.json", "bun.lock"]);
  succeed(repo, "git", ["commit", "-m", "Add hook fixture"]);
  return origin;
}

describe("development hook installation", () => {
  test("a fresh install repairs the old absolute path and survives moving the checkout", () => {
    const { root, repo } = fixture();
    succeed(repo, "git", ["config", "core.hooksPath", "/missing/previous-checkout/.husky/_"]);
    install(repo);
    expect(succeed(repo, "git", ["config", "--get", "core.hooksPath"])).toBe(".husky/_");
    expect(existsSync(join(repo, ".husky/_/pre-push"))).toBe(true);
    const origin = remote(root, repo);
    const moved = join(root, "moved checkout");
    renameSync(repo, moved);
    fakeChecks(moved);
    const log = join(root, "checks.log");
    succeed(moved, "git", ["push", "origin", "HEAD:main"], { HOOK_TEST_LOG: log });
    expect(succeed(origin, "git", ["rev-parse", "main"]))
      .toBe(succeed(moved, "git", ["rev-parse", "HEAD"]));
    const checks = readFileSync(log, "utf8").trim().split("\n");
    expect(checks[0]).toBe("run typecheck");
    expect(checks.indexOf("run build")).toBeLessThan(checks.indexOf("run verify-package"));
    expect(checks.indexOf("run verify-package")).toBeLessThan(checks.indexOf("run test"));
    expect(checks.at(-2)).toBe("tsc --noEmit -p docs/src/core/tsconfig.json");
    // The docs app's own tsconfig is the LAST gate, and the one CI fails on: it
    // covers docs/src/app and docs/src/ui, which the core project above does not.
    expect(checks.at(-1)).toBe("run --cwd docs typecheck");
  });

  test("the first failing check blocks a real push before later successful checks", () => {
    const { root, repo } = fixture();
    install(repo);
    const origin = remote(root, repo);
    fakeChecks(repo);
    const log = join(root, "checks.log");
    const rejected = run(repo, "git", ["push", "origin", "HEAD:main"], {
      HOOK_TEST_LOG: log,
      HOOK_TEST_FAIL: "run typecheck",
    });
    expect(rejected.status).not.toBe(0);
    expect(readFileSync(log, "utf8")).toBe("run typecheck\n");
    expect(run(origin, "git", ["rev-parse", "--verify", "main"]).status).not.toBe(0);
    // Also lock fail-fast behavior when invoked directly, outside Husky's sh -e.
    const direct = run(repo, "sh", [".husky/pre-push"], {
      PATH: `${join(repo, "node_modules/.bin")}:${process.env.PATH}`,
      HOOK_TEST_LOG: log,
      HOOK_TEST_FAIL: "run typecheck",
    });
    expect(direct.status).toBe(23);
    expect(readFileSync(log, "utf8")).toBe("run typecheck\nrun typecheck\n");
  });

  test("linked worktrees install and execute their own relative hooks", () => {
    const { root, repo } = fixture();
    install(repo);
    remote(root, repo);
    const worktree = join(root, "linked");
    succeed(repo, "git", ["worktree", "add", "-b", "linked", worktree]);
    install(worktree);
    expect(succeed(worktree, "git", ["config", "--get", "core.hooksPath"])).toBe(".husky/_");
    fakeChecks(worktree);
    const log = join(root, "linked.log");
    succeed(worktree, "git", ["push", "origin", "HEAD:linked"], { HOOK_TEST_LOG: log });
    expect(readFileSync(log, "utf8")).toContain("run verify-package\n");
  });

  for (const [name, env] of [
    ["CI", { CI: "true" }],
    ["production", { NODE_ENV: "production" }],
    ["omitted development dependencies", { npm_config_omit: "dev optional" }],
    ["explicit Husky opt-out", { HUSKY: "0" }],
  ] as const) {
    test(`${name} skips hook configuration`, () => {
      const { repo } = fixture();
      install(repo, { ...env });
      assertUnconfigured(repo);
    });
  }

  test("production installation and absent development dependencies need no Husky", () => {
    const { repo } = fixture();
    install(repo, {}, ["--production"]);
    expect(existsSync(join(repo, "node_modules/husky"))).toBe(false);
    assertUnconfigured(repo);
    succeed(repo, process.execPath, ["run", "prepare"]);
    assertUnconfigured(repo);
  });

  test("source archives skip hooks even if Husky is installed", () => {
    const { repo } = fixture();
    rmSync(join(repo, ".git"), { recursive: true });
    install(repo);
    expect(existsSync(join(repo, "node_modules/husky"))).toBe(true);
    expect(existsSync(join(repo, ".husky/_/pre-push"))).toBe(false);
  });

  test("a packed consumer install has no installer or Husky and prepare stays safe", () => {
    const { root, repo } = fixture();
    mkdirSync(join(repo, "dist"));
    writeFileSync(join(repo, "dist/index.js"), "export {};\n");
    install(repo, { CI: "true" });
    const tarball = join(root, "canvas-fixture.tgz");
    succeed(repo, process.execPath, ["pm", "pack", "--ignore-scripts", "--filename", tarball]);
    const consumer = join(root, "consumer");
    mkdirSync(consumer);
    writeFileSync(join(consumer, "package.json"), JSON.stringify({
      private: true,
      dependencies: { "canvas-hook-fixture": `file:${tarball}` },
    }));
    install(consumer);
    const installed = join(consumer, "node_modules/canvas-hook-fixture");
    expect(existsSync(join(installed, ".husky"))).toBe(false);
    expect(existsSync(join(consumer, "node_modules/husky"))).toBe(false);
    succeed(installed, process.execPath, ["run", "prepare"]);
  });

  test("unexpected Git configuration errors fail prepare", () => {
    const { repo } = fixture();
    install(repo, { CI: "true" });
    writeFileSync(join(repo, ".git/config"), "[invalid config\n");
    const failed = run(repo, process.execPath, ["run", "prepare"]);
    expect(failed.status).not.toBe(0);
    expect(failed.stderr).toContain("Cannot install Canvas Git hooks");
    expect(existsSync(join(repo, ".husky/_/pre-push"))).toBe(false);
  });

  test("an installed but broken Husky dependency fails prepare", () => {
    const { root, repo } = fixture();
    install(repo, { CI: "true" });
    // Local file dependencies can be symlinked, so change the disposable source.
    writeFileSync(join(root, "husky/index.js"), "throw new Error('broken Husky fixture');\n");
    // Bun may install the local dependency as a copy instead of a symlink.
    writeFileSync(join(repo, "node_modules/husky/index.js"), "throw new Error('broken Husky fixture');\n");
    const failed = run(repo, process.execPath, ["run", "prepare"]);
    expect(failed.status).not.toBe(0);
    expect(failed.stderr).toContain("broken Husky fixture");
    expect(existsSync(join(repo, ".husky/_/pre-push"))).toBe(false);
  });
});
