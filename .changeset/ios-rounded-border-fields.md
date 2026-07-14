---
"@bnannier/canvas": patch
---

iOS text fields render as SwiftUI's `.roundedBorder` instead of a Material-style underline.

Input, Textarea, and Combobox on iOS were a transparent, boxless field carrying only a
bottom active-indicator hairline that thickened and tinted to the brand indigo on
focus/open. A brand-tinted bottom underline is the Material Design signature, so an iOS
field read as an Android one. They now render as a subtly filled, rounded rectangle
(continuous corners) with a full 1pt border that resolves error > focus(`ring`) >
`input`, matching SwiftUI's `.roundedBorder`. The brand still survives in the caret,
selection, and focus border tint. The Android (Material 3 filled + underline) and web
skins are unchanged.
