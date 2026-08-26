---
"@nannier/canvas": patch
---

Four dead open-gap records are removed from the hand-off parity ledger
(`tools/handoff-parity/divergences.json`): `Tooltip.children`, `Input.onBlur`,
`Input.maxLength` and `Textarea.maxLength`.

Every one of those props is declared on its component's props interface today.
`Tooltip.children` shipped in "feat(tooltip): arbitrary element trigger", and the
three field props come in through the `TextEntryProps` slice that `InputProps`
and `TextareaProps` both extend. `check-handoff-parity.ts` reads a divergence
record only when the hand-off prop is ABSENT from the kit, so none of the four
had been consulted for some time; they sat in the file claiming a capability was
missing while the kit shipped it. `Tooltip.children`'s reason was the loudest
about it, asserting that Canvas's Tooltip "cannot attach to a caller's node".

Tooling data only, with no runtime effect: `HANDOFF-PARITY.md` regenerates
byte-identical, because a record the check never reads never reached the report.
Phase 4's validation work stays tracked through the props that really are absent
(`Input.validate`, `validateOn`, `messages`, `submitted`, `showValid`,
`onValidate`, `minLength`, `pattern`, `min`, `max`). The now-empty `Textarea`
component key goes with its last record.
