---
"@nannier/canvas": patch
---

The arrow keys of a RadioGroup no longer select a disabled Radio: its arrows, Home and End walk past a disabled option in their direction of travel, and a disabled option is never the group's tab stop, so a group whose selected option is disabled still has one (the first enabled option), as a browser's own radio group does. Tabs keeps the same rule, now from the shared roving-focus behaviour, and a disabled active tab hands the tab stop to the first enabled one instead of leaving the row unreachable by Tab.

For code still on the deprecated `useRovingFocus`, its `RovingFocusOptions` gains an optional `isDisabled(index)` that carries this rule: the item it names is skipped by the arrows, Home and End and is never the web tab stop. The change is additive. A call without it moves as before, except at two edges: an active index outside the group now leaves the first item as the tab stop (before, it left none), and an arrow at an end without `loop` no longer activates the end item again.
