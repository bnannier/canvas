---
"@nannier/canvas": patch
---

`GlassPane`, `GlassPaneProps`, `paneStyle` and `PANE_SIBLING_INPUT` are deprecated aliases (audit K12-2): kit internals that were published by accident. Nothing is removed and the deprecation itself changes nothing at run time: each keeps working until a major, its `@deprecated` text says to use the kit component that paints the material (a Card for a content pane, a Button, Chip or Input for a control) or that it has no replacement, and the generated /foundation reference lists all four in a new Glass material section. GlassPane and GlassPaneProps carry JSDoc summaries that state the pane's geometry and its accessibility; `layer` states its own default (`control`) and `static` says it means frost in place of Liquid Glass. `PANE_SIBLING_INPUT` is documented as the no-op it is. The theming and glass pattern pages say "the kit's shared material rendering" instead of naming the internals.
