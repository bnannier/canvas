import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

const source = readFileSync(new URL("../../examples/starter/app.config.js", import.meta.url), "utf8");

function config(env: Record<string, string> = {}) {
  const module = { exports: {} as { expo: { ios: { bundleIdentifier: string }; scheme: string; extra?: { canvasBuild?: unknown } } } };
  runInNewContext(source, { process: { env }, module });
  return module.exports.expo;
}

describe("starter configuration", () => {
  it("is the plain example app: no smoke identity, build ID or routes, whatever the environment", () => {
    for (const env of [{}, { CANVAS_SMOKE_IDENTITY: "not valid JSON" }, { EXPO_PUBLIC_CANVAS_SMOKE: "1" }]) {
      const starter = config(env);
      expect(starter.ios.bundleIdentifier).toBe("com.nannier.canvas.starter");
      expect(starter.scheme).toBe("canvas-starter");
      expect(starter.extra?.canvasBuild).toBeUndefined();
    }
  });
});
