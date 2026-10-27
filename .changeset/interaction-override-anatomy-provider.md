---
"@nannier/canvas": minor
---

Two docs-specimen seams. `InteractionOverride` pins hover (`hovered`), keyboard focus (`focused`) or the pressed state (`pressed`) for every kit control in its subtree, through the hover primitive, the kit Pressable's focus ring and press state, and a field's own focused look, so Button, Input, Checkbox, Switch, Pagination and the rest show the pinned state with no prop of their own; it pins the look only, leaves a disabled control at rest, and costs a context read without a provider. `AnatomyProvider` reports the rectangles of the named parts of the components inside it, relative to its own box, through `onMeasure`; Button registers its `Container`, `Label`, `Leading icon`, `Trailing icon` and `Count badge`. Minor: new public components `InteractionOverride` and `AnatomyProvider` with their props and rectangle types.
