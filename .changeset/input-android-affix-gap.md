---
"@bnannier/canvas": patch
---

Fix the oversized gap between an `Input` prefix/suffix affix and its value on the
Android (Material 3) skin.

The grouped (addon) layout gave the Android prefix/suffix box its own `16dp`
horizontal padding plus a `1px` divider, on top of the inner field's own `16dp`
inset, leaving a ~`33dp` void between the affix (e.g. `https://`) and the value.
Because the addon box and the field share the same `muted` fill, that read as a
large empty gap rather than a distinct segmented box.

Material 3 renders prefix/suffix as inline affix text that shares the field
surface (no separate fill, no divider) with the value following directly. The
Android skin now matches that: the affix keeps the `16dp` container inset but
drops the divider, and the field zeroes its padding on the affix side, leaving an
`8dp` gap (the same tight inline affix iOS already used). The web skin's
segmented input-group look is unchanged.
