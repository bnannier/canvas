---
"@nannier/canvas": minor
---

Tooltip gains a `textTrigger` prop: render the `trigger` string as a pressable inline word (an underlined hover-text affordance) instead of the default outline Button, so a tooltip can hang off a run of body copy. It toggles the bubble on press, exposes its open state to assistive tech (`accessibilityRole="button"`, `accessibilityState`/`aria-expanded`), and carries the same hitSlop and press feedback (opacity dim on iOS/web, ripple on Android) as the icon trigger. Orthogonal to placement; the icon trigger still takes precedence when both are set.
