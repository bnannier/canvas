// Cut the docs' faces down to the glyphs the docs can show: the static TrueType cuts iOS
// and Android register (docs/assets/fonts, from the full files the @expo-google-fonts
// packages ship and from the variable Bricolage Grotesque source) and the three variable
// woff2 files the web document declares (docs/public/fonts, from the variable sources under
// assets/fonts/source), with the manifest the web loader and the document read from
// (docs/src/ui/web-fonts.json). Everything it writes is committed, so native builds and the
// web export read the same bytes; run it again after bumping a source package, replacing a
// source file or changing the ranges below.
//
// Every one of these faces is on the first paint's critical path: the page preloads
// them, and Lighthouse's model keeps every preloaded font that finished before the
// paint on the Largest Contentful Paint path. The full files carry scripts the docs
// never render (JetBrains Mono is 112 KB of Latin, Greek, Cyrillic and Vietnamese); the
// Latin subset measured 31 KB against 52 KB over the wire for a mono face, 37 KB against
// 48 KB for a display face and 30 KB against 34 KB for a sans face, 297 KB for all nine
// against 405 KB, a quarter of the bytes before the first paint. A glyph
// outside the subset still renders: every platform falls back per glyph to a system
// face, which is what the flags and other emoji in the examples already do.
//
// Usage: node scripts/subset-fonts.mjs      (from docs/; also `bun run fonts:subset`)

import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import subsetFont from "subset-font";

const require = createRequire(import.meta.url);
const DOCS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(DOCS, "assets", "fonts");
const SOURCES = path.join(DOCS, "assets", "fonts", "source");
const WEB_OUT = path.join(DOCS, "public", "fonts");
const MANIFEST = path.join(DOCS, "src", "ui", "web-fonts.json");

// The variable sources, Google Fonts' own files (the google/fonts repository's `ofl/`
// directories, each committed with its OFL licence beside it). The display face is cut from
// the variable Bricolage Grotesque for native too, not from the @expo-google-fonts statics:
// those are frozen at one optical size, and the hand-off loads the variable font, whose
// `opsz` axis the browser sets from the font size (`font-optical-sizing: auto`), so a 64 px
// title draws its narrower display cut.
const BRICOLAGE = path.join(SOURCES, "BricolageGrotesque[opsz,wdth,wght].ttf");
const INSTRUMENT_SANS = path.join(SOURCES, "InstrumentSans[wdth,wght].ttf");
const JETBRAINS_MONO = path.join(SOURCES, "JetBrainsMono[wght].ttf");

// The faces docs/src/ui/fonts.native.ts registers, the file each comes from (a package path, or
// a committed source file), and the variation axes pinned in it. Each weight of the display
// face is pinned (with the full width) and `opsz` stays variable, so one file per weight keeps
// the optical sizes; tools/privacygen sets the baked policy in those two and the sans cuts.
const FACES = [
  ["InstrumentSans_400Regular", "@expo-google-fonts/instrument-sans/400Regular/InstrumentSans_400Regular.ttf"],
  ["InstrumentSans_500Medium", "@expo-google-fonts/instrument-sans/500Medium/InstrumentSans_500Medium.ttf"],
  ["InstrumentSans_600SemiBold", "@expo-google-fonts/instrument-sans/600SemiBold/InstrumentSans_600SemiBold.ttf"],
  ["InstrumentSans_700Bold", "@expo-google-fonts/instrument-sans/700Bold/InstrumentSans_700Bold.ttf"],
  ["BricolageGrotesque_500Medium", BRICOLAGE, { wght: 500, wdth: 100 }],
  ["BricolageGrotesque_600SemiBold", BRICOLAGE, { wght: 600, wdth: 100 }],
  ["JetBrainsMono_400Regular", "@expo-google-fonts/jetbrains-mono/400Regular/JetBrainsMono_400Regular.ttf"],
  ["JetBrainsMono_500Medium", "@expo-google-fonts/jetbrains-mono/500Medium/JetBrainsMono_500Medium.ttf"],
  ["JetBrainsMono_600SemiBold", "@expo-google-fonts/jetbrains-mono/600SemiBold/JetBrainsMono_600SemiBold.ttf"],
];

