import { expect, test } from "bun:test";
import { readFileSync, statSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import ts from "typescript";
import { SMOKE_DOCS_INPUTS } from "../../scripts/native-smoke.mjs";

test("the isolated smoke app includes every relative docs module its sources import", () => {
  const root = resolve(import.meta.dir, "../..");
  const files = new Set<string>();
  for (const entry of ["smoke/src", ...SMOKE_DOCS_INPUTS]) {
    const directory = !entry.includes("*") && statSync(resolve(root, entry)).isDirectory();
    for (const file of new Bun.Glob(directory ? `${entry}/**/*` : entry).scanSync({ cwd: root, onlyFiles: true })) files.add(file);
  }
  const missing: string[] = [];
  for (const file of files) {
    if (!/\.tsx?$/.test(file)) continue;
    for (const imported of ts.preProcessFile(readFileSync(resolve(root, file), "utf8")).importedFiles) {
      if (!imported.fileName.startsWith(".")) continue;
      const target = relative(root, resolve(root, dirname(file), imported.fileName)).replace(/\.js$/, "");
      const candidates = [target, ...[".ts", ".tsx", "/index.ts", "/index.tsx"].map(ext => target + ext)];
      if (!candidates.some(candidate => files.has(candidate))) missing.push(`${file} -> ${imported.fileName}`);
    }
  }
  expect(missing).toEqual([]);
});
