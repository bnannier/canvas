---
"@nannier/canvas": patch
---

Skeleton: the `card` scaffold now fills its parent width instead of capping at a fixed 320px. Like the real `Card` it stands in for (which carries no width cap), the placeholder spans its container, so the swap to the loaded card no longer shifts the layout, and sizing it via the `style` prop (a fixed width, a flex, or a percentage) now works as documented rather than being overridden by the internal cap. The other shapes are unchanged: `list` and `table` keep their own caps, and single-shape placeholders are still sized by their shape.
