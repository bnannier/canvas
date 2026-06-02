import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";

const STYLES_DIR = join(import.meta.dir, "..", "styles");

async function collectCSSFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await collectCSSFiles(full)));
    else if (entry.name.endsWith(".css")) files.push(full);
  }
  return files;
}

const files = await collectCSSFiles(STYLES_DIR);
const classMap = new Map<string, string[]>();

const classPattern = /^\s*\.([\w-]+)/gm;

for (const file of files) {
  const rel = relative(join(import.meta.dir, ".."), file);
  if (rel === "styles/canvas.css") continue;
  // The utility layer is generated, single-source-per-class, and uses escaped
  // selectors (.md\:flex) that this simple regex would mis-parse into false
  // "sm/md/lg/xl" duplicates. The generator + CI sync check already guarantee
  // its integrity, so it is not a useful target for this hand-authored check.
  if (rel.startsWith("styles/utilities/") || rel.startsWith("styles\\utilities\\")) continue;
  const css = await readFile(file, "utf-8");
  for (const m of css.matchAll(classPattern)) {
    const cls = m[1];
    const list = classMap.get(cls) || [];
    if (!list.includes(rel)) list.push(rel);
    classMap.set(cls, list);
  }
}

const duplicates = [...classMap.entries()]
  .filter(([, files]) => files.length > 1)
  .sort(([a], [b]) => a.localeCompare(b));

if (duplicates.length) {
  console.log(`Found ${duplicates.length} class(es) defined in multiple files:\n`);
  for (const [cls, files] of duplicates) {
    console.log(`  .${cls}`);
    for (const f of files) console.log(`    ${f}`);
  }
  console.log("\nNote: some duplicates are intentional (pattern overrides).");
} else {
  console.log("No duplicate class definitions found.");
}
