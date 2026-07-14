---
"@bnannier/canvas": minor
---

Reshape `Chip` to read as a chip, not a button, and give it a color axis.

A chip is a low-emphasis tag, so it no longer wears a saturated button fill: every
chip now renders a SOFT tint (a light wash + subtle border + strong text; reversed
in dark), the same recipe `Badge`'s status pills use, so the two read as one system.
The `primary` prop, which previously painted the full saturated primary fill (visually
identical to a primary `Button`), is now a soft brand-accent (indigo) tint and the
state a selectable chip lights up to.

A new color axis tints a chip with a boolean, in two families that both resolve to
the soft tint: semantic status (`success` / `warning` / `error` / `info` / `neutral`,
matching Badge) and free-form palette hues (`red`, `orange`, `amber`, `yellow`,
`lime`, `green`, `emerald`, `teal`, `cyan`, `sky`, `blue`, `indigo`, `violet`,
`fuchsia`, `purple`, `pink`, `rose`, plus `gray`). Status names alias a hue
(`success` → green, etc.). `outline` composes with any color for a border-only chip
in that hue, and a selectable chip lights up to its color's fill (or brand indigo
when it has none). A leading `<Icon />` and the remove "×" auto-tint to the chip's
label color, so a bare `<Icon check />` matches its chip without threading the color.

A chip is a compact tag, so it now has a single (small) size: the `small` prop and
the size axis are removed, and every chip renders at the former small size.

Also adds a `color` prop to `Icon`: an explicit glyph paint for hues the semantic
color booleans do not name (the semantic booleans still take precedence). It exists
so a component like Chip can tint its remove glyph to its own label color.
