// Verifies the PUBLISHED ARTIFACT (dist/) is actually consumable — the check
// whose absence let a broken tarball ship for months (raw .ts with NodeNext
// ".js" specifiers that stock Metro cannot resolve; see the 2026-07 audit).
// Run after `bun run build`; wired into CI and prepublishOnly.
//
// Checks:
//  1. dist entry points exist (index.js + index.d.ts).
//  2. Every relative import/require specifier in every dist .js/.d.ts file
//     resolves to a real file (catches specifier/emit drift).
//  3. Platform forks survive the build (.ios.js / .android.js present).
//  4. No raw TypeScript leaks into dist.
//  5. dist .d.ts files don't reference DOM-only types in their public surface
//     (consumers without lib:DOM must typecheck; skipLibCheck covers .d.ts, but
//     type REFERENCES to DOM globals would still error in strict consumers).

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(REPO, "dist");

let failures = 0;
function fail(msg: string) {
  failures++;
  console.error(`  ✗ ${msg}`);
}
function ok(msg: string) {
  console.log(`  ✓ ${msg}`);
}

function walk(dir: string, out: string[] = []): string[] {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

// 1. Entry points
if (!fs.existsSync(path.join(DIST, "index.js")) || !fs.existsSync(path.join(DIST, "index.d.ts"))) {
  fail("dist/index.js + dist/index.d.ts missing — run `bun run build` first");
  process.exit(1);
}
ok("entry points exist (dist/index.js, dist/index.d.ts)");

const files = walk(DIST);
const jsFiles = files.filter((f) => f.endsWith(".js"));
const dtsFiles = files.filter((f) => f.endsWith(".d.ts"));

// 2. Relative-specifier resolution integrity
const SPEC_RE = /(?:from\s+|import\s*\(\s*|require\s*\(\s*)["'](\.\.?\/[^"']+)["']/g;
// Strip comments first: tsc copies doc comments (which may show example import
// lines) into the emitted output, and those must not count as real specifiers.
const stripComments = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
let specCount = 0;
let broken = 0;
for (const file of [...jsFiles, ...dtsFiles]) {
  const src = stripComments(fs.readFileSync(file, "utf8"));
  for (const m of src.matchAll(SPEC_RE)) {
    specCount++;
    const spec = m[1];
    const base = path.resolve(path.dirname(file), spec);
    // A ".js" specifier must resolve to that exact emitted file (platform forks
    // resolve at bundler level from the SAME base name, which also exists).
    const candidates = [base, `${base}.js`, `${base}.d.ts`, path.join(base, "index.js")];
    if (!candidates.some((c) => fs.existsSync(c))) {
      broken++;
      fail(`${path.relative(REPO, file)} → unresolvable specifier "${spec}"`);
    }
  }
}
if (broken === 0) ok(`${specCount} relative specifiers all resolve`);

// 2b. Optional peers must never be STATICALLY imported (an ES `import` statement).
// They are loaded through a guarded `require()` so a consumer who skips the peer
// still builds; a value import would crash their bundler at resolve time. Guarded
// require() calls and type-only imports (erased by tsc) are fine — only ES import
// statements referencing these bare specifiers are flagged.
const OPTIONAL_PEERS = [
  "@shopify/react-native-skia",
  "expo-blur",
  "expo-glass-effect",
  "react-native-qrcode-svg",
  "react-native-safe-area-context",
];
const PEER_IMPORT_RE = new RegExp(
  `import\\s+(?:[^;'"]*?\\sfrom\\s*)?["'](${OPTIONAL_PEERS.join("|")})["']`,
  "g",
);
let peerViolations = 0;
for (const file of jsFiles) {
  const src = stripComments(fs.readFileSync(file, "utf8"));
  for (const m of src.matchAll(PEER_IMPORT_RE)) {
    peerViolations++;
    fail(`${path.relative(REPO, file)} → static import of optional peer "${m[1]}" (use a guarded require())`);
  }
}
if (peerViolations === 0) ok(`no static imports of optional peers (${OPTIONAL_PEERS.length} checked)`);

// 2c. Each optional-peer require must sit DIRECTLY inside a try block.
//
// Not style. Metro's isOptionalDependency
// (metro/src/ModuleGraph/worker/collectDependencies.js) walks up from the require
// call and, at the FIRST enclosing block statement, returns whether that block
// belongs to a TryStatement. It does not keep climbing. So any statement that
// introduces a block between the try and the require, classically
// `if (typeof require === "function")`, makes Metro register a REQUIRED edge, and
// every consumer who skipped the peer fails to bundle with "Unable to resolve
// module". Check 2b above cannot catch it: the require is still a require.
//
// Verified against metro 0.84.4 by running the collector on both shapes: the
// guarded form reports optional=undefined, the hoisted form optional=true.
const OPTIONAL_REQUIRE_RE = new RegExp(`require\\(["'](${OPTIONAL_PEERS.join("|")})["']\\)`, "g");
let placementViolations = 0;
let requireSites = 0;
for (const file of jsFiles) {
  const src = stripComments(fs.readFileSync(file, "utf8"));
  for (const m of src.matchAll(OPTIONAL_REQUIRE_RE)) {
    requireSites++;
    // Walk back to the nearest `{`; the token sequence before it must be `try`.
    const before = src.slice(0, m.index);
    const brace = before.lastIndexOf("{");
    if (brace === -1 || !/\btry\s*$/.test(before.slice(0, brace))) {
      placementViolations++;
      fail(
        `${path.relative(REPO, file)} → require("${m[1]}") is not directly inside a try block. ` +
          `Metro will treat it as a REQUIRED dependency and break consumers without the peer.`,
      );
    }
  }
}
if (placementViolations === 0) ok(`optional-peer requires sit directly in a try block (${requireSites} checked)`);

// 3. Platform forks preserved
const iosForks = jsFiles.filter((f) => f.endsWith(".ios.js")).length;
const androidForks = jsFiles.filter((f) => f.endsWith(".android.js")).length;
if (iosForks === 0 || androidForks === 0) {
  fail(`platform forks missing from dist (ios: ${iosForks}, android: ${androidForks})`);
} else {
  ok(`platform forks preserved (${iosForks} .ios.js, ${androidForks} .android.js)`);
}

// 4. No raw TS in dist
const rawTs = files.filter((f) => /\.tsx?$/.test(f) && !f.endsWith(".d.ts"));
if (rawTs.length > 0) {
  fail(`raw TypeScript leaked into dist: ${rawTs.slice(0, 3).map((f) => path.relative(REPO, f)).join(", ")}…`);
} else {
  ok("no raw .ts/.tsx in dist");
}

// 5. DOM-type references in the public .d.ts surface
const DOM_RE = /\b(HTMLElement|HTMLDivElement|Document\b|Window\b|MediaQueryList|CSSStyleDeclaration)\b/;
const domLeaks: string[] = [];
for (const f of dtsFiles) {
  const src = fs.readFileSync(f, "utf8");
  // Strip comments before scanning, so prose mentioning "Document" doesn't trip it.
  const code = src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
  if (DOM_RE.test(code)) domLeaks.push(path.relative(REPO, f));
}
if (domLeaks.length > 0) {
  fail(`DOM types referenced in public .d.ts (breaks consumers without lib:DOM): ${domLeaks.join(", ")}`);
} else {
  ok("no DOM-type references in public .d.ts surface");
}

console.log(
  failures === 0
    ? `\nverify-package — dist OK (${jsFiles.length} js, ${dtsFiles.length} d.ts)`
    : `\nverify-package — ${failures} FAILURE(S)`,
);
process.exit(failures === 0 ? 0 : 1);
