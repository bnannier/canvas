---
"@bnannier/canvas": patch
---

Clear the Android dev-console errors and warnings:

- Guard every `onLayout` handler that reads `e.nativeEvent.layout.width` against a null
  layout (dropdown, combobox, popover, select, button-group, row-menu, progress, slider,
  carousel). On the New Architecture the layout can arrive null and crashed with
  "Cannot read property 'layout' of null".
- Drop React Native core's deprecated `SafeAreaView` in the drawer and action-sheet.
  They now source it from `react-native-safe-area-context` (added as an OPTIONAL peer,
  matching the expo-blur pattern) and fall back to a plain `View` when the peer is
  absent, which matches the old behavior off iOS.
- Move the tab-bar active-indicator pill's `pointerEvents` from a prop to `style`
  (the prop form is deprecated on react-native-web).
