# @nannier/canvas

## 2.44.0

### Minor Changes

- 8753225: Sidebar: error-tone item badges.

  Minor justification (new public capability): Sidebar item badges can carry the
  error status tone for alert counts (badgeError), defaulting to secondary. A
  `SidebarItem` may now set `badgeError` beside its `badge`, and the row renders
  that count through the Badge atom's error status pill (`<Badge status error>`,
  the red dot-and-label form) instead of the default secondary metadata pill, so a
  Security row can report lockouts as a problem rather than a volume. The flag is
  an item-level boolean on the data object, following `RowMenuItem.destructive`,
  and it reaches both presentations of the same row: the rail and the narrow
  drill-down leaf. A row that omits it, or sets it with no `badge`, renders exactly
  as before, and the collapsed rail still folds the count into the row's accessible
  name.

## 2.43.0

### Minor Changes

- 39f1acd: ActionPanel: embedded children between the copy and the action.

  Minor justification (new public capability): ActionPanel accepts children
  rendered between its copy and action, so settings panels can embed field rows.
  `ActionPanelProps.children` is a `ReactNode`, and where it lands follows the
  layout the panel already resolves: stacked, it joins the panel's gap column
  between the copy and the action, so each element of the block is spaced by the
  skin's stacked gap; inline and in toggle mode the action stays pinned beside the
  copy, so the block renders full width below that row on the same rhythm. No skin
  field was added, and a panel that passes no children renders exactly as before.

## 2.42.0

### Minor Changes

- d2d6fa2: Feed: optional icon lead in the connector node.

  Minor justification (new public capability): Feed items may lead with a kit icon
  glyph in the connector node (icon over initials over dot); actor/action/target
  untouched. `FeedItem.icon` names a glyph from the kit icon set
  (`items={[{ icon: "shieldCheck", ... }]}`, typed `IconName`) and renders through
  the `Icon` atom, muted and decorative at 16pt inside the existing 28pt node, so
  an audit or automation stream no longer has to spell a system event as a pair of
  initials. The avatar lead ignores `icon` and keeps leading with the person; items
  that pass no `icon` render exactly as before.

## 2.41.1

### Patch Changes

- 871beea: Container measurement stops breaking hydration in server-rendered apps.

  `useContainerWidth` fell back to the window width before the first layout, and
  `useContainerBreakpoint({ seedViewport: true })` seeded from it the same way.
  On a server render there is no window, so the fallback resolved to 0 and a
  `Grid` shipped its cells with no width; on the client the window is available
  during the hydration render, so the very same cells resolved an explicit pixel
  width. React reported a hydration mismatch and, as it warns, did not patch the
  attributes up.

  Both now withhold the window value for one render, so the hydration pass is
  byte-identical to the server markup and the real width lands in the commit
  immediately after. This is the contract `ThemeProvider`'s `ssrScheme` already
  gives the colour axis. Client-only apps are unaffected: they see the fallback
  from their first commit exactly as before.

## 2.41.0

### Minor Changes

