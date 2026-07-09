---
"@olympusoss/canvas": patch
---

Accordion fills its parent's width by default.

The Accordion root had no width, so React Native sized the group to its widest
row's content and it only spanned the full width when the parent happened to
default to `alignItems: "stretch"`. In a centered or row parent it shrank to
content and left gutters on each side. The root now defaults to `width: "100%"`,
so the group spans the full width of its parent's content box (full width minus
the parent's padding) on iOS, Android, and web, matching the other block/list
components. The default sits behind the platform skin's container shape and the
`style` layout prop, so a caller can still constrain the width via `style`.
