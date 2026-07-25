// Inject <link rel="preload"> tags for the Geist faces into the exported index.html.
//
// Why this exists: the root layout holds the whole tree back until the fonts resolve, and
// the fonts cannot even begin downloading until the JS bundle has been fetched AND executed,
// because that is when useFonts() runs. In a measured production trace the bundle occupied
// 51-166ms and the fonts did not start until 289ms, which put them at the tail of the
// critical request chain. Preloading from the HTML lets them start with the document
// instead, in parallel with the bundle, so they are already in the cache by the time the
// hook asks for them.
//
// It has to run after `expo export` rather than living in public/index.html, because Metro
// fingerprints every asset: Geist_400Regular.c73f4c72...ttf changes name whenever the font
// bytes do, so a hardcoded href would rot at the next build.
//
// Usage: node scripts/preload-fonts.mjs [distDir]   (defaults to ./dist)

import fs from "node:fs";
import path from "node:path";

const dist = process.argv[2] ?? "dist";
const html = path.join(dist, "index.html");
const MARK = "<!-- preload:fonts -->";

// The families are read out of src/ui/fonts.ts rather than duplicated here, so adding or
// dropping a weight there cannot silently leave this list stale.
const src = fs.readFileSync("src/ui/fonts.ts", "utf8");
const block = src.match(/useFonts\(\{([\s\S]*?)\}\)/);
if (!block) throw new Error("preload-fonts: could not find the useFonts({...}) call in src/ui/fonts.ts");
const families = [...block[1].matchAll(/^\s*([A-Za-z0-9_]+)\s*:/gm)].map((m) => m[1]);
if (!families.length) throw new Error("preload-fonts: parsed zero font families from src/ui/fonts.ts");

const walk = (dir) =>
  fs.existsSync(dir)
    ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
        e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)],
      )
    : [];
const ttf = walk(path.join(dist, "assets")).filter((f) => f.endsWith(".ttf"));

// The package ships every weight and italic (36 files), but only the faces named above are
// ever requested. Match on the segment before the content hash so Geist_400Regular never
// matches Geist_400Regular_Italic.
const hrefs = families.map((family) => {
  const hit = ttf.find((f) => path.basename(f).replace(/\.[0-9a-f]{32}\.ttf$/, "") === family);
  if (!hit) throw new Error(`preload-fonts: no exported .ttf found for "${family}"`);
  return "/" + path.relative(dist, hit).split(path.sep).join("/");
});

let doc = fs.readFileSync(html, "utf8");
if (doc.includes(MARK)) {
  console.log("preload-fonts: already injected, skipping");
  process.exit(0);
}
// crossorigin is required even same-origin: fonts are fetched in CORS mode, and a preload
// whose mode does not match the later request is discarded and silently fetched twice.
const tags =
  MARK +
  "\n" +
  hrefs
    .map((h) => `    <link rel="preload" as="font" type="font/ttf" crossorigin href="${h}" />`)
    .join("\n");

if (!doc.includes("</head>")) throw new Error("preload-fonts: no </head> in the exported index.html");
doc = doc.replace("</head>", `${tags}\n  </head>`);
fs.writeFileSync(html, doc);
console.log(`preload-fonts: injected ${hrefs.length} preload tags (${families.join(", ")})`);
