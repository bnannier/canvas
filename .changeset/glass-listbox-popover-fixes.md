---
"@nannier/canvas": patch
---

Two glass-mode fixes:

- Listbox's `bordered` container now uses the solid `card` fill instead of
  `popover`. Listbox is an inline content-layer list, so it must stay opaque under
  glass (it was rendering a translucent fill with no material behind it). No change
  in solid mode, where `card` and `popover` are identical.
- The Popover beak is now omitted under glass. A flat token-filled beak cannot match
  the Liquid Glass material, and a beak-less rounded card is how iOS 26 menus read.
  The beak was already clipped away under glass; this makes the intent explicit.
  Solid mode is unchanged and keeps the beak.
