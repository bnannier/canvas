# Charts

Sparklines, bars, gauges, heatmaps. All SVG, all token-themed. No charting library required.

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

### Chart type - sparkline

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
  horizontal
/>
```

### Chart type - stacked

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
  success
/>
```

### Chart type - gauge

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
  success
  horizontal
/>
```

### Chart type - heatmap

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
  destructive
/>
```

## Do & Don't

### Bar

**Do** — Keep a labelled axis row and a single bar tone so the buckets read at a glance.

```tsx
<Chart title="Signups" max={100} className="max-w-[560px]" data={[
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
<View className="rounded-lg border border-border bg-card p-5 max-w-[560px]">
  <View className="flex-row items-end gap-1" style={{ height: 120, width: 520 }}>
    <View className="flex-1 rounded-t bg-primary" style={{ height: 63 }} />
    <View className="flex-1 rounded-t bg-primary" style={{ height: 84 }} />
    <View className="flex-1 rounded-t bg-primary" style={{ height: 49 }} />
    <View className="flex-1 rounded-t bg-primary" style={{ height: 98 }} />
    <View className="flex-1 rounded-t bg-primary" style={{ height: 77 }} />
    <View className="flex-1 rounded-t bg-primary" style={{ height: 112 }} />
    <View className="flex-1 rounded-t bg-primary" style={{ height: 118 }} />
  </View>
</View>
```

### Sparkline

**Do** — Pair the line with the current value and delta and an end dot so it anchors a stat.

```tsx
<View className="rounded-lg border border-border bg-card p-5 max-w-[200px]">
  <Text className="text-xs text-muted-foreground">Tokens issued</Text>
  <View className="mt-1 flex-row items-baseline justify-between">
    <Text className="text-2xl font-semibold text-card-foreground">4,847</Text>
    <Text className="text-xs text-primary">+12%</Text>
  </View>
  <View className="mt-2 flex-row items-end gap-px" style={{ height: 34, width: 180 }}>
    <View className="flex-1 rounded-t bg-primary" style={{ height: 6 }} />
    <View className="flex-1 rounded-t bg-primary" style={{ height: 8 }} />
    <View className="flex-1 rounded-t bg-primary" style={{ height: 12 }} />
    <View className="flex-1 rounded-t bg-primary" style={{ height: 10 }} />
    <View className="flex-1 rounded-t bg-primary" style={{ height: 16 }} />
    <View className="flex-1 rounded-t bg-primary" style={{ height: 20 }} />
    <View className="flex-1 rounded-t bg-primary" style={{ height: 18 }} />
    <View className="flex-1 rounded-t bg-primary" style={{ height: 25 }} />
    <View className="flex-1 rounded-t bg-primary" style={{ height: 23 }} />
    <View className="flex-1 rounded-t bg-primary" style={{ height: 29 }} />
    <View className="h-2 w-2 self-start rounded-full bg-primary" />
  </View>
</View>
```

**Don't** — A bare line with no value or end dot reads as decoration: you cannot tell the current figure or where it ends.

```tsx
<View className="rounded-lg border border-border bg-card p-5 max-w-[200px]">
  <View className="flex-row items-end gap-px" style={{ height: 34, width: 180 }}>
    <View className="flex-1 rounded-t bg-primary" style={{ height: 6 }} />
    <View className="flex-1 rounded-t bg-primary" style={{ height: 8 }} />
    <View className="flex-1 rounded-t bg-primary" style={{ height: 12 }} />
    <View className="flex-1 rounded-t bg-primary" style={{ height: 10 }} />
    <View className="flex-1 rounded-t bg-primary" style={{ height: 16 }} />
    <View className="flex-1 rounded-t bg-primary" style={{ height: 20 }} />
    <View className="flex-1 rounded-t bg-primary" style={{ height: 18 }} />
    <View className="flex-1 rounded-t bg-primary" style={{ height: 25 }} />
    <View className="flex-1 rounded-t bg-primary" style={{ height: 23 }} />
    <View className="flex-1 rounded-t bg-primary" style={{ height: 29 }} />
    <View className="flex-1 rounded-t bg-primary" style={{ height: 31 }} />
  </View>
</View>
```

### Stacked bar

**Do** — Always ship a legend with a colored dot, label, and percentage per segment.

