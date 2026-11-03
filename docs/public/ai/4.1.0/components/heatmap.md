# Heatmap

Package: @nannier/canvas
Version: 4.1.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: e09f8965dff7d0af07ba1dd1deaa62611de669dfcb059d93145325e8bdbb1cbc

Source: `src/charts/heatmap/heatmap.md`
Human reference: https://canvas.nannier.com/components/heatmap

## Public imports

```tsx
import { Heatmap } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

Density cells whose fill encodes each value. Pass `calendar` for a GitHub-style contribution graph: seven-day week columns with weekday and month labels, discrete less-to-more levels, and press or hover to inspect a day's count and date. The calendar layout IS the kit's activity calendar, so a contribution graph needs no separate component.

`detailed` keeps contribution-calendar cells at their authored size, with compact month and weekday labels and the contribution-count color levels. A narrow parent scrolls the same calendar.

## Usage

```tsx
<Container xs>
  <Heatmap values={[0.15, 0.4, 0.7, 1, 0.55, 0.25, 0.85, 0.35, 0.6, 0.9, 0.2, 0.5, 0.75, 0.3, 0.95, 0.45, 0.65, 0.1, 0.8, 0.4, 0.7]} />
</Container>
```

## Variants

### Calendar

```tsx
<Heatmap
  calendar
  label="Contribution activity"
  values={Array.from({ length: 371 }, (_, i) => {
    const noise = Math.sin(i * 12.9898) * 43758.5453;
    const r = noise - Math.floor(noise);
    const value = r < 0.5 ? 0 : (r - 0.5) / 0.5;
    return { value, count: Math.round(value * 14), date: new Date(Date.UTC(2025, 6, 6 + i)).toISOString().slice(0, 10) };
  })}
/>
```

## Do & Don't

### Heatmap

**Do** — Pair the grid with a discrete less-to-more legend so the density scale is legible.

```tsx
<Card padded>
  <Heatmap values={[0.15, 0.4, 0.7, 1, 0.55, 0.25, 0.85, 0.35, 0.6, 0.9, 0.2, 0.5, 0.75, 0.3, 0.95, 0.45, 0.65, 0.1, 0.8, 0.4, 0.7]} />
</Card>

```

**Don't** — A density grid with no legend leaves the alpha-to-value mapping a mystery.

```tsx
<View style={{ borderRadius: 8, borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens.card, padding: 20, maxWidth: 260 }}>
  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4, maxWidth: 220 }}>
    <View style={{ borderRadius: 2, height: 18, width: 18, backgroundColor: "rgba(99,102,241,0.15)" }} />
    <View style={{ borderRadius: 2, height: 18, width: 18, backgroundColor: "rgba(99,102,241,0.4)" }} />
    <View style={{ borderRadius: 2, height: 18, width: 18, backgroundColor: "rgba(99,102,241,0.7)" }} />
    <View style={{ borderRadius: 2, height: 18, width: 18, backgroundColor: "rgba(99,102,241,1)" }} />
    <View style={{ borderRadius: 2, height: 18, width: 18, backgroundColor: "rgba(99,102,241,0.55)" }} />
    <View style={{ borderRadius: 2, height: 18, width: 18, backgroundColor: "rgba(99,102,241,0.25)" }} />
    <View style={{ borderRadius: 2, height: 18, width: 18, backgroundColor: "rgba(99,102,241,0.85)" }} />
    <View style={{ borderRadius: 2, height: 18, width: 18, backgroundColor: "rgba(99,102,241,0.35)" }} />
    <View style={{ borderRadius: 2, height: 18, width: 18, backgroundColor: "rgba(99,102,241,0.6)" }} />
    <View style={{ borderRadius: 2, height: 18, width: 18, backgroundColor: "rgba(99,102,241,0.9)" }} />
    <View style={{ borderRadius: 2, height: 18, width: 18, backgroundColor: "rgba(99,102,241,0.2)" }} />
    <View style={{ borderRadius: 2, height: 18, width: 18, backgroundColor: "rgba(99,102,241,0.5)" }} />
    <View style={{ borderRadius: 2, height: 18, width: 18, backgroundColor: "rgba(99,102,241,0.75)" }} />
    <View style={{ borderRadius: 2, height: 18, width: 18, backgroundColor: "rgba(99,102,241,0.3)" }} />
    <View style={{ borderRadius: 2, height: 18, width: 18, backgroundColor: "rgba(99,102,241,0.95)" }} />
    <View style={{ borderRadius: 2, height: 18, width: 18, backgroundColor: "rgba(99,102,241,0.45)" }} />
    <View style={{ borderRadius: 2, height: 18, width: 18, backgroundColor: "rgba(99,102,241,0.65)" }} />
    <View style={{ borderRadius: 2, height: 18, width: 18, backgroundColor: "rgba(99,102,241,0.1)" }} />
    <View style={{ borderRadius: 2, height: 18, width: 18, backgroundColor: "rgba(99,102,241,0.8)" }} />
    <View style={{ borderRadius: 2, height: 18, width: 18, backgroundColor: "rgba(99,102,241,0.4)" }} />
    <View style={{ borderRadius: 2, height: 18, width: 18, backgroundColor: "rgba(99,102,241,0.7)" }} />
  </View>
</View>

```

## Supported props

### HeatmapProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| values | HeatmapValue[] | yes |  | The cells: intensities 0–1, or `{ value, count?, date?, label? }` for inspectable data. |
| label | string \| undefined | no |  | What the grid measures (e.g. "Contribution activity"); leads the accessible name. |
| calendar | boolean \| undefined | no | false | GitHub-style: lay the cells into seven-row week columns with weekday + month labels. |
| detailed | boolean \| undefined | no | false | Fixed-size contribution calendar with the authored month, weekday and level styling. |
| caption | string \| undefined | no |  | A summary line above the grid (e.g. "248 contributions in the last year"). |
| hideLegend | boolean \| undefined | no | false | Hide the less-to-more legend row. |
| testID | string \| undefined | no |  | E2E hook forwarded to the root element. |
| style | LayoutStyle | no |  | For sizing/composition only. |

See [installation](https://canvas.nannier.com/ai/4.1.0/installation.md) for required peers and feature fallbacks.
