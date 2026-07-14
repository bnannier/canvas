---
"@bnannier/canvas": major
---

Align the status/intent prop names across the kit (breaking).

- `Toast`: the danger intent is now `error` (was `destructive`), matching `Alert`,
  and a new `warning` intent (amber, with an alert-triangle glyph) joins it.
- `EmptyState`: the affirmative tone is now `success` (was `positive`).
- `Typography`: the affirmative text tone is now `success` (was `positive`); it
  already had `warning`, so its tone axis is now
  muted / subtle / primary / destructive / success / warning.

Each rename is name-only; the colors are unchanged (they already read the semantic
`success` / `destructive` / `warning` tokens). Migrate by renaming the prop at the
call site: `<Toast destructive>` becomes `<Toast error>`, `<EmptyState positive>`
becomes `<EmptyState success>`, `<Typography positive>` becomes `<Typography success>`.