// The native display cuts docs/src/ui/display-faces.native.ts registers. iOS and Android draw
// a variable font at its default optical size (96), never at the text's size, so each weight
// is also cut with `opsz` pinned at the sizes the display roles set (h5 17, the card title
// 22, the section title 28, h2 34, h1 44, display 56, the larger hero and title sizes 72,
// and the 96 the axis ends at); the kit's font resolver picks the cut nearest the text's
// size. The web never loads these.
export const OPTICAL_SIZES = [17, 22, 28, 34, 44, 56, 72, 96];
for (const [weight, name] of [[500, "500Medium"], [600, "600SemiBold"]]) {
  for (const opsz of OPTICAL_SIZES) {
    FACES.push([`BricolageGrotesque_${name}_opsz${opsz}`, BRICOLAGE, { wght: weight, wdth: 100, opsz }]);
  }
}

// The three variable faces the web document declares (docs/src/app/+html.tsx, from the
// manifest this writes), decision D20: the hand-off's Google Fonts request made
// self-hosted (`Bricolage+Grotesque:opsz,wght@12..96,300..800`, `Instrument+Sans:wght@400..700`,
// `JetBrains+Mono:wght@400..600`, the files Google serves it). One woff2 per family with its
// weight axis kept as that range, so the browser draws every weight the type scale asks for
// from the one file (a 300 display weight as 300, a 700 as 700, with no synthetic bold), the
// width axis pinned at the normal width the hand-off never leaves, and Bricolage's
// optical-size axis kept whole for the browser to set from the text's size. Each file is
// named by its content, so it can be cached for ever (docs/public/_headers `/fonts/*`) and
// a change to a cut is a new name; a file this run did not write is stale and removed. The
// static cuts above do not change for this: iOS and Android keep them.
const WEB_FACES = [
  { role: "sans", family: "Instrument Sans", file: INSTRUMENT_SANS, axes: { wght: { min: 400, max: 700 }, wdth: 100 } },
  { role: "display", family: "Bricolage Grotesque", file: BRICOLAGE, axes: { wght: { min: 300, max: 800 }, wdth: 100 } },
  { role: "mono", family: "JetBrains Mono", file: JETBRAINS_MONO, axes: { wght: { min: 400, max: 600 } } },
];

// What the docs can show: Latin with the Western European accents and the extended
// set (Latin Extended-A covers the Central European and Turkish letters), the general
// punctuation block (dashes, curly quotes, bullets, the ellipsis), superscripts and
// currency, and the handful of symbols the docs' own text uses: the four arrows and
// the return and shift arrows, the minus and the comparison operators the guides
// quote, the keyboard glyphs Kbd renders (the command, option and down-arrowhead
// signs), the check and cross marks, and the small geometric shapes the examples use.
// Whole blocks of arrows, operators and shapes would double a mono face for glyphs
// nothing renders; a range a face does not cover costs nothing.
const RANGES = [
  [0x0020, 0x007e], // Basic Latin
  [0x00a0, 0x00ff], // Latin-1 Supplement
  [0x0100, 0x017f], // Latin Extended-A
  [0x02c6, 0x02dc], // Spacing modifier letters (circumflex, tilde)
  [0x2000, 0x206f], // General punctuation
  [0x2070, 0x209f], // Superscripts and subscripts
  [0x20a0, 0x20bf], // Currency symbols
  [0x2122, 0x2122], // Trade mark sign
  [0x2190, 0x2194], // Left, up, right, down and left-right arrows
  [0x21b5, 0x21b5], // Return arrow
  [0x21e7, 0x21e7], // Shift arrow
  [0x2212, 0x2212], // Minus sign
  [0x2248, 0x2248], // Almost equal to
  [0x2260, 0x2265], // Not equal, identical, less-or-equal, greater-or-equal
  [0x22ef, 0x22ef], // Midline ellipsis
  [0x2303, 0x2305], // Up arrowhead, down arrowhead, projective
  [0x2318, 0x2318], // Command sign
  [0x2325, 0x2326], // Option sign, erase to the right
  [0x25a0, 0x25a1], // Black and white squares
  [0x25b2, 0x25bf], // Triangles (the small pointers Select and Dropdown draw)
  [0x25c6, 0x25c7], // Diamonds
  [0x25cb, 0x25cf], // Circles
  [0x2713, 0x2715], // Check marks and the multiplication cross
];

