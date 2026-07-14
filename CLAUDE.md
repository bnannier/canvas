# Canvas

Canvas is a React Native UI kit, published as `@olympusoss/canvas`. It runs
universally: native on iOS and Android, and on the web through React Native Web.

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
shortcut: name it as such and get explicit authorization before using one.

## Dogfood the kit: every UI element is a Canvas component

A claude prime global directive. Every UI element used anywhere in this repo, the
docs app included, must be a Canvas component (or one of the kit's primitives:
`View`, `Text`, `Pressable`, `Image`, `TextInput`, `ScrollView`), never a hand-rolled
look-alike. The rule, in order:

- Need a control the kit already exports? Import and use it.
- The kit has no such component? CREATE IT IN THE KIT (`src/atoms` | `molecules` |
  `organisms`, with its skins/styles), export it, then use it. Add a changeset, since
  it ships in `@olympusoss/canvas`.
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

## Highly responsive

Canvas is highly responsive by default. Every component must adapt cleanly across
the full range of viewport sizes, from large desktop down to phone.
Responsiveness is a core requirement of every component, not an optional add-on.

Author desktop-first: lay out and size each component for the desktop case first,
then add the responsive variants that scale it down to tablet and phone. This is
the inverse of mobile-first.

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
light/dark scheme. The `ThemeProvider`'s `surface` prop is `"solid" | "glass"`, and
when omitted it resolves to the PLATFORM DEFAULT: **glass on iOS 26+** (Apple makes
Liquid Glass the system material for the functional layer there, so a Canvas app
matches the OS), and **solid everywhere else** (web, Android, iOS < 26, Reduce
Transparency). Pass `surface="glass"` to force it on (a frost on non-iOS-26
platforms), or `surface="solid"` to force the flat look; on the web the DOM helper is
`setSurface("glass")` / `setSurface("solid")`. The platform default is computed from
`liquidGlassAvailable()` (exported from the kit). Following Apple's Liquid Glass model,
glass is the material for the FUNCTIONAL layer only: overlays (popovers, menus,
dropdowns, selects, comboboxes, dialogs, alert dialogs, sheets, drawers, command)
and the bar/sidebar shells (navbars, sidebar) read as glass. The `card` token stays
SOLID, so content surfaces (cards, lists, tables, calendars, charts) do NOT go glass
(Apple: "don't use Liquid Glass in the content layer").

Those functional-layer surfaces render through the shared `GlassSurface` primitive
(`src/style/glass-surface`), which paints the active material per platform: Apple's
real native Liquid Glass via `expo-glass-effect` on iOS 26+, a genuine frosted blur
via `expo-blur` on web/Android (and iOS < 26), and the translucent `popover` fill as
a fallback when those optional peer dependencies are not installed. So glass mode IS
real iOS Liquid Glass on iOS and a real frost elsewhere, not a per-component effect.
Do not add a per-component `glass` prop and do NOT hand-paint glass (backdrop-filter,
specular edges) onto individual components: route any new functional-layer surface
through `GlassSurface` (pass it the skin's shape style; it strips the fill and
supplies the material), and leave content-layer surfaces solid.

### Conflicts

Any boolean can be passed, so an axis may receive more than one (for example
`<Button primary ghost>`). Each component defines a fixed precedence order per
axis and resolves to the single highest-precedence prop that is set; it never
stacks two intents or two sizes. Document that precedence in the component's entry,
and prefer not to pass conflicting props at the call site.

### Resolution

Each boolean maps to a curated internal set of Tailwind utility classes (the
component's implementation). Canvas reads the active booleans, applies the axis
and precedence rules above, and produces the final utility set. Components consume
these props internally; they do not forward unknown style props to the underlying
host element, and consumers never assemble utility soup or pass raw style overrides
to restyle a component.

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
- Missing a composite (chip, identity row, avatar group, icon tile)? Build it in
  the kit (`src/atoms|molecules|organisms`), export it, add a changeset, use it.

This extends the "Resolution" rule ("consumers never assemble utility soup or
pass raw style overrides to restyle a component") to ALL styling and layout, and
it binds the kit's own `.md` examples: an example that hand-shims is a bug. No
component may expose a `style` prop documented as an "escape hatch"; where one
exists today (e.g. `Avatar`'s overlap margin), the real capability replaces it.

This is the STYLING escape-hatch ban. It is separate from, and additional to,
the ban on web-only DOM/CSS platform escape hatches in the
"React-Native-everywhere principle" above.

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

These assume `bun run dev` is running in `docs/` (it starts Metro on 8081 and the
opener on 8790) and, for the native two, a simulator/emulator booted with the Canvas
docs dev app installed. If the opener cannot reach a device it returns the exact
`xcrun` / `adb` command to run by hand.

If the completed work does not map to a docs route (pure tooling, CI, build, or an
internal refactor with no screen), say so in place of the block rather than inventing
a link. When several routes are affected, list a block per route.
