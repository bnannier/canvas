# DepthChart

Package: @nannier/canvas
Version: 4.1.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: 67dc17133b58d1a84056a7de4adc0eb91490ed8002a53a34897e3109a497dd42

Source: `src/charts/depth-chart/depth-chart.md`
Human reference: https://canvas.nannier.com/components/depth-chart

## Public imports

```tsx
import { DepthChart } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

The order-book view: cumulative bid and ask step areas mirrored around the spread, bids in the success tone and asks in destructive, on a numeric price axis.

## Usage

```tsx
<DepthChart
  title="OLY order book"
  bids={[
    { price: 191.3, size: 80 },
    { price: 191.15, size: 120 },
    { price: 191.0, size: 116 },
    { price: 190.85, size: 118 },
    { price: 190.7, size: 176 },
    { price: 190.55, size: 190 },
    { price: 190.4, size: 210 },
    { price: 190.25, size: 236 }
  ]}
  asks={[
    { price: 191.6, size: 90 },
    { price: 191.75, size: 122 },
    { price: 191.9, size: 110 },
    { price: 192.05, size: 154 },
    { price: 192.2, size: 154 },
    { price: 192.35, size: 210 },
    { price: 192.5, size: 222 },
    { price: 192.65, size: 240 }
  ]}
/>
```

## Variants

### Compact

```tsx
<DepthChart
  compact
  bids={[
    { price: 191.3, size: 90 },
    { price: 191.15, size: 150 },
    { price: 191.0, size: 220 },
    { price: 190.85, size: 310 },
    { price: 190.7, size: 420 }
  ]}
  asks={[
    { price: 191.6, size: 110 },
    { price: 191.75, size: 180 },
    { price: 191.9, size: 260 },
    { price: 192.05, size: 350 },
    { price: 192.2, size: 470 }
  ]}
/>
```

### Spread guide

`spread` draws a dashed guide midway between the best bid and the best ask, with its label in a pill at the guide's top.

```tsx
<DepthChart
  title="OLY order book"
  spread="spread 0.16%"
  bids={[
    { price: 191.3, size: 80 },
    { price: 191.0, size: 116 },
    { price: 190.7, size: 176 }
  ]}
  asks={[
    { price: 191.6, size: 90 },
    { price: 191.9, size: 110 },
    { price: 192.2, size: 154 }
  ]}
/>
```

## Do & Don't

### Both sides of the book

**Do**: Pass the bids and the asks together; the two sides meet at the spread, the gap a trader reads first.

```tsx
<DepthChart
  compact
  bids={[
    { price: 191.3, size: 90 },
    { price: 191.15, size: 150 },
    { price: 191.0, size: 220 },
    { price: 190.85, size: 310 },
    { price: 190.7, size: 420 }
  ]}
  asks={[
    { price: 191.6, size: 110 },
    { price: 191.75, size: 180 },
    { price: 191.9, size: 260 },
    { price: 192.05, size: 350 },
    { price: 192.2, size: 470 }
  ]}
/>
```

**Don't**: Plot one side alone: with no asks the price axis covers only the bids, nothing marks the spread, and the Asks legend entry labels nothing.

```tsx
<DepthChart
  compact
  bids={[
    { price: 191.3, size: 90 },
    { price: 191.15, size: 150 },
    { price: 191.0, size: 220 },
    { price: 190.85, size: 310 },
    { price: 190.7, size: 420 }
  ]}
  asks={[]}
/>
```

## Supported props

### DepthChartProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| bids | DepthLevel[] | yes |  | Bid levels (any order; sorted internally). |
| asks | DepthLevel[] | yes |  | Ask levels (any order; sorted internally). |
| title | string \| undefined | no |  | Optional heading shown above the plot. |
| compact | boolean \| undefined | no | false | Density (omit for the default plot size). |
| plain | boolean \| undefined | no | false | Strip the card surface for nesting inside an existing card (mirrors Stats). |
| hideLegend | boolean \| undefined | no | false | Furniture visibility. |
| hideGrid | boolean \| undefined | no | false | Furniture visibility. |
| hideAxes | boolean \| undefined | no | false | Furniture visibility. |
| formatValue | ((v: number) => string) \| undefined | no |  | Formats tick labels and accessible values (data formatting, not styling). |
| spread | string \| undefined | no |  | The spread's label ("spread 0.12%"): drawn as a dashed guide midway between the best bid and the best ask, with this label in a pill at its top. Omit for no guide. |
| testID | string \| undefined | no |  | E2E hook forwarded to the root element. |
| style | LayoutStyle | no |  | Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. |

See [installation](https://canvas.nannier.com/ai/4.1.0/installation.md) for required peers and feature fallbacks.
