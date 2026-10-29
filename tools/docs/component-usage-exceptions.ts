import type { DocsUsageException } from "./component-usage.ts";

// This is an infrastructure inventory, not a grandfathered list of docs controls.
// Each entry is limited to a named function, host, keys and occurrence count.
// Do not add examples, look-alike controls, callout surfaces or typography here.
export const DOCS_USAGE_EXCEPTIONS: readonly DocsUsageException[] = [
  {
    file: "docs/src/ui/preview-viewport.tsx", owner: "PreviewViewport", tag: "View", attribute: "style", keys: ["height"], occurrences: 1,
    reason: "Docs-only viewport harness supplies a definite parent height for app-sized previews inside the unbounded page scroller, and the 300 px of the section hero's stage (the v4 hand-off's canvas-hero.js `.st`); it paints no control or surface.",
  },
  {
    file: "docs/src/ui/showcase/hero.tsx", owner: "StageGround", tag: "View", attribute: "style", keys: ["bottom", "left", "pointerEvents", "position", "right", "top"], occurrences: 1,
    reason: "The section hero stage's ground (the v4 hand-off's canvas-hero.js `.st`: two radial washes and an 18 px dot grid fading downward), the one docs-only brand illustration the rules allow: an untouchable layer spread over the stage it sits in, painting only the svg; the stage itself is the kit Card.",
  },
  {
    file: "docs/src/ui/showcase/stage.tsx", owner: "StageGlow", tag: "View", attribute: "style", keys: ["height", "left", "opacity", "pointerEvents", "position", "top", "width"], occurrences: 1,
    reason: "A Navigation section stage's blurred accent glow (the hand-off's `radial-gradient(circle,var(--ion),transparent 65%);filter:blur(...)` box behind the navbar and the tab bar, decision OD-1): an untouchable layer at the hand-off's box in the well, painting only the svg; the well itself is the kit Card.",
  },
  {
    file: "docs/src/ui/showcase/stage.tsx", owner: "SectionStage", tag: "View", attribute: "style", keys: ["justifyContent", "minHeight"], occurrences: 1,
    reason: "A Navigation section stage's height floor inside the kit Card well (the hand-off's `min-height:340px` navbar stage and 150 px tab-bar stage, its bar pinned to the foot), decision OD-1; it paints nothing.",
  },
  {
    file: "docs/src/ui/showcase/stage.tsx", owner: "PagePlaceholder", tag: "View", attribute: "style", keys: ["gap", "minHeight", "padding", "pointerEvents"], occurrences: 1,
    reason: "The navbar stage's placeholder page body (the hand-off's `padding:24px;gap:14px` block under a 280 px floor), an untouchable diagram of page content, decision OD-1; it is no control.",
  },
  {
    file: "docs/src/ui/showcase/stage.tsx", owner: "PagePlaceholder", tag: "View", attribute: "style", keys: ["backgroundColor", "borderRadius", "height", "width"], occurrences: 2,
    reason: "The placeholder page's heading bar and closing block (the hand-off's 12 px bar at 40 %, radius 6, and its 100 px block, radius 14, both in --sf3), diagram scenery, decision OD-1.",
  },
  {
    file: "docs/src/ui/showcase/stage.tsx", owner: "PagePlaceholder", tag: "View", attribute: "style", keys: ["flexDirection", "gap"], occurrences: 1,
    reason: "The placeholder page's row of three tiles 12 apart (the hand-off's three-column grid), diagram scenery, decision OD-1.",
  },
  {
    file: "docs/src/ui/showcase/stage.tsx", owner: "PagePlaceholder", tag: "View", attribute: "style", keys: ["backgroundColor", "borderRadius", "flexBasis", "flexGrow", "flexShrink", "height", "minWidth"], occurrences: 1,
    reason: "The placeholder page's 80 px tiles (radius 14, --sf3), diagram scenery, decision OD-1.",
  },
  {
    file: "docs/src/ui/showcase/card.tsx", owner: "header", tag: "Column", attribute: "style", keys: ["minWidth"], occurrences: 2,
    reason: "The section card header's title and meta cells floor at their longest word, the width a CSS flex item keeps (`min-width:auto`) and React Native's boxes do not, so a label like CANDLESTICKCHART never breaks mid-word at 375; the floor is computed from the pageLabel role's own metrics and paints nothing.",
  },
  {
    file: "docs/src/ui/showcase/card.tsx", owner: "Stage", tag: "View", attribute: "style", keys: ["alignItems", "height", "justifyContent", "minHeight", "paddingHorizontal", "paddingVertical"], occurrences: 1,
    reason: "An Overlays stage card's body inside the kit Card (decision OD-1): the hand-off's fixed stage height (`height:460px`), or its growing and centred stages (`min-height:540px` / `560px;display:grid;place-items:center;padding:48px 24px`); it paints nothing.",
  },
  {
    file: "docs/src/ui/showcase/card.tsx", owner: "Stage", tag: "View", attribute: "style", keys: ["alignItems", "alignSelf", "left", "marginTop", "position", "right", "top"], occurrences: 1,
    reason: "The stage's chip row placed as the hand-off places it (in the flow at `margin-top:-6px`, or centred at the top of a grid stage), under the scene and the scrim; the chips themselves are kit Chips.",
  },
  {
    file: "docs/src/ui/showcase/card.tsx", owner: "Stage", tag: "View", attribute: "style", keys: ["backgroundColor", "bottom", "left", "pointerEvents", "position", "right", "top"], occurrences: 2,
    reason: "The stage's two untouchable pinned layers: the full-bleed `--scrim` (the `scrim` token) over the faux page, for an open overlay that draws no dim of its own (the bare Command palette), and the label at the hand-off's `left:16px;top:14px` (kit Typography inside); scenery, decision OD-1.",
  },
  {
    file: "docs/src/ui/showcase/card.tsx", owner: "Stage", tag: "View", attribute: "style", keys: ["flexGrow"], occurrences: 1,
    reason: "A growing stage's overlay layer: the embedded overlay fills the stage in the flow, so its own dim covers it; it paints nothing.",
  },
  {
    file: "docs/src/ui/showcase/card.tsx", owner: "Stage", tag: "View", attribute: "style", keys: ["bottom", "left", "paddingBottom", "paddingLeft", "paddingRight", "paddingTop", "position", "right", "top"], occurrences: 1,
    reason: "A fixed stage's overlay layer spread over the stage at the hand-off's inset (the popover stage's `inset:0;padding:22px 20px 24px`), holding the kit overlays; it paints nothing.",
  },
  {
    file: "docs/src/ui/showcase/stage-scene.tsx", owner: "Bar", tag: "View", attribute: "style", keys: ["backgroundColor", "borderRadius", "flexBasis", "flexGrow", "flexShrink", "height", "minWidth", "width"], occurrences: 1,
    reason: "A stage scene's placeholder bar or tile of the faux app page (the hand-off's `--sf3` blocks at their widths, heights and radii), diagram scenery, decision OD-1.",
  },
  {
    file: "docs/src/ui/showcase/stage-scene.tsx", owner: "Tiles", tag: "View", attribute: "style", keys: ["flexDirection", "gap"], occurrences: 1,
    reason: "A stage scene's row of equal placeholder tiles (the hand-off's `grid-template-columns:repeat(n,1fr)`), diagram scenery, decision OD-1.",
  },
  {
    file: "docs/src/ui/showcase/stage-scene.tsx", owner: "Layer", tag: "View", attribute: "style", keys: ["bottom", "left", "opacity", "padding", "paddingBottom", "paddingLeft", "paddingRight", "paddingTop", "pointerEvents", "position", "right", "top"], occurrences: 1,
    reason: "A stage scene's untouchable layer spread over the stage at the hand-off's inset, padding and opacity (`position:absolute;inset:0;padding:24px;opacity:.9`), diagram scenery, decision OD-1.",
  },
  {
    file: "docs/src/ui/showcase/stage-scene.tsx", owner: "RailPage", tag: "View", attribute: "style", keys: ["flexDirection", "gap"], occurrences: 1,
    reason: "A stage scene's rail beside its body (the hand-off's `grid-template-columns:160px 1fr`), diagram scenery, decision OD-1.",
  },
  {
    file: "docs/src/ui/showcase/stage-scene.tsx", owner: "RailPage", tag: "View", attribute: "style", keys: ["gap", "width"], occurrences: 1,
    reason: "A stage scene's rail of bars at the hand-off's rail width, diagram scenery, decision OD-1.",
  },
  {
    file: "docs/src/ui/showcase/stage-scene.tsx", owner: "RailPage", tag: "View", attribute: "style", keys: ["flexBasis", "flexGrow", "flexShrink", "minWidth"], occurrences: 1,
    reason: "A stage scene's page body beside the rail taking the rest (`1fr`), diagram scenery, decision OD-1.",
  },
  {
    file: "docs/src/ui/showcase/stage-scene.tsx", owner: "DialogScene", tag: "View", attribute: "style", keys: ["gap"], occurrences: 1,
    reason: "The dialog stage's tiles over its block (the hand-off's 14 px grid gap), diagram scenery, decision OD-1.",
  },
  {
    file: "docs/src/ui/showcase/stage-scene.tsx", owner: "TilePage", tag: "View", attribute: "style", keys: ["gap"], occurrences: 1,
    reason: "A stage page's heading, tiles and block (the hand-off's `gap:14px` column), diagram scenery, decision OD-1.",
  },
  {
    file: "docs/src/ui/showcase/stage-scene.tsx", owner: "ActionSheetScene", tag: "View", attribute: "style", keys: ["gap"], occurrences: 1,
    reason: "The action sheet stage's photo over two bars (the hand-off's `gap:12px`), diagram scenery, decision OD-1.",
  },
  {
    file: "docs/src/ui/showcase/stage-scene.tsx", owner: "ActionSheetScene", tag: "View", attribute: "style", keys: ["borderRadius", "height", "overflow"], occurrences: 1,
    reason: "The action sheet stage's 160 px photo frame at radius 16 (the hand-off's `height:160px;border-radius:16px;overflow:hidden`), clipping the kit Image; diagram scenery, decision OD-1.",
  },
  {
    file: "docs/src/ui/showcase/stage-scene.tsx", owner: "CommandScene", tag: "View", attribute: "style", keys: ["gap"], occurrences: 1,
    reason: "The command stage's tiles over its block (the hand-off's 16 px grid gap), diagram scenery, decision OD-1.",
  },
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
  {
    file: "docs/src/app/+html.tsx", owner: "Root", tag: "link", attribute: "html", keys: ["link"], occurrences: 1,
    reason: "The web document preloads the three self-hosted variable faces it declares (decision D20): one JSX link mapped over docs/src/ui/web-fonts.json, so the faces are fetching before the bundle arrives; a head resource hint, not app UI.",
  },
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
    file: "docs/src/shell/native-header.tsx", owner: "ScreenFrame", tag: "View", attribute: "style", keys: ["flex", "overflow"], occurrences: 2,
    reason: "The Expo native stack needs a screen host that fills its available height, and the scroller inside the screen frame clips itself to that frame, since the frame does not clip.",
  },
  {
    file: "docs/src/ui/page.tsx", owner: "content", tag: "ScrollView", attribute: "style", keys: ["flex"], occurrences: 1,
    reason: "The page scroll host fills the native screen; it paints nothing, so the page look behind it shows through.",
  },
  {
    file: "docs/src/ui/page.tsx", owner: "content", tag: "ScrollView", attribute: "contentContainerStyle", keys: ["alignItems", "paddingTop", "width"], occurrences: 1,
    reason: "Page scroll content clears the floating pill navbar, supplies definite width to the page frame inside and centres it.",
  },
  {
    file: "docs/src/ui/page.tsx", owner: "content", tag: "ContentHost", attribute: "style", keys: ["flexBasis", "flexGrow", "flexShrink", "maxWidth", "width"], occurrences: 1,
    reason: "The overlay host wraps scroll content rather than using its app-root flex default, which would collapse the scroll child, and is the v4 hand-off's page frame: full width, capped at its 1440 px (off the kit's widths scale, design-language item 8).",
  },
  {
    file: "docs/src/ui/page.tsx", owner: "content", tag: "View", attribute: "style", keys: ["alignItems", "width"], occurrences: 2,
    reason: "The main landmark holds the lead and the capped page frame at the scroll content's full width and centres the frame, so the footer can follow it as a sibling contentinfo (the hand-off's main then footer), and a lead section (the Library hero) sits inside it at that full width so its backdrop reaches the window's edges as the hand-off's does; neither paints anything itself.",
  },
  {
    file: "docs/src/ui/page.tsx", owner: "content", tag: "View", attribute: "style", keys: ["paddingLeft"], occurrences: 1,
    reason: "The page content clears the web shell's room rail at the frame's start edge (the rail and its 28 px gap, decision S9); docs scaffolding, zero where no rail stands.",
  },
  {
    file: "docs/src/audit/driver.native.tsx", owner: "BandSensor", tag: "View", attribute: "style", keys: ["bottom", "left", "position", "right", "top"], occurrences: 1,
    reason: "The component audit's band sensor, built only into the native audit app: an empty, untouchable view laid over the page frame so the capture driver can measure the screen's frame; it draws nothing.",
  },
  {
    file: "docs/src/ui/stage.tsx", owner: "PlatformRow", tag: "View", attribute: "style", keys: ["left", "position", "top"], occurrences: 1,
    reason: "The noninteractive platform caption is overlaid on the comparison stage without changing the measured component bounds.",
  },
  {
    file: "docs/src/ui/stage.tsx", owner: "StageHost", tag: "OverlayProvider", attribute: "style", keys: ["flex", "minWidth"], occurrences: 1,
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
    file: "docs/src/shell/navbar.tsx", owner: "WebNav", tag: "SafeAreaView", attribute: "style", keys: ["flex"], occurrences: 1,
    reason: "The app's safe-area host fills the viewport, with the page look as its first child.",
  },
  {
    file: "docs/src/shell/navbar.tsx", owner: "WebNav", tag: "View", attribute: "style", keys: ["flex"], occurrences: 1,
    reason: "The main landmark host fills the window under the floating chrome, so the page scroller inside has a definite height.",
  },
  {
    file: "docs/src/app/(search)/search.tsx", owner: "NativeSearch", tag: "View", attribute: "style", keys: ["bottom", "flex", "left", "pointerEvents", "position", "right", "top"], occurrences: 2,
    reason: "The native screen root fills the viewport; keyboard/safe-area bounds anchor the real Canvas results above the OS-owned search field.",
  },
  {
    file: "docs/src/shell/page-backdrop.tsx", owner: "PageBackdrop", tag: "View", attribute: "style", keys: ["backgroundColor", "bottom", "left", "pointerEvents", "position", "right", "top"], occurrences: 1,
    reason: "The v4 hand-off's flat page, docs-only scaffolding under design-language item 8: an untouchable layer fixed to the window behind the shell, painted the scheme's background.",
  },
  {
    file: "docs/src/shell/page-backdrop.tsx", owner: "PageGrain", tag: "View", attribute: "style", keys: ["bottom", "left", "opacity", "pointerEvents", "position", "right", "top", "zIndex"], occurrences: 1,
    reason: "The v4 hand-off's grain, docs-only scaffolding under design-language item 8 and decision S6: an untouchable layer over the whole window at the scheme's grain opacity, holding the kit Image that tiles the baked noise.",
  },
  {
    file: "docs/src/shell/pill-nav.tsx", owner: "PillNav", tag: "View", attribute: "style", keys: ["alignItems", "left", "paddingHorizontal", "paddingTop", "pointerEvents", "position", "right", "top", "zIndex"], occurrences: 1,
    reason: "The banner row floats the v4 hand-off's pill over the page: centred, 14 px under the window's top and 16 px from its sides (SHELL in page-look.ts), untouchable outside the pill; docs scaffolding, it paints nothing.",
  },
  {
    file: "docs/src/shell/pill-nav.tsx", owner: "PillNav", tag: "View", attribute: "style", keys: ["maxWidth"], occurrences: 1,
    reason: "The Primary navigation landmark around the kit Navbar hugs the pill and caps it at the window less its sides, so the pill's row scrolls sideways where it does not fit (decision S1).",
  },
  {
    file: "docs/src/shell/rail.tsx", owner: "Rail", tag: "View", attribute: "style", keys: ["alignItems", "bottom", "flex", "left", "maxWidth", "paddingHorizontal", "pointerEvents", "position", "right", "top", "width", "zIndex"], occurrences: 3,
    reason: "The rail's layer floats over the page from the hand-off's 96 px down to the window's foot (untouchable outside the rail, painting nothing), centring the hand-off's page frame (full width, capped at 1440 px with its 24 px gutter) so the rail's 200 px column (decision S9) stands at the frame's start edge, holding its scroller to the window's height.",
  },
  {
    file: "docs/src/shell/rail.tsx", owner: "Rail", tag: "ScrollView", attribute: "contentContainerStyle", keys: ["paddingBottom", "paddingRight", "paddingTop"], occurrences: 1,
    reason: "The hand-off rail's own scroll padding (`padding:4px 6px 32px 0` on its aside), around the kit Sidebar it scrolls.",
  },
  {
    file: "docs/src/shell/footer.tsx", owner: "Footer", tag: "View", attribute: "style", keys: ["gap", "maxWidth", "paddingBottom", "paddingHorizontal", "paddingTop", "width"], occurrences: 1,
    reason: "The v4 hand-off's footer frame (FOOTER in page-look.ts: 96 px over, 48 px beside, 64 px under, 32 px under its hairline), capped at the hand-off's 1440 px page frame since it sits beside the main landmark rather than inside the page frame; everything inside it is a kit component.",
  },
  {
    file: "docs/src/ui/detail/frame.tsx", owner: "DotGrid", tag: "View", attribute: "style", keys: ["bottom", "left", "pointerEvents", "position", "right", "top"], occurrences: 1,
    reason: "The v4 detail page's dotted staging ground (the hand-off's 16 px dot grid behind a live specimen): an untouchable layer spread over the well it sits in, painting only the svg pattern; docs scaffolding under design-language item 8.",
  },
  {
    file: "docs/src/ui/detail/frame.tsx", owner: "renderComponent", tag: "component", attribute: "spread", keys: ["<computed prop>"], occurrences: 2,
    reason: "The detail page's Playground, Sizes, States and Anatomy render the documented component by name from the preview scope with the props its knobs set (the hand-off's `K.props`), over the props the component's first example gives it (its data, which no knob supplies). Both are built at run time: the knob props from the generated knob spec, which never carries a style, and the example props from the component's own docs examples, which the docs generator already holds to the no-styling rule.",
  },
  {
    file: "docs/src/ui/detail/playground.tsx", owner: "KnobPanel", tag: "ScrollView", attribute: "style", keys: ["maxHeight"], occurrences: 1,
    reason: "The hand-off's knob panel scrolls inside the playground frame past 560 px (its `max-height` on the panel) so a component with many knobs keeps the stage and its JSX in view.",
  },
  {
    file: "docs/src/ui/detail/playground.tsx", owner: "KnobPanel", tag: "ScrollView", attribute: "contentContainerStyle", keys: ["padding"], occurrences: 1,
    reason: "The hand-off's knob panel pads its knobs 18 px (Component.dc.html), inside the scroller so the padding scrolls with them.",
  },
  {
    file: "docs/src/ui/detail/playground.tsx", owner: "PlaygroundSection", tag: "View", attribute: "style", keys: ["width"], occurrences: 1,
    reason: "The hand-off's playground grid gives the knob panel a 300 px column beside the stage (`minmax(0,1fr) 300px`, its 1 px rule included), a harness frame number with no step on the width scale.",
  },
  {
    file: "docs/src/ui/detail/anatomy.tsx", owner: "Marks", tag: "View", attribute: "style", keys: ["bottom", "left", "pointerEvents", "position", "right", "top"], occurrences: 1,
    reason: "The anatomy figure's marker layer: an untouchable layer spread over the stage well beside the zoomed specimen (the hand-off places its markers against the padded stage, Component.dc.html lines 217 to 220, and the kit's zoom never touches them), measuring the stage the markers are clamped inside.",
  },
  {
    file: "docs/src/ui/detail/anatomy.tsx", owner: "Marks", tag: "Svg", attribute: "style", keys: ["left", "position", "top"], occurrences: 1,
    reason: "The anatomy figure's leader lines are drawn over the specimen at the part rectangles AnatomyProvider measured (the hand-off's `_measure`), so the svg sits at the figure's origin.",
  },
  {
    file: "docs/src/ui/detail/anatomy.tsx", owner: "Marks", tag: "View", attribute: "style", keys: ["alignItems", "height", "justifyContent", "left", "pointerEvents", "position", "top", "width"], occurrences: 1,
    reason: "Each numbered anatomy marker (a kit Badge) is centred on the point placed beside its measured part, untouchable so the specimen under it stays live.",
  },
  {
    file: "docs/src/ui/detail/platform-skins.tsx", owner: "PlatformSkinsSection", tag: "View", attribute: "style", keys: ["alignSelf", "maxWidth", "width"], occurrences: 1,
    reason: "The detail page's comparison stage simulates the selected form factor's width (the same harness the Playground page's preview card runs), centred and never wider than the page.",
  },
  {
    file: "docs/src/brand/glow.tsx", owner: "AuroraGlow", tag: "View", attribute: "style", keys: ["bottom", "left", "pointerEvents", "position", "right", "top"], occurrences: 1,
    reason: "Brand illustration (decision P5-G2): the Library hero's aurora, an untouchable layer spread over the hero section from the page's top to its hairline and out to the window's edges, painting only its svg radial gradients.",
  },
  {
    file: "docs/src/brand/glow.tsx", owner: "AuroraFrame", tag: "View", attribute: "style", keys: ["overflow", "width"], occurrences: 1,
    reason: "Brand illustration (decision P5-G2): the hero section spans the window's width, as the hand-off's full-bleed hero does, and clips the aurora spread behind it; it paints nothing itself.",
  },
  {
    file: "docs/src/brand/glow.tsx", owner: "AuroraFrame", tag: "View", attribute: "style", keys: ["alignSelf", "maxWidth", "paddingBottom", "paddingHorizontal", "paddingTop", "width"], occurrences: 1,
    reason: "Brand illustration (decision P5-G2): the hero section's own room around its content (the hand-off's section padding) and the content capped at the page frame's 1440 px (off the kit's widths scale, design-language item 8) and centred; it paints nothing itself.",
  },
  {
    file: "docs/src/brand/gradient-text.tsx", owner: "GradientText", tag: "View", attribute: "style", keys: ["alignSelf", "bottom", "left", "opacity", "pointerEvents", "position", "right", "top"], occurrences: 3,
    reason: "Brand illustration (decision P5-G1): the headline's gradient word, a kit Typography held invisible for the line box with the svg text drawn over it at the same place; React Native has no text clip.",
  },
  {
    file: "docs/src/brand/hero-collage.tsx", owner: "HeroCollage", tag: "View", attribute: "style", keys: ["height", "left", "position", "top", "transform", "transformOrigin", "width"], occurrences: 2,
    reason: "Brand illustration (decision P5-T1): the Library hero's tilted collage, the hand-off's 580 px perspective box with each live kit panel placed at its offset and projected by its own 3D transform.",
  },
  {
    file: "docs/src/ui/templates/frame.tsx", owner: "TemplateStage", tag: "View", attribute: "style",
    keys: ["alignItems", "backgroundColor", "borderColor", "borderRadius", "borderWidth", "overflow", "paddingHorizontal", "paddingVertical", "position"], occurrences: 1,
    reason: "Templates page stage: the hand-off's 24 px sunken well that centres the device frame; docs-only scaffolding around the live template, no kit control.",
  },
  {
    file: "docs/src/ui/templates/frame.tsx", owner: "TemplateStage", tag: "Svg", attribute: "style",
    keys: ["bottom", "left", "position", "right", "top"], occurrences: 1,
    reason: "Templates page stage: the accent glow's svg radial gradient spread under the device frame; it paints only the gradient.",
  },
  {
    file: "docs/src/ui/templates/frame.tsx", owner: "TemplateFrame", tag: "View", attribute: "style",
    keys: ["alignItems", "backgroundColor", "borderColor", "borderRadius", "borderWidth", "boxShadow", "flex", "flexDirection", "flexShrink", "height", "justifyContent", "maxWidth", "minHeight", "overflow", "position", "width"], occurrences: 6,
    reason: "Templates page device illustration (the hand-off's FRAMES): the browser window or handset chassis, its screen box and the home indicators, at the hand-off's sizes and capped at the stage width.",
  },
  {
    file: "docs/src/ui/templates/frame.tsx", owner: "BrowserBar", tag: "View", attribute: "style",
    keys: ["alignItems", "backgroundColor", "borderBottomWidth", "borderColor", "borderRadius", "flex", "flexDirection", "flexShrink", "gap", "height", "justifyContent", "marginHorizontal", "maxWidth", "paddingHorizontal", "width"], occurrences: 4,
    reason: "Templates page device illustration (the hand-off's FRAMES): the noninteractive browser title bar, its window-control dots and its address pill.",
  },
  {
    file: "docs/src/ui/templates/frame.tsx", owner: "IosStatusBar", tag: "View", attribute: "style",
    keys: ["alignItems", "backgroundColor", "borderRadius", "flexDirection", "flexShrink", "height", "justifyContent", "left", "marginLeft", "paddingLeft", "paddingRight", "paddingTop", "position", "top", "width"], occurrences: 2,
    reason: "Templates page device illustration (the hand-off's FRAMES): the iPhone status bar and its Dynamic Island cutout.",
  },
  {
    file: "docs/src/ui/templates/frame.tsx", owner: "AndroidStatusBar", tag: "View", attribute: "style",
    keys: ["alignItems", "backgroundColor", "borderRadius", "flexDirection", "flexShrink", "height", "justifyContent", "left", "marginLeft", "paddingHorizontal", "position", "top", "width"], occurrences: 2,
    reason: "Templates page device illustration (the hand-off's FRAMES): the Pixel status bar and its punch-hole camera.",
  },
  {
    file: "docs/src/ui/templates/app-chrome.tsx", owner: "WebSidebar", tag: "View", attribute: "style",
    keys: ["backgroundColor", "borderColor", "borderRightWidth", "flexShrink", "width"], occurrences: 1,
    reason: "Template app frame scaffolding: the hand-off's 220 px sunken rail that holds the kit Sidebar inside the framed browser window.",
  },
  {
    file: "docs/src/ui/templates/app-chrome.tsx", owner: "WebSidebar", tag: "ScrollView", attribute: "contentContainerStyle",
    keys: ["paddingHorizontal", "paddingVertical"], occurrences: 1,
    reason: "Template app frame scaffolding: the rail's inset around the kit Sidebar, the hand-off's 16/12.",
  },
  {
    file: "docs/src/ui/templates/app-chrome.tsx", owner: "IosHeader", tag: "View", attribute: "style",
    keys: ["flexShrink", "paddingBottom", "paddingHorizontal", "paddingTop"], occurrences: 1,
    reason: "Template app frame scaffolding: the iPhone large-title band's insets (the hand-off's iosApp header) around kit Icons and Typography.",
  },
  {
    file: "docs/src/ui/templates/app-chrome.tsx", owner: "PhoneTabBar", tag: "View", attribute: "style",
    keys: ["bottom", "left", "position", "right"], occurrences: 1,
    reason: "Template app frame scaffolding: floats the kit TabBar over the framed screen's scrolling content, as the iOS 26 tab bar floats.",
  },
  {
    file: "docs/src/ui/templates/explorer.tsx", owner: "FramedScreen", tag: "OverlayProvider", attribute: "style",
    keys: ["flex", "flexDirection", "minWidth"], occurrences: 1,
    reason: "Template app frame scaffolding: the framed screen's column beside the web sidebar, hosting the frame's overlays and toasts.",
  },
  {
    file: "docs/src/ui/templates/explorer.tsx", owner: "FramedScreen", tag: "ScrollView", attribute: "style",
    keys: ["flex", "minHeight"], occurrences: 1,
    reason: "Template app frame scaffolding: the framed screen's scroller fills what the app chrome leaves.",
  },
  {
    file: "docs/src/ui/templates/explorer.tsx", owner: "FramedScreen", tag: "ScrollView", attribute: "contentContainerStyle",
    keys: ["flexGrow", "paddingBottom", "paddingHorizontal", "paddingTop"], occurrences: 1,
    reason: "Template app frame scaffolding: the hand-off's screen insets (28 on the web, 16 on phones, 96 under the iOS floating tab bar).",
  },
];