- 6129f30: `BreakpointOverride`: pin the viewport tier for a subtree.

  Minor justification (new public API): wrapping a subtree in
  `<BreakpointOverride value="sm">` makes the `useBreakpoint` / `useResponsive`
  / `useFormFactor` consumers under the provider resolve that bucket instead of
  the real window, so a preview stage or a test can exercise a phone or tablet
  branch inside a desktop window; `value={null}` clears the simulation. Two
  boundaries: mount it ABOVE your OverlayProvider when portaled overlay content
  should simulate too (the kit Portal renders overlays at the provider's
  outlet), and pair it with a width constraint on the same subtree, since
  container-measured components follow their real measured width (the docs
  playground's form-factor switcher does both).

- 9e1f1a7: ButtonGroup: icon segments.

  Minor justification (new public capability): an item may pair its label with a
  kit glyph (`items={[{ label, icon }]}`, new `ButtonGroupItem` type; strings
  keep working untouched), and the group-level `iconsOnly` boolean renders each
  segment as its glyph alone with the label as the segment's ACCESSIBLE name, so
  an icon-only segmented control (a view switcher, the docs' form-factor
  switcher) needs no hand-rolled look-alike. Glyph color tracks each platform
  skin's segment label treatment (new `segmentIconColor` skin field); the
  stepper and split kinds cycle the labels and ignore icons, with dev-only
  warnings on misuse.

## 2.40.5

### Patch Changes

- 43a4d67: Fix Steps `stacks` falsely stacking inside a row parent. The `stacks`
  measurement was attached to the horizontal root itself, but in a row parent
  that root hugs its content, so the first real layout measured the hugged width
  (well below the `sm` breakpoint) and Steps stacked vertically even in a wide
  container, flickering back through the horizontal layout on every relayout
  because the stacked branch spans full width. The measurement now rides the
  out-of-flow `containerProbe` sibling (the Tabs `responsive` fix's mechanism),
  rendered in both states so the stacked branch also tracks the real container
  width and un-stacks when the container widens.

## 2.40.4

### Patch Changes

- 712a574: The web hand-off's base rules move into `@layer base`, so an app can override them.

  `styles/tokens/base.css` emitted `*`, `body`, `a`, and `a:hover` unlayered. An
  unlayered rule outranks every layered one regardless of order, so a consuming
  app could not restyle an anchor at all: `a{color:var(--primary)}` beat
  `.text-primary-foreground`, and an anchor carrying a button's fill painted its
  label in the link colour, which is invisible on a primary fill. The same rules
  inside `@layer base` still win over a framework reset (they are imported after
  it, and layers resolve in declaration order) while losing to the component and
  utility layers. The `@keyframes` blocks stay unlayered, since layers order
  keyframe-name resolution too.

## 2.40.3

### Patch Changes

- f77ad4f: Fix responsive vertical Tabs flattening in wide containers. The `responsive`
  measurement was attached to the vertical rail itself, but the rail hugs its
  content (~180px), so the first real layout always measured at or below the `sm`
  breakpoint and the rail latched into the horizontal underline look even in a
  wide desktop container. The measurement now rides an out-of-flow container
  probe (a zero-height, absolutely positioned sibling that spans the parent,
  shared as `containerProbe` in the style layer), rendered in both states so the
  flattened row also tracks the real container width and restores the rail when
  the container widens.

## 2.40.2

### Patch Changes

- 2ae18cb: Tabs: a non-block underline/pills row longer than its container now pans
  horizontally instead of clipping (an inert-when-fitting horizontal scroller,
  no new prop; effective at any container width). Selecting a tab by press,
  roving arrow key, or a controlled `active` change scrolls it fully into view
  with a neighbor peek, honoring reduced motion. `block` and `vertical` are
  unchanged, and a flattened `responsive` vertical gains the same treatment.

## 2.40.1

### Patch Changes

- dc7bdc8: Docs examples never overflow a phone: 29 fixed-width example style objects
  across 7 component `.md` files (reveal, skeleton, divider, card, slider, chart,
  stacked-bar) now carry `maxWidth:"100%"`, and a new docgen guardrail hard-fails
  any future fence that pins a numeric width of 280 or more without a `maxWidth`
  (the existing `docgen-allow-style` opt-out still applies).

## 2.40.0

### Minor Changes

- ca16126: Pointer-capability hooks: `usePointerCoarse()` and `useHoverCapable()`.

  Minor justification (new public API): the input half of the desktop form
  factor (macOS via the web skin, and desktop web). Native iOS/Android resolve
  as touch-first constants; the web reads the standard `(pointer: coarse)` and
  `(hover: hover)` media features live, so an iPad browser, a touch laptop, and
  a mouse plugged into a tablet all resolve correctly. SSR and the pre-effect
  first frame default desktop-first (fine pointer, hover-capable). Capability
  only: no component behavior changes.

## 2.39.0

### Minor Changes

- d40e41b: Structural narrow modes: Navbar auto-collapse, Steps `stacks`, Tabs
  `responsive`, FilterPanel `responsive` drawer, GridList container basis.

  Minor justification (new capabilities and props):

  - Navbar now collapses AUTOMATICALLY at and below the `sm` container width: the
    links row swaps for a kit-owned menu button opening the platform Dropdown
    (active link checkmarked; `active`/`onSelect` unchanged). No new prop, and a
    deliberate default-behavior decision: the previous narrow rendering was a
    plain row clipping links off-screen, so there was no working behavior to
    preserve. GlassSurface gained an `onLayout` passthrough to support the bar
    measuring itself.
  - Steps: opt-in `stacks` + `stackBreakpoint` (default `sm`) renders the
    EXISTING vertical layout when the component's own container is narrow
    (horizontal layout only; `vertical`/`progress` unaffected).
  - Tabs: opt-in `responsive` renders a vertical rail as the existing horizontal
    underline look at and below `sm` container width.
  - FilterPanel: opt-in `responsive` + `drawerBreakpoint` (default `sm`) collapse
    the docked panel to a kit-owned "Filters (n)" outline Button opening the
    panel in a start-edge Drawer; `open`/`defaultOpen`/`onOpenChange` drive it
    for controlled use.
  - GridList's narrow collapse now measures its OWN container (viewport-seeded)
    instead of the window, so grids inside narrow desktop columns collapse too.

## 2.38.0

### Minor Changes

- 6c6147b: Responsive layout primitives: Row `stacks` and the new `Grid`.

  Minor justification (new public capability):

  - `Row` gains `stacks` (+ `stackBreakpoint`, default `sm`): the row renders as
    a Column when its OWN container is at or below the breakpoint,
    container-measured with a viewport seed, so it stacks inside a narrow desktop
    column too. When stacked the Row is exactly the Column with the same props
    (gap/justify/align/padding apply to the new axes, `wrap` is inert). Children
    keep their own sizing, which makes `stacks` the tool for content-sized rows
    (toolbars); ignored with a DEV warning on Column.
  - New `Grid` + `GridItem`: the container-measured auto-fit tile grid.
    `minTileWidth` (default 240) sets the floor, `columns` caps the desktop
    count, the gap scale is Row/Column's own booleans, and `GridItem wide` spans
    two cells. Pure math (`gridColumns` / `gridCellWidth`, exported) resolves the
    count from the measured container: no breakpoints at the call site, one
    measurement per grid, zero hooks per tile.

## 2.37.4

### Patch Changes

- da32627: Form `twoColumn` stacks by CONTAINER width; Sidebar warns on phone-width rails.

  - Form's two-column collapse now measures the form's own row wrapper instead of
    the window, with a threshold of one `wide` field (480px): a two-up split
    narrower than that cannot give each column a usable field. Behavior change,
    flagged: a `twoColumn` form inside a narrow desktop column (a split pane, a
    docs 3-up) now stacks where it previously stayed two-up and crushed; forms
    560px and wider keep their two-up layout everywhere. New public hook riding
    along: `useContainerWidth()` (own width with a window fallback until the
    first layout).
  - Sidebar: a non-`responsive` sidebar rendering at a phone-width viewport now
    logs a one-time DEV warning pointing at the `responsive` prop; the rail is
    unusable chrome there and the drawer needs a consumer-wired hamburger, so the
    gap is surfaced instead of silently rendering a 240px column.

## 2.37.3

### Patch Changes

- 0c5e629: GridList: the virtualized path now collapses to one full-width column at phone
  widths, matching the eager path; previously it kept 2-3 FlatList columns of
  100%-wide tiles. The grid also resolves its responsive tile width once at the
  parent instead of once per tile, so an N-tile grid carries one viewport
  subscription instead of N.

## 2.37.2

### Patch Changes

- 62ff81b: Measured narrow-container fixes for Calendar, DataTable, DescriptionList, and
  Board.

  - Calendar month: the grid container is now capped at 100% of its parent and
    the seven day cells shrink fluidly (32px floor) when the measured container
    is narrower than the natural grid, so a month calendar fits a 320pt phone
    instead of overflowing. Week/day timelines are untouched (they already
    flexed).
  - DataTable: the 320px minimum-width floor now drops once the table has
    measured a container narrower than the sm breakpoint, where the existing
    collapse/pan machinery guarantees readability; previously the floor clipped
    on 320pt devices.
  - DescriptionList `twoColumn`: the fixed 160px term column narrows to 120px at
    phone widths (restores the pre-refactor behavior lost when Field's display
    rows moved here), keeping the value column readable.
  - Board: lanes now fit a measured narrow board (lane fills the width minus a
    32pt peek of the next lane, 240px floor) instead of staying at the configured
    300px regardless of screen size; `columnWidth` still sets the desktop lane.

## 2.37.1

### Patch Changes

- 29b6955: Fix fixed-width surfaces overflowing narrow containers (phone screens).

  - AnchoredOverlay now clamps a width-aware card to its outlet: when the outlet
    is narrower than the card plus its edge insets, the card renders at outlet
    width minus the insets instead of running off-screen. Popover passes its card
    width through (new `cardWidth` field on `PopoverSkin`), so popover cards and
    the calendar peek both fit phone-width outlets; the popover skins also carry
    `maxWidth:"100%"` for the inline mode.
  - FilterPanel's fixed panel (280 web/iOS, 256 Android) and the Sidebar rail
    (240) gain `maxWidth:"100%"`, so they shrink inside narrower parents.
  - Vertical Tabs' fixed 180px rail now flexes down (96px floor, never past 40%
    of the row) and its labels truncate to one line, keeping the panel usable in
    narrow containers.

## 2.37.0

### Minor Changes

- 9a2f024: Container-measurement primitives: `useMeasuredWidth()` and
  `useContainerBreakpoint()`.

  Minor justification (new public API): the middle tier of the responsiveness
  system. `useMeasuredWidth` measures the element its `onLayout` is attached to
  (stable handler, re-renders only on rounded-width changes);
  `useContainerBreakpoint` resolves a `Responsive` map against the element's OWN
  width instead of the window, with an optional `seedViewport` for
  above-the-fold grids. Components that switch layout should measure their
  container, not the viewport: a component cannot know whether it is on a phone
  or in a 320px desktop panel.

  Internal adoption, no behavior change: the six components that hand-rolled the
  identical trigger-measurement handler (Dropdown, Select, Autocomplete,
  Popover, RowMenu, ButtonGroup) and DataTable's own-width measurement now ride
  these hooks.

## 2.36.0

### Minor Changes

- fb55fe0: Responsive core: shared viewport breakpoint store and form-factor tier.

  Minor justification (new public API): `useBreakpoint()` (the active viewport
  bucket), `FormFactor` / `formFactor(width)` / `useFormFactor()` (the semantic
  phone / tablet / desktop tier over the breakpoints, where desktop covers macOS
  and desktop web), and a `ssrBreakpoint` prop on `ThemeProvider` (the
  `ssrScheme` contract applied to the viewport axis).

  Behavior fixes riding along:

  - `responsive()` / `useResponsive()` now resolve a non-positive width (SSR and
    the pre-layout first frame, where react-native-web reports 0) to `base`, the
    desktop variant. Previously width 0 matched the smallest declared breakpoint,
    so servers and first frames rendered the PHONE branch of every consumer on
    desktop. The kit is desktop-first; unknown viewport now means desktop.
  - All viewport hooks share ONE Dimensions subscription and re-render consumers
    only when the active breakpoint bucket changes, not on every resize event.
  - `breakpoints` is now typed `Record<BreakpointKey, number>`, so indexing it
    with an arbitrary string is a compile-time error instead of a silent
    `undefined`.

## 2.35.3

### Patch Changes

- 53b9aef: InputOTP no longer paints its raw code across the middle of the row on Android.

  The single text input that captures the keystrokes sits over the whole segmented
  row and is meant to be invisible, with the cells doing the drawing. It was
  hidden with `color: "transparent"`, which Android does not honour, so the code
  being typed was painted in the default text colour across the centre of the
  field, on top of the cells. It is hidden with `opacity: 0` now, which every
  platform honours and which changes nothing else: an opacity-0 view still takes
  touches, still focuses, and is still read by assistive tech.

  Caught by the landing-page hero capture, which had been shipping the artefact in
  `input-otp-android.webp` for as long as those shots have existed.

## 2.35.2

### Patch Changes

- 36e45ce: Add a render-based colour check: `bun run check-render`.

  The kit already had two colour guards and both were structurally blind to the same class of error.
  `validate-tokens` compares `styles/tokens/colors.css` to `src/style/tokens.ts`, and `check-parity`
  compares the built types to a committed snapshot. Both sides of both checks live behind this
  commit, so they can only prove the kit is internally consistent. That is exactly how the `--ring`
  error survived: the CSS and the JS agreed with each other while both diverged from the design
  source, and nothing could see it for as long as they agreed.

  This check renders the hand-off's own colour guideline cards in chromium and reads the painted
  pixels, then compares them against the shipped tokens. One side of the comparison is an input
  nobody here can edit into agreement. Rendering rather than parsing also matters: a text parse gets
  `var()` chains, `color-mix(in oklab, …)` and out-of-gamut clipping wrong, while the browser
  resolves all three and a painted pixel is what a user actually sees.

  Verified by faithfully reproducing the ring bug — putting the wrong light `--ring` into BOTH the
  CSS and the JS so they agree, as they historically did. `validate-tokens` passes, `check-parity`
  passes, and this check reports the drift.

  Two legs, and the difference is stated wherever a reader will meet it. `--handoff <path>` renders
  the real export and is authoritative; the default renders a vendored copy under
  `tools/render-parity/handoff/` so CI can run at all. The vendored copy is itself behind this commit,
  so a green CI proves only that the kit has not drifted from the snapshot — refreshing that copy when
  the hand-off changes is where the real comparison happens.

  One accepted difference is recorded in `baseline.json`: dark `warning` is one step apart on the blue
  channel at a rounding boundary, where the exact conversion gives 9.4506 and Chrome paints 10.

  Patch: repository tooling, no change to the published package.

## 2.35.1

### Patch Changes

- 0311e9b: StackedList: the row divider takes `pointerEvents` from a style rather than the
  deprecated prop.

  The hairline between ruled rows was rendered as `<View pointerEvents="none">`.
  React Native has deprecated that prop in favour of `style.pointerEvents`, so
  every render of a ruled list logged "props.pointerEvents is deprecated. Use
  style.pointerEvents", including once per run of the kit's own console gate in
  `test/no-console-violations.test.tsx`.

  The declaration now comes from a module-level `StyleSheet.create`, composed onto
  the divider alongside the skin's hairline style. That is the kit's existing
  convention for this property (see `src/charts/shared/chart-inspect.tsx` and
  `src/organisms/toast/toast.shared.tsx`): react-native-web compiles
  `pointerEvents` into an atomic class only from a registered stylesheet entry and
  silently drops it from an inline style literal, so the registered form is the one
  that keeps the hairline inert to touch on web.

  Behaviour is unchanged on every platform. The divider still carries
  pointer-events none, verified in the rendered web output.

## 2.35.0

### Minor Changes

- ab32446: Backdrop: `twinkle` now scintillates individual bodies instead of fading the whole
  layer, and adds a `scintillate` channel to the exported clock.

  The minor is for the new public API: `BackdropClock` gains `scintillate`, a linear
  0..1 sawtooth at the flare period that an application's own `Backdrop.Custom` art
  can bind to the same way it already binds `flight`, `drift` and `event`.

  The effect itself was close to invisible, and the reason was structural rather than
  a matter of tuning. A twinkling layer multiplied ONE shimmer value into its single
  wrapper, so every body in the field rose and fell together over a 0.55..0.95 range.
  A field that changes brightness as a unit is a global luminance change, and the eye
  adapts straight through it; widening the range would only have made the whole sky
  pulse.

  Twinkling is now differential. A twinkling field is dealt into nine phase buckets by
  a hash of the body index (a hash, not `i % k`, because fields are generated on
  lattices and every k-th body would otherwise land on a regular sub-grid that flashes
  as a pattern). Each bucket is its own Animated.View over its own static Svg, riding
  the shared `scintillate` ramp at its own offset, through a flare curve with a fast
  attack and a long rest. Neighbouring bodies therefore flare at unrelated moments.
  Bodies big and bright enough to have earned one also carry a diffraction glint and a
  white core that ride the same curve, so a flaring star briefly grows spikes and goes
  hot rather than merely getting less transparent, which is what makes the effect read
  at two or three pixels across.

  The flare peaks exactly AT the layer's prominence cap rather than above it, so the
  legibility budget in `backdrop.styles.ts` still means what it says; the added
  contrast comes from the resting floor. Aggregate luminance behind text goes down,
  not up. The Reduce Motion poster still fans the buckets across the flare curve, so
  the still frame is a sky of bright and faint stars rather than one flat field.

## 2.34.0

### Minor Changes

- b38abbf: InputOTP matches the design hand-off's contract and pins its caret.

  Minor because it adds four public capabilities to `InputOTP`:

  - `groups`: split the run into dash-separated chunks (`length={6} groups={3}`
    reads 123-456). On the web skin, which connects cells within a run, each
    chunk now closes and rounds its own ends.
  - `alphanumeric`: accept letters as well as digits and ask for the text
    keyboard. The hand-off spells this as `numeric` with a `true` default, which
    reads backwards against the semantic-prop rule that passing a prop turns it
    on, so Canvas names the inverse (the `hideLegend` / `hideGrid` precedent).
    The default is unchanged: digits only.
  - `defaultValue`: seed the uncontrolled field, cleaned exactly as typed input
    is. Brings InputOTP in line with Input, Select, Autocomplete and Accordion.
  - `autoFocus`: focus on mount, matching Input's `TextEntryProps`.

  It also fixes a behaviour bug. One invisible text input spans the whole
  segmented row, so a tap dropped the native caret wherever the pointer landed,
  which on a partly-entered code is the middle of the string: typing 12, clicking
  the first cell and typing 9 produced 912 rather than 129. The selection now
  sits at the end of the code, so a keystroke always lands in the first unfilled
  cell. A full-range select-all is left alone, so pasting still replaces a
  complete code.

## 2.33.3

### Patch Changes

- fa3f618: ActionSheet: the backdrop now fades in instead of sliding up with the sheet.

  React Native's `Modal animationType="slide"` transforms the whole modal window,
  and the dimmed scrim lives inside it, so the backdrop used to travel up from the
  bottom edge along with the sheet. ActionSheet now drives the motion itself
  (`animationType="none"`, matching Drawer): a stationary full-screen dim layer
  fades from transparent to the skin's alpha while only the sheet slides on
  translateY. The Modal stays mounted through the exit so the slide-out is visible,
  then unmounts, and reduced-motion settings collapse both to zero duration.

## 2.33.2

### Patch Changes

- a177642: Move `Sparkline` from atoms to charts. It is the only component in `atoms` that took a data series
  (`values: number[]`); everything else there renders a single value or none. It now sits beside the
  other bare marks it belongs with, `StackedBar` and `BarList`.

  No API change: the export, its props and its rendering are untouched, and `/components/sparkline`
  is still its docs URL. What moves is the source directory, the barrel it exports from, and its
  grouping in the docs sidebar.

  This is a deliberate divergence from the design hand-off, which files `Sparkline` under atoms. The
  hand-off's own line puts anything needing a legend to be read (`StackedBar`, `Gauge`, `Heatmap`) in
  charts and leaves `Sparkline` out because it shows shape rather than values. That line is
  defensible, but plotting a series is the stronger signal, and grouping the kit's only
  series-plotting atom away from every other series-plotting component made it hard to find. Note
  that `check-parity` compares the prop surface only and does not compare tiers, so this divergence is
  recorded here rather than in `HANDOFF-PARITY.md`.

## 2.33.1

### Patch Changes

- 73e0024: `CodeBlock` paints an opaque surface.

  Its fill was `alpha(muted, 0.5)`, translated literally from a Tailwind `bg-muted/50` in the kit's shadcn-era origins, so a code block sitting over any backdrop showed it straight through the code: a photo, a gradient, or the glass surface mode's own aurora wash. The design hand-off paints this surface flat `var(--muted)`, and a code block is a content surface, which the kit's glass model deliberately leaves solid. The zebra tints, the inline code chip and the terminal chrome are unchanged; only the block's own panel fill moved.

## 2.33.0

### Minor Changes

- 6a57060: Menus are opaque cards in glass mode, and glass stops rewriting a semantic token.

  Glass used to work by overriding one semantic token: `popover` became translucent, and since `GlassSurface` takes its under-fill from that token and `AnchoredOverlay` renders every anchored card through it, every option-list menu in the kit inherited the translucency. Measured on a rendered page, a menu painted `rgba(255, 255, 255, 0.72)` over an SVG lens that deliberately keeps its centre optically flat, so the page behind read straight through between the rows. The design hand-off never did this: its `--popover` is opaque in both schemes, and glass paints from a separate `--glass-tint`.

  So the material now carries its own fill. `glassByScheme` publishes `glass-tint` (`rgba(255, 255, 255, 0.20)` light, `rgba(22, 22, 28, 0.30)` dark, both read from `styles/tokens/colors.css` and cross-checked by `validate-tokens` so the two layers cannot drift), `GlassSurface` defaults its under-fill to that instead of to `popover`, and `popover` and `card` keep their opaque values in every mode. The shipped CSS matches: the `[data-surface="glass"]` popover swap in `styles/tokens/surface.css` is gone, which also means the reduced-transparency and increased-contrast fallbacks genuinely turn the material off now, where before they resolved back to the translucent value.

  Which surfaces take the material follows the hand-off. Popovers, dialogs, action sheets, the command palette, navbars, tab bars and the sidebar are glass. The option-list menus (Dropdown, Select, Autocomplete, AvatarMenu, SplitButton's overflow menu), alert dialogs, toasts and chart tooltips are opaque cards, because a surface a reader picks rows from has to stay legible over whatever is behind it. Content surfaces stay solid as before.

  Breaking for one caller shape, which is why this is a minor rather than a patch: `glassByScheme` changed from `Record<ColorScheme, Partial<ColorTokens>>` to a `GlassTokens` family, so code reading `glassByScheme.light.popover` should read the opaque `colorsByScheme.light.popover` instead. The internal `ToastSkin.solidSurface` flag was removed, which is a skin field rather than a component prop.

## 2.32.0

### Minor Changes

- 072a91e: `Avatar` gains a `tiny` size step, and `AvatarMenu` now hangs its menu from the pill's trailing edge by default.

  New user-visible capabilities (the reason this is a minor, not a patch): a fourth boolean on Avatar's size axis, and a new `alignStart` boolean on AvatarMenu.

  - **`Avatar tiny`** is the 24px disc, joining `small` (28), the default (40), and `large` (48). Precedence on the axis is `tiny` > `small` > `large`. It keeps the 12px initials rather than scaling on down, because a proportional 10px pair of initials stops reading at that diameter. `AvatarGroup` takes it too, with its own overlap row, so a stack of tiny avatars stays uniform.
  - **`AvatarMenu` uses it for the pill's disc**, which is the fix this step exists for: the capsule is 32 / 36 / 40 tall on web / iOS / Android, so a 24px disc restores the intended 4 / 6 / 8 inset. With the 28px `small` disc it had been using, the web pill left only 2 and read as a tight ring around the photo.
  - **`AvatarMenu alignStart`** hangs the menu from the pill's leading edge.

  Behavior change to note when upgrading: `AvatarMenu`'s alignment default is now the TRAILING edge, where it was the leading edge in 2.30.0. A topbar parks the account pill at the trailing edge, and a leading-aligned menu there runs off the surface, so the trailing edge is what the design calls for and what almost every call site was already passing `alignEnd` to get. `alignEnd` still works and still means the same thing (it now spells out the default); pass the new `alignStart` for the old behavior. Plain `Dropdown` is untouched and still defaults to its leading edge.

  Also corrected against the design hand-off: the pill's open fill on web is now the real `color-mix(in oklab, ...)` (computed through a new `mixOklab` colour helper) instead of an sRGB channel lerp that landed 2/255 per channel too light in both schemes, and a disabled `Dropdown` trigger or row on iOS now dims to 0.4, the platform's own disabled opacity, instead of the web's 0.5.

### Patch Changes

- 072a91e: `AvatarMenu` opens its own platform's menu, and stands off by the hand-off's 6px.

  The pill rendered per platform while the menu under it did not: `avatar-menu.shared.tsx` imported `Dropdown` from the barrel, and a bare import resolves the web module in a browser bundler, so the docs' iOS and Android rows opened the web menu. Measured on the page before the fix, all three rows reported the web row metrics (0 min-height, 6px/8px padding, 2px row radius) where the plain Dropdown page reported three distinct skins (44pt iOS rows, 48dp Android, web). `createAvatarMenu` now takes the Dropdown to render, and each avatar platform entry builds it from that platform's own dropdown skin, the same injection `createEmptyState(iosSkin, ButtonIOS)` already uses. On a device Metro resolved this correctly either way, so this was the web preview and any web consumer, not native.

  The menu's standoff moves onto `DropdownSkin` as `menuGap` (4 on all three skins, the value the shell used to hard-code) and the account pill's menu is built at the hand-off's 6. It is skin-owned deliberately: a caller-facing pixel spacing prop on a public component is the re-spacing escape hatch the kit bans, and "6 instead of 4" has no honest boolean name.

- 072a91e: `Dropdown`: the menu takes focus when it opens, hands it back when it closes, and names itself.

  Three accessibility defects in the WAI-ARIA menu pattern, all on the path every app and docs page runs (an overlay host is mounted, so the menu is portaled):

  - **Focus never entered the open menu.** Focus was moved in the same commit that flipped `open`, but a portaled card is held back until the trigger measurement lands, so there was no row to focus yet: the roving arrow keys were dead and the menu sat at the end of the tab order. `AnchoredOverlay` now reports `onCardMount`, fired from an effect inside the card's own subtree (after every row's ref is attached) on both the portaled and inline paths, and the first enabled row takes focus there. No polling, no timeout guess. The focus move passes `preventScroll`, so a menu that renders open from its first commit never yanks the page to itself.
  - **Closing dropped focus on `document.body`.** Escape, a row press, an outside tap, and a controlled close now all return focus to the trigger. A close that did not orphan focus (the app closes the menu after the user has tabbed on) leaves focus exactly where the user put it.
  - **The menu had no accessible name and its identity header was loose generic text.** The menu is named from the header's title, falling back to the section `label`; the header is a `group` (a valid child of `menu`) named from its two lines. It stays unfocusable and out of the roving-focus count, which is still `items.length`.

## 2.31.1

### Patch Changes

- 1612852: Hand-off parity: record the differences the check cannot detect, and state that limit in the report.

  `check-parity` compares the prop SURFACE. Where a name exists on both sides it counts the prop
  satisfied no matter what that name resolves to, so a scale or spacing drift passes silently. That
  blind spot is now written into the report rather than left implied, alongside the second limit:
  the check reads a committed snapshot of the hand-off, so it cannot tell you the snapshot itself has
  fallen behind the design source.

  The first entry is Avatar. The kit's diameters are `tiny 24 / small 28 / default 40 / large 48`
  against the hand-off's `small 24 / default 32 / large 40`, so the scale sits one step high
  throughout. `small` and `large` exist on both sides, which is exactly why the prop check reported
  them satisfied. It was found by measuring rendered avatars, not by this tool. Re-scaling shipped
  avatars would be a visual break for every consumer, so it is tracked rather than done.

  Patch: repository tooling and a generated report, no change to the published package.

## 2.31.0

### Minor Changes

- 2ee9b65: `Dropdown` takes `triggerLabel`, the accessible name for a custom trigger.

  New user-visible capability (the reason this is a minor, not a patch): a custom trigger passed as `children` is a View, so nothing named the button that wraps it. The browser then names it from its contents, which reads the trigger's text nodes back to back with no punctuation and repeats the label of anything nested inside. An account pill announced as "Rachel Chenrachel.chen@example.com Rachel Chen" rather than "Rachel Chen, rachel.chen@example.com". `triggerLabel` puts the name on the button itself, where assistive tech reads it; omit it and the platform's own name-from-contents still applies, so triggers that read fine on their own are unchanged. The default `trigger` button is unaffected: its own text names it.

  `AvatarMenu` now passes its account name through this prop instead of labelling the capsule inside the button, which fixes the same announcement on every AvatarMenu.

## 2.30.0

### Minor Changes

- 914d333: Add `Field`, the form row that owns the message no control renders on its own.

  New user-visible capability (the reason this is a minor, not a patch): nothing in the kit could
  display a validation message. Every field family already owns its label, but helper and error text
  had no home, so callers hand-stacked a `Text` under an `Input` and drifted on the caption scale,
  the destructive tone, and the announcement. `Field` owns that slot: `helper` for the muted hint,
  `error` for the message, and `error` replaces `helper` in place so the row never changes height and
  nothing below it jumps.

  The load-bearing behavior is label delegation. When the row wraps a single field-family control
  (`Input`, `Textarea`, `Select`, `Autocomplete`) that carries no label of its own, `Field` hands the
  label and `required` down to it rather than drawing one alongside, so each platform still places it
  per its own contract: a static title above on web and iOS, the Material 3 in-container floating
  label on Android. A label rendered beside such a control could never float, which is exactly the
  Android divergence this avoids. Any other child (a `Switch`, a group) keeps the static label above.
  Delegation needs all three conditions — one element child, a label-owning control, and no label of
  its own — so two children, a plain view, or a control that already names itself all fall back
  safely rather than being clobbered.

  `Field` also delegates the error STATE, not just the text, so the control paints its destructive
  border while the row paints the message under it; an errored field that showed red text under a
  neutral box read as unfinished. The message is wired to the control with `aria-describedby` and
  announced with `role="alert"`, which the hand-off's own Field does not do.

  This supersedes 93dd68a9 ("remove Field and Fieldset"), and deliberately so. That removal was right
  about the component it removed: the old `Field` wrapped `Input` directly and carried a `rows`
  display mode that `DescriptionList` had already absorbed. This is a different component with a
  different reason to exist — the message slot and the label delegation, neither of which the removed
  one had. `Fieldset` stays removed.

## 2.29.0

### Minor Changes

- 8be8ba3: Add `AvatarMenu`, the account identity pill, to the Avatar family.

  New user-visible capability (the reason this is a minor, not a patch): the kit
  now ships the account-menu anatomy itself, so no app or topbar hand-composes one
  out of an `Avatar`, a hand-rolled name column, and a chevron. `AvatarMenu` is a
  single capsule trigger holding the avatar, the person's name over their email,
  and a trailing chevron that rotates while the menu is open, wired to the kit's
  own `Dropdown` for the menu (including its new identity header, so the name and
  email repeat above the rows).

  Boolean props follow the kit's semantic grammar: `compact` drops the name block
  for a topbar, `alignEnd` hangs the menu off the pill's trailing edge, and
  `disabled` makes the pill inert. The open state has the usual controlled and
  uncontrolled duality (`open` plus `onOpenChange`, interactive out of the box with
  neither), and `items` reuses the existing `DropdownItem` type.

  Per-OS metrics come from the platform skins: a 32px `secondary` capsule on web
  (with an `input`-coloured hairline and a 6% lifted fill when open), a 36pt
  hairline-outlined capsule on iOS that fills with `secondary` when open, and a
  40dp Material 3 tonal pill on Android (`primary` at 12%, 20% when open). The
  trigger announces itself as a menu button and takes its accessible name from the
  account holder, so a screen reader hears the person, not "button".

- 8be8ba3: Alert, Chip, and Toast take `destructive` for the danger tone.

  New user-visible capability (the reason this is a minor, not a patch): `destructive` is the name the intent axis already uses everywhere else in the kit, on Button, on AlertDialog, and on every chart, and it is the name the design hand-off uses on these three components too. Until now these three alone spelled it `error`, so a call site moving between a destructive Button and a destructive Alert had to change vocabulary mid-form.

  `error` keeps working, marked deprecated, and resolves through the same branch as `destructive`, so it paints exactly the same tone and no existing call site changes. Passing both is redundant rather than ambiguous: they share one branch, so the result is the danger tone either way, and the rest of the axis (`success`, `warning`, `info`, and the neutral default) is untouched.

- 8be8ba3: Give `Dropdown` an identity header, trailing-edge alignment, and a disabled trigger.

  Three new user-visible capabilities (the reason this is a minor, not a patch),
  all additive: a Dropdown that passes none of them renders exactly as before.

  `title` and `description` add an identity header block above the menu's rows: the
  title in the popover foreground, the description muted underneath, closed off by
  the card's own hairline before the first row. It coexists with the existing
  `label` section heading, which still sits between the header and the rows. The
  header is plain text, not a menu item, so it takes no tab stop and never enters
  the roving-focus count. The skins carry the gutter per platform (8 x 6 on web,
  16 x 6 on iOS, 16 x 8 on Android, each matching that skin's own section-label
  gutter) over one shared type scale.

  `alignEnd` hangs the menu off the trigger's trailing edge instead of its leading
  edge, for a trigger parked at the end of a bar where a leading-aligned menu would
  run off the surface. It holds on both paths: the inline anchor flips from a
  logical `start` inset to an `end` one, and the portalled path pins the card by an
  inset from the outlet's own edge (so no card measurement and no second layout
  pass). Both are logical, so a right-to-left locale mirrors them.

  `disabled` makes the whole control inert: the trigger dims by each platform's own
  disabled opacity, the press is a no-op, and a controlled `open` cannot force the
  menu out of a disabled Dropdown. The trigger carries `accessibilityState` and its
  `aria-disabled` alias, and both trigger forms now announce `aria-haspopup="menu"`
  alongside `aria-expanded`.

