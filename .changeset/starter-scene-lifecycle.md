---
"@nannier/canvas": patch
---

The standalone starter moves to Expo 57.0.27 (React Native 0.86.3) and adopts the UIScene lifecycle through `expo-build-properties`, so a build linked against the iOS 27 SDK no longer traps at launch. Its Expo Modules JSI compiler patch is carried onto 57.1.1.
