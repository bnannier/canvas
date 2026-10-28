---
"@nannier/canvas": patch
---

Three fixes. A workspace Dialog no longer caps its height at zero in the server render (the window height is read once the page has hydrated), so a server-rendered page no longer reports a hydration mismatch. A vertical Chart reserves room for its value labels above the plot, so the tallest bar's label stays inside the chart. The floating overlays (the scrim, an anchored overlay's card and its phone sheet) take the web's floating glass, as the hand-off's `--gl` surfaces do.
