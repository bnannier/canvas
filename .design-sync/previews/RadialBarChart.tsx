import { RadialBarChart } from "@nannier/canvas";

export const Hero = () => (
  <RadialBarChart
    label="Platform activation"
    max={100}
    data={[
      { label: "iOS", value: 64 },
      { label: "Android", value: 48 },
      { label: "Web", value: 82 },
    ]}
  />
);

export const CompactNoLegend = () => (
  <RadialBarChart
    compact
    hideLegend
    data={[
      { label: "Q1", value: 92 },
      { label: "Q2", value: 71 },
    ]}
  />
);

export const Selected = () => (
  <RadialBarChart
    defaultSelected={1}
    data={[
      { label: "Hot", value: 420 },
      { label: "Warm", value: 260 },
      { label: "Cold", value: 890 },
    ]}
  />
);

export const Detailed = () => (
  <RadialBarChart
    detailed
    max={80}
    formatValue={(v) => `${v}k`}
    data={[
      { label: "Phone", value: 64 },
      { label: "Tablet", value: 41 },
      { label: "Web", value: 23 },
    ]}
  />
);
