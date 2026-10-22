---
"@nannier/canvas": patch
---

Carousel: land on `defaultIndex` on Android every time. Before the viewport measures, native now lays the slides' content out as wide as every slide will be, so the scroll to the starting slide can no longer be capped by a content view that has not yet mounted its new width.
