# Heatmap

A wrapping grid of cells whose fill intensity (an alpha wash of the primary token) encodes each value, with a discrete less-to-more legend.

## Usage

```tsx
<Card padded style={{ maxWidth: 260 }}>
  <Heatmap values={[0.15, 0.4, 0.7, 1, 0.55, 0.25, 0.85, 0.35, 0.6, 0.9, 0.2, 0.5, 0.75, 0.3, 0.95, 0.45, 0.65, 0.1, 0.8, 0.4, 0.7]} />
</Card>
```

## Do & Don't

### Heatmap

**Do** — Pair the grid with a discrete less-to-more legend so the density scale is legible.

```tsx
<Card padded style={{ maxWidth: 260 }}>
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
