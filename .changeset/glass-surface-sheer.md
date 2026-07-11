---
"@olympusoss/canvas": minor
---

`GlassSurface` gains a `sheer` prop: a lighter, thinner frost for CONTENT-layer surfaces that
float over a live backdrop and do not need to occlude it, so whatever animates behind reads
clearly through the surface. The full frost (the default) is unchanged and stays opaque enough
for functional overlays (menus, dropdowns, dialogs) to occlude the content they open over.
