---
"@nannier/canvas": minor
---

Sidebar takes the Canvas v4 rail on the web (232 px sunken column, 36 px rows at a 9 px corner, 30 px at 8 when `compact`, the accent's soft wash on the active row, a mono eyebrow over each group; the 3 px edge bar is gone) and the soft accent pill on Android. Minor because it adds a new public capability: the `markers` boolean (a trailing accent dot on the active row, a hairline dot on rows of the current place), the item `marked` field, the section `current` and `count` fields, a `floating` frame with its own lift, and header/footer slots that stack as plain blocks in an `embedded` rail.
