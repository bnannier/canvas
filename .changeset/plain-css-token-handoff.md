---
"@nannier/canvas": minor
---

Ship the design tokens as plain CSS, and drop Tailwind from the stylesheet

`styles/canvas.css` is now a manifest of nine token files under `styles/tokens/`
(colors, palette, typography, spacing, radius, shadows, platforms, motion, base).
It is plain CSS custom properties end to end: no `@import "tailwindcss"`, no
`@theme`, no `@custom-variant`, no build step. A bare `<link>` resolves it.

New capability, which is what makes this a minor: the published stylesheet now
carries the **platform skin layer**, 732 `--p-*` custom properties that switch
the whole look from one attribute, so a web surface can render the iOS 26 / HIG
and Material 3 skins alongside the Canvas web look:

```html
<div data-platform="ios">…</div>
<div data-platform="android">…</div>
```

That takes the shipped token surface from 71 properties to 932, adds the glass,
delta and panel token families, and completes the radius scale (`--radius-none`
through `--radius-3xl`, plus the per-platform shape aliases). Every existing
token keeps its name and value; the one change is `--radius-sm`, now 2px inside
the full scale, where it used to be 4px as part of a four-step set.

Scheme still keys off `.dark` on the root element. The browser floor drops,
because the layer now needs only `oklch()` and `color-mix()`: Firefox 113
instead of 128, since `@property` and cascade layers are gone.

`hsl(name)` (the web token helper) returned `hsl(oklch(…))`, invalid in every
browser, because token values stopped being HSL triplets. It now returns the
token value as-is, and applies alpha with `color-mix()`.

**Migration, required for apps that use Tailwind utility classes.** Canvas's
stylesheet used to be the Tailwind entry point by side effect, so importing it
generated every utility in the consuming app. It no longer does. An app that
writes `className="flex p-6 text-muted-foreground"` must own its own Tailwind
setup: add these above the Canvas import in your global stylesheet.

```css
@import "tailwindcss";
@import "@nannier/canvas/styles/canvas.css";

@custom-variant dark (&:where(.dark, .dark *));

/* Canvas tokens as Tailwind colours, so bg-primary and friends resolve. */
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-success: var(--success);
  --color-success-foreground: var(--success-foreground);
  --color-warning: var(--warning);
  --color-warning-foreground: var(--warning-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-chart-6: var(--chart-6);
  --color-chart-7: var(--chart-7);
  --color-chart-8: var(--chart-8);
}
```

Apps that only use Canvas components and `var(--token)` need no change.
