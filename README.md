# @olympusoss/canvas

CSS-first design system.

## Install

```bash
npm install @olympusoss/canvas
```

## Quick Start

Import all styles:

```css
@import "@olympusoss/canvas/styles/canvas.css";
```

Or import selectively:

```css
@layer canvas.reset, canvas.tokens, canvas.base, canvas.components, canvas.patterns;

@import "@olympusoss/canvas/styles/reset.css";
@import "@olympusoss/canvas/styles/tokens/colors.css";
@import "@olympusoss/canvas/styles/tokens/typography.css";
@import "@olympusoss/canvas/styles/base.css";
@import "@olympusoss/canvas/styles/atoms/button.css";
```

Component CSS is organized by atomic-design level: `styles/atoms/`,
`styles/molecules/`, `styles/organisms/`. (Importing the all-in-one
`styles/canvas.css` pulls in everything and is unaffected by this layout.)

Use component classes in your HTML:

```html
<button class="btn btn-default">Save</button>
<button class="btn btn-outline btn-sm">Cancel</button>
<input class="input" placeholder="Search..." />
```

## Theming

Toggle themes with HTML attributes:

```html
<!-- Dark mode -->
<html class="dark">

<!-- Glass surface -->
<html data-surface="glass">

<!-- Compact density -->
<html data-density="compact">
```

Or use the JS utilities:

```js
import { setTheme, toggleTheme, setSurface, setDensity } from "@olympusoss/canvas";

toggleTheme();           // switches between light/dark
setSurface("glass");     // enables glass surface
setDensity("compact");   // switches to compact density
```

## What's Included

- **62 CSS files**: tokens, components, and patterns
- **4 JS utilities**: theme switching, token access, class composition
- **5 cascade layers**: reset, tokens, base, components, patterns
- **45 component styles**: buttons, cards, tables, forms, dialogs, and more
- **Light/dark mode**, glass surface, compact/comfy density
- **WCAG AA** color contrast compliance
- **prefers-reduced-motion** and **prefers-contrast** support

## Documentation

- [Token Reference](docs/tokens.md)
- [Component Catalog](docs/components.md)
- [Theming Guide](docs/theming.md)
- [Migration Guide (v2 to v3)](docs/migration.md)
- [Consumer Integration](docs/integration.md)
- [Browser Support](docs/browser-support.md)

## Framework Packages

Canvas provides the CSS foundation. Framework-specific components live in dedicated packages:

- `@olympusoss/canvas-react`: React components for web
- `@olympusoss/canvas-react-native`: React Native components
- `@olympusoss/canvas-vue`: Vue components
- `@olympusoss/canvas-flux`: Flux components

## License

proprietary
