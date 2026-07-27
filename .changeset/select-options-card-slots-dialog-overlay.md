---
"@nannier/canvas": minor
---

Three capabilities the kit was missing, each found by building a real app against
it rather than by reading the catalogue.

**`Select` accepts `{ value, label }` options.** It previously took `options:
string[]`, so the stored value was always the visible text. Any list keyed by an
id (a project id, a region slug, a workspace name) could not be expressed, and
two separate apps grew the same wrapper independently. Bare strings still work
and still mean the value is the label, so this is backward compatible.

**`Card` gained `icon` and `actions` header slots.** `Card` already carried
`title` and `description`; what consumers kept rebuilding around it was a leading
glyph and a trailing action in the same header row.

**`Dialog` gained an `overlay` presentation.** The existing dialog renders inline
in normal flow with a scrim sized for the docs preview, which is right for the
catalogue and wrong for an application: it appends a backdrop wherever the
component happens to be mounted, leaves the page behind scrollable and clickable,
and still asserts `aria-modal`. In a consumer app that meant a delete
confirmation appearing at the bottom of the page while the page behind it stayed
interactive. With `overlay`, the dialog teleports into the nearest
`OverlayProvider` and fills it, so `aria-modal` is true rather than aspirational.
The contained behaviour is unchanged and remains the default; with no provider in
the tree an overlaid dialog still renders in place rather than vanishing.
