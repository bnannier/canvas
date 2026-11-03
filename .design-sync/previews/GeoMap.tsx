import { GeoMap } from "@nannier/canvas";

export const Hero = () => (
  <GeoMap
    title="Active installs"
    points={[
      { label: "New York", lat: 40.7128, lng: -74.006, count: 6310 },
      { label: "London", lat: 51.5072, lng: -0.1276, count: 5170 },
      { label: "Bengaluru", lat: 12.9716, lng: 77.5946, count: 3890 },
      { label: "Sydney", lat: -33.8688, lng: 151.2093, count: 1260 },
    ]}
  />
);

export const Compact = () => (
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
);

export const SelectedFormatted = () => (
  <GeoMap
    title="Bandwidth served"
    defaultSelected={1}
    formatValue={(v) => `${v} TB`}
    points={[
      { label: "Los Angeles", lat: 34.0522, lng: -118.2437, count: 88 },
      { label: "Amsterdam", lat: 52.3676, lng: 4.9041, count: 64 },
      { label: "Nairobi", lat: -1.2921, lng: 36.8219, count: 12 },
      { label: "Osaka", lat: 34.6937, lng: 135.5023, count: 39 },
    ]}
  />
);
