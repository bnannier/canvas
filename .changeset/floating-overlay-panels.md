---
"@olympusoss/canvas": patch
---

Float overlay panels instead of rendering them in normal flow

Dropdown, RowMenu, Popover, Combobox, and Command (trigger mode) now render their
open panel as an absolutely positioned floating card anchored to the trigger (the
trigger wrapper is `relative`), instead of as an in-flow card that grows the
container. The panel overflows its container rather than stretching it, matching
how these overlays behave in a real layout. No API changes; the open state still
uses no portal/Modal, so a panel is clipped only by an ancestor with hidden
overflow.
