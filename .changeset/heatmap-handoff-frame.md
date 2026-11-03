---
"@nannier/canvas": patch
---

Heatmap draws the v4 hand-off's heatmap: the chart frame (the card fill on a hairline at the chart corner under the small shadow, a 16px inset, its rows 12px apart; `plain` drops it inside a card), `label` (or `caption`) as its 500 13px title, 11px cells on a 13px pitch in seven-row columns that scroll sideways where they overflow, an empty cell in the secondary surface and a valued one in the chart-1 wash from .18 to .98, and the hand-off's less-to-more legend. A plain `calendar` takes the same cells with day inspection and no axis labels, as the hand-off draws it; `detailed` keeps its unframed calendar with month and weekday labels.
