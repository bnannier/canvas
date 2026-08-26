---
"@nannier-com/canvas": patch
---

`check-parity` now fails on a DEAD RECORD: a divergence recorded for a prop the
kit already declares under the hand-off's own name, or for a component the kit
already exports.

A divergence is consulted only while the hand-off prop is ABSENT from the kit, so
shipping the capability makes its record unreadable, and the report row simply
disappears on the next regeneration with nothing pointing at the record left
behind. Six have been deleted by hand in two sweeps (`Tooltip.children`,
`Input.onBlur`, `Input.maxLength`, `Textarea.maxLength`, `ActionPanel.children`,
`Navbar.actions`), and every one had gone false by the time it was found, still
denying a capability the kit shipped. This is the same guarantee the broken
redirect guard gives from the other end: that one catches a record naming a prop
the kit lacks, this one a record about a prop the kit has.

Scoped to claims about the kit. A `global` record is the fallback for any
component prop no component-level record claims, so being unread is its resting
state, and a record under a component the kit has not shipped stays live for the
day it lands.

Tooling only, with no runtime effect. `HANDOFF-PARITY.md` picks up a paragraph
describing the new guard; the counts are unchanged (733 props compared, 526
present, 151 settled, 56 open gaps).
