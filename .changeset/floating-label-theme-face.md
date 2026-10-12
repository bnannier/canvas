---
"@nannier/canvas": patch
---

The Android floating label of Input, Textarea, Select and Autocomplete paints in the theme's registered face (`<ThemeProvider fonts>`, Manrope for Dark Factory) like the rest of the field. It rendered through React Native's own animated text, which skipped the theme's face, so it painted in the platform's default face beside a Manrope value and required star.
