---
"@nannier/canvas": patch
---

Chart draws the hand-off's bars: vertical columns stand on the shared cartesian frame (the quarter grid, y labels at 0, half and the top, at most 28-unit columns and 14-unit clustered bars 2 apart with a 3-unit corner) and horizontal rows take its label column, bar travel and trailing value. The cartesian frame takes the hand-off's value axis (0 to the nice bound above 102% of the data, gridlines at its quarters), its axis numbers (whole below 10,000, then "12.5k"), and on the bar, line, area and composed charts its 360 by 170 proportion up to the standard plot height; `compact` now tightens only the frame, as the hand-off's does.
