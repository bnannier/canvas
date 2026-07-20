---
"@nannier/canvas": minor
---

Fields gain a `fit` width and Select gains an `inline` label placement, so a
toolbar-style labeled select routes its label through the component's own API
instead of a hand-composed row with a `style={{ width: "auto" }}` shim.

- Shared field-width axis: new `fit` boolean (`FieldWidthProps`, so every
  input-like control inherits it) resolves to `{ width: "auto", maxWidth: "100%" }`
  so the field hugs its own value/label instead of a fixed width. Precedence is
  `block > fit > narrow > wide > default`.
- Select: new `inline` boolean. When set alongside `label`, the label renders as
  a leading cluster inside the trigger row (per-OS `inlineLabel` type in each
  skin) rather than the persistent above (iOS/web) or floating (Android)
  placement. The inline label still names the trigger (accessibilityLabel /
  aria-labelledby) and shares its tap target. Without `inline`, Select is
  unchanged.
