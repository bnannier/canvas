---
"@nannier/canvas": minor
---

Menu and nav rows now render real Canvas `Icon` glyphs instead of raw emoji/symbol
characters, so every icon in the kit comes from the kit's own icon set.

`Dropdown`, `Command`, `Sidebar`, and `RowMenu` each took an item `icon` typed as a
free `string` that was painted as a literal glyph (`"👤"`, `"⚙"`, `"✎"`, `"🗑"`, …). That
was a hand-rolled non-Canvas icon: it ignored the theme, never matched the `Icon` stroke
weight, and rendered differently per platform font. Those `icon` fields are now typed as
`IconName` (the union of Canvas glyph names) and rendered through the `Icon` atom, tinted
to the row (destructive rows go red, active sidebar rows carry the brand tint) and sized
per platform. `RowMenu`'s `⋯` trigger is likewise the Canvas `moreHorizontal` glyph now.

New `Icon` glyphs to cover the common menu actions: `pencil` (edit), `logOut` (sign out),
and `save`. The kit also exports a new `IconName` type (the glyph-name union, derived from
`IconProps` so it can never drift from the real set).

Migration: replace emoji in menu/nav `items` with a Canvas glyph name, e.g.
`{ label: "Sign out", icon: "logOut" }` instead of `icon: "↩"`, and
`{ label: "Delete", icon: "trash", destructive: true }` instead of `icon: "🗑"`. Any
glyph in the `<Icon set />` gallery is a valid name.
