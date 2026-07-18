---
"@nannier/canvas": patch
---

StackedList draws its row separators as absolute bottom hairlines instead of a border merged into the row's own style. On iOS the inset separator's marginStart was shifting every non-last row's whole content right by 72pt and truncating the labels; rows now sit flush on all platforms while the iOS rule keeps its HIG inset past the avatar.
