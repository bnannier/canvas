# @nannier/canvas

## 2.14.0

### Minor Changes

- 9094fed: Ship the design tokens as plain CSS, and drop Tailwind from the stylesheet

  `styles/canvas.css` is now a manifest of nine token files under `styles/tokens/`
  (colors, palette, typography, spacing, radius, shadows, platforms, motion, base).
  It is plain CSS custom properties end to end: no `@import "tailwindcss"`, no
  `@theme`, no `@custom-variant`, no build step. A bare `<link>` resolves it.

  New capability, which is what makes this a minor: the published stylesheet now
  carries the **platform skin layer**, 732 `--p-*` custom properties that switch
  the whole look from one attribute, so a web surface can render the iOS 26 / HIG
  and Material 3 skins alongside the Canvas web look:

  ```html
  <div data-platform="ios">…</div>
  <div data-platform="android">…</div>
  ```

  That takes the shipped token surface from 71 properties to 932, adds the glass,
  delta and panel token families, and completes the radius scale (`--radius-none`
  through `--radius-3xl`, plus the per-platform shape aliases). Every existing
  token keeps its name and value; the one change is `--radius-sm`, now 2px inside
  the full scale, where it used to be 4px as part of a four-step set.

  Scheme still keys off `.dark` on the root element. The browser floor drops,
  because the layer now needs only `oklch()` and `color-mix()`: Firefox 113
  instead of 128, since `@property` and cascade layers are gone.

  `hsl(name)` (the web token helper) returned `hsl(oklch(…))`, invalid in every
  browser, because token values stopped being HSL triplets. It now returns the
  token value as-is, and applies alpha with `color-mix()`.

  **Migration, required for apps that use Tailwind utility classes.** Canvas's
  stylesheet used to be the Tailwind entry point by side effect, so importing it
  generated every utility in the consuming app. It no longer does. An app that
  writes `className="flex p-6 text-muted-foreground"` must own its own Tailwind
  setup: add these above the Canvas import in your global stylesheet.

  ```css
  @import "tailwindcss";
  @import "@nannier/canvas/styles/canvas.css";

  @custom-variant dark (&:where(.dark, .dark *));

  /* Canvas tokens as Tailwind colours, so bg-primary and friends resolve. */
  @theme inline {
    --color-background: var(--background);
    --color-foreground: var(--foreground);
    --color-card: var(--card);
    --color-card-foreground: var(--card-foreground);
    --color-popover: var(--popover);
    --color-popover-foreground: var(--popover-foreground);
    --color-primary: var(--primary);
    --color-primary-foreground: var(--primary-foreground);
    --color-secondary: var(--secondary);
    --color-secondary-foreground: var(--secondary-foreground);
    --color-muted: var(--muted);
    --color-muted-foreground: var(--muted-foreground);
    --color-accent: var(--accent);
    --color-accent-foreground: var(--accent-foreground);
    --color-destructive: var(--destructive);
    --color-destructive-foreground: var(--destructive-foreground);
    --color-success: var(--success);
    --color-success-foreground: var(--success-foreground);
    --color-warning: var(--warning);
    --color-warning-foreground: var(--warning-foreground);
    --color-border: var(--border);
    --color-input: var(--input);
    --color-ring: var(--ring);
    --color-chart-1: var(--chart-1);
    --color-chart-2: var(--chart-2);
    --color-chart-3: var(--chart-3);
    --color-chart-4: var(--chart-4);
    --color-chart-5: var(--chart-5);
    --color-chart-6: var(--chart-6);
    --color-chart-7: var(--chart-7);
    --color-chart-8: var(--chart-8);
  }
  ```

  Apps that only use Canvas components and `var(--token)` need no change.

## 2.13.0

### Minor Changes

- 880b4c2: ThemeProvider: new `ssrScheme` prop, the SSR/SSG hydration contract for scheme-aware colors.

  Minor justification: new public API capability. Server-rendered apps (Next.js
  static export and the like) can now tell the provider which scheme the server
  resolved. The provider renders that scheme on the server and for the hydration
  render, so the client's first render matches the server HTML exactly, then
  applies the real `scheme` right after mount; the switch re-renders every
  consumer, which writes the correct colors to the DOM. Without this, a client
  whose scheme differs from the server default (stored preference, OS dark mode)
  hits a React hydration attribute mismatch, and React keeps the server's inline
  colors on any component that never re-renders again: kit components appear
  stuck in the server's scheme after a refresh. Omitting the prop keeps the
  existing single-pass behavior; client-only apps and native are unaffected.

## 2.12.0

### Minor Changes

