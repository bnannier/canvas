---
"@bnannier/canvas": patch
---

`Input`'s bare and multiline fields no longer show the browser's default focus outline on the web: the shared `FOCUS_RESET` now covers the bare path too, matching the grouped path and the Combobox/Textarea/NumberInput shells. Each skin already paints its own focus affordance (web border turns to the ring color, iOS thickens the hairline, Android thickens the bottom indicator), so react-native-web's outline was redundant and, over the filled Android field, appeared as a stray blue rectangle on top of the indicator. No-op on native, which has no CSS outline.
