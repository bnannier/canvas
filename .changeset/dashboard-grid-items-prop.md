---
"@nannier/canvas": minor
---

DashboardGrid spells its collection prop `items`, matching every other
collection-taking component in the kit; `widgets` keeps working as a deprecated
alias.

Minor justification: `items` is a new public prop on `DashboardGridProps`, so
this adds a user-visible capability rather than fixing one. Nothing that already
shipped changes shape: `widgets` still renders exactly the board it always did.

Sidebar, StackedList, DescriptionList, Feed, Stats, GridList, Board, Carousel,
Command, Dropdown, Listbox, TabBar and the rest all take their collection as
`items`, and DashboardGrid was the single outlier. It now accepts `items` as the
documented, canonical spelling, and `widgets` resolves to the same board while
warning once in development toward the new name. `items` wins if both are passed,
which also warns. Both props are optional, so a board configured with neither
renders empty rather than throwing.

The docs, the `.md` examples, and the tests all teach `items` now; the generated
prop table carries `widgets` with its deprecation note beside it.
