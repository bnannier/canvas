---
"@nannier/canvas": minor
---

Add the `activeIndicator` style helper (exported from the package root alongside the other style primitives). It builds the Material / iOS bottom active-indicator, a bottom border that thickens when a field becomes active, while reserving a constant band below the content so the thickening never reflows the field's vertically-centered value text. Canvas's own `Select`, `Combobox`, and `Input` fields now build their indicator from it (one source of truth for the invariant, replacing the per-field compensation), and consumers can use it to build matching custom fields. No visual change to the existing components.
