---
"@nannier/canvas": major
---

Remove the `Overlay` component (and its `OverlayProps` type). It was a redundant
umbrella that re-implemented three surfaces the kit already ships as real,
`Modal`-backed components: use `Drawer` for an edge or bottom panel, `Dialog` for
a centered modal, and `ActionSheet` for a bottom action sheet. Unlike those,
`Overlay` only painted a contained inline mock, so it could not present as a true
floating overlay. Migration: replace `<Overlay drawer />` / `<Overlay sheet />`
with `Drawer`, and `<Overlay modal />` with `Dialog`.
