---
"@nannier/canvas": patch
---

Record what every axis resolver in the kit returns, for no member, each member alone and each pair (`test/fixtures/axes.json`: 118 resolvers across 75 component pages and ThemeProvider), as the baseline each component's move to axis tables is proven against; `bun run axes:record` rewrites it for a change meant to move a precedence. To reach the resolvers, the component shells export them to the test, and the axes that were resolved inline move into named functions with the same logic: AvatarMenu's menu edge, Skeleton's line length, Swatch's stretch, Tooltip's trigger, DescriptionList's value form, StackedList's row badge, Stats' delta, DataTable's column alignment, Sidebar's drawer edge, Tabs' wrap and ThemeProvider's scheme and surface. The package's exports and every component's output are unchanged.
