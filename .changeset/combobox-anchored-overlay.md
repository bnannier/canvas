---
"@nannier/canvas": patch
---

`Combobox` now portals its open option list through `AnchoredOverlay` (the same
path `Dropdown` uses) instead of rendering an inline absolute panel. When an
`OverlayProvider` is mounted it floats over the page, anchored below the field,
so the list escapes overflow-clipping ancestors (e.g. a horizontal scroller like
the docs preview stage, or any `overflow: hidden` container in an app); with no
provider it falls back to the previous inline anchor below the field. The
typeable field, query filtering, keyboard, dismiss/Escape, and selection
behavior are unchanged.
