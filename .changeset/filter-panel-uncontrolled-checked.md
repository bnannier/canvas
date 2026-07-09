---
"@olympusoss/canvas": patch
---

Make FilterPanel options interactive out of the box. Each option's `checked` state was controlled-only, so pressing a row fired `onChange` but never checked the box or moved the active-filter count. The panel now holds internal checked state seeded from each option's `checked` flag, pressing a row toggles it (still firing `onChange`), the header badge derives its count live from the checked options (an explicit `activeCount` still overrides it), and Clear resets all filters (still firing `onClear`).