- 9e4cbc2: Card owns its rhythm: a padded surface now also spaces its flat children (padding implies gap), so a stack of Typography lines inside a Card needs no layout wrapper. The gap follows the platform density table: 16 on web and iOS, 12 on Android at the default density (the compact and comfortable steps already carried their own). `CardContent` picks up the same 16px flat-child rhythm. `flush` opts out of both the inset and the gap, sectioned cards are untouched (their sections pad themselves), and a single-child card renders pixel-identical since gap is inert with one child.

  Minor justification: new user-visible layout capability on the public Card API; padded cards and CardContent now space flat children without a Row or Column wrapper.

- 9e4cbc2: Collapsible and Accordion gain `card` and `description`, both backward compatible. `description` renders a muted secondary line under the title in the default trigger anatomy (on Accordion it lives per item, on `AccordionItem`); title truncation is unchanged. `card` wraps the disclosure (or the whole group) in an outlined card surface: an 8px-radius hairline card with 20px insets on web, the Material 3 outlined-card equivalent with 16dp insets on Android, and a documented no-op on iOS, where the default skin already renders the inset-grouped card.

  Minor justification: two new public props on Collapsible and Accordion (card surface variant and per-title description line), a user-visible API capability addition.

## 2.11.3

### Patch Changes

- 158d39e: dev-sync now mirrors straight into consumers' `node_modules/@nannier/canvas` overlays (stamped with `.origin`) instead of the former repo-root `.canvas` directories. Re-testing under clean conditions showed Turbopack live-watches real directories inside node_modules, so the `.canvas` indirection and consumer-side aliases were unnecessary.

## 2.11.2

### Patch Changes

- 2cafc58: `bun run dev` now pairs the tsc watch with a consumer sync watcher: it mirrors `dist/` and `styles/` into every sibling repo whose git-ignored `.canvas` marker points at this checkout, keeping locally linked consumers live-reloading while the kit is edited. Consumers overlay a real directory in node_modules because Next 16 Turbopack refuses out-of-repo symlinks there.

## 2.11.1

### Patch Changes

- 3be32c9: Add a root `dev` script (tsc watch on tsconfig.build.json) so locally linked consumers get live rebuilds of `dist/` while editing the kit.

## 2.11.0

### Minor Changes

- 3eb4265: Add the `Reveal` atom and `RevealGroup`: a scroll-triggered content entrance.

  New user-visible capability, which is what makes this a minor: the kit had no
  in-view primitive at all. Its only animation component, `Entrance`, fires on mount,
  is spring-only opacity plus scale, and has no delay, duration, direction, or trigger,
  so every app that wanted content to arrive as it scrolled into view had to reach
  outside the kit for it. `Reveal` is that capability, and it is additive: no existing
  export changes shape, and `Entrance` and the four overlays built on it are untouched.

  `<Reveal>` wraps content, holds it slightly offset and transparent, then travels it
  into place and fades it in when the element reaches the viewport, once. The API is
  semantic booleans on four axes and carries no numbers: direction (`fromBelow`, the
  default, plus `fromAbove`, `fromLeft`, `fromRight`), distance (`pronounced`), speed
  (`brisk`), and threshold (`deepInView`).

  `<RevealGroup>` makes stagger structural instead of numeric: it hands each child the
  next ordinal in document order and the child turns that into its own delay, so a
  mapped list cascades without any call site computing a per-item delay. It renders no
  host element, so it can sit between a grid and the items the grid lays out without
  disturbing the layout.

  Detection is a shared throttled ticker that measures only elements still waiting,
  and stops dead when the last one arrives, so a fully revealed page holds no timer.
  Every path that cannot produce a trustworthy measurement reveals the content: an
  entrance primitive must never be able to leave content invisible. Under Reduce
  Motion the whole mechanism is skipped, not merely shortened (no registration, no
  measurement, no timer), the final frame renders immediately, and the stagger is
  dropped with the motion, since delaying a static frame would only withhold content.

## 2.10.2

### Patch Changes

- 7ba848f: Count only the changesets that changesets itself will read.

  The release workflow decides whether to version, commit and tag by counting pending
  changesets with a shell `find`, and that `find` did not match changesets' own filter,
  which is `!file.startsWith(".") && file.endsWith(".md") && !/^README\.md$/i.test(file)`.
  It was missing the dotfile exclusion and its README check was case-sensitive.

  The consequence is small but confusing: a repo whose only pending entry is a scratch
  `.changeset/.draft.md` counted as one pending release, so the workflow took the
  version-and-tag path with nothing behind it and produced a no-op re-tag of the
  current version, which the existing `|| echo "Release already exists"` then hid.

  Over-counting is the safe direction, since the worst case is a wasted no-op, whereas
  under-counting would skip a real release. This change only ever removes entries
  changesets refuses to read, so it cannot cause a missed release. Verified against
  every filename case: a dotfile draft, a lowercase readme, a legacy directory
  changeset, and two real changesets.

  Found by adversarially reviewing a changeset guard in daedalus, then confirmed
  identical in all seven repos.

