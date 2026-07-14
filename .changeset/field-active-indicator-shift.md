---
"@bnannier/canvas": patch
---

`Combobox` and `Input` no longer nudge their value text up when the field becomes active (Combobox on open, Input on focus), on both Android and iOS. The Material active indicator's thickening is now absorbed by compensating padding so the field's content-box height stays fixed, matching the same fix already applied to `Select`.
