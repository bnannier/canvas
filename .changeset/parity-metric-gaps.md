---
"@nannier/canvas": patch
---

Hand-off parity: record the differences the check cannot detect, and state that limit in the report.

`check-parity` compares the prop SURFACE. Where a name exists on both sides it counts the prop
satisfied no matter what that name resolves to, so a scale or spacing drift passes silently. That
blind spot is now written into the report rather than left implied, alongside the second limit:
the check reads a committed snapshot of the hand-off, so it cannot tell you the snapshot itself has
fallen behind the design source.

The first entry is Avatar. The kit's diameters are `tiny 24 / small 28 / default 40 / large 48`
against the hand-off's `small 24 / default 32 / large 40`, so the scale sits one step high
throughout. `small` and `large` exist on both sides, which is exactly why the prop check reported
them satisfied. It was found by measuring rendered avatars, not by this tool. Re-scaling shipped
avatars would be a visual break for every consumer, so it is tracked rather than done.

Patch: repository tooling and a generated report, no change to the published package.
