/**
 * Docs coverage report: which kit components the docs and the platform
 * catalog actually cover. Three comparisons, all text-parsed so the script
 * runs under plain bun (importing the kit pulls react-native):
 *
 *   1. kit dirs (src/<tier>/<dir>/) vs docs registry entries
 *      (docs/src/core/data/components.ts, matching dir ?? slug)
 *   2. docs components vs PLATFORM-REFERENCES.md catalog rows
 *   3. the platform-skin registry guard (docs/scripts/check-platform-skins.ts)
 *
 * Informational by default (gaps are work items, not failures); --strict
 * exits 1 when class 1 or 3 report anything, since those are real holes.
 *
 * Usage: bun scripts/check-docs-coverage.ts [--strict]
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

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

const componentsTs = readFileSync(join(ROOT, "docs/src/core/data/components.ts"), "utf8");
// Each entry: { slug: "x", ... } with an optional dir: "y" override.
const docsDirs = new Set<string>();
const docsNames = new Set<string>();
for (const m of componentsTs.matchAll(/\{\s*slug:\s*"([^"]+)"([^}]*)\}/g)) {
  const slug = m[1]!;
  const dir = m[2]!.match(/dir:\s*"([^"]+)"/)?.[1];
  docsDirs.add(dir ?? slug);
  docsNames.add(slug);
}

const undocumented = [...kitDirs].filter((d) => !docsDirs.has(d)).sort();
const phantomDocs = [...docsDirs].filter((d) => !kitDirs.has(d)).sort();

// --- 2. docs components vs PLATFORM-REFERENCES.md rows ---------------------

const refs = readFileSync(join(ROOT, "PLATFORM-REFERENCES.md"), "utf8");
const refNames = new Set<string>();
for (const line of refs.split("\n")) {
  if (!line.startsWith("|")) continue;
  const cells = line.split("|").map((c) => c.trim());
  if (cells.length < 7 || cells[1] === "Component" || /^-+$/.test(cells[1] ?? "")) continue;
  // Strip parentheticals: "stepper-control (+/-)" -> "stepper-control".
  const name = (cells[1] ?? "").split(" (")[0]!.toLowerCase().replace(/\s+/g, "-");
  if (name) refNames.add(name);
}
const noCatalogRow = [...docsNames].filter((s) => !refNames.has(s)).sort();

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

console.log(`kit component dirs: ${kitDirs.size}; docs registry entries: ${docsNames.size}`);
console.log(
  undocumented.length === 0
    ? "1. every kit component has a docs entry"
    : `1. kit components WITHOUT a docs page (${undocumented.length}): ${undocumented.join(", ")}`,
);
if (phantomDocs.length > 0) {
  console.log(`   docs entries without a kit dir (${phantomDocs.length}): ${phantomDocs.join(", ")}`);
}
console.log(
  `2. docs components without a PLATFORM-REFERENCES row (${noCatalogRow.length}): ` +
    (noCatalogRow.length ? noCatalogRow.join(", ") : "none") +
    "\n   (row-less components are judged as plausibly-native, never against invented specs)",
);
console.log(`3. platform-skin registry guard: ${skinsOk ? "clean" : "FAILING"}`);
if (!skinsOk) console.log(skinsOut.trim().split("\n").slice(0, 10).join("\n"));

const hardGaps = undocumented.length + phantomDocs.length + (skinsOk ? 0 : 1);
if (strict && hardGaps > 0) process.exit(1);
