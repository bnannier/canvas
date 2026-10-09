import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { COMPONENTS } from "../docs/src/core/data/components";
import { checkPublicApi } from "../tools/api/check";
import { discoverPublicApi } from "../tools/api/discover";
import { docsPages } from "../tools/api/docs";
import { entryPoints, files, publicApi } from "../tools/api/manifest";

const root = resolve(import.meta.dir, "..");
const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8")) as { name: string; exports: Record<string, unknown> };

function filesUnder(directory: string): string[] {
  return readdirSync(resolve(root, directory), { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? filesUnder(`${directory}/${entry.name}`) : [`${directory}/${entry.name}`]);
}

// A `files` entry point is a directory wildcard mapped onto the same directory
// (`"./styles/*": "./styles/*"`), so a file's repo path is also its import subpath. Node's
// `*` matches across slashes, so every file below the directory is reachable.
const entryPointFiles: Record<string, string[]> = {};
for (const [point, shape] of Object.entries(entryPoints)) {
  if (shape !== "files" || !(point in pkg.exports)) continue;
  const directory = /^\.\/(.+)\/\*$/.exec(point)?.[1];
  if (!directory || pkg.exports[point] !== point) throw new Error(`Entry point ${point}: tools/api reads only a "./dir/*" wildcard mapped to the same "./dir/*"`);
  entryPointFiles[point] = filesUnder(directory).sort();
}

const result = checkPublicApi(
  { packageName: pkg.name, exports: discoverPublicApi(root), packageEntryPoints: Object.keys(pkg.exports), entryPointFiles, pages: docsPages(root, COMPONENTS) },
  { entryPoints, publicApi, files },
);
if (process.argv.includes("--json")) console.log(JSON.stringify(result, null, 2));
else {
  const kinds = Object.entries(result.kinds).map(([kind, count]) => `${count} ${kind}`).join(", ");
  console.log(`Public API: ${result.entryPoints} entry points, ${result.exports} exports of "." (${kinds}), ${result.files} files under the file entry points.`);
  console.log(`Docs: ${result.documented} exports named on their docs page, ${result.undocumented} recorded as undocumented.`);
  for (const error of result.errors) console.error(error);
}
if (result.errors.length) process.exitCode = 1;
