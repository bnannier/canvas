---
"@olympusoss/canvas": patch
---

Android: clip the Material ripple to each control's rounded outline. The native `android_ripple` paints a RippleDrawable bounded to the view's RECTANGLE, so on rounded controls the ripple bled past the corners and read as a square overlay. Every rounded node that carries a bounded ripple now sets `overflow: "hidden"` (clipToOutline) so the ripple is masked to the shape: Button, ButtonGroup segments, Pagination, Calendar day cells, Stepper circles, Tabs, Select/Combobox triggers, the stacked-list menu button, Toast action/dismiss chips, Dialog, RowMenu, Sidebar, Navbars, Stats cards, and Listbox rows. Nodes that also carry an elevation/shadow (tappable Card, the code-block copy chip) are clipped Android-only via a new `rippleClip()` style helper, so the native Android elevation shadow (drawn around the outline) survives while the iOS `shadow*` is left unclipped.
