---
"@nannier/canvas": patch
---

In a right-to-left layout the Android floating label of Input, Textarea, Select and Autocomplete now floats with its leading edge pinned. It scaled around the physical left while it sits at the logical start, the right, so its leading edge drifted inward by a quarter of its width.
