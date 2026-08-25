# StackedBar

One proportional horizontal bar split into colored segments (the `chart-1`..`chart-8` tokens in fixed order), with a legend carrying each segment's label and share.

## Usage

```tsx
<Card padded style={{ maxWidth: 560 }}>
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

## Do & Don't

### Stacked bar

**Do** — Always ship a legend with a colored dot, label, and percentage per segment.

```tsx
<Card padded style={{ maxWidth: 560 }}>
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
