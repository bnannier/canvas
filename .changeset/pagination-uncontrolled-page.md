---
"@olympusoss/canvas": patch
---

Make Pagination interactive out of the box. Both the current page and the rows-per-page selector were controlled-only, so Prev/Next, the page numbers, and the size selector fired their callbacks but never moved. `page`/`pageSize` are now the controlled values, new `defaultPage`/`defaultPageSize` seed uncontrolled use, and both route through the shared controllable-state contract. A bare pagination now navigates and cycles page size on press (still firing `onChange`/`onPageSizeChange`).
