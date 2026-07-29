---
"@nannier/canvas": minor
---

`Card` now renders its header and footer sections beside raw children.

Minor rather than patch because this is a new user-visible capability: a card
can express a titled header, an icon, a header action and a footer ABOVE
arbitrary children (a data table, a form, a list). Previously those props were
silently dropped the moment children were passed, and the header only rendered
on the data-driven path, where the body has to be a `string`.

Backward compatible. A plain card, one with children and no section props, is
untouched down to its computed surface style; the data-driven string path is
unchanged; and children still win over a string `body` when both are passed.

A sectioned card pads through its sections rather than its surface, so `padded`
and the density booleans do not apply there and now emit a dev warning instead
of being silently ignored.
