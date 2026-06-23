# @olympusoss/canvas

## 6.21.0

### Minor Changes

- 478cd83: TabBar: add a `bottomInset` prop and apply the safe-area inset on top of a symmetric vertical base instead of replacing the bottom padding. The bar's top and bottom margins now match when there is no inset (e.g. web) and it still clears the home indicator when there is one. Pass the inset as `bottomInset={insets.bottom}` rather than `style={{ paddingBottom: insets.bottom }}`.

## 6.20.1

### Patch Changes

- 5b308ed: Finish the input label-association accessibility pass. Fieldset, Field, and Dialog now wire every visible label to its control via `aria-labelledby` + `accessibilityLabel` (and helper/error text via `aria-describedby`), matching Form and Alert Dialog, so no composed field is announced as an unlabeled edit field on web or native. A Fieldset row no longer wraps its lone control in a redundant `role="group"` (the set's grouping comes from the Fieldset legend).

## 6.20.0

### Minor Changes

- 02b795a: Fix a kit-wide audit (94 adversarially-verified findings across 52 components): real bugs, systemic web-accessibility gaps, and dead public props.

  **Bugs**

  - Carousel no longer crashes on an empty `items` array. Slider and Charts sanitize NaN/Infinity inputs instead of producing NaN geometry. Textarea clamps `rows` to at least one line. Combobox blocks selection when `disabled`. Accordion normalizes the single-open "" sentinel. The web Spinner skin no longer runs a perpetual no-op animation loop. Code Block's prompt and line-number gutter are no longer selectable. Sidebar resolves `active` to a single row even when labels collide. Several data-driven lists (Feeds, Action Sheet, Data Table, Sidebar, Stacked Lists) accept an optional stable `id` so reorder/insert no longer misbinds rows.
  - Field's Copy button is now functional via a new `onCopy?: (value) => void` prop. Alert Dialog's `withInput` field actually gates confirmation (new `confirmText` prop, default "DELETE").

  **Accessibility (web + native)**

  - State and value now reach web screen readers everywhere via `aria-*` aliases (react-native-web drops `accessibilityState`/`accessibilityValue`): `aria-disabled` (Dropdown, Slider, Pagination, Tabs, Number Input), `aria-checked` (Filter Panel), `aria-selected`/`aria-current` corrections (Pagination, Navbars).
  - Correct ARIA roles: Tabs gets a `tablist`, Dropdown/Command/Listbox option lists get `listbox`/`menu` containers, Breadcrumb is a `navigation` landmark with `aria-current="page"`, Typography headings expose a heading role + level, Charts expose a labeled group, Toast is a polite `status` region.
  - Accessible names where they were missing: pressable Avatars, Data Table rows, the Row Menu / icon-only triggers, QR codes, the Action Sheet / Drawer scrims, and Form / Field / Alert Dialog inputs (labels are now programmatically associated, with helper text wired via `aria-describedby`).
  - Disclosure state (`aria-expanded`) on Popover, Combobox, and Row Menu triggers; busy/loading semantics on Button, Skeleton, and Alert; decorative icons and separator glyphs are now hidden from assistive tech.

  **Shared atoms extended** (backward-compatible): `Switch` and `Avatar` and `Icon` and `Input` gain `accessibilityLabel`; `Icon` gains `decorative`; `Avatar` gains `initials`; `Input` gains `aria-labelledby`/`aria-describedby`; `Button` announces `aria-busy` when `loading`.

  **Dead props removed**: `Card.interactive`, `Navbar.children`, and Code Block's no-op `filename`/`language` on non-terminal variants; `DescriptionList.stacked` is now honored.

## 6.19.1

### Patch Changes

- f5fd740: Add the missing package license and npm metadata. The package previously shipped with no `license` field and no `LICENSE` file even though the README declared proprietary, so npm reported the license as unknown. Add `"license": "UNLICENSED"` plus a standard proprietary `LICENSE` file, and fill in `homepage` (the docs site), `repository`, `bugs`, and `keywords` so the npm package page links back to the project and is discoverable.

## 6.19.0

### Minor Changes

- 3249145: Honor the OS "Reduce Motion" accessibility setting (WCAG 2.3.3).

  New `useReducedMotion()` hook reads the system preference cross-platform (iOS Reduce Motion, Android Remove Animations, and the web `prefers-reduced-motion` query via react-native-web's `AccessibilityInfo`) and tracks live changes. The kit's decorative animations now respect it:

  - **Skeleton** holds its shimmer still (the muted shape alone reads as loading).
  - **Accordion** and **Collapsible** snap open/closed (no chevron ease, no height transition).
  - **Carousel** jumps to a slide instead of animating the scroll.

  Essential, information-bearing motion is intentionally left running: the **Spinner** rotation and **indeterminate Progress** bar are the only signal that work is ongoing, which WCAG 2.3.3 exempts. The hook is exported for app code that needs the same gate.

## 6.18.1

### Patch Changes

- 453c04b: Give Select, Combobox, and Command proper ARIA listbox semantics. Their option rows were `role="button"` with no selection state, so a screen reader heard a pile of buttons rather than a selectable list. The option list is now `role="listbox"` and each row is `role="option"` with `aria-selected`; Command additionally wraps each group in `role="group"` labelled by its heading. The rows stay fully operable (click and Enter/Space still select), verified under react-native-web. (React Native's `Role` type omits the valid ARIA `listbox` value, so the container role is cast.)

## 6.18.0

### Minor Changes

- adba160: Fix a systemic web accessibility gap, and give Button a disclosure prop.

  react-native-web forwards NEITHER `accessibilityState` NOR `accessibilityValue` to the DOM, so any component that conveyed its state only through those was silent to web screen readers. Components now also carry the cross-platform `aria-*` aliases (RN 0.71+ accepts them; RNW forwards them; native maps them back), so selected / checked / expanded state and slider/progress values reach assistive tech on every platform:

  - `aria-checked` — Checkbox (including the `mixed` indeterminate state), Switch, Radio, FilterPanel.
  - `aria-selected` — Tabs, TabBar, ButtonGroup, Listbox, Pagination, Calendar, Navbar, Sidebar.
  - `aria-expanded` — Dropdown, Select, Combobox, ButtonGroup split menu (and the existing Accordion/Collapsible).

  `Button` gains an **`expanded`** prop: a Button that toggles a menu/popover can now announce `aria-expanded`. The Dropdown's default trigger uses it, so the common (non-custom-trigger) Dropdown is now accessible.

  Adds a `test/a11y-state.test.tsx` suite asserting these attributes actually reach the DOM under react-native-web.

## 6.17.0

### Minor Changes

- 1854902: Add five more core components, closing the remaining catalog gaps:

  - **`NumberInput`** — the iOS UIStepper / web number-field idiom: a numeric value with − and + controls plus direct entry. `value`/`onChange`, `min`/`max`/`step`, `small`/`large`, `disabled`. Clamps to bounds and disables the control at each bound; `accessibilityRole="adjustable"` with `aria-valuemin/max/now` for screen readers. iOS segmented pill, Material 3 outlined icon buttons, web bordered group.
  - **`InputOTP`** — a segmented one-time-code field driven by one underlying `TextInput`, so SMS autofill (`one-time-code`) and paste work. `length`, `value`/`onChange`, `onComplete`, `masked`, `disabled`, `small`/`large`. iOS rounded separated cells, Material 3 outlined cells, web shadcn-style connected group; the active cell is ring-highlighted.
  - **`Collapsible`** — a single disclosure (one header toggling one panel; an Accordion is a group of these). `title`/`trigger`, `open`/`onOpenChange` or `defaultOpen`, `disabled`. The header exposes `aria-expanded` (the cross-platform alias that survives react-native-web); rotating chevron, `LayoutAnimation` reveal natively.
  - **`Carousel`** — a horizontally paged slide viewer (`FlatList` snap paging) with dot indicators and optional prev/next arrows. `items`, `index`/`onIndexChange` or `defaultIndex`, `loop`, `showArrows`, `showDots`. Dots and arrows carry full button a11y (`aria-selected`, labelled). Renders the current slide as a fallback so it is never blank before the viewport measures, and fills its container (with a sensible minimum width).
  - **`Toast`** — a transient notification capsule rendered directly, plus an imperative runtime: mount `<ToastProvider>` and call `toast(...)` from `useToast()` to enqueue auto-dismissing toasts that stack over the app through the kit Portal. Intents `success`/`destructive`/`info` (+ neutral), optional `description`, `action`, and dismiss. The capsule is a functional-layer overlay routed through `GlassSurface`; iOS banner, Material 3 snackbar, web sonner-style card.

  All are documented with live examples and the iOS/Android/Web 3-up comparison, and covered by behavior tests (including the imperative ToastProvider/useToast lifecycle).

## 6.16.0

### Minor Changes

- 7c8abec: Add two more core components:

  - **`ActionSheet`** — the iOS HIG modal action menu (a bottom sheet of choices), built on React Native's `Modal` so it renders on iOS, Android, and the web. Controlled `open`/`onOpenChange`; `actions` rows (each `destructive`/`disabled`), an optional title/message, and a Cancel affordance. Selecting a row runs its `onPress` then closes; the scrim, system back/escape, and the Android hardware back button all dismiss it. The card surfaces are functional-layer overlays routed through `GlassSurface` (real Liquid Glass on iOS 26+, a frost on web/Android). Per-OS skins: iOS two-card layout (actions card + separate Cancel card), Material 3 single bottom sheet with a drag handle and Cancel as the last row.
  - **`Accordion`** — a vertically stacked group of disclosure rows (`items` with a `title` and collapsible `content`), single-open by default or `multiple`; controlled (`value`/`onValueChange`) or uncontrolled (`defaultValue`). Each header is a button exposing its expanded and disabled state to assistive technology via `aria-expanded` (a cross-platform alias that survives react-native-web, which drops `accessibilityState.expanded`). The chevron rotates 0 to 90deg on open; the reveal uses `LayoutAnimation` natively and a plain show/hide on web. Per-OS skins: iOS inset-grouped card, flat Material 3 rows with a ripple, flat web rows.

  Both are documented with live examples and the iOS/Android/Web 3-up comparison.

## 6.15.0

### Minor Changes

- 6890119: Add two missing core components:

  - **`Slider`** — a draggable value/range input (`value`/`min`/`max`/`step`/`onChange`, `small`/`large`, `disabled`). One cross-platform `PanResponder` handles both tap-to-jump and drag; `accessibilityRole="adjustable"` with increment/decrement actions and `aria-valuemin/max/now` make it keyboard-, switch-control-, and screen-reader-accessible. Web/iOS/Android skins (iOS thin rail + large white knob, Material 3 track + state-layer handle, shadcn-style web).
  - **`Progress`** — a determinate + `indeterminate` progress bar (`value` 0..1, `small`/`large`), `accessibilityRole="progressbar"` with the value exposed to assistive tech; the indeterminate animation is gated on `supportsNativeDriver`.

  Both are documented with live examples and the iOS/Android/Web 3-up comparison.

## 6.14.0

### Minor Changes

- 6c86fb4: Accessibility + API polish across the kit:

  - **Ref forwarding**: `Input` and `Textarea` now forward a ref to the underlying `TextInput`, so consumers can call `inputRef.current?.focus()` (and friends). Both also set a `displayName` for better DevTools/stack traces.
  - **Modal a11y**: `Dialog`, `Drawer`, and `AlertDialog` set `accessibilityViewIsModal`, and icon-only close controls get an `accessibilityLabel`, so assistive tech treats the backdrop as inert and announces the dismiss control.
  - **Hit targets**: small icon-only controls (Pagination, Calendar month chevrons, Checkbox/Radio boxes, Tooltip trigger) get `hitSlop` toward the 44pt minimum.
  - **Divider** announces itself as a `separator` to screen readers.
  - **New export `FOCUS_RESET`**: one shared web-only focus-outline reset, replacing the constant that was re-declared in ~11 files (consumers can use it for custom focusable controls).

## 6.13.0

### Minor Changes

- 789fc61: Add a `TabBar` organism: the bottom app-navigation bar (iOS HIG tab bar / Material 3
  navigation bar), a row of equal-width icon-over-label destinations with one active. It
  renders through `GlassSurface` (real Liquid Glass on iOS 26, frost on web/Android in glass
  mode, solid otherwise) and ships web/iOS/Android skins (Light treatment: iOS ~49pt with a top
  hairline and SF labels; Android a taller M3 navigation bar with a brand ripple; web mirrors
  the iOS look). Fills the previously-missing bottom-nav slot, distinct from the top `Navbar`
  and the in-page `Tabs`.

## 6.12.0

### Minor Changes

- 2e4dc0e: Skin the 5 remaining single-file organisms into the platform-skin pattern, completing the
  kit-wide platform-adaptive structure (every component now has the shared shell + web/iOS/
  Android skins). Light treatment (per-OS touches; registered for the docs comparison):
  Command (row type/density + press feedback; the GlassSurface panel is untouched), DataTable
  (row density/type/hairline), Drawer (Android hardware-back to close + Material side-sheet vs
  iOS sheet rounding), FilterPanel (group type/spacing; composes the skinned Checkbox). Shared
  treatment (platform-neutral data viz, identical skins): Charts. Public APIs unchanged.

## 6.11.0

### Minor Changes

- 5c43e1d: Skin the 14 single-file molecules into the platform-skin pattern, aligning every molecule to
  the shared-shell + web/iOS/Android-skin structure. Light treatment (per-OS corner radius,
  density, type tracking, and press feedback on their own rows; web unchanged; registered for
  the docs platform comparison): ActionPanel, Alert, Card, DescriptionList, EmptyState, Feed,
  Field, Fieldset, Form, GridList, MediaObject, StackedList, Stats. Shared treatment
  (platform-neutral, identical skins): CodeBlock. Subcomponents (Card's header/title/etc.) and
  all public APIs are preserved; composed atoms keep their own per-OS fidelity.

## 6.10.0

### Minor Changes

- e3c6b26: Skin the remaining single-file atoms into the platform-skin pattern, aligning every atom to
  the shared-shell + web/iOS/Android-skin structure. Avatar and Breadcrumb get Light treatment
  (per-OS type tracking, press feedback, and corner radius; web unchanged) and are registered
  for the docs platform comparison. Divider, Icon, Kbd, Listbox, QRCode, Skeleton, and
  Typography are Shared treatment (platform-neutral: one look on every platform, no fabricated
  divergence). Public APIs are unchanged.

## 6.9.0

### Minor Changes

- 0a7718b: Skin Badge per platform, completing its platform-adaptive file structure (shared shell +
  web/iOS/Android skins). Light treatment: one structure and shared semantic colors, with
  per-OS label type and pill radius (iOS SF medium with tightened tracking; Android Material 3
  label-small with +0.5 tracking and more rounding; web unchanged). No API change.

## 6.8.0

### Minor Changes

- e77f441: Add a specular edge to the glass surface on web and Android. In glass/frost mode the
  functional-layer material now paints a scheme-adaptive lit rim (bright top edge, faint
  perimeter hairline, soft bottom shade) over the existing blur, giving a more "liquid glass"
  look. Built with the cross-platform `boxShadow` style prop, so it renders identically on web
  and Android. iOS is unchanged: it keeps its native `GlassView` Liquid Glass material (the
  rim lives only in the web/Android `glass-surface` file).

## 6.7.0

### Minor Changes

- 94c9488: GlassSurface: make the frost a substantial material, never near-clear. On web and
  Android the expo-blur frost now paints over the kit's translucent `popover` frost fill
  (instead of the blur alone), so a frosted surface reads as a real frost over a flat or
  dark page rather than a clear hole. On iOS the real Liquid Glass switches from the
  transparent `clear` style to Apple's default `regular` (which blurs and tints). Frost
  mode now reads as a visible frost in both light and dark on every platform.

## 6.6.0

### Minor Changes

- b49410d: Add a `Drawer` organism: a full-screen panel that slides in from an edge (`left`,
  `right`, or a `bottom` sheet) over the whole app. It is the kit's full-screen portal
  case, built on React Native's Modal (which react-native-web implements on the web), so
  the same drawer renders on iOS, Android, and the web, distinct from the inline
  Dialog/Overlay used for the docs previews. Drive it with controlled `open` /
  `onOpenChange` or an uncontrolled `trigger`. The panel is an opaque card surface so a
  full-screen takeover stays legible over page content.

## 6.5.0

### Minor Changes

- 436f55e: Add a `QRCode` atom that encodes a string as a scannable QR code. It is built on
  `react-native-qrcode-svg` (the kit's first runtime dependency, which draws through
  the existing `react-native-svg` peer), so the same code renders identically on iOS,
  Android, and the web. Boolean size axis (`small` / `large`, default medium); the code
  stays a fixed dark-on-white card so it scans reliably in any app theme. The
  `react-native-svg` peer range is raised to `>=14` to match what the QR library needs.

## 6.4.0

### Minor Changes

- ffde686: Icon: greatly expand the built-in glyph set (from ~33 to 85 glyphs) so an app can
  build its full navigation and chrome from the kit `Icon` without an external icon
  package. New glyphs cover app chrome (`menu`, `moon`, `sun`, `arrowRight`,
  `appWindow`, `layers`, `rocket`, `circleCheck`, `circleX`), navigation/content
  (`alignLeft`, `award`, `barChart2`, `bookOpen`, `box`, `chartLine`, `checkSquare`,
  `chevronsLeft`, `circleDot`, `columns2`, `fileInput`, `fileText`, `folder`,
  `footprints`, `gauge`, `gitCompare`, `group`, `image`, `inbox`, `keyboard`,
  `layout`, `layoutGrid`, `list`, `listChecks`, `loader`, `messageCircle`,
  `messageSquareWarning`, `minus`, `moreHorizontal`, `mousePointerClick`,
  `moveVertical`, `navigation`, `palette`, `panelRight`, `plug`, `pointer`,
  `smartphone`, `square`, `table`, `terminal`, `textCursorInput`, `toggleLeft`,
  `type`).

  Also add a `success` color prop to `Icon` (scheme-aware palette green), matching
  the success tone Alert, Badge, and EmptyState already use, so positive status
  glyphs round out the existing `destructive` option.

## 6.3.0

### Minor Changes

- eb8364e: DataTable: accept ReactNode cells

  `DataTable`'s `rows` now accepts any `ReactNode` per cell, not just strings — so a
  cell can be a link, a `Badge`, a monospace name, an icon, etc. String and number
  cells still render in the default cell type; an element renders directly. Existing
  `string[][]` rows are unaffected (a `string` is a `ReactNode`).

  ```tsx
  <DataTable
    columns={["Name", "Status"]}
    rows={[
      [
        <Link key="n" href="/x">
          View
        </Link>,
        <Badge success key="s">
          Live
        </Badge>,
      ],
    ]}
  />
  ```

## 6.2.0

### Minor Changes

- 12f772f: Button: add `iconLeft` / `iconRight` icon slots and `accessibilityLabel`

  `Button` now accepts `iconLeft` and `iconRight` (ReactNode) to render an icon element
  before or after the label. They render directly — not wrapped in the label `Text`, which
  cannot host an SVG — spaced from the label by the button's gap. Pass `iconLeft` alone with
  the `icon` size prop for an icon-only square button, and set `accessibilityLabel` (now
  supported) so it reads for assistive tech. Existing buttons are unaffected (the new props
  are optional).

  ```tsx
  <Button primary iconRight={<ArrowRight size={16} color={tokens.background} />}>Browse</Button>
  <Button ghost icon accessibilityLabel="Toggle menu" iconLeft={<Menu size={18} color={tokens.foreground} />} onPress={onMenu} />
  ```

## 6.1.0

### Minor Changes

- 31226e3: Raise iOS skin fidelity to the Apple iOS 27 UI Kit across the kit's iOS-skinned components. Verified component by component on the 3-up preview (light and dark); web and Android skins are unchanged.

  Atoms:

  - Button: link buttons drop the underline on iOS (web keeps it); a clearer height ladder (base ~50pt, large ~58pt); disabled alpha 0.4.
  - Switch: the knob is now a capsule (was a circle), the tracks match the iOS ~1.64 pill, and the off-track is systemGray3 (the old token read as washed-out in light mode).
  - Input and Textarea: a focused field no longer paints the react-native-web focus-outline box (only the bottom hairline reacts); the caret is brand indigo.
  - Select and Combobox: iOS-native type scale, a leading checkmark with a neutral press tint, 17pt menu rows with hairline separators, disabled alpha 0.4; Combobox is aligned to the Select menu.
  - Button Group: the iOS split button is a full capsule (was a rounded rect).
  - Pagination: inactive cells and chevrons are transparent (were a near-black fill in dark mode).
  - Popover: the anchor is a tapered beak welded to the card edge (was a rotated square).

  Organisms and alert-dialog:

  - Alert Dialog: the destructive confirm is a gray capsule with a red label (was a red-filled capsule); the confirmation input is the iOS hairline field.
  - Calendar: uppercase weekday headers.
  - Tabs: a clearer dark-mode selected pill.
  - Navbars, Sidebar, Calendar, and Tabs: the stray react-native-web keyboard focus ring no longer shows on iOS controls.

## 6.0.0

### Major Changes

- 150a1b6: feat: Liquid Glass surface mode, glass-by-default on iOS 26

  The `surface` theming mode now paints a real glass material on the functional
  layer (overlays plus the bar/sidebar shells): Apple's native Liquid Glass via
  `expo-glass-effect` on iOS 26+, a genuine `expo-blur` frost on web, Android, and
  iOS < 26, and a translucent fill when those optional modules are absent. Content
  surfaces (cards, lists, tables, charts) stay solid, following Apple's model.
  Functional surfaces route through the new exported `GlassSurface` primitive.

  On iOS 26+ the system makes Liquid Glass the default material for that layer, so
  Canvas matches the OS: when `ThemeProvider`'s `surface` prop is omitted it now
  resolves to a PLATFORM DEFAULT — glass on iOS 26+ (honoring Reduce Transparency),
  solid everywhere else. The new exported `liquidGlassAvailable()` reports whether
  that material is available. The iOS material is bound to the active scheme
  (`colorScheme`) and uses the clear (almost-transparent) Liquid Glass variant.

  `expo-blur` and `expo-glass-effect` are optional peer dependencies; without them
  glass degrades gracefully to the translucent fill.

  BREAKING: the force-solid `surface` value is renamed `"default"` → `"solid"`, so
  an unset surface (the platform default) is distinct from an explicit flat
  override. `Surface` is now `"solid" | "glass"`. Migrate any explicit
  `surface="default"`, `setSurface("default")`, or `"default"` comparisons to
  `"solid"`; an unset `surface` is unaffected and now yields the platform default.

## 5.5.0

### Minor Changes

- 70be96a: feat: cross-platform overlay portal layer

  Adds `OverlayProvider`, `Portal`, `useOverlayHost`, and `AnchoredOverlay`: a
  pure-RN teleport (View/Pressable only, no Modal, no DOM, no position:fixed) that
  lets a floating overlay render over the page and dismiss on outside-tap,
  identically on iOS, Android, and web.

  The dropdown now uses this layer, replacing its web-only dismiss backdrop (a
  `Platform.OS === "web"` branch with a `position:"fixed"` style). Mount an
  `<OverlayProvider>` at your app root to get the over-the-page anchoring and
  outside-tap dismissal; with no provider mounted the dropdown falls back to an
  inline menu positioned below its trigger (its pre-portal behavior), so existing
  trees keep working.

## 5.4.1

### Patch Changes

- ee8e215: Fix Spinner not spinning on iOS under the New Architecture.

  The previous fix (v5.4.0) gated the rotation loop's `useNativeDriver` on
  `supportsNativeDriver`, which is `true` on native. That resolved the
  react-native-web freeze but not iOS: under the New Architecture an
  `Animated.loop` with `useNativeDriver: true` does not advance, so the iOS and
  Android spinner skins (which interpolate the loop value to spin their shape) sat
  frozen. Run the loop on the JS driver (`useNativeDriver: false`) on every
  platform, which loops correctly everywhere; a 900ms spinner is cheap on the JS
  thread. `supportsNativeDriver` remains exported for gating the driver on one-shot
  (non-looping) animations, with updated guidance that loops must always use the JS
  driver.

## 5.4.0

### Minor Changes

- 5f9d2e1: Fix Spinner freezing after one rotation on the web (react-native-web).

  `Animated.loop(Animated.timing(..., { useNativeDriver: true }))` runs a single
  iteration and then freezes on react-native-web: there is no native animated
  module, so `loop()` takes the native-loop path whose per-iteration restart never
  fires, and the value parks at its end. The Spinner's continuous rotation hit this,
  so its iOS and Android skins (which spin the drawn shape by interpolating the loop
  value) stopped after one turn when rendered on the web. The web ActivityIndicator
  skin was unaffected because it animates itself and ignores the value.

  The loop now gates `useNativeDriver` on the new exported `supportsNativeDriver`
  constant (`Platform.OS !== "web"`): native keeps the off-thread driver, web falls
  back to the JS loop that iterates correctly. `supportsNativeDriver` is exported for
  any consumer driving their own looping `Animated` values across web and native.

## 5.3.1

### Patch Changes

- 093202b: Form: make `fields` optional. A sectioned sidebar form supplies its inputs per
  `sections` and never uses `fields`, but the prop was typed as required, so a
  sections-only `<Form sidebar sections={…} />` failed type-checking. `fields` is
  now optional and its uses are guarded, so sectioned forms type-check without a
  dummy `fields` prop. No runtime change for forms that pass `fields`.

## 5.3.0

### Minor Changes

- a213ebd: Add the Android Material ripple to every tappable surface that previously only dimmed opacity on press: Card, MediaObject, GridList, Stats, Listbox rows, the tappable Avatar, and the CodeBlock copy, Alert dismiss, Tooltip icon, and bottom-sheet header buttons. On Android the ripple state layer now carries the press feedback (the opacity dim is skipped there); iOS and web are unchanged. Adds the `surfaceRipple`, `controlRipple`, and `pressDim` style helpers so custom Pressables can adopt the same platform-correct feedback.

## 5.2.0

### Minor Changes

- 43f6720: Make the container molecules tappable so an interaction never needs a hand-rolled Pressable: MediaObject gains `onPress` (the whole row becomes a button), and GridList and Stats gain `onPressItem(index)` (each tile / metric card becomes a button). Each renders as a Pressable with `accessibilityRole="button"` and a pressed affordance, mirroring Card's existing `onPress`. Pressable stays a documented last resort.

## 5.1.0

### Minor Changes

- e6a5487: Glass surface mode now follows Apple's Liquid Glass model: the functional layer only

  `surface="glass"` is now the material for the FUNCTIONAL layer — overlays
  (popovers, menus, dropdowns, selects, comboboxes, dialogs, alert dialogs, sheets,
  drawers, command) plus navbars and sidebars go translucent — while content
  surfaces (cards, lists, tables, calendars, charts) stay SOLID, per Apple's guidance
  not to use Liquid Glass in the content layer.

  Mechanically, glass now swaps only the `popover` token translucent (the `card`
  token stays opaque), and the navbar/sidebar shells paint that same functional-layer
  material in glass mode. Canvas does not hand-paint glass effects per component:
  real iOS Liquid Glass is the OS's automatic, system-rendered material, while
  Canvas's `glass` mode is its own cross-platform glassmorphism for the functional
  layer.

## 5.0.0

### Major Changes

- 6b8044c: Canvas 5.0.0. Platform-adaptive iOS / Android / Web skins for the component set, validated against the Apple iOS 27 UI Kit and Material 3 on the platform-comparison page; a consolidated per-component playground (one preview, variant rail, platforms as rows); a re-pointed PLATFORM-REFERENCES catalog with a Build verdict column; and the restored GitHub Actions pipeline (CI, GitHub Pages deploy, changesets release).

## 4.0.0

### Major Changes

- 0fad3b5: Input: absorb InputGroup's addons; remove InputGroup

  `Input` now accepts the addon props that used to live on `InputGroup` (`prefix`,
  `suffix`, `leadingIcon`, `trailingIcon`, `icon`, `action`, `onActionPress`). When
  any addon prop is present, Input renders the grouped layout (a shared border with
  squared joined edges, overlaid icons, and an optional pressable action button);
  otherwise it renders the bare field as before. This collapses the two components
  into one that owns the field, its addons, and the focus/error border, removing a
  duplicated TextInput implementation.

  BREAKING: the `InputGroup` component (and the `InputGroupProps` type) is removed.
  The props are identical, so migrate `<InputGroup …/>` to `<Input …/>` directly.

- b728034: Replace the className engine with raw React Native primitives and co-located style modules.

  Canvas no longer styles components by resolving Tailwind className strings at
  runtime. Every component is now built from raw React Native primitives plus a
  co-located `<name>.styles.ts` whose functions build RN style objects from the
  brand tokens via `useTheme()`. The flat boolean-prop API is unchanged: booleans
  still select the look, they just resolve to style objects instead of class strings,
  with the same per-axis precedence.

  New `src/style` foundation, exported from the package barrel:

  - the design tokens and the theme runtime (`ThemeProvider`, `useTheme`)
  - `useResponsive` / `responsive`, reproducing the desktop-first breakpoint
    semantics (a value applies at its width and below, smallest breakpoint winning)
  - the `shadow(level)` and `alpha(color, a)` style helpers
  - the raw `View` / `Text` / `Pressable` / `Image` / `TextInput` / `ScrollView`
    primitives (react-native's own, re-exported for a single import)

  Breaking changes:

  - The primitives (`View`, `Text`, `Pressable`, `Image`, `TextInput`,
    `ScrollView`) no longer accept a `className` prop. Style them with a `style`
    object, e.g. `{ flexDirection: "row", gap: 8, color: tokens["muted-foreground"] }`.
    `ScrollView`'s `contentClassName` is gone; use `contentContainerStyle`.
  - `cn`, `useStyles`, and the className resolver are removed from the package.
  - A component's `className` escape-hatch prop is now a `style` prop
    (`StyleProp<ViewStyle>` / `StyleProp<TextStyle>`), applied last, for layout
    composition only.

  Components used through their semantic boolean props are unaffected. Theming
  (light/dark, the glass surface) is unchanged and still flows through
  `ThemeProvider`.

- be027fb: Rename the Box primitive to View

  BREAKING: the engine primitive `Box` is renamed to `View` (and `BoxProps` to
  `ViewProps`), so all six styled primitives mirror their react-native counterparts
  exactly: `View`, `Text`, `Pressable`, `Image`, `TextInput`, `ScrollView`.

  Migrate by updating imports and JSX:

  ```diff
  - import { Box } from "@olympusoss/canvas";
  - <Box className="...">...</Box>
  + import { View } from "@olympusoss/canvas";
  + <View className="...">...</View>
  ```

  The API is otherwise unchanged: `View` still takes a `className` plus all of
  react-native's View props, and renders `style={[resolved, style]}`.

### Minor Changes

- 597a61f: Reorganize the component source into an atomic-design folder structure and ship
  a co-located example doc with each component.

  Every component now lives in its own folder under its atomic level, holding the
  source and a co-located markdown example:
  `src/<atoms|molecules|organisms>/<name>/<name>.tsx` plus `<name>.md`
  (e.g. `src/atoms/avatar/avatar.tsx` + `avatar.md`). The 50 components split into
  23 atoms, 15 molecules, and 12 organisms.

  Each `<name>.md` is a mini-doc with the component name and description, a
  `## Usage` block of real-component JSX, a `## Variants` block covering every
  variant the component exposes (intents, sizes, states, composite layouts), and
  `## Do & Don't` examples, every code block a real `@olympusoss/canvas` component.
  These docs are the canonical example source: the documentation site renders each
  page live from the `.md`, so the examples are exactly what ships.

  The public API is unchanged: the package still exports only the `.` entry and
  `./styles/*`, and the same named exports flow through new per-level barrels, so
  consumers are unaffected.

- 3864ebd: ButtonGroup: add the `stepper` kind (and Icon left/right chevrons)

  `<ButtonGroup stepper items={[...]} />` is a prev / current / next control. The
  chevrons are built into the component and `items` is the list it cycles through
  (wrapping at the ends); the middle label tracks the position. It is uncontrolled
  from the initial `active` index and reports each step through `onSelect`. Use it
  for stepping an ordered set (dates, pages, zoom levels).

  Adds `chevronLeft` and `chevronRight` glyphs to Icon, which the stepper uses.

- 84e43d8: Add optional interaction props across components so each can demonstrate a click:

  - Overlays (Dropdown, Select, Combobox, Command, Popover, Tooltip, RowMenu) are
    now uncontrolled by default: the trigger opens/closes them and a select closes
    them. A controlled `open` is still honored, and each gains `onOpenChange`.
  - Dialog, AlertDialog, Overlay gain a `trigger` label plus `onOpenChange`: pass
    `trigger` and the component renders its own opener button and self-manages
    visibility (uncontrolled), matching the other overlays. A controlled `open` is
    still honored. Note: when uncontrolled and given no `open`, these now start
    closed (previously they rendered open), so pass `trigger` (or controlled
    `open`) to show them.
  - Alert: `dismissible` + `onDismiss` (renders a trailing dismiss control).
  - DataTable: `onRowPress(row, index)` (pressable rows).
  - Stepper: `onStepPress(index)` (pressable step circles).
  - Feed: `onItemPress(index)` (pressable rows).
  - Avatar: `onPress` (pressable avatar).
  - Card: `onPress` (pressable surface).

  All additions are optional and backward-compatible; existing controlled usage and
  default rendering are unchanged.

- ab3d754: Dropdown: support a custom trigger via `children`

  `Dropdown` now accepts `children` as a custom trigger, rendered in place of the
  default outline button (still available via the now-optional `trigger` label).
  The children are wrapped in a Pressable that toggles the menu, so a rich trigger
  such as an avatar account chip in a topbar can open the menu; the rows still come
  from `items`. Backward-compatible: existing `trigger="…"` usage is unchanged.

  The menu also now matches the trigger's width (measured on layout), growing past
  it for longer rows and floored at a comfortable minimum for small triggers. A
  wide trigger like an account chip gets a menu of the same width instead of a
  fixed-width card.

- b3f89b3: Dropdown now dismisses on an outside click on the web. While an uncontrolled
  Dropdown is open it lays down a transparent full-viewport backdrop, so pressing
  anywhere off the menu closes it, matching standard dropdown behavior (it already
  closed on re-pressing the trigger or selecting an item). A controlled (`open`)
  Dropdown gets no backdrop, so a deliberately-pinned menu is never dismissed and
  never traps page clicks; native is unchanged (the inline menu has no portal there,
  it would use a Modal).
- 472e0ae: Make glass a theming-level surface instead of a per-component prop

  Glass used to be a per-component `glass` prop on Card AND a separate global toggle
  that only restyled docs chrome, never the components themselves (the engine
  resolves color utilities to literal token values, so a CSS-level glass mode could
  not reach an RN component). Now glass is a real theming dimension, like the
  light/dark scheme:

  - `ThemeProvider` gains a `surface` prop (`"default" | "glass"`). When `"glass"`,
    the card and popover tokens are swapped to translucent, so every surface
    component reads as glass at once, on native and on web. On the web, drive it
    with `setSurface("glass")` and mirror the `<html data-surface>` attribute into
    the provider (see the docs `main.tsx` / `useDocsSurface` setup).

  BREAKING (Card): the per-component `glass` prop is removed. A plain `<Card>` is
  glass whenever the active surface is glass; use the theming-level surface instead
  of opting individual cards into glass.

- c374afb: Icon: add the `primaryForeground` color

  `<Icon primaryForeground />` paints the glyph in the `primary-foreground` token,
  the contrast color for an icon sitting on a primary surface (e.g. a primary
  button). Used by ButtonGroup's split chevron, which is now a crisp Lucide
  chevron-down (white on the primary segment) that rotates when its menu is open,
  replacing the heavier Unicode triangle.

- e9b36e9: Add platform-adaptive skins: every high-identity control, nav, overlay, and picker now
  renders with a native iOS (Apple HIG) / Android (Material 3) / Web look.

  Canvas is platform-forward: the brand (the indigo `primary` and the type) survives on every
  platform; only the native shape, sizing, structure, and interaction feedback change per OS.
  Each skinned component splits into a shared shell plus a co-located skin per platform:
  `<name>.shared.tsx` (structure + behavior + a `<Name>Skin` interface) +
  `<name>.styles.ts` (`iosSkin` / `androidSkin` / `webSkin`) + thin `<name>.ios.tsx` /
  `<name>.android.tsx` / `<name>.tsx`. Metro resolves the `.ios`/`.android` files on device, so
  the skins are native (not a docs trick); the web look is unchanged.

  23 components skinned: button, checkbox, radio, switch, input, textarea, button-group, select,
  combobox, dropdown, row-menu, popover, tooltip, dialog, alert-dialog, overlays, spinner, tabs,
  pagination, stepper, navbar, sidebar, calendar. Highlights: iOS opacity-dim press vs Android
  `android_ripple`; iOS rounded-rect / segmented controls vs Material 3 pill / underline; iOS
  UIAlertController vs M3 dialog; iOS spoke spinner vs M3 sweeping arc; iOS rounded-popover menus
  vs M3 elevated menus; iOS date picker (2-letter weekdays, colored today) vs M3 date picker
  (1-letter weekdays, outlined-ring today).

  The public boolean-prop API and every behavior are unchanged; this is purely additive (new
  per-platform files + co-located skins), and web rendering stays byte-for-byte the same.

- 9842e5f: ButtonGroup: the split kind now opens a dropdown menu

  The `split` kind's secondary control is now a chevron that toggles a floating
  dropdown of related actions, instead of a plain second button. Pass the actions
  via the new `menu?: string[]` prop:

  ```jsx
  <ButtonGroup
    split
    items={["Save"]}
    menu={["Save as draft", "Save and close", "Save a copy"]}
  />
  ```

  The chevron's menu floats (absolute) so it overflows the group rather than
  growing it. When `menu` is omitted it falls back to a sensible default. Note:
  the split kind no longer renders `items[1]` as a secondary label, the chevron
  replaces it, so split callers should move that second action into `menu`.

- b75e0be: Add engine-styled Image, TextInput, and ScrollView primitives

  These className-aware wrappers (matching Box, Text, and Pressable) let you style
  react-native's Image, TextInput, and ScrollView the Canvas way: each extends the
  RN component's props, adds a `className`, and renders `style={[resolved, style]}`
  so a caller-supplied style still wins. ScrollView adds a `contentClassName` prop for
  the content container (RN's contentContainerStyle), where padding/gap/centering
  belong; `className` styles the scroll frame.

  Avatar, MediaObject, Input, and Textarea now use these primitives internally
  instead of importing raw react-native components. Purely additive: new exports
  plus internal refactors with no behavior change.

  Canvas still does not re-export raw react-native (FlatList, Modal, Animated,
  Dimensions, etc.); import those directly from react-native.

### Patch Changes

- 473a8d0: Float overlay panels instead of rendering them in normal flow

  Dropdown, RowMenu, Popover, Combobox, and Command (trigger mode) now render their
  open panel as an absolutely positioned floating card anchored to the trigger (the
  trigger wrapper is `relative`), instead of as an in-flow card that grows the
  container. The panel overflows its container rather than stretching it, matching
  how these overlays behave in a real layout. No API changes; the open state still
  uses no portal/Modal, so a panel is clipped only by an ancestor with hidden
  overflow.

- 2f37c42: Input: coordinated focus on the addon (grouped) layout

  Focusing an Input that has addons (prefix/suffix/icons/action) no longer shows the
  browser's default outline clipped by the group's rounded, overflow-hidden
  container (which read as a half-baked ring). The inner field's default outline is
  suppressed and the group's shared border recolors to `border-ring` on focus, so
  prefix + field + suffix light up together as one control.

- 3f395c5: Fix floating overlays painting beneath later sibling content when open

  An open floating overlay (Popover, Dropdown, Combobox, RowMenu, the ButtonGroup
  split menu, and the trigger-mode Command palette) could be covered by content
  that follows it, because react-native-web gives every positioned View an
  implicit stacking context: the overlay card's own `zIndex` was scoped inside its
  `position: relative` anchor and could not rise above a later sibling. Each
  overlay now lifts its anchor into its own stacking context while open, so the
  trigger and the floating surface rise together above everything painted after
  them. Closed overlays are unchanged.

- 877de7a: Float the Select option list instead of expanding it in place

  When opened, Select's option list now floats above the content beneath it
  (absolute, anchored under the trigger) rather than expanding in-flow and pushing
  following content down. This matches Combobox and every other Canvas menu, so an
  open Select no longer reflows the surrounding form. The trigger, sizing, options,
  and selection behavior are unchanged.

## 3.2.1

### Patch Changes

- 1d32ab7: Improve dark-mode contrast. Structural and state tokens in the dark theme sat
  almost on top of the surfaces they paint over, so borders, dividers, hover
  fills, and selected rows were nearly invisible. Dark `--border` and `--input`
  move to 22% lightness, `--secondary`/`--muted`/`--accent` to 20%, and the
  elevated `--sidebar-accent`/`--sidebar-border` to 24%; the dark focus `--ring`
  is lightened so the focus indicator keeps a visible edge on dark surfaces.

  Selected and active states in the combobox, command palette, and sidebar now
  use a primary-tinted highlight, so a selected row reads as distinct from a
  plain neutral hover instead of looking identical to it.

  The contrast gate now parses the live dark tokens and asserts that borders and
  state fills stay perceptibly different from their surfaces, so this class of
  regression is caught automatically.

## 3.2.0

### Minor Changes

- fea3440: Reorganize component CSS by atomic-design level. The files that lived under
  `styles/components/` now live under `styles/atoms/`, `styles/molecules/`, and
  `styles/organisms/`, matching how the docs and the `category` field classify
  components.

  Migration: only affects consumers that import individual component CSS files.
  Update the path to the component's atomic level, e.g.
  `@olympusoss/canvas/styles/components/button.css` becomes
  `@olympusoss/canvas/styles/atoms/button.css` (button is an Atom; card is a
  Molecule; data-table is an Organism). The all-in-one
  `@olympusoss/canvas/styles/canvas.css` entry is unchanged, so consumers using it
  need no changes. Tokens, patterns, and utilities directories are unchanged.

## 3.1.0

### Minor Changes

- d750bdf: Add a responsive layout utility layer. Canvas now ships display, flexbox, grid,
  gap, sizing, and position utilities as static CSS in a new `canvas.utilities`
  cascade layer (declared last, so utilities override component defaults without
  `!important`). The vocabulary follows Tailwind (`flex`, `items-center`,
  `grid-cols-3`, `gap-4`, `w-full`) with mobile-first responsive prefixes
  (`sm:` `md:` `lg:` `xl:` `2xl:`). Gap utilities are token-backed, `.gap-4`
  resolves to `var(--space-4)`, so the spacing scale stays the single source of
  truth.

  The utility CSS is generated by `scripts/generate-utilities.ts` and committed as
  plain static files, so there is no Tailwind dependency and consumers still need
  no build step. Import the whole layer via `@olympusoss/canvas/styles/canvas.css`
  or a single concern via `@olympusoss/canvas/styles/utilities/flexbox.css`.

## 3.0.0

### Major Changes

- a144959: Canvas v3: CSS-first design system.

  Complete rewrite from v2 React component library to a pure CSS design system
  with optional JS utilities. Ships modular CSS files and small
  framework-agnostic helpers.

  Key changes:

  - All components are now CSS classes (no React/framework code)
  - Custom properties are the theming API (HSL channels, shadcn-compatible)
  - CSS layers for specificity control (reset, tokens, base, components, patterns)
  - Light/dark via `.dark` class, glass surface via `data-surface="glass"`,
    density via `data-density="compact|comfy"`
  - 45 component CSS files, 7 token files, 7 pattern files
  - WCAG AA color contrast compliance
  - prefers-reduced-motion and prefers-contrast support
  - Framework-specific components move to dedicated packages
    (canvas-react, canvas-vue, canvas-flux, canvas-react-native)
