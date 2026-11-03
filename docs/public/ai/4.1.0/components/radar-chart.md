# RadarChart

Package: @nannier/canvas
Version: 4.1.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: a6fbeb5731557d7d9a75c1ea15f26483ae43566809fb12c2a9add0ca4d3ff9e3

Source: `src/charts/radar-chart/radar-chart.md`
Human reference: https://canvas.nannier.com/components/radar-chart

## Public imports

```tsx
import { RadarChart } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

A polygonal multi-axis comparison: concentric rings at nice tick fractions, a spoke per axis, and one closed polygon per series (ramp stroke over a soft matching wash), with the spoke labels just beyond the outer ring. Values align to `axes` by index and the accessible name folds every axis and value; press-to-inspect is deferred scope for this chart.

## Usage

```tsx
<RadarChart
  title="Candidate comparison"
  axes={["Coding", "Design", "Comms", "Ops", "Product"]}
  series={[
    { label: "Casey", values: [8, 6, 9, 5, 7] },
    { label: "Jordan", values: [6, 9, 7, 8, 5] },
  ]}
/>
```

## Variants

### Single series, toned

```tsx
<RadarChart
  success
  axes={["Latency", "Uptime", "Errors", "Cost", "Coverage"]}
  series={[{ label: "API", values: [7, 9, 8, 6, 7] }]}
/>
```

### Compact, no grid

```tsx
<RadarChart
compact
hideGrid
axes={["Spd", "Pwr", "Def", "Mag", "Luck", "HP"]}
series={[{ label: "Build A", values: [12, 18, 9, 15, 7, 14] }]}
/>
```

### Compact with spokes

```tsx
<RadarChart compact spokes axes={["Speed", "Contrast", "Motion", "Density", "Reach", "A11y"]} max={10} series={[{label: "Current", values: [9, 7, 8, 6, 7.5, 5]}, {label: "Previous", values: [6, 8.5, 5, 8, 4.5, 7]}]} />
```

## Do & Don't

### RadarChart

**Do** - Compare a small number of profiles over the same axes, on one shared scale.

```tsx
<RadarChart
title="Candidate comparison"
axes={["Coding", "Design", "Comms", "Ops", "Product"]}
series={[
  { label: "Casey", values: [8, 6, 9, 5, 7] },
  { label: "Jordan", values: [6, 9, 7, 8, 5] },
]}
max={10}
/>
```

**Don't** - Radar axes are unordered categories; a time series belongs on a LineChart, where the x axis carries the order.

```tsx
<RadarChart
axes={["Jan", "Feb", "Mar", "Apr", "May", "Jun"]}
series={[{ label: "Revenue", values: [4, 5, 6, 7, 8, 9] }]}
/>
```

## Supported props

### RadarChartProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| axes | string[] | yes |  | Spoke labels, clockwise from 12 o'clock. |
| series | ChartSeries[] | yes |  | One polygon per series; values aligned to `axes` by index. |
| title | string \| undefined | no |  | Optional heading shown above the plot. |
| max | number \| undefined | no |  | Outer-ring maximum. Defaults to a nice bound above the data max. |
| success | boolean \| undefined | no | false | Tone (single-series only; pick one; default primary). Precedence: success > destructive. |
| destructive | boolean \| undefined | no | false | Tone (single-series only; pick one; default primary). Precedence: success > destructive. |
| compact | boolean \| undefined | no | false | Density (omit for the default plot size). |
| plain | boolean \| undefined | no | false | Strip the card surface for nesting inside an existing card (mirrors Stats). |
| hideLegend | boolean \| undefined | no | false | Hide the series legend (multi-series charts show one by default). |
| hideGrid | boolean \| undefined | no | false | Hide the rings and spokes (the labels always render). |
| spokes | boolean \| undefined | no | false | Join each outer vertex to the center with a radial guide. |
| formatValue | ((v: number) => string) \| undefined | no |  | Formats accessible values (data formatting, not styling). |
| testID | string \| undefined | no |  | E2E hook forwarded to the root element. |
| style | LayoutStyle | no |  | Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. |

See [installation](https://canvas.nannier.com/ai/4.1.0/installation.md) for required peers and feature fallbacks.
