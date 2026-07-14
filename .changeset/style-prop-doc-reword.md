---
"@nannier/canvas": patch
---

Documentation: reword every component's `style` prop away from the misleading
"escape hatch for layout/positioning composition" (which reads as an invitation to
restyle, contradicting the kit's no-styling-escape-hatches rule) to "outer layout
composition only (width/flex within a parent), never a restyle hook." JSDoc only, so
it ships in the published type declarations; no API or behavior change.
