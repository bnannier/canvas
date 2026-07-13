# Sparkline

A compact trend strip: a row of thin bars whose heights track a series of values.
Pass `values` and it sizes each bar against the series max and paints the tone, so
no call site hand-composes a row of `flexGrow` + `height` + `backgroundColor`
Views to draw an inline trend on a stat card or dashboard.

## Usage

```tsx
<Sparkline values={[4, 8, 6, 12, 10, 16, 14, 18, 16, 20, 24]} style={{ width: 160 }} />
```

## Variants

### Tones

```tsx
<Column relaxed style={{ maxWidth: 200 }}>
  <Sparkline primary values={[6, 10, 8, 14, 12, 18, 22]} />
  <Sparkline success values={[6, 10, 8, 14, 12, 18, 22]} />
  <Sparkline destructive values={[22, 18, 20, 12, 14, 8, 6]} />
  <Sparkline muted values={[10, 12, 9, 13, 11, 14, 12]} />
</Column>
```

### Sizes

```tsx
<Column relaxed style={{ maxWidth: 200 }}>
  <Sparkline compact values={[6, 10, 8, 14, 12, 18, 22]} />
  <Sparkline values={[6, 10, 8, 14, 12, 18, 22]} />
  <Sparkline tall values={[6, 10, 8, 14, 12, 18, 22]} />
</Column>
```

### Line

```tsx
<Column relaxed style={{ maxWidth: 200 }}>
  <Sparkline line success values={[187.2, 188.4, 186.9, 189.3, 190.8, 190.1, 191.6]} />
  <Sparkline line destructive values={[191.6, 190.1, 190.8, 188.3, 188.9, 187.4, 186.2]} />
</Column>
```

## Do & Don't

### Pair with a value

**Do** — Anchor the sparkline to an explicit headline value and delta.

```tsx
<Card padded style={{ maxWidth: 220 }}>
  <Column tight>
    <Typography caption>Requests</Typography>
    <Row between baseline>
      <Typography h3 semibold>24.5k</Typography>
      <Typography tiny positive>+8.2%</Typography>
    </Row>
    <Sparkline values={[4, 8, 6, 12, 10, 16, 14, 18, 16, 20, 24]} />
  </Column>
</Card>
```

**Don't** — Draw a bare trend strip with no current value; the reader has to decode the slope.

```tsx
<View style={{ flexDirection: "row", alignItems: "flex-end", gap: 2, height: 24 }}>
  <View style={{ flexGrow: 1, borderRadius: 2, backgroundColor: "#4f46e5", height: 8 }} />
  <View style={{ flexGrow: 1, borderRadius: 2, backgroundColor: "#4f46e5", height: 16 }} />
  <View style={{ flexGrow: 1, borderRadius: 2, backgroundColor: "#4f46e5", height: 24 }} />
</View>
```
