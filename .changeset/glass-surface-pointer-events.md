---
"@nannier/canvas": patch
---

A glass surface's `pointerEvents` of `box-none` or `box-only` now holds on the web. GlassSurface wrote the value as an inline style, which React Native Web passes straight to CSS, where `box-none` and `box-only` are not values, so the browser dropped them and the surface took every tap; it now resolves the four values through registered styles, which React Native Web compiles to the box and its children as React Native means them. Every kit caller passes `none`, which already worked, so nothing in the kit changes on screen; iOS and Android are unchanged.
