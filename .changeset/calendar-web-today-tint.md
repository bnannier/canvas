---
"@nannier/canvas": patch
---

Calendar (web skin): today is a soft primary tint with primary text, not a full primary fill. Filling both today and the selected day made an unselected today indistinguishable from a selection, so a calendar with today and its neighbour selected read as a two-day range. The iOS and Android skins already distinguished the two; the web skin now matches its own documented behavior ("today marked separately in the accent tone").
