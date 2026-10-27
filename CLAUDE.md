# Canvas

Canvas is a React Native UI kit, published as `@nannier/canvas`. It runs
universally: native on iOS and Android, and on the web through React Native Web.

## Design language: Canvas v4, "Light as material"

On 2026-10-27 the owner decided that Canvas takes the Canvas v4 design hand-off ("Light as
material", the prototype vendored at `tools/v4/handoff`, its reference images captured by
`tools/v4/capture-references.ts` into `.v4-reference/`) and ships it as 4.0.0. It
replaces the Dark Factory (DF) language of 2026-09-23. The migration lands in ordered
phases on main (`audit/v4-redesign/PLAN.md`, decisions D1 to D12); until a phase lands,
the code it covers still shows the DF look it replaces, and the sections below describe
that code until the phase that changes it rewrites them. These decisions bind all new
work now:

1. **Tokens.** The hand-off's tokens on web, iOS and Android (`src/style/tokens.ts`,
   `colorsFor(palette, scheme)`): its neutrals, status colours, glass and shades as
   literal values, its accent and chart series as `oklch(L C hue)` formulas converted
   to sRGB by `oklchHex` (within one channel unit of what Chrome paints;
   `test/v4-accent.test.ts`). `primary` and `action` are the accent ("ion"); roles keep
   their function, so `input`, the non-field control boundary, is solved to the WCAG
   1.4.11 3:1 floor where the hand-off's hairline is about 1.5:1. The same holds for
   text: an ink the hand-off picks below 4.5:1 on a bed it is drawn on (`primary-text`
   and `info` per palette, `inverse-primary`, and the `destructive-text`,
   `success-text` and `warning-text` inks) is walked in oklch lightness at its own hue
   until every bed clears (`tools/v4/derive-inks.ts`, written into `src/style/solved-inks.ts`), and a passing hand-off value is
   never moved; fills and washes keep the hand-off's values. The focus ring keeps the
   hand-off's geometry (a 2 px gap, then a 2 px band) with `ring` the solid accent, so
   the band clears 3:1. The CSS hand-off (`styles/tokens/colors.css`) is GENERATED from
   the table by `bun run tokens:css` (`tools/v4/derive-css.ts`) and keeps the literal
   `oklch(... var(--hue))` forms, with the solved inks as literals.
2. **Palettes.** Five accent hues, each a ThemeProvider boolean and a `data-palette`
   value: violet 285 (the default), cyan 205, mint 165, rose 20, amber 75. A palette
   applies in BOTH schemes (`<ThemeProvider dark rose>` is the rose accent on the dark
   page). Blush, DF's light default, is gone (the 4.0.0 break).
3. **Web.** Every component takes the hand-off's full look on the web; its renderers
   (`tools/v4/handoff/cv-kit*.js`, the `K.PF` platform rows) are the measurement source
   over its prose where they disagree.
4. **iOS and Android.** A component keeps its iOS 27 or Material 3 shape only on a
   platform that ships a real control for its job (the rows of
   `PLATFORM-REFERENCES.md`), in the hand-off's colors and the platform's own face (SF
   Pro, Roboto), as its `K.PF` rows draw them; everywhere else its native skin is the
   web look. Every Canvas native skin is hand-drawn, so a look-alike of a control the
   platform lacks has no claim to a native shape.
5. **Type.** Instrument Sans for the interface, Bricolage Grotesque for display
   (headings and big numbers, the ThemeFonts `display` role, the web skins only), JetBrains
   Mono for code and meta. The scale is the hand-off's (`src/style/type-scale.ts`
   `typeRoles`, held to its Typography renderer by `test/v4-type-scale.test.ts`): display
   56, h1 44, h2 34, h3 26, h4 21, h5 17, lead 19, body 15, small 13, caption 12, tiny 11,
   the 11 px mono eyebrow. The 10 px source floor stays.
6. **One job, different control.** Where the idiomatic control for a job differs by
   platform or form factor, the component renders that control: a standalone Checkbox
   renders the platform switch on iOS and Android, option lists use trailing
   checkmarks on iOS and Material 3 checkboxes on Android, Radio is a checkmark list
   on iOS, overlays become sheets on phones. Substitution lives in the platform entry
   files (`createX(skin, parts)` parts injection), never in a `Platform.OS` branch in
   a shared shell, so the docs' three-up shows each platform truthfully.
   `test/design-rules-shells.test.ts` holds the seams (no platform import in a shell,
   a component that looks different per platform taken only as a part, a platform
   check only for a listed mechanism, the window read only by the listed chrome), and
   `check:skins` holds the docs registry to the same definition of "looks different"
   (`tools/skins/divergence.ts`).
7. **Glass.** The web's glass is the hand-off's material: the layer's tint over a
   `blur(20px) saturate(1.6)` backdrop with a 1 px hairline rim
   (`glass-surface/web-frost.ts`). iOS Liquid Glass and the Android blur keep their own
   material, with the hand-off's tints. Solid keeps each skin's complete opaque look.
8. **Docs.** The docs take the hand-off's information architecture and chrome (the
   floating pill navbar with hue swatches and the scheme and glass switches, the grain,
   one page per section with its rail, a detail page per component, the Skins and
   Templates pages). Component routes stay `components/<slug>`. The page is the
   hand-off's flat page, the scheme's `background` in every palette
   (`docs/src/shell/page-look.ts`, since 2026-10-27); Dark Factory's gradient, orbs,
   frosted shell and wedges are retired.
