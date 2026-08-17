import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { brandColors, lightColors } from "../src/style/tokens.ts";

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

// The token layer IS the published web API, so most tokens are referenced by
// consumers rather than by this CSS: a per-token orphan list would be ~900
// lines of noise. Only the count is reported, and it never fails the build.
if (orphaned.length) {
  console.log(`\nTokens defined for consumers (not referenced within the CSS itself): ${orphaned.length}`);
}

if (undefined_.length) {
  console.log(`\nUndefined tokens (referenced but never defined): ${undefined_.length}`);
  for (const t of undefined_) console.log(`  --${t}`);
  failed = true;
}

// Every token file must be reachable from the entry point, or its tokens ship
// dead: the manifest is the only thing linking them, and a new file is easy to
// add and forget.
const entry = await readFile(join(STYLES_DIR, "canvas.css"), "utf-8");
const imported = new Set([...entry.matchAll(/@import\s+"\.\/tokens\/([\w-]+\.css)"/g)].map((m) => m[1]));
const onDisk = (await readdir(join(STYLES_DIR, "tokens"))).filter((f) => f.endsWith(".css"));
const unimported = onDisk.filter((f) => !imported.has(f)).sort();
if (unimported.length) {
  console.log(`\nToken files never imported by styles/canvas.css: ${unimported.length}`);
  for (const f of unimported) console.log(`  tokens/${f}`);
  failed = true;
}

// Cross-check the CSS token layer against the JS token source of truth
// (src/style/tokens.ts): every JS color token must have a matching `--<name>` in
// the CSS, or a web consumer cannot reach a color the native components have.
// This is the guard the audit found missing (success/warning existed in JS but
// not the CSS).
const cssValueTokens = new Set(defined);
const missingInCss = Object.keys(lightColors).filter((k) => !cssValueTokens.has(k)).sort();
if (missingInCss.length) {
  console.log(`\nColor tokens in src/style/tokens.ts but MISSING from styles/canvas.css: ${missingInCss.length}`);
  for (const k of missingInCss) console.log(`  --${k}`);
  failed = true;
}

// Same cross-check for the fixed brand constants (the orb / avatar-gradient
// colors). They do not flip with the scheme, so they live in their own JS export
// rather than the light/dark pair, and their keys ARE the CSS names: a key here
// with no `--name` in the CSS means a JS consumer and a web consumer would be
// painting the brand from different sources.
const brandMissingInCss = Object.keys(brandColors).filter((k) => !cssValueTokens.has(k)).sort();
if (brandMissingInCss.length) {
  console.log(`\nBrand tokens in src/style/tokens.ts but MISSING from styles/canvas.css: ${brandMissingInCss.length}`);
  for (const k of brandMissingInCss) console.log(`  --${k}`);
  failed = true;
}

console.log(`\nTokens: ${defined.size} defined, ${referenced.size} referenced; ${Object.keys(lightColors).length} JS color tokens + ${Object.keys(brandColors).length} JS brand tokens cross-checked`);
if (!failed) console.log("Token validation passed.");
else process.exit(1);
