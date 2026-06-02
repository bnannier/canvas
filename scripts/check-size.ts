import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { gzipSync } from "node:zlib";

const ROOT = join(import.meta.dir, "..");
const STYLES_DIR = join(ROOT, "styles");

// Core (component + pattern + token) CSS keeps the original guardrail untouched so
// the utility layer can never mask component bloat.
const CORE_MAX_TOTAL_GZIP = 30_720;
const CORE_MAX_FILE_GZIP = 2_048;

// The generated layout utilities (styles/utilities/) get their own budget. Sized
// from the measured first run (~5.1KB gzip summed, largest file ~1.3KB) with
// headroom for growth, but tight enough to catch an accidental explosion.
const UTILITIES_MAX_TOTAL_GZIP = 8_192;
const UTILITIES_MAX_FILE_GZIP = 3_072;

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

function isUtility(path: string): boolean {
  return path.startsWith("styles/utilities/") || path.startsWith("styles\\utilities\\");
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

const core = sizes.filter((f) => !isUtility(f.path));
const utilities = sizes.filter((f) => isUtility(f.path));

const coreFailed = report("Core CSS", core, CORE_MAX_TOTAL_GZIP, CORE_MAX_FILE_GZIP);
const utilFailed = utilities.length
  ? report("Utilities CSS", utilities, UTILITIES_MAX_TOTAL_GZIP, UTILITIES_MAX_FILE_GZIP)
  : false;

const grandRaw = sizes.reduce((s, f) => s + f.raw, 0);
const grandGzip = sizes.reduce((s, f) => s + f.gzip, 0);
console.log(`\nGrand total (informational): ${grandRaw}B raw, ${grandGzip}B gzip`);

if (!coreFailed && !utilFailed) console.log("\nSize check passed.");
else process.exit(1);
