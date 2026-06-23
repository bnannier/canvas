---
"@olympusoss/canvas": minor
---

TabBar: add a `bottomInset` prop and apply the safe-area inset on top of a symmetric vertical base instead of replacing the bottom padding. The bar's top and bottom margins now match when there is no inset (e.g. web) and it still clears the home indicator when there is one. Pass the inset as `bottomInset={insets.bottom}` rather than `style={{ paddingBottom: insets.bottom }}`.
