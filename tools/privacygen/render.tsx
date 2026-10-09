import { renderToStaticMarkup } from "react-dom/server";
import { AppRegistry } from "react-native-web";
import { Column, Container, ThemeProvider, lightColors, darkColors } from "@nannier/canvas";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { PrivacyContent } from "../../docs/src/ui/privacy-content";
import { PRIVACY_TITLE, PRIVACY_INTRO } from "../../docs/src/data/privacy-policy";

const ROOT = resolve(import.meta.dir, "../..");
const FACES = {
  "400": "Manrope_400Regular", "500": "Manrope_500Medium",
  "600": "Manrope_600SemiBold", "700": "Manrope_700Bold",
} as const;
const esc = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function Policy({ dark = false }: { dark?: boolean }) {
  return <ThemeProvider dark={dark} light={!dark} solid ssrScheme={dark ? "dark" : "light"} fonts={{ sans: FACES }}>
    <Container xxxl><Column padLoose><PrivacyContent /></Column></Container>
  </ThemeProvider>;
}

/** The document host only selects rendered theme versions and local
 * fonts. Every visible component and its styling comes from Canvas. */
export function privacyDocument(basePath = "") {
  AppRegistry.registerComponent("CanvasPrivacy", () => Policy);
  const views = [false, true].map(dark => {
    const theme = dark ? "dark" : "light";
    const { element } = AppRegistry.getApplication("CanvasPrivacy", { initialProps: { dark } });
    return `<main data-privacy-theme="${theme}">${renderToStaticMarkup(element, { identifierPrefix: `privacy-${theme}-` })}</main>`;
  }).join("\n");
  const { getStyleElement } = AppRegistry.getApplication("CanvasPrivacy");
  const nativeStyles = renderToStaticMarkup(getStyleElement());
  const path = basePath.replace(/\/$/, "");
  const fonts = Object.values(FACES).map(face => `@font-face{font-family:"${face}";src:url("${path}/privacy/fonts/${face}.ttf") format("truetype");font-display:swap}`).join("\n");
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(PRIVACY_TITLE)} | Canvas</title>
<meta name="description" content="${esc(PRIVACY_INTRO)}"><meta name="robots" content="index,follow">
${nativeStyles}
<style id="privacy-host">
${fonts}
:root{color-scheme:light dark}body{margin:0;background:${lightColors.background}}
[data-privacy-theme="dark"]{display:none}
@media(prefers-color-scheme:dark){body{background:${darkColors.background}}[data-privacy-theme="light"]{display:none}[data-privacy-theme="dark"]{display:block}}
</style></head><body>
${views}
</body></html>\n`;
}

export function generatePrivacy({ output = resolve(ROOT, "docs/public/privacy/index.html"), check = false, basePath = "" }: { output?: string; check?: boolean; basePath?: string } = {}) {
  const html = privacyDocument(basePath);
  const files = new Map<string, string | Buffer>([[output, html]]);
  for (const face of Object.values(FACES)) files.set(resolve(dirname(output), "fonts", `${face}.ttf`), readFileSync(resolve(ROOT, "docs/assets/fonts", `${face}.ttf`)));
  for (const [file, content] of files) {
    if (check) {
      if (!existsSync(file) || !readFileSync(file).equals(Buffer.from(content))) throw new Error(`Static privacy output is stale: ${file}. Run bun run privacy:gen.`);
    } else {
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(file, content);
    }
  }
  console.log(`${check ? "Verified" : "Wrote"} Canvas static privacy policy (${(Buffer.byteLength(html) / 1024).toFixed(1)} KB, no JavaScript or third-party requests).`);
}