const text = RANGES.map(([from, to]) => {
  let out = "";
  for (let code = from; code <= to; code += 1) out += String.fromCodePoint(code);
  return out;
}).join("");

// The name records that identify a face (family, subfamily, unique id, full name, PostScript
// name, the typographic family and subfamily, the variation prefixes) and are rewritten per
// cut; the copyright, licence and the variation instance names stay.
const IDENTITY = new Set([1, 2, 3, 4, 6, 16, 17, 21, 22, 25]);

// Give a cut its registered name as its own family and PostScript name. Every face cut from
// the variable Bricolage file keeps that file's default-instance names
// ("BricolageGrotesque-96ptExtraBold"), and iOS registers a font by its PostScript name, so
// a second face with the same name is refused and its alias draws the first one. The new
// `name` table is appended (tables may sit in any order) and the directory entry and the
// `head` checksum adjustment are rewritten. The licence has no reserved font name.
function renameFace(font, family) {
  const tableCount = font.readUInt16BE(4);
  const entry = (tag) => {
    for (let i = 0; i < tableCount; i++) if (font.toString("latin1", 12 + i * 16, 16 + i * 16) === tag) return 12 + i * 16;
    throw new Error(`no ${tag} table`);
  };
  const nameAt = font.readUInt32BE(entry("name") + 8);
  const strings = nameAt + font.readUInt16BE(nameAt + 4);
  const records = [];
  for (let i = 0; i < font.readUInt16BE(nameAt + 2); i++) {
    const at = nameAt + 6 + i * 12;
    const [platform, encoding, language, id, length, offset] = [0, 2, 4, 6, 8, 10].map((k) => font.readUInt16BE(at + k));
    if (!IDENTITY.has(id)) records.push({ platform, encoding, language, id, bytes: font.subarray(strings + offset, strings + offset + length) });
  }
  for (const [id, value] of [[1, family], [2, "Regular"], [3, family], [4, family], [6, family]]) {
    records.push({ platform: 3, encoding: 1, language: 0x409, id, bytes: Buffer.from(value, "utf16le").swap16() });
  }
  records.sort((a, b) => a.platform - b.platform || a.encoding - b.encoding || a.language - b.language || a.id - b.id);
  const header = 6 + records.length * 12;
  const table = Buffer.alloc(header + records.reduce((sum, r) => sum + r.bytes.length, 0));
  table.writeUInt16BE(records.length, 2);
  table.writeUInt16BE(header, 4);
  let offset = 0;
  records.forEach((r, i) => {
    const at = 6 + i * 12;
    [r.platform, r.encoding, r.language, r.id, r.bytes.length, offset].forEach((v, k) => table.writeUInt16BE(v, at + k * 2));
    r.bytes.copy(table, header + offset);
    offset += r.bytes.length;
  });
  const out = Buffer.concat([font, Buffer.alloc((4 - (font.length % 4)) % 4), table, Buffer.alloc((4 - (table.length % 4)) % 4)]);
  const checksum = (buf, from, length) => {
    let sum = 0;
    for (let i = from; i < from + length; i += 4) sum = (sum + (i + 4 <= buf.length ? buf.readUInt32BE(i) : 0)) >>> 0;
    return sum;
  };
  const name = entry("name");
  const tableAt = out.length - table.length - ((4 - (table.length % 4)) % 4);
  out.writeUInt32BE(checksum(out, tableAt, Math.ceil(table.length / 4) * 4), name + 4);
  out.writeUInt32BE(tableAt, name + 8);
  out.writeUInt32BE(table.length, name + 12);
  const head = out.readUInt32BE(entry("head") + 8);
  out.writeUInt32BE(0, head + 8);
  out.writeUInt32BE((0xb1b0afba - checksum(out, 0, out.length)) >>> 0, head + 8);
  return out;
}

