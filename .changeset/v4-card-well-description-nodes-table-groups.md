---
"@nannier/canvas": minor
---

Three backward-compatible capabilities for the v4 component detail page. New public API: `CardMedia` takes `children` and stages them centered in a sunken specimen well (an inner fill under glass), sized by the new `compact` and `tall` booleans; `DescriptionList` items take a ReactNode `term` and `value` beside the existing strings; `DataTable` takes `groups` (titled bands with an optional adornment and count above each group's rows, exported as `DataTableGroup`) and per-column `grow` weights and `minWidth` floors that mix with fixed widths and pan the table once the floors exceed its width.
