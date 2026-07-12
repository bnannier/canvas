# Chart

Bars, lines, areas, stacked bars, gauges, heatmaps. One token-themed family with a colorblind-validated series palette (the `chart-1`..`chart-8` tokens). No charting library required.

## Usage

```tsx
<Chart
  title="Signups"
  data={[
    { label: "Mon", value: 45 },
    { label: "Tue", value: 60 },
    { label: "Wed", value: 35 },
    { label: "Thu", value: 70 },
    { label: "Fri", value: 55 },
    { label: "Sat", value: 80 },
    { label: "Sun", value: 95 }
  ]}
  max={100}
/>
```

## Variants

### Chart type - grouped bars

```tsx
<Chart
  title="Revenue vs costs"
  labels={["Q1", "Q2", "Q3", "Q4"]}
  series={[
    { label: "Revenue", values: [45, 60, 72, 90] },
    { label: "Costs", values: [30, 38, 41, 52] }
  ]}
  style={{ maxWidth: 560 }}
/>
```

### Chart type - line

```tsx
<LineChart
  title="Signups"
  labels={["Jan", "Feb", "Mar", "Apr", "May", "Jun"]}
  series={[
    { label: "Web", values: [120, 180, 150, 240, 300, 280] },
    { label: "Mobile", values: [60, 90, 140, 160, 220, 260] }
  ]}
  curved
  dots
  style={{ maxWidth: 560 }}
/>
```

### Chart type - area

```tsx
<AreaChart
  title="Traffic by channel"
  labels={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
  series={[
    { label: "Direct", values: [40, 55, 45, 70, 65, 30, 25] },
    { label: "Search", values: [80, 95, 90, 120, 130, 60, 50] },
    { label: "Social", values: [20, 30, 25, 45, 60, 80, 70] }
  ]}
  stacked
  curved
  style={{ maxWidth: 560 }}
/>
```

### Chart type - scatter

```tsx
<ScatterPlot
  title="Load vs latency"
  series={[
    { label: "us-east", points: [{ x: 120, y: 38 }, { x: 260, y: 52 }, { x: 400, y: 61 }, { x: 610, y: 88 }, { x: 750, y: 112 }] },
    { label: "eu-west", points: [{ x: 150, y: 45 }, { x: 300, y: 64 }, { x: 480, y: 79 }, { x: 640, y: 105 }, { x: 820, y: 140 }] }
  ]}
  style={{ maxWidth: 560 }}
/>
```

### Chart type - pie

```tsx
<Card padded style={{ maxWidth: 280 }}>
  <PieChart
    donut
    label="Traffic"
    slices={[
      { label: "Direct", value: 42 },
      { label: "Organic search", value: 28 },
      { label: "Social", value: 18 },
      { label: "Referral", value: 12 }
    ]}
  />
</Card>
```

### Chart type - stacked

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

### Chart type - gauge

```tsx
<Card padded style={{ maxWidth: 200 }}>
  <Column alignCenter>
    <Gauge value={72} label="Uptime" />
  </Column>
</Card>
```

### Chart type - heatmap

```tsx
<Card padded style={{ maxWidth: 260 }}>
  <Heatmap values={[0.15, 0.4, 0.7, 1, 0.55, 0.25, 0.85, 0.35, 0.6, 0.9, 0.2, 0.5, 0.75, 0.3, 0.95, 0.45, 0.65, 0.1, 0.8, 0.4, 0.7]} />
</Card>
```

## Do & Don't

### Bar

**Do** — Keep a labelled axis row and a single bar tone so the buckets read at a glance.

```tsx
<Chart title="Signups" max={100} style={{ maxWidth: 560 }} data={[
    { label: "Mon", value: 45 },
    { label: "Tue", value: 60 },
    { label: "Wed", value: 35 },
    { label: "Thu", value: 70 },
    { label: "Fri", value: 55 },
    { label: "Sat", value: 80 },
    { label: "Sun", value: 95 }
  ]} />
```

**Don't** — Every bar the same full-strength fill and no labels: nothing is emphasized and the axis is unreadable.

