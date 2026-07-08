---
"@olympusoss/canvas": patch
---

Route the open Popover's floating card through AnchoredOverlay so it portals over the page anchored below the trigger instead of rendering as an inline absolute panel, fixing the card being clipped and not painting inside a bounded stage.
