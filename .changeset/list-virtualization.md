---
"@nannier/canvas": minor
---

`DataTable`, `Feed`, `StackedList`, and `GridList` gain an opt-in `virtualized`
boolean that renders their rows/tiles through a windowed `FlatList` instead of
mounting every one up front, for large datasets. Give the list a bounded height (via
`style`, e.g. `{ maxHeight: 400 }`) so it can window and scroll; without one it warns
in development and renders eagerly. DataTable keeps its header row fixed above the
windowed body and preserves its `role="table"` rows. The default (omitting
`virtualized`) mounts every row exactly as before, so existing usage is unchanged.
