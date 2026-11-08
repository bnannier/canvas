# FunnelChart

Package: @nannier/canvas
Version: 4.2.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: ffd42edcc8828d3edcdcfd4bb3a9835f8b54674438055997f10ebf5989e7e006

Source: `src/charts/funnel-chart/funnel-chart.md`
Human reference: https://canvas.nannier.com/components/funnel-chart

## Public imports

```tsx
import { FunnelChart } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

Stage-by-stage conversion bars: one centered row per stage, labelled on the left and valued on the right.

The stages stack as a column of rows, each a ramp-colored bar centered in its track at the stage's share of the first stage's value, so the column tapers as the funnel drops off. The stage's label sits at the start of the row and its value, in the mono face, at the end; `share` shows every stage's percent of the first stage in the value slot instead. Each stage's accessible name carries its percent of the previous stage (of the first stage with `share`). Press a stage to select it (the others dim).

## Usage

```tsx
<FunnelChart
  stages={[
    { label: "Visits", value: 12400 },
    { label: "Signups", value: 4200 },
    { label: "Activated", value: 1850 },
    { label: "Paid", value: 480 },
  ]}
/>
```

## Variants

### Share of the first stage

```tsx
<FunnelChart
  share
  stages={[
    { label: "Cart", value: 8600 },
    { label: "Address", value: 5200 },
    { label: "Payment", value: 3900 },
    { label: "Placed", value: 3400 },
  ]}
/>
```

### Compact, inspected

```tsx
<FunnelChart
compact
defaultSelected={1}
stages={[
  { label: "Leads", value: 900 },
  { label: "Qualified", value: 340 },
  { label: "Closed", value: 120 },
]}
/>
```

### Tapered stages

```tsx
<FunnelChart tapered stages={[{label: "Visited", value: 12400}, {label: "Signed up", value: 7900}, {label: "Activated", value: 4980}, {label: "Paid", value: 2610}]} />
```

## Do & Don't

### FunnelChart

**Do** - Order the stages widest first and let the taper carry the drop-off.

```tsx
<FunnelChart
title="Signup funnel"
stages={[
  { label: "Visits", value: 12400 },
  { label: "Signups", value: 4200 },
  { label: "Paid", value: 480 },
]}
/>
```

**Don't** - A funnel that widens mid-way is not a funnel; a stage exceeding its predecessor warns and reads as an error.

```tsx
<FunnelChart
stages={[
  { label: "Visits", value: 4200 },
  { label: "Signups", value: 12400 },
]}
/>
```

## Supported props

### FunnelChartProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| stages | StackedSegment[] | yes |  | Ordered stages, widest first. |
| title | string \| undefined | no |  | Optional heading shown above the funnel. |
| share | boolean \| undefined | no | false | Show each stage as a share of the FIRST stage instead of the conversion from the previous stage. |
| tapered | boolean \| undefined | no | false | Draw connected stage trapezoids and show counts alongside stage conversion. |
| compact | boolean \| undefined | no | false | Density (omit for the default funnel height). |
| plain | boolean \| undefined | no | false | Strip the card surface for nesting inside an existing card (mirrors Stats). |
| formatValue | ((v: number) => string) \| undefined | no |  | Formats stage values (data formatting, not styling). |
| selected | number \| null \| undefined | no |  | Press-to-inspect: the selected stage index (controlled). Pass null for none. |
| defaultSelected | number \| undefined | no |  | Press-to-inspect: the initially selected stage (uncontrolled). |
| onSelect | ((index: number \| null) => void) \| undefined | no |  | Fired when a press selects a stage (or clears it with null). |
| testID | string \| undefined | no |  | E2E hook forwarded to the root element. |
| style | LayoutStyle | no |  | Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. |

See [installation](https://canvas.nannier.com/ai/4.2.0/installation.md) for required peers and feature fallbacks.
