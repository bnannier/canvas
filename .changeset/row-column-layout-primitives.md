---
"@nannier/canvas": minor
---

Add `Row` and `Column` layout primitives. They own arrangement through semantic
boolean axes so call sites never hand-roll `flexDirection`, `gap`, or
`alignItems`: a gap scale (`flush`/`tight`/`snug`/`cozy`/`relaxed`/`loose`),
main-axis distribution (`start`/`center`/`end`/`between`/`around`/`evenly`),
cross-axis alignment (`alignStart`/`alignCenter`/`alignEnd`/`baseline`/`stretch`),
`wrap`/`fill`/`grow`, and a padding scale (`padTight`/`pad`/`padLoose`). Layout is
a Shared platform treatment (flexbox is identical on iOS, Android, and the web).
