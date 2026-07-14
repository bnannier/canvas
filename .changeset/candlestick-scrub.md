---
"@nannier/canvas": minor
---

Trading charts, part 1. New `CandlestickChart`: OHLC candles (body + wick)
colored by direction from the success/destructive tokens, an optional docked
volume pane sharing the x axis, optional overlay series (moving averages) in
the `chart-1`..`chart-8` token colors with a legend, nice non-zero-based
price ticks, and the full inspect experience (flag with Open/High/Low/Close/
Vol rows, dimming, accessibility announcements; every candle's OHLC lives in
the plot's accessible name). Press-to-inspect across all cartesian charts is
also upgraded to SCRUB-to-inspect: dragging a finger or mouse moves the
selection continuously (core RN responder system, no gesture-handler; a
stationary tap on the selected band still clears it).
