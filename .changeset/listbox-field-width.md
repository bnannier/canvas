---
"@olympusoss/canvas": minor
---

Listbox joins the standard field width axis (`block` / `narrow` / `wide`).

Listbox was the one input-like control that carried no width axis: its root
list `View` had no defined width. On the web, flexbox intrinsic sizing hid the
gap by shrinking the list to its content. On iOS and Android it did not: each
row is a fixed 16px checkmark gutter plus a `flexBasis: "0%"` label stack, and
in a content-sized or centered parent (a phone screen, a centered stage) Yoga
resolved that percentage basis against an indefinite width to zero with no free
space to grow into, so every label collapsed and only the checkmark strip
showed.

Listbox now extends `FieldWidthProps` like Input, Select, Combobox and
Textarea: it stands at the 320px base by default, takes `narrow` (240) / `wide`
(480), and fills its parent under `block`, always with `maxWidth: "100%"` so it
shrinks inside a narrower container. This gives the list a definite width on
every platform, which fixes the iOS/Android label collapse and makes stacked
listboxes share one edge with the other fields.
