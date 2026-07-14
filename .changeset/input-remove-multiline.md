---
"@nannier/canvas": major
---

Remove the `multiline` prop from `Input`; use the dedicated `Textarea` atom for multi-line entry.

`Input` used to double as a text area when passed `multiline`, overlapping the
first-class `Textarea` atom (its own shape, sizing, `rows`, and `flush`
variant). Two components rendered the same thing, which blurred which one to
reach for and duplicated the multi-line sizing logic across both. `Input` is now
single-line only: `multiline` is gone from `InputProps`, and the skins drop
their multiline min-height branches.

Migration: replace `<Input multiline ... />` with `<Textarea ... />`. The
Textarea takes the same `value`/`onChangeText`/`placeholder`/`error`/`disabled`
props plus `rows` for the visible height, so most call sites change only the tag
name. This is a breaking change to `Input`, hence the major bump.
