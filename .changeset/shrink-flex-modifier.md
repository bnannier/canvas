---
"@nannier-com/canvas": minor
---

Row and Column gain a `shrink` modifier, the new public option this release adds.

React Native gives every box `flexShrink: 0`, the opposite of the web's flex
default, so a Row child sized by a long sentence keeps that sentence's full
single-line width and spills past the row's edge, where the nearest clipping
ancestor cuts it mid-word. Until now the layout primitives had no way to say
"this child may give way": `fill` (flex: 1) also zeroes the flex basis, which
pulls every child of a `wrap` row back onto one line, and the kit's own
molecules reached for a raw `flexShrink: 1` internally instead.

`<Column shrink>` sets `flexShrink: 1` and leaves the basis at the content size,
so a wrapping row still breaks where it did and only the over-wide child gives
way. Opt-in and backward compatible: nothing changes for layouts that do not
pass it.
