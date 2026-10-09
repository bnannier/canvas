# DepthChart

The order-book view: cumulative bid and ask step areas mirrored around the spread, bids in the success tone and asks in destructive, on a numeric price axis.

## Usage

```tsx
<DepthChart
  title="OLY order book"
  bids={[
    { price: 191.3, size: 80 },
    { price: 191.15, size: 120 },
    { price: 191.0, size: 116 },
    { price: 190.85, size: 118 },
    { price: 190.7, size: 176 },
    { price: 190.55, size: 190 },
    { price: 190.4, size: 210 },
    { price: 190.25, size: 236 }
  ]}
  asks={[
    { price: 191.6, size: 90 },
    { price: 191.75, size: 122 },
    { price: 191.9, size: 110 },
    { price: 192.05, size: 154 },
    { price: 192.2, size: 154 },
    { price: 192.35, size: 210 },
    { price: 192.5, size: 222 },
    { price: 192.65, size: 240 }
  ]}
/>
```

## Variants

### Compact

```tsx
<DepthChart
  compact
  bids={[
    { price: 191.3, size: 90 },
    { price: 191.15, size: 150 },
    { price: 191.0, size: 220 },
    { price: 190.85, size: 310 },
    { price: 190.7, size: 420 }
  ]}
  asks={[
    { price: 191.6, size: 110 },
    { price: 191.75, size: 180 },
    { price: 191.9, size: 260 },
    { price: 192.05, size: 350 },
    { price: 192.2, size: 470 }
  ]}
/>
```

## Do & Don't

### Both sides of the book

**Do**: Pass the bids and the asks together; the two sides meet at the spread, the gap a trader reads first.

```tsx
<DepthChart
  compact
  bids={[
    { price: 191.3, size: 90 },
    { price: 191.15, size: 150 },
    { price: 191.0, size: 220 },
    { price: 190.85, size: 310 },
    { price: 190.7, size: 420 }
  ]}
  asks={[
    { price: 191.6, size: 110 },
    { price: 191.75, size: 180 },
    { price: 191.9, size: 260 },
    { price: 192.05, size: 350 },
    { price: 192.2, size: 470 }
  ]}
/>
```

**Don't**: Plot one side alone: with no asks the bids stretch across the whole price axis, nothing marks the spread, and the Asks legend entry labels nothing.

```tsx
<DepthChart
  compact
  bids={[
    { price: 191.3, size: 90 },
    { price: 191.15, size: 150 },
    { price: 191.0, size: 220 },
    { price: 190.85, size: 310 },
    { price: 190.7, size: 420 }
  ]}
  asks={[]}
/>
```
