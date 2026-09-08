---
"@nannier-com/canvas": patch
---

Avoid constructing offscreen StackedList row elements when virtualization is active. Keep default, unbounded, and reorderable lists eager, and cover the distinction with large-data construction tests.
