---
"@nannier/canvas": minor
---

Spinner gains component-owned label slots, matching the Checkbox/Radio precedent:
pass the label as `children` (rendered in the canonical muted small type) and an
optional secondary line as `description`, and choose the layout with `stacked` —
the label beside the indicator in a snug row by default, or the indicator over a
centered label column when `stacked`. A bare `<Spinner />` is unchanged. When no
`accessibilityLabel` is given and the label is a string, that string becomes the
accessible name (still "Loading" when there is no label). Callers no longer
hand-compose a Row/Column + Typography beside a spinner.
