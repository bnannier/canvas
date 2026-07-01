---
"@olympusoss/canvas": minor
---

Add a `maxItems` prop to `Breadcrumb` that collapses a long trail: it keeps the
first crumb and the last `maxItems - 2`, replacing the middle with a single "…"
crumb, so a deep path stays on one scannable line instead of being hand-composed
with raw Pressable/Text.