## 2.28.1

### Patch Changes

- 82b8a03: Add a hand-off parity check, so the component layer is guarded the way the token layer already is.
  `validate-tokens` compares every colour and metric against the design hand-off by value, but
  nothing compared the COMPONENT surface, which is how `Field`, `DashboardGrid` and `ChartFrame` sat
  absent from the kit without anything noticing.

  `bun run check-parity` compares the kit's built type surface against a committed snapshot of the
  hand-off's prop contracts and regenerates `HANDOFF-PARITY.md`. It deliberately does not demand
  identical prop names: Canvas's semantic-boolean rule rejects the string-enum props the hand-off
  uses freely, and React Native has no `onClick`. Every difference is adjudicated once in
  `tools/handoff-parity/divergences.json` as either settled (renamed, boolean axis, web-only, not
  offered) or an acknowledged open gap, and the check fails only on a difference recorded in
  neither place, so a hand-off revision surfaces loudly instead of silently.

  Resolving `extends` chains on the kit side is what makes the comparison meaningful:
  `AreaChartProps extends CartesianSeriesProps`, so an own-members-only read reports every inherited
  prop as missing and the result is noise rather than signal.

  Current state: 75 hand-off components, 72 present; 719 props compared, 503 matching by name, 151
  settled divergences, 65 tracked open gaps, 0 unclassified.

  Patch, not minor: this adds no capability to the published package. It is repository tooling plus
  a generated report.

