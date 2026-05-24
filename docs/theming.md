# Theming Guide

Canvas supports three theming axes: light/dark mode, glass surface, and density.
All are controlled via HTML attributes on `<html>`. No build step required.

## Light/Dark Mode

Light mode is the default. Toggle dark mode by adding the `dark` class to `<html>`.

```html
<!-- Light (default) -->
<html>

<!-- Dark -->
<html class="dark">
```

All color tokens flip automatically. Components never need to change; only the
custom property values update.

### Using JS utilities

```js
import { getTheme, setTheme, toggleTheme } from "@olympusoss/canvas";

getTheme();        // "light" | "dark"
setTheme("dark");  // applies .dark to <html>
toggleTheme();     // switches and returns the new theme
```

### Respecting system preference

Canvas does not auto-detect `prefers-color-scheme`. Wire it yourself:

```js
import { setTheme } from "@olympusoss/canvas";

const mq = window.matchMedia("(prefers-color-scheme: dark)");
setTheme(mq.matches ? "dark" : "light");
mq.addEventListener("change", (e) => setTheme(e.matches ? "dark" : "light"));
```

## Glass Surface

Glass mode adds frosted-pane effects to cards, sidebars, topbars, inputs, and
overlays. It also replaces the default body gradient with an aurora-style
multi-color backdrop.

Activate by setting `data-surface="glass"` on `<html>`.

```html
<html data-surface="glass">
<html class="dark" data-surface="glass">
```

### What changes

- `.stat-card`, `.section-card`, `.dt-wrap`, `.empty-card`, `.topbar`, `.sidebar`
  gain `backdrop-filter: blur(18px) saturate(1.4)` with translucent tinted
  backgrounds.
- `.input`, `textarea.input`, `select.input` get a lighter blur (8px).
- Overlays (`.popover`, `[role="menu"]`, `.slide-over-panel`) get a stronger
  blur (20px).
- Border colors switch to white-alpha edges.
- The body background becomes a multi-orb gradient instead of a single radial.

### Using JS utilities

```js
import { getSurface, setSurface } from "@olympusoss/canvas";

getSurface();            // "default" | "glass"
setSurface("glass");     // sets data-surface="glass"
setSurface("default");   // removes the attribute
```

## Density

Density controls spacing in content areas and data tables. Three levels:
`compact`, `regular` (default), and `comfy`.

Set via `data-density` on `<html>`.

```html
<!-- Regular (default, no attribute needed) -->
<html>

<!-- Compact -->
<html data-density="compact">

<!-- Comfy -->
<html data-density="comfy">
```

### What changes

| Element | Compact | Regular (default) | Comfy |
|---|---|---|---|
| `.app-content` padding | 0.75rem | 1rem / 1.75rem (sm+) | 1.5rem / 2.25rem (lg+) |
| `.dt-toolbar` padding | 0.75rem / 0.625rem | 1rem / 0.875rem | 1.25rem / 18px |
| `.dt-table th` padding | 0.75rem / 0.5rem | 1rem / 0.625rem | 18px / 0.875rem |
| `.dt-table td` padding | 0.75rem / 0.5rem | 1rem / 0.75rem | 18px / 1rem |
| `.dt-table td` font-size | 12.5px | 13px | 13.5px |

### Using JS utilities

```js
import { getDensity, setDensity } from "@olympusoss/canvas";

getDensity();            // "compact" | "regular" | "comfy"
setDensity("compact");   // sets data-density="compact"
setDensity("regular");   // removes the attribute
```

## Combining Axes

All three axes are independent and composable.

```html
<html class="dark" data-surface="glass" data-density="compact">
```

```js
import { setTheme, setSurface, setDensity } from "@olympusoss/canvas";

setTheme("dark");
setSurface("glass");
setDensity("compact");
```

## Additional Patterns

### Reduced Motion

Canvas ships `patterns/reduced-motion.css`, which respects `prefers-reduced-motion: reduce`
by collapsing all animation and transition durations to near-zero. No opt-in needed.

### High Contrast

`patterns/high-contrast.css` responds to `prefers-contrast: more` by increasing
border widths to 2px, removing shadows, and boosting muted-foreground contrast.
Automatic based on the user's OS setting.

### Focus Pulse

All interactive elements get an animated ring pulse on focus via `patterns/focus.css`.
Suppress on individual elements with the `.no-focus-pulse` class.

### Scrollbar

Thin scrollbar styling is applied globally via `patterns/scrollbar.css`. Glass mode
uses white-alpha scrollbar colors.