```tsx
<View style={{ borderRadius: 8, borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens.card, padding: 20, maxWidth: 560 }}>
  <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 4, height: 120, width: 520 }}>
    <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: "0%", borderTopLeftRadius: 4, borderTopRightRadius: 4, backgroundColor: tokens.primary, height: 63 }} />
    <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: "0%", borderTopLeftRadius: 4, borderTopRightRadius: 4, backgroundColor: tokens.primary, height: 84 }} />
    <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: "0%", borderTopLeftRadius: 4, borderTopRightRadius: 4, backgroundColor: tokens.primary, height: 49 }} />
    <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: "0%", borderTopLeftRadius: 4, borderTopRightRadius: 4, backgroundColor: tokens.primary, height: 98 }} />
    <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: "0%", borderTopLeftRadius: 4, borderTopRightRadius: 4, backgroundColor: tokens.primary, height: 77 }} />
    <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: "0%", borderTopLeftRadius: 4, borderTopRightRadius: 4, backgroundColor: tokens.primary, height: 112 }} />
    <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: "0%", borderTopLeftRadius: 4, borderTopRightRadius: 4, backgroundColor: tokens.primary, height: 118 }} />
  </View>
</View>
```

### Line

**Do** — Compare series that share one scale, and let the legend plus the fixed series colors carry identity.

```tsx
<LineChart
  title="Signups"
  labels={["Jan", "Feb", "Mar", "Apr", "May", "Jun"]}
  series={[
    { label: "Web", values: [120, 180, 150, 240, 300, 280] },
    { label: "Mobile", values: [60, 90, 140, 160, 220, 260] }
  ]}
  curved
  style={{ maxWidth: 560 }}
/>
```

**Don't** — Mix measures of different scales on one axis: the smaller series flatlines against the baseline and reads as noise. Normalize, or use two charts.

```tsx
<LineChart
  title="Revenue vs conversion"
  labels={["Jan", "Feb", "Mar", "Apr", "May", "Jun"]}
  series={[
    { label: "Revenue", values: [12000, 18000, 15000, 24000, 30000, 28000] },
    { label: "Conversion rate", values: [2.1, 2.4, 2.2, 2.8, 3.1, 3] }
  ]}
  style={{ maxWidth: 560 }}
/>
```

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
  <View style={{ flexDirection: "row", overflow: "hidden", borderRadius: 9999, height: 10, width: 520 }}>
    <View style={{ width: "42%", backgroundColor: "#6366f1" }} />
    <View style={{ width: "28%", backgroundColor: "#14b8a6" }} />
    <View style={{ width: "18%", backgroundColor: "#f59e0b" }} />
    <View style={{ width: "12%", backgroundColor: "#f43f5e" }} />
  </View>
</View>
```

### Pie

**Do** — Keep slices to a handful and fold the tail into an "Other" slice; the legend carries exact shares.

```tsx
<Card padded style={{ maxWidth: 280 }}>
  <PieChart
    label="Traffic"
    slices={[
      { label: "Direct", value: 42 },
      { label: "Organic search", value: 28 },
      { label: "Social", value: 18 },
      { label: "Other", value: 12 }
    ]}
  />
</Card>
```

**Don't** — A dozen sliver slices cycle the palette and become unreadable; nothing is comparable at a glance.

```tsx
<Card padded style={{ maxWidth: 280 }}>
  <PieChart
    label="Traffic"
    slices={[
      { label: "Direct", value: 22 },
      { label: "Organic", value: 18 },
      { label: "Social", value: 11 },
      { label: "Referral", value: 9 },
      { label: "Email", value: 8 },
      { label: "Paid", value: 7 },
      { label: "Video", value: 6 },
      { label: "Affiliates", value: 6 },
      { label: "Push", value: 5 },
      { label: "SMS", value: 4 },
      { label: "Podcasts", value: 2 },
      { label: "Misc", value: 2 }
    ]}
  />
</Card>
```

### Gauge

**Do** — Put a muted track behind the fill and the numeric value plus label in the center.

```tsx
<Card padded style={{ maxWidth: 200 }}>
  <Column alignCenter>
    <Gauge value={72} label="Uptime" />
  </Column>
</Card>
```

**Don't** — An arc with no track and no number: there is no baseline to read the fill against and no exact value.

```tsx
<View style={{ borderRadius: 8, borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens.card, padding: 20, maxWidth: 200, alignItems: "center" }}>
  <View style={{ borderRadius: 9999, borderWidth: 8, borderColor: tokens.primary, height: 120, width: 120 }} />
</View>
```

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
