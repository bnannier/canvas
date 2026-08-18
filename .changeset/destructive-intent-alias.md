---
"@nannier/canvas": minor
---

Alert, Chip, and Toast take `destructive` for the danger tone.

New user-visible capability (the reason this is a minor, not a patch): `destructive` is the name the intent axis already uses everywhere else in the kit, on Button, on AlertDialog, and on every chart, and it is the name the design hand-off uses on these three components too. Until now these three alone spelled it `error`, so a call site moving between a destructive Button and a destructive Alert had to change vocabulary mid-form.

`error` keeps working, marked deprecated, and resolves through the same branch as `destructive`, so it paints exactly the same tone and no existing call site changes. Passing both is redundant rather than ambiguous: they share one branch, so the result is the danger tone either way, and the rest of the axis (`success`, `warning`, `info`, and the neutral default) is untouched.
