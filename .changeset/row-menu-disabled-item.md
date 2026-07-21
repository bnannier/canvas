---
"@nannier/canvas": minor
---

RowMenu items gain a `disabled` field. Set `disabled: true` on a `RowMenuItem` for an action that is unavailable in the current context (for example "Clear column" on an already-empty column): the row dims to the kit's disabled opacity, does not fire `onSelect`, keeps the menu open, drops its Android ripple, and is announced as disabled (`accessibilityState` plus the `aria-disabled` alias for web screen readers). Previously a caller had to omit the item or short-circuit to a toast; now the affordance stays visible but inert.
