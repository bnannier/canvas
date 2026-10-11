---
"@nannier/canvas": patch
---

`Entrance` and `EntranceProps` are deprecated aliases (the owner's K12-2 decision): both keep working until a major, and their `@deprecated` text names what to use instead. Entrance is the readiness hold every anchored card (Popover, Dropdown, Select, Autocomplete and the rest) applies to its own card until its placement is measured, so use those components rather than the hold itself.
