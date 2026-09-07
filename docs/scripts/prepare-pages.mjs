// Prepare the shared web artifact BEFORE browser tests. Wrangler skips every
// node_modules path, including Metro's bundled fonts, so use an uploadable name.
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  const file = path.join(dir, entry.name);
  if (entry.name === "node_modules") throw new Error(`Pages would skip ${file}`);
  return entry.isDirectory() ? walk(file) : [file];
});

export function preparePages(dist) {
  const hidden = path.join(dist, "assets/node_modules");
  if (fs.existsSync(hidden)) fs.renameSync(hidden, path.join(dist, "assets/vendor"));
  for (const file of walk(dist)) {
    if (!/\.(js|html|css|json)$/.test(file)) continue;
    const before = fs.readFileSync(file, "utf8");
    const after = before.replaceAll("assets/node_modules", "assets/vendor");
    if (after !== before) fs.writeFileSync(file, after);
  }
  for (const required of ["_redirects", "_headers", "privacy/index.html"]) {
    if (!fs.statSync(path.join(dist, required)).isFile()) throw new Error(`Missing ${required}`);
  }
  const html = fs.readFileSync(path.join(dist, "index.html"), "utf8");
  const fonts = [...html.matchAll(/<link\b[^>]*rel="preload"[^>]*as="font"[^>]*href="([^"]+)"[^>]*>/g)];
  if (!fonts.length) throw new Error("No font preloads in the artifact");
  for (const [, href] of fonts) {
    const file = path.resolve(dist, href.replace(/^\//, ""));
    if (!file.startsWith(path.resolve(dist) + path.sep) || !fs.statSync(file).isFile()) throw new Error(`Missing preloaded font: ${href}`);
  }
  console.log(`Pages artifact ready: ${fonts.length} font preloads resolve, SPA/privacy/headers present`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) preparePages(path.resolve(process.argv[2] ?? "dist"));
