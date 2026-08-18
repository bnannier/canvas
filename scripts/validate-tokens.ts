import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { brandColors, darkColors, glassByScheme, lightColors, palette } from "../src/style/tokens.ts";

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

// --- OKLCH -> sRGB -------------------------------------------------------
// The hand-off authors its semantic colors in oklch(), which React Native cannot
// parse, so src/style/tokens.ts carries the hex those values resolve to. To compare
// the two sides at all, the CSS has to be converted back. Standard Oklab matrices
// (Ottosson), then the sRGB transfer function; the result is the same 8-bit triple a
// browser paints, so an exact string compare is the right test.
function oklchToHex(L: number, C: number, hDeg: number): string {
  const h = (hDeg * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.2914855480 * b) ** 3;
  const linear = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
  ];
  const channel = (v: number) => {
    const c = v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(Math.max(v, 0), 1 / 2.4) - 0.055;
    return Math.round(Math.min(1, Math.max(0, c)) * 255)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${linear.map(channel).join("")}`;
}

// Resolve a raw CSS declaration to a comparable hex, or null when it is not a plain
// color (a var() alias, a gradient, a shadow list, a blur filter).
function cssColorToHex(raw: string): string | null {
  const value = raw.replace(/\/\*[\s\S]*?\*\//g, "").trim().toLowerCase();
  const oklch = value.match(/^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)$/);
  if (oklch) return oklchToHex(Number(oklch[1]), Number(oklch[2]), Number(oklch[3]));
  if (/^#[0-9a-f]{6}$/.test(value)) return value;
  if (/^#[0-9a-f]{3}$/.test(value)) return `#${[...value.slice(1)].map((c) => c + c).join("")}`;
  return null;
}

// The glass material's tokens are authored as rgba() on BOTH sides (React Native parses
// rgba natively, so nothing has to be transcribed into another notation), which is exactly
// the case cssColorToHex declines: a hex compare would drop the alpha, and the alpha is the
// whole point of a material fill. Canonicalize the four channels instead, so spacing and
// `0.20` vs `0.2` count as formatting while a real difference still fails.
function cssRgbaToCanonical(raw: string): string | null {
  const value = raw.replace(/\/\*[\s\S]*?\*\//g, "").trim().toLowerCase();
  const m = value.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/);
  if (!m) return null;
  const alpha = m[4] === undefined ? 1 : Number(m[4]);
  return `rgba(${Number(m[1])}, ${Number(m[2])}, ${Number(m[3])}, ${alpha})`;
}

