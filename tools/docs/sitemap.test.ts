import { afterEach, expect, test } from "bun:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { sitemapPaths, writeSitemap } from "../../docs/scripts/sitemap.mjs";

const temporary: string[] = [];
afterEach(() => { for (const dir of temporary.splice(0)) fs.rmSync(dir, { recursive: true, force: true }); });

test("canonical sitemap routes deduplicate indexes and exclude internal exports", () => {
  expect(sitemapPaths(["index.html", "components/button.html", "components/button/index.html", "privacy/index.html", "404.html", "+not-found.html", "testing/dialog/index.html", "(home)/index.html", "components/[slug].html", "_expo/test.html", "assets/test.html", "ai/4.0.0/index.md", "ai/4.0.0/components/button.md", "ai/4.0.0/catalog.json", "agents.md", "recipes.md", "README.md", "recipes/private.md", "testing/recipes.md", "assets/recipes.md"])).toEqual(["/", "/agents.md", "/ai/4.0.0/components/button.md", "/ai/4.0.0/index.md", "/components/button", "/privacy", "/recipes.md"]);
});

test("sitemap is deterministic and includes only files in the export", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "canvas-sitemap-"));
  temporary.push(dir);
  fs.mkdirSync(path.join(dir, "ai/4.0.0"), { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), "<main>Canvas</main>");
  fs.writeFileSync(path.join(dir, "ai/4.0.0/index.md"), "# Canvas\n");
  fs.writeFileSync(path.join(dir, "a&b.html"), "<main>Example</main>");
  fs.writeFileSync(path.join(dir, "agents.md"), "# Agent guide\n");
  fs.writeFileSync(path.join(dir, "recipes.md"), "# Public recipes\n");
  expect(writeSitemap(dir)).toBe(5);
  const first = fs.readFileSync(path.join(dir, "sitemap.xml"), "utf8");
  expect(first).toContain("https://canvas.nannier.com/a&amp;b");
  expect(first).toContain("https://canvas.nannier.com/agents.md");
  expect(first).toContain("https://canvas.nannier.com/recipes.md");
  expect(first).not.toContain("lastmod");
  writeSitemap(dir);
  expect(fs.readFileSync(path.join(dir, "sitemap.xml"), "utf8")).toBe(first);
  expect(() => writeSitemap(dir, "http://example.com")).toThrow("HTTPS origin");
});
