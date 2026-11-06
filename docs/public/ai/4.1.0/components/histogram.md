# Histogram

Package: @nannier/canvas
Version: 4.1.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: d27c9b7debc9f8fea1016a51d1f700b1572754ac7d4f68c83b30055d3798cc5a

Source: `src/charts/histogram/histogram.md`
Human reference: https://canvas.nannier.com/components/histogram

## Public imports

```tsx
import { Histogram } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

An auto-binned frequency distribution: pass raw sample `values` and the chart bins them into nice-edged uniform buckets (Sturges' rule by default, `bins` to override) and draws contiguous bars on a numeric axis. Press or scrub a bar to inspect its range and count. The accessible name lists every bin with its bounds and tally.

## Usage

```tsx
<Histogram
  title="Response times"
  label="Latency ms"
  values={[42, 38, 51, 44, 47, 39, 58, 62, 44, 41, 49, 53, 46, 43, 71, 48]}
/>
```

## Variants

### Explicit bins

```tsx
<Histogram
  bins={5}
  values={[1, 1, 2, 2, 2, 3, 3, 3, 3, 4, 4, 5, 5, 6, 7, 8, 9, 12, 2, 3, 1, 4, 2, 3, 5]}
/>
```

### Compact, no grid

```tsx
<Histogram
  compact
  hideGrid
  values={[4.2, 4.8, 5.1, 4.4, 6.2, 5.5, 4.9, 5.0, 4.6, 7.8, 5.2, 4.7, 5.4, 4.3, 5.8]}
/>
```

## Do & Don't

### Histogram

**Do** - Hand the chart raw samples and let it choose nice bin edges.

```tsx
<Histogram
title="Response times"
label="Latency ms"
values={[42, 38, 51, 44, 47, 39, 58, 62, 44, 41, 49, 53, 46, 43, 71, 48]}
/>
```

**Don't** - Pre-bucketing the samples into a bar Chart throws away the distribution's edges and the inspectable ranges.

```tsx
<Chart
data={[
  { label: "small", value: 9 },
  { label: "medium", value: 5 },
  { label: "large", value: 2 },
]}
/>
```

## Supported props

### HistogramProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| values | number[] | yes |  | Raw sample values; the chart bins them. |
| bins | number \| undefined | no |  | Bucket count override. Defaults to Sturges' rule on the sample size. |
| title | string \| undefined | no |  | Optional heading shown above the plot. |
| label | string \| undefined | no |  | Names the distribution (e.g. "Response times"); leads the accessible name. |
| success | boolean \| undefined | no | false | Tone (pick one; default primary). Precedence: success > destructive. |
| destructive | boolean \| undefined | no | false | Tone (pick one; default primary). Precedence: success > destructive. |
| compact | boolean \| undefined | no | false | Density (omit for the default plot size). |
| plain | boolean \| undefined | no | false | Strip the card surface for nesting inside an existing card (mirrors Stats). |
| hideGrid | boolean \| undefined | no | false | Furniture visibility. |
| hideAxes | boolean \| undefined | no | false | Furniture visibility. |
| formatValue | ((v: number) => string) \| undefined | no |  | Formats bin edges in ticks, the flag, and the accessible name. |
| selected | number \| null \| undefined | no |  | Press-to-inspect: the selected bin index (controlled). Pass null for none. |
| defaultSelected | number \| undefined | no |  | Press-to-inspect: the initially selected bin (uncontrolled). |
| onSelect | ((index: number \| null) => void) \| undefined | no |  | Fired when a press selects a bin (or clears it with null). |
| testID | string \| undefined | no |  | E2E hook forwarded to the root element. |
| style | LayoutStyle | no |  | Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. |

See [installation](https://canvas.nannier.com/ai/4.1.0/installation.md) for required peers and feature fallbacks.
