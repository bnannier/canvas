# LineChart

Categorical-x series lines with nice y ticks, gridlines, and a legend for multiple series. `curved` draws a monotone cubic that never overshoots the data, `dots` marks each datum, and `baseline` + `fade` give the trading-app price idiom (dashed previous close, gain/loss auto tone, gradient fill). Press or scrub the plot to inspect a category.

## Usage

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

## Variants

### Price vs previous close

```tsx
<LineChart
  title="OLY"
  labels={["10a", "11a", "12p", "1p", "2p", "3p", "4p"]}
  series={[{ label: "Price", values: [187.2, 188.4, 186.9, 189.3, 190.8, 190.1, 191.6] }]}
  baseline={188}
  fade
  style={{ maxWidth: 560 }}
/>
```

### Press to inspect

```tsx
<LineChart
  title="Signups"
  labels={["Jan", "Feb", "Mar", "Apr", "May", "Jun"]}
  series={[
    { label: "Web", values: [120, 180, 150, 240, 300, 280] },
    { label: "Mobile", values: [60, 90, 140, 160, 220, 260] }
  ]}
  curved
  defaultSelected={4}
  style={{ maxWidth: 560 }}
/>
```

## Do & Don't

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
