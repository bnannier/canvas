# @olympusoss/canvas

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
