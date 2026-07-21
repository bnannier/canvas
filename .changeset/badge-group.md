---
"@nannier/canvas": minor
---

Add `BadgeGroup`, a layout atom that lays out a series of badges in a wrapping row so a call site never hand-rolls a flex row (or a generic `Row`) around them. It owns the flex direction, the wrap, the vertical centering, and the inter-badge gap, drawn from the kit's spacing scale via a `tight` / `snug` / `cozy` axis (default `snug`, precedence `cozy` > `snug` > `tight`). It is the sibling of `AvatarGroup`, scoped to badges: layout-only, so it carries no per-OS skin and no colors (the badges it holds own their own platform treatment). It also takes `accessibilityLabel`, `testID`, and a composition-only `style`. The badge docs now model `BadgeGroup` everywhere a series of badges appears.
