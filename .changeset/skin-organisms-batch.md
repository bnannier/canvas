---
"@olympusoss/canvas": minor
---

Skin the 5 remaining single-file organisms into the platform-skin pattern, completing the
kit-wide platform-adaptive structure (every component now has the shared shell + web/iOS/
Android skins). Light treatment (per-OS touches; registered for the docs comparison):
Command (row type/density + press feedback; the GlassSurface panel is untouched), DataTable
(row density/type/hairline), Drawer (Android hardware-back to close + Material side-sheet vs
iOS sheet rounding), FilterPanel (group type/spacing; composes the skinned Checkbox). Shared
treatment (platform-neutral data viz, identical skins): Charts. Public APIs unchanged.
