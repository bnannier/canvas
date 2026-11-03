---
"@nannier/canvas": minor
---

Icon glyphs gain categories. Each `ICON_NAMES` entry now carries a `category`, and
the new `ICON_CATEGORIES` export (typed `IconCategory`) lists the fifteen categories
in menu order, so an icon picker can group and filter the set. Minor: this adds a
public export and a field, a new capability for consumers building icon pickers.
