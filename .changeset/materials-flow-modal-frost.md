---
"@nannier/canvas": patch
---

The native materials smoke opens the material Drawer and a new material ActionSheet in glass on Android and reads the capture counters while each is open (a capture host active and a frost view retained, through `GlassModalBlurTarget`) and again after each closes (idle, still in glass), and Back dismisses the sheet. The fixture gains the ActionSheet, an inspector inside the drawer and a card under a `GlassModalBlurTarget` placed in the page, whose refused plane must leave no frost mounted. Repository tooling only; nothing in the package changes.
