---
"@bnannier/canvas": minor
---

Chart docs now showcase realistic, dense data (intraday-scale price series,
multi-series analytics dashboards, ~30-candle sessions with volume and a
moving-average overlay, denser scatter clouds, a full order book, and a
contribution-style heatmap) so the gallery reads like real product charts.
Two kit changes support dense data cleanly: line-chart `dots` auto-suppress
when the plot is too tight for them to separate (the line carries the shape),
and cartesian/candlestick charts past 24 points summarize their accessible
name by endpoints and range (e.g. "Price: 39 points from 186 to 192, low 184,
high 193") instead of folding every value into one screen-reader label -
scrubbing still announces the focused point. The prior "too many datapoints"
dev warning is removed, since dense data is now first-class.
