# AreaChart

Categorical-x series fills: overlapping translucent areas by default, or running-sum bands with `stacked`. Shares the line chart's curve, density, furniture, and scrub-to-inspect axes.

## Usage

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
