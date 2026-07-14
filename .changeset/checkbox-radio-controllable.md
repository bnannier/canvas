---
"@bnannier/canvas": minor
---

`Checkbox` adopts `useControllableState` (`defaultChecked`; a bare
`<Checkbox />` now toggles out of the box) and gains `testID`. `Radio` gains
`testID`; it stays controlled-only because a radio has no self-contained
toggle semantics (the group owns which option is selected).
