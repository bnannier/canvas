---
"@nannier/canvas": minor
---

Navbar: new `onMenu` prop. An app with more destinations than a bar can hold passes it, and the bar leads with a menu button at every width that calls it, so the app opens its own navigation (such as a Drawer of grouped sections) in place of the `links` row and its narrow menu.

Minor justification: a new public option on an existing component (`NavbarProps.onMenu`); existing bars are unchanged.
