---
"@bnannier/canvas": patch
---

Make Listbox selection interactive out of the box. Selection was expressed only through each item's `selected` flag with no internal state, so pressing a row fired `onSelect` but never changed what was selected. Selection now routes through the shared controllable-state contract: new top-level `selected` (controlled) and `defaultSelected` (uncontrolled) props accept a single index (single-select) or an index array (multi-select), a new `onChange` fires with the full selection, and the per-item `selected` flags still seed the uncontrolled default. Pressing a row now selects it (single) or toggles it (multi); existing examples become interactive with no code change.
