---
"@nannier/canvas": patch
---

A named Image (an Avatar photo, a CardMedia cover, a MediaObject photo) is a single image to assistive tech on the web, named on react-native-web's own hidden `<img>`, and on iOS and Android it takes the image role, so VoiceOver and TalkBack announce it as an image. CardMedia names its cover in Image's order: when both `alt` and `accessibilityLabel` are set, `accessibilityLabel` wins, as it does on Image and in React Native.
