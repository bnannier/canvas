---
"@nannier/canvas": patch
---

The test suite now renders GlassSurface's Android material paths (canvas-blur's capture frost in an overlay and expo-blur's frost, with stand-ins for the native views), which before ran only on a device, and holds the specular rim the Android host draws: a tall surface's rim in bands from its first render and a short one's whole. The comments that named iOS 26 for measurements taken on the iPhone simulator's iOS 27 runtime (the rim's band limit, GlassPane's inert interactive glass) now name iOS 27. Repository tests and comments only; nothing in the package changes.
