---
"@nannier/canvas": patch
---

Preview links may carry an optional look query (`scheme`, `surface`, `palette`), documented in the repo instructions beside the route-only default. The docs app's launch decisions move into pure helpers in `docs/src/theme/theme-links.ts` (`launchRequest`, `firstLook`, `withOverrides`, `EXPORTED_LOOK`), and unit tests now pin what a deep link paints: a cold iOS or Android launch starts in the link's look on its first render, the web hydrates in the exported look and lands in the link's look after, the launch URL wins an axis the router params also name, and a warm link moves a running app axis by axis while ordinary navigation never does. Repository tooling and docs only; nothing in the package changes.
