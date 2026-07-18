---
"@nannier/canvas": patch
---

AnchoredOverlay: skip the hosted dismiss backdrop when dismissal is a no-op. A controlled `open` with no `onOpenChange` (an overlay pinned open) previously portaled a full-bleed backdrop that swallowed every tap under an overlay that could never close; Dropdown, Popover, Select, Autocomplete, RowMenu, and Command now pass the new `dismissable` flag so the backdrop only renders when an outside tap can actually close the card.
