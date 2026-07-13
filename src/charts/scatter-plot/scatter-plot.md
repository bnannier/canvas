# ScatterPlot

Numeric x/y point clouds with nice ticks and gridlines on both axes. Multi-series clouds use the series tokens; pressing near a point rings it and flags its coordinates.

## Usage

```tsx
<ScatterPlot
  title="Load vs latency"
  series={[
    { label: "us-east", points: [{ x: 120, y: 38 }, { x: 260, y: 52 }, { x: 400, y: 61 }, { x: 610, y: 88 }, { x: 750, y: 112 }] },
    { label: "eu-west", points: [{ x: 150, y: 45 }, { x: 300, y: 64 }, { x: 480, y: 79 }, { x: 640, y: 105 }, { x: 820, y: 140 }] }
  ]}
  style={{ maxWidth: 560 }}
/>
```
