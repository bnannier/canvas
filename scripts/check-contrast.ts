import { readFileSync } from "node:fs";
import { join } from "node:path";

function parseHSL(h: number, s: number, l: number): [number, number, number] {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
  };
  return [f(0), f(8), f(4)];
}

function luminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  );
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrast(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

const pairs: [string, string, string, string][] = [
  // [label, fg HSL, bg HSL, min ratio]
  ["foreground on background (light)", "240 10% 3.9%", "0 0% 100%", "4.5"],
  ["foreground on background (dark)", "0 0% 98%", "240 10% 3.9%", "4.5"],
  ["primary-fg on primary (light)", "0 0% 98%", "240 5.9% 10%", "4.5"],
  ["primary-fg on primary (dark)", "240 5.9% 10%", "0 0% 98%", "4.5"],
  ["destructive-fg on destructive (light)", "0 0% 98%", "0 72% 51%", "4.5"],
  ["destructive-fg on destructive (dark)", "0 0% 98%", "0 62.8% 30.6%", "4.5"],
  ["muted-fg on background (light)", "240 3.8% 46.1%", "0 0% 100%", "4.5"],
  ["muted-fg on background (dark)", "240 5% 64.9%", "240 10% 3.9%", "4.5"],
  ["success-fg on success-bg (light)", "144 61% 20%", "141 79% 85%", "4.5"],
  ["success-fg on success-bg (dark)", "142 70% 65%", "149 50% 22%", "4.5"],
  ["warning-fg on warning-bg (light)", "40 80% 27%", "48 96% 89%", "4.5"],
  ["warning-fg on warning-bg (dark)", "43 90% 65%", "38 50% 20%", "4.5"],
  ["error-fg on error-bg (light)", "0 70% 35%", "0 93% 94%", "4.5"],
  ["error-fg on error-bg (dark)", "0 80% 70%", "0 50% 18%", "4.5"],
  ["info-fg on info-bg (light)", "221 83% 45%", "214 95% 93%", "4.5"],
  ["info-fg on info-bg (dark)", "217 90% 72%", "217 50% 22%", "4.5"],
];

let failed = false;

console.log("Color Contrast Audit (WCAG AA)\n");

for (const [label, fgStr, bgStr, minStr] of pairs) {
  const min = parseFloat(minStr);
  const [fh, fs, fl] = fgStr.split(" ").map((v) => parseFloat(v));
  const [bh, bs, bl] = bgStr.split(" ").map((v) => parseFloat(v));
  const fgRGB = parseHSL(fh, fs, fl);
  const bgRGB = parseHSL(bh, bs, bl);
  const fgL = luminance(...fgRGB);
  const bgL = luminance(...bgRGB);
  const ratio = contrast(fgL, bgL);
  const pass = ratio >= min;
  const icon = pass ? "OK" : "FAIL";
  console.log(`  [${icon}] ${label}: ${ratio.toFixed(2)}:1 (min ${min}:1)`);
  if (!pass) failed = true;
}

// --- Dark-mode UI element visibility -------------------------------------
// WCAG text-contrast checks above pass even when structural tokens (borders,
// hover/selected fills) sit almost on top of the surface they paint over, the
// exact bug that made dark mode look washed out. Against near-black surfaces a
// contrast *ratio* is tiny even for clearly visible greys, so we gate on the
// perceptual proxy that actually matters here: the HSL lightness delta between
// a structural token and the surface it renders on. Tokens are read live from
// colors.css so the gate tracks the real values, not a hardcoded copy.
const colorsCss = readFileSync(
  join(import.meta.dir, "..", "styles", "tokens", "colors.css"),
  "utf-8"
);
const darkBlock = colorsCss.slice(
  colorsCss.indexOf(".dark {"),
  colorsCss.indexOf("}", colorsCss.indexOf(".dark {"))
);
function darkL(token: string): number {
  const m = darkBlock.match(
    new RegExp(`--${token}:\\s*[\\d.]+ [\\d.]+% ([\\d.]+)%`)
  );
  if (!m) throw new Error(`dark token not found: --${token}`);
  return parseFloat(m[1]);
}

const MIN_L_DELTA = 14; // percentage points of HSL lightness
const uiPairs: [string, string, string][] = [
  // [label, structural token, surface it paints on]
  ["border on background (dark)", "border", "background"],
  ["input border on background (dark)", "input", "background"],
  ["accent fill on card (dark)", "accent", "card"],
  ["muted fill on card (dark)", "muted", "card"],
  ["secondary fill on background (dark)", "secondary", "background"],
  ["sidebar-accent on sidebar-background (dark)", "sidebar-accent", "sidebar-background"],
  ["sidebar-border on sidebar-background (dark)", "sidebar-border", "sidebar-background"],
];

console.log(`\nDark UI element visibility (min ${MIN_L_DELTA}% lightness delta)\n`);

for (const [label, token, surface] of uiPairs) {
  const delta = Math.abs(darkL(token) - darkL(surface));
  const pass = delta >= MIN_L_DELTA;
  console.log(
    `  [${pass ? "OK" : "FAIL"}] ${label}: ${delta.toFixed(1)}% (min ${MIN_L_DELTA}%)`
  );
  if (!pass) failed = true;
}

if (failed) {
  console.log("\nSome contrast checks failed.");
  process.exit(1);
} else {
  console.log("\nAll contrast checks passed.");
}
