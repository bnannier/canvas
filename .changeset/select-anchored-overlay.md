---
"@bnannier/canvas": patch
---

`Select`'s open option list now renders through `AnchoredOverlay`, so it portals above the page and is no longer clipped by an overflow-hidden ancestor (or the docs preview scroller), while selection, controlled and uncontrolled open state, Escape dismissal, and the listbox/option roles stay unchanged.
