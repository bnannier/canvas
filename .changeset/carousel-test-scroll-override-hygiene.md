---
"@nannier/canvas": patch
---

The carousel slide-identity test takes its `HTMLElement.prototype.scroll` override off again by property descriptor instead of assigning the saved function back, which left an own `scroll` on the prototype that shadowed the anchored-overlay suite's `Element.prototype.scroll` spy whenever CI's file order ran the carousel file first (Deploy runs 39610128823 and 39611676187: the option list's entry reveal "saw no scroll"). Test only; nothing in the package changes.
