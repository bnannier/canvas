# AreaChart

Categorical-x series fills: overlapping translucent areas by default, or running-sum bands with `stacked`. Shares the line chart's curve, density, furniture, and scrub-to-inspect axes.

## Usage

```tsx
<AreaChart
  labels={["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"]}
  series={[
    { label: "Total", values: [120, 138, 151, 149, 168, 184, 197, 212] },
    { label: "Paid", values: [42, 51, 58, 63, 71, 84, 92, 104] }
  ]}
/>
```

## Variants

### Stacked

```tsx
<AreaChart
  stacked
  labels={["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"]}
  series={[
    { label: "Direct", values: [37, 46, 49, 61, 53, 49, 54, 56] },
    { label: "Search", values: [77, 90, 83, 82, 82, 85, 85, 92] },
    { label: "Social", values: [18, 28, 34, 41, 48, 55, 50, 57] }
  ]}
/>
```

## Do & Don't

### Stacking

**Do**: Stack series that are parts of one total, like sessions by device; the top edge is the total and each band is its share.

```tsx
<AreaChart
  stacked
  labels={["Jan", "Feb", "Mar", "Apr", "May", "Jun"]}
  series={[
    { label: "Mobile", values: [42, 48, 51, 57, 63, 70] },
    { label: "Desktop", values: [35, 36, 38, 37, 40, 41] },
    { label: "Tablet", values: [8, 9, 9, 10, 11, 11] }
  ]}
/>
```

**Don't**: Stack rates that do not add up; conversion, bounce and churn rates summed into one band draw a total that means nothing.

```tsx
<AreaChart
  stacked
  labels={["Jan", "Feb", "Mar", "Apr", "May", "Jun"]}
  series={[
    { label: "Conversion rate", values: [3.1, 3.4, 3.2, 3.8, 4.0, 4.2] },
    { label: "Bounce rate", values: [41, 39, 40, 37, 36, 35] },
    { label: "Churn rate", values: [2.4, 2.2, 2.5, 2.1, 2.0, 1.9] }
  ]}
/>
```