9. **Examples.** A docs example is shown only when an existing kit component fits it;
   never create a kit component to satisfy an example (see "Dogfood the kit").
10. **Version.** The owner authorized the 4.0.0 major for this redesign ("bump to
    4.0.0", 2026-10-27). A push never bumps a major: the release is the Deploy workflow
    dispatched with `major=true` and `major_version=4.0.0` once the last phase lands.

The reference cards for everything judged by eye are in `tools/native/liquid-motion.md`
under `## References` (`v4-glass` and the cards each phase adds; the `df-*` cards stay as
the record of the DF work), their strips under `tools/native/reference/`. On 2026-10-23
the owner removed every deprecated JS export and every helper published by accident,
since nothing consumed them (a minor, by that decision); the deprecated `styles/*`
custom properties keep working as aliases until a major says otherwise. Why: the owner
chose the v4 hand-off as Canvas's own look, and a native shape is only worth keeping
where the platform itself defines one.

## React-Native-everywhere principle

Everything here is built in React Native, so one codebase renders on iOS, Android,
and the web (through React Native Web). This holds for the kit AND its docs app:
write components from React Native primitives (`react-native`, `react-native-svg`,
and the kit's own primitives), never from web-only building blocks.

No web-only escape hatches. Do not reach into the DOM, set raw CSS on a node, branch
on `Platform.OS === "web"` to render different markup, or use a `.web.tsx` fork to get
an effect working on web alone. When React Native lacks a primitive the design needs
(for example a conic gradient, a blur, or a shadow with spread), implement it
cross-platform: build it from `react-native-svg` (sectors, masks, `FeGaussianBlur`,
`FeColorMatrix`), the `boxShadow`/`filter` style props, or math, so the same code
produces the same result natively and on the web. A web-only DOM/CSS trick is a
shortcut (see the global no-shortcuts directive): get explicit authorization first.

## Native approach on iOS and Android

On iOS and Android, Canvas renders through the platform's own native machinery, never
through a web emulation of it. The per-OS skin files (`<name>.ios.tsx`,
`<name>.android.tsx`) and the native modules they route through are the real
implementation: Apple's Liquid Glass via `expo-glass-effect` on iOS 26+, a real
frosted blur via `expo-blur`, native `BackHandler` / hardware-back behavior, native
scroll and press feedback, real HIG and Material 3 metrics from the skins.

The CSS layer in `styles/` is the WEB hand-off only. Its custom properties, including
the `--p-*` platform-skin tokens switched by `data-platform`, exist so a web surface
(and the design-system mirror) can render the three looks in a browser. A native build
must never take its look from that CSS, and an iOS or Android behavior must never be
approximated in CSS when the platform exposes the real thing.

So when a design calls for a platform behavior, reach for the native API first and let
the web fall back, rather than implementing the web trick everywhere and calling it
cross-platform. This sharpens, and does not contradict, the React-Native-everywhere
principle above: one component API and one codebase, with each platform's own material
underneath. Why: an emulated iOS or Android surface is a look-alike, and the kit's
whole claim is that it is the real thing on each OS.

Which components keep an iOS or Material 3 shape follows the design language above:
the HIG and Material 3 metrics apply on a platform that ships the real control for the
job, and the native skin is the DF look everywhere else. The native machinery (Liquid
Glass, the frosted blur, hardware back, scroll physics, the ripple) stays on every
component, whichever look its skin draws.

## One package

Canvas ships as exactly one npm package, `@nannier/canvas`, built from this repository's
root. Everything the kit renders or runs lives in it, its own native code included: the
Android capture module is `android/` plus the root `expo-module.config.json`, which Expo
autolinks from the installed package, and its JavaScript binding sits in `src/` beside
the components that use it. Never split a component, renderer, native module, platform
integration or helper into a separate npm package, a `packages/*` workspace, or a sibling
repository published on its own. When the kit needs new native capability, add it to
Canvas's own `android/` (or an `ios/` beside it, with that platform in
`expo-module.config.json`), load it through a guarded require so an app without it keeps
the complete solid skin, and ship it in the same release. Third-party native libraries
(`expo-blur`, `expo-glass-effect`, `expo-video` and the rest) stay optional peers; this
rule is about code we write. The release tooling enforces it: `scripts/release.mjs`
registers only `@nannier/canvas`, and a changeset for any other package fails release
preparation before a version is consumed.

Why: `@nannier/canvas-blur` was split out on 2026-09-17 as an optional Android package
and never reached npm. A second package needed npm publishing setup of its own, a failed
publish consumed its 0.2.0 in git, and the two-package release transaction, smoke app and
docs wiring added complexity while no app could install the Android blur. The owner
folded it back into Canvas on 2026-10-22: Canvas is a component library, and its native
pieces are part of it.

## Dogfood the kit: every UI element is a Canvas component

A claude prime global directive. Every UI element used anywhere in this repo, the
docs app included, must be a Canvas component (or one of the kit's primitives:
`View`, `Text`, `Pressable`, `TextInput`, `ScrollView`), never a hand-rolled
look-alike. (`Image` graduated from a primitive to a Canvas atom that wraps RN's
Image with boolean fit props, so it now counts as a Canvas component.) The rule,
in order:

- Need a control the kit already exports? Import and use it.
- The kit has no such component? CREATE IT IN THE KIT (`src/atoms` | `molecules` |
  `organisms`, with its skins/styles), export it, then use it. Add a changeset, since
  it ships in `@nannier/canvas`.
- A Canvas component almost fits but lacks a capability (an icon slot, a `ReactNode`
  cell, a prop, a variant)? EXTEND that kit component (backward-compatibly) rather
  than re-implementing it in the docs. (This is how `Button` got `iconLeft`/`iconRight`
  and `DataTable` got `ReactNode` cells.)

A hand-rolled button / badge / card / table / toggle / keycap / input in the docs is a
bug: replace it with the real component, or add/extend the kit component first. The
only bespoke UI allowed is genuinely docs-only infrastructure with no kit equivalent
(the playground/compare harness, the live-example frame, brand illustrations) plus the
authorized platform escape hatches. Why: the docs are the kit's own showcase and proof
of the API; a duplicated control both misrepresents how to build with Canvas and hides
a missing kit feature.

Examples are the one narrowing (the owner's 2026-09-23 decision): a docs example, a
pattern section or a catalog tile is shown only when an existing kit component fits
it. Never create a kit component just to satisfy an example; when nothing fits, the
example is not shown. The docs' page frame (the flat page backdrop and the frame
around the examples) is docs-only scaffolding under the same rule:
use a kit component wherever one fits, and never add one to the kit for the frame.
A real functional gap (a date field, a selection mode) is still built in the kit.

## Highly responsive

Canvas is highly responsive by default. Every component must adapt cleanly across
the full range of viewport sizes, from large desktop down to phone.
Responsiveness is a core requirement of every component, not an optional add-on.

Author desktop-first: lay out and size each component for the desktop case first,
then add the responsive variants that scale it down to tablet and phone. This is
the inverse of mobile-first.

### Sizing: the parent provides the bounds

A component never dictates its own width. Every component root declares a sizing
nature from `src/style/sizing.ts`, and the nearest layout container provides the
bounds, which is Bootstrap's contract (`.container` > `.row` > `.col-*` size the
box, `.form-control` is `width: 100%`):

