import { WaterfallChart } from "@nannier/canvas";

export const Hero = () => (
  <WaterfallChart
    title="Q3 revenue bridge ($k)"
    steps={[
      { label: "Q2", value: 4200, total: true },
      { label: "New", value: 980 },
      { label: "Expansion", value: 460 },
      { label: "Churn", value: -540 },
      { label: "FX", value: -120 },
      { label: "Q3", total: true },
    ]}
  />
);

export const Headcount = () => (
  <WaterfallChart
    title="Headcount change"
    steps={[
      { label: "Hired", value: 24 },
      { label: "Backfill", value: 8 },
      { label: "Attrition", value: -11 },
      { label: "Transfers", value: -3 },
      { label: "Net", total: true },
    ]}
  />
);

export const CompactSelected = () => (
  <WaterfallChart
    compact
    defaultSelected={2}
    steps={[
      { label: "Start", value: 100, total: true },
      { label: "Wins", value: 30 },
      { label: "Losses", value: -12 },
      { label: "End", total: true },
    ]}
  />
);
