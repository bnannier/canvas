import { afterAll, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { npmPacks, packedFiles } from "./packed";

const temporary: string[] = [];
afterAll(() => { for (const directory of temporary) rmSync(directory, { recursive: true, force: true }); });

function fixture(files: string[]): string {
  const root = mkdtempSync(join(tmpdir(), "canvas-packed-"));
  temporary.push(root);
  for (const path of files) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), "");
  }
  return root;
}

test("npm's never-packed names: Finder and editor litter, logs, credentials, VCS folders", () => {
  for (const name of [".DS_Store", "._canvas.css", ".canvas.css.swp", "canvas.css.orig", "npm-debug.log", ".npmrc"]) expect(npmPacks(name, false)).toBe(false);
  for (const name of [".git", ".svn", ".hg", "CVS", "node_modules"]) expect(npmPacks(name, true)).toBe(false);
  for (const name of ["canvas.css", "colors.css", ".canvas-notes.css"]) expect(npmPacks(name, false)).toBe(true);
  expect(npmPacks("tokens", true)).toBe(true);
});

test("the files a directory publishes are the ones npm packs, recursively and sorted", () => {
  const root = fixture([
    "styles/canvas.css",
    "styles/.DS_Store",
    "styles/tokens/colors.css",
    "styles/tokens/._colors.css",
    "styles/tokens/base.css",
    "styles/.git/HEAD",
  ]);
  expect(packedFiles(root, "styles")).toEqual(["styles/canvas.css", "styles/tokens/base.css", "styles/tokens/colors.css"]);
});

test("an ignore file below the package root stops the read instead of being guessed at", () => {
  const root = fixture(["styles/canvas.css", "styles/tokens/.npmignore"]);
  expect(() => packedFiles(root, "styles")).toThrow("styles/tokens/.npmignore: an ignore file below the package root changes what npm packs");
});
