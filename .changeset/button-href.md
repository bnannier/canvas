---
"@nannier-com/canvas": minor
---

`Button` gains `href` and `hrefAttrs`: with `href` the web render is a real `<a>` (middle-click, new tab, crawlable, announced as a link), `hrefAttrs` forwards `target`/`rel`/`download`, native keeps `onPress` navigation, and a disabled or loading button suppresses the anchor. Minor because it is new public Button API: the kit's first link affordance, closing the long-standing "no link affordance" consumer gap.
