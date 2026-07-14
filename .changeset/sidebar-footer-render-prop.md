---
"@nannier/canvas": patch
---

Sidebar's `footer` slot now also accepts a `(collapsed: boolean) => ReactNode` render function,
matching `header`, so a footer can show a compact icon-only form in the collapsed mini-rail
instead of wrapping its label. A plain `ReactNode` footer still works unchanged.
