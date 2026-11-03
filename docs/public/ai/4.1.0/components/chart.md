# Chart

Package: @nannier/canvas
Version: 4.1.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: e09f8965dff7d0af07ba1dd1deaa62611de669dfcb059d93145325e8bdbb1cbc

Source: `src/charts/chart/chart.md`
Human reference: https://canvas.nannier.com/components/chart

## Public imports

```tsx
import { Chart } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

A single- or multi-series bar chart: vertical columns (or horizontal rows) sized against the axis max, with per-category values and labels.

Pass `labels` + `series` for grouped clusters colored by the `chart-1`..`chart-8` tokens, add `stacked` to accumulate those series within one column per category, or give a series its own `success` / `destructive` tone when it means success or failure; press or scrub a category to inspect it.

## Usage

```tsx
<Chart
  title="Signups"
  data={[
    { label: "Mon", value: 45 },
    { label: "Tue", value: 60 },
    { label: "Wed", value: 35 },
    { label: "Thu", value: 70 },
    { label: "Fri", value: 55 },
    { label: "Sat", value: 80 },
    { label: "Sun", value: 95 }
  ]}
  max={100}
/>
```

## Variants

### Grouped bars

```tsx
<Chart
  labels={["Q1", "Q2", "Q3", "Q4"]}
  series={[
    { label: "Revenue", values: [62, 70, 84, 89] },
    { label: "Costs", values: [41, 48, 55, 59] },
    { label: "Profit", values: [21, 22, 29, 30] }
  ]}
/>
```

### Stacked columns

```tsx
<Chart
  stacked
  labels={["acme", "globex", "initech", "umbrella"]}
  series={[
    { label: "Authorization code", values: [1840, 1210, 960, 640] },
    { label: "Client credentials", values: [920, 1480, 340, 1120] },
    { label: "Refresh token", values: [610, 380, 720, 290] }
  ]}
/>
```

### Success vs failure

```tsx
<Chart
  labels={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
  series={[
    { label: "Granted", values: [812, 905, 874, 961, 1024, 640, 588], success: true },
    { label: "Denied", values: [41, 38, 56, 47, 62, 29, 24], destructive: true }
  ]}
/>
```

### Horizontal rows

```tsx
<Chart
  horizontal
  data={[
    { label: "Atoms", value: 92 },
    { label: "Molecules", value: 78 },
    { label: "Organisms", value: 64 },
    { label: "Charts", value: 85 }
  ]}
/>
```

### Tones

```tsx
<Column loose>
  <Chart
    success
    data={[
      { label: "Mon", value: 82 },
      { label: "Tue", value: 88 },
      { label: "Wed", value: 91 },
      { label: "Thu", value: 86 },
      { label: "Fri", value: 94 }
    ]}
  />
  <Chart
    destructive
    data={[
      { label: "Mon", value: 14 },
      { label: "Tue", value: 9 },
      { label: "Wed", value: 22 },
      { label: "Thu", value: 12 },
      { label: "Fri", value: 7 }
    ]}
  />
</Column>
```

### Formatted values

`formatValue` formats the value axis, the inspected value and the accessible values; it is data formatting, not styling.

```tsx
<Chart
  title="Requests"
  data={[
    { label: "Mon", value: 12400 },
    { label: "Tue", value: 15100 },
    { label: "Wed", value: 13800 },
    { label: "Thu", value: 16900 }
  ]}
  formatValue={(v) => v.toLocaleString("en-US")}
/>
```

## Do & Don't

### Bar

**Do** — Keep a labelled axis row and a single bar tone so the buckets read at a glance.

```tsx
<Chart title="Signups" max={100} data={[
  { label: "Mon", value: 45 },
  { label: "Tue", value: 60 },
  { label: "Wed", value: 35 },
  { label: "Thu", value: 70 },
  { label: "Fri", value: 55 },
  { label: "Sat", value: 80 },
  { label: "Sun", value: 95 }
]} />

```

**Don't** — Every bar the same full-strength fill and no labels: nothing is emphasized and the axis is unreadable.

```tsx
<View style={{ borderRadius: 8, borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens.card, padding: 20, maxWidth: 560 }}>
  <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 4, height: 120, width: 520, maxWidth: "100%" }}>
    <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: "0%", borderTopLeftRadius: 4, borderTopRightRadius: 4, backgroundColor: tokens.primary, height: 63 }} />
    <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: "0%", borderTopLeftRadius: 4, borderTopRightRadius: 4, backgroundColor: tokens.primary, height: 84 }} />
    <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: "0%", borderTopLeftRadius: 4, borderTopRightRadius: 4, backgroundColor: tokens.primary, height: 49 }} />
    <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: "0%", borderTopLeftRadius: 4, borderTopRightRadius: 4, backgroundColor: tokens.primary, height: 98 }} />
    <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: "0%", borderTopLeftRadius: 4, borderTopRightRadius: 4, backgroundColor: tokens.primary, height: 77 }} />
    <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: "0%", borderTopLeftRadius: 4, borderTopRightRadius: 4, backgroundColor: tokens.primary, height: 112 }} />
    <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: "0%", borderTopLeftRadius: 4, borderTopRightRadius: 4, backgroundColor: tokens.primary, height: 118 }} />
  </View>
</View>

```

## Supported props

### ChartProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| data | ChartDatum[] \| undefined | no |  | The bars to render, in order (single-series mode). |
| labels | string[] \| undefined | no |  | Category labels along the x axis (grouped mode, with `series`). |
| series | ChartSeries[] \| undefined | no |  | Multiple series rendered as grouped columns per category, colored by the chart-1..8 tokens (or a series' own `success`/`destructive` tone). |
| stacked | boolean \| undefined | no | false | Stack the grouped series within one column per category (composition) instead of clustering them side by side. |
| title | string \| undefined | no |  | Optional heading shown above the plot. |
| max | number \| undefined | no |  | Axis maximum. Defaults to the largest value in the data (the largest category TOTAL when `stacked`). |
| success | boolean \| undefined | no | false | Tone (pick one; default is the primary fill). Single-series only. |
| destructive | boolean \| undefined | no | false | Tone (pick one; default is the primary fill). Single-series only. |
| horizontal | boolean \| undefined | no | false | Orientation (default is a vertical column chart). Single-series only. |
| compact | boolean \| undefined | no | false | Density (default is the standard plot size). |
| plain | boolean \| undefined | no | false | Strip the card surface for nesting inside an existing card (mirrors Stats). |
| hideLegend | boolean \| undefined | no | false | Hide the series legend (grouped mode shows one by default). |
| selected | number \| null \| undefined | no |  | Press-to-inspect: the selected category index (controlled). Pass null for none. Vertical charts only. |
| defaultSelected | number \| undefined | no |  | Press-to-inspect: the initially selected category (uncontrolled). |
| onSelect | ((index: number \| null) => void) \| undefined | no |  | Fired when a press selects a category (or clears it with null). |
| formatValue | ((v: number) => string) \| undefined | no |  | Formats the value axis, the inspected value and the accessible values (data formatting, not styling). |
| testID | string \| undefined | no |  | E2E hook forwarded to the root element. |
| style | LayoutStyle | no |  | Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. |

See [installation](https://canvas.nannier.com/ai/4.1.0/installation.md) for required peers and feature fallbacks.
