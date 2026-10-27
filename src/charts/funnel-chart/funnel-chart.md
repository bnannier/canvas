# FunnelChart

Stage-by-stage conversion bars: one centered row per stage, labelled on the left and valued on the right.

The stages stack as a column of rows, each a ramp-colored bar centered in its track at the stage's share of the first stage's value, so the column tapers as the funnel drops off. The stage's label sits at the start of the row and its value, in the mono face, at the end; `share` shows every stage's percent of the first stage in the value slot instead. Each stage's accessible name carries its percent of the previous stage (of the first stage with `share`). Press a stage to select it (the others dim).

## Usage

```tsx
<FunnelChart
  stages={[
    { label: "Visits", value: 12400 },
    { label: "Signups", value: 4200 },
    { label: "Activated", value: 1850 },
    { label: "Paid", value: 480 },
  ]}
/>
```

## Variants

### Share of the first stage

```tsx
<FunnelChart
  share
  stages={[
    { label: "Cart", value: 8600 },
    { label: "Address", value: 5200 },
    { label: "Payment", value: 3900 },
    { label: "Placed", value: 3400 },
  ]}
/>
```

### Compact, inspected

```tsx
<FunnelChart
compact
defaultSelected={1}
stages={[
  { label: "Leads", value: 900 },
  { label: "Qualified", value: 340 },
  { label: "Closed", value: 120 },
]}
/>
```

## Do & Don't

### FunnelChart

**Do** - Order the stages widest first and let the taper carry the drop-off.

```tsx
<FunnelChart
title="Signup funnel"
stages={[
  { label: "Visits", value: 12400 },
  { label: "Signups", value: 4200 },
  { label: "Paid", value: 480 },
]}
/>
```

**Don't** - A funnel that widens mid-way is not a funnel; a stage exceeding its predecessor warns and reads as an error.

```tsx
<FunnelChart
stages={[
  { label: "Visits", value: 4200 },
  { label: "Signups", value: 12400 },
]}
/>
```
