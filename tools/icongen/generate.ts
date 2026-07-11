/*
 * Icon glyph generator. Reads the curated source list (tools/icongen/icons.ts)
 * and lucide-static's icon-nodes.json, maps each glyph to the kit's Shape union,
 * and writes src/atoms/icon/icon.glyphs.ts (the ICONS map, the NAMES gallery
 * list, the IconGlyphProps name-boolean interface, and the IconName union).
 *
 * Run: bun run icons:gen
 *
 * It validates loudly: any source name missing from Lucide, any reserved prop
 * name, any icon using an unsupported element/attribute (a `fill`), and any
 * duplicate is reported; and it FAILS if a previously-shipped glyph name would
 * disappear (REQUIRED_NAMES), so no existing <Icon x/> call site can break.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { SOURCES, ALIASES, REQUIRED_NAMES } from "./icons.ts";

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, "../..");

const nodes: Record<string, [string, Record<string, string>][]> = JSON.parse(
  readFileSync(resolve(repo, "node_modules/lucide-static/icon-nodes.json"), "utf8"),
);

// React reserves these prop names; a glyph boolean with one of them is unreachable.
const RESERVED = new Set(["key", "ref", "children"]);

const camel = (s: string) =>
  s.replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase());
const kebab = (s: string) =>
  s.replace(/([a-z])([A-Z])/g, "$1-$2").replace(/([a-zA-Z])(\d)/g, "$1-$2").toLowerCase();
const num = (v: string) => {
  const n = Number(v);
  if (Number.isNaN(n)) throw new Error(`non-numeric attr: ${v}`);
  return n;
};

type Shape = (
  | { t: "path"; d: string }
  | { t: "circle"; cx: number; cy: number; r: number }
  | { t: "line"; x1: number; y1: number; x2: number; y2: number }
  | { t: "polyline"; points: string }
  | { t: "polygon"; points: string }
  | { t: "rect"; x: number; y: number; width: number; height: number; rx?: number; ry?: number }
  | { t: "ellipse"; cx: number; cy: number; rx: number; ry: number }
) & { fill?: boolean };

// Map one Lucide node ([tag, attrs]) to a Shape, or return null on an unknown
// element so the caller skips the whole icon (never a half-drawn glyph). A Lucide
// `fill="currentColor"` node becomes `fill: true` — the renderer fills it with the
// glyph color instead of leaving it stroke-only.
function toShape(tag: string, a: Record<string, string>): Shape | null {
  const fill = a.fill != null ? { fill: true as const } : {};
  switch (tag) {
    case "path": return { t: "path", d: a.d, ...fill };
    case "circle": return { t: "circle", cx: num(a.cx), cy: num(a.cy), r: num(a.r), ...fill };
    case "line": return { t: "line", x1: num(a.x1), y1: num(a.y1), x2: num(a.x2), y2: num(a.y2), ...fill };
    case "polyline": return { t: "polyline", points: a.points, ...fill };
    case "polygon": return { t: "polygon", points: a.points, ...fill };
    case "rect": {
      const s: Shape = { t: "rect", x: num(a.x), y: num(a.y), width: num(a.width), height: num(a.height), ...fill };
      if (a.rx != null) s.rx = num(a.rx);
      if (a.ry != null) s.ry = num(a.ry);
      return s;
    }
    case "ellipse": return { t: "ellipse", cx: num(a.cx), cy: num(a.cy), rx: num(a.rx), ry: num(a.ry), ...fill };
    default: return null;
  }
}

function serialize(s: Shape): string {
  const f = s.fill ? ", fill: true" : "";
  switch (s.t) {
    case "path": return `{ t: "path", d: ${JSON.stringify(s.d)}${f} }`;
    case "circle": return `{ t: "circle", cx: ${s.cx}, cy: ${s.cy}, r: ${s.r}${f} }`;
    case "line": return `{ t: "line", x1: ${s.x1}, y1: ${s.y1}, x2: ${s.x2}, y2: ${s.y2}${f} }`;
    case "polyline": return `{ t: "polyline", points: ${JSON.stringify(s.points)}${f} }`;
    case "polygon": return `{ t: "polygon", points: ${JSON.stringify(s.points)}${f} }`;
    case "rect": return `{ t: "rect", x: ${s.x}, y: ${s.y}, width: ${s.width}, height: ${s.height}${s.rx != null ? `, rx: ${s.rx}` : ""}${s.ry != null ? `, ry: ${s.ry}` : ""}${f} }`;
    case "ellipse": return `{ t: "ellipse", cx: ${s.cx}, cy: ${s.cy}, rx: ${s.rx}, ry: ${s.ry}${f} }`;
  }
}

interface Entry { name: string; label: string; shapes: Shape[]; source: string }

const entries: Entry[] = [];
const seen = new Map<string, string>(); // canvasName -> source (dupe guard)
const missing: string[] = [];
const reserved: string[] = [];
const skipped: string[] = [];
const dupes: string[] = [];

for (const source of [...new Set(SOURCES)]) {
  const raw = nodes[source];
  if (!raw) { missing.push(source); continue; }
  const name = ALIASES[source] ?? camel(source);
  if (RESERVED.has(name)) { reserved.push(`${source} -> ${name}`); continue; }
  if (seen.has(name)) { dupes.push(`${name} (${seen.get(name)} & ${source})`); continue; }
  const shapes: Shape[] = [];
  let bad = false;
  for (const [tag, attrs] of raw) {
    const sh = toShape(tag, attrs ?? {});
    if (!sh) { bad = true; break; }
    shapes.push(sh);
  }
  if (bad) { skipped.push(source); continue; }
  seen.set(name, source);
  entries.push({ name, label: kebab(name), shapes, source });
}

entries.sort((a, b) => a.name.localeCompare(b.name));

// Guard: every previously-shipped glyph must still exist.
const produced = new Set(entries.map((e) => e.name));
const lost = REQUIRED_NAMES.filter((n) => !produced.has(n));

console.log(`icons:gen — ${entries.length} glyphs from ${new Set(SOURCES).size} sources`);
if (missing.length) console.log(`  skipped (not in Lucide): ${missing.join(", ")}`);
if (reserved.length) console.log(`  skipped (reserved name): ${reserved.join(", ")}`);
if (skipped.length) console.log(`  skipped (fill/unsupported): ${skipped.join(", ")}`);
if (dupes.length) console.log(`  skipped (duplicate name): ${dupes.join(", ")}`);
if (lost.length) {
  console.error(`\nFATAL: these previously-shipped glyphs would disappear: ${lost.join(", ")}`);
  process.exit(1);
}

const iconsBlock = entries
  .map((e) =>
    e.shapes.length === 1
      ? `  ${e.name}: [${serialize(e.shapes[0])}],`
      : `  ${e.name}: [\n${e.shapes.map((s) => `    ${serialize(s)},`).join("\n")}\n  ],`,
  )
  .join("\n");

const namesBlock = entries.map((e) => `  { key: ${JSON.stringify(e.name)}, label: ${JSON.stringify(e.label)} },`).join("\n");

const propsBlock = entries.map((e) => `  /** \`${e.source}\` */\n  ${e.name}?: boolean;`).join("\n");

const out = `/* @generated by tools/icongen — DO NOT EDIT. Run \`bun run icons:gen\`. */
// The curated Canvas glyph set, transcribed from lucide-static's icon-nodes.json
// into the kit's SVG-primitive Shape model. Edit tools/icongen/icons.ts and
// regenerate; never hand-edit this file. ${entries.length} glyphs.

