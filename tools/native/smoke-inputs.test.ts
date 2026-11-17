import { expect, test } from "bun:test";
import { readFileSync, statSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { createRequire } from "node:module";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import { SMOKE_DOCS_INPUTS } from "../../scripts/native-smoke.mjs";

test("the isolated smoke app includes and watches every relative docs module its sources import", () => {
  const root = resolve(import.meta.dir, "../..");
  const files = new Set<string>();
  for (const entry of ["smoke/src", ...SMOKE_DOCS_INPUTS]) {
    const directory = !entry.includes("*") && statSync(resolve(root, entry)).isDirectory();
    for (const file of new Bun.Glob(directory ? `${entry}/**/*` : entry).scanSync({ cwd: root, onlyFiles: true })) files.add(file);
  }
  // Evaluate our real Metro configuration with only Expo's baseline stubbed. A file
  // copied outside Metro's watched roots passes tsc but fails both web/native bundles.
  const module = { exports: {} as { watchFolders: string[] } };
  const require = createRequire(import.meta.url);
  runInNewContext(readFileSync(resolve(root, "smoke/metro.config.js"), "utf8"), {
    __dirname: resolve(root, "smoke"), module, process: { env: {} },
    require: (name: string) => name === "expo/metro-config" ? { getDefaultConfig: () => ({ resolver: {} }) } : require(name),
  });
  for (const file of files) {
    if (file.startsWith("docs/")) expect(module.exports.watchFolders.some(folder => resolve(root, file).startsWith(folder + "/")), file).toBe(true);
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
