---
"@nannier/canvas": patch
---

Fixes Form's `twoColumn` flow to be the two-column grid it documents. Above its 512px threshold it laid out as many 200px-floored cells as fit on a line (five across a wide card) instead of two; it now places exactly two equal columns 16px apart, keeps an odd last field at half width, and starts a new line after a FormSection, which takes the whole row. At or under the threshold it switched to a wrapping column in which a FormSection's `flexBasis: 100%` became a height basis, wrapping the fields into off-screen columns that hugged their content; it now stacks one full-width column, every field filling it, with nothing scrolling sideways.
