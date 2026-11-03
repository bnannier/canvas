import { RadarChart } from "@nannier/canvas";

export const Hero = () => (
  <RadarChart
    title="Candidate comparison"
    max={10}
    axes={["Coding", "Design", "Comms", "Ops", "Product"]}
    series={[
      { label: "Casey", values: [8, 6, 9, 5, 7] },
      { label: "Jordan", values: [6, 9, 7, 8, 5] },
    ]}
  />
);

export const Success = () => (
  <RadarChart
    success
    axes={["Latency", "Uptime", "Errors", "Cost", "Coverage"]}
    series={[{ label: "API", values: [7, 9, 8, 6, 7] }]}
  />
);

export const CompactNoGrid = () => (
  <RadarChart
    compact
    hideGrid
    axes={["Spd", "Pwr", "Def", "Mag", "Luck", "HP"]}
    series={[{ label: "Build A", values: [12, 18, 9, 15, 7, 14] }]}
  />
);

export const Spokes = () => (
  <RadarChart
    compact
    spokes
    max={10}
    axes={["Speed", "Contrast", "Motion", "Density", "Reach", "A11y"]}
    series={[
      { label: "Current", values: [9, 7, 8, 6, 7.5, 5] },
      { label: "Previous", values: [6, 8.5, 5, 8, 4.5, 7] },
    ]}
  />
);
