# Token Reference

All design tokens are CSS custom properties defined in the `canvas.tokens` layer.
Import them via `styles/canvas.css` (all-in-one) or individual token files.

## Colors

HSL channel values (use with `hsl(var(--token))`).

### Semantic Colors

| Property | Light | Dark |
|---|---|---|
| `--background` | `0 0% 100%` | `240 10% 3.9%` |
| `--foreground` | `240 10% 3.9%` | `0 0% 98%` |
| `--card` | `0 0% 100%` | `240 10% 3.9%` |
| `--card-foreground` | `240 10% 3.9%` | `0 0% 98%` |
| `--popover` | `0 0% 100%` | `240 10% 3.9%` |
| `--popover-foreground` | `240 10% 3.9%` | `0 0% 98%` |
| `--primary` | `240 5.9% 10%` | `0 0% 98%` |
| `--primary-foreground` | `0 0% 98%` | `240 5.9% 10%` |
| `--secondary` | `240 4.8% 95.9%` | `240 3.7% 15.9%` |
| `--secondary-foreground` | `240 5.9% 10%` | `0 0% 98%` |
| `--muted` | `240 4.8% 95.9%` | `240 3.7% 15.9%` |
| `--muted-foreground` | `240 3.8% 46.1%` | `240 5% 64.9%` |
| `--accent` | `240 4.8% 95.9%` | `240 3.7% 15.9%` |
| `--accent-foreground` | `240 5.9% 10%` | `0 0% 98%` |
| `--destructive` | `0 72% 51%` | `0 62.8% 30.6%` |
| `--destructive-foreground` | `0 0% 98%` | `0 0% 98%` |
| `--border` | `240 5.9% 90%` | `240 3.7% 15.9%` |
| `--input` | `240 5.9% 90%` | `240 3.7% 15.9%` |
| `--ring` | `240 5.9% 10%` | `240 4.9% 83.9%` |
| `--radius` | `0.5rem` | (same) |

### Chart Colors

| Property | Light | Dark |
|---|---|---|
| `--chart-1` | `12 76% 61%` | `220 70% 50%` |
| `--chart-2` | `173 58% 39%` | `160 60% 45%` |
| `--chart-3` | `197 37% 24%` | `30 80% 55%` |
| `--chart-4` | `43 74% 66%` | `280 65% 60%` |
| `--chart-5` | `27 87% 67%` | `340 75% 55%` |

### Sidebar Colors

| Property | Light | Dark |
|---|---|---|
| `--sidebar-background` | `0 0% 98%` | `240 5.9% 10%` |
| `--sidebar-foreground` | `240 5.3% 26.1%` | `240 4.8% 95.9%` |
| `--sidebar-primary` | `240 5.9% 10%` | `224.3 76.3% 48%` |
| `--sidebar-primary-foreground` | `0 0% 98%` | `0 0% 100%` |
| `--sidebar-accent` | `240 4.8% 95.9%` | `240 3.7% 15.9%` |
| `--sidebar-accent-foreground` | `240 5.9% 10%` | `240 4.8% 95.9%` |
| `--sidebar-border` | `220 13% 91%` | `240 3.7% 15.9%` |
| `--sidebar-ring` | `217.2 91.2% 59.8%` | `217.2 91.2% 59.8%` |

### Brand Colors

These are literal values, not HSL channels.

| Property | Value |
|---|---|
| `--brand-blue-700` | `#1e40af` |
| `--brand-blue-400` | `#60a5fa` |
| `--brand-gradient` | `linear-gradient(135deg, #1e40af 0%, #60a5fa 100%)` |
| `--orb-indigo` | `#6366f1` |
| `--orb-violet` | `#8b5cf6` |
| `--orb-cyan` | `#06b6d4` |

### Status Colors (literal)

| Property | Value |
|---|---|
| `--color-success` | `hsl(143 70% 45%)` |
| `--color-warning` | `hsl(38 92% 50%)` |
| `--color-info` | `hsl(217 91% 60%)` |

