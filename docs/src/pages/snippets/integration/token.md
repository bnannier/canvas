```tsx
import { token } from "@olympusoss/canvas";

// Web only: reads a CSS custom property off <html>, so it reflects the live theme.
// Requires canvas.css to be loaded; on native, theme values come from ThemeProvider.
token("primary");     // "oklch(0.511 0.262 276.966)"
token("radius-md");   // "0.375rem"

// Color tokens are oklch, so the legacy hsl() helper does not apply to them.
// For an alpha variant, compose in CSS:
//   color-mix(in oklch, var(--primary) 50%, transparent)
```
