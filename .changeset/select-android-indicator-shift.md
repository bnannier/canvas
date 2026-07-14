---
"@nannier/canvas": patch
---

`Select`'s Android trigger no longer nudges its value text up when the option list opens: the Material active indicator's 1dp to 2dp thickening is now absorbed by compensating padding, so the content-box height stays fixed and the centered value text does not move.
