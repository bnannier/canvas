---
"@nannier/canvas": minor
---

Add the `Swatch` atom: a color sample built from a filled rounded block plus the
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
