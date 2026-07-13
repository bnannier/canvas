# DepthChart

The order-book view: cumulative bid and ask step areas mirrored around the spread, bids in the success tone and asks in destructive, on a numeric price axis.

## Usage

```tsx
<DepthChart
  title="OLY order book"
  bids={[
    { price: 191.2, size: 120 },
    { price: 191, size: 340 },
    { price: 190.8, size: 260 },
    { price: 190.5, size: 480 },
    { price: 190.2, size: 380 }
  ]}
  asks={[
    { price: 191.6, size: 150 },
    { price: 191.9, size: 290 },
    { price: 192.1, size: 310 },
    { price: 192.4, size: 520 },
    { price: 192.8, size: 300 }
  ]}
  style={{ maxWidth: 560 }}
/>
```
