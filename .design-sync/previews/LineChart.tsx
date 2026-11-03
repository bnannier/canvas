import { LineChart } from "@nannier/canvas";

const week = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const Hero = () => (
  <LineChart
    title="Active users"
    labels={["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"]}
    series={[
      { label: "Web", values: [119, 122, 131, 147, 157, 176, 182] },
      { label: "Mobile", values: [63, 93, 101, 121, 162, 207, 251] },
    ]}
  />
);

export const CurvedDots = () => (
  <LineChart
    curved
    dots
    title="Signups"
    labels={week}
    series={[{ label: "Signups", values: [24, 31, 28, 42, 39, 47, 51] }]}
  />
);

export const Tones = () => (
  <LineChart
    title="Sign-ins"
    labels={week}
    series={[
      { label: "Granted", values: [812, 905, 874, 961, 1024, 640, 588], success: true },
      { label: "Denied", values: [41, 38, 56, 47, 62, 29, 24], destructive: true },
    ]}
  />
);

export const FadeBaseline = () => (
  <LineChart
    fade
    title="OLY today"
    labels={["9:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "1:00"]}
    series={[{ label: "Price", values: [186.1, 187.5, 186.8, 187.4, 188.1, 188.9, 190.5, 191.7] }]}
    baseline={188}
  />
);

export const Compact = () => (
  <LineChart
    compact
    title="Signups"
    labels={week}
    series={[{ label: "Signups", values: [24, 31, 28, 42, 39, 47, 51] }]}
  />
);
