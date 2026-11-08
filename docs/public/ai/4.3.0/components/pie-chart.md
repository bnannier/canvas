# PieChart

Package: @nannier/canvas
Version: 4.3.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: f07b9941fca03566f384a012745e4b377b2202f6f02f07a32a89796fc27a7ec3

Source: `src/charts/pie-chart/pie-chart.md`
Human reference: https://canvas.nannier.com/components/pie-chart

## Public imports

```tsx
import { PieChart } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

Proportional composition as arc slices in the `chart-1`..`chart-8` token colors, with a percent legend. `donut` centers the total (or the selected slice while inspecting); pressing a slice dims the others.

## Usage

```tsx
<PieChart
  label="Traffic"
  slices={[
    { label: "Direct", value: 42 },
    { label: "Organic search", value: 28 },
    { label: "Social", value: 18 },
    { label: "Other", value: 12 }
  ]}
/>
```

## Variants

### Donut

```tsx
<PieChart
  donut
  label="Traffic"
  slices={[
    { label: "Direct", value: 42 },
    { label: "Organic search", value: 28 },
    { label: "Social", value: 18 },
    { label: "Other", value: 12 }
  ]}
/>
```

### Detailed composition

```tsx
<PieChart donut detailed label="Sessions" slices={[{label: "Direct", value: 42}, {label: "Search", value: 28}, {label: "Other", value: 30}]} />
```

## Do & Don't

### Pie

**Do** — Keep slices to a handful and fold the tail into an "Other" slice; the legend carries exact shares.

```tsx
<Card padded>
  <PieChart
    label="Traffic"
    slices={[
      { label: "Direct", value: 42 },
      { label: "Organic search", value: 28 },
      { label: "Social", value: 18 },
      { label: "Other", value: 12 }
    ]}
  />
</Card>

```

**Don't** — A dozen sliver slices cycle the palette and become unreadable; nothing is comparable at a glance.

```tsx
<Card padded>
  <PieChart
    label="Traffic"
    slices={[
      { label: "Direct", value: 22 },
      { label: "Organic", value: 18 },
      { label: "Social", value: 11 },
      { label: "Referral", value: 9 },
      { label: "Email", value: 8 },
      { label: "Paid", value: 7 },
      { label: "Video", value: 6 },
      { label: "Affiliates", value: 6 },
      { label: "Push", value: 5 },
      { label: "SMS", value: 4 },
      { label: "Podcasts", value: 2 },
      { label: "Misc", value: 2 }
    ]}
  />
</Card>

```

## Supported props

### PieChartProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| slices | StackedSegment[] | yes |  | The slices, in order; each takes its share of the circle. |
| label | string \| undefined | no |  | What the pie measures (e.g. "Traffic sources"); leads the accessible name. |
| donut | boolean \| undefined | no | false | Draw an annular ring with the total and label centered inside. |
| hideLegend | boolean \| undefined | no | false | Hide the legend (the labelled dots beside percentages). |
| detailed | boolean \| undefined | no | false | Spread names and shares into a value column beside a compact composition disc. |
| compact | boolean \| undefined | no | false | Smaller diameter. |
| plain | boolean \| undefined | no | false | Strip the card surface for nesting inside an existing card (mirrors Stats). |
| selected | number \| null \| undefined | no |  | Press-to-inspect: the selected slice index (controlled). Pass null for none. |
| defaultSelected | number \| undefined | no |  | Press-to-inspect: the initially selected slice (uncontrolled). |
| onSelect | ((index: number \| null) => void) \| undefined | no |  | Fired when a press selects a slice (or clears it with null). |
| testID | string \| undefined | no |  | E2E hook forwarded to the root element. |
| style | LayoutStyle | no |  | For sizing/composition only. |

See [installation](https://canvas.nannier.com/ai/4.3.0/installation.md) for required peers and feature fallbacks.
