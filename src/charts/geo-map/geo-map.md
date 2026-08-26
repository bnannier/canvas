# GeoMap

A world map with a bubble per place: the land silhouette is one muted path precomputed at build time (no runtime fetch, no map dependency, no tiles), and each point is a circle at its projected coordinate whose AREA is proportional to its count, so doubling the count doubles the disc rather than its width. Single-identity encoding, so there is no tone axis and no legend. Press a bubble to flag its label and count (the others dim); the accessible name carries the biggest places with their values, because a screen reader user cannot see bubbles.

## Usage

```tsx
<GeoMap
  title="Active installs"
  style={{ maxWidth: 560 }}
  points={[
    { label: "San Francisco", lat: 37.7749, lng: -122.4194, count: 4820 },
    { label: "New York", lat: 40.7128, lng: -74.006, count: 6310 },
    { label: "Sao Paulo", lat: -23.5505, lng: -46.6333, count: 2140 },
    { label: "London", lat: 51.5072, lng: -0.1276, count: 5170 },
    { label: "Lagos", lat: 6.5244, lng: 3.3792, count: 980 },
    { label: "Berlin", lat: 52.52, lng: 13.405, count: 2650 },
    { label: "Bengaluru", lat: 12.9716, lng: 77.5946, count: 3890 },
    { label: "Singapore", lat: 1.3521, lng: 103.8198, count: 1420 },
    { label: "Tokyo", lat: 35.6895, lng: 139.6917, count: 3110 },
    { label: "Sydney", lat: -33.8688, lng: 151.2093, count: 1260 },
  ]}
/>
```

## Variants

### Compact

```tsx
<GeoMap
  compact
  title="Edge nodes"
  points={[
    { label: "Ashburn", lat: 39.0438, lng: -77.4874, count: 42 },
    { label: "Frankfurt", lat: 50.1109, lng: 8.6821, count: 36 },
    { label: "Mumbai", lat: 19.076, lng: 72.8777, count: 18 },
    { label: "Sydney", lat: -33.8688, lng: 151.2093, count: 9 },
  ]}
/>
```

### Inspected

```tsx
<GeoMap
  title="Support tickets"
  defaultSelected={1}
  style={{ maxWidth: 560 }}
  points={[
    { label: "Toronto", lat: 43.6532, lng: -79.3832, count: 310 },
    { label: "Dublin", lat: 53.3498, lng: -6.2603, count: 940 },
    { label: "Cape Town", lat: -33.9249, lng: 18.4241, count: 220 },
    { label: "Seoul", lat: 37.5665, lng: 126.978, count: 470 },
  ]}
/>
```

### Formatted counts

```tsx
<GeoMap
  title="Bandwidth served"
  formatValue={(v) => `${v} TB`}
  style={{ maxWidth: 560 }}
  points={[
    { label: "Los Angeles", lat: 34.0522, lng: -118.2437, count: 88 },
    { label: "Amsterdam", lat: 52.3676, lng: 4.9041, count: 64 },
    { label: "Nairobi", lat: -1.2921, lng: 36.8219, count: 12 },
    { label: "Santiago", lat: -33.4489, lng: -70.6693, count: 21 },
    { label: "Osaka", lat: 34.6937, lng: 135.5023, count: 39 },
  ]}
/>
```

## Do & Don't

### GeoMap

**Do** - Plot a modest number of places whose counts really differ, so the area encoding has something to say.

```tsx
<GeoMap
  title="Signups by city"
  style={{ maxWidth: 560 }}
  points={[
    { label: "London", lat: 51.5072, lng: -0.1276, count: 5170 },
    { label: "Bengaluru", lat: 12.9716, lng: 77.5946, count: 3890 },
    { label: "Sao Paulo", lat: -23.5505, lng: -46.6333, count: 2140 },
    { label: "Lagos", lat: 6.5244, lng: 3.3792, count: 980 },
  ]}
/>
```

**Don't** - Places that all carry the same count draw identical bubbles, so the map costs a lot of space to say nothing; rank them in a BarList instead.

```tsx
<GeoMap
  style={{ maxWidth: 560 }}
  points={[
    { label: "London", lat: 51.5072, lng: -0.1276, count: 100 },
    { label: "Paris", lat: 48.8566, lng: 2.3522, count: 100 },
    { label: "Madrid", lat: 40.4168, lng: -3.7038, count: 100 },
    { label: "Rome", lat: 41.9028, lng: 12.4964, count: 100 },
  ]}
/>
```
