---
"@nannier/canvas": patch
---

The touch-target and press-feedback helpers are deprecated aliases (the owner's K12-2 decision): `TOUCH_TARGET`, `platformMinTarget`, `minTargetSlop`, `useMinTargetSlop`, `TouchTargetSkin`, `MinTargetOptions`, `pressDim`, `controlRipple`, `surfaceRipple`, `rippleClip` and `platformDisabledDim`. Each keeps working until a major. Nothing replaces them: every kit control shows the platform's press feedback and meets the 44 pt and 48 dp minimum touch target itself (Button, an icon Button included, Chip, and Avatar, Card and the list rows given `onPress`), and a control the kit lacks belongs in the kit, never in a hand-built Pressable. DESIGN.md and Button's Touch area section no longer present them for building your own control.
