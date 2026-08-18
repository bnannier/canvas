// Guards the docs' platform-skin registry: every component that actually LOOKS
// different per OS must be listed in src/core/platform-skins.ts, so the three-up
// preview shows the real iOS and Android skins instead of the web one three times.
//
// Why this needs a guard at all. On a device Metro resolves `foo.ios.tsx` by
// extension, so native is always right. The WEB docs cannot do that: a browser
// bundler resolves a bare import to the web module, so the docs preview the other
// two platforms by importing the .ios/.android files through this registry by
// LITERAL path. Forget the entry and nothing breaks, nothing warns, and the three
// panes quietly render the same web component with three different labels over
// them. That has now happened twice: AvatarMenu (its menu was the web Dropdown in
// every row) and Field (its Android row drew the label above the box instead of
// floating it inside).
//
// What counts as "looks different". A platform file whose skin is an identity
// alias of the web skin (`export const iosSkin: ChartSkin = webSkin;`, which every
// chart does, data visualization being platform-neutral) renders identically by
// construction, so its absence from the registry is correct and this check stays
// quiet about it. A skin built as its own object, INCLUDING a spread of the web
// skin with overrides (`{ ...webSkin, shape: { borderCurve: "continuous" } }`), is
// a real divergence and must be registered.
//
// Run by CI (ci.yml) and `bun run check:skins`.
//
// Stays free of React Native so it runs in plain bun: the styles modules pull in
// the kit's style layer, so skins are classified from source text rather than by
// importing them, the same approach check-nav-sync.ts uses for pattern slugs.
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const KIT = join(HERE, "..", "..", "src");
const REGISTRY = join(HERE, "..", "src", "core", "platform-skins.ts");
const GROUPS = ["atoms", "molecules", "organisms", "charts"];

type Divergent = { dir: string; group: string; exportName: string; platforms: string[] };

/** The skin identifier a platform entry builds from, and the module it came from. */
function skinImport(source: string, skinName: string): string | null {
  const m = source.match(new RegExp(`import\\s*\\{[^}]*\\b${skinName}\\b[^}]*\\}\\s*from\\s*"([^"]+)"`));
  return m ? m[1] : null;
}

/**
 * True when the platform's skin is its own object rather than an identity alias of
 * the web skin. `export const iosSkin: T = webSkin;` is an alias; anything opening
 * a brace is not.
 */
function isDivergentSkin(stylesSource: string, skinName: string): boolean {
  const decl = stylesSource.match(new RegExp(`export const ${skinName}\\s*(?::[^=]+)?=\\s*([^;]+)`));
  if (!decl) return false;
  return !/^\s*webSkin\s*$/.test(decl[1]);
}

/** Resolve a platform file's skin module to a path on disk, .js specifier and all. */
function resolveStyles(fromDir: string, specifier: string): string | null {
  const asTs = join(fromDir, specifier.replace(/\.js$/, ".ts"));
  return existsSync(asTs) ? asTs : null;
}

const divergent: Divergent[] = [];

for (const group of GROUPS) {
  const groupDir = join(KIT, group);
  if (!existsSync(groupDir)) continue;
  for (const dir of readdirSync(groupDir)) {
    const compDir = join(groupDir, dir);
    let files: string[];
    try {
      files = readdirSync(compDir);
    } catch {
      continue; // a file, not a component directory
    }
    const platforms: string[] = [];
    let exportName = "";
    for (const [ext, skinName] of [[".ios.tsx", "iosSkin"], [".android.tsx", "androidSkin"]] as const) {
      const file = files.find((f) => f.endsWith(ext));
      if (!file) continue;
      const source = readFileSync(join(compDir, file), "utf8");
      const exported = [...source.matchAll(/export const (\w+)\s*=/g)].map((m) => m[1]);
      if (!exported.length) continue;
      exportName = exported[0];
      const specifier = skinImport(source, skinName);
      if (!specifier) continue; // builds from something other than a named skin
      const stylesPath = resolveStyles(compDir, specifier);
      if (!stylesPath) continue;
      if (isDivergentSkin(readFileSync(stylesPath, "utf8"), skinName)) {
        platforms.push(ext === ".ios.tsx" ? "iOS" : "Android");
      }
    }
    if (platforms.length && exportName) divergent.push({ dir, group, exportName, platforms });
  }
}

const registry = readFileSync(REGISTRY, "utf8");
function registeredIn(table: "ios" | "android"): Set<string> {
  const block = registry.split(`${table}: {`)[1]?.split("},")[0] ?? "";
  const suffix = table === "ios" ? "IOS" : "Android";
  return new Set([...block.matchAll(new RegExp(`(\\w+):\\s*\\w+${suffix}`, "g"))].map((m) => m[1]));
}
const iosTable = registeredIn("ios");
const androidTable = registeredIn("android");

const missing: string[] = [];
for (const c of divergent) {
  const gaps: string[] = [];
  if (c.platforms.includes("iOS") && !iosTable.has(c.exportName)) gaps.push("ios");
  if (c.platforms.includes("Android") && !androidTable.has(c.exportName)) gaps.push("android");
  if (gaps.length) missing.push(`  ${c.exportName} (src/${c.group}/${c.dir}) is absent from the ${gaps.join(" and ")} table`);
}

if (missing.length) {
  console.error(
    `check:skins - ${missing.length} component(s) render their own per-OS skin but are missing from ` +
      `docs/src/core/platform-skins.ts, so the docs three-up shows the WEB build in those rows:\n` +
      `${missing.join("\n")}\n\n` +
      `Add the literal .ios.js / .android.js imports and the table entries. If a component genuinely ` +
      `looks the same on every platform, make that explicit in its styles module (export const ` +
      `iosSkin: T = webSkin;) and this check will stop asking.`,
  );
  process.exit(1);
}

console.log(
  `✓ platform-skins.ts covers every divergent skin (${divergent.length} components render per-OS; ` +
    `${iosTable.size} iOS and ${androidTable.size} Android entries registered)`,
);
