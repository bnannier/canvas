---
"@olympusoss/canvas": patch
---

Float the Select option list instead of expanding it in place

When opened, Select's option list now floats above the content beneath it
(absolute, anchored under the trigger) rather than expanding in-flow and pushing
following content down. This matches Combobox and every other Canvas menu, so an
open Select no longer reflows the surrounding form. The trigger, sizing, options,
and selection behavior are unchanged.
