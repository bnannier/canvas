---
"@nannier/canvas": patch
---

Input: on Android a page now scrolls when a swipe starts on a filled field. The filled field's bottom band is M3's 8dp with its active indicator inside it, so the value's line fits the field exactly instead of overflowing by 2dp, which made the field scrollable and kept the swipe.