/** One SVG primitive on the 0 0 24 24 viewBox. \`fill\` marks a filled element
 *  (Lucide \`fill="currentColor"\`); the renderer fills it with the glyph color. */
export type Shape = (
  | { t: "path"; d: string }
  | { t: "circle"; cx: number; cy: number; r: number }
  | { t: "line"; x1: number; y1: number; x2: number; y2: number }
  | { t: "polyline"; points: string }
  | { t: "polygon"; points: string }
  | { t: "rect"; x: number; y: number; width: number; height: number; rx?: number; ry?: number }
  | { t: "ellipse"; cx: number; cy: number; rx: number; ry: number }
) & { fill?: boolean };

/** Every glyph's primitives, keyed by Canvas prop name (camelCase). */
export const ICONS: Record<string, Shape[]> = {
${iconsBlock}
};

/** Gallery order (alphabetical): the prop name (\`key\`) and its typed label. */
export const NAMES: { key: string; label: string }[] = [
${namesBlock}
];

/** One boolean per glyph (the name axis of IconProps). */
export interface IconGlyphProps {
${propsBlock}
}

/** The union of glyph names — every valid \`<Icon name />\` / data-driven \`icon\`. */
export type IconName = keyof IconGlyphProps;
`;

writeFileSync(resolve(repo, "src/atoms/icon/icon.glyphs.ts"), out);
console.log(`  wrote src/atoms/icon/icon.glyphs.ts`);
