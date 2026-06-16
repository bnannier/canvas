// Link the source-only Canvas library and the generated docs core into this app's
// node_modules as LIVE symlinks, so Metro bundles the real source (edits to ../src
// or ../docs-core reflect immediately) rather than a stale copy.
//
// We do this with symlinks instead of a `file:` dependency because bun (and npm)
// COPY `file:` directory deps, which would freeze a snapshot — the docs must render
// the live library they document. This is isolated to docs-next (no Bun workspace,
// no change to the root package or the existing Vite docs). Runs as `postinstall`.
import { symlinkSync, rmSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = resolve(projectRoot, "..");

// `@olympusoss/canvas` resolves through the repo-root package.json (main/exports →
// src/index.ts); `docs-core` is the generated registry package.
const links = [
  ["node_modules/@olympusoss/canvas", repoRoot],
  ["node_modules/docs-core", resolve(repoRoot, "docs-core")],
];

for (const [rel, target] of links) {
  const linkPath = resolve(projectRoot, rel);
  rmSync(linkPath, { recursive: true, force: true });
  mkdirSync(dirname(linkPath), { recursive: true });
  symlinkSync(target, linkPath, "dir");
  console.log(`linked ${rel} -> ${target}`);
}