### Status Background/Foreground (HSL channels)

| Property | Light | Dark |
|---|---|---|
| `--success-bg` | `141 79% 85%` | `149 50% 22%` |
| `--success-fg` | `144 61% 20%` | `142 70% 65%` |
| `--warning-bg` | `48 96% 89%` | `38 50% 20%` |
| `--warning-fg` | `40 80% 27%` | `43 90% 65%` |
| `--error-bg` | `0 93% 94%` | `0 50% 18%` |
| `--error-fg` | `0 70% 35%` | `0 80% 70%` |
| `--info-bg` | `214 95% 93%` | `217 50% 22%` |
| `--info-fg` | `221 83% 45%` | `217 90% 72%` |

## Typography

| Property | Value |
|---|---|
| `--font-sans` | `"Inter", system-ui, -apple-system, sans-serif` |
| `--font-mono` | `"JetBrains Mono", "Fira Code", monospace` |

## Radius

| Property | Value |
|---|---|
| `--radius-sm` | `4px` |
| `--radius-md` | `6px` |
| `--radius-lg` | `8px` |
| `--radius-xl` | `12px` |
| `--radius-2xl` | `16px` |
| `--radius-full` | `9999px` |

## Spacing

| Property | Value |
|---|---|
| `--space-0` | `0px` |
| `--space-px` | `1px` |
| `--space-0-5` | `0.125rem` (2px) |
| `--space-1` | `0.25rem` (4px) |
| `--space-1-5` | `0.375rem` (6px) |
| `--space-2` | `0.5rem` (8px) |
| `--space-2-5` | `0.625rem` (10px) |
| `--space-3` | `0.75rem` (12px) |
| `--space-4` | `1rem` (16px) |
| `--space-5` | `1.25rem` (20px) |
| `--space-6` | `1.5rem` (24px) |
| `--space-8` | `2rem` (32px) |
| `--space-10` | `2.5rem` (40px) |
| `--space-12` | `3rem` (48px) |
| `--space-16` | `4rem` (64px) |

## Shadows

| Property | Light | Dark |
|---|---|---|
| `--shadow-xs` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` | `0 1px 2px 0 rgb(0 0 0 / 0.2)` |
| `--shadow-sm` | subtle dual-layer | stronger dual-layer |
| `--shadow-md` | medium spread (12px) | high-opacity (0.5) |
| `--shadow-lg` | large spread (32px) | high-opacity (0.5) |
| `--shadow-elevated` | `--shadow-md` + inset highlight | `--shadow-md` + faint inset |

See `styles/tokens/shadows.css` for full multi-layer values.

## Z-Index

| Property | Value |
|---|---|
| `--z-base` | `0` |
| `--z-dropdown` | `10` |
| `--z-sticky` | `20` |
| `--z-overlay` | `30` |
| `--z-sidebar` | `40` |
| `--z-modal` | `50` |
| `--z-popover` | `60` |
| `--z-toast` | `70` |

## Motion

### Keyframes

| Name | Effect |
|---|---|
| `toast-in` | Fade up 8px |
| `modal-in` | Fade + scale from 0.96 |
| `fade-in` | Opacity 0 to 1 |
| `slide-in` | Translate from right (100%) |

### Duration & Easing

| Property | Value |
|---|---|
| `--duration-fast` | `150ms` |
| `--duration-normal` | `200ms` |
| `--duration-slow` | `300ms` |
| `--ease-out` | `cubic-bezier(0.32, 0.72, 0, 1)` |

### Animation Shorthands

| Property | Value |
|---|---|
| `--animate-toast-in` | `toast-in var(--duration-normal) ease-out` |
| `--animate-modal-in` | `modal-in 180ms ease-out` |
| `--animate-fade-in` | `fade-in var(--duration-normal) ease-out` |
| `--animate-slide-in` | `slide-in 240ms var(--ease-out)` |
