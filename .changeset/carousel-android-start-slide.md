---
"@nannier/canvas": patch
---

A Carousel with a `defaultIndex` (or a controlled `index`) past the first slide now shows that slide on Android when it first measures, instead of the first slide under a page indicator that names the right one. Android's scroll view capped the opening scroll at the content's unmeasured width, and the Carousel counted it as done; it now issues the scroll again once the content size reports every slide's width.
