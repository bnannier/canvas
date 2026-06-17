---
"@olympusoss/canvas": patch
---

Fix Spinner not spinning on iOS under the New Architecture.

The previous fix (v5.4.0) gated the rotation loop's `useNativeDriver` on
`supportsNativeDriver`, which is `true` on native. That resolved the
react-native-web freeze but not iOS: under the New Architecture an
`Animated.loop` with `useNativeDriver: true` does not advance, so the iOS and
Android spinner skins (which interpolate the loop value to spin their shape) sat
frozen. Run the loop on the JS driver (`useNativeDriver: false`) on every
platform, which loops correctly everywhere; a 900ms spinner is cheap on the JS
thread. `supportsNativeDriver` remains exported for gating the driver on one-shot
(non-looping) animations, with updated guidance that loops must always use the JS
driver.
