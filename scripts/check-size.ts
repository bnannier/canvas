import { readdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, relative } from "node:path";
import { gzipSync } from "node:zlib";

const ROOT = join(import.meta.dir, "..");
const STYLES_DIR = join(ROOT, "styles");

// Core (component + pattern + token) CSS budget.
const CORE_MAX_TOTAL_GZIP = 30_720;
const CORE_MAX_FILE_GZIP = 2_048;

// The shipped JavaScript budget: the whole kit, bundled with react / react-native /
// react-native-svg and the optional peers externalized (what a consumer's bundler
// resolves from the outside), minified and gzipped. Measured at ~104KB gzip; the
// budget is set with headroom to allow growth but catch an accidental doubling.
const JS_MAX_GZIP = 138_240; // 135 KB

// The optional/required peers a consumer resolves from the outside, excluded from
// the kit's own JS size the same way their `import`s leave the bundle.
const JS_EXTERNALS = [
  "react",
  "react-native",
  "react-native-svg",
  "react-native-qrcode-svg",
  "react-native-safe-area-context",
  "expo-blur",
  "expo-glass-effect",
];

interface FileSize {
  path: string;
  raw: number;
  gzip: number;
}

async function collectCSSFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await collectCSSFiles(full)));
    else if (entry.name.endsWith(".css")) files.push(full);
  }
  return files;
}

function report(
  label: string,
  files: FileSize[],
  maxTotal: number,
  maxFile: number,
): boolean {
  const totalRaw = files.reduce((s, f) => s + f.raw, 0);
  const totalGzip = files.reduce((s, f) => s + f.gzip, 0);

  console.log(`\n${label}`);
  console.log("=".repeat(label.length) + "\n");
  console.log(`${"File".padEnd(50)} ${"Raw".padStart(8)} ${"Gzip".padStart(8)}`);
  console.log("-".repeat(68));

  const oversized: string[] = [];
  for (const f of files) {
    const flag = f.gzip > maxFile ? " !" : "";
    console.log(`${f.path.padEnd(50)} ${(f.raw + "B").padStart(8)} ${(f.gzip + "B").padStart(8)}${flag}`);
    if (f.gzip > maxFile) oversized.push(f.path);
  }

  console.log("-".repeat(68));
  console.log(`${"Total".padEnd(50)} ${(totalRaw + "B").padStart(8)} ${(totalGzip + "B").padStart(8)}`);
  console.log(`Budget: ${maxTotal}B gzip total, ${maxFile}B gzip per file`);

  let failed = false;
  if (totalGzip > maxTotal) {
    console.log(`\n${label} total gzip ${totalGzip}B exceeds budget ${maxTotal}B`);
    failed = true;
  }
  if (oversized.length) {
    console.log(`\n${oversized.length} ${label} file(s) exceed the per-file budget:`);
    for (const f of oversized) console.log(`  ${f}`);
    failed = true;
  }
  return failed;
}

const files = await collectCSSFiles(STYLES_DIR);
const sizes: FileSize[] = [];

for (const file of files) {
  const content = await readFile(file);
  sizes.push({
    path: relative(ROOT, file),
    raw: content.length,
    gzip: gzipSync(content).length,
  });
}

sizes.sort((a, b) => b.gzip - a.gzip);

const cssFailed = report("Core CSS", sizes, CORE_MAX_TOTAL_GZIP, CORE_MAX_FILE_GZIP);

// ---- Shipped JavaScript budget --------------------------------------------------
// Bundle the built kit the way a consumer's bundler would (externals resolved from
// the outside), minify, and gzip. Skips gracefully if dist is not built yet.
async function checkJs(): Promise<boolean> {
  const entry = join(ROOT, "dist", "index.js");
  if (!existsSync(entry)) {
    console.log("\nJavaScript\n==========\n\ndist/index.js not found — run `bun run build` first; skipping JS budget.");
    return false;
  }
  const built = await Bun.build({
    entrypoints: [entry],
    minify: true,
    target: "browser",
    external: JS_EXTERNALS,
  });
  if (!built.success || built.outputs.length === 0) {
    console.log("\nJavaScript\n==========\n\nBundle failed:");
    for (const log of built.logs) console.log(`  ${log}`);
    return true;
  }
  const bytes = new Uint8Array(await built.outputs[0].arrayBuffer());
  const raw = bytes.length;
  const gzip = gzipSync(bytes).length;
  console.log("\nJavaScript\n==========\n");
  console.log(`${"Bundle".padEnd(50)} ${(raw + "B").padStart(10)} ${(gzip + "B").padStart(10)}`);
  console.log(`Budget: ${JS_MAX_GZIP}B gzip (externals: ${JS_EXTERNALS.join(", ")})`);
  if (gzip > JS_MAX_GZIP) {
    console.log(`\nJS bundle gzip ${gzip}B exceeds budget ${JS_MAX_GZIP}B`);
    return true;
  }
  return false;
}

const jsFailed = await checkJs();

const grandRaw = sizes.reduce((s, f) => s + f.raw, 0);
const grandGzip = sizes.reduce((s, f) => s + f.gzip, 0);
console.log(`\nCSS grand total (informational): ${grandRaw}B raw, ${grandGzip}B gzip`);

if (!cssFailed && !jsFailed) console.log("\nSize check passed.");
else process.exit(1);
