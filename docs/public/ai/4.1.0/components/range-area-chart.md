# RangeAreaChart

Package: @nannier/canvas
Version: 4.1.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: e09f8965dff7d0af07ba1dd1deaa62611de669dfcb059d93145325e8bdbb1cbc

Source: `src/charts/range-area-chart/range-area-chart.md`
Human reference: https://canvas.nannier.com/components/range-area-chart

## Public imports

```tsx
import { RangeAreaChart } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

A min/max envelope: a translucent band between each label's `low` and `high`, an optional solid `mid` line through it, and the standard scrub-to-inspect flag showing High, Mid, and Low. The y domain hugs the data rather than anchoring at zero, since an envelope is a range idiom, not a magnitude bar. Forecast bands, error envelopes, and daily temperature ranges all read this way.

## Usage

```tsx
<RangeAreaChart
  label="p50 to p99"
  labels={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
  data={[
    { low: 42, high: 118, mid: 61 },
    { low: 38, high: 102, mid: 55 },
    { low: 44, high: 131, mid: 66 },
    { low: 40, high: 95, mid: 52 },
    { low: 47, high: 144, mid: 71 },
    { low: 36, high: 88, mid: 49 },
    { low: 34, high: 81, mid: 46 },
  ]}
/>
```

## Variants

### Band only

```tsx
<RangeAreaChart
  labels={["Jan", "Feb", "Mar", "Apr", "May", "Jun"]}
  data={[
    { low: -4, high: 6 },
    { low: -2, high: 9 },
    { low: 2, high: 14 },
    { low: 7, high: 19 },
    { low: 11, high: 24 },
    { low: 15, high: 28 },
  ]}
/>
```

### Success tone, inspected

```tsx
<RangeAreaChart
  label="Confidence band"
  success
  defaultSelected={2}
  labels={["W1", "W2", "W3", "W4"]}
  data={[
    { low: 90, high: 110, mid: 100 },
    { low: 95, high: 125, mid: 108 },
    { low: 100, high: 140, mid: 118 },
    { low: 104, high: 158, mid: 129 },
  ]}
/>
```

## Do & Don't

### RangeAreaChart

**Do** - Encode uncertainty as the band and the estimate as the mid line, in one mark.

```tsx
<RangeAreaChart
title="Forecast"
label="Confidence band"
labels={["W1", "W2", "W3", "W4"]}
data={[
  { low: 90, high: 110, mid: 100 },
  { low: 95, high: 125, mid: 108 },
  { low: 100, high: 140, mid: 118 },
  { low: 104, high: 158, mid: 129 },
]}
/>
```

**Don't** - Two separate lines for low and high leave the envelope unreadable as a region and double the legend.

```tsx
<LineChart
labels={["W1", "W2", "W3", "W4"]}
series={[
  { label: "Low", values: [90, 95, 100, 104] },
  { label: "High", values: [110, 125, 140, 158] },
]}
/>
```

## Supported props

### RangeAreaChartProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| labels | string[] | yes |  | Category labels along the x axis, one per data column. |
| data | RangePoint[] | yes |  | One range per label, aligned by index. |
| label | string \| undefined | no |  | Names the envelope (e.g. "Forecast"); leads the accessible name and the flag. |
| title | string \| undefined | no |  | Optional heading shown above the plot. |
| success | boolean \| undefined | no | false | Tone (pick one; default primary). Precedence: success > destructive. |
| destructive | boolean \| undefined | no | false | Tone (pick one; default primary). Precedence: success > destructive. |
| curved | boolean \| undefined | no | false | Curve (omit for straight segments). |
| compact | boolean \| undefined | no | false | Density (omit for the default plot size). |
| plain | boolean \| undefined | no | false | Strip the card surface for nesting inside an existing card (mirrors Stats). |
| hideGrid | boolean \| undefined | no | false | Furniture visibility. |
| hideAxes | boolean \| undefined | no | false | Furniture visibility. |
| formatValue | ((v: number) => string) \| undefined | no |  | Formats tick labels and accessible values (data formatting, not styling). |
| selected | number \| null \| undefined | no |  | Scrub-to-inspect: the selected category index (controlled). Pass null for none. |
| defaultSelected | number \| undefined | no |  | Scrub-to-inspect: the initially selected category (uncontrolled). |
| onSelect | ((index: number \| null) => void) \| undefined | no |  | Fired when a press/scrub selects a category (or clears it with null). |
| testID | string \| undefined | no |  | E2E hook forwarded to the root element. |
| style | LayoutStyle | no |  | Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. |

See [installation](https://canvas.nannier.com/ai/4.1.0/installation.md) for required peers and feature fallbacks.
