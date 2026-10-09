// Build identity is independent of the home page's latest-published npm badge.
// Expo evaluates this for development manifests and production exports alike.
const { execFileSync } = require("node:child_process");
const { createHash } = require("node:crypto");
const { existsSync, readdirSync, readFileSync } = require("node:fs");
const { join, relative } = require("node:path");

// Every file under the named directories and the named files, by path and bytes, in a
// fixed order. A directory entry whose name is in `skip` is left out, so build products
// sitting inside a source tree do not count.
function fingerprint(root, { directories, files, skip = new Set() }) {
  const hash = createHash("sha256");
  function visit(directory) {
    if (!existsSync(directory)) return;
    for (const entry of readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      if (skip.has(entry.name)) continue;
      const file = join(directory, entry.name);
      if (entry.isDirectory()) visit(file);
      else if (entry.isFile()) {
        hash.update(relative(root, file)).update("\0").update(readFileSync(file)).update("\0");
      }
    }
  }
  for (const directory of directories) visit(join(root, directory));
  for (const name of files) {
    const file = join(root, name);
    if (existsSync(file)) hash.update(name).update("\0").update(readFileSync(file)).update("\0");
  }
  return hash.digest("hex");
}

function sourceFingerprint(root) {
  return fingerprint(root, {
    directories: ["src", "styles", "docs/src", "examples/starter/smoke/fixtures"],
    files: ["package.json", "bun.lock", "docs/package.json", "docs/bun.lock", "docs/app.json", "docs/app.config.js", "docs/metro.config.js"],
  });
}

// What a native build of the docs app is made from beyond its bundle: the app config and
// the config plugins `expo prebuild` generates the native project from, the dependency
// manifest, lockfile and patches that decide the native code under node_modules, and the
// local native modules autolinked from packages/ (docs/package.json `nativeModulesDir`),
// their build products and installs left out. The component audit's build stamps it
// (tools/audit/native/build.ts) and its capture host refuses an app whose stamp is not
// this checkout's, the native half of what sourceFingerprint is for the JS.
const NATIVE_BUILD_PRODUCTS = new Set(["node_modules", "dist", "build", ".gradle", ".cxx", ".kotlin"]);

function nativeFingerprint(root) {
  return fingerprint(root, {
    directories: ["docs/plugins", "docs/patches", "packages"],
    files: ["docs/app.json", "docs/app.config.js", "docs/package.json", "docs/bun.lock"],
    skip: NATIVE_BUILD_PRODUCTS,
  });
}

function repositoryRevision(root, environment) {
  // This is local inspection only. Hook selectors must never redirect it to
  // another checkout, and no Git transport/auth environment is needed.
  const env = Object.fromEntries(Object.entries(environment).filter(([name]) => !name.startsWith("GIT_")));
  const git = (...args) => execFileSync("git", args, {
    cwd: root, encoding: "utf8", env: { ...env, GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_NOSYSTEM: "1" },
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
  if (!existsSync(join(root, ".git"))) return { revision: null, dirty: null };
  return { revision: git("rev-parse", "HEAD"), dirty: git("status", "--porcelain", "--untracked-files=normal") !== "" };
}

function readBuildInfo(root, environment = process.env, inspect = repositoryRevision) {
  const { revision, dirty } = inspect(root, environment);
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  const sourceRevision = environment.SOURCE_SHA || revision;
  if (sourceRevision !== null && !/^[a-f0-9]{40}$/.test(sourceRevision)) throw new Error("Invalid source revision for Canvas docs");
  return {
    schema: 1,
    sourceRevision,
    candidateRevision: revision,
    sourceDirty: dirty,
    sourceFingerprint: sourceFingerprint(root),
    packageName: pkg.name,
    packageVersion: pkg.version,
    inputMode: "source",
  };
}

module.exports = { readBuildInfo, sourceFingerprint, nativeFingerprint };
