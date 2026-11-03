import { BulletChart } from "@nannier/canvas";

export const Hero = () => (
  <BulletChart
    title="Q3 targets"
    data={[
      { label: "Revenue", value: 275, target: 300, ranges: [200, 350, 500] },
      { label: "Profit", value: 42, target: 35, ranges: [30, 50, 70] },
      { label: "NPS", value: 61, target: 70, ranges: [40, 60, 80] },
    ]}
  />
);

export const Success = () => (
  <BulletChart
    success
    title="Weekly signups (k)"
    data={[
      { label: "Web", value: 34, target: 30 },
      { label: "iOS", value: 18, target: 24 },
      { label: "Android", value: 21, target: 24 },
    ]}
  />
);

export const Compact = () => (
  <BulletChart
    compact
    data={[
      { label: "Compute", value: 8200, target: 10000, ranges: [6000, 10000, 14000] },
      { label: "Storage", value: 4100, target: 5000, ranges: [3000, 5000, 8000] },
    ]}
  />
);

export const Tones = () => (
  <BulletChart
    title="SLOs"
    max={100}
    formatValue={(v) => `${v}%`}
    data={[
      { label: "Availability", value: 99, target: 99, success: true },
      { label: "Latency p95", value: 82, target: 90, warning: true },
      { label: "Error budget", value: 41, target: 75, destructive: true },
    ]}
  />
);
