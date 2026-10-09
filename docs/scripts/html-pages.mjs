// The exported documents, for the post-export scripts. A static export writes one
// HTML file per route (plus the route-group spellings prepare-pages.mjs prunes), and
// every script that rewrites the head or the scripts of "the page" has to touch all
// of them, not the index alone.
import fs from "node:fs";
import path from "node:path";

/** Every .html file under `dir`, depth first, as absolute paths. */
export function htmlPages(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) return htmlPages(file);
    return entry.name.endsWith(".html") ? [file] : [];
  });
}

/**
 * The pages the app rendered: the documents with an app root. The export also
 * carries the static Canvas policy from public/, which has no app root or bundle
 * and uses its own same-origin fonts. App-page rewrites must leave it alone.
 */
export function appPages(dir) {
  return htmlPages(dir).filter((page) => fs.readFileSync(page, "utf8").includes('id="root"'));
}
