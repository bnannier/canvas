# ScatterPlot

Package: @nannier/canvas
Version: 4.2.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: 85d17357eddcab1909bcb59630a0c4a1f1513f08d3a6dcf5378eb84c847dee94

Source: `src/charts/scatter-plot/scatter-plot.md`
Human reference: https://canvas.nannier.com/components/scatter-plot

## Public imports

```tsx
import { ScatterPlot } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

Numeric x/y point clouds with nice ticks on both axes and horizontal gridlines. Multi-series clouds use the series tokens; pressing near a point rings it and flags its coordinates.

## Usage

```tsx
<ScatterPlot
  title="Load vs latency"
  series={[
    { label: "us-east", points: [{ x: 94, y: 20 }, { x: 220, y: 37 }, { x: 339, y: 63 }, { x: 446, y: 71 }, { x: 596, y: 99 }, { x: 741, y: 115 }] },
    { label: "eu-west", points: [{ x: 114, y: 33 }, { x: 227, y: 52 }, { x: 340, y: 92 }, { x: 455, y: 111 }, { x: 579, y: 129 }, { x: 737, y: 141 }] },
    { label: "ap-south", points: [{ x: 133, y: 45 }, { x: 251, y: 72 }, { x: 377, y: 102 }, { x: 492, y: 135 }, { x: 613, y: 161 }, { x: 740, y: 171 }] }
  ]}
/>
```

## Variants

### Compact single series

```tsx
<ScatterPlot
  compact
  series={[
    { label: "Campaigns", points: [{ x: 1.2, y: 14 }, { x: 2.8, y: 26 }, { x: 4.2, y: 38 }, { x: 5.9, y: 46 }, { x: 7.3, y: 58 }, { x: 8.1, y: 63 }] }
  ]}
/>
```

## Do & Don't

### Series per group

**Do**: Split the points into one series per group; each takes its own series color and a legend entry, so the clusters can be told apart.

```tsx
<ScatterPlot
  compact
  series={[
    { label: "us-east", points: [{ x: 94, y: 20 }, { x: 220, y: 37 }, { x: 339, y: 63 }, { x: 446, y: 71 }, { x: 596, y: 99 }, { x: 741, y: 115 }] },
    { label: "eu-west", points: [{ x: 114, y: 33 }, { x: 227, y: 52 }, { x: 340, y: 92 }, { x: 455, y: 111 }, { x: 579, y: 129 }, { x: 737, y: 141 }] },
    { label: "ap-south", points: [{ x: 133, y: 45 }, { x: 251, y: 72 }, { x: 377, y: 102 }, { x: 492, y: 135 }, { x: 613, y: 161 }, { x: 740, y: 171 }] }
  ]}
/>
```

**Don't**: Pour every group into one series; the points share one color and no legend, and the clusters run together.

```tsx
<ScatterPlot
  compact
  series={[
    { label: "All regions", points: [{ x: 94, y: 20 }, { x: 220, y: 37 }, { x: 339, y: 63 }, { x: 446, y: 71 }, { x: 596, y: 99 }, { x: 741, y: 115 }, { x: 114, y: 33 }, { x: 227, y: 52 }, { x: 340, y: 92 }, { x: 455, y: 111 }, { x: 579, y: 129 }, { x: 737, y: 141 }, { x: 133, y: 45 }, { x: 251, y: 72 }, { x: 377, y: 102 }, { x: 492, y: 135 }, { x: 613, y: 161 }, { x: 740, y: 171 }] }
  ]}
/>
```

## Supported props

### ScatterPlotProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| series | ScatterSeries[] | yes |  | The point clouds; colors follow the chart-1..8 tokens in fixed order. |
| title | string \| undefined | no |  | Optional heading shown above the plot. |
| success | boolean \| undefined | no | false | Tone (single-series only; pick one; default is the primary fill). |
| destructive | boolean \| undefined | no | false | Tone (single-series only; pick one; default is the primary fill). |
| compact | boolean \| undefined | no | false | Density (omit for the default plot size). |
| plain | boolean \| undefined | no | false | Strip the card surface for nesting inside an existing card (mirrors Stats). |
| hideLegend | boolean \| undefined | no | false | Furniture visibility. |
| hideGrid | boolean \| undefined | no | false | Furniture visibility. |
| hideAxes | boolean \| undefined | no | false | Furniture visibility. |
| formatValue | ((v: number) => string) \| undefined | no |  | Formats tick labels and accessible values (data formatting, not styling). |
| selected | ScatterSelection \| null \| undefined | no |  | Press-to-inspect: the selected point (controlled). Pass null for none. |
| defaultSelected | ScatterSelection \| undefined | no |  | Press-to-inspect: the initially selected point (uncontrolled). |
| onSelect | ((selection: ScatterSelection \| null) => void) \| undefined | no |  | Fired when a press selects a point (or clears it with null). |
| testID | string \| undefined | no |  | E2E hook forwarded to the root element. |
| style | LayoutStyle | no |  | Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. |

See [installation](https://canvas.nannier.com/ai/4.2.0/installation.md) for required peers and feature fallbacks.
