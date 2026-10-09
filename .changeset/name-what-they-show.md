---
"@nannier/canvas": patch
---

Image and CardMedia announce their `alt` text on the web: react-native-web dropped it, leaving the picture unnamed; an unnamed Image stays decorative. A labelled BadgeGroup is a named group, a vertical Divider says it is vertical, and a labelled Divider is named by its label. Breadcrumb's `maxItems` JSDoc now says it keeps the last `maxItems - 1` crumbs, as it always has. The test suite also mounts every platform-entry export in the skins smoke test, tests MediaObject and ActionPanel on every platform entry, owns QRCode, DepthChart and five charts' dev warnings, and the audit facts credit RevealGroup.
