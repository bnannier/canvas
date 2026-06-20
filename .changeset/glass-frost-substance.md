---
"@olympusoss/canvas": minor
---

GlassSurface: make the frost a substantial material, never near-clear. On web and
Android the expo-blur frost now paints over the kit's translucent `popover` frost fill
(instead of the blur alone), so a frosted surface reads as a real frost over a flat or
dark page rather than a clear hole. On iOS the real Liquid Glass switches from the
transparent `clear` style to Apple's default `regular` (which blurs and tints). Frost
mode now reads as a visible frost in both light and dark on every platform.