- **FILL** (`useFillStyle` / `FILL`: `width:"100%"`, `flexShrink:1`, `minWidth:0`):
  fills a Column, shares a Row with hugging siblings (a field beside a button takes
  the remainder), splits a Row equally with other fill siblings, takes its own line
  in a wrap Row. Fields, cards, alerts, lists, tables, charts, feeds, forms, the
  calendar.
- **HUG** (`useHugStyle` / `useSizing({ block })`): the content's own width. Button,
  Badge, Chip, Kbd, ButtonGroup, Dropdown, Tooltip, QRCode, Stepper, InputOTP, the
  Typography code role; `block` turns the hug components that offer it into FILL.
  HUG resolves against the layout-axis context the kit containers publish:
  `alignSelf:"flex-start"` inside a stretching Column and nothing anywhere else,
  because Yoga ignores `width:"fit-content"` against a stretching parent and a bare
  `alignSelf` pins a Row child to the top of a centered Row (both verified on iOS).
  Never write a static `alignSelf:"flex-start"` on a component root.

Only the **layout containers** carry widths, from the one width scale (`widths` in
`src/style/tokens.ts`: Tailwind's `max-w` values copied by hand, `xxxs` 192 through
`page` 1280): `Container` (full width by default; a step caps and centers it, `start`
pins it), Row
children's `span={1..12}` (container-measured px cells with the gaps in the math,
`stacks` ignores spans once stacked), `Grid` tiles, and the shells and floating
overlays (Sidebar, FilterPanel, Dialog, AlertDialog, Popover, Command) that are
bounds providers for their own content. Non-layout components take `LayoutStyle`
for `style` (ViewStyle without width, min/max width, flex, and alignSelf), so a
width shim at a call site is a type error; the docs generator rejects the same keys
in a fence on any non-layout tag; and `test/design-rules-source.test.ts` keeps the
render-at-a-width pair (`{ width: N, maxWidth: "100%" }`) and off-scale caps out of
the kit. The one parent that still collapses `width:"100%"` is a content-sized cell
(a bare Column or Row inside a Row); `useFillStyle` warns there in development, and
a Select opts out because hugging its value is the toolbar cell (`.col-auto`).

The **measure axis** (`MeasureProps` in `src/style/sizing.ts`) is the one way a
component names a width of its own, and it is Container's cap moved onto the
component, not a width: the same step booleans (`xxxs` .. `page`) and `start`, on
Input, Textarea, Select, Autocomplete, Listbox, Slider, Progress, Field, Form,
Button, and ButtonGroup. `<Input sm start>` is FILL capped at 384 (`maxWidth`),
fluid below it, exactly what `<Container sm start>` around it gives; without a step
nothing changes. The precedence is Container's (narrowest wins, `stepOf` reads the
scale's own order), a step centers and `start` pins, and two rules follow from the
component not being a layout container: inside a Row only the cap applies
(`alignSelf` is the cross axis there), and on the hug components a step wins over
`block`. A new adopter extends `MeasureProps` and passes its props to
`useFillStyle` / `useSizing`; do not add a second width vocabulary (`narrow`,
`wide` as a field width, a pixel prop) beside it.

