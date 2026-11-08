# ComposedChart

Package: @nannier/canvas
Version: 4.3.1
Status: source-snapshot (not proof of an npm release)
Source SHA-256: cad8362f307ce0e914f64529ae9e6f6167ae84ffa078073eb1d3746d89c2808b

Source: `src/charts/composed-chart/composed-chart.md`
Human reference: https://canvas.nannier.com/components/composed-chart

## Public imports

```tsx
import { ComposedChart } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

Bars, lines, and gradient-washed areas sharing one categorical axis: each series picks its mark with a `line` or `area` boolean (bars by default; precedence line > area > bars).

The classic "revenue bars with a margin line" chart, on one shared zero-based y axis, with the same scrub-to-inspect, legend, and accessible-name contract as the other cartesian charts. For bar-only grouped data, reach for the bar `Chart`'s grouped mode instead; composed earns its keep when the marks mix.

## Usage

```tsx
<ComposedChart
  title="Revenue and margin"
  labels={["Q1", "Q2", "Q3", "Q4"]}
  series={[
    { label: "Revenue", values: [420, 510, 480, 620] },
    { label: "Margin", values: [110, 170, 150, 240], line: true }
  ]}
/>
```

## Variants

### Area backdrop

```tsx
<ComposedChart
  title="Traffic and conversions"
  labels={["Mon", "Tue", "Wed", "Thu", "Fri"]}
  series={[
    { label: "Sessions", values: [1200, 1420, 1310, 1680, 1540], area: true },
    { label: "Sign-ups", values: [240, 310, 280, 420, 380] }
  ]}
/>
```

### Dots and inspection

```tsx
<ComposedChart
  title="Deploys and incidents"
  labels={["W1", "W2", "W3", "W4", "W5", "W6"]}
  dots
  defaultSelected={3}
  series={[
    { label: "Deploys", values: [12, 18, 15, 22, 19, 24] },
    { label: "Incidents", values: [2, 1, 3, 1, 2, 1], line: true }
  ]}
/>
```

### Dashed target line

A `line` series marked `dashed` draws dashed, with a dashed rule as its legend swatch.

```tsx
<ComposedChart
  title="Revenue vs target"
  labels={["Q1", "Q2", "Q3", "Q4"]}
  series={[
    { label: "Revenue", values: [420, 510, 480, 620] },
    { label: "Target", values: [450, 500, 550, 600], line: true, dashed: true }
  ]}
/>
```

## Do & Don't

### ComposedChart

**Do** - Mix marks when the series mean different things: bars for the magnitude, a line for the derived rate.

```tsx
<ComposedChart
title="Revenue and margin"
labels={["Q1", "Q2", "Q3", "Q4"]}
series={[
  { label: "Revenue", values: [420, 510, 480, 620] },
  { label: "Margin", values: [110, 170, 150, 240], line: true },
]}
/>
```

**Don't** - All-bar composed data belongs on the bar Chart's grouped mode; composed adds nothing but indirection.

```tsx
<ComposedChart
labels={["Q1", "Q2", "Q3", "Q4"]}
series={[
  { label: "Revenue", values: [420, 510, 480, 620] },
  { label: "Costs", values: [310, 340, 330, 380] },
]}
/>
```

## Supported props

### ComposedChartProps

Includes `Omit<CartesianSeriesProps, "series">`; their supported fields are expanded below.

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| series | ComposedSeries[] | yes |  | The series to plot; each picks its mark (bars by default, `line`, or `area`). |
| dots | boolean \| undefined | no | false | Mark each line/area datum with a dot (auto-suppressed when bands are under 14px). |
| labels | string[] | yes |  | Category labels along the x axis, one per data column. |
| title | string \| undefined | no |  | Optional heading shown above the plot. |
| max | number \| undefined | no |  | Y-axis maximum override. Defaults to a nice bound above the data max. |
| min | number \| undefined | no |  | Y-axis minimum override. Defaults to 0 (or the data min when negative). |
| success | boolean \| undefined | no | false | Tone (single-series only; pick one; default is the primary fill). |
| destructive | boolean \| undefined | no | false | Tone (single-series only; pick one; default is the primary fill). |
| curved | boolean \| undefined | no | false | Curve (omit for straight segments). |
| compact | boolean \| undefined | no | false | Density (omit for the default plot size). |
| plain | boolean \| undefined | no | false | Strip the card surface for nesting inside an existing card (mirrors Stats). |
| hideLegend | boolean \| undefined | no | false | Furniture visibility. |
| hideGrid | boolean \| undefined | no | false | Furniture visibility. |
| hideAxes | boolean \| undefined | no | false | Furniture visibility. |
| formatValue | ((v: number) => string) \| undefined | no |  | Formats tick labels and accessible values (data formatting, not styling). |
| selected | number \| null \| undefined | no |  | Scrub-to-inspect: the selected category index (controlled). Pass null for none. |
| defaultSelected | number \| undefined | no |  | Scrub-to-inspect: the initially selected category (uncontrolled). |
| onSelect | ((index: number \| null) => void) \| undefined | no |  | Fired when a press/scrub selects a category (or clears it with null). |
| testID | string \| undefined | no |  | E2E hook forwarded to the root element. |
| style | LayoutStyle | no |  | Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. |

See [installation](https://canvas.nannier.com/ai/4.3.1/installation.md) for required peers and feature fallbacks.
