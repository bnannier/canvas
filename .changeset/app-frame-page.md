---
"@nannier/canvas": minor
---

Add AppFrame and Page, so an app no longer hand-rolls its screen frame. `AppFrame` is the app's root frame: it mounts the safe-area context and the app-root overlay host, pads all four safe-area edges over the theme background, renders an optional `header` in a `role="banner"` region and lets its body (a router's Stack) fill the height left. `Page` is one scrolling screen: a `role="main"` scroller that fills its parent, keeps taps while the keyboard is up, and caps and centers its content between page gutters at a step of the width scale (`widest` by default, any `MeasureProps` step, `start` or `fluid`), with its own overlay host, or a plain content box with `inheritOverlays` under an enclosing viewport host.

Minor justification: two new public components (`AppFrame`, `Page`, with `AppFrameProps` and `PageProps`) for app scaffolding: the safe area, the theme background, a banner header, and a scrolling page with a page measure and an overlay host. Existing components are unchanged.
