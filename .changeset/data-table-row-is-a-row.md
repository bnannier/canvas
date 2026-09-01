---
"@nannier-com/canvas": patch
---

DataTable: a pressable row is a row, not a button

`onRowPress` rolled the data row `button`, which react-native-web renders as a
real `<button>`. That stranded every `role="cell"` outside a row, so the table
stopped reading as a table (`aria-required-parent`, `aria-required-children`),
and it swallowed every control the row carried: the kit's own select checkbox,
and anything a caller put in a cell. A row menu in a cell became a `<button>`
inside a `<button>`, which is invalid DOM and logs a React nesting error on
every row (found on the Ionize console's Identities table).

The row is now always `role="row"` and keeps the press as a pointer convenience
outside the accessibility tree, so clicking anywhere on it still acts. The
action itself moves to a real button inside the row's first data cell, named
from the row's plain text cells (or, when the row has none, by that cell's own
content). It is a sibling of everything else in the row, so nothing nests, the
row is one tab stop, and a screen reader announces it as the row's action.

Callers passing `onRowPress` should keep their own controls out of the first
column, which is where the activator goes.
