---
"@nannier/canvas": minor
---

Image: replace the React Native `resizeMode` prop with boolean fit props. `Image` graduates from a raw react-native re-export into a Canvas atom that wraps RN's Image and picks the fit with a boolean prop (the kit's variant convention), rather than a `resizeMode` string: `contain`, `cover`, `stretch`, `center`, `repeat`, `none` (default `cover`; when more than one is set, first match wins). Every other RN Image prop (`source`, `style`, `accessibilityLabel` / `alt`, `onLoad` / `onError`, `blurRadius`, and the rest) forwards through untouched. Because of this, `Image` leaves the re-exported primitives set (now `View`, `Text`, `Pressable`, `TextInput`, `ScrollView`) and is documented as an atom; Avatar's internal photo rendering now uses the new atom with `cover`. Callers passing `resizeMode` should switch to the matching fit prop.
