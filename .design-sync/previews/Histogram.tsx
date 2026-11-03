import { Histogram } from "@nannier/canvas";

export const Hero = () => (
  <Histogram
    title="Response times"
    label="Latency ms"
    values={[42, 38, 51, 44, 47, 39, 58, 62, 44, 41, 49, 53, 46, 43, 71, 48]}
  />
);

export const FiveBins = () => (
  <Histogram
    bins={5}
    title="Order size (items)"
    values={[1, 1, 2, 2, 2, 3, 3, 3, 3, 4, 4, 5, 5, 6, 7, 8, 9, 12, 2, 3, 1, 4, 2, 3, 5]}
  />
);

export const CompactNoGrid = () => (
  <Histogram
    compact
    hideGrid
    values={[4.2, 4.8, 5.1, 4.4, 6.2, 5.5, 4.9, 5.0, 4.6, 7.8, 5.2, 4.7, 5.4, 4.3, 5.8]}
  />
);
