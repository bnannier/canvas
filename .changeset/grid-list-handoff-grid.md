---
"@nannier/canvas": patch
---

GridList lays its tiles out on the v4 hand-off's grid: three columns by default (`cols2` for two), each at least 140px wide, so a phone keeps two columns and only a very narrow grid drops to one, and a short last row keeps its columns instead of stretching. Gallery thumbnails take the hand-off's diagonal wash of the item's colour (a `blue-500` or `emerald-500` reads by its colour family, as the hand-off draws it), the gallery title sits on a 16px line, and a tappable gallery tile lifts to the medium shadow under the pointer on the web. A tappable people tile is now pressable across its whole card; it used to take presses only on its centred content.
