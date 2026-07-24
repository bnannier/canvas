---
"@nannier/canvas": patch
---

Fix the Drawer sliding in from the wrong side on the web (a left drawer opened
"backward", sliding leftward into the edge instead of entering from off-screen
left). React Native Web's `I18nManager` has no direct `isRTL` property, so
`I18nManager.isRTL` read `undefined` on the web and the direction comparison
`(edge === "right") !== I18nManager.isRTL` was always true, forcing every side
drawer to the right-hand slide origin. All RTL checks now route through a new
shared `isRTL()` helper backed by `I18nManager.getConstants().isRTL`, which is
implemented on both native and web. This also corrects the same latent web bug in
Dropdown, Listbox, Slider, Tabs, and Breadcrumb, whose right-to-left handling was
silently skipped on the web.
