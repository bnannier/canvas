---
"@nannier/canvas": patch
---

Tabs, TabBar, Breadcrumb, Steps and RowMenu take the Canvas v4 hand-off's look. Tabs: the web underline row (24 apart, a 2px glowing accent bar, 14px labels), the segmented pills track with a raised card thumb, and the accent-washed vertical rail on the web (iOS draws its segmented control, a separate changeset). TabBar: the floating 62px capsule with an accent wash behind the active item (Android keeps its 80dp bar with the 64x32 pill). Breadcrumb: 13px trail with a chevron icon separator in the subtle ink and an 8px gap. Steps: 28px markers (filled done with a check icon, a ringed and haloed current, a hairline upcoming), 2px connectors and a glowing progress fill. RowMenu on the web: a 32px edged trigger and a 220 wide card menu with 34px rows. No public API changes, so a patch.
