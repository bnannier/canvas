# @nannier/canvas

## 2.6.2

### Patch Changes

- 55d79fd: Fix optional peers being treated as required by Metro.

  The kit loads its optional peers through a guarded `require()` wrapped in
  `if (typeof require === "function")`. That `if` defeats the mechanism it was
  meant to support: Metro's `isOptionalDependency` walks up from the require and,
  at the first enclosing block statement, returns whether that block belongs to a
  `TryStatement`, without climbing further. The `if`'s own block answers no, so
  Metro registered a required edge and any consumer who skipped the peer failed to
  bundle with "Unable to resolve module".

  Every one of the nine sites now places the require directly inside the try. The
  runtime behaviour is unchanged: where `require` is undefined the ReferenceError
  lands in the same catch that already absorbed a missing module.

  Consumers who install every optional peer see no difference. Consumers who skip
  one, which is the documented and supported case, can now bundle under Metro.

## 2.6.1

### Patch Changes

- 2f3461d: Backdrop: add the optional GPU-backend capability layer, inert for now.

  Declares `@shopify/react-native-skia` as an OPTIONAL peer dependency and adds a
  guarded capability probe behind it, so a later release can upgrade `Backdrop` to
  a GPU renderer for the effects `react-native-svg` structurally cannot express
  (procedural noise, real blur, thousands of bodies in one draw call).

  Deliberately a patch rather than a minor: this adds no user-visible capability.
  The GPU renderer does not exist yet, so every backdrop renders exactly the same
  SVG baseline as before, on every platform, with or without the peer installed.
  What ships is the plumbing and its guarantees.

  The probe asks a capability question ("can this runtime allocate a Skia object
  right now?"), never a platform question, so the eventual upgrade is progressive
  enhancement rather than a platform fork. It resolves the peer through a guarded
  `require`, which `verify-package` now enforces for this specifier alongside the
  existing optional peers: a consumer without the package installed must never hit
  an unresolved module.

  Two new exports for apps that load a backend themselves, notably on web where
  CanvasKit is fetched at runtime: `refreshBackdropRenderer()` re-runs the probe
  and notifies mounted backdrops, and `useGpuBackdrop()` reports whether one is
  live. Loading the backend stays the application's job, exactly as installing
  `expo-blur` is, which keeps the WebAssembly glue out of the kit's module graph.

## 2.6.0

### Minor Changes

- fed7369: Add `Backdrop`, the engine for a full-screen animated background.

  New user-visible capability: a consuming application can now ship an animated
  background through the kit instead of hand-rolling one. Canvas owns the surface,
  the shared clock, the per-platform frame budget and the accessibility ladder; the
  application owns the scene, composed from `Backdrop.Particles`,
  `Backdrop.Gradient`, `Backdrop.Shader` and `Backdrop.Custom` layers. The kit ships
  no artwork of its own, so the animation belongs to the app: point the same engine
  at different children and it renders something else entirely.

  Also exports `BackdropHost`, which lets one surface serve every `Backdrop` in an
  app (so a stack of screens shares a single drawing surface rather than one each),
  and `backdropClock`, so bespoke app-supplied art can bind to the same timeline as
  the declared layers.

  Semantic boolean axes: `energetic`/`calm` (rate), `dense`/`sparse` (field detail,
  which is also the frame-budget lever), `vivid`/`subtle` (weight), plus `still`.
  Reduce Motion renders a poster frame from the first paint, Reduce Transparency
  drops the translucent washes, and Increase Contrast paints the background token
  alone.

## 2.5.0

### Minor Changes

- 748111d: **`AlertDialog` gained the `overlay` presentation**, matching `Dialog`.

  It had the same in-flow default: a scrim sized for the docs preview, no
  positioning, no portal, and `aria-modal` asserted anyway. That is the wrong
  default for the component's main job, which is guarding a destructive action:
  the confirm appeared wherever it happened to be mounted while the page behind it
  stayed scrollable and clickable, so a user could reach the thing they were being
  asked to confirm destroying.

  With `overlay` it teleports into the nearest `OverlayProvider` and fills it. The
  contained behaviour is unchanged and remains the default, and with no provider in
  the tree it still renders in place rather than vanishing.

## 2.4.0

### Minor Changes

- e6c4638: **`Dialog` gained `accessibilityLabel`.** New capability: a dialog whose body is
  supplied as `children` can now carry an accessible name.

  Children REPLACE the built-in title and description, so there is no element left
  for `aria-labelledby` to reference and the dialog was announced with no name at
  all. That is poor for a `dialog` and invalid for the `alertdialog` that a
  `destructive` confirm renders, and there was no way to fix it from the call site
  because the prop did not exist. Dialogs using the data-driven `title` path are
  unaffected and keep naming themselves.

## 2.3.0

### Minor Changes

- 46088bd: Three capabilities the kit was missing, each found by building a real app against
  it rather than by reading the catalogue.

  **`Select` accepts `{ value, label }` options.** It previously took `options:
string[]`, so the stored value was always the visible text. Any list keyed by an
  id (a project id, a region slug, a workspace name) could not be expressed, and
  two separate apps grew the same wrapper independently. Bare strings still work
  and still mean the value is the label, so this is backward compatible.

  **`Card` gained `icon` and `actions` header slots.** `Card` already carried
  `title` and `description`; what consumers kept rebuilding around it was a leading
  glyph and a trailing action in the same header row.

  **`Dialog` gained an `overlay` presentation.** The existing dialog renders inline
  in normal flow with a scrim sized for the docs preview, which is right for the
  catalogue and wrong for an application: it appends a backdrop wherever the
  component happens to be mounted, leaves the page behind scrollable and clickable,
  and still asserts `aria-modal`. In a consumer app that meant a delete
  confirmation appearing at the bottom of the page while the page behind it stayed
  interactive. With `overlay`, the dialog teleports into the nearest
  `OverlayProvider` and fills it, so `aria-modal` is true rather than aspirational.
  The contained behaviour is unchanged and remains the default; with no provider in
  the tree an overlaid dialog still renders in place rather than vanishing.

## 2.2.1

### Patch Changes

- 0bfb91f: Fix the stale package-entry comment that still listed Image among the raw
  primitives; Image graduated to a Canvas atom. No runtime change.

## 2.2.0

### Minor Changes

- f77bb67: The published package is now MIT licensed.

  Canvas was previously published as `UNLICENSED` with no licence file, which in npm's
  vocabulary means proprietary, all rights reserved. Anyone who installed it therefore had
  no grant of rights to use it at all, despite the project being described publicly as open
  source. That is now fixed for consumers: `license` is `MIT`, and the MIT text ships inside
  the tarball.

  The grant is deliberately scoped to the distributed package. The source repository stays
  all rights reserved, so the licence file is generated at pack time by `tools/licensegen`
  rather than committed, because a `LICENSE` at the repository root is exactly how GitHub
  decides a repository's licence and committing it would extend MIT to the source too.

  Nothing about the API, the build output or the runtime changes; this only adds the
  permission to use what was already being published.

## 2.1.0

### Minor Changes

- 0f90a3c: Sidebar now declares itself as the navigation landmark, and GlassSurface accepts a `role`.

  A sidebar of nav rows is the page's navigation, but the shell rendered as an
  unlabelled stack of views, so every row inside it sat outside any landmark. Screen
  reader users had no way to jump to the navigation or skip past it, and axe's `region`
  rule flagged the contents. The shell now carries `role="navigation"` in both its plain
  and header/footer forms.

  That was only possible because `GlassSurface` took a closed set of props, so it has
  gained an optional `role` that forwards to the root element, threaded through the web,
  Android and iOS materials as well as the plain and degraded fallbacks. It is spelled
  with React Native's universal `role` prop, which React Native Web renders as the
  matching HTML element and native maps onto its own traits, so no per-platform branch is
  involved. Reach for it on any glass surface that is a structural shell, for example
  `role="banner"` on a top bar; leave it off decorative surfaces like popovers and menus,
  which already carry a role of their own.

  Both changes are additive and backward compatible: existing markup gains a landmark it
  did not have, and no visual output or layout changes.

## 2.0.1

### Patch Changes

- 0988c64: Sidebar now marks its active row with `aria-current="page"` instead of `aria-selected`.

  ARIA permits `aria-selected` only on roles that carry a selected state, such as
  `option`, `tab` and `row`. A sidebar row is a `button`, so browsers discarded the
  attribute as invalid and assistive technology announced every row as unselected,
  including the current page. The row is navigation, so it now uses the same spelling
  Navbars, Breadcrumb and Pagination already use.

  The native `accessibilityState={{ selected }}` is unchanged, since a selected state is
  valid on iOS and Android and is what VoiceOver and TalkBack read.

  If you query the DOM for the active row, match on `[aria-current="page"]` rather than
  `[aria-selected="true"]`.

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
