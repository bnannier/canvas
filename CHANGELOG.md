# @nannier/canvas

## 8.1.0

### Minor Changes

- 4964457: Relicense Canvas under the License.

  Canvas is now free and universal. The previous proprietary "all rights reserved"
  license is replaced with proprietary, and the `license` field in `package.json` changes from
  `UNLICENSED` to `proprietary`, so the published package is legally usable, modifiable, and
  redistributable by anyone. No code or API changes accompany this: it only removes the
  usage restriction that blocked adoption.

- 76ce950: Typography: add a `tightLeading` leading axis.

  A fourth axis alongside role, tone, and weight. It pulls the line box in to 1.25x the
  font size for a stacked lockup, where two lines read as one unit (a wordmark over its
  tagline, a title over its subtitle) and the roles' reading leading leaves dead air
  between them. Previously nothing could close that space: the leading is baked into each
  role, a Column's gap can only add, and `lineHeight` at a call site is a banned restyle.

  `tightLeading` only ever tightens, clamping against the role's own line height, so it is
  safe on every role including the already-tight display scale (`display` 48/48, `h1`
  36/40). Omit it for prose, where the role's line height is the reading value. Additive
  and backward-compatible: no existing call site changes.

### Patch Changes

- 9955c0f: Fix the Android Material ripple bleeding past a control's rounded corners, kit-wide.

  A bounded `android_ripple` is installed as the pressable's OWN background drawable, masked to a
  rectangle. React Native implements `overflow:"hidden"` as a path-clip applied only in
  `ViewGroup.dispatchDraw` (children only) and never enables `clipToOutline`, so a node can never
  clip its own ripple: the rectangle bleeds past the rounded corners. Setting `overflow:"hidden"` on
  the same node as the ripple (the kit's previous approach across ~20 rounded controls) does nothing
  on a real Android device.

  New `RippleClip` primitive: a rounded, `overflow:"hidden"` PARENT that wraps a bounded-ripple
  pressable so the parent's child-clip rounds the ripple. It is Android-only (no ripple to clip on
  iOS/web) and a transparent layout passthrough elsewhere, so node structure and layout are identical
  across platforms. Helpers `cornerRadii` (match the child's corners with no hard-coded radius) and
  `splitElevation` (keep an elevated card's shadow while its ripple is clipped) ship alongside it. The
  same-node `rippleClip()` helper is re-documented for its only correct use — an `overflow` on the
  rounded PARENT of ripple rows.

  Every rounded, bounded-ripple control now routes its ripple through the correct clip: Button,
  ButtonGroup, Chip, Pagination, Stepper, Select, Autocomplete, Listbox rows (left unwrapped — 2px
  radius, and a wrapper would break `listbox`/`option`), Navbars, Sidebar, Tabs, Steps, Toast,
  Calendar, StackedLists, AlertDialog, Dialog, Stats, Card, MediaObject, CodeBlock, and the menu
  surfaces Dropdown, RowMenu, ActionSheet, and FilterPanel.

- 2df3866: Correct the npm package description.

  The description said "styled with Tailwind", which misrepresents the public API:
  Tailwind utilities are an internal implementation detail, and the consumer-facing
  styling surface is semantic boolean props. The description now reads "Universal React
  Native UI kit: one component API renders natively on iOS, Android, and web." Also adds
  a `material-design` keyword alongside the existing platform keywords.

## 8.0.0

### Major Changes

- 7064c3f: Change the license from proprietary to proprietary (`UNLICENSED`). The source is private and
  all rights are reserved; no universal grant applies. Note that the already-published
  `7.0.0` stays proprietary (a published version's license cannot be retroactively revoked), so
  this takes effect for new versions going forward.
- 5607a53: Rename the `Combobox` component to `Autocomplete`. The searchable single-select (a
  text input paired with a filtering dropdown) is unchanged in behavior, props, and
  accessibility, but its export, type, and docs route are renamed: `Combobox` →
  `Autocomplete`, `ComboboxProps` → `AutocompleteProps`, and `/components/combobox` →
  `/components/autocomplete` (the old route redirects). The underlying ARIA
  `role="combobox"` on the field is intentionally kept, since that is the WAI-ARIA role
  for this pattern. To migrate, replace `import { Combobox } from "@nannier/canvas"`
  with `import { Autocomplete } from "@nannier/canvas"` and rename the JSX tag and any
  `ComboboxProps` references.

### Minor Changes

- a58ad6d: `DataTable`, `Feed`, `StackedList`, and `GridList` gain an opt-in `virtualized`
  boolean that renders their rows/tiles through a windowed `FlatList` instead of
  mounting every one up front, for large datasets. Give the list a bounded height (via
  `style`, e.g. `{ maxHeight: 400 }`) so it can window and scroll; without one it warns
  in development and renders eagerly. DataTable keeps its header row fixed above the
  windowed body and preserves its `role="table"` rows. The default (omitting
  `virtualized`) mounts every row exactly as before, so existing usage is unchanged.

## 7.0.0

### Major Changes

- cb9ea40: Ship a compiled package instead of raw TypeScript, and make optional peers truly
  optional.

  **Packaging (breaking).** The package now publishes compiled ES modules +
  `.d.ts` built from `tsconfig.build.json` (`dist/`), with platform forks
  preserved as `.ios.js`/`.android.js`. `main`/`module`/`types` and the exports
  map point at `dist`; `files` ships `dist` + `styles` + `CHANGELOG.md`. This
  fixes the tarball being unresolvable for stock Metro/Expo consumers (the raw
  source's NodeNext `.js` specifiers required a private resolver hack) and makes
  consumer type-checking safe (`skipLibCheck` applies to `.d.ts`). Anything that
  imported internal `src/...` paths must switch to the package root export.

  **Optional peers (breaking for transitive reliance).** `expo-blur`,
  `expo-glass-effect`, and now `react-native-qrcode-svg` are optional peer
  dependencies loaded via guarded literal `require`: consumers who skip them
  build cleanly and the features degrade gracefully (glass falls back to the
  translucent fill; `<QRCode />` renders its labeled frame and warns once in
  dev). `react-native-qrcode-svg` is no longer a hard dependency — install it if
  you render QR codes.

  **Safety nets.** `getComputedStyle`/`document` use in the web token helper is
  now guarded (no crash on native/SSR import); `scripts/verify-package.ts` gates
  CI and `prepublishOnly` (specifier-resolution integrity, platform-fork
  preservation, no raw TS, no DOM types in the public `.d.ts` surface); the test
  suite now smoke-renders components from the compiled `dist`.

- adf35df: rename the `IconTile` atom to `Emblem`

  The tinted rounded-square-or-circle that holds an icon or a short monogram is
  now `Emblem` (with `EmblemProps`), a name that fits the monogram path as well as
  the icon path. This is a breaking rename: the `IconTile` and `IconTileProps`
  exports are removed. Update imports from `IconTile` to `Emblem`. The docs page
  moved from `/components/icon-tile` to `/components/emblem` (the old URL redirects).

- c112474: Remove the `multiline` prop from `Input`; use the dedicated `Textarea` atom for multi-line entry.

  `Input` used to double as a text area when passed `multiline`, overlapping the
  first-class `Textarea` atom (its own shape, sizing, `rows`, and `flush`
  variant). Two components rendered the same thing, which blurred which one to
  reach for and duplicated the multi-line sizing logic across both. `Input` is now
  single-line only: `multiline` is gone from `InputProps`, and the skins drop
  their multiline min-height branches.

  Migration: replace `<Input multiline ... />` with `<Textarea ... />`. The
  Textarea takes the same `value`/`onChangeText`/`placeholder`/`error`/`disabled`
  props plus `rows` for the visible height, so most call sites change only the tag
  name. This is a breaking change to `Input`, hence the major bump.

- 8eae79b: Rename two components so their names match what they do.

  - The ± numeric control (a minus button, an editable numeric field, and a plus
    button, clamped to a range) was `NumberInput`. It is renamed `Stepper`, the
    name Apple uses for exactly this control (`UIStepper`); "NumberInput" read like
    a plain numeric text box and hid the increment/decrement behavior.
  - The multi-step progress indicator (numbered circles joined by connectors, with
    horizontal, vertical, and progress-bar layouts) was `Stepper`. It is renamed
    `Steps` (matching Ant Design's split) to free the `Stepper` name for the control
    above.

  Breaking changes for consumers:

  - `NumberInput` → `Stepper`; the `NumberInputProps` type → `StepperProps`.
  - The old `Stepper` (multi-step progress) → `Steps`; `StepperProps` (its props)
    → `StepsProps`. The `Step` item type is unchanged.

  To migrate: if you used the numeric ± control, rename `NumberInput` to `Stepper`
  (props are identical). If you used the multi-step progress indicator, rename
  `Stepper` to `Steps` (props are identical). The docs move from
  `/components/number-input` to `/components/stepper` and from `/components/stepper`
  to `/components/steps`; the old numeric-control URL redirects to the new one.

- 554657f: `InputOTP` is now controllable both ways and its change callback is renamed
  (breaking). `value` is optional, a new `defaultValue` seeds uncontrolled use, and
  the field is routed through `useControllableState`, so a bare `<InputOTP />` is
  typeable out of the box (previously `value` and `onChange` were required and a bare
  field would not compile). The change callback is `onChangeText` (was `onChange`),
  matching `Input` / `Textarea` / `Field`. Migrate by renaming the callback, and drop
  the now-optional `value` for uncontrolled use: `<InputOTP value={code} onChange={setCode} />`
  stays valid as `<InputOTP value={code} onChangeText={setCode} />`, and
  `<InputOTP defaultValue="123" />` now works with no handler at all.
- 554657f: Align the status/intent prop names across the kit (breaking).

  - `Toast`: the danger intent is now `error` (was `destructive`), matching `Alert`,
    and a new `warning` intent (amber, with an alert-triangle glyph) joins it.
  - `EmptyState`: the affirmative tone is now `success` (was `positive`).
  - `Typography`: the affirmative text tone is now `success` (was `positive`); it
    already had `warning`, so its tone axis is now
    muted / subtle / primary / destructive / success / warning.

  Each rename is name-only; the colors are unchanged (they already read the semantic
  `success` / `destructive` / `warning` tokens). Migrate by renaming the prop at the
  call site: `<Toast destructive>` becomes `<Toast error>`, `<EmptyState positive>`
  becomes `<EmptyState success>`, `<Typography positive>` becomes `<Typography success>`.

- 554657f: `Tabs` now fires `onSelect` (was `onChange`) when the active tab changes, matching
  `TabBar` and `ButtonGroup`, which already expose `active` + `onSelect` for the same
  concept. Migrate by renaming the handler: `<Tabs onChange={...}>` becomes
  `<Tabs onSelect={...}>`. The controlled `active` / uncontrolled `defaultActive`
  props are unchanged.

### Minor Changes

- dc26af5: Accessibility, keyboard, and platform correctness.

  - **Slider is keyboard-operable on the web.** The handle is a tab stop and
    responds to Arrow keys (±step), PageUp/PageDown (±10 steps), and Home/End
    (min/max), all clamped, with `aria-valuenow` kept in sync. Disabled sliders
    leave the tab order and swallow keys.
  - **Dialog & AlertDialog manage focus.** On open they move focus into the panel;
    Escape closes them; focus returns to the previously-focused element on close;
    Tab is trapped within the panel; and input-bearing dialogs avoid the iOS
    keyboard (`KeyboardAvoidingView`). All guarded so native/SSR never touch DOM
    globals.
  - **Chip is accessible and native-feeling.** A toggle Chip exposes its active
    state (`accessibilityState.selected` + `aria-pressed`); a disabled interactive
    Chip keeps its button role; the remove button announces the specific chip
    ("Remove Draft") and has a ~44pt target; Android shows a press ripple.
  - **Modal overlays respect the device.** `Drawer` and `ActionSheet` inset for
    safe areas (home indicator / notch) and avoid the keyboard on iOS.

- 7ee0ce2: Add an optional `trigger` prop to ActionSheet, matching Dialog and Drawer.

  ActionSheet was controlled-only (`open` was required), so every rendered example
  forced a full-screen Modal open at once. It now accepts a `trigger` label: when
  set, it renders its own button and opens itself on press (uncontrolled internal
  state), and `open` is optional. Driving `open` / `onOpenChange` yourself still
  works exactly as before, so the change is backward compatible.

- 785730d: Add the `activeIndicator` style helper (exported from the package root alongside the other style primitives). It builds the Material / iOS bottom active-indicator, a bottom border that thickens when a field becomes active, while reserving a constant band below the content so the thickening never reflows the field's vertically-centered value text. Canvas's own `Select`, `Combobox`, and `Input` fields now build their indicator from it (one source of truth for the invariant, replacing the per-field compensation), and consumers can use it to build matching custom fields. No visual change to the existing components.
- 7cefe79: Add an `actions` footer slot to `Alert`. It renders below the body, owns the top
  separation from the description, and lays its buttons out in a row, so a call site
  passes the buttons directly (`actions={<Button primary small>Upgrade plan</Button>}`)
  instead of hand-rolling a `<View style={{ marginTop, flexDirection, gap }}>` wrapper.
  Pass a fragment for more than one action; `children` still renders for freeform
  content. This closes the last styling escape hatch in the Alert docs (the action-row
  wrapper the "No styling escape hatches" directive points at).
- 3b9eae5: API-completeness foundation. `Input` and `Textarea` forward the curated
  text-entry slice of React Native's TextInput (`defaultValue`, `secureTextEntry`,
  `keyboardType`, `inputMode`, `autoCapitalize`, `autoComplete`, `autoCorrect`,
  `autoFocus`, `maxLength`, `returnKeyType`, `textContentType`,
  `onSubmitEditing`, `onFocus`/`onBlur` (chained with internal focus styling),
  `onKeyPress`, `testID`), so real forms (login, search, OTP) are buildable. New
  `useControllableState` hook powers controlled + uncontrolled duality; `Switch`
  adopts it (`defaultChecked`; a bare `<Switch />` is now interactive) and gains
  `testID`.
- 4866ec5: Add `AvatarGroup`, the overlapping avatar stack, so no call site writes a magic
  `marginLeft: -12` to overlap avatars. It caps the visible avatars at `max`,
  collapses the remainder into an automatic "+N" chip (`total` overrides the count
  for server-known totals), forwards its size to every child, and injects the
  overlap margin and separator ring internally, so the caller's Avatars carry no
  layout style. Overlap tightness is a boolean axis (`tight`/`snug`/`loose`).
  `Avatar`'s `style` prop is no longer documented as an overlap escape hatch.
- fe1ce1e: Add a `maxItems` prop to `Breadcrumb` that collapses a long trail: it keeps the
  first crumb and the last `maxItems - 2`, replacing the middle with a single "…"
  crumb, so a deep path stays on one scannable line instead of being hand-composed
  with raw Pressable/Text.
- 15a1d91: Trading charts, part 1. New `CandlestickChart`: OHLC candles (body + wick)
  colored by direction from the success/destructive tokens, an optional docked
  volume pane sharing the x axis, optional overlay series (moving averages) in
  the `chart-1`..`chart-8` token colors with a legend, nice non-zero-based
  price ticks, and the full inspect experience (flag with Open/High/Low/Close/
  Vol rows, dimming, accessibility announcements; every candle's OHLC lives in
  the plot's accessible name). Press-to-inspect across all cartesian charts is
  also upgraded to SCRUB-to-inspect: dragging a finger or mouse moves the
  selection continuously (core RN responder system, no gesture-handler; a
  stationary tap on the selected band still clears it).
- 8ba9f92: Add a `grow` prop to `Card` (flexGrow: 1) so a card can fill the main axis of a
  parent Row/Column without a raw `flexGrow` style, e.g. an event panel beside a
  Calendar.
- 761b357: Card now pads its surface by default when it has content, so a bare `<Card>Content</Card>`
  reads right without remembering `padded` (the common case, and an easy thing to forget).
  Pass the new `flush` prop for edge-to-edge content (a table, a nav bar, a text field with a
  toolbar) or when you compose the self-padding `CardHeader`/`CardContent`. The data-driven
  string-prop path (a childless `<Card title=... description=... />`) is unchanged: its own
  rendered sections carry the padding, so the container stays bare. Existing `padded`,
  `compact`, and `comfortable` cards are unaffected; `padded` is now just the explicit form of
  the default.
- 68d74f3: Add a `selected` prop to `Card`: an active/selected surface (a primary border and
  a soft primary tint, with no border-width change so content never shifts). This
  lets a card-style selectable option (a card radio or checkbox) show its chosen
  state without hand-composing a bordered, tinted Pressable.
- 43c890a: Add `chart-1`..`chart-8` categorical series tokens to `ColorTokens` (light and
  dark), making the data-viz palette brandable via `ThemeProvider` token
  overrides. The palette is validated against both card surfaces for OKLCH
  lightness band, chroma floor, adjacent-pair colorblind separation, and 3:1
  contrast: indigo-500, teal-600, orange-600, rose-500, violet-500, cyan-600,
  emerald-600, pink-500. `StackedBar` segment colors now read these tokens; four
  hues shift one step from the previous hardcoded set (teal/cyan/emerald 500 to
  600, amber-500 to orange-600) so every mark clears 3:1 contrast on white and
  the dark lightness band. BREAKING-ADJACENT for CSS consumers: the
  `--chart-1..5` variables in `styles/canvas.css` (previously an unrelated
  5-hue set) now carry these same values, and `--chart-6..8` are new.
- 00a24c4: Press-to-inspect across the chart family, on by default and controllable via
  the `selected` / `defaultSelected` / `onSelect` trio. Pressing a category
  (Chart vertical bars, LineChart, AreaChart), a slice (PieChart), or a point
  (ScatterPlot, addressed as `{ series, point }`) toggles an inspection state:
  cartesian charts draw a guide line, emphasized intersection dots, and an
  in-plot value flag clamped to the plot bounds; bar charts dim the other
  categories (grouped clusters also get the flag); a donut swaps its center
  readout to the selected slice; scatter rings the point and flags its
  coordinates. Every selection is mirrored to assistive tech via an
  accessibility announcement. Keyboard arrow navigation of data points is a
  planned follow-up; the full data remains available to screen readers through
  each plot's accessible name.
- 622165b: Add three chart types to the charts family so a stacked bar, a gauge, or a
  heatmap is a real component instead of a hand-composed grid of Views:

  - `StackedBar` — a proportional segmented bar with a labelled dot/percent legend.
  - `Gauge` — a ring (muted track + a tone-colored fill arc via react-native-svg)
    with the value and an optional label centered inside.
  - `Heatmap` — a wrapping grid of cells whose fill intensity encodes each value,
    with an optional less-to-more legend.

  Like `Chart` they are a Shared platform treatment (identical on iOS, Android, and
  the web).

- 34bd68d: Charts are now their own tier. The kit source moves from
  `src/organisms/charts` to a top-level `src/charts/` with one directory per
  chart component (Chart, LineChart, AreaChart, PieChart, ScatterPlot,
  CandlestickChart, DepthChart, StackedBar, Gauge, Heatmap) sharing the
  frame/math/inspect core in `src/charts/shared/`. Every component keeps its
  existing name and export from the package root, so no consumer import
  changes. The docs gain a "Charts" category at the same level as Atoms,
  Molecules, and Organisms (sidebar group after Organisms, its own catalog
  section with preview tiles, and one page per chart type); the old combined
  `/components/charts` page redirects to `/components/chart`.
- af27139: `Checkbox` adopts `useControllableState` (`defaultChecked`; a bare
  `<Checkbox />` now toggles out of the box) and gains `testID`. `Radio` gains
  `testID`; it stays controlled-only because a radio has no self-contained
  toggle semantics (the group owns which option is selected).
- 36ace28: Add `Chip` and `IconTile` atoms.

  `Chip` is the interactive pill (filter chips, tags, selectable tokens): an
  optional leading icon and label, tappable with `onPress`, and a trailing "×"
  remove button with `onRemove`, so no call site hand-composes a `borderRadius` +
  `backgroundColor` + padding Pressable. Tone is a boolean axis (`secondary` /
  `primary` / `outline`; `primary` is the active state).

  `IconTile` is the tinted rounded square that holds a single `Icon` (the recurring
  icon-on-a-soft-background in cards, media objects, empty states, and feeds). A
  tone tints the square and paints the glyph to match, so no call site
  hand-composes the icon background.

- 7b0e465: Reshape `Chip` to read as a chip, not a button, and give it a color axis.

  A chip is a low-emphasis tag, so it no longer wears a saturated button fill: every
  chip now renders a SOFT tint (a light wash + subtle border + strong text; reversed
  in dark), the same recipe `Badge`'s status pills use, so the two read as one system.
  The `primary` prop, which previously painted the full saturated primary fill (visually
  identical to a primary `Button`), is now a soft brand-accent (indigo) tint and the
  state a selectable chip lights up to.

  A new color axis tints a chip with a boolean, in two families that both resolve to
  the soft tint: semantic status (`success` / `warning` / `error` / `info` / `neutral`,
  matching Badge) and free-form palette hues (`red`, `orange`, `amber`, `yellow`,
  `lime`, `green`, `emerald`, `teal`, `cyan`, `sky`, `blue`, `indigo`, `violet`,
  `fuchsia`, `purple`, `pink`, `rose`, plus `gray`). Status names alias a hue
  (`success` → green, etc.). `outline` composes with any color for a border-only chip
  in that hue, and a selectable chip lights up to its color's fill (or brand indigo
  when it has none). A leading `<Icon />` and the remove "×" auto-tint to the chip's
  label color, so a bare `<Icon check />` matches its chip without threading the color.

  A chip is a compact tag, so it now has a single (small) size: the `small` prop and
  the size axis are removed, and every chip renders at the former small size.

  Also adds a `color` prop to `Icon`: an explicit glyph paint for hues the semantic
  color booleans do not name (the semantic booleans still take precedence). It exists
  so a component like Chip can tint its remove glyph to its own label color.

- 28c9e2d: Add a selectable (filter-toggle) mode to Chip. A chip's selected look is its `primary` fill, but that was a static prop, so a tappable filter chip fired `onPress` without ever toggling its own state. A new `selectable` prop turns the chip into a toggle that owns its selected state (controlled via `selected`, uncontrolled via `defaultSelected`, `onSelectedChange` fires the next value); pressing it flips between its base tone and the active `primary` fill and updates the pressed/selected accessibility state. Non-selectable chips are unchanged.
- a7e5c09: Add a `trailing` slot to `Chip` (a trailing element such as a chevron, so a
  Chip can be a menu/account trigger: leading avatar + label + chevron) and a
  `label` monogram prop to `IconTile` (a letter or two painted in the tone color,
  for the letter-tile used on stat cards). Together these let an account-menu pill
  and a monogram tile be built from real components instead of a hand-composed
  bordered Pressable or tinted letter square.
- 1255b2d: Combobox supports uncontrolled selection and initial-open state.

  Combobox previously treated `value` as read-only display: selecting a row fired
  `onSelect` but never updated the shown selection, so a bare `<Combobox />` could
  not actually pick an option. It now manages its own selection via
  `useControllableState` (controlled when `value` is passed, self-managed
  otherwise) and adds `defaultValue` for the uncontrolled case, so selecting a row
  updates the field. A `defaultOpen` prop renders the list open initially while
  staying interactive (the chevron or a selection closes it), alongside the
  existing controlled `open`. Backward compatible: driving `value` / `open`
  yourself works exactly as before.

- af27139: `Combobox` is actually typeable. The field is now a real `TextInput` (was a
  static `Pressable`, so users could not type): keystrokes edit the query and
  filter the option list live. The query joins the controlled + uncontrolled
  contract via `useControllableState`: the existing `query` prop keeps working
  (controlled), new `defaultQuery` seeds uncontrolled use (a bare `<Combobox />`
  filters as you type), and new `onQueryChange` fires in both modes (including
  with `""` when a select resets the filter). Focus or typing opens the list and
  the trailing chevron toggles it; selection, skins, and the option-list a11y are
  unchanged, the field itself now announces as `role="combobox"` with
  `aria-expanded`. Also adds `testID` and a forwarded ref to the text field
  (`focus()` works), with a `displayName`.
- 7b83030: Trading charts, part 3. New `DepthChart`: the order-book view - cumulative
  bid and ask step areas mirrored around the spread (bids in the success tone,
  asks in destructive, translucent fills under solid step edges) on a numeric
  price axis with nice ticks and both-axis gridlines. Levels are sorted and
  accumulated internally (suffix sums for bids, prefix for asks); a crossed
  book devWarns. The accessible name summarizes best bid/ask and per-side
  level counts and totals.
- 76d24d8: Add a development-only `devWarn` helper (plus `resetDevWarnings` for tests) and wire
  it into the data-driven charts, so degenerate inputs the kit otherwise resolves
  silently now surface a one-time console warning during development: an empty
  `Chart` / `Heatmap` / `Sparkline` series, an empty or all-zero `StackedBar`, and a
  `Gauge` value outside 0–100 (still clamped). The warning is a no-op in production and
  fires at most once per unique message, so a re-render never spams the log.
- 15a1573: The `Drawer` gains a `top` edge: a sheet that drops down from the top (mirroring the `bottom`
  sheet), sliding on a manual translateY like the `left`/`right` edges do.

  The responsive `Sidebar` drawer's edge is now configurable. It slides from the start (left) edge by
  default, and `drawerRight`, `drawerTop`, `drawerBottom` change which edge it slides in from
  (`left`/`right` are full-height side panels; `top`/`bottom` are content-sized sheets). iOS still
  uses its native menu, not the drawer.

- 9d1438c: Every input-like control now renders at a standard width by default, so bare
  fields look even without per-call-site width shims. Input, Textarea, Select,
  Combobox, and Field (control mode) render at 320px and shrink inside narrower
  parents (`maxWidth:"100%"`), which is how the phone form factor is handled.
  The new width axis picks the other modes: `narrow` (240px) for toolbars and
  short values, `wide` (480px) for long values and roomy multiline entry, and
  `block` to fill the container. The explicit width is deliberate, and holds on
  every form factor: in a centered or content-sized layout a bare `width:"100%"`
  collapses each field to its content's natural width, uneven per platform and
  resizing on every keystroke.

  `block` on Input, previously a documented no-op, now does exactly what it says.
  Field, Form, Fieldset, Dialog, and AlertDialog compose their inner Inputs with
  `block`, so form and dialog layouts are unchanged; Textarea's `flush` implies
  `block` (the framed container is the field edge); Field's read-only `rows=`
  display mode stays unsized. If a consumer relied on a bare field stretching
  with its container past 320px (a full-bleed toolbar search, for example),
  `block` is the one-word restoration.

  The docs examples drop their ad-hoc maxWidth wrappers accordingly, and the
  docgen style guardrail now rejects new `maxWidth`/`minWidth` shims placed
  directly on these controls in example/Do fences.

- 554657f: `FilterPanel` selection is now controllable. New `value` / `defaultValue` props (the
  keys of the checked options) let a parent drive, sync (e.g. from a URL query), or
  reset the selection, and a new `onSelectionChange` fires the full set of checked keys
  on every change. Each option gains an optional `value` for a stable key (it defaults
  to `"groupIndex:optionIndex"`). This is additive: the existing per-toggle `onChange`,
  `onClear`, and `option.checked` seeding all keep working, so uncontrolled panels are
  unchanged.
- 86a9622: Combobox, Select, and Textarea gain the platform-adaptive floating `label` for M3 parity with Input.

  - **Shared floating-label helper.** The Material 3 in-container floating label
    (shipped for Input) is extracted into `src/style/floating-label.tsx`: a single
    `FloatingLabel` component + `FloatingLabelStyles` skin slice (`floatingLabel`,
    `labelAbove`/`labelRest`/`labelFloated`/`labelReserve`) + the split-driver
    animation. Input now consumes it (its inline copy is deleted, behavior
    byte-identical — its 16 label tests stay green), and Combobox, Select, and
    Textarea consume the same helper, so all four filled-field controls float their
    label identically and a fix lands once.
  - **New behavior per control.** `label` names the field and its placement is
    platform-forward: **iOS and web render the label ABOVE the control**, while
    **Android floats the M3 in-container label** — centered like a placeholder at
    rest, floating to the top (body-small) once the control is active or filled.
    The float trigger is per control: Combobox/Select float on OPEN (their focus
    equivalent) or when a value is present; Textarea floats on focus or when filled,
    and (being multiline) rests the label on the first text line rather than the box
    middle. The native placeholder is gated so the resting label is the sole
    placeholder on the Android skin.
  - **New `label` / `required` props on Textarea** (previously label-less); Combobox
    and Select keep their existing `label` and gain `required`. `required` adds a
    destructive "\*" hidden from assistive tech and sets `aria-required`; the label
    is the control's programmatic name (`accessibilityLabel`/`aria-label`, plus
    `aria-labelledby` on Textarea, matching Input). Select's trigger is now named by
    its label on both channels (it previously rendered the label as unlinked text).
  - The animation stays cross-platform-safe: `translateY` + `scale` on the transform
    driver (native off-thread on iOS/Android-Fabric, JS on react-native-web) and the
    label COLOR on a separate JS-driver value (muted -> brand `ring` -> `destructive`
    on error), never `fontSize`/`top`/`width` and never a color interpolated off the
    transform value. A flush Textarea always renders the label above (an in-container
    float makes no sense once its frame is dropped inside a toolbar Card).
  - Backward-compatible: the new props are additive and optional; a label-less
    Combobox/Select/Textarea returns the identical control as before.
  - **Follow-up (owed):** manual native verification on the iOS simulator and the
    Android emulator (the float geometry/tracking is code-reviewed but not
    device-checked here); the Select-with-leading-icon resting label uses the
    container's 16dp start inset (not indented past the icon), acceptable since the
    documented icon example carries a value and floats.

- b0ca8dd: Input gains a platform-adaptive `label` (and `required`).

  - **New `label` / `required` props on Input.** `label` names the field and its
    placement is platform-forward: **iOS and web render the label ABOVE the
    control** (the static title the Field/Form composers produced before), while
    **Android floats the Material 3 in-container label** — centered like a
    placeholder at rest, floating to the top (body-small) once the field is
    focused OR filled. The float runs a split-driver animation: `translateY` +
    `scale` on the transform driver (native off-thread on iOS/Android-Fabric, JS
    on react-native-web) and the label COLOR on a separate JS-driver value
    (muted at rest -> brand `ring` on focus -> `destructive` on error), so it
    animates on all three platforms without the Fabric layout-stuck / RNW
    loop-freeze pitfalls. The placeholder is gated to the focused state on the
    floating skin (M3), and a prefilled `value`/`defaultValue` starts floated.
    `required` adds a destructive "\*" that is hidden from assistive tech and sets
    `aria-required`; the label is the field's programmatic name on both channels
    (`accessibilityLabel` + `aria-labelledby` -> the label's `nativeID`).
  - **Field, Fieldset, and Form now DELEGATE their label to Input.** They drop the
    external `<Text>` label (and the `accessibilityLabel`/`aria-labelledby` they
    wired by hand) and pass `label`/`required` through, so the Android rows get the
    real M3 floating label. Each composer keeps rendering the helper/error MESSAGE
    below the control and links it as the field description (`aria-describedby`).
  - **EXCEPTION (intentional):** Form's `sidebar` layout keeps its label in the
    BESIDE column (label + helper on the left, input on the right) rather than
    delegating — that beside-column arrangement is the layout's whole point, not
    the flagged missing-label gap, so `SidebarField` still renders its own label.
  - Backward-compatible: `label`/`required` are additive and optional; a
    label-less Input returns the identical bare field as before. Only Input
    implements the label placement.
  - **Follow-up (owed):** manual native verification on the iOS simulator and the
    Android emulator (the float geometry/tracking is code-reviewed but not
    device-checked here), and extending the same `label` treatment to Combobox,
    Select, and Textarea (currently static-above / label-less, out of scope).

- bef6479: `Form` now collects the values its composed inputs hold and hands them to `onSubmit`.
  Previously a `Form` field with a `value` rendered a controlled input with no change
  handler, so on react-native-web it was frozen (typing reverted every keystroke) and
  `onSubmit` received nothing. The Form now owns the entered values internally: each
  text field is editable, each checkbox is tracked, and `onSubmit(values)` is called
  with a record keyed by each field/checkbox `name` (a new optional prop, falling back
  to the visible `label`). Text fields yield their current string, checkboxes their
  boolean. Adding the `values` argument to `onSubmit` is backward compatible.
- ed0d618: Glass surfaces now honor the OS accessibility settings, following Apple's Liquid
  Glass guidance:

  - Reduce Transparency renders every glass surface (overlays and bars) opaque
    instead of translucent.
  - Increase Contrast renders glass opaque with a contrasting `foreground` border.
  - The change is reactive: toggling either setting re-renders the theme, so on
    iOS 26 the surface flips live.

  Adds two public hooks, `useReducedTransparency()` and `useIncreasedContrast()`,
  and two additive `ThemeValue` fields (`reducedTransparency`, `increasedContrast`).

  Also fixes the iOS &lt; 26 frost, which was missing the translucent `popover`
  under-fill the web and Android frost already had, so it now reads as a
  substantial material there too.

- 727b930: Glass overlays now animate open, following Apple's Liquid Glass "morph between
  related states": anchored menus (Select, Dropdown, Combobox, Popover, Row-menu,
  Button-group split menu) pop open from the trigger's corner, and Dialog / Alert
  Dialog scale-fade into place. The animation is one-shot (transform + opacity, native
  driver where available) and is skipped under Reduce Motion, which renders the final
  frame statically. Adds an internal `Entrance` primitive. Close/exit stays instant.
- c474eca: Glass surfaces no longer draw a skin hairline border on top of the material.
  Following Apple's Liquid Glass guidance to remove custom borders from navigation
  surfaces, `splitSurfaceStyle` now strips border width/color/style under glass (radius
  is kept): the edge comes from the material itself (native Liquid Glass on iOS 26) or
  the specular rim (the frost on web, Android, and iOS &lt; 26). Solid mode and the
  module-absent fallback are unchanged and keep their borders. The specular rim is now
  shared across all frost platforms, including iOS &lt; 26, which previously had no edge.
- 6899453: `GlassSurface` gains a `sheer` prop: a lighter, thinner frost for CONTENT-layer surfaces that
  float over a live backdrop and do not need to occlude it, so whatever animates behind reads
  clearly through the surface. The full frost (the default) is unchanged and stays opaque enough
  for functional overlays (menus, dropdowns, dialogs) to occlude the content they open over.
- fbb167e: `Chart` gains grouped multi-series bars: pass `labels` + `series` (the shared
  `ChartSeries` shape) to render clustered columns per category, colored by the
  `chart-1`..`chart-8` tokens in fixed series order, with a built-in legend
  (`hideLegend` to suppress) and per-category accessible items that announce
  every series' value. The single-series `data` shape is unchanged and `data`
  callers are unaffected; `ChartSeries` now lives in the Chart family's shared
  types.
- d4bcde9: **Heatmap gains a GitHub-style contribution calendar.** Pass `calendar` to lay
  the cells out as seven-day week columns with weekday (Mon/Wed/Fri) and month
  labels, discrete less-to-more levels, and a horizontal scroll so a full year
  stays legible on a phone. Hover or tap a day to inspect its count and date in a
  tooltip, and lead with a `caption` summary line.

  - **Richer cell data.** `values` now accepts `{ value, count?, date?, label? }`
    cells alongside bare intensity numbers (fully backward compatible). `count`
    and `date` drive the inspect tooltip; `date` (ISO `YYYY-MM-DD`) also derives
    the calendar's month labels.
  - **Inspect-to-read.** Cells are pointer-only (the grid keeps a single
    summarizing image role, so a year of days is not 365 tab stops); the active
    day gets a highlight ring and announces its count and date to assistive tech.
  - The default wrapping grid layout and its accessible name are unchanged.

- 7b0e465: The Icon set grows from ~90 hand-transcribed glyphs to 413 curated Lucide glyphs,
  now generated rather than typed by hand. A new codegen pipeline (`tools/icongen`,
  run via `bun run icons:gen`) reads `lucide-static`'s `icon-nodes.json` and emits
  `src/atoms/icon/icon.glyphs.ts` (the `ICONS` primitive map, the `NAMES` gallery
  list, the one-boolean-per-glyph `IconGlyphProps`, and the `IconName` union). To add
  more glyphs, add their Lucide name to `tools/icongen/icons.ts` and regenerate.

  The boolean-prop API is unchanged (`<Icon rocket />`, `<Icon creditCard muted />`),
  `Icon` stays dependency-free at runtime (lucide-static is a dev dependency), and
  every previously-shipped glyph name is preserved — Lucide's 1.x renames (e.g.
  `more-horizontal`→`ellipsis`, `home`→`house`, `filter`→`funnel`) are aliased so
  `<Icon home/>`, `<Icon filter/>`, `<Icon alertTriangle/>` etc. keep working. The
  generator also gained fill support (Lucide `fill="currentColor"` nodes paint with
  the glyph color), so filled glyphs like `palette` and `keyRound` render correctly.

  New categories include arrows/chevrons, files, people & communication, media,
  weather & nature, devices, commerce, transport, dev/data, and status symbols. The
  `<Icon set />` gallery is the reference for the full list; the Icon prop table now
  omits the 400+ glyph-name booleans (documented by the gallery) so its real props
  stay legible.

- 554657f: `Icon` gains a `warning` color boolean (the scheme-aware `warning` token), joining
  `success` and `destructive` on the semantic color axis. It backs the new `Toast`
  warning intent and matches `Alert`'s warning tone.
- 977a49f: **Kbd composes whole shortcuts.** `Kbd` now takes a `keys` prop, so a chord is
  one component instead of a `Row` plus a cap and a separator per key. Pass a
  whitespace-separated string (`<Kbd keys="⌘ K" />`) or an array
  (`<Kbd keys={["⌘", "⇧", "P"]} />`) and Kbd renders one cap per key with `+`
  separators. Add `sequence` for a "press one, then the next" chord
  (`<Kbd keys="⌘K ⌘S" sequence />`), which spaces the caps instead of joining them
  with `+`. The whole shortcut is announced to assistive tech as a single
  accessible name (e.g. "⌘+K"), and the individual caps are hidden as decorative.

  `children` is unchanged and still renders a single cap (`<Kbd>Esc</Kbd>`), so
  this is backward compatible. The `Command` palette trigger now uses
  `<Kbd keys="⌘ K" />` instead of packing both keys into one cap.

- bd5a2d0: Add web keyboard operability to the composite selection widgets. A new shared
  `useRovingFocus` hook implements the WAI-ARIA roving-tabindex pattern (one tab stop,
  arrow keys move and activate, Home/End jump, RTL-aware horizontal arrows), and it is
  wired into:

  - `Tabs`: arrows move between triggers (horizontal, or vertical for the rail).
  - `RadioGroup`: arrows move and select options (all four arrows, APG radiogroup).
  - `Listbox`: arrows move a focus cursor; single-select follows focus, multi-select
    toggles the focused row on Enter/Space.
  - `Dropdown` menu: opening focuses the first row, arrows move focus, Enter/Space
    activates.
  - `Command`: the search row is now the focusable driver; ArrowUp/Down move the
    highlighted row (aria-activedescendant follows) and Enter selects it, implementing
    the keys the footer already advertised.

  All widgets stay operable by Tab + Enter/Space as before; the change adds arrow-key
  navigation and a single roving tab stop on the web. Native behavior is unchanged
  (the handlers never fire there). `RadioGroup`'s context value is now memoized, so a
  parent re-render no longer re-renders every radio.

- 715de75: New `LineChart` and `AreaChart` components: categorical-x series charts with
  single- and multi-series data (`labels` + `series`), a monotone `curved`
  option that never overshoots the data, `dots` markers (LineChart), `stacked`
  running-sum areas (AreaChart), automatic nice y-axis ticks and gridlines
  (`hideGrid`/`hideAxes`), a shared series legend for multi-series charts
  (`hideLegend`), `compact` density, tones for single series, and a
  `formatValue` data formatter. Colors come from the `chart-1`..`chart-8`
  tokens in fixed series order; the accessible name of the plot carries every
  value, series-prefixed, per the kit's chart a11y contract. Built on the
  kit's own react-native-svg frame: no charting library, no new dependencies.
- 73997da: Trading charts, part 2. `LineChart` gains the price-chart idiom: a
  `baseline` value (e.g. previous close) drawn as a dashed reference line that
  also extends the y domain, automatic gain/loss toning for a single series
  (success above the baseline, destructive below; explicit tone props still
  win), and a `fade` boolean painting a soft gradient under each line.
- 76f662a: Listbox joins the standard field width axis (`block` / `narrow` / `wide`).

  Listbox was the one input-like control that carried no width axis: its root
  list `View` had no defined width. On the web, flexbox intrinsic sizing hid the
  gap by shrinking the list to its content. On iOS and Android it did not: each
  row is a fixed 16px checkmark gutter plus a `flexBasis: "0%"` label stack, and
  in a content-sized or centered parent (a phone screen, a centered stage) Yoga
  resolved that percentage basis against an indefinite width to zero with no free
  space to grow into, so every label collapsed and only the checkmark strip
  showed.

  Listbox now extends `FieldWidthProps` like Input, Select, Combobox and
  Textarea: it stands at the 320px base by default, takes `narrow` (240) / `wide`
  (480), and fills its parent under `block`, always with `maxWidth: "100%"` so it
  shrinks inside a narrower container. This gives the list a definite width on
  every platform, which fixes the iOS/Android label collapse and makes stacked
  listboxes share one edge with the other fields.

- efa4f59: Menu and nav rows now render real Canvas `Icon` glyphs instead of raw emoji/symbol
  characters, so every icon in the kit comes from the kit's own icon set.

  `Dropdown`, `Command`, `Sidebar`, and `RowMenu` each took an item `icon` typed as a
  free `string` that was painted as a literal glyph (`"👤"`, `"⚙"`, `"✎"`, `"🗑"`, …). That
  was a hand-rolled non-Canvas icon: it ignored the theme, never matched the `Icon` stroke
  weight, and rendered differently per platform font. Those `icon` fields are now typed as
  `IconName` (the union of Canvas glyph names) and rendered through the `Icon` atom, tinted
  to the row (destructive rows go red, active sidebar rows carry the brand tint) and sized
  per platform. `RowMenu`'s `⋯` trigger is likewise the Canvas `moreHorizontal` glyph now.

  New `Icon` glyphs to cover the common menu actions: `pencil` (edit), `logOut` (sign out),
  and `save`. The kit also exports a new `IconName` type (the glyph-name union, derived from
  `IconProps` so it can never drift from the real set).

  Migration: replace emoji in menu/nav `items` with a Canvas glyph name, e.g.
  `{ label: "Sign out", icon: "logOut" }` instead of `icon: "↩"`, and
  `{ label: "Delete", icon: "trash", destructive: true }` instead of `icon: "🗑"`. Any
  glyph in the `<Icon set />` gallery is a valid name.

- 62c1d4c: Full OS design-language conformance pass across 32 components, matching each per-OS
  skin to its reference (Apple iOS 27 UI Kit / HIG, Material 3 Expressive, and the web
  reference).

  Fixes the docs 3-up misrepresentation where composed molecules/organisms
  (ActionPanel, DescriptionList, Feed, GridList, MediaObject, StackedList, FilterPanel,
  Drawer) rendered the web atoms on their iOS and Android rows: each now threads its
  composed atoms (Card, Avatar, Badge, Button) per platform.

  Skin corrections include: NumberInput iOS capsule + neutral glyphs + inset divider;
  Slider iOS 37x24 capsule knob and Android M3 Expressive thick-track anatomy; Progress
  Android active/track gap + stop indicator and iOS neutral track; ActionSheet iOS 27
  single-container capsule-row redesign; Chip Android M3 sizing restored (32dp, 8dp
  radius) with the selected-filter checkmark; Toast Android solid inverse-surface
  snackbar with legible inverse color roles; Accordion web chevron direction; Carousel
  native-idiomatic default (no overlay arrows); DataTable iOS title-case headers and
  compact-width column collapse; Drawer iOS 38pt sheet radius, scheme-aware scrim, and M3
  1dp elevation; kit-wide iOS SF-Pro tracking, `borderCurve: "continuous"` on iOS rounded
  surfaces, Android M3 type roles, ripple-helper routing, and 44pt/48dp minimum touch
  targets.

  New capabilities: Slider and Progress join the standard field-width axis
  (narrow/wide/block); EmptyState `icon` accepts a React element; Button carries a
  per-skin minimum touch target.

- aca9a9e: New `PieChart` component: proportional composition as arc slices with the
  `chart-1`..`chart-8` token colors in fixed order, a card-surface hairline
  separating adjacent fills, the StackedBar-style legend with per-slice
  percentages (`hideLegend` hoists the data-bearing img name to the root), a
  `donut` boolean that centers the compact total and label like Gauge, and
  `compact` sizing. Warns past 8 slices (fold the tail into "Other").
- 715dfa3: Popover: the panel can now host custom content. Pass `children` and it renders in the card body between the description and the action row — an input, a form row, any node — in both the triggered and the inline modes, on all three platform skins, with the panel still drawn on the shared `GlassSurface` material. The existing data-driven props (`trigger` / `title` / `description` / `actionLabel`) are unchanged and compose with children; pass any subset.
- e6b17ae: Progress: the determinate fill now animates.

  - The determinate bar **eases to each new `value` instead of jumping**, so a bar
    wired to real progress (an upload, a download) fills smoothly — matching iOS
    `UIProgressView` (`setProgress:animated:`), Material 3's animated indicator,
    and the shadcn/Radix web bar. It is positioned by `translateX` (a transform, so
    it runs off-thread on native and, unlike an animated width, is not frozen under
    the Android New Architecture; the web uses the JS driver). The Material 3
    segmented anatomy (active indicator, 4dp gap, inactive track, stop indicator)
    animates from the same value, and a static percent-width fill paints the value
    until the first layout so there is no empty flash. Reduce Motion snaps instead
    of easing, since the fill is information-bearing.

- a43342f: Add a `description` prop to `Radio` so the common title-plus-description option
  is built in, not hand-composed at the call site.

  The most common radio-group shape (a plan picker, a settings choice) pairs each
  option's title with a muted secondary line. Until now the control only rendered a
  single-line label, so every caller had to wrap each `<Radio>` in a `Row` + `Column`

  - two `Typography` nodes to get the title/description stack, roughly eight lines of
    scaffolding per option. `Radio` now takes a `description?: ReactNode`; supplying it
    renders the muted line under the label, ring aligned to the first text line, inside
    the control. This mirrors the existing `Switch` convention (`children` is the title,
    `description` is the secondary line).

  A full three-option group collapses from a nested `RadioGroup` / `Column` / `Row` /
  `Typography` tree to:

  ```tsx
  <RadioGroup defaultValue="pro">
    <Radio value="hobby" description="For personal projects and experiments.">
      Hobby
    </Radio>
    <Radio value="pro" description="For growing teams that need more control.">
      Pro
    </Radio>
    <Radio
      value="enterprise"
      description="Advanced security, compliance, and support."
    >
      Enterprise
    </Radio>
  </RadioGroup>
  ```

  Additive and backward-compatible: a label-only `<Radio>` renders exactly as before.

- eb5e368: Add RadioGroup, a single-select group for Radio options, and make radios interactive out of the box. A radio (unlike a checkbox) can't be the source of its own on/off state, so a bare `<Radio checked>` in the docs never moved the dot on press. RadioGroup owns the selection (controlled via `value`, uncontrolled via `defaultValue`, `onChange` fires the chosen value) and shares it with child `<Radio value="…">` controls through context, so exactly one is chosen and pressing another moves the selection. Radio gains an optional `value` prop and reads its checked state and disabled state from the enclosing group; used standalone it keeps its existing controlled `checked`/`selected` behavior. Layout is a column by default, `row` for a wrapping inline row.
- 5da5880: Chart docs now showcase realistic, dense data (intraday-scale price series,
  multi-series analytics dashboards, ~30-candle sessions with volume and a
  moving-average overlay, denser scatter clouds, a full order book, and a
  contribution-style heatmap) so the gallery reads like real product charts.
  Two kit changes support dense data cleanly: line-chart `dots` auto-suppress
  when the plot is too tight for them to separate (the line carries the shape),
  and cartesian/candlestick charts past 24 points summarize their accessible
  name by endpoints and range (e.g. "Price: 39 points from 186 to 192, low 184,
  high 193") instead of folding every value into one screen-reader label -
  scrubbing still announces the focused point. The prior "too many datapoints"
  dev warning is removed, since dense data is now first-class.
- 2c8067c: Add `Row` and `Column` layout primitives. They own arrangement through semantic
  boolean axes so call sites never hand-roll `flexDirection`, `gap`, or
  `alignItems`: a gap scale (`flush`/`tight`/`snug`/`cozy`/`relaxed`/`loose`),
  main-axis distribution (`start`/`center`/`end`/`between`/`around`/`evenly`),
  cross-axis alignment (`alignStart`/`alignCenter`/`alignEnd`/`baseline`/`stretch`),
  `wrap`/`fill`/`grow`, and a padding scale (`padTight`/`pad`/`padLoose`). Layout is
  a Shared platform treatment (flexbox is identical on iOS, Android, and the web).
- dc26af5: RTL support: the kit now uses logical `start`/`end` style properties instead of
  physical `left`/`right` (margins, padding, positioning offsets, and border
  radii) across every component, so right-to-left locales get a correctly mirrored
  UI on web and on native. `GlassSurface` reads both physical and logical corner
  radii so its specular rim hugs the surface either way.
- 4c1c465: New `ScatterPlot` component: numeric x/y point clouds on the shared cartesian
  frame with nice ticks and gridlines on both axes, multi-series
  `chart-1`..`chart-8` colors (tones for a single series), a card-surface ring
  keeping overlapping points separable, the shared series legend, `compact`
  density, and per-point optional labels carried into the plot's accessible
  name.
- 4dc3357: Sidebar is now responsive. Add `responsive` (opt-in, off by default) and the sidebar renders as its
  usual accordion rail on desktop, but at and below the `lg` breakpoint (1024px) it becomes a
  start-edge (left, RTL-aware) **navigation drawer** that drills through the same `sections` one level
  at a time, with the `header`/`footer` slots pinned above and below. Drive the drawer's open state
  with `open` / `defaultOpen` / `onOpenChange` from your own hamburger; tune it with `drawerBreakpoint`,
  `drawerWidth`, and `drawerContentInsetBottom` (clearance for chrome that paints over the drawer, e.g.
  a native tab bar). A bare `<Sidebar>` is unchanged at every width.

  The `Drawer`'s `left` / `right` panels now **slide in** on the start/end edge (React Native's Modal
  can only slide vertically, so side edges previously faded); the slide mirrors under RTL and is gated
  by Reduce Motion. `bottom` sheets are unchanged.

- efa4f59: Sidebar gains an app-navigation shell: a collapsible mini icon-rail
  (`collapsed`/`defaultCollapsed`/`collapsible`/`onToggleCollapse`), collapsible accordion sections
  (`collapsible`/`defaultOpen` per section, one-open-at-a-time with the section owning the active
  row auto-opening, controllable via `openSections`/`independentSections`), pinned `header`/`footer`
  slots with an internal scroll region, id-based `active` matching, and an inert `href` passthrough
  on items. Fully backward-compatible: existing `sections`/`items`, active-by-label/index, and the
  density/frame axes are unchanged (a slot-less Sidebar renders exactly as before). Per-OS skins
  extended (web accent, iOS capsule, Android M3 rail).
- aebd554: Trading charts, part 4. `Sparkline` gains a `line` boolean: a continuous 2px
  trend polyline (the watchlist-row idiom) normalized to the series' own range
  instead of the zero-based bar strip. All existing tones and sizes apply; the
  accessible-label contract is unchanged.
- 38a4104: Accessibility improvements to `Sparkline`, `Popover`, and `Button`.

  - `Sparkline` now always carries an accessible name: when `accessibilityLabel` is
    omitted it derives a summary of the data (point count, range, latest value), so it
    never ships as an unnamed `role="img"` (WCAG 1.1.1).
  - `Popover` moves focus into its panel when the floating card opens and restores
    focus to the trigger on close (non-modal, so no focus trap), and its trigger now
    announces the popup relationship.
  - `Button` gains a `haspopup` prop (aria-haspopup) for menu / dialog / listbox
    triggers, pairing with the existing `expanded` (aria-expanded).

- 24fbbf6: Add a `Sparkline` atom: a compact trend strip (a row of thin bars whose heights
  track a series of `values`), so no call site hand-composes a row of `flexGrow` +
  `height` + `backgroundColor` Views to draw an inline trend on a stat card or
  dashboard. Boolean tone (`primary`/`success`/`destructive`/`muted`) and size
  (`compact`/`tall`) axes.
- 7ee0ce2: Stats items can carry a per-metric trend: pass `spark` (a `number[]`) on a
  `StatItem` and the metric renders a Sparkline strip below its value, so the
  "with sparkline" variant advertised in the docs is now a real capability rather
  than a plain grouped stat.
- dc26af5: Add `success` / `success-foreground` / `warning` / `warning-foreground` semantic
  color tokens (scheme-correct in light and dark), and route the components that
  were hand-picking light-only palette greens/ambers through them (`IconTile`
  success tone, `EmptyState` positive, `Typography` positive/warning tones) so they
  render correctly in dark mode. Also fix monospace text on iOS: a new
  platform-aware `MONO_FONT` replaces `fontFamily: "monospace"` (which silently
  fell back to San Francisco on iOS) with Menlo on iOS.
- 0a2ee16: Add a `flush` prop to `Textarea` that drops the field's own border and radius so
  it sits flush inside a framed container (e.g. a Card with a formatting toolbar
  above it), instead of hand-zeroing `borderWidth`/`borderRadius` via `style`.
- 516ec9b: Extend `Typography` with orthogonal tone and weight axes plus a `lead` role, so
  styled text no longer needs a raw `<Text style={{ fontSize, fontWeight, color }}>`
  shim. The 13 existing roles are unchanged; two new axes layer on top: a tone
  (`subtle`/`primary`/`destructive`/`positive`/`warning`) sets the color and a
  weight (`regular`/`medium`/`semibold`/`bold`) sets the fontWeight, each null by
  default so a role's own color and weight stand when untouched. The new `lead`
  role is a 16px body/identity size (e.g. `<Typography lead semibold>` for a name).
  Fully backward-compatible.
- af27139: API completeness sweep.

  **testID everywhere.** Every component now accepts a `testID` forwarded to its
  root element, so Detox/Maestro/Playwright suites can target Canvas components.

  **Controlled + uncontrolled everywhere.** Form controls adopt the
  `useControllableState` contract: `Checkbox` (`defaultChecked`), `Tabs`
  (`defaultActive`), `TabBar` (`defaultIndex`), `Select` (`defaultValue` +
  `defaultOpen`), `Slider` (`defaultValue`), `NumberInput` (`defaultValue`).
  A bare `<Checkbox />`, `<Tabs />`, `<Select options />`, or `<Slider />` is now
  interactive out of the box; controlled usage is unchanged.

  **Combobox is typeable.** The trigger is now a real text input: type to filter
  options, with `query` controllable (`defaultQuery`) and an `onQueryChange`
  callback. Previously the field was a Pressable and users could not type at all.

- 1ba52b2: Accessibility, keyboard, and theming improvements.

  - **Escape dismisses anchored overlays.** New `useEscapeKey` hook wires
    Escape-to-close on the web for `Dropdown`, `Popover`, `Select`, `Combobox`,
    and `RowMenu` (no-op natively).
  - **Toast announcements are reliable.** `ToastProvider` now hosts a single,
    persistently-mounted polite live region and swaps capsules inside it, so
    screen readers announce toasts (previously each capsule's region mounted with
    its content and was routinely missed).
  - **Charts expose their data to assistive tech.** `StackedBar` and `Heatmap`
    gain a `label` prop and build an accessible name from the data itself
    (e.g. "Traffic sources: Direct 42%, Search 28%, …"); the `img` role no longer
    suppresses the visible legend.
  - **The kit is rebrandable.** `ThemeProvider` accepts a `tokens` prop
    (`Partial<ColorTokens>` for both schemes, or `{ light, dark }` per scheme)
    merged over the base tokens, so consumers can change `primary` (and any token)
    without forking. Glass overrides still compose on top.

### Patch Changes

- 1e350ed: Accordion fills its parent's width by default.

  The Accordion root had no width, so React Native sized the group to its widest
  row's content and it only spanned the full width when the parent happened to
  default to `alignItems: "stretch"`. In a centered or row parent it shrank to
  content and left gutters on each side. The root now defaults to `width: "100%"`,
  so the group spans the full width of its parent's content box (full width minus
  the parent's padding) on iOS, Android, and web, matching the other block/list
  components. The default sits behind the platform skin's container shape and the
  `style` layout prop, so a caller can still constrain the width via `style`.

- ce65618: Make the ActionPanel toggle flip on press. The `toggle` affordance forwarded a controlled `checked` to its Switch, so it never flipped. A new `defaultChecked` prop is forwarded to the Switch for uncontrolled use, so the toggle self-manages (the on/off state lives in the Switch atom) while `checked` still supports controlled use and `onToggle` still fires.
- 76d24d8: Fix invalid nested interactive elements in ActionSheet.

  The scrim was a button-roled `Pressable` that WRAPPED the whole sheet, so on the
  web (where react-native-web renders a button-roled `Pressable` as a real
  `<button>`) every action row and the Cancel row nested a `<button>` inside a
  `<button>`: invalid HTML and an ambiguous, doubly-focusable a11y target. The
  dismiss control is now an empty full-bleed `Pressable` rendered as a SIBLING
  behind the sheet (lifted under the content with `zIndex`), so it keeps the same
  button role + label a screen reader can reach while the action rows live in
  their own subtree. Tap-to-dismiss, action-select-then-close, Cancel, and
  hardware-back/escape behavior are unchanged.

- 9b6d0ba: Clear the Android dev-console errors and warnings:

  - Guard every `onLayout` handler that reads `e.nativeEvent.layout.width` against a null
    layout (dropdown, combobox, popover, select, button-group, row-menu, progress, slider,
    carousel). On the New Architecture the layout can arrive null and crashed with
    "Cannot read property 'layout' of null".
  - Drop React Native core's deprecated `SafeAreaView` in the drawer and action-sheet.
    They now source it from `react-native-safe-area-context` (added as an OPTIONAL peer,
    matching the expo-blur pattern) and fall back to a plain `View` when the peer is
    absent, which matches the old behavior off iOS.
  - Move the tab-bar active-indicator pill's `pointerEvents` from a prop to `style`
    (the prop form is deprecated on react-native-web).

- 6e8e9b3: Avatar and MediaObject now accept a bundled image for `src` (a `require(...)` /
  `import` module, i.e. a number), not only a remote URI string, so local images display
  on iOS and Android as well as the web. Avatar also falls back to its initials when the
  image fails to load, instead of showing a blank circle.
- b21aa99: On iOS 26 the Avatar's initials fallback now renders on Apple's real, interactive Liquid
  Glass: a glass account chip that refracts the content behind it (vivid in a topbar over
  the page) and responds to touch with the system press animation. It is wired only through
  the iOS skin, so web and Android keep the solid muted circle unchanged, and GlassSurface
  degrades to that solid fill when the app is in solid surface mode or Reduce Transparency
  is on. GlassSurface gained an `interactive` prop (default false, backward compatible) that
  turns on the native material's `isInteractive` behavior for glass that is itself a control.
- 9fe5d3b: Route the split ButtonGroup's dropdown menu through AnchoredOverlay so it portals over the page instead of rendering inline, fixing the menu being clipped inside a bounded stage.
- 7cbecb7: Make the segmented ButtonGroup interactive out of the box: `active` is now the controlled index, a new `defaultActive` seeds uncontrolled use, and selection routes through the shared controllable-state contract (matching Tabs/Switch). A bare or `defaultActive`-seeded segmented control now selects the pressed segment on press instead of sitting inert.
- 805fd17: Make Calendar day selection interactive out of the box: `selected` is now the controlled day, a new `defaultSelected` seeds uncontrolled use, and selection routes through the shared controllable-state contract. Pressing a day now highlights it (and still fires `onSelect`) instead of leaving the grid inert. Month prev/next still fire `onPrev`/`onNext`; self-traversal stays a caller concern since Calendar takes a month label plus day counts, not a date model.
- 7ee0ce2: Fix Carousel slides rendering off-screen in a shrink-to-content parent.

  The paged `FlatList` had no definite width, so it reported its intrinsic size
  (the sum of the slides, each sized to the measured viewport width) up to the
  viewport. In a parent with no definite width, that fed the viewport width back
  into the slide width and the layout diverged; the browser clamped the runaway at
  its ~2^24 layout cap, pushing every slide off-screen and leaving an empty box.
  The scroll container is now pinned to the measured width (`style={{ width }}`),
  capping its contribution so slide N sits at N \* width and slide 0 stays visible.

- d1b448a: Fix the Checkbox box collapsing to a thin vertical sliver on native Android
  (Fabric). A checked/indeterminate box rendered its check/dash as an in-flow
  `<Text>` child, and on the New Architecture an in-flow text node drives its
  parent View's main-axis size and overrode the box's explicit `width` — an 18dp
  square shrank to the glyph's ~5dp measured width while the cross-axis `height`
  was honored. (Radio never hit this: its checked child is a `<View>` dot, not
  text.) The glyph now sits on its own absolutely-positioned, flex-centered layer,
  so it is out of the box's content flow and `width` wins. The layer centers
  identically on iOS, react-native-web, and native Android, so the look is
  unchanged on every platform; only the collapsed Android box is fixed.
- 38a4104: Fix invalid button-in-button nesting in `Chip`. When a chip was both interactive
  (`onPress` / `selectable`) and removable (`onRemove`), the remove "×" button rendered
  inside the toggle button, which is invalid `role="button"` inside `role="button"` on
  the web and let a remove press bubble to the toggle. The interactive-and-removable
  chip now renders the toggle body and the remove control as two sibling buttons inside
  a plain pill shell, so pressing "×" removes without also toggling, and each control is
  its own accessible button. The visual pill is unchanged.
- 9fe5d3b: `Combobox` now portals its open option list through `AnchoredOverlay` (the same
  path `Dropdown` uses) instead of rendering an inline absolute panel. When an
  `OverlayProvider` is mounted it floats over the page, anchored below the field,
  so the list escapes overflow-clipping ancestors (e.g. a horizontal scroller like
  the docs preview stage, or any `overflow: hidden` container in an app); with no
  provider it falls back to the previous inline anchor below the field. The
  typeable field, query filtering, keyboard, dismiss/Escape, and selection
  behavior are unchanged.
- da3a2b6: Make Combobox selection interactive out of the box. The selected `value` was controlled-only, so picking a row fired `onSelect` but the field never showed the choice. `value` is now the controlled selection with a new `defaultValue` for uncontrolled use, routed through the shared controllable-state contract, and a new `defaultOpen` renders the list open initially while staying closeable (parity with Select). Selecting a row now fills the field and marks the option, and still fires `onSelect`.
- da3a2b6: Make the Command palette highlight interactive. The active row was controlled-only, so the highlight sat frozen on the initial row. `active` is now the controlled highlight with a new `defaultActive` for uncontrolled use, the highlight moves to a row on hover and press, and a new `defaultOpen` renders the palette open initially while staying closeable. Selecting a row still fires `onSelect` and closes the palette.
- f50a296: Add the `success` and `warning` semantic color tokens (and their foregrounds) to the
  shipped `styles/canvas.css`, so web consumers get `bg-success` / `text-warning` /
  etc. utilities that match the JS `success` / `warning` tokens. These existed in the
  JS token set but were missing from the CSS layer; a new parity check in
  `validate-tokens` now cross-references the CSS variables against
  `src/style/tokens.ts` so the two sources cannot silently drift again.
- 35273ca: `Combobox` and `Input` no longer nudge their value text up when the field becomes active (Combobox on open, Input on focus), on both Android and iOS. The Material active indicator's thickening is now absorbed by compensating padding so the field's content-box height stays fixed, matching the same fix already applied to `Select`.
- 466218c: Make FilterPanel options interactive out of the box. Each option's `checked` state was controlled-only, so pressing a row fired `onChange` but never checked the box or moved the active-filter count. The panel now holds internal checked state seeded from each option's `checked` flag, pressing a row toggles it (still firing `onChange`), the header badge derives its count live from the checked options (an explicit `activeCount` still overrides it), and Clear resets all filters (still firing `onClear`).
- ce65618: Make the checkbox groups in Form and Fieldset toggle on press. Both rendered each data-row `<Checkbox checked={...}>` in controlled mode with no state, so the boxes were inert. They now pass the row's checked flag as `defaultChecked`, so each Checkbox self-manages (the toggle state lives in the Checkbox atom) and a bare Form/Fieldset checkbox row ticks on press.
- 1612488: Two glass-mode fixes:

  - Listbox's `bordered` container now uses the solid `card` fill instead of
    `popover`. Listbox is an inline content-layer list, so it must stay opaque under
    glass (it was rendering a translucent fill with no material behind it). No change
    in solid mode, where `card` and `popover` are identical.
  - The Popover beak is now omitted under glass. A flat token-filled beak cannot match
    the Liquid Glass material, and a beak-less rounded card is how iOS 26 menus read.
    The beak was already clipped away under glass; this makes the intent explicit.
    Solid mode is unchanged and keeps the beak.

- 0f1c67d: Rename the `Icon` credential glyph prop from `key` to `keyRound` (lucide's own name
  for it). The old `key` boolean was unreachable: React reserves `key` as a special
  prop, so `<Icon key />` (or a dynamic `{...{ key: true }}` spread) never rendered the
  glyph and, when spread, logged a React "`key` is not a prop" warning. `keyRound` has
  no such collision. The docs Input OTP nav item, the only consumer, now uses it.
- ba559fe: Fix the oversized gap between an `Input` prefix/suffix affix and its value on the
  Android (Material 3) skin.

  The grouped (addon) layout gave the Android prefix/suffix box its own `16dp`
  horizontal padding plus a `1px` divider, on top of the inner field's own `16dp`
  inset, leaving a ~`33dp` void between the affix (e.g. `https://`) and the value.
  Because the addon box and the field share the same `muted` fill, that read as a
  large empty gap rather than a distinct segmented box.

  Material 3 renders prefix/suffix as inline affix text that shares the field
  surface (no separate fill, no divider) with the value following directly. The
  Android skin now matches that: the affix keeps the `16dp` container inset but
  drops the divider, and the field zeroes its padding on the affix side, leaving an
  `8dp` gap (the same tight inline affix iOS already used). The web skin's
  segmented input-group look is unchanged.

- 4d5d52d: `Input`'s bare and multiline fields no longer show the browser's default focus outline on the web: the shared `FOCUS_RESET` now covers the bare path too, matching the grouped path and the Combobox/Textarea/NumberInput shells. Each skin already paints its own focus affordance (web border turns to the ring color, iOS thickens the hairline, Android thickens the bottom indicator), so react-native-web's outline was redundant and, over the filled Android field, appeared as a stray blue rectangle on top of the indicator. No-op on native, which has no CSS outline.
- 8eebdc8: Fix invisible glass surfaces on iOS 26. The Liquid Glass (`GlassView`) material path
  now paints the translucent `popover` under-fill beneath the material, exactly as the
  frost path already does. A bare regular-glass panel composites nearly clear over a
  flat surface (and clear over the page in a portaled overlay), so a glass menu, select,
  or dialog whose fill and border are stripped under glass was rendering as an invisible
  hole with its contents floating on whatever sat behind it. The under-fill guarantees a
  legible material while the glass still refracts through the remaining translucency.
- 39d6423: iOS text fields render as SwiftUI's `.roundedBorder` instead of a Material-style underline.

  Input, Textarea, and Combobox on iOS were a transparent, boxless field carrying only a
  bottom active-indicator hairline that thickened and tinted to the brand indigo on
  focus/open. A brand-tinted bottom underline is the Material Design signature, so an iOS
  field read as an Android one. They now render as a subtly filled, rounded rectangle
  (continuous corners) with a full 1pt border that resolves error > focus(`ring`) >
  `input`, matching SwiftUI's `.roundedBorder`. The brand still survives in the caret,
  selection, and focus border tint. The Android (Material 3 filled + underline) and web
  skins are unchanged.

- a40c01c: Make Listbox selection interactive out of the box. Selection was expressed only through each item's `selected` flag with no internal state, so pressing a row fired `onSelect` but never changed what was selected. Selection now routes through the shared controllable-state contract: new top-level `selected` (controlled) and `defaultSelected` (uncontrolled) props accept a single index (single-select) or an index array (multi-select), a new `onChange` fires with the full selection, and the per-item `selected` flags still seed the uncontrolled default. Pressing a row now selects it (single) or toggles it (multi); existing examples become interactive with no code change.
- fbf39c2: Material 3 conformance corrections across the Android skins, from a full visual audit
  of every Android-skinned component against the m3.material.io spec (web preview plus a
  real-device pass on a Pixel emulator):

  - Switch: Android track is now the M3 52x32dp with a 16dp unselected and 24dp selected
    handle (was 48x28 with an ~11dp handle).
  - Chip: the Android chip is now the M3 8dp rounded rectangle, 32dp tall (was a full
    pill ~26dp). iOS and web keep the pill.
  - Toast: the Android snackbar now uses the M3 inverse surface (a dark capsule with
    light text in a light theme, light in dark) at the 4dp radius, instead of the normal
    theme surface.
  - Alert dialog: the Android destructive action is now an M3 text button in the error
    color, not a filled red button; both actions are right-aligned text buttons.
  - Row menu: a `separatorBefore` item now renders its divider on Android (a dead
    internal flag had suppressed it).
  - Tab bar: the Android navigation bar now shows the M3 active-indicator pill (56x32dp
    tonal, centered behind the active icon on native and web alike).
  - Navbars: the Android top app bar is now 64dp (M3 Small), up from the Material 2 56dp.
  - Empty state: the Android action button now renders the correct per-OS Button (the
    M3 filled pill) instead of the web button, by threading a per-OS Button like Form.
  - Accordion and Collapsible: the Android disclosure chevron now uses the Material
    convention (down at rest, rotating up when open); iOS and web keep the right chevron.
  - Carousel: the Android slide corner radius is now the M3 28dp (was 16dp).
  - Chip and IconTile are now registered in the docs platform preview so their real
    Android skins are shown.

  iOS and web appearances are unchanged. A known Android-only checkbox layout bug (the
  box collapses horizontally on native) is tracked separately for a dedicated fix.

- 55a5d68: Make Navbar links interactive out of the box: `active` is now the controlled link index, a new `defaultActive` seeds uncontrolled use, and the active link routes through the shared controllable-state contract. Links are now always pressable (previously they were inert unless `onSelect` was passed), so pressing a link moves the active highlight and still fires `onSelect`.
- f54476a: Fix the overlay outlet (and the toast stack and carousel arrow layer) swallowing every mouse click on the web.

  These full-bleed layers set `pointerEvents: "box-none"` through an inline `{ pointerEvents }` style object so the layer itself is transparent to pointers while its portaled children still capture. react-native-web only compiles its `box-none` polyfill (the box `pointer-events: none`, its direct children `auto`) for styles registered via `StyleSheet.create`; an inline literal is dropped, leaving the layer at `pointer-events: auto`. The `OverlayProvider` outlet is a `z-index: 1000` layer covering its whole host, so on web it blanketed every screen and no button, link, or trigger under it received a real mouse click (synthetic `.click()` bypassed the hit test, so tests did not catch it). Moving `box-none` into `StyleSheet.create` styles restores click-through on web; native already honored it either way.

- b87b88a: Make Pagination interactive out of the box. Both the current page and the rows-per-page selector were controlled-only, so Prev/Next, the page numbers, and the size selector fired their callbacks but never moved. `page`/`pageSize` are now the controlled values, new `defaultPage`/`defaultPageSize` seed uncontrolled use, and both route through the shared controllable-state contract. A bare pagination now navigates and cycles page size on press (still firing `onChange`/`onPageSizeChange`).
- 9fe5d3b: Route the open Popover's floating card through AnchoredOverlay so it portals over the page anchored below the trigger instead of rendering as an inline absolute panel, fixing the card being clipped and not painting inside a bounded stage.
- ffe9f1d: Point the package metadata at the current repository. `homepage`, `repository`, and
  `bugs` now reference `bnannier/canvas` and `bnannier.github.io/canvas` (the repo was
  transferred from the `OlympusOSS` org, and GitHub Pages URLs do not redirect).
  Internal: the duplicated `clamp` helper is now shared from `src/style/math.ts`.
- 9fe5d3b: Fix RowMenu clipping its open menu inside scroll/stage containers by routing the panel through AnchoredOverlay so it portals over the page instead of rendering as an inline absolute card.
- 3dd3cb1: `Select`'s open option list now renders through `AnchoredOverlay`, so it portals above the page and is no longer clipped by an overflow-hidden ancestor (or the docs preview scroller), while selection, controlled and uncontrolled open state, Escape dismissal, and the listbox/option roles stay unchanged.
- e87b038: `Select`'s Android trigger no longer nudges its value text up when the option list opens: the Material active indicator's 1dp to 2dp thickening is now absorbed by compensating padding, so the content-box height stays fixed and the centered value text does not move.
- 8638e4c: Sidebar's `footer` slot now also accepts a `(collapsed: boolean) => ReactNode` render function,
  matching `header`, so a footer can show a compact icon-only form in the collapsed mini-rail
  instead of wrapping its label. A plain `ReactNode` footer still works unchanged.
- cc3fba8: Make Sidebar navigation interactive out of the box: `active` is now the controlled row, a new `defaultActive` seeds uncontrolled use, and the active row routes through the shared controllable-state contract. Pressing a nav row now moves the highlight (still firing `onSelect`) instead of leaving it stuck on the initial row.
- bd5a2d0: `Slider` is now right-to-left aware. In an RTL locale (`I18nManager.isRTL`) the fill
  and thumb mirror so the minimum sits on the right, a physical tap maps to the
  mirrored value, and the horizontal arrow keys reverse (ArrowRight always moves the
  thumb visually rightward, per APG) while Home/End and the vertical arrows keep their
  logical meaning. LTR rendering is unchanged.
- 7ee0ce2: Sparkline now has an intrinsic default width, so its `flexGrow` bars no longer collapse to 0 and render blank when the caller sizes no width; an explicit `width` or `flex` still overrides it.
- 7ee0ce2: Fix the iOS and Android Spinner skins leaking a `collapsable={false}` prop onto the `<svg>` DOM node on web (React logged "Received `false` for a non-boolean attribute `collapsable`" on every render): the skins now wrap a plain `Svg` in an `Animated.View` that carries the rotation, instead of animating the `Svg` itself with `Animated.createAnimatedComponent`, which forced the native-only `collapsable` prop through react-native-svg to the DOM. The spinner still rotates identically.
- ce65618: Make the Steps component's active step interactive. `current` was a required, controlled-only prop, so pressing a step (with `onStepPress`) never moved the highlight. `current` is now optional and controlled, a new `defaultCurrent` seeds uncontrolled use via the shared controllable-state contract, and pressing a step moves the active step and still fires `onStepPress`.
- 76d24d8: Documentation: reword every component's `style` prop away from the misleading
  "escape hatch for layout/positioning composition" (which reads as an invitation to
  restyle, contradicting the kit's no-styling-escape-hatches rule) to "outer layout
  composition only (width/flex within a parent), never a restyle hook." JSDoc only, so
  it ships in the published type declarations; no API or behavior change.
- 7ee0ce2: Fix TabBar shrink-wrapping to its icon column (which ran the labels together into an illegible "HomeSearchProfile"): the bar now fills its container width via `alignSelf: "stretch"` + `width: "100%"`, so each equal-width destination is wide enough for its label, and labels stay on a single line.
- 624f9d3: Fix the default underline Tabs not switching on press. The underline variant called `onChange` directly instead of the controllable-state setter, so an uncontrolled (or `defaultActive`-seeded) underline Tabs never updated its own active tab. It now uses the same `setActive` path as the pills and vertical variants, so pressing a tab moves the underline and still fires `onChange`.
- bef6479: Guard the theme/surface/density helpers against a missing `document`. `getTheme`,
  `setTheme`, `toggleTheme`, `getSurface`, `setSurface`, `getDensity`, and `setDensity`
  read and write `document.documentElement`, but they are exported to every platform,
  so calling one on native or during web SSR threw. They now check for a document
  first: off the web the getters return the default (`"light"` / `"solid"` /
  `"regular"`) and the setters no-op, matching the existing guard on `token()`.
- 10c8d8b: Clear the react-native-web console deprecation warnings (so the web, iOS, and Android
  dev consoles are all clean):

  - `shadow*` style props: the `shadow()` helper (and a new `customShadow()` for one-off
    shades) are now platform-aware. They return the iOS `shadow*` props plus Android
    `elevation` on native, unchanged, and the equivalent cross-platform `boxShadow` string
    on web, where react-native-web deprecated `shadow*`. The four components that inlined
    their own iOS shadow (switch, slider, button-group, tabs) now route through
    `customShadow`, and the input-otp active ring uses a `boxShadow` spread on every
    platform. Shadows render identically as before on all three platforms.
  - `pointerEvents`: moved from the deprecated prop form to `style.pointerEvents`
    throughout (the GlassSurface plumbing, inputs, slider, number-input, listbox, toast,
    carousel, filter-panel, and the portal outlet).

## 6.23.2

### Patch Changes

- 460ff9a: Android: clip the Material ripple to each control's rounded outline. The native `android_ripple` paints a RippleDrawable bounded to the view's RECTANGLE, so on rounded controls the ripple bled past the corners and read as a square overlay. Every rounded node that carries a bounded ripple now sets `overflow: "hidden"` (clipToOutline) so the ripple is masked to the shape: Button, ButtonGroup segments, Pagination, Calendar day cells, Stepper circles, Tabs, Select/Combobox triggers, the stacked-list menu button, Toast action/dismiss chips, Dialog, RowMenu, Sidebar, Navbars, Stats cards, and Listbox rows. Nodes that also carry an elevation/shadow (tappable Card, the code-block copy chip) are clipped Android-only via a new `rippleClip()` style helper, so the native Android elevation shadow (drawn around the outline) survives while the iOS `shadow*` is left unclipped.

## 6.23.1

### Patch Changes

- 11da072: Command: revert the experimental search mode and the reveal-on-open entrance animation. The component returns to its display-only command palette (no editable field, result descriptions, empty state, self-presenting overlay, or expand-from-icon reveal). In the docs, search returns to the native iOS/Android search bar and the web search modal.

## 6.23.0

### Minor Changes

- ed2e138: Command: add `revealOnOpen` (search mode). When the palette opens, the search field expands out of its magnifier icon into the full-width bar (a right-anchored width animation, so it grows leftward), then the input and results fade in. Honors Reduce Motion (snaps). Opt in; display-mode usage is unaffected.

## 6.22.0

### Minor Changes

- 7873207: Command: add a search mode. Supplying `value` + `onValueChange` turns the search row into an editable field; results can carry a per-item `description` (a muted second line); `emptyLabel` shows a no-results state; the result list scrolls; and web gets arrow/enter/esc keyboard navigation over the flat list. Pass `overlay` to self-present as a responsive Modal (a centered palette on desktop, a bottom sheet on mobile, with a scrim, escape, and Android hardware-back). All additive: existing display-only usage (`groups` + `active`, with or without `trigger`/`footer`) is unchanged.

## 6.21.1

### Patch Changes

- 4fe81cf: Accordion and Collapsible no longer log "setLayoutAnimationEnabledExperimental is a no-op in the New Architecture". The Android LayoutAnimation flag is now flipped only on the old (Paper) architecture, where it is actually needed; on Fabric / Bridgeless it is on by default, so the call (and its warning) is skipped. New shared helper `enableAndroidLayoutAnimations()` centralizes the guard.

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
  - import { Box } from "@nannier/canvas";
  - <Box className="...">...</Box>
  + import { View } from "@nannier/canvas";
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
  `## Do & Don't` examples, every code block a real `@nannier/canvas` component.
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
  `@nannier/canvas/styles/components/button.css` becomes
  `@nannier/canvas/styles/atoms/button.css` (button is an Atom; card is a
  Molecule; data-table is an Organism). The all-in-one
  `@nannier/canvas/styles/canvas.css` entry is unchanged, so consumers using it
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
  no build step. Import the whole layer via `@nannier/canvas/styles/canvas.css`
  or a single concern via `@nannier/canvas/styles/utilities/flexbox.css`.

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
