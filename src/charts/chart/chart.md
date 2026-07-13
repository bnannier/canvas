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
  title="Revenue vs costs"
  labels={["Q1", "Q2", "Q3", "Q4"]}
  series={[
    { label: "Revenue", values: [45, 60, 72, 90] },
    { label: "Costs", values: [30, 38, 41, 52] }
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
