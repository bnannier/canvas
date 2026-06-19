// Link the source-only Canvas library into this app's node_modules as a LIVE symlink,
// so Metro bundles the real source (edits to ../src reflect immediately) rather than a
// stale copy.
//
// We do this with a symlink instead of a `file:` dependency because bun (and npm)
// COPY `file:` directory deps, which would freeze a snapshot — the docs must render
// the live library they document. This is isolated to this app (no Bun workspace,
// no change to the root package). Runs as `postinstall`. (The generated docs core now
// lives in-tree at src/core and is imported relatively, so it needs no symlink.)
import { symlinkSync, rmSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = resolve(projectRoot, "..");

// `@olympusoss/canvas` resolves through the repo-root package.json (main/exports →
// src/index.ts).
const links = [
  ["node_modules/@olympusoss/canvas", repoRoot],
];

for (const [rel, target] of links) {
  const linkPath = resolve(projectRoot, rel);
  rmSync(linkPath, { recursive: true, force: true });
  mkdirSync(dirname(linkPath), { recursive: true });
  symlinkSync(target, linkPath, "dir");
  console.log(`linked ${rel} -> ${target}`);
}
