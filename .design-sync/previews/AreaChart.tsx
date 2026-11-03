import { AreaChart } from "@nannier/canvas";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];

export const Overlapping = () => (
  <AreaChart
    title="Monthly recurring revenue"
    labels={months}
    series={[
      { label: "Total", values: [120, 138, 151, 149, 168, 184, 197, 212] },
      { label: "Paid", values: [42, 51, 58, 63, 71, 84, 92, 104] },
    ]}
  />
);

export const Stacked = () => (
  <AreaChart
    stacked
    title="Sessions by channel"
    labels={months}
    series={[
      { label: "Direct", values: [37, 46, 49, 61, 53, 49, 54, 56] },
      { label: "Search", values: [77, 90, 83, 82, 82, 85, 85, 92] },
      { label: "Social", values: [18, 28, 34, 41, 48, 55, 50, 57] },
    ]}
  />
);

export const Curved = () => (
  <AreaChart
    curved
    success
    labels={["Jan", "Feb", "Mar", "Apr", "May", "Jun"]}
    series={[{ label: "Conversion rate", values: [3.1, 3.4, 3.2, 3.8, 4.0, 4.2] }]}
  />
);

export const Compact = () => (
  <AreaChart
    compact
    stacked
    labels={["Jan", "Feb", "Mar", "Apr", "May", "Jun"]}
    series={[
      { label: "Mobile", values: [42, 48, 51, 57, 63, 70] },
      { label: "Desktop", values: [35, 36, 38, 37, 40, 41] },
      { label: "Tablet", values: [8, 9, 9, 10, 11, 11] },
    ]}
  />
);
