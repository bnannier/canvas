---
"@olympusoss/canvas": minor
---

Dropdown: support a custom trigger via `children`

`Dropdown` now accepts `children` as a custom trigger, rendered in place of the
default outline button (still available via the now-optional `trigger` label).
The children are wrapped in a Pressable that toggles the menu, so a rich trigger
such as an avatar account chip in a topbar can open the menu; the rows still come
from `items`. Backward-compatible: existing `trigger="…"` usage is unchanged.

The menu also now matches the trigger's width (measured on layout), growing past
it for longer rows and floored at a comfortable minimum for small triggers. A
wide trigger like an account chip gets a menu of the same width instead of a
fixed-width card.
