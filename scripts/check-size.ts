import { readdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, relative } from "node:path";
import { gzipSync } from "node:zlib";

const ROOT = join(import.meta.dir, "..");
const STYLES_DIR = join(ROOT, "styles");

// Core (component + pattern + token) CSS budget.
const CORE_MAX_TOTAL_GZIP = 30_720;
const CORE_MAX_FILE_GZIP = 2_048;

// Per-file exceptions to the 2KB rule above. That rule was written when `styles/` held
// ~25 per-component stylesheets (button.css, dialog.css, and so on), where 2KB is a
// generous ceiling for one component's rules. That layer is gone: since "Ship design
// tokens as plain CSS", `styles/` is nine per-concern token files, and they are not
// interchangeable in size. Listing the one structural outlier here keeps the 2KB guard
// live on the other eight (colors.css sits at ~2.0KB, so it still bites) instead of
// raising the global constant, which would blind the check for all nine at once.
const CORE_FILE_GZIP_OVERRIDES: Record<string, number> = {
  // platforms.css is the whole --p-* web hand-off in one file: three complete skin
  // tables (web / iOS 26 / Material 3, ~1,950 declarations) plus the prose naming each
  // group's upstream `*.styles.ts`. Splitting it per platform was considered and
  // rejected. The three tables share so much vocabulary that separate shards gzip to
  // ~18.1KB against ~15.9KB together, so the split costs bytes; no shard lands near 2KB
  // anyway (the smallest is ~5.6KB); canvas.css imports all three regardless ("Link this
  // one file"); `styles/*` is a public export path, so moving the file breaks anyone
  // importing it directly; and the docs and the design mirror flip `data-platform` at
  // runtime, so they need all three loaded at once. Measured at 15,915B gzip, so 20KB
  // leaves roughly the same 1.3x headroom the JS budget carries: enough for more skin
  // tokens, tight enough to catch a doubling. It also trips before the 30KB total does,
  // so a regression names the file rather than the whole layer.
  "styles/tokens/platforms.css": 20_480,
};

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
  "@shopify/react-native-skia",
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
  overrides: Record<string, number> = {},
): boolean {
  const budgetFor = (path: string) => overrides[path] ?? maxFile;
  const totalRaw = files.reduce((s, f) => s + f.raw, 0);
  const totalGzip = files.reduce((s, f) => s + f.gzip, 0);

  console.log(`\n${label}`);
  console.log("=".repeat(label.length) + "\n");
  console.log(`${"File".padEnd(50)} ${"Raw".padStart(8)} ${"Gzip".padStart(8)}`);
  console.log("-".repeat(68));

  const oversized: FileSize[] = [];
  for (const f of files) {
    const flag = f.gzip > budgetFor(f.path) ? " !" : "";
    console.log(`${f.path.padEnd(50)} ${(f.raw + "B").padStart(8)} ${(f.gzip + "B").padStart(8)}${flag}`);
    if (f.gzip > budgetFor(f.path)) oversized.push(f);
  }

  console.log("-".repeat(68));
  console.log(`${"Total".padEnd(50)} ${(totalRaw + "B").padStart(8)} ${(totalGzip + "B").padStart(8)}`);
  console.log(`Budget: ${maxTotal}B gzip total, ${maxFile}B gzip per file`);
  for (const [path, budget] of Object.entries(overrides)) {
    console.log(`  except ${path}: ${budget}B gzip (justified in check-size.ts)`);
  }

  let failed = false;
  if (totalGzip > maxTotal) {
    console.log(`\n${label} total gzip ${totalGzip}B exceeds budget ${maxTotal}B`);
    failed = true;
  }
  if (oversized.length) {
    console.log(`\n${oversized.length} ${label} file(s) exceed their per-file budget:`);
    for (const f of oversized) console.log(`  ${f.path} (${f.gzip}B > ${budgetFor(f.path)}B)`);
    failed = true;
  }

  // An override whose file was renamed or deleted is dead config: the file itself would
  // fall back to the default and fail loudly, but the stale entry would sit here reading
  // as a live exemption. Catch it here rather than at the next person to read the table.
  const known = new Set(files.map((f) => f.path));
  const stale = Object.keys(overrides).filter((path) => !known.has(path));
  if (stale.length) {
    console.log(`\n${stale.length} per-file budget override(s) name a file that no longer exists:`);
    for (const path of stale) console.log(`  ${path}`);
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

const cssFailed = report("Core CSS", sizes, CORE_MAX_TOTAL_GZIP, CORE_MAX_FILE_GZIP, CORE_FILE_GZIP_OVERRIDES);

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
