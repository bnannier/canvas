---
"@nannier/canvas": major
---

Form is now a composition surface, and the Field and Fieldset molecules are removed.

BREAKING CHANGES:

- `Form` no longer takes `fields` / `sections` / `checkboxes` arrays and no longer
  collects values: stitch your own field atoms as children and keep their state;
  `onSubmit` is a plain callback with no payload. Form contributes the stacked
  rhythm, the `twoColumn` flow that collapses on phones, the submit/cancel actions
  row, form semantics, and Enter-to-submit on the web. The `FormField` and
  `FormCheckbox` types are gone, and `FormSection` is now a component (title +
  description + children with group semantics), no longer a data type.
- `Field` is removed. For a labeled editable field, use `Input`'s own `label`
  (with `required`, `error`, and addons); for read-only label/value rows, use
  `DescriptionList`, which now also covers Field's rich value slots.
- `Fieldset` is removed. Group form controls with `FormSection` inside a `Form`,
  and name a set of radios with `RadioGroup`'s new `label`.

New capabilities:

- `FormSection`: a titled, described `role=group` section unit inside a Form.
- `RadioGroup` gains `label` (the group heading and accessible name) and
  `description`.
- `DescriptionList` items gain `copyValue` (a ghost Copy button feeding the new
  list-level `onCopy`) and `avatars` + `overflow` (an overlapping AvatarGroup
  value with a "+N" chip), completing the migration path from Field's display
  mode.
