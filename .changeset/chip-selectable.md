---
"@bnannier/canvas": minor
---

Add a selectable (filter-toggle) mode to Chip. A chip's selected look is its `primary` fill, but that was a static prop, so a tappable filter chip fired `onPress` without ever toggling its own state. A new `selectable` prop turns the chip into a toggle that owns its selected state (controlled via `selected`, uncontrolled via `defaultSelected`, `onSelectedChange` fires the next value); pressing it flips between its base tone and the active `primary` fill and updates the pressed/selected accessibility state. Non-selectable chips are unchanged.