### The responsiveness system (three mechanisms, in order of preference)

1. **Intrinsic sizing** (default, zero JS): FILL or HUG on the component, bounds
   from the parent (a Container step, a Row span, a Grid cell), `minWidth` floors
   plus `flexWrap` (Stats). Zero re-renders, correct in any DEFINITE container,
   correct on frame one and on the server. Never give a component root a fixed
   width, and never make a parent content-sized where a fill child must resolve
   (the old `field-width.ts` post-mortem: a text field in such a parent re-sized on
   every keystroke; the docs stage is definite for exactly that reason).
2. **Container measurement** (components that switch layout): measure the
   component's OWN width via `useContainerBreakpoint` / `useMeasuredWidth` /
   `useContainerWidth` (`src/style/container.ts`), never the window; a component
   cannot know whether it is on a phone or in a 320px desktop panel. Render the
   `base` (desktop) variant on the unmeasured frame, unless the component seeds
   that frame from the viewport bucket (`seedViewport`, or `useContainerWidth`'s
   px fallback): the seed is withheld until hydration and follows a
   `BreakpointOverride`, and the measured width wins once it lands. Gate on
   `measured` only where the base variant is unrenderable (chart geometry).
3. **Viewport breakpoints** (window-level chrome only): `useBreakpoint`,
   `useFormFactor` (phone <= sm 640 / tablet <= lg 1024 / desktop above; the
   tier is the window width on every platform, so a narrow desktop window is the
   phone tier and a landscape phone usually the tablet tier (a 568 pt landscape
   iPhone SE stays phone), with no separate desktop-OS tier), `useResponsive`
   (`src/style/responsive.tsx`, one shared subscription, bucket-granular
   re-renders; width <= 0 resolves to `base`; SSR apps pass ThemeProvider's
   `ssrBreakpoint`). Only the Sidebar/FilterPanel drawer modes, AnchoredOverlay's
   phone-sheet presentation (design-language item 5, overlays become sheets on
   phones, and the owner's AO-6 decision) and app shells qualify. Pointer
   capability comes from `usePointerCoarse` / `useHoverCapable`
   (`src/style/pointer.ts`).

Layout at call sites: a measure is a `Container` step (never a `maxWidth` on a
component or a raw `View`); a two-up split is a Row of `span` children; equal-width
tiles that renumber columns are `Grid` (`minTileWidth` floor + `columns` cap,
container-measured); content-sized rows that stack at narrow widths are `Row stacks`
(+ `stackBreakpoint`); a hugging toolbar cell is a bare `Column` inside a Row.
Responsive props follow the boolean grammar (`stacks`, `responsive`) with
`BreakpointKey`-valued config props (`stackBreakpoint`, `drawerBreakpoint`);
`Responsive<T>`-valued component props are rejected (compose the public hooks
in app code instead), and so are per-breakpoint spans (a stacked Row is the
`col-12 col-md-6` idiom; finer reflow is Grid's). Rule of thumb: viewport for the
shell, container for the components, intrinsic wherever possible.

## Semantic prop styling

Semantic prop styling is the way to change a component's style, and Canvas does it
with flat boolean props. Each style choice is its own prop, named for the meaning
it carries; passing the prop turns it on. The prop name is the value.

Do this:

```jsx
<Button primary large>Save</Button>
<Button destructive>Delete</Button>
<Button ghost small>Cancel</Button>
<Card raised>...</Card>
```

Not this:

```jsx
<Button variant="primary" size="lg">Save</Button>
<Button tone="destructive">Delete</Button>
<Card elevation="raised">...</Card>
```

The boolean form reads like natural language ("a primary, large button") and is
the only accepted styling API. String-valued enum props (`variant="..."`,
`size="lg"`, `tone="..."`, `elevation="..."`) are rejected: do not add them and do
not document them.

### Axes

Style props are grouped into axes. Props on different axes are orthogonal and
combine freely; props within one axis are mutually exclusive, and you pass at most
one:

- Intent: `primary`, `secondary`, `destructive`, `ghost`, `outline`, `link`
  (pass none for the default look).
- Size: `small`, `large` (pass none for the default, medium size).
- Density: `compact`, `comfortable` (omit for the default density).
- State and layout, orthogonal booleans that stack: `loading`, `disabled`,
  `block` (full width), `rounded`, and the like.

So `<Button primary large loading block>` is four props drawn from four axes, all
applied together.

Glass is NOT a per-component axis: it is a theming-level surface mode, like the
light/dark scheme, and the `ThemeProvider` spells it in the same boolean grammar as
every component axis: `<ThemeProvider glass>` requests the role-appropriate material
where supported, `<ThemeProvider solid>` requests the complete opaque appearance, and passing neither
resolves to the PLATFORM DEFAULT: **glass on iOS 26+** (Apple makes Liquid Glass the
system material for the functional layer there, so a Canvas app matches the OS), and
**solid everywhere else** (web, Android, iOS < 26, Reduce Transparency). `glass`
wins if both are passed. The legacy `surface="solid" | "glass"` value prop remains
supported for config-driven code holding a `Surface` value, and on the web the DOM
helper is `setSurface("glass")` / `setSurface("solid")`. The scheme axis speaks the
same grammar: `<ThemeProvider dark>` / `<ThemeProvider light>` force a scheme
(`dark` wins if both are passed), omitting both follows the OS appearance, and the
legacy `scheme` value prop is likewise supported. The palette axis too: `<ThemeProvider
cyan>` (or `mint`, `rose`, `amber`) paints the accent in that hue in either scheme, and
omitting them gives violet; precedence is cyan, mint, rose, amber, violet. In the CSS
hand-off a palette is one `--hue` on `data-palette`, on the root or any wrapper.
`ssrPalette` mirrors `ssrScheme`, and the web DOM helpers are `setPalette("mint")` /
`getPalette()`. The platform default is computed from
`liquidGlassAvailable()` (exported from the kit).

Under glass EVERY surface renders through the material, layered. The model has four
layers, each with its own under-fill token (`glass-tint*` in `src/style/tokens.ts`,
`--glass-tint*` in `styles/tokens/colors.css`), from sheer to dense:

- **Functional** (`glass-tint`, the sheer tint): the floating shells and overlays,
  Navbar, TabBar, Sidebar, Dialog, ActionSheet, Drawer, Popover, Command, the
  calendar peek, and a Tabs track. They float above everything else.
- **Content** (`glass-tint-content`, denser, "legible first"): the panes, Card,
  DataTable, the lists, feeds, stats, description lists, grid-list tiles, board
  columns, calendars, code blocks, carousels, alerts, empty states, the charts, the
  bordered FilterPanel, and the docs stage. A tinted pane (a selected Card, a toned
  Alert) passes a `tint`.
- **Control** (`glass-tint-control`, the bright "puck"): every control that paints a
  surface of its own, the field boxes (Input, Textarea, Select, Autocomplete,
  PhoneInput, Stepper, InputOTP), Button, ButtonGroup, Tabs pills, Chip, Badge, Kbd,
  Progress rails, Steps circles, the Slider knob, the neutral Avatar tile (an initials
  disc paints its identity gradient, like a photo). A BRAND fill (a primary or
  destructive Button, a selected tab, page, day or step) is brand-tinted
  glass: `brand={tokens.primary}`, whose under-fill `brandTint` keeps as sheer as its
  ink's WCAG 4.5:1 allows (on iOS 26 it is the GlassView's own `tintColor`). A toned
  WASH (a soft Badge, a coloured Chip, a toned Alert) is its own soft wash, the pane's
  `tint` in place of the layer's, under the same ink as in solid mode: `statusColors`
  for the status tones, and a free Chip hue's 500 step at Dark Factory's soft alpha
  under its deep 800/300 label. A control with no
  surface of its own stays bare: a ghost or link Button, the web's outline and secondary
  Buttons (Dark Factory's transparent outline pills), and on every platform Pagination's
  resting pages, arrows and rows-per-page trigger. Radio, Checkbox and Switch are small
  marks inside content, not surfaces: under glass they draw their solid look on every
  platform, with no pane and no rim (a checked mark its solid brand fill, an unchecked
  ring, box or off track its solid boundary, the Switch knob its own colour). A Radio
  `card` tile is a content pane, as a selectable Card is.
- **Dense** (`glass-tint-dense`, the densest tint): the surfaces a user reads and
  acts on, the option lists (Dropdown, Select, Autocomplete, RowMenu, the SplitButton
  overflow, the PhoneInput country list, AvatarMenu), AlertDialog, Toast, Tooltip, the
  chart value flag. AnchoredOverlay selects it with `dense`. The two INVERSE surfaces
  take `inverseDenseTint`, their own fill at the dense alpha (the Tooltip bubble the
  ink, every Toast DF's `inverse` pill), so their inverse text keeps its contrast.

Those surfaces render through the shared `GlassSurface` primitive
(`src/style/glass-surface`), which paints the active material per platform: Apple's
real native Liquid Glass via `expo-glass-effect` on iOS 26+, the hand-off's material on
the web (the layer's tint, a `blur(20px) saturate(1.6)` backdrop and a 1px hairline rim;
`glass-surface/web-frost.ts`, no module needed), a genuine frosted blur
via `expo-blur` on Android and iOS < 26, and the layer's tint fill as a fallback when no
material is available. Pass it the skin's shape style (it
strips the fill and border and supplies the material) and its `layer`. Where the node
that paints the surface also owns something else (a Pressable's tap, ripple and dim,
a live region, a native TextInput), keep that node and render a `GlassPane` (the same
material as a sibling BEHIND its content, `layer` + `shape` + optional `tint` /
`brand`) as its first child, with `paneStyle` dropping the node's own fill under glass
and trading a resting border for padding of the same width, so the pane covers the
node's whole solid footprint while a state border stays a border over it; a TextInput
beside a pane takes `PANE_SIBLING_INPUT`. Fills INSIDE a glass surface (a hovered or
selected row, a header band, a stripe, a code pill, a placeholder) go through
`innerFill` / `withInnerFill`, which turn the opaque `muted` / `secondary` / `accent`
roles into ink tints under glass so they never sit as opaque patches on the material.
A state border (a focus ring, an error edge, an open trigger, the current step) stays
over the pane; a resting hairline drops, the material's rim is the edge. In solid mode
every one of these renders nothing extra: `GlassSurface` is the plain box, `GlassPane`
renders null, `paneStyle` and the inner fills return the skin's own style, so the
solid tree is byte-identical to the pre-glass one. Under Reduce Transparency or
Increase Contrast every layer degrades to its opaque token
(`styles/tokens/surface.css` and the accessibility ladder in
`glass-surface.shared.tsx`).

The material contract is role-based, not component-name-based. In glass mode,
intentional content panels and text-entry wells use stable static glass; functional
controls, navigation and overlays may use Liquid Glass. Persistent content, text,
icons, images and chart marks never acquire liquid deformation. Layout wrappers and
deliberately unfilled variants inherit their surroundings without another pane.
The semantic `card` and `popover` tokens stay opaque in every mode; shared material
rendering owns glass fills instead of rewriting those tokens.

Keep role, density, renderer capability and motion separate. Use supported native
Liquid Glass through `expo-glass-effect` on iOS where appropriate, supported native
frost through `expo-blur`, Canvas's own Android capture module (`android/`; see One
package) on Android 12+ (Expo SDK 57), and the shared web material paths. Android blur requires
safe live backdrop ownership; no material may sample itself. A browser skin preview is
not native evidence, and tint without blur is not proof of a native material.

Solid is a complete primary appearance and fallback: opaque fill, matching
foreground/state colors, boundaries and elevation. A resolved solid surface mounts
no glass capture, refraction, specular layer or droplet animation. Missing or unsafe
material capability must restore that complete treatment, preserving layout, refs,
focus, input values, open state and scroll position in both mode directions.
Reduce Transparency and Increase Contrast require readable opaque treatment;
Reduce Motion removes nonessential fluid motion without requiring opacity by itself.

Prefer native feedback. Native Liquid Glass may remain still; custom press swelling
or connected splitting/merging is not implied by a click handler, and solid mode keeps
its native feedback. `tools/materials/manifest.ts` records the intended role and
verification obligation of every public renderable. `bun run check:materials`
reconciles it with exports and docs routes; inventory coverage is not an
implementation or runtime-verification pass.

Do not add a per-component `glass` prop and do NOT hand-paint glass (backdrop-filter,
specular edges, a translucent fill of your own) onto individual components: route a
new surface through `GlassSurface` or `GlassPane` with the layer it belongs to, and
its inner fills through `innerFill`. The modal scrim (`scrimFill`, the `scrim` token) is
no surface: under glass on the web it also blurs what it dims by Dark Factory's 2 px
(`WEB_FROST.scrimBlur`, through `useScrimFrost`); solid mode and every native scrim keep
the plain dim. `test/glass-tint.test.tsx`,
`test/glass-controls.test.tsx` and `test/dense-overlays.test.tsx` pin the layers, the
legibility floors and the solid-mode byte identity.

### Conflicts

Any boolean can be passed, so an axis may receive more than one (for example
`<Button primary ghost>`). Each component defines a fixed precedence order per
axis and resolves to the single highest-precedence prop that is set; it never
stacks two intents or two sizes. Document that precedence in the component's entry,
and prefer not to pass conflicting props at the call site.

### Resolution

Each boolean maps to a curated internal set of React Native style objects: the
per-platform skin functions in the component's `*.styles.ts` files, built from the
design tokens. Canvas reads the active booleans, applies the axis and precedence
rules above, and produces the final style. Components consume these props
internally; they do not forward unknown style props to the underlying host
element, and consumers never pass raw style overrides to restyle a component.

Every visual variation a component supports must be exposed as a boolean prop on
one of these axes.

## No styling escape hatches

There is no styling escape hatch in Canvas, period. A component's look and its
in-context layout come from its semantic boolean props (see "Semantic prop
styling") and from the kit's own layout primitives, never from a raw `style={{…}}`
override at the call site.

Banned at every call site (app code, the docs, AND the kit's own `.md`
examples, which are the showcase):

- Restyling through `style`: `backgroundColor`, `borderWidth`/`borderColor`,
  `borderRadius`, `color`, `fontSize`/`lineHeight`/`fontWeight`/`letterSpacing`,
  `opacity`, shadows, gradients, and the like, to change how a component or
  primitive looks.
- Re-spacing / repositioning through `style`: `margin*` (including negative
  margins), `padding`, `gap`, absolute positioning, and hand-set `width`/`height`
  to nudge a component around (e.g. `marginLeft: -12` to overlap avatars).
- Hand-composing a missing widget out of a primitive + raw style: a chip, pill,
  tag, card, identity row, avatar stack, "+N" overflow counter, divider, and so
  on.

Reaching for a style shim is a signal, not a solution: it means the kit is
missing a capability. The fix is always to add that capability to the kit and use
it, never to shim at the call site:

- Missing a visual variation? Add the semantic boolean prop to the component.
- Missing an arrangement? Use or extend a layout primitive (a `Row`/`Column` with
  a `tight`/`snug`/`relaxed`/`loose` gap and boolean alignment, an avatar group
  with overlap), never a hand-rolled `flexDirection` + `gap` + `margin` `View`.
- Missing a composite (chip, identity row, avatar group, icon tile)? Add it to
  the kit per "Dogfood the kit" above, then use it.

This extends the "Resolution" rule ("consumers never pass raw style overrides
to restyle a component") to ALL styling and layout, and it binds the kit's own
`.md` examples: an example that hand-shims is a bug. No component may expose a
`style` prop documented as an "escape hatch"; where one existed (`Avatar`'s
overlap margin), the real capability replaced it (`AvatarGroup` owns overlap).

This is the STYLING escape-hatch ban. It is separate from, and additional to,
the ban on web-only DOM/CSS platform escape hatches in the
"React-Native-everywhere principle" above.

## Components own their label anatomy

A component is the parent node of everything it labels. When a control carries
text, the text goes through the control's own API, never beside it: the title is
`children`, the muted secondary line is the `description` prop (a ReactNode).
The component owns the label typography, the stacked title/description column,
the alignment of its indicator to the first text line, and the whole-row tap
target. Checkbox, Radio, and Switch all follow this contract; it is the standard
for any future control that pairs an indicator with text (an option row, a
selectable card, a chip with a sublabel).

Do this:

```jsx
<Checkbox defaultChecked description="Get notified when activity happens.">
  Email notifications
</Checkbox>
```

Not this:

```jsx
<Row snug alignStart>
  <Checkbox defaultChecked />
  <Column tight>
    <Typography small medium>Email notifications</Typography>
    <Typography tiny muted>Get notified when activity happens.</Typography>
  </Column>
</Row>
```

The hand-composed form is a bug wherever it appears (app code, docs examples,
templates), except inside an intentional Don't fence: it splits the tap target
(only the box toggles), drifts from the control's canonical type scale, and
hides a missing kit capability. If a control lacks the text slot the design
needs (a description, an inline hint, a trailing detail), add it to the kit
component per "Dogfood the kit" (backward-compatibly, following the
`description` precedent), then use it. This extends "Dogfood the kit" and "No
styling escape hatches":
those ban rebuilding a component's look; this bans rebuilding a component's
anatomy around it.

## Motion: what stays, what is gone, and the tuning harness

On 2026-09-21 the owner removed the liquid glass motion outright: the moving
selections (the pill that travelled between tabs, rows, pages, days and dots), the
liquid popup presentation (the droplet, the button-to-menu and field hand-offs, the
cover and the spring-back), the Entrance spring, the Backdrop organism with its Skia
and WebGL paths, and the docs' decorative scenes. Do not bring any of it back, in any
form, without a new decision from the owner: a selected state paints where it is
(a static control-layer pane under glass, the skin's own fill in solid mode), an
anchored card appears in place once its placement is measured, and no decorative
loop runs behind a page. The motion that stays is functional: the Spinner, the
Skeleton shimmer, the indeterminate Progress sweep and the InputOTP caret (all on the
loop primitive, `src/style/loop.tsx`, the native driver natively and a compositor CSS
animation on the web, so nothing commits through React per frame), the floating
labels, the Accordion, Collapsible and Reveal transitions, the Drawer and ActionSheet
slides, the Sidebar drill-down, the native ripple and the router's own transitions.
`test/design-rules-source.test.ts` keeps `Animated.loop(` inside `loop-native.ts` and
every transition between 100 and 700 ms. Why: react-native-web's Animated JS driver
is one React commit per frame at default priority and React never expires a retry
lane, so a spring running beside a Suspense boundary held the whole body back (the
sidebar pill cost every component page 1.3 s per click); the owner judged the
animations not worth that and had them deleted rather than re-engineered.

On 2026-09-23 the owner added one new decision on top of that: Dark Factory's hover
lifts are ported (the design language's item 9). They are hover feedback, not the
removed liquid motion, and like the loop primitive nothing in them commits through
React per frame: the style switches when the hover does and the browser runs the
transform, shadow or background transition itself. The primitive is
`src/style/hover.tsx` (hover read on the control's RippleClip wrapper, which never
moves, so a lifted surface cannot slide out from under a resting pointer; touch never
hovers; a lifted card stacks at the raised layer, and lifts its Grid or Row span cell,
while it lifts and settles, because react-native-web paints siblings in document order),
the values are the `HOVER` table in `src/style/motion.ts`, and the skins own the
feedback (the web Card, Button and Sidebar skins declare it, and a skin shared by every
platform, Pagination's, declares its wash through `webHover`). Every change is judged
against the `df-hover-lift` card. The decision also named the native driver for pointer
hover on iPad, but React Native 0.86 delivers no pointer hover on iOS or Android unless
the host app opts into W3C pointer events natively (`RCTSetDispatchW3CPointerEvents` and
the `shouldPressibilityUseW3CPointerEventsForHover` flag, both off by default), and
Dark Factory's own app does not, so its lifts exist on the web only; the native half
waits on the owner. The page behind the docs is static scaffolding (design-language
item 8); it never animates.

Effects that remain judged by eye (the glass material and its frost, a gradient, a
new functional transition) still go through the global `tuning-harness` skill:
record the reference first and write its card, harness for the inner loop, land the
effect on the shipped surface (the docs page or app screen the user opens, in the
mode they will see) and compare against the card, blind, until nothing differs; log
every run, docs screenshot last. In this repo the harness is the hidden `/testing/*`
routes under `docs/src/app/(home)/testing/`, rendering the fixture bodies in
`smoke/src/testing/` (shared with the sealed smoke app); the material
one is `/testing/materials`, the hover one `/testing/hover`, the identity disc one
`/testing/avatar`. The tunables live in one table per effect, never in a public
value prop. The evidence log is `tools/native/liquid-motion.md`: its sections
up to the removal are HISTORY of deleted code, its `## References` section keeps the
`ios-native-menu` card (strips under `tools/native/reference/`) as the record of what
that work was judged against, and every row under a version 2 table names its
`Surface` and its `Versus reference` verdict. `.tuning-harness.json` at the repo root
(version 2) tells the global push gate which files are tunables (`src/style/motion.ts`,
`src/style/glass-surface/web-frost.ts`, `src/style/identity-hue.ts`,
`src/style/glass-surface/glass-wash.ts`, `src/style/selected-card.ts`,
`src/style/glass-surface/ios-tints.ts` and `docs/src/shell/page-look.ts`): a push whose
newest tunable change has no evidence row in or after it is refused, and so is a row
with an empty `Surface` or `Versus reference` cell or a `matches` written on a harness
route. A pure refactor of those files with no visual change carries the commit
trailer `Tuning-evidence: unchanged`. A report may claim an effect is done or
matches only from a shipped-surface row with no open difference; open differences
lead the report, and a card item that cannot be matched goes to the user as a
decision, never into the log as "by design".

## Preview links on every completed piece of work

Whenever a piece of work is complete, end the report with a "Preview" block of three
clickable links (Web, iOS, Android) that open the feature on each platform, so it can
be eyeballed without hunting for the route. This is in addition to (not a replacement
for) the "Visually inspect UI after changes" global directive; the links are how the
user jumps straight to what changed.

All three are real `http://` links, so every one is clickable from a terminal (a raw
`canvas://` deep link is not: the OS looks for a Mac handler and never reaches a
simulator). The native two point at the local preview opener started by `bun run dev`
(`docs/scripts/preview-server.mjs`), which runs the deep link on the booted simulator
or emulator via `simctl` / `adb`.

Resolve the feature's docs route first, then emit exactly these three links. The route
is the expo-router path in `docs/src/app`, most commonly `components/<slug>` (where
`<slug>` is the component name, e.g. `components/button`), and otherwise
`patterns/<slug>`, `templates/<slug>`, `tokens/<name>`, or a home route such as
`theming`. Substitute the route for `<route>`, and format each as a Markdown link so
it is clickable:

- **Web**: `http://localhost:8081/<route>` (loads the docs in the browser)
- **iOS**: `http://localhost:8790/ios?route=<route>` (opener runs it on the booted iOS simulator)
- **Android**: `http://localhost:8790/android?route=<route>` (opener runs it on the booted Android emulator)

The links are route-only by default. When the work is judged in one look (the mint
palette, the dark scheme, solid or glass), each link may also carry an optional look
query naming any of `scheme` (`light` | `dark`), `surface` (`solid` | `glass`) and
`palette` (`violet` | `cyan` | `mint` | `rose` | `amber`): `?scheme=light&palette=mint` after the route on the Web
link, and `&scheme=light&palette=mint` after the route on the iOS and Android links
(`http://localhost:8790/ios?route=components/button&scheme=light&palette=mint`). An
axis left out takes the exported look (dark, glass, violet) on a cold launch or a fresh web
load, and keeps the running app's choice on a link opened while it runs. The opener refuses a value outside an
axis's set instead of dropping it, and the app takes the look both on a cold launch
and from a link opened while it runs (`docs/src/theme/docs-theme.tsx`). The palette
applies in either scheme.

These assume `bun run dev` is running in `docs/` (it starts Metro on 8081 and the
opener on 8790) and, for the native two, a simulator/emulator booted with the Canvas
docs dev app installed. If the opener cannot reach a device it returns the exact
`xcrun` / `adb` command to run by hand.

If the completed work does not map to a docs route (pure tooling, CI, build, or an
internal refactor with no screen), say so in place of the block rather than inventing
a link. When several routes are affected, list a block per route.

## Local consumer linking: node_modules overlay in dev, npmjs package in prod

Consuming repos (dashboard, auth, site, deploy, DarkFactory) overlay their
`node_modules/@nannier/canvas` with a REAL-directory copy of this checkout's
package.json, `dist/`, and `styles/`, stamped with an `.origin` file naming
this checkout (their guarded `postinstall` does the copy). A symlink is not
an option: Next 16 Turbopack refuses to resolve a node_modules symlink whose
realpath is outside the consumer's repo. Real directories in node_modules ARE
live-watched (Turbopack and Metro natively; DarkFactory's webpack needs its
two conditional overrides), so no aliases or extra links are involved.

- When editing canvas alongside a consumer, keep `bun run dev` running here.
  It pairs the tsc watch (rebuilds `dist/`) with `scripts/dev-sync.ts`, which
  mirrors dist/ and styles/ into every overlay whose `.origin` points at this
  checkout. Consumers resolve built output, not `src/`.
- The overlay is a local-dev mechanism only. Consumers pin the published
  npmjs version in their package.json, and CI/prod installs that real package
  because no sibling checkout exists there. Never switch a consumer's
  dependency to `link:`/`file:`, and never commit anything under
  node_modules.
