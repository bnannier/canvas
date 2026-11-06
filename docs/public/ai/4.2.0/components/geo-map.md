# GeoMap

Package: @nannier/canvas
Version: 4.2.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: 85d17357eddcab1909bcb59630a0c4a1f1513f08d3a6dcf5378eb84c847dee94

Source: `src/charts/geo-map/geo-map.md`
Human reference: https://canvas.nannier.com/components/geo-map

## Public imports

```tsx
import { GeoMap } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

A world map with a bubble per place, its area proportional to its count, over coastlines and country borders precomputed at build time. Optionally zoomable, merging crowded places into one bubble that splits as you zoom in.

The land silhouette and the shared country borders are two paths precomputed from Natural Earth 1:50m (no runtime fetch, no map dependency, no tiles), and each point is a circle at its projected coordinate whose AREA is proportional to its count, so doubling the count doubles the disc rather than its width.

Add `zoomable` and the wheel zooms about the pointer, two fingers pinch, a drag pans, and places too close together to draw separately merge into one bubble carrying their summed count, splitting into their members as you zoom in.

Single-identity encoding, so there is no tone axis and no legend. Press a bubble to flag its label and count (the others dim); the accessible name carries the biggest places with their values, because a screen reader user cannot see bubbles.

`detailed` frames the geography and outlines every place separately, keeping all places visible while an inline readout identifies the selected city. Zoom, pan and keyboard controls remain available.

## Usage

```tsx
<GeoMap
  title="Active installs"
  points={[
    { label: "New York", lat: 40.7128, lng: -74.006, count: 6310 },
    { label: "London", lat: 51.5072, lng: -0.1276, count: 5170 },
    { label: "Bengaluru", lat: 12.9716, lng: 77.5946, count: 3890 },
    { label: "Sydney", lat: -33.8688, lng: 151.2093, count: 1260 }
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

### Zoomable

```tsx
<GeoMap
  zoomable
  title="Sessions by city"
  points={[
    { label: "San Francisco", lat: 37.7749, lng: -122.4194, count: 4820 },
    { label: "Oakland", lat: 37.8044, lng: -122.2712, count: 1100 },
    { label: "San Jose", lat: 37.3382, lng: -121.8863, count: 2400 },
    { label: "Sacramento", lat: 38.5816, lng: -121.4944, count: 700 }
  ]}
/>
```

### Inspected

```tsx
<GeoMap
  title="Support tickets"
  defaultSelected={1}
  points={[
    { label: "Toronto", lat: 43.6532, lng: -79.3832, count: 310 },
    { label: "Dublin", lat: 53.3498, lng: -6.2603, count: 940 },
    { label: "Cape Town", lat: -33.9249, lng: 18.4241, count: 220 },
    { label: "Seoul", lat: 37.5665, lng: 126.978, count: 470 }
  ]}
/>
```

### Formatted counts

```tsx
<GeoMap
  title="Bandwidth served"
  formatValue={(v) => `${v} TB`}
  points={[
    { label: "Los Angeles", lat: 34.0522, lng: -118.2437, count: 88 },
    { label: "Amsterdam", lat: 52.3676, lng: 4.9041, count: 64 },
    { label: "Nairobi", lat: -1.2921, lng: 36.8219, count: 12 },
    { label: "Osaka", lat: 34.6937, lng: 135.5023, count: 39 }
  ]}
/>
```

### Detailed

An outlined city panel with an inline inspection readout. Hover a city to expand its mark; select a city to inspect its count.

```tsx
<GeoMap
  detailed
  zoomable
  title="Sessions by city"
  points={[
    { label: "San Francisco", lat: 37.77, lng: -122.42, count: 2400 },
    { label: "New York", lat: 40.71, lng: -74, count: 3100 },
    { label: "London", lat: 51.51, lng: -0.13, count: 2650 },
    { label: "Berlin", lat: 52.52, lng: 13.4, count: 1920 }
  ]}
/>
```

## Do & Don't

### GeoMap

**Do** - Plot a modest number of places whose counts really differ, so the area encoding has something to say.

```tsx
<GeoMap
title="Signups by city"
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
points={[
  { label: "London", lat: 51.5072, lng: -0.1276, count: 100 },
  { label: "Paris", lat: 48.8566, lng: 2.3522, count: 100 },
  { label: "Madrid", lat: 40.4168, lng: -3.7038, count: 100 },
  { label: "Rome", lat: 41.9028, lng: 12.4964, count: 100 },
]}
/>
```

### Zooming

**Do** - Turn on `zoomable` when places crowd each other, so a cluster can be opened up rather than drawn as overlapping discs.

```tsx
<GeoMap
zoomable
title="Sessions by city"
points={[
  { label: "San Francisco", lat: 37.7749, lng: -122.4194, count: 4820 },
  { label: "Oakland", lat: 37.8044, lng: -122.2712, count: 1100 },
  { label: "San Jose", lat: 37.3382, lng: -121.8863, count: 2400 },
  { label: "Sacramento", lat: 38.5816, lng: -121.4944, count: 700 },
]}
/>
```

**Don't** - Turn it on for places that are already far apart. Nothing will ever merge, so the controls and the gesture are cost with no benefit, and a reader is invited to explore a map that has nothing further to show.

```tsx
<GeoMap
zoomable
title="Regional totals"
points={[
  { label: "New York", lat: 40.7128, lng: -74.006, count: 6310 },
  { label: "London", lat: 51.5072, lng: -0.1276, count: 5170 },
  { label: "Tokyo", lat: 35.6895, lng: 139.6917, count: 3110 },
  { label: "Sydney", lat: -33.8688, lng: 151.2093, count: 1260 },
]}
/>
```

## Supported props

### GeoMapProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| points | GeoMapPoint[] | yes |  | The places to plot; every bubble takes the primary token. |
| title | string \| undefined | no |  | Optional heading shown above the map. |
| compact | boolean \| undefined | no | false | Density (omit for the default map size). |
| detailed | boolean \| undefined | no | false | Bordered geography panel with individually outlined place bubbles and an inline readout. |
| plain | boolean \| undefined | no | false | Strip the card surface for nesting inside an existing card (mirrors Stats). |
| formatValue | ((v: number) => string) \| undefined | no |  | Formats the flagged and accessible counts (data formatting, not styling). |
| selected | number \| null \| undefined | no |  | Press-to-inspect: the selected point index (controlled). Pass null for none. |
| defaultSelected | number \| undefined | no |  | Press-to-inspect: the initially selected point (uncontrolled). |
| onSelect | ((index: number \| null) => void) \| undefined | no |  | Fired when a press selects a point (or clears it with null). |
| zoomable | boolean \| undefined | no | false | Zoom and pan the map, and aggregate crowded places into one bubble that splits into its members as the map is driven in. The wheel zooms about the pointer, two fingers pinch, a drag pans once zoomed, and the zoom controls and arrow keys give the same reach without a pointer. |
| zoom | number \| undefined | no |  | The zoom factor, 1 (the whole world) upward (controlled). Needs `zoomable`. |
| defaultZoom | number \| undefined | no |  | The zoom factor the map opens at (uncontrolled). Needs `zoomable`. |
| onZoomChange | ((zoom: number) => void) \| undefined | no |  | Fired whenever the zoom factor changes, by gesture, control or key. |
| onSelectPlaces | ((indices: number[]) => void) \| undefined | no |  | Fired alongside `onSelect` with EVERY point index inside the pressed bubble. A single place reports one index and an aggregated bubble reports all of its members, so `onSelect`'s own meaning never silently changes. |
| testID | string \| undefined | no |  | E2E hook forwarded to the root element. |
| style | LayoutStyle | no |  | Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. |

See [installation](https://canvas.nannier.com/ai/4.2.0/installation.md) for required peers and feature fallbacks.
