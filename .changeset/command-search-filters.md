---
"@nannier/canvas": minor
---

Command: the search row is now a real search input that filters. Typing narrows the grouped rows to the labels matching the query (case-insensitive); groups left with no match drop out, heading included, and a query matching nothing shows a muted "No results" row. The query follows the standard controllable contract (`query` / `defaultQuery` / `onQueryChange`), so a bare `<Command />` is searchable out of the box; each keystroke snaps the active-row highlight back to the first match, and arrow/Enter keyboard navigation now walks the filtered list. The default placeholder changed from "Type a command or search..." to "Search commands...".
