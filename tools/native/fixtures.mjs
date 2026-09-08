import { constants, copyFileSync, existsSync, lstatSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

/** Install only reviewed fixture templates into a newly copied candidate app. */
export function installSmokeFixtures(app) {
  const manifest = JSON.parse(readFileSync(join(app, "smoke/manifest.json"), "utf8"));
  if (manifest.schema !== 1) throw new Error("Unsupported smoke fixture manifest");
  const copies = [];
  for (const [kind, destination] of [["fixtures", "src/testing"], ["routes", "src/app/testing"]]) {
    const names = manifest[kind];
    if (!Array.isArray(names) || !names.length || new Set(names).size !== names.length
      || names.some((name) => typeof name !== "string"
        || (name !== "_layout" && /^[a-z][a-z0-9-]*/.exec(name)?.[0] !== name))) {
      throw new Error(`Invalid smoke ${kind} manifest`);
    }
    for (const name of names) {
      const source = join(app, "smoke", kind, `${name}.tsx`);
      const target = join(app, destination, `${name}.tsx`);
      if (!lstatSync(source).isFile()) throw new Error(`Smoke source must be a regular file: ${source}`);
      if (existsSync(target)) throw new Error(`Smoke target already exists: ${target}`);
      copies.push({ source, target });
    }
  }
  for (const { source, target } of copies) {
    mkdirSync(dirname(target), { recursive: true });
    copyFileSync(source, target, constants.COPYFILE_EXCL);
  }
}
