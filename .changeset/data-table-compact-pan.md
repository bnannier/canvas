---
"@nannier/canvas": patch
---

DataTable pans horizontally in compact containers instead of crushing its columns: below the sm width (measured on the table itself), the header and body scroll together inside a horizontal scroller with a readable per-column minimum, matching the Material phone data-table treatment. The iOS skin keeps its collapse-to-primary-column behavior. Field's display-mode label column also gains a 45% max-width cap so narrow sidebar cards no longer overflow their copy rows.
