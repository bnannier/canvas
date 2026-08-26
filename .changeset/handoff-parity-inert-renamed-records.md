---
"@nannier/canvas": patch
---

Two more dead records leave the hand-off parity ledger
(`tools/handoff-parity/divergences.json`): `ActionPanel.children` and
`Navbar.actions`.

Both were `renamed` records, and both are false about the kit as it ships today.
`ActionPanel.children` claimed the hand-off's body slot is spelled `description`
here; ActionPanel has carried its own `children` slot since
"feat(action-panel): support embedded children", under the hand-off's own name
and for the hand-off's own purpose. `Navbar.actions` claimed the trailing
controls arrive as `actionLabel` plus `onAction` "rather than a ReactNode";
`NavbarProps.actions` is a ReactNode slot, added in "feat(navbar): brand element
and trailing actions slots". The report was refreshed when those props landed,
which dropped their two rows, but the records themselves stayed behind: the check
consults a divergence only when the hand-off prop is ABSENT from the kit, so
neither had been read since.

This is the same rot the four dead open-gap records carried, in the settled half
of the ledger: a record nothing reads still reads as current adjudication to
anyone opening the file. Tooling data only, with no runtime effect.
`HANDOFF-PARITY.md` regenerates byte-identical (733 props compared, 526 present,
151 settled, 56 open gaps), because a record the check never reads never reached
the report.

The two remaining unreachable records, `global.value` and `global.defaultValue`,
stay: a global record is a fallback for any component whose hand-off prop no
component-level record claims, so it is unread whenever every such prop happens
to be adjudicated elsewhere, not wrong.
