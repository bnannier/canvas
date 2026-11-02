# WaterfallChart

Package: @nannier/canvas
Version: 4.1.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: 4e9a344e7cf8e99f7847528281f6c8f82eec5f1dd2864f552950f6404318c1a5

Source: `src/charts/waterfall-chart/waterfall-chart.md`
Human reference: https://canvas.nannier.com/components/waterfall-chart

## Public imports

```tsx
import { WaterfallChart } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

The running-total bridge: each step floats from the running total by its signed `value`, and a `total` step snapshots the running total as an absolute bar from zero.

The coloring is fixed semantics rather than a prop: rises green, falls red, totals the brand primary, so every bridge reads the same way. Scrubbing a step flags its change and running total.

## Usage

```tsx
<WaterfallChart
  title="Q3 revenue bridge"
  steps={[
    { label: "Q2", value: 4200, total: true },
    { label: "New", value: 980 },
    { label: "Expansion", value: 460 },
    { label: "Churn", value: -540 },
    { label: "FX", value: -120 },
    { label: "Q3", total: true },
  ]}
/>
```

## Variants

### Signed steps only

```tsx
<WaterfallChart
  steps={[
    { label: "Hired", value: 24 },
    { label: "Backfill", value: 8 },
    { label: "Attrition", value: -11 },
    { label: "Transfers", value: -3 },
    { label: "Net", total: true },
  ]}
/>
```

### Compact, inspected

```tsx
<WaterfallChart
  compact
  defaultSelected={2}
  steps={[
    { label: "Start", value: 100, total: true },
    { label: "Wins", value: 30 },
    { label: "Losses", value: -12 },
    { label: "End", total: true },
  ]}
/>
```

## Do & Don't

### WaterfallChart

**Do** - Bridge from one total to the next with signed steps; let the fixed coloring carry rise and fall.

```tsx
<WaterfallChart
title="Q3 revenue bridge"
steps={[
  { label: "Q2", value: 4200, total: true },
  { label: "New", value: 980 },
  { label: "Churn", value: -540 },
  { label: "Q3", total: true },
]}
/>
```

**Don't** - Plain bars of period totals hide the walk: what rose, what fell, and by how much.

```tsx
<Chart
data={[
  { label: "Q2", value: 4200 },
  { label: "Q3", value: 4640 },
]}
/>
```

## Supported props

### WaterfallChartProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| steps | WaterfallStep[] | yes |  | The bridge's steps, in order. |
| title | string \| undefined | no |  | Optional heading shown above the plot. |
| compact | boolean \| undefined | no | false | Density (omit for the default plot size). |
| plain | boolean \| undefined | no | false | Strip the card surface for nesting inside an existing card (mirrors Stats). |
| hideGrid | boolean \| undefined | no | false | Furniture visibility. |
| hideAxes | boolean \| undefined | no | false | Furniture visibility. |
| formatValue | ((v: number) => string) \| undefined | no |  | Formats tick labels, the flag, and the accessible name. |
| selected | number \| null \| undefined | no |  | Scrub-to-inspect: the selected step index (controlled). Pass null for none. |
| defaultSelected | number \| undefined | no |  | Scrub-to-inspect: the initially selected step (uncontrolled). |
| onSelect | ((index: number \| null) => void) \| undefined | no |  | Fired when a press/scrub selects a step (or clears it with null). |
| testID | string \| undefined | no |  | E2E hook forwarded to the root element. |
| style | LayoutStyle | no |  | Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. |

See [installation](https://canvas.nannier.com/ai/4.1.0/installation.md) for required peers and feature fallbacks.
