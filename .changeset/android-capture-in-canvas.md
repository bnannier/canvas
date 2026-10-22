---
"@nannier/canvas": minor
---

Canvas now ships its Android capture module itself. The native backdrop capture and frost that lived in the separate, never-published `@nannier/canvas-blur` package is part of `@nannier/canvas`: Expo autolinks it from the package root (`android/`, `expo-module.config.json`), so an Expo SDK 57 Android build frosts glass overlays and native Modals on Android 12 and later with nothing extra to install, after a native rebuild. Minor: this adds a user-visible capability, real Android frost from Canvas alone, and a newly declared optional peer, `expo-modules-core`, which every Expo app already provides.

The module is built and verified with Expo SDK 57 and React Native 0.86. This release assumes, as the owner decided on 2026-10-22, that no Canvas 3.x Android app on an older SDK exists (3.9.3 is the only 3.x release under `@nannier`). An app on an older SDK, or one that does not want the module, leaves it out of its native build with `"expo": { "autolinking": { "exclude": ["@nannier/canvas"] } }` in its `package.json`; surfaces then use `expo-blur`'s frost or their complete solid appearance, as before. Web and iOS are unchanged.

Release tooling now handles Canvas as its one package: a changeset for any other package fails release preparation before a version is consumed, the sealed tarball must carry the module's sources and none of its tests or build output, and the native smoke run checks that Expo autolinks the module from the installed Canvas package and runs its instrumentation tests there.
