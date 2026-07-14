---
"@nannier/canvas": patch
---

Fix the iOS and Android Spinner skins leaking a `collapsable={false}` prop onto the `<svg>` DOM node on web (React logged "Received `false` for a non-boolean attribute `collapsable`" on every render): the skins now wrap a plain `Svg` in an `Animated.View` that carries the rotation, instead of animating the `Svg` itself with `Animated.createAnimatedComponent`, which forced the native-only `collapsable` prop through react-native-svg to the DOM. The spinner still rotates identically.
