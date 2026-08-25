---
"@nannier/canvas": minor
---

`BreakpointOverride`: pin the viewport tier for a subtree.

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
