# RadialBarChart

Package: @nannier/canvas
Version: 4.1.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: 67dc17133b58d1a84056a7de4adc0eb91490ed8002a53a34897e3109a497dd42

Source: `src/charts/radial-bar-chart/radial-bar-chart.md`
Human reference: https://canvas.nannier.com/components/radial-bar-chart

## Public imports

```tsx
import { RadialBarChart } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

Concentric arc rings, one per category, outermost first: each pairs a muted full-circle track with a ramp-colored value arc revealed clockwise from 12 o'clock, and a column legend carries the formatted values. Every ring sweeps against the same `max` (the largest entry by default), so the chart compares attainment, not shares. Press a ring to select it (the others dim); press elsewhere to clear.

## Usage

```tsx
<RadialBarChart
  label="Platform activation"
  max={100}
  data={[
    { label: "iOS", value: 64 },
    { label: "Android", value: 48 },
    { label: "Web", value: 82 }
  ]}
/>
```

## Variants

### Compact, no legend

```tsx
<RadialBarChart
  compact
  hideLegend
  data={[
    { label: "Q1", value: 92 },
    { label: "Q2", value: 71 }
  ]}
/>
```

### Inspected

```tsx
<RadialBarChart
  defaultSelected={1}
  data={[
    { label: "Hot", value: 420 },
    { label: "Warm", value: 260 },
    { label: "Cold", value: 890 }
  ]}
/>
```

### Detailed attainment

```tsx
<RadialBarChart detailed max={80} formatValue={(v) => `${v}k`} data={[{label: "Phone", value: 64}, {label: "Tablet", value: 41}, {label: "Web", value: 23}]} />
```

## Do & Don't

### RadialBarChart

**Do** - Compare attainment on rings that share one sweep maximum, with the values in the legend.

```tsx
<Card padded>
  <RadialBarChart
    label="Platform activation"
    data={[
      { label: "iOS", value: 64 },
      { label: "Web", value: 82 },
    ]}
    max={100}
  />
</Card>
```

**Don't** - Rings encoding shares of a whole belong on PieChart; nested rings without a shared maximum cannot be compared by eye.

```tsx
<Card padded>
  <RadialBarChart
    label="Traffic split"
    data={[
      { label: "Direct", value: 60 },
      { label: "Search", value: 40 },
    ]}
  />
</Card>
```

## Supported props

### RadialBarChartProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| data | StackedSegment[] | yes |  | One ring per entry, outer to inner. |
| label | string \| undefined | no |  | What the rings measure (e.g. "Platform activation"); leads the accessible name. |
| max | number \| undefined | no |  | The value of a full sweep. Defaults to the largest entry. |
| compact | boolean \| undefined | no | false | Density (omit for the default 160 disc; compact is 120). |
| plain | boolean \| undefined | no | false | Strip the card surface for nesting inside an existing card (mirrors Stats). |
| hideLegend | boolean \| undefined | no | false | Hide the value legend (the accessible name still carries every value). |
| detailed | boolean \| undefined | no | false | A compact disc with a separate value column and shared maximum caption. |
| formatValue | ((v: number) => string) \| undefined | no |  | Formats legend values (data formatting, not styling). |
| selected | number \| null \| undefined | no |  | Press-to-inspect: the selected ring index (controlled). Pass null for none. |
| defaultSelected | number \| undefined | no |  | Press-to-inspect: the initially selected ring (uncontrolled). |
| onSelect | ((index: number \| null) => void) \| undefined | no |  | Fired when a press selects a ring (or clears it with null). |
| testID | string \| undefined | no |  | E2E hook forwarded to the root element. |
| style | LayoutStyle | no |  | For sizing/composition only. |

See [installation](https://canvas.nannier.com/ai/4.1.0/installation.md) for required peers and feature fallbacks.
