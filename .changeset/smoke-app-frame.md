---
"@nannier/canvas": patch
---

Smoke app: the root layout is a Canvas AppFrame (the Navbar in its banner, the router Stack as its body) and every screen a Canvas Page, so the app hand-rolls no frame; the menu Drawer uses its own `navigation` body instead of a ScrollView. Page content now caps at the `widest` step (1152) instead of 1120.
