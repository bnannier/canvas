---
"@olympusoss/canvas": minor
---

ButtonGroup: the split kind now opens a dropdown menu

The `split` kind's secondary control is now a chevron that toggles a floating
dropdown of related actions, instead of a plain second button. Pass the actions
via the new `menu?: string[]` prop:

```jsx
<ButtonGroup split items={["Save"]} menu={["Save as draft", "Save and close", "Save a copy"]} />
```

The chevron's menu floats (absolute) so it overflows the group rather than
growing it. When `menu` is omitted it falls back to a sensible default. Note:
the split kind no longer renders `items[1]` as a secondary label, the chevron
replaces it, so split callers should move that second action into `menu`.
