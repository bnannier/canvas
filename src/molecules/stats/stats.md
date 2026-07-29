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

### Per-tile icon, control and accent

```tsx
<Stats
  items={[
    { label: "Active identities", value: "12,348", delta: "+142 today", icon: <Icon users muted size={16} />, chart1: true },
    { label: "Active sessions", value: "489", delta: "+12%", chart2: true },
    { label: "OAuth2 clients", value: "12", delta: "8 M2M / 4 user", steady: true, chart4: true },
    { label: "Locked accounts", value: "3", delta: "-2", down: true, icon: <Icon lock muted size={16} /> },
  ]}
/>
```

### Tappable

```tsx
<Stats
  onPressItem={() => {}}
  items={[
    { label: "Active users", value: "71,897", delta: "+12.3%" },
    { label: "Revenue", value: "$48.2k", delta: "+8.1%" },
    { label: "Churn", value: "1.2%", delta: "-0.4%", down: true }
  ]}
/>
```

### Group

```tsx
<Stats
  items={[
    { label: "Total users", value: "12,847", delta: "+12.5%" },
    { label: "Active sessions", value: "1,024", delta: "+3.2%" },
    { label: "Error rate", value: "0.12%", delta: "+0.03%", down: true },
    { label: "Avg. session", value: "4m 32s", delta: "+0.8%" }
  ]}
/>
```

### Plain

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

### Sparkline

```tsx
<Stats
  items={[
    { label: "Requests", value: "24.5k", delta: "+8.2%", spark: [4, 8, 6, 12, 10, 16, 14, 18, 16, 20, 24] },
    { label: "Latency", value: "142ms", delta: "+12ms", down: true, spark: [10, 9, 11, 10, 12, 11, 13, 12, 14, 13, 15] }
  ]}
/>
```

## Do & Don't

### Single

**Do** — Name the comparison and the period so the delta is unambiguous.

```tsx
<Stats style={{ maxWidth: 280 }} items={[
    { label: "Active users", value: "71,897", delta: "+12.3% vs. last 30 days" }
  ]} />
```

**Don't** — A bare delta with no baseline leaves the reader asking: up against what, and over what window?

```tsx
<Stats style={{ maxWidth: 280 }} items={[
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
<View style={{ borderRadius: 8, borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens.card, ...shadow("sm"), padding: 24 }}>
  <Stats items={[
    { label: "Revenue", value: "$48.2k" },
    { label: "Orders", value: "842" }
  ]} />
</View>
```

### With sparkline

**Do** — Pair the sparkline with an explicit delta so the headline reads without decoding the curve.

```tsx
<Stats
  items={[
    { label: "Requests", value: "24.5k", delta: "+8.2%", spark: [4, 8, 6, 12, 10, 16, 14, 18, 16, 20, 24] }
  ]}
/>
```

**Don't** — A trend line with no current delta makes you eyeball the slope to guess the direction.

```tsx
<View style={{ borderRadius: 8, borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens.card, ...shadow("sm"), maxWidth: 220, padding: 20 }}>
  <Text style={{ fontSize: 12, lineHeight: 16, color: tokens["muted-foreground"] }}>Requests</Text>
  <Text style={{ marginTop: 4, fontSize: 24, lineHeight: 32, fontWeight: "600", letterSpacing: -0.4, color: tokens.foreground }}>24.5k</Text>
  <View style={{ marginTop: 12, flexDirection: "row", alignItems: "flex-end", gap: 2, height: 24 }}>
    <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: "0%", borderRadius: 2, backgroundColor: alpha(tokens.primary, 0.7), height: 4 }} />
    <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: "0%", borderRadius: 2, backgroundColor: alpha(tokens.primary, 0.7), height: 8 }} />
    <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: "0%", borderRadius: 2, backgroundColor: alpha(tokens.primary, 0.7), height: 6 }} />
    <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: "0%", borderRadius: 2, backgroundColor: alpha(tokens.primary, 0.7), height: 12 }} />
    <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: "0%", borderRadius: 2, backgroundColor: alpha(tokens.primary, 0.7), height: 10 }} />
    <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: "0%", borderRadius: 2, backgroundColor: alpha(tokens.primary, 0.7), height: 16 }} />
    <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: "0%", borderRadius: 2, backgroundColor: alpha(tokens.primary, 0.7), height: 14 }} />
    <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: "0%", borderRadius: 2, backgroundColor: alpha(tokens.primary, 0.7), height: 18 }} />
    <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: "0%", borderRadius: 2, backgroundColor: alpha(tokens.primary, 0.7), height: 16 }} />
    <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: "0%", borderRadius: 2, backgroundColor: alpha(tokens.primary, 0.7), height: 20 }} />
    <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: "0%", borderRadius: 2, backgroundColor: alpha(tokens.primary, 0.7), height: 24 }} />
  </View>
</View>
```