```tsx
<View className="rounded-lg border border-border bg-card p-5 max-w-[560px]">
  <View className="mb-3 flex-row overflow-hidden rounded-full" style={{ height: 10, width: 520 }}>
    <View style={{ width: "42%", backgroundColor: "#6366f1" }} />
    <View style={{ width: "28%", backgroundColor: "#14b8a6" }} />
    <View style={{ width: "18%", backgroundColor: "#f59e0b" }} />
    <View style={{ width: "12%", backgroundColor: "#f43f5e" }} />
  </View>
  <View className="flex-col gap-2">
    <View className="flex-row items-center gap-2.5">
      <View className="rounded-full" style={{ height: 8, width: 8, backgroundColor: "#6366f1" }} />
      <Text className="flex-1 text-sm text-card-foreground">Direct</Text>
      <Text className="text-xs text-muted-foreground">42%</Text>
    </View>
    <View className="flex-row items-center gap-2.5">
      <View className="rounded-full" style={{ height: 8, width: 8, backgroundColor: "#14b8a6" }} />
      <Text className="flex-1 text-sm text-card-foreground">Organic search</Text>
      <Text className="text-xs text-muted-foreground">28%</Text>
    </View>
    <View className="flex-row items-center gap-2.5">
      <View className="rounded-full" style={{ height: 8, width: 8, backgroundColor: "#f59e0b" }} />
      <Text className="flex-1 text-sm text-card-foreground">Social</Text>
      <Text className="text-xs text-muted-foreground">18%</Text>
    </View>
    <View className="flex-row items-center gap-2.5">
      <View className="rounded-full" style={{ height: 8, width: 8, backgroundColor: "#f43f5e" }} />
      <Text className="flex-1 text-sm text-card-foreground">Referral</Text>
      <Text className="text-xs text-muted-foreground">12%</Text>
    </View>
  </View>
</View>
```

**Don't** — Colored segments with no legend force the reader to guess which channel each band represents.

```tsx
<View className="rounded-lg border border-border bg-card p-5 max-w-[560px]">
  <View className="flex-row overflow-hidden rounded-full" style={{ height: 10, width: 520 }}>
    <View style={{ width: "42%", backgroundColor: "#6366f1" }} />
    <View style={{ width: "28%", backgroundColor: "#14b8a6" }} />
    <View style={{ width: "18%", backgroundColor: "#f59e0b" }} />
    <View style={{ width: "12%", backgroundColor: "#f43f5e" }} />
  </View>
</View>
```

### Gauge

**Do** — Put a muted track behind the fill and the numeric value plus label in the center.

```tsx
<View className="rounded-lg border border-border bg-card p-5 max-w-[200px] items-center">
  <View className="items-center justify-center">
    <View className="rounded-full border-8 border-muted" style={{ height: 120, width: 120 }} />
    <View className="absolute items-center justify-center">
      <Text className="text-2xl font-semibold text-card-foreground">72%</Text>
      <Text className="text-xs text-muted-foreground">Uptime</Text>
    </View>
  </View>
</View>
```

**Don't** — An arc with no track and no number: there is no baseline to read the fill against and no exact value.

```tsx
<View className="rounded-lg border border-border bg-card p-5 max-w-[200px] items-center">
  <View className="rounded-full border-8 border-primary" style={{ height: 120, width: 120 }} />
</View>
```

### Heatmap

**Do** — Pair the grid with a discrete less-to-more legend so the density scale is legible.

```tsx
<View className="rounded-lg border border-border bg-card p-5 max-w-[260px]">
  <View className="flex-row flex-wrap gap-1" style={{ maxWidth: 220 }}>
    <View className="rounded-sm" style={{ height: 18, width: 18, backgroundColor: "rgba(99,102,241,0.15)" }} />
    <View className="rounded-sm" style={{ height: 18, width: 18, backgroundColor: "rgba(99,102,241,0.4)" }} />
    <View className="rounded-sm" style={{ height: 18, width: 18, backgroundColor: "rgba(99,102,241,0.7)" }} />
    <View className="rounded-sm" style={{ height: 18, width: 18, backgroundColor: "rgba(99,102,241,1)" }} />
    <View className="rounded-sm" style={{ height: 18, width: 18, backgroundColor: "rgba(99,102,241,0.55)" }} />
    <View className="rounded-sm" style={{ height: 18, width: 18, backgroundColor: "rgba(99,102,241,0.25)" }} />
    <View className="rounded-sm" style={{ height: 18, width: 18, backgroundColor: "rgba(99,102,241,0.85)" }} />
    <View className="rounded-sm" style={{ height: 18, width: 18, backgroundColor: "rgba(99,102,241,0.35)" }} />
    <View className="rounded-sm" style={{ height: 18, width: 18, backgroundColor: "rgba(99,102,241,0.6)" }} />
    <View className="rounded-sm" style={{ height: 18, width: 18, backgroundColor: "rgba(99,102,241,0.9)" }} />
    <View className="rounded-sm" style={{ height: 18, width: 18, backgroundColor: "rgba(99,102,241,0.2)" }} />
    <View className="rounded-sm" style={{ height: 18, width: 18, backgroundColor: "rgba(99,102,241,0.5)" }} />
    <View className="rounded-sm" style={{ height: 18, width: 18, backgroundColor: "rgba(99,102,241,0.75)" }} />
    <View className="rounded-sm" style={{ height: 18, width: 18, backgroundColor: "rgba(99,102,241,0.3)" }} />
    <View className="rounded-sm" style={{ height: 18, width: 18, backgroundColor: "rgba(99,102,241,0.95)" }} />
    <View className="rounded-sm" style={{ height: 18, width: 18, backgroundColor: "rgba(99,102,241,0.45)" }} />
    <View className="rounded-sm" style={{ height: 18, width: 18, backgroundColor: "rgba(99,102,241,0.65)" }} />
    <View className="rounded-sm" style={{ height: 18, width: 18, backgroundColor: "rgba(99,102,241,0.1)" }} />
    <View className="rounded-sm" style={{ height: 18, width: 18, backgroundColor: "rgba(99,102,241,0.8)" }} />
    <View className="rounded-sm" style={{ height: 18, width: 18, backgroundColor: "rgba(99,102,241,0.4)" }} />
    <View className="rounded-sm" style={{ height: 18, width: 18, backgroundColor: "rgba(99,102,241,0.7)" }} />
  </View>
  <View className="mt-3 flex-row items-center gap-2">
    <Text className="text-xs text-muted-foreground">Less</Text>
    <View className="rounded-sm" style={{ height: 12, width: 12, backgroundColor: "rgba(99,102,241,0.2)" }} />
    <View className="rounded-sm" style={{ height: 12, width: 12, backgroundColor: "rgba(99,102,241,0.4)" }} />
    <View className="rounded-sm" style={{ height: 12, width: 12, backgroundColor: "rgba(99,102,241,0.6)" }} />
    <View className="rounded-sm" style={{ height: 12, width: 12, backgroundColor: "rgba(99,102,241,0.8)" }} />
    <View className="rounded-sm" style={{ height: 12, width: 12, backgroundColor: "rgba(99,102,241,1)" }} />
    <Text className="text-xs text-muted-foreground">More</Text>
  </View>
</View>
```

