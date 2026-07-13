# Chart

A single- or multi-series bar chart: vertical columns (or horizontal rows) sized against the axis max, with per-category values and labels. Pass `labels` + `series` for grouped clusters colored by the `chart-1`..`chart-8` tokens; press or scrub a category to inspect it.

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

### Grouped bars

```tsx
<Chart
  title="Revenue, costs, profit"
  labels={["Q1 '23", "Q2 '23", "Q3 '23", "Q4 '23", "Q1 '24", "Q2 '24", "Q3 '24", "Q4 '24"]}
  series={[
    { label: "Revenue", values: [49, 51, 61, 61, 62, 70, 84, 89] },
    { label: "Costs", values: [32, 32, 33, 38, 41, 48, 55, 59] },
    { label: "Profit", values: [17, 19, 28, 23, 21, 22, 29, 30] }
  ]}
  style={{ maxWidth: 560 }}
/>
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
