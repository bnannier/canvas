---
"@bnannier/canvas": minor
---

`FilterPanel` selection is now controllable. New `value` / `defaultValue` props (the
keys of the checked options) let a parent drive, sync (e.g. from a URL query), or
reset the selection, and a new `onSelectionChange` fires the full set of checked keys
on every change. Each option gains an optional `value` for a stable key (it defaults
to `"groupIndex:optionIndex"`). This is additive: the existing per-toggle `onChange`,
`onClear`, and `option.checked` seeding all keep working, so uncontrolled panels are
unchanged.
