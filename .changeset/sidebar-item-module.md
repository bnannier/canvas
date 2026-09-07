---
"@nannier-com/canvas": patch
---

Break the Sidebar's require cycle by giving the nav row its own module.

`sidebar.shared` builds the narrow drill-down from a skin, and the drill-down
imported `SidebarItemBadge` back from `sidebar.shared`, so the two modules
required each other. Metro allows that and warns on every app start ("Require
cycle: sidebar.shared -> sidebar.drilldown -> sidebar.shared"), because
whichever module loads second sees the first half-initialized. It was harmless
only because every value crossing the cycle is read inside a render, by which
time both modules have finished loading; a value read at module scope would
have evaluated as `undefined` far from the line that caused it.

`SidebarItem`, `SidebarSection` and `SidebarItemBadge` now live in
`sidebar.item`, which both presentations import and which imports neither of
them back. `sidebar.shared` re-exports the two types, so the public API is
unchanged: `SidebarItem` and `SidebarSection` are still exported from the kit
and from each per-OS entry point, and no consumer import changes.

The warning is gone from the docs app on iOS, verified on the simulator.
