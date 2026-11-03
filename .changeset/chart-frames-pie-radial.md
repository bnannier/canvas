---
"@nannier/canvas": patch
---

PieChart and RadialBarChart sit in the v4 hand-off's chart frame like every other chart (the card fill on a hairline at the card corner under the small shadow, a 16px inset, 12px compact), and take `plain` to drop it when nested in a card. RadialBarChart draws the hand-off's rings: 16 units apart from the outermost, a 10 unit stroke, scaled to its 160px disc (120px compact).
