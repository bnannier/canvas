---
"@olympusoss/canvas": patch
---

InputGroup: coordinated focus state on the shared border

Focusing an InputGroup field no longer shows the browser's default outline
clipped by the group's rounded, overflow-hidden container (which read as a
half-baked ring). The inner field's default outline is suppressed and the whole
group's shared border recolors to `border-ring` on focus, so prefix + field +
suffix light up together as one control, matching the Input component's focus
convention.
