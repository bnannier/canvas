---
"@nannier/canvas": minor
---

Adds Sidebar's `accessibilityLabel` prop (justification for the minor: a new public option, a name for the sidebar's navigation landmark). A sidebar is a navigation landmark on every platform, and a page holding two of them (a sidebar beside the app's top navigation, or two sidebars) needs a distinct name on each; the label names the landmark in every frame (flush, bordered, floating, embedded and the header/footer shell), in solid and glass alike, and labels the narrow `responsive` drawer. GlassSurface takes the same optional `accessibilityLabel` to name the landmark its `role` declares. Omitted, both render exactly as before.
