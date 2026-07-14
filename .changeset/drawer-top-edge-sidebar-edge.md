---
"@nannier/canvas": minor
---

The `Drawer` gains a `top` edge: a sheet that drops down from the top (mirroring the `bottom`
sheet), sliding on a manual translateY like the `left`/`right` edges do.

The responsive `Sidebar` drawer's edge is now configurable. It slides from the start (left) edge by
default, and `drawerRight`, `drawerTop`, `drawerBottom` change which edge it slides in from
(`left`/`right` are full-height side panels; `top`/`bottom` are content-sized sheets). iOS still
uses its native menu, not the drawer.
