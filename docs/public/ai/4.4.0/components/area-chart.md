# AreaChart

Package: @nannier/canvas
Version: 4.4.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: 35b0556b3cf4787d8b9cdf8a7e93b47c770a9726957905f5b8d3a812e5fea783

Source: `src/charts/area-chart/area-chart.md`
Human reference: https://canvas.nannier.com/components/area-chart

## Public imports

```tsx
import { AreaChart } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

Categorical-x series fills: overlapping translucent areas by default, or running-sum bands with `stacked`. Shares the line chart's curve, density, furniture, and scrub-to-inspect axes.

## Usage

```tsx
<AreaChart
  labels={["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"]}
  series={[
    { label: "Total", values: [120, 138, 151, 149, 168, 184, 197, 212] },
    { label: "Paid", values: [42, 51, 58, 63, 71, 84, 92, 104] }
  ]}
/>
```

## Variants

### Stacked

```tsx
<AreaChart
  stacked
  labels={["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"]}
  series={[
    { label: "Direct", values: [37, 46, 49, 61, 53, 49, 54, 56] },
    { label: "Search", values: [77, 90, 83, 82, 82, 85, 85, 92] },
    { label: "Social", values: [18, 28, 34, 41, 48, 55, 50, 57] }
  ]}
/>
```

## Do & Don't

### Stacking

**Do**: Stack series that are parts of one total, like sessions by device; the top edge is the total and each band is its share.

```tsx
<AreaChart
  stacked
  labels={["Jan", "Feb", "Mar", "Apr", "May", "Jun"]}
  series={[
    { label: "Mobile", values: [42, 48, 51, 57, 63, 70] },
    { label: "Desktop", values: [35, 36, 38, 37, 40, 41] },
    { label: "Tablet", values: [8, 9, 9, 10, 11, 11] }
  ]}
/>
```

**Don't**: Stack rates that do not add up; conversion, bounce and churn rates summed into one band draw a total that means nothing.

```tsx
<AreaChart
  stacked
  labels={["Jan", "Feb", "Mar", "Apr", "May", "Jun"]}
  series={[
    { label: "Conversion rate", values: [3.1, 3.4, 3.2, 3.8, 4.0, 4.2] },
    { label: "Bounce rate", values: [41, 39, 40, 37, 36, 35] },
    { label: "Churn rate", values: [2.4, 2.2, 2.5, 2.1, 2.0, 1.9] }
  ]}
/>
```

## Supported props

### AreaChartProps

Includes `CartesianSeriesProps`; their supported fields are expanded below.

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| stacked | boolean \| undefined | no | false | Stack the series (running sums) instead of overlapping translucent fills. |
| labels | string[] | yes |  | Category labels along the x axis, one per data column. |
| series | ChartSeries[] | yes |  | The series to plot; colors follow the chart-1..8 tokens in fixed order, or a series' own `success`/`destructive` tone. |
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

See [installation](https://canvas.nannier.com/ai/4.4.0/installation.md) for required peers and feature fallbacks.
