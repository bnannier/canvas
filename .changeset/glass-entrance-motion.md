---
"@nannier/canvas": minor
---

Glass overlays now animate open, following Apple's Liquid Glass "morph between
related states": anchored menus (Select, Dropdown, Combobox, Popover, Row-menu,
Button-group split menu) pop open from the trigger's corner, and Dialog / Alert
Dialog scale-fade into place. The animation is one-shot (transform + opacity, native
driver where available) and is skipped under Reduce Motion, which renders the final
frame statically. Adds an internal `Entrance` primitive. Close/exit stays instant.
