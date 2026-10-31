# BulletChart

Goal-attainment rows: each datum is a leading label, a track holding qualitative background bands (`ranges`, ascending bounds in fading washes), the tone-colored measure bar, an optional vertical target tick, and the trailing formatted value.

Following the classic bullet-graph anatomy each row carries its own scale, since goals rarely share units; pass `max` to force one shared scale when they do. The compact alternative to a dashboard of gauges: five goals read in five rows.

`detailed` expands each track, keeps its target marker inside the band and adds the target/ranges key.

## Usage

```tsx
<BulletChart
  title="Q3 targets"
  data={[
    { label: "Revenue", value: 275, target: 300, ranges: [200, 350, 500] },
    { label: "Profit", value: 42, target: 35, ranges: [30, 50, 70] },
    { label: "NPS", value: 61, target: 70, ranges: [40, 60, 80] },
  ]}
/>
```

## Variants

### Success tone

<!-- only: web -->
```tsx
<BulletChart
  success
  data={[
    { label: "Web", value: 34, target: 30 },
    { label: "iOS", value: 18, target: 24 },
    { label: "Android", value: 21, target: 24 },
  ]}
/>
```
<!-- /only -->
<!-- only: ios android -->
```tsx
<BulletChart
  success
  data={[
    { label: "Web", value: 34, target: 30 },
    { label: "Phone", value: 18, target: 24 },
    { label: "Tablet", value: 21, target: 24 },
  ]}
/>
```
<!-- /only -->

### Compact

```tsx
<BulletChart
  compact
  data={[
    { label: "Compute", value: 8200, target: 10000, ranges: [6000, 10000, 14000] },
    { label: "Storage", value: 4100, target: 5000, ranges: [3000, 5000, 8000] },
  ]}
/>
```

### Row tones

A datum takes its own `success`, `warning` or `destructive` tone (precedence success > warning > destructive): its measure bar is the solid status colour and its value the status ink.

```tsx
<BulletChart
  title="SLOs"
  max={100}
  formatValue={(v) => `${v}%`}
  data={[
    { label: "Availability", value: 99, target: 99, success: true },
    { label: "Latency p95", value: 82, target: 90, warning: true },
    { label: "Error budget", value: 41, target: 75, destructive: true }
  ]}
/>
```

## Do & Don't

### BulletChart

**Do** - Give every goal its row, with the target as a tick and the qualitative context as bands.

```tsx
<BulletChart
title="Q3 targets"
data={[
  { label: "Revenue", value: 275, target: 300, ranges: [200, 350, 500] },
  { label: "Profit", value: 42, target: 35, ranges: [30, 50, 70] },
]}
/>
```

**Don't** - A bare progress bar per goal loses the target, the qualitative bands, and the shared scale that makes rows comparable.

```tsx
<View style={{ borderRadius: 8, borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens.card, padding: 20, maxWidth: 480, gap: 8 }}>
  <View style={{ height: 12, backgroundColor: tokens.muted, borderRadius: 6 }}>
    <View style={{ height: 12, width: "60%", backgroundColor: tokens.primary, borderRadius: 6 }} />
  </View>
</View>
```
