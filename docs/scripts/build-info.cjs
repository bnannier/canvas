// Build identity is independent of the home page's latest-published npm badge.
// Expo evaluates this for development manifests and production exports alike.
const { execFileSync } = require("node:child_process");
const { createHash } = require("node:crypto");
const { existsSync, readdirSync, readFileSync } = require("node:fs");
const { join, relative } = require("node:path");

function sourceFingerprint(root) {
  const hash = createHash("sha256");
  function visit(directory) {
    if (!existsSync(directory)) return;
    for (const entry of readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const file = join(directory, entry.name);
      if (entry.isDirectory()) visit(file);
      else if (entry.isFile()) {
        hash.update(relative(root, file)).update("\0").update(readFileSync(file)).update("\0");
      }
    }
  }
  for (const directory of ["src", "styles", "docs/src"]) visit(join(root, directory));
  for (const name of ["package.json", "bun.lock", "docs/package.json", "docs/bun.lock", "docs/app.json", "docs/app.config.js", "docs/metro.config.js"]) {
    const file = join(root, name);
    if (existsSync(file)) hash.update(name).update("\0").update(readFileSync(file)).update("\0");
  }
  return hash.digest("hex");
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

module.exports = { readBuildInfo, sourceFingerprint };
