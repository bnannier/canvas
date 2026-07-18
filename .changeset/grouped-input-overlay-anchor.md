---
"@nannier/canvas": patch
---

Fix the grouped Input's overlaid icon shifting ~1px on focus on Android: the icon overlays now anchor to a field-area wrapper (the container's content box, which the active-indicator compensation keeps constant) instead of the bordered group container, whose padding box shrinks 1dp when the indicator thickens. The group container also enforces its height via minHeight with stretching addon boxes, so icon-only groups match the bare field height on every platform (Android 56dp per Material 3, iOS 44pt, web 36px) instead of collapsing to their content.
