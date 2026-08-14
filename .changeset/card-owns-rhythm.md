---
"@nannier/canvas": minor
---

Card owns its rhythm: a padded surface now also spaces its flat children (padding implies gap), so a stack of Typography lines inside a Card needs no layout wrapper. The gap follows the platform density table: 16 on web and iOS, 12 on Android at the default density (the compact and comfortable steps already carried their own). `CardContent` picks up the same 16px flat-child rhythm. `flush` opts out of both the inset and the gap, sectioned cards are untouched (their sections pad themselves), and a single-child card renders pixel-identical since gap is inert with one child.

Minor justification: new user-visible layout capability on the public Card API; padded cards and CardContent now space flat children without a Row or Column wrapper.