## 2.28.0

### Minor Changes

- 69dac3f: Web hand-off: ship the `surface` and `density` theming axes, which the kit's own
  public API already assumed existed. `setSurface()` and `setDensity()` (exported
  from the package, alongside `getSurface`/`getDensity`) write `data-surface` and
  `data-density` onto the document element, but `styles/canvas.css` shipped no rule
  that responded to either attribute, so on the web both helpers were inert: they
  set an attribute and nothing changed. `styles/tokens/surface.css` and
  `styles/tokens/density.css` are now part of the stylesheet, imported between
  `platforms` and `motion` exactly as the design hand-off orders them.

  With them in place `data-surface="glass"` switches `--popover` to the translucent
  glass fill, sets `--surface-mode`, paints the orb backdrop the frosted panes
  refract, and carries the accessibility fallbacks that turn translucency off under
  `prefers-reduced-transparency`, `prefers-contrast: more`, and `print`.
  `data-density="compact" | "comfy"` remaps the padding steps (`--p-card-pad`,
  `--p-card-gap`, `--p-table-cell-pad-y`) to the values each platform skin already
  declares for that level, so compact under `data-platform="ios"` is iOS's own
  compact metric. Density moves padding only, never type size and never radius.

  Also adds the three z-index reserve tokens the hand-off carries in
  `spacing.css` (`--z-raised: 10`, `--z-dropdown: 40`, `--z-overlay: 50`), so a web
  consumer can layer against the same shallow scale the components use.

  Minor because it adds user-visible capability to a published export path: two
  theming axes a web consumer can now actually switch, and three new tokens. No
  existing token changed value. Verified by diffing all 2214 declarations in the
  hand-off against the shipped CSS (zero mismatches, zero missing) and by reading
  the computed custom properties out of a browser with each attribute applied.

