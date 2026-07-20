---
"@nannier/canvas": minor
---

Pagination gains an `itemCount` prop: when set, the compact and with-size indicator reads "Showing X-Y of N" (the item range on the current page) instead of "Page X of N". The with-size selector now also resets to page 1 when the page size changes, so the current page can no longer fall out of range after a reflow.
