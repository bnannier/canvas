---
"@olympusoss/canvas": minor
---

Input: absorb InputGroup's addons; deprecate InputGroup

`Input` now accepts the addon props that used to live on `InputGroup` (`prefix`,
`suffix`, `leadingIcon`, `trailingIcon`, `icon`, `action`, `onActionPress`). When
any addon prop is present, Input renders the grouped layout (a shared border with
squared joined edges, overlaid icons, and an optional pressable action button);
otherwise it renders the bare field as before. This collapses the two components
into one that owns the field, its addons, and the focus/error border, removing a
duplicated TextInput implementation.

`InputGroup` is deprecated and now a thin alias for `Input`, kept for backward
compatibility and scheduled for removal in a future major. The props are
identical, so migrate `<InputGroup …/>` to `<Input …/>` directly.
