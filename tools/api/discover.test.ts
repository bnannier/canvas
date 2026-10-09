import { afterAll, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import ts from "typescript";
import { entryProgram, moduleExports } from "./discover";

const repo = resolve(import.meta.dir, "../..");
const temporary: string[] = [];
afterAll(() => { for (const directory of temporary) rmSync(directory, { recursive: true, force: true }); });

function virtualProgram(source: string, siblings: Record<string, string> = {}) {
  // Inside the repo, so `react` resolves from its node_modules; the files never touch disk.
  const file = resolve(repo, "tools/api/virtual-entry.tsx");
  const sources = new Map([[file, source], ...Object.entries(siblings).map(([name, text]) => [resolve(repo, "tools/api", name), text] as const)]);
  const options: ts.CompilerOptions = { strict: true, skipLibCheck: true, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler, noEmit: true };
  const host = ts.createCompilerHost(options);
  const getSourceFile = host.getSourceFile.bind(host);
  const fileExists = host.fileExists.bind(host);
  host.fileExists = (path) => sources.has(path) || fileExists(path);
  host.getSourceFile = (path, languageVersion, onError, shouldCreateNewSourceFile) => sources.has(path)
    ? ts.createSourceFile(path, sources.get(path)!, languageVersion, true, ts.ScriptKind.TSX)
    : getSourceFile(path, languageVersion, onError, shouldCreateNewSourceFile);
  return { program: ts.createProgram([file], options, host), file };
}

test("export facts: values and types, named components, hooks and @deprecated tags", () => {
  const { program, file } = virtualProgram(`
    import * as React from "react";
    export const Panel = () => React.createElement("div");
    export function alpha(color: string) { return color; }
    export function useWidth() { return 0; }
    export const scale = { sm: 1 };
    export type Size = "sm" | "lg";
    export interface PanelProps { size?: Size }
    export const Context = React.createContext(false);
    /**
     * @deprecated Use \`scale\`.
     */
    // A line comment between the tag and the declaration, as status-hue.ts writes it.
    export const OLD_SCALE = { sm: 1 };
    const base = 1;
    /** @deprecated Use \`base\` through \`scale\`. */
    export { base as legacyBase };
  `);
  const facts = Object.fromEntries(moduleExports(program, file, repo).map(({ name, files: _files, summary: _summary, ...rest }) => [name, rest]));
  expect(facts.Panel).toEqual({ value: true, renderable: true, callable: false, deprecated: false });
  // A lowercase function that returns a string is React output, but not a named component.
  expect(facts.alpha).toEqual({ value: true, renderable: false, callable: true, deprecated: false });
  expect(facts.useWidth).toEqual({ value: true, renderable: false, callable: true, deprecated: false });
  expect(facts.scale).toEqual({ value: true, renderable: false, callable: false, deprecated: false });
  expect(facts.Size).toEqual({ value: false, renderable: false, callable: false, deprecated: false });
  expect(facts.PanelProps).toEqual({ value: false, renderable: false, callable: false, deprecated: false });
  // A React 19 context is callable but not a component.
  expect(facts.Context.renderable).toBe(false);
  expect(facts.OLD_SCALE.deprecated).toBe(true);
  expect(facts.legacyBase.deprecated).toBe(true);
});

test("a @deprecated re-export part way down the chain still marks the public name", () => {
  const { program, file } = virtualProgram(`export { legacy, current } from "./virtual-aliases";`, {
    "virtual-aliases.ts": `
      const current = 1;
      /** @deprecated Use \`current\`. */
      export { current as legacy };
      export { current };
    `,
  });
  const facts = Object.fromEntries(moduleExports(program, file, repo).map(({ name, deprecated }) => [name, deprecated]));
  expect(facts).toEqual({ current: false, legacy: true });
});

test("a JSDoc summary counts where hover shows it: on the declaration, never on a re-export or a tag alone", () => {
  const { program, file } = virtualProgram(`
    import * as React from "react";
    export { documented, undocumented, tagOnly, viaSpecifier } from "./virtual-docs";
    /** A panel. */
    export const Panel = () => React.createElement("div");
    export const Bare = () => React.createElement("div");
  `, {
    "virtual-docs.ts": `
      /** Documented on its declaration. */
      export const documented = 1;
      export const undocumented = 1;
      /** @remarks Only a tag. */
      export const tagOnly = 1;
      const hidden = 1;
      export {
        /** Written on the re-export, which hover through an entry never shows. */
        hidden as viaSpecifier,
      };
    `,
  });
  const facts = Object.fromEntries(moduleExports(program, file, repo).map(({ name, summary }) => [name, summary]));
  expect(facts).toEqual({ Bare: false, documented: true, Panel: true, tagOnly: false, undocumented: false, viaSpecifier: false });
});

test("the entry program resolves each platform's sibling files the way Metro does", () => {
  const root = mkdtempSync(join(tmpdir(), "canvas-api-"));
  temporary.push(root);
  mkdirSync(join(root, "src"));
  writeFileSync(join(root, "tsconfig.json"), JSON.stringify({ compilerOptions: { strict: true, module: "ESNext", moduleResolution: "bundler", target: "ES2022", noEmit: true } }));
  writeFileSync(join(root, "src/index.ts"), `export * from "./skin.js";\nexport * from "./plain.js";\n`);
  writeFileSync(join(root, "src/skin.ts"), "export const shared = 1;\nexport const webOnly = 1;\n");
  writeFileSync(join(root, "src/skin.ios.ts"), "export const shared = 1;\nexport const iosOnly = 1;\n");
  writeFileSync(join(root, "src/plain.ts"), "export const plain = 1;\n");
  writeFileSync(join(root, "src/plain.native.ts"), "export const plain = 1;\nexport const nativeOnly = 1;\n");
  const names = (resolution: "web" | "ios" | "android") =>
    moduleExports(entryProgram(root, resolution), join(root, "src/index.ts"), root).map(({ name }) => name);
  expect(names("web")).toEqual(["plain", "shared", "webOnly"]);
  expect(names("ios")).toEqual(["iosOnly", "nativeOnly", "plain", "shared"]);
  expect(names("android")).toEqual(["nativeOnly", "plain", "shared", "webOnly"]);
});
