import type { PropsWithChildren } from "react";
import { ScrollViewStyleReset, useServerDocumentContext } from "expo-router/html";

// The document every pre-rendered page is written into (app.json `web.output:
// "static"`). The export writes each route into it, and the dev server does the same
// per request, so this is where the SITE-WIDE head lives: the description and the Open
// Graph / Twitter card. The per-page tags, the document title and the canonical link,
// come from the app (docs/src/ui/docs-head.tsx, through expo-router/head), and the
// static renderer splices them into <head> as text once this document has rendered,
// the same way it adds the stylesheet, the registered fonts' @font-face rules and
// preloads, and the favicon (the exporter adds the bundle's script tags afterwards).
// Nothing provides the server document context in a static render, so `headNodes`,
// `bodyNodes` and the attribute objects below are empty here; only Expo's streaming
// renderer fills them. (A public/index.html template is only read for a single-page
// export and would be ignored here.)
//
// The app is rendered as a React tree of its own and its markup placed into #root
// (docs/patches/@expo%2Frouter-server@57.0.7.patch patches Expo's static renderer to do
// that), because #root is exactly what the client hydrates, from an empty useId
// context. So nothing this document renders around #root reaches the app: no context,
// no state, and no position in the tree. Rendered inside this document, as Expo does
// unpatched, the app sat under <html> and <body>, which hold two children each, and
// every useId below #root came out different from the client's.
//
// This file is the one place in the docs that renders raw DOM elements, by design: it
// is the web document around the app, not UI, and expo-router ignores it on iOS and
// Android. og.png is generated from .github/assets/hero.png by `bun run og:gen`.
const DESCRIPTION =
  "Canvas is a universal React Native UI kit that renders native iOS, Material 3 Android, and web looks from a single component API. Semantic boolean props, accessible by default, with real Liquid Glass on iOS 26.";
const TITLE = "Canvas: One component API. Three native looks.";
const IMAGE_ALT = "The same Canvas Select component rendered as native iOS, Material 3 Android, and web, side by side";

// Pre-hydration only. Every page is pre-rendered with the desktop shell (the server
// cannot measure a window and the kit resolves an unmeasured viewport to desktop), so
// on a phone the sidebar rail would sit beside content squeezed into the remaining
// width until the bundle ran, and the reflow at hydration measured as a Cumulative
// Layout Shift of 0.3 to 0.9. The rail (marked by the shell, docs/src/shell/navbar.tsx)
// is hidden below the kit's desktop cut (width > lg, 1024) until then; after hydration
// the shell renders no rail at those widths, so the rule matches nothing. The id prefix
// outranks the class rule react-native-web writes for the same node.
const SHELL_CSS = "@media (max-width:1024px){#root [data-shell-rail]{display:none}}";

export default function Root({ children }: PropsWithChildren) {
  const { bodyAttributes, bodyNodes, htmlAttributes, headNodes } = useServerDocumentContext();
  return (
    <html lang="en" {...htmlAttributes}>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="description" content={DESCRIPTION} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Canvas" />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:url" content="https://canvas.nannier.com/" />
        <meta property="og:image" content="https://canvas.nannier.com/og.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={IMAGE_ALT} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={TITLE} />
        <meta name="twitter:description" content={DESCRIPTION} />
        <meta name="twitter:image" content="https://canvas.nannier.com/og.png" />
        {/* The react-native-web root reset: html, body and #root full-height, body scroll off. */}
        <ScrollViewStyleReset />
        <style id="canvas-shell">{SHELL_CSS}</style>
        {headNodes}
      </head>
      <body {...bodyAttributes}>
        {children}
        {bodyNodes}
      </body>
    </html>
  );
}
