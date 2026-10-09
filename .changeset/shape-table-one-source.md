---
"@nannier/canvas": patch
---

The shape table is the one source for a corner that plays a role. `shape.ios.checkbox` changes from 5 to 9999: the iOS checkbox has always drawn the edit-mode selection circle, and no surface ever drew 5. The skins whose corners play a shape role now read `shape` instead of repeating its numbers, with no rendered change. In `styles/tokens/platforms.css` the iOS `--p-check-radius` reads 9999px (the same circle as the 11px it replaces on the 22px box), and the iOS and Android `--p-overlay-radius` and `--p-sheet-radius` move from a stale 12px to the platform's dialog and sheet corners (28px and 38px on iOS, 28px and 28px on Android). DESIGN.md's Shapes table now lists every role per platform from the same table.

Comments in the skins and the CSS hand-off no longer name the brand Canvas replaced or call the violet `primary` indigo, and the numbers they state (corners, sizes, heights) match the code again. No rendered value changes with them.
