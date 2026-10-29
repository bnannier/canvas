---
"@nannier/canvas": minor
---

Three backward-compatible capabilities on `DataTable`, for the v4 component detail page's props table (the hand-off's Component.dc.html lines 233-241). New public API: `eyebrowHeader` sets the column headings as the page's small uppercase letter-spaced mono label in the subtle ink on a header row with no fill, 12 px above and below (the web and Android skins; iOS keeps its own column headings); `alignTop` holds every cell at the top of its row, with the selection box and the row actions centered on the first line of cell text; and `footer` takes a ReactNode row drawn inside the table's frame under the last row and the pagination bar, 44 px tall with its content centered, separated by one hairline. The docs' props table uses all three and moves its "Show all N props" control into the footer.