## 2.10.1

### Patch Changes

- 30c4385: DragDrop: never arm a pointer drag whose grip was already released. Arming is
  async (the zone/card measure spans a few macrotasks), so a grip tapped, or
  dragged and released, before the measure landed would arm a drag no pointer
  owned and leave the drop ring and source dim stuck until the next interaction.
  A per-grab session guard now invalidates any measure that finishes after
  release or after a newer grab.

## 2.10.0

### Minor Changes

- ffab6fc: Minor justification: two new user-visible capabilities ship on the public API.

  New `Board` organism: a data-driven kanban board composed from the kit's own
  DragDropProvider/DropZone/Draggable/DragHandle plus Card, Badge, and RowMenu.
  Columns scroll horizontally and are drop zones; cards carry a drag grip, an
  optional trailing badge, a 2-line muted description, a free-form `chips` slot,
  and an optional kebab menu. Works controlled (`items` + `onMove`, with
  `applyBoardMove` exported as the standard reducer and `BoardMove` reporting the
  insertion index plus `afterId`/`beforeId` neighbors) or uncontrolled
  (`defaultItems` + `onItemsChange`). Keyboard and screen-reader drag come from
  the DnD family (Space grabs, arrows move, Space drops, Escape cancels).

  `StackedList` gains `reorderable` + `onReorder` (rows get a leading drag grip
  and the list becomes a drop zone; order stays controlled by the consumer's
  items array) and a per-item `trailing` ReactNode slot rendered before the
  badge/meta cluster for inline controls. A bare StackedList renders exactly as
  before.

  Also: `DragHandle` now refuses pan-responder termination mid-drag, so a
  surrounding ScrollView (a board's lanes, a scrollable page) can no longer
  steal an in-flight drag on native.

## 2.9.1

### Patch Changes

- 9f00da3: Stop BackHandler console.error noise on web: Drawer, ActionSheet, and the Sidebar drill-down now wire Android hardware-back through a shared useHardwareBack hook that subscribes only while the overlay is open and never on web, where react-native-web's BackHandler shim logs "BackHandler is not supported on web" on every addEventListener call. Native behavior is unchanged.

## 2.9.0

### Minor Changes

- d86b6de: `StatItem` gains `steady`, which renders the delta muted rather than as a rise
  or a decline.

  A metric's second line is not always a change. It is often a qualifier: "last 30
  days", "8 M2M / 4 user". Colouring those green reads as good news the caller is
  not claiming. `steady` takes precedence over `down`, and omitting it leaves
  today's rise/decline behaviour exactly as it was.

## 2.8.0

### Minor Changes

- 79b8182: `Stats` gains a per-metric icon, header control and accent; `StackedList` gains a
  per-row badge tone.

  Minor rather than patch because both are new user-visible capabilities.

  `StatItem` takes `icon` (a glyph naming what the metric counts), `actions` (a
  control in the metric's header, a period selector or a filter) and one of
  `chart1` through `chart8`, which accents the headline value from the same
  categorical ramp the charts use, so a dashboard's tiles are tellable apart and a
  metric can carry the identity of the series it summarises. The accent recolors
  only the value: the delta keeps its own rise and decline semantics.

  `StackedListItem` takes `success`, `error`, `warning`, `info` or `neutral`,
  which tone its trailing `badge` as the kit's status pill. A service-health list
  can now say healthy, degraded and down in colour instead of three identical grey
  badges.

  Backward compatible throughout. A metric with no icon, control or accent renders
  exactly as before, and an untoned badge keeps its original `secondary` look.
  Both new axes are mutually exclusive with a documented first-match precedence.

## 2.7.0

### Minor Changes

- d3ce53e: `Card` now renders its header and footer sections beside raw children.

  Minor rather than patch because this is a new user-visible capability: a card
  can express a titled header, an icon, a header action and a footer ABOVE
  arbitrary children (a data table, a form, a list). Previously those props were
  silently dropped the moment children were passed, and the header only rendered
  on the data-driven path, where the body has to be a `string`.

  Backward compatible. A plain card, one with children and no section props, is
  untouched down to its computed surface style; the data-driven string path is
  unchanged; and children still win over a string `body` when both are passed.

  A sectioned card pads through its sections rather than its surface, so `padded`
  and the density booleans do not apply there and now emit a dev warning instead
  of being silently ignored.

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
