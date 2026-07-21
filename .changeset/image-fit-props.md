---
"@nannier/canvas": minor
---

Image: replace the React Native `resizeMode` prop with boolean fit props. `Image` graduates from a raw react-native re-export into a Canvas atom that wraps RN's Image and picks the fit with a boolean prop (the kit's variant convention), rather than a `resizeMode` string: `contain`, `cover`, `stretch`, `center`, `repeat`, `none` (default `cover`; when more than one is set, first match wins). Every other RN Image prop (`source`, `style`, `accessibilityLabel` / `alt`, `onLoad` / `onError`, `blurRadius`, and the rest) forwards through untouched. Because of this, `Image` leaves the re-exported primitives set (now `View`, `Text`, `Pressable`, `TextInput`, `ScrollView`) and is documented as an atom; Avatar's internal photo rendering now uses the new atom with `cover`. Callers passing `resizeMode` should switch to the matching fit prop.

Image also gains semantic sizing and rounding props so a call site never reaches for a raw `style` object: `width` and `height` size the image box (a number, or a percent string), and `radius` rounds the corners from the kit's radius scale (`none`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`, `full`) instead of a raw `borderRadius`. `style` stays available for composition only (aspect ratio, layout within a parent).
