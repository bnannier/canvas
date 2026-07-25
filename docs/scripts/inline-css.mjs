// Inline the exported stylesheet into index.html instead of linking it.
//
// The export ships one small stylesheet, expo-router's native-tabs module (~2.5 KB). It
// is render-blocking: the browser will not paint until it has been fetched, which cost a
// measured 74ms. Inlining removes that round trip entirely.
//
// It is worth noting what this file is. NativeTabs is the iOS/Android tab bar, and on the
// web the shell renders the sidebar/topbar layout instead, so none of these rules ever
// match anything here. The honest fix would be not to ship it at all, but the import is
// static in shell/navbar.tsx and splitting that into a .native fork to dodge one stylesheet
// trades a real cross-platform file for a build-time saving. Inlining gets the same paint
// timing without forking the component.
//
// Safe under the site's CSP: style-src includes 'unsafe-inline', which it must anyway,
// because React Native Web writes dynamic styles as inline style attributes.
//
// Usage: node scripts/inline-css.mjs [distDir]   (defaults to ./dist)

import fs from "node:fs";
import path from "node:path";

const dist = process.argv[2] ?? "dist";
const htmlPath = path.join(dist, "index.html");
let html = fs.readFileSync(htmlPath, "utf8");

const LINK = /<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g;
const found = [...html.matchAll(LINK)];
if (!found.length) {
  console.log("inline-css: no stylesheet links found; nothing to do");
  process.exit(0);
}

let inlined = 0;
for (const [tag, href] of found) {
  const file = path.join(dist, href.replace(/^\//, ""));
  if (!fs.existsSync(file)) throw new Error(`inline-css: stylesheet not found in artifact: ${href}`);
  const css = fs.readFileSync(file, "utf8");
  // Only inline what is genuinely small. A large stylesheet is better left cacheable as a
  // separate file than duplicated into every HTML response.
  if (css.length > 16_000) {
    console.log(`inline-css: skipping ${href} (${css.length} bytes, over the inline budget)`);
    continue;
  }
  // </style> inside the CSS would close the block early; there is none today, but a future
  // rule containing that sequence would silently break the page.
  if (css.includes("</style")) throw new Error(`inline-css: ${href} contains a closing style tag`);
  html = html.replace(tag, `<style>${css}</style>`);
  inlined += 1;
}

fs.writeFileSync(htmlPath, html);
console.log(`inline-css: inlined ${inlined} of ${found.length} stylesheet(s) into index.html`);
