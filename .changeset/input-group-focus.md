---
"@olympusoss/canvas": patch
---

Input: coordinated focus on the addon (grouped) layout

Focusing an Input that has addons (prefix/suffix/icons/action) no longer shows the
browser's default outline clipped by the group's rounded, overflow-hidden
container (which read as a half-baked ring). The inner field's default outline is
suppressed and the group's shared border recolors to `border-ring` on focus, so
prefix + field + suffix light up together as one control.
