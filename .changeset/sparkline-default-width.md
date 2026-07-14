---
"@bnannier/canvas": patch
---

Sparkline now has an intrinsic default width, so its `flexGrow` bars no longer collapse to 0 and render blank when the caller sizes no width; an explicit `width` or `flex` still overrides it.
