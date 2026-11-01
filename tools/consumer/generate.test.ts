import { afterEach, expect, test } from "bun:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { generateRecipes, recipeFiles } from "./generate.mjs";

const temporary: string[] = [];
afterEach(() => { for (const dir of temporary.splice(0)) fs.rmSync(dir, { recursive: true, force: true }); });

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "canvas-consumer-assets-"));
  temporary.push(root);
  const source = path.join(root, "examples/recipes");
  fs.mkdirSync(path.join(source, "src"), { recursive: true });
  for (const name of ["App.tsx", "app.config.js", "babel.config.js", "recipe-config.json", "tsconfig.json", "src/screen.tsx"]) fs.writeFileSync(path.join(source, name), "{}\n");
  fs.writeFileSync(path.join(source, "package.json"), JSON.stringify({ name: "recipes", private: true, license: "UNLICENSED", dependencies: { "@nannier/canvas": "4.0.0" } }));
  return { root, source };
}

test("consumer assets exclude installs, native builds, locks, tests and private files", () => {
  const { root, source } = fixture();
  for (const dir of ["node_modules", "ios", "android", "tests", "test-results"]) {
    fs.mkdirSync(path.join(source, dir));
    fs.writeFileSync(path.join(source, dir, "private.txt"), "must not ship");
  }
  fs.writeFileSync(path.join(source, ".env"), "not-a-real-secret");
  fs.writeFileSync(path.join(source, "bun.lock"), "test lock");
  const files = recipeFiles(root);
  expect(Object.keys(files).sort()).toEqual(["App.tsx", "README.md", "app.config.js", "babel.config.js", "gitignore", "package.json", "recipe-config.json", "src/screen.tsx", "tsconfig.json"].sort());
  expect(JSON.parse(files["package.json"].toString()).dependencies["@nannier/canvas"]).toBe("4.0.0");
  expect(fs.readFileSync(path.join(source, "package.json"), "utf8")).toContain("UNLICENSED");
});

test("drift detects edited and unexpected files and generation restores the owned artifact", () => {
  const { root, source } = fixture();
  const first = generateRecipes(root);
  expect(generateRecipes(root, true)).toEqual(first);
  fs.writeFileSync(path.join(source, "src/screen.tsx"), "changed source\n");
  expect(() => generateRecipes(root, true)).toThrow("Consumer scaffold drift");
  expect(generateRecipes(root).sourceHash).not.toBe(first.sourceHash);
  const extra = path.join(root, "consumer/recipes/accidental.txt");
  fs.writeFileSync(extra, "must not ship");
  expect(() => generateRecipes(root, true)).toThrow("accidental.txt");
  generateRecipes(root);
  expect(fs.existsSync(extra)).toBe(false);
});

test("recipe source links cannot pull unrelated files into the package", () => {
  const { root, source } = fixture();
  fs.writeFileSync(path.join(root, "outside.txt"), "private");
  fs.symlinkSync(path.join(root, "outside.txt"), path.join(source, "src/linked.ts"));
  expect(() => recipeFiles(root)).toThrow("Recipe source must not be linked");
});
