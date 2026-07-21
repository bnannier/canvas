---
"@nannier/canvas": patch
---

Select: keep a minimum gutter between the value and the trailing chevron. The trigger row used `justifyContent: "space-between"` with no gap, so a `fit` (content-hugging) select, such as the toolbar `inline`+`fit` cluster, collapsed to zero free space and jammed the chevron flush against the value on all three platforms. A `gap` on the shared trigger row reserves the gutter without affecting fixed-width fields, where `space-between` still pushes the value and chevron to opposite edges.
