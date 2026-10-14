---
"@nannier/canvas": patch
---

The docs' frame runs a hairline past the window's bottom edge, so its frost rim no longer draws a bright line there, and its corner wedges are drawn at the frame's own size, which stops the Android docs app from crashing on a 174 MB bitmap. Docs only; nothing in the package changes.
