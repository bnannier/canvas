---
"@olympusoss/canvas": minor
---

Add two missing core components:

- **`Slider`** — a draggable value/range input (`value`/`min`/`max`/`step`/`onChange`, `small`/`large`, `disabled`). One cross-platform `PanResponder` handles both tap-to-jump and drag; `accessibilityRole="adjustable"` with increment/decrement actions and `aria-valuemin/max/now` make it keyboard-, switch-control-, and screen-reader-accessible. Web/iOS/Android skins (iOS thin rail + large white knob, Material 3 track + state-layer handle, shadcn-style web).
- **`Progress`** — a determinate + `indeterminate` progress bar (`value` 0..1, `small`/`large`), `accessibilityRole="progressbar"` with the value exposed to assistive tech; the indeterminate animation is gated on `supportsNativeDriver`.

Both are documented with live examples and the iOS/Android/Web 3-up comparison.
