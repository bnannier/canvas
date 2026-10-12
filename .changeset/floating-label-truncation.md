---
"@nannier/canvas": patch
---

A long Android floating label stays inside its field. On Input, Textarea, Select and Autocomplete it is now bounded by the field's end padding, or by Select's chevron and Autocomplete's toggle, and truncates on one line with an ellipsis; it ran out of the field before, across Autocomplete's toggle and cut at Select's edge. The field's accessible name stays the whole label.
