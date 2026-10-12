---
"@nannier/canvas": patch
---

The arrow keys of a RadioGroup no longer select a disabled Radio: its arrows, Home and End walk past a disabled option in their direction of travel, and a disabled option is never the group's tab stop, so a group whose selected option is disabled still has one (the first enabled option), as a browser's own radio group does. Tabs keeps the same rule, now from the shared roving-focus behaviour, and a disabled active tab hands the tab stop to the first enabled one instead of leaving the row unreachable by Tab.