// Pull the declarations out of one selector block, so the light (:root) and dark
// (.dark) color sets can be compared against their own JS counterpart.
function declarationsIn(css: string, selector: string): Record<string, string> {
  const out: Record<string, string> = {};
  const start = css.indexOf(selector + "{");
  if (start === -1) return out;
  const open = start + selector.length;
  let depth = 0;
  let end = open;
  for (; end < css.length; end++) {
    if (css[end] === "{") depth++;
    else if (css[end] === "}" && --depth === 0) break;
  }
  for (const m of css.slice(open, end).matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) out[m[1]] = m[2];
  return out;
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

// And for the GLASS MATERIAL family. The material owns its fill (`glass-tint`) instead of
// borrowing the semantic `popover` token, which is what let a change to menu opacity drag
// the bars along with it. Its keys ARE the CSS names, so a name here with no `--name` in
// the CSS would mean the web surface renders its glass from a token the native material
// never sees.
const glassKeys = Object.keys(glassByScheme.light) as (keyof typeof glassByScheme.light)[];
const glassMissingInCss = glassKeys.filter((k) => !cssValueTokens.has(k)).sort();
if (glassMissingInCss.length) {
  console.log(`\nGlass tokens in src/style/tokens.ts but MISSING from styles/canvas.css: ${glassMissingInCss.length}`);
  for (const k of glassMissingInCss) console.log(`  --${k}`);
  failed = true;
}

// Cross-check the VALUES, not just the names. The names matching only proves a web
// consumer can reach the token; it says nothing about whether it reaches the same
// COLOR the native components paint. That gap is exactly how the two sides drifted:
// the CSS carried the hand-off's oklch() values while the JS carried hand-transcribed
// Tailwind v3 hexes, so `destructive` shipped as #e7000b on the web and #dc2626 on
// native. The hand-off is the source of truth; the JS must be its sRGB rendering.
const colorsCss = await readFile(join(STYLES_DIR, "tokens", "colors.css"), "utf-8");
const paletteCss = await readFile(join(STYLES_DIR, "tokens", "palette.css"), "utf-8");
const cssLight = declarationsIn(colorsCss, ":root");
const cssDark = { ...cssLight, ...declarationsIn(colorsCss, ".dark") };

const drifted: string[] = [];
for (const [scheme, js, css] of [
  ["light", lightColors, cssLight],
  ["dark", darkColors, cssDark],
] as const) {
  for (const [name, jsValue] of Object.entries(js)) {
    const raw = css[name];
    if (raw === undefined) continue; // the name check above already reports this
    const cssHex = cssColorToHex(raw);
    if (cssHex === null) continue; // var() alias or non-color; nothing to compare
    if (cssHex !== jsValue.toLowerCase()) {
      drifted.push(`  ${scheme.padEnd(5)} --${name.padEnd(24)} css ${cssHex}  !=  js ${jsValue}`);
    }
  }
}
// The brand constants and the Tailwind palette steps are authored as hex on both
// sides, so they compare verbatim through the same path.
for (const [name, jsValue] of Object.entries(brandColors)) {
  const cssHex = cssLight[name] === undefined ? null : cssColorToHex(cssLight[name]);
  if (cssHex !== null && cssHex !== jsValue.toLowerCase()) {
    drifted.push(`  brand --${name.padEnd(24)} css ${cssHex}  !=  js ${jsValue}`);
  }
}
for (const m of paletteCss.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) {
  const jsValue = palette[m[1]];
  if (!jsValue) continue; // palette.css also defines aliases (--green-500-bar) with no JS twin
  const cssHex = cssColorToHex(m[2]);
  if (cssHex !== null && cssHex !== jsValue.toLowerCase()) {
    drifted.push(`  step  --${m[1].padEnd(24)} css ${cssHex}  !=  js ${jsValue}`);
  }
}
// The glass family compares through the rgba canonicalizer, per scheme. Unlike the loops
// above, an UNPARSEABLE value fails rather than being skipped: these tokens are rgba by
// contract (the material composites over whatever is behind it), so a value neither side
// can parse as rgba is itself the drift.
for (const [scheme, css] of [
  ["light", cssLight],
  ["dark", cssDark],
] as const) {
  for (const key of glassKeys) {
    const raw = css[key];
    if (raw === undefined) continue; // the name check above already reports this
    const jsValue = glassByScheme[scheme][key];
    const cssRgba = cssRgbaToCanonical(raw);
    const jsRgba = cssRgbaToCanonical(jsValue);
    if (cssRgba === null || jsRgba === null) {
      drifted.push(`  ${scheme.padEnd(5)} --${key.padEnd(24)} not an rgba() on both sides: css ${raw.trim()}  /  js ${jsValue}`);
    } else if (cssRgba !== jsRgba) {
      drifted.push(`  ${scheme.padEnd(5)} --${key.padEnd(24)} css ${cssRgba}  !=  js ${jsRgba}`);
    }
  }
}

if (drifted.length) {
  console.log(`\nColor VALUES that differ between styles/ (the hand-off) and src/style/tokens.ts: ${drifted.length}`);
  for (const line of drifted) console.log(line);
  console.log("  Fix the hand-off first, then mirror its sRGB value into src/style/tokens.ts.");
  failed = true;
}

console.log(
  `\nTokens: ${defined.size} defined, ${referenced.size} referenced; ${Object.keys(lightColors).length} JS color tokens + ` +
    `${Object.keys(brandColors).length} JS brand tokens + ${glassKeys.length * 2} JS glass values (both schemes) cross-checked`,
);
if (!failed) console.log("Token validation passed.");
else process.exit(1);
