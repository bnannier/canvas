import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { lightColors } from "../src/style/tokens.ts";

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

const defined = new Set<string>();
const referenced = new Set<string>();

const defPattern = /--([\w-]+)\s*:/g;
const refPattern = /var\(\s*--([\w-]+)/g;

for (const file of files) {
  const css = await readFile(file, "utf-8");
  for (const m of css.matchAll(defPattern)) defined.add(m[1]);
  for (const m of css.matchAll(refPattern)) referenced.add(m[1]);
}

const orphaned = [...defined].filter((t) => !referenced.has(t)).sort();
const undefined_ = [...referenced].filter((t) => !defined.has(t)).sort();

let failed = false;

if (orphaned.length) {
  console.log(`\nOrphaned tokens (defined but never referenced): ${orphaned.length}`);
  for (const t of orphaned) console.log(`  --${t}`);
}

if (undefined_.length) {
  console.log(`\nUndefined tokens (referenced but never defined): ${undefined_.length}`);
  for (const t of undefined_) console.log(`  --${t}`);
  failed = true;
}

// Cross-check the CSS utility layer against the JS token source of truth
// (src/style/tokens.ts): every JS color token must have a matching `--<name>` in
// canvas.css, or web consumers cannot get its `bg-*`/`text-*` utility. This is the
// guard the audit found missing (success/warning existed in JS but not the CSS).
// The `--color-*` Tailwind theme aliases are excluded (they map onto the values).
const cssValueTokens = new Set([...defined].filter((t) => !t.startsWith("color-")));
const missingInCss = Object.keys(lightColors).filter((k) => !cssValueTokens.has(k)).sort();
if (missingInCss.length) {
  console.log(`\nColor tokens in src/style/tokens.ts but MISSING from styles/canvas.css: ${missingInCss.length}`);
  for (const k of missingInCss) console.log(`  --${k}`);
  failed = true;
}

console.log(`\nTokens: ${defined.size} defined, ${referenced.size} referenced; ${Object.keys(lightColors).length} JS color tokens cross-checked`);
if (!failed) console.log("Token validation passed.");
else process.exit(1);