## 2.27.1

### Patch Changes

- 404899a: Colors hand-off: condense the Liquid Glass commentary in `styles/tokens/colors.css`
  so the file fits its 2KB per-file gzip budget again. The file had crossed to 2089B
  against the 2048B cap, failing `check-size` on main. No token changed: all 78
  declarations are byte-identical, and only comment prose was removed.

  The block that shrank was the ~1KB Liquid Glass explanation, which restated at
  length what `src/style/glass-surface` implements and what the glass section of
  `CLAUDE.md` already documents. What a reader of the stylesheet actually needs
  stays: that glass is the functional layer's material and content surfaces remain
  solid, that it is a lens rather than a frost with the bend concentrated at the
  rim, and what `--glass-lens` and `--glass-frost` each are. The file now measures
  1834B gzip, so it carries 214B of headroom rather than the 34B it had before,
  which is what let a single comment edit push it over.

  A per-file exception was considered and rejected: `check-size.ts` justifies the
  `platforms.css` override precisely on the grounds that the 2KB guard must keep
  biting on `colors.css`, so excepting this file would undercut the reason the
  mechanism exists. Since the stylesheet ships to consumers, prose duplicated
  elsewhere is a cost every consumer pays to download.

## 2.27.0

### Minor Changes

- 4cd0950: Treemap: a new chart component for part-of-whole area tiles. Flat one-level `data` lays out through the shared squarified algorithm (Bruls; largest first, near-square aspect ratios, each rect staying attached to its datum's index), rendered as pure Views with no SVG: ramp-colored tiles separated by a card-colored hairline, with the label and formatted value rendered inside only when the tile fits them (measured through the shared text estimator; the card token contrasts with every chart fill). Pressing a tile selects it (the others dim to the shared inspection opacity), flags its value and share, and announces both; pressing between tiles clears; selection is controlled via `selected`/`onSelect` or uncontrolled via `defaultSelected`; `compact` shortens the plot and `formatValue` shapes the values. Nesting and drill-down are deferred scope, named here and in the docs. Minor because it ships a new user-visible chart component, `Treemap`, exported from `@nannier/canvas` (with the `TreemapDatum` type); no existing API changes. Like `Chart` it is a Shared platform treatment (identical on iOS, Android, and the web). Accessibility: the composition lives in the accessible name with values and shares ("Storage: Media 620 (62%), Backups 340 (34%), ..."), independent of which labels fit their tiles. devWarns cover empty `data`, more than 24 tiles, and negative values (zero area).

## 2.26.0

### Minor Changes

- c3a1a2c: FunnelChart: a new chart component for stage-by-stage conversion. Ordered `stages` render as a column of centered trapezoids through the shared funnel layout: each stage's top width proportional to its value, tapering to the next stage's width, the last stage rectangular, ramp-colored with real-text annotations centered on each stage (label, formatted value, and the conversion percent; the annotation text paints the card token, which the palette gates at 3:1 against every chart fill). The percent reads against the previous stage by default; `share` reads every stage against the first. Pressing a stage selects it by its vertical band (the others dim) with deduped announcements; selection is controlled or uncontrolled; `compact` shortens the funnel and `formatValue` shapes the values. Minor because it ships a new user-visible chart component, `FunnelChart`, exported from `@nannier/canvas`; no existing API changes. Like `Chart` it is a Shared platform treatment (identical on iOS, Android, and the web). Accessibility: the funnel is one image whose name walks the stages ("Signup funnel: Visits 1k, Signups 400 (40% of Visits), Paid 120 (30% of Signups)"). devWarns cover empty `stages` and a stage exceeding its predecessor.
- c3a1a2c: RadarChart: a new chart component for polygonal multi-axis comparison. Spoke labels come from `axes` (clockwise from 12 o'clock); each series draws one closed polygon through the shared polar helpers, ramp-stroked over a soft matching wash, on concentric polygon rings at nice tick fractions with a spoke per axis; the outer bound is a nice value above the data max, or the `max` override. Spoke labels render as real RN Text just beyond the outer ring, positioned from the same polar coordinates as the plot (never SVG text, matching the kit's chart typography rule). The tone axis applies to single-series charts (success > destructive, default primary); multi-series charts paint the chart-1..8 ramp with a reachable legend outside the plot image; `compact`, `hideLegend`, `hideGrid`, and `formatValue` behave as elsewhere. Press-to-inspect is deferred scope for this chart, named here and in the docs; the accessible name already carries every value. Minor because it ships a new user-visible chart component, `RadarChart`, exported from `@nannier/canvas`; no existing API changes. Like `Chart` it is a Shared platform treatment (identical on iOS, Android, and the web). Accessibility: the plot's name folds every axis and value per series ("Casey: Coding 8, Design 6, Comms 9; Jordan: ..."). devWarns cover empty `series`, fewer than three axes, an axes/values length mismatch, more than four overlapping polygons, and tone props on multi-series data.
- c3a1a2c: RadialBarChart: a new chart component for concentric attainment rings. One ring per `data` entry, innermost first: a muted full-circle track under a chart-1..8 ramp arc revealed clockwise from 12 o'clock (each ring is a stroked two-half-arc path, since an SVG circle's dash origin sits at 3 o'clock), all sweeping against one `max` (the largest entry by default) so the rings compare attainment rather than shares. A column legend carries the formatted values via `formatValue`; `compact` shrinks the disc; `hideLegend` drops the legend and hoists the image role to the root, StackedBar-style. Pressing a ring selects it by press radius (the others dim to the shared inspection opacity) and announces its share; pressing outside the rings clears; selection is controlled via `selected`/`onSelect` or uncontrolled via `defaultSelected`. Minor because it ships a new user-visible chart component, `RadialBarChart`, exported from `@nannier/canvas`; no existing API changes. Like `Chart` it is a Shared platform treatment (identical on iOS, Android, and the web). Accessibility: the composition lives in the accessible name ("Platform activation: iOS 64%, Android 48%, Web 82%"). devWarns cover empty `data` and more than six rings.

## 2.25.1

### Patch Changes

- 33f5213: The light `ring` token is the hand-off's indigo-500 (`#615fff`, `oklch(0.585 0.233 277.117)`) again, the same value the dark scheme already carried. An earlier pass read the shared value as a dark-mode leak and pointed light `ring` at the light `primary`, which made a focus outline the same colour as the primary fill it often sits on, so the ring vanished on exactly the control it was marking. The ring is deliberately one value in both schemes: it has to read against a light page, a dark page, and the primary fill. Both the CSS custom property and the JavaScript token now carry it, so a React Native call site and the web token layer agree.

## 2.25.0

### Minor Changes

- a688631: BoxPlot: a new chart component for comparing distributions. Each `data` category carries raw `values`; the chart computes the Tukey five-number summary (quartiles by linear interpolation, whiskers at the most extreme data inside the 1.5 IQR fences, outliers beyond) and draws the box, whisker spine with caps, median line, and hollow outlier dots per category on the cartesian frame, with the y domain hugging whisker ends and outliers rather than zero. Scrubbing a category flags Max/Q3/Median/Q1/Min and dims the others, with deduped announcements; selection is controlled or uncontrolled as on every cartesian chart. The tone axis resolves success > destructive (default primary); `compact`, `hideGrid`, `hideAxes`, and `formatValue` behave as elsewhere. Minor because it ships a new user-visible chart component, `BoxPlot`, exported from `@nannier/canvas` (with the `BoxSample` type); no existing API changes. Like `Chart` it is a Shared platform treatment (identical on iOS, Android, and the web). Accessibility: the plot's name gives each category its full summary ("us-east: median 46, quartiles 42 to 49, range 38 to 58, 1 outlier"). devWarns cover empty `data` and categories with fewer than 5 finite samples.
- a688631: Histogram: a new chart component for auto-binned frequency distributions. Pass raw sample `values`; the chart bins them into nice-edged uniform buckets (Sturges' rule by default, `bins` to override) and draws contiguous top-rounded bars on the cartesian frame's numeric x axis, with bars and press/scrub hit-testing both going through the frame's x scale (the frame nices the numeric domain, so bins neither start at pixel 0 nor tile the plot). Press or drag-scrub a bar to flag its range and count, with deduped announcements; selection is controlled via `selected`/`onSelect` or uncontrolled via `defaultSelected`, and the other bars dim while one is inspected. The tone axis resolves success > destructive (default primary); `compact`, `hideGrid`, `hideAxes`, and `formatValue` behave as on the other cartesian charts, with `formatValue` shaping bin edges in ticks, the flag, and the accessible name. Minor because it ships a new user-visible chart component, `Histogram`, exported from `@nannier/canvas`; no existing API changes. Like `Chart` it is a Shared platform treatment (identical on iOS, Android, and the web). Accessibility: the plot's name lists every bin with its bounds and tally ("Latency ms: 30 samples in 6 bins: 30 to 40 4, ..."). devWarns cover empty `values` and input with no finite samples.
- a688631: WaterfallChart: a new chart component for the running-total bridge (a P&L walk, a headcount bridge). Each step floats from the running total by its signed `value`; a `total` step draws an absolute bar from zero, either snapshotting the running total (omit `value` or pass 0) or opening/re-basing it to a non-zero `value` (the "Q2 total, then the walk, then Q3 total" authoring shape). The coloring is fixed semantics rather than a prop, so every bridge reads the same way: rises green, falls red, totals the brand primary; hairline connectors link each bar's end to the next bar's start. Scrubbing a step flags its change and running total (totals flag just the total) and dims the others, with deduped announcements; selection is controlled or uncontrolled as on every cartesian chart; `compact`, `hideGrid`, `hideAxes`, and `formatValue` behave as elsewhere. Minor because it ships a new user-visible chart component, `WaterfallChart`, exported from `@nannier/canvas` (with the `WaterfallStep` type); no existing API changes. Like `Chart` it is a Shared platform treatment (identical on iOS, Android, and the web). Accessibility: the plot's name walks the bridge ("Q2 total 4.2k, New up 980 to 5.2k, Churn down 540 to 4.6k, Q3 total 4.6k"). devWarn on empty `steps`.

### Patch Changes

- a688631: Colors: align every semantic color token in `src/style/tokens.ts` with the web
  hand-off (`styles/tokens/colors.css`), which is the source of truth for what the
  tokens ARE. The hand-off authors its values in `oklch()`; the JS token set carried
  hand-transcribed Tailwind v3 hexes instead, so the two sides had drifted on 13
  values and a component painted one color natively while the CSS published another.
  Six of those were plainly visible: `destructive` was `#dc2626` light / `#ef4444`
  dark against the hand-off's `#e7000b` / `#ff6467`, and `primary` (with `ring`,
  which tracks it) was `#4f46e5` / `#6366f1` against `#4f39f6` / `#615fff`. The rest
  were sub-perceptual: `primary-foreground` and `destructive-foreground` resolve to
  `#fafafa` rather than pure white, and `muted-foreground` and `warning` shift by one
  or two 8-bit steps. Every token now carries the exact sRGB rendering of its
  hand-off `oklch()`, so a native build and a web build paint the same pixel.

  The `chart-1..8` series, the fixed brand constants, and the Tailwind v3 `palette`
  steps were already in agreement and are unchanged.

  `scripts/validate-tokens.ts` now cross-checks the two sides by VALUE, converting
  each `oklch()` declaration back to sRGB and failing the build on any difference.
  It previously checked only that every JS token NAME existed in the CSS, which is
  what let the values drift apart unnoticed.

  Patch, not minor: no new component, API, option, or platform. This corrects
  existing token values to the specification they were always meant to carry.

## 2.24.0

### Minor Changes

- 0bb0f0e: ComposedChart: a new chart component for mixed marks on one categorical axis. Each series extends `ChartSeries` with per-series `line` and `area` booleans (precedence line > area > bars, first match wins): bar-kind series split each band as grouped columns with the 2px spacer, area-kind series paint a gradient wash behind everything, and line-kind series stroke on top, with `dots` marking line/area data points (auto-suppressed when bands drop under 14px, matching LineChart) and `curved` bending the paths. The chart rides the shared cartesian core, so it inherits the whole contract: one zero-based y axis (a dual axis is named deferred scope), the chart-1..8 series colors, scrub-to-inspect with the value flag and deduped announcements, controlled and uncontrolled selection, the reachable legend outside the plot image, `compact`, `hideLegend`/`hideGrid`/`hideAxes`, and `formatValue` flowing into the accessible name that folds every series and value. Minor because it ships a new user-visible chart component, `ComposedChart`, exported from `@nannier/canvas` (with the `ComposedSeries` type); no existing API changes. Like `Chart` it is a Shared platform treatment (identical on iOS, Android, and the web). The docs point bar-only grouped data at the bar `Chart`'s grouped mode; composed earns its keep when the marks mix.
- 0bb0f0e: RangeAreaChart: a new chart component for min/max envelopes (forecast bands, error envelopes, daily ranges). Each label carries a `{ low, high, mid? }` range: the band renders as a translucent tone wash between the low and high edges (`areaBandPath`), the optional mid values draw a solid line through it, and `curved` bends both with the monotone cubic. The y domain hugs the data rather than anchoring at zero, since an envelope is a range idiom; the frame nices it. Scrub-to-inspect selects a column and flags High, Mid, and Low with deduped announcements, controlled via `selected`/`onSelect` or uncontrolled via `defaultSelected`. The tone axis resolves success > destructive (default primary); `compact`, `hideGrid`, `hideAxes`, and `formatValue` behave as on the other cartesian charts. Minor because it ships a new user-visible chart component, `RangeAreaChart`, exported from `@nannier/canvas` (with the `RangePoint` type); no existing API changes. Like `Chart` it is a Shared platform treatment (identical on iOS, Android, and the web). Accessibility: the plot's name folds every range ("p50 to p99: Jan 42 to 118 around 61, ..."), summarizing past 24 points. devWarns cover empty or mismatched `labels`/`data` and an inverted pair (`low` > `high`), which is swapped after warning.

## 2.23.0

### Minor Changes

- 73c67e3: BulletChart: a new chart component for goal-attainment rows. Each `data` row is a leading label, a track holding qualitative background bands (`ranges`, ascending bounds painted in fading muted washes, widest first so the denser washes sit on top), the tone-colored measure bar, an optional vertical `target` tick, and the trailing formatted value; following the classic bullet-graph anatomy each row carries its own scale (its largest value, target, or bound), and `max` forces one shared scale when the rows genuinely share a unit. The measure tone resolves success > destructive (first match wins, default primary); `compact` tightens rows and thins bars; `formatValue` formats values (default compact k/M/B). Minor because it ships a new user-visible chart component, `BulletChart`, exported from `@nannier/canvas` (with the `BulletDatum` type); no existing API changes. Like `Chart` it is a Shared platform treatment (identical on iOS, Android, and the web). Accessibility: each row is one accessible item composing value and target ("Revenue: 275 of target 300"); bands, bar, and tick are decorative. devWarns cover empty `data`, out-of-order `ranges`, and data exceeding an explicit `max`.
- 73c67e3: ProgressRing: a new chart component, the full-circle sibling of the semicircular Gauge. A muted track ring and a tone-colored value arc revealed clockwise from 12 o'clock with rounded caps (the ring is a stroked path built from two half arcs, because an SVG circle's dash origin sits at 3 o'clock), the whole-percent readout centered inside, and an optional `label` below the graphic. The API mirrors Gauge exactly: `value` 0-100 (clamped with a devWarn outside the range), the tone axis `primary` / `success` / `warning` / `destructive` with precedence success > warning > destructive, and the same rounding split (the readout and the accessible name round while the arc keeps the fraction). `compact` shrinks the graphic from 120 to 96; per-instance sizing remains a separate, deferred item, as on Gauge. Minor because it ships a new user-visible chart component, `ProgressRing`, exported from `@nannier/canvas`; no existing API changes. Like `Gauge` it is a Shared platform treatment (identical on iOS, Android, and the web). The accessible name announces "label: N%" with the same number the eye sees.

## 2.22.0

### Minor Changes

- 33ac55e: ServiceHealthList: a new chart component for the status-overview card. One row per service: a status dot (per-item booleans resolving down > degraded, first match wins, operational otherwise), the truncating service name, an optional right-aligned `detail` string ("99.98%"), and, when the item carries `periods`, an embedded mini uptime strip on a second line rendered by the same internal strip module `UptimeBar` uses, so the two components never drift (both export the `UptimePeriod` type). `onPressItem` turns each row into a drill-in button with the platform press affordance; `compact` hides the embedded strips and tightens the rows; `plain` strips the card surface for nesting inside an existing card, mirroring `Stats`. Minor because it ships a new user-visible chart component, `ServiceHealthList`, exported from `@nannier/canvas`; no existing API changes. Like `Chart` it is a Shared platform treatment (identical on iOS, Android, and the web). Accessibility: each row composes label, status, and detail into one accessible name ("Dashboard: degraded, 99.92%"), the embedded strip carries its own tallying summary, and the status dot is decorative. devWarn on empty `items`.
- 33ac55e: UptimeBar: a new chart component for the statuspage strip. A single row of per-period status pills, oldest on the left, each period a plain object whose status booleans resolve down > degraded > unknown (first match wins; an unmarked period is operational), colored through the shared status hues so a degraded pill reads the same amber as a warning badge. An optional `caption` summarizes the strip above it ("99.98% uptime"), and `startLabel` / `endLabel` caption the strip's physical edges below; `compact` shortens the pills. The strip is a time axis, so pills and edge captions keep physical left-to-right ordering even under native RTL, matching the plot convention of the cartesian charts. Minor because it ships a new user-visible chart component, `UptimeBar`, exported from `@nannier/canvas` (with the `UptimePeriod` type); no existing API changes. Like `Chart` it is a Shared platform treatment (identical on iOS, Android, and the web). Accessibility: the strip is one image whose name tallies every status with zero counts omitted ("API uptime, 90 periods: 87 operational, 2 degraded, 1 down"); the caption and edge labels are real text outside it. devWarn on empty `periods`.

## 2.21.0

### Minor Changes

- 8ba9073: BarList: a new chart component for the ranked label/value list (top pages, referrers, sign-up sources). Each row carries a color swatch, a truncating label, a right-aligned formatted value, an optional Stats-style `delta` string toned by `down` (with `steady` for qualifiers, muted, taking precedence), and a proportional track bar. Bars size against the largest row by default; `share` sizes them against the sum of the rows and appends muted percent readouts. Row colors follow the chart-1..8 ramp by index, with per-row `chart1`..`chart8` boolean slot overrides; a list-level `success` or `destructive` tone paints single-hue lists (precedence success > destructive; a row's slot beats the tone, with a devWarn when both are passed). `onPressItem` turns every row into a drill-in button with the platform press affordance; `compact` tightens the rows; `plain` strips the card surface for nesting inside an existing card, mirroring `Stats`. `formatValue` formats values (default compact k/M/B). Minor because it ships a new user-visible chart component, `BarList`, exported from `@nannier/canvas`; no existing API changes. It complements rather than replaces the bar `Chart`: `Chart horizontal` compares magnitudes on a shared axis, while BarList is the ranked list idiom with deltas, shares, slots, and drill-in. Like `Chart` it is a Shared platform treatment (identical on iOS, Android, and the web). Accessibility: every row is one accessible item whose name folds the label, formatted value, share percent (in `share` mode), and the delta with its direction spelled out; the swatch and track are decorative. devWarns cover empty `items` and negative row values (treated as 0 by the bars).
- 8ba9073: MetricBreakdown: a new chart component for the decomposed-metric dashboard card. It stacks a preformatted headline `value` and `label`, an optional secondary `rate` readout with `rateLabel` (toned by the slot-scoped `rateSuccess` / `rateWarning` / `rateDestructive` booleans, first match wins, default muted; slot-scoped because the tone colors the rate readout, not the card), an optional trend strip (`spark`) rendered through the kit `Sparkline` line variant with a floating latest-value tag suffixed by `sparkUnit` (the tag inherits the rate tone when one is set), per-category `breakdown` rows with proportional share bars and Stats-style `delta` strings toned by `down`/`steady`, and a `chips` footer rendered with the kit `Chip` atom behind an optional `chipsLabel` (no default: a kit component does not assume the domain). Row colors follow the chart-1..8 ramp by index with per-row `chart1`..`chart8` boolean overrides; the v2-era chart-1 spark color is deliberately dropped in favor of the Sparkline's default primary tone. `compact` tightens density; `plain` strips the card surface for nesting inside another card, mirroring `Stats`; `formatValue` formats row values and the spark tag. Every section is independently optional. Minor because it ships a new user-visible chart component, `MetricBreakdown`, exported from `@nannier/canvas`; no existing API changes. Like `Chart` it is a Shared platform treatment (identical on iOS, Android, and the web). Accessibility: the card is text-first; the headline, captions, and rate are real text, each breakdown row is one accessible item announcing label, formatted value, and share of the total, the trend carries a data-derived accessible name, and the floating tag, swatches, and tracks are decorative. devWarns cover a single-point `spark` (skipped) and negative row values.

## 2.20.1

### Patch Changes

- bf6d623: Alert resolves its width measure axis `block` > `wide` > `narrow`, the order the design hand-off uses; v2.20.0 shipped the axis with the reverse first-match order. The order only decides what happens when a call site passes more than one measure, which the docs already tell you not to do, so nothing that passes a single measure changes. `block` leading is also the better reading: asking a banner to fill its container is the most specific of the three instructions, so it should not lose to a cap.

## 2.20.0

### Minor Changes

- b0863db: Alert gains the width measure axis, a new public capability: boolean props `narrow` (320px cap), `wide` (640px cap), and `block` (fill the container, no cap) around the default 480px cap. Every measure is a maximum, never a floor: the banner rides width 100% under the cap and still shrinks to its container, so a column of alerts is the same measure top to bottom. The caps sit one step up the field width ladder (narrow 320 matches a base-width field, the default 480 matches a wide one), so a banner over a form lines up with its fields. Axis precedence is first-match narrow > wide > block.
- b0863db: DataTable: the hand-off's row-interaction suite. Passing `onRowEdit` and/or `onRowDelete` adds a trailing actions column of icon buttons at each platform's touch-target size (28px web, 44pt iOS, 48dp Android with a borderless ripple). The pencil opens the row's edit mode: every string cell becomes a skin-styled field (the first takes focus) with a trailing Save/Cancel pair, and Save fires `onRowCommit(rowIndex, cells)` with the edited cells in place while custom ReactNode cells pass through unchanged. Delete is second-press confirm: the first press arms the bin (it turns destructive and its accessible name changes to "Confirm delete ..."), a second press within the confirm window fires `onRowDelete(rowIndex)`, and any other table press or the window lapsing disarms. The new `inlineEdit` boolean lets a string cell be pressed straight into a field: Enter or blur commits via `onCellCommit(rowIndex, colIndex, next)` when the value changed, Escape restores the cell. All indices report ORIGINAL `rows` positions, stable under sorting and paging, and the action buttons fold the row's first cell text into their accessible names. Minor because it adds new public API to a shipped component: the `inlineEdit` boolean plus the `onRowEdit`, `onRowDelete`, `onRowCommit`, and `onCellCommit` callback props. Everything existing is unchanged; tables without the new props render exactly as before.
- b0863db: Gauge: the chart is now the hand-off's semicircle anatomy. The full-circle ring with the value and label centered inside is replaced by a 180 degree top semicircular arc (muted track plus a tone-colored value arc with rounded caps), the percent readout sitting in the open center of the semicircle, and the label below the graphic. The readout (and the accessible name with it) now rounds to a whole percent, matching the hand-off; the arc still fills by the exact fractional value. Minor because it changes the user-visible rendered look of a shipped chart to the design hand-off's geometry. The API is unchanged: `value`, `label`, `testID`, `style`, and the tone axis (default primary; precedence success > warning > destructive) all work as before. The graphic keeps its fixed 120 width; per-instance sizing remains a separate, deferred item.

## 2.19.1

### Patch Changes

- 0629dd5: Fix the web glass lens blanking the page under a Trusted Types CSP

  `glass-lens.ts` injected its SVG filter defs by assigning markup strings to
  `innerHTML`. Under a `require-trusted-types-for 'script'` Content-Security-Policy,
  Chromium throws a `TypeError` on that assignment, and because the shared
  `#cds-glass-lens` def is injected at module-import time the throw escaped the
  module factory before React could mount: every consumer serving that CSP rendered
  a blank page instead of an app. The published docs site did exactly that.

  Both defs are now built as DOM nodes with `createElementNS` and `setAttribute`,
  which touches no Trusted Types sink and needs no policy, so the lens renders
  identically under every CSP. The filter geometry moved from markup-string builders
  to pure spec builders (`sizedLensFilterSpec`, `sharedLensFilterSpec`) that describe
  the tree; rendered output, rim geometry, and the displacement-map data URI are
  unchanged. Kit source is now linted against every Trusted Types sink so this class
  of failure cannot reach a release again.

## 2.19.0

### Minor Changes

- 9823224: ButtonGroup gains a `block` boolean, an orthogonal layout modifier matching the hand-off's ButtonGroup axis: the group stretches to the container width and the segments share the space equally (`flex: 1` gives each a zero flex-basis, so labels of different lengths still split evenly). It applies to the segmented and spaced kinds; the split and stepper kinds are fixed-width chrome (a chevron trigger, prev/next arrow cells), so they ignore it with a dev-only warning.

  Minor justification: new public API (the `block` prop on ButtonGroup), not a fix to existing behavior.

- 9823224: Emblem gains a `warning` tone boolean on the existing tone axis (primary / destructive / success / warning / muted): the amber caution emblem from the hand-off. It follows the same recipe as the other tones, a 12 percent wash of the `warning` token behind the square and the solid token on the glyph or monogram, and slots into the fixed tone precedence after `success`.

  Minor justification: new public API (the `warning` prop on Emblem), not a fix to existing behavior.

- 9823224: Gauge: new `warning` tone boolean on the tone axis. `<Gauge warning />` fills the arc with the kit's shared warning amber (the same statusHues hue a warning badge or alert reads), for dials like a budget-used gauge. Minor because it adds a new public prop, a user-visible tone capability; the existing tones and the default primary fill are unchanged. Tone precedence within the axis is success > warning > destructive (first match wins).
- 9823224: Tabs items accept a per-item `disabled` flag: an item may now be `{ label, badge?, disabled? }`, and a disabled trigger renders through the skin's dimmed disabled treatment, is not pressable, sits out of the tab order, is skipped by the roving arrow-key navigation (Home/End redirect to the nearest enabled tab), and announces itself via `accessibilityState.disabled` plus the `aria-disabled` alias.

  Minor justification: new user-visible capability on the public Tabs API (individually disabled tab triggers on the existing `tabs` items array).

## 2.18.1

### Patch Changes

- a314646: Fix the web Liquid Glass lens's displacement geometry. The shared percentage-sized filter silently mis-rendered in Chromium's reference-filter path: the ramp images did not cover the element, most of the surface sampled a transparent-black map, and the two displacement passes compounded that into a large position-dependent smear (content under a glass bar appeared shifted tens of pixels, and content entering at an edge read unblurred before snapping to frost). The lens is now generated per surface size with pixel-unit geometry (`filterUnits="userSpaceOnUse"`, a map image whose intrinsic size is the filter region), acquired on layout and refcounted so equal sizes share one def and resizes clean up after themselves. Rims are now a constant 12px like the real material instead of proportional to the element, a single dual-channel displacement pass replaces the two-pass chain, and the shared `#cds-glass-lens` def the CSS token points at carries the blur+saturate grade only, so raw-CSS consumers get a correct frost rather than a broken lens.

## 2.18.0

### Minor Changes

- 9af2828: ThemeProvider speaks the color scheme in boolean grammar: `<ThemeProvider dark>` forces the dark scheme, `<ThemeProvider light>` the light one, and passing neither follows the OS appearance, matching the glass/solid surface axis and every component axis (the prop name is the value). Axis first-match: `dark` wins over `light`, and both win over the legacy `scheme` value prop, which stays supported for config-driven code that already holds a scheme value (a stored preference, an `<html>` hook). `ssrScheme` and the resolved `useTheme().scheme` are untouched.

  Minor justification: new public API on ThemeProvider (the dark/light boolean axis), not a fix to existing behavior.

## 2.17.0

### Minor Changes

- 3ed5114: Glass surface mode now renders as a real Liquid Glass LENS on Chromium web: an SVG displacement filter (refraction concentrated at the rim, the centre optically flat, with the blur + saturation built in) injected once per document and applied as the glass material's backdrop-filter through GlassSurface. It needs no optional module, sits above the expo-blur frost in the material ladder (the frost stays the tier for non-Chromium web, Android, and iOS < 26, and the translucent popover fill stays the last resort), matches the shipped CSS token `--glass-lens: url(#cds-glass-lens)`, and keeps the Reduce Transparency / Increase Contrast opaque rungs intact.

  Minor justification: new user-visible capability of the published web glass material (the lens tier), not a fix to existing behavior.

## 2.16.0

### Minor Changes

- c37c7df: ThemeProvider speaks the surface mode in boolean grammar: `<ThemeProvider glass>`

  The one string-valued switch left on the provider joins the kit's semantic
  boolean axis convention. `glass` forces the translucent functional layer on,
  `solid` forces the flat look, and passing neither keeps the platform default
  (glass on iOS 26+, solid everywhere else). Axis first-match: `glass` wins over
  `solid`, and both win over the legacy prop.

  This is the minor's user-visible capability: a new public prop pair on
  `ThemeProvider`, making the provider's call-site grammar match every component
  axis (`<ThemeProvider scheme="dark" glass>` beside `<Button primary large>`).

  `surface="solid" | "glass"` remains supported unchanged, for back-compat and for
  config-driven code that already holds a `Surface` value; the resolved value the
  theme context carries (`useTheme().surface`) and the web DOM helper
  (`setSurface("glass")`) are untouched.

## 2.15.0

### Minor Changes

- 37cbbe9: Add `brandColors` and `statusHues` to the token layer, and fix the light-mode `--ring`

  **New public API, which is what makes this a minor.** Two exports join the style
  foundation, both reachable from the package root:

  - `brandColors` (with its `BrandColors` type): the three fixed brand constants
    that do NOT flip with the scheme, `orb-indigo` / `orb-violet` / `orb-cyan`.
    The CSS layer has shipped these as `--orb-*` since the token handoff, but there
    was no JavaScript equivalent, so a React Native surface (and any docs page)
    had to hard-code the hexes. Keys are the CSS custom-property names verbatim, so
    `brandColors["orb-indigo"]` and `var(--orb-indigo)` name the same token, and
    `bun run validate-tokens` now fails when a key here has no matching `--name` in
    the shipped CSS (the guard `lightColors` already had). That guard checks the
    name EXISTS, not that the two layers carry the same value; cross-checking values
    is a separate change, since the CSS states colors in oklch and the JavaScript in
    hex.
  - `statusHues` (with its `StatusTone` type): the one status-tone to palette-hue
    map, `success` to green, `warning` to amber, `error` to red, `info` to blue.
    Alert, Badge and Chip each carried a private, identical copy; all three now read
    this one, so a toned Alert, a status Badge and a status Chip cannot drift apart. It names the hue only,
    never a step, so each component keeps its own step ladder. No rendered color
    changes.

  **Fix:** the light-mode `--ring` in `styles/tokens/colors.css` shipped the DARK
  primary (`oklch(0.585 0.233 277.117)`) in both `:root` and `.dark`. Ring tracks
  primary per scheme, which the JS tokens have always done (`#4f46e5` light,
  `#6366f1` dark), so `:root --ring` is now the light primary
  `oklch(0.511 0.262 276.966)`. Focus rings on a light web surface pick up the
  slightly deeper indigo they were always meant to have; dark is unchanged.

- 37cbbe9: Add the `Swatch` atom: a color sample built from a filled rounded block plus the
  label column it owns (the token name as `children`, a primary mono `value` line, an
  optional secondary mono `detail` line), the anatomy a design-system color sheet
  repeats down a page.

  New user-visible capability (why this is a minor, not a patch): a new exported
  component with its own boolean axes, `small` / `large` for the block edge, `circle`
  for the shape, `inline` to move the label column beside the block, and `block` for a
  full-width ramp bar whose size reads as its height. The block always carries a
  `border`-token hairline, so a sample of `background` or `foreground` stays visible
  against the surface behind it in both schemes, and the root ships a data-carrying
  accessible name assembled from the name and value (falling back to the color string),
  since its image role hides the rendered lines from assistive tech.

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
