---
"@olympusoss/canvas": minor
---

Add two more core components:

- **`ActionSheet`** — the iOS HIG modal action menu (a bottom sheet of choices), built on React Native's `Modal` so it renders on iOS, Android, and the web. Controlled `open`/`onOpenChange`; `actions` rows (each `destructive`/`disabled`), an optional title/message, and a Cancel affordance. Selecting a row runs its `onPress` then closes; the scrim, system back/escape, and the Android hardware back button all dismiss it. The card surfaces are functional-layer overlays routed through `GlassSurface` (real Liquid Glass on iOS 26+, a frost on web/Android). Per-OS skins: iOS two-card layout (actions card + separate Cancel card), Material 3 single bottom sheet with a drag handle and Cancel as the last row.
- **`Accordion`** — a vertically stacked group of disclosure rows (`items` with a `title` and collapsible `content`), single-open by default or `multiple`; controlled (`value`/`onValueChange`) or uncontrolled (`defaultValue`). Each header is a button exposing its expanded and disabled state to assistive technology via `aria-expanded` (a cross-platform alias that survives react-native-web, which drops `accessibilityState.expanded`). The chevron rotates 0 to 90deg on open; the reveal uses `LayoutAnimation` natively and a plain show/hide on web. Per-OS skins: iOS inset-grouped card, flat Material 3 rows with a ripple, flat web rows.

Both are documented with live examples and the iOS/Android/Web 3-up comparison.
