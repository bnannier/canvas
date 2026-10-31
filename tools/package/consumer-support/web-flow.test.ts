import { expect, test } from "bun:test";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runInNewContext } from "node:vm";
import { build } from "esbuild";
import { reactNativeWebFlowPlugin } from "./web-flow.mjs";

test("RN Babel preprocessing preserves a Flow asset registry's register/get runtime", async () => {
  const root = mkdtempSync(join(tmpdir(), "canvas-web-flow-"));
  const consumerRequire = createRequire(import.meta.url);
  try {
    const registry = join(root, "node_modules/@react-native/assets-registry");
    mkdirSync(registry, { recursive: true });
    // The raw Flow constructs shipped by RN 0.74, with a functional registry.
    writeFileSync(join(registry, "registry.js"), `// @flow strict
      export type PackagerAsset = { +name: string, ... };
      const assets: Array<PackagerAsset> = [];
      function registerAsset(asset: PackagerAsset): number { return assets.push(asset); }
      function getAssetByID(assetId: number): PackagerAsset { return assets[assetId - 1]; }
      module.exports = { registerAsset, getAssetByID };
    `);
    const options = { absWorkingDir: root, entryPoints: [join(registry, "registry.js")], bundle: true, write: false, platform: "node" as const, format: "cjs" as const, logLevel: "silent" as const };
    await expect(build(options)).rejects.toThrow();
    const result = await build({ ...options, plugins: [reactNativeWebFlowPlugin(consumerRequire)] });
    const context = { module: { exports: {} as { registerAsset(asset: { name: string }): number; getAssetByID(id: number): { name: string } | undefined } } };
    runInNewContext(result.outputFiles[0]!.text, context);
    const asset = { name: "consumer-image" };
    const id = context.module.exports.registerAsset(asset);
    expect(id).toBe(1);
    expect(context.module.exports.getAssetByID(id)).toBe(asset);
    expect(context.module.exports.getAssetByID(id + 1)).toBeUndefined();
  } finally { rmSync(root, { recursive: true, force: true }); }
});
