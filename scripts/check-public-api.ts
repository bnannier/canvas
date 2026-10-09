import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { COMPONENTS } from "../docs/src/core/data/components";
import { checkPublicApi } from "../tools/api/check";
import { discoverPublicApi } from "../tools/api/discover";
import { docsPages } from "../tools/api/docs";
import { entryPoints, files, PENDING_DOCS, publicApi } from "../tools/api/manifest";
import { packedFiles } from "../tools/api/packed";
import { SNAPSHOT_FILE, surfaceOf } from "../tools/api/snapshot";
import { materialCoverage } from "../tools/materials/manifest";

const root = resolve(import.meta.dir, "..");
const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8")) as { name: string; exports: Record<string, unknown> };

// A `files` entry point is a directory wildcard mapped onto the same directory
// (`"./styles/*": "./styles/*"`), so a file's repo path is also its import subpath. Node's
// `*` matches across slashes, so every file npm packs below the directory is reachable.
const entryPointFiles: Record<string, string[]> = {};
for (const [point, shape] of Object.entries(entryPoints)) {
  if (shape !== "files" || !(point in pkg.exports)) continue;
  const directory = /^\.\/(.+)\/\*$/.exec(point)?.[1];
  if (!directory || pkg.exports[point] !== point) throw new Error(`Entry point ${point}: tools/api reads only a "./dir/*" wildcard mapped to the same "./dir/*"`);
  entryPointFiles[point] = packedFiles(root, directory);
}

const exports = discoverPublicApi(root);
if (process.argv.includes("--write-snapshot")) {
  writeFileSync(resolve(root, SNAPSHOT_FILE), `${JSON.stringify(surfaceOf(exports.web), null, 2)}\n`);
  console.log(`Wrote ${SNAPSHOT_FILE}: ${exports.web.length} exports of ".".`);
}

const result = checkPublicApi(
  {
    packageName: pkg.name,
    exports,
    packageEntryPoints: Object.keys(pkg.exports),
    entryPointFiles,
    pages: docsPages(root, COMPONENTS),
    materialRoutes: new Map(materialCoverage.map((entry) => [entry.name, entry.docsRoute])),
  },
  { entryPoints, publicApi, files, pendingDocs: PENDING_DOCS },
);
if (process.argv.includes("--json")) console.log(JSON.stringify(result, null, 2));
else {
  const kinds = Object.entries(result.kinds).map(([kind, count]) => `${count} ${kind}`).join(", ");
  console.log(`Public API: ${result.entryPoints} entry points, ${result.exports} exports of "." (${kinds}), ${result.files} files under the file entry points.`);
  console.log(`Docs: ${result.documented} exports named on their docs page; ${result.pending} exports and files staged in PENDING_DOCS until the foundation reference lands.`);
  for (const error of result.errors) console.error(error);
}
if (result.errors.length) process.exitCode = 1;
