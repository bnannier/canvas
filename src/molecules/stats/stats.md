# Stats

Single value, grouped row, with sparkline, with comparison. Used for dashboards and overview pages.

## Usage

```tsx
<Stats
  items={[
    { label: "Active users", value: "71,897", delta: "+12.3% vs. last 30 days" }
  ]}
/>
```

## Variants

### Variant - group

```tsx
<Stats
  items={[
    { label: "Total users", value: "12,847", delta: "+12.5%" },
    { label: "Active sessions", value: "1,024", delta: "+3.2%" },
    { label: "Error rate", value: "0.12%", delta: "+0.03%", down: true }
  ]}
/>
```

### Variant - plain

```tsx
<Stats
  plain
  title="Key metrics"
  items={[
    { label: "Revenue", value: "$48.2k" },
    { label: "Orders", value: "842" },
    { label: "Avg. value", value: "$57.24" },
    { label: "Conversion", value: "3.6%" }
  ]}
/>
```

### Variant - sparkline

```tsx
<Stats
  items={[
    { label: "Requests", value: "24.5k", delta: "+8.2%" },
    { label: "Latency", value: "142ms", delta: "+12ms", down: true }
  ]}
/>
```

## Do & Don't

### Single

**Do** — Name the comparison and the period so the delta is unambiguous.

```tsx
<Stats className="max-w-[280px]" items={[
    { label: "Active users", value: "71,897", delta: "+12.3% vs. last 30 days" }
  ]} />
```

**Don't** — A bare delta with no baseline leaves the reader asking: up against what, and over what window?

```tsx
<Stats className="max-w-[280px]" items={[
    { label: "Active users", value: "71,897", delta: "+12.3%" }
  ]} />
```

### Group

**Do** — Use the auto-fit grid and round headline numbers so cards wrap and stay scannable.

```tsx
<Stats items={[
    { label: "Revenue", value: "$48.2k", delta: "+12.5%" },
    { label: "Orders", value: "842", delta: "+3.2%" },
    { label: "Conversion", value: "3.6%", delta: "+0.4%" }
  ]} />
```

**Don't** — A fixed flex row of full-precision numbers overflows on narrow viewports and crowds the cards.

```tsx
<Stats items={[
    { label: "Revenue", value: "$48,250.00", delta: "+12.5%" },
    { label: "Orders", value: "842", delta: "+3.2%" },
    { label: "Conversion", value: "3.6%", delta: "+0.4%" }
  ]} />
```

### Plain (no border)

**Do** — On a parent surface drop the border and radius; let the number stacks stand on their own.

```tsx
<Stats plain items={[
    { label: "Revenue", value: "$48.2k" },
    { label: "Orders", value: "842" }
  ]} />
```

**Don't** — Bordered cards inside a card surface double the chrome: a box drawn around boxes.

```tsx
<View className="rounded-lg border border-border bg-card shadow-sm p-6">
  <Stats items={[
    { label: "Revenue", value: "$48.2k" },
    { label: "Orders", value: "842" }
  ]} />
</View>
```

### With sparkline

**Do** — Pair the sparkline with an explicit delta so the headline reads without decoding the curve.

```tsx
<View className="rounded-lg border border-border bg-card shadow-sm max-w-[220px] p-5">
  <Text className="text-xs text-muted-foreground">Requests</Text>
  <View className="mt-1 flex-row items-baseline justify-between">
    <Text className="text-2xl font-semibold tracking-tight text-foreground">24.5k</Text>
    <Text className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400">+8.2%</Text>
  </View>
  <View className="mt-3 flex-row items-end gap-0.5 h-6">
    <View className="flex-1 rounded-sm bg-primary/70 h-1" />
    <View className="flex-1 rounded-sm bg-primary/70 h-2" />
    <View className="flex-1 rounded-sm bg-primary/70 h-1.5" />
    <View className="flex-1 rounded-sm bg-primary/70 h-3" />
    <View className="flex-1 rounded-sm bg-primary/70 h-2.5" />
    <View className="flex-1 rounded-sm bg-primary/70 h-4" />
    <View className="flex-1 rounded-sm bg-primary/70 h-3.5" />
    <View className="flex-1 rounded-sm bg-primary/70 h-[18px]" />
    <View className="flex-1 rounded-sm bg-primary/70 h-4" />
    <View className="flex-1 rounded-sm bg-primary/70 h-5" />
    <View className="flex-1 rounded-sm bg-primary/70 h-6" />
  </View>
</View>
```

**Don't** — A trend line with no current delta makes you eyeball the slope to guess the direction.

```tsx
<View className="rounded-lg border border-border bg-card shadow-sm max-w-[220px] p-5">
  <Text className="text-xs text-muted-foreground">Requests</Text>
  <Text className="mt-1 text-2xl font-semibold tracking-tight text-foreground">24.5k</Text>
  <View className="mt-3 flex-row items-end gap-0.5 h-6">
    <View className="flex-1 rounded-sm bg-primary/70 h-1" />
    <View className="flex-1 rounded-sm bg-primary/70 h-2" />
    <View className="flex-1 rounded-sm bg-primary/70 h-1.5" />
    <View className="flex-1 rounded-sm bg-primary/70 h-3" />
    <View className="flex-1 rounded-sm bg-primary/70 h-2.5" />
    <View className="flex-1 rounded-sm bg-primary/70 h-4" />
    <View className="flex-1 rounded-sm bg-primary/70 h-3.5" />
    <View className="flex-1 rounded-sm bg-primary/70 h-[18px]" />
    <View className="flex-1 rounded-sm bg-primary/70 h-4" />
    <View className="flex-1 rounded-sm bg-primary/70 h-5" />
    <View className="flex-1 rounded-sm bg-primary/70 h-6" />
  </View>
</View>
```
