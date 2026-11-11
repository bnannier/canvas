# StackedBar

Package: @nannier/canvas
Version: 4.3.1
Status: source-snapshot (not proof of an npm release)
Source SHA-256: 7e6c5223234f7d08b8647454c5cf0c8ef1d2da6425c2d4d231d846016c668d78

Source: `src/charts/stacked-bar/stacked-bar.md`
Human reference: https://canvas.nannier.com/components/stacked-bar

## Public imports

```tsx
import { StackedBar } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

One proportional horizontal bar split into colored segments (the `chart-1`..`chart-8` tokens in fixed order), with a legend carrying each segment's label and share.

## Usage

```tsx
<StackedBar
  segments={[
    { label: "Direct", value: 42 },
    { label: "Organic search", value: 28 },
    { label: "Social", value: 18 }
  ]}
/>
```

## Variants

### Track

`track` paints the unfilled remainder as a muted rail. A full bar looks the same;
a bar whose segments sum to zero draws the rail instead of nothing, so a
composition of nothing still reads as a bar. Use it wherever the strip has to
hold its space, such as inside a `Stats` tile.

```tsx
<StackedBar
  track
  label="Courier queue"
  segments={[
    { label: "Sent", value: 0 },
    { label: "Queued", value: 0 }
  ]}
/>
```

### Strip size and wash

`tall` uses a 24 px strip, or 14 px separated bands when a capacity is supplied. `subtle` washes
the segments for a bar that supports a headline rather than being one, where a
solid bar would outweigh everything around it.

```tsx
<StackedBar
  tall
  subtle
  label="Verified identities"
  segments={[
    { label: "Verified", value: 1502 },
    { label: "Unverified", value: 345 }
  ]}
/>
```

### Detailed capacity

```tsx
<StackedBar detailed tall max={100} segments={[{label: "Media", value: 38}, {label: "Docs", value: 22}, {label: "Code", value: 14}, {label: "Other", value: 8}]} />
```

## Do & Don't

### Stacked bar

**Do** — Always ship a legend with a colored dot, label, and percentage per segment.

```tsx
<Card padded>
  <StackedBar
    segments={[
      { label: "Direct", value: 42 },
      { label: "Organic search", value: 28 },
      { label: "Social", value: 18 },
      { label: "Referral", value: 12 }
    ]}
  />
</Card>

```

**Don't** — Colored segments with no legend force the reader to guess which channel each band represents.

```tsx
<View style={{ borderRadius: 8, borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens.card, padding: 20, maxWidth: 560 }}>
  <View style={{ flexDirection: "row", overflow: "hidden", borderRadius: 9999, height: 10, width: 520, maxWidth: "100%" }}>
    <View style={{ width: "42%", backgroundColor: "#6366f1" }} />
    <View style={{ width: "28%", backgroundColor: "#14b8a6" }} />
    <View style={{ width: "18%", backgroundColor: "#f59e0b" }} />
    <View style={{ width: "12%", backgroundColor: "#f43f5e" }} />
  </View>
</View>

```

## Supported props

### StackedBarProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| segments | StackedSegment[] | yes |  |  |
| label | string \| undefined | no |  | What the bar measures (e.g. "Traffic sources"); leads the accessible name. |
| hideLegend | boolean \| undefined | no | false | Hide the legend (the labelled dots below the bar). |
| detailed | boolean \| undefined | no | false | A two-column legend with separate right-aligned share readouts. |
| legendSegments | StackedSegment[] \| undefined | no |  | The series to identify in a shared comparison legend. Defaults to this strip. |
| track | boolean \| undefined | no | false | Paint the unfilled remainder as a muted rail, so a bar whose segments sum to zero still reads as a bar rather than as blank space. A composition of nothing (an empty queue, a metric at zero) is a real state to draw, and without the rail it draws as an absence. |
| tall | boolean \| undefined | no | false | A 24 px strip instead of the default 8 px pill; capacity strips use 14 px bands. |
| subtle | boolean \| undefined | no | false | Draw the segments as washes of their ramp colours rather than at full strength. For a bar that supports a headline rather than being one (the strip under a metric's value), where a solid bar outweighs everything around it. |
| max | number \| undefined | no |  | The capacity the segments are shares of (100 GB of storage): each segment is its value over `max`, and the room left is drawn as one remainder segment on the raised surface fill, left out of the legend. Omit to split the strip by the segments' own total. A `max` under the segments' total is ignored. |
| testID | string \| undefined | no |  | E2E hook forwarded to the root element. |
| style | LayoutStyle | no |  | For sizing/composition only. |

See [installation](https://canvas.nannier.com/ai/4.3.1/installation.md) for required peers and feature fallbacks.
