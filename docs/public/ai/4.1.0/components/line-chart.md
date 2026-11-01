# LineChart

Package: @nannier/canvas
Version: 4.1.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: 63292636c7ff2f224185aef7c96ac78124f9170a170b90ee11718addfa280643

Source: `src/charts/line-chart/line-chart.md`
Human reference: https://canvas.nannier.com/components/line-chart

## Public imports

```tsx
import { LineChart } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

Categorical-x series lines with nice y ticks, gridlines, and a legend for multiple series.

`curved` draws a monotone cubic that never overshoots the data, `dots` marks each datum, and `baseline` + `fade` give the trading-app price idiom (dashed previous close, gain/loss auto tone, gradient fill). A series that means success or failure carries its own `success` / `destructive` tone instead of a ramp color. Press or scrub the plot to inspect a category.

## Usage

```tsx
<LineChart
  title="Active users"
  labels={["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"]}
  series={[
    { label: "Web", values: [119, 122, 131, 147, 157, 176, 182] },
    { label: "Mobile", values: [63, 93, 101, 121, 162, 207, 251] }
  ]}
/>
```

## Variants

### Curved

```tsx
<LineChart
  title="Signups"
  labels={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
  series={[{ label: "Signups", values: [24, 31, 28, 42, 39, 47, 51] }]}
  curved
/>
```

### Dots

```tsx
<LineChart
  title="Signups"
  labels={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
  series={[{ label: "Signups", values: [24, 31, 28, 42, 39, 47, 51] }]}
  dots
/>
```

### Compact

```tsx
<LineChart
  compact
  title="Signups"
  labels={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
  series={[{ label: "Signups", values: [24, 31, 28, 42, 39, 47, 51] }]}
/>
```

### Success vs failure

```tsx
<LineChart
  title="Sign-ins"
  labels={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
  series={[
    { label: "Granted", values: [812, 905, 874, 961, 1024, 640, 588], success: true },
    { label: "Denied", values: [41, 38, 56, 47, 62, 29, 24], destructive: true }
  ]}
/>
```

### Gradient fade, multi-series

```tsx
<LineChart
  title="Sessions by platform"
  labels={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
  series={[
    { label: "Web", values: [42, 48, 45, 61, 58, 71, 84] },
    { label: "iOS", values: [28, 31, 36, 34, 41, 49, 56] }
  ]}
  fade
/>
```

### Price vs previous close

```tsx
<LineChart
  title="OLY · today"
  labels={["9:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "1:00"]}
  series={[{ label: "Price", values: [186.1, 187.5, 186.8, 187.4, 188.1, 188.9, 190.5, 191.7] }]}
  baseline={188}
  fade
/>
```

### Formatted values

```tsx
<LineChart
  title="Monthly recurring revenue"
  labels={["Jan", "Feb", "Mar", "Apr", "May", "Jun"]}
  series={[{ label: "MRR", values: [112, 118, 127, 125, 138, 151] }]}
  formatValue={(v) => `$${v}k`}
/>
```

### Press to inspect

```tsx
<LineChart
  title="Active users"
  labels={["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"]}
  series={[
    { label: "Web", values: [204, 229, 252, 254, 271, 275, 272, 274] },
    { label: "Mobile", values: [128, 155, 167, 183, 185, 199, 220, 228] }
  ]}
  defaultSelected={5}
/>
```

### Dashed series

A series marked `dashed` draws its line dashed with flat ends, and its legend swatch is a dashed rule: a target or a forecast beside the measured line.

```tsx
<LineChart
  title="Signups vs target"
  labels={["Mon", "Tue", "Wed", "Thu", "Fri"]}
  series={[
    { label: "Signups", values: [42, 48, 45, 61, 58] },
    { label: "Target", values: [50, 50, 50, 50, 50], dashed: true }
  ]}
/>
```

## Do & Don't

### Line

**Do** — Compare series that share one scale, and let the legend plus the fixed series colors carry identity.

```tsx
<LineChart
title="Signups"
labels={["Jan", "Feb", "Mar", "Apr", "May", "Jun"]}
series={[
  { label: "Web", values: [120, 180, 150, 240, 300, 280] },
  { label: "Mobile", values: [60, 90, 140, 160, 220, 260] }
]}
curved
/>

```

**Don't** — Mix measures of different scales on one axis: the smaller series flatlines against the baseline and reads as noise. Normalize, or use two charts.

```tsx
<LineChart
title="Revenue vs conversion"
labels={["Jan", "Feb", "Mar", "Apr", "May", "Jun"]}
series={[
  { label: "Revenue", values: [12000, 18000, 15000, 24000, 30000, 28000] },
  { label: "Conversion rate", values: [2.1, 2.4, 2.2, 2.8, 3.1, 3] }
]}
/>

```

## Supported props

### LineChartProps

Includes `CartesianSeriesProps`; their supported fields are expanded below.

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| dots | boolean \| undefined | no | false | Mark each datum with a dot. |
| baseline | number \| undefined | no |  | Reference value (e.g. previous close) drawn as a dashed line. A single series with no explicit tone auto-tones success/destructive by whether its last value sits above or below the baseline - the trading-app gain/loss idiom. |
| fade | boolean \| undefined | no | false | Soft gradient fade under the lead (first) series' line (the price-chart look). |
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

See [installation](https://canvas.nannier.com/ai/4.1.0/installation.md) for required peers and feature fallbacks.
