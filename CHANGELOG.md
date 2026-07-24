# @nannier/canvas

## 2.0.0

### Major Changes

- 94be12a: Remove the `Overlay` component (and its `OverlayProps` type). It was a redundant
  umbrella that re-implemented three surfaces the kit already ships as real,
  `Modal`-backed components: use `Drawer` for an edge or bottom panel, `Dialog` for
  a centered modal, and `ActionSheet` for a bottom action sheet. Unlike those,
  `Overlay` only painted a contained inline mock, so it could not present as a true
  floating overlay. Migration: replace `<Overlay drawer />` / `<Overlay sheet />`
  with `Drawer`, and `<Overlay modal />` with `Dialog`.

### Minor Changes

- d7968fa: Give the iOS Slider a real Liquid Glass handle. On iOS 26+ the slider handle
  "transforms into liquid glass during interaction" (WWDC25); the kit now renders
  the iOS thumb through the shared `GlassSurface` primitive, so when glass is the
  active surface (the platform default on iOS 26) the knob is a genuine Apple
  Liquid Glass control. It stays a bright puck (matching the system handle) whose
  Liquid Glass edge-lensing and specular show on physical iOS 26 hardware, and it
  springs up on press (Apple's scale/bounce). The press grow is an animated
  width/height resize, NOT a `transform: scale`, because a scale transform on the
  GlassView's ancestor degrades the Liquid Glass material. Under a solid surface,
  Reduce Transparency, or Increase Contrast it degrades to the previous opaque
  white capsule, and the Android and web handles are unchanged.

  Note: Apple's Liquid Glass only renders its blur/refraction on physical devices;
  on the iOS Simulator the handle shows as a bright capsule with a subtle rim.

  `GlassSurface` also gains an optional `tint` prop that overrides the translucent
  under-fill painted behind the material (default: the `popover` token), so a
  small glass control such as the slider knob can read as a bright puck rather
  than a popover-tinted panel.

### Patch Changes

- 5568134: Dialog, AlertDialog, and Popover no longer scroll the page when they open. Their
  focus management now moves focus into the panel with `focus({ preventScroll: true })`,
  so a modal that opens (or a `<Dialog open>` rendered inline mid-page) keeps focus for
  accessibility without yanking the surrounding scroll container to the panel.
- ae363cc: Dialog and AlertDialog panels now shrink to fit a narrow screen instead of
  overflowing. Their outer wrapper fills the available width (and the backdrop can
  shrink below the card's content width), so the panel's `maxWidth: "100%"` caps it
  to the container: on a phone the panel fits the viewport rather than running off
  the right edge, while on desktop it still renders at its per-size width, centered.
  The optional trigger button keeps its natural width.
- b810a87: Fix the Drawer bottom sheet's dimmed backdrop sliding up with the sheet. The
  bottom sheet was the only edge still using React Native Modal's native
  `animationType="slide"`, which transforms the whole modal (the scrim dim
  included), so the backdrop rose from the bottom instead of taking over the
  surface. Every edge now shares one manual slide path: a stationary full-screen
  dim that fades in while only the panel travels (the bottom sheet rises on
  `translateY` from `+panelHeight` to `0`, mirroring the top sheet). This makes the
  bottom sheet consistent with the left, right, and top variants.
- 21440d8: Fix the Drawer sliding in from the wrong side on the web (a left drawer opened
  "backward", sliding leftward into the edge instead of entering from off-screen
  left). React Native Web's `I18nManager` has no direct `isRTL` property, so
  `I18nManager.isRTL` read `undefined` on the web and the direction comparison
  `(edge === "right") !== I18nManager.isRTL` was always true, forcing every side
  drawer to the right-hand slide origin. All RTL checks now route through a new
  shared `isRTL()` helper backed by `I18nManager.getConstants().isRTL`, which is
  implemented on both native and web. This also corrects the same latent web bug in
  Dropdown, Listbox, Slider, Tabs, and Breadcrumb, whose right-to-left handling was
  silently skipped on the web.
