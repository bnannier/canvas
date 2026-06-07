---
"@olympusoss/canvas": minor
---

Dropdown: support a custom trigger via `children`

`Dropdown` now accepts `children` as a custom trigger, rendered in place of the
default outline button (still available via the now-optional `trigger` label).
The children are wrapped in a Pressable that toggles the menu, so a rich trigger
such as an avatar account chip in a topbar can open the menu; the rows still come
from `items`. Backward-compatible: existing `trigger="…"` usage is unchanged.
