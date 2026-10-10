---
"@nannier/canvas": patch
---

A link Text now carries the kit's focus ring, like Pressable, TextInput and ScrollView: the Text primitive gives a Text with an `href` (which react-native-web renders as an `<a>`) or the `link` role the palette's `ring` colour 2 px off the text, so a Typography `href` link shows the kit's ring on keyboard focus instead of the browser's own colour. Plain text is untouched.
