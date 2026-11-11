# Sparkline

Package: @nannier/canvas
Version: 4.3.1
Status: source-snapshot (not proof of an npm release)
Source SHA-256: 7e6c5223234f7d08b8647454c5cf0c8ef1d2da6425c2d4d231d846016c668d78

Source: `src/charts/sparkline/sparkline.md`
Human reference: https://canvas.nannier.com/components/sparkline

## Public imports

```tsx
import { Sparkline } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

A compact trend strip: a row of thin bars whose heights track a series of values,
with the series in a soft wash of the tone and the latest bar in the full accent.
Pass `values` and it sizes each bar against the series max and paints the tone, so
no call site hand-composes a row of `flexGrow` + `height` + `backgroundColor`
Views to draw an inline trend on a stat card or dashboard.

## Usage

```tsx
<Container xxxs>
  <Sparkline values={[4, 8, 6, 12, 10, 16, 14, 18, 16, 20, 24]} />
</Container>
```

## Variants

### Tones

```tsx
<Container xxxs>
  <Column>
    <Sparkline primary values={[4, 8, 6, 12, 10, 16, 14, 18, 16, 20, 24]} />
    <Sparkline success values={[4, 8, 6, 12, 10, 16, 14, 18, 16, 20, 24]} />
    <Sparkline destructive values={[24, 20, 16, 18, 14, 16, 10, 12, 6, 8, 4]} />
    <Sparkline muted values={[4, 8, 6, 12, 10, 16, 14, 18, 16, 20, 24]} />
  </Column>
</Container>
```

### Sizes

```tsx
<Container xxxs>
  <Column>
    <Sparkline compact values={[4, 8, 6, 12, 10, 16, 14, 18, 16, 20, 24]} />
    <Sparkline values={[4, 8, 6, 12, 10, 16, 14, 18, 16, 20, 24]} />
    <Sparkline tall values={[4, 8, 6, 12, 10, 16, 14, 18, 16, 20, 24]} />
  </Column>
</Container>
```

### Line

```tsx
<Container xxxs>
  <Sparkline line values={[4, 8, 6, 12, 10, 16, 14, 18, 16, 20, 24]} />
</Container>
```

### Track

`track` paints the plot area with the muted track, so the strip keeps a visible
frame. A flat or all-zero series then reads as a chart sitting at zero rather
than as one that failed to load, and a row of strips scans evenly because every
one holds the same band whatever its data. Use it where strips sit side by side;
a lone sparkline inside running text is usually better without.

```tsx
<Container xxxs>
  <Sparkline track values={[0, 0, 0, 0, 0, 0, 0, 0]} />
</Container>
```

## Do & Don't

### Pair with a value

**Do** — Anchor the sparkline to an explicit headline value and delta with the Stats molecule, which owns the metric-card anatomy and renders the trend strip from its `spark` field.

```tsx
<Container xxxs>
  <Stats items={[{ label: "Requests", value: "24.5k", delta: "+8.2%", spark: [4, 8, 6, 12, 10, 16, 14, 18, 16, 20, 24] }]} />
</Container>
```

**Don't** — Draw a bare trend strip with no current value; the reader has to decode the slope.

```tsx
<View style={{ flexDirection: "row", alignItems: "flex-end", gap: 2, height: 24 }}>
  <View style={{ flexGrow: 1, borderRadius: 2, backgroundColor: "#4f46e5", height: 8 }} />
  <View style={{ flexGrow: 1, borderRadius: 2, backgroundColor: "#4f46e5", height: 16 }} />
  <View style={{ flexGrow: 1, borderRadius: 2, backgroundColor: "#4f46e5", height: 24 }} />
</View>
```

## Supported props

### SparklineProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| values | number[] | yes |  | The series to plot; each value becomes one bar, sized against the max. |
| primary | boolean \| undefined | no | false | Tone (pick one; default `primary`). Colors the marks. |
| success | boolean \| undefined | no | false | Tone (pick one; default `primary`). Colors the marks. |
| destructive | boolean \| undefined | no | false | Tone (pick one; default `primary`). Colors the marks. |
| muted | boolean \| undefined | no | false | Tone (pick one; default `primary`). Colors the marks. |
| compact | boolean \| undefined | no | false | Height (pick one; default medium). |
| tall | boolean \| undefined | no | false | Height (pick one; default medium). |
| line | boolean \| undefined | no | false | A continuous 2px trend line with an area wash and end marker, instead of the bar strip. |
| track | boolean \| undefined | no | false | Paint the plot area with the muted track, giving the strip a visible frame. Two things it buys: a flat or all-zero series reads as a chart sitting at zero rather than as one that failed to load, and a row of strips scans evenly because every one of them holds the same band whatever its data. Use it wherever strips sit side by side (a Stats row); a lone sparkline inside running text is usually better without. |
| accessibilityLabel | string \| undefined | no |  | Accessible summary (e.g. "requests, last 11 days"). |
| testID | string \| undefined | no |  | E2E hook forwarded to the root element. |
| style | LayoutStyle | no |  | For sizing/composition only (e.g. maxWidth); not a styling escape hatch. |

See [installation](https://canvas.nannier.com/ai/4.3.1/installation.md) for required peers and feature fallbacks.
