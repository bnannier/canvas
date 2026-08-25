<!-- rubricVersion: 1 -->
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
- Liquid Glass belongs to the FUNCTIONAL layer only (overlays, bars); content
  surfaces (cards, lists, tables) stay solid.

## Platform reference: Web rows

- The established Canvas look: medium-rounded corners, medium-weight labels,
  visible focus treatment on keyboard focus, hover affordances.
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
the material, missing overlay scrims, content-layer surfaces (cards, tables)
wrongly rendered as glass. The material's translucency, blur radius, and
frost texture are by design; solid-pass findings must not be re-filed from
glass shots.
