---
"@olympusoss/canvas": patch
---

Fix invalid button-in-button nesting in `Chip`. When a chip was both interactive
(`onPress` / `selectable`) and removable (`onRemove`), the remove "×" button rendered
inside the toggle button, which is invalid `role="button"` inside `role="button"` on
the web and let a remove press bubble to the toggle. The interactive-and-removable
chip now renders the toggle body and the remove control as two sibling buttons inside
a plain pill shell, so pressing "×" removes without also toggling, and each control is
its own accessible button. The visual pill is unchanged.
