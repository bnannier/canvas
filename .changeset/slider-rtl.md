---
"@nannier/canvas": patch
---

`Slider` is now right-to-left aware. In an RTL locale (`I18nManager.isRTL`) the fill
and thumb mirror so the minimum sits on the right, a physical tap maps to the
mirrored value, and the horizontal arrow keys reverse (ArrowRight always moves the
thumb visually rightward, per APG) while Home/End and the vertical arrows keep their
logical meaning. LTR rendering is unchanged.
