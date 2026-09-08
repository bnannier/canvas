import { expect, it } from "bun:test";
import { resolve } from "node:path";
import ts from "typescript";

it("accepts legacy complete ColorTokens literals and the optional foreground role", () => {
  const root = resolve(import.meta.dir, "..");
  const program = ts.createProgram({
    rootNames: [resolve(import.meta.dir, "fixtures/primary-text-consumer.ts")],
    options: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      strict: true, skipLibCheck: true, noEmit: true, types: [],
    },
  });
  expect(ts.formatDiagnostics(ts.getPreEmitDiagnostics(program), {
    getCurrentDirectory: () => root,
    getCanonicalFileName: name => name,
    getNewLine: () => "\n",
  })).toBe("");
});
