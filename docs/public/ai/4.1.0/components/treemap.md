# Treemap

Package: @nannier/canvas
Version: 4.1.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: d27c9b7debc9f8fea1016a51d1f700b1572754ac7d4f68c83b30055d3798cc5a

Source: `src/charts/treemap/treemap.md`
Human reference: https://canvas.nannier.com/components/treemap

## Public imports

```tsx
import { Treemap } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

Squarified value tiles: each datum becomes a ramp-colored rectangle whose area is proportional to its value, packed largest-first with near-square aspect ratios, with the label and formatted value rendered inside only when the tile fits them.

Flat one-level data; nesting and drill-down are deferred scope. Press a tile to flag its value and share (the others dim); the accessible name carries every tile with its share regardless of which labels fit.

## Usage

```tsx
<Treemap
  title="Storage by service"
  data={[
    { label: "Media", value: 620 },
    { label: "Backups", value: 340 },
    { label: "Logs", value: 180 },
    { label: "Search index", value: 120 },
    { label: "Thumbnails", value: 90 },
    { label: "Exports", value: 45 },
    { label: "Other", value: 25 }
  ]}
/>
```

## Variants

### Compact

```tsx
<Treemap
  compact
  data={[
    { label: "Chrome", value: 61 },
    { label: "Safari", value: 24 },
    { label: "Edge", value: 8 },
    { label: "Firefox", value: 5 },
    { label: "Other", value: 2 }
  ]}
/>
```

### Inspected

```tsx
<Treemap
  defaultSelected={0}
  data={[
    { label: "Platform", value: 4200 },
    { label: "Add-ons", value: 1400 },
    { label: "Services", value: 900 },
    { label: "Training", value: 300 }
  ]}
/>
```

### Outlined partitions

```tsx
<Treemap partitioned outlined formatValue={(v) => `${v}%`} data={[{label: "Web", value: 42}, {label: "Phone", value: 28}, {label: "Tablet", value: 18}, {label: "Desktop", value: 7}, {label: "CLI", value: 3}, {label: "Other", value: 2}]} />
```

## Do & Don't

### Treemap

**Do** - Reserve the treemap for part-of-whole data with real size contrast, where area comparison earns the space.

```tsx
<Treemap
title="Storage by service"
data={[
  { label: "Media", value: 620 },
  { label: "Backups", value: 340 },
  { label: "Logs", value: 180 },
]}
/>
```

**Don't** - A handful of near-equal shares reads better as a PieChart or a BarList; near-equal tiles defeat the area encoding.

```tsx
<Treemap
data={[
  { label: "A", value: 26 },
  { label: "B", value: 25 },
  { label: "C", value: 25 },
  { label: "D", value: 24 },
]}
/>
```

## Supported props

### TreemapProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| data | TreemapDatum[] | yes |  | The tiles, laid out largest first by the squarified algorithm. |
| title | string \| undefined | no |  | Optional heading shown above the tiles. |
| compact | boolean \| undefined | no | false | Density (omit for the default 240 plot height; compact is 160). |
| partitioned | boolean \| undefined | no | false | Slice successive values along alternating axes, keeping the data order. |
| outlined | boolean \| undefined | no | false | Show pale series washes with colored outlines and large readable values. |
| plain | boolean \| undefined | no | false | Strip the card surface for nesting inside an existing card (mirrors Stats). |
| formatValue | ((v: number) => string) \| undefined | no |  | Formats tile values and the flag (data formatting, not styling). |
| selected | number \| null \| undefined | no |  | Press-to-inspect: the selected tile index (controlled). Pass null for none. |
| defaultSelected | number \| undefined | no |  | Press-to-inspect: the initially selected tile (uncontrolled). |
| onSelect | ((index: number \| null) => void) \| undefined | no |  | Fired when a press selects a tile (or clears it with null). |
| testID | string \| undefined | no |  | E2E hook forwarded to the root element. |
| style | LayoutStyle | no |  | Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. |

See [installation](https://canvas.nannier.com/ai/4.1.0/installation.md) for required peers and feature fallbacks.
