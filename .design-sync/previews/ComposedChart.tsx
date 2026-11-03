import { ComposedChart } from "@nannier/canvas";

export const Hero = () => (
  <ComposedChart
    title="Revenue and margin ($k)"
    labels={["Q1", "Q2", "Q3", "Q4"]}
    series={[
      { label: "Revenue", values: [420, 510, 480, 620] },
      { label: "Margin", values: [110, 170, 150, 240], line: true },
    ]}
  />
);

export const WithArea = () => (
  <ComposedChart
    title="Traffic and conversions"
    labels={["Mon", "Tue", "Wed", "Thu", "Fri"]}
    series={[
      { label: "Sessions", values: [1200, 1420, 1310, 1680, 1540], area: true },
      { label: "Sign-ups", values: [240, 310, 280, 420, 380] },
    ]}
  />
);

export const DotsSelected = () => (
  <ComposedChart
    title="Deploys and incidents"
    labels={["W1", "W2", "W3", "W4", "W5", "W6"]}
    dots
    defaultSelected={3}
    series={[
      { label: "Deploys", values: [12, 18, 15, 22, 19, 24] },
      { label: "Incidents", values: [2, 1, 3, 1, 2, 1], line: true },
    ]}
  />
);

export const DashedTarget = () => (
  <ComposedChart
    title="Revenue vs target ($k)"
    labels={["Q1", "Q2", "Q3", "Q4"]}
    series={[
      { label: "Revenue", values: [420, 510, 480, 620] },
      { label: "Target", values: [450, 500, 550, 600], line: true, dashed: true },
    ]}
  />
);
