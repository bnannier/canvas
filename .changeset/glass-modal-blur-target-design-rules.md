---
"@nannier/canvas": patch
---

Two design rules hold the Android capture plane out of its own window (`test/design-rules-source.test.ts`): the window-level plane is read only by `OverlayProvider` and `GlassModalBlurTarget`, and every React Native `Modal` in the kit puts its content under `GlassModalBlurTarget`, so its glass surfaces can frost the page on Android. Both were comments until now; each check carries a case it must catch. Tests only; nothing in the package changes.
