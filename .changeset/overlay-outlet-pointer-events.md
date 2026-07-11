---
"@olympusoss/canvas": patch
---

Fix the overlay outlet (and the toast stack and carousel arrow layer) swallowing every mouse click on the web.

These full-bleed layers set `pointerEvents: "box-none"` through an inline `{ pointerEvents }` style object so the layer itself is transparent to pointers while its portaled children still capture. react-native-web only compiles its `box-none` polyfill (the box `pointer-events: none`, its direct children `auto`) for styles registered via `StyleSheet.create`; an inline literal is dropped, leaving the layer at `pointer-events: auto`. The `OverlayProvider` outlet is a `z-index: 1000` layer covering its whole host, so on web it blanketed every screen and no button, link, or trigger under it received a real mouse click (synthetic `.click()` bypassed the hit test, so tests did not catch it). Moving `box-none` into `StyleSheet.create` styles restores click-through on web; native already honored it either way.