**Don't** — A density grid with no legend leaves the alpha-to-value mapping a mystery.

```tsx
<View className="rounded-lg border border-border bg-card p-5 max-w-[260px]">
  <View className="flex-row flex-wrap gap-1" style={{ maxWidth: 220 }}>
    <View className="rounded-sm" style={{ height: 18, width: 18, backgroundColor: "rgba(99,102,241,0.15)" }} />
    <View className="rounded-sm" style={{ height: 18, width: 18, backgroundColor: "rgba(99,102,241,0.4)" }} />
    <View className="rounded-sm" style={{ height: 18, width: 18, backgroundColor: "rgba(99,102,241,0.7)" }} />
    <View className="rounded-sm" style={{ height: 18, width: 18, backgroundColor: "rgba(99,102,241,1)" }} />
    <View className="rounded-sm" style={{ height: 18, width: 18, backgroundColor: "rgba(99,102,241,0.55)" }} />
    <View className="rounded-sm" style={{ height: 18, width: 18, backgroundColor: "rgba(99,102,241,0.25)" }} />
    <View className="rounded-sm" style={{ height: 18, width: 18, backgroundColor: "rgba(99,102,241,0.85)" }} />
    <View className="rounded-sm" style={{ height: 18, width: 18, backgroundColor: "rgba(99,102,241,0.35)" }} />
    <View className="rounded-sm" style={{ height: 18, width: 18, backgroundColor: "rgba(99,102,241,0.6)" }} />
    <View className="rounded-sm" style={{ height: 18, width: 18, backgroundColor: "rgba(99,102,241,0.9)" }} />
    <View className="rounded-sm" style={{ height: 18, width: 18, backgroundColor: "rgba(99,102,241,0.2)" }} />
    <View className="rounded-sm" style={{ height: 18, width: 18, backgroundColor: "rgba(99,102,241,0.5)" }} />
    <View className="rounded-sm" style={{ height: 18, width: 18, backgroundColor: "rgba(99,102,241,0.75)" }} />
    <View className="rounded-sm" style={{ height: 18, width: 18, backgroundColor: "rgba(99,102,241,0.3)" }} />
    <View className="rounded-sm" style={{ height: 18, width: 18, backgroundColor: "rgba(99,102,241,0.95)" }} />
    <View className="rounded-sm" style={{ height: 18, width: 18, backgroundColor: "rgba(99,102,241,0.45)" }} />
    <View className="rounded-sm" style={{ height: 18, width: 18, backgroundColor: "rgba(99,102,241,0.65)" }} />
    <View className="rounded-sm" style={{ height: 18, width: 18, backgroundColor: "rgba(99,102,241,0.1)" }} />
    <View className="rounded-sm" style={{ height: 18, width: 18, backgroundColor: "rgba(99,102,241,0.8)" }} />
    <View className="rounded-sm" style={{ height: 18, width: 18, backgroundColor: "rgba(99,102,241,0.4)" }} />
    <View className="rounded-sm" style={{ height: 18, width: 18, backgroundColor: "rgba(99,102,241,0.7)" }} />
  </View>
</View>
```
