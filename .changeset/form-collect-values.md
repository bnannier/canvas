---
"@olympusoss/canvas": minor
---

`Form` now collects the values its composed inputs hold and hands them to `onSubmit`.
Previously a `Form` field with a `value` rendered a controlled input with no change
handler, so on react-native-web it was frozen (typing reverted every keystroke) and
`onSubmit` received nothing. The Form now owns the entered values internally: each
text field is editable, each checkbox is tracked, and `onSubmit(values)` is called
with a record keyed by each field/checkbox `name` (a new optional prop, falling back
to the visible `label`). Text fields yield their current string, checkboxes their
boolean. Adding the `values` argument to `onSubmit` is backward compatible.
