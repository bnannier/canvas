---
"@nannier/canvas": patch
---

Tabs: a non-block underline/pills row longer than its container now pans
horizontally instead of clipping (an inert-when-fitting horizontal scroller,
no new prop; effective at any container width). Selecting a tab by press,
roving arrow key, or a controlled `active` change scrolls it fully into view
with a neighbor peek, honoring reduced motion. `block` and `vertical` are
unchanged, and a flattened `responsive` vertical gains the same treatment.
