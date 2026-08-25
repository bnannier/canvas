---
"@nannier/canvas": patch
---

Fix Steps `stacks` falsely stacking inside a row parent. The `stacks`
measurement was attached to the horizontal root itself, but in a row parent
that root hugs its content, so the first real layout measured the hugged width
(well below the `sm` breakpoint) and Steps stacked vertically even in a wide
container, flickering back through the horizontal layout on every relayout
because the stacked branch spans full width. The measurement now rides the
out-of-flow `containerProbe` sibling (the Tabs `responsive` fix's mechanism),
rendered in both states so the stacked branch also tracks the real container
width and un-stacks when the container widens.
