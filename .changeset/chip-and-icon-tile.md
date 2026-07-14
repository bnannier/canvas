---
"@bnannier/canvas": minor
---

Add `Chip` and `IconTile` atoms.

`Chip` is the interactive pill (filter chips, tags, selectable tokens): an
optional leading icon and label, tappable with `onPress`, and a trailing "×"
remove button with `onRemove`, so no call site hand-composes a `borderRadius` +
`backgroundColor` + padding Pressable. Tone is a boolean axis (`secondary` /
`primary` / `outline`; `primary` is the active state).

`IconTile` is the tinted rounded square that holds a single `Icon` (the recurring
icon-on-a-soft-background in cards, media objects, empty states, and feeds). A
tone tints the square and paints the glyph to match, so no call site
hand-composes the icon background.
