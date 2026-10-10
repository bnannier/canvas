---
"@nannier/canvas": patch
---

`AnchoredOverlay`, `AnchoredOverlayProps`, `placeOverlay`, `useOverlayAnchor` and `useOverlaySide` are deprecated aliases (the owner's K12-2 decision): kit internals published by accident, each keeps working until a major, and its `@deprecated` text names what to use instead (`Popover` for a floating card, `Dropdown`, `Select` or `Autocomplete` for a menu or an option list). AnchoredOverlay's contract is stated in its JSDoc (what it renders, what it never renders, its defaults); its reference page comes with the generated `/foundation` page.
