---
"@olympusoss/canvas": patch
---

Fix invalid nested interactive elements in ActionSheet.

The scrim was a button-roled `Pressable` that WRAPPED the whole sheet, so on the
web (where react-native-web renders a button-roled `Pressable` as a real
`<button>`) every action row and the Cancel row nested a `<button>` inside a
`<button>`: invalid HTML and an ambiguous, doubly-focusable a11y target. The
dismiss control is now an empty full-bleed `Pressable` rendered as a SIBLING
behind the sheet (lifted under the content with `zIndex`), so it keeps the same
button role + label a screen reader can reach while the action rows live in
their own subtree. Tap-to-dismiss, action-select-then-close, Cancel, and
hardware-back/escape behavior are unchanged.