// The variation axes a source carries (its `fvar` table), tag to [min, max]. A file that is
// not an sfnt, or has no axes, fails here rather than becoming a face that cannot vary, and
// so does a cut asking for an axis the file lacks or a range outside the file's.
function variationAxes(font) {
  const tag = font.toString("latin1", 0, 4);
  if (font.readUInt32BE(0) !== 0x00010000 && tag !== "true" && tag !== "OTTO") throw new Error("not an sfnt font");
  let fvar = 0;
  for (let i = 0; i < font.readUInt16BE(4); i++) if (font.toString("latin1", 12 + i * 16, 16 + i * 16) === "fvar") fvar = font.readUInt32BE(20 + i * 16);
  if (!fvar) throw new Error("no fvar table: not a variable font");
  const axes = {};
  const first = fvar + font.readUInt16BE(fvar + 4);
  const size = font.readUInt16BE(fvar + 10);
  for (let i = 0; i < font.readUInt16BE(fvar + 8); i++) {
    const at = first + i * size;
    axes[font.toString("latin1", at, at + 4)] = [font.readInt32BE(at + 4) / 65536, font.readInt32BE(at + 12) / 65536];
  }
  return axes;
}

fs.mkdirSync(OUT, { recursive: true });
for (const [name, file, variationAxes] of FACES) {
  const source = fs.readFileSync(path.isAbsolute(file) ? file : require.resolve(file));
  const subset = await subsetFont(source, text, { targetFormat: "truetype", ...(variationAxes ? { variationAxes } : {}) });
  const target = path.join(OUT, `${name}.ttf`);
  fs.writeFileSync(target, file === BRICOLAGE ? renameFace(Buffer.from(subset), name) : subset);
  console.log(`${name}: ${source.length} -> ${subset.length} bytes`);
}

fs.mkdirSync(WEB_OUT, { recursive: true });
const manifest = {};
const written = new Set();
for (const { role, family, file, axes } of WEB_FACES) {
  const source = fs.readFileSync(file);
  const carried = variationAxes(source);
  for (const [tag, want] of Object.entries(axes)) {
    const [min, max] = typeof want === "number" ? [want, want] : [want.min, want.max];
    const have = carried[tag];
    if (!have || min < have[0] || max > have[1]) {
      throw new Error(`${path.basename(file)}: no ${tag} ${min}..${max} to cut (the file carries ${have ? have.join("..") : "no such axis"})`);
    }
  }
  const woff2 = Buffer.from(await subsetFont(source, text, { targetFormat: "woff2", variationAxes: axes }));
  const name = `${family.replace(/\s+/g, "")}.${createHash("sha256").update(woff2).digest("hex").slice(0, 12)}.woff2`;
  fs.writeFileSync(path.join(WEB_OUT, name), woff2);
  written.add(name);
  // The CSS family name, the public path, the `font-weight` range of its rule and, where
  // the axis is kept whole, the optical sizes the browser may set.
  const entry = { family, path: `/fonts/${name}`, weight: [axes.wght.min, axes.wght.max] };
  if (carried.opsz && !("opsz" in axes)) entry.opticalSize = carried.opsz;
  manifest[role] = entry;
  console.log(`${family}: ${source.length} -> ${woff2.length} bytes, ${name}`);
}
for (const stale of fs.readdirSync(WEB_OUT)) if (!written.has(stale)) fs.rmSync(path.join(WEB_OUT, stale));
fs.writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
