<!-- rubricVersion: 3 -->
# Canvas project rubric

Canvas is a universal React Native UI kit: one component API, three platform
skins. On the docs, every component page's preview card stacks three rows in
this order: **iOS** (top), **Android** (middle), **Web** (bottom), each row
labeled by a small corner watermark. Judge each row against ITS platform's
rules below, and compare rows of the same example: structure may differ per
platform idiom; content must not.

## Platform reference: Android rows (Material 3)

Judge shape, sizing, type, and anatomy against these values when the control
class matches; cite them as "M3 <value> (canvas rubric)":

- Shape scale: 4 / 8 / 12 / 16 / 28 / full. Buttons read as full pills; cards
  12dp; dialogs and bottom-sheet tops 28dp; menus and snackbars 4dp.
- Sizing: button container 40dp with a 48dp touch target; text field 56dp;
  menu item 48dp; navigation bar 80dp; top app bar 64dp; switch track 32dp
  tall with an outlined track and small dot when off; checkbox 18dp; radio
  20dp.
- Type roles: button and menu labels read as label-large (14/20 medium);
  dialog headlines around 24sp.
- Anatomy: dialog actions are right-aligned text buttons; tabs use an
  underline indicator; snackbars carry an inline action; button groups read
  connected, not iOS-segmented.

## Platform reference: iOS rows (HIG)

- Buttons are capsules with semibold labels; press feedback dims (about 0.8
  opacity), never ripples.
- Touch targets at least 44pt.
- Alerts are centered with stacked or paired actions; sheets slide from the
  bottom with a grabber.
- Functional floating surfaces can use native Liquid Glass. Surfaced content
  panes use static frost in glass mode, with crisp unwarped content; unfilled
  anatomy inherits its host. Solid appearance and accessibility fallbacks stay
  fully opaque. A browser skin preview does not establish native fidelity.

## Platform reference: Web rows, and every docs page (the v4 hand-off)

- The binding look is the Canvas v4 design hand-off, "Light as material"
  (tools/v4/handoff, photographed into .v4-reference). The owner's rule
  (2026-10-28): the docs and the kit match it pixel for pixel, dimensions and
  responsiveness included. When a route carries a design image, every visible
  divergence from it is a design-parity finding: a size, a radius, a fill, a
  border, a weight, a spacing, a position, an element present in one and absent
  in the other. The build "improving on" the hand-off is still a divergence.
- Its look, for routes without an image: Bricolage Grotesque display, Instrument
  Sans UI, JetBrains Mono meta and code; web controls and fields 10 px radius,
  cards 16, dialogs 20, menus 16; one oklch accent (violet 285 by default) on a
  flat near-black page in dark, with a fine grain over everything.
- Glass on the web frosts only what floats over the page: the navbar pill, the
  tab bar, dialogs, alert dialogs, sheets, drawers, popovers, the command
  palette, toasts, carousel arrows, video controls. Every other surface (cards,
  buttons, fields, chips, tables, menus, tooltips, the rail) is drawn opaque in
  glass mode too; a frosted in-page surface is a divergence.
- No minimum touch target; pointer targets are visual-sized.

## Cross-row comparison

- The same example's rows must show the SAME content and state; a row missing
  content its siblings have is a defect (category anatomy or render-failure).
- An Android row pixel-identical to the Web row for a component that should
  have a distinct Material skin suggests a skin-injection failure: file it
  once as render-failure / skin-injection on the Android row, and do not
  style-judge those rows further.

## Components without a platform spec

Charts and several composites have no iOS or Material catalog counterpart.
Judge those rows for platform plausibility only: on-scale radii, coherent
type roles, the right feedback family, no cross-platform idiom bleed. Never
cite a numeric spec that does not appear in this rubric.

## Touch targets

Touch-target minimums are enforced in code via minTarget plus hitSlop, which
is INVISIBLE in pixels. Do not file touch-target findings from screenshots;
that channel is code review, not vision. (Visually absurd targets, like a
control a few pixels tall, are still states/anatomy findings.)

## Glass pass (target "glass")

Glass shots exist to catch glass-specific defects only: unreadable text over
the material, missing overlay scrims, in-page surfaces (cards, tables, controls)
wrongly rendered as glass on the web. The floating material's translucency, blur
radius, and frost texture are the hand-off's; solid-pass findings must not be
re-filed from glass shots.

## Craft (added in v2)

These are the things a careful reviewer notices in a still image without
measuring anything. File one only when it is visible at a glance; if you had to
look for it, it is not a finding.

### States the example sets must read

An example whose props set `disabled`, `checked`, `selected`, `loading` or
`error` has to SHOW that state. A disabled control indistinguishable from its
enabled sibling, a selected tab with no indicator, a loading surface identical
to its resting one: those are `states` findings. Never file the absence of a
hover or press effect from a resting shot; nothing is being hovered or pressed.

### Corners of nested surfaces

A surface sitting flush inside another must not be MORE rounded than what
contains it, or the container's corner cuts it. A menu row inside a menu, a
thumb inside a track, a cell inside a panel. This is `consistency`, or
`alignment` when the inner shape plainly does not fit. It does not apply to a
detached, inset element: an iOS action sheet's capsule rows sit away from their
container's corners on purpose.

### Optical alignment

An icon visibly off the centre line of the label beside it, a glyph off-centre
in its circle, a label off-centre in its pill. `alignment`, and only when it
reads as wrong rather than measures as wrong.

### Icon family and stroke

Icons in one view from two families, or at two stroke weights. `consistency`.
The kit draws its entire set from one constant, so a mismatch is a caller or an
example using something that is not a Canvas icon.

### Numerals in a column

A table or a stats row whose digits do not line up vertically down a numeric
column, or whose figures visibly change width. `typography`.

### Measure and orphans

Prose in a card, alert or empty state running much past ninety characters a
line. A heading or title that wraps a single word onto its last line.
`typography`.

### Text too small to read

A label unreadable at the shot's own scale. `typography`, or `a11y` when it is
the label of a control. Platform exception: 10pt iOS tab-bar labels and 12sp
Material label-small are those platforms' own sizes; do not file them.

### Light direction and depth

Shadows in one view implying two different light sources, or a shadow heavy
enough to read as a border rather than as depth. `consistency`, or `composition`
when it is the whole view's problem.

### Box in box

More than two nested bordered or filled surfaces where the nesting buys no
hierarchy: a bordered card inside a bordered panel inside a bordered section.
`composition`.

### Empty and loading compositions

When an example is meant to show an empty or a loading state, blank space where
a composed empty state or a skeleton belongs is a `states` finding. Do not infer
a missing state from an example that is not about one.

## Do not file (extends the touch-target rule above)

- The design language itself, as taste: the accent hues, the chart series, the
  typefaces, the radius scale, information density. Those are the hand-off's
  decisions. A DIVERGENCE from the hand-off in any of them is still a
  design-parity finding; only re-litigating the hand-off's own choice is barred.
- Landing-page and marketing critique judged against your own taste: hero size,
  section rhythm, three-column grids. Where the hand-off draws a hero, its size
  and rhythm are the reference, and divergence from it is a finding.
- Icon-set taste. The glyphs are Lucide-derived by choice.
- Sample content, unless it is literally placeholder text.
- Touch targets, still: they are enforced in code with minTarget plus hitSlop,
  which is invisible in pixels, and there is a test that reads them.
