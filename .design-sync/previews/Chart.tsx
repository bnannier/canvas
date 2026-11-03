import { Chart, Column } from "@nannier/canvas";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const Hero = () => (
  <Chart
    title="Signups"
    max={100}
    data={days.map((label, i) => ({ label, value: [45, 60, 35, 70, 55, 80, 95][i] }))}
  />
);

export const Grouped = () => (
  <Chart
    title="Quarterly financials ($k)"
    labels={["Q1", "Q2", "Q3", "Q4"]}
    series={[
      { label: "Revenue", values: [62, 70, 84, 89] },
      { label: "Costs", values: [41, 48, 55, 59] },
      { label: "Profit", values: [21, 22, 29, 30] },
    ]}
  />
);

export const Stacked = () => (
  <Chart
    stacked
    title="Tokens by grant type"
    labels={["acme", "globex", "initech", "umbrella"]}
    series={[
      { label: "Authorization code", values: [1840, 1210, 960, 640] },
      { label: "Client credentials", values: [920, 1480, 340, 1120] },
      { label: "Refresh token", values: [610, 380, 720, 290] },
    ]}
  />
);

export const Tones = () => (
  <Chart
    title="Sign-ins"
    labels={days}
    series={[
      { label: "Granted", values: [812, 905, 874, 961, 1024, 640, 588], success: true },
      { label: "Denied", values: [41, 38, 56, 47, 62, 29, 24], destructive: true },
    ]}
  />
);

export const Horizontal = () => (
  <Chart
    horizontal
    title="Test coverage by layer (%)"
    data={[
      { label: "Atoms", value: 92 },
      { label: "Molecules", value: 78 },
      { label: "Organisms", value: 64 },
      { label: "Charts", value: 85 },
    ]}
  />
);

export const SuccessAndDestructive = () => (
  <Column loose>
    <Chart success data={["Mon", "Tue", "Wed", "Thu", "Fri"].map((label, i) => ({ label, value: [82, 88, 91, 86, 94][i] }))} />
    <Chart destructive data={["Mon", "Tue", "Wed", "Thu", "Fri"].map((label, i) => ({ label, value: [14, 9, 22, 12, 7][i] }))} />
  </Column>
);
