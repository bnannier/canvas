/** Render the Canvas homepage artwork into the social preview. Run: bun run og:gen.
 * The PNG is a shipped brand asset, not a retained test screenshot.
 */
import { build } from "esbuild";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import sharp from "sharp";
import WEB_FONTS from "../../docs/src/ui/web-fonts.json";

const repo = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const out = resolve(repo, "docs/public/og-canvas-v4.png");
const result = await build({
  absWorkingDir: repo,
  entryPoints: ["tools/oggen/artwork.tsx"],
  bundle: true,
  write: false,
  format: "iife",
  platform: "browser",
  jsx: "automatic",
  alias: {
    "react-native": "react-native-web",
    "@nannier/canvas": resolve(repo, "src/index.ts"),
    react: resolve(repo, "node_modules/react"),
    "react-dom": resolve(repo, "node_modules/react-dom"),
    "react-native-svg": resolve(repo, "node_modules/react-native-svg"),
  },
  external: [...Object.keys(JSON.parse(readFileSync(resolve(repo, "package.json"), "utf8")).peerDependenciesMeta), "expo-asset"],
  resolveExtensions: [".web.tsx", ".web.ts", ".web.jsx", ".web.js", ".tsx", ".ts", ".jsx", ".js", ".json"],
  mainFields: ["browser", "module", "main"],
  define: { __DEV__: "false", "process.env.NODE_ENV": '\"production\"', "process.env.EXPO_OS": '\"web\"', global: "globalThis" },
  loader: { ".js": "jsx", ".jpg": "dataurl", ".mp4": "dataurl" },
});
const fonts = Object.values(WEB_FONTS).filter(font => !("preload" in font) || font.preload !== false).map(font => {
  const data = readFileSync(resolve(repo, "docs/public", font.path.slice(1))).toString("base64");
  return `@font-face{font-family:"${font.family}";src:url(data:font/woff2;base64,${data});font-weight:${font.weight.join(" ")}}`;
}).join("");

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1, reducedMotion: "reduce" });
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.setContent(`<html><head><style>${fonts}body{margin:0;-webkit-font-smoothing:antialiased}</style></head><body><div id="root"></div></body></html>`);
  await page.addScriptTag({ content: result.outputFiles[0].text });
  await page.getByTestId("social-artwork").waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.getByTestId("social-collage").waitFor();
  await page.evaluate(async () => {
    await Promise.all(Array.from(document.images, image => image.decode()));
  });
  await page.evaluate(() => new Promise<void>(done => requestAnimationFrame(() => requestAnimationFrame(() => done()))));
  if (errors.length) throw new Error(errors.join("\n"));
  const png = await sharp(await page.screenshot()).flatten({ background: "#0a0a0f" }).png({ compressionLevel: 9 }).toBuffer();
  writeFileSync(out, png);
  // Keep the old public URL useful for pages and clients that cached it.
  writeFileSync(resolve(repo, "docs/public/og.png"), png);
  console.log(`wrote ${out} (1200×630, ${Math.round(png.length / 1024)} KiB) and og.png compatibility copy`);
} finally {
  await browser.close();
}
