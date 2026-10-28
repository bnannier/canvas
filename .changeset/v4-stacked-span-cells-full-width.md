---
"@nannier/canvas": patch
---

A stacked `Row stacks` gives every span cell the whole line, as Bootstrap's `col-12` does. A Row's alignment (`alignStart`, `alignCenter`) is its cross axis; once the Row stacked into a column it turned into a horizontal hug, so span cells shrank to their content instead of filling the line.
