---
"@nannier/canvas": minor
---

**Kbd composes whole shortcuts.** `Kbd` now takes a `keys` prop, so a chord is
one component instead of a `Row` plus a cap and a separator per key. Pass a
whitespace-separated string (`<Kbd keys="⌘ K" />`) or an array
(`<Kbd keys={["⌘", "⇧", "P"]} />`) and Kbd renders one cap per key with `+`
separators. Add `sequence` for a "press one, then the next" chord
(`<Kbd keys="⌘K ⌘S" sequence />`), which spaces the caps instead of joining them
with `+`. The whole shortcut is announced to assistive tech as a single
accessible name (e.g. "⌘+K"), and the individual caps are hidden as decorative.

`children` is unchanged and still renders a single cap (`<Kbd>Esc</Kbd>`), so
this is backward compatible. The `Command` palette trigger now uses
`<Kbd keys="⌘ K" />` instead of packing both keys into one cap.
