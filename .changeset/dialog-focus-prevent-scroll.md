---
"@nannier/canvas": patch
---

Dialog, AlertDialog, and Popover no longer scroll the page when they open. Their
focus management now moves focus into the panel with `focus({ preventScroll: true })`,
so a modal that opens (or a `<Dialog open>` rendered inline mid-page) keeps focus for
accessibility without yanking the surrounding scroll container to the panel.
