/**
 * Docs coverage report: which kit components the docs and the platform
 * catalog actually cover. Three comparisons, run under plain bun (the docs
 * catalog is data, and nothing here imports the kit, which pulls react-native):
 *
 *   1. kit dirs (src/<tier>/<dir>/) vs docs registry entries
 *      (docs/src/core/data/components.ts, matching dir ?? slug)
 *   2. docs components vs PLATFORM-REFERENCES.md catalog rows, mapped the way
 *      every catalog reader maps them (tools/skins/references.ts: the aliased
 *      rows and the one charts row)
 *   3. the platform-skin registry guard (docs/scripts/check-platform-skins.ts)
 *
 * Informational by default (gaps are work items, not failures); --strict
 * exits 1 when any class reports anything, since those are real holes.
 *
 * Usage: bun scripts/check-docs-coverage.ts [--strict]
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { COMPONENTS } from "../docs/src/core/data/components.ts";
import { referenceKeyFor, referenceRows } from "../tools/skins/references.ts";

const ROOT = join(import.meta.dir, "..");
const TIERS = ["atoms", "molecules", "organisms", "charts"] as const;
const strict = process.argv.includes("--strict");

// --- 1. kit dirs vs docs registry -----------------------------------------

const kitDirs = new Set<string>();
for (const tier of TIERS) {
  const base = join(ROOT, "src", tier);
  for (const entry of readdirSync(base)) {
    const p = join(base, entry);
    if (statSync(p).isDirectory() && entry !== "shared") kitDirs.add(entry);
  }
}

const docsDirs = new Set(COMPONENTS.map((c) => c.dir ?? c.slug));

const undocumented = [...kitDirs].filter((d) => !docsDirs.has(d)).sort();
const phantomDocs = [...docsDirs].filter((d) => !kitDirs.has(d)).sort();

// --- 2. docs components vs PLATFORM-REFERENCES.md rows ---------------------

const rows = referenceRows(readFileSync(join(ROOT, "PLATFORM-REFERENCES.md"), "utf8"));
const keys = new Set(rows.map((row) => row.key));
const noCatalogRow = COMPONENTS.filter((c) => referenceKeyFor(c.slug, c.category, keys) === null)
  .map((c) => c.slug)
  .sort();

// --- 3. the platform-skin registry guard ------------------------------------

let skinsOk = true;
let skinsOut = "";
try {
  skinsOut = execFileSync("bun", [join(ROOT, "docs/scripts/check-platform-skins.ts")], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
} catch (e) {
  skinsOk = false;
  skinsOut = String((e as { stdout?: string }).stdout ?? (e as Error).message);
}

// --- report -----------------------------------------------------------------

console.log(`kit component dirs: ${kitDirs.size}; docs registry entries: ${COMPONENTS.length}`);
console.log(
  undocumented.length === 0
    ? "1. every kit component has a docs entry"
    : `1. kit components WITHOUT a docs page (${undocumented.length}): ${undocumented.join(", ")}`,
);
if (phantomDocs.length > 0) {
  console.log(`   docs entries without a kit dir (${phantomDocs.length}): ${phantomDocs.join(", ")}`);
}
console.log(`2. docs components without a PLATFORM-REFERENCES row (${noCatalogRow.length}): ${noCatalogRow.length ? noCatalogRow.join(", ") : "none"}`);
console.log(`3. platform-skin registry guard: ${skinsOk ? "clean" : "FAILING"}`);
if (!skinsOk) console.log(skinsOut.trim().split("\n").slice(0, 10).join("\n"));

const hardGaps = undocumented.length + phantomDocs.length + noCatalogRow.length + (skinsOk ? 0 : 1);
if (strict && hardGaps > 0) process.exit(1);
