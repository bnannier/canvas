---
"@nannier/canvas": minor
---

Sidebar: error-tone item badges.

Minor justification (new public capability): Sidebar item badges can carry the
error status tone for alert counts (badgeError), defaulting to secondary. A
`SidebarItem` may now set `badgeError` beside its `badge`, and the row renders
that count through the Badge atom's error status pill (`<Badge status error>`,
the red dot-and-label form) instead of the default secondary metadata pill, so a
Security row can report lockouts as a problem rather than a volume. The flag is
an item-level boolean on the data object, following `RowMenuItem.destructive`,
and it reaches both presentations of the same row: the rail and the narrow
drill-down leaf. A row that omits it, or sets it with no `badge`, renders exactly
as before, and the collapsed rail still folds the count into the row's accessible
name.
