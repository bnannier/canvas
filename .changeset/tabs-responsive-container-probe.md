---
"@nannier/canvas": patch
---

Fix responsive vertical Tabs flattening in wide containers. The `responsive`
measurement was attached to the vertical rail itself, but the rail hugs its
content (~180px), so the first real layout always measured at or below the `sm`
breakpoint and the rail latched into the horizontal underline look even in a
wide desktop container. The measurement now rides an out-of-flow container
probe (a zero-height, absolutely positioned sibling that spans the parent,
shared as `containerProbe` in the style layer), rendered in both states so the
flattened row also tracks the real container width and restores the rail when
the container widens.
