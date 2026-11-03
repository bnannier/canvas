import { BoxPlot } from "@nannier/canvas";

export const Hero = () => (
  <BoxPlot
    title="Latency by region (ms)"
    data={[
      { label: "us-east", values: [42, 38, 51, 44, 47, 39, 58, 44, 41, 49, 96] },
      { label: "eu-west", values: [55, 61, 58, 64, 57, 63, 59, 66, 60, 62] },
      { label: "ap-south", values: [71, 78, 74, 83, 76, 124] },
    ]}
  />
);

export const Compact = () => (
  <BoxPlot
    compact
    data={[
      { label: "A", values: [3.1, 3.4, 3.2, 3.8, 3.5, 3.3, 3.9, 3.6] },
      { label: "B", values: [4.2, 4.6, 4.4, 5.1, 4.8, 4.5, 5.4, 4.9] },
    ]}
  />
);

export const Selected = () => (
  <BoxPlot
    title="Build time by weekday (min)"
    defaultSelected={1}
    data={[
      { label: "Mon", values: [2, 4, 3, 5, 4, 3, 6] },
      { label: "Wed", values: [3, 6, 5, 8, 6, 5, 9] },
      { label: "Fri", values: [5, 9, 7, 12, 9, 8, 22] },
    ]}
  />
);
