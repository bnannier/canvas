---
"@nannier/canvas": patch
---

Stepper's number paints in the theme's registered face (`<ThemeProvider fonts>`, Manrope for Dark Factory) on every platform. Its value field rendered React Native's own TextInput, which skips the theme's face, so the number painted in the platform's default face beside a Manrope label.
