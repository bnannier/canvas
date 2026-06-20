---
"@olympusoss/canvas": minor
---

DataTable: accept ReactNode cells

`DataTable`'s `rows` now accepts any `ReactNode` per cell, not just strings — so a
cell can be a link, a `Badge`, a monospace name, an icon, etc. String and number
cells still render in the default cell type; an element renders directly. Existing
`string[][]` rows are unaffected (a `string` is a `ReactNode`).

```tsx
<DataTable columns={["Name", "Status"]} rows={[
  [<Link key="n" href="/x">View</Link>, <Badge success key="s">Live</Badge>],
]} />
```
