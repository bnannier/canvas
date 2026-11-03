import { afterEach, expect, test } from "bun:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { stageRecipes } from "../../docs/scripts/prepare-recipes.mjs";

const temporary: string[] = [];
afterEach(() => { for (const dir of temporary.splice(0)) fs.rmSync(dir, { recursive: true, force: true }); });
function fixture() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "canvas-recipe-stage-"));
  temporary.push(dir);
  const source = path.join(dir, "export");
  const docs = path.join(dir, "docs");
  for (const folder of [source, docs]) fs.mkdirSync(folder);
  const write = (file: string, text: string) => { const target = path.join(source, file); fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, text); };
  write("index.html", '<html><head></head><body><div id="root"></div><script src="/recipes/_expo/static/js/web/AppEntry-a.js" defer></script></body></html>');
  write("_expo/static/js/web/AppEntry-a.js", 'const asset="/recipes/assets/node_modules/font/font.ttf";');
  write("assets/node_modules/font/font.ttf", "synthetic font");
  return { source, docs, write };
}
const provenance = { license: "npm distribution license\n", notice: { version: "4.1.0" } };

test("recipe stage isolates assets and notices, preserves docs, and removes stale artifacts", () => {
  const { source, docs } = fixture();
  fs.writeFileSync(path.join(docs, "index.html"), "existing docs");
  fs.mkdirSync(path.join(docs, "recipes"));
  fs.writeFileSync(path.join(docs, "recipes/stale.js"), "old");
  stageRecipes(source, docs, provenance);
  const read = (file: string) => fs.readFileSync(path.join(docs, file), "utf8");
  expect(read("index.html")).toBe("existing docs");
  expect(read("recipes/assets/vendor/font/font.ttf")).toBe("synthetic font");
  expect(read("recipes/_expo/static/js/web/AppEntry-a.js")).toContain("/recipes/assets/vendor/");
  expect(read("recipes/LICENSE.canvas.txt")).toBe(provenance.license);
  expect(read("recipes/index.html")).toContain('rel="license"');
  expect(fs.existsSync(path.join(docs, "recipes/stale.js"))).toBe(false);
  const first = read("recipes/index.html");
  stageRecipes(source, docs, provenance);
  expect(read("recipes/index.html")).toBe(first);
});

test("recipe stage refuses source, maps, map references, symlinks, inline scripts, and root assets before writing", () => {
  for (const unsafe of ["App.tsx", "source.zip", "_expo/static/js/web/AppEntry-a.js.map", "inline", "root", "mapref", "symlink"]) {
    const { source, docs, write } = fixture();
    if (unsafe === "inline") write("index.html", '<html><script>alert(1)</script></html>');
    else if (unsafe === "root") write("index.html", '<html><script src="/_expo/static/js/web/AppEntry-a.js"></script></html>');
    else if (unsafe === "mapref") write("_expo/static/js/web/AppEntry-a.js", "//# sourceMappingURL=private.map");
    else if (unsafe === "symlink") fs.symlinkSync(path.join(docs, "index.html"), path.join(source, "linked.js"));
    else write(unsafe, "private source");
    expect(() => stageRecipes(source, docs, provenance)).toThrow();
    expect(fs.existsSync(path.join(docs, "recipes"))).toBe(false);
  }
});
