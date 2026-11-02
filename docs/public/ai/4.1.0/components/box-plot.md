# BoxPlot

Package: @nannier/canvas
Version: 4.1.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: 4e9a344e7cf8e99f7847528281f6c8f82eec5f1dd2864f552950f6404318c1a5

Source: `src/charts/box-plot/box-plot.md`
Human reference: https://canvas.nannier.com/components/box-plot

## Public imports

```tsx
import { BoxPlot } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

Quartile boxes, whiskers, and outlier dots per category, computed by the chart from raw samples: quartiles by linear interpolation, whiskers at the most extreme data inside the 1.5 IQR fences, outliers beyond them. Scrub a category to flag its five-number summary; each category's summary also folds into the accessible name.

## Usage

```tsx
<BoxPlot
  title="Latency by region"
  data={[
    { label: "us-east", values: [42, 38, 51, 44, 47, 39, 96] },
    { label: "eu-west", values: [55, 61, 58, 64, 57, 63] },
    { label: "ap-south", values: [71, 78, 74, 83, 76, 124] },
  ]}
/>
```

## Variants

### Compact

```tsx
<BoxPlot
  compact
  data={[
    { label: "A", values: [3.1, 3.4, 3.2, 3.8, 3.5, 3.3, 3.9, 3.6] },
    { label: "B", values: [4.2, 4.6, 4.4, 5.1, 4.8, 4.5, 5.4, 4.9] },
  ]}
/>
```

### Inspected

```tsx
<BoxPlot
  defaultSelected={1}
  data={[
    { label: "Mon", values: [2, 4, 3, 5, 4, 3, 6] },
    { label: "Wed", values: [3, 6, 5, 8, 6, 5, 9] },
    { label: "Fri", values: [5, 9, 7, 12, 9, 8, 22] },
  ]}
/>
```

## Do & Don't

### BoxPlot

**Do** - Compare distributions with the full five-number anatomy: box, whiskers, median, outliers.

```tsx
<BoxPlot
title="Latency by region"
data={[
  { label: "us-east", values: [42, 38, 51, 44, 47, 39, 58, 44, 41, 49, 96] },
  { label: "eu-west", values: [55, 61, 58, 64, 57, 63, 59, 66, 60, 62] },
]}
/>
```

**Don't** - A bar of averages hides the spread and the outliers, which are the point of comparing distributions.

```tsx
<Chart
data={[
  { label: "us-east", value: 46 },
  { label: "eu-west", value: 61 },
]}
/>
```

## Supported props

### BoxPlotProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| data | BoxSample[] | yes |  | One box per category, in order. |
| title | string \| undefined | no |  | Optional heading shown above the plot. |
| success | boolean \| undefined | no | false | Tone (pick one; default primary). Precedence: success > destructive. |
| destructive | boolean \| undefined | no | false | Tone (pick one; default primary). Precedence: success > destructive. |
| compact | boolean \| undefined | no | false | Density (omit for the default plot size). |
| plain | boolean \| undefined | no | false | Strip the card surface for nesting inside an existing card (mirrors Stats). |
| hideGrid | boolean \| undefined | no | false | Furniture visibility. |
| hideAxes | boolean \| undefined | no | false | Furniture visibility. |
| formatValue | ((v: number) => string) \| undefined | no |  | Formats tick labels, the flag, and the accessible name. |
| selected | number \| null \| undefined | no |  | Scrub-to-inspect: the selected category index (controlled). Pass null for none. |
| defaultSelected | number \| undefined | no |  | Scrub-to-inspect: the initially selected category (uncontrolled). |
| onSelect | ((index: number \| null) => void) \| undefined | no |  | Fired when a press/scrub selects a category (or clears it with null). |
| testID | string \| undefined | no |  | E2E hook forwarded to the root element. |
| style | LayoutStyle | no |  | Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. |

See [installation](https://canvas.nannier.com/ai/4.1.0/installation.md) for required peers and feature fallbacks.
