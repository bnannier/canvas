import type { DocsUsageException } from "./component-usage.ts";

// This is an infrastructure inventory, not a grandfathered list of docs controls.
// Each entry is limited to a named function, host, keys and occurrence count.
// Do not add examples, look-alike controls, callout surfaces or typography here.
export const DOCS_USAGE_EXCEPTIONS: readonly DocsUsageException[] = [
  {
    file: "docs/src/core/photos.ts", owner: "Wrapped", tag: "Loose", attribute: "spread", keys: ["<unresolved props>"], occurrences: 1,
    expression: "createElement(Loose, next ?? rec)",
    reason: "The example-scope adapter forwards the existing Canvas component's props after resolving bundled sample-photo paths; it authors no control or style.",
  },
  ...["html", "head", "body", "style", "meta"].map(tag => ({
    file: "docs/src/app/+html.tsx", owner: "Root", tag, attribute: "html", keys: [tag],
    occurrences: tag === "meta" ? 17 : 1,
    reason: "Expo Router's web document and metadata surround the React Native app; these are not rendered app controls.",
  })),
  ...["html", "body"].map(tag => ({
    file: "docs/src/app/+html.tsx", owner: "Root", tag, attribute: "spread", keys: ["<unresolved props>"], occurrences: 1,
    expression: `${tag}Attributes`,
    reason: "Expo's useServerDocumentContext forwards server document attributes onto its HTML/body hosts.",
  })),
  ...["title", "link", "html"].map(tag => ({
    file: "docs/src/ui/docs-head.tsx", owner: "DocsHead", tag, attribute: "html", keys: [tag], occurrences: 1,
    reason: "Expo Router head metadata sets the document title, canonical address and hydration marker; it is not app UI.",
  })),
  {
    file: "docs/src/ui/docs-head.tsx", owner: "DocsLookMarker", tag: "html", attribute: "html", keys: ["html"], occurrences: 1,
    reason: "Expo Router head metadata marks the scheme and surface the docs theme has committed on the root element, for the browser suite; it is not app UI.",
  },
  {
    file: "docs/src/theme/docs-theme.tsx", owner: "DocsThemeProvider", tag: "StatusBar", attribute: "style", keys: ["<string:dark>", "<string:light>"], occurrences: 1,
    reason: "Expo StatusBar's style is its light/dark system-bar API, not a React Native style object.",
  },
  {
    file: "docs/src/shell/device-frames.tsx", owner: "DeviceFrame", tag: "View", attribute: "style",
    keys: ["alignSelf", "aspectRatio", "backgroundColor", "borderColor", "borderRadius", "borderWidth", "flex", "height", "overflow", "padding", "position", "top", "width"], occurrences: 5,
    reason: "Measured hardware illustration: bezel, screen clipping and camera cutouts around real native screenshots.",
  },
  {
    file: "docs/src/shell/device-frames.tsx", owner: "ChromeBar", tag: "View", attribute: "style",
    keys: ["alignItems", "backgroundColor", "borderBottomWidth", "borderColor", "borderRadius", "flex", "flexDirection", "gap", "height", "justifyContent", "left", "paddingHorizontal", "position", "right", "top", "width"], occurrences: 4,
    reason: "Noninteractive browser-chrome illustration scaled with the device capture, including decorative overflow dots.",
  },
  {
    file: "docs/src/shell/device-frames.tsx", owner: "ChromeBar", tag: "Text", attribute: "style", keys: ["color", "fontFamily", "fontSize"], occurrences: 1,
    reason: "The host label is drawn as part of the scaled browser-chrome illustration rather than readable page text.",
  },
  {
    file: "docs/src/app/(home)/testing/scroll-focus.tsx", owner: "ScrollFocusFixture", tag: "Card", attribute: "style", keys: ["overflow"], occurrences: 1,
    reason: "Dedicated scroll/focus fixture verifies an attached DataTable inside a clipping card.",
  },
  ...["DataTable", "StackedList", "Feed", "GridList"].map(tag => ({
    file: "docs/src/app/(home)/testing/scroll-focus.tsx", owner: "ScrollFocusFixture", tag, attribute: "style", keys: ["maxHeight"], occurrences: tag === "StackedList" || tag === "Feed" ? 2 : 1,
    reason: "Dedicated scroll/focus fixture constrains the scrollport to exercise real virtualized overflow and keyboard focus.",
  })),
  {
    file: "docs/src/shell/native-header.tsx", owner: "ScreenFrame", tag: "View", attribute: "style", keys: ["flex"], occurrences: 1,
    reason: "The Expo native stack needs a screen host that fills its available height.",
  },
  {
    file: "docs/src/ui/page.tsx", owner: "content", tag: "ScrollView", attribute: "style", keys: ["backgroundColor", "flex"], occurrences: 1,
    reason: "The page scroll host fills the native screen and supplies its root background.",
  },
  {
    file: "docs/src/ui/page.tsx", owner: "content", tag: "ScrollView", attribute: "contentContainerStyle", keys: ["paddingBottom", "paddingTop", "width"], occurrences: 1,
    reason: "Page scroll content clears the overlaid app bars and supplies definite width to the semantic Container inside.",
  },
  {
    file: "docs/src/ui/page.tsx", owner: "content", tag: "ContentHost", attribute: "style", keys: ["flexBasis", "flexGrow", "flexShrink"], occurrences: 1,
    reason: "The overlay host wraps scroll content rather than using its app-root flex default, which would collapse the scroll child.",
  },
  {
    file: "docs/src/ui/playground.tsx", owner: "PlatformRow", tag: "View", attribute: "style", keys: ["left", "position", "top"], occurrences: 1,
    reason: "The noninteractive platform caption is overlaid on the comparison stage without changing the measured component bounds.",
  },
  {
    file: "docs/src/ui/playground.tsx", owner: "stage", tag: "OverlayProvider", attribute: "style", keys: ["flex", "minWidth"], occurrences: 1,
    reason: "The shared comparison-stage overlay host must fill and shrink with its measured preview container.",
  },
  {
    file: "docs/src/ui/playground.tsx", owner: "stage", tag: "View", attribute: "style", keys: ["alignSelf", "flex", "maxWidth", "minWidth", "width", "zIndex"], occurrences: 2,
    reason: "The preview harness simulates selected device widths and raises the preview's overflow above its source-code panel.",
  },
  {
    file: "docs/src/ui/dont.tsx", owner: "DoDontCard", tag: "View", attribute: "style", keys: ["overflow"], occurrences: 1,
    reason: "The pedagogy frame clips deliberately incorrect examples so a Don't example cannot overflow the docs page.",
  },
  {
    file: "docs/src/app/(home)/rn-primitives.tsx", owner: "ScrollExample", tag: "ScrollView", attribute: "style", keys: ["maxHeight"], occurrences: 1,
    reason: "Isolated primitive pedagogy bounds a real ScrollView to demonstrate scrolling rather than a substitute control.",
  },
  {
    file: "docs/src/core/live-state.tsx", owner: "AppScreen", tag: "OverlayProvider", attribute: "style", keys: ["minHeight", "overflow"], occurrences: 1,
    reason: "The toast preview needs its own visible overlay viewport so the notification stays inside the example frame.",
  },
  {
    file: "docs/src/core/live-state.tsx", owner: "AppShell", tag: "OverlayProvider", attribute: "style", keys: ["height", "overflow"], occurrences: 1,
    reason: "The Sidebar example simulates a bounded app viewport so its real native drawer remains inside the preview.",
  },
  {
    file: "docs/src/shell/navbar.tsx", owner: "WebNav", tag: "SafeAreaView", attribute: "style", keys: ["backgroundColor", "flex"], occurrences: 1,
    reason: "The app's safe-area host fills the viewport and supplies the root background.",
  },
  {
    file: "docs/src/shell/navbar.tsx", owner: "WebNav", tag: "View", attribute: "style", keys: ["bottom", "flex", "left", "minWidth", "pointerEvents", "position", "right", "top", "zIndex"], occurrences: 4,
    reason: "Stable route/landmark hosts size the viewport and position measured top/bottom app bars above the page scroller.",
  },
  {
    file: "docs/src/app/(search)/search.tsx", owner: "NativeSearch", tag: "View", attribute: "style", keys: ["backgroundColor", "bottom", "flex", "left", "pointerEvents", "position", "right", "top"], occurrences: 2,
    reason: "The native screen root fills the viewport; keyboard/safe-area bounds anchor the real Canvas results above the OS-owned search field.",
  },
];
