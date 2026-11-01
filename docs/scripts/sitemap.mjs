import fs from "node:fs";
import path from "node:path";

const escapeXml = (value) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");

export function sitemapPaths(files) {
  const paths = new Set();
  for (const file of files) {
    const relative = file.split(path.sep).join("/");
    if (relative.split("/").some((part) => part.startsWith("_") || /[()[\]]/.test(part)) || /^(?:testing|assets|fonts)\//.test(relative)) continue;
    if (/^(?:404|\+not-found)\.html$/.test(relative)) continue;
    if (relative.endsWith(".html")) {
      const route = relative.replace(/(?:^|\/)index\.html$/, "").replace(/\.html$/, "").replace(/\/$/, "");
      paths.add(`/${route}`);
    } else if (/^ai\/[^/]+\/.+\.md$/.test(relative) || relative === "agents.md") paths.add(`/${relative}`);
  }
  return [...paths].sort();
}

export function writeSitemap(dist, origin = "https://canvas.nannier.com") {
  const base = new URL(origin);
  if (base.protocol !== "https:" || base.pathname !== "/" || base.search || base.hash) throw new Error("Sitemap origin must be an HTTPS origin");
  const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Sitemap cannot inspect linked output: ${file}`);
    return entry.isDirectory() ? walk(file) : [path.relative(dist, file)];
  });
  const routes = sitemapPaths(walk(dist));
  if (routes.length > 50_000) throw new Error("Sitemap needs splitting before exceeding 50,000 URLs");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.map((route) => `  <url><loc>${escapeXml(new URL(route, base).href)}</loc></url>`).join("\n")}\n</urlset>\n`;
  fs.writeFileSync(path.join(dist, "sitemap.xml"), xml);
  return routes.length;
}
