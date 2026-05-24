# Browser Support

Canvas uses modern CSS features. Below is the support matrix for each feature used.

## Feature Matrix

| CSS Feature | Usage in Canvas | Chrome | Firefox | Safari | Edge |
|---|---|---|---|---|---|
| Custom Properties | All tokens and theming | 49+ | 31+ | 9.1+ | 15+ |
| `@layer` | Cascade control (5 layers) | 99+ | 97+ | 15.4+ | 99+ |
| `color-mix()` | Not used directly (reserved) | 111+ | 113+ | 16.2+ | 111+ |
| `light-dark()` | Not used directly (reserved) | 123+ | 120+ | 17.5+ | 123+ |
| `backdrop-filter` | Glass surface, topbar blur | 76+ | 103+ | 9+ | 17+ |
| `:has()` | Checkbox label disabled state | 105+ | 121+ | 15.4+ | 105+ |
| `@container` | Not currently used (reserved) | 105+ | 110+ | 16+ | 105+ |
| `scrollbar-width` | Thin scrollbar pattern | 64+ | 64+ | N/A | 79+ |
| `scrollbar-color` | Scrollbar theming | 64+ | 64+ | N/A | 79+ |

## Minimum Versions

Based on the features actively used, the effective minimum browser versions are:

| Browser | Minimum Version | Reason |
|---|---|---|
| Chrome | 105+ | `:has()` selector |
| Firefox | 121+ | `:has()` selector |
| Safari | 15.4+ | `@layer`, `:has()` |
| Edge | 105+ | `:has()` selector |

## Feature Details

### CSS Custom Properties

Foundation of the entire token system. All visual decisions (colors, spacing,
typography, radius, shadows, z-index, motion) are custom properties.

### @layer

Canvas declares five cascade layers in strict order:

```
canvas.reset, canvas.tokens, canvas.base, canvas.components, canvas.patterns
```

Without `@layer` support, all styles collapse into the default layer and specificity
is determined solely by source order. The visual result will still work in most
cases, but cascade conflicts become harder to predict.

### backdrop-filter

Used for the glass surface pattern and the sticky topbar blur. When unsupported,
glass surfaces fall back to their translucent background colors without the blur
effect.

### :has()

Used in `checkbox.css` for `.checkbox-label:has(.checkbox:disabled)`. When
unsupported, disabled checkbox labels will not dim automatically. This is a
progressive enhancement; functionality is unaffected.

### scrollbar-width / scrollbar-color

Used for thin scrollbar styling. Safari does not support these properties as of
Safari 17. On Safari, the system default scrollbar appearance is used.

## Graceful Degradation

Canvas is designed to degrade gracefully:

- **No glass support:** translucent backgrounds still render; the blur is skipped.
- **No @layer support:** styles still apply via source order. Overrides may need
  higher specificity.
- **No :has() support:** minor cosmetic differences (disabled labels not dimming).
- **No scrollbar styling:** system default scrollbars appear.
- **Reduced motion:** `prefers-reduced-motion: reduce` disables all animations
  and transitions automatically via `patterns/reduced-motion.css`.
- **High contrast:** `prefers-contrast: more` increases border widths and removes
  shadows via `patterns/high-contrast.css`.
