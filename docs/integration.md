# Consumer Integration Guide

This guide covers how downstream packages and end-user apps consume Canvas.

## Installation

```bash
npm install @olympusoss/canvas
```

## Importing CSS

### All-in-one

Import everything via the convenience entry point:

```css
@import "@olympusoss/canvas/styles/canvas.css";
```

### Selective imports

Import only what you need:

```css
/* Required foundation */
@layer canvas.reset, canvas.tokens, canvas.base, canvas.components, canvas.patterns;

@import "@olympusoss/canvas/styles/reset.css";
@import "@olympusoss/canvas/styles/tokens/colors.css";
@import "@olympusoss/canvas/styles/tokens/typography.css";
@import "@olympusoss/canvas/styles/tokens/radius.css";
@import "@olympusoss/canvas/styles/base.css";

/* Only the components you use */
@import "@olympusoss/canvas/styles/components/button.css";
@import "@olympusoss/canvas/styles/components/card.css";

/* Patterns you want */
@import "@olympusoss/canvas/styles/patterns/focus.css";
```

When importing selectively, you must declare the layer order at the top to preserve
correct cascade specificity.

## Importing JS Utilities

```js
import { setTheme, toggleTheme, setSurface, setDensity } from "@olympusoss/canvas";
import { token, hsl } from "@olympusoss/canvas";
import { cn } from "@olympusoss/canvas";
```

All exports are framework-agnostic and work in any environment with a DOM.

## Reading Tokens from JS

Use `token()` to read the computed value of any CSS custom property:

```js
import { token, hsl } from "@olympusoss/canvas";

token("foreground");       // "240 10% 3.9%" (raw HSL channels)
token("radius-md");        // "6px"
token("font-sans");        // "\"Inter\", system-ui, -apple-system, sans-serif"

hsl("foreground");         // "hsl(240 10% 3.9%)"
hsl("primary", 0.5);       // "hsl(240 5.9% 10% / 0.5)"
```

These read live computed values from `document.documentElement`, so they reflect
the current theme (light/dark), surface, and any overrides.

## Class Composition

The `cn()` utility merges class names, filtering out falsy values:

```js
import { cn } from "@olympusoss/canvas";

cn("btn", "btn-default");                    // "btn btn-default"
cn("btn", isSmall && "btn-sm");              // "btn btn-sm" or "btn"
cn("card", undefined, null, "card-header");  // "card card-header"
```

## Building Downstream Component Packages

Downstream packages (`canvas-react`, `canvas-vue`, etc.) follow this pattern:

### 1. Depend on Canvas

```json
{
  "dependencies": {
    "@olympusoss/canvas": "^3.0.0"
  }
}
```

### 2. Import Canvas CSS

Re-export or instruct consumers to import Canvas CSS:

```css
/* In your package's entry CSS */
@import "@olympusoss/canvas/styles/canvas.css";
```

### 3. Wrap CSS patterns in framework components

```tsx
// React example
import { cn } from "@olympusoss/canvas";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export function Button({ variant = "default", size, className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "btn",
        `btn-${variant}`,
        size && `btn-${size}`,
        className
      )}
      {...props}
    />
  );
}
```

### 4. Read tokens programmatically for native platforms

For React Native or other non-CSS environments, read token values at runtime:

```js
import { token } from "@olympusoss/canvas";

// Read the current primary color as HSL channels
const primary = token("primary"); // "240 5.9% 10%"
```

## For End-User Apps

Apps like Athena, Hera, and Site typically consume a downstream package rather than
Canvas directly. They may also import Canvas CSS or utilities when needed.

### Typical setup

```tsx
// app entry point
import "@olympusoss/canvas/styles/canvas.css";
import { setTheme } from "@olympusoss/canvas";

// Initialize theme from user preference
const stored = localStorage.getItem("theme");
if (stored === "dark" || stored === "light") {
  setTheme(stored);
}
```

### Custom layouts using Canvas tokens

```css
.custom-panel {
  background-color: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  box-shadow: var(--shadow-elevated);
}
```

## CSS Layer Order

Canvas uses five cascade layers. Your own styles sit outside these layers (highest
priority) or in your own named layer:

```
canvas.reset < canvas.tokens < canvas.base < canvas.components < canvas.patterns < (unlayered)
```

To override Canvas styles, write unlayered CSS or a higher-priority layer:

```css
@layer app {
  .btn-default {
    background-color: hsl(217 91% 60%);
  }
}
```

## Package Exports

| Export Path | Content |
|---|---|
| `@olympusoss/canvas` | JS utilities (theme, tokens, cn) |
| `@olympusoss/canvas/styles/*` | CSS files (wildcard) |
| `@olympusoss/canvas/styles/canvas.css` | All-in-one CSS entry |
