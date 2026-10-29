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

// Pre-hydration only. Every page is pre-rendered for a window the server cannot measure,
// so the web shell assumes a wide one and renders the room rail beside a room's pages,
// with the page's content inset to clear it. On a phone the rail would cover the content
// until the bundle ran, and the reflow at hydration measured as a Cumulative Layout
// Shift. Below the hand-off's 760 px rail cut (S9) the rail (marked by
// docs/src/shell/rail.tsx) is hidden and the content's inset (marked by
// docs/src/ui/page.tsx) dropped until then; after hydration the shell renders no rail at
// those widths and no inset, so the rules change nothing. The id prefix outranks the
// class rules react-native-web writes, and the inset's rule must also outrank the inline
// style it writes for a computed value, hence !important.
// The document itself takes the page colour (the hand-off's root is `background:var(--bg)`,
// Component.dc.html line 95): any strip the app has not painted yet, a window grown faster
// than the shell's safe-area frame, or an overscroll, shows the page, never white. Dark is the
// exported look before hydration; the light look follows `html[data-look]` once the docs theme
// commits it (docs/src/ui/docs-head.tsx). The values are the tokens' `background` per scheme
// (styles/tokens/colors.css).
const SHELL_CSS =
  "html{background:#0a0a0f}html[data-look^=\"light\"]{background:#f2f2f7}" +
  "@media (max-width:759.98px){#root [data-shell-rail]{display:none}#root [data-shell-content]{padding-left:0!important}}";

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
