---
"@olympusoss/canvas": minor
---

Combobox supports uncontrolled selection and initial-open state.

Combobox previously treated `value` as read-only display: selecting a row fired
`onSelect` but never updated the shown selection, so a bare `<Combobox />` could
not actually pick an option. It now manages its own selection via
`useControllableState` (controlled when `value` is passed, self-managed
otherwise) and adds `defaultValue` for the uncontrolled case, so selecting a row
updates the field. A `defaultOpen` prop renders the list open initially while
staying interactive (the chevron or a selection closes it), alongside the
existing controlled `open`. Backward compatible: driving `value` / `open`
yourself works exactly as before.
