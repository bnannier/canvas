---
"@nannier/canvas": patch
---

Restore the Android frost under expo-blur 57. Its new Android API blurs an
explicitly designated `BlurTargetView` (named by ref) instead of whatever renders
behind the `BlurView`, so the glass surface mode silently lost its blur on
Android. `ThemeProvider` now mounts a `GlassBackdrop` that wraps the app content
in that target on Android and publishes its ref, and `GlassSurface` passes the
new `blurMethod` + `blurTarget` props when the installed expo-blur exports
`BlurTargetView`, falling back to the legacy `experimentalBlurMethod` prop on
older expo-blur releases. Web and iOS are untouched (their blur paths need no
target), and consumers without the optional expo-blur peer keep the existing
translucent fallback.
