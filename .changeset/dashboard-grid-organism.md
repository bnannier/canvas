---
"@nannier/canvas": minor
---

New DashboardGrid organism: a 12-column, container-responsive widget board with locked
and customize modes, controlled or uncontrolled order, and kit drag reordering (pointer,
keyboard, screen reader).

Minor justification: this adds a new public component to `@nannier/canvas`
(`DashboardGrid`, plus the `clearStoredDashboardOrder` helper and the `DashboardGrid`
ordering and span exports), which is a new user-visible capability rather than a fix to
an existing one. Nothing that already shipped changes shape.
