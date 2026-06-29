---
"@olympusoss/canvas": minor
---

Command: add a search mode. Supplying `value` + `onValueChange` turns the search row into an editable field; results can carry a per-item `description` (a muted second line); `emptyLabel` shows a no-results state; the result list scrolls; and web gets arrow/enter/esc keyboard navigation over the flat list. Pass `overlay` to self-present as a responsive Modal (a centered palette on desktop, a bottom sheet on mobile, with a scrim, escape, and Android hardware-back). All additive: existing display-only usage (`groups` + `active`, with or without `trigger`/`footer`) is unchanged.
